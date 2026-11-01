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

  const [sections] = await conn.execute(
    "SELECT id, document_id, name, slug, secondary_slug, published_at FROM university_contents WHERE slug = 'lpu-online-faqs'"
  );
  console.log('FAQ section rows:', sections);

  for (const s of sections) {
    const [cmps] = await conn.execute(
      'SELECT * FROM university_contents_cmps WHERE entity_id = ? ORDER BY `order` ASC',
      [s.id]
    );
    console.log(`\n--- CMPS for section ID ${s.id} (pub=${s.published_at}) ---`);
    for (const c of cmps) {
      const tbl = c.component_type.replace('.', '_');
      const [data] = await conn.execute(`SELECT * FROM ${tbl} WHERE id = ?`, [c.cmp_id]);
      console.log(`[Order ${c.order}] Component ${c.component_type}:`, data);
    }
  }

  await conn.end();
}

main().catch(console.error);
