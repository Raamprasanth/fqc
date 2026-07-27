const fs = require('fs');

// Patch out.html
let outHtml = fs.readFileSync('public/frontend/out.html', 'utf8');
const outRegex = /\.modal-overlay\s*\{[\s\S]*?\.modal\s*\{[\s\S]*?max-height:[^;]+;\s*\}/;
const outReplacement = `.modal-overlay{
  position:fixed; top:0; right:0; bottom:0; left:264px;
  background:var(--background); z-index:45;
  display:flex; justify-content:center; align-items:center;
  opacity:0; visibility:hidden; transition:all 0.3s;
}
@media (max-width: 960px) { .modal-overlay { left: 0; } }
.modal-overlay.visible{opacity:1; visibility:visible;}
.modal{
  background:var(--card); width:100%; height:100%; max-width:none;
  border-radius:0; border:none;
  transform:none; transition:all 0.3s;
  display:flex; flex-direction:column; max-height:none;
}`;
outHtml = outHtml.replace(outRegex, outReplacement);
fs.writeFileSync('public/frontend/out.html', outHtml);

// Patch in.html
let inHtml = fs.readFileSync('public/frontend/in.html', 'utf8');
const inRegex = /\.modal-overlay\s*\{[\s\S]*?\.modal\s*\{[\s\S]*?animation:[^;]+;\s*\}/;
const inReplacement = `.modal-overlay{
  display:none; position:fixed;
  top:0; right:0; bottom:0; left:264px;
  background:var(--background);
  z-index:100;
  align-items:center; justify-content:center;
  padding:0;
}
@media (max-width: 960px) { .modal-overlay { left: 0; } }
.modal-overlay.visible{display:flex;}
.modal{
  background:var(--card); border-radius:0;
  width:100%; height:100%;
  max-width:none; max-height:none;
  display:flex; flex-direction:column; border:none;
  animation:modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}`;
inHtml = inHtml.replace(inRegex, inReplacement);
fs.writeFileSync('public/frontend/in.html', inHtml);

console.log('Patched modal CSS in out.html and in.html');
