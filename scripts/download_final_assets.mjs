import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

const UPLOADS_DIR = 'D:/geduconnectbknd/public/uploads';

const finalAssets = [
  {
    slug: 'parul-university-online',
    name: 'Parul University Online',
    logo: 'https://www.paruluniversity.ac.in/wp-content/themes/parul/assets/images/svg/parul-logo-resp.svg',
    campus: 'https://www.paruluniversity.ac.in/wp-content/themes/parul/assets/images/metadata-preview.jpg'
  },
  {
    slug: 'nmims-online',
    name: 'NMIMS Online (CDOE)',
    logo: 'https://online.nmims.edu/images/NMIMS-CODE.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/9/91/NMIMS_Mumbai_Campus.jpg'
  },
  {
    slug: 'chandigarh-university-online',
    name: 'Chandigarh University Online (CU Online)',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Chandigarh_University_Main_Gate.jpg'
  },
  {
    slug: 'manipal-university-jaipur-online',
    name: 'Manipal University Jaipur Online',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Manipal_University_Jaipur_Campus.jpg'
  },
  {
    slug: 'gla-university-online',
    name: 'GLA University Online',
    campus: 'https://gla.ac.in/images-home/mathura-campus.webp'
  },
  {
    slug: 'sikkim-manipal-university-online',
    name: 'Sikkim Manipal University Online',
    campus: 'https://smu.edu.in/img/slider/SMU-25-convocation-banner.jpg'
  },
  {
    slug: 'op-jindal-global-university-online',
    name: 'O.P. Jindal Global University Online (JGU)',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Kishalay_Bhattacharjee_at_a_panel_discussion_at_O.P_Jindal_Global_University.jpg'
  },
  {
    slug: 'uttaranchal-university-online',
    name: 'Uttaranchal University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Uttaranchal_University_logo.png/300px-Uttaranchal_University_logo.png'
  },
  {
    slug: 'vivekananda-global-university-online',
    name: 'Vivekananda Global University Online',
    linkExisting: true
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

  // Also fix VGU published row media linking
  const [vguRows] = await conn.execute('SELECT id, published_at FROM universities WHERE slug = ?', ['vivekananda-global-university-online']);
  const vguDraft = vguRows.find(u => u.published_at === null);
  const vguPub = vguRows.find(u => u.published_at !== null);
  if (vguDraft && vguPub) {
    const [vguFiles] = await conn.execute('SELECT * FROM files_related_mph WHERE related_id = ? AND related_type = "api::university.university"', [vguDraft.id]);
    await conn.execute('DELETE FROM files_related_mph WHERE related_id = ? AND related_type = "api::university.university"', [vguPub.id]);
    for (const f of vguFiles) {
      await conn.execute(
        'INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, ?, ?, ?)',
        [f.file_id, vguPub.id, f.related_type, f.field, f.order]
      );
    }
    console.log('✓ VGU media relations copied to published row!');
  }

  for (const item of finalAssets) {
    if (item.linkExisting) continue;
    console.log(`\nProcessing: ${item.name}`);
    const [rows] = await conn.execute('SELECT id FROM universities WHERE slug = ?', [item.slug]);
    const uniIds = rows.map(r => r.id);

    if (item.logo) {
      const ext = item.logo.endsWith('.svg') ? '.svg' : item.logo.endsWith('.png') ? '.png' : item.logo.endsWith('.webp') ? '.webp' : '.jpg';
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
      const ext = item.campus.endsWith('.png') ? '.png' : item.campus.endsWith('.webp') ? '.webp' : '.jpg';
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
}

main().catch(console.error);
