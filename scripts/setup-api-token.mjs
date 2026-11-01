import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import fs from 'fs';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

// Read exact API_TOKEN_SALT from Strapi .env
const strapiEnv = fs.readFileSync('D:/cms.geduconnect.org/.env', 'utf8');
let salt = '';
for (const line of strapiEnv.split('\n')) {
  if (line.startsWith('API_TOKEN_SALT=')) {
    salt = line.split('=')[1].trim();
  }
}
console.log('Using API_TOKEN_SALT:', salt);

function hashToken(key, s) {
  return crypto.createHmac('sha512', s).update(key).digest('hex');
}

async function main() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const rawToken = crypto.randomBytes(64).toString('hex');
  const hashed = hashToken(rawToken, salt);

  console.log('Raw token generated:', rawToken);
  console.log('Hashed token:', hashed);

  // Update token ID 2 (Full Access) in DB
  await c.query(`
    UPDATE strapi_api_tokens 
    SET access_key = ?, updated_at = NOW() 
    WHERE id = 2 OR type = 'full-access'
  `, [hashed]);

  console.log('Updated strapi_api_tokens in database!');
  await c.end();

  // Test fetch against Strapi API
  try {
    const res = await fetch('http://127.0.0.1:1337/api/streams', {
      headers: {
        Authorization: `Bearer ${rawToken}`,
      },
    });
    console.log('Fetch /api/streams HTTP status:', res.status);
    const json = await res.json();
    console.log('Response sample:', json.data ? `${json.data.length} streams returned!` : json);

    if (res.status === 200) {
      console.log('\n SUCCESS! Valid API token verified.');
      
      // Update .env.local
      let localEnv = fs.readFileSync('d:/geduconnect/.env.local', 'utf8');
      localEnv = localEnv.replace(/CMS_API_TOKEN=.*/, `CMS_API_TOKEN=${rawToken}`);
      fs.writeFileSync('d:/geduconnect/.env.local', localEnv);
      console.log('Updated d:/geduconnect/.env.local with CMS_API_TOKEN!');
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

main().catch(console.error);
