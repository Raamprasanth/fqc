const fs = require('fs');
const html = fs.readFileSync('public/frontend/battery-charging.html', 'utf8');

const divStart = html.indexOf('  const divisions = {');
const divEnd = html.indexOf('  let currentDivision =');

if (divStart > -1 && divEnd > -1) {
  const divisionsBlock = html.substring(divStart, divEnd);
  console.log('Successfully extracted divisions block, length:', divisionsBlock.length);
  
  // Now write the patched version
  const newScript = `
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

  /* ═══ Division field configs ═══ */
  const STATUS_OPTIONS = ['Pending', 'Completed', 'In Progress'];
` + divisionsBlock + `
  const activeDivision = localStorage.getItem('activeDivision') || 'Ventilator';
  
  const tableHeadRow = document.getElementById('tableHeadRow');
  const tableBody = document.getElementById('tableBody');
  const recordCount = document.getElementById('recordCount');
  const searchInput = document.getElementById('searchInput');

  let currentDivision = 'vent-anesthesia';
  const lDiv = activeDivision.toLowerCase();
  if (lDiv.includes('schiller') || lDiv.includes('monitor') || lDiv.includes('ganshorn')) {
    currentDivision = 'ag-monitors-ganshorn';
  } else if (lDiv.includes('shipl')) {
    currentDivision = 'shipl';
  }

  const API_BASE = 'http://localhost:3001/api/battery';
  function getToken() { return localStorage.getItem('token') || ''; }
  let entries = [];

  const divisionTabs = document.getElementById('divisionTabs');
  if (divisionTabs) divisionTabs.style.display = 'none';

  async function loadEntries() {
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

  function renderTableHead() {
    const fields = divisions[currentDivision].fields;
    tableHeadRow.innerHTML = '<th>S/N</th>' + fields.map(f => \`<th>\${f.label}</th>\`).join('');
  }

  function renderTable(list) {
    const fields = divisions[currentDivision].fields;
    const total = list.length;
    if (!total) {
      tableBody.innerHTML = \`
        <tr class="empty-row">
          <td colspan="\${fields.length + 1}">
            <span class="empty-icon">&#128203;</span>
            No records yet for \${activeDivision}. Click "Add New" to log the first entry.
          </td>
        </tr>\`;
    } else {
      tableBody.innerHTML = list.map((entry, i) => {
        const cells = fields.map(f => {
          const wrap = f.type === 'textarea' ? ' class="wrap-cell"' : '';
          return \`<td\${wrap}>\${entry.values[f.key] || '—'}</td>\`;
        }).join('');
        return \`<tr><td><span class="sn-badge">\${total - i}</span></td>\${cells}</tr>\`;
      }).join('');
    }
    recordCount.textContent = \`\${total} record\${total === 1 ? '' : 's'}\`;
  }

  /* ═══ Modal ═══ */
  const modalOverlay = document.getElementById('modalOverlay');
  const openAddBtn = document.getElementById('openAddBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const batteryForm = document.getElementById('batteryForm');
  const formGrid = document.getElementById('formGrid');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');

  function buildForm() {
    const div = divisions[currentDivision];
    modalTitle.textContent = \`Add New Battery\`;
    modalSubtitle.textContent = \`Division: \${activeDivision}\`;
    formGrid.innerHTML = div.fields.map(f => {
      const isFull = f.type === 'textarea';
      let control;
      if (f.type === 'select') {
        control = \`<select id="f_\${f.key}">
          <option value="">Select \${f.label.toLowerCase()}</option>
          \${f.options.map(o => \`<option value="\${o}">\${o}</option>\`).join('')}
        </select>\`;
      } else if (f.type === 'textarea') {
        control = \`<textarea id="f_\${f.key}"></textarea>\`;
      } else {
        control = \`<input type="\${f.type}" id="f_\${f.key}"/>\`;
      }
      return \`<div class="form-field\${isFull ? ' full' : ''}">
        <label for="f_\${f.key}">\${f.label}</label>
        \${control}
      </div>\`;
    }).join('');
  }

  function openModal(){ buildForm(); modalOverlay.classList.add('visible'); }
  function closeModal(){ modalOverlay.classList.remove('visible'); batteryForm.reset(); }
  openAddBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  batteryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = batteryForm.querySelector('button[type="submit"]');
    const oldText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const fields = divisions[currentDivision].fields;
    const values = {};
    fields.forEach(f => {
      const el = document.getElementById(\`f_\${f.key}\`);
      if (el) values[f.key] = escapeHtml(el.value.trim());
    });

    const entryPayload = {
      division: activeDivision,
      configKey: currentDivision,
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
    if (h1) h1.textContent = 'Battery Charging - ' + activeDivision;
    
    renderTableHead();
    renderTable(entries);
    loadEntries();
  });
`;

  let resultHtml = html.replace(/<script>[\s\S]*?<\/script>/, '<script>\n' + newScript + '\n</script>');

  // Apply modal CSS fixes
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

  if (modalCssRegex.test(resultHtml)) {
    resultHtml = resultHtml.replace(modalCssRegex, newModalCss);
  }

  // Add form flex CSS
  const formCss = `
.modal form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}`;

  resultHtml = resultHtml.replace(/\.modal-body\{.*?\}/, formCss + '\n.modal-body{padding:28px 32px 28px; flex:1; overflow-y:auto; max-height:none;}');

  resultHtml = resultHtml.replace(/\.modal-footer\{[\s\S]*?\}/, `.modal-footer{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:12px;
  padding:20px 32px;
  flex-shrink:0;
  border-top:1px solid rgba(255,255,255,0.06);
  background:var(--card);
}`);

  fs.writeFileSync('public/frontend/battery-charging.html', resultHtml);
  console.log('Successfully patched battery-charging.html');
} else {
  console.log('Could not extract divisions block');
}
