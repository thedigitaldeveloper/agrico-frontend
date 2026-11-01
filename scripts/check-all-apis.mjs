import fs from 'fs';

async function main() {
  const apis = fs.readdirSync('D:/cms.geduconnect.org/src/api');
  console.log('All APIs in Strapi src/api:', apis);

  for (const api of apis) {
    const routesPath = `D:/cms.geduconnect.org/src/api/${api}/routes`;
    if (fs.existsSync(routesPath)) {
      const routeFiles = fs.readdirSync(routesPath);
      console.log(`API ${api} routes:`, routeFiles);
    }
  }
}

main().catch(console.error);
