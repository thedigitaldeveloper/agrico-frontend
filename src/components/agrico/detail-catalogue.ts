import { PROGRAMMES, type AgricultureProgramme } from './home-data';

const programmeSlugs: Record<string, string> = {
  agriculture: 'bsc-agriculture', engineering: 'btech-agricultural-engineering',
  horticulture: 'bsc-horticulture', agribusiness: 'mba-agribusiness',
  agronomy: 'msc-agronomy', diploma: 'diploma-agriculture',
};

export function programmeGuidePath(id: string) { return '/' + (programmeSlugs[id] || id); }
export function getProgrammeGuide(slug: string): AgricultureProgramme | undefined {
  return PROGRAMMES.find(item => programmeSlugs[item.id] === slug);
}
export function programmeGuideSlugs() { return Object.values(programmeSlugs); }

export interface UniversityGuide {
  slug: string; name: string; mark: string; city: string; state: string; ownership: string;
  source: string; admissions: string; description: string; programmeIds: string[];
}

/** Editorial profiles use official academic sources, never synthetic CMS records or fees. */
export const UNIVERSITY_GUIDES: UniversityGuide[] = [
  {
    slug: 'punjab-agricultural-university', name: 'Punjab Agricultural University', mark: 'PAU',
    city: 'Ludhiana', state: 'Punjab', ownership: 'State agricultural university',
    source: 'https://pau.edu/', admissions: 'https://www.pau-apms.in/',
    description: 'Explore agricultural sciences, engineering and horticultural learning at Punjab Agricultural University in Ludhiana. Get a clearer view of the academic pathways and the questions to ask before you apply.',
    programmeIds: ['agriculture', 'engineering', 'horticulture'],
  },
  {
    slug: 'tamil-nadu-agricultural-university', name: 'Tamil Nadu Agricultural University', mark: 'TNAU',
    city: 'Coimbatore', state: 'Tamil Nadu', ownership: 'State agricultural university',
    source: 'https://tnau.ac.in/bachelors-degree/', admissions: 'https://tnau.ac.in/ugadmission/',
    description: 'Discover agriculture and related degree pathways at Tamil Nadu Agricultural University in Coimbatore. Explore subject areas, practical learning and the university’s published admission information.',
    programmeIds: ['agriculture', 'engineering', 'horticulture', 'agribusiness', 'agronomy'],
  },
  {
    slug: 'indian-agricultural-research-institute', name: 'ICAR–Indian Agricultural Research Institute', mark: 'IARI',
    city: 'New Delhi', state: 'Delhi', ownership: 'ICAR deemed university',
    source: 'https://www.iari.res.in/', admissions: 'https://www.iari.res.in/en/index.php',
    description: 'Explore agricultural education and research at ICAR–Indian Agricultural Research Institute, New Delhi. Read about its academic programmes and prepare questions about your next stage of study.',
    programmeIds: ['agriculture', 'agronomy'],
  },
  {
    slug: 'lovely-professional-university', name: 'Lovely Professional University', mark: 'LPU',
    city: 'Phagwara', state: 'Punjab', ownership: 'Private university',
    source: 'https://www.lpu.in/schools/agriculture/', admissions: 'https://www.lpu.in/admission/',
    description: 'Explore the School of Agriculture at Lovely Professional University in Phagwara, Punjab. Compare agricultural study pathways and learn what to check about curriculum, practical learning and admission.',
    programmeIds: ['agriculture', 'agronomy'],
  },
];

export function getUniversityGuide(slug: string) { return UNIVERSITY_GUIDES.find(item => item.slug === slug); }
