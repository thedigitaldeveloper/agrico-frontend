import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

// Load backend .env so database connection uses MySQL correctly
const dotenv = require('d:/geduconnectbknd/node_modules/dotenv');
dotenv.config({ path: 'd:/geduconnectbknd/.env' });

/**
 * Parses markdown inline formatting (**bold**, links, plain text)
 */
function parseInlines(text) {
  if (!text) return [{ type: 'text', text: '' }];

  const tokens = [];
  // Regex to match **bold** or [text](url) or plain chunks
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      const plain = text.substring(lastIdx, match.index);
      if (plain) tokens.push({ type: 'text', text: plain });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      const boldText = matchedStr.slice(2, -2);
      tokens.push({ type: 'text', text: boldText, bold: true });
    } else if (matchedStr.startsWith('[') && matchedStr.includes('](')) {
      const closeBracket = matchedStr.indexOf('](');
      const label = matchedStr.slice(1, closeBracket);
      const url = matchedStr.slice(closeBracket + 2, -1);
      tokens.push({
        type: 'link',
        url,
        children: [{ type: 'text', text: label }],
      });
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    const trailing = text.substring(lastIdx);
    if (trailing) tokens.push({ type: 'text', text: trailing });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', text }];
}

/**
 * Converts Markdown file content into Strapi BlocksContent AST
 */
function markdownToStrapiBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];

  let inCodeBlock = false;
  let codeBuffer = [];
  let currentList = null; // { type: 'list', format: 'ordered' | 'unordered', children: [] }

  function flushList() {
    if (currentList && currentList.children.length > 0) {
      blocks.push(currentList);
      currentList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check for code blocks (```)
    if (trimmed.startsWith('```')) {
      flushList();
      if (inCodeBlock) {
        // End of code block
        blocks.push({
          type: 'code',
          children: [{ type: 'text', text: codeBuffer.join('\n') }],
        });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Horizontal rule or empty line
    if (trimmed === '---' || trimmed === '***' || trimmed === '') {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith('#')) {
      flushList();
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const hashes = match[1].length;
        const headingText = match[2];
        // If it's a top-level # (H1) at the start of the draft, skip it because the page section already renders an H2 heading
        if (hashes === 1 && blocks.length === 0) {
          continue;
        }
        const level = Math.min(6, Math.max(3, hashes + 1));
        blocks.push({
          type: 'heading',
          level,
          children: parseInlines(headingText),
        });
        continue;
      }
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      flushList();
      const quoteText = trimmed.replace(/^>\s*/, '');
      blocks.push({
        type: 'quote',
        children: parseInlines(quoteText),
      });
      continue;
    }

    // Unordered list item (- or *)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      const itemText = ulMatch[1];
      if (!currentList || currentList.format !== 'unordered') {
        flushList();
        currentList = {
          type: 'list',
          format: 'unordered',
          children: [],
        };
      }
      currentList.children.push({
        type: 'list-item',
        children: parseInlines(itemText),
      });
      continue;
    }

    // Ordered list item (1. or 2.)
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      const itemText = olMatch[1];
      if (!currentList || currentList.format !== 'ordered') {
        flushList();
        currentList = {
          type: 'list',
          format: 'ordered',
          children: [],
        };
      }
      currentList.children.push({
        type: 'list-item',
        children: parseInlines(itemText),
      });
      continue;
    }

    // Normal Paragraph
    flushList();
    if (trimmed.length > 0) {
      blocks.push({
        type: 'paragraph',
        children: parseInlines(trimmed),
      });
    }
  }

  flushList();
  return blocks;
}

/**
 * Extracts Q&A pairs from faqs.md to create college.faq-section
 */
function extractFaqsFromMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const faqs = [];
  let currentQuestion = null;
  let currentAnswerLines = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (trimmed.startsWith('### Q')) {
      if (currentQuestion && currentAnswerLines.length > 0) {
        faqs.push({
          title: currentQuestion,
          description: markdownToStrapiBlocks(currentAnswerLines.join('\n')),
        });
      }
      // Remove '### ' and leading numbers/Q-labels for clean question title
      const qText = trimmed.replace(/^###\s+Q\d+[\.:]?\s*/, '').trim();
      currentQuestion = qText;
      currentAnswerLines = [];
    } else if (currentQuestion) {
      if (trimmed.startsWith('**Answer:**')) {
        currentAnswerLines.push(trimmed.replace(/^\*\*Answer:\*\*\s*/, ''));
      } else if (!trimmed.startsWith('#')) {
        currentAnswerLines.push(lines[i]);
      }
    }
  }

  if (currentQuestion && currentAnswerLines.length > 0) {
    faqs.push({
      title: currentQuestion,
      description: markdownToStrapiBlocks(currentAnswerLines.join('\n')),
    });
  }

  return faqs;
}

