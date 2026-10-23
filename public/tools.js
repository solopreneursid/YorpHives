(() => {
'use strict';
const $ = id => document.getElementById(id);
const toast = $('toast');
let toastTimer;
function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
}
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
function setInfo(id, files) {
  const list = Array.from(files || []);
  $(id).textContent = list.length ? list.map(f => f.name + ' (' + formatBytes(f.size) + ')').join(' · ') : 'No file selected.';
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function safeName(name) {
  return (name || 'file').replace(/\.pdf$/i, '').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'file';
}
async function withButton(button, task) {
  button.disabled = true;
  const old = button.textContent;
  button.textContent = 'Working… please wait';
  try { await task(); }
  catch (error) {
    console.error(error);
    notify(error && error.message ? error.message : 'Could not process this file. Please try another file.');
  } finally {
    button.disabled = false;
    button.textContent = old;
  }
}
function requirePdfLib() {
  if (!window.PDFLib) throw new Error('The PDF library did not load. Refresh the page and try again.');
  return window.PDFLib;
}
function requirePdfJs() {
  if (!window.pdfjsLib) throw new Error('The PDF renderer did not load. Refresh the page and try again.');
  return window.pdfjsLib;
}
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.js';
}
$('menuToggle').addEventListener('click', () => $('mainNav').classList.toggle('nav-open'));
$('mainNav').querySelectorAll('a').forEach(a => a.addEventListener('click', () => $('mainNav').classList.remove('nav-open')));
$('year').textContent = new Date().getFullYear();

$('mergeFiles').addEventListener('change', e => setInfo('mergeInfo', e.target.files));
$('splitFile').addEventListener('change', e => {
  setInfo('splitInfo', e.target.files);
  $('splitInfo').textContent = e.target.files[0] ? e.target.files[0].name + ' selected. Page numbers start at 1.' : 'Page numbers start at 1.';
});
$('imagePdfFiles').addEventListener('change', e => setInfo('imagePdfInfo', e.target.files));
$('pdfImageFile').addEventListener('change', e => setInfo('pdfImageInfo', e.target.files));

async function updatePdfPageCount(file, infoId, message) {
  if (!file) { $(infoId).textContent = message; return; }
  $(infoId).textContent = file.name + ' selected · checking page count…';
  try {
    const { PDFDocument } = requirePdfLib();
    const doc = await PDFDocument.load(await file.arrayBuffer());
    $(infoId).textContent = file.name + ' · ' + doc.getPageCount() + ' page(s)';
  } catch (error) {
    $(infoId).textContent = file.name + ' selected. Page information unavailable; try the action button if this is not a protected PDF.';
  }
}
$('rotatePdfFile').addEventListener('change', e => updatePdfPageCount(e.target.files[0], 'rotatePdfInfo', 'Select a PDF to rotate all pages.'));
$('watermarkPdfFile').addEventListener('change', e => updatePdfPageCount(e.target.files[0], 'watermarkPdfInfo', 'Select a PDF to watermark.'));
$('metadataPdfFile').addEventListener('change', e => updatePdfPageCount(e.target.files[0], 'metadataPdfInfo', 'Select a PDF to inspect its information.'));
$('reorderPdfFile').addEventListener('change', e => updatePdfPageCount(e.target.files[0], 'reorderPdfInfo', 'Enter every page number exactly once after selecting a file.'));
$('textPdfFile').addEventListener('change', e => {
  const file = e.target.files[0];
  $('textPdfInfo').textContent = file ? file.name + ' selected · extracts embedded/selectable text, not OCR.' : 'Scanned pages without a text layer are not OCR-processed.';
});
$('watermarkSize').addEventListener('input', () => $('watermarkSizeValue').textContent = $('watermarkSize').value + ' pt');
$('watermarkOpacity').addEventListener('input', () => $('watermarkOpacityValue').textContent = $('watermarkOpacity').value + '%');

$('compressPdfFile').addEventListener('change', e => updatePdfPageCount(e.target.files[0], 'compressPdfInfo', 'Choose a PDF to begin.'));
$('compressMode').addEventListener('change', () => {
  const raster = $('compressMode').value === 'raster';
  $('compressScale').disabled = !raster; $('compressQuality').disabled = !raster;
  $('compressModeHelp').textContent = raster ? 'Raster mode rebuilds each page as a JPEG image. Text will not be selectable or searchable; links, forms, comments, accessibility structure, and signatures will not be preserved.' : 'Attempts to compact the PDF structure without rasterizing pages. This may save only a little or can occasionally make a file larger; the tool reports the actual result.';
});
$('compressQuality').addEventListener('input', () => $('compressQualityValue').textContent = $('compressQuality').value + '%');
$('compressMode').dispatchEvent(new Event('change'));
$('compressPdfBtn').addEventListener('click', () => withButton($('compressPdfBtn'), async () => {
  const file = $('compressPdfFile').files[0];
  if (!file) throw new Error('Choose a PDF first.');
  if (file.size > 80 * 1024 * 1024) throw new Error('Please choose a PDF smaller than 80 MB for in-browser processing.');
  const mode = $('compressMode').value;
  const { PDFDocument } = requirePdfLib();
  if (mode === 'structure') {
    const doc = await PDFDocument.load(await file.arrayBuffer());
    if (doc.getPageCount() > 500) throw new Error('This PDF exceeds the 500-page safety limit.');
    const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false, objectsPerTick: 50 });
    const blob = new Blob([bytes], { type: 'application/pdf' });
    downloadBlob(blob, safeName(file.name) + '-optimized.pdf');
    const delta = blob.size - file.size, pct = Math.abs(delta) / Math.max(1, file.size) * 100;
    const comparison = delta < 0 ? formatBytes(-delta) + ' smaller (' + pct.toFixed(1) + '%)' : delta > 0 ? formatBytes(delta) + ' larger (' + pct.toFixed(1) + '%)' : 'the same size';
    $('compressPdfInfo').textContent = 'Saved an optimized copy · ' + doc.getPageCount() + ' page(s) · ' + formatBytes(file.size) + ' → ' + formatBytes(blob.size) + ' (' + comparison + ').';
    notify(delta < 0 ? 'Optimized PDF downloaded.' : 'Optimized copy downloaded; this PDF did not get smaller.');
    return;
  }
  const pdfjs = requirePdfJs();
  let source = null;
  try {
    source = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    if (source.numPages > 40) throw new Error('Raster compression is limited to 40 pages to protect browser memory. Use structure optimization for larger PDFs.');
    const scale = Number($('compressScale').value), quality = Number($('compressQuality').value) / 100;
    const output = await PDFDocument.create();
    let totalPixels = 0;
    for (let i = 1; i <= source.numPages; i++) {
      const page = await source.getPage(i), base = page.getViewport({ scale: 1 }), viewport = page.getViewport({ scale });
      const width = Math.ceil(viewport.width), height = Math.ceil(viewport.height), pixels = width * height;
      totalPixels += pixels;
      if (pixels > 20000000 || totalPixels > 180000000) throw new Error('The selected scale would render too many pixels for reliable browser processing. Choose a smaller scale.');
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('A drawing canvas could not be created by this browser.');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      const jpg = await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode a rendered PDF page as JPEG.')), 'image/jpeg', quality));
      const image = await output.embedJpg(await jpg.arrayBuffer());
      const outPage = output.addPage([base.width, base.height]);
      outPage.drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });
      canvas.width = 0; canvas.height = 0; page.cleanup();
    }
    const bytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
    const blob = new Blob([bytes], { type: 'application/pdf' });
    downloadBlob(blob, safeName(file.name) + '-raster-compressed.pdf');
    const delta = blob.size - file.size, pct = Math.abs(delta) / Math.max(1, file.size) * 100;
    const comparison = delta < 0 ? formatBytes(-delta) + ' smaller (' + pct.toFixed(1) + '%)' : delta > 0 ? formatBytes(delta) + ' larger (' + pct.toFixed(1) + '%)' : 'the same size';
    $('compressPdfInfo').textContent = 'Created visual-only PDF · ' + source.numPages + ' page(s) · ' + formatBytes(file.size) + ' → ' + formatBytes(blob.size) + ' (' + comparison + '). This copy no longer contains selectable text or interactive PDF features.';
    notify('Rasterized PDF downloaded. Check the result before relying on it.');
  } finally { if (source) { try { await source.destroy(); } catch (_) {} } }
}));

