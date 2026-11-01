import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const HERO_SLIDES = [
  {
    eyebrow: null,
    heading: null,
    description: null,
    media_type: 'image',
    desktop_image: 3,
    mobile_image: 8,
    link: '/universities',
    link_target: 'self',
    cta_label: null,
  },
  {
    eyebrow: null,
    heading: null,
    description: null,
    media_type: 'image',
    desktop_image: 4,
    mobile_image: 6,
    link: '/compare',
    link_target: 'self',
    cta_label: null,
  },
  {
    eyebrow: null,
    heading: null,
    description: null,
    media_type: 'image',
    desktop_image: 7,
    mobile_image: 5,
    link: '/programs',
    link_target: 'self',
    cta_label: null,
  },
];

const TRENDING_PROGRAMS = [
  { label: 'Online MBA', link: '/programs?category=online-mba', is_featured: true },
  { label: 'Online MCA', link: '/programs?category=online-mca', is_featured: true },
  { label: 'Executive MBA', link: '/programs?category=executive-mba', is_featured: false },
  { label: 'Online BBA', link: '/programs?category=online-bba', is_featured: false },
  { label: 'Online BCA', link: '/programs?category=online-bca', is_featured: false },
  { label: 'Data Science & AI', link: '/programs?category=data-science', is_featured: true },
  { label: 'Digital Marketing', link: '/programs?category=digital-marketing', is_featured: false },
];

const STATS_STRIP = [
  {
    value: '100+',
    label: 'UGC Approved Universities',
    description: 'Verified Statutory Approvals',
    accent_color: 'gold',
  },
  {
    value: '500+',
    label: 'Accredited Degree Programs',
    description: 'Online & Distance Learning',
    accent_color: 'brand',
  },
  {
    value: '₹0',
    label: '100% Free Impartial Counseling',
    description: 'No Hidden Fees or Pressure',
    accent_color: 'emerald',
  },
  {
    value: '50,000+',
    label: 'Students Guided Successfully',
    description: 'Across 28 Indian States',
    accent_color: 'purple',
  },
];

const WHY_GEDU_CARDS = [
  {
    title: '100% Verified Statutory Approvals',
    tag: 'Govt Gazette Proofs',
    description:
      'We display direct UGC-DEB, AICTE, and NAAC verification links so you never fall for unauthorized degrees or fake university claims.',
    points: [
      'Direct links to UGC-DEB statutory portal',
      'Real NAAC accreditation certificates displayed',
      'NIRF Rankings verified against official records',
    ],
    icon_name: 'ShieldCheck',
  },
  {
    title: 'Unbiased, Commission-Free Matching',
    tag: 'Zero Sales Pressure',
    description:
      'Unlike agents who push universities offering highest commissions, our recommendations are 100% student-centric and budget-aligned.',
    points: [
      'Transparent fee breakdown with no hidden charges',
      'Objective comparison on 15+ academic parameters',
      'AI-assisted shortlist tailored to your budget',
    ],
    icon_name: 'Scale',
  },
  {
    title: 'Expert 1-on-1 Academic Counseling',
    tag: 'Certified Mentors',
    description:
      'Get dedicated support from certified academic counselors throughout your admission journey, completely free of charge.',
    points: [
      'Live call & WhatsApp support from expert advisors',
      'Complete assistance with application forms & docs',
      'Scholarship & EMI fee installment guidance',
    ],
    icon_name: 'Users',
  },
  {
    title: 'One Form, Multiple University Choices',
    tag: 'Single Application',
    description:
      'Fill our common application form once and connect directly with all shortlisted universities without repetitive paperwork or telemarketing spam.',
    points: [
      'Zero Spam Call Guarantee with strict data privacy',
      'Fast-track direct university portal review',
      'Dedicated document & eligibility support',
    ],
    icon_name: 'FileText',
  },
];

