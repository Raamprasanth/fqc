const fs = require('fs');

const files = ['admin.html', 'division.html', 'user-management.html'];

const opsBlock = `
  <div class="sidebar-section-label">Operations Oversight</div>
  <ul class="nav-list">
    <li class="nav-item"><a href="admin-in.html" data-page="admin-in"><span class="nav-icon">&#128229;</span>In</a></li>
    <li class="nav-item"><a href="admin-out.html" data-page="admin-out"><span class="nav-icon">&#128228;</span>Out</a></li>
    <li class="nav-item"><a href="admin-shortshipment.html" data-page="admin-shortshipment"><span class="nav-icon">&#128230;</span>Shortshipment</a></li>
    <li class="nav-item"><a href="admin-dod.html" data-page="admin-dod"><span class="nav-icon">&#128666;</span>DOD</a></li>
    <li class="nav-item"><a href="admin-doa-wf.html" data-page="admin-doa-wf"><span class="nav-icon">&#9888;&#65039;</span>DOA+WF</a></li>
    <li class="nav-item"><a href="admin-acc-out.html" data-page="admin-acc-out"><span class="nav-icon">&#128203;</span>ACC-OUT</a></li>
    <li class="nav-item"><a href="admin-battery-charging.html" data-page="admin-battery-charging"><span class="nav-icon">&#128267;</span>Battery Charging</a></li>
  </ul>
`;

files.forEach(file => {
  const filepath = 'public/frontend/' + file;
  if (!fs.existsSync(filepath)) return;
  let html = fs.readFileSync(filepath, 'utf8');

  // Check if it already has Operations Oversight
  if (html.includes('Operations Oversight')) {
    console.log('Skipping ' + file + ' as it already has the block');
    return;
  }

  // Insert before sidebar-footer
  html = html.replace(/<div class="sidebar-footer">/, opsBlock + '\n  <div class="sidebar-footer">');
  fs.writeFileSync(filepath, html);
  console.log('Patched ' + file);
});
