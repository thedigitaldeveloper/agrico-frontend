import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const mysql = require('D:/geduconnectbknd/node_modules/mysql2/promise');

import { predefinedProgramsData, generateProgramContent } from './data/programs/program-data-definition.mjs';

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
  if (!markdown || typeof markdown !== 'string') {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  }
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

    if (trimmed.startsWith('# ')) {
      flushList();
      blocks.push({
        type: 'heading',
        level: 1,
        children: parseInlines(trimmed.slice(2).trim()),
      });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push({
        type: 'heading',
        level: 2,
        children: parseInlines(trimmed.slice(3).trim()),
      });
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push({
        type: 'heading',
        level: 3,
        children: parseInlines(trimmed.slice(4).trim()),
      });
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      flushList();
      blocks.push({
        type: 'heading',
        level: 4,
        children: parseInlines(trimmed.slice(5).trim()),
      });
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.slice(2).trim();
      if (!currentList || currentList.format !== 'unordered') {
        flushList();
        currentList = { type: 'list', format: 'unordered', children: [] };
      }
      currentList.children.push({
        type: 'list-item',
        children: parseInlines(itemText),
      });
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const itemText = numMatch[2].trim();
      if (!currentList || currentList.format !== 'ordered') {
        flushList();
        currentList = { type: 'list', format: 'ordered', children: [] };
      }
      currentList.children.push({
        type: 'list-item',
        children: parseInlines(itemText),
      });
      continue;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const tableLines = [trimmed];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|') && lines[i + 1].trim().endsWith('|')) {
        i++;
        tableLines.push(lines[i].trim());
      }

      const cleanCells = (line) => {
        const raw = line.replace(/^\|/, '').replace(/\|$/, '');
        return raw.split('|').map(c => c.trim());
      };
      const isSep = (line) => /^\|?(\s*:?-+:?\s*\|?)+$/.test(line);

      let headerCells = [];
      let rowLines = [];
      if (tableLines.length >= 2 && isSep(tableLines[1])) {
        headerCells = cleanCells(tableLines[0]);
        rowLines = tableLines.slice(2);
      } else {
        headerCells = cleanCells(tableLines[0]);
        rowLines = tableLines.slice(1).filter(l => !isSep(l));
      }

      const headers = headerCells.map(h => ({
        type: 'table-cell',
        children: parseInlines(h),
      }));

      const rows = rowLines.map(line => {
        const cells = cleanCells(line);
        return cells.map(c => ({
          type: 'table-cell',
          children: parseInlines(c),
        }));
      });

      blocks.push({
        type: 'table',
        headers,
        rows,
      });
      continue;
    }

    flushList();
    blocks.push({
      type: 'paragraph',
      children: parseInlines(trimmed),
    });
  }

  flushList();
  return blocks;
}

