import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

async function seedUniversity(universitySlug = 'upes-online') {
  console.log(`🚀 Starting import for university: ${universitySlug}...`);

  const jsonPath = path.resolve(
    HERE,
    `../content-rewrite/${universitySlug}/content/university.json`
  );

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ University data file not found at ${jsonPath}`);
    process.exit(1);
  }

  const universityData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const strapiPackage = require('d:/geduconnectbknd/node_modules/@strapi/strapi');
  const { createStrapi, compileStrapi } = strapiPackage;

  process.chdir('d:/geduconnectbknd');
  const appContext = await compileStrapi();
  const strapi = await createStrapi(appContext).load();

  try {
    console.log(`📦 Loaded Strapi instance. Checking for existing university [${universityData.slug}]...`);

    // 1. Check if University exists
    let existingUni = await strapi.documents('api::university.university').findFirst({
      filters: { slug: universityData.slug },
      status: 'draft',
      populate: ['university_contents'],
    });

    if (!existingUni) {
      existingUni = await strapi.documents('api::university.university').findFirst({
        filters: { slug: universityData.slug },
        status: 'published',
        populate: ['university_contents'],
      });
    }

    const uniPayload = {
      name: universityData.name,
      full_name: universityData.full_name,
      slug: universityData.slug,
      country: universityData.country,
      state: universityData.state,
      city: universityData.city,
      address: universityData.address,
      establish: universityData.establish,
      heading: universityData.heading,
      seo: universityData.seo,
      show_apply_button: universityData.show_apply_button ?? true,
      apply_button_text: universityData.apply_button_text || 'Apply Now',
      view_button_text: universityData.view_button_text || 'View Details',
      show_similar_universities: universityData.show_similar_universities ?? true,
      highlights: universityData.highlights || [],
    };

    let targetDocId;

    if (existingUni) {
      console.log(`✏️ Updating existing university (documentId: ${existingUni.documentId})...`);
      const updated = await strapi.documents('api::university.university').update({
        documentId: existingUni.documentId,
        data: uniPayload,
        status: 'draft',
      });
      targetDocId = updated.documentId;
    } else {
      console.log(`✨ Creating new university: ${universityData.name}...`);
      const created = await strapi.documents('api::university.university').create({
        data: uniPayload,
        status: 'draft',
      });
      targetDocId = created.documentId;
    }

    // 2. Insert/Update university_contents (the tabs!)
    const contentSections = universityData.university_contents || [];
    console.log(`📑 Processing ${contentSections.length} content tabs/sections...`);

    const createdSectionDocIds = [];

    for (const section of contentSections) {
      const sectionSlug = section.slug;
      console.log(`  - Processing Tab: ${section.name} (${sectionSlug})...`);

      // Check if section already exists for this university
      let existingSection = await strapi
        .documents('api::university-content.university-content')
        .findFirst({
          filters: {
            slug: sectionSlug,
            university: { slug: universityData.slug },
          },
          status: 'draft',
        });

      if (!existingSection) {
        existingSection = await strapi
          .documents('api::university-content.university-content')
          .findFirst({
            filters: {
              slug: sectionSlug,
              university: { slug: universityData.slug },
            },
            status: 'published',
          });
      }

      const sectionPayload = {
        name: section.name,
        display_name: section.display_name || section.name,
        slug: section.slug,
        secondary_slug: section.secondary_slug,
        heading: section.heading,
        seo: section.seo,
        content: section.content || [],
        university: targetDocId,
      };

      let sectionDocId;
      if (existingSection) {
        const updatedSec = await strapi
          .documents('api::university-content.university-content')
          .update({
            documentId: existingSection.documentId,
            data: sectionPayload,
            status: 'draft',
          });
        sectionDocId = updatedSec.documentId;
        console.log(`    ✓ Updated section ${section.name}`);
      } else {
        const createdSec = await strapi
          .documents('api::university-content.university-content')
          .create({
            data: sectionPayload,
            status: 'draft',
          });
        sectionDocId = createdSec.documentId;
        console.log(`    ✓ Created section ${section.name}`);
      }

      // Publish section
      await strapi.documents('api::university-content.university-content').publish({
        documentId: sectionDocId,
      });

      createdSectionDocIds.push(sectionDocId);
    }

    // Link sections to university & publish university
    console.log(`🔗 Linking ${createdSectionDocIds.length} sections to university...`);
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

    console.log(`🎉 Successfully imported and published ${universityData.name} with all ${createdSectionDocIds.length} tabs into Strapi CMS!`);
  } catch (err) {
    console.error('❌ Error during Strapi seed:', err);
  } finally {
    await strapi.destroy().catch(() => {});
    process.exit(0);
  }
}

seedUniversity(process.argv[2] || 'upes-online');
