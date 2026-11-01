import fs from 'fs';

const schemaPath = 'D:/cms.geduconnect.org/node_modules/@strapi/plugin-users-permissions/server/content-types/permission/schema.json';
console.log(fs.readFileSync(schemaPath, 'utf8'));
