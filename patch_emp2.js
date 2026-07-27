const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'frontend', 'emp.html');
let content = fs.readFileSync(filePath, 'utf8');

// Update script block
const oldScript = `// Fetch Stats
    try {
      const res = await fetch('http://localhost:3001/api/emp/stats', {`;

const newScript = `// Division context
    const activeDivision = localStorage.getItem('activeDivision') || 'Default';
    if (roleEl) roleEl.textContent = (user.designation || 'Service Team') + ' (' + activeDivision + ')';
    const h1 = document.querySelector('.topbar-left h1');
    if (h1) h1.textContent = 'Dashboard - ' + activeDivision;

    // Fetch Stats
    try {
      const res = await fetch('http://localhost:3001/api/emp/stats?division=' + encodeURIComponent(activeDivision), {`;

if (content.includes('fetch(\'http://localhost:3001/api/emp/stats\'')) {
  content = content.replace(oldScript, newScript);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched emp.html script');
} else {
  console.log('Could not find fetch call in emp.html');
}
