const fs = require('fs');
let html = fs.readFileSync('public/frontend/admin-shortshipment.html', 'utf8');

// 1. Change API_BASE
html = html.replace(
  "const API_BASE = 'http://localhost:3001/api/shortshipment';",
  "const API_BASE = 'http://localhost:3001/api/ashort';"
);

// 2. Change loadEntries
html = html.replace(
  /const res = await fetch\(API_BASE, \{/,
  `const query = currentTab === 'all' ? '' : '?configKey=' + currentTab;
      const res = await fetch(API_BASE + query, {`
);

// 3. Fix modal CSS
const modalCssRegex = /\.modal-overlay\s*\{[\s\S]*?\.modal\s*\{[\s\S]*?\}/;
const newModalCss = `.modal-overlay{
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
if (modalCssRegex.test(html)) {
  html = html.replace(modalCssRegex, newModalCss);
}

const formCss = `
.modal form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}`;
html = html.replace(/\.modal-body\{.*?\}/, formCss + '\n.modal-body{padding:28px 32px 28px; flex:1; overflow-y:auto; max-height:none;}');
html = html.replace(/\.modal-footer\{[\s\S]*?\}/, `.modal-footer{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:12px;
  padding:20px 32px;
  flex-shrink:0;
  border-top:1px solid rgba(255,255,255,0.06);
  background:var(--card);
}`);

fs.writeFileSync('public/frontend/admin-shortshipment.html', html);
console.log('Patched ashort');
