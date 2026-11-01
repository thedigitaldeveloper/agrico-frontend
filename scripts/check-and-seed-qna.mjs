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

  const [roles] = await c.query('SELECT * FROM up_roles');
  console.log('Roles:', roles);

  const publicRole = roles.find(r => r.type === 'public');

  // Check permissions for questions, answers, enquiries
  const actionsToEnsure = [
    'api::question.question.find',
    'api::question.question.findOne',
    'api::question.question.create',
    'api::answer.answer.find',
    'api::answer.answer.findOne',
    'api::answer.answer.create',
    'api::enquiry.enquiry.create',
  ];

  for (const action of actionsToEnsure) {
    const [existing] = await c.query('SELECT id FROM up_permissions WHERE action = ?', [action]);
    let permId;
    if (existing.length === 0) {
      const [res] = await c.query('INSERT INTO up_permissions (action, created_at, updated_at) VALUES (?, NOW(), NOW())', [action]);
      permId = res.insertId;
      console.log('Created permission:', action);
    } else {
      permId = existing[0].id;
    }
    if (publicRole) {
      await c.query('INSERT IGNORE INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, ?)', [permId, publicRole.id]);
    }
  }

  console.log('Permissions ensured.');

  // Let's inspect answers table schema
  const [cols] = await c.query('DESCRIBE answers');
  console.log('Answers columns:', cols.map(col => col.Field));

  const [qCols] = await c.query('DESCRIBE questions');
  console.log('Questions columns:', qCols.map(col => col.Field));

  const [linkTables] = await c.query("SHOW TABLES LIKE '%answer%'");
  console.log('Answer tables:', linkTables);

  const [qLinkTables] = await c.query("SHOW TABLES LIKE '%question%'");
  console.log('Question tables:', qLinkTables);

  await c.end();
}

main().catch(console.error);
