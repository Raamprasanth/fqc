const fs = require('fs');
const files = ['public/frontend/acc-in.html', 'public/frontend/aod.html', 'public/frontend/shortshipment.html'];
const insertion = '\n              <li class="nav-item" id="dg400SidebarItem"><a href="dg400.html" data-page="dg400-imp-test-report"><span class="nav-icon">&#128300;</span>DG400 IMP.Test Report</a></li>\n              <li class="nav-item" id="dg400xSidebarItem"><a href="dg400x.html" data-page="dg400x-imp-test-report"><span class="nav-icon">&#128301;</span>DG400X IMP.Test Report</a></li>';

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('id="dg400SidebarItem"')) {
    // Find the aodSidebarItem 
    const aodMatch = content.match(/<li class="nav-item" id="aodSidebarItem">.*?<\/li>/);
    if (aodMatch) {
      const splitIndex = aodMatch.index + aodMatch[0].length;
      content = content.slice(0, splitIndex) + insertion + content.slice(splitIndex);
      fs.writeFileSync(file, content);
      console.log('Patched ' + file);
    } else {
      console.log('Could not find aodSidebarItem in ' + file);
    }
  } else {
    console.log('Already patched ' + file);
  }
});
