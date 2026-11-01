import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Strapi = require('D:/cms.geduconnect.org/node_modules/@strapi/strapi');

async function main() {
  const app = await Strapi({ appDir: 'D:/cms.geduconnect.org', distDir: 'D:/cms.geduconnect.org/dist' }).load();
  
  const tokenService = app.services['admin::api-token'];
  console.log('tokenService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(tokenService)));
  console.log('tokenService keys:', Object.keys(tokenService));
  
  // Let's create a raw token and hash it
  const rawKey = 'geduconnect_' + require('crypto').randomBytes(32).toString('hex');
  const hashedKey = tokenService.hash(rawKey);
  console.log('Raw key:', rawKey);
  console.log('Hashed key:', hashedKey);

  // Insert into database directly
  const c = await require('D:/geduconnectbknd/node_modules/mysql2/promise').createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const docId = require('crypto').randomBytes(12).toString('hex');
  await c.query(`
    INSERT INTO strapi_api_tokens (document_id, name, description, kind, type, access_key, created_at, updated_at, published_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
  `, [docId, 'SSR Master Token', 'Token for Next.js SSR', 'content-api', 'full-access', hashedKey]);

  console.log('\nSUCCESS! Token created in DB!');
  console.log('RAW TOKEN FOR .env.local:');
  console.log(rawKey);

  await c.end();
  await app.destroy();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
