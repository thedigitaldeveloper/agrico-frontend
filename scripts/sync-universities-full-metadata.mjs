import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

const UNI_METADATA = {
  'manipal-university-jaipur-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'AIU', 'WES'],
    rankings: ['NIRF Top 100'],
    establish: '2011',
    rating: 4.8,
  },
  'sikkim-manipal-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'AIU', 'WES'],
    rankings: ['India Today Top 25', 'NIRF Top 100'],
    establish: '1995',
    rating: 4.6,
  },
  'uttaranchal-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'AIU'],
    rankings: ['NIRF Top 100'],
    establish: '2013',
    rating: 4.5,
  },
  'amity-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'WES', 'QS World Ranked'],
    rankings: ['NIRF Top 50', 'QS World University Rankings'],
    establish: '2005',
    rating: 4.8,
  },
  'chandigarh-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'WES', 'QS World Ranked'],
    rankings: ['NIRF Top 50', 'QS World University Rankings'],
    establish: '2012',
    rating: 4.7,
  },
  'dr-dy-patil-vidyapeeth-online': {
    ownership: 'Deemed to be University',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A++'],
    rankings: ['NIRF Top 50'],
    establish: '2003',
    rating: 4.7,
  },
  'dpu-pune-online': {
    ownership: 'Deemed to be University',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A++'],
    rankings: ['NIRF Top 50'],
    establish: '2003',
    rating: 4.7,
  },
  'lovely-professional-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A++', 'WES'],
    rankings: ['NIRF Top 50'],
    establish: '2005',
    rating: 4.7,
  },
  'lpu-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A++', 'WES'],
    rankings: ['NIRF Top 50'],
    establish: '2005',
    rating: 4.7,
  },
  'nmims-online': {
    ownership: 'Deemed to be University',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'UGC Category-1'],
    rankings: ['NIRF Top 50'],
    establish: '1981',
    rating: 4.9,
  },
  'nmims-online-cdoe': {
    ownership: 'Deemed to be University',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'UGC Category-1'],
    rankings: ['NIRF Top 50'],
    establish: '1981',
    rating: 4.9,
  },
  'kurukshetra-university-online': {
    ownership: 'Government',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A++'],
    rankings: ['NIRF Top 100'],
    establish: '1956',
    rating: 4.5,
  },
  'andhra-university-online': {
    ownership: 'Government',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A++'],
    rankings: ['NIRF Top 50'],
    establish: '1926',
    rating: 4.6,
  },
  'vivekananda-global-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A', 'AIU'],
    rankings: ['NIRF Top 100'],
    establish: '2012',
    rating: 4.6,
  },
  'gla-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'AIU'],
    rankings: ['NIRF Top 100'],
    establish: '2010',
    rating: 4.5,
  },
  'shoolini-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'AIU'],
    rankings: ['NIRF Top 100'],
    establish: '2009',
    rating: 4.6,
  },
  'dy-patil-university-online-navi-mumbai': {
    ownership: 'Deemed to be University',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A'],
    rankings: ['NIRF Top 100'],
    establish: '2002',
    rating: 4.5,
  },
  'dpu-navi-mumbai-online': {
    ownership: 'Deemed to be University',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A'],
    rankings: ['NIRF Top 100'],
    establish: '2002',
    rating: 4.5,
  },
  'galgotias-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A+', 'AIU'],
    rankings: ['NIRF Top 100'],
    establish: '2011',
    rating: 4.5,
  },
  'parul-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'AICTE', 'NAAC A++'],
    rankings: ['NIRF Top 100'],
    establish: '2015',
    rating: 4.5,
  },
  'op-jindal-global-university-online': {
    ownership: 'Private',
    approvals: ['UGC-DEB', 'NAAC A', 'Institution of Eminence', 'QS World Ranked'],
    rankings: ['NIRF Top 50', 'QS World University Rankings'],
    establish: '2009',
    rating: 4.9,
  },
};

async function main() {
  console.log('🔄 Connecting to MySQL to sync university metadata...');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const [universities] = await conn.execute('SELECT id, slug, name FROM universities');
  console.log(`Found ${universities.length} universities in database.`);

  const [ownershipTypes] = await conn.execute('SELECT id, name FROM ownership_types');
  const ownershipMap = new Map(ownershipTypes.map((o) => [o.name, o.id]));

  const [rankings] = await conn.execute('SELECT id, name FROM rankings');
  const rankingMap = new Map(rankings.map((r) => [r.name, r.id]));

  const [approvals] = await conn.execute('SELECT id, name FROM approvals');
  const approvalMap = new Map(approvals.map((a) => [a.name, a.id]));

  for (const uni of universities) {
    const slug = (uni.slug || '').toLowerCase();
    const meta =
      UNI_METADATA[slug] ||
      Object.entries(UNI_METADATA).find(([key]) => slug.includes(key) || key.includes(slug))?.[1];

    if (!meta) {
      console.log(`⚠️ No preset metadata for: ${uni.name} (${uni.slug})`);
      continue;
    }

    if (meta.establish || meta.rating) {
      await conn.execute(
        'UPDATE universities SET establish = ?, rating = ? WHERE id = ?',
        [meta.establish ? `${meta.establish}-01-01` : null, meta.rating || 4.5, uni.id]
      );
    }

    const ownershipId = ownershipMap.get(meta.ownership);
    if (ownershipId) {
      const [existing] = await conn.execute(
        'SELECT id FROM universities_ownership_type_lnk WHERE university_id = ?',
        [uni.id]
      );
      if (existing.length === 0) {
        await conn.execute(
          'INSERT INTO universities_ownership_type_lnk (university_id, ownership_type_id) VALUES (?, ?)',
          [uni.id, ownershipId]
        );
      } else {
        await conn.execute(
          'UPDATE universities_ownership_type_lnk SET ownership_type_id = ? WHERE university_id = ?',
          [ownershipId, uni.id]
        );
      }
    }

    await conn.execute('DELETE FROM universities_approvals_lnk WHERE university_id = ?', [uni.id]);
    let appOrder = 1;
    for (const appName of meta.approvals) {
      const appId = approvalMap.get(appName);
      if (appId) {
        await conn.execute(
          'INSERT INTO universities_approvals_lnk (university_id, approval_id, approval_ord) VALUES (?, ?, ?)',
          [uni.id, appId, appOrder++]
        );
      }
    }

    await conn.execute('DELETE FROM universities_rankings_lnk WHERE university_id = ?', [uni.id]);
    let rankOrder = 1;
    for (const rankName of meta.rankings) {
      const rankId = rankingMap.get(rankName);
      if (rankId) {
        await conn.execute(
          'INSERT INTO universities_rankings_lnk (university_id, ranking_id, ranking_ord) VALUES (?, ?, ?)',
          [uni.id, rankId, rankOrder++]
        );
      }
    }

    console.log(`✅ Synced ${uni.name} (${uni.slug})`);
  }

  console.log('🎉 Successfully synced metadata for all online universities in database!');
  await conn.end();
}

main().catch(console.error);
