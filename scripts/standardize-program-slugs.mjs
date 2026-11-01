import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect'
  });

  const [rows] = await conn.query(`
    SELECT p.id, p.document_id, p.name, p.slug, p.full_name, c.name as course_name, c.slug as course_slug
    FROM programs p
    LEFT JOIN programs_course_lnk pcl ON pcl.program_id = p.id
    LEFT JOIN courses c ON c.id = pcl.course_id
    ORDER BY c.id, p.id
  `);

  console.log(`Total program records in DB: ${rows.length}`);

  let updated = 0;
  for (const row of rows) {
    if (!row.course_slug) continue;

    // If slug doesn't start with course_slug (e.g. 'finance-management' for course 'online-mba')
    if (!row.slug.startsWith(row.course_slug)) {
      const newSlug = `${row.course_slug}-${row.slug}`;
      await conn.query(`UPDATE programs SET slug = ? WHERE id = ?`, [newSlug, row.id]);
      console.log(`Updated ID ${row.id} (${row.name}): '${row.slug}' -> '${newSlug}'`);
      updated++;
    }
  }

  console.log(`\nSuccessfully standardized ${updated} program slugs!`);
  await conn.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
