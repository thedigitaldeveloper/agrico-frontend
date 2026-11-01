import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');
import { universitiesData } from './university-data-definition.mjs';

function genDocId() {
  return crypto.randomBytes(12).toString('hex');
}

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

async function run() {
  console.log(`🚀 Starting Database Ingestion for ${universitiesData.length} Online Universities...`);

  const baseDraftDir = path.resolve(HERE, '../content-draft');
  if (!fs.existsSync(baseDraftDir)) {
    fs.mkdirSync(baseDraftDir, { recursive: true });
  }

  // 1. Write Markdown Drafts
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
    console.log(`📁 Drafts on disk: [${uni.name}] -> content-draft/${uni.slug}/`);
  }

  // 2. Connect to MySQL database
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  console.log('🔌 Connected to MySQL database `geduconnect`!');

  const now = new Date();

  for (const uni of universitiesData) {
    console.log(`\n======================================================`);
    console.log(`🏛️ Publishing: ${uni.name} (${uni.slug})`);
    console.log(`======================================================`);

    // Check approvals
    const approvalIds = [];
    for (let ord = 0; ord < uni.approvals.length; ord++) {
      const a = uni.approvals[ord];
      const [existing] = await conn.execute('SELECT id FROM approvals WHERE slug = ?', [a.slug]);
      let appId;
      if (existing.length > 0) {
        appId = existing[0].id;
      } else {
        const docId = genDocId();
        const [res] = await conn.execute(
          'INSERT INTO approvals (document_id, name, slug, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?)',
          [docId, a.name, a.slug, now, now, now]
        );
        appId = res.insertId;
      }
      approvalIds.push({ id: appId, ord: ord + 1 });
    }

    // Check streams
    const streamIds = [];
    for (let ord = 0; ord < uni.streams.length; ord++) {
      const st = uni.streams[ord];
      const [existing] = await conn.execute('SELECT id FROM streams WHERE slug = ?', [st.slug]);
      let streamId;
      if (existing.length > 0) {
        streamId = existing[0].id;
      } else {
        const docId = genDocId();
        const [res] = await conn.execute(
          'INSERT INTO streams (document_id, name, slug, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?)',
          [docId, st.name, st.slug, now, now, now]
        );
        streamId = res.insertId;
      }
      streamIds.push({ id: streamId, ord: ord + 1 });
    }

    // Check / Insert University Record (both draft & published rows for Strapi 5)
    const [existingUnis] = await conn.execute('SELECT id, document_id, published_at FROM universities WHERE slug = ?', [uni.slug]);
    
    let targetDocId = existingUnis.length > 0 ? existingUnis[0].document_id : genDocId();
    let publishedUniId, draftUniId;

    if (existingUnis.length === 0) {
      // Create draft row
      const [draftRes] = await conn.execute(
        `INSERT INTO universities (document_id, name, full_name, slug, country, state, city, address, pincode, establish, rating, heading, show_apply_button, apply_button_text, view_button_text, show_similar_universities, position, created_at, updated_at, published_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
        [
          targetDocId,
          uni.name,
          uni.fullName,
          uni.slug,
          'India',
          uni.state,
          uni.city,
          uni.address,
          uni.pincode,
          uni.establish,
          uni.rating,
          uni.heading,
          1,
          'Apply for Admission',
          'Explore Programs',
          1,
          uni.position || 20,
          now,
          now,
        ]
      );
      draftUniId = draftRes.insertId;

      // Create published row
      const [pubRes] = await conn.execute(
        `INSERT INTO universities (document_id, name, full_name, slug, country, state, city, address, pincode, establish, rating, heading, show_apply_button, apply_button_text, view_button_text, show_similar_universities, position, created_at, updated_at, published_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          targetDocId,
          uni.name,
          uni.fullName,
          uni.slug,
          'India',
          uni.state,
          uni.city,
          uni.address,
          uni.pincode,
          uni.establish,
          uni.rating,
          uni.heading,
          1,
          'Apply for Admission',
          'Explore Programs',
          1,
          uni.position || 20,
          now,
          now,
          now,
        ]
      );
      publishedUniId = pubRes.insertId;
      console.log(`✨ Created university in DB (published id: ${publishedUniId}, draft id: ${draftUniId})`);
    } else {
      const pub = existingUnis.find(u => u.published_at !== null);
      const drf = existingUnis.find(u => u.published_at === null);
      publishedUniId = pub ? pub.id : existingUnis[0].id;
      draftUniId = drf ? drf.id : existingUnis[0].id;

      await conn.execute(
        `UPDATE universities SET name=?, full_name=?, country='India', state=?, city=?, address=?, pincode=?, establish=?, rating=?, heading=?, show_apply_button=1, apply_button_text='Apply for Admission', view_button_text='Explore Programs', show_similar_universities=1, position=?, updated_at=? WHERE document_id=?`,
        [
          uni.name,
          uni.fullName,
          uni.state,
          uni.city,
          uni.address,
          uni.pincode,
          uni.establish,
          uni.rating,
          uni.heading,
          uni.position || 20,
          now,
          targetDocId,
        ]
      );
      console.log(`✏️ Updated existing university in DB (docId: ${targetDocId})`);
    }

    // Link Approvals to both rows
    for (const uniId of [draftUniId, publishedUniId]) {
      if (!uniId) continue;
      await conn.execute('DELETE FROM universities_approvals_lnk WHERE university_id = ?', [uniId]);
      for (const item of approvalIds) {
        await conn.execute(
          'INSERT INTO universities_approvals_lnk (university_id, approval_id, approval_ord) VALUES (?, ?, ?)',
          [uniId, item.id, item.ord]
        );
      }
      await conn.execute('DELETE FROM universities_streams_lnk WHERE university_id = ?', [uniId]);
      for (const item of streamIds) {
        await conn.execute(
          'INSERT INTO universities_streams_lnk (university_id, stream_id, stream_ord) VALUES (?, ?, ?)',
          [uniId, item.id, item.ord]
        );
      }
    }

    // Insert SEO for University
    const [seoRes] = await conn.execute(
      'INSERT INTO components_shared_seos (meta_title, meta_description) VALUES (?, ?)',
      [uni.seo.metaTitle, uni.seo.metaDescription]
    );
    const uniSeoCmpId = seoRes.insertId;

    // Insert Highlights for University
    const hlCmpIds = [];
    for (let ord = 0; ord < uni.highlights.length; ord++) {
      const hl = uni.highlights[ord];
      const [hlRes] = await conn.execute(
        'INSERT INTO components_home_highlights (`key`, `value`) VALUES (?, ?)',
        [hl.key, hl.value]
      );
      hlCmpIds.push({ id: hlRes.insertId, ord: ord + 1 });
    }

    for (const uniId of [draftUniId, publishedUniId]) {
      if (!uniId) continue;
      await conn.execute('DELETE FROM universities_cmps WHERE entity_id = ?', [uniId]);
      // Link SEO
      await conn.execute(
        'INSERT INTO universities_cmps (entity_id, cmp_id, component_type, field, `order`) VALUES (?, ?, ?, ?, NULL)',
        [uniId, uniSeoCmpId, 'shared.seo', 'seo']
      );
      // Link Highlights
      for (const hl of hlCmpIds) {
        await conn.execute(
          'INSERT INTO universities_cmps (entity_id, cmp_id, component_type, field, `order`) VALUES (?, ?, ?, ?, ?)',
          [uniId, hl.id, 'home.highlights', 'highlights', hl.ord]
        );
      }
    }

    // Process all 6 Tabs
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

    let tabOrd = 1;
    for (const tab of tabs) {
      const filePath = path.join(uniDraftDir, tab.fileName);
      const mdContent = fs.readFileSync(filePath, 'utf8');
      const richTextBlocks = markdownToStrapiBlocks(mdContent);

      // 1. Create Rich Text Component
      const [rtRes] = await conn.execute(
        'INSERT INTO components_common_rich_texts (heading, body) VALUES (NULL, ?)',
        [JSON.stringify(richTextBlocks)]
      );
      const rtCmpId = rtRes.insertId;

      // 2. Create Section SEO Component
      const [secSeoRes] = await conn.execute(
        'INSERT INTO components_shared_seos (meta_title, meta_description) VALUES (?, ?)',
        [tab.seo.metaTitle, tab.seo.metaDescription]
      );
      const secSeoCmpId = secSeoRes.insertId;

      // Optional Fee Structure Component
      let feeCmpId = null;
      if (tab.isFeeTab) {
        const feeDesc = [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: `Explore all UGC-DEB entitled online undergraduate, postgraduate, and professional degree fee schedules below for ${uni.name}.`,
              },
            ],
          },
        ];
        const [feeRes] = await conn.execute(
          'INSERT INTO components_college_fee_structures (name, description, show_program_table) VALUES (?, ?, 1)',
          [`${uni.name} Fee Structure`, JSON.stringify(feeDesc)]
        );
        feeCmpId = feeRes.insertId;
      }

      // Optional FAQ Section Component
      let faqSectionCmpId = null;
      if (tab.isFaqTab) {
        const faqs = extractFaqsFromMarkdown(mdContent);
        if (faqs.length > 0) {
          const [faqSecRes] = await conn.execute('INSERT INTO components_college_faq_sections () VALUES ()');
          faqSectionCmpId = faqSecRes.insertId;

          for (let fOrd = 0; fOrd < faqs.length; fOrd++) {
            const f = faqs[fOrd];
            const [fRes] = await conn.execute(
              'INSERT INTO components_common_faqs (title, description) VALUES (?, ?)',
              [f.title, JSON.stringify(f.description)]
            );
            await conn.execute(
              'INSERT INTO components_college_faq_sections_cmps (entity_id, cmp_id, component_type, field, `order`) VALUES (?, ?, ?, ?, ?)',
              [faqSectionCmpId, fRes.insertId, 'common.faqs', 'faqs', fOrd + 1]
            );
          }
        }
      }

      // Check / Create University Content section in DB
      const [existingSecs] = await conn.execute(
        'SELECT id, document_id, published_at FROM university_contents WHERE slug = ?',
        [tab.slug]
      );

      let secDocId = existingSecs.length > 0 ? existingSecs[0].document_id : genDocId();
      let draftSecId, pubSecId;

      if (existingSecs.length === 0) {
        // Draft row
        const [drfRes] = await conn.execute(
          'INSERT INTO university_contents (document_id, name, display_name, slug, secondary_slug, heading, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)',
          [secDocId, tab.name, tab.display_name, tab.slug, tab.secondary_slug, tab.heading, now, now]
        );
        draftSecId = drfRes.insertId;

        // Published row
        const [pRes] = await conn.execute(
          'INSERT INTO university_contents (document_id, name, display_name, slug, secondary_slug, heading, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [secDocId, tab.name, tab.display_name, tab.slug, tab.secondary_slug, tab.heading, now, now, now]
        );
        pubSecId = pRes.insertId;
      } else {
        const pub = existingSecs.find(s => s.published_at !== null);
        const drf = existingSecs.find(s => s.published_at === null);
        pubSecId = pub ? pub.id : existingSecs[0].id;
        draftSecId = drf ? drf.id : existingSecs[0].id;

        await conn.execute(
          'UPDATE university_contents SET name=?, display_name=?, heading=?, secondary_slug=?, updated_at=? WHERE document_id=?',
          [tab.name, tab.display_name, tab.heading, tab.secondary_slug, now, secDocId]
        );
      }

      // Link Components for Draft and Published versions
      for (const sId of [draftSecId, pubSecId]) {
        if (!sId) continue;
        await conn.execute('DELETE FROM university_contents_cmps WHERE entity_id = ?', [sId]);
        
        // Rich text
        await conn.execute(
          'INSERT INTO university_contents_cmps (entity_id, cmp_id, component_type, field, `order`) VALUES (?, ?, ?, ?, 1)',
          [sId, rtCmpId, 'common.rich-text', 'content']
        );

        // SEO
        await conn.execute(
          'INSERT INTO university_contents_cmps (entity_id, cmp_id, component_type, field, `order`) VALUES (?, ?, ?, ?, NULL)',
          [sId, secSeoCmpId, 'shared.seo', 'seo']
        );

        // Fee structure if present
        if (feeCmpId) {
          await conn.execute(
            'INSERT INTO university_contents_cmps (entity_id, cmp_id, component_type, field, `order`) VALUES (?, ?, ?, ?, 2)',
            [sId, feeCmpId, 'college.fee-structure', 'content']
          );
        }

        // FAQ section if present
        if (faqSectionCmpId) {
          await conn.execute(
            'INSERT INTO university_contents_cmps (entity_id, cmp_id, component_type, field, `order`) VALUES (?, ?, ?, ?, 2)',
            [sId, faqSectionCmpId, 'college.faq-section', 'content']
          );
        }
      }

      // Link section to University (draft to draft, published to published)
      if (draftSecId && draftUniId) {
        await conn.execute('DELETE FROM university_contents_university_lnk WHERE university_content_id = ?', [draftSecId]);
        await conn.execute(
          'INSERT INTO university_contents_university_lnk (university_content_id, university_id, university_content_ord) VALUES (?, ?, ?)',
          [draftSecId, draftUniId, tabOrd]
        );
      }
      if (pubSecId && publishedUniId) {
        await conn.execute('DELETE FROM university_contents_university_lnk WHERE university_content_id = ?', [pubSecId]);
        await conn.execute(
          'INSERT INTO university_contents_university_lnk (university_content_id, university_id, university_content_ord) VALUES (?, ?, ?)',
          [pubSecId, publishedUniId, tabOrd]
        );
      }

      console.log(`  ✓ Published section [${tab.name}] (${tab.slug})`);
      tabOrd++;
    }

    console.log(`🎉 SUCCESS: ${uni.name} and all 6 tabs published in CMS!`);
  }

  await conn.end();
  console.log(`\n======================================================`);
  console.log(`✨ ALL 16 ONLINE UNIVERSITIES PUBLISHED TO MYSQL & STRAPI!`);
  console.log(`======================================================\n`);
}

run().catch((err) => {
  console.error('❌ Fatal execution error:', err);
  process.exit(1);
});
