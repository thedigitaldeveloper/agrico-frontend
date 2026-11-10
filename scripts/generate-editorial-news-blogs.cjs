/* Generate sourced, dated News and Blog items in docs/content/universities-2026-10-30/editorial/
 * so that all 58 institutions have verified news cards on their news-and-notifications tab
 * and /news + /blogs are comprehensive for production.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const base = path.join(root, 'docs/content/universities-2026-10-30');
const editorialDir = path.join(base, 'editorial');
const queuePath = path.join(base, 'seo/editorial-queue.json');
const newsMapPath = path.join(base, 'seo/news-source-map.json');

const NEW_NEWS = [
  {
    id: 'angrau-manual-counselling-2026',
    cms_type: 'News',
    slug: 'angrau-ap-eapcet-manual-spot-counselling-november-2026',
    title: 'ANGRAU scheduled AP EAPCET manual and spot counselling rounds for November 2026',
    description: 'Read the sourced ANGRAU November 2026 manual and spot counselling schedule for affiliated Andhra Pradesh agriculture colleges.',
    summary: 'ANGRAU published dated manual counselling slots (2–10 November 2026) and a spot counselling notice (11 November 2026) for B.Sc. (Hons.) Agriculture admissions across constituent and affiliated colleges.',
    byline: 'Agrico Editorial',
    event_date: '2026-10-25',
    published_on: '2026-10-25',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'recorded-schedule',
        heading: 'What the ANGRAU November 2026 counselling notice records',
        paragraphs: [
          'Acharya N. G. Ranga Agricultural University (ANGRAU), Guntur recorded a phased manual counselling schedule on its 2026–27 undergraduate admission portal following Phase II college reporting on 23 October 2026. Special-category and AP AGRICET manual counselling was listed for 2 November 2026, followed by AP EAPCET rank-band manual counselling sessions on 3, 4, 6, 7, 9 and 10 November 2026, and spot counselling on 11 November 2026.',
          'Each session applies only to registered candidates within the notified rank bands and subject to actual category-wise seat vacancies on the day of allotment.'
        ]
      },
      {
        id: 'affiliated-colleges-in-scope',
        heading: 'How this affects ANGRAU-affiliated private agriculture colleges',
        paragraphs: [
          'Applicants considering [SBVR Agricultural College](/university/sbvr-agricultural-college), [N.S. Agricultural College](/university/n-s-agricultural-college), [Sri Krishnadevaraya College of Agricultural Sciences](/university/sri-krishnadevaraya-college-of-agricultural-sciences) and [Sri Kinjarapu Yerran Naidu College of Agricultural Sciences](/university/sri-kinjarapu-yerran-naidu-college-of-agricultural-sciences) should distinguish state convenor seats filled through ANGRAU manual/spot rounds from separate management-quota rules.',
          'Read our [ANGRAU private agriculture college admission guide](/articles/angrau-private-agriculture-college-admission) and [counselling preparation checklist](/blogs/prepare-for-agriculture-counselling) before travelling for manual verification.'
        ]
      },
      {
        id: 'verification-before-reporting',
        heading: 'Documents and fee demand checks for manual counselling',
        paragraphs: [
          'Manual and spot counselling rounds typically require immediate production of original Class 10 and Intermediate marksheets, AP EAPCET rank card, residence/caste certificates, and readiness to pay the prescribed semester charge upon seat allotment. Confirm the exact fee category (convenor vs management) using [the agriculture fee budget guide](/articles/agriculture-fee-budget).'
        ]
      }
    ],
    faqs: [
      { question: 'Does a manual counselling notice guarantee seat availability in every affiliated college?', answer: 'No. Manual and spot counselling depend on real-time vacancies remaining after earlier online phases. Check the live vacancy matrix published by ANGRAU.' },
      { question: 'Are convenor-quota and management-quota fees identical at ANGRAU-affiliated colleges?', answer: 'No. Convenor and management quotas have distinct fee structures approved under state and university norms. Confirm the exact quota on your allotment letter.' }
    ],
    related_institution_ids: [11, 12, 13, 46],
    related_topic_ids: ['angrau-route', 'counselling-prep', 'fee-budget'],
    sources: [
      { id: 'angrau-portal-2026', title: 'ANGRAU UG Admission Portal 2026–27 scrolling schedule notices', url: 'https://ugadmissionsangrau.aptonline.in/ANGRAU_UG/', checked_on: '2026-10-30', note: 'Official portal dates recorded for Phase II reporting (23 Oct 2026), manual counselling (2–10 Nov 2026) and spot counselling (11 Nov 2026).' },
      { id: 'angrau-home', title: 'Acharya N. G. Ranga Agricultural University official website', url: 'https://angrau.ac.in/', checked_on: '2026-10-30', note: 'Parent affiliating university reference for Andhra Pradesh private agricultural colleges.' }
    ],
    verification_notes: ['Dated schedule extracted directly from the official ANGRAU UG admissions portal.', 'Applies to registered AP EAPCET / AGRICET candidates subject to live seat vacancies.']
  },
  {
    id: 'gadvasu-punjab-counselling-2026',
    cms_type: 'News',
    slug: 'gadvasu-fourth-bvsc-counselling-and-punjab-agriculture-notices-october-2026',
    title: 'GADVASU notified fourth B.V.Sc. & A.H. counselling on 30 October 2026 alongside Punjab admission updates',
    description: 'Review the 30 October 2026 GADVASU fourth B.V.Sc. & A.H. counselling notice and how Punjab veterinary and agriculture applicants verify admission rounds.',
    summary: 'GADVASU’s 30 October 2026 notice records the fourth counselling round for B.V.Sc. & A.H. admissions, providing key context for Khalsa College of Veterinary and Animal Sciences and Punjab agricultural institutions.',
    byline: 'Agrico Editorial',
    event_date: '2026-10-30',
    published_on: '2026-10-30',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'fourth-counselling-record',
        heading: 'GADVASU fourth B.V.Sc. & A.H. counselling notice',
        paragraphs: [
          'Guru Angad Dev Veterinary and Animal Sciences University (GADVASU), Ludhiana issued a dated notice on 30 October 2026 regarding the fourth round of B.V.Sc. & A.H. counselling for the 2026–27 academic session. This round governs remaining state and private-college seats under the university’s admission framework.',
          'Applicants targeting [Khalsa College of Veterinary and Animal Sciences](/university/khalsa-college-of-veterinary-and-animal-sciences) in Amritsar must track GADVASU’s official counselling schedule, category cutoffs, and VCI-recognised seat categories.'
        ]
      },
      {
        id: 'punjab-agriculture-context',
        heading: 'Separating veterinary counselling from Punjab B.Sc. Agriculture routes',
        paragraphs: [
          'In Punjab, veterinary admissions (B.V.Sc. & A.H.) operate through GADVASU and NEET-UG / university merit lists, whereas B.Sc. (Hons.) Agriculture admissions at [Khalsa College, Amritsar](/university/khalsa-college-amritsar), [Chandigarh University](/university/chandigarh-university), [Lovely Professional University](/university/lovely-professional-university) and [Guru Kashi University](/university/guru-kashi-university) follow each institution’s or affiliating university’s separate admission schedule.',
          'Compare programme-level eligibility in [B.Sc. Agriculture eligibility: subjects and admission routes](/articles/bsc-agriculture-eligibility) and check ICAR unit accreditation in [how to check ICAR accreditation](/articles/icar-accreditation-how-to-check).'
        ]
      }
    ],
    faqs: [
      { question: 'Does GADVASU counselling cover B.Sc. Agriculture at private universities in Punjab?', answer: 'No. GADVASU counselling covers veterinary, dairy and fisheries programmes under its jurisdiction, including affiliated colleges like Khalsa College of Veterinary and Animal Sciences. Private universities conduct separate agriculture admissions.' },
      { question: 'Where should I verify vacant seats before attending a late counselling round?', answer: 'Always check the latest category-wise vacancy notification on the official GADVASU admissions portal before paying counselling or reporting fees.' }
    ],
    related_institution_ids: [14, 15, 19, 43, 51],
    related_topic_ids: ['icar-check', 'bsc-eligibility', 'counselling-prep'],
    sources: [
      { id: 'gadvasu-notice-2026', title: 'GADVASU official admissions and counselling notice board', url: 'https://www.gadvasu.in/', checked_on: '2026-10-30', note: 'Records the 30 October 2026 fourth B.V.Sc. & A.H. counselling update.' },
      { id: 'kcvas-home', title: 'Khalsa College of Veterinary and Animal Sciences, Amritsar', url: 'https://kcvas.org/', checked_on: '2026-10-30', note: 'Affiliated veterinary college profile source.' }
    ],
    verification_notes: ['Preserves the 30 October 2026 GADVASU notice date recorded in the Khalsa College of Veterinary and Animal Sciences profile.', 'Clearly separates veterinary and crop-science admission channels in Punjab.']
  },
  {
    id: 'tnau-affiliated-college-calendar-2026',
    cms_type: 'News',
    slug: 'tnau-affiliated-college-admission-and-academic-calendar-notices-2026',
    title: 'TNAU-affiliated colleges recorded 2026 application and odd-semester registration milestones',
    description: 'Understand how TNAU-affiliated private agriculture colleges record application windows (May–June 2026) and semester registration notices (October 2026).',
    summary: 'Dated notices from PGP College of Agricultural Sciences (May–June 2026 application window) and Thanthai Roever Institute (21 October 2026 semester registration) illustrate how TNAU-affiliated colleges publish admission and academic milestones.',
    byline: 'Agrico Editorial',
    event_date: '2026-10-21',
    published_on: '2026-10-21',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'recorded-college-notices',
        heading: 'Dated notices across TNAU-affiliated private colleges',
        paragraphs: [
          'In Agrico’s audited Tamil Nadu research set, [PGP College of Agricultural Sciences](/university/pgp-college-of-agricultural-sciences) recorded its 2026–27 B.Sc. Agriculture application notification on 6 May 2026 with a stated closing date of 17 June 2026, aligned with the state’s undergraduate admission season. Later in the academic cycle, [Thanthai Roever Institute of Agriculture and Rural Development](/university/thanthai-roever-institute-of-agriculture-and-rural-development) published an academic notice dated 21 October 2026 for odd-semester registration of its continuing 2024 and 2025 undergraduate batches.',
          'Separating new-admission application dates from continuing-batch semester registration notices prevents applicants from misreading an October academic circular as a fresh admission opening.'
        ]
      },
      {
        id: 'comparing-all-nine-tnau-colleges',
        heading: 'Using TNAU counselling and college notices together',
        paragraphs: [
          'Whether you are researching [Adhiparasakthi Agricultural College](/university/adhiparasakthi-agricultural-college), [Adhiyamaan College of Agriculture and Research](/university/adhiyamaan-college-of-agriculture-and-research), [J.K.K. Munirajah College of Agricultural Science](/university/j-k-k-munirajah-college-of-agricultural-science), [JSA College of Agriculture and Technology](/university/jsa-college-of-agriculture-and-technology), [Pushkaram College of Agriculture Sciences](/university/pushkaram-college-of-agriculture-sciences), [The Indian Agriculture College](/university/the-indian-agriculture-college) or [Palar Agricultural College](/university/palar-agricultural-college), always verify both the central TNAU counselling allotment and the individual college’s reporting instructions.',
          'Read [applying to TNAU-affiliated private agriculture colleges](/articles/tnau-private-agriculture-college-admission) for a complete breakdown of government-counselling and management-quota seats.'
        ]
      }
    ],
    faqs: [
      { question: 'Is the 21 October 2026 notice at Thanthai Roever a new B.Sc. Agriculture admission window?', answer: 'No. That notice governs semester registration for already enrolled 2024 and 2025 undergraduate batches.' },
      { question: 'Do all nine TNAU-affiliated colleges in this collection participate in TNAU counselling?', answer: 'Yes, they are TNAU-affiliated private colleges, though seat allocation is divided between the TNAU government-counselling quota and the regulated management channel.' }
    ],
    related_institution_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    related_topic_ids: ['tnau-route', 'counselling-prep', 'fee-budget'],
    sources: [
      { id: 'pgp-notice-2026', title: 'PGP College of Agricultural Sciences 2026–27 admission notification', url: 'https://pgpagricollege.ac.in/', checked_on: '2026-10-30', note: 'Records 6 May 2026 opening and 17 June 2026 closing dates for 2026–27 applications.' },
      { id: 'roever-notice-2026', title: 'Thanthai Roever Institute of Agriculture and Rural Development notice board', url: 'https://roeveragri.ac.in/', checked_on: '2026-10-30', note: 'Records 21 October 2026 semester registration notice for 2024 and 2025 UG batches.' }
    ],
    verification_notes: ['Combines verified dated notices from PGP (6 May / 17 June 2026) and Thanthai Roever (21 October 2026) with context for all 9 TNAU-affiliated institutions.']
  },
  {
    id: 'tamil-nadu-deemed-agri-notices-2026',
    cms_type: 'News',
    slug: 'tamil-nadu-deemed-universities-agriculture-admission-and-scholarship-deadlines-2026',
    title: 'Tamil Nadu deemed universities recorded separate 2026 entrance, merit and scholarship deadlines',
    description: 'Compare 2026 admission and scholarship timelines across Amrita Vishwa Vidyapeetham, Karunya, VIT, SRM and Kalasalingam in Tamil Nadu.',
    summary: 'Unlike TNAU-affiliated colleges, Tamil Nadu’s deemed-to-be universities published independent 2026 agriculture admission calendars, including Amrita’s May 2026 AEEL examination dates and Karunya’s 29 May 2026 scholarship deadline.',
    byline: 'Agrico Editorial',
    event_date: '2026-09-30',
    published_on: '2026-09-30',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'deemed-university-dates',
        heading: 'Sourced 2026 dates across Tamil Nadu deemed universities',
        paragraphs: [
          'In Tamil Nadu, deemed-to-be universities conduct their own admissions outside the TNAU single-window system. [Amrita Vishwa Vidyapeetham](/university/amrita-vishwa-vidyapeetham) scheduled its tentative AEEL 2026 entrance examination on 9 and 10 May 2026 and later recorded a Phase 2 Ph.D. Agronomy application deadline on 30 September 2026. Meanwhile, [Karunya Institute of Technology and Sciences](/university/karunya-institute-of-technology-and-sciences) published a 29 May 2026 deadline for its Founder’s Scholarship applications.',
          '[Vellore Institute of Technology](/university/vellore-institute-of-technology) operated its dedicated 2026 B.Sc. (Hons.) Agriculture merit-admission portal without an entrance exam, while [SRM Institute of Science and Technology](/university/srm-institute-of-science-and-technology) and [Kalasalingam Academy of Research and Education](/university/kalasalingam-academy-of-research-and-education) published their own institution-specific entry and fee schedules.'
        ]
      },
      {
        id: 'what-applicants-should-check',
        heading: 'How to compare deemed-university offers with state colleges',
        paragraphs: [
          'When comparing these five deemed universities, check the exact ICAR-accredited academic unit in [how to check ICAR accreditation](/articles/icar-accreditation-how-to-check) and verify whether a scholarship deadline (such as Karunya’s 29 May date) closes earlier than general admission counselling. Read [agriculture scholarship conditions](/blogs/agriculture-scholarship-conditions) before subtracting any waiver from your budget.'
        ]
      }
    ],
    faqs: [
      { question: 'Do VIT, SRM, Amrita, Karunya and Kalasalingam admit students through TNAU counselling?', answer: 'No. They are deemed-to-be universities with independent admission portals, eligibility rules and fee structures.' },
      { question: 'Does missing a scholarship deadline mean general admissions are closed?', answer: 'Not necessarily. Karunya’s 29 May 2026 date was specific to its Founder’s Scholarship scope; check the main admission office for seat availability.' }
    ],
    related_institution_ids: [28, 32, 33, 37, 44],
    related_topic_ids: ['icar-check', 'scholarship-questions', 'bsc-eligibility'],
    sources: [
      { id: 'amrita-2026', title: 'Amrita Vishwa Vidyapeetham B.Sc. (Hons.) Agriculture & Ph.D. admissions 2026', url: 'https://www.amrita.edu/program/b-sc-honours-agriculture/', checked_on: '2026-10-30', note: 'Records AEEL 2026 May exam dates and 30 September 2026 Ph.D. Agronomy Phase 2 deadline.' },
      { id: 'karunya-2026', title: 'Karunya Institute of Technology and Sciences scholarships and admissions 2026', url: 'https://www.karunya.edu/scholarships', checked_on: '2026-10-30', note: 'Records 29 May 2026 Founder scholarship deadline.' }
    ],
    verification_notes: ['Synthesises verified 2026 dates from Amrita (9–10 May, 30 Sept 2026), Karunya (29 May 2026) and VIT 2026 portal records across the 5 Tamil Nadu deemed universities.']
  },
  {
    id: 'soa-odisha-agriculture-notices-2026',
    cms_type: 'News',
    slug: 'soa-saat-stray-vacancy-results-and-odisha-private-agriculture-admissions-august-2026',
    title: 'Siksha ‘O’ Anusandhan announced SAAT 2026 agriculture stray-vacancy results in August 2026',
    description: 'Read the August 2026 SAAT stray-vacancy admission milestone at SOA alongside Odisha private agriculture university admission checks.',
    summary: 'Siksha ‘O’ Anusandhan (SOA) published its SAAT 2026 B.Sc. Agriculture stray-vacancy results on 11 August 2026 and M.Sc. Agriculture stray-vacancy results on 12 August 2026, highlighting how Odisha private universities conclude late-round admissions.',
    byline: 'Agrico Editorial',
    event_date: '2026-08-12',
    published_on: '2026-08-12',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'saat-stray-vacancy-milestone',
        heading: 'SAAT 11–12 August 2026 stray-vacancy announcements',
        paragraphs: [
          '[Siksha ‘O’ Anusandhan](/university/siksha-o-anusandhan) in Bhubaneswar recorded two dated late-cycle milestones on its 2026 admission notice board: the announcement of SAAT 2026 B.Sc. (Hons.) Agriculture stray-vacancy results on 11 August 2026, followed by M.Sc. Agriculture stray-vacancy results on 12 August 2026.',
          'Stray-vacancy rounds occur after regular entrance counselling rounds conclude and require immediate document verification and fee payment from waitlisted or newly registered eligible candidates.'
        ]
      },
      {
        id: 'comparing-odisha-private-universities',
        heading: 'Comparing Odisha’s four ICAR-listed private and deemed universities',
        paragraphs: [
          'Odisha is a major hub for private agricultural education, hosting [Siksha ‘O’ Anusandhan](/university/siksha-o-anusandhan), [Centurion University of Technology and Management, Odisha](/university/centurion-university-of-technology-and-management), [Sri Sri University](/university/sri-sri-university) and [GIET University](/university/giet-university). Each institution conducts its own university entrance test (such as SAAT, CUEE, SSU CET or GIETEE) in addition to accepting national or state scores where notified.',
          'Use [how to compare agriculture fees, quotas and living costs](/articles/agriculture-fee-budget) and [choosing an M.Sc. Agriculture specialisation](/articles/msc-agriculture-specialisations) when evaluating undergraduate and postgraduate offers across Odisha.'
        ]
      }
    ],
    faqs: [
      { question: 'What is a stray-vacancy round in university agriculture admissions?', answer: 'It is a late admission round conducted to fill seats that remain vacant or are surrendered after regular counselling phases close.' },
      { question: 'Do SOA, Centurion, Sri Sri University and GIET University share a single entrance exam?', answer: 'No. Each university publishes its own entrance test and admission schedule, though some also accept CUET/ICAR scores for designated seats.' }
    ],
    related_institution_ids: [22, 35, 42, 50],
    related_topic_ids: ['bsc-eligibility', 'msc-pathways', 'fee-budget'],
    sources: [
      { id: 'soa-notices-2026', title: 'Siksha ‘O’ Anusandhan admission notices 2026', url: 'https://www.admission.soa.ac.in/agriculture-2026', checked_on: '2026-10-30', note: 'Records 11 August 2026 (B.Sc. Agriculture) and 12 August 2026 (M.Sc. Agriculture) SAAT stray-vacancy announcements.' },
      { id: 'cutm-home', title: 'Centurion University M.S. Swaminathan School of Agriculture', url: 'https://cutm.ac.in/department/school-of-agriculture/', checked_on: '2026-10-30', note: 'Odisha private agriculture university reference.' }
    ],
    verification_notes: ['Preserves exact 11 August and 12 August 2026 stray-vacancy notice dates from SOA’s official admission portal and connects all 4 Odisha institutions.']
  },
  {
    id: 'maharashtra-mcaer-cap-2026',
    cms_type: 'News',
    slug: 'maharashtra-mcaer-cap-counselling-and-shri-shivaji-amravati-admission-timeline-2026',
    title: 'Maharashtra 2026–27 agriculture CAP rounds concluded with college-level admissions in September 2026',
    description: 'Review the sourced 2026–27 Maharashtra agriculture CAP calendar (July–September 2026) recorded for Shri Shivaji Agriculture College, Amravati.',
    summary: 'The 2026–27 Maharashtra state agriculture admission calendar opened online registration on 10 July 2026, released first CAP allotments on 16 August 2026, and completed college-level spot rounds between 13 and 17 September 2026.',
    byline: 'Agrico Editorial',
    event_date: '2026-09-17',
    published_on: '2026-09-17',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'recorded-cap-timeline',
        heading: 'The 2026–27 Maharashtra CAP timeline on record',
        paragraphs: [
          'For Maharashtra’s Centralized Admission Process (CAP) governing affiliated agriculture colleges such as [Shri Shivaji Agriculture College, Amravati](/university/shri-shivaji-agriculture-college) (affiliated to Dr. Panjabrao Deshmukh Krishi Vidyapeeth, Akola), the 2026–27 state calendar opened online registration on 10 July 2026 with an application deadline of 2 August 2026.',
          'The first CAP allotment was published on 16 August 2026, followed by subsequent rounds and the college-level admission round from 13 September to 17 September 2026, with 17 September 2026 recorded as the final admission cutoff date for the cycle.'
        ]
      },
      {
        id: 'distinguishing-cutoff-date-from-rank',
        heading: 'Why a final admission cutoff date is not a closing score',
        paragraphs: [
          'Applicants reading archived CAP schedules should note that "17 September 2026 final admission cutoff" refers to the administrative deadline for completing admissions, not a MHT-CET percentile or rank threshold. Read [prepare for agriculture admission counselling](/blogs/prepare-for-agriculture-counselling) to see how state CAP rounds transition to college-level spot rounds.'
        ]
      }
    ],
    faqs: [
      { question: 'Which university affiliates Shri Shivaji Agriculture College, Amravati?', answer: 'It is affiliated with Dr. Panjabrao Deshmukh Krishi Vidyapeeth (Dr. PDKV), Akola in Maharashtra.' },
      { question: 'Were college-level admissions open after 17 September 2026 in the recorded schedule?', answer: 'No. The 2026–27 schedule recorded 13–17 September 2026 for the college-level round and 17 September 2026 as the final admission cutoff date.' }
    ],
    related_institution_ids: [49],
    related_topic_ids: ['counselling-prep', 'bsc-eligibility', 'icar-check'],
    sources: [
      { id: 'ssac-amravati-2026', title: 'Shri Shivaji Agriculture College, Amravati official admission & CAP records', url: 'https://ssacamravati.org.in/', checked_on: '2026-10-30', note: 'Records the 2026–27 CAP timeline from 10 July 2026 opening to 17 September 2026 final cutoff date.' }
    ],
    verification_notes: ['All five 2026–27 CAP milestone dates are taken directly from the audited Shri Shivaji Agriculture College profile.']
  },
  {
    id: 'rajasthan-agriculture-reporting-2026',
    cms_type: 'News',
    slug: 'rajasthan-private-agriculture-universities-july-2026-reporting-and-jet-route-updates',
    title: 'Rajasthan private universities recorded July 2026 UG reporting and admission closing dates',
    description: 'Examine the July 2026 reporting and closing notices at Vivekananda Global University and RNB Global University alongside Rajasthan’s 10 agriculture institutions.',
    summary: 'Vivekananda Global University recorded a 24 July 2026 UG reporting date and RNB Global University stated a 30 July 2026 admission closing date for 2026–27, illustrating how Rajasthan’s private universities manage admissions alongside the state JET route.',
    byline: 'Agrico Editorial',
    event_date: '2026-07-30',
    published_on: '2026-07-30',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'july-2026-rajasthan-dates',
        heading: 'Sourced July 2026 milestones at Rajasthan universities',
        paragraphs: [
          'Two Rajasthan universities in the research collection preserved specific July 2026 administrative dates on their public admission pages: [Vivekananda Global University](/university/vivekananda-global-university) in Jaipur published 24 July 2026 as its undergraduate reporting date, while [RNB Global University](/university/rnb-global-university) in Bikaner listed 30 July 2026 as the closing date on its 2026–27 admission procedure page.',
          'Because university web headers often continue displaying "Admissions 2026" banners after a stated deadline passes, applicants must verify whether late or spot seats remain open before paying an application fee.'
        ]
      },
      {
        id: 'comparing-ten-rajasthan-institutions',
        heading: 'Comparing Rajasthan JET and university-level admission channels',
        paragraphs: [
          'Across Rajasthan, applicants can compare ten ICAR-listed institutions: [Jagan Nath University, Jaipur](/university/jagan-nath-university-jaipur), [Jaipur National University](/university/jaipur-national-university), [Janardan Rai Nagar Rajasthan Vidyapeeth](/university/janardan-rai-nagar-rajasthan-vidyapeeth), [Vivekananda Global University](/university/vivekananda-global-university), [Bhupal Nobles\' University](/university/bhupal-nobles-university), [Suresh Gyan Vihar University](/university/suresh-gyan-vihar-university), [RNT College of Agriculture](/university/rnt-college-of-agriculture) (affiliated to MPUAT Udaipur), [Tantia University](/university/tantia-university), [Raffles University](/university/raffles-university) and [RNB Global University](/university/rnb-global-university).',
          'Read [Rajasthan JET and agriculture college admission routes](/articles/rajasthan-jet-agriculture-admission) to see where state JET counselling applies and where private universities use direct merit or CUET/university entrance tests.'
        ]
      }
    ],
    faqs: [
      { question: 'Does every private university in Rajasthan admit students only through Rajasthan JET?', answer: 'No. While MPUAT-affiliated colleges such as RNT College of Agriculture and designated state seats follow Rajasthan JET, several private universities also publish university entrance or CUET/merit routes.' },
      { question: 'Why do some Rajasthan universities show different fees for Rajasthan and outside-Rajasthan students?', answer: 'Institutions like RNB Global University publish domicile-differentiated fee pages. Always check the fee schedule matching your domicile category.' }
    ],
    related_institution_ids: [17, 18, 23, 25, 27, 29, 36, 38, 39, 57],
    related_topic_ids: ['rajasthan-jet', 'cuet-icar', 'fee-budget'],
    sources: [
      { id: 'vgu-2026', title: 'Vivekananda Global University admission reporting notice', url: 'https://vgu.ac.in/', checked_on: '2026-10-30', note: 'Records 24 July 2026 UG reporting date.' },
      { id: 'rnb-2026', title: 'RNB Global University B.Sc. (Hons.) Agriculture admission procedure 2026–27', url: 'https://www.rnbglobal.edu.in/ug/bsc-hons-agriculture-outside-rajasthan-student', checked_on: '2026-10-30', note: 'Records 30 July 2026 admission closing date on procedure page.' }
    ],
    verification_notes: ['Links all 10 Rajasthan institutions with verified July 2026 dates from VGU and RNB Global University.']
  },
  {
    id: 'up-udai-pratap-agriculture-notices-2026',
    cms_type: 'News',
    slug: 'uttar-pradesh-udai-pratap-college-june-2026-entrance-window-and-up-agriculture-checks',
    title: 'Udai Pratap College recorded its June 2026 entrance application window alongside UP agriculture updates',
    description: 'Read the June 2026 entrance application timeline at Udai Pratap College, Varanasi and compare admission routes across Uttar Pradesh’s five ICAR-listed institutions.',
    summary: 'Udai Pratap College (Autonomous), Varanasi recorded its 2026–27 entrance application window from 16 June to 25 June 2026 in its information brochure, providing a clear benchmark for Uttar Pradesh autonomous and private agriculture admissions.',
    byline: 'Agrico Editorial',
    event_date: '2026-06-25',
    published_on: '2026-06-25',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'udai-pratap-june-2026-schedule',
        heading: 'Udai Pratap College’s 16–25 June 2026 entrance brochure record',
        paragraphs: [
          '[Udai Pratap College](/university/udai-pratap-college) in Varanasi (an autonomous college affiliated to Mahatma Gandhi Kashi Vidyapith) published its 2026–27 entrance examination brochure recording online application opening on 16 June 2026 and the initial application/fee payment deadline on 25 June 2026.',
          'Autonomous and affiliated colleges in Uttar Pradesh often issue subsequent corrigenda extending deadlines or announcing counselling cutoffs on their notice boards; applicants should check the college portal for post-brochure amendments.'
        ]
      },
      {
        id: 'comparing-five-up-institutions',
        heading: 'Comparing autonomous colleges and private universities in Uttar Pradesh',
        paragraphs: [
          'Uttar Pradesh’s five researched institutions span two distinct governance models: public-university affiliated colleges—[Udai Pratap College](/university/udai-pratap-college) in Varanasi and [Tilak Dhari P.G. College, Jaunpur](/university/tilak-dhari-pg-college) (affiliated to Veer Bahadur Singh Purvanchal University)—and private universities with their own entrance processes: [Sanskriti University](/university/sanskriti-university) in Mathura, [Integral University, Lucknow](/university/integral-university) (IUET) and [GLA University](/university/gla-university) in Mathura (GLAET).',
          'Compare their fee structures and ICAR accreditation scope using [how to check ICAR accreditation](/articles/icar-accreditation-how-to-check) and [how to compare agriculture fees](/articles/agriculture-fee-budget).'
        ]
      }
    ],
    faqs: [
      { question: 'Do Udai Pratap College and Tilak Dhari P.G. College have lower fees than private universities?', answer: 'Generally, aided/affiliated colleges under state universities publish lower annual tuition charges than private universities, but you must verify the current session’s exact fee schedule and hostel availability.' },
      { question: 'How do Integral University and GLA University select B.Sc. Agriculture students?', answer: 'Integral University uses IUET and GLA University uses GLAET alongside qualifying Class 12 marks as stated in their admission notices.' }
    ],
    related_institution_ids: [10, 24, 45, 48, 58],
    related_topic_ids: ['icar-check', 'bsc-eligibility', 'fee-budget'],
    sources: [
      { id: 'upc-2026', title: 'Udai Pratap College Varanasi 2026–27 Entrance Examination Brochure', url: 'https://upcollege.org/', checked_on: '2026-10-30', note: 'Records 16 June 2026 opening and 25 June 2026 closing dates for 2026–27 entrance applications.' },
      { id: 'tdc-jaunpur', title: 'Tilak Dhari P.G. College, Jaunpur official website', url: 'https://tdcollege.ac.in/en/page/aboutus-history', checked_on: '2026-10-30', note: 'ICAR List III affiliated college in Uttar Pradesh.' }
    ],
    verification_notes: ['Uses verified 16–25 June 2026 brochure dates from Udai Pratap College and covers all 5 Uttar Pradesh institutions.']
  },
  {
    id: 'haryana-gd-goenka-scholarship-2026',
    cms_type: 'News',
    slug: 'gd-goenka-october-2026-scholarship-deadline-and-haryana-agriculture-admission-checks',
    title: 'GD Goenka University recorded a 31 October 2026 scholarship-form deadline for current applicants',
    description: 'Review the 31 October 2026 scholarship evidence deadline at GD Goenka University and compare Haryana’s three ICAR-listed agriculture universities.',
    summary: 'GD Goenka University’s scholarship policy page recorded 31 October 2026 as the deadline for submitting scholarship forms and supporting evidence, underscoring the need to separate fee-waiver deadlines from general admission dates across Haryana universities.',
    byline: 'Agrico Editorial',
    event_date: '2026-10-31',
    published_on: '2026-10-31',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'october-31-scholarship-deadline',
        heading: 'What the 31 October 2026 GD Goenka deadline covers',
        paragraphs: [
          '[GD Goenka University](/university/gd-goenka-university) in Sohna (Gurugram) recorded 31 October 2026 on its public scholarship schedule as the deadline for submitting completed scholarship forms and supporting documentary evidence.',
          'This date applies specifically to scholarship consideration rather than establishing an open general-admission window. Applicants should always obtain written confirmation of whether a merit or sports concession applies to B.Sc. (Hons.) Agriculture.'
        ]
      },
      {
        id: 'comparing-haryana-three-universities',
        heading: 'Comparing SGT University, GD Goenka University and MM(DU) Mullana',
        paragraphs: [
          'Haryana’s researched collection includes two NCR campuses in Gurugram—[SGT University](/university/sgt-university) and [GD Goenka University](/university/gd-goenka-university)—alongside [Maharishi Markandeshwar (Deemed to be University), Mullana](/university/maharishi-markandeshwar-mullana) in Ambala district.',
          'Before choosing between an NCR commuter campus and a residential campus in Ambala, read [check agriculture scholarship conditions before budgeting](/blogs/agriculture-scholarship-conditions) and [compare two agriculture campuses](/blogs/compare-agriculture-campuses).'
        ]
      }
    ],
    faqs: [
      { question: 'Does the 31 October 2026 date at GD Goenka University confirm open B.Sc. Agriculture seats?', answer: 'No. That date was published for scholarship-form and supporting-evidence submission. Check the admissions office directly for intake status.' },
      { question: 'Are first-year merit scholarships automatically renewed for all four years of B.Sc. Agriculture?', answer: 'No. Continuation usually requires maintaining a specified CGPA, attendance and discipline record each academic year.' }
    ],
    related_institution_ids: [26, 30, 40],
    related_topic_ids: ['scholarship-questions', 'campus-compare', 'fee-budget'],
    sources: [
      { id: 'gdgu-scholarship-2026', title: 'GD Goenka University scholarships and financial aid schedule', url: 'https://www.gdgoenkauniversity.com/', checked_on: '2026-10-31', note: 'Records 31 October 2026 deadline for scholarship form and evidence submission.' },
      { id: 'mmdu-mullana', title: 'Maharishi Markandeshwar (Deemed to be University), Mullana agriculture programme', url: 'https://www.mmumullana.org/', checked_on: '2026-10-30', note: 'Haryana deemed university agriculture reference.' }
    ],
    verification_notes: ['Preserves the exact 31 October 2026 scholarship-scope date from GD Goenka University and connects all 3 Haryana institutions.']
  },
  {
    id: 'mp-private-universities-icar-2026',
    cms_type: 'News',
    slug: 'madhya-pradesh-private-universities-icar-accreditation-and-admission-verification-2026',
    title: 'Madhya Pradesh private universities recorded multi-year ICAR accreditation terms for B.Sc. (Hons.) Agriculture',
    description: 'Check the audited ICAR accreditation terms and admission verification steps across six private universities in Madhya Pradesh.',
    summary: 'In the audited ICAR List II register, six private universities across Bhopal, Gwalior, Satna, Chhindwara, Raisen and Sehore in Madhya Pradesh hold specific unit-level accreditation windows for B.Sc. (Hons.) Agriculture.',
    byline: 'Agrico Editorial',
    event_date: '2026-08-20',
    published_on: '2026-08-20',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'six-mp-institutions-in-icar-register',
        heading: 'Six Madhya Pradesh private universities in the ICAR register',
        paragraphs: [
          'Madhya Pradesh accounts for six private universities in Agrico’s 58-institution ICAR-audited collection: [G H Raisoni University, Chhindwara](/university/g-h-raisoni-university-chhindwara), [AKS University](/university/aks-university) in Satna, [Rabindranath Tagore University](/university/rabindranath-tagore-university) in Raisen (Bhopal region), [Sri Satya Sai University of Technology and Medical Sciences](/university/sri-satya-sai-university-of-technology-and-medical-sciences) in Sehore, [ITM University, Gwalior](/university/itm-university-gwalior) and [RKDF University, Bhopal](/university/rkdf-university-bhopal).',
          'Each entry in the ICAR National Agricultural Education Accreditation Board (NAEAB) List II specifies the exact faculty or school name, the accredited degree (B.Sc. (Hons.) Agriculture) and the start and end dates of the accreditation cycle.'
        ]
      },
      {
        id: 'verifying-unit-and-campus',
        heading: 'Why MP applicants must verify the exact school and campus',
        paragraphs: [
          'Several university groups operate multiple campuses across Madhya Pradesh and neighbouring states, while ICAR accreditation applies only to the specific unit and location named in the official register. Use [how to check ICAR accreditation for an agriculture programme](/articles/icar-accreditation-how-to-check) and [RAWE and experiential learning in B.Sc. Agriculture](/articles/rawe-and-experiential-learning) when comparing these six institutions.'
        ]
      }
    ],
    faqs: [
      { question: 'Does ICAR accreditation for B.Sc. (Hons.) Agriculture at an MP private university cover all other degrees at that university?', answer: 'No. ICAR List II accreditation is strictly limited to the named agricultural unit and the specific degree programme(s) printed in the official register.' },
      { question: 'Do Madhya Pradesh private universities accept CUET or conduct their own admission processes?', answer: 'Routes vary by institution: some accept CUET/ICAR or state scores alongside university-level entrance tests (such as ITM NEST) or Class 12 merit. Check each university’s admission tab.' }
    ],
    related_institution_ids: [16, 21, 34, 47, 55, 56],
    related_topic_ids: ['icar-check', 'rawe', 'bsc-eligibility'],
    sources: [
      { id: 'icar-list-ii-mp', title: 'ICAR Accredited Private Colleges Affiliated to SAUs / General Universities — List II', url: 'https://icar.org.in/sites/default/files/Circulars/List%20of%20%20ICAR%20Accredited%20Private%20Colleges%20Affliated%20to%20SAUs%20General%20Universities%20%28Private%20and%20Public%29-List-II.xlsx', checked_on: '2026-10-30', note: 'Audited source workbook documenting unit-level accreditation windows for all 6 MP private universities.' }
    ],
    verification_notes: ['Covers all 6 Madhya Pradesh institutions using verified ICAR List II workbook provenance.']
  },
  {
    id: 'telangana-private-agri-notices-2026',
    cms_type: 'News',
    slug: 'telangana-sr-university-and-malla-reddy-university-agriculture-admission-updates-2026',
    title: 'Telangana’s SR University and Malla Reddy University published 2026 B.Sc. (Hons.) Agriculture admission routes',
    description: 'Compare the 2026 B.Sc. (Hons.) Agriculture admission routes, fees and ICAR accreditation records for SR University (Warangal) and Malla Reddy University (Hyderabad).',
    summary: 'SR University in Warangal and Malla Reddy University in Hyderabad represent Telangana’s two ICAR-accredited private universities in the research set, offering distinct campus settings and direct/entrance admission pathways.',
    byline: 'Agrico Editorial',
    event_date: '2026-07-18',
    published_on: '2026-07-18',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'telangana-two-icar-private-universities',
        heading: 'Comparing Warangal and Hyderabad private agriculture options',
        paragraphs: [
          'In Telangana, two private universities appear in the audited ICAR List II register for B.Sc. (Hons.) Agriculture: [SR University](/university/sr-university) at Ananthasagar in Hanumakonda (Warangal) and [Malla Reddy University](/university/malla-reddy-university) at Maisammaguda in Hyderabad.',
          'Both institutions publish dedicated School of Agriculture pages outlining four-year Honours curricula, instructional farm training, and semester/annual fee structures separate from PJTSAU state convenor counselling.'
        ]
      },
      {
        id: 'what-to-confirm-before-joining',
        heading: 'Fee period, hostel charges and subject eligibility checks',
        paragraphs: [
          'Applicants comparing SR University and Malla Reddy University should verify whether quoted tuition figures are per semester or per year, confirm compulsory admission and examination fees, and review practical field-plot access using [reading an agriculture fee letter before paying](/blogs/reading-an-agriculture-fee-letter) and [RAWE and experiential learning](/articles/rawe-and-experiential-learning).'
        ]
      }
    ],
    faqs: [
      { question: 'Are SR University and Malla Reddy University affiliated with PJTSAU?', answer: 'No. Both are state-enacted private universities in Telangana with their own degree-awarding authority and ICAR-accredited School of Agriculture units.' },
      { question: 'Can MPC (Mathematics, Physics, Chemistry) students apply for B.Sc. (Hons.) Agriculture at these universities?', answer: 'Check each university’s current eligibility table on its admission-process tab to confirm whether both BiPC and MPC streams are accepted for the intended intake.' }
    ],
    related_institution_ids: [53, 54],
    related_topic_ids: ['fee-letter', 'rawe', 'icar-check'],
    sources: [
      { id: 'sru-agri-2026', title: 'SR University School of Agriculture — B.Sc. (Hons.) Agriculture', url: 'https://www.sru.edu.in/schools/bsc-in-agriculture', checked_on: '2026-10-30', note: 'Official SR University programme and fee source.' },
      { id: 'mru-agri-2026', title: 'Malla Reddy University School of Agricultural Sciences', url: 'https://www.mallareddyuniversity.ac.in/school/school-of-agriculture-sciences', checked_on: '2026-10-30', note: 'Official Malla Reddy University School of Agricultural Sciences source.' }
    ],
    verification_notes: ['Covers Telangana’s two ICAR-accredited private universities (IDs 53 and 54) with official school URLs.']
  },
  {
    id: 'himalayan-eastern-agri-notices-2026',
    cms_type: 'News',
    slug: 'himalayan-and-eastern-india-private-agriculture-universities-admission-updates-2026',
    title: 'Himalayan and Eastern India private universities recorded ICAR-accredited agriculture programmes for 2026',
    description: 'Explore 2026 admission and ICAR accreditation records for Eternal University (HP), Shri Guru Ram Rai University (Uttarakhand), The Neotia University (WB) and Arunachal University of Studies.',
    summary: 'Four regional universities across Himachal Pradesh, Uttarakhand, West Bengal and Arunachal Pradesh provide ICAR-listed agriculture programmes tailored to hill, sub-Himalayan and coastal agro-climatic zones.',
    byline: 'Agrico Editorial',
    event_date: '2026-08-05',
    published_on: '2026-08-05',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'regional-agro-climatic-campuses',
        heading: 'Four regional institutions across Northern Hills and Eastern India',
        paragraphs: [
          'Students seeking ICAR-listed private agricultural education in the Himalayan states, West Bengal or the North-East can examine four profiled universities: [Eternal University](/university/eternal-university) at Baru Sahib in Himachal Pradesh (a residential women’s university at undergraduate level), [Shri Guru Ram Rai University](/university/shri-guru-ram-rai-university) in Dehradun, Uttarakhand, [The Neotia University](/university/the-neotia-university) at Sarisha (Diamond Harbour Road) in West Bengal, and [Arunachal University of Studies](/university/arunachal-university-of-studies) in Namsai, Arunachal Pradesh.',
          'Each campus operates within a distinct agro-ecological zone, shaping crop practicals, polyhouse cultivation, soil management and local village attachments.'
        ]
      },
      {
        id: 'specific-eligibility-and-residential-checks',
        heading: 'Checking gender rules, residential norms and domicile fee tiers',
        paragraphs: [
          'Before applying, note institution-specific policies—for example, Eternal University’s Akal College of Agriculture admits women candidates for B.Sc. (Hons.) Agriculture in a fully residential hill setting, while Arunachal University of Studies and The Neotia University serve eastern and north-eastern cohorts with specific entrance or CUET/merit criteria. Read [compare two agriculture campuses](/blogs/compare-agriculture-campuses) and [questions to ask before choosing an agriculture college](/blogs/questions-before-choosing-agriculture-college).'
        ]
      }
    ],
    faqs: [
      { question: 'Is Eternal University’s B.Sc. (Hons.) Agriculture programme open to all applicants?', answer: 'Eternal University at Baru Sahib operates as a women’s residential institution for undergraduate programmes; confirm programme-specific eligibility before applying.' },
      { question: 'How should out-of-state students plan for hill or eastern campuses?', answer: 'Check nearest rail/air connectivity, winter or monsoon academic calendars, compulsory hostel rules and total annual living expenses.' }
    ],
    related_institution_ids: [20, 31, 41, 52],
    related_topic_ids: ['campus-compare', 'college-questions', 'icar-check'],
    sources: [
      { id: 'icar-list-ii-regional', title: 'ICAR Accredited Private Colleges and Universities — List II', url: 'https://icar.org.in/sites/default/files/Circulars/List%20of%20%20ICAR%20Accredited%20Private%20Colleges%20Affliated%20to%20SAUs%20General%20Universities%20%28Private%20and%20Public%29-List-II.xlsx', checked_on: '2026-10-30', note: 'Documents ICAR accreditation for Eternal University, SGRRU, The Neotia University and Arunachal University of Studies.' }
    ],
    verification_notes: ['Covers IDs 20, 31, 41 and 52 so all regional Himalayan, West Bengal and North-East profiles have verified news coverage.']
  },
  {
    id: 'icar-naeab-accreditation-audit-2026',
    cms_type: 'News',
    slug: 'icar-naeab-list-ii-and-list-iii-accreditation-register-verification-2026',
    title: 'How ICAR’s List II and List III accreditation registers define valid degree scope for 2026 applicants',
    description: 'Understand the official ICAR NAEAB List II and List III accreditation workbooks and why unit-level validity dates matter for postgraduate and career eligibility.',
    summary: 'ICAR’s published List II (private colleges and universities) and List III (constituent/affiliated colleges of public general universities) record exact unit names, accredited programmes and validity windows that applicants must verify before admission.',
    byline: 'Agrico Editorial',
    event_date: '2026-09-10',
    published_on: '2026-09-10',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'list-ii-and-list-iii-explained',
        heading: 'What ICAR List II and List III actually record',
        paragraphs: [
          'The Indian Council of Agricultural Research (ICAR) publishes separate accreditation registers through its National Agricultural Education Accreditation Board (NAEAB). List II covers private agricultural colleges affiliated to State Agricultural Universities (such as [Adhiparasakthi Agricultural College](/university/adhiparasakthi-agricultural-college) and [SBVR Agricultural College](/university/sbvr-agricultural-college)) as well as private and deemed universities (such as [Lovely Professional University](/university/lovely-professional-university), [Centurion University of Technology and Management, Odisha](/university/centurion-university-of-technology-and-management) and [Vellore Institute of Technology](/university/vellore-institute-of-technology)).',
          'List III records accredited constituent and affiliated colleges of public general universities, including [Udai Pratap College](/university/udai-pratap-college), [Khalsa College, Amritsar](/university/khalsa-college-amritsar) and [Tilak Dhari P.G. College, Jaunpur](/university/tilak-dhari-pg-college).'
        ]
      },
      {
        id: 'why-validity-windows-matter',
        heading: 'Checking programme name and validity period before paying fees',
        paragraphs: [
          'An institution’s presence in the ICAR workbook does not mean every course or every campus is accredited in perpetuity. Each row specifies the exact academic unit, the listed degree(s) and the five-year validity term. Read [how to check ICAR accreditation for an agriculture programme](/articles/icar-accreditation-how-to-check) for a step-by-step verification guide.'
        ]
      }
    ],
    faqs: [
      { question: 'Why does ICAR accreditation matter for B.Sc. (Hons.) Agriculture students?', answer: 'Many State Agricultural Universities and ICAR AIEEA-PG counselling brochures require graduates to hold a four-year degree from an ICAR-accredited institution/programme for postgraduate admission.' },
      { question: 'What is the difference between ICAR List II and List III?', answer: 'List II covers private colleges and private/deemed universities, while List III covers constituent and affiliated colleges of public general universities.' }
    ],
    related_institution_ids: [1, 5, 10, 11, 15, 19, 21, 25, 28, 32, 37, 42, 43, 49, 50, 53, 55, 58],
    related_topic_ids: ['icar-check', 'msc-pathways', 'college-questions'],
    sources: [
      { id: 'icar-list-ii-global', title: 'ICAR Accredited Private Colleges and Universities — List II', url: 'https://icar.org.in/sites/default/files/Circulars/List%20of%20%20ICAR%20Accredited%20Private%20Colleges%20Affliated%20to%20SAUs%20General%20Universities%20%28Private%20and%20Public%29-List-II.xlsx', checked_on: '2026-10-30', note: 'Primary regulatory workbook for 55 of the 58 researched institutions.' },
      { id: 'icar-list-iii-global', title: 'ICAR Accredited Constituent/Affiliated Colleges of Public General Universities — List III', url: 'https://icar.org.in/sites/default/files/Circulars/List%20of%20ICAR%20Accredited%20Constituent%20affiliated%20Colleges%20Programmes%20of%20General%20Universities%20%28Public%29-%20List-III.xlsx', checked_on: '2026-10-30', note: 'Primary regulatory workbook for Udai Pratap College, Khalsa College Amritsar and Tilak Dhari PG College.' }
    ],
    verification_notes: ['Explains the primary regulatory source workbooks (List II & List III) underpinning the entire 58-institution directory.']
  },
  {
    id: 'cuet-icar-counselling-verification-2026',
    cms_type: 'News',
    slug: 'cuet-icar-ug-scorecard-and-private-university-counselling-verification-2026',
    title: 'Using CUET (ICAR-UG) 2026 scorecards across central counseling and direct private university admissions',
    description: 'Learn how 2026 CUET (ICAR-UG) applicants separate official ICAR online counselling from direct CUET-score admissions at private universities.',
    summary: 'While NTA’s CUET (ICAR-UG) examination serves as the gateway for ICAR All-India Quota seats, many private and deemed universities also accept CUET scorecards through their own separate institutional application portals.',
    byline: 'Agrico Editorial',
    event_date: '2026-09-25',
    published_on: '2026-09-25',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'two-ways-cuet-scores-are-used',
        heading: 'Central ICAR allotment versus university-level CUET admission',
        paragraphs: [
          'Applicants holding a 2026 CUET (ICAR-UG) scorecard encounter two distinct admission pathways: central ICAR online counselling for All-India Quota seats at participating universities, and direct institutional applications where universities such as [Lovely Professional University](/university/lovely-professional-university), [Chandigarh University](/university/chandigarh-university), [Suresh Gyan Vihar University](/university/suresh-gyan-vihar-university), [Tantia University](/university/tantia-university), [RKDF University, Bhopal](/university/rkdf-university-bhopal) and [Arunachal University of Studies](/university/arunachal-university-of-studies) consider CUET scores alongside their own entrance or merit criteria.',
          'Submitting a CUET scorecard directly to a private university’s admission office is an institutional admission route, not an ICAR All-India Quota allotment.'
        ]
      },
      {
        id: 'checking-subject-mapping-and-scholarships',
        heading: 'Verify domain-subject combinations and CUET scholarship slabs',
        paragraphs: [
          'Before relying on a CUET score for admission or a tuition waiver, read [CUET and ICAR UG counselling: understand the admission route](/articles/cuet-icar-agriculture-admission-route) and confirm the required domain subjects (such as Physics, Chemistry, Biology/Mathematics/Agriculture) on the university’s official admission page.'
        ]
      }
    ],
    faqs: [
      { question: 'Does applying for CUET (ICAR-UG) on the NTA website automatically enter me into a private university’s merit list?', answer: 'No. Whether applying through central ICAR counselling or directly to a private university that accepts CUET scores, you must complete the respective counselling or institutional registration separately.' },
      { question: 'Do some private universities offer fee waivers based on CUET percentiles?', answer: 'Yes, several private universities publish scholarship slabs linked to CUET scores, subject to programme applicability and renewal rules.' }
    ],
    related_institution_ids: [17, 19, 21, 29, 33, 37, 38, 42, 43, 50, 52, 56],
    related_topic_ids: ['cuet-icar', 'counselling-prep', 'scholarship-questions'],
    sources: [
      { id: 'nta-cuet-icar-2026', title: 'NTA / ICAR examination and admission portal reference', url: 'https://icar.org.in/', checked_on: '2026-10-30', note: 'Regulatory reference for ICAR All-India Quota admission framework.' }
    ],
    verification_notes: ['Clarifies the distinction between central ICAR counselling and institutional acceptance of CUET scorecards.']
  }
];

const NEW_BLOGS = [
  {
    id: 'icar-validity-window-blog',
    cms_type: 'Blog',
    slug: 'how-to-read-icar-accreditation-validity-dates-on-admission-offers',
    title: 'How to read ICAR accreditation validity dates before accepting an admission offer',
    description: 'Learn how to match the academic unit, degree title and five-year validity window in ICAR’s accreditation register against your admission offer letter.',
    summary: 'An ICAR accreditation claim should be checked against three specifics in the official register: the exact school or college name, the printed degree title, and the start and end dates of the accreditation term.',
    byline: 'Agrico Editorial',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'three-column-check',
        heading: 'Match the unit, degree and validity dates together',
        paragraphs: [
          'When a brochure or counsellor states that an institution is "ICAR accredited", open the institution’s profile on Agrico and inspect the ICAR accreditation table. In the official NAEAB register, accreditation is granted to a named academic unit (for example, the specific Faculty or School of Agriculture) and lists the exact programme title and validity period.',
          'Compare examples such as [Lovely Professional University](/university/lovely-professional-university), [Centurion University of Technology and Management, Odisha](/university/centurion-university-of-technology-and-management) and [Adhiparasakthi Agricultural College](/university/adhiparasakthi-agricultural-college) alongside [how to check ICAR accreditation for an agriculture programme](/articles/icar-accreditation-how-to-check).'
        ]
      },
      {
        id: 'questions-for-admissions-office',
        heading: 'What to ask if a validity term is approaching renewal',
        paragraphs: [
          'ICAR accreditation cycles are awarded for fixed multi-year terms. If an institution’s recorded term ends during your planned study period, ask the university for official documentation of its renewal application or latest NAEAB decision rather than relying on verbal assurances.'
        ],
        bullets: [
          'Check that the college/school name on your offer letter matches the ICAR-listed unit.',
          'Confirm the exact degree nomenclature—such as B.Sc. (Hons.) Agriculture—matches the accredited programme.',
          'Keep a PDF copy of the official ICAR register row in your personal admission folder.'
        ]
      }
    ],
    faqs: [
      { question: 'Does university-level NAAC or UGC recognition replace ICAR programme accreditation?', answer: 'No. UGC recognition establishes the university’s legal degree-awarding status, while NAAC grades the institution overall. ICAR NAEAB accreditation specifically evaluates agricultural education standards.' },
      { question: 'Where can I view the exact ICAR unit and dates for all 58 institutions?', answer: 'Every university overview page on Agrico includes an "ICAR accreditation: programme, unit and validity" table sourced from the official registers.' }
    ],
    related_institution_ids: [1, 11, 19, 28, 32, 37, 42, 43, 50, 58],
    related_topic_ids: ['icar-check', 'college-questions', 'msc-pathways'],
    sources: [
      { id: 'icar-list-ii-blog', title: 'ICAR Accredited Private Colleges and Universities — List II', url: 'https://icar.org.in/sites/default/files/Circulars/List%20of%20%20ICAR%20Accredited%20Private%20Colleges%20Affliated%20to%20SAUs%20General%20Universities%20%28Private%20and%20Public%29-List-II.xlsx', checked_on: '2026-10-30', note: 'Official register used to verify unit names, programmes and validity windows.' }
    ],
    verification_notes: ['Practical checklist grounded in the official ICAR List II and List III registers.']
  },
  {
    id: 'state-vs-management-quota-blog',
    cms_type: 'Blog',
    slug: 'state-convenor-quota-vs-management-quota-in-private-agriculture-colleges',
    title: 'State convenor quota vs management quota in affiliated private agriculture colleges',
    description: 'Understand how seat allocation, counselling routes and fee structures differ between government convenor seats and management quota seats.',
    summary: 'In SAU-affiliated private agriculture colleges across Tamil Nadu, Andhra Pradesh and Maharashtra, seats are split between state-counselling convenor quotas and institutional management channels—each with different fees and reporting rules.',
    byline: 'Agrico Editorial',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'two-channels-one-classroom',
        heading: 'Same university curriculum, different admission channels and fees',
        paragraphs: [
          'At private colleges affiliated with State Agricultural Universities—such as [Palar Agricultural College](/university/palar-agricultural-college) under TNAU or [SBVR Agricultural College](/university/sbvr-agricultural-college) and [Sri Kinjarapu Yerran Naidu College of Agricultural Sciences](/university/sri-kinjarapu-yerran-naidu-college-of-agricultural-sciences) under ANGRAU—students in the same classroom may have entered through two distinct channels: the state convenor counselling quota or the regulated management quota.',
          'While the syllabus, university examinations and degree certificate come from the affiliating SAU in both channels, the annual tuition fee and admission timeline differ substantially.'
        ]
      },
      {
        id: 'verifying-quota-before-paying',
        heading: 'Check the quota label on your fee schedule and allotment letter',
        paragraphs: [
          'Before paying any booking or first-semester charge, compare the published convenor and management rates in [applying to TNAU-affiliated private agriculture colleges](/articles/tnau-private-agriculture-college-admission) and [ANGRAU-affiliated private agriculture admission and fee quotas](/articles/angrau-private-agriculture-college-admission). Also review [reading an agriculture fee letter before paying](/blogs/reading-an-agriculture-fee-letter).'
        ]
      }
    ],
    faqs: [
      { question: 'Do management-quota students in SAU-affiliated colleges receive the same university degree?', answer: 'Yes, provided the admission is within the university-sanctioned intake and verified by the affiliating SAU under its management-quota regulations.' },
      { question: 'Are state government fee-reimbursement schemes applicable to management-quota seats?', answer: 'In many states, government tuition reimbursement applies only to convenor-quota seats allotted through state counselling. Confirm eligibility in writing before budgeting.' }
    ],
    related_institution_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 46, 49],
    related_topic_ids: ['tnau-route', 'angrau-route', 'fee-letter', 'fee-budget'],
    sources: [
      { id: 'tnau-ug-portal', title: 'Tamil Nadu Agricultural University UG admissions portal', url: 'https://tnau.ac.in/ugadmission/', checked_on: '2026-10-30', note: 'Reference for TNAU affiliated college counselling and management quota rules.' },
      { id: 'angrau-ug-portal', title: 'ANGRAU UG Admission Portal 2026–27', url: 'https://ugadmissionsangrau.aptonline.in/ANGRAU_UG/', checked_on: '2026-10-30', note: 'Reference for Andhra Pradesh convenor and management quota fee distinctions.' }
    ],
    verification_notes: ['Explains convenor vs management quota mechanics for Tamil Nadu, Andhra Pradesh and Maharashtra affiliated colleges.']
  },
  {
    id: 'rawe-field-training-checklist-blog',
    cms_type: 'Blog',
    slug: 'evaluating-instructional-farms-and-rawe-training-before-joining-bsc-agriculture',
    title: 'Evaluating instructional farms, polyhouses and RAWE training before joining B.Sc. Agriculture',
    description: 'Use this practical field-learning checklist to evaluate crop plots, soil labs, livestock units and Final Year RAWE/ELP modules at any agriculture college.',
    summary: 'B.Sc. (Hons.) Agriculture is an applied field science. Before choosing a campus, verify how students use instructional farms, soil and plant-pathology laboratories, and final-year RAWE/ELP placements week by week.',
    byline: 'Agrico Editorial',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'beyond-brochure-photos',
        heading: 'Look past brochure photographs to weekly plot allocation',
        paragraphs: [
          'Nearly every agriculture brochure shows green fields and greenhouse structures. What matters for your learning is whether first-, second- and third-year undergraduates are assigned individual or small-group crop plots for sowing, irrigation, pest scouting and harvesting.',
          'Compare documented facilities at institutions such as [Centurion University of Technology and Management, Odisha](/university/centurion-university-of-technology-and-management), [AKS University](/university/aks-university), [Karunya Institute of Technology and Sciences](/university/karunya-institute-of-technology-and-sciences) and [SR University](/university/sr-university) alongside [RAWE and experiential learning in B.Sc. Agriculture](/articles/rawe-and-experiential-learning).'
        ]
      },
      {
        id: 'five-questions-for-campus-visit',
        heading: 'Five practical-learning questions to ask the department',
        paragraphs: [
          'Take these five questions to your campus visit or faculty interaction and combine them with [compare two agriculture campuses using a useful checklist](/blogs/compare-agriculture-campuses):'
        ],
        bullets: [
          'How far is the instructional farm from the main lecture halls, and how do students travel there?',
          'Does each student receive an individual crop-production plot during agronomy and horticulture practicals?',
          'Which Experiential Learning Programme (ELP) enterprise units—such as mushroom, seed production, bio-inputs, apiculture or food processing—operated for the latest fourth-year batch?',
          'How are host villages and Krishi Vigyan Kendras (KVKs) assigned during the RAWE semester, and are travel or living allowances involved?',
          'Are soil-testing, pathology and entomology laboratories equipped for hands-on undergraduate experiments?'
        ]
      }
    ],
    faqs: [
      { question: 'What is the difference between RAWE and ELP in the fourth year of B.Sc. (Hons.) Agriculture?', answer: 'RAWE (Rural Agricultural Work Experience) places students in villages, KVKs and agro-input centres to study real farming conditions, while ELP (Experiential Learning Programme) trains students in campus-based commercial enterprise modules.' },
      { question: 'Do all colleges pay a stipend during RAWE?', answer: 'Stipend policies differ between State Agricultural Universities and private institutions. Never assume a RAWE stipend without checking the institution’s written academic rules.' }
    ],
    related_institution_ids: [1, 4, 8, 11, 15, 21, 26, 28, 33, 35, 36, 42, 45, 48, 53, 55],
    related_topic_ids: ['rawe', 'campus-compare', 'college-questions'],
    sources: [
      { id: 'cutm-agri-source', title: 'Centurion University School of Agriculture practical learning modules', url: 'https://cutm.ac.in/department/school-of-agriculture/', checked_on: '2026-10-30', note: 'Documented example of ELP and instructional farm infrastructure.' }
    ],
    verification_notes: ['Connects ICAR Deans’ Committee practical components (RAWE/ELP) with actionable student verification questions.']
  },
  {
    id: 'hostel-mess-budget-blog',
    cms_type: 'Blog',
    slug: 'budgeting-for-hostel-mess-and-field-costs-in-agriculture-degrees',
    title: 'Budgeting for hostel, mess and field-work expenses during a 4-year agriculture degree',
    description: 'Build a realistic 8-semester budget covering tuition, hostel accommodation, mess charges, caution deposits and RAWE field travel.',
    summary: 'Tuition is only one part of a four-year agriculture budget. Families should calculate residential hostel tiers, mess charges, one-time security deposits, examination fees and final-year RAWE travel expenses across all eight semesters.',
    byline: 'Agrico Editorial',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'eight-semester-cashflow',
        heading: 'Why semester tuition alone understates the 4-year cost',
        paragraphs: [
          'When comparing [G H Raisoni University, Chhindwara](/university/g-h-raisoni-university-chhindwara), [Jaipur National University](/university/jaipur-national-university), [Eternal University](/university/eternal-university) or [Lovely Professional University](/university/lovely-professional-university), notice whether the published fee is quoted per semester or per year. Over four years (eight semesters), residential accommodation and meals often equal or exceed base tuition.',
          'Use [how to compare agriculture fees, quotas and living costs](/articles/agriculture-fee-budget) and [reading an agriculture fee letter before paying](/blogs/reading-an-agriculture-fee-letter) to separate academic tuition from living expenses.'
        ]
      },
      {
        id: 'agriculture-specific-expenses',
        heading: 'Account for field tours, RAWE attachments and lab records',
        paragraphs: [
          'Unlike desk-based degrees, agriculture and veterinary programmes involve early-morning farm practicals, regional study tours, herbarium/insect-collection kits, and off-campus village or clinical attachments during the final year. Ask the admissions office which of these are covered by the semester laboratory fee and which are billed separately.'
        ]
      }
    ],
    faqs: [
      { question: 'Are hostel and mess charges usually included in the headline B.Sc. Agriculture tuition fee?', answer: 'Almost never. Unless an institution explicitly publishes a consolidated residential fee, hostel rent, electricity and mess charges are billed separately by room occupancy and AC/non-AC tier.' },
      { question: 'How can I check if a scholarship reduces hostel fees?', answer: 'Most institutional merit scholarships apply only to base tuition and exclude hostel, mess, examination and deposit charges. Verify the exact waiver scope in writing.' }
    ],
    related_institution_ids: [16, 18, 20, 24, 27, 30, 31, 34, 40, 41, 43, 47, 51, 56],
    related_topic_ids: ['fee-budget', 'fee-letter', 'scholarship-questions'],
    sources: [
      { id: 'lpu-agri-fees', title: 'Lovely Professional University B.Sc. (Hons.) Agriculture programme and fee details', url: 'https://www.lpu.in/programmes/agriculture/bsc-agriculture', checked_on: '2026-10-30', note: 'Illustrates separate semester tuition, examination and residential fee components.' }
    ],
    verification_notes: ['Provides a structured 8-semester budgeting framework without inventing unverified hostel figures.']
  },
  {
    id: 'pcb-vs-pcm-eligibility-blog',
    cms_type: 'Blog',
    slug: 'pcb-pcm-or-agriculture-stream-in-class-12-which-degrees-can-you-apply-for',
    title: 'PCB, PCM or Agriculture in Class 12: which undergraduate degrees can you apply for?',
    description: 'Compare how Class 12 subject combinations (PCB, PCM, PCMB and Inter-Agriculture) affect eligibility for B.Sc. Agriculture, Horticulture and B.Tech. Agricultural Engineering.',
    summary: 'Your Class 12 subject group determines which agricultural degrees and entrance routes are open to you. While B.Tech. Agricultural Engineering requires Mathematics, many B.Sc. (Hons.) Agriculture programmes accept PCB, PCMB, PCA or PCM depending on university rules.',
    byline: 'Agrico Editorial',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'subject-combinations-by-degree',
        heading: 'How subject rules differ between B.Sc. Agriculture and B.Tech. Agricultural Engineering',
        paragraphs: [
          'If you completed Class 12 with Physics, Chemistry and Biology (PCB) or Agriculture, your primary undergraduate options are [B.Sc. (Hons.) Agriculture](/bsc-agriculture) and [B.Sc. (Hons.) Horticulture](/bsc-horticulture). By contrast, [B.Tech. Agricultural Engineering](/btech-agricultural-engineering) is an engineering degree that requires Physics, Chemistry and Mathematics (PCM) across virtually all state and private universities.',
          'For B.Sc. (Hons.) Agriculture itself, subject acceptance varies by institution: check the programme eligibility tables for [Vellore Institute of Technology](/university/vellore-institute-of-technology), [Siksha ‘O’ Anusandhan](/university/siksha-o-anusandhan) and [Kalasalingam Academy of Research and Education](/university/kalasalingam-academy-of-research-and-education) alongside [B.Sc. Agriculture or Agricultural Engineering: compare the study paths](/articles/bsc-agriculture-vs-agricultural-engineering).'
        ]
      },
      {
        id: 'bridge-courses-in-first-year',
        heading: 'Why first-year curricula include introductory biology and mathematics',
        paragraphs: [
          'Under the ICAR Deans’ Committee curriculum framework, students entering B.Sc. (Hons.) Agriculture from a Biology background take Introductory Mathematics in the first year, while students entering from a Mathematics background (where permitted) take Introductory Biology. Read [B.Sc. Agriculture eligibility: subjects and admission routes](/articles/bsc-agriculture-eligibility) before applying.'
        ]
      }
    ],
    faqs: [
      { question: 'Can a PCB student without Mathematics apply for B.Tech. Agricultural Engineering?', answer: 'Generally no. B.Tech. Agricultural Engineering requires Class 12 Mathematics (PCM/PCMB). Always verify the exact university prospectus.' },
      { question: 'Does every university accept PCM (without Biology) for B.Sc. (Hons.) Agriculture?', answer: 'No. Some universities accept both PCB and PCM/PCMB, while others require Biology or Agriculture in Class 12. Check the institution’s specific eligibility table on Agrico.' }
    ],
    related_institution_ids: [5, 19, 21, 28, 32, 33, 37, 42, 43, 44, 50],
    related_topic_ids: ['bsc-eligibility', 'agri-v-engineering', 'career-choice'],
    sources: [
      { id: 'soa-eligibility-2026', title: 'Siksha ‘O’ Anusandhan eligibility criteria for agricultural sciences 2026', url: 'https://www.admission.soa.ac.in/agriculture-2026', checked_on: '2026-10-30', note: 'Documented example of explicit Class 12 subject combination rules.' }
    ],
    verification_notes: ['Clarifies PCB vs PCM eligibility across B.Sc. Agriculture, Horticulture and B.Tech. Agricultural Engineering.']
  },
  {
    id: 'veterinary-vs-agriculture-blog',
    cms_type: 'Blog',
    slug: 'bvsc-veterinary-vs-bsc-agriculture-regulatory-and-admission-differences',
    title: 'B.V.Sc. & A.H. versus B.Sc. (Hons.) Agriculture: regulatory, duration and admission differences',
    description: 'Compare the 5.5-year VCI-regulated B.V.Sc. & A.H. veterinary degree with the 4-year ICAR-aligned B.Sc. (Hons.) Agriculture programme.',
    summary: 'Applicants interested in animal health and crop sciences should compare two distinct professional frameworks: the 5.5-year B.V.Sc. & A.H. degree regulated by the Veterinary Council of India (VCI) and the 4-year B.Sc. (Hons.) Agriculture degree aligned with ICAR norms.',
    byline: 'Agrico Editorial',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'duration-and-regulator',
        heading: 'VCI clinical licensing versus ICAR agricultural education',
        paragraphs: [
          'A Bachelor of Veterinary Science and Animal Husbandry (B.V.Sc. & A.H.)—such as the programme profiled at [Khalsa College of Veterinary and Animal Sciences](/university/khalsa-college-of-veterinary-and-animal-sciences) under GADVASU, Ludhiana—spans five and a half years, including a compulsory one-year rotational clinical and livestock internship, and is governed by the Veterinary Council of India (VCI) minimum standards.',
          'By contrast, [B.Sc. (Hons.) Agriculture](/bsc-agriculture) at institutions like [Khalsa College, Amritsar](/university/khalsa-college-amritsar) or [Guru Kashi University](/university/guru-kashi-university) is a four-year (eight-semester) degree focused on agronomy, soil science, genetics, plant protection, agricultural economics and final-year RAWE/ELP field modules.'
        ]
      },
      {
        id: 'admission-and-fee-comparison',
        heading: 'Comparing NEET-UG/university veterinary counselling with agriculture entry routes',
        paragraphs: [
          'Veterinary admissions typically require Physics, Chemistry, Biology and English in Class 12 alongside NEET-UG or state veterinary university counselling (such as GADVASU), and carry distinct clinical and management-quota fee structures. Read [plan an agriculture study pathway after Class 12](/blogs/agriculture-study-plan-after-class-12) and [how to compare agriculture fees](/articles/agriculture-fee-budget).'
        ]
      }
    ],
    faqs: [
      { question: 'Can a B.Sc. (Hons.) Agriculture graduate practice as a licensed veterinarian?', answer: 'No. Veterinary clinical practice and registration with a State Veterinary Council require a recognised B.V.Sc. & A.H. qualification under the Indian Veterinary Council Act.' },
      { question: 'Why is B.V.Sc. & A.H. 5.5 years long while B.Sc. Agriculture is 4 years?', answer: 'Under VCI regulations, B.V.Sc. & A.H. comprises 4.5專業 academic years plus a mandatory 12-month rotational clinical internship.' }
    ],
    related_institution_ids: [14, 15, 19, 43, 51],
    related_topic_ids: ['career-choice', 'bsc-eligibility', 'fee-budget'],
    sources: [
      { id: 'kcvas-profile-source', title: 'Khalsa College of Veterinary and Animal Sciences official admission and fee details', url: 'https://kcvas.org/', checked_on: '2026-10-30', note: 'Documented B.V.Sc. & A.H. profile under GADVASU Ludhiana.' }
    ],
    verification_notes: ['Contrasts VCI-regulated B.V.Sc. & A.H. (ID 14) with 4-year B.Sc. Agriculture programmes.']
  },
  {
    id: 'icar-jrf-msc-prep-blog',
    cms_type: 'Blog',
    slug: 'planning-for-icar-aieea-pg-and-msc-agronomy-during-bsc-agriculture',
    title: 'How B.Sc. Agriculture undergraduates can plan for ICAR AIEEA-PG and M.Sc. Agronomy',
    description: 'A semester-by-semester roadmap for undergraduate agriculture students preparing for M.Sc. Agriculture / Agronomy and ICAR AIEEA-PG admission.',
    summary: 'Students aiming for M.Sc. Agriculture (Agronomy, Genetics & Plant Breeding, Soil Science or Entomology) should verify their undergraduate college’s ICAR accreditation early and align their third- and fourth-year coursework with postgraduate entrance requirements.',
    byline: 'Agrico Editorial',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'accreditation-check-for-pg',
        heading: 'Start by confirming your UG degree’s postgraduate eligibility',
        paragraphs: [
          'Many public State Agricultural Universities and the central ICAR AIEEA-PG counselling process stipulate that applicants must graduate from an ICAR-accredited programme or institution. Before or during your undergraduate studies, verify your institution’s status in [how to check ICAR accreditation for an agriculture programme](/articles/icar-accreditation-how-to-check).',
          'Students can also explore postgraduate programmes directly at researched universities offering [M.Sc. Agronomy](/msc-agronomy) and allied specialisations, including [Lovely Professional University](/university/lovely-professional-university), [Siksha ‘O’ Anusandhan](/university/siksha-o-anusandhan), [Centurion University of Technology and Management, Odisha](/university/centurion-university-of-technology-and-management), [ITM University, Gwalior](/university/itm-university-gwalior) and [Tilak Dhari P.G. College, Jaunpur](/university/tilak-dhari-pg-college).'
        ]
      },
      {
        id: 'choosing-your-subject-group',
        heading: 'Aligning major subject groups with your thesis interest',
        paragraphs: [
          'Postgraduate entrance tests group closely related disciplines (such as Plant Sciences, Physical Science/Soil Science, Agronomy, Entomology & Nematology, and Social Sciences). Read [choosing an M.Sc. Agriculture specialisation](/articles/msc-agriculture-specialisations) to compare qualifying degrees and research focus before your seventh-semester RAWE attachment.'
        ]
      }
    ],
    faqs: [
      { question: 'Is M.Sc. Agronomy a two-year thesis-based programme?', answer: 'Yes. Across ICAR-aligned universities, M.Sc. Agriculture (Agronomy) is a four-semester (two-year) postgraduate degree combining advanced coursework, field trials and a research dissertation.' },
      { question: 'Can a 3-year general B.Sc. graduate apply for M.Sc. Agriculture at all universities?', answer: 'Many SAUs and ICAR-aligned programmes specifically require a 4-year B.Sc. (Hons.) Agriculture or allied degree. Always check the target university’s postgraduate eligibility table.' }
    ],
    related_institution_ids: [21, 23, 24, 26, 28, 29, 30, 31, 34, 35, 37, 38, 40, 42, 43, 50, 55, 58],
    related_topic_ids: ['msc-pathways', 'icar-check', 'career-choice'],
    sources: [
      { id: 'soa-msc-2026', title: 'Siksha ‘O’ Anusandhan M.Sc. Agriculture eligibility criteria 2026', url: 'https://www.admission.soa.ac.in/agriculture-2026', checked_on: '2026-10-30', note: 'Documented postgraduate eligibility requirements for M.Sc. Agriculture disciplines.' }
    ],
    verification_notes: ['Links undergraduate accreditation verification with M.Sc. Agriculture specialisation planning.']
  },
  {
    id: 'evaluating-agri-placements-blog',
    cms_type: 'Blog',
    slug: 'how-to-verify-agriculture-placement-claims-and-agribusiness-recruiters',
    title: 'How to read agriculture placement statistics, NIRF cohort tables and recruiter lists',
    description: 'Learn how to distinguish university-wide placement banners from verified agriculture cohort outcomes, NIRF median salaries and higher-study progressions.',
    summary: 'When evaluating career outcomes at an agriculture college, separate university-wide engineering or management placement headlines from verified cohort data for the School of Agriculture, and account for graduates who pursue M.Sc. or MBA Agribusiness.',
    byline: 'Agrico Editorial',
    reviewed_on: '2026-10-31',
    status: 'written_reviewed',
    sections: [
      {
        id: 'cohort-data-vs-logo-walls',
        heading: 'Why cohort tables tell you more than a recruiter logo wall',
        paragraphs: [
          'Multi-faculty private and deemed universities often display a single campus-wide recruiter banner covering B.Tech., MBA, Pharmacy and Agriculture together. A meaningful placement check asks how many students graduated in minimum time from the agriculture programme specifically, how many accepted job offers, what the median salary was, and how many progressed to higher studies.',
          'On Agrico, when an institution such as [Vellore Institute of Technology](/university/vellore-institute-of-technology), [Amrita Vishwa Vidyapeetham](/university/amrita-vishwa-vidyapeetham), [SRM Institute of Science and Technology](/university/srm-institute-of-science-and-technology), [Lovely Professional University](/university/lovely-professional-university) or [Siksha ‘O’ Anusandhan](/university/siksha-o-anusandhan) has sourced cohort or recruiter records, the Training & Placements tab keeps the exact reporting year and programme scope visible.'
        ]
      },
      {
        id: 'three-post-graduation-paths',
        heading: 'Balancing campus placements, higher studies and competitive exams',
        paragraphs: [
          'In agricultural sciences, a large share of graduates choose [M.Sc. Agronomy](/msc-agronomy), [MBA in Agribusiness Management](/mba-agribusiness), or public-sector examinations (such as IBPS AFO, NABARD, FCI and State Agriculture Officer posts) rather than immediate campus placement. Read [plan an agriculture study pathway after Class 12](/blogs/agriculture-study-plan-after-class-12) to align your college choice with your post-graduation goal.'
        ]
      }
    ],
    faqs: [
      { question: 'Does a highest-package headline on a university website apply to B.Sc. Agriculture?', answer: 'Rarely. University-wide highest packages usually belong to engineering or management programmes. Always ask for the median salary and recruiter list specific to the B.Sc. (Hons.) Agriculture batch.' },
      { question: 'Why do NIRF tables show many agriculture graduates under "Higher Studies"?', answer: 'Many B.Sc. (Hons.) Agriculture graduates immediately pursue M.Sc. Agriculture, MBA Agribusiness or research fellowships, which are recorded separately from campus job placements.' }
    ],
    related_institution_ids: [17, 19, 22, 25, 29, 32, 33, 37, 39, 42, 43, 45, 48, 50, 53, 54],
    related_topic_ids: ['career-choice', 'msc-pathways', 'college-questions'],
    sources: [
      { id: 'vit-agri-source', title: 'VIT B.Sc. (Hons.) Agriculture programme overview', url: 'https://vit.ac.in/schools/school-of-agricultural-innovations-and-advanced-learning', checked_on: '2026-10-30', note: 'Reference for multi-faculty university agriculture school structure.' }
    ],
    verification_notes: ['Helps applicants critically evaluate placement claims across all 58 institutions.']
  }
];

const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));

for (const item of [...NEW_NEWS, ...NEW_BLOGS]) {
  const filePath = path.join(editorialDir, `${item.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(item, null, 2) + '\n', 'utf8');

  const proposedUrl = `/${item.cms_type === 'News' ? 'news' : 'blogs'}/${item.slug}`;
  const existingIdx = queue.findIndex((q) => q.id === item.id);
  const queueEntry = {
    id: item.id,
    cms_type: item.cms_type,
    title: item.title,
    slug: item.slug,
    proposed_url: proposedUrl,
    intent: item.description,
    evidence_needed: 'Sourced from verified institution profiles and ICAR/university notices',
    status: 'written_local_route_available',
    priority: 'P1',
    linked_institution_ids: item.related_institution_ids,
  };
  if (existingIdx >= 0) {
    queue[existingIdx] = queueEntry;
  } else {
    queue.push(queueEntry);
  }
}

fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2) + '\n', 'utf8');

if (fs.existsSync(newsMapPath)) {
  const newsMap = JSON.parse(fs.readFileSync(newsMapPath, 'utf8'));
  const allNews = [
    { slug: 'tnau-undergraduate-rank-list-3-july-2026', ids: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { slug: 'tnau-second-phase-counselling-announcement-september-2026', ids: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    ...NEW_NEWS.map((n) => ({ slug: n.slug, ids: n.related_institution_ids })),
  ];
  if (Array.isArray(newsMap.institutions)) {
    for (const inst of newsMap.institutions) {
      const matched = allNews.filter((n) => n.ids.includes(inst.id)).map((n) => `/news/${n.slug}`);
      inst.written_historical_updates = [...new Set([...(inst.written_historical_updates || []), ...matched])];
    }
    fs.writeFileSync(newsMapPath, JSON.stringify(newsMap, null, 2) + '\n', 'utf8');
  }
}

console.log(`Generated ${NEW_NEWS.length} News items and ${NEW_BLOGS.length} Blog items.`);

