import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function main() {
  console.log('🔄 Cleaning duplicate rich-text blocks from FAQ sections in MySQL...');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  // 1. University Contents FAQ sections
  const [uniFaqSections] = await conn.execute(
    "SELECT id, slug, secondary_slug FROM university_contents WHERE secondary_slug = 'faqs' OR slug LIKE '%faqs%' OR slug LIKE '%faq%'"
  );

  let uniCleaned = 0;
  for (const s of uniFaqSections) {
    const [cmps] = await conn.execute(
      'SELECT * FROM university_contents_cmps WHERE entity_id = ? ORDER BY `order` ASC',
      [s.id]
    );

    const hasFaqSection = cmps.some((c) => c.component_type.includes('faq'));
    const richTextCmps = cmps.filter((c) => c.component_type.includes('rich'));

    if (hasFaqSection && richTextCmps.length > 0) {
      for (const r of richTextCmps) {
        await conn.execute('DELETE FROM university_contents_cmps WHERE id = ?', [r.id]);
        uniCleaned++;
      }
    }
  }

  console.log(`✅ Cleaned ${uniCleaned} redundant rich-text blocks from university FAQ sections.`);

  // 2. Program Contents FAQ sections
  const [progFaqSections] = await conn.execute(
    "SELECT id, slug, secondary_slug FROM program_contents WHERE secondary_slug = 'faqs' OR slug LIKE '%faqs%' OR slug LIKE '%faq%'"
  );

  let progCleaned = 0;
  for (const s of progFaqSections) {
    const [cmps] = await conn.execute(
      'SELECT * FROM program_contents_cmps WHERE entity_id = ? ORDER BY `order` ASC',
      [s.id]
    );

    const hasFaqSection = cmps.some((c) => c.component_type.includes('faq'));
    const richTextCmps = cmps.filter((c) => c.component_type.includes('rich'));

    if (hasFaqSection && richTextCmps.length > 0) {
      for (const r of richTextCmps) {
        await conn.execute('DELETE FROM program_contents_cmps WHERE id = ?', [r.id]);
        progCleaned++;
      }
    }
  }

  console.log(`✅ Cleaned ${progCleaned} redundant rich-text blocks from program FAQ sections.`);

  await conn.end();
  console.log('🎉 FAQ duplicate cleanup complete!');
}

main().catch(console.error);
