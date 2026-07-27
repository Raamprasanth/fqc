const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'frontend', 'out.html');
let content = fs.readFileSync(filePath, 'utf8');

const regexMap = /let currentDivision = 'vent-anesthesia';[\s\S]*?renderTable\(entriesByDivision\[currentDivision\]\);/g;

const newLogic = `const activeDivision = localStorage.getItem('activeDivision') || 'Ventilator';
  
  // Map standard division strings to our internal config keys
  let currentDivision = 'vent-anesthesia';
  const lDiv = activeDivision.toLowerCase();
  if (lDiv.includes('schiller') || lDiv.includes('monitor')) {
    currentDivision = 'ag-monitors';
  } else if (lDiv.includes('shipl') || lDiv.includes('ganshorn')) {
    currentDivision = 'shipl-ganshorn';
  }

  const API_BASE = 'http://localhost:3001/api/outward';
  function getToken() { return localStorage.getItem('token') || ''; }
  let entries = [];

  // Hide the manual tabs UI since we use activeDivision
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
  const outForm = document.getElementById('outForm');
  const formGrid = document.getElementById('formGrid');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');

  function buildForm() {
    const div = divisions[currentDivision];
    modalTitle.textContent = \`Add New Outward Entry\`;
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
        control = \`<textarea id="f_\${f.key}" placeholder="\${f.placeholder || ''}"></textarea>\`;
      } else {
        control = \`<input type="\${f.type}" id="f_\${f.key}" placeholder="\${f.placeholder || ''}"/>\`;
      }
      return \`<div class="form-field\${isFull ? ' full' : ''}">
        <label for="f_\${f.key}">\${f.label}</label>
        \${control}
      </div>\`;
    }).join('');
  }

  function openModal(){ buildForm(); modalOverlay.classList.add('visible'); }
  function closeModal(){ modalOverlay.classList.remove('visible'); outForm.reset(); }
  openAddBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  outForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = outForm.querySelector('button[type="submit"]');
    const oldText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const fields = divisions[currentDivision].fields;
    const values = {};
    fields.forEach(f => {
      const el = document.getElementById(\`f_\${f.key}\`);
      values[f.key] = escapeHtml(el.value.trim());
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
    if (h1) h1.textContent = 'Out - ' + activeDivision;
    
    renderTableHead();
    loadEntries();
  });`;

if (regexMap.test(content)) {
  content = content.replace(regexMap, newLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched out.html logic');
} else {
  console.log('Could not find match for regexMap in out.html');
}
