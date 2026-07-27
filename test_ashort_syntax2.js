

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
  const STATUS_CLASS = {
    'Pending': 'status-pending',
    'Completed': 'status-dispatched',
    'In Progress': 'status-onhold'
  };

  const sharedFields = [
    {key:'date', label:'Date', type:'date'},
    {key:'model', label:'Model', type:'text'},
    {key:'oaNo', label:'OA No', type:'text'},
    {key:'customerNameAddress', label:'Customer Name & Address', type:'textarea'},
    {key:'shortShippedItems', label:'Short Shipped Items', type:'textarea'},
    {key:'qty', label:'Qty', type:'number'},
    {key:'remarks', label:'Remarks', type:'textarea'},
    {key:'dispatchDateOfShortshipped', label:'Dispatch Date of Shortshipped Items', type:'date'},
    {key:'status', label:'Status', type:'select', options:STATUS_OPTIONS}
  ];

  const divisions = {
    'vent-anesthesia': {
      label: 'Ventilator & Anesthesia',
      fields: [...sharedFields]
    },
    'ag-monitors': {
      label: 'Schiller AG & Monitors',
      fields: [...sharedFields]
    },
    'shipl-ganshorn': {
      label: 'SHIPL & Ganshorn',
      fields: [...sharedFields]
    }
  };

  let currentDivision = 'vent-anesthesia';
  let entries = [];
  const API_BASE = 'http://localhost:3001/api/ashort';
  function getToken() { return localStorage.getItem('token') || ''; }

  /* ═══ Division tabs ═══ */
  const divisionTabs = document.getElementById('divisionTabs');
  if (divisionTabs) {
    Object.keys(divisions).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'division-tab' + (key === currentDivision ? ' active' : '');
      btn.textContent = divisions[key].label;
      btn.dataset.division = key;
      btn.addEventListener('click', () => switchDivision(key));
      divisionTabs.appendChild(btn);
    });
  }

  function switchDivision(key) {
    currentDivision = key;
    document.querySelectorAll('.division-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.division === key);
    });
    document.getElementById('searchInput').value = '';
    renderTableHead();
    loadEntries();
  }

  /* ═══ Table rendering ═══ */
  const tableHeadRow = document.getElementById('tableHeadRow');
  const tableBody = document.getElementById('tableBody');
  const recordCount = document.getElementById('recordCount');
  const searchInput = document.getElementById('searchInput');

  function renderTableHead() {
    const fields = divisions[currentDivision].fields;
    tableHeadRow.innerHTML = '<th>S/N</th>' + fields.map(f => `<th>${f.label}</th>`).join('');
  }

  function renderTable(list) {
    const fields = divisions[currentDivision].fields;
    const total = list.length;
    if (!total) {
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="${fields.length + 1}">
            <span class="empty-icon">&#128203;</span>
            No records yet for ${divisions[currentDivision].label}. Click "Add New" to log the first entry.
          </td>
        </tr>`;
    } else {
      tableBody.innerHTML = list.map((entry, i) => {
        const cells = fields.map(f => {
          if (f.key === 'status') {
            const val = entry.values[f.key];
            if (!val) return '<td>—</td>';
            const cls = STATUS_CLASS[val] || 'status-pending';
            return `<td><span class="status-pill ${cls}">${val}</span></td>`;
          }
          const wrap = f.type === 'textarea' ? ' class="wrap-cell"' : '';
          return `<td${wrap}>${entry.values[f.key] || '—'}</td>`;
        }).join('');
        return `<tr><td><span class="sn-badge">${total - i}</span></td>${cells}</tr>`;
      }).join('');
    }
    recordCount.textContent = `${total} record${total === 1 ? '' : 's'}`;
  }

  async function loadEntries() {
    try {
      const res = await fetch(API_BASE + '?configKey=' + encodeURIComponent(currentDivision), {
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

  /* ═══ Modal ═══ */
  const modalOverlay = document.getElementById('modalOverlay');
  const openAddBtn = document.getElementById('openAddBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const ashortForm = document.getElementById('ashortForm') || document.getElementById('outForm'); // Fallback in case ID is different
  const formGrid = document.getElementById('formGrid');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');

  function buildForm() {
    const div = divisions[currentDivision];
    modalTitle.textContent = `Add New Shortshipment Entry`;
    modalSubtitle.textContent = `Division: ${div.label}`;
    formGrid.innerHTML = div.fields.map(f => {
      const isFull = f.type === 'textarea';
      let control;
      if (f.type === 'select') {
        control = `<select id="f_${f.key}">
          <option value="">Select ${f.label.toLowerCase()}</option>
          ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
        </select>`;
      } else if (f.type === 'textarea') {
        control = `<textarea id="f_${f.key}"></textarea>`;
      } else {
        control = `<input type="${f.type}" id="f_${f.key}"/>`;
      }
      return `<div class="form-field${isFull ? ' full' : ''}">
        <label for="f_${f.key}">${f.label}</label>
        ${control}
      </div>`;
    }).join('');
  }

  function openModal(){ buildForm(); modalOverlay.classList.add('visible'); }
  function closeModal(){ modalOverlay.classList.remove('visible'); if(ashortForm) ashortForm.reset(); }
  
  if(openAddBtn) openAddBtn.addEventListener('click', openModal);
  if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (ashortForm) {
    ashortForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = ashortForm.querySelector('button[type="submit"]');
      const oldText = btn.textContent;
      btn.textContent = 'Saving...';
      btn.disabled = true;

      const fields = divisions[currentDivision].fields;
      const values = {};
      fields.forEach(f => {
        const el = document.getElementById(`f_${f.key}`);
        if (el) values[f.key] = escapeHtml(String(el.value).trim());
      });

      const entryPayload = {
        division: divisions[currentDivision].label,
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
  }

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
    if (roleEl) roleEl.textContent = (user.designation || 'Administrator');
    
    renderTableHead();
    loadEntries();
  });

