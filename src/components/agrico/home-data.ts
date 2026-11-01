export type StudyLevel = 'Undergraduate' | 'Postgraduate' | 'Diploma';
export interface AgricultureProgramme {
  id: string;
  name: string;
  shortName: string;
  navName: string;
  level: StudyLevel;
  duration: string;
  description: string;
  focus: string;
  subjects: string;
  practical: string;
  careers: string;
  topics: { title: string; description: string; art: number }[];
  source: string;
}

export const PROGRAMMES: AgricultureProgramme[] = [
  {
    id: 'agriculture', name: 'B.Sc. (Hons.) Agriculture', shortName: 'B.Sc. Agriculture', navName: 'B.Sc. Agriculture',
    level: 'Undergraduate', duration: '4 years',
    description: 'Study agricultural sciences and living systems. Build an understanding of plants, soil and the science behind sustainable agriculture.',
    focus: 'Agricultural sciences', subjects: 'Plant, soil & crop sciences', practical: 'Laboratory & field studies', careers: 'Research, extension & agribusiness',
    topics: [
      { title: 'Plant & crop science', description: 'Plant biology, crop science and agricultural systems.', art: 6 },
      { title: 'Soil science', description: 'Soil health, natural resources and the living environment.', art: 1 },
      { title: 'Practical learning', description: 'Laboratory studies, observation and guided field projects.', art: 3 },
    ], source: 'https://tnau.ac.in/b-sc-hons-agriculture-english-tamil/',
  },
  {
    id: 'engineering', name: 'B.Tech. Agricultural Engineering', shortName: 'Agricultural Engineering', navName: 'Agri Engineering',
    level: 'Undergraduate', duration: '4 years',
    description: 'Apply engineering principles to solve real problems in farming, water management, post-harvest and food systems.',
    focus: 'Engineering applications', subjects: 'Machinery, water & food systems', practical: 'Design labs & technical projects', careers: 'Engineering, irrigation & processing',
    topics: [
      { title: 'Farm machinery', description: 'Design and operation of farm machinery and equipment.', art: 0 },
      { title: 'Soil & water', description: 'Irrigation, water resources and land development.', art: 1 },
      { title: 'Food processing', description: 'Post-harvest technology and food process engineering.', art: 2 },
    ], source: 'https://tnau.ac.in/b-tech-agricultural-engineering/',
  },
  {
    id: 'horticulture', name: 'B.Sc. (Hons.) Horticulture', shortName: 'B.Sc. Horticulture', navName: 'Horticulture',
    level: 'Undergraduate', duration: '4 years',
    description: 'Explore horticultural science, plant development and the knowledge behind productive, sustainable growing systems.',
    focus: 'Horticultural sciences', subjects: 'Plant development & horticultural systems', practical: 'Laboratory, nursery & field learning', careers: 'Research, horticulture & enterprise',
    topics: [
      { title: 'Plant development', description: 'Understand how horticultural plants grow and develop.', art: 3 },
      { title: 'Growing systems', description: 'Study propagation, resource use and protected cultivation.', art: 4 },
      { title: 'Field studies', description: 'Connect scientific understanding with practical observations.', art: 6 },
    ], source: 'https://tnau.ac.in/bachelors-degree/',
  },
  {
    id: 'agribusiness', name: 'MBA Agribusiness', shortName: 'MBA Agribusiness', navName: 'Agribusiness',
    level: 'Postgraduate', duration: 'Programme-specific',
    description: 'Learn business and management for the agricultural sector, connecting agricultural knowledge with markets, supply chains and enterprise.',
    focus: 'Business & management', subjects: 'Management & supply chains', practical: 'Case studies & business projects', careers: 'Business & enterprise',
    topics: [
      { title: 'Management', description: 'Explore strategy, decision-making and agricultural enterprise.', art: 8 },
      { title: 'Supply chains', description: 'Understand agricultural markets and food value chains.', art: 2 },
      { title: 'Business projects', description: 'Apply your learning through case studies and practical work.', art: 7 },
    ], source: 'https://tnau.ac.in/masters/',
  },
  {
    id: 'agronomy', name: 'M.Sc. (Agriculture) Agronomy', shortName: 'M.Sc. Agronomy', navName: 'Agronomy',
    level: 'Postgraduate', duration: 'Programme-specific',
    description: 'Deepen your understanding of crop production, agricultural resources and research through postgraduate study in agronomy.',
    focus: 'Advanced agricultural sciences', subjects: 'Crop production & resource management', practical: 'Research & field investigations', careers: 'Research, teaching & agricultural sciences',
    topics: [
      { title: 'Crop studies', description: 'Explore crop production and the science of agricultural systems.', art: 6 },
      { title: 'Resource management', description: 'Study soil, water and sustainable agricultural resources.', art: 1 },
      { title: 'Research', description: 'Build skills in scientific investigation and field studies.', art: 3 },
    ], source: 'https://tnau.ac.in/masters/',
  },
  {
    id: 'diploma', name: 'Diploma in Agriculture', shortName: 'Agriculture Diploma', navName: 'Agriculture Diploma',
    level: 'Diploma', duration: 'Check institute details',
    description: 'Explore a practical introduction to agriculture. Check the curriculum, entry requirements and study duration with the institute you choose.',
    focus: 'Agricultural foundations', subjects: 'Agricultural practices & foundations', practical: 'Practical and field-based learning', careers: 'Explore programme-specific opportunities',
    topics: [
      { title: 'Foundations', description: 'Develop an introduction to agricultural subjects.', art: 3 },
      { title: 'Practical study', description: 'Explore hands-on learning in agricultural practices.', art: 6 },
      { title: 'Your next step', description: 'Check progression opportunities and institute requirements.', art: 8 },
    ], source: 'https://tnau.ac.in/',
  },
];

