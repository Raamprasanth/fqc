const fs = require('fs');

function replaceModalCSS(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Find the exact block by replacing the whole modal-overlay to the end of .modal
  const regex = /\.modal-overlay\s*\{[\s\S]*?\.modal\s*\{[\s\S]*?\}/;
  
  const replacement = `.modal-overlay{
  display:none; position:fixed;
  top:0; right:0; bottom:0; left:264px;
  background:var(--background, #f5f7f6);
  z-index:45;
  align-items:flex-start; justify-content:center;
  padding:0; overflow-y:auto;
}
@media (max-width: 960px) { .modal-overlay { left: 0; } }
.modal-overlay.visible{display:flex;}
.modal{
  background:var(--card, #fff); border-radius:0;
  width:100%; min-height:100%; height:auto;
  max-width:none; box-shadow:none;
  margin:0; overflow:hidden;
  display:flex; flex-direction:column;
}`;
  
  if (regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync(filePath, html);
    console.log('Successfully patched ' + filePath);
  } else {
    console.log('Regex did not match in ' + filePath);
  }
}

replaceModalCSS('public/frontend/out.html');
replaceModalCSS('public/frontend/in.html');