$('mergeBtn').addEventListener('click', () => withButton($('mergeBtn'), async () => {
  const files = Array.from($('mergeFiles').files || []);
  if (files.length < 2) throw new Error('Choose at least two PDF files to merge.');
  const { PDFDocument } = requirePdfLib();
  const merged = await PDFDocument.create();
  for (const file of files) {
    const doc = await PDFDocument.load(await file.arrayBuffer());
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach(page => merged.addPage(page));
  }
  const bytes = await merged.save();
  downloadBlob(new Blob([bytes], {type:'application/pdf'}), 'yorphives-merged.pdf');
  notify('Merged ' + files.length + ' PDF files successfully.');
}));

function parsePageRange(text, total) {
  const value = text.trim();
  if (!value) throw new Error('Enter the page numbers or ranges you want to keep.');
  const pages = [];
  for (const part of value.split(',')) {
    const item = part.trim();
    const match = item.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error('Use page numbers like 1, 3-5, 8.');
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    if (start < 1 || end < start || end > total) throw new Error('Page range is outside this PDF. It contains ' + total + ' pages.');
    for (let p = start; p <= end; p++) if (!pages.includes(p - 1)) pages.push(p - 1);
  }
  return pages;
}
$('splitBtn').addEventListener('click', () => withButton($('splitBtn'), async () => {
  const file = $('splitFile').files[0];
  if (!file) throw new Error('Choose a PDF first.');
  const { PDFDocument } = requirePdfLib();
  const source = await PDFDocument.load(await file.arrayBuffer());
  const indexes = parsePageRange($('pageRange').value, source.getPageCount());
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indexes);
  pages.forEach(page => output.addPage(page));
  downloadBlob(new Blob([await output.save()], {type:'application/pdf'}), safeName(file.name) + '-pages.pdf');
  notify('Extracted ' + pages.length + ' page(s).');
}));

