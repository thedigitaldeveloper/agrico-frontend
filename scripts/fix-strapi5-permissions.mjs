import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

function genDocId() {
  return crypto.randomBytes(12).toString('hex');
}

async function main() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const [roles] = await c.query('SELECT * FROM up_roles WHERE type = "public"');
  const publicRole = roles[0];
  console.log('Public role:', publicRole);

  const actions = [
    'api::home.home.find',
    'api::university.university.find',
    'api::university.university.findOne',
    'api::stream.stream.find',
    'api::stream.stream.findOne',
    'api::course.course.find',
    'api::course.course.findOne',
    'api::program.program.find',
    'api::program.program.findOne',
    'api::exam.exam.find',
    'api::exam.exam.findOne',
    'api::approval.approval.find',
    'api::approval.approval.findOne',
    'api::affiliation.affiliation.find',
    'api::affiliation.affiliation.findOne',
    'api::ranking.ranking.find',
    'api::ranking.ranking.findOne',
    'api::ownership-type.ownership-type.find',
    'api::course-mode.course-mode.find',
    'api::course-type.course-type.find',
    'api::level.level.find',
    'api::duration-type.duration-type.find',
    'api::institute-tier.institute-tier.find',
    'api::tag.tag.find',
    'api::blog.blog.find',
    'api::blog.blog.findOne',
    'api::mentor-profile.mentor-profile.find',
    'api::mentor-profile.mentor-profile.findOne',
    'api::question.question.find',
    'api::question.question.findOne',
    'api::testimonial.testimonial.find',
    'api::testimonial.testimonial.findOne',
    'api::university-content.university-content.find',
    'api::university-content.university-content.findOne',
    'api::legal.legal.find',
    'api::legal.legal.findOne',
    'api::master.master.find',
    'api::master.master.findOne',
  ];

  for (const action of actions) {
    const [rows] = await c.query('SELECT * FROM up_permissions WHERE action = ?', [action]);
    let permId;
    if (rows.length === 0) {
      const docId = genDocId();
      const [res] = await c.query(
        'INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at) VALUES (?, ?, NOW(), NOW(), NOW())',
        [docId, action]
      );
      permId = res.insertId;
    } else {
      permId = rows[0].id;
      if (!rows[0].document_id || !rows[0].published_at) {
        await c.query(
          'UPDATE up_permissions SET document_id = COALESCE(document_id, ?), published_at = COALESCE(published_at, NOW()) WHERE id = ?',
          [genDocId(), permId]
        );
      }
    }

    // Link to public role
    const [linkRows] = await c.query(
      'SELECT id FROM up_permissions_role_lnk WHERE permission_id = ? AND role_id = ?',
      [permId, publicRole.id]
    );
    if (linkRows.length === 0) {
      await c.query(
        'INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_ord) VALUES (?, ?, 1)',
        [permId, publicRole.id]
      );
    }
  }

  console.log('Granted and verified all public permissions in Strapi 5 database!');
  await c.end();
}

main().catch(console.error);
