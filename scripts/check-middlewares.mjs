import fs from 'fs';

try {
  const middlewares = fs.readdirSync('D:/cms.geduconnect.org/src/middlewares');
  console.log('Middlewares:', middlewares);
  for (const m of middlewares) {
    console.log(`--- ${m} ---`);
    console.log(fs.readFileSync(`D:/cms.geduconnect.org/src/middlewares/${m}`, 'utf8'));
  }
} catch(e) {
  console.error(e.message);
}
