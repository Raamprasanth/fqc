

  /* ═══ Sidebar ═══ */
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  function toggleSidebar(){ sidebar.classList.toggle('open'); overlay.classList.toggle('visible'); }
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });

  /* ═══ Context ═══ */
  const activeDivision = localStorage.getItem('activeDivision') || 'Ventilator';
  const lDiv = activeDivision.toLowerCase();
  
  // Only applicable for Schiller AG / Monitors / Ganshorn
  const isApplicable = lDiv.includes('schiller') || lDiv.includes('monitor') || lDiv.includes('ganshorn');

  const API_BASE = 'http://localhost:3001/api/medilog';
  function getToken() { return localStorage.getItem('token') || ''; }
  let entries = [];

  const tableBody = document.getElementById('tableBody');
  const recordCount = document.getElementById('recordCount');
  const searchInput = document.getElementById('searchInput');
  const openAddBtn = document.getElementById('openAddBtn');

  if (!isApplicable && openAddBtn) {
    openAddBtn.style.display = 'none';
  }

  async function loadEntries() {
    if (!isApplicable) {
      renderTable([]);
      return;
    }
    try {
      const res = await fetch(API_BASE + '?division=' + encodeURIComponent(activeDivision), {
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      if (res.ok) {
        entries = await res.json();
        renderTable(entries);
      }
    } catch (err) {
      console.error('Failed to load entries', err);
    }
  }

  function renderTable(list) {
    const total = list.length;
    if (!isApplicable) {
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="13">
            <span class="empty-icon">&#9888;&#65039;</span>
            Medilog License is only applicable for Schiller AG and Monitors division.
          </td>
        </tr>`;
    } else if (!total) {
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="13">
            <span class="empty-icon">&#128203;</span>
            No records yet for ${activeDivision}. Click "Add New" to log the first entry.
          </td>
        </tr>`;
    } else {
      tableBody.innerHTML = list.map((entry, i) => {
        const v = entry.values;
        return `<tr>
          <td><span class="sn-badge">${total - i}</span></td>
          <td>${v.month || '—'}</td>
          <td>${v.inwardDate || '—'}</td>
          <td>${v.model || '—'}</td>
          <td>${v.unitSrNo || '—'}</td>
          <td>${v.conf || '—'}</td>
          <td>${v.version || '—'}</td>
          <td>${v.refInvoice || '—'}</td>
          <td>${v.qty || '—'}</td>
          <td class="wrap-cell">${v.swVer || '—'}</td>
          <td class="wrap-cell">${v.hwVer || '—'}</td>
          <td class="wrap-cell">${v.accessoryRemarks || '—'}</td>
          <td class="wrap-cell">${v.remarks || '—'}</td>
        </tr>`;
      }).join('');
    }
    recordCount.textContent = `${total} record${total === 1 ? '' : 's'}`;
  }

  /* ═══ Modal ═══ */
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const medilogForm = document.getElementById('medilogForm');
  const modalSubtitle = document.querySelector('.modal-head p');

  function openModal(){ 
    if (modalSubtitle) modalSubtitle.textContent = `Division: ${activeDivision}`;
    modalOverlay.classList.add('visible'); 
  }
  function closeModal(){ modalOverlay.classList.remove('visible'); medilogForm.reset(); }
  if (openAddBtn) openAddBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  medilogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = medilogForm.querySelector('button[type="submit"]');
    const oldText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const values = {
      month: escapeHtml(document.getElementById('fMonth').value),
      inwardDate: escapeHtml(document.getElementById('fInwardDate').value),
      model: escapeHtml(document.getElementById('fModel').value),
      unitSrNo: escapeHtml(document.getElementById('fUnitSrNo').value),
      conf: escapeHtml(document.getElementById('fConf').value),
      version: escapeHtml(document.getElementById('fVersion').value),
      refInvoice: escapeHtml(document.getElementById('fRefInvoice').value),
      qty: escapeHtml(document.getElementById('fQty').value),
      swVer: escapeHtml(document.getElementById('fSwVer').value),
      hwVer: escapeHtml(document.getElementById('fHwVer').value),
      accessoryRemarks: escapeHtml(document.getElementById('fAccessoryRemarks').value),
      remarks: escapeHtml(document.getElementById('fRemarks').value)
    };

    const entryPayload = {
      division: activeDivision,
      values
    };

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify(entryPayload)
      });
      if (!res.ok) throw new Error('Failed to save');
      
      const savedEntry = await res.json();
      entries.unshift(savedEntry);
      renderTable(entries);
      closeModal();
    } catch (err) {
      alert('Error saving entry: ' + err.message);
    } finally {
      btn.textContent = oldText;
      btn.disabled = false;
    }
  });

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { renderTable(entries); return; }
    const filtered = entries.filter(entry =>
      Object.values(entry.values).some(v => String(v).toLowerCase().includes(q))
    );
    renderTable(filtered);
  });

  /* ═══ Init Context ═══ */
  document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) { window.location.href = 'login.html'; return; }
    const avatar = document.querySelector('.user-avatar');
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = (user.designation || 'Service Team') + ' (' + activeDivision + ')';
    
    const h1 = document.querySelector('.topbar-left h1');
    if (h1) h1.textContent = 'Medilog License - ' + activeDivision;
    
    renderTable(entries);
    loadEntries();
  });

