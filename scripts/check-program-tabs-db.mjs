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

  const [progs] = await c.query('SELECT DISTINCT slug, name FROM programs');
  console.log('Total distinct program slugs in DB:', progs.length);

  const [progWithLnk] = await c.query('SELECT DISTINCT p.slug FROM programs p JOIN university_contents_program_lnk l ON l.program_id = p.id');
  console.log('Programs with content links in DB:', progWithLnk.length);

  const [sections] = await c.query(`
    SELECT p.slug, COUNT(DISTINCT uc.slug) as tab_count, GROUP_CONCAT(DISTINCT uc.slug) as tabs
    FROM programs p
    LEFT JOIN university_contents_program_lnk l ON l.program_id = p.id
    LEFT JOIN university_contents uc ON uc.id = l.university_content_id
    GROUP BY p.slug
  `);

  console.log('\nSample programs tab breakdown:');
  for (const s of sections.slice(0, 10)) {
    console.log(`- ${s.slug}: ${s.tab_count} tabs (${s.tabs})`);
  }

  await c.end();
}

main().catch(console.error);
