import fs from 'fs';
import path from 'path';

function findSchemas(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      findSchemas(full);
    } else if (e.name === 'schema.json' || e.name.endsWith('.js') && e.name.includes('permission')) {
      console.log('Found:', full);
    }
  }
}

findSchemas('D:/cms.geduconnect.org/node_modules/@strapi/plugin-users-permissions/server');
