import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';
import type { ContentSectionRef } from './university';

/**
 * Scholarships. The CMS content type is `scheme`; the site calls them
 * scholarships throughout, so the mapping is contained here.
 */

export interface ScholarshipCard extends StrapiEntry {
  name: string;
  full_name: string | null;
  slug: string;
  city: string | null;
  state: string | null;
  country: string | null;
  establish: string | null;
  rating: number | null;
  show_apply_button: boolean;
  apply_button_text: string | null;
  view_button_text: string | null;
  image: Media | null;
  logo: Media | null;
}

export interface ScholarshipDetail extends ScholarshipCard {
  address: string | null;
  pincode: string | null;
  heading: string | null;
  summary?: string | null;
  eligibility_notes?: string[] | null;
  benefit_amount?: string | null;
  official_portal?: string | null;
  application_steps?: { title: string; detail: string }[];
  documents_required?: string[];
  faqs?: { question: string; answer: string }[];
  seo: Seo | null;
  university_contents: ContentSectionRef[];
}

export interface ScholarshipListParams {
  page?: number;
  pageSize?: number;
  state?: string;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 24;

const FALLBACK_SCHOLARSHIPS: ScholarshipDetail[] = [
  {
    id: 9101,
    documentId: 'agrico-scheme-icar-nts-ug',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'ICAR National Talent Scholarship (NTS-UG)',
    full_name: 'Indian Council of Agricultural Research — National Talent Scholarship for Undergraduate Students (₹3,000/month)',
    slug: 'icar-national-talent-scholarship-ug',
    city: 'New Delhi',
    state: 'All India',
    country: 'India',
    establish: '1929',
    rating: 5,
    show_apply_button: true,
    apply_button_text: 'Check Eligibility',
    view_button_text: 'View Scheme Details',
    image: null,
    logo: null,
    address: 'Krishi Anusandhan Bhavan-II, Pusa, New Delhi',
    pincode: '110012',
    heading: 'ICAR National Talent Scholarship (NTS-UG) — ₹3,000/Month Stipend, Eligibility & Rules',
    benefit_amount: '₹3,000 per month (₹36,000 per academic year) for all 4 years of the degree',
    official_portal: 'https://icaradmission.in/',
    summary:
      'The ICAR National Talent Scholarship (NTS-UG) is awarded by the Indian Council of Agricultural Research to undergraduate students who secure admission through CUET (ICAR-UG) and ICAR online counselling into an ICAR-accredited Agricultural University located outside their domicile state.',
    eligibility_notes: [
      'Must be admitted through CUET (ICAR-UG) central counselling against the All-India Quota.',
      'The allotted State/Central/Deemed Agricultural University must be located outside the candidate’s state of domicile.',
      'Continuation each semester requires maintaining at least 7.00/10.00 OGPA (or equivalent) with good conduct and full-time attendance.',
      'Covers B.Sc. (Hons.) Agriculture, Horticulture, Forestry, Community Science, Sericulture, B.F.Sc., B.Tech. Agricultural Engineering, Dairy Technology, and Food Technology.',
    ],
    seo: null,
    university_contents: [],
  },
  {
    id: 9102,
    documentId: 'agrico-scheme-icar-pg-scholarship',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'ICAR PG Scholarship & NTS (PG)',
    full_name: 'ICAR Junior Research Fellowship / Post-Graduate Scholarship (₹12,640/month) & NTS-PG (₹5,000/month)',
    slug: 'icar-pg-scholarship-nts-pg',
    city: 'New Delhi',
    state: 'All India',
    country: 'India',
    establish: '1929',
    rating: 5,
    show_apply_button: true,
    apply_button_text: 'Get PG Guidance',
    view_button_text: 'View Scheme Details',
    image: null,
    logo: null,
    address: 'Krishi Anusandhan Bhavan-II, Pusa, New Delhi',
    pincode: '110012',
    heading: 'ICAR PG Scholarship (₹12,640/Month) & NTS-PG (₹5,000/Month) — Eligibility & Rank Cutoffs',
    benefit_amount: '₹12,640/month + ₹6,000/year contingency (ICAR-PG Scholarship) OR ₹5,000/month (NTS-PG)',
    official_portal: 'https://exams.nta.ac.in/ICAR/',
    summary:
      'Top rank holders in the ICAR AIEEA (PG) entrance examination admitted to Master’s degree programmes (M.Sc. Agriculture, Horticulture, M.Tech. Agricultural Engineering, M.V.Sc., M.F.Sc.) receive the prestigious ICAR Post-Graduate Scholarship (₹12,640/month plus ₹6,000/year contingency grant). Other candidates admitted to an out-of-state agricultural university through ICAR counselling receive NTS-PG at ₹5,000/month.',
    eligibility_notes: [
      'Must qualify ICAR AIEEA (PG) conducted by NTA and take admission through ICAR central counselling.',
      'ICAR-PG Scholarship is awarded strictly on merit rank in each major subject group, subject to moving outside the institution of graduation or domicile as per ICAR guidelines.',
      'Requires a 4-year undergraduate degree from an ICAR-accredited college/programme.',
    ],
    seo: null,
    university_contents: [],
  },
  {
    id: 9103,
    documentId: 'agrico-scheme-icar-srf-phd',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'ICAR JRF/SRF Fellowship (Ph.D.)',
    full_name: 'ICAR Senior Research Fellowship (SRF) for Doctoral Programmes in Agricultural & Allied Sciences',
    slug: 'icar-jrf-srf-fellowship',
    city: 'New Delhi',
    state: 'All India',
    country: 'India',
    establish: '1929',
    rating: 5,
    show_apply_button: true,
    apply_button_text: 'Enquire Now',
    view_button_text: 'View Scheme Details',
    image: null,
    logo: null,
    address: 'Krishi Anusandhan Bhavan-II, Pusa, New Delhi',
    pincode: '110012',
    heading: 'ICAR JRF/SRF Doctoral Fellowship — ₹31,000 to ₹35,000/Month Stipend & Contingency',
    benefit_amount: '₹31,000/month (1st & 2nd Year) and ₹35,000/month (3rd Year) + ₹10,000/year contingency',
    official_portal: 'https://icaradmission.in/',
    summary:
      'Awarded through the ICAR AICE-JRF/SRF (Ph.D.) competitive examination to doctoral scholars pursuing Ph.D. research across 72+ agricultural, veterinary, engineering, and fisheries disciplines at ICAR Deemed Universities (IARI, IVRI, NDRI, CIFE) and State Agricultural Universities.',
    eligibility_notes: [
      'Master’s degree under the 10+2+4+2 pattern from an ICAR-aligned institution.',
      'Selection is based on subject-wise merit in ICAR AICE-JRF/SRF (Ph.D.) counselling.',
    ],
    seo: null,
    university_contents: [],
  },
  {
    id: 9104,
    documentId: 'agrico-scheme-mandi-board',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'State Mandi Board & Kisan Welfare Scholarships',
    full_name: 'Krishi Upaj Mandi Samiti / State Agricultural Marketing Board Scholarships for Farmer Wards',
    slug: 'state-mandi-board-agriculture-scholarship',
    city: 'Multiple States',
    state: 'All India',
    country: 'India',
    establish: '1995',
    rating: 4.8,
    show_apply_button: true,
    apply_button_text: 'Check State Rules',
    view_button_text: 'View Scheme Details',
    image: null,
    logo: null,
    address: 'State Agricultural Universities & State Mandi Boards',
    pincode: null,
    heading: 'State Krishi Upaj Mandi Board Scholarships (UP, Rajasthan, Punjab, Haryana & MP)',
    benefit_amount: '₹2,000 to ₹4,000 per month + tuition reimbursement (varies by state Mandi Board)',
    official_portal: 'https://scholarships.gov.in/',
    summary:
      'State Agricultural Marketing Boards (such as UP Mandi Parishad, Rajasthan Krishi Upaj Mandi Samiti, girls’ incentive schemes in Rajasthan for Agriculture stream, and Punjab/Haryana Kisan scholarships) fund undergraduate and postgraduate students from farming families studying at State Agricultural Universities.',
    eligibility_notes: [
      'UP Mandi Parishad Scholarship: ₹3,000/month for meritorious B.Sc./M.Sc. Agriculture students at UP State Agricultural Universities.',
      'Rajasthan Agriculture Girls Incentive Scheme: ₹15,000/year (10+2), ₹25,000/year (UG B.Sc. Agriculture), and ₹40,000/year (PG/Ph.D. Agriculture) for female domicile students of Rajasthan.',
      'Requires domicile certificate, farmer landholding/income proof (where applicable), and verified admission at a recognised college.',
    ],
    seo: null,
    university_contents: [],
  },
  {
    id: 9105,
    documentId: 'agrico-scheme-nsp-post-matric',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'NSP Central Sector & Post-Matric Scholarships',
    full_name: 'National Scholarship Portal (NSP) Central Sector Scheme & State Post-Matric Tuition Fee Reimbursement',
    slug: 'nsp-central-sector-post-matric-agriculture',
    city: 'New Delhi',
    state: 'All India',
    country: 'India',
    establish: '2015',
    rating: 4.8,
    show_apply_button: true,
    apply_button_text: 'Get Scholarship Help',
    view_button_text: 'View Scheme Details',
    image: null,
    logo: null,
    address: 'National Scholarship Portal, Government of India',
    pincode: '110001',
    heading: 'NSP Central Sector & State Post-Matric Scholarships for Agriculture Degrees',
    benefit_amount: '₹12,000–₹20,000/year (CSSS) OR up to 100% compulsory tuition fee reimbursement (Post-Matric)',
    official_portal: 'https://scholarships.gov.in/',
    summary:
      'Students enrolled in full-time on-campus B.Sc. (Hons.) Agriculture, B.Tech. Agricultural Engineering, B.V.Sc., and M.Sc. programmes at recognised SAUs and private universities are eligible for Central Sector Scholarships (top 20th percentile in Class 12) and State Post-Matric SC/ST/OBC/EWS/Minority tuition fee reimbursement.',
    eligibility_notes: [
      'Annual family income below ₹4.5 Lakh (for Central Sector Scheme) or ₹2.5 Lakh (for most Post-Matric schemes).',
      'Institution and course must be AISHE-registered and verified on the National Scholarship Portal or respective State Scholarship Portal (UP Scholarship, MP Taas, MahaDBT, SSP Karnataka, Jnanabhumi, e-Kalyan).',
    ],
    seo: null,
    university_contents: [],
  },
  {
    id: 9106,
    documentId: 'agrico-scheme-private-uni-merit',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'Private University CUET / Entrance Merit Fee Waivers',
    full_name: 'Tuition Fee Waivers at Private Agricultural Universities Based on CUET-ICAR, Class 12 & Entrance Tests',
    slug: 'private-university-icar-cuet-merit-scholarship',
    city: 'Multiple Campuses',
    state: 'All India',
    country: 'India',
    establish: '2020',
    rating: 4.7,
    show_apply_button: true,
    apply_button_text: 'Compare Fee Waivers',
    view_button_text: 'View Scheme Details',
    image: null,
    logo: null,
    address: 'Participating ICAR-Accredited & UGC-Recognised Private Universities',
    pincode: null,
    heading: 'Private Agriculture University Merit Scholarships (CUET, LPUNEST, CUCET, Class 12 & Defence)',
    benefit_amount: '15% to 100% waiver on semester tuition fee (subject to renewal CGPA rules)',
    official_portal: '/agriculture-colleges',
    summary:
      'Leading private agricultural universities (including Lovely Professional University, Chandigarh University, Centurion University, Guru Kashi University, SGT University, Shoolini University,GLA University, and Suresh Gyan Vihar University) offer structured semester tuition fee waivers based on CUET (UG) percentile, university scholarship tests (LPUNEST / CUCET), Class 12 board aggregate, sports achievements, and defence/farmer family categories.',
    eligibility_notes: [
      'Check whether the scholarship applies only to Semester 1 or all 8 semesters, and confirm the minimum CGPA (typically 7.5–8.0) required each year to retain the waiver.',
      'Waivers normally apply to base tuition fees only; hostel, mess, examination, and laboratory charges remain payable separately.',
    ],
    seo: null,
    university_contents: [],
  },
];

function buildFilters(params: ScholarshipListParams): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};

  if (params.state) filters.state = { $eqi: params.state };

  const term = searchTerm(params.search);
  if (term) {
    filters.$or = [{ name: { $containsi: term } }, { full_name: { $containsi: term } }];
  }

  return filters;
}

