import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

function makeDocId() {
  return crypto.randomBytes(12).toString('hex').toLowerCase();
}

async function main() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  console.log('Connected to MySQL geduconnect database.');

  // Fetch streams to link
  const [streams] = await c.query('SELECT id, document_id, name, slug, published_at FROM streams WHERE published_at IS NOT NULL');
  console.log('Available streams:', streams.map(s => ({ id: s.id, name: s.name, slug: s.slug })));

  const mgmtStream = streams.find(s => s.slug === 'management') || streams[0];
  const itStream = streams.find(s => s.slug === 'information-technology' || s.slug === 'computer-applications' || s.slug === 'engineering') || streams[0];
  const commStream = streams.find(s => s.slug === 'commerce' || s.slug === 'commerce-banking') || streams[0];
  const artsStream = streams.find(s => s.slug === 'humanities-social-sciences' || s.slug === 'arts-humanities') || streams[0];

  // Clean old questions & answers to replace with comprehensive online education threads
  await c.query('DELETE FROM answers_question_lnk');
  await c.query('DELETE FROM questions_streams_lnk');
  await c.query('DELETE FROM questions_universities_lnk');
  await c.query('DELETE FROM questions_courses_lnk');
  await c.query('DELETE FROM answers');
  await c.query('DELETE FROM questions');

  console.log('Cleared previous placeholder Q&A data.');

  const QNA_ITEMS = [
    {
      title: 'Are Online Degrees valid for UPSC, SSC, State PSC and Central Government Jobs?',
      slug: 'are-online-degrees-valid-for-upsc-ssc-govt-jobs',
      body: 'I am planning to enroll in an Online MCA / MBA while preparing for UPSC and State PSC exams. Will the government document verification reject an online degree, or is it legally valid at par with a regular on-campus degree?',
      author_name: 'Vikram Rajput',
      author_email: 'vikram.r@gmail.com',
      views: 1420,
      stream: mgmtStream,
      answers: [
        {
          body: `Yes, 100% legally valid without any distinction.

As per the official University Grants Commission (UGC) Gazette Notification dated September 2022 and the UGC Open and Distance Learning Programmes and Online Programmes Regulations:

1. Degree Parity Regulation: Degrees, Diplomas, and Certificates awarded through Online mode by UGC-DEB entitled Higher Educational Institutions (HEIs) are treated at par with corresponding degrees awarded through traditional on-campus mode.
2. Government Exam Eligibility: For UPSC (Civil Services, CDS), SSC (CGL, CHSL), State PSCs, IBPS/SBI Bank PO, and Railway Recruitment Boards (RRB), the minimum eligibility criterion is a recognized Bachelor's or Master's degree from a UGC-recognized university.
3. Marksheet Disclosures: In compliance with UGC norms, the degree issued is an authentic University Degree. It does not mention any negative caveats regarding government job validity.

Important Checklist for Applicants:
- Verify that your university has active UGC-DEB (Distance Education Bureau) entitlement for your specific admission batch.
- Verify NAAC grade (Universities offering online degrees must possess NAAC A+ or A++ accreditation, or NIRF Top 100 standing).`,
          author_name: 'Dr. Rameshwar Sharma (Senior Academic Advisor)',
          author_email: 'advisor@geduconnect.com',
          is_expert: true,
          is_accepted: true,
        },
        {
          body: 'I completed my Online B.Com in 2024 and successfully cleared the SSC CGL Tier-1 and Tier-2 document verification process. There was zero friction as long as the university had the UGC-DEB approval letter for that academic year.',
          author_name: 'Alok Verma',
          author_email: 'alok.v@gmail.com',
          is_expert: false,
          is_accepted: false,
        },
      ],
    },
    {
      title: 'Can I pursue an Online MBA while working full-time without an NOC from my employer?',
      slug: 'can-i-pursue-online-mba-while-working-without-noc',
      body: 'I have 3 years of experience as a software developer and want to pursue an Online MBA in Product Management. Do I need to submit an official No Objection Certificate (NOC) from my current company to get admission?',
      author_name: 'Neha Kulkarni',
      author_email: 'neha.k@outlook.com',
      views: 980,
      stream: mgmtStream,
      answers: [
        {
          body: `No, you do NOT need an NOC from your employer for UGC-DEB entitled Online MBA programs.

Here is why:
- Nature of Online Learning: Online degree programs are designed explicitly for working professionals, entrepreneurs, and self-paced learners.
- No Conflict of Work Hours: All live lectures are scheduled on weekends (Saturdays/Sundays) or weekday evenings (7 PM – 10 PM), with 100% recorded lectures, e-libraries, and LMS modules accessible 24/7.
- Admission Requirements: Admission eligibility only mandates a recognized Bachelor's degree (minimum 50% aggregate for General, 45% for Reserved categories). Work experience certificates are optional and only used for resume evaluation or executive track fee concessions.

Tip: If your employer offers Tuition Reimbursement or Skill Enhancement allowances, you can submit the official fee receipt for company sponsorship.`,
          author_name: 'Sunita Mehra (GeduConnect Career Counsellor)',
          author_email: 'sunita.counsellor@geduconnect.com',
          is_expert: true,
          is_accepted: true,
        },
      ],
    },
    {
      title: 'Is an Online Degree evaluated and recognized by WES for Canada / US Immigration (PR)?',
      slug: 'is-online-degree-evaluated-recognized-by-wes-canada-us-pr',
      body: 'I am planning to apply for Canada Express Entry (PR) via Canadian WES ECA. Does World Education Services (WES) accept online degrees from Indian universities like Manipal, Amity, Chandigarh, or DY Patil?',
      author_name: 'Arjun Nambiar',
      author_email: 'arjun.nambiar@gmail.com',
      views: 1250,
      stream: itStream,
      answers: [
        {
          body: `Yes. WES (World Education Services), IQAS, CES, and ICAS recognize Indian Online Degrees provided the granting institution is UGC-recognized and AIU (Association of Indian Universities) member.

How WES Evaluates Indian Online Degrees:
1. Institutional Status: WES checks if the awarding university is a statutory Indian University recognized by UGC and approved by DEB for the enrolled batch.
2. Equivalence Matrix:
   - A 2-Year Online MBA / MCA / M.Sc from an accredited Indian university is evaluated as a Canadian Master's Degree (earning maximum CRS points under Express Entry).
   - A 3-Year Online BCA / BBA / B.Com is evaluated as a Canadian 3-Year Bachelor's Degree.
3. Electronic Transcript Dispatch: Major online universities (Manipal Online, Amity Online, Jain Online, Chandigarh University Online) provide direct electronic transcript transmission to WES through direct university portal integration.

Pro Tip: Always ensure you apply for official transcripts sealed and sent directly from the university's Registrar / COE office to WES with your WES Reference Number.`,
          author_name: 'GeduConnect Global Immigration Desk',
          author_email: 'global@geduconnect.com',
          is_expert: true,
          is_accepted: true,
        },
      ],
    },
    {
      title: 'What is the key difference between UGC-DEB Online Degree and Distance Education?',
      slug: 'what-is-the-difference-between-online-degree-and-distance-education',
      body: 'Both online and distance programs allow studying from home. What are the actual differences in terms of learning management systems, exams, interaction, and corporate acceptance?',
      author_name: 'Priya Mukherjee',
      author_email: 'priya.m@gmail.com',
      views: 1680,
      stream: mgmtStream,
      answers: [
        {
          body: `While both are UGC-DEB approved, Online Degrees represent a modern technology-first pedagogy compared to legacy Distance Education (ODL):

1. Learning Delivery:
   - Online Degree: 100% digital delivery via an advanced Learning Management System (LMS) with mobile apps, live interactive masterclasses, AI doubt-solvers, and digital discussion forums.
   - Distance Education: Self-instructional printed/couriered study books (SLM) with limited offline weekend contact classes at local study centres.

2. Semester Examinations:
   - Online Degree: 100% remote proctored online exams with AI face-tracking and screen monitoring. You write exams from your home laptop.
   - Distance Education: Physical pen-and-paper exams at designated regional examination centres.

3. Placement & Industry Support:
   - Online Degree: Dedicated virtual placement drives, resume workshops, hackathons, and corporate mentorship from industry leaders.
   - Distance Education: Minimal to zero placement assistance.

4. Corporate Perception:
   - Tech and Fortune 500 companies increasingly favor Online Degrees from NAAC A+ universities because students demonstrate active familiarity with digital collaboration tools.`,
          author_name: 'Prof. Anirudh Sen (Director of Academic Partnerships)',
          author_email: 'anirudh.sen@geduconnect.com',
          is_expert: true,
          is_accepted: true,
        },
      ],
    },
    {
      title: 'How are online semester exams conducted and proctored from home?',
      slug: 'how-are-online-semester-exams-conducted-and-proctored',
      body: 'Do I have to travel to any examination centre for semester exams, or can I write them completely from my laptop? How strict is the proctoring process?',
      author_name: 'Siddharth Joshi',
      author_email: 'siddharth.j@gmail.com',
      views: 890,
      stream: itStream,
      answers: [
        {
          body: `Online degree semester exams are 100% remote and conducted directly from your home or office on a laptop or desktop computer.

Exam Architecture & Proctoring Protocol:
1. Dual Proctoring (AI + Human Proctor):
   - AI Computer Vision detects secondary faces, frequent eye deviations, tab switching, and audio background noise.
   - Live Invigilators (Human Proctors) monitor candidate video feeds simultaneously via webcam and can pause exams or initiate live video chat if suspicious activity occurs.
2. System Requirements:
   - Laptop / Desktop with working webcam & microphone.
   - Google Chrome or Safe Exam Browser (SEB).
   - Minimum 2 Mbps stable internet connection.
3. Question Format:
   - Section A: Objective Multiple Choice Questions (MCQs) testing conceptual clarity.
   - Section B: Case study analysis, long descriptive essays, or coding submissions.
4. Slot Booking Flexibility:
   - Universities typically provide a 10–14 day examination window with multiple morning, afternoon, and evening time slots so working students can schedule exams around their office commitments.`,
          author_name: 'GeduConnect Technical & Exam Advisory Team',
          author_email: 'exams@geduconnect.com',
          is_expert: true,
          is_accepted: true,
        },
      ],
    },
    {
      title: 'Can a student pursue two academic degrees simultaneously under UGC guidelines?',
      slug: 'can-student-pursue-two-degrees-simultaneously-ugc-guidelines',
      body: 'Can I enroll in a regular offline degree and also pursue an online degree at the same time? What are the exact UGC rules regarding dual degrees?',
      author_name: 'Ritika Sengupta',
      author_email: 'ritika.sengupta@gmail.com',
      views: 1120,
      stream: artsStream,
      answers: [
        {
          body: `Yes! As per the landmark UGC Guidelines for Pursuing Two Academic Programmes Simultaneously (Notified in April 2022):

Permissible Combinations:
1. One Regular (On-Campus) Degree + One Online / ODL Degree.
2. Two Online / ODL Degrees simultaneously from the same or different universities.
3. One Full-time Diploma + One Degree simultaneously.

Key Rules & Conditions:
- Class Schedule Non-Overlap: For two physical on-campus programs, class timings must not overlap. For online degrees, since learning is asynchronous/flexible, schedule overlap restrictions do not impede enrollment.
- Separate Admission & Examinations: The student must independently fulfill eligibility criteria, register, pay fees, and appear for semester examinations for both programs.
- Both Degrees are Valid: Both completed degrees are fully recognized for employment, higher studies, and statutory certifications.`,
          author_name: 'Dr. Rameshwar Sharma (Senior Academic Advisor)',
          author_email: 'advisor@geduconnect.com',
          is_expert: true,
          is_accepted: true,
        },
      ],
    },
    {
      title: 'Do online universities provide campus placements and hiring drives?',
      slug: 'do-online-universities-provide-campus-placements-and-hiring',
      body: 'How effective is placement support in online MBA and MCA programs? Do top MNCs hire online degree graduates?',
      author_name: 'Kunal Deshmukh',
      author_email: 'kunal.d@gmail.com',
      views: 1340,
      stream: mgmtStream,
      answers: [
        {
          body: `Yes, premier NAAC A+/A++ online universities operate dedicated Corporate Resource Centers (CRC) and virtual placement portals.

What Placement Support Includes:
1. Virtual Job Fairs & Hiring Drives: Top recruiters (including TCS, Infosys, Deloitte, Wipro, Accenture, ICICI Bank, HDFC, Amazon, Capgemini) participate in dedicated hiring rounds for online graduates.
2. Resume & LinkedIn Optimization: 1-on-1 resume reviews and LinkedIn profile enhancement workshops led by HR leaders.
3. Mock Technical & HR Interviews: AI-driven and counsellor-led simulated interview sessions.
4. Career Transition Packages: For mid-level professionals, universities connect learners with executive search consultants for 30%–50% salary hikes.

Salary Benchmark Trends (2025–2026):
- Online MBA: Average package ₹6.5 LPA – ₹12.5 LPA (experienced professionals reach ₹18+ LPA).
- Online MCA: Average package ₹5.5 LPA – ₹11.0 LPA.`,
          author_name: 'Divya Rastogi (Head of Corporate Placement Partnerships)',
          author_email: 'divya.placement@geduconnect.com',
          is_expert: true,
          is_accepted: true,
        },
      ],
    },
    {
      title: 'How does no-cost EMI and semester installment fee payment work in online universities?',
      slug: 'how-does-no-cost-emi-and-semester-installment-fee-work',
      body: 'I want to enroll in Online MBA but cannot pay the full ₹1.5 - ₹2 Lakh fees upfront. Can I pay semester-wise or in monthly instalments without extra interest charges?',
      author_name: 'Pooja Tiwari',
      author_email: 'pooja.t@gmail.com',
      views: 760,
      stream: commStream,
      answers: [
        {
          body: `All major UGC-approved online universities offer multiple flexible payment models so students don't face financial burden:

1. Semester-Wise Fee Payment:
   - Total program fee is split across 4 semesters (for PG) or 6 semesters (for UG). You only pay each semester fee at the start of that term (e.g. ~₹25,000 to ₹40,000 per semester).

2. 0% Interest (Zero-Cost) Monthly EMI:
   - Universities partner with leading NBFC education financing providers (Propelld, GrayQuest, LiquiLoans, Eduvanz).
   - The fee is divided into 10 to 24 equal monthly installments (typically starting from ₹4,500 – ₹7,500/month).
   - Zero Processing Fee and Zero Interest (the subvention interest is absorbed by the university).

3. Scholarship Concessions:
   - Concessions ranging from 10% to 30% are offered for Defence personnel, Divyang learners, women scholars, alumni, and merit holders.`,
          author_name: 'GeduConnect Financial Aid & Scholarship Desk',
          author_email: 'finaid@geduconnect.com',
          is_expert: true,
          is_accepted: true,
        },
      ],
    },
  ];

  for (const item of QNA_ITEMS) {
    const qDocId = makeDocId();
    const now = new Date();

    // 1. Insert Question Draft row
    const [qDraftRes] = await c.query(
      `INSERT INTO questions (document_id, title, slug, body, author_name, author_email, views, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [qDocId, item.title, item.slug, item.body, item.author_name, item.author_email, item.views, now, now]
    );
    const qDraftId = qDraftRes.insertId;

    // 2. Insert Question Published row
    const [qPubRes] = await c.query(
      `INSERT INTO questions (document_id, title, slug, body, author_name, author_email, views, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [qDocId, item.title, item.slug, item.body, item.author_name, item.author_email, item.views, now, now, now]
    );
    const qPubId = qPubRes.insertId;

    // Link Stream
    if (item.stream) {
      await c.query('INSERT IGNORE INTO questions_streams_lnk (question_id, stream_id) VALUES (?, ?)', [qDraftId, item.stream.id]);
      await c.query('INSERT IGNORE INTO questions_streams_lnk (question_id, stream_id) VALUES (?, ?)', [qPubId, item.stream.id]);
    }

    // Insert answers
    for (const ans of item.answers) {
      const aDocId = makeDocId();
      
      // Draft Answer row
      const [aDraftRes] = await c.query(
        `INSERT INTO answers (document_id, body, author_name, author_email, is_expert, is_accepted, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        [aDocId, ans.body, ans.author_name, ans.author_email, ans.is_expert ? 1 : 0, ans.is_accepted ? 1 : 0, now, now]
      );
      const aDraftId = aDraftRes.insertId;

      // Published Answer row
      const [aPubRes] = await c.query(
        `INSERT INTO answers (document_id, body, author_name, author_email, is_expert, is_accepted, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [aDocId, ans.body, ans.author_name, ans.author_email, ans.is_expert ? 1 : 0, ans.is_accepted ? 1 : 0, now, now, now]
      );
      const aPubId = aPubRes.insertId;

      // Link answer to question
      await c.query('INSERT IGNORE INTO answers_question_lnk (answer_id, question_id) VALUES (?, ?)', [aDraftId, qDraftId]);
      await c.query('INSERT IGNORE INTO answers_question_lnk (answer_id, question_id) VALUES (?, ?)', [aPubId, qPubId]);
    }

    console.log(`Seeded question: ${item.title} (${item.answers.length} answers)`);
  }

  console.log('Successfully seeded all 8 rich Online Education Q&A threads with twin draft/publish rows.');
  await c.end();
}

main().catch(console.error);
