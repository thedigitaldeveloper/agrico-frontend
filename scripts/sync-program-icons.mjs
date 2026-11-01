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

  // Get courses and their linked icon file_id
  const [mphCourses] = await c.query(
    'SELECT related_id, file_id FROM files_related_mph WHERE related_type = ? AND field = ?',
    ['api::course.course', 'icon']
  );
  const [courses] = await c.query('SELECT id, document_id, slug FROM courses');
  const courseIconMap = new Map();
  for (const cr of courses) {
    const mph = mphCourses.find(m => m.related_id === cr.id);
    if (mph) {
      courseIconMap.set(cr.id, mph.file_id);
    }
  }

  // Get programs
  const [programs] = await c.query('SELECT id, document_id, name, slug FROM programs');
  const [progCourseLinks] = await c.query('SELECT program_id, course_id FROM programs_course_lnk');
  const [mphPrograms] = await c.query(
    'SELECT related_id, file_id FROM files_related_mph WHERE related_type = ? AND field = ?',
    ['api::program.program', 'program_icon']
  );

  console.log(`Total programs: ${programs.length}, with program_icon: ${mphPrograms.length}`);

  let added = 0;
  for (const p of programs) {
    const hasIcon = mphPrograms.some(m => m.related_id === p.id);
    if (!hasIcon) {
      // Find course_id for this program
      const link = progCourseLinks.find(l => l.program_id === p.id);
      const fileId = link ? courseIconMap.get(link.course_id) : 10;
      if (fileId) {
        await c.query(
          'INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, ?, ?, ?)',
          [fileId, p.id, 'api::program.program', 'program_icon', 1]
        );
        added++;
      }
    }
  }

  console.log(`Added ${added} program_icon relations in files_related_mph.`);
  await c.end();
}

main().catch(console.error);
