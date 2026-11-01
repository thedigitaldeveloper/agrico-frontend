import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

function makeDocumentId() {
  return randomBytes(12).toString('hex');
}

const NEW_ONLINE_ARTICLES = [
  {
    name: 'Top 10 UGC-DEB Approved Online Universities in India (2026 Ranking & Review)',
    slug: 'top-ugc-deb-approved-online-universities-india-2026',
    description:
      'Complete evaluation of NAAC A++ accredited online universities in India offering valid online degrees, low semester fees, and verified placement assistance.',
    type: 'Articles',
    content: [
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Top UGC-DEB Approved Online Universities in India for 2026' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Online higher education in India has witnessed explosive growth, backed by progressive University Grants Commission (UGC) and Distance Education Bureau (DEB) regulations. Choosing a recognized institution guarantees that your degree holds 100% equivalence to an on-campus degree for both government employment and corporate careers.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '1. Criteria for Evaluating Online Universities' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Key factors include NAAC accreditation (preferably A+ or A++), NIRF rankings, statutory AICTE approvals for technical programs (MCA/MBA), and active LMS portals with live interactive weekend classes.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '2. Top Ranked Online Universities' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Leading institutions include Manipal University Jaipur Online, Amity University Online, Chandigarh University Online, Dr. D.Y. Patil Vidyapeeth Pune, Lovely Professional University Online, and Sikkim Manipal University.',
          },
        ],
      },
    ],
  },
  {
    name: 'Online MBA vs Regular MBA: Degree Validity, Salary & Corporate Scope',
    slug: 'online-mba-vs-regular-mba-validity-salary-scope',
    description:
      'Understand how UGC-DEB recognizes online MBAs on par with on-campus programs, corporate hiring acceptance across MNCs, and ROI comparisons.',
    type: 'Articles',
    content: [
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Is an Online MBA as Valuable as a Regular On-Campus MBA?' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'As per the UGC Gazette Notification (September 2022), degrees acquired through Open and Distance Learning (ODL) and Online modes from recognized Higher Education Institutions are treated as equivalent to corresponding degrees awarded through conventional on-campus modes.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '1. Flexibility & Career Continuity' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Working professionals can pursue specialized MBA tracks (Marketing, Finance, HR, IT & FinTech) without taking a career sabbatical, maintaining their existing salary while upgrading executive leadership credentials.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '2. Cost and ROI Advantage' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'An online MBA costs roughly ₹1.2 Lakh to ₹2.5 Lakh in total fees compared to ₹10 Lakh to ₹25 Lakh for top-tier full-time programs, delivering unparalleled return on investment.',
          },
        ],
      },
    ],
  },
  {
    name: 'Is an Online Degree Valid for Government Jobs, WES & Foreign Visas?',
    slug: 'is-online-degree-valid-for-govt-jobs-wes-foreign-visas',
    description:
      'Detailed breakdown of statutory recognitions: UPSC/SSC exam eligibility, state PSC validity, and WES credential evaluation for international study and PR visas.',
    type: 'Articles',
    content: [
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Statutory Validity of Online Degrees in India & Abroad' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'One of the most common questions from students is whether an online degree is eligible for public sector recruitment and international immigration.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '1. Government Jobs & Competitive Exams' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Graduates from UGC-DEB approved online programs are fully eligible to appear for UPSC Civil Services, SSC CGL, Banking (IBPS/SBI), Railways (RRB), and state PSC examinations without any discrimination.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '2. WES and Foreign Credential Evaluation' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'World Education Services (WES), AIU, and international credential evaluators accept transcripts from UGC-DEB accredited Indian universities for Canadian Express Entry, study visas in the UK, USA, and Australia.',
          },
        ],
      },
    ],
  },
  {
    name: 'Best Online MCA & BCA Specializations for High-Paying Tech Careers',
    slug: 'best-online-mca-bca-specializations-high-paying-tech-jobs',
    description:
      'Explore in-demand technology specializations including AI & Machine Learning, Cloud Computing, Data Science, and Full Stack Development with zero-interest EMI.',
    type: 'Articles',
    content: [
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Modern Tech Specializations in Online MCA and BCA' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'The tech industry values demonstrated skills and hands-on coding aptitude above all. UGC-DEB online MCA and BCA programs now integrate industry-aligned curricula directly supported by tech leaders.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '1. Artificial Intelligence & Machine Learning' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Learn Python, TensorFlow, PyTorch, and NLP models with live cloud sandbox environments to prepare for AI engineer and ML developer roles.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '2. Data Science & Big Data Analytics' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Master SQL, PowerBI, Tableau, and statistical predictive modeling to transition into lucrative data analyst and business intelligence positions.',
          },
        ],
      },
    ],
  },
  {
    name: 'Online Degree vs Distance Degree: Key Differences & LMS Experience',
    slug: 'online-degree-vs-distance-education-key-differences',
    description:
      'Comparing digital LMS platforms, live interactive weekend lectures, continuous online proctored examinations, and degree certificates between online and distance modes.',
    type: 'Articles',
    content: [
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'How Online Learning Differs from Traditional Distance Education' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'While both formats offer remote learning, modern Online Degree programs represent a massive technological evolution over legacy distance correspondence courses.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '1. Learning Management System (LMS) vs Printed Postal Books' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Online degree students get 24x7 mobile app access, HD recorded lectures, e-libraries, interactive discussion forums, and weekly live doubt-clearing sessions with university professors.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: '2. Online Proctored Exams vs Physical Exam Centers' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Distance education requires traveling to designated physical examination centers, whereas online degrees permit students to take AI-proctored online exams safely from the comfort of their homes.',
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log('🔄 Connecting to MySQL to update Articles collection...');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  // 1. Remove old irrelevant engineering / btech / regular MBA seed articles
  const deleteSlugs = [
    'how-to-choose-the-right-engineering-college-in-2026',
    'mba-vs-pgdm-which-one-should-you-pick',
    'a-day-in-the-life-of-a-first-year-b-tech-student',
  ];

  for (const slug of deleteSlugs) {
    await conn.execute('DELETE FROM blogs WHERE slug = ?', [slug]);
    console.log(`🗑️ Deleted irrelevant article: ${slug}`);
  }

  // 2. Insert the 5 high-converting Online Education articles
  const now = new Date();
  for (let i = 0; i < NEW_ONLINE_ARTICLES.length; i++) {
    const art = NEW_ONLINE_ARTICLES[i];
    // Stagger dates slightly for realistic publication trail
    const postDate = new Date(now.getTime() - i * 86400000 * 2);

    const [existing] = await conn.execute('SELECT id FROM blogs WHERE slug = ?', [art.slug]);
    const jsonBody = JSON.stringify(art.content);

    if (existing.length === 0) {
      const docId = makeDocumentId();
      await conn.execute(
        `INSERT INTO blogs (document_id, name, slug, description, type, long_description, date_time, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          docId,
          art.name,
          art.slug,
          art.description,
          art.type,
          jsonBody,
          postDate,
          postDate,
          postDate,
          postDate,
        ]
      );
      console.log(`✨ Created article: ${art.name}`);
    } else {
      await conn.execute(
        `UPDATE blogs SET name = ?, description = ?, type = ?, long_description = ?, date_time = ?, updated_at = ?, published_at = ?
         WHERE slug = ?`,
        [
          art.name,
          art.description,
          art.type,
          jsonBody,
          postDate,
          postDate,
          postDate,
          art.slug,
        ]
      );
      console.log(`🔄 Updated article: ${art.name}`);
    }
  }

  console.log('🎉 Successfully published 5 comprehensive Online Education articles in MySQL database!');
  await conn.end();
}

main().catch(console.error);
