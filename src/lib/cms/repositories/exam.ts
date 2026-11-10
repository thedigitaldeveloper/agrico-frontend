import { cmsCollection, cmsFetch, cmsFetchOptional, searchTerm, type CmsQuery } from '../client';
import { collectionTag, entryTag } from '../tags';
import type { Media, Pagination, Seo, StrapiEntry } from '../types';
import { LOCAL_UNIVERSITY_CARDS, type ContentSectionRef, type Taxonomy, type UniversityCard } from './university';

/**
 * Entrance exams. The CMS calls this content type `examination`; `exam` is a
 * separate, much smaller taxonomy used to tag universities and programs.
 */

export interface ExamCard extends StrapiEntry {
  name: string;
  slug: string;
  full_name: string | null;
  exam_mode: 'Online' | 'Offline' | null;
  form_start_date: string | null;
  form_closing_date: string | null;
  admit_card_date: string | null;
  examination_date: string | null;
  registration_fee: string | null;
  position: number | null;
  logo: Media | null;
  streams: Taxonomy[];
  courses: Taxonomy[];
  tags: Taxonomy[];
}

export interface ImportantLink {
  id: number;
  name: string | null;
  link: string | null;
}

export interface ExamDetail extends ExamCard {
  description: string | null;
  eligibility: string | null;
  exam_pattern?: { label: string; value: string }[];
  syllabus_highlights?: { subject: string; topics: string }[];
  counselling_steps?: { title: string; detail: string }[];
  faqs?: { question: string; answer: string }[];
  seo: Seo | null;
  important_links: ImportantLink[];
  universities: UniversityCard[];
  university_contents: ContentSectionRef[];
}

