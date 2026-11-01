# Agrico frontend

Independent local copy of RS Education, created 29 October 2026.

- Frontend: http://localhost:3003
- CMS: http://localhost:1340/admin
- Database: agrico (isolated local MySQL user, credentials in backend .env)

Dependencies are copied locally. Run npm ci when reinstalling.

Run npm run dev. For production builds use npm run build, then npm start.

The responsive homepage implements the user-approved Sample 2 / Concept B, AgriTech Campus (30 October 2026). Its twelve sections, home header/footer and responsive styles are in `src/components/agrico/`. The locked references are `docs/design/agriculture-sections-v3-2026-10-30/concept-b-upper.png` and `concept-b-lower.png`; the active direction is recorded in `docs/design/design-lock.json`.

Programme guides use verified agriculture education topics and official institution links. Published matching CMS records are used for programme/university destinations and news. Callback requests use the existing server action and enquiry backend. Client contact details, the live CMS catalogue and deployment settings still need client configuration; no source-client accounts, API tokens, uploads or SMTP credentials were copied.

Run `node scripts/verify-agrico-home.cjs` for interaction checks and `node scripts/audit-agrico-responsive.cjs` for the 24-width layout sweep, text clipping, guide cover spacing, CTA contrast and portrait/landscape touch checks. Both use the bundled Playwright runtime and local Chrome. Screenshots and verification reports are saved in `docs/design/qa/agrico-home/`; `final-desktop-upper.png` and `final-desktop-lower.png` show the latest layout against the two approved reference screens. `npm run build` checks the production build. DM Sans is bundled locally with its OFL licence in `src/app/fonts/`.

No Git remote is configured; this folder is an independent working copy.

Start both local servers after building the backend: powershell -ExecutionPolicy Bypass -File D:/agrico-backend/scripts/start-client.ps1. Logs and process IDs are in the backend/frontend logs folders. Run it once per session.

Programme and university detail pages share the approved green theme with distinct layouts: curriculum plus fees/enquiry sidebar for programmes; campus profile, full-width course directory, admission journey and counselling band for universities. Six editorial programme guides and four university profiles link from the homepage while the CMS catalogue is empty. Published CMS records take precedence, with existing sections, fees and enquiry context preserved. No sample fees, ratings or accreditation badges are invented.

Preview /btech-agricultural-engineering and /university/lovely-professional-university. Run `node scripts/verify-agrico-details.cjs` for detail-page responsive, navigation, directory, enquiry validation and route checks. Its screenshots and reports are in docs/design/qa/agrico-details/.
