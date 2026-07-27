const fs = require('fs');

function alignFooter(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Fix form CSS (add display:flex, flex-direction:column, flex:1, min-height:0)
  // Since #outForm or form might not have specific CSS, we can add it to .modal form
  const formCss = `
.modal form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}`;

  // Replace .modal-body
  html = html.replace(/\.modal-body\{.*?\}/, '.modal-body{padding:28px 32px 28px; flex:1; overflow-y:auto; max-height:none;}');

  // Replace .modal-footer
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

  // Inject formCss right before .modal-body
  html = html.replace('.modal-body{', formCss + '\n.modal-body{');

  fs.writeFileSync(filePath, html);
  console.log('Aligned footer in ' + filePath);
}

alignFooter('public/frontend/in.html');
alignFooter('public/frontend/out.html');
