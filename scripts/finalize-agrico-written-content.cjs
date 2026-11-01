const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const [script, ...args] of [
  ['build-agrico-university-content.cjs', '--complete'],
  ['build-agrico-seo-plan.cjs'],
  ['build-agrico-publication.cjs', '--complete'],
  ['build-agrico-seo-plan.cjs'],
  ['build-agrico-html-content.cjs'],
  ['summarize-agrico-content-completion.cjs'],
  ['audit-agrico-content-seo.cjs'],
]) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script), ...args], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
