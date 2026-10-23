(() => {
const files=['manifest.json','popup.html','popup.css','popup.js','options.html','options.css','options.js','README.txt'];
const buttons=['downloadZip','downloadZipBottom','downloadZipFinal'].map(id=>document.getElementById(id)).filter(Boolean);
const status=document.getElementById('zipStatus');
const enc=new TextEncoder();
function u16(n){return [n&255,(n>>>8)&255]}
function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]}
function join(chunks){let length=0;for(const c of chunks)length+=c.length;const out=new Uint8Array(length);let offset=0;for(const c of chunks){out.set(c,offset);offset+=c.length}return out}
const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);t[n]=c>>>0}return t})();
function crc32(a){let c=0xffffffff;for(const b of a)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
async function build(){
for(const b of buttons)b.disabled=true;
if(status)status.textContent='Preparing the extension archive locally…';
try{
const local=[],central=[];let offset=0;
for(const path of files){
const r=await fetch('/extension-src/'+path,{cache:'no-store'});
if(!r.ok)throw Error('Cannot load source file: '+path+' (HTTP '+r.status+').');
const data=enc.encode(await r.text()),name=enc.encode('YorpHives-QuickPanel/'+path),crc=crc32(data);
const header=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0)]);
const localEntry=join([header,name,data]);local.push(localEntry);
const centralHeader=new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]);
const centralEntry=join([centralHeader,name]);central.push(centralEntry);offset+=localEntry.length;
}
const centralBytes=join(central),localBytes=join(local);
const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(centralBytes.length),...u32(localBytes.length),...u16(0)]);
const zip=join([localBytes,centralBytes,end]);
const blob=new Blob([zip],{type:'application/zip'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='YorpHives-QuickPanel.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
if(status)status.textContent='ZIP created successfully in your browser: '+files.length+' source files, '+Math.ceil(zip.length/1024)+' KB. No third-party ZIP service or library used.';
}catch(e){if(status)status.textContent='Could not prepare the ZIP: '+e.message+'. Reload this page and try again.'}
finally{for(const b of buttons)b.disabled=false}
}
buttons.forEach(b=>b.addEventListener('click',build));
})();