async function run() {
  console.log('🚀 Starting Publication of Rich Content for All Online Programs...\n');

  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'geduconnect',
  });

  const now = new Date();

  // 1. Fetch all programs, courses, streams from DB
  const [dbPrograms] = await conn.execute(
    'SELECT id, document_id, name, slug, duration, fee, average_package, published_at FROM programs'
  );
  const [courses] = await conn.execute('SELECT id, name, slug FROM courses');
  const [streams] = await conn.execute('SELECT id, name, slug FROM streams');
  const [progCourseLinks] = await conn.execute('SELECT program_id, course_id FROM programs_course_lnk');
  const [progStreamLinks] = await conn.execute('SELECT program_id, stream_id FROM programs_stream_lnk');

  // Map distinct programs by document_id (unique programs)
  const uniqueProgramsMap = new Map();
  for (const p of dbPrograms) {
    if (!uniqueProgramsMap.has(p.slug)) {
      uniqueProgramsMap.set(p.slug, []);
    }
    uniqueProgramsMap.get(p.slug).push(p);
  }

  console.log(`Found ${uniqueProgramsMap.size} unique program specialisations in database.`);

  let processedCount = 0;

  for (const [slug, pRows] of uniqueProgramsMap) {
    const primaryP = pRows[0];
    const cLink = progCourseLinks.find(l => l.program_id === primaryP.id);
    const course = cLink ? courses.find(c => c.id === cLink.course_id) : null;
    const sLink = progStreamLinks.find(l => l.program_id === primaryP.id);
    const stream = sLink ? streams.find(s => s.id === sLink.stream_id) : null;

    // Check predefined or generate
    const predefined = predefinedProgramsData.find(p => p.slug === slug);
    const generated = generateProgramContent(primaryP, course, stream, null);
    const programData = predefined
      ? {
          ...generated,
          ...predefined,
          sections: {
            ...generated.sections,
            ...(predefined.sections || {}),
          },
        }
      : generated;

    console.log(`\n📘 [${++processedCount}/${uniqueProgramsMap.size}] Processing: ${programData.fullName} (${slug})`);

    // 1. Update program table fields
    for (const row of pRows) {
      await conn.execute(
        `UPDATE programs 
         SET full_name = ?, average_package = ?, duration_text = ?, short_description = ?, updated_at = ? 
         WHERE id = ?`,
        [
          programData.fullName,
          programData.averagePackage,
          `${programData.duration} Years`,
          JSON.stringify(markdownToStrapiBlocks(programData.sections.overview.slice(0, 300))),
          now,
          row.id,
        ]
      );
    }

    // 2. Publish Full Suite of 6 Content Tabs for this Program
    const contentSections = [
      {
        slug: 'overview',
        name: `${programData.name} Overview`,
        displayName: 'Overview',
        heading: `${programData.fullName}: Program Overview & UGC Entitlement`,
        position: 1,
        markdown: programData.sections.overview,
      },
      {
        slug: 'courses-fees',
        name: `${programData.name} Fees`,
        displayName: 'Fees & Top Colleges',
        heading: `${programData.fullName}: University Fees & EMI Comparison`,
        position: 2,
        markdown: programData.sections.coursesFees,
      },
      {
        slug: 'admission',
        name: `${programData.name} Admission`,
        displayName: 'Admission & Eligibility',
        heading: `${programData.fullName}: Eligibility Criteria & Admission Process`,
        position: 3,
        markdown: programData.sections.admission,
      },
      {
        slug: 'curriculum',
        name: `${programData.name} Curriculum`,
        displayName: 'Syllabus & Subjects',
        heading: `${programData.fullName}: Semester-Wise Syllabus & Electives`,
        position: 4,
        markdown: programData.sections.curriculum,
      },
      {
        slug: 'placements',
        name: `${programData.name} Placements`,
        displayName: 'Career & Placements',
        heading: `${programData.fullName}: Career Opportunities & Salary CTC`,
        position: 5,
        markdown: programData.sections.placements || programData.sections.careers,
      },
      {
        slug: 'faqs',
        name: `${programData.name} FAQs`,
        displayName: 'FAQs',
        heading: `${programData.fullName}: Frequently Asked Questions`,
        position: 6,
        markdown: programData.sections.faqsMarkdown || `# ${programData.name} FAQs\n\nFind verified answers to common questions about admissions, UGC validity, examinations, and career scope for ${programData.name}.`,
        isFaqTab: true,
      },
    ];

    for (let ord = 0; ord < contentSections.length; ord++) {
      const sec = contentSections[ord];
      const secDocId = genDocId();

      // Check existing content section for this program
      const [existingLnk] = await conn.execute(
        `SELECT uc.id, uc.document_id 
         FROM university_contents uc 
         JOIN university_contents_program_lnk l ON l.university_content_id = uc.id 
         WHERE l.program_id = ? AND uc.slug = ?`,
        [primaryP.id, sec.slug]
      );

      let contentSecId;
      if (existingLnk.length > 0) {
        contentSecId = existingLnk[0].id;
        // Update header & name
        await conn.execute(
          `UPDATE university_contents SET heading = ?, display_name = ?, name = ?, updated_at = ? WHERE id = ?`,
          [sec.heading, sec.displayName, sec.name, now, contentSecId]
        );
      } else {
        const [res] = await conn.execute(
          `INSERT INTO university_contents 
           (document_id, name, slug, heading, display_name, position, section_key, created_at, updated_at, published_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            secDocId,
            sec.name,
            sec.slug,
            sec.heading,
            sec.displayName,
            sec.position,
            sec.slug,
            now,
            now,
            now,
          ]
        );
        contentSecId = res.insertId;

        // Link to all program rows (draft & published)
        for (const row of pRows) {
          await conn.execute(
            `INSERT INTO university_contents_program_lnk (university_content_id, program_id, university_content_ord) 
             VALUES (?, ?, ?)`,
            [contentSecId, row.id, ord + 1]
          );
        }
      }

      // Convert markdown to rich text component
      const blocks = markdownToStrapiBlocks(sec.markdown);
      const [richRes] = await conn.execute(
        `INSERT INTO components_common_rich_texts (heading, body) VALUES (NULL, ?)`,
        [JSON.stringify(blocks)]
      );
      const richCmpId = richRes.insertId;

      // Link component to university_contents_cmps
      await conn.execute(
        `DELETE FROM university_contents_cmps WHERE entity_id = ?`,
        [contentSecId]
      );

      await conn.execute(
        `INSERT INTO university_contents_cmps (entity_id, cmp_id, component_type, field, \`order\`) 
         VALUES (?, ?, ?, ?, ?)`,
        [contentSecId, richCmpId, 'common.rich-text', 'content', 1]
      );

      // If Overview or FAQs section, also attach FAQs component
      if ((sec.slug === 'overview' || sec.slug === 'faqs') && programData.sections.faqs && programData.sections.faqs.length > 0) {
        const [faqSecRes] = await conn.execute(
          `INSERT INTO components_college_faq_sections () VALUES ()`
        );
        const faqSecId = faqSecRes.insertId;

        for (let fOrd = 0; fOrd < programData.sections.faqs.length; fOrd++) {
          const faq = programData.sections.faqs[fOrd];
          const faqBlocks = markdownToStrapiBlocks(faq.description);
          const [faqRes] = await conn.execute(
            `INSERT INTO components_common_faqs (title, description) VALUES (?, ?)`,
            [faq.title, JSON.stringify(faqBlocks)]
          );
          const faqId = faqRes.insertId;

          await conn.execute(
            `INSERT INTO components_college_faq_sections_cmps (entity_id, cmp_id, component_type, field, \`order\`) 
             VALUES (?, ?, ?, ?, ?)`,
            [faqSecId, faqId, 'common.faqs', 'faqs', fOrd + 1]
          );
        }

        await conn.execute(
          `INSERT INTO university_contents_cmps (entity_id, cmp_id, component_type, field, \`order\`) 
           VALUES (?, ?, ?, ?, ?)`,
          [contentSecId, faqSecId, 'college.faq-section', 'content', 2]
        );
      }
    }

    // 3. Link Eligibilities on program
    if (programData.eligibility && programData.eligibility.length > 0) {
      for (let eOrd = 0; eOrd < programData.eligibility.length; eOrd++) {
        const eligText = programData.eligibility[eOrd];
        const [existingElig] = await conn.execute(
          'SELECT id FROM eligibilities WHERE name = ?',
          [eligText]
        );
        let eligId;
        if (existingElig.length > 0) {
          eligId = existingElig[0].id;
        } else {
          const [eRes] = await conn.execute(
            'INSERT INTO eligibilities (document_id, name, slug, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?)',
            [genDocId(), eligText, `elig-${genDocId().slice(0, 8)}`, now, now, now]
          );
          eligId = eRes.insertId;
        }

        for (const row of pRows) {
          const [hasLnk] = await conn.execute(
            'SELECT id FROM programs_eligibilities_lnk WHERE program_id = ? AND eligibility_id = ?',
            [row.id, eligId]
          );
          if (hasLnk.length === 0) {
            await conn.execute(
              'INSERT INTO programs_eligibilities_lnk (program_id, eligibility_id, eligibility_ord) VALUES (?, ?, ?)',
              [row.id, eligId, eOrd + 1]
            );
          }
        }
      }
    }
  }

  console.log(`\n🎉 Successfully Published Rich Structured Content for All ${uniqueProgramsMap.size} Specialisations!`);
  await conn.end();
}

run().catch(console.error);
