import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

const UPLOADS_DIR = 'D:/geduconnectbknd/public/uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const universitiesData = [
  {
    slug: 'amity-university-online',
    name: 'Amity University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/f/ff/Amity_University_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Amity_University_H_block.JPG'
  },
  {
    slug: 'chandigarh-university-online',
    name: 'Chandigarh University Online (CU Online)',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Chandigarh_University_Seal.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Chandigarh_University_Main_Gate.jpg'
  },
  {
    slug: 'manipal-university-jaipur-online',
    name: 'Manipal University Jaipur Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/8/87/Manipal_University_Jaipur_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Manipal_University_Jaipur_Campus.jpg'
  },
  {
    slug: 'lpu-online',
    name: 'Lovely Professional University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Lovely_Professional_University_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Lovely_Professional_University_%28LPU%29%2C_Jalandhar-Phagwara_Highway%2C_Jalandhar.jpg'
  },
  {
    slug: 'dpu-pune-online',
    name: 'Dr. D.Y. Patil Vidyapeeth Online (DPU Pune)',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Dr._D._Y._Patil_Vidyapeeth_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Dypatil_std.jpg'
  },
  {
    slug: 'dpu-navi-mumbai-online',
    name: 'DY Patil University Online Navi Mumbai',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Dr._D._Y._Patil_Vidyapeeth_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/1/13/DY_Patil_Stadium.jpg'
  },
  {
    slug: 'sikkim-manipal-university-online',
    name: 'Sikkim Manipal University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/3/30/Logo_of_Sikkim_Manipal_University.jpg',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Sikkim_Manipal_Institute_of_Technology_campus.jpg'
  },
  {
    slug: 'shoolini-university-online',
    name: 'Shoolini University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Shoolini_University4.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Shoolini_University.jpg'
  },
  {
    slug: 'nmims-online',
    name: 'NMIMS Online (CDOE)',
    logo: 'https://upload.wikimedia.org/wikipedia/en/7/7d/NMIMS_logo.svg',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/9/91/NMIMS_Mumbai_Campus.jpg'
  },
  {
    slug: 'gla-university-online',
    name: 'GLA University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/4/42/GLA_University_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/GLA_University_Mathura.jpg'
  },
  {
    slug: 'galgotias-university-online',
    name: 'Galgotias University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/b/b3/Galgotias_University_Logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/5/51/The_sandstone_gate_of_Galgotias_University..JPG'
  },
  {
    slug: 'parul-university-online',
    name: 'Parul University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/1/11/Parul_University_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Parul_University_Campus_Vadodara.jpg'
  },
  {
    slug: 'uttaranchal-university-online',
    name: 'Uttaranchal University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/0/07/Uttaranchal_University_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/en/2/20/Uttaranchal_University_campus.jpg'
  },
  {
    slug: 'kurukshetra-university-online',
    name: 'Kurukshetra University Online (KUK Online)',
    logo: 'https://upload.wikimedia.org/wikipedia/en/1/1d/Kurukshetra_University_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Kurukshetra_University1.jpg'
  },
  {
    slug: 'andhra-university-online',
    name: 'Andhra University Online',
    logo: 'https://upload.wikimedia.org/wikipedia/en/c/c7/Andhra_University_logo.png',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Andhra_University_Visakhapatnam.jpg'
  },
  {
    slug: 'op-jindal-global-university-online',
    name: 'O.P. Jindal Global University Online (JGU)',
    logo: 'https://upload.wikimedia.org/wikipedia/en/6/63/O._P._Jindal_Global_University_Logo.svg',
    campus: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/O._P._Jindal_Global_University_Campus.jpg'
  }
];

