import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('D:\\geduconnectbknd\\node_modules\\mysql2\\promise');

async function main() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/geduconnect');
  
  const [globals] = await c.query("SHOW TABLES LIKE '%global%'");
  console.log('Global tables:', globals);
  
  const [settings] = await c.query("SHOW TABLES LIKE '%setting%'");
  console.log('Settings tables:', settings);

  const [allTables] = await c.query("SHOW TABLES");
  const tableNames = allTables.map(r => Object.values(r)[0]).filter(t => 
    !t.startsWith('strapi_') && !t.startsWith('admin_') && !t.startsWith('up_') && !t.endsWith('_lnk') && !t.endsWith('_cmps')
  );
  console.log('\nAll content type tables:', tableNames);
  
  await c.end();
}
main().catch(console.error);
