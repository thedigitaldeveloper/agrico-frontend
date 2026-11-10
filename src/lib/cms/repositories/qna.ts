import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Pagination, StrapiEntry } from '../types';
import type { Taxonomy } from './university';

/**
 * Q&A reads with verified On-Campus Agriculture & Allied Sciences community threads.
 */

export interface Answer {
  id: number;
  documentId: string;
  body: string;
  author_name: string | null;
  is_expert: boolean;
  is_accepted: boolean;
  createdAt: string;
}

export interface QuestionCard extends StrapiEntry {
  title: string;
  slug: string;
  body: string | null;
  author_name: string | null;
  views: number;
  streams: Taxonomy[];
  courses: Taxonomy[];
  answers?: Answer[];
}

export interface QuestionDetail extends QuestionCard {
  answers: Answer[];
  universities: { documentId: string; name: string; slug: string }[];
}

const TS = '2026-10-30T00:00:00.000Z';

const STREAM_TERMS: Record<string, Taxonomy> = {
  'agriculture-allied-sciences': {
    id: 1,
    documentId: 'stream-agriculture-allied-sciences',
    name: 'Agriculture & Allied Sciences',
    slug: 'agriculture-allied-sciences',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
  },
  'horticulture-forestry': {
    id: 2,
    documentId: 'stream-horticulture-forestry',
    name: 'Horticulture & Forestry',
    slug: 'horticulture-forestry',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
  },
  'agricultural-engineering': {
    id: 3,
    documentId: 'stream-agricultural-engineering',
    name: 'Agricultural Engineering & Tech',
    slug: 'agricultural-engineering',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
  },
  'agribusiness-management': {
    id: 4,
    documentId: 'stream-agribusiness-management',
    name: 'Agribusiness & Food Management',
    slug: 'agribusiness-management',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
  },
  'veterinary-dairy-fisheries': {
    id: 5,
    documentId: 'stream-veterinary-dairy-fisheries',
    name: 'Veterinary, Dairy & Fisheries',
    slug: 'veterinary-dairy-fisheries',
    createdAt: TS,
    updatedAt: TS,
    publishedAt: TS,
  },
};

const COURSE_TERMS: Record<string, Taxonomy> = {
  'bsc-agriculture': { id: 1, documentId: 'course-bsc-agriculture', name: 'B.Sc. (Hons.) Agriculture', slug: 'bsc-agriculture', createdAt: TS, updatedAt: TS, publishedAt: TS },
  'bsc-horticulture': { id: 2, documentId: 'course-bsc-horticulture', name: 'B.Sc. (Hons.) Horticulture', slug: 'bsc-horticulture', createdAt: TS, updatedAt: TS, publishedAt: TS },
  'btech-agricultural-engineering': { id: 3, documentId: 'course-btech-agricultural-engineering', name: 'B.Tech. Agricultural Engineering', slug: 'btech-agricultural-engineering', createdAt: TS, updatedAt: TS, publishedAt: TS },
  'mba-agribusiness': { id: 4, documentId: 'course-mba-agribusiness', name: 'MBA Agribusiness Management', slug: 'mba-agribusiness', createdAt: TS, updatedAt: TS, publishedAt: TS },
  'msc-agronomy': { id: 5, documentId: 'course-msc-agronomy', name: 'M.Sc. Agronomy', slug: 'msc-agronomy', createdAt: TS, updatedAt: TS, publishedAt: TS },
  'bvsc-animal-husbandry': { id: 6, documentId: 'course-bvsc-animal-husbandry', name: 'B.V.Sc. & A.H.', slug: 'bvsc-animal-husbandry', createdAt: TS, updatedAt: TS, publishedAt: TS },
};

