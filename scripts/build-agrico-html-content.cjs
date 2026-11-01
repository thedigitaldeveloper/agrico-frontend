/* Render the same React body used by the frontend into the existing CMS editor. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const postcss = require('postcss');
const root = path.resolve(__dirname, '..');
const base = path.join(root, 'docs/content/universities-2026-10-30');
const data = JSON.parse(fs.readFileSync(path.join(base, 'publication.json'), 'utf8'));
const oldTs = Module._extensions['.ts'], oldTsx = Module._extensions['.tsx'];
const compile = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true } }).outputText, filename);
Module._extensions['.ts'] = compile; Module._extensions['.tsx'] = compile;
const { AgricoPublicationContent } = require(path.join(root, 'src/components/agrico/publication-body.tsx'));
const styles = postcss.parse(fs.readFileSync(path.join(root, 'src/components/agrico/publication.css'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'src/components/agrico/detail.css'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'src/components/agrico/agrico.css'), 'utf8'));
styles.walkRules(rule => {
  const selectors = rule.selectors.filter(selector => /\.ag-publication-|\.ag-detail-faqs\b|\.ag-text-link\b|\.ag-eyebrow\b/.test(selector));
  if (selectors.length) rule.selectors = selectors; else rule.remove();
});
styles.walkAtRules(rule => { if (rule.nodes && !rule.nodes.length) rule.remove(); });
const css = '.ag-publication-body{font-family:var(--font-dm-sans,Arial,sans-serif);--font-display:var(--font-dm-sans,Arial,sans-serif);color:#183a31;min-width:0;max-width:100%;box-sizing:border-box}.ag-publication-body *{box-sizing:border-box}\n' + styles.toString();
const directory = path.join(base, 'html-content');
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'agrico-content.css'), css);
const records = [], posts = [], manifest = [], previewRecords = [];
for (const doc of [...data.institutions, ...data.university_tabs]) {
  const tab = doc.tab_slug || 'overview';
  const html = renderToStaticMarkup(React.createElement(AgricoPublicationContent, { doc })).replace(/<link\b[^>]*rel="preload"[^>]*>/g, '');
  const file = 'html-content/' + doc.slug + '/' + tab + '.html';
  fs.mkdirSync(path.dirname(path.join(base, file)), { recursive: true }); fs.writeFileSync(path.join(base, file), html + '\n');
  const position = (doc.tabs || []).findIndex(item => item.id === tab);
  const fields = { name: doc.title, slug: doc.slug + '--' + tab, secondary_slug: tab, display_name: doc.tab_label || 'Overview', heading: doc.title, position: position < 0 ? 0 : position, seo: { metaTitle: doc.meta_title, metaDescription: doc.description, metaRobots: doc.indexing?.index === false ? 'noindex,follow' : 'index,follow' }, content: [{ __component: 'common.html-section', name: 'Agrico · ' + (doc.tab_label || 'Overview'), code: { html, css } }] };
  records.push({ matching_key: { university_slug: doc.slug, secondary_slug: tab }, university_lookup: { slug: doc.slug }, path: doc.path, fields });
  previewRecords.push({ path: doc.path, university_slug: doc.slug, title: doc.title, label: doc.tab_label || 'Overview', position: fields.position, html });
  manifest.push({ university_slug: doc.slug, tab, position: fields.position, path: doc.path, html_file: file, css_file: 'html-content/agrico-content.css', headings: doc.sections.map(section => ({ id: section.id, heading: section.heading })), deferred_from_indexing: doc.indexing?.index === false });
}
for (const doc of data.posts) {
  const html = renderToStaticMarkup(React.createElement(AgricoPublicationContent, { doc })).replace(/<link\b[^>]*rel="preload"[^>]*>/g, '');
  fs.mkdirSync(path.join(directory, 'editorial'), { recursive: true }); fs.writeFileSync(path.join(directory, 'editorial', doc.slug + '.html'), html + '\n');
  posts.push({ matching_key: { slug: doc.slug }, path: doc.path, fields: { body_html: { name: 'Agrico · ' + doc.kind, code: { html, css } } } });
  previewRecords.push({ path: doc.path, university_slug: 'editorial/' + doc.slug, title: doc.title, label: doc.kind, position: 0, html });
}
Module._extensions['.ts'] = oldTs; Module._extensions['.tsx'] = oldTsx;
fs.writeFileSync(path.join(base, 'cms-html-content-import-plan.json'), JSON.stringify({ checked_on: '2026-10-31', status: 'prepared_not_imported', collection: 'api::university-content.university-content', editor_component: 'common.html-section', editor_field: 'code', matching_rule: 'Resolve University documentId by slug, then upsert its Content Section by university relation + secondary_slug. Never match a tab by secondary_slug alone across all institutions.', sequence_rule: 'Overview position0 then10tabs position1–10. HTML heading order and TOC follow the written document; each tab uses one HTML/CSS component, within the CMS maximum12components.', renderer_rule: 'Header, H1, university tab bar and functional enquiry stay in the frontend. The HTML field contains only the tab body; CSS is scoped by the existing HTML/CSS Section renderer. Structured publication JSON remains the research/metadata fallback, not the text editor.', publishing_rule: 'Draft import only unless a later import explicitly publishes. Preserve noindex decisions and actual Agrico publication dates.', media_rule: 'Retain local public assets on this frontend, or upload source assets and replace both direct and encoded /_next/image source URLs and srcset values with the correct provider URLs. Do not leave this host’s optimizer paths pointing at another host’s missing assets.', records, posts, editorial_field: 'Blog.body_html (same common.html-section component)' }, null, 2) + '\n');
fs.writeFileSync(path.join(base, 'html-content/manifest.json'), JSON.stringify({ checked_on: '2026-10-31', records: manifest }, null, 2) + '\n');
fs.copyFileSync(path.join(root, 'src/app/fonts/dm-sans-latin.woff2'), path.join(directory, 'dm-sans-latin.woff2'));
fs.copyFileSync(path.join(root, 'src/app/fonts/OFL.txt'), path.join(directory, 'OFL.txt'));
const template = fs.readFileSync(path.join(base, 'cms-html-preview-template.html'), 'utf8');
fs.writeFileSync(path.join(base, 'cms-html-preview.html'), template.replace('/*CMS_HTML_DATA*/', 'const DATA=' + JSON.stringify({ css, records: previewRecords, known_paths: [...data.institutions, ...data.university_tabs, ...data.posts, ...data.states].map(doc => doc.path) }).replace(/</g, '\\u003c') + ';'));
console.log(JSON.stringify({ html_bodies: records.length + posts.length, university_bodies: records.length, editorial_bodies: posts.length, institutions: data.institutions.length, tabs_per_institution: 11, css_bytes: Buffer.byteLength(css), import_file: 'cms-html-content-import-plan.json' }, null, 2));
