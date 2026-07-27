const fs = require('fs');

const sidebarTemplate = `
<aside class="sidebar" id="sidebar">
  <div class="sidebar-brand">
    <div class="logo-mark">S</div>
    <div>
      <div class="name">Schiller</div>
      <div class="sub">Admin Panel</div>
    </div>
  </div>

  <div class="sidebar-section-label">Main</div>
  <ul class="nav-list">
    <li class="nav-item"><a href="admin.html" data-page="dashboard"><span class="nav-icon">&#127968;</span>Dashboard</a></li>
  </ul>

  <div class="sidebar-section-label">Management</div>
  <ul class="nav-list">
    <li class="nav-item"><a href="division.html" data-page="division"><span class="nav-icon">&#127760;</span>Division</a></li>
    <li class="nav-item"><a href="user-management.html" data-page="user-management"><span class="nav-icon">&#128101;</span>User Management</a></li>
  </ul>

  <div class="sidebar-section-label">Operations Oversight</div>
  <ul class="nav-list">
    <li class="nav-item"><a href="admin-in.html" data-page="admin-in"><span class="nav-icon">&#128229;</span>In</a></li>
    <li class="nav-item"><a href="admin-out.html" data-page="admin-out"><span class="nav-icon">&#128228;</span>Out</a></li>
    <li class="nav-item"><a href="ashort.html" data-page="admin-shortshipment"><span class="nav-icon">&#128230;</span>Shortshipment</a></li>
    <li class="nav-item"><a href="admin-dod.html" data-page="admin-dod"><span class="nav-icon">&#128666;</span>DOD</a></li>
    <li class="nav-item"><a href="admin-doa-wf.html" data-page="admin-doa-wf"><span class="nav-icon">&#9888;&#65039;</span>DOA+WF</a></li>
    <li class="nav-item"><a href="admin-acc-out.html" data-page="admin-acc-out"><span class="nav-icon">&#128203;</span>ACC-OUT</a></li>
    <li class="nav-item"><a href="admin-battery-charging.html" data-page="admin-battery-charging"><span class="nav-icon">&#128267;</span>Battery Charging</a></li>
  </ul>

  <div class="sidebar-footer">
    <div class="user-avatar">A</div>
    <div class="user-info">
      <div class="user-name">Admin User</div>
      <div class="user-role">Administrator</div>
    </div>
    <button class="logout-btn" id="logoutBtn" title="Log out">&#9211;</button>
  </div>
</aside>
`;

const pagesToFix = [
  {file: 'ashort.html', activeStr: 'data-page="admin-shortshipment"'},
  {file: 'admin-out.html', activeStr: 'data-page="admin-out"'},
  {file: 'admin-dod.html', activeStr: 'data-page="admin-dod"'},
  {file: 'admin-doa-wf.html', activeStr: 'data-page="admin-doa-wf"'},
  {file: 'admin-acc-out.html', activeStr: 'data-page="admin-acc-out"'},
  {file: 'admin-battery-charging.html', activeStr: 'data-page="admin-battery-charging"'}
];

pagesToFix.forEach(page => {
  const path = 'public/frontend/' + page.file;
  if(fs.existsSync(path)) {
    let html = fs.readFileSync(path, 'utf8');
    
    const start = html.indexOf('<aside class="sidebar" id="sidebar">');
    const end = html.indexOf('</aside>', start) + 8;
    
    if(start !== -1 && end !== -1) {
      let activeSidebar = sidebarTemplate.replace(
        page.activeStr,
        'class="active" ' + page.activeStr
      );
      
      html = html.substring(0, start) + activeSidebar + html.substring(end);
      fs.writeFileSync(path, html);
      console.log('Fixed sidebar in ' + page.file);
    }
  }
});
