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
  slug: string;
  name: string;
  mark: string;
  city: string;
  state: string;
  ownership: string;
  established: string;
  address: string;
  approvals: string[];
  rankings: string[];
  highlights: { key: string; value: string }[];
  source: string;
  admissions: string;
  description: string;
  programmeIds: string[];
  programmeSlugs: string[];
  authoredHtml: string;
}

/** Editorial profiles use official academic sources and comprehensive ICAR/SAU research. */
export const UNIVERSITY_GUIDES: UniversityGuide[] = [
  {
    slug: 'punjab-agricultural-university',
    name: 'Punjab Agricultural University',
    mark: 'PAU',
    city: 'Ludhiana',
    state: 'Punjab',
    ownership: 'State Agricultural University (SAU)',
    established: '1962',
    address: 'Ferozepur Road, Ludhiana, Punjab – 141004',
    approvals: ['ICAR Accredited (Grade A)', 'UGC Recognised', 'AIU Member'],
    rankings: ['NIRF Agriculture & Allied Sectors #3', 'ICAR State Agricultural University Rank #2'],
    highlights: [
      { key: 'Campus Area', value: '1,510 Acres (Ludhiana Main Campus) + 18 Regional Research Stations' },
      { key: 'Constituent Colleges', value: '6 Colleges (Agriculture, Agricultural Engineering, Horticulture & Forestry, Community Science, Basic Sciences, Agribusiness)' },
      { key: 'Entrance Exams', value: 'PAU CET / AAT / MET & ICAR AIEEA (UG/PG/PhD 15%–20% Quota)' },
      { key: 'Practical Training', value: '20-Week RAWE + Agro-Industrial Attachment + Experimental Seed Farms' },
      { key: 'Typical Annual Tuition', value: '₹42,000 – ₹78,000 / year (Subsidised Government SAU Schedule)' },
      { key: 'Flagship Recruiters', value: 'Punjab State Dept. of Agriculture, IFFCO, Syngenta, Bayer, John Deere, Mahindra Agri, NABARD' },
    ],
    source: 'https://pau.edu/',
    admissions: 'https://www.pau.edu/index.php?_act=manageEvent&DO=addmission',
    description:
      'Founded in 1962 on the land-grant model and widely recognised as the cradle of India’s Green Revolution, Punjab Agricultural University (PAU), Ludhiana spans 1,510 acres of experimental farms, precision-agriculture laboratories, and six constituent colleges.',
    programmeIds: ['agriculture', 'engineering', 'horticulture', 'agribusiness', 'agronomy'],
    programmeSlugs: [
      'bsc-agriculture',
      'btech-agricultural-engineering',
      'bsc-horticulture',
      'mba-agribusiness',
      'msc-agronomy',
      'phd-agronomy',
      'msc-genetics-plant-breeding',
      'msc-soil-science',
    ],
    authoredHtml: `
      <div class="ag-guide-rich">
        <h3>Institutional Legacy & Academic Structure</h3>
        <p>Established in 1962 and formally inaugurated by Prime Minister Pandit Jawaharlal Nehru, <strong>Punjab Agricultural University (PAU), Ludhiana</strong> spearheaded the high-yielding wheat and paddy varietal breakthroughs that defined India's Green Revolution. Modelled on the American land-grant university system, PAU integrates resident instruction, applied crop and livestock research, and frontline farmer extension across Punjab through 18 Krishi Vigyan Kendras (KVKs) and regional research stations.</p>
        <p>The Ludhiana campus houses six constituent colleges: the <strong>College of Agriculture</strong>, <strong>College of Horticulture and Forestry</strong>, <strong>College of Agricultural Engineering and Technology (COAET)</strong>, <strong>College of Basic Sciences and Humanities</strong>, <strong>College of Community Science</strong>, and the <strong>School of Business Studies (Agribusiness Management)</strong>.</p>
        <h3>Admission Pathways & Entrance Examinations</h3>
        <ul>
          <li><strong>B.Sc. (Hons.) Agriculture &amp; B.Sc. (Hons.) Horticulture (4-Year &amp; 6-Year Programmes):</strong> Punjab domicile candidates are admitted through the <strong>PAU Common Entrance Test (CET)</strong> and <strong>Agriculture Aptitude Test (AAT)</strong>, while 15% of seats are filled on an all-India basis via <strong>CUET (ICAR-UG)</strong> counselling.</li>
          <li><strong>B.Tech. Agricultural Engineering:</strong> Admission is conducted via JEE (Main) merit and ICAR AIEEA (UG) all-India quota seats.</li>
          <li><strong>M.Sc. Agriculture, MBA (Agribusiness) &amp; Ph.D. Programmes:</strong> Admissions are through the <strong>PAU Master’s Entrance Test (MET)</strong> and <strong>ICAR AIEEA (PG) / AICE-JRF/SRF</strong> (20% all-India seats).</li>
        </ul>
        <h3>Experimental Farms, Laboratories &amp; RAWE Training</h3>
        <p>Undergraduate students complete a mandatory 1-year experiential training module combining <strong>Rural Agricultural Work Experience (RAWE)</strong> in adopted Punjab villages with <strong>Experiential Learning Units (ELUs)</strong> in seed production, tissue culture, mushroom cultivation, bio-fertiliser formulation, and protected cultivation.</p>
      </div>
    `,
  },
  {
    slug: 'tamil-nadu-agricultural-university',
    name: 'Tamil Nadu Agricultural University',
    mark: 'TNAU',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    ownership: 'State Agricultural University (SAU)',
    established: '1971 (Origin 1906)',
    address: 'Lawley Road, Coimbatore, Tamil Nadu – 641003',
    approvals: ['ICAR Accredited (Grade A)', 'UGC Recognised', 'AICTE Approved (B.Tech)'],
    rankings: ['NIRF Agriculture & Allied Sectors #4', 'Southern India’s Premier Multi-Campus SAU'],
    highlights: [
      { key: 'Campus Network', value: '18 Constituent Colleges + 40 Research Stations across Tamil Nadu' },
      { key: 'Flagship Campus', value: 'Coimbatore Main Campus (1,300+ Acres Botanical Gardens & Experimental Fields)' },
      { key: 'UG & PG Programmes', value: '14 UG Degree Programmes, 33 Master’s Disciplines & 28 Doctoral Specialisations' },
      { key: 'Admission Route', value: 'TNAU Single-Window Class 12 Academic Merit Counselling + 15% ICAR UG Quota' },
      { key: 'Typical Annual Tuition', value: '₹36,000 – ₹65,000 / year (Regular Seat) | Self-Supporting Quota Available' },
      { key: 'Career & Research', value: 'TNPSC Agricultural Officer (AO/HO), Seed & Biotech MNCs, Agri-Export & Plantation Sector' },
    ],
    source: 'https://tnau.ac.in/',
    admissions: 'https://tnau.ucanapply.com/',
    description:
      'Tracing its academic heritage to the Madras Agricultural School (1868) and the Coimbatore Agricultural College & Research Institute (1906), Tamil Nadu Agricultural University (TNAU), Coimbatore operates 18 constituent colleges and 40 research stations across every agro-climatic zone of Tamil Nadu.',
    programmeIds: ['agriculture', 'engineering', 'horticulture', 'agribusiness', 'agronomy', 'diploma'],
    programmeSlugs: [
      'bsc-agriculture',
      'btech-agricultural-engineering',
      'bsc-horticulture',
      'bsc-agribusiness',
      'mba-agribusiness',
      'msc-agronomy',
      'phd-agronomy',
      'msc-entomology',
      'msc-plant-pathology',
      'diploma-agriculture',
    ],
    authoredHtml: `
      <div class="ag-guide-rich">
        <h3>Heritage &amp; Multi-Campus Network Across Tamil Nadu</h3>
        <p>With roots dating back to 1868 in Saidapet (Chennai) and relocated to Coimbatore in 1906, <strong>Tamil Nadu Agricultural University (TNAU)</strong> became a statutory State Agricultural University in 1971. Today, TNAU coordinates <strong>18 constituent colleges</strong> (including AC&amp;RI Coimbatore, Madurai, Killikulam, Trichy, Vazhavachanur, Eachangkottai, Kudumiyanmalai, Chettinad, HC&amp;RI Periyakulam, and AEC&amp;RI Kumulur) alongside 28 affiliated colleges and 40 specialized research stations.</p>
        <h3>Undergraduate, Postgraduate &amp; Diploma Pathways</h3>
        <ul>
          <li><strong>Undergraduate Admissions (TNAU Counselling &amp; ICAR Quota):</strong> State quota admissions for B.Sc. (Hons.) Agriculture, B.Sc. (Hons.) Horticulture, B.Tech. Agricultural Engineering, and B.Sc. (Hons.) Agribusiness Management are conducted via TNAU's single-window online counselling based on normalized Class 12 (HSC) marks in four subjects, alongside 15% all-India seats filled through <strong>CUET (ICAR-UG)</strong>.</li>
          <li><strong>Postgraduate &amp; Doctoral Admissions:</strong> Conducted via TNAU PG/Ph.D. Entrance Examination and <strong>ICAR AIEEA (PG) / AICE-JRF/SRF</strong> across 33 Master’s and 28 Doctoral departments.</li>
          <li><strong>Diploma in Agriculture &amp; Horticulture:</strong> 2-year hands-on technical diplomas delivered in Tamil and English mediums across TNAU institutes and polytechnics.</li>
        </ul>
        <h3>Research Strengths, Plant Breeding &amp; Placement Ecosystem</h3>
        <p>TNAU has released over 850 high-yielding crop varieties and hybrids in rice, millets, pulses, oilseeds, cotton, sugarcane, and horticultural crops. Graduates record strong placement outcomes in the <strong>Tamil Nadu Public Service Commission (TNPSC Agricultural Officer &amp; Horticultural Officer cadres)</strong>, nationalised banks (IBPS AFO), seed and crop-protection firms, and international agricultural fellowships.</p>
      </div>
    `,
  },
  {
    slug: 'indian-agricultural-research-institute',
    name: 'ICAR–Indian Agricultural Research Institute',
    mark: 'IARI',
    city: 'New Delhi',
    state: 'Delhi',
    ownership: 'Central / ICAR Deemed University',
    established: '1905 (Deemed University 1958)',
    address: 'Pusa Campus, Hillside Road, New Delhi – 110012',
    approvals: ['ICAR Deemed-to-be University', 'UGC Section 3 Recognised', 'NAAC Accredited'],
    rankings: ['NIRF Agriculture & Allied Sectors #1 (Rank 1 Nationwide)', 'India’s Flagship National Agricultural Research Institute'],
    highlights: [
      { key: 'National Ranking', value: 'Ranked #1 in India in NIRF Agriculture & Allied Sectors Category' },
      { key: 'Campus Area', value: '1,250-Acre Pusa Campus in New Delhi + 20 Regional Hubs & Mega-University Network' },
      { key: 'Academic Schools', value: '26 Postgraduate & Doctoral Divisions + B.Sc. (Hons.) Agriculture (Launched under NEP 2020)' },
      { key: 'Admission Route', value: '100% All-India Merit via CUET (ICAR-UG), ICAR AIEEA (PG) & ICAR AICE-JRF/SRF' },
      { key: 'Student Fellowships', value: 'IARI Merit Scholarship, ICAR JRF (₹12,640/mo) & ICAR SRF (₹31,000–₹35,000/mo)' },
      { key: 'Global Research Facilities', value: 'National Phytotron Facility, Nanaji Deshmukh Plant Phenomics Centre, Discovery Centre' },
    ],
    source: 'https://www.iari.res.in/',
    admissions: 'https://www.iari.res.in/en/pg-school.html',
    description:
      'Ranked #1 in India for Agriculture and Allied Sectors (NIRF), ICAR–Indian Agricultural Research Institute (IARI, Pusa Campus, New Delhi) is India’s flagship Deemed-to-be University for agricultural education, plant breeding, agronomy, and advanced crop sciences.',
    programmeIds: ['agriculture', 'agronomy'],
    programmeSlugs: [
      'bsc-agriculture',
      'msc-agronomy',
      'phd-agronomy',
      'msc-genetics-plant-breeding',
      'msc-entomology',
      'msc-plant-pathology',
      'msc-soil-science',
      'msc-agricultural-economics',
      'msc-agricultural-extension',
      'msc-fruit-science',
      'msc-vegetable-science',
      'msc-floriculture-landscaping',
    ],
    authoredHtml: `
      <div class="ag-guide-rich">
        <h3>India’s #1 Agricultural Research &amp; Deemed University (Pusa Institute)</h3>
        <p>Originally established in 1905 at Pusa (Bihar) and relocated to its iconic 1,250-acre <strong>Pusa Campus in New Delhi</strong> in 1936, <strong>ICAR–Indian Agricultural Research Institute (IARI)</strong> was granted Deemed-to-be University status under the UGC Act in 1958. Consistently ranked <strong>#1 in India under the NIRF Agriculture and Allied Sectors category</strong>, IARI is globally renowned for breeding Pusa Basmati rice varieties (generating over ₹40,000 crore in annual export earnings) and high-yielding wheat, mustard, and vegetable cultivars.</p>
        <h3>Academic Programmes &amp; 100% All-India Entrance</h3>
        <ul>
          <li><strong>B.Sc. (Hons.) Agriculture &amp; B.Sc. (Hons.) Community Science:</strong> Launched under the NEP 2020 multi-exit/entry framework across IARI New Delhi and its 14 ICAR hub institutes, admitted exclusively through <strong>CUET (ICAR-UG)</strong> all-India merit.</li>
          <li><strong>M.Sc. / M.Tech. across 26 Divisions:</strong> Including Agronomy, Genetics &amp; Plant Breeding, Soil Science &amp; Agricultural Chemistry, Entomology, Plant Pathology, Agricultural Economics, Agricultural Extension, Fruit &amp; Horticultural Technology, Vegetable Science, and Floriculture &amp; Landscaping via <strong>ICAR AIEEA (PG)</strong>.</li>
          <li><strong>Ph.D. Programmes:</strong> Admitted via <strong>ICAR AICE-JRF/SRF (Ph.D.)</strong> with full institutional and ICAR fellowships.</li>
        </ul>
        <h3>World-Class Research Infrastructure &amp; Fellowships</h3>
        <p>Students train directly inside national reference facilities including the <strong>National Phytotron Facility</strong>, the <strong>Nanaji Deshmukh National Plant Phenomics Facility</strong>, the <strong>National Institute for Plant Biotechnology (NIPB)</strong>, and precision experimental farms. Virtually all admitted PG and Ph.D. scholars receive ICAR Junior/Senior Research Fellowships or IARI Institutional Fellowships alongside subsidised tuition and hostel accommodation.</p>
      </div>
    `,
  },
  {
    slug: 'lovely-professional-university',
    name: 'Lovely Professional University',
    mark: 'LPU',
    city: 'Phagwara',
    state: 'Punjab',
    ownership: 'Private University (ICAR Accredited School of Agriculture)',
    established: '2005',
    address: 'Jalandhar–Delhi G.T. Road, Phagwara, Punjab – 144411',
    approvals: ['ICAR Accredited (School of Agriculture)', 'UGC Recognised', 'NAAC A++ Grade'],
    rankings: ['NIRF Agriculture & Allied Sectors #16', 'First Private University in India to Receive ICAR Accreditation'],
    highlights: [
      { key: 'ICAR Milestone', value: 'First Private University School of Agriculture in India Accredited by ICAR (NAEAB)' },
      { key: 'Agricultural Farm Area', value: '250+ Acres Dedicated Polyhouse, Hydroponic, Orchard & Field Research Farms' },
      { key: 'Programmes Offered', value: 'B.Sc. (Hons.) Agriculture, M.Sc. Agronomy, M.Sc. Genetics & Plant Breeding, Horticulture & Agribusiness' },
      { key: 'Admission & Scholarships', value: 'LPUNEST / CUET Merit with up to 50% Tuition Scholarship Slabs' },
      { key: 'Typical Annual Tuition', value: '₹1,60,000 – ₹2,40,000 / year (Before LPUNEST / CUET Merit Scholarship)' },
      { key: 'Placement & AgTech Links', value: 'Syngenta, Dhanuka Agritech, Bayer, Ninjacart, DeHaat, ITC Agri Business' },
    ],
    source: 'https://www.lpu.in/schools/agriculture/',
    admissions: 'https://www.lpu.in/admission/',
    description:
      'Lovely Professional University (LPU), Phagwara houses the first private School of Agriculture in India to receive ICAR accreditation, featuring 250+ acres of experimental farms, polyhouses, digital-agriculture labs, and Fifth Deans’ Committee curriculum alignment.',
    programmeIds: ['agriculture', 'horticulture', 'agribusiness', 'agronomy'],
    programmeSlugs: [
      'bsc-agriculture',
      'bsc-horticulture',
      'mba-agribusiness',
      'msc-agronomy',
      'msc-genetics-plant-breeding',
    ],
    authoredHtml: `
      <div class="ag-guide-rich">
        <h3>India’s First ICAR-Accredited Private School of Agriculture</h3>
        <p><strong>Lovely Professional University (LPU), Phagwara</strong> made national history when its School of Agriculture became the first private university faculty in India to be accredited by the <strong>National Agricultural Education Accreditation Board (NAEAB) of ICAR</strong>. This accreditation ensures that LPU’s 4-year <strong>B.Sc. (Hons.) Agriculture</strong> and postgraduate M.Sc. Agriculture degrees are eligible for all-India ICAR PG/Ph.D. counselling, public-sector agricultural recruitment, and international graduate admissions.</p>
        <h3>250+ Acre Experimental Farm, Polyhouses &amp; Experiential Learning</h3>
        <ul>
          <li><strong>Field &amp; Protected Cultivation Farms:</strong> Students manage individual 100 sq. m. crop plots alongside automated polyhouses, net-houses, hydroponics units, apiaries, mushroom production units, and vermicompost plants.</li>
          <li><strong>RAWE &amp; Industrial Attachment:</strong> Final-year students complete the mandatory 20-week Rural Agricultural Work Experience (RAWE) in Punjab rural belts and agro-industrial internships with seed, crop-care, and agri-tech enterprises.</li>
          <li><strong>LPUNEST &amp; CUET Scholarships:</strong> Admissions accept <strong>LPUNEST</strong> and <strong>CUET</strong> scores with merit scholarship tiers covering 20% to 50% of semester tuition fees.</li>
        </ul>
      </div>
    `,
  },
];

export function getUniversityGuide(slug: string) { return UNIVERSITY_GUIDES.find(item => item.slug === slug); }
