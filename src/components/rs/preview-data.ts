import type { RsHomeData, Offering } from './home-types';
const names = [
  'Manipal University Jaipur',
  'Chandigarh University',
  'Amity University',
  'Lovely Professional University',
];
const degrees = ['MBA', 'BBA', 'MCA', 'MBA'];
const full = [
  'Master of Business Administration',
  'Bachelor of Business Administration',
  'Master of Computer Applications',
  'Master of Business Administration',
];
const offerings: Offering[] = names.map((university, i) => ({
  id: 'preview-' + i,
  university,
  universitySlug: 'preview-university-' + i,
  program: degrees[i],
  programSlug: 'preview-programme-' + i,
  degree: degrees[i],
  courseSlug: degrees[i].toLowerCase(),
  fullName: full[i],
  level: i === 1 ? 'Undergraduate' : 'Postgraduate',
  mode: 'Online',
  duration: i === 1 ? '3 years' : '2 years',
  fee: null,
  feeNote: '',
  eligibility: [],
  syllabus: null,
  logo: null,
  image: '/images/rs/campus-life.png',
  href: '#guidance',
}));
export const previewData: RsHomeData = {
  home: null,
  catalogue: offerings,
  programmeChoices: [...new Set(degrees)],
  spotlight: offerings[0],
  comparisonOfferings: offerings.slice(0, 2),
  universityOptions: [],
  mentors: [],
  testimonials: [],
  offerings: offerings.slice(0, 3),
  universities: names.map((name, i) => ({
    id: 'uni-' + i,
    name,
    slug: 'preview-' + i,
    location: '',
    logo: null,
    image: '/images/rs/campus-life.png',
    degrees: [degrees[i]],
  })),
  slides: [{
    id: 'preview-hero',
    heading: 'Your degree. Your next big move.',
    description: 'Explore university programmes and get help planning your next step.',
    eyebrow: 'Programmes. Universities. Your next step.',
    image: '/images/rs/campus-life.png',
    alt: 'Illustrative campus image for the design preview',
    offeringId: offerings[0].id,
  }],
  news: [
    {
      id: 'n1',
      title: 'University admission updates',
      summary:
        'A dedicated place for the latest university announcements and admission information.',
      date: null,
      image: '/images/rs/campus-life.png',
      href: '#',
    },
    {
      id: 'n2',
      title: 'Programme announcements',
      summary: 'Follow new programme information as universities publish it.',
      date: null,
      image: null,
      href: '#',
    },
    {
      id: 'n3',
      title: 'Application timelines explained',
      summary: 'Understand the next steps and the dates to check.',
      date: null,
      image: null,
      href: '#',
    },
  ],
  blogs: [
    {
      id: 'b1',
      title: 'MBA after graduation: where to begin',
      summary:
        'Make space for the questions that matter before choosing your programme.',
      date: null,
      image: '/images/rs/student-life.png',
      href: '#',
    },
    {
      id: 'b2',
      title: 'Online or distance: understand the difference',
      summary: 'Understand the study format and support available before making your choice.',
      date: null,
      image: '/images/rs/campus-life.png',
      href: '#',
    },
    {
      id: 'b3',
      title: 'Your admission checklist',
      summary: 'Prepare your questions, documents and next steps with a simple checklist.',
      date: null,
      image: '/images/rs/student-life.png',
      href: '#',
    },
  ],
  faqs: [
    {
      question: 'Where should I begin?',
      answer:
        'Start with the programme you want to study, then consider the university, mode and eligibility.',
    },
    {
      question: 'Can I compare my options?',
      answer:
        'Select any two university programmes to view their available information side by side.',
    },
    {
      question: 'Which documents do I need?',
      answer:
        'The university will specify academic and identity documents for your chosen programme.',
    },
    {
      question: 'How do I get admission guidance?',
      answer:
        'Share your programme interests through the callback form and an advisor can help you understand the next steps.',
    },
  ],
  steps: [
    {
      step: '01', highlights: [],
      title: 'Find your programme',
      description:
        'Explore the subject you want to study and the university options available.',
    },
    {
      step: '02', highlights: [],
      title: 'Talk through your options',
      description:
        'Understand the study format, eligibility and fees before deciding.',
    },
    {
      step: '03', highlights: [],
      title: 'Take the next step',
      description: 'Get clarity on documents and the application process.',
    },
  ],
};
