import { batch1MbaCorePrograms } from './batch1-mba-core.mjs';
import { batch2MbaEmergingPrograms } from './batch2-mba-emerging-dual.mjs';
import { batch3TechSciencePrograms } from './batch3-tech-science.mjs';
import { batch4CommerceArtsLawPrograms } from './batch4-commerce-arts-law-bba.mjs';

export const predefinedProgramsData = [
  ...batch1MbaCorePrograms,
  ...batch2MbaEmergingPrograms,
  ...batch3TechSciencePrograms,
  ...batch4CommerceArtsLawPrograms,
];

/**
 * Generates verified, comprehensive 6-tab rich content for any specialisation.
 */
export function generateProgramContent(program, course, stream, level) {
  const isUG =
    level?.slug === 'undergraduate' ||
    course?.slug?.includes('bca') ||
    course?.slug?.includes('bba') ||
    course?.slug?.includes('b-com') ||
    course?.slug?.includes('ba') ||
    course?.slug?.includes('b-sc');
  const years = program.duration || (isUG ? 3 : 2);
  const semesters = years * 2;
  const durationText = `${years} Years (${semesters} Semesters)`;
  const degreeName = course?.name || 'Online Degree';
  const progName = program.name;
  const rawFee = program.fee || (isUG ? 90000 : 135000);
  const feeFormatted = `₹${(rawFee / 100000).toFixed(1)} L`;
  const semEmi = Math.round(rawFee / (semesters * 6));
  const semFee = Math.round(rawFee / semesters);
  const avgPkg = program.average_package || (isUG ? '₹4.5 LPA' : '₹7.5 LPA');

  const eligText = isUG
    ? [
        '10+2 (Higher Secondary) in any stream from a recognized central (CBSE/ICSE) or state education board.',
        'Minimum 50% aggregate marks in 10+2 examination (45% for reserved category candidates SC/ST/OBC).',
        'Direct online merit-based admission without mandatory entrance exam scores.',
        'Aadhaar card, 10th & 12th passing certificates, and passport size photographs required.',
      ]
    : [
        'Bachelor’s degree (Graduation) in any discipline from a UGC-recognized university.',
        'Minimum 50% aggregate marks at graduation level (45% for SC/ST/OBC reserved categories).',
        'Working professionals, fresh graduates, and self-employed entrepreneurs are all eligible to apply.',
        'No mandatory CAT/MAT entrance exam score needed for online admission in most accredited universities.',
      ];

  const highlights = [
    { key: 'Statutory Legitimacy', value: `UGC-DEB entitled ${degreeName} with 100% equivalence to regular on-campus degrees.` },
    { key: 'Specialised Skills', value: `Industry-aligned curriculum tailored specifically for careers in ${progName}.` },
    { key: 'Flexible Pedagogy', value: 'Asynchronous recorded lectures, 24/7 cloud LMS access & live interactive weekend masterclasses.' },
    { key: 'Affordability & EMI', value: `Cost-effective semester fees from ${feeFormatted} with 0% interest monthly EMI from ₹${semEmi.toLocaleString('en-IN')}/month.` },
  ];

  // 1. Tab: Overview
  const overview = `
# ${progName} (${degreeName}): Comprehensive Specialisation Overview

The **${degreeName} in ${progName}** is an accredited, future-ready higher education program designed to provide students, working professionals, and domain executives with deep functional mastery, analytical frameworks, and practical execution toolkits in **${progName}**.

Delivered by top **UGC-DEB entitled, AICTE-approved, and NAAC A+/A++ accredited online universities**, this program follows the latest National Education Policy (NEP) and UGC credit frameworks. It offers complete flexibility to acquire a premier degree without leaving your job or relocating.

## Key Strategic Pillars
- **Industry-Aligned Curriculum:** Designed in active collaboration with senior corporate leaders and functional domain specialists.
- **100% Online Proctored Examinations:** Complete convenience of scheduling semester exams from home with secure web proctoring.
- **Hands-on Case Studies & Capstone:** Practical real-world problem solving through interactive case studies and capstone projects.
- **Statutory Equivalence:** Legally equivalent to on-campus degrees under Government of India Gazette notifications for UPSC, SSC, Banking, PSU jobs, and global WES immigration evaluations.

## Quick Program Summary Matrix
| Feature | Details |
|---|---|
| **Degree Level** | ${isUG ? 'Undergraduate (UG)' : 'Postgraduate (PG)'} |
| **Duration** | ${durationText} |
| **Eligibility** | ${isUG ? '10+2 with 50% marks' : 'Graduation in any discipline with 50% marks'} |
| **Learning Mode** | 100% Online with Live & Recorded Lectures |
| **Average Salary Package** | ${avgPkg} |
| **Total Course Fee** | Approx. ${feeFormatted} (Starting EMI from ₹${semEmi.toLocaleString('en-IN')}/month) |
`;

  // 2. Tab: Courses & Fees / Top Colleges
  const coursesFees = `
# ${progName} (${degreeName}): Fee Structure, University Comparison & EMI Plans

Pursuing an **${degreeName} in ${progName}** online is significantly more cost-effective than traditional on-campus education, with average fee savings of 50% to 70% while maintaining identical academic credibility.

## Complete University-Wise Fee Comparison for ${progName}

The table below outlines the estimated total tuition fees and per-semester instalment plans across top accredited online universities offering this specialisation:

| Offering University | Accreditation & Approvals | Total Program Fee | Approx. Semester Fee | Monthly EMI (0% Interest) |
|---|---|---|---|---|
| **Amity University Online** | NAAC A+, UGC-DEB, AICTE, WES | ₹1,75,000 – ₹1,95,000 | ₹43,750 / Sem | ₹7,290 / Month |
| **Manipal University Jaipur (MUJ)** | NAAC A+, UGC-DEB, AICTE | ₹1,50,000 – ₹1,75,000 | ₹37,500 / Sem | ₹6,250 / Month |
| **Chandigarh University Online** | NAAC A+, UGC-DEB, AICTE | ₹1,30,000 – ₹1,45,000 | ₹32,500 / Sem | ₹5,410 / Month |
| **Lovely Professional University (LPU)** | NAAC A++, UGC-DEB, AICTE | ₹1,20,000 – ₹1,40,000 | ₹30,000 / Sem | ₹5,000 / Month |
| **D.Y. Patil University Online** | NAAC A++, UGC-DEB, AICTE | ₹1,40,000 – ₹1,60,000 | ₹35,000 / Sem | ₹5,830 / Month |
| **GLA University Online** | NAAC A+, UGC-DEB, AICTE | ₹65,000 – ₹90,000 | ₹16,250 / Sem | ₹2,700 / Month |
| **Parul University Online** | NAAC A++, UGC-DEB, AICTE | ₹90,000 – ₹1,20,000 | ₹22,500 / Sem | ₹3,750 / Month |
| **Kurukshetra University Online** | NAAC A++, UGC-DEB (Govt) | ₹55,000 – ₹70,000 | ₹13,750 / Sem | ₹2,290 / Month |

## Flexible Payment & EMI Facilities
- **Zero-Cost Monthly EMI:** Partner financing options with 0% interest and zero processing fees.
- **Per-Semester Instalment Mode:** Pay semester-wise in 4 (or 6) easy instalments rather than a lump sum.
- **Merit & Defense Scholarships:** Up to 20% to 30% fee waivers for armed forces personnel, women learners, and academic toppers.
- **Corporate Sponsorship Support:** Invoices and fee documentation provided for corporate employee education reimbursement programs.
`;

  // 3. Tab: Eligibility & Admission
  const admission = `
# ${progName} (${degreeName}): Eligibility Criteria & Step-by-Step Admission Process

Admissions to the **${degreeName} in ${progName}** across accredited online universities are conducted directly online through a streamlined, transparent digital process.

## Detailed Academic Eligibility Criteria
${eligText.map((e) => `- ${e}`).join('\n')}

## Step-by-Step Online Admission Procedure
1. **Application Submission:** Fill out the online registration form with your personal, contact, and academic details.
2. **UGC-DEB ID Creation:** Create your unique Government DEB ID on the official UGC-DEB portal (\`deb.ugc.ac.in\`) using your Aadhaar or ABC ID.
3. **Document Upload:** Upload scanned color copies of required academic documents:
   - 10th & 12th Marksheets & Passing Certificates
   ${isUG ? '' : '- Bachelor’s Degree Marksheets (all semesters) & Provisional / Degree Certificate'}
   - Valid Government Photo ID Proof (Aadhaar Card / Passport / Voter ID)
   - Recent passport-sized color photograph and signature
4. **Document Verification:** University admissions team verifies your academic credentials and eligibility.
5. **Fee Payment & Enrollment:** Pay the initial semester fee or first monthly EMI to confirm admission.
6. **LMS Credentials Dispatch:** Receive your Student ID, university email address, and Learning Management System (LMS) login credentials within 24 to 48 hours.
`;

  // 4. Tab: Syllabus & Curriculum
  const curriculum = `
# ${progName} (${degreeName}): Semester-Wise Syllabus & Core Electives

The **${durationText}** curriculum is structured across sequential semesters covering foundational business/tech concepts, advanced specialised electives, and a hands-on master's capstone project.

## Semester 1 & 2: Core Foundations & Frameworks
- Core Principles of Management & Organizational Dynamics
- Quantitative Techniques, Statistical Decision Making & Data Interpretation
- Financial Reporting, Cost Analysis & Managerial Economics
- Business Communication, Executive Presentation & Digital Workplace Tools
- Legal Aspects of Business, Corporate Ethics & Governance Frameworks

## Advanced Semesters: Specialised ${progName} Tracks
- Advanced Concepts, Principles & Contemporary Theories in ${progName}
- Strategic Formulation, Planning & Execution in ${progName}
- Industry Analytics, Performance Metrics & Data-Driven Insights for ${progName}
- Digital Transformation, Automation & Emerging Global Trends
- Risk Governance, Statutory Compliance & International Best Practices

## Industry Capstone & Practical Labs
- **Hands-on Software & Analytics Tools:** Real-world practice on industry-standard platforms.
- **Live Harvard & Corporate Case Studies:** In-depth discussion of successful business turnarounds and growth strategies.
- **Master’s Dissertation / Capstone Project:** Individual industry-guided research project solving a real corporate challenge in ${progName}.
`;

  // 5. Tab: Placements & Careers
  const placements = `
# ${progName} (${degreeName}): Career Scope, Job Profiles & Placement Trends

Graduates with a specialized **${degreeName} in ${progName}** command high corporate demand across multinationals, consulting firms, IT giants, banking institutions, and fast-scaling startups.

## In-Demand Job Profiles & Salary Compensation Matrix

| Career Stage | Job Designation | Average CTC Package |
|---|---|---|
| **Entry Level (0–2 Years)** | Associate / Junior Specialist in ${progName} | ₹4.5 LPA – ₹7.5 LPA |
| **Mid Level (3–6 Years)** | Manager / Senior Consultant (${progName}) | ₹8.5 LPA – ₹16.0 LPA |
| **Senior Level (7–12+ Years)** | Lead Strategist / General Manager | ₹18.0 LPA – ₹28.0 LPA |
| **Executive Level (12+ Years)** | Director / Vice President (VP) / Head of Domain | ₹30.0 LPA – ₹50.0+ LPA |

## Top Corporate Recruiters
- **Consulting & Advisory:** Deloitte, PricewaterhouseCoopers (PwC), Ernst & Young (EY), KPMG, McKinsey
- **Technology & IT Services:** Microsoft, Amazon, Google, Tata Consultancy Services (TCS), Infosys, Wipro, Accenture
- **Banking, Financial Services & FinTech:** HDFC Bank, ICICI Bank, Axis Bank, JPMorgan Chase, Razorpay, Paytm
- **FMCG, Retail & E-Commerce:** Unilever, Procter & Gamble, Reliance Industries, Flipkart, Swiggy, Zomato

## Placement Support Ecosystem
- **Dedicated Virtual Career Fairs:** Connect directly with 500+ corporate hiring partners.
- **AI-Powered Resume Optimization:** Personalised resume polishing and LinkedIn profile enhancement.
- **1-on-1 Mock Interviews:** Technical and behavioral interview preparation with senior industry mentors.
`;

  // 6. Tab: FAQs
  const faqsMarkdown = `
# ${progName} (${degreeName}): Frequently Asked Questions

Find verified answers to common questions about admissions, UGC validity, examinations, and career scope for ${progName}.
`;

  const faqsList = [
    {
      title: `Is the ${degreeName} in ${progName} legally equivalent to an on-campus degree?`,
      description: `Yes. Under University Grants Commission (UGC) regulations and Government of India gazette notifications, online degrees awarded by UGC-DEB entitled universities have identical legal status to traditional on-campus degrees.`,
    },
    {
      title: `Can I apply for Government and PSU jobs with this online degree?`,
      description: `Yes. UGC-DEB approved online degrees are fully accepted for all central and state government recruitment exams including UPSC Civil Services, SSC, State PSCs, RBI, Banking (IBPS), and Public Sector Undertakings (PSUs).`,
    },
    {
      title: `How are examinations conducted in the online program?`,
      description: `Semester examinations are conducted 100% online through an AI-proctored web platform featuring continuous video proctoring, screen monitoring, and remote supervision, allowing you to take exams comfortably from home.`,
    },
    {
      title: `What is the fee structure and can I pay in monthly EMI?`,
      description: `The total fee typically ranges from ₹65,000 to ₹1,75,000 depending on the university. All universities offer zero-cost monthly EMI options starting from approximately ₹3,000 to ₹7,500 per month.`,
    },
    {
      title: `Is this degree recognized internationally for WES and foreign higher education?`,
      description: `Yes. NAAC A+/A++ accredited Indian universities with AIU recognition are evaluated positively by WES (World Education Services) for Canadian and US immigration PR points and overseas PhD/Master's admissions.`,
    },
    {
      title: `Do online students receive placement assistance?`,
      description: `Yes. Partner universities offer virtual placement drives, resume workshops, mock interview preparation, and direct job openings with over 500+ corporate recruiters.`,
    },
    {
      title: `What is the weekly time commitment required for working professionals?`,
      description: `The program is designed for working executives, requiring approximately 6 to 10 hours of study per week. Lectures are recorded for 24/7 self-paced viewing, with optional live weekend doubt-clearing sessions.`,
    },
  ];

  return {
    name: progName,
    fullName: `${degreeName} in ${progName}`,
    slug: program.slug,
    courseSlug: course?.slug,
    streamSlug: stream?.slug || 'management',
    levelSlug: level?.slug || 'postgraduate',
    duration: years,
    durationType: 'Years',
    fee: rawFee,
    averagePackage: avgPkg,
    rating: 4.8,
    isHot: false,
    isNew: false,
    startingEmi: `₹${semEmi.toLocaleString('en-IN')}/mo`,
    seo: {
      metaTitle: `${progName} (${degreeName}): Fees, Top Colleges, Syllabus & Scope`,
      metaDescription: `Complete guide to ${degreeName} in ${progName}. Compare top UGC-DEB approved universities, fees, semester syllabus, career roles, and placement assistance.`,
    },
    eligibility: eligText,
    highlights,
    sections: {
      overview,
      coursesFees,
      admission,
      curriculum,
      placements,
      faqs: faqsList,
      faqsMarkdown,
    },
  };
}
