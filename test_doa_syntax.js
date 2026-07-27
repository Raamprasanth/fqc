

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
        {key:'defectUnitRecdDate', label:'Defect Unit Recd Date', type:'date'},
        {key:'status', label:'Status', type:'select', options:STATUS_OPTIONS},
        {key:'product', label:'Product', type:'text'},
        {key:'defectUnitSn', label:'Defect Unit S/N', type:'text'},
        {key:'configuration', label:'Configuration', type:'text'},
        {key:'customerDetails', label:'Customer Details', type:'textarea'},
        {key:'region', label:'Region', type:'text'},
        {key:'reportedProblemDetails', label:'Reported Problem Details', type:'textarea'},
        {key:'observedByFqc', label:'Observed by FQC', type:'textarea'},
        {key:'rootCause', label:'Root Cause', type:'textarea'},
        {key:'actionTaken', label:'Action Taken', type:'textarea'},
        {key:'replUnitSendDate', label:'Repl.Unit.Send.Date', type:'date'},
        {key:'replUnitSn', label:'Repl.Unit.S/N', type:'text'},
        {key:'replacedUnitModel', label:'Replaced Unit Model', type:'text'},
      ]
    },
    'shipl': {
      label: 'SHIPL',
      fields: [
        {key:'defRecdDate', label:'Def.Recd.Date', type:'date'},
        {key:'status', label:'Status', type:'select', options:STATUS_OPTIONS},
        {key:'model', label:'Model', type:'text'},
        {key:'defectiveUnitSlNo', label:'Defective Unit Sl.No', type:'text'},
        {key:'config', label:'Config', type:'text'},
        {key:'customerNameAddress', label:'Customer Name, Address', type:'textarea'},
        {key:'region', label:'Region', type:'text'},
        {key:'reportedFieldProblem', label:'Reported Field Problem', type:'textarea'},
        {key:'observedProblem', label:'Observed Problem', type:'textarea'},
        {key:'receivedPhysicalCondition', label:'Received Physical Condition', type:'textarea'},
        {key:'causeOfProblem', label:'Cause of the Problem', type:'textarea'},
        {key:'actionTaken', label:'Action Taken', type:'textarea'},
        {key:'unitReturnDateFromProduction', label:'Unit Return Date From Production / Service', type:'date'},
        {key:'replacementDespDate', label:'Replacement Desp.Date', type:'date'},
        {key:'replacementUnitSlNo', label:'Replacement Unit.Sl/No', type:'text'},
      ]
    },
    'ag-monitors-ganshorn': {
      label: 'Schiller AG, Monitors & Ganshorn',
      fields: [
        {key:'defectUnitRecdDate', label:'Defect Unit Recd Date', type:'date'},
        {key:'status', label:'Status', type:'select', options:STATUS_OPTIONS},
        {key:'product', label:'Product', type:'text'},
        {key:'defectUnitSlNo', label:'Defect Unit Sl.No', type:'text'},
        {key:'conf', label:'Conf', type:'text'},
        {key:'customerNameAddress', label:'Customer Name and Address', type:'textarea'},
        {key:'region', label:'Region', type:'text'},
        {key:'reportedProblemDetails', label:'Reported Problem Details', type:'textarea'},
        {key:'observedByFqc', label:'Observed by FQC', type:'textarea'},
        {key:'rootCause', label:'Root Cause', type:'textarea'},
        {key:'actionTaken', label:'Action Taken', type:'textarea'},
        {key:'replUnitSendDate', label:'Repl.Unit.Send.Date', type:'date'},
        {key:'replUnitSlNo', label:'Repl.Unit.Sl.No', type:'text'},
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
  if (lDiv.includes('schiller') || lDiv.includes('monitor') || lDiv.includes('ganshorn')) {
    currentDivision = 'ag-monitors-ganshorn';
  } else if (lDiv.includes('shipl')) {
    currentDivision = 'shipl';
  }

  const API_BASE = 'http://localhost:3001/api/doa';
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
            No records yet for ${activeDivision}. Click "Add New" to log the first entry.
          </td>
        </tr>`;
    } else {
      tableBody.innerHTML = list.map((entry, i) => {
        const cells = fields.map(f => {
          const wrap = f.type === 'textarea' ? ' class="wrap-cell"' : '';
          return `<td${wrap}>${entry.values[f.key] || '—'}</td>`;
        }).join('');
        return `<tr><td><span class="sn-badge">${total - i}</span></td>${cells}</tr>`;
      }).join('');
    }
    recordCount.textContent = `${total} record${total === 1 ? '' : 's'}`;
  }

  /* ═══ Modal ═══ */
  const modalOverlay = document.getElementById('modalOverlay');
  const openAddBtn = document.getElementById('openAddBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const doaForm = document.getElementById('doawfForm');
  const formGrid = document.getElementById('formGrid');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');

  function buildForm() {
    const div = divisions[currentDivision];
    modalTitle.textContent = `Add New DOA+WF`;
    modalSubtitle.textContent = `Division: ${activeDivision}`;
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
  function closeModal(){ modalOverlay.classList.remove('visible'); doaForm.reset(); }
  openAddBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  doaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = doaForm.querySelector('button[type="submit"]');
    const oldText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const fields = divisions[currentDivision].fields;
    const values = {};
    fields.forEach(f => {
      const el = document.getElementById(`f_${f.key}`);
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
    if (h1) h1.textContent = 'DOA+WF - ' + activeDivision;
    
    renderTableHead();
    renderTable(entries);
    loadEntries();
  });

