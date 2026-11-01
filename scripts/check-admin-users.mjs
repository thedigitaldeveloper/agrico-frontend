import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function main() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect'
  });

  const [adminUsers] = await c.query("SELECT id, firstname, lastname, username, email, is_active, blocked FROM admin_users");
  console.log('Admin Users in Strapi:', adminUsers);

  await c.end();
}

main().catch(console.error);