export interface ExamListParams {
  page?: number;
  pageSize?: number;
  stream?: string;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 24;

const makeTerm = (id: number, name: string, slug: string): Taxonomy => ({
  id,
  documentId: `exam-term-${slug}`,
  name,
  slug,
  createdAt: '2026-10-30T00:00:00.000Z',
  updatedAt: '2026-10-30T00:00:00.000Z',
  publishedAt: '2026-10-30T00:00:00.000Z',
});

const STREAM_AGRI = makeTerm(1, 'Agricultural Sciences', 'agricultural-sciences');
const STREAM_ENGG = makeTerm(2, 'Agricultural Engineering & Dairy', 'agricultural-engineering');
const STREAM_VET = makeTerm(3, 'Veterinary & Fisheries', 'veterinary-fisheries');
const STREAM_ABM = makeTerm(4, 'Agribusiness Management', 'agribusiness-management');

const FALLBACK_EXAMS: ExamDetail[] = [
  {
    id: 9001,
    documentId: 'agrico-exam-icar-cuet-ug',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'CUET (ICAR-UG)',
    slug: 'icar-cuet-ug',
    full_name: 'Common University Entrance Test — ICAR All India Entrance Examination for Admission (UG)',
    exam_mode: 'Online',
    form_start_date: '2026-02-27',
    form_closing_date: '2026-04-05',
    admit_card_date: '2026-05-10',
    examination_date: '2026-05-15',
    registration_fee: '₹1,000 (General) / ₹900 (OBC-NCL/EWS) / ₹800 (SC/ST/PwBD)',
    position: 1,
    logo: null,
    streams: [STREAM_AGRI, STREAM_ENGG, STREAM_VET],
    courses: [makeTerm(11, 'B.Sc. (Hons.) Agriculture', 'bsc-agriculture'), makeTerm(12, 'B.Tech. Agricultural Engineering', 'btech-agricultural-engineering'), makeTerm(13, 'B.Sc. (Hons.) Horticulture', 'bsc-horticulture')],
    tags: [makeTerm(21, 'National Exam · NTA / ICAR', 'national-exam')],
    description:
      'CUET (ICAR-UG) is conducted by the National Testing Agency (NTA) for admission to 20% All-India Quota seats across 63+ State Agricultural Universities (SAUs) and 100% seats at Central Agricultural Universities (RLBCAU Jhansi, RPCAU Pusa, CAU Imphal) and ICAR Deemed Universities (IARI, NDRI, IVRI, CIFE) across 11 undergraduate degree programmes including B.Sc. (Hons.) Agriculture, Horticulture, Forestry, Community Science, Sericulture, B.F.Sc., B.Tech. Agricultural Engineering, Dairy Technology, and Food Technology.',
    eligibility:
      '10+2 or equivalent with Physics, Chemistry, and Biology/Mathematics/Agriculture from a recognised board with at least 50% aggregate marks (40% for SC/ST/PwBD). Minimum age: 16 years as on 31 August of the admission year.',
    seo: null,
    important_links: [
      { id: 1, name: 'Official NTA CUET (UG) Portal', link: 'https://exams.nta.ac.in/CUET-UG/' },
      { id: 2, name: 'ICAR Online Counselling Portal', link: 'https://icaradmission.in/' },
      { id: 3, name: 'Indian Council of Agricultural Research (ICAR)', link: 'https://icar.gov.in/en' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9002,
    documentId: 'agrico-exam-icar-aieea-pg',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'ICAR AIEEA (PG)',
    slug: 'icar-aieea-pg',
    full_name: 'ICAR All India Entrance Examination for Admission to Master’s Degree Programmes',
    exam_mode: 'Online',
    form_start_date: '2026-04-11',
    form_closing_date: '2026-05-11',
    admit_card_date: '2026-06-20',
    examination_date: '2026-06-29',
    registration_fee: '₹1,200 (General/OBC-NCL/EWS) / ₹625 (SC/ST/PwBD)',
    position: 2,
    logo: null,
    streams: [STREAM_AGRI, STREAM_ENGG],
    courses: [makeTerm(14, 'M.Sc. Agronomy', 'msc-agronomy'), makeTerm(15, 'M.Sc. Genetics & Plant Breeding', 'msc-genetics-plant-breeding'), makeTerm(16, 'M.Sc. Soil Science', 'msc-soil-science')],
    tags: [makeTerm(22, 'Postgraduate · NTA / ICAR', 'pg-exam')],
    description:
      'ICAR AIEEA (PG) is the national computer-based entrance test conducted by NTA for admission to 30% All-India Quota seats in Master’s degree programmes (M.Sc. Agriculture, Horticulture, Forestry, M.Tech. Agricultural Engineering, M.V.Sc., M.F.Sc.) at State and Central Agricultural Universities, and 100% seats at ICAR Deemed Universities (IARI, IVRI, NDRI, CIFE). Top qualifiers also receive the ICAR PG Scholarship (₹12,640/month) or National Talent Scholarship (₹5,000/month).',
    eligibility:
      'Four-year Bachelor’s degree (10+2+4 system) in Agriculture, Horticulture, Forestry, Agricultural Engineering, Veterinary Science, Fisheries or allied disciplines from an ICAR-accredited institution with minimum 6.00/10.00 OGPA (5.50/10.00 for SC/ST/PwBD).',
    seo: null,
    important_links: [
      { id: 3, name: 'NTA ICAR AIEEA (PG) Portal', link: 'https://exams.nta.ac.in/ICAR/' },
      { id: 4, name: 'ICAR Admission & Counselling Portal', link: 'https://icaradmission.in/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9003,
    documentId: 'agrico-exam-icar-aice-jrf-srf',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'ICAR AICE-JRF/SRF (Ph.D.)',
    slug: 'icar-aice-jrf-srf',
    full_name: 'ICAR All India Competitive Examination for JRF/SRF (Ph.D.) Admissions',
    exam_mode: 'Online',
    form_start_date: '2026-04-11',
    form_closing_date: '2026-05-11',
    admit_card_date: '2026-06-20',
    examination_date: '2026-06-29',
    registration_fee: '₹1,900 (General/OBC-NCL/EWS) / ₹975 (SC/ST/PwBD)',
    position: 3,
    logo: null,
    streams: [STREAM_AGRI, STREAM_ENGG, STREAM_VET],
    courses: [],
    tags: [makeTerm(23, 'Doctoral & Fellowship · ICAR', 'phd-exam')],
    description:
      'ICAR AICE-JRF/SRF (Ph.D.) is the national doctoral entrance examination for admission to Ph.D. programmes in 72+ specialised disciplines of Crop Sciences, Horticulture, Natural Resource Management, Agricultural Engineering, Animal & Veterinary Sciences, Fisheries, and Agricultural Economics across ICAR Deemed Universities and SAUs.',
    eligibility:
      'Master’s degree in the concerned agricultural/allied discipline under the 10+2+4+2 system from an ICAR-aligned institution with minimum 6.50/10.00 OGPA (5.50/10.00 for SC/ST/PwBD).',
    seo: null,
    important_links: [
      { id: 5, name: 'NTA ICAR Portal', link: 'https://exams.nta.ac.in/ICAR/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9004,
    documentId: 'agrico-exam-neet-ug-veterinary',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'NEET-UG (VCI B.V.Sc. Quota)',
    slug: 'neet-ug-veterinary',
    full_name: 'National Eligibility cum Entrance Test (UG) — Veterinary Council of India 15% All-India Quota',
    exam_mode: 'Offline',
    form_start_date: '2026-02-09',
    form_closing_date: '2026-03-16',
    admit_card_date: '2026-05-01',
    examination_date: '2026-05-04',
    registration_fee: '₹1,700 (General) / ₹1,600 (EWS/OBC-NCL) / ₹1,000 (SC/ST/PwBD)',
    position: 4,
    logo: null,
    streams: [STREAM_VET],
    courses: [makeTerm(17, 'B.V.Sc. & A.H.', 'bvsc-animal-husbandry')],
    tags: [makeTerm(24, 'Veterinary · NTA / VCI', 'veterinary-exam')],
    description:
      'NEET-UG scores are used by the Veterinary Council of India (VCI) for counselling to 15% All-India Quota seats in the 5.5-year Bachelor of Veterinary Science & Animal Husbandry (B.V.Sc. & A.H.) degree across all VCI-recognised Government and Private Veterinary Colleges in India, as well as several state veterinary counselling boards.',
    eligibility:
      '10+2 with Physics, Chemistry, Biology/Biotechnology and English with minimum 50% marks in PCB combined (47.5% for reserved categories as per VCI MSVE regulations). Minimum age: 17 years as on 31 December.',
    seo: null,
    important_links: [
      { id: 6, name: 'VCI All-India Veterinary Counselling', link: 'https://vci.admissions.nic.in/' },
      { id: 7, name: 'NTA NEET (UG) Official Portal', link: 'https://exams.nta.ac.in/NEET/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9005,
    documentId: 'agrico-exam-upcatet',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'UPCATET',
    slug: 'upcatet',
    full_name: 'Uttar Pradesh Combined Agriculture and Technology Entrance Test',
    exam_mode: 'Offline',
    form_start_date: '2026-03-17',
    form_closing_date: '2026-05-07',
    admit_card_date: '2026-05-27',
    examination_date: '2026-06-11',
    registration_fee: '₹1,350 (General/OBC/EWS) / ₹1,100 (SC/ST)',
    position: 5,
    logo: null,
    streams: [STREAM_AGRI, STREAM_ENGG, STREAM_VET, STREAM_ABM],
    courses: [],
    tags: [makeTerm(25, 'State SAU Exam · Uttar Pradesh', 'state-exam')],
    description:
      'UPCATET is the joint state entrance test conducted on a rotational basis by Uttar Pradesh’s five State Agricultural Universities — CSAUA&T Kanpur, ANDUA&T Ayodhya, SVPUA&T Meerut, BUAT Banda, and MGUAT Kushinagar — for UG, PG, and Ph.D. admissions in Agriculture, Horticulture, Forestry, Veterinary Science, Fisheries, Dairy & Agricultural Engineering.',
    eligibility:
      'Uttar Pradesh domicile criteria apply for state quota seats; 10+2 in PAG / PCB / PCM / PHS depending on the target degree programme.',
    seo: null,
    important_links: [
      { id: 8, name: 'UPCATET Official Admission Portal', link: 'https://upcatet.org/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9006,
    documentId: 'agrico-exam-jet-rajasthan',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'Rajasthan JET Agriculture',
    slug: 'jet-rajasthan',
    full_name: 'Rajasthan Joint Entrance Test (JET / Pre-PG / Ph.D.) for Agriculture & Allied Sciences',
    exam_mode: 'Offline',
    form_start_date: '2026-03-14',
    form_closing_date: '2026-04-30',
    admit_card_date: '2026-05-24',
    examination_date: '2026-06-02',
    registration_fee: '₹1,600 (General/OBC/EWS) / ₹1,300 (SC/ST/PwBD)',
    position: 6,
    logo: null,
    streams: [STREAM_AGRI, STREAM_ENGG],
    courses: [],
    tags: [makeTerm(26, 'State SAU Exam · Rajasthan', 'state-exam')],
    description:
      'Rajasthan JET is conducted for admission to B.Sc. (Hons.) Agriculture, Horticulture, Forestry, Community Science, B.F.Sc., B.Tech. Dairy Technology, and B.Tech. Food Technology across Rajasthan’s five SAUs (SKNAU Jobner, MPUAT Udaipur, SKRAU Bikaner, AU Jodhpur, AU Kota) and participating private agriculture universities in Rajasthan.',
    eligibility:
      '10+2 with Agriculture, Biology, Chemistry, Mathematics, or Physics combinations with at least 50% aggregate marks (45% for SC/ST/OBC-NCL).',
    seo: null,
    important_links: [
      { id: 9, name: 'AU Jodhpur / JET Agriculture Portal', link: 'https://www.jetauj2024.com/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9007,
    documentId: 'agrico-exam-mp-pat',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'MP PAT',
    slug: 'mp-pat',
    full_name: 'Madhya Pradesh Pre-Agriculture Test (MPESB)',
    exam_mode: 'Online',
    form_start_date: '2026-04-25',
    form_closing_date: '2026-05-09',
    admit_card_date: '2026-06-01',
    examination_date: '2026-06-08',
    registration_fee: '₹500 (Unreserved) / ₹250 (SC/ST/OBC/PwBD of MP)',
    position: 7,
    logo: null,
    streams: [STREAM_AGRI, STREAM_ENGG],
    courses: [],
    tags: [makeTerm(27, 'State SAU Exam · Madhya Pradesh', 'state-exam')],
    description:
      'Conducted by the Madhya Pradesh Employees Selection Board (MPESB), MP PAT is the state-level entrance test for admission to B.Sc. (Hons.) Agriculture, B.Sc. (Hons.) Horticulture, B.Sc. (Hons.) Forestry, and B.Tech. Agricultural Engineering at JNKVV Jabalpur and RVSKVV Gwalior.',
    eligibility:
      '10+2 pass with Physics, Chemistry and Biology / Mathematics / Agriculture from MPBSE or equivalent recognised board.',
    seo: null,
    important_links: [
      { id: 10, name: 'MPESB Official Website', link: 'https://esb.mp.gov.in/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9008,
    documentId: 'agrico-exam-cg-pat',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'CG PAT',
    slug: 'cg-pat',
    full_name: 'Chhattisgarh Pre-Agriculture Test (CG Vyapam)',
    exam_mode: 'Offline',
    form_start_date: '2026-03-13',
    form_closing_date: '2026-04-14',
    admit_card_date: '2026-06-02',
    examination_date: '2026-06-09',
    registration_fee: 'Exempted for Chhattisgarh Domicile Candidates',
    position: 8,
    logo: null,
    streams: [STREAM_AGRI],
    courses: [],
    tags: [makeTerm(28, 'State SAU Exam · Chhattisgarh', 'state-exam')],
    description:
      'CG PAT is conducted by CGPEB (CG Vyapam) for admission to B.Sc. (Hons.) Agriculture and B.Sc. (Hons.) Horticulture at constituent and affiliated colleges of Indira Gandhi Krishi Vishwavidyalaya (IGKV), Raipur and Mahatma Gandhi Udyaniki Evam Vaniki Vishwavidyalaya (MGUVV), Durg.',
    eligibility:
      '10+2 with Science (PCB/PCM) or Agriculture group from a recognised board.',
    seo: null,
    important_links: [
      { id: 11, name: 'CG Vyapam Official Portal', link: 'https://vyapam.cgstate.gov.in/' },
      { id: 12, name: 'IGKV Raipur Admissions', link: 'https://igkv.ac.in/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9009,
    documentId: 'agrico-exam-mht-cet-agriculture',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'MHT-CET (MCAER Agriculture)',
    slug: 'mht-cet-agriculture',
    full_name: 'Maharashtra Common Entrance Test — MCAER State Agriculture & Allied CAP Counselling',
    exam_mode: 'Online',
    form_start_date: '2026-01-16',
    form_closing_date: '2026-03-08',
    admit_card_date: '2026-04-10',
    examination_date: '2026-04-22',
    registration_fee: '₹1,000 (Open) / ₹800 (Reserved Categories)',
    position: 9,
    logo: null,
    streams: [STREAM_AGRI, STREAM_ENGG],
    courses: [],
    tags: [makeTerm(29, 'State CET · Maharashtra', 'state-exam')],
    description:
      'Maharashtra State CET Cell conducts MHT-CET (PCB/PCM), whose scores are used by MCAER Pune for Centralized Admission Process (CAP) into B.Sc. (Hons.) Agriculture, Horticulture, Forestry, Community Science, B.F.Sc., B.Tech. Agricultural Engineering, Food Technology, and Biotechnology across MPKV Rahuri, PDKV Akola, VNMKV Parbhani, and DBSKKV Dapoli.',
    eligibility:
      '10+2 with Physics, Chemistry and Biology/Mathematics with minimum 50% marks (40% for reserved categories in Maharashtra).',
    seo: null,
    important_links: [
      { id: 13, name: 'Maharashtra CET Cell Portal', link: 'https://cetcell.mahacet.org/' },
      { id: 14, name: 'MCAER Pune Official Website', link: 'https://www.mcaer.org/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9010,
    documentId: 'agrico-exam-kcet-agriculture',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'KCET (Farm Science & Practical)',
    slug: 'kcet-agriculture',
    full_name: 'Karnataka Common Entrance Test — Farm Science & Agriculturist Quota Practical Test',
    exam_mode: 'Offline',
    form_start_date: '2026-01-23',
    form_closing_date: '2026-02-24',
    admit_card_date: '2026-04-05',
    examination_date: '2026-04-16',
    registration_fee: '₹500 (General/OBC) / ₹250 (SC/ST/Cat-1)',
    position: 10,
    logo: null,
    streams: [STREAM_AGRI, STREAM_ENGG, STREAM_VET],
    courses: [],
    tags: [makeTerm(30, 'State CET · Karnataka', 'state-exam')],
    description:
      'Conducted by the Karnataka Examinations Authority (KEA), KCET governs admission to B.Sc. (Hons.) Agriculture, Sericulture, Forestry, Horticulture, Community Science, B.Tech. Agricultural Engineering, Dairy Technology, Food Technology, B.F.Sc., and B.V.Sc. & A.H. across UAS Bangalore, UAS Dharwad, UAS Raichur, KSNUAHS Shivamogga, UHS Bagalkot, and KVAFSU Bidar.',
    eligibility:
      '2nd PUC / 12th Standard with Physics, Chemistry, Biology and Mathematics (PCBM required for most Farm Science degrees in Karnataka).',
    seo: null,
    important_links: [
      { id: 15, name: 'KEA Official Website', link: 'https://cetonline.karnataka.gov.in/kea/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9011,
    documentId: 'agrico-exam-ap-ts-eapcet-agriculture',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'AP & TG EAPCET (Agri & Vet)',
    slug: 'ap-ts-eapcet-agriculture',
    full_name: 'Andhra Pradesh & Telangana EAPCET — Agriculture, Horticulture, Veterinary & Fisheries Stream',
    exam_mode: 'Online',
    form_start_date: '2026-03-01',
    form_closing_date: '2026-04-15',
    admit_card_date: '2026-05-05',
    examination_date: '2026-05-19',
    registration_fee: '₹600–₹900 (General) / ₹500 (SC/ST)',
    position: 11,
    logo: null,
    streams: [STREAM_AGRI, STREAM_ENGG, STREAM_VET],
    courses: [],
    tags: [makeTerm(31, 'State CET · AP & Telangana', 'state-exam')],
    description:
      'AP EAPCET and TG EAPCET (BiPC & MPC streams) are the state entrance examinations for admission into ANGRAU Guntur, PJTSAU Hyderabad, Dr. YSRHU, SKLTSHU, SVVU Tirupati, PVNRTVU Hyderabad, and APFU across B.Sc. (Hons.) Agriculture, Horticulture, B.V.Sc. & A.H., B.F.Sc., and B.Tech. Agricultural Engineering & Food Technology.',
    eligibility:
      'Intermediate (10+2) pass with BiPC (Biology, Physics, Chemistry) or MPC (Mathematics, Physics, Chemistry) depending on the degree.',
    seo: null,
    important_links: [
      { id: 16, name: 'ANGRAU Official Admissions', link: 'https://angrau.ac.in/' },
      { id: 17, name: 'PJTSAU Hyderabad Official Website', link: 'https://www.pjtsau.edu.in/' },
    ],
    universities: [],
    university_contents: [],
  },
  {
    id: 9012,
    documentId: 'agrico-exam-cat-cmat-agribusiness',
    createdAt: '2026-10-30T00:00:00.000Z',
    updatedAt: '2026-10-30T00:00:00.000Z',
    publishedAt: '2026-10-30T00:00:00.000Z',
    name: 'CAT / CMAT / ICAR-PG (ABM)',
    slug: 'cat-cmat-agribusiness',
    full_name: 'CAT, XAT, CMAT & ICAR AIEEA-PG for MBA Agribusiness Management Admissions',
    exam_mode: 'Online',
    form_start_date: '2026-08-01',
    form_closing_date: '2026-09-20',
    admit_card_date: '2026-11-05',
    examination_date: '2026-11-29',
    registration_fee: '₹2,500 (CAT General) / ₹1,250 (SC/ST/PwBD)',
    position: 12,
    logo: null,
    streams: [STREAM_ABM],
    courses: [makeTerm(18, 'MBA Agribusiness Management', 'mba-agribusiness')],
    tags: [makeTerm(32, 'Agribusiness · Management', 'abm-exam')],
    description:
      'Admissions to 2-year full-time campus MBA in Agribusiness Management and PGDM (Agri-Business) at IIM Ahmedabad (FABM), IIM Lucknow (ABM), MANAGE Hyderabad, NIAM Jaipur, IRMA Anand, BHU, PAU Ludhiana, TNAU Coimbatore, GBPUAT Pantnagar, and leading private universities accept CAT, XAT, CMAT, or ICAR AIEEA (PG) scores followed by Group Discussion and Personal Interview.',
    eligibility:
      'Bachelor’s degree in Agriculture, Allied Sciences, or any discipline (depending on the institute) with minimum 50% marks or 6.00/10.00 OGPA.',
    seo: null,
    important_links: [
      { id: 18, name: 'MANAGE Hyderabad Admissions', link: 'https://www.manage.gov.in/' },
      { id: 19, name: 'CCS NIAM Jaipur Admissions', link: 'https://ccsniam.gov.in/' },
    ],
    universities: [],
    university_contents: [],
  },
];

function buildFilters(params: ExamListParams): CmsQuery['filters'] {
  const filters: Record<string, unknown> = {};

  if (params.stream) filters.streams = { slug: { $eq: params.stream } };

  const term = searchTerm(params.search);
  if (term) {
    filters.$or = [{ name: { $containsi: term } }, { full_name: { $containsi: term } }];
  }

  return filters;
}

export async function listExams(params: ExamListParams = {}): Promise<{
  exams: ExamCard[];
  pagination: Pagination;
}> {
  const term = searchTerm(params.search);
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(params.pageSize ?? DEFAULT_PAGE_SIZE, 100);

  let cmsExams: ExamCard[] = [];
  try {
    const { data } = await cmsCollection<ExamCard>(
      '/examinations',
      {
        filters: buildFilters(params),
        sort: 'position:asc',
        pagination: { page: 1, pageSize: 100 },
      },
      {
        tags: [collectionTag('examination')],
        revalidate: term ? 0 : undefined,
      }
    );
    cmsExams = data ?? [];
  } catch {
    cmsExams = [];
  }

  const seen = new Set(cmsExams.map((e) => e.slug));
  const localFiltered = FALLBACK_EXAMS.filter((exam) => {
    if (seen.has(exam.slug)) return false;
    if (params.stream && !exam.streams.some((s) => s.slug === params.stream)) return false;
    if (term) {
      const q = term.toLowerCase();
      const hay = `${exam.name} ${exam.full_name ?? ''} ${exam.description ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const combined = [...cmsExams, ...localFiltered];
  const total = combined.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const paged = combined.slice((page - 1) * pageSize, page * pageSize);

  return {
    exams: paged,
    pagination: { page, pageSize, pageCount, total },
  };
}

const EXAM_STATE_MAP: Record<string, string[]> = {
  upcatet: ['uttar pradesh'],
  'jet-rajasthan': ['rajasthan'],
  'mp-pat': ['madhya pradesh'],
  'cg-pat': ['chhattisgarh'],
  'mht-cet-agriculture': ['maharashtra'],
  'kcet-agriculture': ['karnataka'],
  'ap-ts-eapcet-agriculture': ['andhra pradesh', 'telangana'],
};

function enrichLocalExam(exam: ExamDetail): ExamDetail {
  const states = EXAM_STATE_MAP[exam.slug];
  const matchedUnis = states
    ? LOCAL_UNIVERSITY_CARDS.filter(
        (u) => u.state && states.includes(u.state.toLowerCase())
      ).slice(0, 12)
    : LOCAL_UNIVERSITY_CARDS.slice(0, 12);

  const defaultCourses: Taxonomy[] =
    exam.courses.length > 0
      ? exam.courses
      : exam.slug.includes('pg') || exam.slug.includes('jrf')
      ? [
          makeTerm(14, 'M.Sc. Agronomy', 'msc-agronomy'),
          makeTerm(15, 'M.Sc. Genetics & Plant Breeding', 'msc-genetics-plant-breeding'),
          makeTerm(16, 'M.Sc. Soil Science', 'msc-soil-science'),
          makeTerm(19, 'M.Sc. Entomology', 'msc-entomology'),
          makeTerm(20, 'Ph.D. Agronomy', 'phd-agronomy'),
        ]
      : [
          makeTerm(11, 'B.Sc. (Hons.) Agriculture', 'bsc-agriculture'),
          makeTerm(13, 'B.Sc. (Hons.) Horticulture', 'bsc-horticulture'),
          makeTerm(12, 'B.Tech. Agricultural Engineering', 'btech-agricultural-engineering'),
          makeTerm(17, 'B.V.Sc. & A.H.', 'bvsc-animal-husbandry'),
          makeTerm(21, 'B.F.Sc. Fisheries Science', 'bfsc-fisheries-science'),
        ];

  const isPgOrPhd = exam.slug.includes('pg') || exam.slug.includes('jrf');
  const isAbm = exam.slug.includes('agribusiness');

  const exam_pattern = [
    { label: 'Examination Mode', value: `${exam.exam_mode || 'Online'} (Computer-Based / OMR Test)` },
    {
      label: 'Question Paper Pattern',
      value: isPgOrPhd
        ? '120 Multiple-Choice Questions (MCQs) in the chosen Major Subject Group (Duration: 120 Minutes)'
        : isAbm
        ? 'Quantitative Aptitude, Data Interpretation & Logical Reasoning, Verbal Ability + Group Discussion & Personal Interview'
        : '150–200 Objective MCQs across Physics, Chemistry, and Biology / Mathematics / Agriculture (3 Domain Subjects)',
    },
    {
      label: 'Marking Scheme',
      value: '+4 or +5 marks for every correct response; −1 mark negative marking for incorrect responses (0 for unattempted)',
    },
    {
      label: 'Medium of Examination',
      value: states ? 'English & Regional State Official Language (Hindi / Marathi / Kannada / Telugu)' : 'English and Hindi (13 regional languages for CUET-UG)',
    },
    {
      label: 'Seat Quota Covered',
      value: states
        ? '85% State Domicile Quota Seats across State Agricultural, Horticultural & Veterinary Universities'
        : '15%–30% All-India Quota across 63+ SAUs & 100% Seats at Central / ICAR Deemed Universities',
    },
    {
      label: 'Reservation Policy',
      value: 'SC (15%), ST (7.5%), OBC-NCL (27%), EWS (10%), PwBD (5% Horizontal) & Farmer/Agriculturist Quota (where applicable)',
    },
  ];

  const syllabus_highlights = isPgOrPhd
    ? [
        {
          subject: 'Core Crop & Plant Sciences',
          topics: 'Principles of Agronomy, Field Crops, Weed & Water Management, Mendelian & Molecular Genetics, Plant Breeding Methods, Seed Technology, Plant Pathology & Agricultural Entomology.',
        },
        {
          subject: 'Soil Science, Horticulture & Allied Modules',
          topics: 'Soil Chemistry, Soil Fertility & Nutrient Management, Pomology, Olericulture, Floriculture, Post-Harvest Technology, Agricultural Economics, Statistical Methods & Extension Education.',
        },
      ]
    : [
        {
          subject: 'Agriculture & Biology Domain (NCERT / Class 11–12)',
          topics: 'Agrometeorology, Genetics & Plant Breeding, Biochemistry, Microbiology, Crop Production (Kharif & Rabi), Horticulture, Cell Biology, Plant Physiology, Ecology, Biotechnology & Human/Animal Welfare.',
        },
        {
          subject: 'Chemistry, Physics & Mathematics Domain',
          topics: 'Organic & Inorganic Chemistry, Chemical Equilibrium, Thermodynamics, Biomolecules, Electrostatics, Current Electricity, Optics, Modern Physics, Calculus, Matrices, Vectors & Probability.',
        },
      ];

  const counselling_steps = [
    {
      title: 'Step 1: Online Registration & Subject Combination Selection',
      detail: `Register on the official ${exam.name} portal before ${exam.form_closing_date || 'the closing date'}, upload scanned photograph/signature/category certificates, and select the exact subject group required by your target agricultural degree.`,
    },
    {
      title: 'Step 2: Admit Card Download & Entrance Examination',
      detail: `Download the hall ticket starting ${exam.admit_card_date || 'May'} and appear for the ${exam.exam_mode || 'Online'} examination on ${exam.examination_date || 'the scheduled date'}.`,
    },
    {
      title: 'Step 3: Provisional Answer Key, Normalization & Rank Card',
      detail: 'Verify responses against the official provisional answer key; normalized percentile scores and All-India / State Merit Ranks are published online.',
    },
    {
      title: 'Step 4: Online Choice Filling & Multi-Round Seat Allotment',
      detail: 'Register on the centralized counselling portal, lock university and degree preferences in order of priority, and complete online document verification and seat acceptance fee payment across Rounds 1–4 and the Mop-Up Round.',
    },
  ];

  const faqs = [
    {
      question: `Which agricultural degrees accept ${exam.name} scores?`,
      answer: `${exam.name} scores are accepted for on-campus admissions into ${defaultCourses.map((c) => c.name).join(', ')} and allied programmes across accredited participating universities.`,
    },
    {
      question: `Can Mathematics (PCM) or Agriculture (PAG) stream students apply for ${exam.name}?`,
      answer: 'Yes. Candidates from PCB, PCM, PCMB, and Agriculture (PCA/PAG) streams in Class 12 are eligible for B.Sc. (Hons.) Agriculture and Horticulture at most participating universities, while PCM is mandatory for B.Tech. Agricultural Engineering and PCB is mandatory for B.V.Sc. & A.H.',
    },
    {
      question: `How many rounds of counselling are conducted for ${exam.name}?`,
      answer: 'Typically 3 to 4 main online allotment rounds are conducted, followed by a final Mop-Up / Spot Counselling round for vacant seats.',
    },
  ];

  return {
    ...exam,
    courses: defaultCourses,
    universities: exam.universities.length > 0 ? exam.universities : matchedUnis,
    exam_pattern,
    syllabus_highlights,
    counselling_steps,
    faqs,
  };
}

export async function getExamBySlug(slug: string): Promise<ExamDetail | null> {
  try {
    const json = await cmsFetch<{ data: ExamDetail }>(
      `/examinations/slug/${encodeURIComponent(slug)}`,
      undefined,
      { tags: [collectionTag('examination'), entryTag('examination', slug)] }
    );
    if (json.data) return json.data;
  } catch (error) {
    if (!(error instanceof Error && 'status' in error && error.status === 404)) {
      // Fall through to local agriculture exams when CMS is offline
    }
  }

  const found = FALLBACK_EXAMS.find((exam) => exam.slug === slug);
  return found ? enrichLocalExam(found) : null;
}

export async function getExamSlugs(limit = 100): Promise<string[]> {
  const cmsSlugs = await cmsFetchOptional(async () => {
    const { data } = await cmsCollection<{ slug: string }>(
      '/examinations',
      { fields: ['slug'], sort: 'updatedAt:desc', pagination: { pageSize: limit } },
      { tags: [collectionTag('examination')] }
    );
    return data.map((entry) => entry.slug).filter(Boolean);
  }, []);

  return Array.from(new Set([...cmsSlugs, ...FALLBACK_EXAMS.map((exam) => exam.slug)]));
}
