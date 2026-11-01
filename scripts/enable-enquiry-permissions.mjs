import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect'
  });

  const [existing] = await conn.query(
    "SELECT * FROM up_permissions WHERE action = 'api::enquiry.enquiry.find'"
  );
  console.log('Existing find permission:', existing);

  if (existing.length === 0) {
    const documentId = 'perm-enquiry-find-' + Date.now();
    await conn.query(
      "INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at) VALUES (?, 'api::enquiry.enquiry.find', NOW(), NOW(), NOW())",
      [documentId]
    );
    const [inserted] = await conn.query("SELECT id FROM up_permissions WHERE action = 'api::enquiry.enquiry.find'");
    if (inserted.length > 0) {
      // link to authenticated role (role_id: 1)
      await conn.query("INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, 1)", [inserted[0].id]);
      // link to public role (role_id: 2)
      await conn.query("INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, 2)", [inserted[0].id]);
    }
    console.log('Added find permission for enquiry');
  }

  await conn.end();
}

main().catch(console.error);
