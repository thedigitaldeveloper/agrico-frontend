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

  const [tables] = await c.query('SHOW TABLES LIKE "up_%"');
  console.log('UP tables:', tables);

  const [cols] = await c.query('DESCRIBE up_permissions');
  console.log('up_permissions columns:', cols);

  const [sample] = await c.query('SELECT * FROM up_permissions LIMIT 5');
  console.log('up_permissions sample:', sample);

  // Check link table
  for (const t of tables) {
    const tableName = Object.values(t)[0];
    if (tableName.includes('link') || tableName.includes('lnk') || tableName.includes('role')) {
      const [rows] = await c.query(`SELECT * FROM ${tableName} LIMIT 5`);
      console.log(`Table ${tableName}:`, rows);
    }
  }

  await c.end();
}

main().catch(console.error);
