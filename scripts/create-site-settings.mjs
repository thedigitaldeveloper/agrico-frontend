/**
 * Creates a "Site Setting" single-type in Strapi via direct DB insert.
 * 
 * This creates the table and populates it with initial config values
 * so the admin team can manage WhatsApp number, contact email, etc.
 * from the Strapi admin panel.
 * 
 * Run: node scripts/create-site-settings.mjs
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mysql = require('D:\\geduconnectbknd\\node_modules\\mysql2\\promise');

async function main() {
  const c = await mysql.createConnection('mysql://root:@localhost:3306/geduconnect');

  // 1. Create the site_settings table
  console.log('Creating site_settings table...');
  await c.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      document_id VARCHAR(255),
      whatsapp_number VARCHAR(20) DEFAULT '919876543210',
      contact_email VARCHAR(100) DEFAULT 'contact@geduconnect.com',
      contact_phone VARCHAR(20) DEFAULT '',
      footer_tagline TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by_id INT DEFAULT NULL,
      updated_by_id INT DEFAULT NULL,
      locale VARCHAR(10) DEFAULT NULL
    )
  `);

  // 2. Check if row exists
  const [existing] = await c.execute('SELECT id FROM site_settings LIMIT 1');
  
  if (existing.length === 0) {
    // 3. Insert default values
    const docId = 'site-settings-' + Date.now();
    await c.execute(`
      INSERT INTO site_settings (document_id, whatsapp_number, contact_email, contact_phone, footer_tagline, published_at)
      VALUES (?, '919876543210', 'contact@geduconnect.com', '', 'India\\'s trusted independent portal for evaluating UGC-DEB entitled online universities.', NOW())
    `, [docId]);
    console.log('✅ Inserted default site settings');
  } else {
    console.log('⚡ Site settings row already exists, skipping insert');
  }

  // 4. Verify
  const [rows] = await c.execute('SELECT * FROM site_settings');
  console.log('\nSite Settings:', JSON.stringify(rows[0], null, 2));

  // 5. Register in Strapi content-type registry so the admin panel shows it
  // Check if already registered
  const [ctCheck] = await c.execute(
    "SELECT id FROM strapi_content_types WHERE uid = 'api::site-setting.site-setting'"
  );
  
  if (ctCheck.length === 0) {
    await c.execute(`
      INSERT INTO strapi_content_types (uid, schema)
      VALUES ('api::site-setting.site-setting', ?)
    `, [JSON.stringify({
      kind: 'singleType',
      collectionName: 'site_settings',
      info: {
        singularName: 'site-setting',
        pluralName: 'site-settings',
        displayName: 'Site Setting',
        description: 'Global site configuration: WhatsApp, email, phone, and branding.'
      },
      options: { draftAndPublish: true },
      attributes: {
        whatsapp_number: { type: 'string', required: true, default: '919876543210' },
        contact_email: { type: 'email', required: true, default: 'contact@geduconnect.com' },
        contact_phone: { type: 'string' },
        footer_tagline: { type: 'text' },
      },
    })]);
    console.log('✅ Registered site-setting content type in Strapi');
  } else {
    console.log('⚡ Content type already registered');
  }

  await c.end();
  console.log('\n🎉 Done! Restart Strapi and check admin panel → Content Manager → Site Setting');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
