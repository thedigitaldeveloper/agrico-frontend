import fs from 'fs';

async function main() {
  const p = 'D:/cms.geduconnect.org/node_modules/@strapi/admin/dist/server/src/strategies/api-token.js';
  if (fs.existsSync(p)) {
    console.log(fs.readFileSync(p, 'utf8'));
  } else {
    // search for it
    console.log('Searching...');
  }
}

main().catch(console.error);
