import fs from 'fs';
import path from 'path';

function searchInDir(dir, pattern) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== '.cache' && !e.name.startsWith('.')) {
      try { searchInDir(full, pattern); } catch(err) {}
    } else if (e.name.endsWith('.js')) {
      try {
        const c = fs.readFileSync(full, 'utf8');
        if (c.includes(pattern)) {
          console.log('Match in:', full);
          // Print snippet
          const idx = c.indexOf(pattern);
          console.log(c.substring(Math.max(0, idx - 100), Math.min(c.length, idx + 400)));
        }
      } catch(err) {}
    }
  }
}

searchInDir('D:/cms.geduconnect.org/node_modules/@strapi', 'users-permissions.js');
searchInDir('D:/cms.geduconnect.org/node_modules/@strapi', 'Forbidden access');
