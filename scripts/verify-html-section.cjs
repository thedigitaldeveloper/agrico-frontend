const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Load the actual pure compiler without starting Next or changing CMS content.
const filename = path.resolve('src/components/cms/html-section-code.ts');
const fixture = new Module(filename);
fixture.filename = filename;
fixture.paths = Module._nodeModulePaths(process.cwd());
fixture._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { sanitizeSectionMarkup, scopeSectionCss, htmlSectionScopeId } = fixture.exports;

const fullDocument = '<!doctype html><html class="light"><head><title>Editor title</title><script>evil()</script><style>body{color:pink}</style></head><body class="page"><section class="card"><h2>Fees</h2><table><colgroup><col span="2"></colgroup><tr><th colspan="2" scope="col">Cost</th><td rowspan="2">100</td></tr></table></section></body></html>';
const markup = sanitizeSectionMarkup(fullDocument);
assert.match(markup, /data-rs-html-root="true" class="light"/);
assert.match(markup, /data-rs-html-body="true" class="page"/);
assert.match(markup, /colspan="2"/);
assert.match(markup, /rowspan="2"/);
assert.match(markup, /scope="col"/);
assert.match(markup, /<col span="2"/);
assert.doesNotMatch(markup, /evil|Editor title|color:pink|<head|<script|<style/);

const controls = sanitizeSectionMarkup('<form action="https://attacker.example" method="post"><label for="email">Email</label><input id="email" name="secret" type="email" placeholder="Email" onfocus="evil()"><textarea rows="4">Notes</textarea><select><option selected>Online</option></select><button formaction="/api/delete" onclick="evil()">Send</button></form>');
assert.match(controls, /data-rs-static-form="true"/);
assert.match(controls, /<label for="email">/);
assert.match(controls, /<input[^>]*disabled/);
assert.match(controls, /<textarea[^>]*disabled/);
assert.match(controls, /<select[^>]*disabled/);
assert.match(controls, /<button[^>]*type="button"[^>]*disabled/);
assert.doesNotMatch(controls, /<form|action=|method=|formaction=|onfocus=|onclick=|name="secret"/);

const malicious = sanitizeSectionMarkup('<a href="javascript:alert(1)" target="_blank">Bad</a><img src="https://cdn.example/image.png" onerror="alert(1)"><iframe src="https://evil.example">bad</iframe><object>bad</object><svg onload="evil()"><script>evil()</script></svg>');
assert.doesNotMatch(malicious, /javascript:|onerror|onload|<iframe|<object|<svg|<script|evil\(\)/);
assert.match(malicious, /rel="noopener noreferrer"/);

const scope = htmlSectionScopeId(1, fullDocument, '');
const css = scopeSectionCss('html body.page .card, :root .card {animation: fade 1s ease, slide 2s}@media(max-width:600px){body .card{display:block}}@keyframes fade{from{opacity:0}to{opacity:1}}@-webkit-keyframes slide{to{transform:translateX(0)}}@import "https://evil.example/x.css";@font-face{font-family:global;src:url(x)}', scope);
assert.match(css, new RegExp(scope + '"\\] \\[data-rs-html-root\\] \\[data-rs-html-body\\]\\.page \\.card'));
assert.match(css, /@media\(max-width:600px\)/);
assert.match(css, new RegExp('@keyframes ' + scope + '-fade'));
assert.match(css, new RegExp('animation: ' + scope + '-fade 1s ease, ' + scope + '-slide 2s'));
assert.doesNotMatch(css, /@import|@font-face|evil\.example/);
const otherCss = scopeSectionCss('@keyframes fade{to{opacity:1}}.card{animation-name:fade}', 'other-block');
assert.match(otherCss, /@keyframes other-block-fade/);
assert.doesNotMatch(otherCss, new RegExp(scope + '-fade'));
assert.equal(scopeSectionCss('.broken {', scope), '');
const nested = scopeSectionCss('.card{color:red;&:hover{color:blue}}', scope);
assert.match(nested, /&:hover/);
assert.equal((nested.match(/data-rs-html-section/g) || []).length, 1);

console.log('HTML/CSS fixtures passed: full documents, safe controls, tables, unsafe markup, scoped selectors, media, animation isolation, nested and malformed CSS.');
