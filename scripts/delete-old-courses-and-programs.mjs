import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function run() {
  console.log('🧹 Starting Cleanup of Legacy / Old Courses and Programs...\n');

  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const oldCourseSlugs = ['b-tech', 'm-tech', 'mba', 'bba', 'b-sc', 'm-sc', 'bca', 'mca'];

  // 1. Identify old course IDs
  const [oldCourses] = await conn.execute(
    `SELECT id, name, slug FROM courses WHERE slug IN (${oldCourseSlugs.map(() => '?').join(',')})`,
    oldCourseSlugs
  );
  const oldCourseIds = oldCourses.map((c) => c.id);
  console.log(`Found ${oldCourses.length} old course entries to delete:`, oldCourses.map((c) => `${c.name} (${c.id})`));

  // 2. Identify programs attached to old courses
  let oldCourseProgIds = [];
  if (oldCourseIds.length > 0) {
    const [progs] = await conn.execute(
      `SELECT DISTINCT program_id FROM programs_course_lnk WHERE course_id IN (${oldCourseIds.map(() => '?').join(',')})`,
      oldCourseIds
    );
    oldCourseProgIds = progs.map((p) => p.program_id);
    console.log(`Found ${oldCourseProgIds.length} programs attached to old courses.`);
  }

  // 3. Identify unlinked / dummy programs (slugs starting with upes- or not in our master programs / 92 online-mba specializations)
  // Master online courses
  const masterCourseSlugs = [
    'online-mba',
    'online-bba',
    'online-mca',
    'online-bca',
    'online-b-com',
    'online-m-com',
    'online-ma',
    'online-ba',
    'online-m-sc',
    'online-b-sc',
    'online-executive-mba',
    'online-llm',
  ];

  // Fetch valid program IDs under master courses
  const [validProgs] = await conn.execute(
    `SELECT DISTINCT p.id FROM programs p 
     JOIN programs_course_lnk pcl ON p.id = pcl.program_id 
     JOIN courses c ON pcl.course_id = c.id 
     WHERE c.slug IN (${masterCourseSlugs.map(() => '?').join(',')})`,
    masterCourseSlugs
  );
  const validProgIds = new Set(validProgs.map((p) => p.id));
  console.log(`✅ Keeping ${validProgIds.size} valid programs under Master Online Courses.`);

  // All other programs are considered old / obsolete
  const [allProgs] = await conn.execute('SELECT id, name, slug FROM programs');
  const progsToDelete = allProgs.filter((p) => !validProgIds.has(p.id));
  const progIdsToDelete = progsToDelete.map((p) => p.id);

  console.log(`🗑️ Total programs to delete: ${progIdsToDelete.length}`);

  // 4. Delete Programs from Junction Tables and Programs table
  if (progIdsToDelete.length > 0) {
    const inProgPlaceholders = progIdsToDelete.map(() => '?').join(',');

    const progJunctions = [
      'programs_cmps',
      'programs_course_lnk',
      'programs_stream_lnk',
      'programs_universities_lnk',
      'programs_course_mode_lnk',
      'programs_course_type_lnk',
      'programs_duration_type_lnk',
      'programs_eligibilities_lnk',
      'programs_exams_lnk',
      'programs_tag_lnk',
      'components_college_program_fees_program_lnk',
      'enquiries_program_lnk',
      'university_contents_program_lnk',
    ];

    for (const jTable of progJunctions) {
      try {
        const [res] = await conn.execute(`DELETE FROM ${jTable} WHERE program_id IN (${inProgPlaceholders})`, progIdsToDelete);
        console.log(`  ✓ Cleaned ${res.affectedRows} rows from ${jTable}`);
      } catch (e) {
        // Table might not have program_id or might be named slightly differently
      }
    }

    const [delProgsRes] = await conn.execute(`DELETE FROM programs WHERE id IN (${inProgPlaceholders})`, progIdsToDelete);
    console.log(`✨ Deleted ${delProgsRes.affectedRows} old programs from 'programs' table.`);
  }

  // 5. Delete Old Courses from Junction Tables and Courses table
  if (oldCourseIds.length > 0) {
    const inCoursePlaceholders = oldCourseIds.map(() => '?').join(',');

    const courseJunctions = [
      'courses_cmps',
      'courses_level_lnk',
      'courses_stream_lnk',
      'universities_courses_lnk',
      'blogs_courses_lnk',
      'examinations_courses_lnk',
      'questions_courses_lnk',
      'mentor_profiles_courses_lnk',
    ];

    for (const jTable of courseJunctions) {
      try {
        const [res] = await conn.execute(`DELETE FROM ${jTable} WHERE course_id IN (${inCoursePlaceholders})`, oldCourseIds);
        console.log(`  ✓ Cleaned ${res.affectedRows} rows from ${jTable}`);
      } catch (e) {
        // ignore
      }
    }

    const [delCourseRes] = await conn.execute(`DELETE FROM courses WHERE id IN (${inCoursePlaceholders})`, oldCourseIds);
    console.log(`✨ Deleted ${delCourseRes.affectedRows} old courses from 'courses' table.`);
  }

  // 6. Verify Remaining Clean Catalog
  const [remainingCourses] = await conn.execute('SELECT id, name, slug, published_at FROM courses WHERE published_at IS NOT NULL');
  console.log(`\n📋 Remaining Clean Master Courses (${remainingCourses.length}):`);
  for (const c of remainingCourses) {
    const [pCount] = await conn.execute(
      'SELECT COUNT(DISTINCT program_id) as count FROM programs_course_lnk WHERE course_id = ?',
      [c.id]
    );
    console.log(`  - ${c.name} (${c.slug}): ${pCount[0].count} specialisations`);
  }

  const [remainingProgs] = await conn.execute('SELECT COUNT(*) as total FROM programs WHERE published_at IS NOT NULL');
  console.log(`\n✨ Total Clean Published Programs in DB: ${remainingProgs[0].total}`);

  await conn.end();
  console.log('\n======================================================');
  console.log('🎉 OLD / UNWANTED COURSES & PROGRAMS SUCCESSFULLY DELETED!');
  console.log('======================================================\n');
}

run().catch((err) => {
  console.error('❌ Deletion error:', err);
  process.exit(1);
});
