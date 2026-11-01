const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.RS_PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const assert = require('node:assert/strict');
const root = process.env.RS_PREVIEW_URL || 'http://127.0.0.1:3003';
const pagePath = process.env.RS_HOME_PATH || '/';
const output = path.resolve(__dirname, '../docs/design/qa/' + (pagePath === '/' ? 'homepage-correction' : 'homepage-preview'));
fs.mkdirSync(output, {recursive:true});
async function capture(page, name, width) {
  await page.setViewportSize({width, height:1000});
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  await page.evaluate(async () => {
    for (let y=0; y<document.body.scrollHeight; y+=700) {
      scrollTo({top:y,behavior:'instant'});
      await new Promise(r=>setTimeout(r,50));
    }
    await Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))), new Promise(r=>setTimeout(r,3000))]);
    scrollTo({top:0,behavior:'instant'});
  });
  await page.screenshot({path:path.join(output, name+'.png'),fullPage:true,animations:'disabled'});
  await page.screenshot({path:path.join(output, name+'-top.png'),fullPage:false,animations:'disabled'});
  fs.writeFileSync(path.join(output, name+'-layout.json'),JSON.stringify(await page.evaluate(()=>({width:innerWidth,height:document.body.scrollHeight,sections:[...document.querySelectorAll('.rs-header,.rs-hero,.rs-home>section,.rs-home section,.rs-benefits,.rs-footer')].map(node=>({className:node.className,height:Math.round(node.getBoundingClientRect().height)}))})),null,2));
}
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const checks=[];
  let page;
  try {
    page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    page.setDefaultTimeout(30000); page.setDefaultNavigationTimeout(120000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(root+pagePath,{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200);
    await page.locator('.rs-hero h1').waitFor();
    assert.match(await page.locator('.rs-hero h1').innerText(),/Your degree/);
    assert.equal(await page.locator('.rs-programme-card').count(),3,'Expected three curated offering cards');
    assert.equal(await page.locator('.rs-university-card').count(),4);
    assert.equal(await page.locator('.rs-blogs .rs-post').count(),3);
    assert.equal(await page.locator('.rs-news .rs-post').count(),3);
    checks.push('CMS-backed hero, 3 featured programmes, 4 universities, 3 news and 3 blogs');
    for (const width of [360,390,768,1024,1440]) {
      await page.setViewportSize({width,height:1000});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Horizontal overflow at ${width}`);
    }
    checks.push('Homepage no horizontal overflow at five widths');
    await capture(page,'homepage-desktop',1440);
    await capture(page,'homepage-reference-width',1031);
    await capture(page,'homepage-mobile',390);
    const report=await page.evaluate(()=>({
      height:document.body.scrollHeight,
      headings:[...document.querySelectorAll('.rs-home h2')].map(e=>e.textContent),
      brokenImages:[...document.images].filter(i=>i.complete && !i.naturalWidth).map(i=>i.currentSrc),
    }));
    assert.deepEqual(report.brokenImages,[]);
    const comparison=page.getByRole('button',{name:'Compare programmes',exact:true});
    await comparison.click();
    await page.locator('.rs-compare-table').waitFor({state:'visible'});
    assert(await page.locator('.rs-compare-table').isVisible());
    checks.push('Compact comparison expands on request');
    if (pagePath === '/') {
    await page.locator('#rs-name').fill('RS Homepage Validation');
    await page.locator('#rs-phone').fill('123');
    await page.locator('.rs-callback-form input[name=consent]').check();
    await page.locator('.rs-callback-form button[type=submit]').click();
    await page.locator('#rs-form-status').waitFor();
    assert.equal(await page.locator('#rs-name').inputValue(),'RS Homepage Validation');
    assert.equal(await page.locator('#rs-phone').inputValue(),'123');
    assert.equal(await page.locator('.rs-callback-form input[type=email]').count(),0);
    checks.push('Phone-first callback validation preserves inputs');
    }
    if (pagePath === '/') {
      const detailLinks = await page.locator('.rs-university-card a, .rs-programme-card a, .rs-post a').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')).filter(href => href && href.startsWith('/') && !href.startsWith('/#')))]);
      const routes = [...new Set(['/programs','/universities','/compare','/blogs','/news','/qna','/mentors','/scholarships','/register', ...detailLinks])];
      for (const route of routes) {
        const result = await page.goto(root+route,{waitUntil:'domcontentloaded'});
        assert.equal(result.status(),200,`Route failed: ${route}`);
        for (const width of [390,1440]) {
          await page.setViewportSize({width,height:1000});
          assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow: ${route} at ${width}`);
        }
      }
      checks.push(`${routes.length} listing, account and homepage detail links return 200 with no mobile/desktop overflow`);
    }
    await page.goto(root+'/login',{waitUntil:'domcontentloaded'});
    for (const width of [360,768,1440]) {
      await page.setViewportSize({width,height:1000});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    checks.push('Existing login layout preserved at three widths');
    assert.deepEqual(errors,[]);
    checks.push('No browser runtime errors or broken homepage images');
    fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify({date:new Date().toISOString(),checks,report},null,2));
    console.log(JSON.stringify({checks,report},null,2));
  } catch (error) {
    if (page) await page.screenshot({path:path.join(output,'failure.png'),fullPage:true,animations:'disabled'}).catch(()=>{});
    fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({date:new Date().toISOString(),checks,error:String(error)},null,2));
    throw error;
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
