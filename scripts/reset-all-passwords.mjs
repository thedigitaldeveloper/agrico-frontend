import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');
const bcrypt = require('D:/geduconnectbknd/node_modules/bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect'
  });

  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const mentorHash = await bcrypt.hash('Mentor@12345', 10);
  const studentHash = await bcrypt.hash('Student@12345', 10);

  // 1. Reset Strapi Backend Admin Panel Password
  const [adminUpdate] = await conn.query(
    'UPDATE admin_users SET password = ?, is_active = 1, blocked = 0 WHERE email = ?',
    [adminHash, 'admin@geduconnect.com']
  );
  console.log('Updated Strapi Admin Panel user (admin@geduconnect.com):', adminUpdate.affectedRows, 'rows');

  // 2. Ensure admin@geduconnect.com exists in Frontend up_users as well
  const [existingUpAdmin] = await conn.query('SELECT id FROM up_users WHERE email = ?', ['admin@geduconnect.com']);
  if (existingUpAdmin.length > 0) {
    await conn.query('UPDATE up_users SET password = ?, confirmed = 1, blocked = 0 WHERE email = ?', [adminHash, 'admin@geduconnect.com']);
    console.log('Updated frontend up_user admin@geduconnect.com');
  } else {
    const documentId = 'admin-user-' + Date.now();
    await conn.query(
      'INSERT INTO up_users (document_id, username, email, password, provider, confirmed, blocked, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, 1, 0, NOW(), NOW(), NOW())',
      [documentId, 'Admin User', 'admin@geduconnect.com', adminHash, 'local']
    );
    const [newAdmin] = await conn.query('SELECT id FROM up_users WHERE email = ?', ['admin@geduconnect.com']);
    if (newAdmin.length > 0) {
      await conn.query('INSERT INTO up_users_role_lnk (user_id, role_id) VALUES (?, 1)', [newAdmin[0].id]);
    }
    console.log('Created frontend up_user admin@geduconnect.com');
  }

  // 3. Reset Mentor Passwords in up_users
  const mentorEmails = ['mentor.asha@example.com', 'mentor.rohit@example.com', 'mentor.fatima@example.com'];
  for (const email of mentorEmails) {
    await conn.query('UPDATE up_users SET password = ?, confirmed = 1, blocked = 0 WHERE email = ?', [mentorHash, email]);
  }
  console.log('Reset Mentor accounts to: Mentor@12345');

  // 4. Reset Student Passwords in up_users
  const studentEmails = ['student.one@example.com', 'student.two@example.com'];
  for (const email of studentEmails) {
    await conn.query('UPDATE up_users SET password = ?, confirmed = 1, blocked = 0 WHERE email = ?', [studentHash, email]);
  }
  console.log('Reset Student accounts to: Student@12345');

  await conn.end();
  console.log('\nAll passwords successfully reset!');
}

main().catch(console.error);
