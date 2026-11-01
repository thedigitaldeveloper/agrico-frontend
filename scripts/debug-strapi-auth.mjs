import { createRequire } from 'node:module';
import fs from 'fs';

const require = createRequire(import.meta.url);

// Load Strapi .env into process.env
const strapiEnv = fs.readFileSync('D:/cms.geduconnect.org/.env', 'utf8');
for (const line of strapiEnv.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const k = trimmed.substring(0, idx).trim();
      const v = trimmed.substring(idx + 1).trim();
      process.env[k] = v;
    }
  }
}

const Strapi = require('D:/cms.geduconnect.org/node_modules/@strapi/strapi');

async function main() {
  const app = await Strapi({ appDir: 'D:/cms.geduconnect.org', distDir: 'D:/cms.geduconnect.org/dist' }).load();

  console.log('Strapi loaded successfully!');

  // Check public permissions
  const upPermissionService = app.plugin('users-permissions').service('permission');
  const publicPerms = await upPermissionService.findPublicPermissions();
  console.log('Total Public Permissions from service:', publicPerms.length);
  console.log('Sample public permissions:', publicPerms.map(p => p.action).slice(0, 15));

  const contentApiPerms = publicPerms.map(upPermissionService.toContentAPIPermission);
  const ability = await app.contentAPI.permissions.engine.generateAbility(contentApiPerms);

  console.log('\n--- ABILITY CAN TESTS ---');
  console.log('can api::stream.stream.find:', ability.can('api::stream.stream.find'));
  console.log('can api::course.course.find:', ability.can('api::course.course.find'));
  console.log('can api::university.university.find:', ability.can('api::university.university.find'));
  console.log('can api::home.home.find:', ability.can('api::home.home.find'));

  await app.destroy();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
