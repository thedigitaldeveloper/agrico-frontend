import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

function genDocId() {
  return crypto.randomBytes(12).toString('hex');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function run() {
  console.log('🚀 Starting Complete Course, Program & University Mapping Sync...\n');

  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const now = new Date();

  // 1. Fetch Taxonomies: Levels & Streams
  const [levels] = await conn.execute('SELECT id, document_id, name, slug FROM levels WHERE published_at IS NOT NULL');
  const [streams] = await conn.execute('SELECT id, document_id, name, slug FROM streams WHERE published_at IS NOT NULL');

  const levelMap = {};
  for (const l of levels) levelMap[l.name.toLowerCase()] = l;

  const streamMap = {};
  for (const s of streams) streamMap[s.name.toLowerCase()] = s;

  console.log('✅ Loaded Levels:', Object.keys(levelMap));
  console.log('✅ Loaded Streams:', Object.keys(streamMap));

  // 2. Define Master Courses
  const masterCourses = [
    {
      name: 'Online MBA',
      fullName: 'Online Master of Business Administration',
      slug: 'online-mba',
      level: 'postgraduate',
      stream: 'management',
      shortDescription: 'Earn a UGC-DEB entitled Online MBA degree from top accredited universities with flexible weekend classes, global mentorship, and placement assistance.',
    },
    {
      name: 'Online BBA',
      fullName: 'Online Bachelor of Business Administration',
      slug: 'online-bba',
      level: 'undergraduate',
      stream: 'management',
      shortDescription: 'Build foundational business, marketing, finance, and management skills with a recognized 3-year Online BBA degree from leading institutions.',
    },
    {
      name: 'Online MCA',
      fullName: 'Online Master of Computer Applications',
      slug: 'online-mca',
      level: 'postgraduate',
      stream: 'computer applications',
      shortDescription: 'Master modern software development, AI, Cloud, and Data Analytics through a career-oriented 2-year Online MCA degree.',
    },
    {
      name: 'Online BCA',
      fullName: 'Online Bachelor of Computer Applications',
      slug: 'online-bca',
      level: 'undergraduate',
      stream: 'computer applications',
      shortDescription: 'Kickstart your IT career with a recognized 3-year Online BCA covering programming, database management, cloud systems, and web technologies.',
    },
    {
      name: 'Online B.Com',
      fullName: 'Online Bachelor of Commerce',
      slug: 'online-b-com',
      level: 'undergraduate',
      stream: 'commerce',
      shortDescription: 'Gain in-depth expertise in financial accounting, taxation, corporate laws, and banking with a flexible 3-year Online B.Com degree.',
    },
    {
      name: 'Online M.Com',
      fullName: 'Online Master of Commerce',
      slug: 'online-m-com',
      level: 'postgraduate',
      stream: 'commerce',
      shortDescription: 'Advance your career in corporate finance, auditing, international trade, and investment management with an accredited 2-year Online M.Com.',
    },
    {
      name: 'Online MA',
      fullName: 'Online Master of Arts',
      slug: 'online-ma',
      level: 'postgraduate',
      stream: 'arts & humanities',
      shortDescription: 'Deepen your knowledge in specialized liberal arts fields including English literature, Journalism, Economics, Psychology, and Public Policy.',
    },
    {
      name: 'Online BA',
      fullName: 'Online Bachelor of Arts',
      slug: 'online-ba',
      level: 'undergraduate',
      stream: 'arts & humanities',
      shortDescription: 'Explore comprehensive humanities and social sciences education with flexible online learning schedules and interactive digital resources.',
    },
    {
      name: 'Online M.Sc',
      fullName: 'Online Master of Science',
      slug: 'online-m-sc',
      level: 'postgraduate',
      stream: 'science',
      shortDescription: 'Accelerate your quantitative and scientific expertise in Data Science, Applied Mathematics, Information Technology, and Artificial Intelligence.',
    },
    {
      name: 'Online B.Sc',
      fullName: 'Online Bachelor of Science',
      slug: 'online-b-sc',
      level: 'undergraduate',
      stream: 'science',
      shortDescription: 'Develop strong analytical, technical, and domain-specific foundations in Computer Science, IT, and specialized Hospitality fields.',
    },
    {
      name: 'Executive MBA',
      fullName: 'Online Executive Master of Business Administration',
      slug: 'online-executive-mba',
      level: 'postgraduate',
      stream: 'executive education',
      shortDescription: 'Designed for experienced managers and business leaders to master strategic leadership, digital transformation, and global business management.',
    },
    {
      name: 'Online LL.M',
      fullName: 'Online Master of Laws',
      slug: 'online-llm',
      level: 'postgraduate',
      stream: 'law',
      shortDescription: 'Specialized legal postgraduate program for legal practitioners and corporate professionals covering Corporate Law, IPR, and International Trade.',
    }
  ];

  console.log('\n--- Ensuring Master Courses Exist in Database ---');
  const courseDbMap = {}; // slug -> { draftId, pubId }

  for (const mc of masterCourses) {
    const [existing] = await conn.execute(
      'SELECT id, document_id, published_at FROM courses WHERE slug = ?',
      [mc.slug]
    );

    let docId = existing.length > 0 ? existing[0].document_id : genDocId();
    let draftId, pubId;

    const shortDescBlocks = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: mc.shortDescription }],
      },
    ];

    if (existing.length === 0) {
      // Create draft
      const [drf] = await conn.execute(
        'INSERT INTO courses (document_id, name, slug, full_name, short_description, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)',
        [docId, mc.name, mc.slug, mc.fullName, JSON.stringify(shortDescBlocks), now, now]
      );
      draftId = drf.insertId;

      // Create published
      const [pub] = await conn.execute(
        'INSERT INTO courses (document_id, name, slug, full_name, short_description, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [docId, mc.name, mc.slug, mc.fullName, JSON.stringify(shortDescBlocks), now, now, now]
      );
      pubId = pub.insertId;
      console.log(`✨ Created Course: ${mc.name} (${mc.slug})`);
    } else {
      const pub = existing.find((c) => c.published_at !== null);
      const drf = existing.find((c) => c.published_at === null);
      pubId = pub ? pub.id : existing[0].id;
      draftId = drf ? drf.id : existing[0].id;

      await conn.execute(
        'UPDATE courses SET name = ?, full_name = ?, short_description = ?, updated_at = ? WHERE document_id = ?',
        [mc.name, mc.fullName, JSON.stringify(shortDescBlocks), now, docId]
      );
      console.log(`🔄 Updated Course: ${mc.name} (${mc.slug})`);
    }

    courseDbMap[mc.slug] = { draftId, pubId, docId, name: mc.name };

    // Link Level
    const targetLevel = levelMap[mc.level];
    if (targetLevel) {
      for (const cId of [draftId, pubId]) {
        if (!cId) continue;
        await conn.execute('DELETE FROM courses_level_lnk WHERE course_id = ?', [cId]);
        await conn.execute('INSERT INTO courses_level_lnk (course_id, level_id) VALUES (?, ?)', [cId, targetLevel.id]);
      }
    }

    // Link Stream
    const targetStream = streamMap[mc.stream];
    if (targetStream) {
      for (const cId of [draftId, pubId]) {
        if (!cId) continue;
        await conn.execute('DELETE FROM courses_stream_lnk WHERE course_id = ?', [cId]);
        await conn.execute('INSERT INTO courses_stream_lnk (course_id, stream_id) VALUES (?, ?)', [cId, targetStream.id]);
      }
    }
  }

  // 3. Define Standard Programs / Specialisations for each course
  const standardPrograms = [
    // --- Online BBA ---
    { courseSlug: 'online-bba', name: 'General Management', slug: 'online-bba-general-management', duration: 3, fee: 90000, avgPackage: '₹4.5 LPA' },
    { courseSlug: 'online-bba', name: 'Marketing Management', slug: 'online-bba-marketing-management', duration: 3, fee: 105000, avgPackage: '₹4.8 LPA' },
    { courseSlug: 'online-bba', name: 'Financial Management', slug: 'online-bba-financial-management', duration: 3, fee: 105000, avgPackage: '₹5.0 LPA' },
    { courseSlug: 'online-bba', name: 'Human Resource Management', slug: 'online-bba-human-resource-management', duration: 3, fee: 98000, avgPackage: '₹4.5 LPA' },
    { courseSlug: 'online-bba', name: 'Digital Marketing', slug: 'online-bba-digital-marketing', duration: 3, fee: 120000, avgPackage: '₹5.2 LPA' },
    { courseSlug: 'online-bba', name: 'Business Analytics', slug: 'online-bba-business-analytics', duration: 3, fee: 135000, avgPackage: '₹5.8 LPA' },
    { courseSlug: 'online-bba', name: 'Banking and Insurance', slug: 'online-bba-banking-and-insurance', duration: 3, fee: 100000, avgPackage: '₹4.6 LPA' },
    { courseSlug: 'online-bba', name: 'International Business', slug: 'online-bba-international-business', duration: 3, fee: 115000, avgPackage: '₹5.0 LPA' },

    // --- Online MCA ---
    { courseSlug: 'online-mca', name: 'General MCA', slug: 'online-mca-general', duration: 2, fee: 110000, avgPackage: '₹6.5 LPA' },
    { courseSlug: 'online-mca', name: 'AI and Machine Learning', slug: 'online-mca-ai-and-machine-learning', duration: 2, fee: 140000, avgPackage: '₹8.5 LPA' },
    { courseSlug: 'online-mca', name: 'Cloud Computing and DevOps', slug: 'online-mca-cloud-computing', duration: 2, fee: 135000, avgPackage: '₹7.8 LPA' },
    { courseSlug: 'online-mca', name: 'Data Science and Analytics', slug: 'online-mca-data-science', duration: 2, fee: 145000, avgPackage: '₹8.2 LPA' },
    { courseSlug: 'online-mca', name: 'Cyber Security and Forensics', slug: 'online-mca-cyber-security', duration: 2, fee: 130000, avgPackage: '₹7.5 LPA' },
    { courseSlug: 'online-mca', name: 'Full Stack Web Development', slug: 'online-mca-full-stack-development', duration: 2, fee: 125000, avgPackage: '₹7.2 LPA' },
    { courseSlug: 'online-mca', name: 'Blockchain Technologies', slug: 'online-mca-blockchain', duration: 2, fee: 140000, avgPackage: '₹8.0 LPA' },

    // --- Online BCA ---
    { courseSlug: 'online-bca', name: 'General BCA', slug: 'online-bca-general', duration: 3, fee: 90000, avgPackage: '₹4.2 LPA' },
    { courseSlug: 'online-bca', name: 'Data Science and Analytics', slug: 'online-bca-data-science', duration: 3, fee: 115000, avgPackage: '₹5.0 LPA' },
    { courseSlug: 'online-bca', name: 'Cloud Computing and Security', slug: 'online-bca-cloud-computing', duration: 3, fee: 110000, avgPackage: '₹4.8 LPA' },
    { courseSlug: 'online-bca', name: 'Artificial Intelligence', slug: 'online-bca-artificial-intelligence', duration: 3, fee: 125000, avgPackage: '₹5.5 LPA' },
    { courseSlug: 'online-bca', name: 'Full Stack Development', slug: 'online-bca-full-stack-development', duration: 3, fee: 105000, avgPackage: '₹4.6 LPA' },
    { courseSlug: 'online-bca', name: 'Cyber Security', slug: 'online-bca-cyber-security', duration: 3, fee: 110000, avgPackage: '₹4.8 LPA' },

    // --- Online B.Com ---
    { courseSlug: 'online-b-com', name: 'General B.Com', slug: 'online-b-com-general', duration: 3, fee: 65000, avgPackage: '₹3.8 LPA' },
    { courseSlug: 'online-b-com', name: 'Accounting and Finance', slug: 'online-b-com-accounting-and-finance', duration: 3, fee: 75000, avgPackage: '₹4.2 LPA' },
    { courseSlug: 'online-b-com', name: 'International Finance and Accounting (ACCA)', slug: 'online-b-com-international-finance-acca', duration: 3, fee: 135000, avgPackage: '₹6.0 LPA' },
    { courseSlug: 'online-b-com', name: 'Banking and Insurance', slug: 'online-b-com-banking-and-insurance', duration: 3, fee: 72000, avgPackage: '₹4.0 LPA' },
    { courseSlug: 'online-b-com', name: 'FinTech and Digital Commerce', slug: 'online-b-com-fintech-digital-commerce', duration: 3, fee: 90000, avgPackage: '₹4.5 LPA' },

    // --- Online M.Com ---
    { courseSlug: 'online-m-com', name: 'General M.Com', slug: 'online-m-com-general', duration: 2, fee: 70000, avgPackage: '₹4.8 LPA' },
    { courseSlug: 'online-m-com', name: 'Financial Management', slug: 'online-m-com-financial-management', duration: 2, fee: 85000, avgPackage: '₹5.5 LPA' },
    { courseSlug: 'online-m-com', name: 'International Business Operations', slug: 'online-m-com-international-business', duration: 2, fee: 80000, avgPackage: '₹5.2 LPA' },
    { courseSlug: 'online-m-com', name: 'Corporate Accounting and Taxation', slug: 'online-m-com-corporate-accounting', duration: 2, fee: 82000, avgPackage: '₹5.4 LPA' },

    // --- Online MA ---
    { courseSlug: 'online-ma', name: 'Journalism and Mass Communication (MA JMC)', slug: 'online-ma-journalism-and-mass-communication', duration: 2, fee: 90000, avgPackage: '₹4.5 LPA' },
    { courseSlug: 'online-ma', name: 'English Literature', slug: 'online-ma-english', duration: 2, fee: 65000, avgPackage: '₹4.0 LPA' },
    { courseSlug: 'online-ma', name: 'Economics', slug: 'online-ma-economics', duration: 2, fee: 75000, avgPackage: '₹5.2 LPA' },
    { courseSlug: 'online-ma', name: 'Psychology', slug: 'online-ma-psychology', duration: 2, fee: 85000, avgPackage: '₹4.8 LPA' },
    { courseSlug: 'online-ma', name: 'Public Policy and Administration', slug: 'online-ma-public-policy', duration: 2, fee: 120000, avgPackage: '₹6.0 LPA' },
    { courseSlug: 'online-ma', name: 'International Relations and Strategy', slug: 'online-ma-international-relations', duration: 2, fee: 165000, avgPackage: '₹7.0 LPA' },

    // --- Online BA ---
    { courseSlug: 'online-ba', name: 'General BA', slug: 'online-ba-general', duration: 3, fee: 55000, avgPackage: '₹3.5 LPA' },
    { courseSlug: 'online-ba', name: 'Journalism and Mass Communication', slug: 'online-ba-journalism', duration: 3, fee: 75000, avgPackage: '₹4.0 LPA' },
    { courseSlug: 'online-ba', name: 'English Literature', slug: 'online-ba-english', duration: 3, fee: 58000, avgPackage: '₹3.6 LPA' },
    { courseSlug: 'online-ba', name: 'Political Science and Sociology', slug: 'online-ba-political-science', duration: 3, fee: 55000, avgPackage: '₹3.5 LPA' },

    // --- Online M.Sc ---
    { courseSlug: 'online-m-sc', name: 'Data Science', slug: 'online-m-sc-data-science', duration: 2, fee: 150000, avgPackage: '₹8.5 LPA' },
    { courseSlug: 'online-m-sc', name: 'Applied Mathematics', slug: 'online-m-sc-applied-mathematics', duration: 2, fee: 90000, avgPackage: '₹5.5 LPA' },
    { courseSlug: 'online-m-sc', name: 'Information Technology (IT)', slug: 'online-m-sc-information-technology', duration: 2, fee: 110000, avgPackage: '₹6.8 LPA' },

    // --- Online B.Sc ---
    { courseSlug: 'online-b-sc', name: 'Computer Science', slug: 'online-b-sc-computer-science', duration: 3, fee: 110000, avgPackage: '₹4.8 LPA' },
    { courseSlug: 'online-b-sc', name: 'Hospitality Management', slug: 'online-b-sc-hospitality-management', duration: 3, fee: 130000, avgPackage: '₹4.5 LPA' },

    // --- Executive MBA ---
    { courseSlug: 'online-executive-mba', name: 'Executive MBA (Dual Specialization)', slug: 'online-executive-mba-dual', duration: 1, fee: 225000, avgPackage: '₹14.5 LPA' },
    { courseSlug: 'online-executive-mba', name: 'Executive MBA in Digital Business', slug: 'online-executive-mba-digital-business', duration: 1, fee: 280000, avgPackage: '₹16.0 LPA' },

    // --- Online LL.M ---
    { courseSlug: 'online-llm', name: 'Corporate and Financial Law', slug: 'online-llm-corporate-law', duration: 1, fee: 200000, avgPackage: '₹11.0 LPA' },
    { courseSlug: 'online-llm', name: 'Intellectual Property Rights (IPR)', slug: 'online-llm-ipr', duration: 1, fee: 200000, avgPackage: '₹10.5 LPA' },
  ];

  console.log('\n--- Syncing Master Programs / Specialisations ---');
  const programDbMap = {}; // slug -> { draftId, pubId, docId }

  let progOrd = 1;
  for (const prog of standardPrograms) {
    const parentCourse = courseDbMap[prog.courseSlug];
    if (!parentCourse) continue;

    const [existing] = await conn.execute(
      'SELECT id, document_id, published_at FROM programs WHERE slug = ?',
      [prog.slug]
    );

    let docId = existing.length > 0 ? existing[0].document_id : genDocId();
    let draftId, pubId;

    const shortDescBlocks = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: `${prog.name} under ${parentCourse.name} program.` }],
      },
    ];

    if (existing.length === 0) {
      // Draft
      const [drf] = await conn.execute(
        'INSERT INTO programs (document_id, name, slug, full_name, duration, fee, average_package, rating, position, show_apply_button, apply_button_text, view_button_text, short_description, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, 4.5, ?, 1, "Apply Now", "View Program", ?, ?, ?, NULL)',
        [docId, prog.name, prog.slug, `${parentCourse.name} in ${prog.name}`, prog.duration, prog.fee, prog.avgPackage, progOrd, JSON.stringify(shortDescBlocks), now, now]
      );
      draftId = drf.insertId;

      // Published
      const [pub] = await conn.execute(
        'INSERT INTO programs (document_id, name, slug, full_name, duration, fee, average_package, rating, position, show_apply_button, apply_button_text, view_button_text, short_description, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, 4.5, ?, 1, "Apply Now", "View Program", ?, ?, ?, ?)',
        [docId, prog.name, prog.slug, `${parentCourse.name} in ${prog.name}`, prog.duration, prog.fee, prog.avgPackage, progOrd, JSON.stringify(shortDescBlocks), now, now, now]
      );
      pubId = pub.insertId;
      console.log(`✨ Created Program: ${prog.name} (${prog.slug}) -> ${parentCourse.name}`);
    } else {
      const pub = existing.find((p) => p.published_at !== null);
      const drf = existing.find((p) => p.published_at === null);
      pubId = pub ? pub.id : existing[0].id;
      draftId = drf ? drf.id : existing[0].id;

      await conn.execute(
        'UPDATE programs SET name = ?, full_name = ?, duration = ?, fee = ?, average_package = ?, position = ?, updated_at = ? WHERE document_id = ?',
        [prog.name, `${parentCourse.name} in ${prog.name}`, prog.duration, prog.fee, prog.avgPackage, progOrd, now, docId]
      );
      console.log(`🔄 Updated Program: ${prog.name} (${prog.slug}) -> ${parentCourse.name}`);
    }

    programDbMap[prog.slug] = { draftId, pubId, docId, prog };

    // Link Program to Course
    for (const pId of [draftId, pubId]) {
      if (!pId) continue;
      const cId = pId === pubId ? parentCourse.pubId : parentCourse.draftId;
      await conn.execute('DELETE FROM programs_course_lnk WHERE program_id = ?', [pId]);
      await conn.execute('INSERT INTO programs_course_lnk (program_id, course_id, program_ord) VALUES (?, ?, ?)', [pId, cId, progOrd]);
    }

    // Link Program to Stream
    const streamName = masterCourses.find((c) => c.slug === prog.courseSlug)?.stream;
    const targetStream = streamMap[streamName];
    if (targetStream) {
      for (const pId of [draftId, pubId]) {
        if (!pId) continue;
        await conn.execute('DELETE FROM programs_stream_lnk WHERE program_id = ?', [pId]);
        await conn.execute('INSERT INTO programs_stream_lnk (program_id, stream_id) VALUES (?, ?)', [pId, targetStream.id]);
      }
    }

    progOrd++;
  }

  // 4. Fetch all 17 Universities in DB
  const [unis] = await conn.execute('SELECT id, document_id, name, slug, published_at FROM universities');
  console.log(`\n🏛️ Found ${unis.length / 2} unique Universities in DB.`);

  const uniMap = {};
  for (const u of unis) {
    if (!uniMap[u.slug]) uniMap[u.slug] = {};
    if (u.published_at !== null) uniMap[u.slug].pub = u;
    else uniMap[u.slug].draft = u;
  }

  // 5. University-to-Courses Mapping Definitions
  // Mapping which university offers which Course and Programs:
  const universityCourseMatrix = {
    'amity-university-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-ma', 'online-m-sc', 'online-ba', 'online-b-sc'],
    'chandigarh-university-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-m-com', 'online-ma', 'online-m-sc', 'online-ba'],
    'manipal-university-jaipur-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-m-com', 'online-ma'],
    'lpu-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-m-com', 'online-ma', 'online-m-sc', 'online-ba'],
    'nmims-online': ['online-mba', 'online-bba', 'online-b-com', 'online-executive-mba'],
    'dpu-pune-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca'],
    'dpu-navi-mumbai-online': ['online-mba', 'online-bba', 'online-b-sc'],
    'gla-university-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-m-com'],
    'parul-university-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-m-com', 'online-ma', 'online-m-sc', 'online-ba'],
    'shoolini-university-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-ma'],
    'sikkim-manipal-university-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-m-com', 'online-ma', 'online-ba'],
    'uttaranchal-university-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-ba', 'online-ma'],
    'vivekananda-global-university-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-m-com', 'online-m-sc'],
    'galgotias-university-online': ['online-mba', 'online-bba', 'online-mca', 'online-bca', 'online-b-com', 'online-m-com'],
    'kurukshetra-university-online': ['online-mba', 'online-mca', 'online-bba', 'online-bca', 'online-b-com', 'online-m-com', 'online-ma', 'online-ba'],
    'andhra-university-online': ['online-mba', 'online-mca', 'online-bba', 'online-b-com', 'online-m-com', 'online-ma', 'online-ba'],
    'op-jindal-global-university-online': ['online-mba', 'online-llm', 'online-ma'],
  };

  console.log('\n--- Mapping Courses & Programs to Universities ---');

  for (const [uniSlug, courseSlugs] of Object.entries(universityCourseMatrix)) {
    const uniEntry = uniMap[uniSlug];
    if (!uniEntry) {
      console.log(`⚠️ University ${uniSlug} not found in DB! Skipping...`);
      continue;
    }

    const draftUni = uniEntry.draft || uniEntry.pub;
    const pubUni = uniEntry.pub || uniEntry.draft;

    console.log(`\n🏛️ Linking Courses & Programs for: ${draftUni.name} (${uniSlug})`);

    // 1. Link Courses in universities_courses_lnk
    let cOrd = 1;
    for (const cSlug of courseSlugs) {
      const cObj = courseDbMap[cSlug];
      if (!cObj) continue;

      if (draftUni && cObj.draftId) {
        await conn.execute('DELETE FROM universities_courses_lnk WHERE university_id = ? AND course_id = ?', [draftUni.id, cObj.draftId]);
        await conn.execute('INSERT INTO universities_courses_lnk (university_id, course_id, course_ord) VALUES (?, ?, ?)', [draftUni.id, cObj.draftId, cOrd]);
      }
      if (pubUni && cObj.pubId) {
        await conn.execute('DELETE FROM universities_courses_lnk WHERE university_id = ? AND course_id = ?', [pubUni.id, cObj.pubId]);
        await conn.execute('INSERT INTO universities_courses_lnk (university_id, course_id, course_ord) VALUES (?, ?, ?)', [pubUni.id, cObj.pubId, cOrd]);
      }
      cOrd++;
    }
    console.log(`  ✓ Linked ${courseSlugs.length} Courses to University`);

    // 2. Link all programs of these courses to the University in programs_universities_lnk
    // Also fetch all 92 Online MBA programs + standard programs for these courses
    const [allProgsForCourses] = await conn.execute(
      `SELECT p.id, p.document_id, p.published_at 
       FROM programs p 
       JOIN programs_course_lnk pcl ON p.id = pcl.program_id 
       JOIN courses c ON pcl.course_id = c.id 
       WHERE c.slug IN (${courseSlugs.map(() => '?').join(',')})`,
      courseSlugs
    );

    let pOrd = 1;
    for (const p of allProgsForCourses) {
      const targetUni = p.published_at !== null ? pubUni : draftUni;
      if (!targetUni) continue;

      // Check if already linked
      const [existingLink] = await conn.execute(
        'SELECT id FROM programs_universities_lnk WHERE program_id = ? AND university_id = ?',
        [p.id, targetUni.id]
      );

      if (existingLink.length === 0) {
        await conn.execute(
          'INSERT INTO programs_universities_lnk (program_id, university_id, university_ord, program_ord) VALUES (?, ?, 1, ?)',
          [p.id, targetUni.id, pOrd]
        );
      }
      pOrd++;
    }
    console.log(`  ✓ Linked ${allProgsForCourses.length} Programs/Specialisations to University`);
  }

  await conn.end();
  console.log('\n======================================================');
  console.log('🎉 ALL MASTER COURSES, PROGRAMS & UNIVERSITIES SYNCED!');
  console.log('======================================================\n');
}

run().catch((err) => {
  console.error('❌ Sync error:', err);
  process.exit(1);
});
