const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'frontend', 'in.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update loadEntries to use activeDivision
const oldLoad = `  async function loadEntries() {
    try {
      const res = await fetch(API_BASE, {`;

const newLoad = `  const activeDivision = localStorage.getItem('activeDivision') || 'Default';
  async function loadEntries() {
    try {
      const res = await fetch(API_BASE + '?division=' + encodeURIComponent(activeDivision), {`;

if (content.includes(oldLoad)) {
  content = content.replace(oldLoad, newLoad);
} else {
  console.log('Could not find oldLoad block in in.html');
}

// 2. Update POST body to include activeDivision
const oldEntry = `    const entry = {
      fqcEngr: document.getElementById('fFqcEngr').value.trim(),`;

const newEntry = `    const entry = {
      division: activeDivision,
      fqcEngr: document.getElementById('fFqcEngr').value.trim(),`;

if (content.includes(oldEntry)) {
  content = content.replace(oldEntry, newEntry);
} else {
  console.log('Could not find oldEntry block in in.html');
}

// 3. Update DOM Context (Header & Sidebar)
const oldDOM = `  document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) { window.location.href = 'login.html'; return; }
    const avatar = document.querySelector('.user-avatar');
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.designation || 'Service Team';`;

const newDOM = `  document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) { window.location.href = 'login.html'; return; }
    const avatar = document.querySelector('.user-avatar');
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = (user.designation || 'Service Team') + ' (' + activeDivision + ')';
    
    const h1 = document.querySelector('.topbar-left h1');
    if (h1) h1.textContent = 'In - ' + activeDivision;
`;

if (content.includes(oldDOM)) {
  content = content.replace(oldDOM, newDOM);
} else {
  console.log('Could not find oldDOM block in in.html');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched in.html context');
