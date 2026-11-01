import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

// Load backend .env so database connection uses MySQL correctly
const dotenv = require('d:/geduconnectbknd/node_modules/dotenv');
dotenv.config({ path: 'd:/geduconnectbknd/.env' });

function sanitizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  const validBlocks = [];

  for (const b of blocks) {
    if (!b || !b.type) continue;
    if (b.type === 'image') continue;

    if (b.type === 'list') {
      const items = (b.children || []).filter(
        (item) =>
          item &&
          item.type === 'list-item' &&
          Array.isArray(item.children) &&
          item.children.length > 0
      );
      if (items.length > 0) {
        validBlocks.push({
          type: 'list',
          format: b.format || 'unordered',
          children: items,
        });
      }
    } else {
      const children = (b.children || []).filter(
        (ch) => ch && (typeof ch.text === 'string' || ch.type === 'text')
      );
      if (children.length > 0) {
        validBlocks.push({
          ...b,
          children,
        });
      }
    }
  }

  return validBlocks;
}


function sanitizeContent(content) {
  if (!Array.isArray(content)) return [];
  return content.map((block) => {
    if (block.__component === 'common.rich-text' && block.body) {
      return {
        ...block,
        body: sanitizeBlocks(block.body),
      };
    }
    if (block.__component === 'college.faq-section' && Array.isArray(block.faqs)) {
      return {
        ...block,
        faqs: block.faqs.map((faq) => ({
          title: faq.title || 'FAQ',
          description: sanitizeBlocks(faq.description),
        })),
      };
    }
    return block;
  });
}

