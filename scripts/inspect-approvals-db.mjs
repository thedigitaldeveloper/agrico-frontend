import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const [approvals] = await conn.execute('SELECT id, document_id, name, slug FROM approvals');
  console.log('--- Approvals in DB (' + approvals.length + ') ---');
  console.log(approvals);

  const [tables] = await conn.execute("SHOW TABLES LIKE '%approval%'");
  console.log('--- Tables like approval ---', tables);

  const [uniCols] = await conn.execute("SHOW TABLES LIKE 'universities%'");
  console.log('--- Universities tables ---', uniCols);

  const [lpu] = await conn.execute("SELECT id, document_id, name, slug, published_at FROM universities WHERE slug = 'lpu-online' OR slug = 'lovely-professional-university-online'");
  console.log('--- LPU records ---', lpu);

  for (const u of lpu) {
    const [links] = await conn.execute('SELECT * FROM universities_approvals_lnk WHERE university_id = ?', [u.id]);
    console.log(`Approvals links for ID ${u.id} (${u.slug}, pub=${u.published_at}):`, links);
  }

  await conn.end();
}

main().catch(console.error);
