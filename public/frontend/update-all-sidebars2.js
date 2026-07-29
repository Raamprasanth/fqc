const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\raamp\\OneDrive\\Desktop\\fqc\\public\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const htmlToInsert = `
            <li class="nav-item" id="dg400SidebarItem"><a href="dg400.html" data-page="dg400-imp-test-report"><span class="nav-icon">&#128300;</span>DG400 IMP.Test Report</a></li>
            <li class="nav-item" id="dg400xSidebarItem"><a href="dg400x.html" data-page="dg400x-imp-test-report"><span class="nav-icon">&#128301;</span>DG400X IMP.Test Report</a></li>
`;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Insert HTML after AOD if not exists
    if (content.includes('aodSidebarItem') && !content.includes('dg400SidebarItem')) {
        const aodStr = '<li class="nav-item" id="aodSidebarItem"><a href="aod.html" data-page="aod"><span class="nav-icon">&#128203;</span>AOD</a></li>';
        content = content.replace(aodStr, aodStr + htmlToInsert);
        modified = true;
    }

    // 2. Update JS logic
    // We want to replace the whole DOMContentLoaded script block that handles sidebar logic.
    // It usually starts with "const lDiv2 = " and ends around "const fieldReturnAccNav = "
    
    // Instead of regex on the whole block, let's inject/replace specific lines
    if (content.includes('const lDiv2 =')) {
        // Fix accInNav logic
        const oldAccIn = "if (accInNav) accInNav.style.display = (isVentOrAnesthesia || isAgGanshornOrMonitor) ? '' : 'none';";
        const newAccIn = "if (accInNav) accInNav.style.display = (isVentOrAnesthesia || isAgGanshornOrMonitor || isShipl) ? '' : 'none';";
        if (content.includes(oldAccIn)) {
            content = content.replace(oldAccIn, newAccIn);
            modified = true;
        }

        // Add dg400 and dg400x logic after aodNav
        if (!content.includes('dg400Nav')) {
            const aodLogic = "const aodNav = document.getElementById('aodSidebarItem');\n    if (aodNav) aodNav.style.display = isShipl ? '' : 'none';";
            const aodLogicRegex = /const aodNav = document\.getElementById\('aodSidebarItem'\);\s*if \(aodNav\) aodNav\.style\.display = isShipl \? '' : 'none';/;
            
            const dgLogic = `const aodNav = document.getElementById('aodSidebarItem');
            if (aodNav) aodNav.style.display = isShipl ? '' : 'none';

            const dg400Nav = document.getElementById('dg400SidebarItem');
            if (dg400Nav) dg400Nav.style.display = isShipl ? '' : 'none';

            const dg400xNav = document.getElementById('dg400xSidebarItem');
            if (dg400xNav) dg400xNav.style.display = isShipl ? '' : 'none';`;

            content = content.replace(aodLogicRegex, dgLogic);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated dg400/acc-in sidebar in ${file}`);
    }
}
console.log('Complete!');