$('rotatePdfBtn').addEventListener('click', () => withButton($('rotatePdfBtn'), async () => {
  const file = $('rotatePdfFile').files[0];
  if (!file) throw new Error('Choose a PDF first.');
  const { PDFDocument, degrees } = requirePdfLib();
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const turn = Number($('rotateDegrees').value);
  doc.getPages().forEach(page => page.setRotation(degrees(((page.getRotation().angle + turn) % 360 + 360) % 360)));
  downloadBlob(new Blob([await doc.save()], {type:'application/pdf'}), safeName(file.name) + '-rotated.pdf');
  $('rotatePdfInfo').textContent = 'Done · rotated ' + doc.getPageCount() + ' page(s) by ' + turn + '° clockwise.';
  notify('Rotated PDF downloaded.');
}));

$('watermarkPdfBtn').addEventListener('click', () => withButton($('watermarkPdfBtn'), async () => {
  const file = $('watermarkPdfFile').files[0];
  if (!file) throw new Error('Choose a PDF first.');
  const text = $('watermarkText').value.trim();
  if (!text) throw new Error('Enter the watermark text.');
  if (text.length > 100) throw new Error('Use 100 characters or fewer for the watermark.');
  const { PDFDocument, StandardFonts, rgb, degrees } = requirePdfLib();
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const size = Number($('watermarkSize').value);
  const opacity = Number($('watermarkOpacity').value) / 100;
  const angle = Number($('watermarkAngle').value);
  for (const page of doc.getPages()) {
    const pageSize = page.getSize();
    let fontSize = size;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    if (textWidth > pageSize.width - 24) fontSize = Math.max(8, (pageSize.width - 24) / Math.max(1, font.widthOfTextAtSize(text, 1)));
    const fittedWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: Math.max(12, (pageSize.width - fittedWidth) / 2),
      y: pageSize.height / 2,
      size: fontSize,
      font,
      color: rgb(0.52, 0.52, 0.58),
      opacity,
      rotate: degrees(angle)
    });
  }
  downloadBlob(new Blob([await doc.save()], {type:'application/pdf'}), safeName(file.name) + '-watermarked.pdf');
  $('watermarkPdfInfo').textContent = 'Done · watermark added to ' + doc.getPageCount() + ' page(s).';
  notify('Watermarked PDF downloaded. Keep the original in case you need it.');
}));