async function syncUpesFull() {
  console.log('🚀 Starting Full Synchronization of UPES Online content...');


  const uniPath = path.resolve(HERE, '../content-rewrite/upes-online/content/university.json');
  const programsDir = path.resolve(HERE, '../content-rewrite/upes-online/content/programs');

  if (!fs.existsSync(uniPath)) {
    console.error('❌ University JSON not found at:', uniPath);
    process.exit(1);
  }

  const uniData = JSON.parse(fs.readFileSync(uniPath, 'utf8'));

  const strapiPackage = require('d:/geduconnectbknd/node_modules/@strapi/strapi');
  const { createStrapi, compileStrapi } = strapiPackage;

  process.chdir('d:/geduconnectbknd');
  console.log('⚙️ Compiling Strapi context with MySQL config...');
  const appContext = await compileStrapi();
  console.log('🔌 Loading Strapi instance...');
  const strapi = await createStrapi(appContext).load();

  try {
    console.log('🔍 Checking for existing UPES Online record...');

    let existingUni = await strapi.documents('api::university.university').findFirst({
      filters: { slug: 'upes-online' },
      status: 'draft',
      populate: ['university_contents'],
    });

    if (!existingUni) {
      existingUni = await strapi.documents('api::university.university').findFirst({
        filters: { slug: 'upes-online' },
        status: 'published',
        populate: ['university_contents'],
      });
    }

    const uniPayload = {
      name: uniData.name,
      full_name: uniData.full_name,
      slug: uniData.slug,
      country: uniData.country,
      state: uniData.state,
      city: uniData.city,
      address: uniData.address,
      establish: uniData.establish,
      heading: uniData.heading,
      seo: uniData.seo,
      show_apply_button: uniData.show_apply_button ?? true,
      apply_button_text: uniData.apply_button_text || 'Apply Now',
      view_button_text: uniData.view_button_text || 'View Details',
      show_similar_universities: uniData.show_similar_universities ?? true,
      highlights: uniData.highlights || [],
    };

    let targetDocId;

    if (existingUni) {
      console.log(`📝 Updating university [${existingUni.documentId}]...`);
      const updated = await strapi.documents('api::university.university').update({
        documentId: existingUni.documentId,
        data: uniPayload,
        status: 'draft',
      });
      targetDocId = updated.documentId;
    } else {
      console.log('✨ Creating new university UPES Online...');
      const created = await strapi.documents('api::university.university').create({
        data: uniPayload,
        status: 'draft',
      });
      targetDocId = created.documentId;
    }

    // --- Sync University Contents (8 Tabs) ---
    const contentSections = uniData.university_contents || [];
    console.log(`📑 Syncing ${contentSections.length} University Content Tabs...`);
    const createdSectionDocIds = [];

    for (const section of contentSections) {
      let displayName = section.display_name || section.name;
      let secondarySlug = section.slug;
      if (section.slug === 'fee-instalments' || section.slug === 'fees') {
        displayName = 'Courses & Fees';
        secondarySlug = 'courses-fees';
      }
      const sectionSlug = `upes-online-${secondarySlug}`;
      console.log(`  - Tab: ${displayName} (slug: ${sectionSlug}, secondary: ${secondarySlug})`);

      let existingSection = await strapi
        .documents('api::university-content.university-content')
        .findFirst({
          filters: {
            $or: [
              { slug: sectionSlug },
              { secondary_slug: secondarySlug, university: { slug: 'upes-online' } },
            ],
          },
          status: 'draft',
        });

      if (!existingSection) {
        existingSection = await strapi
          .documents('api::university-content.university-content')
          .findFirst({
            filters: {
              $or: [
                { slug: sectionSlug },
                { secondary_slug: secondarySlug, university: { slug: 'upes-online' } },
              ],
            },
            status: 'published',
          });
      }

      const seoPayload = {
        metaTitle:
          section.seo?.metaTitle ||
          `${section.heading || displayName} — ${uniData.name}`,
        metaDescription:
          section.seo?.metaDescription ||
          `${displayName || 'Details'} for ${uniData.name}.`,
      };

      const sectionPayload = {
        name: displayName,
        display_name: displayName,
        slug: sectionSlug,
        secondary_slug: secondarySlug,
        heading: section.slug === 'fee-instalments' ? 'Courses & Fee Structure' : section.heading,
        seo: seoPayload,
        content: sanitizeContent(section.content),
        university: targetDocId,
      };




      if (existingSection) {
        console.log(`    ↻ Replacing existing section [${existingSection.documentId}]...`);
        try {
          await strapi.documents('api::university-content.university-content').delete({
            documentId: existingSection.documentId,
          });
        } catch (e) {
          // ignore delete errors
        }
      }

      const createdSec = await strapi
        .documents('api::university-content.university-content')
        .create({
          data: sectionPayload,
          status: 'draft',
        });
      const sectionDocId = createdSec.documentId;
      console.log(`    ✓ Created section ${section.name} [${sectionDocId}]`);

      await strapi.documents('api::university-content.university-content').publish({
        documentId: sectionDocId,
      });

      createdSectionDocIds.push(sectionDocId);
    }


    // Link all tabs and publish university
    console.log(`🔗 Linking ${createdSectionDocIds.length} tabs to UPES Online...`);
    await strapi.documents('api::university.university').update({
      documentId: targetDocId,
      data: {
        university_contents: createdSectionDocIds,
      },
      status: 'draft',
    });

    await strapi.documents('api::university.university').publish({
      documentId: targetDocId,
    });
    console.log('✅ UPES Online University and all 8 Content Tabs published successfully!');

    // --- Sync Programs ---
    if (fs.existsSync(programsDir)) {
      const programFiles = fs.readdirSync(programsDir).filter((f) => f.endsWith('.json'));
      console.log(`🎓 Found ${programFiles.length} program files to sync...`);

      for (const file of programFiles) {
        const progData = JSON.parse(fs.readFileSync(path.join(programsDir, file), 'utf8'));
        const progSlug = progData.slug.startsWith('upes-') ? progData.slug : `upes-${progData.slug}`;
        console.log(`  - Program: ${progData.name} (slug: ${progSlug}, fee: ₹${progData.fee})...`);

        let existingProg = await strapi.documents('api::program.program').findFirst({
          filters: { slug: progSlug },
          status: 'draft',
        });

        if (!existingProg) {
          existingProg = await strapi.documents('api::program.program').findFirst({
            filters: { slug: progSlug },
            status: 'published',
          });
        }

        const progSeoPayload = {
          metaTitle:
            progData.seo?.metaTitle || `${progData.name} — ${uniData.name}`,
          metaDescription:
            progData.seo?.metaDescription ||
            `${progData.name} fees, duration and eligibility at ${uniData.name}.`,
        };

        const progPayload = {
          name: progData.name,
          full_name: progData.full_name || progData.name,
          slug: progSlug,
          duration: progData.duration,
          fee: progData.fee,
          show_apply_button: progData.show_apply_button ?? true,
          apply_button_text: progData.apply_button_text || 'Apply Now',
          view_button_text: progData.view_button_text || 'View Details',
          seo: progSeoPayload,
          universities: [targetDocId],
        };


        let progDocId;
        if (existingProg) {
          const updated = await strapi.documents('api::program.program').update({
            documentId: existingProg.documentId,
            data: progPayload,
            status: 'draft',
          });
          progDocId = updated.documentId;
        } else {
          const created = await strapi.documents('api::program.program').create({
            data: progPayload,
            status: 'draft',
          });
          progDocId = created.documentId;
        }

        await strapi.documents('api::program.program').publish({
          documentId: progDocId,
        });
      }
      console.log(`✅ All ${programFiles.length} Programs linked to UPES Online!`);
    }

    console.log('🎉 ALL UPES ONLINE DATA AND REWRITTEN CONTENT FULLY SYNCED!');
  } catch (err) {
    console.error('❌ Error during synchronization:', err);
    if (err.details) {
      console.error('📋 Validation Details:', JSON.stringify(err.details, null, 2));
    }
  } finally {
    await strapi.destroy().catch(() => {});
    process.exit(0);
  }
}

syncUpesFull();