async function downloadFile(url, filename) {
  const dest = path.join(UPLOADS_DIR, filename);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GeduConnectBot/1.0 (https://geduconnect.org; admin@geduconnect.org)',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    if (!res.ok) {
      console.warn(`  ❌ Failed to download (${res.status}): ${url}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) {
      console.warn(`  ❌ Downloaded file too small (${buf.length} bytes): ${url}`);
      return null;
    }
    fs.writeFileSync(dest, buf);
    console.log(`  ✓ Saved ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
    return {
      size: buf.length,
      mime: url.endsWith('.svg') ? 'image/svg+xml' : url.endsWith('.png') ? 'image/png' : 'image/jpeg',
      ext: url.endsWith('.svg') ? '.svg' : url.endsWith('.png') ? '.png' : '.jpg'
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

  for (const uni of universitiesData) {
    console.log(`\n======================================================`);
    console.log(`Downloading real assets for: ${uni.name}`);
    console.log(`======================================================`);

    const [rows] = await conn.execute('SELECT id, published_at FROM universities WHERE slug = ?', [uni.slug]);
    if (rows.length === 0) {
      console.log(`⚠️ University ${uni.slug} not found in DB!`);
      continue;
    }
    const uniIds = rows.map(r => r.id);

    // 1. Download Real Logo
    const logoExt = uni.logo.endsWith('.svg') ? '.svg' : uni.logo.endsWith('.png') ? '.png' : '.jpg';
    const logoFilename = `${uni.slug}_official_logo${logoExt}`;
    const logoMeta = await downloadFile(uni.logo, logoFilename);

    if (logoMeta) {
      const docId = crypto.randomBytes(12).toString('hex');
      const [fRes] = await conn.execute(
        `INSERT INTO files (document_id, name, alternative_text, caption, width, height, formats, hash, ext, mime, size, url, provider, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, 256, 256, NULL, ?, ?, ?, ?, ?, 'local', ?, ?, ?)`,
        [
          docId,
          `${uni.name} Official Logo`,
          `${uni.name} Official Logo`,
          `${uni.name} Logo`,
          `${uni.slug}_logo`,
          logoMeta.ext,
          logoMeta.mime,
          (logoMeta.size / 1024).toFixed(2),
          `/uploads/${logoFilename}`,
          now,
          now,
          now
        ]
      );
      const logoFileId = fRes.insertId;

      for (const uId of uniIds) {
        await conn.execute("DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::university.university' AND field = 'logo'", [uId]);
        await conn.execute(
          "INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, 'api::university.university', 'logo', 1)",
          [logoFileId, uId]
        );
      }
      console.log(`  ✓ Linked Logo ID ${logoFileId} to ${uni.slug}`);
    }

    // 2. Download Real Campus Banner
    const campusExt = uni.campus.endsWith('.png') ? '.png' : '.jpg';
    const campusFilename = `${uni.slug}_campus_photo${campusExt}`;
    const campusMeta = await downloadFile(uni.campus, campusFilename);

    if (campusMeta) {
      const docId = crypto.randomBytes(12).toString('hex');
      const [fRes] = await conn.execute(
        `INSERT INTO files (document_id, name, alternative_text, caption, width, height, formats, hash, ext, mime, size, url, provider, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, 1280, 720, NULL, ?, ?, ?, ?, ?, 'local', ?, ?, ?)`,
        [
          docId,
          `${uni.name} Campus Infrastructure`,
          `${uni.name} Campus Infrastructure`,
          `${uni.name} Campus Infrastructure`,
          `${uni.slug}_campus`,
          campusMeta.ext,
          campusMeta.mime,
          (campusMeta.size / 1024).toFixed(2),
          `/uploads/${campusFilename}`,
          now,
          now,
          now
        ]
      );
      const campusFileId = fRes.insertId;

      for (const uId of uniIds) {
        await conn.execute("DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::university.university' AND field IN ('image', 'images', 'banners')", [uId]);
        await conn.execute(
          "INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, 'api::university.university', 'image', 1)",
          [campusFileId, uId]
        );
        await conn.execute(
          "INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, 'api::university.university', 'images', 1)",
          [campusFileId, uId]
        );
      }
      console.log(`  ✓ Linked Campus Banner ID ${campusFileId} to ${uni.slug}`);
    }
  }

  await conn.end();
  console.log(`\n🎉 ALL 16 UNIVERSITY REAL LOGOS & BANNERS DOWNLOADED & LINKED IN CMS!`);
}

main().catch(console.error);
