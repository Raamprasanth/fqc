
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
  }
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });

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

    // Division context
    const activeDivision = localStorage.getItem('activeDivision') || 'Default';
    if (roleEl) roleEl.textContent = (user.designation || 'Service Team') + ' (' + activeDivision + ')';
    const h1 = document.querySelector('.topbar-left h1');
    if (h1) h1.textContent = 'Dashboard - ' + activeDivision;

    // Fetch Stats
    try {
      const res = await fetch('http://localhost:3001/api/emp/stats?division=' + encodeURIComponent(activeDivision), {
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
