const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'frontend', 'user-management.html');
let content = fs.readFileSync(filePath, 'utf8');

// Replace token/user storage from sessionStorage to localStorage
content = content.replace(/sessionStorage\.getItem\('schiller_token'\)/g, "localStorage.getItem('token')");
content = content.replace(/sessionStorage\.getItem\('schiller_user'\)/g, "localStorage.getItem('user')");
content = content.replace(/sessionStorage\.getItem\('schiller_role'\)/g, "(JSON.parse(localStorage.getItem('user') || '{}').role)");
content = content.replace(/sessionStorage\.removeItem\('schiller_token'\)/g, "localStorage.removeItem('token')");
content = content.replace(/sessionStorage\.removeItem\('schiller_user'\)/g, "localStorage.removeItem('user')");
content = content.replace(/sessionStorage\.removeItem\('schiller_role'\)/g, "// localStorage.removeItem('role')");

// Fix endpoints
content = content.replace(/const API_BASE  = '\/api';/g, "const API_BASE  = 'http://localhost:3001/api';");
content = content.replace(/API_BASE \+ '\/auth\/users'/g, "API_BASE + '/users'");

// Replace POST endpoints in submitAddUser
content = content.replace(/endpoint = '\/auth\/admin\/add';/g, "endpoint = '/users'; payload.role = 'admin';");
content = content.replace(/endpoint = '\/auth\/employee\/add';/g, "endpoint = '/users'; payload.role = 'employee';");
content = content.replace(/endpoint = '\/auth\/repair\/add';/g, "endpoint = '/users'; payload.role = 'repair';");
content = content.replace(/endpoint = '\/auth\/service-coordinator\/add';/g, "endpoint = '/users'; payload.role = 'service_coordinator';");
content = content.replace(/endpoint = '\/auth\/fqc\/add';/g, "endpoint = '/users'; payload.role = 'fqc';");
content = content.replace(/endpoint = '\/auth\/pt\/add';/g, "endpoint = '/users'; payload.role = 'pt';");

// Replace PUT / DELETE endpoints (if any)
// The frontend uses endpoints like /auth/user/:id/toggle or /auth/user/:id, let's fix delete
content = content.replace(/API_BASE \+ `\/auth\/user\/\$\{id\}`/g, "API_BASE + `/users/${id}`");
// We can also fix edit if it exists
content = content.replace(/API_BASE \+ `\/auth\/employee\/\$\{id\}\/update`/g, "API_BASE + `/users/${id}`");
content = content.replace(/API_BASE \+ `\/auth\/admin\/\$\{id\}\/update`/g, "API_BASE + `/users/${id}`");

// Map responses from data.data to data.users
content = content.replace(/allUsers = data\.data/g, "allUsers = data.users");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched user-management.html');
