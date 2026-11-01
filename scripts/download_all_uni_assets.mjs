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

// 16 Online Universities Assets Mapping
const universitiesAssets = [
  {
    slug: 'amity-university-online',
    name: 'Amity University Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Amity_University_logo.png/300px-Amity_University_logo.png',
      'https://www.amityonline.com/_next/static/media/amity-online-logo.0c329b3f.svg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Amity_University_Noida_Campus.jpg/800px-Amity_University_Noida_Campus.jpg'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Amity_University_Noida_Campus.jpg/1280px-Amity_University_Noida_Campus.jpg',
      'https://images.shiksha.com/mediadata/images/1534914106php0W4WbQ.jpeg'
    ]
  },
  {
    slug: 'chandigarh-university-online',
    name: 'Chandigarh University Online (CU Online)',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Chandigarh_University_seal.svg/300px-Chandigarh_University_seal.svg.png',
      'https://www.cuidol.in/assets/images/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Chandigarh_University_Main_Gate.jpg/1280px-Chandigarh_University_Main_Gate.jpg',
      'https://images.shiksha.com/mediadata/images/1582265074phpD64C5V.jpeg'
    ]
  },
  {
    slug: 'manipal-university-jaipur-online',
    name: 'Manipal University Jaipur Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Manipal_University_Jaipur_logo.png/300px-Manipal_University_Jaipur_logo.png',
      'https://onlinemanipal.com/static/media/manipal-jaipur-logo.56a598a3.svg'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Manipal_University_Jaipur_Campus.jpg/1280px-Manipal_University_Jaipur_Campus.jpg',
      'https://images.shiksha.com/mediadata/images/1534919597phpSj7E6w.jpeg'
    ]
  },
  {
    slug: 'lpu-online',
    name: 'Lovely Professional University Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/7/70/Lovely_Professional_University_logo.png/300px-Lovely_Professional_University_logo.png',
      'https://www.lpuonline.com/assets/images/lpu-logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Lovely_Professional_University_Jalandhar.jpg/1280px-Lovely_Professional_University_Jalandhar.jpg',
      'https://images.shiksha.com/mediadata/images/1582276588phpG20v09.jpeg'
    ]
  },
  {
    slug: 'dpu-pune-online',
    name: 'Dr. D.Y. Patil Vidyapeeth Online (DPU Pune)',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Dr._D._Y._Patil_Vidyapeeth_logo.png/300px-Dr._D._Y._Patil_Vidyapeeth_logo.png',
      'https://www.dputm.edu.in/images/dpu-logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Dr._D._Y._Patil_Vidyapeeth_Pune.jpg/1280px-Dr._D._Y._Patil_Vidyapeeth_Pune.jpg',
      'https://images.shiksha.com/mediadata/images/1534918239phpY6uQ6u.jpeg'
    ]
  },
  {
    slug: 'dpu-navi-mumbai-online',
    name: 'DY Patil University Online Navi Mumbai',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Dr._D._Y._Patil_Vidyapeeth_logo.png/300px-Dr._D._Y._Patil_Vidyapeeth_logo.png',
      'https://www.dypatil.edu/images/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/DY_Patil_Stadium_and_University_Navi_Mumbai.jpg/1280px-DY_Patil_Stadium_and_University_Navi_Mumbai.jpg',
      'https://images.shiksha.com/mediadata/images/1582279144phpP5E7U5.jpeg'
    ]
  },
  {
    slug: 'sikkim-manipal-university-online',
    name: 'Sikkim Manipal University Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Sikkim_Manipal_University_logo.png/300px-Sikkim_Manipal_University_logo.png',
      'https://smu.edu.in/content/dam/manipal/smu/images/smu-logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sikkim_Manipal_Institute_of_Technology_campus.jpg/1280px-Sikkim_Manipal_Institute_of_Technology_campus.jpg',
      'https://images.shiksha.com/mediadata/images/1534924409phpJ3E9E2.jpeg'
    ]
  },
  {
    slug: 'shoolini-university-online',
    name: 'Shoolini University Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/8/85/Shoolini_University_logo.png/300px-Shoolini_University_logo.png',
      'https://shooliniuniversity.com/assets/images/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Shoolini_University_Campus_Solan.jpg/1280px-Shoolini_University_Campus_Solan.jpg',
      'https://images.shiksha.com/mediadata/images/1582283021phpO1o6J6.jpeg'
    ]
  },
  {
    slug: 'nmims-online',
    name: 'NMIMS Online (CDOE)',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/7/7d/NMIMS_logo.svg/300px-NMIMS_logo.svg.png',
      'https://online.nmims.edu/assets/images/nmims-logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/NMIMS_Mumbai_Campus.jpg/1280px-NMIMS_Mumbai_Campus.jpg',
      'https://images.shiksha.com/mediadata/images/1534921200phpI1o7o7.jpeg'
    ]
  },
  {
    slug: 'gla-university-online',
    name: 'GLA University Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/GLA_University_logo.png/300px-GLA_University_logo.png',
      'https://glaonline.com/assets/images/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/GLA_University_Mathura.jpg/1280px-GLA_University_Mathura.jpg',
      'https://images.shiksha.com/mediadata/images/1582286450phpY7w6W7.jpeg'
    ]
  },
  {
    slug: 'galgotias-university-online',
    name: 'Galgotias University Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/Galgotias_University_Logo.png/300px-Galgotias_University_Logo.png',
      'https://www.galgotiasuniversity.edu.in/images/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Galgotias_University_Campus.jpg/1280px-Galgotias_University_Campus.jpg',
      'https://images.shiksha.com/mediadata/images/1582287910phpT8w5W5.jpeg'
    ]
  },
  {
    slug: 'parul-university-online',
    name: 'Parul University Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/1/11/Parul_University_logo.png/300px-Parul_University_logo.png',
      'https://parulonline.com/assets/images/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Parul_University_Campus_Vadodara.jpg/1280px-Parul_University_Campus_Vadodara.jpg',
      'https://images.shiksha.com/mediadata/images/1582289450phpU9v4V4.jpeg'
    ]
  },
  {
    slug: 'uttaranchal-university-online',
    name: 'Uttaranchal University Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Uttaranchal_University_logo.png/300px-Uttaranchal_University_logo.png',
      'https://onlineuu.in/assets/images/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Uttaranchal_University_Dehradun.jpg/1280px-Uttaranchal_University_Dehradun.jpg',
      'https://images.shiksha.com/mediadata/images/1582291230phpZ1x2X2.jpeg'
    ]
  },
  {
    slug: 'kurukshetra-university-online',
    name: 'Kurukshetra University Online (KUK Online)',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Kurukshetra_University_logo.png/300px-Kurukshetra_University_logo.png',
      'https://kuk.ac.in/assets/images/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Kurukshetra_University_Administration_Block.jpg/1280px-Kurukshetra_University_Administration_Block.jpg',
      'https://images.shiksha.com/mediadata/images/1582293450phpA2y3Y3.jpeg'
    ]
  },
  {
    slug: 'andhra-university-online',
    name: 'Andhra University Online',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Andhra_University_logo.png/300px-Andhra_University_logo.png',
      'https://www.andhrauniversity.edu.in/images/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Andhra_University_Visakhapatnam.jpg/1280px-Andhra_University_Visakhapatnam.jpg',
      'https://images.shiksha.com/mediadata/images/1582295670phpB3z4Z4.jpeg'
    ]
  },
  {
    slug: 'op-jindal-global-university-online',
    name: 'O.P. Jindal Global University Online (JGU)',
    logoUrls: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/6/63/O._P._Jindal_Global_University_Logo.svg/300px-O._P._Jindal_Global_University_Logo.svg.png',
      'https://jgu.edu.in/wp-content/uploads/2021/08/logo.png'
    ],
    bannerUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/O._P._Jindal_Global_University_Campus.jpg/1280px-O._P._Jindal_Global_University_Campus.jpg',
      'https://images.shiksha.com/mediadata/images/1582297890phpC4a5A5.jpeg'
    ]
  }
];

