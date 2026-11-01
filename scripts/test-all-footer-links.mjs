const LINKS = [
  // Brand & CTA
  '/',
  '/common-application-form',
  '/compare',

  // Company Links
  '/about-us',
  '/articles',
  '/news',
  '/universities',
  '/contact-us',

  // Student Tools
  '/mentors',
  '/search',
  '/sitemap',

  // Degrees
  '/programs',
  '/course/online-mba',
  '/course/online-mca',
  '/course/online-bba',
  '/course/online-bca',
  '/course/online-b-com',
  '/course/online-m-sc',
  '/course/online-ma',

  // Universities
  '/university/manipal-university-jaipur-online',
  '/university/amity-university-online',
  '/university/dpu-pune-online',
  '/university/uttaranchal-university-online',
  '/university/vivekananda-global-university-online',
  '/university/chandigarh-university-online',

  // Streams
  '/universities?stream=management',
  '/universities?stream=information-technology',
  '/universities?stream=commerce',
  '/universities?stream=humanities-social-sciences',
  '/universities?stream=science',
  '/universities?stream=applied-arts-design',

  // Statutory article & Legal
  '/articles/is-online-degree-valid-for-govt-jobs-wes-foreign-visas',
  '/privacy-policy',
  '/terms-and-conditions',
  '/disclaimer'
];

async function checkAll() {
  console.log(`Testing ${LINKS.length} footer links on http://localhost:3000 ...\n`);
  const results = [];

  for (const path of LINKS) {
    try {
      const res = await fetch(`http://localhost:3000${path}`, { 
        method: 'GET',
        headers: { 'Accept': 'text/html' }
      });
      const ok = res.status === 200;
      results.push({ path, status: res.status, ok });
      console.log(`[${res.status}] ${path} -> ${ok ? 'OK' : 'FAIL'}`);
    } catch (err) {
      results.push({ path, status: 'ERROR', error: err.message, ok: false });
      console.log(`[ERR] ${path} -> ${err.message}`);
    }
  }

  const failed = results.filter(r => !r.ok);
  console.log(`\n========================================`);
  console.log(`Summary: ${results.length - failed.length}/${results.length} links working.`);
  console.log(`========================================`);
  
  if (failed.length > 0) {
    console.log('\nFailed links:');
    for (const f of failed) {
      console.log(`- ${f.path} (Status: ${f.status})`);
    }
  } else {
    console.log('\nAll footer links returned 200 OK! Perfect!');
  }
}

checkAll().catch(console.error);