$('extractTextPdfBtn').addEventListener('click', () => withButton($('extractTextPdfBtn'), async () => {
  const file = $('textPdfFile').files[0];
  if (!file) throw new Error('Choose a PDF first.');
  const PDFJS = requirePdfJs();
  const pdf = await PDFJS.getDocument({data: await file.arrayBuffer()}).promise;
  const parts = [];
  let extractedCharacters = 0;
  for (let n = 1; n <= pdf.numPages; n++) {
    $('textPdfInfo').textContent = 'Extracting text from page ' + n + ' of ' + pdf.numPages + '…';
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const lines = [];
    let currentLine = '';
    for (const item of content.items) {
      const fragment = item.str || '';
      if (fragment) currentLine += (currentLine && !/\s$/.test(currentLine) ? ' ' : '') + fragment;
      if (item.hasEOL && currentLine.trim()) { lines.push(currentLine.trim()); currentLine = ''; }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    const text = lines.join('\n').replace(/[ \t]+\n/g, '\n').trim();
    extractedCharacters += text.length;
    parts.push('--- Page ' + n + ' ---\n' + text);
  }
  if (!extractedCharacters) throw new Error('No selectable text was found. This may be a scanned PDF; this tool does not perform OCR.');
  const result = parts.join('\n\n');
  downloadBlob(new Blob([result], {type:'text/plain;charset=utf-8'}), safeName(file.name) + '-text.txt');
  $('textPdfInfo').textContent = 'Done · extracted ' + extractedCharacters.toLocaleString() + ' characters from ' + pdf.numPages + ' page(s).';
  notify('PDF text downloaded as a TXT file.');
}));

$('metadataPdfBtn').addEventListener('click', () => withButton($('metadataPdfBtn'), async () => {
  const file = $('metadataPdfFile').files[0];
  if (!file) throw new Error('Choose a PDF first.');
  const { PDFDocument } = requirePdfLib();
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const show = value => value === undefined || value === null || value === '' ? 'Not set' : String(value);
  const showDate = value => value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString() : 'Not set';
  const report = [
    'PDF DOCUMENT DETAILS',
    'File name: ' + file.name,
    'File size: ' + formatBytes(file.size),
    'Page count: ' + doc.getPageCount(),
    'Title: ' + show(doc.getTitle()),
    'Author: ' + show(doc.getAuthor()),
    'Subject: ' + show(doc.getSubject()),
    'Keywords: ' + show(doc.getKeywords()),
    'Creator: ' + show(doc.getCreator()),
    'Producer: ' + show(doc.getProducer()),
    'Creation date: ' + showDate(doc.getCreationDate()),
    'Modification date: ' + showDate(doc.getModificationDate()),
    '',
    'Note: this is basic document metadata, not a full security or forensic audit.'
  ].join('\n');
  downloadBlob(new Blob([report], {type:'text/plain;charset=utf-8'}), safeName(file.name) + '-details.txt');
  $('metadataPdfInfo').textContent = 'Done · ' + doc.getPageCount() + ' page(s). A text report was downloaded.';
  notify('PDF details report downloaded.');
}));

function parsePageOrder(text, total) {
  const tokens = text.split(',').map(item => item.trim());
  if (!text.trim() || tokens.some(item => !/^\d+$/.test(item))) throw new Error('Enter page numbers separated by commas, for example 3, 1, 2.');
  const pages = tokens.map(Number);
  if (pages.length !== total) throw new Error('This PDF has ' + total + ' pages. Enter every page number exactly once.');
  if (pages.some(page => page < 1 || page > total)) throw new Error('Page numbers must be between 1 and ' + total + '.');
  if (new Set(pages).size !== total) throw new Error('Each page number must appear exactly once.');
  return pages.map(page => page - 1);
}
$('reorderPdfBtn').addEventListener('click', () => withButton($('reorderPdfBtn'), async () => {
  const file = $('reorderPdfFile').files[0];
  if (!file) throw new Error('Choose a PDF first.');
  const { PDFDocument } = requirePdfLib();
  const source = await PDFDocument.load(await file.arrayBuffer());
  const order = parsePageOrder($('pageOrder').value, source.getPageCount());
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, order);
  pages.forEach(page => output.addPage(page));
  downloadBlob(new Blob([await output.save()], {type:'application/pdf'}), safeName(file.name) + '-reordered.pdf');
  $('reorderPdfInfo').textContent = 'Done · pages reordered into the sequence you entered.';
  notify('Reordered PDF downloaded.');
}));