async function publishVguToStrapi() {
  console.log('🚀 Starting Strapi CMS Publishing for Vivekananda Global University Online...');

  const draftDir = path.resolve(HERE, '../content-draft/vivekananda-global-university-online');
  if (!fs.existsSync(draftDir)) {
    console.error(`❌ Draft directory not found at ${draftDir}`);
    process.exit(1);
  }

  const strapiPackage = require('d:/geduconnectbknd/node_modules/@strapi/strapi');
  const { createStrapi, compileStrapi } = strapiPackage;

  process.chdir('d:/geduconnectbknd');
  console.log('⚙️ Compiling Strapi context with MySQL config...');
  const appContext = await compileStrapi();
  console.log('🔌 Loading Strapi instance...');
  const strapi = await createStrapi(appContext).load();

  try {
    const uniSlug = 'vivekananda-global-university-online';
    console.log(`📦 Strapi loaded. Checking for existing university [${uniSlug}]...`);

    // 1. Resolve Ownership (Private)
    let ownership = await strapi.documents('api::ownership-type.ownership-type').findFirst({
      filters: { slug: 'private' },
    });
    if (!ownership) {
      ownership = await strapi.documents('api::ownership-type.ownership-type').create({
        data: { name: 'Private', slug: 'private' },
        status: 'published',
      });
    }

    // 2. Resolve Approvals
    const approvalsList = [
      { slug: 'ugc', name: 'UGC' },
      { slug: 'ugc-deb', name: 'UGC-DEB' },
      { slug: 'aicte', name: 'AICTE' },
      { slug: 'aiu', name: 'AIU' },
      { slug: 'naac-a', name: 'NAAC A+' },
    ];
    const approvalDocIds = [];
    for (const a of approvalsList) {
      let doc = await strapi.documents('api::approval.approval').findFirst({
        filters: { slug: a.slug },
      });
      if (!doc) {
        doc = await strapi.documents('api::approval.approval').create({
          data: { name: a.name, slug: a.slug },
          status: 'published',
        });
      }
      approvalDocIds.push(doc.documentId);
    }

    // 3. Resolve Streams
    const streamsList = [
      { slug: 'management', name: 'Management' },
      { slug: 'computer-applications', name: 'Computer Applications' },
      { slug: 'science', name: 'Science' },
      { slug: 'arts-humanities', name: 'Arts & Humanities' },
      { slug: 'commerce', name: 'Commerce' },
    ];
    const streamDocIds = [];
    for (const st of streamsList) {
      let doc = await strapi.documents('api::stream.stream').findFirst({
        filters: { slug: st.slug },
      });
      if (!doc) {
        doc = await strapi.documents('api::stream.stream').create({
          data: { name: st.name, slug: st.slug },
          status: 'published',
        });
      }
      streamDocIds.push(doc.documentId);
    }

    // 4. Upsert University Entity
    let existingUni = await strapi.documents('api::university.university').findFirst({
      filters: { slug: uniSlug },
      status: 'draft',
      populate: ['university_contents'],
    });
    if (!existingUni) {
      existingUni = await strapi.documents('api::university.university').findFirst({
        filters: { slug: uniSlug },
        status: 'published',
        populate: ['university_contents'],
      });
    }

    const uniPayload = {
      name: 'Vivekananda Global University Online',
      full_name: 'Vivekananda Global University, Jaipur (VGU Online)',
      slug: uniSlug,
      country: 'India',
      state: 'Rajasthan',
      city: 'Jaipur',
      address: 'Sector 36, Sisyawas, NRI Road, Jagatpura, Jaipur, Rajasthan 303012',
      pincode: '303012',
      establish: '2012-01-01',
      rating: 4.6,
      position: 12,
      heading: 'Vivekananda Global University (VGU Online) — Programs, Fees, Admissions & Placements',
      show_apply_button: true,
      apply_button_text: 'Apply for Admission',
      view_button_text: 'Explore Programs',
      show_similar_universities: true,
      ownership_type: ownership.documentId,
      approvals: approvalDocIds,
      streams: streamDocIds,
      seo: {
        metaTitle: 'Vivekananda Global University Online: Courses, Fees, Admission & Placements',
        metaDescription: 'Explore VGU Online degree programs (MBA, MCA, BBA, BCA, BA, MA). NAAC A+ accredited and UGC-DEB entitled. Complete details on fees, eligibility, and placements.',
      },
      highlights: [
        {
          key: 'Accreditation',
          value: 'NAAC A+ Grade accredited with statutory UGC-DEB entitlement & AICTE approval.',
          icon: null,
        },
        {
          key: 'Placement Support',
          value: '367+ hiring partners, ₹44 LPA highest international package & dedicated VGU One portal.',
          icon: null,
        },
        {
          key: 'Digital Pedagogy',
          value: 'LMS 4.0 with HD video tutorials, live weekend masterclasses, and 100% online proctored exams.',
          icon: null,
        },
        {
          key: 'Flexible Financing',
          value: '0% interest no-cost monthly EMI options & transparent semester fee payment plans.',
          icon: null,
        },
      ],
    };

    let targetUniDocId;
    if (existingUni) {
      console.log(`✏️ Updating existing university (documentId: ${existingUni.documentId})...`);
      const updated = await strapi.documents('api::university.university').update({
        documentId: existingUni.documentId,
        data: uniPayload,
        status: 'draft',
      });
      targetUniDocId = updated.documentId;
    } else {
      console.log(`✨ Creating new university: ${uniPayload.name}...`);
      const created = await strapi.documents('api::university.university').create({
        data: uniPayload,
        status: 'draft',
      });
      targetUniDocId = created.documentId;
    }

    // 5. Define Tab Definitions mapping to Draft Files
    const tabs = [
      {
        fileName: 'overview.md',
        name: 'Overview',
        display_name: 'Overview',
        slug: 'vivekananda-global-university-online-overview',
        secondary_slug: 'overview',
        heading: 'Vivekananda Global University Online Overview & Approvals',
        seo: {
          metaTitle: 'VGU Online Overview: Heritage, Accreditations & Approvals',
          metaDescription: 'Read the comprehensive overview of Vivekananda Global University Online, including NAAC A+ rating, UGC-DEB approvals, and digital learning infrastructure.',
        },
      },
      {
        fileName: 'courses-and-fees.md',
        name: 'Courses & Fees',
        display_name: 'Courses & Fees',
        slug: 'vivekananda-global-university-online-courses-fees',
        secondary_slug: 'courses-fees',
        heading: 'VGU Online Courses, Specializations & Fee Structure',
        isFeeTab: true,
        seo: {
          metaTitle: 'VGU Online Courses & Fees: MBA, MCA, BBA, BCA, BA',
          metaDescription: 'Detailed fee structure, semester installments, zero-cost EMI plans, and scholarship criteria for all VGU Online degree programs.',
        },
      },
      {
        fileName: 'admission.md',
        name: 'Admission',
        display_name: 'Admission',
        slug: 'vivekananda-global-university-online-admission',
        secondary_slug: 'admission',
        heading: 'VGU Online Admission Process, Eligibility & Document Verification',
        seo: {
          metaTitle: 'VGU Online Admission: Steps, Eligibility & Refund Policy',
          metaDescription: 'Step-by-step admission guide for VGU Online. Learn about UGC-DEB ID generation, eligibility criteria, and documents checklist.',
        },
      },
      {
        fileName: 'placements.md',
        name: 'Placements',
        display_name: 'Placements',
        slug: 'vivekananda-global-university-online-placements',
        secondary_slug: 'placements',
        heading: 'VGU Online Placements, Top Recruiters & Career Support',
        seo: {
          metaTitle: 'VGU Online Placements: Top Recruiters & Salary Packages',
          metaDescription: 'Explore placement statistics, 367+ recruiting partners, average salary packages, and career assistance services at VGU Online.',
        },
      },
      {
        fileName: 'student-support.md',
        name: 'Student Support',
        display_name: 'Student Support',
        slug: 'vivekananda-global-university-online-student-support',
        secondary_slug: 'student-support',
        heading: 'VGU Online Student Support, LMS & Examination Framework',
        seo: {
          metaTitle: 'VGU Online Student Support: LMS 4.0, Mentorship & Exam System',
          metaDescription: 'Discover the student support ecosystem at VGU Online, featuring LMS 4.0, live doubt sessions, dedicated relationship managers, and proctored exams.',
        },
      },
      {
        fileName: 'faqs.md',
        name: 'FAQs',
        display_name: 'FAQs',
        slug: 'vivekananda-global-university-online-faqs',
        secondary_slug: 'faqs',
        heading: 'Frequently Asked Questions — Vivekananda Global University Online',
        isFaqTab: true,
        seo: {
          metaTitle: 'VGU Online FAQs: Degree Validity, Exams, Fees & Approvals',
          metaDescription: 'Find answers to all frequently asked questions regarding VGU Online degrees, examinations, admission process, and UGC recognition.',
        },
      },
    ];

    const sectionDocIds = [];

    for (const tab of tabs) {
      console.log(`📑 Processing Tab: ${tab.name} (${tab.slug})...`);
      const filePath = path.join(draftDir, tab.fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}, skipping...`);
        continue;
      }

      const mdContent = fs.readFileSync(filePath, 'utf8');
      const richTextBlocks = markdownToStrapiBlocks(mdContent);

      const dynamicZoneContent = [];

      // Add main Rich Text Block (heading null because SectionBody already renders section.heading)
      dynamicZoneContent.push({
        __component: 'common.rich-text',
        heading: null,
        body: richTextBlocks,
      });

      // If FAQ Tab, also attach structured FAQ component
      if (tab.isFaqTab) {
        const extractedFaqs = extractFaqsFromMarkdown(mdContent);
        if (extractedFaqs.length > 0) {
          console.log(`  ✓ Extracted ${extractedFaqs.length} structured FAQ pairs for dynamic accordion`);
          dynamicZoneContent.push({
            __component: 'college.faq-section',
            faqs: extractedFaqs,
          });
        }
      }

      // If Fee Tab, also attach fee structure block
      if (tab.isFeeTab) {
        dynamicZoneContent.push({
          __component: 'college.fee-structure',
          name: 'Program Fee Table',
          show_program_table: true,
          description: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Browse and compare full fee schedules and durations across all approved VGU Online degree courses below.',
                },
              ],
            },
          ],
        });
      }

      // Check if existing content section exists
      let existingSection = await strapi
        .documents('api::university-content.university-content')
        .findFirst({
          filters: {
            slug: tab.slug,
            university: { slug: uniSlug },
          },
          status: 'draft',
        });

      if (!existingSection) {
        existingSection = await strapi
          .documents('api::university-content.university-content')
          .findFirst({
            filters: {
              secondary_slug: tab.secondary_slug,
              university: { slug: uniSlug },
            },
            status: 'draft',
          });
      }

      const sectionPayload = {
        name: tab.name,
        display_name: tab.display_name,
        slug: tab.slug,
        secondary_slug: tab.secondary_slug,
        heading: tab.heading,
        seo: tab.seo,
        content: dynamicZoneContent,
        university: targetUniDocId,
      };

      let sectionDocId;
      if (existingSection) {
        console.log(`  ✏️ Updating existing section [${tab.name}] (docId: ${existingSection.documentId})...`);
        const updatedSec = await strapi
          .documents('api::university-content.university-content')
          .update({
            documentId: existingSection.documentId,
            data: sectionPayload,
            status: 'draft',
          });
        sectionDocId = updatedSec.documentId;
      } else {
        console.log(`  ✨ Creating new section [${tab.name}]...`);
        const createdSec = await strapi
          .documents('api::university-content.university-content')
          .create({
            data: sectionPayload,
            status: 'draft',
          });
        sectionDocId = createdSec.documentId;
      }

      // Publish section
      await strapi.documents('api::university-content.university-content').publish({
        documentId: sectionDocId,
      });

      sectionDocIds.push(sectionDocId);
      console.log(`  ✅ Published section [${tab.name}]!`);
    }

    // Link sections to university & publish university
    console.log(`🔗 Linking ${sectionDocIds.length} sections to university record...`);
    await strapi.documents('api::university.university').update({
      documentId: targetUniDocId,
      data: {
        university_contents: sectionDocIds,
      },
      status: 'draft',
    });

    await strapi.documents('api::university.university').publish({
      documentId: targetUniDocId,
    });

    console.log(`🎉 SUCCESS! All 6 content tabs for Vivekananda Global University Online are published in Strapi CMS!`);
  } catch (err) {
    console.error('❌ Error publishing to Strapi CMS:', err);
  } finally {
    await strapi.destroy().catch(() => {});
    process.exit(0);
  }
}

publishVguToStrapi();
