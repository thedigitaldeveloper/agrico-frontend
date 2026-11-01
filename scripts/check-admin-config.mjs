import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const fs = require('fs');

async function main() {
  if (fs.existsSync('D:/cms.geduconnect.org/config/admin.js')) {
    console.log('admin.js:', fs.readFileSync('D:/cms.geduconnect.org/config/admin.js', 'utf8'));
  } else {
    console.log('admin.js does not exist');
  }
}

main().catch(console.error);
