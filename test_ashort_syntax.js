
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

  /* ═══ Division configs (shared field shape across all divisions) ═══ */
  const STATUS_OPTIONS = ['Pending', 'Completed', 'In Progress'];

  const FIELDS = [
    {key:'date', label:'Date', type:'date'},
    {key:'model', label:'Model', type:'text'},
    {key:'oaNo', label:'OA No', type:'text'},
    {key:'customerNameAddress', label:'Customer Name & Address', type:'textarea'},
    {key:'shortShippedItems', label:'Short Shipped Items', type:'textarea'},
    {key:'qty', label:'Qty', type:'number'},
    {key:'remarks', label:'Remarks', type:'textarea'},
    {key:'dispatchDateOfShortshipped', label:'Dispatch Date of Shortshipped Items', type:'date'},
    {key:'status', label:'Status', type:'select', options:STATUS_OPTIONS},
  ];

  const DIVISIONS = {
    'vent-anesthesia': { label: 'Ventilator & Anesthesia', short: 'Vent & Anesthesia' },
    'ag-monitors':      { label: 'Schiller AG & Monitors',  short: 'AG & Monitors' },
    'shipl-ganshorn':   { label: 'SHIPL & Ganshorn',        short: 'SHIPL & Ganshorn' }
  };
  const DIVISION_ORDER = ['all', 'vent-anesthesia', 'ag-monitors', 'shipl-ganshorn'];

  const API_BASE = 'http://localhost:3001/api/ashort';
  function getToken() { return localStorage.getItem('token') || ''; }

  let entries = [];       // full unfiltered dataset from server (all divisions)
  let currentTab = 'all'; // 'all' | configKey
  let editingId = null;

  /* ═══ Data loading ═══ */
  async function loadEntries() {
    try {
      const query = currentTab === 'all' ? '' : '?configKey=' + currentTab;
      const res = await fetch(API_BASE + query, {
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      if (res.ok) {
        entries = await res.json();
      }
    } catch (err) {
      console.error('Failed to load entries', err);
    }
    renderAll();
  }

  /* ═══ Summary cards ═══ */
  function renderSummary() {
    const summaryRow = document.getElementById('summaryRow');
    const total = entries.length;
    const pending = entries.filter(e => e.values.status === 'Pending').length;
    const inProgress = entries.filter(e => e.values.status === 'In Progress').length;
    const completed = entries.filter(e => e.values.status === 'Completed').length;
    summaryRow.innerHTML = `
      <div class="summary-card">
        <div class="label">Total Entries</div>
        <div class="value">${total}</div>
      </div>
      <div class="summary-card accent">
        <div class="label">Pending</div>
        <div class="value">${pending}</div>
      </div>
      <div class="summary-card">
        <div class="label">In Progress</div>
        <div class="value">${inProgress}</div>
      </div>
      <div class="summary-card">
        <div class="label">Completed</div>
        <div class="value">${completed}</div>
      </div>
    `;
  }

  /* ═══ Division tabs ═══ */
  function renderTabs() {
    const divisionTabs = document.getElementById('divisionTabs');
    divisionTabs.innerHTML = DIVISION_ORDER.map(key => {
      const label = key === 'all' ? 'All Divisions' : DIVISIONS[key].short;
      const count = key === 'all'
        ? entries.length
        : entries.filter(e => e.configKey === key).length;
      const activeCls = key === currentTab ? ' active' : '';
      return `<button class="division-tab${activeCls}" data-tab="${key}">${label}<span class="count">${count}</span></button>`;
    }).join('');
    divisionTabs.querySelectorAll('.division-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTab = btn.dataset.tab;
        renderAll();
      });
    });
  }

  /* ═══ Table head ═══ */
  function renderTableHead() {
    const tableHeadRow = document.getElementById('tableHeadRow');
    tableHeadRow.innerHTML = '<th>S/N</th><th>Division</th>' +
      FIELDS.map(f => `<th>${f.label}</th>`).join('') +
      '<th>Actions</th>';
  }

  function statusClass(status) {
    if (status === 'Pending') return 'status-pending';
    if (status === 'Completed') return 'status-completed';
    if (status === 'In Progress') return 'status-inprogress';
    return '';
  }

  /* ═══ Filtering + table body ═══ */
  function getFilteredEntries() {
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    const statusQ = document.getElementById('statusFilter').value;
    return entries.filter(entry => {
      if (currentTab !== 'all' && entry.configKey !== currentTab) return false;
      if (statusQ && entry.values.status !== statusQ) return false;
      if (q) {
        const hay = Object.values(entry.values).join(' ').toLowerCase() + ' ' + (entry.division || '').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const recordCount = document.getElementById('recordCount');
    const list = getFilteredEntries();
    const total = list.length;

    if (!total) {
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="${FIELDS.length + 3}">
            <span class="empty-icon">&#128203;</span>
            No shortshipment records match the current filters.
          </td>
        </tr>`;
    } else {
      tableBody.innerHTML = list.map((entry, i) => {
        const divLabel = DIVISIONS[entry.configKey] ? DIVISIONS[entry.configKey].short : (entry.division || '—');
        const cells = FIELDS.map(f => {
          const wrap = f.type === 'textarea' ? ' class="wrap-cell"' : '';
          if (f.key === 'status') {
            const st = entry.values[f.key];
            return `<td>${st ? `<span class="status-pill ${statusClass(st)}">${st}</span>` : '—'}</td>`;
          }
          return `<td${wrap}>${entry.values[f.key] || '—'}</td>`;
        }).join('');
        return `<tr data-id="${entry.id || ''}">
          <td><span class="sn-badge">${total - i}</span></td>
          <td><span class="div-pill">${divLabel}</span></td>
          ${cells}
          <td>
            <div class="row-actions">
              <button class="edit" title="Edit" data-id="${entry.id || ''}">&#9998;</button>
              <button class="del" title="Delete" data-id="${entry.id || ''}">&#128465;</button>
            </div>
          </td>
        </tr>`;
      }).join('');
    }
    recordCount.textContent = `${total} record${total === 1 ? '' : 's'}`;

    tableBody.querySelectorAll('.row-actions .edit').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    tableBody.querySelectorAll('.row-actions .del').forEach(btn => {
      btn.addEventListener('click', () => deleteEntry(btn.dataset.id));
    });
  }

  function renderAll() {
    renderSummary();
    renderTabs();
    renderTableHead();
    renderTable();
  }

  /* ═══ Modal ═══ */
  const modalOverlay = document.getElementById('modalOverlay');
  const openAddBtn = document.getElementById('openAddBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const shortForm = document.getElementById('ssForm');
  const formGrid = document.getElementById('formGrid');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const saveBtn = document.getElementById('saveBtn');

  function divisionSelectHtml(selectedKey) {
    const opts = Object.keys(DIVISIONS).map(key =>
      `<option value="${key}" ${key === selectedKey ? 'selected' : ''}>${DIVISIONS[key].label}</option>`
    ).join('');
    return `<div class="form-field full">
      <label for="f_division">Division</label>
      <select id="f_division">${opts}</select>
    </div>`;
  }

  function buildForm(prefill) {
    const values = prefill ? prefill.values : {};
    const selectedDivision = prefill ? prefill.configKey : Object.keys(DIVISIONS)[0];

    modalTitle.textContent = prefill ? 'Edit Shortshipment Entry' : 'Add New Shortshipment Entry';
    modalSubtitle.textContent = prefill ? 'Update the details below and save your changes.' : 'Fill in the details below to log a short shipment.';
    saveBtn.textContent = prefill ? 'Update Entry' : 'Save Entry';

    const fieldsHtml = FIELDS.map(f => {
      const isFull = f.type === 'textarea';
      const val = values[f.key] || '';
      let control;
      if (f.type === 'select') {
        control = `<select id="f_${f.key}">
          <option value="">Select ${f.label.toLowerCase()}</option>
          ${f.options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}
        </select>`;
      } else if (f.type === 'textarea') {
        control = `<textarea id="f_${f.key}">${val}</textarea>`;
      } else {
        control = `<input type="${f.type}" id="f_${f.key}" value="${val}"/>`;
      }
      return `<div class="form-field${isFull ? ' full' : ''}">
        <label for="f_${f.key}">${f.label}</label>
        ${control}
      </div>`;
    }).join('');

    formGrid.innerHTML = divisionSelectHtml(selectedDivision) + fieldsHtml;
  }

  function openAddModal(){ editingId = null; buildForm(null); modalOverlay.classList.add('visible'); }
  function openEditModal(id){
    const entry = entries.find(e => String(e.id) === String(id));
    if (!entry) return;
    editingId = id;
    buildForm(entry);
    modalOverlay.classList.add('visible');
  }
  function closeModal(){ modalOverlay.classList.remove('visible'); shortForm.reset(); editingId = null; }

  openAddBtn.addEventListener('click', openAddModal);
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
    const oldText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    const configKey = document.getElementById('f_division').value;
    const values = {};
    FIELDS.forEach(f => {
      const el = document.getElementById(`f_${f.key}`);
      if (el) values[f.key] = escapeHtml(el.value.trim());
    });

    const entryPayload = {
      division: DIVISIONS[configKey] ? DIVISIONS[configKey].label : configKey,
      configKey,
      values
    };

    try {
      const isEdit = !!editingId;
      const url = isEdit ? `${API_BASE}/${editingId}` : API_BASE;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify(entryPayload)
      });
      if (!res.ok) throw new Error('Failed to save');

      const savedEntry = await res.json();
      if (isEdit) {
        const idx = entries.findIndex(e => String(e.id) === String(editingId));
        if (idx > -1) entries[idx] = savedEntry;
      } else {
        entries.unshift(savedEntry);
      }
      renderAll();
      closeModal();
    } catch (err) {
      alert('Error saving entry: ' + err.message);
    } finally {
      saveBtn.textContent = oldText;
      saveBtn.disabled = false;
    }
  });

  async function deleteEntry(id) {
    if (!id) return;
    if (!confirm('Delete this shortshipment entry? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
      if (!res.ok) throw new Error('Failed to delete');
      entries = entries.filter(e => String(e.id) !== String(id));
      renderAll();
    } catch (err) {
      alert('Error deleting entry: ' + err.message);
    }
  }

  document.getElementById('searchInput').addEventListener('input', renderTable);
  document.getElementById('statusFilter').addEventListener('change', renderTable);

  /* ═══ Init ═══ */
  document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) { window.location.href = 'login.html'; return; }
    const avatar = document.querySelector('.user-avatar');
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.designation || 'Administrator';

    loadEntries();
  });
