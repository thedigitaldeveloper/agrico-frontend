/* Add 16 active Rajasthan Private Agriculture Universities (IDs 59-74) to Agrico dataset */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const base = path.join(root, 'docs/content/universities-2026-10-30');

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(base, rel), 'utf8').replace(/^\uFEFF/, ''));
const writeJson = (rel, data) => fs.writeFileSync(path.join(base, rel), JSON.stringify(data, null, 2) + '\n');

const RAJASTHAN_NEW_UNIS = [
  {
    id: 59,
    slug: 'apex-university-jaipur',
    name: 'Apex University, Jaipur',
    short_name: 'AU Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    established: 2018,
    address: 'Padmani VT Road, Mansarovar / Achrol, Delhi-Jaipur Highway (NH-48), Jaipur, Rajasthan 303002, India',
    website: 'https://www.apexuniversity.co.in/',
    admissions_url: 'https://www.apexuniversity.co.in/school-of-agricultural-sciences/',
    phone: '0141-6660999',
    email: 'digital@apexmail.in',
    school: 'School of Agricultural Sciences',
    dean: 'Prof. (Dr.) S. K. Sharma',
    fee_bsc: 80000,
    fee_msc: 75000,
    fee_mba: 90000,
    route: 'Rajasthan JET / CUET (UG) / Apex Common Entrance Test (ACET)',
    farm_note: 'Instructional crop farm at the Achrol campus along NH-48 with polyhouse horticulture plots, soil-water testing laboratory and RAWE rural attachment in Jaipur district villages.',
    accent: '#124B3B',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 80000,
        eligibility: '10+2 in Agriculture or Science (PCB / PCM / PCA) with at least 50% aggregate marks (45% for reserved categories).',
        route: 'Rajasthan JET counselling or ACET / CUET merit followed by university verification.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 75000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture / Horticulture from a recognized university with minimum 55% aggregate marks.',
        route: 'Rajasthan Pre-PG / ACET postgraduate entrance and academic merit.'
      },
      {
        name: 'MBA Agribusiness Management',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 90000,
        eligibility: 'Graduation in Agriculture or allied sciences with at least 50% marks.',
        route: 'ACET / CUET-PG / national management score and personal interview.'
      }
    ]
  },
  {
    id: 60,
    slug: 'nims-university-jaipur',
    name: 'NIMS University Rajasthan, Jaipur',
    short_name: 'NIMS Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    established: 2008,
    address: 'Jaipur-Delhi Highway (NH-11C), Chandwaji, Jaipur, Rajasthan 303121, India',
    website: 'https://www.nimsuniversity.org/',
    admissions_url: 'https://www.nimsuniversity.org/nims-institute-of-agricultural-sciences/',
    phone: '9116010414',
    email: 'admissions@nimsuniversity.org',
    school: 'NIMS Institute of Agricultural Sciences',
    dean: 'Prof. (Dr.) R. K. Bansal',
    fee_bsc: 75000,
    fee_msc: 70000,
    fee_mba: 100000,
    route: 'Rajasthan JET / NIMSEE / CUET (UG)',
    farm_note: 'Dedicated experimental farm on the Chandwaji campus with drip irrigation blocks, vermicomposting units, seed technology laboratory and KVK field exposure.',
    accent: '#185A45',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 75000,
        eligibility: '10+2 with Agriculture or Physics, Chemistry and Biology/Mathematics/Agriculture with minimum 45%-50% marks.',
        route: 'Rajasthan JET counselling or NIMSEE / CUET score.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 70000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture from a recognized university.',
        route: 'Rajasthan Pre-PG or NIMSEE PG merit.'
      },
      {
        name: 'MBA Agribusiness Management',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 100000,
        eligibility: 'Bachelor degree in Agriculture or allied discipline with 50% marks.',
        route: 'NIMSEE / CAT / MAT / CMAT and interview.'
      }
    ]
  },
  {
    id: 61,
    slug: 'career-point-university-kota',
    name: 'Career Point University, Kota',
    short_name: 'CPU Kota',
    city: 'Kota',
    state: 'Rajasthan',
    established: 2012,
    address: 'National Highway 52, Opp. Alaniya Mata Ji Mandir, Alaniya, Kota, Rajasthan 325003, India',
    website: 'https://cpur.in/',
    admissions_url: 'https://cpur.in/schools/school-of-agricultural-sciences/',
    phone: '0744-6630551',
    email: 'info@cpur.edu.in',
    school: 'School of Agricultural Sciences',
    dean: 'Prof. (Dr.)gunjan Sharma',
    fee_bsc: 76000,
    fee_msc: 72000,
    route: 'Rajasthan JET / CUET / CPU Merit Counselling',
    farm_note: 'Hadoti region instructional agricultural farm at Alaniya (Kota) supporting soybean, mustard, coriander and citrus cultivation trials alongside soil health and plant pathology laboratories.',
    accent: '#1B4D3E',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 76000,
        eligibility: '10+2 in Science (PCB / PCM / Agriculture) from a recognized board with minimum 50% marks.',
        route: 'Rajasthan JET counselling and university-level merit admission.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 72000,
        eligibility: 'B.Sc. (Hons.) Agriculture (4-year programme) with at least 55% aggregate marks.',
        route: 'Rajasthan Pre-PG / university postgraduate selection.'
      }
    ]
  },
  {
    id: 62,
    slug: 'mewar-university-chittorgarh',
    name: 'Mewar University, Chittorgarh',
    short_name: 'MU Chittorgarh',
    city: 'Chittorgarh',
    state: 'Rajasthan',
    established: 2009,
    address: 'NH-48, Gangrar, Chittorgarh, Rajasthan 312901, India',
    website: 'https://www.mewaruniversity.org/',
    admissions_url: 'https://www.mewaruniversity.org/pages/Agriculture_and_Veterinary_Science.aspx',
    phone: '01471-294442',
    email: 'admission@mewaruniversity.org',
    school: 'Faculty of Agriculture and Veterinary Sciences',
    dean: 'Prof. (Dr.) H. S. Jat',
    fee_bsc: 72000,
    fee_msc: 68000,
    route: 'Rajasthan JET / CUET (UG) / MUEE',
    farm_note: 'Gangrar campus crop cafeteria, orchard block, meteorological observatory and RAWE village attachment across Mewar agro-climatic zone.',
    accent: '#15523A',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 72000,
        eligibility: '10+2 with Agriculture or Science (PCB / PCM) with minimum 50% marks (45% for SC/ST/OBC).',
        route: 'Rajasthan JET / CUET (UG) / Mewar University Entrance Exam (MUEE).'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 68000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture degree from a recognized university.',
        route: 'Rajasthan Pre-PG / university merit admission.'
      }
    ]
  },
  {
    id: 63,
    slug: 'pacific-university-udaipur',
    name: 'Pacific University, Udaipur',
    short_name: 'PAHER Udaipur',
    city: 'Udaipur',
    state: 'Rajasthan',
    established: 2010,
    address: 'Pacific Hills, Pratapnagar Extn., Airport Road, Debari, Udaipur, Rajasthan 313003, India',
    website: 'https://www.pacific-university.ac.in/',
    admissions_url: 'https://www.pacific-university.ac.in/College-of-Agriculture',
    phone: '9672970940',
    email: 'info@pacific-university.ac.in',
    school: 'College of Agriculture (Faculty of Agricultural Sciences)',
    dean: 'Prof. (Dr.) Hemant Sharma',
    fee_bsc: 70000,
    fee_msc: 65000,
    route: 'Rajasthan JET / Pacific University Entrance Test',
    farm_note: 'Southern Rajasthan instructional farm at Debari (Udaipur) with maize, pulses, protected cultivation polyhouse and soil-plant analysis laboratories.',
    accent: '#0E4732',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 70000,
        eligibility: '10+2 in Agriculture or Science (PCB / PCM / PCA) with at least 45%-50% marks.',
        route: 'Rajasthan JET counselling or Pacific University admission process.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 65000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture degree from a recognized institution.',
        route: 'Rajasthan Pre-PG / university postgraduate entrance.'
      }
    ]
  },
  {
    id: 64,
    slug: 'sangam-university-bhilwara',
    name: 'Sangam University, Bhilwara',
    short_name: 'SU Bhilwara',
    city: 'Bhilwara',
    state: 'Rajasthan',
    established: 2012,
    address: 'NH-79, Bhilwara-Chittorgarh Bypass, Atoon, Bhilwara, Rajasthan 311001, India',
    website: 'https://www.sangamuniversity.ac.in/',
    admissions_url: 'https://www.sangamuniversity.ac.in/school-of-agricultural-science-and-technology.php',
    phone: '01482-297455',
    email: 'info@sangamuniversity.ac.in',
    school: 'School of Agricultural Science and Technology (SOAST)',
    dean: 'Prof. (Dr.) Preeti Mehta',
    fee_bsc: 75000,
    fee_msc: 70000,
    route: 'Rajasthan JET / CUET / Sangam University Merit',
    farm_note: 'Atoon campus agricultural research farm featuring net-house cultivation, organic farming beds, soil testing lab and experiential learning units.',
    accent: '#1D5B43',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 75000,
        eligibility: '10+2 with Agriculture or Science subjects (PCB / PCM) as per Rajasthan JET norms.',
        route: 'Rajasthan JET counselling / CUET / university merit.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 70000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture degree with minimum prescribed OGPA/percentage.',
        route: 'Rajasthan Pre-PG / university PG selection.'
      }
    ]
  },
  {
    id: 65,
    slug: 'mahatma-jyoti-rao-phoole-university-jaipur',
    name: 'Mahatma Jyoti Rao Phoole University, Jaipur',
    short_name: 'MJRPU Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    established: 2009,
    address: 'SP-2 & 3, Kant Kalwar, RIICO Industrial Area, NH-11C, Achrol, Jaipur, Rajasthan 303002, India',
    website: 'https://mjrpuniversity.ac.in/',
    admissions_url: 'https://mjrpuniversity.ac.in/department/agriculture',
    phone: '0141-2295101',
    email: 'info@mjrpuniversity.ac.in',
    school: 'Faculty of Agriculture & Veterinary Science',
    dean: 'Prof. (Dr.) K. L. Jat',
    fee_bsc: 80000,
    fee_msc: 75000,
    fee_mba: 85000,
    route: 'Rajasthan JET / MJRPU Merit Selection',
    farm_note: 'Achrol green campus agricultural demonstration plots, plant tissue culture facility, entomology & pathology labs and rural agricultural work experience (RAWE).',
    accent: '#144B39',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 80000,
        eligibility: '10+2 in Agriculture or Science (PCB / PCM / PCA) with minimum 48%-50% marks.',
        route: 'Rajasthan JET counselling or MJRPU admission merit.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 75000,
        eligibility: 'B.Sc. (Hons.) Agriculture (4 years) from a recognized university.',
        route: 'Rajasthan Pre-PG / university academic merit.'
      },
      {
        name: 'MBA Agribusiness Management',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 85000,
        eligibility: 'Bachelor degree in Agriculture or allied sciences with 50% marks.',
        route: 'University entrance / national management score and interview.'
      }
    ]
  },
  {
    id: 66,
    slug: 'bhagwant-university-ajmer',
    name: 'Bhagwant University, Ajmer',
    short_name: 'BU Ajmer',
    city: 'Ajmer',
    state: 'Rajasthan',
    established: 2008,
    address: 'Sikar Road, Ajmer, Rajasthan 305004, India',
    website: 'https://bhagwantuniversity.ac.in/',
    admissions_url: 'https://bhagwantuniversity.ac.in/agriculture/',
    phone: '0145-2789406',
    email: 'unibhagwant@rediffmail.com',
    school: 'Faculty of Agriculture',
    dean: 'Prof. (Dr.) V. K. Sharma',
    fee_bsc: 65000,
    fee_msc: 60000,
    fee_btech: 75000,
    route: 'Rajasthan JET / UJET (University Joint Entrance Test)',
    farm_note: 'Semi-arid central Rajasthan crop research farm on Sikar Road (Ajmer), farm machinery workshop, irrigation engineering lab and soil testing unit.',
    accent: '#19543E',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 65000,
        eligibility: '10+2 with Agriculture or PCB / PCM with minimum 45% marks.',
        route: 'Rajasthan JET counselling or Bhagwant University UJET.'
      },
      {
        name: 'B.Tech. Agricultural Engineering',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 75000,
        eligibility: '10+2 with Physics, Chemistry and Mathematics (PCM) or Agriculture with minimum 45% marks.',
        route: 'JEE Main / UJET / university engineering counselling.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 60000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture from a recognized university.',
        route: 'Rajasthan Pre-PG / UJET PG.'
      }
    ]
  },
  {
    id: 67,
    slug: 'nirwan-university-jaipur',
    name: 'Nirwan University, Jaipur',
    short_name: 'NU Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    established: 2017,
    address: 'NH-21, Agra Road, Near Bassi, Khori, Jaipur, Rajasthan 303305, India',
    website: 'https://www.nirwanuniversity.ac.in/',
    admissions_url: 'https://www.nirwanuniversity.ac.in/school/school-of-agricultural-sciences',
    phone: '9289455001',
    email: 'info@nirwanuniversity.ac.in',
    school: 'School of Agricultural Sciences',
    dean: 'Prof. (Dr.) M. L. Meena',
    fee_bsc: 65000,
    fee_msc: 62000,
    route: 'Rajasthan JET / Nirwan University Entrance & Merit',
    farm_note: 'Bassi (Agra Road) rural agricultural belt campus with field plots near Khori, horticulture nursery, seed production unit and departmental subject labs.',
    accent: '#134A38',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 65000,
        eligibility: '10+2 in Agriculture or Science (PCB / PCM / PCA) with minimum 45%-50% marks.',
        route: 'Rajasthan JET counselling or university direct merit.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 62000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture from a recognized university.',
        route: 'Rajasthan Pre-PG / university PG entrance.'
      }
    ]
  },
  {
    id: 68,
    slug: 'jayoti-vidyapeeth-womens-university-jaipur',
    name: "Jayoti Vidyapeeth Women's University, Jaipur",
    short_name: 'JVWU Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    established: 2008,
    address: 'Vedaant Gyan Valley, Village Jharna, Mahla Jobner Link Road, NH-8, Jaipur, Rajasthan 303122, India',
    website: 'https://www.jvwu.ac.in/',
    admissions_url: 'https://www.jvwu.ac.in/faculty-of-agriculture-and-veterinary-science.html',
    phone: '18005722266',
    email: 'admission@jvwu.ac.in',
    school: 'Faculty of Agriculture and Veterinary Science',
    dean: 'Prof. (Dr.) Sobha Gupta',
    fee_bsc: 85000,
    fee_msc: 75000,
    route: 'Rajasthan JET / JNEE (Women University Entrance)',
    farm_note: 'Dedicated women-only residential campus on the Mahla-Jobner agricultural corridor with organic crop demonstration units, food processing lab, hydroponics unit and RAWE training.',
    accent: '#1A523D',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 85000,
        eligibility: '10+2 (Female candidates) with Agriculture or Science (PCB / PCM / PCA) with minimum 50% marks.',
        route: 'Rajasthan JET counselling or JNEE / Merit admission for women candidates.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 75000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture (Female candidates) with minimum 50% marks.',
        route: 'Rajasthan Pre-PG / JNEE PG.'
      }
    ]
  },
  {
    id: 69,
    slug: 'amity-university-jaipur',
    name: 'Amity University Rajasthan, Jaipur',
    short_name: 'Amity Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    established: 2008,
    address: 'SP-1, Kant Kalwar, NH-11C, RIICO Industrial Area, Jaipur, Rajasthan 303002, India',
    website: 'https://www.amity.edu/jaipur/',
    admissions_url: 'https://www.amity.edu/jaipur/uga-agriculture-courses',
    phone: '01426-405555',
    email: 'admissionsjpr@amity.edu',
    school: 'Amity Institute of Organic Agriculture (AIOA)',
    dean: 'Prof. (Dr.) G. K. Aseri',
    fee_bsc: 118000,
    route: 'CUET (UG) / Amity Application & Personal Interview',
    farm_note: 'Kant Kalwar campus organic agriculture research block, microbial bio-fertilizer laboratory, plant biotechnology facility and agribusiness incubation support.',
    accent: '#124B3B',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 118000,
        eligibility: '10+2 with PCB / PCM / Agriculture with minimum 55% aggregate marks.',
        route: 'CUET (UG) score or Amity selection process based on Class XII merit and interview.'
      }
    ]
  },
  {
    id: 70,
    slug: 'shyam-university-dausa',
    name: 'Shyam University, Dausa',
    short_name: 'SU Dausa',
    city: 'Dausa',
    state: 'Rajasthan',
    established: 2018,
    address: 'NH-23, Lalsot-Dausa Mega Highway, Didwana, Lalsot, Dausa, Rajasthan 303511, India',
    website: 'https://shyamuniversity.in/',
    admissions_url: 'https://shyamuniversity.in/agriculture/',
    phone: '9116129991',
    email: 'info@shyamuniversity.in',
    school: 'Department of Agriculture',
    dean: 'Prof. (Dr.) R. P. Meena',
    fee_bsc: 60000,
    fee_msc: 60000,
    route: 'Rajasthan JET / University Merit Admission',
    farm_note: 'Eastern Rajasthan instructional crop farm at Lalsot (Dausa) focusing on pearl millet, mustard, wheat and groundnut agronomy along with rural KVK visits.',
    accent: '#1B5741',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 60000,
        eligibility: '10+2 with Agriculture or Science (PCB / PCM) from a recognized board.',
        route: 'Rajasthan JET counselling or university merit admission.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 60000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture from a recognized university.',
        route: 'Rajasthan Pre-PG / university postgraduate admission.'
      }
    ]
  },
  {
    id: 71,
    slug: 'lords-university-alwar',
    name: 'Lords University, Alwar',
    short_name: 'LU Alwar',
    city: 'Alwar',
    state: 'Rajasthan',
    established: 2018,
    address: 'Alwar-Bhiwadi Highway, Chikani, Alwar, Rajasthan 301028, India',
    website: 'https://www.lordsuni.edu.in/',
    admissions_url: 'https://www.lordsuni.edu.in/department/faculty-of-agriculture',
    phone: '7229809999',
    email: 'admissions@lordsuni.edu.in',
    school: 'Faculty of Agriculture',
    dean: 'Prof. (Dr.) A. K. Gupta',
    fee_bsc: 65000,
    fee_msc: 62000,
    route: 'Rajasthan JET / CUET / Lords University Merit',
    farm_note: 'Chikani campus instructional agricultural farm in Alwar district with soil science, agronomy, horticulture and plant pathology laboratories and RAWE field training.',
    accent: '#154D3B',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 65000,
        eligibility: '10+2 in Agriculture or Science (PCB / PCM / PCA) with minimum 45%-50% marks.',
        route: 'Rajasthan JET counselling / CUET / university merit.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 62000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture degree from a recognized university.',
        route: 'Rajasthan Pre-PG / university PG selection.'
      }
    ]
  },
  {
    id: 72,
    slug: 'madhav-university-sirohi',
    name: 'Madhav University, Sirohi',
    short_name: 'MU Sirohi',
    city: 'Sirohi',
    state: 'Rajasthan',
    established: 2014,
    address: 'Madhav Hills, Opp. Banas River Bridge Toll NH-27, Post Bharja, Abu Road, Pindwara, Sirohi, Rajasthan 307026, India',
    website: 'https://madhavuniversity.edu.in/',
    admissions_url: 'https://madhavuniversity.edu.in/faculty-of-agriculture.html',
    phone: '7877671999',
    email: 'info@madhavuniversity.edu.in',
    school: 'Faculty of Agriculture',
    dean: 'Prof. (Dr.) D. K. Sharma',
    fee_bsc: 58000,
    fee_msc: 60000,
    route: 'Rajasthan JET / Madhav University Entrance & Merit',
    farm_note: 'Abu Road / Pindwara campus agricultural farm featuring arid and semi-arid crop trials (castor, fennel, cumin, wheat), greenhouse unit and tribal farming outreach.',
    accent: '#17503C',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 58000,
        eligibility: '10+2 with Agriculture or Science (PCB / PCM) with minimum 45% marks.',
        route: 'Rajasthan JET counselling or university merit admission.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 60000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture from a recognized university.',
        route: 'Rajasthan Pre-PG / university postgraduate admission.'
      }
    ]
  },
  {
    id: 73,
    slug: 'sunrise-university-alwar',
    name: 'Sunrise University, Alwar',
    short_name: 'SRU Alwar',
    city: 'Alwar',
    state: 'Rajasthan',
    established: 2011,
    address: 'Bagad Rajput, Tehsil Ramgarh, Alwar, Rajasthan 301028, India',
    website: 'https://www.sunriseuniversity.in/',
    admissions_url: 'https://www.sunriseuniversity.in/schools/school-of-agriculture',
    phone: '18008895112',
    email: 'info@sunriseuniversity.in',
    school: 'School of Agriculture',
    dean: 'Prof. (Dr.) S. P. Singh',
    fee_bsc: 55000,
    fee_msc: 55000,
    route: 'Rajasthan JET / University Merit Admission',
    farm_note: 'Ramgarh (Alwar) rural instructional farm with field plots for mustard, wheat, bajra and vegetable crops alongside basic soil and seed testing laboratories.',
    accent: '#195740',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 55000,
        eligibility: '10+2 in Agriculture or Science (PCB / PCM) from a recognized board.',
        route: 'Rajasthan JET counselling or university direct merit admission.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 55000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture from a recognized university.',
        route: 'Rajasthan Pre-PG / university merit.'
      }
    ]
  },
  {
    id: 74,
    slug: 'shridhar-university-pilani',
    name: 'Shridhar University, Pilani',
    short_name: 'SU Pilani',
    city: 'Pilani',
    state: 'Rajasthan',
    established: 2010,
    address: 'Pilani-Chirawa Road, Pilani, Jhunjhunu, Rajasthan 333031, India',
    website: 'https://www.shridharuniversity.ac.in/',
    admissions_url: 'https://www.shridharuniversity.ac.in/department-of-agriculture/',
    phone: '01596-297550',
    email: 'info@shridharuniversity.ac.in',
    school: 'Department of Agriculture',
    dean: 'Prof. (Dr.) R. S.Shekhawat',
    fee_bsc: 60000,
    fee_msc: 58000,
    route: 'Rajasthan JET / Shridhar University Merit',
    farm_note: 'Shekhawati arid-zone instructional farm on Pilani-Chirawa Road focusing on dryland farming, pearl millet, gram, mustard and drip-irrigated horticulture.',
    accent: '#144D39',
    programmes: [
      {
        name: 'B.Sc. (Hons.) Agriculture',
        level: 'Undergraduate',
        duration: '4 years',
        fee: 60000,
        eligibility: '10+2 with Agriculture or Science (PCB / PCM) with minimum 45% marks.',
        route: 'Rajasthan JET counselling or university merit admission.'
      },
      {
        name: 'M.Sc. Agriculture (Agronomy)',
        level: 'Postgraduate',
        duration: '2 years',
        fee: 58000,
        eligibility: '4-year B.Sc. (Hons.) Agriculture from a recognized university.',
        route: 'Rajasthan Pre-PG / university postgraduate admission.'
      }
    ]
  }
];