export async function listScholarships(params: ScholarshipListParams = {}): Promise<{
  scholarships: ScholarshipCard[];
  pagination: Pagination;
}> {
  const term = searchTerm(params.search);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100);

  let cmsScholarships: ScholarshipCard[] = [];
  try {
    const { data } = await cmsCollection<ScholarshipCard>(
      '/schemes',
      {
        filters: buildFilters(params),
        sort: 'name:asc',
        pagination: { page: 1, pageSize: 100 },
      },
      {
        tags: [collectionTag('scheme')],
        revalidate: term ? 0 : undefined,
      }
    );
    cmsScholarships = data ?? [];
  } catch {
    cmsScholarships = [];
  }

  const seen = new Set(cmsScholarships.map((s) => s.slug));
  const localFiltered = FALLBACK_SCHOLARSHIPS.filter((scheme) => {
    if (seen.has(scheme.slug)) return false;
    if (
      params.state &&
      scheme.state &&
      scheme.state.toLowerCase() !== 'all india' &&
      scheme.state.toLowerCase() !== params.state.toLowerCase()
    ) {
      return false;
    }
    if (term) {
      const q = term.toLowerCase();
      const hay = `${scheme.name} ${scheme.full_name ?? ''} ${scheme.summary ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const combined = [...cmsScholarships, ...localFiltered];
  const total = combined.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const paged = combined.slice((page - 1) * pageSize, page * pageSize);

  return {
    scholarships: paged,
    pagination: { page, pageSize, pageCount, total },
  };
}

function enrichLocalScholarship(scheme: ScholarshipDetail): ScholarshipDetail {
  const isIcar = scheme.slug.startsWith('icar-');
  const application_steps = isIcar
    ? [
        {
          title: 'Step 1: Qualify National ICAR Entrance & Central Counselling',
          detail: 'Appear for CUET (ICAR-UG), ICAR AIEEA (PG), or ICAR AICE-JRF/SRF (Ph.D.) conducted by NTA and secure an allotment letter through the centralized ICAR online counselling portal.',
        },
        {
          title: 'Step 2: Physical Reporting & Domicile / Degree Verification',
          detail: 'Report to the allotted State, Central, or ICAR Deemed Agricultural University, verify original academic transcripts and domicile certificates, and register for Semester I courses.',
        },
        {
          title: 'Step 3: University Dean Forwarding on ICAR Education Portal',
          detail: 'The Dean of the Constituent College / Registrar forwards the verified joining report, surety bond (where applicable), and Aadhaar-seeded bank account details to the ICAR Education Division.',
        },
        {
          title: 'Step 4: Quarterly DBT Stipend & Semester OGPA Renewal',
          detail: 'Stipends and contingency grants are released via Direct Benefit Transfer (DBT) subject to maintaining the required minimum OGPA (7.00/10.00 for UG/PG; 7.50/10.00 for Ph.D.) and full-time attendance.',
        },
      ]
    : [
        {
          title: 'Step 1: Confirm Admission at an Accredited Agricultural College',
          detail: 'Complete enrollment in an on-campus B.Sc. (Hons.) Agriculture, Horticulture, B.Tech. Agricultural Engineering, or M.Sc. Agriculture programme and obtain the official Bonafide Certificate and Fee Receipt.',
        },
        {
          title: 'Step 2: Online Registration on Official Scholarship Portal',
          detail: `Register on the National Scholarship Portal (NSP), State Krishi Upaj Mandi Samiti portal, or university scholarship cell portal using your Aadhaar-linked mobile number and APAAR/ABC ID.`,
        },
        {
          title: 'Step 3: Upload Income, Domicile & Landholding / Entrance Proofs',
          detail: 'Upload digitally signed Revenue Department Income Certificate, Domicile Certificate, Cast/EWS Certificate (if applicable), Farmer Landholding / Kisan Bahi proof, and previous academic mark sheets.',
        },
        {
          title: 'Step 4: Institute Nodal Officer Verification & Disbursement',
          detail: 'Submit a printed copy of the application at the college scholarship section for Level-1 Institute Nodal Officer verification, followed by District/Board verification and PFMS DBT credit.',
        },
      ];

  const documents_required = [
    'ICAR / State CET / University Counselling Seat Allotment Letter & Admission Fee Receipt',
    'Class 10 & Class 12 Mark Sheets (plus 4-Year UG Transcripts & PDC for PG/Ph.D. Fellowships)',
    'State Domicile / Permanent Residence Certificate issued by Competent Revenue Authority',
    'Valid Category Certificate (SC / ST / OBC-NCL / EWS / PwBD) or Farmer Landholding / Kisan Card (for Mandi Board schemes)',
    'Family Annual Income Certificate (for NSP Central Sector & Post-Matric Tuition Reimbursement)',
    'Aadhaar Card & NPCI-Seeded Student Bank Passbook in a Scheduled Commercial Bank',
    'Bonafide Student Certificate & Semester-wise OGPA Continuation Certificate signed by the College Dean',
  ];

  const faqs = [
    {
      question: `Can a student combine ${scheme.name} with another government fellowship?`,
      answer: 'No. Under ICAR and Ministry of Education norms, a student cannot draw two central/state government stipends simultaneously. However, institutional tuition fee waivers offered by a university based on entrance rank may be combined if permitted by the sponsoring authority.',
    },
    {
      question: `What happens if my semester OGPA drops below the required threshold?`,
      answer: 'For ICAR NTS and PG/SRF fellowships, if a student’s OGPA falls below the minimum prescribed grade point in any semester or the student is placed on academic/conduct probation, the scholarship is suspended for that semester and restored only upon regaining the required OGPA.',
    },
    {
      question: 'Is ICAR accreditation mandatory to claim this scholarship?',
      answer: 'For all ICAR fellowships (NTS-UG, NTS-PG, ICAR-PG Scholarship, and ICAR JRF/SRF), admission must be in an ICAR-accredited university/programme through ICAR central counselling. For NSP and State Post-Matric schemes, AISHE registration and state statutory recognition are mandatory.',
    },
  ];

  return {
    ...scheme,
    application_steps,
    documents_required,
    faqs,
  };
}

export async function getScholarshipBySlug(slug: string): Promise<ScholarshipDetail | null> {
  try {
    const json = await cmsFetch<{ data: ScholarshipDetail }>(
      `/schemes/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('scheme'), entryTag('scheme', slug)] }
    );
    if (json.data) return json.data;
  } catch (error) {
    if (!(error instanceof Error && 'status' in error && error.status === 404)) {
      // Fall through to local agriculture scholarships when CMS is offline
    }
  }

  const found = FALLBACK_SCHOLARSHIPS.find((scheme) => scheme.slug === slug);
  return found ? enrichLocalScholarship(found) : null;
}

export async function getScholarshipSlugs(limit = 100): Promise<string[]> {
  const cmsSlugs = await cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/schemes',
      { fields: ['slug'], sort: 'updatedAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('scheme')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);

  return Array.from(new Set([...cmsSlugs, ...FALLBACK_SCHOLARSHIPS.map((s) => s.slug)]));
}
