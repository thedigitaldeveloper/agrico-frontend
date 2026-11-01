/** Recovery action regression checks. No HTTP requests or emails are sent. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const calls = [];
let cleared = 0;
let reply = { ok: true, status: 200 };
const context = {
  exports: {},
  require(name) {
    if (name === '@/lib/env') return { CMS_INTERNAL_URL: 'https://fixture.invalid' };
    if (name === './recovery') return {
      isPasswordResetCode: code => typeof code === 'string' && /^[a-f0-9]{128}$/i.test(code),
    };
    if (name === './session') return { clearSession: async () => { cleared += 1; } };
    throw new Error(`Unexpected import: ${name}`);
  },
  fetch: async (url, options) => {
    calls.push({ url, ...options });
    if (reply instanceof Error) throw reply;
    return reply;
  },
  AbortSignal,
};

vm.runInNewContext(ts.transpileModule(
  fs.readFileSync(path.join(root, 'src/lib/auth/recovery-actions.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText, context);

const actions = context.exports;
const idle = { status: 'idle', message: '' };
function form(values) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}

async function main() {
  let checks = 0;
  let result = await actions.requestPasswordReset(idle, form({ email: 'invalid' }));
  assert.equal(result.status, 'error');
  assert.equal(calls.length, 0);
  checks += 1;

  result = await actions.requestPasswordReset(idle, form({ email: 'student@fixture.invalid' }));
  assert.equal(result.status, 'success');
  const genericMessage = result.message;
  assert.equal(calls[0].url, 'https://fixture.invalid/api/auth/forgot-password');
  assert.equal(JSON.parse(calls[0].body).email, 'student@fixture.invalid');
  checks += 1;

  reply = { ok: false, status: 500 };
  result = await actions.requestPasswordReset(idle, form({ email: 'unknown@fixture.invalid' }));
  assert.equal(result.message, genericMessage);
  checks += 1;

  reply = { ok: false, status: 429 };
  result = await actions.requestPasswordReset(idle, form({ email: 'student@fixture.invalid' }));
  assert.equal(result.status, 'error');
  assert.match(result.message, /Too many/);
  checks += 1;

  reply = new Error('Fixture network error');
  result = await actions.requestPasswordReset(idle, form({ email: 'student@fixture.invalid' }));
  assert.equal(result.status, 'error');
  checks += 1;

  const before = calls.length;
  const code = 'a'.repeat(128);
  const passwords = { password: 'LongPassword123', passwordConfirmation: 'LongPassword123' };
  result = await actions.resetPassword('invalid', idle, form(passwords));
  assert.equal(result.status, 'error');
  assert.equal(calls.length, before);
  checks += 1;

  result = await actions.resetPassword(code, idle, form({ password: 'short', passwordConfirmation: 'short' }));
  assert.equal(result.invalid[0], 'password');
  assert.equal(calls.length, before);
  checks += 1;

  result = await actions.resetPassword(code, idle, form({ ...passwords, passwordConfirmation: 'DifferentPassword123' }));
  assert.equal(result.invalid[0], 'passwordConfirmation');
  assert.equal(calls.length, before);
  checks += 1;

  reply = { ok: false, status: 400 };
  result = await actions.resetPassword(code, idle, form(passwords));
  assert.equal(result.status, 'error');
  assert.equal(cleared, 0);
  checks += 1;

  reply = { ok: true, status: 200 };
  result = await actions.resetPassword(code, idle, form(passwords));
  assert.equal(result.status, 'success');
  assert.equal(cleared, 1);
  assert.deepEqual(JSON.parse(calls.at(-1).body), { code, ...passwords });
  assert.equal(Object.hasOwn(result, 'jwt'), false);
  checks += 1;

  console.log(`PASS: ${checks} password recovery action checks (mocked HTTP; no email sent).`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