export const UNIVERSITIES = [
  { id: 'pau', mark: 'PAU', name: 'Punjab Agricultural University', state: 'Punjab', source: 'https://www.pau.edu/', match: ['punjab agricultural', 'pau'] },
  { id: 'tnau', mark: 'TNAU', name: 'Tamil Nadu Agricultural University', state: 'Tamil Nadu', source: 'https://tnau.ac.in/', match: ['tamil nadu agricultural', 'tnau'] },
  { id: 'iari', mark: 'IARI', name: 'ICAR–Indian Agricultural Research Institute', state: 'Delhi', source: 'https://www.iari.res.in/', match: ['indian agricultural research', 'iari'] },
] as const;

export const FAQS = [
  { question: 'Agriculture or Agricultural Engineering: how do I choose?', answer: 'It depends on your interests. If you enjoy biological sciences, plant and soil systems, and working with living systems, B.Sc. Agriculture may be a good fit. If you are more interested in engineering, design and technical solutions for farming, water or food systems, Agricultural Engineering could be the right choice. Compare the actual curriculum and entry requirements at each university.' },
  { question: 'What should I compare across universities?', answer: 'Look at the programme curriculum, practical learning, laboratories, faculty, campus facilities, location and total cost. Check published information and ask the university about projects, field visits and student support before making your shortlist.' },
  { question: 'Where can I check current admission requirements?', answer: 'Use the official university admissions website and, where relevant, the official ICAR or examination portal. Eligibility, subject requirements, application routes and deadlines can differ between programmes and institutions.' },
  { question: 'Can I speak to a counsellor?', answer: 'Yes. Use the callback form below and choose the programme you are interested in. A counsellor can help you understand your options, compare universities and prepare questions for the admission process.' },
];

