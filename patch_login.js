const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'frontend', 'login.html');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\/\/ Employee flow[\s\S]*?overlay\.classList\.add\('visible'\);\n\s*}/;

const newLogic = `// Employee flow
          const divs = data.user.divisions || [];
          if (divs.length === 0) {
            // No divisions assigned, just go in with Default
            localStorage.setItem('activeDivision', 'Default');
            window.location.href = 'emp.html';
          } else {
            // ALWAYS show popup if they have at least 1 division assigned
            const overlay = document.getElementById('divModalOverlay');
            const container = document.getElementById('divisionButtons');
            container.innerHTML = '';
            divs.forEach(divName => {
              const btn = document.createElement('button');
              btn.className = 'div-btn';
              btn.textContent = divName;
              btn.onclick = () => {
                localStorage.setItem('activeDivision', divName);
                window.location.href = 'emp.html';
              };
              container.appendChild(btn);
            });
            overlay.classList.add('visible');
          }`;

if (regex.test(content)) {
  content = content.replace(regex, newLogic);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched login logic to always show popup');
} else {
  console.log('Failed to find logic block');
}
