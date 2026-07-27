const fs = require('fs');

const files = [
  'acc-out.html', 'battery-charging.html', 'doa-wf.html', 'dod.html', 
  'emp.html', 'in.html', 'out.html', 'shortshipment.html'
];

const sidebarHtml = `
  <div class="sidebar-section-label" id="agSidebarSection" style="display:none;">Schiller AG Only</div>
  <ul class="nav-list" id="agSidebarNav" style="display:none;">
    <li class="nav-item"><a href="medilog-license.html" data-page="medilog-license"><span class="nav-icon">&#128273;</span>Medilog License<span class="nav-badge">AG</span></a></li>
  </ul>

  <div class="sidebar-footer">`;

const scriptInjector = `
    const agSection = document.getElementById('agSidebarSection');
    const agNav = document.getElementById('agSidebarNav');
    const lDiv2 = (typeof activeDivision !== 'undefined' ? activeDivision : (localStorage.getItem('activeDivision') || '')).toLowerCase();
    if (lDiv2.includes('schiller') || lDiv2.includes('monitor') || lDiv2.includes('ganshorn')) {
      if (agSection) agSection.style.display = 'block';
      if (agNav) agNav.style.display = 'flex';
    }`;

files.forEach(file => {
  const filepath = 'public/frontend/' + file;
  if (!fs.existsSync(filepath)) return;
  let html = fs.readFileSync(filepath, 'utf8');
  
  if (html.includes('id="agSidebarSection"')) {
    console.log('Skipping ' + file + ', already patched.');
    return;
  }
  
  html = html.replace(/<div class="sidebar-footer">/, sidebarHtml.trim());
  
  html = html.replace(/document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/, 
    "document.addEventListener('DOMContentLoaded', () => {\n" + scriptInjector);
    
  fs.writeFileSync(filepath, html);
  console.log('Patched ' + file);
});
