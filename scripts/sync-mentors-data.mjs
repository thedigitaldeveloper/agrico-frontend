import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

function makeDocId() {
  return crypto.randomBytes(12).toString('hex').toLowerCase();
}

async function main() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  console.log('Connected to MySQL geduconnect database.');

  // Fetch streams to link
  const [streams] = await c.query('SELECT id, document_id, name, slug FROM streams WHERE published_at IS NOT NULL');
  const mgmtStream = streams.find(s => s.slug === 'management') || streams[0];
  const itStream = streams.find(s => s.slug === 'information-technology' || s.slug === 'computer-applications' || s.slug === 'engineering') || streams[0];
  const commStream = streams.find(s => s.slug === 'commerce' || s.slug === 'commerce-banking') || streams[0];
  const sciStream = streams.find(s => s.slug === 'science') || streams[0];

  // Fetch courses to link
  const [courses] = await c.query('SELECT id, document_id, name, slug FROM courses WHERE published_at IS NOT NULL');

  const MENTOR_DATA = [
    {
      slug: 'asha-verma',
      display_name: 'Asha Verma',
      headline: 'Senior Academic Counsellor · 12+ Years in UGC-DEB Online Degrees & Career Guidance',
      bio: `Asha Verma is a veteran Higher Education Consultant with over 12 years of experience assisting students and working professionals in selecting the right UGC-DEB entitled online degree programs. 

Her core expertise lies in evaluating accreditation frameworks (NAAC A++, NIRF rankings, WES equivalence), analyzing curriculum structures across top online universities, and matching candidate career aspirations with market demand.

Specializations:
- Comprehensive head-to-head comparison between top online universities (Manipal, Amity, Chandigarh, D.Y. Patil, Jain).
- Degree validity analysis for central/state government recruitments (UPSC, SSC, Banking).
- Guidance on semester exam proctoring, credit transfer, and flexible learning schedules.
- Over 1,200+ students and working professionals successfully guided into accredited master's and bachelor's programs.`,
      experience_years: 12,
      languages: 'English, Hindi',
      session_minutes: 30,
      is_accepting_bookings: true,
      streams: [itStream, mgmtStream],
      courses: courses.filter(co => ['online-mca', 'online-bca', 'online-mba', 'online-bba'].includes(co.slug)),
    },
    {
      slug: 'rohit-nair',
      display_name: 'Rohit Nair',
      headline: 'Ex-Corporate HR & Online MBA Advisor · Executive Career Transition Specialist',
      bio: `Rohit Nair brings 9+ years of industry experience across corporate talent acquisition and executive MBA mentorship. Having worked closely with Fortune 500 recruiting teams and university admission councils, Rohit guides professionals on career ROI, specialization selection (Product Management, Business Analytics, Finance, Digital Marketing), and corporate degree recognition.

Specializations:
- Choosing between Online MBA vs Executive MBA vs Regular PGDM.
- Career transition strategies for tech professionals moving into product and leadership roles.
- Salary benchmarking, recruitment trends, and virtual placement drive support.
- Evaluating university-industry tie-ups and global accreditations (AACSB, AMBA, WES).`,
      experience_years: 9,
      languages: 'English, Hindi, Malayalam',
      session_minutes: 30,
      is_accepting_bookings: true,
      streams: [mgmtStream, commStream],
      courses: courses.filter(co => ['online-mba', 'online-bba', 'online-b-com'].includes(co.slug)),
    },
    {
      slug: 'fatima-sheikh',
      display_name: 'Dr. Fatima Sheikh',
      headline: 'Academic Researcher & Data Science/Tech Degree Specialist · PhD in Computational Sciences',
      bio: `Dr. Fatima Sheikh is an academician and technology education consultant with 8+ years of mentoring experience in Computer Applications, Data Science, AI, and Science programs. She assists learners in understanding curriculum rigor, hands-on lab infrastructure, capstone projects, and international credential assessment (WES / ECE) for overseas higher studies and PR pathways.

Specializations:
- Deep evaluation of Online MCA, BCA, and M.Sc Computer Science curriculums.
- Cloud computing, Full-Stack, and AI/ML specialization roadmaps.
- International transcript verification and credential evaluations for Canada, US, and UK.`,
      experience_years: 8,
      languages: 'English, Hindi, Urdu',
      session_minutes: 30,
      is_accepting_bookings: true,
      streams: [itStream, sciStream],
      courses: courses.filter(co => ['online-mca', 'online-bca', 'online-m-sc'].includes(co.slug)),
    },
    {
      slug: 'dr-rameshwar-sharma',
      display_name: 'Dr. Rameshwar Sharma',
      headline: 'Former University Registrar & UGC Regulatory Advisor · 15+ Years in Higher Education',
      bio: `Dr. Rameshwar Sharma is a senior education policy advisor with 15+ years of leadership in statutory university compliance, NAAC accreditation reviews, and UGC Distance Education Bureau (DEB) frameworks. He offers authoritative counsel on degree parity, dual-degree regulations, government job eligibility, and legal verification of online credentials.

Specializations:
- Gazette notification compliance and degree equivalence for State PSCs and UPSC.
- Dual degree UGC guidelines (pursuing regular and online degrees simultaneously).
- Verification of official university entitlement notices.`,
      experience_years: 15,
      languages: 'English, Hindi',
      session_minutes: 30,
      is_accepting_bookings: true,
      streams: [mgmtStream, commStream],
      courses: courses.slice(0, 4),
    },
  ];

  for (const m of MENTOR_DATA) {
    // Check if mentor exists
    const [existing] = await c.query('SELECT id, document_id FROM mentor_profiles WHERE slug = ?', [m.slug]);
    const now = new Date();

    let docId;
    if (existing.length > 0) {
      docId = existing[0].document_id;
      await c.query(
        `UPDATE mentor_profiles SET 
          display_name = ?, headline = ?, bio = ?, experience_years = ?, languages = ?, 
          session_minutes = ?, is_accepting_bookings = ?, updated_at = ?
         WHERE document_id = ?`,
        [m.display_name, m.headline, m.bio, m.experience_years, m.languages, m.session_minutes, m.is_accepting_bookings ? 1 : 0, now, docId]
      );
      console.log(`Updated mentor profile: ${m.display_name}`);
    } else {
      docId = makeDocId();
      // Insert Draft
      await c.query(
        `INSERT INTO mentor_profiles 
          (document_id, slug, display_name, headline, bio, experience_years, languages, session_minutes, is_accepting_bookings, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        [docId, m.slug, m.display_name, m.headline, m.bio, m.experience_years, m.languages, m.session_minutes, m.is_accepting_bookings ? 1 : 0, now, now]
      );
      // Insert Published
      await c.query(
        `INSERT INTO mentor_profiles 
          (document_id, slug, display_name, headline, bio, experience_years, languages, session_minutes, is_accepting_bookings, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [docId, m.slug, m.display_name, m.headline, m.bio, m.experience_years, m.languages, m.session_minutes, m.is_accepting_bookings ? 1 : 0, now, now, now]
      );
      console.log(`Created mentor profile: ${m.display_name}`);
    }

    // Link Streams
    const [mRows] = await c.query('SELECT id FROM mentor_profiles WHERE document_id = ?', [docId]);
    for (const row of mRows) {
      for (const st of m.streams) {
        if (st?.id) {
          await c.query('INSERT IGNORE INTO mentor_profiles_streams_lnk (mentor_profile_id, stream_id) VALUES (?, ?)', [row.id, st.id]);
        }
      }
      for (const co of m.courses) {
        if (co?.id) {
          await c.query('INSERT IGNORE INTO mentor_profiles_courses_lnk (mentor_profile_id, course_id) VALUES (?, ?)', [row.id, co.id]);
        }
      }
    }
  }

  console.log('Successfully updated all mentor profiles with rich online higher education credentials!');
  await c.end();
}

main().catch(console.error);