async function imageFileToJpegBytes(file) {
  const image = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = image.width; canvas.height = image.height;
  const ctx = canvas.getContext('2d', {alpha:false});
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(image,0,0);
  image.close();
  const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',0.94));
  if (!blob) throw new Error('Could not read one of the images.');
  return new Uint8Array(await blob.arrayBuffer());
}
$('imagePdfBtn').addEventListener('click', () => withButton($('imagePdfBtn'), async () => {
  const files = Array.from($('imagePdfFiles').files || []);
  if (!files.length) throw new Error('Choose one or more JPG, PNG or WebP images.');
  const { PDFDocument } = requirePdfLib();
  const pdf = await PDFDocument.create();
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const bytes = await imageFileToJpegBytes(file);
    const image = await pdf.embedJpg(bytes);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {x:0,y:0,width:image.width,height:image.height});
  }
  if (!pdf.getPageCount()) throw new Error('No supported images were selected.');
  downloadBlob(new Blob([await pdf.save()], {type:'application/pdf'}), 'yorphives-images.pdf');
  notify('Created a PDF with ' + pdf.getPageCount() + ' image page(s).');
}));

$('pdfImageBtn').addEventListener('click', () => withButton($('pdfImageBtn'), async () => {
  const file = $('pdfImageFile').files[0];
  if (!file) throw new Error('Choose a PDF first.');
  const PDFJS = requirePdfJs();
  if (!window.JSZip) throw new Error('The ZIP library did not load. Refresh and try again.');
  const pdf = await PDFJS.getDocument({data: await file.arrayBuffer()}).promise;
  const zip = new JSZip();
  const format = $('pdfImageFormat').value;
  const scale = Number($('pdfImageScale').value) || 1;
  for (let n = 1; n <= pdf.numPages; n++) {
    $('pdfImageInfo').textContent = 'Rendering page ' + n + ' of ' + pdf.numPages + '…';
    const page = await pdf.getPage(n);
    const viewport = page.getViewport({scale});
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext('2d', {alpha:false});
    context.fillStyle = '#ffffff'; context.fillRect(0,0,canvas.width,canvas.height);
    await page.render({canvasContext:context,viewport}).promise;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.92));
    if (!blob) throw new Error('Could not export page ' + n + '.');
    zip.file('page-' + String(n).padStart(3,'0') + '.' + (format === 'jpeg' ? 'jpg' : 'png'), await blob.arrayBuffer());
    canvas.width = 1; canvas.height = 1;
  }
  const archive = await zip.generateAsync({type:'blob'});
  downloadBlob(archive, safeName(file.name) + '-images.zip');
  $('pdfImageInfo').textContent = 'Done — exported ' + pdf.numPages + ' pages.';
  notify('Exported ' + pdf.numPages + ' PDF pages to a ZIP file.');
}));

