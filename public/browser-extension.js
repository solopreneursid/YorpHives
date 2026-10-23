(() => {
"use strict";
const desktopFiles = ["manifest.json","popup.html","popup.css","popup.js","options.html","options.css","options.js","README.txt"];
const firefoxFiles = ["manifest.json","popup.html","popup.css","popup.js","options.html","options.css","options.js","README.txt"];
const desktopButtons = ["downloadZip","downloadZipBottom","downloadZipFinal"].map(id => document.getElementById(id)).filter(Boolean);
const firefoxButtons = ["downloadFirefoxPackage"].map(id => document.getElementById(id)).filter(Boolean);
const desktopStatus = document.getElementById("zipStatus");
const firefoxStatus = document.getElementById("firefoxZipStatus");
const enc = new TextEncoder();

function u16(n) { return [n & 255, (n >>> 8) & 255]; }
function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
function join(chunks) {
  let length = 0;
  for (const chunk of chunks) length += chunk.length;
  const out = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length; }
  return out;
}
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let crc = n;
    for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    table[n] = crc >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function makeLocalHeader(name, data) {
  const crc = crc32(data);
  const header = new Uint8Array([
    ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0),
    ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length),
    ...u32(data.length), ...u16(name.length), ...u16(0)
  ]);
  return join([header, name, data]);
}
function makeCentralHeader(name, data, offset) {
  const crc = crc32(data);
  const header = new Uint8Array([
    ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0),
    ...u16(0), ...u16(0), ...u32(crc), ...u32(data.length), ...u32(data.length),
    ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)
  ]);
  return join([header, name]);
}
function makeEndRecord(count, centralSize, localSize) {
  return new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(count),
    ...u16(count), ...u32(centralSize), ...u32(localSize), ...u16(0)
  ]);
}
async function buildPackage(config) {
  const {sourceRoot, files, rootPrefix, filename, status, buttons, successMessage} = config;
  buttons.forEach(button => { button.disabled = true; });
  if (status) status.textContent = "Preparing the package locally…";
  try {
    const localEntries = [], centralEntries = [];
    let offset = 0;
    for (const path of files) {
      const response = await fetch(sourceRoot + "/" + path, {cache:"no-store"});
      if (!response.ok) throw new Error("Cannot load source file: " + path + " (HTTP " + response.status + ").");
      const sourceText = await response.text();
      const data = enc.encode(sourceText);
      const name = enc.encode(rootPrefix + path);
      const local = makeLocalHeader(name, data);
      localEntries.push(local);
      centralEntries.push(makeCentralHeader(name, data, offset));
      offset += local.length;
    }
    const centralBytes = join(centralEntries);
    const localBytes = join(localEntries);
    const zip = join([localBytes, centralBytes, makeEndRecord(files.length, centralBytes.length, localBytes.length)]);
    const blob = new Blob([zip], {type:"application/zip"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    if (status) status.textContent = successMessage(zip.length, files.length);
  } catch (error) {
    if (status) status.textContent = "Could not prepare the package: " + (error.message || "Unknown error") + ". Reload this page and try again.";
  } finally {
    buttons.forEach(button => { button.disabled = false; });
  }
}
function buildDesktop() {
  return buildPackage({
    sourceRoot:"/extension-src",
    files:desktopFiles,
    rootPrefix:"YorpHives-QuickPanel/",
    filename:"YorpHives-QuickPanel.zip",
    status:desktopStatus,
    buttons:desktopButtons,
    successMessage:(bytes,count) => "Desktop ZIP created locally: " + count + " files, " + Math.ceil(bytes / 1024) + " KB."
  });
}
function buildFirefox() {
  return buildPackage({
    sourceRoot:"/firefox-addon",
    files:firefoxFiles,
    rootPrefix:"",
    filename:"YorpHives-QuickPanel-Firefox-AMO.zip",
    status:firefoxStatus,
    buttons:firefoxButtons,
    successMessage:(bytes,count) => "Firefox AMO submission ZIP created locally: " + count + " root-level files, " + Math.ceil(bytes / 1024) + " KB. It is not signed; Mozilla distribution steps remain."
  });
}
desktopButtons.forEach(button => button.addEventListener("click", buildDesktop));
firefoxButtons.forEach(button => button.addEventListener("click", buildFirefox));
})();