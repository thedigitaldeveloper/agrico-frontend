import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect'
  });

  const [tables] = await conn.query("SHOW TABLES LIKE '%legal%'");
  console.log('Tables:', tables);

  const [rows] = await conn.query("SELECT id, name, slug, description FROM legals");
  console.log('Legals Rows:', rows);

  await conn.end();
}

main().catch(console.error);
