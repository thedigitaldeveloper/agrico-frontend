import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Strapi = require('D:/cms.geduconnect.org/node_modules/@strapi/strapi');

async function main() {
  const app = await Strapi({ appDir: 'D:/cms.geduconnect.org', distDir: 'D:/cms.geduconnect.org/dist' }).load();
  
  const perms = await app.entityService.findMany('plugin::users-permissions.permission', {
    filters: { role: { type: 'public' } },
  });

  console.log('Public permissions returned by entityService:', perms?.length);
  console.log('Sample public permissions:', perms?.slice(0, 10));

  await app.destroy();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