let selectedImage = null;
let sourceImageUrl = null;
let sourceDimensions = null;
$('imageFile').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { notify('Please select an image file.'); return; }
  try {
    if (selectedImage && typeof selectedImage.close === 'function') selectedImage.close();
    selectedImage = await createImageBitmap(file);
    sourceDimensions = {width:selectedImage.width,height:selectedImage.height};
    $('imageWidth').value = selectedImage.width;
    $('imageHeight').value = selectedImage.height;
    $('imageInfo').textContent = file.name + ' · ' + selectedImage.width + ' × ' + selectedImage.height + ' · ' + formatBytes(file.size);
    if (sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
    sourceImageUrl = URL.createObjectURL(file);
    $('imagePreview').src = sourceImageUrl;
    $('imagePreviewWrap').hidden = false;
    $('imageResult').textContent = 'Ready to process. Original size: ' + formatBytes(file.size) + '.';
  } catch (error) {
    notify('This image could not be opened in your browser.');
  }
});
$('imageWidth').addEventListener('input', () => {
  if (!$('keepRatio').checked || !sourceDimensions || !$('imageWidth').value) return;
  $('imageHeight').value = Math.max(1, Math.round(Number($('imageWidth').value) * sourceDimensions.height / sourceDimensions.width));
});
$('imageHeight').addEventListener('input', () => {
  if (!$('keepRatio').checked || !sourceDimensions || !$('imageHeight').value) return;
  $('imageWidth').value = Math.max(1, Math.round(Number($('imageHeight').value) * sourceDimensions.width / sourceDimensions.height));
});
function syncImageQuality() {
  const png = $('imageFormat').value === 'image/png';
  $('imageQuality').disabled = png;
  $('qualityValue').textContent = png ? 'Not used' : $('imageQuality').value + '%';
}
$('imageFormat').addEventListener('change', syncImageQuality);
$('imageQuality').addEventListener('input', () => $('qualityValue').textContent = $('imageQuality').value + '%');
syncImageQuality();
$('imageConvertBtn').addEventListener('click', () => withButton($('imageConvertBtn'), async () => {
  if (!selectedImage) throw new Error('Choose an image first.');
  const width = Number($('imageWidth').value) || selectedImage.width;
  const height = Number($('imageHeight').value) || selectedImage.height;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 12000 || height > 12000) throw new Error('Width and height must be whole numbers between 1 and 12,000 pixels.');
  if (width * height > 40000000) throw new Error('That output is very large. Choose dimensions with fewer than 40 million pixels.');
  const format = $('imageFormat').value;
  const quality = Number($('imageQuality').value) / 100;
  const rotation = Number($('imageRotation').value) || 0;
  const flipX = $('flipHorizontal').checked, flipY = $('flipVertical').checked;
  const quarterTurn = rotation === 90 || rotation === 270;
  const canvas = document.createElement('canvas');
  canvas.width = quarterTurn ? height : width;
  canvas.height = quarterTurn ? width : height;
  const ctx = canvas.getContext('2d', {alpha:format !== 'image/jpeg'});
  if (format === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.drawImage(selectedImage, -width / 2, -height / 2, width, height);
  ctx.restore();
  const blob = await new Promise(resolve => canvas.toBlob(resolve,format,quality));
  if (!blob) throw new Error('This browser could not create that output format.');
  const extension = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
  const original = $('imageFile').files[0];
  downloadBlob(blob, safeName(original.name).replace(/\.pdf$/i,'') + '-processed.' + extension);
  const delta = blob.size - original.size;
  $('imageResult').textContent = 'Finished: ' + canvas.width + ' × ' + canvas.height + ' px · ' + formatBytes(blob.size) + ' (' + (delta <= 0 ? formatBytes(-delta) + ' smaller' : formatBytes(delta) + ' larger') + ' than original).';
  notify('Processed image downloaded.');
}));
})();