export const GUIDES = [
  {
    id: 'degree-choice', number: '01', title: 'Choosing your agriculture degree', description: 'Understand subject areas, learning styles and career paths to find the right fit.', art: 3,
    sections: [
      { title: 'Start with how you like to learn', text: 'Agriculture programmes explore plants, soil, crop systems and agricultural sciences. Agricultural Engineering applies engineering to machinery, water resources, processing and agricultural systems. Read the actual course structure rather than deciding from a degree name alone.' },
      { title: 'Compare the learning experience', text: 'Ask about laboratory work, field studies, design projects, research opportunities and assessment. A programme should connect your interests with the kind of work you want to explore.' },
      { title: 'Check your next step', text: 'Confirm current entry requirements, subject combinations and admission routes with the institution. Keep a shortlist and talk through any questions with a counsellor.' },
    ], source: 'https://tnau.ac.in/bachelors-degree/',
  },
  {
    id: 'university-learning', number: '02', title: 'Comparing university learning', description: 'Look at curricula, practical learning, campus facilities and compare your options.', art: 4,
    sections: [
      { title: 'Look beyond the name', text: 'Compare the exact programme offered, its curriculum, campus and study format. Universities can offer different specialisations and practical opportunities even when the degree names are similar.' },
      { title: 'Ask useful questions', text: 'What laboratory and workshop facilities are used? Are there field visits or student projects? How is practical learning assessed? Ask for current information about accommodation, accessibility and student support as well.' },
      { title: 'Build a consistent shortlist', text: 'Write down your priorities and compare institutions against the same criteria. Verify fees, recognition and current admission details directly with the institution before submitting an application.' },
    ], source: 'https://icar.gov.in/en',
  },
  {
    id: 'counselling', number: '03', title: 'Preparing for counselling', description: 'Know what to ask, what to prepare and how to make the most of your counselling session.', art: 5,
    sections: [
      { title: 'Bring your starting point', text: 'Note your subjects, academic background, course interests and preferred locations. You do not need to have every answer ready before asking for guidance.' },
      { title: 'Prepare your questions', text: 'Write down what you want to understand about eligibility, curriculum, university options, costs and the application process. Keep any published university information handy.' },
      { title: 'Leave with a practical next step', text: 'A useful session should help you make a shortlist and identify what to verify next. Counselling offers guidance; final admission decisions and eligibility requirements belong to the relevant institution or authority.' },
    ], source: 'https://icar.gov.in/en',
  },
];

export const ADMISSION_RESOURCES = [
  { title: 'CUET (UG) & ICAR', description: 'Official undergraduate admission information', href: 'https://www.icar.gov.in/en/public-notice-and-information-bulletin-cuet-icar-ug-2026' },
  { title: 'University admissions', description: 'Programme-specific admission requirements', href: 'https://tnau.ac.in/' },
  { title: 'ICAR resources', description: 'Agricultural education and official updates', href: 'https://icar.gov.in/en' },
];

export interface AgricoHeroSlide {
  id: string;
  image: string;
  alt: string;
  href?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  tag?: string | null;
  ctaLabel?: string | null;
}

export const DEFAULT_AGRICO_SLIDES: AgricoHeroSlide[] = [
  {
    id: 'degree-explorer',
    eyebrow: 'India’s agriculture education platform',
    heading: 'Study agriculture.\nEngineer your next step.',
    description: 'Find your degree, compare universities and get admission guidance.',
    image: '/images/agrico/hero-campus.png',
    alt: 'University students learning together with a teaching drone and a laptop in an agriculture engineering studio',
    href: '#programmes',
    tag: 'Degree Explorer',
  },
  {
    id: 'crop-science-greenhouse',
    eyebrow: 'Plant science & crop innovation',
    heading: 'Innovate with nature.\nLead crop discoveries.',
    description: 'Connect classroom biology with experimental nurseries, tissue labs and research plots.',
    image: '/images/agrico/banners/banner-2.jpg',
    alt: 'Indian university botany student and professor studying healthy green crop seedlings in a modern research greenhouse',
    href: '#programmes',
    tag: 'Plant Science',
  },
  {
    id: 'smart-farm-machinery',
    eyebrow: 'Precision farming & smart systems',
    heading: 'Learn modern agritech.\nDrive farm automation.',
    description: 'Hands-on training in drone sensors, GIS mapping, precision machinery and smart irrigation.',
    image: '/images/agrico/banners/banner-3.jpg',
    alt: 'Indian agriculture students in an experimental university field with a modern smart tractor and irrigation equipment',
    href: '#programmes',
    tag: 'Field Engineering',
  },
  {
    id: 'campus-landscape',
    eyebrow: 'Verified institutions across India',
    heading: 'Find the right campus.\nShape your future.',
    description: 'Compare universities, campus life, ICAR recognition and admission details side by side.',
    image: '/images/agrico/banners/banner-4.jpg',
    alt: 'Scenic view of a premier Indian agricultural university campus with lush green lawns and modern academic buildings',
    href: '#universities',
    tag: 'Campus Life',
  },
];

export const CLASSIC_AGRICO_HERO = {
  eyebrow: 'India’s agriculture education platform',
  heading: 'Study agriculture.\nEngineer your next step.',
  description: 'Find your degree, compare universities and get admission guidance.',
  image: '/images/agrico/hero-campus.png',
  alt: 'University students learning together with a teaching drone and a laptop in an agriculture engineering studio',
};
