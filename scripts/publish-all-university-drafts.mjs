import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

// Load backend .env
const dotenv = require('d:/geduconnectbknd/node_modules/dotenv');
dotenv.config({ path: 'd:/geduconnectbknd/.env' });

import { universitiesData } from './university-data-definition.mjs';

function parseInlines(text) {
  if (!text) return [{ type: 'text', text: '' }];
  const tokens = [];
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

function markdownToStrapiBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];

  let inCodeBlock = false;
  let codeBuffer = [];
  let currentList = null;

  function flushList() {
    if (currentList && currentList.children.length > 0) {
      blocks.push(currentList);
      currentList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('```')) {
      flushList();
      if (inCodeBlock) {
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

    if (trimmed === '---' || trimmed === '***' || trimmed === '') {
      flushList();
      continue;
    }

    if (trimmed.startsWith('#')) {
      flushList();
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const hashes = match[1].length;
        const headingText = match[2];
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

    if (trimmed.startsWith('>')) {
      flushList();
      const quoteText = trimmed.replace(/^>\s*/, '');
      blocks.push({
        type: 'quote',
        children: parseInlines(quoteText),
      });
      continue;
    }

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

export async function processAllUniversities() {
  console.log(`🚀 Processing ${universitiesData.length} Online Universities...`);

  const baseDraftDir = path.resolve(HERE, '../content-draft');
  if (!fs.existsSync(baseDraftDir)) {
    fs.mkdirSync(baseDraftDir, { recursive: true });
  }

  // 1. Write Markdown Draft Files
  for (const uni of universitiesData) {
    const uniDraftDir = path.join(baseDraftDir, uni.slug);
    if (!fs.existsSync(uniDraftDir)) {
      fs.mkdirSync(uniDraftDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uniDraftDir, 'overview.md'), uni.drafts.overview, 'utf8');
    fs.writeFileSync(path.join(uniDraftDir, 'courses-and-fees.md'), uni.drafts.coursesAndFees, 'utf8');
    fs.writeFileSync(path.join(uniDraftDir, 'admission.md'), uni.drafts.admission, 'utf8');
    fs.writeFileSync(path.join(uniDraftDir, 'placements.md'), uni.drafts.placements, 'utf8');
    fs.writeFileSync(path.join(uniDraftDir, 'student-support.md'), uni.drafts.studentSupport, 'utf8');
    fs.writeFileSync(path.join(uniDraftDir, 'faqs.md'), uni.drafts.faqs, 'utf8');

    console.log(`📁 Draft files generated for [${uni.name}] -> content-draft/${uni.slug}/`);
  }

  // 2. Publish to Strapi CMS
  const strapiPackage = require('d:/geduconnectbknd/node_modules/@strapi/strapi');
  const { createStrapi, compileStrapi } = strapiPackage;

  process.chdir('d:/geduconnectbknd');
  console.log('⚙️ Compiling Strapi context with MySQL config...');
  const appContext = await compileStrapi();
  console.log('🔌 Loading Strapi instance...');
  const strapi = await createStrapi(appContext).load();

  try {
    for (const uni of universitiesData) {
      console.log(`\n======================================================`);
      console.log(`🏛️ Publishing University to Strapi: ${uni.name} (${uni.slug})`);
      console.log(`======================================================`);

      // Resolve Ownership
      let ownership = await strapi.documents('api::ownership-type.ownership-type').findFirst({
        filters: { slug: uni.ownershipType.slug },
      });
      if (!ownership) {
        ownership = await strapi.documents('api::ownership-type.ownership-type').create({
          data: { name: uni.ownershipType.name, slug: uni.ownershipType.slug },
          status: 'published',
        });
      }

      // Resolve Approvals
      const approvalDocIds = [];
      for (const a of uni.approvals) {
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

      // Resolve Streams
      const streamDocIds = [];
      for (const st of uni.streams) {
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

      // Upsert University Entity
      let existingUni = await strapi.documents('api::university.university').findFirst({
        filters: { slug: uni.slug },
        status: 'draft',
      });
      if (!existingUni) {
        existingUni = await strapi.documents('api::university.university').findFirst({
          filters: { slug: uni.slug },
          status: 'published',
        });
      }

      const uniPayload = {
        name: uni.name,
        full_name: uni.fullName,
        slug: uni.slug,
        country: 'India',
        state: uni.state,
        city: uni.city,
        address: uni.address,
        pincode: uni.pincode,
        establish: uni.establish,
        rating: uni.rating,
        position: uni.position || 20,
        heading: uni.heading,
        show_apply_button: true,
        apply_button_text: 'Apply for Admission',
        view_button_text: 'Explore Programs',
        show_similar_universities: true,
        ownership_type: ownership.documentId,
        approvals: approvalDocIds,
        streams: streamDocIds,
        seo: uni.seo,
        highlights: uni.highlights,
      };

      let targetUniDocId;
      if (existingUni) {
        console.log(`✏️ Updating university [${uni.name}] (${existingUni.documentId})...`);
        const updated = await strapi.documents('api::university.university').update({
          documentId: existingUni.documentId,
          data: uniPayload,
          status: 'draft',
        });
        targetUniDocId = updated.documentId;
      } else {
        console.log(`✨ Creating new university [${uni.name}]...`);
        const created = await strapi.documents('api::university.university').create({
          data: uniPayload,
          status: 'draft',
        });
        targetUniDocId = created.documentId;
      }

      // Tab definitions
      const uniDraftDir = path.join(baseDraftDir, uni.slug);
      const tabs = [
        {
          fileName: 'overview.md',
          name: 'Overview',
          display_name: 'Overview',
          slug: `${uni.slug}-overview`,
          secondary_slug: 'overview',
          heading: `${uni.name} Overview, Accreditations & Key Highlights`,
          seo: {
            metaTitle: `${uni.name} Overview: Accreditations, Ranking & Approvals`,
            metaDescription: `Discover complete details about ${uni.name}, its statutory approvals, ranking, learning methodology, and digital campus infrastructure.`,
          },
        },
        {
          fileName: 'courses-and-fees.md',
          name: 'Courses & Fees',
          display_name: 'Courses & Fees',
          slug: `${uni.slug}-courses-fees`,
          secondary_slug: 'courses-fees',
          heading: `${uni.name} Online Courses, Specializations & Fee Structure`,
          isFeeTab: true,
          seo: {
            metaTitle: `${uni.name} Courses & Fees: MBA, MCA, BBA, BCA, Fees & EMI`,
            metaDescription: `Comprehensive course list, specializations, semester fees, and zero-cost EMI plans for ${uni.name}.`,
          },
        },
        {
          fileName: 'admission.md',
          name: 'Admission',
          display_name: 'Admission',
          slug: `${uni.slug}-admission`,
          secondary_slug: 'admission',
          heading: `${uni.name} Admission Process, Eligibility & Document Checklist`,
          seo: {
            metaTitle: `${uni.name} Admission: Eligibility, Application Steps & Verification`,
            metaDescription: `Step-by-step admission guidelines, UGC-DEB ID registration, eligibility criteria, and documents required for ${uni.name}.`,
          },
        },
        {
          fileName: 'placements.md',
          name: 'Placements',
          display_name: 'Placements',
          slug: `${uni.slug}-placements`,
          secondary_slug: 'placements',
          heading: `${uni.name} Placement Assistance, Top Recruiters & Career Support`,
          seo: {
            metaTitle: `${uni.name} Placements: Highest Packages, Top Recruiters & Career Services`,
            metaDescription: `Explore career support, top corporate recruiters, average CTC, and placement assistance provided by ${uni.name}.`,
          },
        },
        {
          fileName: 'student-support.md',
          name: 'Student Support',
          display_name: 'Student Support',
          slug: `${uni.slug}-student-support`,
          secondary_slug: 'student-support',
          heading: `${uni.name} Student Support, LMS Portal & Examination System`,
          seo: {
            metaTitle: `${uni.name} Student Support: LMS, Mentorship & Online Exams`,
            metaDescription: `Learn about LMS access, live interactive sessions, mentor support, digital library, and proctored examination framework at ${uni.name}.`,
          },
        },
        {
          fileName: 'faqs.md',
          name: 'FAQs',
          display_name: 'FAQs',
          slug: `${uni.slug}-faqs`,
          secondary_slug: 'faqs',
          heading: `Frequently Asked Questions — ${uni.name}`,
          isFaqTab: true,
          seo: {
            metaTitle: `${uni.name} FAQs: Degree Recognition, Exams, Fees & Validity`,
            metaDescription: `Find clear answers to common questions about degree validity, online examinations, fee payments, and UGC recognition for ${uni.name}.`,
          },
        },
      ];

      const sectionDocIds = [];

      for (const tab of tabs) {
        const filePath = path.join(uniDraftDir, tab.fileName);
        if (!fs.existsSync(filePath)) {
          console.warn(`  ⚠️ Draft file not found: ${filePath}`);
          continue;
        }

        const mdContent = fs.readFileSync(filePath, 'utf8');
        const richTextBlocks = markdownToStrapiBlocks(mdContent);
        const dynamicZoneContent = [];

        dynamicZoneContent.push({
          __component: 'common.rich-text',
          heading: null,
          body: richTextBlocks,
        });

        if (tab.isFaqTab) {
          const extractedFaqs = extractFaqsFromMarkdown(mdContent);
          if (extractedFaqs.length > 0) {
            dynamicZoneContent.push({
              __component: 'college.faq-section',
              faqs: extractedFaqs,
            });
          }
        }

        if (tab.isFeeTab) {
          dynamicZoneContent.push({
            __component: 'college.fee-structure',
            name: `${uni.name} Program Fee Table`,
            show_program_table: true,
            description: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: `Explore all UGC-DEB entitled online undergraduate, postgraduate, and professional degree fee schedules below for ${uni.name}.`,
                  },
                ],
              },
            ],
          });
        }

        // Check if existing section exists
        let existingSection = await strapi
          .documents('api::university-content.university-content')
          .findFirst({
            filters: {
              slug: tab.slug,
              university: { slug: uni.slug },
            },
            status: 'draft',
          });

        if (!existingSection) {
          existingSection = await strapi
            .documents('api::university-content.university-content')
            .findFirst({
              filters: {
                secondary_slug: tab.secondary_slug,
                university: { slug: uni.slug },
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
          const updatedSec = await strapi
            .documents('api::university-content.university-content')
            .update({
              documentId: existingSection.documentId,
              data: sectionPayload,
              status: 'draft',
            });
          sectionDocId = updatedSec.documentId;
        } else {
          const createdSec = await strapi
            .documents('api::university-content.university-content')
            .create({
              data: sectionPayload,
              status: 'draft',
            });
          sectionDocId = createdSec.documentId;
        }

        await strapi.documents('api::university-content.university-content').publish({
          documentId: sectionDocId,
        });

        sectionDocIds.push(sectionDocId);
        console.log(`  ✓ Published section [${tab.name}] (${tab.slug})`);
      }

      // Link sections to university and publish university
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

      console.log(`🎉 University published successfully: ${uni.name}`);
    }

    console.log(`\n======================================================`);
    console.log(`✅ ALL 16 ONLINE UNIVERSITIES PUBLISHED TO STRAPI CMS!`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('❌ Error during publishing:', err);
  } finally {
    await strapi.destroy().catch(() => {});
    process.exit(0);
  }
}

processAllUniversities();

