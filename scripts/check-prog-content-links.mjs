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

  const [pRows] = await c.query('SELECT id, document_id, name, slug, published_at FROM programs WHERE slug = ?', ['finance-management']);
  console.log('Finance Management programs in DB:', pRows);

  const [links] = await c.query('SELECT * FROM university_contents_program_lnk WHERE program_id IN (?, ?)', [pRows[0]?.id, pRows[1]?.id]);
  console.log('university_contents_program_lnk for finance-management:', links);

  const [contents] = await c.query('SELECT id, document_id, name, slug, heading, display_name FROM university_contents WHERE id IN (?)', [links.map(l => l.university_content_id)]);
  console.log('university_contents rows:', contents);

  await c.end();
}

main().catch(console.error);
