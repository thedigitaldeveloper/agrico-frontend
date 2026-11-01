import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function sync() {
  console.log('🔄 Syncing duration, duration_type and course_mode across all programs in database...');

  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const [programs] = await conn.execute('SELECT id, slug, duration FROM programs');
  console.log(`Found ${programs.length} program rows.`);

  const [durationTypes] = await conn.execute("SELECT id, name FROM duration_types WHERE name = 'Years'");
  const durationTypeId = durationTypes[0]?.id || 13;

  const [courseModes] = await conn.execute("SELECT id, name FROM course_modes WHERE name = 'Online'");
  const courseModeId = courseModes[0]?.id || 29;

  let updated = 0;
  for (const prog of programs) {
    const slug = (prog.slug || '').toLowerCase();
    const isUG =
      slug.startsWith('online-bba') ||
      slug.startsWith('online-bca') ||
      slug.startsWith('online-b-com') ||
      slug.startsWith('online-ba-') ||
      slug.startsWith('online-ba') && !slug.startsWith('online-mba') ||
      slug.startsWith('online-b-sc');

    const duration = isUG ? 3 : 2;
    const durationText = `${duration} Years`;

    // 1. Update duration column
    await conn.execute(
      'UPDATE programs SET duration = ?, duration_text = ? WHERE id = ?',
      [duration, durationText, prog.id]
    );

    // 2. Link duration_type
    const [hasDT] = await conn.execute(
      'SELECT id FROM programs_duration_type_lnk WHERE program_id = ?',
      [prog.id]
    );
    if (hasDT.length === 0) {
      await conn.execute(
        'INSERT INTO programs_duration_type_lnk (program_id, duration_type_id) VALUES (?, ?)',
        [prog.id, durationTypeId]
      );
    } else {
      await conn.execute(
        'UPDATE programs_duration_type_lnk SET duration_type_id = ? WHERE program_id = ?',
        [durationTypeId, prog.id]
      );
    }

    // 3. Link course_mode
    const [hasCM] = await conn.execute(
      'SELECT id FROM programs_course_mode_lnk WHERE program_id = ?',
      [prog.id]
    );
    if (hasCM.length === 0) {
      await conn.execute(
        'INSERT INTO programs_course_mode_lnk (program_id, course_mode_id) VALUES (?, ?)',
        [prog.id, courseModeId]
      );
    } else {
      await conn.execute(
        'UPDATE programs_course_mode_lnk SET course_mode_id = ? WHERE program_id = ?',
        [courseModeId, prog.id]
      );
    }

    updated++;
  }

  console.log(`✅ Successfully updated all ${updated} program rows with accurate duration & mode!`);
  await conn.end();
}

sync().catch(console.error);