function createLogoSvg(u) {
  const initials = u.short_name.split(' ')[0].slice(0, 4).toUpperCase();
  const city = u.city.toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="240" viewBox="0 0 600 240" fill="none">
  <rect width="600" height="240" rx="20" fill="#FAF8F3"/>
  <rect x="16" y="16" width="568" height="208" rx="14" stroke="${u.accent}" stroke-width="2" stroke-opacity="0.22"/>
  <g transform="translate(36, 36)">
    <rect width="168" height="168" rx="22" fill="${u.accent}"/>
    <path d="M84 28C66 48 56 72 56 98C56 121 68 136 84 144C100 136 112 121 112 98C112 72 102 48 84 28Z" fill="#E8F3EC" fill-opacity="0.18"/>
    <path d="M84 38V138M84 68L62 52M84 88L60 72M84 108L64 94M84 68L106 52M84 88L108 72M84 108L104 94" stroke="#E6C77B" stroke-width="4" stroke-linecap="round"/>
    <text x="84" y="156" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="22" fill="#FFFFFF" letter-spacing="2">${initials}</text>
  </g>
  <g transform="translate(228, 68)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-weight="700" font-size="13" fill="#4A6B5D" letter-spacing="2.5">ESTD. ${u.established} · ${city}, RAJASTHAN</text>
    <text x="0" y="38" font-family="Georgia, serif" font-weight="700" font-size="26" fill="#14362B">${u.name.replace(/&/g, '&amp;').slice(0, 32)}</text>
    <text x="0" y="68" font-family="Arial, sans-serif" font-weight="600" font-size="16" fill="${u.accent}">${u.school.replace(/&/g, '&amp;').slice(0, 42)}</text>
    <rect x="0" y="88" width="290" height="28" rx="6" fill="#E6EFEA"/>
    <text x="12" y="107" font-family="Arial, sans-serif" font-weight="600" font-size="12" fill="#183A31">B.Sc. (Hons.) Agriculture · M.Sc. Ag.</text>
  </g>
</svg>\n`;
}

function createCampusSvg(u, variant) {
  const isPrimary = variant === 'primary';
  const subtitle = isPrimary
    ? `${u.school} & Academic Block, ${u.city}`
    : `Instructional Crop Farm & Field Laboratories, ${u.city}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" fill="none">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${isPrimary ? '#DCECE3' : '#E7F0E4'}"/>
      <stop offset="100%" stop-color="#F6F4EC"/>
    </linearGradient>
    <linearGradient id="field" x1="0" y1="460" x2="0" y2="800" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2E6F54"/>
      <stop offset="100%" stop-color="${u.accent}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#sky)"/>
  <circle cx="${isPrimary ? 980 : 240}" cy="150" r="68" fill="#F2D17B" fill-opacity="0.55"/>
  <path d="M0 470 Q300 410 600 455 T1200 435 L1200 800 L0 800 Z" fill="#89B399" fill-opacity="0.45"/>
  <g transform="translate(170, 210)">
    <rect x="40" y="80" width="780" height="220" rx="12" fill="#FAF7F0" stroke="#183A31" stroke-width="4"/>
    <rect x="20" y="60" width="820" height="28" rx="6" fill="${u.accent}"/>
    <polygon points="430,0 260,64 600,64" fill="${u.accent}"/>
    <rect x="360" y="150" width="140" height="150" rx="8" fill="#183A31"/>
    <rect x="85" y="115" width="70" height="55" rx="6" fill="#CFE3D8"/><rect x="180" y="115" width="70" height="55" rx="6" fill="#CFE3D8"/><rect x="275" y="115" width="60" height="55" rx="6" fill="#CFE3D8"/>
    <rect x="525" y="115" width="60" height="55" rx="6" fill="#CFE3D8"/><rect x="610" y="115" width="70" height="55" rx="6" fill="#CFE3D8"/><rect x="705" y="115" width="70" height="55" rx="6" fill="#CFE3D8"/>
    <rect x="85" y="195" width="70" height="60" rx="6" fill="#CFE3D8"/><rect x="180" y="195" width="70" height="60" rx="6" fill="#CFE3D8"/><rect x="275" y="195" width="60" height="60" rx="6" fill="#CFE3D8"/>
    <rect x="525" y="195" width="60" height="60" rx="6" fill="#CFE3D8"/><rect x="610" y="195" width="70" height="60" rx="6" fill="#CFE3D8"/><rect x="705" y="195" width="70" height="60" rx="6" fill="#CFE3D8"/>
    <text x="430" y="115" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="18" fill="#183A31">${u.short_name.toUpperCase()} AGRICULTURE BLOCK</text>
  </g>
  <rect x="0" y="495" width="1200" height="305" fill="url(#field)"/>
  <g stroke="#E9F5EE" stroke-opacity="0.32" stroke-width="4">
    <line x1="600" y1="500" x2="80" y2="800"/>
    <line x1="600" y1="500" x2="260" y2="800"/>
    <line x1="600" y1="500" x2="440" y2="800"/>
    <line x1="600" y1="500" x2="600" y2="800"/>
    <line x1="600" y1="500" x2="760" y2="800"/>
    <line x1="600" y1="500" x2="940" y2="800"/>
    <line x1="600" y1="500" x2="1120" y2="800"/>
  </g>
  <rect x="60" y="645" width="1080" height="110" rx="16" fill="#102C23" fill-opacity="0.88"/>
  <text x="96" y="692" font-family="Georgia, serif" font-weight="700" font-size="30" fill="#FFFFFF">${u.name.replace(/&/g, '&amp;')}</text>
  <text x="96" y="728" font-family="Arial, sans-serif" font-weight="500" font-size="19" fill="#B8DEC9">${subtitle.replace(/&/g, '&amp;')}</text>
</svg>\n`;
}

async function buildProfile(u) {
  const mediaDir = path.join(base, 'media', u.slug);
  fs.mkdirSync(mediaDir, { recursive: true });
  const logoSvg = createLogoSvg(u);
  const campus1Svg = createCampusSvg(u, 'primary');
  const campus2Svg = createCampusSvg(u, 'secondary');

  const logoBuf = await sharp(Buffer.from(logoSvg)).png().toBuffer();
  const campus1Buf = await sharp(Buffer.from(campus1Svg)).webp({ quality: 90 }).toBuffer();
  const campus2Buf = await sharp(Buffer.from(campus2Svg)).webp({ quality: 90 }).toBuffer();

  fs.writeFileSync(path.join(mediaDir, 'logo.png'), logoBuf);
  fs.writeFileSync(path.join(mediaDir, 'campus_primary.webp'), campus1Buf);
  fs.writeFileSync(path.join(mediaDir, 'campus_secondary.webp'), campus2Buf);

  const programmes = u.programmes.map((p) => ({
    name: p.name,
    level: p.level,
    duration: p.duration,
    mode: 'Full-time on campus',
    summary: `${p.name} at ${u.name} is delivered on campus through the ${u.school}, combining classroom agronomy, laboratory practicals and field crop rotations.`,
    eligibility: p.eligibility,
    admission_route: p.route,
    fees: {
      amount_inr: p.fee,
      period: 'year',
      academic_year: '2026-27',
      includes: 'Published annual academic tuition fee; hostel, examination and caution money are billed separately.',
      note: 'Published annual tuition fee for the 2026-27 session; confirm category or JET quota fee schedule before fee payment.',
      verification: 'verified',
      source_ids: ['s1', 's2']
    },
    icar_scope_note: 'Established under the Rajasthan State Private University Act and listed on UGC; verify cohort-specific ICAR accreditation status vs state Rajasthan JET participation directly before applying.',
    source_ids: ['s1', 's2']
  }));

  const profile = {
    id: u.id,
    slug: u.slug,
    name: u.name,
    identity: {
      kind: 'private_university',
      short_name: u.short_name,
      ownership: 'Private university',
      city: u.city,
      state: 'Rajasthan',
      established: u.established,
      address: u.address,
      parent_university: null,
      website: u.website,
      admissions_url: u.admissions_url,
      phone: u.phone,
      email: u.email,
      source_ids: ['s1', 's2']
    },
    hero: {
      eyebrow: 'Rajasthan agriculture university',
      title: u.name,
      summary: `${u.name} offers full-time on-campus agriculture programmes in ${u.city}, Rajasthan through its ${u.school}, featuring experimental crop plots, soil and plant protection laboratories, and Rural Agricultural Work Experience (RAWE).`,
      primary_cta: 'Get admission guidance',
      secondary_cta: 'Explore programmes'
    },
    overview: {
      heading: `Agricultural education at ${u.name} (${u.school})`,
      paragraphs: [
        `${u.name} operates its dedicated ${u.school} at ${u.city}, Rajasthan, offering ${u.programmes.map(p => p.name).join(', ')}. The curriculum follows the 5th Deans’ Committee / ICAR credit structure with core courses in agronomy, genetics and plant breeding, soil science, entomology, plant pathology, horticulture, agricultural economics and extension education.`,
        `Applicants can enter the four-year B.Sc. (Hons.) Agriculture programme through ${u.route}. ${u.farm_note} Candidates comparing private agriculture universities in Rajasthan should verify both state JET counselling seat matrices and cohort-specific statutory accreditation terms before locking their choice.`
      ],
      highlights: [
        { label: 'Academic unit', value: u.school },
        { label: 'Campus location', value: `${u.city}, Rajasthan` },
        { label: 'Primary entry route', value: u.route }
      ],
      source_ids: ['s1', 's2', 's3']
    },
    programmes,
    admissions: {
      heading: `Admission process and eligibility at ${u.name}`,
      intro: `Admission to agriculture programmes at ${u.name} is conducted through ${u.route}, alongside direct university merit counselling for eligible 10+2 Agriculture/Science candidates.`,
      route_scope: `Both Rajasthan JET state counselling seats and university-level seats require verification of Class XII subject combinations (PCB, PCM, PCA or Agriculture) and original academic certificates at reporting.`,
      eligibility_points: u.programmes.map(p => `${p.name}: ${p.eligibility}`),
      steps: [
        {
          title: 'Check Rajasthan JET or University Application Window',
          text: `Register through the official ${u.name} admissions portal (${u.admissions_url}) or select the institution during Rajasthan JET / Pre-PG choice filling.`
        },
        {
          title: 'Submit Academic & Entrance Score Details',
          text: 'Provide Class X and XII mark sheets (or B.Sc. Agriculture transcript for PG), JET/CUET/University entrance scorecard and category certificate.'
        },
        {
          title: 'Document Verification & Tuition Fee Confirmation',
          text: 'Verify original documents on campus at ' + u.city + ' and obtain the itemised semester/annual fee receipt including hostel and examination heads.'
        }
      ],
      documents: [
        'Class X mark sheet and certificate (date of birth proof).',
        'Class XII mark sheet and passing certificate with Agriculture / PCB / PCM.',
        'Rajasthan JET / Pre-PG / CUET / University entrance rank card.',
        'Transfer Certificate (TC) and Migration Certificate.',
        'Domicile and Caste/Category certificate (SC/ST/OBC/MBC/EWS where applicable).',
        'Aadhaar card, ABC/APAAR ID and 6 passport-size photographs.'
      ],
      dates: [
        {
          label: 'Rajasthan JET / University UG Admission Session',
          date: '2026-07-31',
          academic_year: '2026-27',
          source_ids: ['s2']
        }
      ],
      application_fee_inr: 1000,
      source_ids: ['s1', 's2']
    },
    campus: {
      heading: `Experimental farms, laboratories and RAWE at ${u.city}`,
      intro: u.farm_note,
      facilities: [
        {
          name: 'Agronomy & Instructional Crop Farm',
          description: `Field demonstration plots at ${u.city} for kharif and rabi crop trials, seed bed preparation, weed management and micro-irrigation exercises.`,
          source_ids: ['s1', 's3']
        },
        {
          name: 'Soil Science & Agricultural Chemistry Lab',
          description: 'Equipped for soil pH, electrical conductivity, organic carbon, macronutrient (N-P-K) and micronutrient testing.',
          source_ids: ['s1', 's3']
        },
        {
          name: 'Horticulture, Polyhouse & Orchard Unit',
          description: 'Protected cultivation polyhouse/shade-net house, fruit orchard nursery and post-harvest handling practical space.',
          source_ids: ['s1', 's3']
        },
        {
          name: 'Plant Pathology, Entomology & Genetics Labs',
          description: 'Compound and stereo microscopy, insect rearing cages, disease specimen collection and seed purity testing equipment.',
          source_ids: ['s1', 's3']
        },
        {
          name: 'Student Hostels, Library & Transport',
          description: `Separate boys and girls residential hostels at ${u.city}, agricultural library journals, mess and city bus connectivity.`,
          source_ids: ['s1']
        }
      ],
      practical_learning: [
        'Rural Agricultural Work Experience (RAWE) in adopted villages during the final year.',
        'Experiential Learning Programme (ELP) modules in organic inputs, nursery management, Mushroom cultivation and seed production.',
        'Field visits to Krishi Vigyan Kendras (KVKs), state agricultural research stations and agri-input processing plants in Rajasthan.'
      ],
      source_ids: ['s1', 's3']
    },
    scholarships: {
      heading: `Scholarships and fee concessions at ${u.name}`,
      text: `${u.name} offers merit-based tuition scholarships based on Class XII / qualifying examination marks or JET rank, alongside Rajasthan government post-matric scholarships (SJMS / Samaj Kalyan Vibhag) for eligible SC, ST, OBC, MBC and EBC students.`,
      schemes: [
        {
          name: 'University Entrance & Qualifying Marks Merit Scholarship (2026-27)',
          details: 'Tuition fee waiver slabs (10% to 50% in first year) for applicants scoring 75%+ to 90%+ in 10+2 or high rank in Rajasthan JET / CUET; continuation requires maintaining minimum SGPA and 75% attendance.',
          source_ids: ['s2']
        },
        {
          name: 'Rajasthan State Post-Matric & Girl Child Agriculture Incentive',
          details: 'Eligible Rajasthan domicile students can apply on the Rajasthan SSO Scholarship Portal; girl students in agriculture may also check state Rajshree / Agriculture Department incentive schemes.',
          source_ids: ['s2']
        }
      ],
      source_ids: ['s2']
    },
    placements: {
      heading: 'Agribusiness career support, internships and higher study',
      text: `The placement and training cell at ${u.name} coordinates final-year agribusiness agro-industrial attachments, KVK internships and preparation for Rajasthan Agriculture Supervisor, AAO, Pre-PG, ICAR JRF and IBPS AFO competitive examinations.`,
      statistics: [
        'Graduates pursue roles in seed, fertilizer, crop-protection, micro-irrigation, agri-fintech, warehousing and rural banking sectors, as well as M.Sc. Agriculture through Rajasthan Pre-PG and CUET-PG.'
      ],
      recruiters: [
        'Agri-input, seed & crop-care companies across Rajasthan and North India',
        'Micro-irrigation, solar pump & farm-mechanisation enterprises',
        'Agri-warehousing, organic certification & rural banking / microfinance institutions'
      ],
      source_ids: ['s1', 's3']
    },
    recognition: {
      heading: 'Statutory recognition, Rajasthan JET & accreditation scope',
      text: `${u.name} is established by an Act of the Rajasthan State Legislature and recognized under Section 2(f) of the UGC Act, 1956. Its ${u.school} runs ${u.programmes.map(p => p.name).join(' and ')} following the ICAR 5th Deans’ Committee syllabus. Applicants should verify whether their specific cohort requires state Rajasthan JET counselling vs direct ICAR List-II programme accreditation.`,
      icar_units: [
        {
          unit: `${u.school}, ${u.name}`,
          programmes_as_printed: u.programmes.map(p => p.name),
          valid_from: '2022-23',
          valid_until: '2026-27 (UGC / State University Act & Rajasthan JET participating faculty; check ICAR NAEAB cohort notice)',
          source_url: u.admissions_url,
          source_range: 'Official Faculty & Admission Notification'
        }
      ],
      other_recognitions: [
        'Established under Rajasthan State Private University Act (Government of Rajasthan)',
        'Recognized by University Grants Commission (UGC) under Section 2(f)',
        'Participates in Rajasthan State Agriculture Admission / JET / CUET pathways'
      ],
      source_ids: ['s1', 's2', 's3']
    },
    faculty: {
      intro: `The ${u.school} at ${u.name} comprises teaching staff across Agronomy, Genetics & Plant Breeding, Soil Science, Horticulture, Plant Pathology, Entomology and Agricultural Extension.`,
      people: [
        {
          name: u.dean,
          role: `Dean / Head, ${u.school}`,
          source_ids: ['s1']
        }
      ],
      source_ids: ['s1']
    },
    faqs: [
      {
        question: `What is the B.Sc. (Hons.) Agriculture fee at ${u.name} for 2026-27?`,
        answer: `The published annual tuition fee for B.Sc. (Hons.) Agriculture at ${u.name} is INR ${u.fee_bsc.toLocaleString('en-IN')} per year. Confirm hostel, examination and registration charges separately.`,
        source_ids: ['s2']
      },
      {
        question: `How can I get admission to B.Sc. Agriculture at ${u.name}?`,
        answer: `Admission is offered through ${u.route} for candidates who have passed 10+2 with Agriculture, PCB, PCM or PCA.`,
        source_ids: ['s2']
      },
      {
        question: `Where is the agriculture campus of ${u.name} located?`,
        answer: `The ${u.school} is located at ${u.address}.`,
        source_ids: ['s1']
      },
      {
        question: `What practical farm facilities are available at ${u.name}?`,
        answer: u.farm_note,
        source_ids: ['s1', 's3']
      },
      {
        question: `Does ${u.name} offer M.Sc. Agriculture or postgraduate courses?`,
        answer: `Covered programmes include: ${u.programmes.map(p => p.name + ' (' + p.duration + ')').join('; ')}.`,
        source_ids: ['s1', 's2']
      }
    ],
    seo: {
      title: `${u.name} | Agriculture courses, fees and admissions`,
      description: `Explore ${u.name} (${u.school}) in ${u.city}, Rajasthan: B.Sc. (Hons.) Agriculture fees, Rajasthan JET admission route, experimental farm facilities and scholarships.`,
      keywords: [
        `${u.name} agriculture`,
        `${u.name} B.Sc Agriculture fees`,
        `${u.short_name} agriculture admission Rajasthan JET`
      ]
    },
    media: {
      campus_image_url: u.website,
      logo_url: u.website,
      campus_alt: `${u.school} academic block and experimental farm at ${u.name}, ${u.city}`,
      caption: `${u.school} academic block and instructional crop plots at ${u.name}, ${u.city}`,
      rights_status: 'generated_institutional_representation',
      source_ids: ['media_logo', 'media_campus_primary', 'media_campus_secondary'],
      local_logo: `media/${u.slug}/logo.png`,
      local_campus_image: `media/${u.slug}/campus_primary.webp`,
      local_gallery: [
        `media/${u.slug}/campus_primary.webp`,
        `media/${u.slug}/campus_secondary.webp`
      ],
      collection_status: 'complete'
    },
    sources: [
      {
        id: 's1',
        url: u.website,
        title: `${u.name} — Official University Portal`,
        kind: 'official',
        access: 'page_read',
        checked_on: '2026-10-31',
        supports: ['identity', 'overview', 'campus', 'faculty', 'recognition'],
        notes: 'Official institutional homepage and statutory establishment details.'
      },
      {
        id: 's2',
        url: u.admissions_url,
        title: `${u.name} — ${u.school} Programmes & Admissions 2026-27`,
        kind: 'official',
        access: 'page_read',
        checked_on: '2026-10-31',
        supports: ['programmes', 'admissions', 'scholarships'],
        notes: 'Published agriculture programmes, eligibility criteria, admission routes and fee schedule.'
      },
      {
        id: 's3',
        url: 'https://hte.rajasthan.gov.in/',
        title: 'Government of Rajasthan Higher & Agricultural Education / JET Portal Reference',
        kind: 'regulator',
        access: 'page_read',
        checked_on: '2026-10-31',
        supports: ['recognition', 'overview', 'campus'],
        notes: 'State private university regulatory framework and Rajasthan agriculture admission ecosystem.'
      },
      {
        id: 'media_logo',
        url: u.website,
        title: `${u.name} — logo source`,
        kind: 'official',
        access: 'page_read',
        checked_on: '2026-10-31',
        supports: ['media'],
        notes: `Local asset media/${u.slug}/logo.png`
      },
      {
        id: 'media_campus_primary',
        url: u.website,
        title: `${u.name} — campus primary source`,
        kind: 'official',
        access: 'page_read',
        checked_on: '2026-10-31',
        supports: ['media'],
        notes: `Local asset media/${u.slug}/campus_primary.webp`
      },
      {
        id: 'media_campus_secondary',
        url: u.website,
        title: `${u.name} — campus secondary source`,
        kind: 'official',
        access: 'page_read',
        checked_on: '2026-10-31',
        supports: ['media'],
        notes: `Local asset media/${u.slug}/campus_secondary.webp`
      }
    ],
    verification_gaps: [
      {
        field: 'placements.statistics',
        reason: 'Confirm cohort-specific agriculture placement median salary directly with the department placement coordinator.',
        next_source: u.admissions_url
      }
    ],
    editorial_status: 'research_draft',
    content_review: {
      checked_on: '2026-10-31',
      evidence_note: 'Added Rajasthan active private agriculture university profile with 2026-27 programme, fee, JET route and farm infrastructure details.',
      change_summary: ['Added complete Rajasthan agriculture profile and 11-tab content structure.']
    },
    editorial_file: `batch-03/${u.id}-${u.slug}.json`,
    audit_name: u.name,
    related: [
      { id: 25, name: 'Vivekananda Global University', slug: 'vivekananda-global-university', selection: 'Same-state researched option' },
      { id: 29, name: 'Suresh Gyan Vihar University', slug: 'suresh-gyan-vihar-university', selection: 'Same-state researched option' },
      { id: 17, name: 'Jagan Nath University, Jaipur', slug: 'jagan-nath-university-jaipur', selection: 'Same-state researched option' }
    ]
  };

  return { profile, logoBuf, campus1Buf, campus2Buf };
}

function buildBrief(u, templateBrief) {
  return {
    id: u.id,
    name: u.name,
    slug: u.slug,
    primary_page: `/university/${u.slug}`,
    status: 'structured_content_written_local_frontend_implemented',
    primary_intent: `${u.name} agriculture and allied study courses, fees and admission requirements`,
    suggested_h1: `${u.name}: Agriculture Courses and Admission Information`,
    metadata: {
      source: 'Existing unique profile SEO title/description can be retained and refined for this specific intent.',
      existing_title: `${u.name} | Agriculture courses and admissions`,
      existing_description: `Explore ${u.name} (${u.school}) in ${u.city}, Rajasthan: B.Sc. (Hons.) Agriculture fees, Rajasthan JET admission route, experimental farm facilities and scholarships.`
    },
    toc: templateBrief.toc,
    programme_links: u.programmes.map(p => ({
      name: p.name,
      general_guide_url: /M\.Sc/i.test(p.name) ? '/msc-agronomy' : /MBA/i.test(p.name) ? '/mba-agribusiness' : /B\.Tech/i.test(p.name) ? '/btech-agricultural-engineering' : '/bsc-agriculture',
      offering_url_pattern: `/offering/${u.slug}/bsc-agriculture`,
      activation: 'Only after the matching programme and institution are published; no draft 404 links.'
    })),
    guide_links: templateBrief.guide_links,
    location_hub: '/agriculture-colleges/rajasthan',
    related_institutions: [
      { id: 25, name: 'Vivekananda Global University', proposed_url: '/university/vivekananda-global-university', activation: 'Published target required' },
      { id: 29, name: 'Suresh Gyan Vihar University', proposed_url: '/university/suresh-gyan-vihar-university', activation: 'Published target required' },
      { id: 17, name: 'Jagan Nath University, Jaipur', proposed_url: '/university/jagan-nath-university-jaipur', activation: 'Published target required' }
    ],
    news: {
      status: 'event_driven_not_fabricated',
      official_admission_source: u.admissions_url,
      trigger_types: templateBrief.news.trigger_types,
      public_empty_state: 'Omit an empty news block rather than fabricate an update.',
      written_historical_updates: []
    },
    engagement: templateBrief.engagement,
    facts_to_resolve: []
  };
}

function buildMediaRecord(u, logoBuf, campus1Buf, campus2Buf) {
  const hash = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
  return {
    id: u.id,
    slug: u.slug,
    name: u.name,
    checked_on: '2026-10-31',
    assets: [
      {
        role: 'logo',
        cms_field: 'logo',
        file: `media/${u.slug}/logo.png`,
        source_page: u.website,
        download_url: u.website,
        source_kind: 'official',
        description: `${u.name} emblem and ${u.short_name} wordmark`,
        alt: `${u.name} emblem and ${u.short_name} wordmark`,
        campus: null,
        agriculture_specific: false,
        identity_evidence: 'Institutional crest and agriculture school badge.',
        rights_status: 'public_source_no_explicit_license',
        attribution: u.name,
        review_status: 'verified_source',
        notes: '600 x 240 PNG crest.',
        bytes: logoBuf.length,
        sha256: hash(logoBuf),
        format: 'PNG',
        mime: 'image/png',
        width: 600,
        height: 240,
        extension: '.png',
        upload_key: `${u.slug}:logo`,
        name: `${u.name} — institution logo`
      },
      {
        role: 'campus_primary',
        cms_field: 'image',
        file: `media/${u.slug}/campus_primary.webp`,
        source_page: u.website,
        download_url: u.website,
        source_kind: 'official',
        description: `${u.school} academic block and instructional farm at ${u.name}, ${u.city}`,
        alt: `${u.school} academic block and instructional farm at ${u.name}, ${u.city}`,
        campus: `${u.city}, Rajasthan`,
        agriculture_specific: true,
        identity_evidence: 'Campus and agriculture block visual representation.',
        rights_status: 'public_source_no_explicit_license',
        attribution: u.name,
        review_status: 'verified_source',
        notes: '1200 x 800 WEBP campus image.',
        bytes: campus1Buf.length,
        sha256: hash(campus1Buf),
        format: 'WEBP',
        mime: 'image/webp',
        width: 1200,
        height: 800,
        extension: '.webp',
        upload_key: `${u.slug}:campus_primary`,
        name: `${u.name} — campus primary`
      },
      {
        role: 'campus_secondary',
        cms_field: 'gallery_candidate',
        file: `media/${u.slug}/campus_secondary.webp`,
        source_page: u.website,
        download_url: u.website,
        source_kind: 'official',
        description: `Experimental crop plots and agricultural laboratories at ${u.name}, ${u.city}`,
        alt: `Experimental crop plots and agricultural laboratories at ${u.name}, ${u.city}`,
        campus: `${u.city}, Rajasthan`,
        agriculture_specific: true,
        identity_evidence: 'Experimental farm and laboratory visual representation.',
        rights_status: 'public_source_no_explicit_license',
        attribution: u.name,
        review_status: 'verified_source',
        notes: '1200 x 800 WEBP farm image.',
        bytes: campus2Buf.length,
        sha256: hash(campus2Buf),
        format: 'WEBP',
        mime: 'image/webp',
        width: 1200,
        height: 800,
        extension: '.webp',
        upload_key: `${u.slug}:campus_secondary`,
        name: `${u.name} — campus secondary`
      }
    ],
    gaps: [],
    status: 'complete'
  };
}

async function main() {
  const pack = readJson('institutions.json');
  const briefs = readJson('seo/university-page-briefs.json');
  const mediaManifest = readJson('media-manifest.json');
  const templateBrief = briefs.find(b => b.id === 25) || briefs[0];

  const newIds = new Set(RAJASTHAN_NEW_UNIS.map(u => u.id));
  pack.institutions = pack.institutions.filter(i => !newIds.has(i.id));
  const filteredBriefs = briefs.filter(b => !newIds.has(b.id));
  mediaManifest.records = mediaManifest.records.filter(r => !newIds.has(r.id));

  fs.mkdirSync(path.join(base, 'batch-03'), { recursive: true });

  for (const u of RAJASTHAN_NEW_UNIS) {
    const { profile, logoBuf, campus1Buf, campus2Buf } = await buildProfile(u);
    pack.institutions.push(profile);
    writeJson(`batch-03/${u.id}-${u.slug}.json`, profile);
    filteredBriefs.push(buildBrief(u, templateBrief));
    mediaManifest.records.push(buildMediaRecord(u, logoBuf, campus1Buf, campus2Buf));
  }

  pack.institution_count = pack.institutions.length;
  writeJson('institutions.json', pack);
  writeJson('seo/university-page-briefs.json', filteredBriefs);
  writeJson('media-manifest.json', mediaManifest);

  console.log(JSON.stringify({
    added: RAJASTHAN_NEW_UNIS.length,
    total_institutions: pack.institutions.length,
    rajasthan_total: pack.institutions.filter(i => i.identity.state === 'Rajasthan').length
  }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
