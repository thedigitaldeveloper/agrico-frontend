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

  const [rows] = await c.query(`
    SELECT p.action FROM up_permissions p
    JOIN up_permissions_role_lnk l ON l.permission_id = p.id
    WHERE l.role_id = 2
  `);

  console.log('Public actions in DB (total ' + rows.length + '):');
  const actions = rows.map(r => r.action);
  console.log(actions.filter(a => a.startsWith('api::')));

  await c.end();
}

main().catch(console.error);
