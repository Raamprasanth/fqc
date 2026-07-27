const fs = require('fs');

function cleanInHtml() {
  let html = fs.readFileSync('public/frontend/in.html', 'utf8');
  const splitPoint = '<div class="modal-overlay" id="modalOverlay">';
  const parts = html.split(splitPoint);
  if (parts.length === 2) {
    let modalPart = parts[1].replace(/ placeholder="[^"]+"/g, '');
    fs.writeFileSync('public/frontend/in.html', parts[0] + splitPoint + modalPart);
    console.log('Cleaned placeholders in in.html');
  }
}

function cleanOutHtml() {
  let html = fs.readFileSync('public/frontend/out.html', 'utf8');
  html = html.replace(/ placeholder:'[^']+'/g, ''); // Removes placeholder:'...' in the divisions config array
  fs.writeFileSync('public/frontend/out.html', html);
  console.log('Cleaned placeholders in out.html config');
}

cleanInHtml();
cleanOutHtml();
