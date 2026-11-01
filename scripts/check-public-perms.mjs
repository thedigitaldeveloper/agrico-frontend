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
    SELECT p.id, p.action, l.role_id, r.name, r.type
    FROM up_permissions p
    LEFT JOIN up_permissions_role_lnk l ON l.permission_id = p.id
    LEFT JOIN up_roles r ON r.id = l.role_id
    WHERE r.type = 'public' OR l.role_id = 2
  `);
  console.log('Public permissions count:', rows.length);
  console.log('Sample public permissions:', rows.slice(0, 15));

  const [allPerms] = await c.query('SELECT COUNT(*) as total FROM up_permissions');
  console.log('Total up_permissions:', allPerms[0].total);

  const [allLinks] = await c.query('SELECT role_id, COUNT(*) as cnt FROM up_permissions_role_lnk GROUP BY role_id');
  console.log('Links by role:', allLinks);

  await c.end();
}

main().catch(console.error);
