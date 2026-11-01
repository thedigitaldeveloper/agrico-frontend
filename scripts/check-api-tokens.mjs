import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function main() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const [tables] = await c.query('SHOW TABLES LIKE "strapi_api_token%"');
  console.log('API token tables:', tables);

  for (const t of tables) {
    const tableName = Object.values(t)[0];
    const [rows] = await c.query(`SELECT * FROM ${tableName}`);
    console.log(`Table ${tableName}:`, rows);
  }

  await c.end();
}

main().catch(console.error);
