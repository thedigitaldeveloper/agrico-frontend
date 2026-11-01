import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const fs = require('fs');

async function main() {
  const envContent = fs.readFileSync('D:/cms.geduconnect.org/.env', 'utf8');
  for (const line of envContent.split('\n')) {
    if (line.includes('SALT') || line.includes('KEY') || line.includes('SECRET')) {
      const [k, v] = line.split('=');
      console.log(`${k}=${v?.trim()}`);
    }
  }
}

main().catch(console.error);
