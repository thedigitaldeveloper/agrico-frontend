# RS Education local setup

This is the independent RS Education copy. Work in `D:\rs-education-frontend` and `D:\rs-education-backend`; do not run migrations or seeds against the original platform.

## Running locally

- XAMPP installation: `D:\xammp`. Apache/phpMyAdmin uses port 80; MariaDB uses 3306.
- Database: `rs_education`, UTF-8 (`utf8mb4_unicode_ci`). The `rs_education_app` local account is granted access only to this database. Connection credentials live in the backend's ignored `.env`.
- In the backend folder: `npm run build`, then `npm run configure:local`, then `npm run start` (CMS on `http://127.0.0.1:1338/admin`). Rebuild after changing server schemas or CMS admin code. Use `npm run develop` for active CMS development.
- In the frontend folder: `npm run dev -- --hostname 127.0.0.1` (website on `http://127.0.0.1:3001`).
- Keep the CMS running while executing `npm run build` in the frontend so the production build can read the local catalogue.
- phpMyAdmin: `http://localhost/phpmyadmin/` → select `rs_education`.

### Switching from development to a production preview

Stop the frontend dev server before `npm run build`, keep the CMS running, then start the production frontend on port 3001. Next's persistent data cache can contain earlier CMS responses even after a successful rebuild, especially when a CMS update happened while the webhook target was stopped. Refresh the affected content through the existing authenticated webhook after the production server starts; do not delete uploads or the database.

Run this from `D:\rs-education-frontend` with the existing local `.env.local`. It prints only models and status codes, never the webhook secret:

```powershell
node --env-file=.env.local -e "(async()=>{for(const model of ['home','program','university','blog']){const r=await fetch('http://127.0.0.1:3001/api/revalidate',{method:'POST',headers:{'content-type':'application/json','x-revalidate-secret':process.env.REVALIDATE_SECRET},body:JSON.stringify({event:'entry.update',model}),signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(model+': '+r.status);console.log(model,r.status)}const page=await fetch('http://127.0.0.1:3001/',{signal:AbortSignal.timeout(45000)});await page.text();if(!page.ok)throw Error('Homepage: '+page.status);console.log('Homepage warmed',page.status)})().catch(e=>{console.error(e.message);process.exitCode=1})"
```

All four invalidations and the subsequent homepage warm returned HTTP 200 during local verification. The corrected CMS headline and News/Blog images then appeared in the rendered page. Freeze source/CMS edits before the final production browser checks: a dev hot reload can interrupt a click check or capture a partially streamed page.

## Local review accounts

CMS administrator: `admin@rseducation.test`.
Student: `student@rseducation.test`.
Passwords are in **`D:\rs-education-backend\.env.local-accounts`**, which is ignored by Git. Never commit or copy these values into documentation. Student login: `/login`; account creation: `/register`.

The student session uses a separate `rs_education_session` HTTP-only cookie. CMS users and student users are distinct. Registering without the optional admission-guidance checkbox creates a student profile without a counselling lead.

## Design and content

The approved design is **Rich Ruby Red + Warm Ivory**: `#A22334`, `#FCFAF5`, white cards, `#F2EEE8` subtle sections, `#E6DED5` borders, `#6B6260` text. DM Sans body text and Lora headings. Logo sources and PNGs are in `public/branding`; recreate assets with `node scripts/build-brand-assets.cjs`.

Homepage sections: split hero and programme finder, service strip, university-specific programme cards, university profiles, programme spotlight, two-programme comparison, application steps, News, Blogs, FAQs and a contextual callback form. The shared header/footer, account screens and interior pages use the same identity.

- `/design-preview` is a development-only visual example; submissions are disabled.
- `/design-preview?slider=1` demonstrates the optional manual hero slider. One CMS hero slide gives a static hero; multiple slides enable previous/next controls.
- Begin with the programme, then refine by study mode. Online/Distance/Regular are separate CMS terms. Set the mode on the actual programme; a university's modes must not imply that every programme is offered in every mode.
- Programme actions use `/offering/{university}/{programme}` so the selected university is preserved through details and enquiries. Fees come from that university's programme fee row; missing fees are shown as a request for current fees.
- News and Blogs are separate views. Do not add an Articles section to the RS navigation.

## Sample data and launch configuration

`npm run seed:local` in the backend supplies a small local review catalogue. It refuses production or a non-local/non-RS database. Re-running preserves existing published entries. Four universities/programmes are illustrative local examples, with original preview posts. No invented fees, ratings, placements, testimonials or partnership claims are supplied. Generic generated images illustrate student life; they are not evidence of any named campus.

`npm run configure:local` idempotently configures the local homepage, review media and CMS revalidation webhook. Run it after the backend build; repeated runs update the same local configuration without duplicating these records. The configured webhook endpoint returned HTTP 200 during verification.

Before launch, enter the client's verified catalogue, official university media, contact details and approved policy content. The local legal pages are explicitly placeholders. Configure the real public origin, CMS media origin, production email provider and environment-specific secrets. Set `SITE_INDEXING_ENABLED=true` only for the approved public RS domain; indexing stays off locally. No public deployment has been performed.

## Verification

- The final frontend production build passed for all 59 routes; TypeScript validation passed.
- The final consolidated source ESLint run passed.
- The initial responsive sweep checked 26 available page URLs at 320, 390, 768, 1024, 1440 and 1920 pixels (156 page/viewport checks): no horizontal overflow or browser runtime errors.
- Student registration/profile persistence, wrong-password rejection, sign-in, logout, protected dashboard redirect, RS cookie isolation, programme filters, stable two-programme comparison and contextual enquiries were exercised against the local CMS.
- Backend build passed; eight API endpoints were checked, with four universities, four programmes and three study modes present.
- CMS admin sign-in succeeds. Public access cannot list enquiries. All four example programmes retain the shared Online taxonomy after seed.
- An additional final browser rerun was inconclusive because local browser automation stalled after launching. That extra run is not recorded as passed.
- Visual captures and `responsive-results.json` are in `docs/design/qa`; captures are local review artifacts, not production assets.
