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
    "SELECT id, slug, secondary_slug FROM university_contents WHERE secondary_slug = 'faqs' OR slug LIKE '%faq%'"
  );

  console.log(`Found ${sections.length} FAQ sections in university_contents.`);

  for (const s of sections) {
    const [cmps] = await conn.execute(
      'SELECT * FROM university_contents_cmps WHERE entity_id = ? ORDER BY `order` ASC',
      [s.id]
    );

    const hasFaqSection = cmps.some((c) => c.component_type.includes('faq'));
    const richTextCmps = cmps.filter((c) => c.component_type.includes('rich'));

    if (hasFaqSection && richTextCmps.length > 0) {
      console.log(`Section ID ${s.id} (${s.slug}) has BOTH faq-section AND rich-text (${richTextCmps.length})`);
    }
  }

  await conn.end();
}

main().catch(console.error);
