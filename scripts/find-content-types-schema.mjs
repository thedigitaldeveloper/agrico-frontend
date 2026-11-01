import fs from 'fs';
import path from 'path';

function searchInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== '.cache' && !e.name.startsWith('.')) {
      try { searchInDir(full); } catch(err) {}
    } else if (e.name.endsWith('.js')) {
      try {
        const c = fs.readFileSync(full, 'utf8');
        if (c.includes('contentTypes') && c.includes('yup')) {
          console.log('Match with yup:', full);
          console.log(c.slice(0, 500));
        }
      } catch(err) {}
    }
  }
}

searchInDir('D:/cms.geduconnect.org/node_modules/@strapi');
searchInDir('D:/cms.geduconnect.org/src');
searchInDir('D:/cms.geduconnect.org/config');
