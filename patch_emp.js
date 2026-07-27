const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'frontend', 'emp.html');
let content = fs.readFileSync(filePath, 'utf8');

// Add IDs to stat numbers
content = content.replace(/<div class="stat-number">—<\/div>\s*<div class="stat-label">In Today<\/div>/, '<div class="stat-number" id="stat-in">—</div>\n        <div class="stat-label">In Today</div>');
content = content.replace(/<div class="stat-number">—<\/div>\s*<div class="stat-label">Out Today<\/div>/, '<div class="stat-number" id="stat-out">—</div>\n        <div class="stat-label">Out Today</div>');
content = content.replace(/<div class="stat-number">—<\/div>\s*<div class="stat-label">Shortshipments<\/div>/, '<div class="stat-number" id="stat-short">—</div>\n        <div class="stat-label">Shortshipments</div>');
content = content.replace(/<div class="stat-number">—<\/div>\s*<div class="stat-label">Batteries Charging<\/div>/, '<div class="stat-number" id="stat-batt">—</div>\n        <div class="stat-label">Batteries Charging</div>');

// Add script to fetch data and update sidebar
const fetchScript = `
  // ── Load User & Stats ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) { window.location.href = 'login.html'; return; }
    
    // Update Sidebar User Info
    const avatar = document.querySelector('.user-avatar');
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.designation || 'Service Team';

    // Fetch Stats
    try {
      const res = await fetch('http://localhost:3001/api/emp/stats', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (res.ok) {
        const stats = await res.json();
        document.getElementById('stat-in').textContent = stats.inToday;
        document.getElementById('stat-out').textContent = stats.outToday;
        document.getElementById('stat-short').textContent = stats.shortshipments;
        document.getElementById('stat-batt').textContent = stats.batteriesCharging;
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  });
</script>
</body>
</html>
`;

content = content.replace(/<\/script>\s*<\/body>\s*<\/html>/, fetchScript);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched emp.html');
