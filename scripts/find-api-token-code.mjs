import { createRequire } from 'node:module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

async function findFiles(dir, match) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith('.') && e.name !== '.cache') {
      try { await findFiles(full, match); } catch(err) {}
    } else if (e.name.includes(match)) {
      console.log('Found:', full);
      console.log(fs.readFileSync(full, 'utf8'));
    }
  }
}

async function main() {
  await findFiles('D:/cms.geduconnect.org/node_modules/@strapi/admin', 'api-token');
}

main().catch(console.error);
