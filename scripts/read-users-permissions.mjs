import fs from 'fs';

const filePath = 'D:/cms.geduconnect.org/node_modules/@strapi/plugin-users-permissions/server/strategies/users-permissions.js';
const code = fs.readFileSync(filePath, 'utf8');
console.log(code);
