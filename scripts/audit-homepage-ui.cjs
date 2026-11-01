const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { chromium } = require(path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const output = path.resolve(__dirname, '../docs/design/qa', process.env.RS_AUDIT_DIR || 'homepage-polish');
fs.mkdirSync(output, { recursive: true });
async function captureTightWidths(page) {
  await page.setViewportSize({width:700,height:1100});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#programmes').screenshot({path:path.join(output,'after-700-selection.png'),animations:'disabled'});
  await page.setViewportSize({width:360,height:1250});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#universities').screenshot({path:path.join(output,'after-360-universities.png'),animations:'disabled'});
}
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(90000);
    await page.goto('http://localhost:3003/', { waitUntil: 'load' });
    if (process.env.RS_CAPTURE_TIGHT_ONLY) {
      const boxes=page.locator('.rs-compare-check input');
      await boxes.nth(0).check(); await boxes.nth(1).check();
      await captureTightWidths(page);
      assert.deepEqual(errors,[]);
      console.log('Tight-width screenshots refreshed without overflow or browser errors');
      return;
    }
    if (process.env.RS_INJECT_CSS) await page.addStyleTag({ content: fs.readFileSync(path.resolve(__dirname, '../src/app/rs.css'), 'utf8') });
    const layouts = [];
    for (const width of [1440, 1031, 768, 390, 360]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
        await Promise.race([Promise.all([...document.images].map(i => i.decode().catch(() => {}))), new Promise(r => setTimeout(r, 2000))]);
        window.scrollTo(0, 0);
      });
      layouts.push(await page.evaluate(() => ({
        width: innerWidth, height: document.body.scrollHeight, overflow: document.documentElement.scrollWidth > innerWidth,
        sections: [...document.querySelectorAll('.rs-home>section,.rs-home>.rs-benefits')].map(section => {
          const rect = section.getBoundingClientRect(); const css = getComputedStyle(section);
          const heading = section.querySelector('h1,h2'); const grid = section.querySelector('.rs-programme-track,.rs-programme-grid,.rs-university-grid,.rs-news-grid,.rs-blog-grid');
          return { name: section.id || section.className, height: Math.round(rect.height), padding: [css.paddingTop, css.paddingBottom], heading: heading?.textContent, headingToGrid: heading && grid ? Math.round(grid.getBoundingClientRect().top - heading.getBoundingClientRect().bottom) : null };
        }),
      })));
      const prefix = process.env.RS_AUDIT_LABEL || (process.env.RS_INJECT_CSS ? 'proposed' : 'before');
      if (process.env.RS_TOP_PRODUCTS) {
        const section = await page.locator('#programmes').boundingBox();
        assert(section);
        await page.screenshot({path:path.join(output,`${prefix}-products-${width}.png`),fullPage:true,clip:{x:0,y:0,width,height:Math.ceil(section.y+section.height)},animations:'disabled'});
        await page.locator('#programmes').screenshot({path:path.join(output,`${prefix}-section-${width}.png`),animations:'disabled'});
        assert.equal(await page.locator('.rs-hero img, .rs-offering-logo img').evaluateAll(images=>images.filter(image=>!image.complete||!image.naturalWidth).length),0);
      } else if (process.env.RS_HERO_ONLY) {
        const hero = await page.locator('.rs-hero').boundingBox();
        assert(hero);
        await page.screenshot({path:path.join(output,`${prefix}-hero-${width}.png`),clip:{x:0,y:0,width,height:Math.ceil(hero.y+hero.height)},animations:'disabled'});
        assert.equal(await page.locator('.rs-hero img').evaluateAll(images=>images.filter(image=>!image.complete||!image.naturalWidth).length),0);
      } else {
        await page.screenshot({ path: path.join(output, `${prefix}-${width}.png`), fullPage: true, animations: 'disabled' });
        if (width === 1440 || width === 390) await page.screenshot({ path: path.join(output, `${prefix}-${width}-top.png`), animations: 'disabled' });
      }
    }
    const prefix = process.env.RS_AUDIT_LABEL || (process.env.RS_INJECT_CSS ? 'proposed' : 'before');
    fs.writeFileSync(path.join(output, `${prefix}-layout.json`), JSON.stringify(layouts, null, 2));
    if (process.env.RS_VERIFY_UI) {
      const checks = [];
      assert(layouts.every(layout => !layout.overflow));
      checks.push('No horizontal overflow at 360, 390, 768, 1031 and 1440px');
      assert(layouts.every(layout=>layout.sections.find(section=>section.name==='programmes').height < (layout.width<=640?740:600)),'Current programme section fits a desktop/mobile viewport');
      checks.push('Current curated programme section is below 600px on desktop/tablet and 740px on mobile');
      await page.setViewportSize({width:1440,height:1000});
      assert.equal(await page.locator('.rs-programme-card').count(),4);
      assert.match(await page.locator('.rs-mode-summary').innerText(),/Online/);
      assert.equal(await page.locator('#programmes .rs-mode select').count(),0);
      const cards = await page.locator('.rs-programme-card').evaluateAll(items=>items.map(item=>Math.round(item.getBoundingClientRect().top)));
      assert.equal(new Set(cards).size,1,'Four programme cards share one desktop row');
      const track=page.locator('.rs-programme-track');
      const programmeGeometry=[];
      for (const [width,visible] of [[1440,4],[1031,3],[768,2],[390,1],[360,1]]) {
        await page.setViewportSize({width,height:1000});
        await track.evaluate(element=>element.scrollTo({left:0,behavior:'instant'}));
        await page.waitForFunction(expected=>{
          const element=document.querySelector('.rs-programme-track');
          const card=element?.querySelector('.rs-programme-slide');
          return element&&card&&Math.abs(card.getBoundingClientRect().width-(element.clientWidth-6-(expected-1)*parseFloat(getComputedStyle(element).gap))/expected)<2;
        },visible);
        const edges=await page.locator('#programmes').evaluate(section=>{
          const track=section.querySelector('.rs-programme-track').getBoundingClientRect();
          const heading=section.querySelector('.rs-section-heading').getBoundingClientRect();
          const title=section.querySelector('.rs-section-heading h2').getBoundingClientRect();
          const shared=document.querySelector('.rs-hero-grid.rs-container').getBoundingClientRect();
          const cards=[...section.querySelectorAll('.rs-programme-slide')].map(item=>item.getBoundingClientRect()).filter(card=>card.left>=track.left-1&&card.right<=track.right+1);
          return {width:innerWidth,visible:cards.length,first:Math.min(...cards.map(card=>card.left)),last:Math.max(...cards.map(card=>card.right)),titleLeft:title.left,headingLeft:heading.left,headingRight:heading.right,sharedLeft:shared.left,sharedRight:shared.right};
        });
        assert.equal(edges.visible,visible,'Expected number of fully visible programme cards');
        assert(Math.abs(edges.first-edges.titleLeft)<=1&&Math.abs(edges.first-edges.headingLeft)<=1&&Math.abs(edges.last-edges.headingRight)<=1,'Programme title and visible card edges align within 1px');
        assert(Math.abs(edges.headingLeft-edges.sharedLeft)<=1&&Math.abs(edges.headingRight-edges.sharedRight)<=1,'Programme section follows shared container edges');
        programmeGeometry.push(edges);
        const logoBoxes=await page.locator('.rs-offering-logo').evaluateAll(items=>items.map(item=>{const rect=item.getBoundingClientRect();return {width:rect.width,height:rect.height,kind:item.dataset.logoKind}}));
        assert(logoBoxes.every(box=>Math.abs(box.width-box.height)<1&&box.kind==='mark'),'Every compact logo uses the separate square-mark field');
        assert(await page.locator('#programmes .rs-card-facts>div').evaluateAll(items=>items.every(item=>{
          const rect=item.getBoundingClientRect(), icon=item.querySelector('svg').getBoundingClientRect();
          return Math.abs(rect.top+rect.height/2-icon.top-icon.height/2)<1;
        })),'Duration/mode icons are vertically centred beside both fact groups');
        if(visible<4) {
          const next=page.getByRole('button',{name:'Next programmes',exact:true});
          await next.waitFor({state:'visible'});
          await page.locator('.rs-programme-carousel-controls').scrollIntoViewIfNeeded();
          const placement=await page.locator('.rs-programme-carousel').evaluate(element=>{
            const rect=element.getBoundingClientRect(),track=element.querySelector('.rs-programme-track').getBoundingClientRect();
            return [...element.querySelectorAll('.rs-programme-carousel-controls button')].map(button=>{
              const b=button.getBoundingClientRect();
              const hit=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
              return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height,rightGap:rect.right-b.right,
                belowTrack:b.top>=track.bottom-1,inside:b.left>=rect.left-1&&b.right<=rect.right+1&&b.bottom<=rect.bottom+1,
                clickable:hit===button||button.contains(hit)};
            });
          });
          assert(placement.length===2&&placement.every(button=>button.inside&&button.belowTrack&&button.clickable&&button.width>=43.5&&button.height>=43.5),'Programme arrows are visible 44px controls below the track, without covering card content');
          assert(Math.abs(placement[1].rightGap)<=1&&Math.abs(placement[0].top-placement[1].top)<=1&&placement[0].right<=placement[1].left,'Programme controls form a non-overlapping right-aligned row');
          edges.controls=placement;
          await next.click();
          await page.waitForFunction(()=>document.querySelector('.rs-programme-track').scrollLeft>20);
          await track.focus(); await page.keyboard.press('ArrowLeft');
          await page.waitForFunction(()=>document.querySelector('.rs-programme-track').scrollLeft<2);
          await page.waitForFunction(()=>document.querySelector('button[aria-label="Previous programmes"]')?.disabled);
          assert(await page.getByRole('button',{name:'Previous programmes',exact:true}).isDisabled());
        }
      }
      await page.setViewportSize({width:1440,height:1000});
      checks.push('CMS-selected carousel shows 4/3/2/1 cards with title/card/shared-container edges aligned within 1px; right-aligned 44px controls stay below content, arrows and keyboard work, and every logo has a square mark slot');
      await page.locator('.rs-tabs').getByRole('button',{name:'BBA',exact:true}).click();
      await page.waitForFunction(()=>document.querySelectorAll('.rs-programme-card').length===1);
      await page.locator('.rs-tabs').getByRole('button',{name:'All programmes',exact:true}).click();
      await page.waitForFunction(()=>document.querySelectorAll('.rs-programme-card').length===4);
      assert.equal(await page.locator('#programmes .rs-programme-refinements').count(),0);
      assert.equal(await page.locator('#programmes').getByText('More filters',{exact:true}).count(),0);
      checks.push('Programme tabs refine selected products; unnecessary homepage advanced filters are removed');
      const boxes=page.locator('.rs-compare-check input');
      await boxes.nth(0).check();
      await page.locator('.rs-comparison-selection').waitFor();
      assert.equal(await page.locator('.rs-comparison-jump').count(),0);
      await boxes.nth(1).check();
      await page.locator('.rs-comparison-jump').waitFor();
      assert(await boxes.nth(2).isDisabled());
      assert.match(await page.locator('.rs-compare-check').nth(2).innerText(),/Deselect/);
      await page.getByRole('button',{name:'Clear selection',exact:true}).click();
      await page.locator('.rs-comparison-selection').waitFor({state:'detached'});
      assert.equal(await page.locator('.rs-compare-check input:checked').count(),0);
      assert(await boxes.nth(2).isEnabled());
      checks.push('Selection feedback, two-item limit and clear selection work');
      await boxes.nth(0).check(); await boxes.nth(1).check();
      await page.locator('.rs-comparison-jump').click();
      const compare=page.getByRole('button',{name:'Compare programmes',exact:true});
      await compare.click(); await page.locator('.rs-compare-table').waitFor();
      await page.getByRole('button',{name:'Close details',exact:true}).click();
      assert(await compare.evaluate(button=>document.activeElement===button));
      for(const label of ['Fees','Eligibility','Programme details']) {
        const trigger=page.locator('.rs-comparison-actions').getByRole('button',{name:label,exact:true});
        await trigger.click(); await page.locator('.rs-compare-table').waitFor();
        await page.getByRole('button',{name:'Close details',exact:true}).click();
        assert(await trigger.evaluate(button=>document.activeElement===button));
      }
      checks.push('Compare, fees, eligibility and programme controls open, close and restore focus');
      await captureTightWidths(page);
      checks.push('Selected programme controls at 700px and university cards at 360px fit without overflow');
      await page.setViewportSize({width:1440,height:1000});
      await page.getByRole('button',{name:'Clear selection',exact:true}).click();
      checks.push('Four explicitly curated programme products share one desktop row; a single published mode is clearly labelled');
      const faq=page.locator('.rs-faq details').nth(1);
      await faq.locator('summary').click(); assert(await faq.getAttribute('open')!==null);
      await faq.locator('summary').click(); assert.equal(await faq.getAttribute('open'),null);
      await page.locator('.rs-benefits a').nth(2).click();
      await page.locator('#rs-name').fill('Homepage UI Check');
      await page.locator('#rs-phone').fill('123');
      await page.locator('.rs-callback-form input[name=consent]').check();
      await page.locator('.rs-callback-form button[type=submit]').click();
      await page.locator('#rs-form-status').waitFor();
      assert.equal(await page.locator('#rs-name').inputValue(),'Homepage UI Check');
      assert.equal(await page.locator('#rs-phone').inputValue(),'123');
      checks.push('FAQ toggles and guidance anchor work; invalid callback keeps entered values');
      assert.equal(await page.locator('.rs-uni-identity h3 a').count(),4);
      assert.equal(await page.locator('#universities .rs-uni-photo').count(),0);
      assert.equal(await page.locator('.rs-post-image .rs-card-image-link').count(),6);
      assert.equal(await page.locator('.rs-post-title-link').count(),6);
      const post=page.locator('.rs-blogs .rs-card-image-link').first();
      const postHref=await post.getAttribute('href');
      await post.click(); await page.waitForURL('**'+postHref);
      await page.goto('http://localhost:3003/',{waitUntil:'load'});
      const uni=page.locator('.rs-uni-identity h3 a').first();
      const uniHref=await uni.getAttribute('href');
      await uni.click(); await page.waitForURL('**'+uniHref);
      await page.goto('http://localhost:3003/',{waitUntil:'load'});
      for (const degree of ['MBA','BBA','MCA']) {
        await page.goto('http://localhost:3003/',{waitUntil:'load'});
        await page.locator('.rs-hero-tabs').getByRole('button',{name:degree,exact:true}).click();
        await page.getByRole('button',{name:'Find my programme',exact:true}).click();
        await page.waitForURL(url=>url.pathname==='/programs'&&url.searchParams.get('course')===degree.toLowerCase());
        await page.locator('.rs-programme-listing h1').waitFor();
        assert.equal(await page.locator('.rs-programme-card').count(),degree==='MBA'?2:1);
        assert.equal(await page.locator('.rs-programme-card h3').evaluateAll((items,expected)=>items.some(item=>item.textContent.trim()!==expected),degree),false);
        assert.match(await page.locator('h1').innerText(),new RegExp(degree));
        if(degree==='MBA') {
          assert.match(await page.locator('.rs-programme-listing-grid').innerText(),/Manipal University Jaipur/);
          assert.match(await page.locator('.rs-programme-listing-grid').innerText(),/Lovely Professional University/);
          for(const width of [1440,1031,768,390,360]) {
            await page.setViewportSize({width,height:1050});
            await page.evaluate(async()=>{await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})))});
            assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
            assert.equal(await page.locator('.rs-offering-logo img').evaluateAll(images=>images.filter(image=>!image.complete||!image.naturalWidth).length),0);
            if(width===1440||width===390) await page.screenshot({path:path.join(output,'after-mba-listing-'+width+'.png'),fullPage:true,animations:'disabled'});
          }
          await page.setViewportSize({width:1440,height:1000});
          const search=page.getByRole('search');
          await search.getByRole('searchbox',{name:'Search programs',exact:true}).fill('zz-no-programme');
          await search.getByRole('button',{name:'Search',exact:true}).click();
          await page.waitForURL(url=>url.searchParams.get('course')==='mba'&&url.searchParams.get('q')==='zz-no-programme');
          await page.getByText('Nothing matches “zz-no-programme”',{exact:true}).waitFor();
          await page.getByRole('link',{name:'Clear the search',exact:true}).click();
          await page.waitForURL(url=>url.searchParams.get('course')==='mba'&&!url.searchParams.has('q'));
          await page.locator('.rs-programme-card').nth(1).waitFor();
          assert.equal(await page.locator('.rs-programme-card').count(),2);
        }
        const product=page.locator('.rs-programme-card').first();
        const productLink=product.getByRole('link',{name:/View fees & eligibility/});
        const productHref=await productLink.getAttribute('href');
        assert.match(productHref,/^\/offering\/[^/]+\/[^/]+$/);
        await productLink.click();await page.waitForURL('**'+productHref);
      }
      await page.goto('http://localhost:3003/',{waitUntil:'load'});
      const featured=page.locator('.rs-hero-offer');
      assert.match(await featured.innerText(),/Manipal University Jaipur/);
      assert.match(await featured.innerText(),/Online MBA/);
      const featuredLink=featured.getByRole('link',{name:/View fees & eligibility/});
      const featuredHref=await featuredLink.getAttribute('href');
      assert.match(featuredHref,/^\/offering\/manipal-university-jaipur\//);
      await featuredLink.click(); await page.waitForURL('**'+featuredHref);
      checks.push('MBA/BBA/MCA finder navigates to exact-course listing with every published university offering; search clear retains MBA; product and featured CTAs keep their exact university');
      assert.deepEqual(errors,[]);
      checks.push('No browser runtime errors');
      const result={date:new Date().toISOString(),checks,layouts,programmeGeometry};
      fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify(result,null,2));
      console.log(JSON.stringify({checks,heights:layouts.map(({width,height})=>({width,height}))},null,2));
    } else console.log(JSON.stringify(layouts, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
