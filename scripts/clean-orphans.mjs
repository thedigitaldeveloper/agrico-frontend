import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function check() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'geduconnect' });
  const [morphs] = await conn.execute("SELECT * FROM files_related_mph WHERE related_type = 'api::blog.blog'");
  console.log('files_related_mph count for blogs:', morphs.length);
  const [blogIds] = await conn.execute('SELECT id FROM blogs');
  const validIds = new Set(blogIds.map(b => b.id));
  const orphans = morphs.filter(m => !validIds.has(m.related_id));
  console.log('Orphans in files_related_mph:', orphans.length);
  if (orphans.length > 0) {
    for (const orphan of orphans) {
      await conn.execute('DELETE FROM files_related_mph WHERE id = ?', [orphan.id]);
    }
    console.log('Deleted orphaned morphs!');
  }
  await conn.end();
}

check().catch(console.error);
