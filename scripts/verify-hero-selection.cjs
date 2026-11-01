// Pure fixture checks: no browser, CMS requests or catalogue mutations.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const file = path.resolve(__dirname, '../src/components/rs/hero-selection.ts');
const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  fileName: file,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const fixtureModule = { exports: {} };
new vm.Script(compiled.outputText, { filename: file }).runInNewContext({ module: fixtureModule, exports: fixtureModule.exports });
const { heroSelection } = fixtureModule.exports;
const one = { id: 'university-one-mba', courseSlug: 'mba', programSlug: 'mba-one', degree: 'Online MBA' };
const two = { id: 'university-two-bba', courseSlug: 'bba', programSlug: 'bba-two', degree: 'Online BBA' };
const anotherMba = { id: 'university-three-mba', courseSlug: 'mba', programSlug: 'mba-three', degree: 'Online MBA' };
const offerings = [one, two, anotherMba];
const catalogue = [...offerings, { id: 'campaign-only-mca', courseSlug: 'mca', programSlug: 'mca-four', degree: 'Online MCA' }];
const select = (slide, choice = '') => heroSelection({ offerings, catalogue, slide, choice });

let view = select({ offeringId: two.id });
assert.equal(view.featured.id, two.id, 'Active CMS slide replaces the first shelf programme');
assert.equal(view.activeChoiceKey, 'course:bba', 'The highlighted programme agrees with the card');
assert.deepEqual(Array.from(view.choices, item => item.key), ['course:mba', 'course:bba'], 'CMS order is retained without duplicate programme tabs');
assert.equal(view.choices[0].offering.id, one.id, 'Duplicate degrees keep the first authored university');
view = select({ offeringId: anotherMba.id });
assert.equal(view.featured.id, anotherMba.id, 'The exact university pair on the slide wins, even for a duplicate degree');
view = select({ offeringId: two.id }, 'course:mba');
assert.equal(view.featured.id, one.id, 'An explicit student choice takes precedence over the active slide');
assert.equal(select({ offeringId: anotherMba.id }, 'course:bba').featured.id, two.id, 'Changing slides does not discard the student choice');
assert.equal(select({ offeringId: 'campaign-only-mca' }).featured.id, 'campaign-only-mca', 'A CMS slide may explicitly promote a published catalogue offering outside the shelf');
assert.equal(select({ offeringId: 'unpublished-pair' }).featured, undefined, 'A missing selected pair never becomes an unrelated product');
assert.equal(select({}).featured.id, one.id, 'An unconfigured slide retains the first curated product');
assert.equal(select({ offeringId: two.id }, 'course:removed').featured.id, two.id, 'A stale programme choice falls back to the current CMS slide');
assert.equal(heroSelection({ offerings: [], catalogue, slide: {}, choice: '' }).featured, undefined, 'Empty selections do not invent a first catalogue product');
console.log('Hero selection: CMS slide pairs, student override, tab state, authored order and empty/unpublished cases passed.');
