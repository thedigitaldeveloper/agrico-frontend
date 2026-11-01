import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function main() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const [rows] = await c.query('SELECT * FROM up_permissions WHERE action LIKE "%stream%"');
  console.log('Stream permissions in DB:', rows);

  const [linkRows] = await c.query(`
    SELECT l.*, r.name, r.type 
    FROM up_permissions_role_lnk l 
    JOIN up_roles r ON r.id = l.role_id 
    WHERE l.permission_id IN (${rows.map(r => r.id).join(',')})
  `);
  console.log('Link rows for stream:', linkRows);

  await c.end();
}

main().catch(console.error);
