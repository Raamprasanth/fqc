const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'frontend', 'division.html');
let content = fs.readFileSync(filePath, 'utf8');

// Replace sessionStorage with localStorage for tokens
content = content.replace(/sessionStorage\.getItem\('schiller_token'\)/g, "localStorage.getItem('token')");
content = content.replace(/sessionStorage\.getItem\('schiller_role'\)/g, "(JSON.parse(localStorage.getItem('user') || '{}').role)");
content = content.replace(/sessionStorage\.getItem\('schiller_user'\)/g, "localStorage.getItem('user')");

// Fix API_BASE
content = content.replace(/const API_BASE = '\/api\/divisions';/g, "const API_BASE = 'http://localhost:3001/api/divisions';");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched division.html');