const LOCAL_QUESTIONS: QuestionDetail[] = [
  {
    id: 1,
    documentId: 'qna-icar-accreditation-private-university-check',
    title: 'How do I verify whether a private university’s B.Sc. (Hons.) Agriculture programme has valid ICAR accreditation?',
    slug: 'how-to-verify-icar-accreditation-for-private-university-bsc-agriculture',
    body: 'Several private and deemed universities advertise "ICAR Approved" on admission banners. Before paying my first-semester fee, how do I verify that the exact college/school unit and my 2026–27 intake batch are covered under ICAR NAEAB accreditation, and why does this matter for ICAR AIEEA-PG (JRF) later?',
    author_name: 'Aarav Sharma (Jaipur)',
    views: 1420,
    createdAt: '2026-10-18T10:15:00.000Z',
    updatedAt: '2026-10-30T10:15:00.000Z',
    publishedAt: '2026-10-18T10:15:00.000Z',
    streams: [STREAM_TERMS['agriculture-allied-sciences']],
    courses: [COURSE_TERMS['bsc-agriculture']],
    universities: [
      { documentId: 'uni-lpu', name: 'Lovely Professional University', slug: 'lovely-professional-university' },
      { documentId: 'uni-cutm', name: 'Centurion University of Technology and Management, Odisha', slug: 'centurion-university-of-technology-and-management' },
    ],
    answers: [
      {
        id: 101,
        documentId: 'ans-101',
        author_name: 'Dr. R. K. Deshmukh · Agrico Senior Academic Advisor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-10-19T08:30:00.000Z',
        body: 'To verify ICAR accreditation properly, never rely on a general university banner. The National Agricultural Education Accreditation Board (NAEAB) under ICAR publishes separate official workbooks—List II for private agricultural colleges affiliated to SAUs and private/deemed universities, and List III for constituent/affiliated colleges of public general universities.\n\nCheck three specific columns in the official register (also reproduced on every Agrico university profile under the "ICAR accreditation: programme, unit and validity" section):\n1. Listed Academic Unit: Accreditation applies only to the specific Faculty or School named (for example, School of Agriculture at Lovely Professional University or M.S. Swaminathan School of Agriculture at Centurion University), not to sister campuses in other cities.\n2. Programme as Printed: Confirm that "B.Sc. (Hons.) Agriculture" is explicitly listed; accreditation for B.Sc. Agriculture does not automatically cover M.Sc. or B.Tech. programmes unless those are listed too.\n3. Validity Window: Check the recorded 5-year start and end dates.\n\nWhy it matters: Many State Agricultural Universities (SAUs) and the central ICAR AIEEA-PG counselling brochure require candidates to have graduated from an ICAR-accredited college/programme to be eligible for M.Sc. Agriculture admission and Postgraduate Scholarships.',
      },
      {
        id: 102,
        documentId: 'ans-102',
        author_name: 'Prashant Verma · M.Sc. Agronomy Scholar',
        is_expert: false,
        is_accepted: false,
        createdAt: '2026-10-20T14:10:00.000Z',
        body: 'Also save a PDF copy of the ICAR NAEAB list from the academic year you took admission. During our PG counselling document verification, students from private universities were asked to show proof that their college held valid accreditation during their batch.',
      },
    ],
  },
  {
    id: 2,
    documentId: 'qna-bsc-agriculture-vs-btech-agri-engineering',
    title: 'Should a PCMB student choose B.Sc. (Hons.) Agriculture or B.Tech. Agricultural Engineering?',
    slug: 'pcmb-student-bsc-agriculture-vs-btech-agricultural-engineering',
    body: 'I passed Class 12 with Physics, Chemistry, Mathematics, and Biology (86% aggregate). I am eligible for both B.Sc. (Hons.) Agriculture and B.Tech. Agricultural Engineering. How do the 4-year curriculum, practical field work, and government/corporate career opportunities compare between the two?',
    author_name: 'Sneha Nair (Coimbatore)',
    views: 1185,
    createdAt: '2026-10-16T09:20:00.000Z',
    updatedAt: '2026-10-30T09:20:00.000Z',
    publishedAt: '2026-10-16T09:20:00.000Z',
    streams: [STREAM_TERMS['agricultural-engineering'], STREAM_TERMS['agriculture-allied-sciences']],
    courses: [COURSE_TERMS['bsc-agriculture'], COURSE_TERMS['btech-agricultural-engineering']],
    universities: [
      { documentId: 'uni-tnau', name: 'Tamil Nadu Agricultural University (TNAU), Coimbatore', slug: 'tnau-coimbatore' },
      { documentId: 'uni-karunya', name: 'Karunya Institute of Technology and Sciences', slug: 'karunya-institute-of-technology-and-sciences' },
    ],
    answers: [
      {
        id: 201,
        documentId: 'ans-201',
        author_name: 'Prof. S. Sundaram · Agricultural Engineering Mentor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-10-16T15:45:00.000Z',
        body: 'Because you have PCMB, both doors are open—so your decision should rest on whether you prefer biological crop systems or quantitative engineering design:\n\n1. Curriculum Difference:\n• B.Sc. (Hons.) Agriculture (172 credits under the 6th Deans’ Committee) focuses on Agronomy, Soil Science, Plant Breeding & Genetics, Entomology, Plant Pathology, Horticulture, Extension, and Economics, culminating in Year 4 RAWE (village attachment) and ELP enterprise units.\n• B.Tech. Agricultural Engineering focuses on Farm Machinery & Power Engineering, Soil & Water Conservation Engineering, Drip/Micro-Irrigation Design, Renewable Bio-energy, Post-Harvest Process & Food Engineering, CAD, and Machine Testing.\n\n2. Career & Exam Pathways:\n• B.Sc. (Hons.) Agriculture has the widest volume of state-level vacancies (Agriculture Officer, Assistant Director of Agriculture, Block Agriculture Officer) and banking roles (IBPS AFO, NABARD Grade A General/Agri).\n• B.Tech. Agricultural Engineering has dedicated Assistant Engineer (Agricultural Engineering) posts in state departments, strong R&D and testing roles in tractor/mechanisation OEMs (Mahindra, TAFE, John Deere, Kubota), micro-irrigation firms (Jain Irrigation, Netafim), and direct GATE (AG) progression to IIT Kharagpur or ICAR-CIAE Bhopal.',
      },
    ],
  },
  {
    id: 3,
    documentId: 'qna-cuet-icar-ug-vs-state-agriculture-exams',
    title: 'Does CUET (ICAR-UG) cover 100% of seats in State Agricultural Universities, or do I also need state exams like UPCATET / Rajasthan JET / MHT-CET?',
    slug: 'cuet-icar-ug-all-india-quota-vs-state-agriculture-entrance-exams',
    body: 'I am preparing for B.Sc. (Hons.) Agriculture admission. If I appear only for NTA CUET (ICAR-UG), how many seats in State Agricultural Universities (SAUs) can I compete for? Should I also apply for my home-state agricultural entrance examination?',
    author_name: 'Rohit Kushwaha (Kanpur)',
    views: 1640,
    createdAt: '2026-10-14T11:00:00.000Z',
    updatedAt: '2026-10-30T11:00:00.000Z',
    publishedAt: '2026-10-14T11:00:00.000Z',
    streams: [STREAM_TERMS['agriculture-allied-sciences']],
    courses: [COURSE_TERMS['bsc-agriculture']],
    universities: [
      { documentId: 'uni-pau', name: 'Punjab Agricultural University (PAU), Ludhiana', slug: 'pau-ludhiana' },
      { documentId: 'uni-iari', name: 'ICAR-Indian Agricultural Research Institute (IARI), New Delhi', slug: 'iari-new-delhi' },
    ],
    answers: [
      {
        id: 301,
        documentId: 'ans-301',
        author_name: 'Agrico Admissions Desk',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-10-14T16:20:00.000Z',
        body: 'You should definitely apply for BOTH CUET (ICAR-UG) and your home-state agriculture admission route. Here is why:\n\n1. What CUET (ICAR-UG) covers:\nThrough central ICAR online counselling, CUET (ICAR-UG) fills the 20% All-India Quota (AIQ) seats at State Agricultural Universities (SAUs) and 100% of seats at Central Agricultural Universities (RPCAU Pusa, RLBCAU Jhansi, CAU Imphal) and ICAR Deemed Universities (IARI, NDRI, IVRI, CIFE).\n\n2. What State Exams / State Portals cover:\nThe remaining 80% to 85% of seats in State Agricultural Universities are reserved for state-domicile candidates and are filled through the respective state entrance exam or counselling portal—such as UPCATET in Uttar Pradesh, Rajasthan JET in Rajasthan, AP EAPCET (ANGRAU) in Andhra Pradesh, KCET in Karnataka, MCAER / MHT-CET in Maharashtra, MP PAT in Madhya Pradesh, PAU CET in Punjab, and TNAU Class-12 merit counselling in Tamil Nadu.\n\n3. Private ICAR-Accredited Universities:\nAdditionally, many ICAR-accredited private universities accept CUET (ICAR-UG) scores directly through their own admission portals alongside their institutional entrance tests (such as LPUNEST or SAAT).',
      },
    ],
  },
  {
    id: 4,
    documentId: 'qna-tnau-convenor-vs-management-quota-private-colleges',
    title: 'What is the difference between TNAU Single-Window Counselling quota and Management quota in TNAU-affiliated private colleges?',
    slug: 'tnau-counselling-convenor-quota-vs-management-quota-affiliated-colleges',
    body: 'I am looking at TNAU-affiliated private colleges like Adhiparasakthi Agricultural College, Palar Agricultural College, and PGP College of Agricultural Sciences. Do students admitted under the management channel get the same TNAU degree certificate as single-window counselling students, and how do the fees differ?',
    author_name: 'Karthik Meyyappan (Salem)',
    views: 980,
    createdAt: '2026-10-12T07:45:00.000Z',
    updatedAt: '2026-10-30T07:45:00.000Z',
    publishedAt: '2026-10-12T07:45:00.000Z',
    streams: [STREAM_TERMS['agriculture-allied-sciences']],
    courses: [COURSE_TERMS['bsc-agriculture']],
    universities: [
      { documentId: 'uni-apac', name: 'Adhiparasakthi Agricultural College', slug: 'adhiparasakthi-agricultural-college' },
      { documentId: 'uni-palar', name: 'Palar Agricultural College', slug: 'palar-agricultural-college' },
    ],
    answers: [
      {
        id: 401,
        documentId: 'ans-401',
        author_name: 'Agrico South Zone Counselling Advisor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-10-12T13:10:00.000Z',
        body: 'Yes—both government-counselling (convenor quota) and management-quota students admitted within the TNAU-sanctioned intake study in the same classrooms, follow the identical TNAU semester syllabus and external examination system, and receive their degree from Tamil Nadu Agricultural University (TNAU), Coimbatore.\n\nHowever, there are three important differences you must verify before paying:\n1. Allocation Channel: Convenor seats (typically 65% of sanctioned intake in non-minority affiliated colleges) are allotted strictly through TNAU online single-window rank-list counselling based on Class 12 marks and Tamil Nadu reservation rules. Management seats (typically 35%) are filled under the regulated management consortium/college channel, which still requires TNAU eligibility verification.\n2. Fee Structure: Government-regulated tuition fees for convenor-quota seats are lower than management-quota tuition fees. Furthermore, hostel, mess, uniform, laptop, and study-tour charges are billed separately by each affiliated college.\n3. First-Graduate & State Scholarships: Tamil Nadu First-Graduate tuition concessions and state post-matric fee reimbursements generally apply to seats allotted through government single-window counselling. Always ask for a written, quota-specific fee breakdown before confirming.',
      },
    ],
  },
  {
    id: 5,
    documentId: 'qna-ibps-afo-eligibility-bsc-horticulture-forestry-ag-engg',
    title: 'Are B.Sc. (Hons.) Horticulture, B.Sc. Forestry, and B.Tech. Agricultural Engineering graduates eligible for IBPS AFO (Agricultural Field Officer)?',
    slug: 'ibps-afo-eligibility-for-bsc-horticulture-forestry-and-agricultural-engineering',
    body: 'My main career goal is to clear the IBPS SO Agricultural Field Officer (Scale-I) exam for public sector banks. If I join B.Sc. (Hons.) Horticulture, B.Sc. (Hons.) Forestry, or B.Tech. Agricultural Engineering instead of B.Sc. (Hons.) Agriculture, am I officially eligible for IBPS AFO?',
    author_name: 'Divya Patel (Indore)',
    views: 1510,
    createdAt: '2026-10-10T12:30:00.000Z',
    updatedAt: '2026-10-30T12:30:00.000Z',
    publishedAt: '2026-10-10T12:30:00.000Z',
    streams: [STREAM_TERMS['horticulture-forestry'], STREAM_TERMS['agriculture-allied-sciences']],
    courses: [COURSE_TERMS['bsc-horticulture'], COURSE_TERMS['bsc-agriculture'], COURSE_TERMS['btech-agricultural-engineering']],
    universities: [],
    answers: [
      {
        id: 501,
        documentId: 'ans-501',
        author_name: 'Vikramjit Singh · Banking & Agribusiness Mentor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-10-10T18:00:00.000Z',
        body: 'Yes! According to the official IBPS CRP SPL (Specialist Officers) notification for Agricultural Field Officer (Scale-I), candidates holding a 4-year degree (graduation) in any of the following disciplines are eligible:\n\n• Agriculture\n• Horticulture\n• Animal Husbandry\n• Veterinary Science\n• Dairy Science\n• Fishery Science\n• Pisciculture\n• Agri. Marketing & Cooperation\n• Co-operation & Banking\n• Agro-Forestry / Forestry\n• Agricultural Biotechnology\n• Food Science / Food Technology\n• Agriculture Business Management\n• Sericulture\n• Agricultural Engineering\n\nKeep two practical tips in mind:\n1. Your degree MUST be a 4-year full-time undergraduate degree (or 5.5-year for B.V.Sc. & A.H.) from a recognized university.\n2. While B.Sc. Horticulture, Forestry, and B.Tech. Agricultural Engineering are 100% eligible for IBPS AFO, around 65–70% of the IBPS AFO Mains professional knowledge questions come from general Agronomy, Soil Science, Field Crops, Horticulture, Animal Husbandry, and NABARD/Govt Schemes—so non-Agriculture stream students should study general Agronomy & Soil Science alongside their core degree.',
      },
    ],
  },
  {
    id: 6,
    documentId: 'qna-rawe-and-elp-fourth-year-structure',
    title: 'How do RAWE and ELP work in the 4th year of B.Sc. (Hons.) Agriculture, and what should I check at a private university?',
    slug: 'rawe-and-elp-fourth-year-bsc-agriculture-structure-and-stipend',
    body: 'I read that the 7th and 8th semesters of B.Sc. (Hons.) Agriculture are dedicated to Student READY (RAWE and ELP) carrying 40 credits. How does this actually work on campus and in villages, and how can I tell if a private university executes it seriously?',
    author_name: 'Ananya Mohanty (Bhubaneswar)',
    views: 890,
    createdAt: '2026-10-08T09:15:00.000Z',
    updatedAt: '2026-10-30T09:15:00.000Z',
    publishedAt: '2026-10-08T09:15:00.000Z',
    streams: [STREAM_TERMS['agriculture-allied-sciences']],
    courses: [COURSE_TERMS['bsc-agriculture']],
    universities: [
      { documentId: 'uni-soa', name: 'Siksha ‘O’ Anusandhan', slug: 'siksha-o-anusandhan' },
      { documentId: 'uni-cutm', name: 'Centurion University of Technology and Management, Odisha', slug: 'centurion-university-of-technology-and-management' },
    ],
    answers: [
      {
        id: 601,
        documentId: 'ans-601',
        author_name: 'Dr. R. K. Deshmukh · Agrico Senior Academic Advisor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-10-08T14:50:00.000Z',
        body: 'Under the ICAR Deans’ Committee Student READY (Rural Entrepreneurship Awareness Development Yojana) framework, your entire fourth year (40 credits) is experiential rather than classroom-lecture based:\n\n1. Semester 7 — RAWE & AIA (20 Credits, ~20 Weeks):\n• Village Attachment (8–10 weeks): Students are placed in host villages to conduct participatory rural appraisal (PRA), diagnose real crop pest/disease and soil fertility issues, and conduct method demonstrations for farmers.\n• KVK / Research Station Attachment (3–4 weeks): Working alongside subject-matter specialists at a Krishi Vigyan Kendra.\n• Agro-Industrial Attachment (AIA, 3–4 weeks): Placement with a seed, fertilizer, crop-protection, dairy, or food-processing company.\n\n2. Semester 8 — ELP / Hands-on Training (20 Credits, 2 modules × 10 Credits):\nStudents run commercial production units on campus—such as commercial mushroom spawn & cultivation, organic bio-control agent production, tissue culture, commercial floriculture/protected polyhouse cultivation, apiculture, or seed processing—preparing a complete project bankability report.\n\nWhen evaluating any private university (check the "Infrastructure" and "Campus Life" tabs on Agrico), ask which exact ELP enterprise units ran for the most recent graduating batch and which KVKs hosted their RAWE students.',
      },
    ],
  },
  {
    id: 7,
    documentId: 'qna-bvsc-veterinary-admission-neet-vs-gadvasu-counselling',
    title: 'How does B.V.Sc. & A.H. admission work at Khalsa College of Veterinary and Animal Sciences, Amritsar under GADVASU?',
    slug: 'bvsc-admission-khalsa-college-of-veterinary-and-animal-sciences-gadvasu',
    body: 'I want to pursue the 5.5-year B.V.Sc. & A.H. degree in Punjab. How are seats allotted at Khalsa College of Veterinary and Animal Sciences, Amritsar, is VCI recognition mandatory, and why is the fee structure different from B.Sc. Agriculture?',
    author_name: 'Gurpreet Singh Gill (Ludhiana)',
    views: 845,
    createdAt: '2026-10-06T16:00:00.000Z',
    updatedAt: '2026-10-30T16:00:00.000Z',
    publishedAt: '2026-10-06T16:00:00.000Z',
    streams: [STREAM_TERMS['veterinary-dairy-fisheries']],
    courses: [COURSE_TERMS['bvsc-animal-husbandry']],
    universities: [
      { documentId: 'uni-kcvas', name: 'Khalsa College of Veterinary and Animal Sciences', slug: 'khalsa-college-of-veterinary-and-animal-sciences' },
    ],
    answers: [
      {
        id: 701,
        documentId: 'ans-701',
        author_name: 'Dr. H. S. Brar · Veterinary Education Advisor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-10-07T09:30:00.000Z',
        body: 'B.V.Sc. & A.H. (Bachelor of Veterinary Science and Animal Husbandry) is a regulated clinical profession governed by the Veterinary Council of India (VCI) under the Minimum Standards of Veterinary Education (MSVE) Regulations, rather than the general crop-science curriculum:\n\n1. Duration & Clinical Structure:\nIt is a 5.5-year programme consisting of 4.5 professional academic years (Professional I to IV) plus a mandatory 12-month rotational clinical and livestock farm internship at a Veterinary Clinical Complex (VCC).\n\n2. Admission Route via GADVASU:\nKhalsa College of Veterinary and Animal Sciences (KCVAS), Amritsar is affiliated to Guru Angad Dev Veterinary and Animal Sciences University (GADVASU), Ludhiana. Admissions are conducted through GADVASU’s centralized counselling rounds (based on NEET-UG / university prospectus rules across state quota and management/special quota seats). For example, GADVASU notified its fourth B.V.Sc. & A.H. counselling round on 30 October 2026.\n\n3. Fee Structure:\nBecause clinical veterinary education requires cadaver anatomy labs, diagnostic pathology equipment, surgery theatres, and a live instructional livestock farm & hospital, annual professional tuition fees at private affiliated veterinary colleges are significantly higher than B.Sc. Agriculture fees. Always check the quota-specific fee schedule on GADVASU’s prospectus before reporting.',
      },
    ],
  },
  {
    id: 8,
    documentId: 'qna-mba-agribusiness-cat-cmat-icar-pg-roi',
    title: 'Which entrance exam should I target for MBA in Agribusiness Management, and what is the realistic ROI?',
    slug: 'mba-agribusiness-management-entrance-exams-cat-cmat-icar-pg-roi',
    body: 'I am in the 7th semester of B.Sc. (Hons.) Agriculture. I want to move into corporate agri-input, food processing, or rural banking management rather than research. Should I prepare for CAT/CMAT or ICAR AIEEA-PG, and what are realistic placement packages in MBA Agribusiness?',
    author_name: 'Nikhil Deshpande (Amravati)',
    views: 1120,
    createdAt: '2026-10-04T10:40:00.000Z',
    updatedAt: '2026-10-30T10:40:00.000Z',
    publishedAt: '2026-10-04T10:40:00.000Z',
    streams: [STREAM_TERMS['agribusiness-management']],
    courses: [COURSE_TERMS['mba-agribusiness']],
    universities: [
      { documentId: 'uni-pau', name: 'Punjab Agricultural University (PAU), Ludhiana', slug: 'pau-ludhiana' },
      { documentId: 'uni-lpu', name: 'Lovely Professional University', slug: 'lovely-professional-university' },
    ],
    answers: [
      {
        id: 801,
        documentId: 'ans-801',
        author_name: 'Vikramjit Singh · Banking & Agribusiness Mentor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-10-04T17:15:00.000Z',
        body: 'Because you have a 4-year B.Sc. (Hons.) Agriculture background, you have a huge advantage in MBA Agribusiness (ABM) admissions because almost every top ABM institute gives academic diversity or domain weightage to farm-science graduates.\n\n1. Entrance Exams by Institute Tier:\n• Tier 1 Autonomous ABM Schools (IIM Ahmedabad FABM, IIM Lucknow ABM, MANAGE Hyderabad, NIAM Jaipur, IRMA Anand, VAMNICOM Pune): Require CAT (and XAT/CMAT for IRMA/NIAM/VAMNICOM).\n• Top SAUs & Central Agricultural Universities (PAU Ludhiana, TNAU Coimbatore, GBPUAT Pantnagar, UAS Bangalore, NAU Navsari): Accept ICAR AIEEA-PG (Social Sciences / ABM group), state PG entrance tests, or CAT/CMAT scores.\n• Multi-Faculty Private & Deemed Universities (LPU, Symbiosis SIIB, Amity, Sri Sri University): Accept CAT/MAT/CMAT or their own university management test + GD/PI.\n\n2. Realistic ROI & Recruiters:\nAt SAUs and ICAR-accredited universities where total 2-year fees range from ₹1.5 Lakh to ₹5 Lakh, median starting packages in agri-input (UPL, Bayer, Syngenta, Coromandel), microfinance/agri-banking (HDFC Agri, ICICI, NABFINS, Samunnati), and commodity/retail chains (ITC ABD, Olam, Ninjacart, DeHaat) typically range between ₹6.5 LPA and ₹11.5 LPA, offering rapid 1–2 year payback.',
      },
    ],
  },
  {
    id: 9,
    documentId: 'qna-angrau-ap-eapcet-manual-spot-counselling-rules',
    title: 'How do ANGRAU AP EAPCET manual and spot counselling rounds work for Andhra Pradesh private agriculture colleges?',
    slug: 'angrau-ap-eapcet-manual-and-spot-counselling-private-agriculture-colleges',
    body: 'I registered on the ANGRAU UG portal with my AP EAPCET rank, and I saw notices for November 2026 manual counselling and spot counselling. If I get allotted a seat at an affiliated private college like SBVR, N.S. Agricultural College, or Sri Kinjarapu Yerran Naidu College, what documents and fee payment are needed on the spot?',
    author_name: 'Chaitanya Reddy (Guntur)',
    views: 760,
    createdAt: '2026-10-02T14:00:00.000Z',
    updatedAt: '2026-10-30T14:00:00.000Z',
    publishedAt: '2026-10-02T14:00:00.000Z',
    streams: [STREAM_TERMS['agriculture-allied-sciences']],
    courses: [COURSE_TERMS['bsc-agriculture']],
    universities: [
      { documentId: 'uni-sbvr', name: 'SBVR Agricultural College', slug: 'sbvr-agricultural-college' },
      { documentId: 'uni-skyncas', name: 'Sri Kinjarapu Yerran Naidu College of Agricultural Sciences', slug: 'sri-kinjarapu-yerran-naidu-college-of-agricultural-sciences' },
    ],
    answers: [
      {
        id: 901,
        documentId: 'ans-901',
        author_name: 'Agrico South Zone Counselling Advisor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-10-03T09:10:00.000Z',
        body: 'In ANGRAU’s undergraduate admission process, manual and spot counselling rounds are conducted in person at the designated university auditorium in Guntur after online phases conclude (for example, ANGRAU scheduled manual rank-batch sessions between 2 and 10 November 2026 and spot counselling on 11 November 2026).\n\nWhat you must carry in person:\n1. All Original Certificates: SSC (Class 10), Intermediate BiPC/MPC marks memo, Transfer Certificate (TC), Study Certificates from Class 6 to 12 (for local area AU/SVU determination), AP EAPCET Rank Card & Hall Ticket, and valid Caste/EWS/Income/Farmer Quota certificates.\n2. Immediate Fee Readiness: Unlike online counselling where you get a multi-day reporting window, manual and spot counselling require immediate fee payment upon seat allotment to secure the seat, otherwise the seat is offered to the next candidate in the hall.\n3. Verify Convenor vs Payment/Management Rate: Confirm whether the vacant seat being offered in the affiliated college is under the Convenor quota or a higher-fee category before signing the allotment slip.',
      },
    ],
  },
  {
    id: 10,
    documentId: 'qna-msc-agronomy-vs-genetics-plant-breeding-scope',
    title: 'Between M.Sc. Agronomy and M.Sc. Genetics & Plant Breeding, which specialisation has better research and seed-industry demand?',
    slug: 'msc-agronomy-vs-msc-genetics-and-plant-breeding-career-scope',
    body: 'I am preparing for ICAR AIEEA-PG (Plant Sciences vs Agronomy subject group). How should I choose between M.Sc. Agronomy and M.Sc. Genetics & Plant Breeding (GPB) in terms of ARS/NET teaching posts and private seed company R&D jobs?',
    author_name: 'Meenakshi Rawat (Dehradun)',
    views: 930,
    createdAt: '2026-09-28T11:20:00.000Z',
    updatedAt: '2026-10-30T11:20:00.000Z',
    publishedAt: '2026-09-28T11:20:00.000Z',
    streams: [STREAM_TERMS['agriculture-allied-sciences']],
    courses: [COURSE_TERMS['msc-agronomy']],
    universities: [
      { documentId: 'uni-iari', name: 'ICAR-Indian Agricultural Research Institute (IARI), New Delhi', slug: 'iari-new-delhi' },
      { documentId: 'uni-sgrru', name: 'Shri Guru Ram Rai University', slug: 'shri-guru-ram-rai-university' },
    ],
    answers: [
      {
        id: 1001,
        documentId: 'ans-1001',
        author_name: 'Dr. R. K. Deshmukh · Agrico Senior Academic Advisor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-09-29T08:40:00.000Z',
        body: 'Both M.Sc. Agronomy and M.Sc. Genetics & Plant Breeding (GPB) are flagship postgraduate specialisations in agricultural sciences, but they serve different professional niches:\n\n1. M.Sc. Agronomy:\n• Academic & Govt Scope: Every agricultural college, KVK (Krishi Vigyan Kendra), and research station requires multiple Agronomists. As a result, Agronomy typically has the highest number of Assistant Professor / Subject Matter Specialist (SMS) and ASRB NET / ARS vacancies.\n• Industry Role: Product development agronomist, crop advisory lead, precision-farming trial manager, and fertilizer/herbicide technical specialist.\n\n2. M.Sc. Genetics & Plant Breeding (GPB) & Seed Science:\n• Industry R&D Scope: Multinational and domestic hybrid seed companies (Mahyco, Kaveri Seeds, Nuziveedu, Corteva, Bayer, Syngenta, East-West Seed) actively recruit GPB graduates as Assistant Plant Breeders, Molecular Breeding Associates, and Seed Production Officers—often offering the highest private R&D pay scales in crop science.\n• Exam Note: For ICAR AIEEA-PG, Agronomy comes under the "Agronomy" major subject code, whereas GPB, Seed Science, and Plant Pathology come under "Plant Sciences". Choose your exam code in Semester 5 so your preparation stays focused.',
      },
    ],
  },
  {
    id: 11,
    documentId: 'qna-rajasthan-domicile-vs-outside-rajasthan-fees-jet',
    title: 'Do private universities in Rajasthan charge different B.Sc. Agriculture fees for Rajasthan domicile vs outside-Rajasthan students?',
    slug: 'rajasthan-private-universities-domicile-vs-outside-state-agriculture-fees',
    body: 'While checking Rajasthan universities like RNB Global University, Vivekananda Global University, and Suresh Gyan Vihar University, I noticed separate admission pages or fee rows for Rajasthan and Outside-Rajasthan students. How does this work alongside Rajasthan JET?',
    author_name: 'Harshvardhan Rathore (Jodhpur)',
    views: 685,
    createdAt: '2026-09-25T15:10:00.000Z',
    updatedAt: '2026-10-30T15:10:00.000Z',
    publishedAt: '2026-09-25T15:10:00.000Z',
    streams: [STREAM_TERMS['agriculture-allied-sciences']],
    courses: [COURSE_TERMS['bsc-agriculture']],
    universities: [
      { documentId: 'uni-rnb', name: 'RNB Global University', slug: 'rnb-global-university' },
      { documentId: 'uni-vgu', name: 'Vivekananda Global University', slug: 'vivekananda-global-university' },
    ],
    answers: [
      {
        id: 1101,
        documentId: 'ans-1101',
        author_name: 'Agrico North-West Counselling Desk',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-09-26T10:00:00.000Z',
        body: 'In Rajasthan, you must check two separate variables—your domicile status and your admission channel:\n\n1. Domicile-Differentiated Fee Schedules:\nSome Rajasthan private universities (for example, RNB Global University in Bikaner) explicitly publish separate fee schedules or admission pages for Rajasthan domicile students and Outside-Rajasthan students. Always make sure the fee quote you are reading matches your state of permanent residence.\n\n2. Rajasthan JET Counselling vs University Direct/CUET Channel:\nSeats filled through the state Rajasthan JET (Joint Entrance Test) coordinator have state-notified eligibility and counselling reporting rules, whereas private universities that also admit students through CUET or university-level tests (such as VGUCET or SGVUEE) apply their institutional fee and scholarship policies to those seats. Read our Rajasthan JET route guide on Agrico before locking your choices.',
      },
    ],
  },
  {
    id: 12,
    documentId: 'qna-dairy-technology-vs-food-technology-eligibility-scope',
    title: 'What is the difference between B.Tech. Dairy Technology and B.Tech. Food Technology in terms of PCM eligibility and dairy/FMCG placements?',
    slug: 'btech-dairy-technology-vs-btech-food-technology-eligibility-and-placements',
    body: 'I have PCM in Class 12 and want to work in the food/dairy processing sector (like Amul, Mother Dairy, Nestlé, or ITC). How do B.Tech. Dairy Technology and B.Tech. Food Technology compare in curriculum and campus placements?',
    author_name: 'Siddharth Kulkarni (Pune)',
    views: 810,
    createdAt: '2026-09-20T09:50:00.000Z',
    updatedAt: '2026-10-30T09:50:00.000Z',
    publishedAt: '2026-09-20T09:50:00.000Z',
    streams: [STREAM_TERMS['veterinary-dairy-fisheries'], STREAM_TERMS['agribusiness-management']],
    courses: [],
    universities: [],
    answers: [
      {
        id: 1201,
        documentId: 'ans-1201',
        author_name: 'Prof. S. Sundaram · Agricultural Engineering Mentor',
        is_expert: true,
        is_accepted: true,
        createdAt: '2026-09-20T16:30:00.000Z',
        body: 'Both are 4-year ICAR-aligned engineering/technology degrees that include a dedicated 4th-year In-Plant Training semester, and both primarily require 10+2 with Physics, Chemistry, and Mathematics (PCM/PCMB):\n\n1. B.Tech. Dairy Technology:\n• Curriculum: Deeply specialized around Dairy Engineering (pasteurizers, homogenizers, spray dryers, refrigeration), Dairy Chemistry, Dairy Microbiology, Cheese/Ice-cream/Fermented Products Technology, and Dairy Plant Management.\n• Placement Edge: Because fewer colleges in India offer ICAR-accredited B.Tech. Dairy Technology (led by NDRI Karnal, SMC Anand, GADVASU Ludhiana, KVAFSU, and select state dairy colleges), competition per graduate is low and campus placement rates in GCMMF (Amul), NDDB, Mother Dairy, State Milk Federations (Nandini, Verka, Sudha, Aavin), Tetra Pak, and Schreiber Dynamix are exceptionally strong.\n\n2. B.Tech. Food Technology:\n• Curriculum: Covers broader food sectors—Cereals, Pulses & Oilseeds, Fruit & Vegetable Processing, Bakery & Confectionery, Meat & Poultry, Beverage Technology, Food Packaging, and FSSAI Food Safety/HACCP regulations.\n• Placement Edge: Wider recruiter diversity across FMCG giants (Nestlé, Britannia, ITC Foods, Haldiram’s, PepsiCo, Mondelez), export inspection agencies, and FSSAI Food Safety Officer (FSO) exams (for which both Dairy Tech and Food Tech graduates are eligible!).',
      },
    ],
  },
];

