const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\raamp\\OneDrive\\Desktop\\fqc\\public\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const standardOperationsHTML = `<div class="sidebar-section-label">Operations</div>
        <ul class="nav-list">
            <li class="nav-item" id="inSidebarItem"><a href="in.html" data-page="in"><span class="nav-icon">&#128229;</span>In</a></li>
            <li class="nav-item" id="outSidebarItem"><a href="out.html" data-page="out"><span class="nav-icon">&#128228;</span>Out</a></li>
            <li class="nav-item" id="shortshipmentSidebarItem"><a href="shortshipment.html" data-page="shortshipment"><span class="nav-icon">&#128230;</span>Shortshipment</a></li>
            <li class="nav-item" id="shipOutSidebarItem"><a href="shipout.html" data-page="shipout"><span class="nav-icon">&#128230;</span>SHIP-OUT</a></li>
            <li class="nav-item" id="dodSidebarItem"><a href="dod.html" data-page="dod"><span class="nav-icon">&#128666;</span>DOD</a></li>
            <li class="nav-item" id="doaWfSidebarItem"><a href="doa-wf.html" data-page="doa-wf"><span class="nav-icon">&#9888;&#65039;</span>DOA+WF</a></li>
            <li class="nav-item" id="accInSidebarItem"><a href="acc-in.html" data-page="acc-in"><span class="nav-icon">&#128229;</span>ACC-IN</a></li>
            <li class="nav-item" id="accOutSidebarItem"><a href="acc-out.html" data-page="acc-out"><span class="nav-icon">&#128203;</span>ACC-OUT</a></li>
            <li class="nav-item" id="batteryChargingSidebarItem"><a href="battery-charging.html" data-page="battery-charging"><span class="nav-icon">&#128267;</span>Battery Charging</a></li>
            <li class="nav-item" id="subOutSidebarItem"><a href="subout.html" data-page="sub-out"><span class="nav-icon">&#128230;</span>SUB-OUT</a></li>
            <li class="nav-item" id="aodSidebarItem"><a href="aod.html" data-page="aod"><span class="nav-icon">&#128203;</span>AOD</a></li>
            <li class="nav-item" id="dg400SidebarItem"><a href="dg400.html" data-page="dg400-imp-test-report"><span class="nav-icon">&#128300;</span>DG400 IMP.Test Report</a></li>
            <li class="nav-item" id="dg400xSidebarItem"><a href="dg400x.html" data-page="dg400x-imp-test-report"><span class="nav-icon">&#128301;</span>DG400X IMP.Test Report</a></li>
            <li class="nav-item" id="changeDetailsSidebarItem"><a href="change-details.html" data-page="change-details"><span class="nav-icon">&#128260;</span>Change Details</a></li>
            <li class="nav-item" id="fieldReturnSidebarItem"><a href="fuu.html" data-page="field-return-units"><span class="nav-icon">&#128260;</span>Field Return Units</a></li>
            <li class="nav-item" id="fieldReturnAccSidebarItem"><a href="fua.html" data-page="field-return-accessories"><span class="nav-icon">&#128260;</span>Field Return Accessories</a></li>
            <li class="nav-item" id="batchInfoSidebarItem"><a href="batch-info.html" data-page="batch-info"><span class="nav-icon">&#128230;</span>Batch Info</a></li>
        </ul>`;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Replace the entire Operations section HTML
    const opsRegex = /<div class="sidebar-section-label">Operations<\/div>\s*<ul class="nav-list"[^>]*>[\s\S]*?<\/ul>/g;
    
    // Copy template so we can inject "class="active"" for the current page
    let specificHTML = standardOperationsHTML;

    // We try to match href="filename" to inject class="active"
    // e.g. <a href="in.html" ...
    // Note: FUA and FUU map to field-return-accessories.html and field-return-units.html logically, but the URL is fua.html/fuu.html.
    let baseName = file;
    // Replace just for the exact file link
    specificHTML = specificHTML.replace(`href="${baseName}"`, `href="${baseName}" class="active"`);

    if (content.match(opsRegex)) {
        content = content.replace(opsRegex, specificHTML);
        modified = true;
    }

    // 2. Ensure JS logic for batchInfoSidebarItem exists
    // The logic is:
    // const batchInfoNav = document.getElementById('batchInfoSidebarItem');
    // if (batchInfoNav) batchInfoNav.style.display = (lDiv2.includes('vent') || lDiv2.includes('anesthesia') || lDiv2.includes('shipl')) ? '' : 'none';

    // We can inject it right after the fieldReturnAccNav block.
    // fieldReturnAccNav = document.getElementById('fieldReturnAccSidebarItem');
    // if (fieldReturnAccNav) ...
    // Note: Some files have slightly different whitespace. We will use a regex.
    const fieldAccRegex = /(const fieldReturnAccNav = document\.getElementById\('fieldReturnAccSidebarItem'\);\s*if\s*\(fieldReturnAccNav\).*?;(\s*\}?))/;
    
    if (content.match(fieldAccRegex) && !content.includes("getElementById('batchInfoSidebarItem')")) {
        const batchInfoLogic = `\n            const batchInfoNav = document.getElementById('batchInfoSidebarItem');
            if (batchInfoNav) batchInfoNav.style.display = (lDiv2.includes('vent') || lDiv2.includes('anesthesia') || lDiv2.includes('shipl')) ? '' : 'none';\n`;
        
        content = content.replace(fieldAccRegex, `$1${batchInfoLogic}`);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated Operations sidebar in ${file}`);
    }
}
