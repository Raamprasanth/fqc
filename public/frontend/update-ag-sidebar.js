const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\raamp\\OneDrive\\Desktop\\fqc\\public\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const agSectionRegex = /<div class="sidebar-section-label"[^>]*>Schiller AG.*?<\/div>\s*<ul class="nav-list"[^>]*>[\s\S]*?<\/ul>/g;

    let replacement = `<div class="sidebar-section-label" id="agSidebarSection" style="display:none;">Schiller AG / Ganshorn Only</div>
        <ul class="nav-list" id="agSidebarNav" style="display:none;">
            <li class="nav-item"><a href="medilog-license.html" data-page="medilog-license"><span class="nav-icon">&#128273;</span>Medilog License<span class="nav-badge">AG</span></a></li>
            <li class="nav-item"><a href="ag-batch-info.html" data-page="ag-batch-info"><span class="nav-icon">&#128230;</span>Batch Info<span class="nav-badge">AG</span></a></li>
            <li class="nav-item"><a href="upgrade.html" data-page="upgrade"><span class="nav-icon">&#128260;</span>Upgrade/Downgrade</a></li>
        </ul>`;

    if (file === 'medilog-license.html') {
        replacement = replacement.replace('href="medilog-license.html"', 'href="medilog-license.html" class="active"');
    } else if (file === 'ag-batch-info.html') {
        replacement = replacement.replace('href="ag-batch-info.html"', 'href="ag-batch-info.html" class="active"');
    } else if (file === 'upgrade.html') {
        replacement = replacement.replace('href="upgrade.html"', 'href="upgrade.html" class="active"');
    }

    if (content.match(agSectionRegex)) {
        content = content.replace(agSectionRegex, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated AG sidebar in ${file}`);
    } else {
        console.log(`No AG sidebar found in ${file}`);
    }
}
