const $=s=>document.querySelector(s);
const fields=['fullName','email','phone','company','jobTitle','website','address','city','country','skills'];
function say(s){$('#status').textContent=s}
async function load(){const p=(await chrome.storage.local.get('dhProfile')).dhProfile||{};for(const k of fields)$('#'+k).value=p[k]||''}
$('#profileForm').addEventListener('submit',async e=>{e.preventDefault();const p={};for(const k of fields)p[k]=$('#'+k).value.trim();await chrome.storage.local.set({dhProfile:p});say('Profile saved locally in this browser.');});
$('#clearProfile').addEventListener('click',async()=>{if(!confirm('Clear saved profile details from this browser?'))return;await chrome.storage.local.remove('dhProfile');await load();say('Local profile cleared.');});
$('#exportProfile').addEventListener('click',async()=>{const p=(await chrome.storage.local.get('dhProfile')).dhProfile||{};const blob=new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='yorphives-profile.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);say('Profile export created.');});
load();