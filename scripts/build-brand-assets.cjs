// Reproducible Node CommonJS asset generator.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'public/branding');
const ruby = '#A22334', ivory = '#FCFAF5', grey = '#6B6260';
const badge = `<rect x="0" y="0" width="80" height="80" rx="17" fill="${ruby}"/><text x="40" y="46" text-anchor="middle" font-family="Georgia,serif" font-size="33" font-weight="700" letter-spacing="-1.3" fill="${ivory}">RS</text><path d="M19 59Q29 54 40 59Q51 54 61 59M40 59v6" fill="none" stroke="${ivory}" stroke-width="2.3" stroke-linecap="round"/>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" role="img" aria-label="Agrico"><title>Agrico</title>${badge}</svg>`;
function wordmark(inverse=false) { return `<svg xmlns="http://www.w3.org/2000/svg" width="408" height="80" viewBox="0 0 408 80" role="img" aria-label="Agrico"><title>Agrico</title>${badge}<text x="98" y="53" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="700" letter-spacing="-1" fill="${inverse?ivory:ruby}">RS</text><text x="155" y="53" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="400" letter-spacing="-.9" fill="${inverse?ivory:grey}">Education</text></svg>`; }
async function main() {
 await fs.mkdir(out,{recursive:true});
 await fs.writeFile(path.join(out,'rs-education-logo.svg'),wordmark());
 await fs.writeFile(path.join(out,'rs-education-logo-inverse.svg'),wordmark(true));
 await fs.writeFile(path.join(out,'rs-education-mark.svg'),icon);
 await sharp(Buffer.from(wordmark())).resize(1224,240).png().toFile(path.join(out,'rs-education-logo.png'));
 await sharp(Buffer.from(icon)).resize(512,512).png().toFile(path.join(out,'rs-education-mark.png'));
 await fs.copyFile(path.join(out,'rs-education-logo.png'),path.join(root,'public/logo.png'));
 await fs.copyFile(path.join(out,'rs-education-mark.png'),path.join(root,'src/app/icon.png'));
 await sharp(Buffer.from(icon)).resize(180,180).png().toFile(path.join(root,'src/app/apple-icon.png'));
 const png=await sharp(Buffer.from(icon)).resize(48,48).png().toBuffer();
 const ico=Buffer.alloc(22);ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico[6]=48;ico[7]=48;ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(png.length,14);ico.writeUInt32LE(22,18);
 await fs.writeFile(path.join(root,'src/app/favicon.ico'),Buffer.concat([ico,png]));
 const preview=await sharp({create:{width:1224,height:390,channels:4,background:ivory}}).composite([{input:await sharp(Buffer.from(wordmark())).resize(816,160).png().toBuffer(),left:100,top:90},{input:await sharp(Buffer.from(icon)).resize(48,48).png().toBuffer(),left:1020,top:146}]).png().toBuffer();
 await fs.mkdir(path.join(root,'docs/design'),{recursive:true});
 await fs.writeFile(path.join(root,'docs/design/rs-education-brand-preview.png'),preview);
 console.log('Generated Agrico SVG wordmarks, PNGs, browser/app icons and brand preview.');
}
main().catch(e=>{console.error(e);process.exit(1)});