const COMPARISON_MATRIX = [
  {
    factor: 'University Recommendations',
    gedu_value: 'Based 100% on your budget, career goals, and UGC-DEB compliance',
    competitor_value: 'Pushes high-commission tie-up universities regardless of student fit',
  },
  {
    factor: 'Govt Approval Proofs',
    gedu_value: 'Live statutory links & UGC gazette documents on every university page',
    competitor_value: 'Vague marketing claims with no direct government verification links',
  },
  {
    factor: 'Counseling & Advisory Fee',
    gedu_value: '₹0 — 100% Free guidance with zero hidden sales charges or spam',
    competitor_value: 'Hidden charges, paid application packs, or high-pressure telemarketing',
  },
  {
    factor: 'Post-Admission Support',
    gedu_value: 'Dedicated mentor support for LMS access, exams, and degree queries',
    competitor_value: 'Disappears immediately after taking the commission from university',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step_number: '01',
    badge: 'Step 1: Explore',
    title: 'Discover by Stream & Career Goals',
    description:
      'Browse 500+ accredited online UG and PG degree programs across Management, IT, Commerce, Arts, and Data Science.',
    highlights: [
      'Filter by specialization, duration & fee budget',
      'Instant eligibility check for working professionals',
    ],
    icon_name: 'Search',
  },
  {
    step_number: '02',
    badge: 'Step 2: Compare',
    title: 'Compare Approvals, Fees & Faculty',
    description:
      'Place up to 4 universities side-by-side to compare UGC-DEB approvals, NAAC grades, syllabus, EMI plans, and placement records.',
    highlights: [
      'Side-by-side fee & EMI comparison matrix',
      'Statutory government approval verification',
    ],
    icon_name: 'GitCompare',
  },
  {
    step_number: '03',
    badge: 'Step 3: Consult',
    title: 'Free 1-on-1 Expert Counseling',
    description:
      'Speak with our unbiased education counselors to resolve doubts about curriculum, exams, and degree validity for govt jobs & MNCs.',
    highlights: [
      'Zero sales pressure, 100% free guidance',
      'Assistance with EMI financing & scholarships',
    ],
    icon_name: 'PhoneCall',
  },
  {
    step_number: '04',
    badge: 'Step 4: Enroll',
    title: 'Direct University Enrollment',
    description:
      'Submit your Common Application Form to receive official admission confirmation directly from the accredited university portal.',
    highlights: [
      'Official student portal enrollment support',
      'Zero intermediary application fees',
    ],
    icon_name: 'GraduationCap',
  },
];

const FAQS = [
  {
    question: 'Are online and distance degrees valid for government jobs in India?',
    answer:
      'Yes! As per UGC Regulation Notification No. F. 1-24/2021 (DEB-I), degrees obtained through Online and Distance Learning (ODL) modes from UGC-DEB recognized Higher Educational Institutions (HEIs) are treated as fully equivalent to conventional on-campus degrees for employment in Central/State Government jobs, UPSC, PSC exams, and higher education.',
  },
  {
    question: 'How do I verify if an online university has valid UGC-DEB approval?',
    answer:
      'You can verify any university by visiting the official UGC-DEB web portal (deb.ugc.ac.in). On GeduConnect, every single university listing includes direct statutory approval links and Gazette notification numbers so you can cross-verify them with one click.',
  },
  {
    question: 'Does GeduConnect charge students for counseling or comparisons?',
    answer:
      'No, GeduConnect is 100% free for students. You can search, compare, download syllabus brochures, and speak with expert academic counselors without paying any consultation or registration fees.',
  },
  {
    question: 'Can I pay my degree fees in easy monthly EMI installments?',
    answer:
      'Yes, most of our partner accredited universities offer 0% interest EMI options with 3 to 12 monthly installments. Our advisors can help you apply for zero-cost EMI plans during your admission process.',
  },
  {
    question: 'How does GeduConnect ensure unbiased university recommendations?',
    answer:
      'Our recommendation algorithm and counseling framework evaluate universities solely on UGC-DEB approvals, NAAC grades, student reviews, course curriculum, and fee value — not by promoting universities based on commercial agent commissions.',
  },
  {
    question: 'Can working professionals balance an online degree with their jobs?',
    answer:
      'Absolutely. Online degree programs provide asynchronous recorded lectures, weekend live interactive sessions, 24/7 LMS access, and remote proctored online exams designed specifically for working professionals.',
  },
];

const WHY_GEDU_SECTION = {
  eyebrow: 'The GeduConnect Advantage',
  heading: 'Why Over 1,00,000+ Students Trust GeduConnect',
  description:
    'Transparent, data-backed guidance on online universities and degrees — without the brochure sales pitch or hidden agendas.',
  micro_badges: [
    'Zero Sales Bias',
    'Direct Govt Gazette Verification',
    '100% Free for Students',
  ],
  cards: WHY_GEDU_CARDS,
  comparison_heading: 'How GeduConnect Compares with Commission Agents',
  comparison_badge: 'Transparency Guarantee',
  comparison_matrix: COMPARISON_MATRIX,
  primary_cta_label: 'Compare 100+ Universities Free',
  primary_cta_link: '/compare',
  secondary_cta_label: 'How We Verify Universities',
  secondary_cta_link: '/about-us',
};