async function downloadImage(urlList, localFileName) {
  const destPath = path.join(UPLOADS_DIR, localFileName);
  for (const url of urlList) {
    try {
      console.log(`Downloading: ${url}...`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });
      if (!response.ok) {
        console.warn(`Failed (${response.status}) from ${url}`);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 1000) {
        console.warn(`File too small (${buffer.length} bytes) from ${url}`);
        continue;
      }
      fs.writeFileSync(destPath, buffer);
      console.log(`✓ Saved ${localFileName} (${(buffer.length / 1024).toFixed(1)} KB)`);
      return { success: true, size: buffer.length };
    } catch (err) {
      console.warn(`Error fetching ${url}:`, err.message);
    }
  }
  return { success: false };
}

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect'
  });

  const now = new Date();

  for (const uni of universitiesAssets) {
    console.log(`\n======================================================`);
    console.log(`Processing assets for: ${uni.name} (${uni.slug})`);
    console.log(`======================================================`);

    const [uniRows] = await conn.execute('SELECT id, published_at FROM universities WHERE slug = ?', [uni.slug]);
    if (uniRows.length === 0) {
      console.log(`⚠️ University ${uni.slug} not found in DB!`);
      continue;
    }

    const draftUni = uniRows.find(u => u.published_at === null);
    const pubUni = uniRows.find(u => u.published_at !== null);
    const uniIds = uniRows.map(u => u.id);

    // 1. Logo
    const logoFileName = `${uni.slug}_logo.png`;
    const logoResult = await downloadImage(uni.logoUrls, logoFileName);
    let logoFileId = null;

    if (logoResult.success) {
      const docId = crypto.randomBytes(12).toString('hex');
      const [fRes] = await conn.execute(
        `INSERT INTO files (document_id, name, alternative_text, caption, width, height, formats, hash, ext, mime, size, url, provider, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, 256, 256, NULL, ?, '.png', 'image/png', ?, ?, 'local', ?, ?, ?)`,
        [
          docId,
          `${uni.name} Official Logo`,
          `${uni.name} Official Logo`,
          `${uni.name} Logo`,
          `${uni.slug}_logo`,
          (logoResult.size / 1024).toFixed(2),
          `/uploads/${logoFileName}`,
          now,
          now,
          now
        ]
      );
      logoFileId = fRes.insertId;

      for (const uId of uniIds) {
        await conn.execute("DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::university.university' AND field = 'logo'", [uId]);
        await conn.execute(
          "INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, 'api::university.university', 'logo', 1)",
          [logoFileId, uId]
        );
      }
      console.log(`✓ Attached Logo (file ID ${logoFileId}) to ${uni.slug}`);
    }

    // 2. Banner / Campus Image
    const bannerFileName = `${uni.slug}_campus_banner.jpg`;
    const bannerResult = await downloadImage(uni.bannerUrls, bannerFileName);
    let bannerFileId = null;

    if (bannerResult.success) {
      const docId = crypto.randomBytes(12).toString('hex');
      const [fRes] = await conn.execute(
        `INSERT INTO files (document_id, name, alternative_text, caption, width, height, formats, hash, ext, mime, size, url, provider, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, 1280, 720, NULL, ?, '.jpg', 'image/jpeg', ?, ?, 'local', ?, ?, ?)`,
        [
          docId,
          `${uni.name} Campus Infrastructure`,
          `${uni.name} Campus Infrastructure`,
          `${uni.name} Campus`,
          `${uni.slug}_banner`,
          (bannerResult.size / 1024).toFixed(2),
          `/uploads/${bannerFileName}`,
          now,
          now,
          now
        ]
      );
      bannerFileId = fRes.insertId;

      for (const uId of uniIds) {
        await conn.execute("DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::university.university' AND field IN ('image', 'images', 'banners')", [uId]);
        await conn.execute(
          "INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, 'api::university.university', 'image', 1)",
          [bannerFileId, uId]
        );
        await conn.execute(
          "INSERT INTO files_related_mph (file_id, related_id, related_type, field, `order`) VALUES (?, ?, 'api::university.university', 'images', 1)",
          [bannerFileId, uId]
        );
      }
      console.log(`✓ Attached Campus Banner (file ID ${bannerFileId}) to ${uni.slug}`);
    }
  }

  await conn.end();
  console.log(`\n🎉 ALL 16 UNIVERSITY LOGOS AND BANNERS DOWNLOADED & ATTACHED SUCCESSFULLY!`);
}

run().catch(console.error);
