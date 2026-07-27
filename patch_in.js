const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'frontend', 'in.html');
let content = fs.readFileSync(filePath, 'utf8');

const newScript = `
  // ═══ Table state & API ═══
  let entries = [];
  const tableBody = document.getElementById('tableBody');
  const emptyRow = document.getElementById('emptyRow');
  const recordCount = document.getElementById('recordCount');
  const searchInput = document.getElementById('searchInput');
  const API_BASE = 'http://localhost:3001/api/inward';

  function getToken() { return localStorage.getItem('token') || ''; }

  async function loadEntries() {
    try {
      const res = await fetch(API_BASE, {
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
    const rows = list.map((e, i) => \`
      <tr>
        <td><span class="sn-badge">\${list.length - i}</span></td>
        <td>\${e.fqcEngr || '—'}</td>
        <td>\${e.inwardMonth || '—'}</td>
        <td>\${e.inwardDate || '—'}</td>
        <td>\${e.model || '—'}</td>
        <td>\${e.serialNo || '—'}</td>
        <td>\${e.conf || '—'}</td>
        <td>\${e.version || '—'}</td>
        <td>\${e.supplierWarranty || '—'}</td>
        <td>\${e.o2CellSn || '—'}</td>
        <td>\${e.invoice || '—'}</td>
        <td class="wrap-cell">\${e.problem || '—'}</td>
        <td class="wrap-cell">\${e.remarks || '—'}</td>
      </tr>
    \`).join('');

    tableBody.innerHTML = list.length ? rows : '';
    if (!list.length) tableBody.appendChild(emptyRow);
    recordCount.textContent = \`\${entries.length} record\${entries.length === 1 ? '' : 's'}\`;
  }

  inForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = inForm.querySelector('button[type="submit"]');
    const oldText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const entry = {
      fqcEngr: document.getElementById('fFqcEngr').value.trim(),
      inwardMonth: document.getElementById('fInwardMonth').value.trim(),
      inwardDate: document.getElementById('fInwardDate').value.trim(),
      model: document.getElementById('fModel').value.trim(),
      serialNo: document.getElementById('fSerialNo').value.trim(),
      conf: document.getElementById('fConf').value.trim(),
      version: document.getElementById('fVersion').value.trim(),
      supplierWarranty: document.getElementById('fSupplierWarranty').value.trim(),
      o2CellSn: document.getElementById('fO2CellSn').value.trim(),
      invoice: document.getElementById('fInvoice').value.trim(),
      problem: document.getElementById('fProblem').value.trim(),
      remarks: document.getElementById('fRemarks').value.trim(),
    };

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify(entry)
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
    const filtered = entries.filter(e =>
      Object.values(e).some(v => String(v).toLowerCase().includes(q))
    );
    renderTable(filtered);
  });

  // Update Sidebar User Info
  document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) { window.location.href = 'login.html'; return; }
    const avatar = document.querySelector('.user-avatar');
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.designation || 'Service Team';
    loadEntries();
  });
</script>
</body>
</html>
`;

content = content.replace(/\/\/\s*═══ Table state ═══[\s\S]*<\/html>/, newScript);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched in.html');
