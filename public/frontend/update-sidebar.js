const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\raamp\\OneDrive\\Desktop\\fqc\\public\\frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'ag-batch-info.html');

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Section Title
    content = content.replace(/>Schiller AG Only</g, '>Schiller AG / Ganshorn Only<');
    
    // Check if ag-batch-info is already in there to prevent duplication
    if (!content.includes('ag-batch-info.html')) {
        // Find Medilog License link and inject ag-batch-info after it
        const searchRegex = /(<a href="medilog-license\.html"[^>]*>[\s\S]*?Medilog License.*?<\/a><\/li>)/g;
        content = content.replace(searchRegex, `$1\n            <li class="nav-item"><a href="ag-batch-info.html" data-page="ag-batch-info"><span class="nav-icon">&#128230;</span>Batch Info<span class="nav-badge">AG</span></a></li>`);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated sidebar in ${file}`);
    }
}
console.log('Sidebar updates complete.');
