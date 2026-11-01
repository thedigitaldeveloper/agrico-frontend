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
  if (!publicRole) {
    console.error('No public role found');
    await c.end();
    return;
  }

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
  ];

  for (const action of actions) {
    const [existing] = await c.query('SELECT id FROM up_permissions WHERE action = ?', [action]);
    if (existing.length === 0) {
      const [res] = await c.query('INSERT INTO up_permissions (action, created_at, updated_at) VALUES (?, NOW(), NOW())', [action]);
      const permId = res.insertId;
      await c.query('INSERT IGNORE INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, ?)', [permId, publicRole.id]);
      console.log('Inserted & linked permission:', action);
    } else {
      const permId = existing[0].id;
      await c.query('INSERT IGNORE INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, ?)', [permId, publicRole.id]);
    }
  }

  console.log('Permissions successfully synchronized for Public role!');
  await c.end();
}

main().catch(console.error);
