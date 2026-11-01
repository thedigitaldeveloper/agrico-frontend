/* Rasterize our existing code-native Agrico identity; no external image edits. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'public/branding');
const mark = '<svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg"><g color="#124B3B"><path d="M21 36c-5-5-11-7-18-6V9c7-1 13 1 18 6m0 21c5-5 11-7 18-6V9c-7-1-13 1-18 6v21Z" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/><path d="M7 13v13c5 0 9 2 11 4M35 13v13c-5 0-9 2-11 4" stroke="currentColor" stroke-width="1.5"/><path d="M21 14V6m0 3c-5 0-7-3-7-7 5 0 7 3 7 7Zm1-3c0-4 3-6 7-6 0 4-3 7-7 7" fill="currentColor"/></g></svg>';
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180"><svg x="10" y="20" width="130" height="130" viewBox="0 0 42 42" fill="none">${mark.match(/<g[\s\S]*<\/g>/)[0]}</svg><text x="166" y="104" font-family="Arial,sans-serif" font-size="96" font-weight="700" fill="#124B3B">agrico</text><text x="168" y="142" font-family="Arial,sans-serif" font-size="19" fill="#183A31">Agriculture Education &amp; Admissions</text></svg>`;
(async () => {
  fs.writeFileSync(path.join(target, 'agrico-logo.svg'), logo);
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(`<style>body{margin:0}svg{display:block}</style>${logo}`);
    await page.locator('body > svg').screenshot({ path: path.join(target, 'agrico-logo.png'), omitBackground: true });
    await page.setContent(`<style>body{margin:0}svg{display:block;width:180px;height:180px}</style>${mark}`);
    await page.locator('svg').screenshot({ path: path.join(target, 'agrico-mark.png'), omitBackground: true });
    await page.setContent(`<style>body{margin:0;font-family:Arial,sans-serif;color:#124b3b;background:#e9f2ec}main{box-sizing:border-box;width:1200px;height:630px;padding:65px;border-bottom:24px solid #124b3b;display:flex;flex-direction:column;justify-content:center}svg{width:480px;height:144px}h1{font-size:57px;line-height:1.12;margin:30px 0 22px;max-width:970px}p{font-size:26px;margin:0}</style><main>${logo}<h1>Choose your agriculture education with clear information.</h1><p>Programmes · Institutions · Admissions</p></main>`);
    await page.screenshot({ path: path.join(target, 'agrico-social.png') });
    for (const [size, file] of [[512, 'icon.png'], [180, 'apple-icon.png'], [64, 'favicon.ico']]) {
      await page.setContent(`<style>body{margin:0;background:${file.endsWith('.ico') ? 'transparent' : '#e9f2ec'};width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center}svg{width:76%;height:76%}</style>${mark}`);
      const png = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
      if (file.endsWith('.ico')) {
        const header = Buffer.alloc(22); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4); header[6] = size; header[7] = size; header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
        fs.writeFileSync(path.join(root, 'src/app', file), Buffer.concat([header, png]));
      } else fs.writeFileSync(path.join(root, 'src/app', file), png);
    }
  } finally { await browser.close(); }
  console.log('Agrico SVG, logo PNG, mark PNG and social image generated.');
})().catch(error => { console.error(error); process.exitCode = 1; });
