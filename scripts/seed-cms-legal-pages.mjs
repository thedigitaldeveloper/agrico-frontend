import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

const PRIVACY_POLICY_BLOCKS = [
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'At GeduConnect (operated as an independent education portal), we value your trust and are strictly committed to protecting the privacy and confidentiality of students, working professionals, and website visitors. This Privacy Policy explains our practices regarding data collection, usage, sharing, and security in accordance with the Digital Personal Data Protection (DPDP) Act 2023 and the Information Technology Act, 2000.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '1. Information We Collect' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'We only collect information that is strictly necessary to assist you with unbiased university evaluation, eligibility checks, and direct admission inquiries:'
      }
    ]
  },
  {
    type: 'list',
    format: 'unordered',
    children: [
      {
        type: 'list-item',
        children: [{ type: 'text', text: 'Personal Identification Data: Full name, email address, mobile number, date of birth, state, and city.' }]
      },
      {
        type: 'list-item',
        children: [{ type: 'text', text: 'Academic Details: Highest educational qualification, graduation stream, passing year, and percentage/CGPA for degree eligibility verification.' }]
      },
      {
        type: 'list-item',
        children: [{ type: 'text', text: 'Preferences: Selected online programs (e.g., Online MBA, MCA, BBA), budget range, preferred universities, and learning format.' }]
      },
      {
        type: 'list-item',
        children: [{ type: 'text', text: 'Technical & Usage Data: IP address, browser type, device information, and pages visited via aggregated analytics.' }]
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '2. Purpose and Use of Collected Information' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'Your personal data is used solely for the following legitimate purposes:'
      }
    ]
  },
  {
    type: 'list',
    format: 'unordered',
    children: [
      {
        type: 'list-item',
        children: [{ type: 'text', text: 'Connecting you with certified academic counselors for free, unbiased university selection advice.' }]
      },
      {
        type: 'list-item',
        children: [{ type: 'text', text: 'Processing Common Application Form (CAF) submissions directly to your chosen UGC-DEB entitled university.' }]
      },
      {
        type: 'list-item',
        children: [{ type: 'text', text: 'Sending crucial admission deadline alerts, semester fee breakdowns, and statutory degree equivalence notices.' }]
      },
      {
        type: 'list-item',
        children: [{ type: 'text', text: 'Improving platform usability, search speed, and neutral college comparison algorithms.' }]
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '3. Zero-Spam Guarantee & No Third-Party Data Selling' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'We maintain a strict Anti-Spam and Student Protection Policy. GeduConnect never sells, rents, leases, or trades your personal information or contact details to third-party telemarketers, spam lead brokers, or unauthorized coaching institutes. Your details are only shared with the specific university/authorized admission cell that you explicitly select on our portal.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '4. Cookies and Tracking Technologies' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'We use essential session cookies and performance telemetry to maintain user sessions, remember filter selections on comparison tables, and understand portal traffic. You can choose to disable cookies through your browser settings, though some interactive features may operate with reduced functionality.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '5. Data Security & Storage' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'We employ industry-standard 256-bit SSL encryption, restricted role-based database access, and secure cloud infrastructure to prevent unauthorized access, loss, or alteration of your personal data.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '6. Student Rights & Data Deletion Requests' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'You have the full right to access, rectify, or request permanent deletion of your contact information from our databases at any time. To exercise these rights or lodge a privacy concern, please email our Data Privacy Officer at contact@geduconnect.com.'
      }
    ]
  }
];

