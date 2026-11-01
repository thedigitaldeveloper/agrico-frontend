const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const qs = require('qs');

function load(file, dependencies, globals = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.join(process.cwd(), file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const compiled = { exports: {} };
  vm.runInNewContext(output, { module: compiled, exports: compiled.exports, require: name => name in dependencies ? dependencies[name] : require(name), URL, URLSearchParams, Request, Response, ReadableStream, TextEncoder, AbortSignal, Date, console, ...globals }, { filename: file });
  return compiled.exports;
}

async function main() {
  const helper = load('src/lib/leads-query.ts', {});
  const invalid = helper.parseLeadsQuery({ page: '-1', pageSize: '500', source: '$bad', sort: 'invalid', date: 'forever', q: '  hello  ' });
  assert.equal(invalid.page, 1); assert.equal(invalid.pageSize, 25); assert.equal(invalid.source, 'all'); assert.equal(invalid.q, 'hello');
  assert.equal(helper.leadWhatsApp('+91 98765 43210'), 'https://wa.me/919876543210');
  assert.equal(helper.leadWhatsApp('9876543210'), 'https://wa.me/919876543210');
  assert.equal(helper.leadWhatsApp('+44 7911 123456'), 'https://wa.me/447911123456');
  assert.equal(helper.csvCell('=SUM(1,2)'), '"\'=SUM(1,2)"');
  assert.equal(helper.csvCell('a"b'), '"a""b"');
  const filters = helper.leadFilters(helper.parseLeadsQuery({ source: 'registration', q: 'MBA', date: 'week' }), new Date('2026-10-27T00:00:00Z'));
  assert.ok(JSON.stringify(filters).includes('[STUDENT REGISTRATION]'));
  assert.ok(JSON.stringify(filters).includes('2026-10-20T00:00:00.000Z'));
  let calls = [];
  const all = Array.from({ length: 275 }, (_, index) => ({ id: index + 1, name: index === 0 ? '=1+1' : `Fixture ${index + 1}`, email: 'fixture@example.test', phone: '+919876543210', source: 'contact', status: 'new', createdAt: '2026-10-26T00:00:00Z', program: { name: 'MBA' }, university: { name: 'Fixture University' } }));
  const fetchMock = async input => {
    const query = qs.parse(new URL(input).search.slice(1)); calls.push(query);
    const page = Number(query.pagination.page), size = Number(query.pagination.pageSize);
    assert.ok(size <= 100, 'CMS maxLimit respected');
    let total = 275;
    if (query.filters?.status) total = 30;
    else if (JSON.stringify(query.filters || {}).includes('[STUDENT REGISTRATION]')) total = 11;
    else if (JSON.stringify(query.filters || {}).includes('application-form')) total = 90;
    const data = all.slice((page - 1) * size, Math.min(page * size, total));
    return Response.json({ data, meta: { pagination: { page, pageSize: size, total, pageCount: Math.ceil(total / size) } } });
  };
  const repository = load('src/lib/cms/repositories/enquiry.ts', { 'server-only': {}, '@/lib/env': { CMS_INTERNAL_URL: 'http://fixture.test', CMS_API_TOKEN: 'fixture-token' }, '@/lib/leads-query': helper }, { fetch: fetchMock });
  const third = await repository.getAdminLeads({ page: 3, pageSize: 100 });
  assert.equal(third.data.length, 75); assert.equal(third.data[0].id, 201); assert.equal(third.total, 275);
  assert.equal(third.data[0].program, 'MBA');
  const summary = await repository.getAdminLeadSummary();
  assert.equal(summary.total, 275); assert.equal(summary.applications, 90); assert.equal(summary.registration, 11); assert.equal(summary.new, 30);
  const deniedRepo = load('src/lib/cms/repositories/enquiry.ts', { 'server-only': {}, '@/lib/env': { CMS_INTERNAL_URL: 'http://fixture.test', CMS_API_TOKEN: '' }, '@/lib/leads-query': helper }, { fetch: () => { throw Error('Must not fetch'); } });
  await assert.rejects(deniedRepo.getAdminLeads(), /CMS API token/);
  calls = [];
  let authorized = true;
  const route = load('src/app/dashboard/leads/export/route.ts', { '@/lib/auth/admin': { requireAdmin: async () => { if (!authorized) throw Error('denied'); } }, '@/lib/cms/repositories/enquiry': repository, '@/lib/leads-query': helper });
  const response = await route.GET(new Request('http://fixture.test/dashboard/leads/export?source=contact&date=week'));
  const csv = await response.text();
  assert.equal(csv.trim().split('\r\n').length, 276, 'all 275 records exported');
  assert.ok(csv.includes('"\'=1+1"'), 'formula injection neutralised');
  assert.equal(calls.length, 3); assert.equal(calls[2].pagination.page, '3');
  assert.equal(JSON.stringify(calls[0].filters), JSON.stringify(calls[2].filters), 'stable cutoff and filters on every export page');
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  const beforeDenied = calls.length; authorized = false;
  await assert.rejects(route.GET(new Request('http://fixture.test/dashboard/leads/export')), /denied/);
  assert.equal(calls.length, beforeDenied, 'authorization checked before any lead read');
  console.log('PASS leads: pagination beyond 100, collection totals, registration marker, filters, complete CSV, formula safety, authorization and WhatsApp country codes. No CMS data modified.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
