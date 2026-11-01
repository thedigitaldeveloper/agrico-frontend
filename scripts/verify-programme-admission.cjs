// Actual component/fee helpers in a VM, real React server rendering, mocked UI context/state.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs/design/qa/programme-admission');
const sourcePaths = ['src/components/program/program-admission-sidebar.tsx', 'src/components/program/program-facts.ts', 'src/lib/format.ts'];
const sources = Object.fromEntries(sourcePaths.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const sourceHashes = Object.fromEntries(sourcePaths.map(file => [file, crypto.createHash('sha256').update(sources[file]).digest('hex')]));
const state = { selected: '', modalCalls: [] };
function load(file, dependencies) {
  const compiled = ts.transpileModule(sources[file], { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true });
  assert.equal(compiled.diagnostics?.length ?? 0, 0, file + ' transpiles');
  const fixtureModule = { exports: {} };
  new vm.Script(compiled.outputText, { filename: file }).runInNewContext({ module: fixtureModule, exports: fixtureModule.exports, require(name) {
    assert(Object.hasOwn(dependencies, name), 'Unexpected dependency: ' + name);
    return dependencies[name];
  } });
  return fixtureModule.exports;
}
const format = load(sourcePaths[2], {});
const facts = load(sourcePaths[1], { '@/lib/format': format });
const { ProgramAdmissionSidebar } = load(sourcePaths[0], {
  react: { ...React, useState: () => [state.selected, value => { state.selected = value; }] },
  'react/jsx-runtime': require('react/jsx-runtime'),
  'lucide-react': require('lucide-react'),
  '@/components/university/university-enquiry-modal': { useEnquiryModal: () => ({ openModal: context => state.modalCalls.push(JSON.parse(JSON.stringify(context))) }) },
  '@/components/providers/site-settings-provider': { useSiteSettings: () => ({ whatsappNumber: '' }) },
  '@/lib/cms/media': { mediaUrl: url => url || null },
  '@/lib/format': format,
  './program-facts': facts,
});
const optedOut = { documentId: 'uni-no-apply', slug: 'university-opted-out', name: 'Fixture University Without Applications', show_apply_button: false };
const enabled = { documentId: 'uni-enabled', slug: 'university-enabled', name: 'Fixture University With Applications', show_apply_button: true };
const program = {
  documentId: 'programme-fixture', slug: 'fixture-mba', name: 'MBA', full_name: 'Fixture Master of Business Administration',
  fee: 90000, show_apply_button: true, apply_button_text: 'Apply to this programme',
  universities: [optedOut, enabled],
  program_offerings: [{ university: optedOut, fee: null, subsidy_amount: null }, { university: enabled, fee: 150000, subsidy_amount: null }],
  eligibilities: [], brochure: null, syllabus: null,
};
function nodes(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(item => nodes(item, predicate));
  if (!React.isValidElement(node)) return [];
  return [...(predicate(node) ? [node] : []), ...nodes(node.props.children, predicate)];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join('');
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  return React.isValidElement(node) ? text(node.props.children) : '';
}
function render(data = program) {
  const tree = ProgramAdmissionSidebar({ program: data });
  const html = renderToStaticMarkup(tree);
  const buttons = nodes(tree, node => node.type === 'button');
  const application = buttons.find(button => text(button) === 'Apply to this programme');
  const counselling = buttons.find(button => text(button) === 'Talk to a counsellor');
  const fee = nodes(tree, node => node.props.className === 'rs-pd-admission-fee')[0];
  assert(counselling, 'Counselling remains available');
  assert(html.includes('Programme admission guidance'), 'The real component server-renders');
  return { tree, html, application, counselling, feeText: text(fee) };
}
function modalContext(source, university) {
  const actual = state.modalCalls.at(-1);
  assert.equal(actual.source, source);
  assert.equal(actual.programSlug, program.slug);
  assert.equal(actual.programName, program.full_name);
  assert.equal(actual.universitySlug, university.slug);
  assert.equal(actual.universityName, university.name);
  assert.equal(actual.subtitle, program.full_name + ' at ' + university.name);
  return actual;
}
const results = [];
function check(name, run) { state.selected = ''; state.modalCalls = []; results.push({ name, status: 'passed', ...run() }); }
try {
  check('Selected university opt-out hides application and preserves exact counselling context', () => {
    state.selected = optedOut.slug;
    const view = render();
    assert.equal(view.application, undefined);
    assert(!view.html.includes('Apply to this programme'));
    view.counselling.props.onClick();
    return { applicationHidden: true, counsellingContext: modalContext('counselling', optedOut) };
  });
  check('Selecting an enabled university uses the actual select handler and exact application pair', () => {
    let view = render();
    const select = nodes(view.tree, node => node.type === 'select')[0];
    select.props.onChange({ target: { value: enabled.slug } });
    view = render();
    assert(view.application, 'Enabled selected university shows application');
    assert(view.html.includes('value="' + enabled.slug + '" selected=""'), 'Selection server-renders as the chosen university');
    view.application.props.onClick();
    assert.equal(state.modalCalls.length, 1);
    return { applicationContext: modalContext('application-form', enabled) };
  });
  check('Unpriced selected university cannot inherit another university fee or programme base fee', () => {
    state.selected = optedOut.slug;
    const view = render();
    assert.match(view.feeText, /Request current fees/);
    assert(!view.feeText.includes(format.formatFee(program.fee)));
    assert(!view.feeText.includes(format.formatFee(150000)));
    assert(!view.feeText.includes('Programme base fee'));
    return { feeText: view.feeText };
  });
  check('Selected priced university receives only its attached offering fee', () => {
    state.selected = enabled.slug;
    const view = render();
    assert.equal(view.feeText, 'Published programme fee' + format.formatFee(150000));
    assert(!view.feeText.includes(format.formatFee(program.fee)));
    return { feeText: view.feeText };
  });
  check('Unselected programme may display its base fee with university-specific qualification', () => {
    const view = render({ ...program, program_offerings: [{ university: optedOut, fee: null }, { university: enabled, fee: null }] });
    assert.equal(view.feeText, 'Programme base fee — university-specific fees may differ' + format.formatFee(program.fee));
    assert(view.application, 'General programme application remains available before selecting a university');
    return { feeText: view.feeText };
  });
  check('Single implicit university honours its opt-out without displaying a selector', () => {
    const view = render({ ...program, universities: [optedOut], program_offerings: [{ university: optedOut, fee: null }] });
    assert.equal(nodes(view.tree, node => node.type === 'select').length, 0);
    assert.equal(view.application, undefined);
    assert.match(view.feeText, /Request current fees/);
    view.counselling.props.onClick();
    return { counsellingContext: modalContext('counselling', optedOut) };
  });
  check('Programme opt-out also hides application for an enabled university', () => {
    state.selected = enabled.slug;
    const view = render({ ...program, show_apply_button: false });
    assert.equal(view.application, undefined);
    return { applicationHidden: true, counsellingAvailable: Boolean(view.counselling) };
  });
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify({ date: new Date().toISOString(), fixture: 'Actual ProgramAdmissionSidebar, program-facts and format helpers transpiled into VM; real React server-rendered output; controlled state and enquiry/site context mocks; actual event handlers invoked; no app server, submission or CMS writes', sourceHashes, tests: results.length, results, errors: [] }, null, 2));
  console.log('Programme admission: ' + results.length + ' scenarios passed; application visibility, exact pair modal context and fee boundaries verified.');
} catch (error) {
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({ date: new Date().toISOString(), sourceHashes, results, error: String(error), stack: error.stack }, null, 2));
  console.error(error); process.exitCode = 1;
}