const TERMS_CONDITIONS_BLOCKS = [
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'Welcome to GeduConnect. By accessing, browsing, or using this website, you agree to comply with and be bound by the following Terms and Conditions of Use. If you do not agree with any part of these terms, please do not use our services.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '1. Nature of Platform & Non-Affiliation' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'GeduConnect is an independent educational technology platform and comparison aggregator designed to help students evaluate UGC-DEB recognized online university degree programs. GeduConnect is NOT a university, degree-granting college, or distance education center. We do not formulate curriculum, conduct university examinations, or issue degrees directly.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '2. Accuracy of University Information & Fee Figures' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'While we make every reasonable effort to ensure that tuition fees, NAAC grades, NIRF ranks, UGC entitlements, and admission eligibility criteria displayed on our portal are verified and up-to-date, these details are sourced from public university notifications, NIRF disclosures, and statutory gazettes. Respective universities reserve the right to modify fee structures, admission intake dates, and course curricula without prior notice.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '3. Direct Admission & Surcharge-Free Policy' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'GeduConnect facilitates direct, transparent connection between students and partner universities. We do not levy any additional platform fee, middlemen surcharge, or hidden processing charges on students. Tuition fees are payable directly through the official university payment gateway.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '4. User Conduct and Common Application Form' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'When submitting inquiries or using the Common Application Form (CAF), you agree to provide true, accurate, and current personal and academic information. Submitting fraudulent details, spam requests, or unauthorized impersonation of another individual will result in immediate termination of access.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '5. Intellectual Property' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'All portal architecture, comparative matrices, graphic UI designs, editorial articles, and logos belonging to GeduConnect are protected under Indian and international copyright and intellectual property laws. Third-party university logos, trademarks, and statutory accreditations belong to their respective statutory owners.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '6. Limitation of Liability' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'Under no circumstances shall GeduConnect or its officers be liable for any direct, indirect, incidental, or consequential damages resulting from university admission decisions, academic performance, visa rejections, or career outcomes.'
      }
    ]
  }
];

const DISCLAIMER_BLOCKS = [
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'The information provided by GeduConnect is for general educational comparison, counseling guidance, and decision-support purposes only. Please read this statutory disclosure carefully.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '1. Neutrality Charter & Independent Aggregation' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'GeduConnect operates under a zero-bias neutrality charter. Our side-by-side college comparison tools, semester fee analyzers, and course ratings are compiled using objective criteria including UGC-DEB entitlement status, NAAC accreditation tier, AICTE approvals, and NIRF rankings. We do not promote unaccredited programs or misrepresent conventional vs online degree equivalence.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '2. Statutory Degree Equivalence (UGC-DEB)' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'As per UGC (Open and Distance Learning Programmes and Online Programmes) Regulations, degrees conferred through online and distance modes by recognized Higher Educational Institutions (HEIs) are treated at par with degrees acquired through conventional campus mode for higher education, central/state government employment (UPSC, SSC, Banking, State PSCs), and private corporate recruitments. However, students are advised to confirm specific professional regulatory requirements (e.g. Bar Council, Medical Council) for technical or specialized career paths.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '3. Trademarks & Brand Ownership' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'All university names, brand marks, logos, and acronyms displayed on GeduConnect are the registered intellectual property of their respective universities and statutory bodies. Their display on this website is solely for identification, academic evaluation, and public informational purposes.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '4. No Admission Guarantee' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'While our academic counselors provide guidance on document readiness and application processing, final admission decisions, credit transfers, and degree awards remain at the sole discretion of the respective university admission committee.'
      }
    ]
  },
  {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text: '5. Contact for Legal Notices' }]
  },
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: 'For any formal clarification, regulatory queries, or institutional representations, please write to us at legal@geduconnect.com.'
      }
    ]
  }
];

async function updateLegalPages() {
  console.log('Connecting to MySQL database geduconnect ...');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect'
  });

  const updates = [
    {
      slug: 'privacy-policy',
      name: 'Privacy Policy & Student Data Protection',
      description: JSON.stringify(PRIVACY_POLICY_BLOCKS)
    },
    {
      slug: 'terms-and-conditions',
      name: 'Terms and Conditions of Use',
      description: JSON.stringify(TERMS_CONDITIONS_BLOCKS)
    },
    {
      slug: 'disclaimer',
      name: 'Neutrality Charter & Legal Disclaimer',
      description: JSON.stringify(DISCLAIMER_BLOCKS)
    }
  ];

  for (const item of updates) {
    const [result] = await conn.query(
      'UPDATE legals SET name = ?, description = ?, updated_at = NOW() WHERE slug = ?',
      [item.name, item.description, item.slug]
    );
    console.log(`Updated ${item.slug}: affected ${result.affectedRows} rows in legals table.`);
  }

  await conn.end();
  console.log('\nAll legal pages successfully updated in CMS database!');
}

updateLegalPages().catch(console.error);