const HOW_IT_WORKS_SECTION = {
  eyebrow: 'Simple 3-Step Journey',
  heading: 'How GeduConnect Works',
  description:
    'From discovering the right online degree to unbiased counseling and admission — 100% free for students.',
  steps: HOW_IT_WORKS_STEPS,
  cta_label: 'Start Free Application',
  cta_link: '/common-application-form',
};

const UNIVERSITIES_HEADER = {
  eyebrow: 'Verified Institutions',
  heading: 'Top Online & Distance Universities',
  description:
    'Every listing carries statutory UGC-DEB approvals, NAAC ratings, and fee transparency in the open.',
  badges: [
    '100% UGC-DEB Entitled',
    'NAAC A++ / A+ Accredited',
    '0% No-Cost EMI Available',
  ],
  cta_label: 'Explore All 100+ Universities',
  cta_link: '/universities',
};

const COMPARE_HEADER = {
  eyebrow: 'Side-by-Side Comparison',
  heading: 'Compare Universities in 1 Table',
  description:
    'Select 2 or 3 universities to evaluate fees, UGC approvals, rankings, and placement records side by side.',
  cta_label: 'Compare Now',
};

const TESTIMONIALS_HEADER = {
  eyebrow: 'Verified Student Experiences',
  heading: 'What Students Say About GeduConnect',
  description:
    'Real reviews from learners who compared UGC-DEB universities and enrolled with 100% confidence.',
  badges: [
    '4.9/5 Learner Rating',
    '100% Genuine Enrollments',
    'Working Professionals & Freshers',
  ],
};

const MENTORS_HEADER = {
  eyebrow: '100% Free 1-on-1 Guidance',
  heading: 'Talk to an Admission Mentor',
  description:
    'Book a free 1-on-1 session with alumni and academic advisors who have navigated the same university admissions.',
  cta_label: 'View All Mentors',
  cta_link: '/mentors',
};

const SCHOLARSHIPS_HEADER = {
  eyebrow: 'Lower the cost',
  heading: 'Scholarships & Financial Aid',
  description: 'Explore funding and fee concessions you may already be eligible for.',
  cta_label: 'Explore Scholarships',
  cta_link: '/scholarships',
};

const EXAMS_HEADER = {
  eyebrow: 'Plan ahead',
  heading: 'Entrance Exams to Plan For',
  description: 'Form windows, exam dates and eligibility, tracked in one place.',
  cta_label: 'Explore Entrance Exams',
  cta_link: '/exams',
};

const QNA_HEADER = {
  eyebrow: 'Community Knowledge Hub',
  heading: 'Common Questions Answered by Mentors',
  description:
    'Verified answers from senior academic counselors on UGC approvals, exam modes, and degree validity.',
  badges: ['Govt Job Validity', 'Online Exam Procedures', 'No-Cost EMI Policies'],
  cta_label: 'Browse All Questions',
  cta_link: '/qna',
};

const FAQS_HEADER = {
  eyebrow: 'Frequently Asked Questions',
  heading: 'Everything You Need to Know',
  description:
    'Answers to common questions about online degree validity, UGC approvals, EMI options, and counseling.',
  badges: ['UGC-DEB Regulations', '0% Interest EMI Plans', 'Government Job Acceptance'],
  cta_label: 'Still have questions? Ask on Community Hub',
  cta_link: '/qna',
};

const ARTICLES_HEADER = {
  eyebrow: 'Expert Knowledge Base',
  heading: 'Latest Admission Guides & Insights',
  description:
    'In-depth university comparisons, career roadmaps, and admission explainers authored by senior academic counselors.',
  badges: [
    'Step-by-Step Roadmaps',
    'UGC-DEB Gazette Proofs',
    'Salary & ROI Breakdown',
  ],
  cta_label: 'Explore All Admission Guides & Articles',
  cta_link: '/articles',
};

