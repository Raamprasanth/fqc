const fs = require('fs');

let html = fs.readFileSync('public/frontend/shortshipment.html', 'utf8');

// 1. Replace the entire <script> block like I did for out.html
const scriptRegex = /<script>[\s\S]*?<\/script>/;
const newScript = `<script>
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

  const divisions = {
    'vent-anesthesia': {
      label: 'Ventilator & Anesthesia',
      fields: [
        {key:'date', label:'Date', type:'date'},
        {key:'model', label:'Model', type:'text'},
        {key:'oaNo', label:'OA No', type:'text'},
        {key:'customerNameAddress', label:'Customer Name & Address', type:'textarea'},
        {key:'shortShippedItems', label:'Short Shipped Items', type:'textarea'},
        {key:'qty', label:'Qty', type:'number'},
        {key:'remarks', label:'Remarks', type:'textarea'},
        {key:'dispatchDateOfShortshipped', label:'Dispatch Date of Shortshipped Items', type:'date'},
        {key:'status', label:'Status', type:'select', options:STATUS_OPTIONS},
      ]
    },
    'ag-monitors': {
      label: 'Schiller AG & Monitors',
      fields: [
        {key:'date', label:'Date', type:'date'},
        {key:'model', label:'Model', type:'text'},
        {key:'oaNo', label:'OA No', type:'text'},
        {key:'customerNameAddress', label:'Customer Name & Address', type:'textarea'},
        {key:'shortShippedItems', label:'Short Shipped Items', type:'textarea'},
        {key:'qty', label:'Qty', type:'number'},
        {key:'remarks', label:'Remarks', type:'textarea'},
        {key:'dispatchDateOfShortshipped', label:'Dispatch Date of Shortshipped Items', type:'date'},
        {key:'status', label:'Status', type:'select', options:STATUS_OPTIONS},
      ]
    },
    'shipl-ganshorn': {
      label: 'SHIPL & Ganshorn',
      fields: [
        {key:'date', label:'Date', type:'date'},
        {key:'model', label:'Model', type:'text'},
        {key:'oaNo', label:'OA No', type:'text'},
        {key:'customerNameAddress', label:'Customer Name & Address', type:'textarea'},
        {key:'shortShippedItems', label:'Short Shipped Items', type:'textarea'},
        {key:'qty', label:'Qty', type:'number'},
        {key:'remarks', label:'Remarks', type:'textarea'},
        {key:'dispatchDateOfShortshipped', label:'Dispatch Date of Shortshipped Items', type:'date'},
        {key:'status', label:'Status', type:'select', options:STATUS_OPTIONS},
      ]
    }
  };

  const activeDivision = localStorage.getItem('activeDivision') || 'Ventilator';
  
  const tableHeadRow = document.getElementById('tableHeadRow');
  const tableBody = document.getElementById('tableBody');
  const recordCount = document.getElementById('recordCount');
  const searchInput = document.getElementById('searchInput');

  let currentDivision = 'vent-anesthesia';
  const lDiv = activeDivision.toLowerCase();
  if (lDiv.includes('schiller') || lDiv.includes('monitor')) {
    currentDivision = 'ag-monitors';
  } else if (lDiv.includes('shipl') || lDiv.includes('ganshorn')) {
    currentDivision = 'shipl-ganshorn';
  }

  const API_BASE = 'http://localhost:3001/api/shortshipment';
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
  const shortForm = document.getElementById('shortForm');
  const formGrid = document.getElementById('formGrid');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');

  function buildForm() {
    const div = divisions[currentDivision];
    modalTitle.textContent = \`Add New Shortshipment\`;
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
  function closeModal(){ modalOverlay.classList.remove('visible'); shortForm.reset(); }
  openAddBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  shortForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = shortForm.querySelector('button[type="submit"]');
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
    if (h1) h1.textContent = 'Shortshipment - ' + activeDivision;
    
    renderTableHead();
    loadEntries();
  });
</script>`;

html = html.replace(scriptRegex, newScript);

// 2. Fix the modal CSS to match out.html (full screen with sidebar visible)
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

if (modalCssRegex.test(html)) {
  html = html.replace(modalCssRegex, newModalCss);
} else {
  console.log("Could not find modal CSS in shortshipment.html");
}

// 3. Fix form CSS (add display:flex, flex-direction:column, flex:1, min-height:0)
const formCss = `
.modal form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}`;

html = html.replace(/\.modal-body\{.*?\}/, formCss + '\n.modal-body{padding:28px 32px 28px; flex:1; overflow-y:auto; max-height:none;}');

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

fs.writeFileSync('public/frontend/shortshipment.html', html);
console.log('Patched shortshipment.html');
