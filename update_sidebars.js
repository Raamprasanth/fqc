const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/frontend');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const NEW_LINK = `            <li class="nav-item" id="batchInfoSidebarItem"><a href="batch-info.html" data-page="batch-info"><span class="nav-icon">&#128230;</span>Batch Info</a></li>\n        </ul>`;

for (let file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let changed = false;

  // 1. Add link to sidebar if not present
  if (!content.includes('batch-info.html')) {
    // Look for the end of the Operations list
    const searchRegex = /<li class="nav-item"(?: id="[^"]*")?><a href="fua\.html"[^>]*>.*?<\/a><\/li>\s*<\/ul>/s;
    if (searchRegex.test(content)) {
      content = content.replace(searchRegex, (match) => {
        return match.replace(/<\/ul>/, `  <li class="nav-item" id="batchInfoSidebarItem"><a href="batch-info.html" data-page="batch-info"><span class="nav-icon">&#128230;</span>Batch Info</a></li>\n        </ul>`);
      });
      changed = true;
    }
  } else if (file !== 'batch-info.html') {
    // Fix existing batch-info link if it doesn't have the ID
    if (!content.includes('id="batchInfoSidebarItem"')) {
      content = content.replace(/<li class="nav-item"><a href="batch-info\.html"/g, '<li class="nav-item" id="batchInfoSidebarItem"><a href="batch-info.html"');
      changed = true;
    }
  }

  // 2. Add JS logic
  const lDivVarMatch = content.match(/const (lDiv2|lDiv) = /);
  if (lDivVarMatch) {
    const lDivVar = lDivVarMatch[1];
    if (!content.includes('batchInfoSidebarItem')) {
      const jsSearch = /if \(fieldReturnAccNav\) \{[^}]+\}/s;
      if (jsSearch.test(content)) {
        content = content.replace(jsSearch, (match) => {
          return match + `\n            const batchInfoNav = document.getElementById('batchInfoSidebarItem');\n            if (batchInfoNav) {\n                batchInfoNav.style.display = (${lDivVar}.includes('vent') || ${lDivVar}.includes('anesthesia') || ${lDivVar}.includes('shipl')) ? '' : 'none';\n            }`;
        });
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('Updated ' + file);
  }
}
