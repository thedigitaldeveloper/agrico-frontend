const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const directory = path.resolve(__dirname, '../docs/content/universities-2026-10-30/seo');
fs.mkdirSync(directory, { recursive: true });
const base = 'https://www.merishiksha.org/university/rnb-global-university';
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const result = { checked_on: '2026-10-30', source: base, pages: [] };
  try {
    for (const url of [base, base + '/admission-process', base + '/course-and-fee', base + '/news-and-notifications', 'https://www.merishiksha.org/articles/rnb-bscc-eligibility']) {
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(1500);
        const details = await page.evaluate(() => {
          const main = document.querySelector('main') || document.querySelector('article') || document.body;
          const links = [...main.querySelectorAll('a[href]')].map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim() }));
          const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(node => { try { return JSON.parse(node.textContent); } catch { return []; } });
          const types = new Set();
          function walk(value) { if (!value || typeof value !== 'object') return; if (value['@type']) for (const type of [].concat(value['@type'])) types.add(type); for (const item of Object.values(value)) if (typeof item === 'object') Array.isArray(item) ? item.forEach(walk) : walk(item); }
          schemas.forEach(walk);
          const unique = values => [...new Set(values)];
          return {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content || null,
            canonical: document.querySelector('link[rel="canonical"]')?.href || null,
            robots: document.querySelector('meta[name="robots"]')?.content || null,
            h1_count: document.querySelectorAll('h1').length,
            main_heading: main.querySelector('h1')?.textContent.trim() || null,
            section_labels: [...main.querySelectorAll('h2[id],h3[id]')].map(h => ({ id: h.id, label: h.textContent.trim().replace(/^RNB Global University\s*[–—-]?\s*/i, '') })),
            table_count: main.querySelectorAll('table').length,
            toc_anchors: links.filter(a => a.href.startsWith('#')).map(a => ({ href: a.href, target_exists: !!document.getElementById(a.href.slice(1)) })),
            institution_sections: unique(links.filter(a => a.href.startsWith('/university/rnb-global-university')).map(a => a.href)),
            related_article_urls: unique(links.filter(a => /^\/(?:articles|blogs|news)\//.test(a.href)).map(a => a.href)),
            programme_urls: unique(links.filter(a => /^\/(?:program|programs|course|courses)\//.test(a.href)).map(a => a.href)),
            other_university_urls: unique(links.filter(a => a.href.startsWith('/university/') && !a.href.includes('rnb-global-university')).map(a => a.href)),
            total_main_links: links.length,
            schema_types: [...types],
            enquiry_form_count: main.querySelectorAll('form').length,
            text_word_count: (main.innerText || '').trim().split(/\s+/).filter(Boolean).length,
          };
        });
        result.pages.push({ url, resolved_url: page.url(), status: response.status(), ...details });
      } catch (error) { result.pages.push({ url, error: error.message }); }
    }
    fs.writeFileSync(path.join(directory, 'reference-structure-audit.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result.pages.map(row => ({ url: row.url, status: row.status, h1: row.h1_count, tables: row.table_count, toc_links: row.toc_anchors?.length, sections: row.institution_sections?.length, article_urls: row.related_article_urls?.length, schemas: row.schema_types, error: row.error })), null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