const COURSE_FINDER = {
  eyebrow: 'Dynamic Program Discovery',
  heading: 'Explore Online Programs by Goal & Stream',
  description:
    'Start from your current career stage or qualification — then narrow live by budget, duration, and study mode.',
  feature_badges: [
    'All Specializations Included',
    'Live Monthly EMI Calculations',
    'Working Professional Friendly',
  ],
  budget_caps: [50000, 100000, 200000, 500000, 1000000],
  tabs: [
    {
      key: 'fresh-graduate',
      label: 'Fresh graduate',
      note: 'Start right after your degree',
      filter_criteria: 'postgraduate',
    },
    {
      key: 'after-12th',
      label: 'After 12th',
      note: 'Your first online degree',
      filter_criteria: 'undergraduate',
    },
    {
      key: 'career-switcher',
      label: 'Career switcher',
      note: 'Move into AI, data or tech',
      filter_criteria: 'tech-ai',
    },
    {
      key: 'working-professional',
      label: 'Working professional',
      note: 'Weekends & self-paced',
      filter_criteria: 'working-professional',
    },
    {
      key: 'managers-leaders',
      label: 'Managers & leaders',
      note: 'Executive MBA and beyond',
      filter_criteria: 'managers-leaders',
    },
    {
      key: 'doctorate',
      label: 'Doctorate',
      note: 'PhD & DBA with work experience',
      filter_criteria: 'doctorate',
    },
  ],
};

const BOTTOM_BANNER = {
  eyebrow: '1-on-1 Academic Counseling',
  heading: 'Still Deciding? Talk to an Expert Advisor.',
  description:
    'Free, honest guidance on courses, UGC-DEB approvals, fee comparisons, and admission forms — with zero sales pressure.',
  primary_cta_label: 'Get Free Guidance',
  primary_cta_link: '/common-application-form',
  secondary_cta_label: 'Contact Us',
  secondary_cta_link: '/contact-us',
};

async function seedHomepage() {
  console.log('Seeding Strapi Home content...');
  // Since Strapi is running with MySQL, we can directly bootstrap Strapi from backend directory or use Strapi documents API
  const strapiPackage = require('d:/geduconnectbknd/node_modules/@strapi/strapi');
  const { createStrapi, compileStrapi } = strapiPackage;

  process.chdir('d:/geduconnectbknd');
  const appContext = await compileStrapi();
  const strapi = await createStrapi(appContext).load();

  try {
    const home = await strapi.documents('api::home.home').findFirst({
      status: 'draft',
      populate: {
        hero_slides: { populate: '*' },
      },
    });

    const homePublished = await strapi.documents('api::home.home').findFirst({
      status: 'published',
      populate: {
        hero_slides: { populate: '*' },
      },
    });

    const targetDocId = home?.documentId || homePublished?.documentId;

    // Retain existing media slides if already uploaded
    const existingSlides = (home?.hero_slides && home.hero_slides.length > 0)
      ? home.hero_slides
      : (homePublished?.hero_slides && homePublished.hero_slides.length > 0)
        ? homePublished.hero_slides
        : null;

    const dataPayload = {
      name: 'GeduConnect Homepage',
      hero_slides: existingSlides || HERO_SLIDES,
      trending_programs: TRENDING_PROGRAMS,
      stats_strip: STATS_STRIP,
      course_finder: COURSE_FINDER,
      why_gedu: WHY_GEDU_SECTION,
      why_gedu_cards: WHY_GEDU_CARDS,
      comparison_matrix: COMPARISON_MATRIX,
      how_it_works: HOW_IT_WORKS_SECTION,
      how_it_works_steps: HOW_IT_WORKS_STEPS,
      universities_header: UNIVERSITIES_HEADER,
      compare_header: COMPARE_HEADER,
      testimonials_header: TESTIMONIALS_HEADER,
      mentors_header: MENTORS_HEADER,
      scholarships_header: SCHOLARSHIPS_HEADER,
      exams_header: EXAMS_HEADER,
      qna_header: QNA_HEADER,
      faqs_header: FAQS_HEADER,
      articles_header: ARTICLES_HEADER,
      faqs: FAQS,
      bottom_banner: BOTTOM_BANNER,
    };

    if (targetDocId) {
      await strapi.documents('api::home.home').update({
        documentId: targetDocId,
        data: dataPayload,
        status: 'draft',
      });
      await strapi.documents('api::home.home').publish({
        documentId: targetDocId,
      });
      console.log('✅ Successfully updated and published Homepage in Strapi CMS!');
    } else {
      await strapi.documents('api::home.home').create({
        data: dataPayload,
        status: 'published',
      });
      console.log('✅ Successfully created and published Homepage in Strapi CMS!');
    }
  } catch (err) {
    console.error('❌ Error while updating Strapi:', err);
  } finally {
    await strapi.destroy().catch(() => {});
    process.exit(0);
  }
}

seedHomepage();
