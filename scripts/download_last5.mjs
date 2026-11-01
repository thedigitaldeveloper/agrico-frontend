import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

const UPLOADS_DIR = 'D:/geduconnectbknd/public/uploads';

const last5 = [
  {
    slug: 'manipal-university-jaipur-online',
    name: 'Manipal University Jaipur Online',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Manipal_University_Jaipur.jpg'
  },
  {
    slug: 'chandigarh-university-online',
    name: 'Chandigarh University Online (CU Online)',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Block_1_of_Chandigarh_University.jpg'
  },
  {
    slug: 'nmims-online',
    name: 'NMIMS Online (CDOE)',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/NMIMS_Campus_Wall.JPG'
  },
  {
    slug: 'parul-university-online',
    name: 'Parul University Online',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/9/92/WLM_PU_Presentation_Dmytro_Bykov_01.jpg'
  },
  {
    slug: 'uttaranchal-university-online',
    name: 'Uttaranchal University Online',
    logo: 'https://www.uttaranchaluniversity.ac.in/images/logo.png'
  }
];

async function downloadFile(url, filename) {
  const dest = path.join(UPLOADS_DIR, filename);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    if (!res.ok) {
      console.warn(`  ❌ Failed (${res.status}): ${url}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) {
      console.warn(`  ❌ File too small (${buf.length} bytes): ${url}`);
      return null;
    }
    fs.writeFileSync(dest, buf);
    console.log(`  ✓ Saved ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
    return {
      size: buf.length,
      mime: url.endsWith('.svg') ? 'image/svg+xml' : url.endsWith('.png') ? 'image/png' : url.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
      ext: url.endsWith('.svg') ? '.svg' : url.endsWith('.png') ? '.png' : url.endsWith('.webp') ? '.webp' : '.jpg'
    };
  } catch (err) {
    console.warn(`  ❌ Error fetching ${url}:`, err.message);
    return null;
  }
}

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect'
  });

  const now = new Date();

  for (const item of last5) {
    console.log(`\nProcessing: ${item.name}`);
    const [rows] = await conn.execute('SELECT id FROM universities WHERE slug = ?', [item.slug]);
    const uniIds = rows.map(r => r.id);

    if (item.logo) {
      const ext = item.logo.endsWith('.png') ? '.png' : '.jpg';
      const logoFilename = `${item.slug}_official_logo${ext}`;
      const meta = await downloadFile(item.logo, logoFilename);
      if (meta) {
        const docId = crypto.randomBytes(12).toString('hex');
        const [fRes] = await conn.execute(
          `INSERT INTO files (document_id, name, alternative_text, caption, width, height, formats, hash, ext, mime, size, url, provider, created_at, updated_at, published_at)
           VALUES (?, ?, ?, ?, 256, 256, NULL, ?, ?, ?, ?, ?, 'local', ?, ?, ?)`,
          [docId, `${item.name} Official Logo`, `${item.name} Official Logo`, `${item.name} Logo`, `${item.slug}_logo`, meta.ext, meta.mime, (meta.size / 1024).toFixed(2), `/uploads/${logoFilename}`, now, now, now]
        );
        for (const uId of uniIds) {
          await conn.execute("DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::university.university' AND field = 'logo'", [uId]);
          await conn.execute("INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, 'api::university.university', 'logo', 1)", [fRes.insertId, uId]);
        }
        console.log(`  ✓ Linked Logo ID ${fRes.insertId} to ${item.slug}`);
      }
    }

    if (item.campus) {
      const ext = item.campus.endsWith('.png') ? '.png' : '.jpg';
      const campusFilename = `${item.slug}_campus_photo${ext}`;
      const meta = await downloadFile(item.campus, campusFilename);
      if (meta) {
        const docId = crypto.randomBytes(12).toString('hex');
        const [fRes] = await conn.execute(
          `INSERT INTO files (document_id, name, alternative_text, caption, width, height, formats, hash, ext, mime, size, url, provider, created_at, updated_at, published_at)
           VALUES (?, ?, ?, ?, 1280, 720, NULL, ?, ?, ?, ?, ?, 'local', ?, ?, ?)`,
          [docId, `${item.name} Campus Infrastructure`, `${item.name} Campus Infrastructure`, `${item.name} Campus`, `${item.slug}_campus`, meta.ext, meta.mime, (meta.size / 1024).toFixed(2), `/uploads/${campusFilename}`, now, now, now]
        );
        for (const uId of uniIds) {
          await conn.execute("DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::university.university' AND field IN ('image', 'images', 'banners')", [uId]);
          await conn.execute("INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, 'api::university.university', 'image', 1)", [fRes.insertId, uId]);
          await conn.execute("INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, 'api::university.university', 'images', 1)", [fRes.insertId, uId]);
        }
        console.log(`  ✓ Linked Campus Banner ID ${fRes.insertId} to ${item.slug}`);
      }
    }
  }

  await conn.end();
  console.log(`\n🎉 Final 5 items processed!`);
}

main().catch(console.error);