export async function listQuestions({
  page = 1,
  pageSize = 15,
  stream,
  search,
}: {
  page?: number;
  pageSize?: number;
  stream?: string;
  search?: string;
} = {}): Promise<{
  questions: QuestionCard[];
  pagination: Pagination;
}> {
  const term = searchTerm(search);

  const filters: Record<string, unknown> = {};
  if (stream) filters.streams = { slug: { $eq: stream } };
  if (term) {
    filters.$or = [{ title: { $containsi: term } }, { body: { $containsi: term } }];
  }

  const { data, meta } = await cmsCollection<QuestionCard>(
    '/questions',
    {
      filters,
      populate: {
        streams: true,
        courses: true,
        answers: true,
      },
      sort: 'createdAt:desc',
      pagination: { page, pageSize: Math.min(pageSize, 50) },
    },
    {
      tags: [collectionTag('question')],
      revalidate: term ? 0 : undefined,
    }
  );

  if (data.length > 0) {
    return { questions: data, pagination: meta.pagination };
  }

  const filtered = LOCAL_QUESTIONS.filter((q) => {
    if (stream && !q.streams.some((s) => s.slug === stream)) return false;
    if (term) {
      const needle = term.toLowerCase();
      const hay = `${q.title} ${q.body ?? ''} ${q.answers.map((a) => a.body).join(' ')}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    questions: filtered.slice(start, start + pageSize),
    pagination: {
      page: safePage,
      pageSize,
      pageCount,
      total,
    },
  };
}

export async function getQuestionBySlug(slug: string): Promise<QuestionDetail | null> {
  try {
    const json = await cmsFetch<{ data: QuestionDetail }>(
      `/questions/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('question'), entryTag('question', slug)] }
    );
    if (json.data) return json.data;
  } catch (error) {
    if (!(error instanceof Error && 'status' in error && error.status === 404)) {
      // Fall through to local agriculture Q&A dataset when CMS is unreachable
    }
  }
  return LOCAL_QUESTIONS.find((q) => q.slug === slug) ?? null;
}

export async function getQuestionSlugs(limit = 100): Promise<string[]> {
  const cmsSlugs = await cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/questions',
      { fields: ['slug'], sort: 'createdAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('question')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);

  return [...new Set([...cmsSlugs, ...LOCAL_QUESTIONS.map((q) => q.slug)])].slice(0, limit);
}
