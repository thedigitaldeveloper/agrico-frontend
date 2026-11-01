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

  const [cols1] = await c.query('DESCRIBE strapi_api_tokens');
  console.log('strapi_api_tokens:', cols1);

  const [cols2] = await c.query('DESCRIBE strapi_api_token_permissions');
  console.log('strapi_api_token_permissions:', cols2);

  const [tokens] = await c.query('SELECT * FROM strapi_api_tokens');
  console.log('All tokens in DB:', tokens);

  await c.end();
}

main().catch(console.error);
