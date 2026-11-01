# RS Education — homepage correction plan

This plan replaces the layout instructions in the earlier implementation plan. The two screenshots supplied on 11 October 2026 are the upper and lower halves of **one continuous homepage**. They are the visual reference for this correction. The working backend, student accounts, CMS, programme data, university data and other pages must remain functional.

## Completed catalogue-backed implementation — 12 October 2026

The homepage, university detail/section routes, programme detail/section routes, exact university programme pages and listings now use the locked ruby/ivory design with shared content edges. University cards are a native, CMS-selected carousel with square logos and factual academic data, without campus photographs. Programmes retain their exact university pairing. The finder opens the matching degree listing instead of updating an unseen part of Home.

The local CMS contains 17 published universities, 141 canonical programmes, 2,094 university/programme pairs and 1,093 authored content sections. Media was copied to the separate RS backend; editorial prose and short university highlights were rewritten. Existing accounts, enquiries, bookings and Home branding remain intact. Sample mentors/testimonials and unverified announcements remain drafts. Source university-specific fee rows were absent, so exact offerings request current fees; a programme base fee is explicitly labelled when shown.

Home supports ordered university/programme selections and ordered News/Blog/mentor/testimonial selections. `section_visibility` controls visibility; `section_display` switches each editorial feed between `latest` and `curated`. An empty curated selection stays empty. Published selections retain CMS order; carousels support swipe, keyboard and accessible buttons below the row. See the backend's `docs/catalogue-import-completion.md` for the additive fields and import workflow.

Final validation: production compilation, TypeScript and all 192 generated pages passed, together with scoped ESLint and Git whitespace checks. Homepage/finder/listing integration passed at 1440/1031/768/390/360px; 24 detail route/width cases passed at 1440/390/360px; 15 additional listing cases passed. Final auth-only checks cover the 44px password-toggle correction. The 96px mobile admissions spacer accommodates wrapped labels and safe-area padding.

Evidence and reusable checks:

- `qa/catalogue-home-listings/` — CMS counts/order, metadata, responsive guides, comparison, enquiry validation, degree listings, pagination and four legacy offering redirects.
- `qa/catalogue-details/` — university/programme/offering routes, dynamic CMS content, fees search, FAQs, images, enquiry context and responsive clearance.
- `qa/secondary-pages/` — News, Blogs, exams, scholarships, search and mobile login/registration.
- `qa/university-data-led/`, `qa/content-carousel/` — ordered overflow fixtures, keyboard/touch operation and controls.
- `qa/home-curation/`, `qa/programme-admission/` — empty/hidden feeds, published ordering/pagination, selected-university application settings and correct fee scope.

Earlier dated screenshots and measurements below are implementation history; this completed section and the current section table define the final behavior.

## Reference and identity

- Upper: `references/ruby-ivory-homepage-upper.png` — user file `ChatGPT Image Oct 11, 2026, 03_53_00 PM (1).png`.
- Lower: `references/ruby-ivory-homepage-lower.png` — user file `ChatGPT Image Oct 11, 2026, 06_51_56 PM.png`.
- Identity: **Rich Ruby Red + Warm Ivory**, RS Education throughout.
- Ruby `#A22334`; ivory `#FCFAF5`; white `#FFFFFF`; stone `#F2EEE8`; border `#E6DED5`; body text `#6B6260`.
- Serif headings, readable sans-serif controls, modest radii, fine warm borders and restrained shadows. Original university logos retain their colours.
- Match the images' composition, hierarchy and compact proportions. Later user corrections require four visible programme cards on wide desktop, in one CMS-selected slider row, and university cards with factual metadata and square logos without campus photographs. The 12 October catalogue-backed plan takes precedence over the dated implementation history below.

## Section-by-section plan

| Order / section | Why it exists and what the visitor does | Layout and image treatment | CMS / working behaviour |
| --- | --- | --- | --- |
| 1. Header | Find programmes, universities, comparisons, News and Blogs; contact a counsellor. Account access remains available. | Slim white header, RS mark at left, restrained navigation, ruby counselling CTA at right. Compact account/search controls must not dominate. | Keep existing routes and authentication. Contact details use site settings. |
| 2. Hero + finder | Start with the programme the student wants; introduce one specific university offering. | A continuous campus photograph fills the hero, strongest on the right, fading into ivory behind the left text. Two-line headline: “Your degree.” / “Your next big move.” A white finder has segmented programme choices. A white university-logo/Online MBA/mode/duration/CTA card overlays the lower-right photograph. | Preserve existing hero image, mobile image, video/YouTube, copy, CTA, link target and slider support. Add an explicit university + programme selection per slide. Never choose the feature by slide array index. Finder choices come from the complete published catalogue. |
| 3. Service strip | Offer three clear paths: programmes, comparison and admission help. | Compact light navigation row with visible arrows and fine dividers, following the user's removal of the three ruby boxes. | Three editable links. Validate destinations against actual sections/routes. |
| 4. Selected programmes | Sell a small curated set of real university-specific products without implying the catalogue is exhausted. | Heading and study-mode control; degree tabs; **one horizontal slider, four visible cards from 1200px**, three at 901–1199px, two at 641–900px and one on mobile. A square university mark sits beside the readable university name. Each card retains mode, degree, expanded name, level, duration/mode strip, brief description, syllabus link, fees/eligibility button and compare checkbox. No large photograph or extra price row. | Ordered CMS university + programme pairs only; filters refine this selection without expanding it to the catalogue. Read fees, eligibility, syllabus and mode from the corresponding catalogue records. Swipe, keyboard and arrows browse the remaining selections. Listing/finder continue to access the full catalogue. Only available modes are selectable; never label online programmes as regular/distance. |
| 5. Universities | Give a visitor confidence in the institution behind an offering. | One ordered, lightweight carousel: four cards on wide desktop, three/two/one at narrower sizes. Square logo and readable name; location, ownership/mode, recognition tags, available programme count, establishment year/rating and ranking. Four degree links plus a remaining-count link; no campus photo or enclosing panel. Heading and cards share the page content edge; 44px controls sit below at the right. | Ordered CMS university choices; render factual metadata only when supplied. Degree chips open the exact offering when unambiguous, otherwise the university. View all opens the complete directory. |
| 6. Programme spotlight | Give one priority product a second, stronger conversion opportunity. | Shallow ruby banner, diagonal transition into a student/campus photograph. Degree, university name, expanded programme name, mode/duration and ivory CTA. | Explicit CMS university + programme pair with optional campaign image. Use actual product facts. Keep image alt text accurate; an illustrative student photograph must not be described as that university's campus. |
| 7. Comparison invitation | Help someone deciding between two specific offerings. | Ruby heading/copy left. One compact white card right, two university logos and programme summaries, central “vs”, Fees/Eligibility/Programme details controls and primary Compare programmes button. | CMS default pair; programme checkboxes can replace the pair. Detailed comparison appears after the CTA. Preserve the existing full university comparison route as well. Never compare arbitrary first results or confuse the existing service comparison matrix with an offering comparison. |
| 8. Admission steps | Explain what happens after a visitor shortlists something. | Shallow stone strip; three icon circles, authored numbers, short titles/copy and connectors. | Reuse existing how-it-works heading, steps, badges/icons/highlights and CTA. Reference content: choose a programme; discuss options; get application support. No automatic renumbering or invented replacement when CMS content is intentionally cleared. |
| 9. News | Show timely, useful education updates. | One large photographic story at left with readable copy **overlaid on the image**, two horizontal stories stacked right. More selections slide in groups of three. | Published News records, editable heading/action, and optional ordered featured_news selections. section_display selects latest or curated; an empty curated selection stays empty. No fabricated deadlines or university announcements. |
| 10. Blogs | Help visitors understand their choices before enquiring. | Three equal image-top cards on desktop, two/one at narrower sizes, each with title, summary, date and Read blog; native carousel for additional selections. | Published Blog records and editable heading, with ordered featured_blogs selections or latest mode. Use “Blogs”. Intentionally empty selections stay empty. |
| 11. FAQ | Resolve practical objections without leaving the page. | Heading/copy/outlined counselling CTA left; four individually bordered white accordion cards right. First may start open; plus/minus reflect state. | Reuse existing FAQ header, CTA and Q&A. Preserve meaningful line breaks and keyboard operation. An intentionally empty list stays empty. |
| 12. Callback | Convert interest into a contextual enquiry. | Shallow ruby strip; short white heading/copy left, compact white form right. Name and mobile together; programme selector; full-width button; unchecked consent beneath. | Reuse bottom-banner copy and the existing enquiry collection. Add a phone-first `homepage-callback` source, keeping email required for existing enquiry flows and account registration. Validate any supplied email. Save the selected university/programme context. Show pending, success and error states; do not invent an email. |
| 13. Footer | Provide final navigation, contact and policy access. | Compact light footer: RS brand plus Programmes, Universities, Resources and Contact columns; fine rule; copyright and policy links. | Keep working links and configured contact details. No fabricated phone number, address, approval or partnership claim. |

## Preserve the backend; extend the homepage controls

The audit found all 36 inherited API models and 19 home components present. The home and site-setting schemas had not lost fields. The principal regression was the new frontend adapter ignoring existing CMS controls and querying only six programmes/four universities.

Reuse existing hero media fields, course-finder configuration, universities/compare/FAQ headers, how-it-works, bottom-banner, SEO, catalogue relations and News/Blog content. Add only missing controls: ordered featured offerings, ordered universities, slide offering selection, spotlight selection/image, comparison defaults, service links, separate programme/News/Blog headers and section visibility. The exact API names belong to the implemented schema; this document describes their purpose.

Trending programmes, statistics, why-us, mentors, testimonials and their existing backend data remain available. They are not visible in these screenshots, so they are optional CMS-enabled extensions, not automatically inserted into the locked 13-section layout. Scholarships/exams/Q&A header fields existed without corresponding sections in the original homepage; do not misreport those as newly removed functionality.

Empty CMS content must not silently regenerate marketing copy. A fresh local setup can have explicitly seeded sample content, but those records must remain editable and removable. Homepage curation and catalogue discovery are separate concerns.

## Image and asset plan

1. Hero: actual campus image from the selected university or an explicitly labelled illustrative campaign image; separate mobile crop where available. Avoid repeating a generic student illustration as the identity of several universities.
2. Programme cards: university logos, no large decorative photos.
3. University cards: authentic square logos and factual CMS metadata, without campus photographs (latest user correction, 12 October). University details and the separate spotlight may still use genuine CMS photography.
4. Spotlight: separate campaign photo with a safe crop and diagonal ruby treatment.
5. News: one strong lead photo and two relevant thumbnails. Blogs: three relevant cover images.
6. Icons are simple consistent line icons. Images are not flattened screenshots of the UI; text and controls remain live, accessible HTML.

## Responsive behaviour

The screenshots specify desktop appearance. Derive mobile layout from the same hierarchy: hero copy/finder followed by visible image and feature card; programmes 4→2→1 columns (four from 1200px); universities 2→1; comparison card below copy; steps stacked; News lead followed by two image stories; Blogs stacked; FAQ and callback stacked; footer columns wrap. Preserve meaningful imagery and actions. Test 360, 390, 768, 1024 and 1440px, with keyboard focus and at least 44px interactive targets. Avoid horizontal overflow, clipped names and fixed heights that truncate CMS content.

## Implementation and acceptance

1. Save the exact references and correct this plan before editing the presentation.
2. Add only missing CMS controls and populate the existing local RS catalogue selections without resetting the database.
3. Restore the full data contract; rebuild hero and each section to the reference, including imagery and relative dimensions.
4. Verify both whole-page composition and individual sections at desktop and mobile sizes. A matching palette alone is not acceptance.
5. Check CMS selection/order changes, full-catalogue finder, syllabus/details links, comparison, slider/media behaviour, FAQ controls and callback persistence. Existing student/admin login and full university comparison must remain functional.

Status: all 13 sections are implemented, with the inherited catalogue, routes and CMS controls retained. Resource pages share the ruby/ivory styling. Final production compilation, TypeScript and generation of all 59 pages passed. No source-platform files were changed.

Integration corrections include complete catalogue pagination, explicit university/programme selections, inherited Articles surfaced in Blogs, authored nested admission steps taking precedence, comparison links following the selected programmes, and counselling links falling back to Contact when the homepage callback is disabled.

### Verified locally, 11 October 2026

- Real CMS-backed homepage: three featured offerings, four university cards, three News stories and three Blogs; all images load.
- No horizontal overflow at 360, 390, 768, 1024 and 1440px. Final reference-width capture is 1031px wide; header 49px and hero 361px. Extra filters, comparison selectors and inherited footer destinations remain functional.
- Comparison opens and closes, with keyboard focus restored. Phone-first callback validation preserves entered values. Backend persistence without email passed; existing required-email flows and private enquiry access remain enforced.
- All 22 tested listing, account and linked detail routes returned HTTP 200 with no overflow at 390 and 1440px. Login layout also passed at 360, 768 and 1440px. No browser runtime errors.
- Evidence: `qa/homepage-correction/checks.json`, desktop/reference-width/mobile screenshots and `compare-production-diagnostic.json`. Repeat with `node scripts/verify-homepage-correction.cjs` while frontend 3001 and backend 1338 run.
- Refresh production CMS tags after switching from development to production, as documented in `../development/local-setup.md`; the two modes can retain separate cached content.

The local catalogue/editorial records remain editable sample content. Amity's official campus source is small (205×164); replace it with a higher-resolution approved asset when available. Actual fees and admissions claims must come from the client's verified catalogue.

### University discovery and programme spotlight revision, 12 October 2026

The university-photo design in this historical revision is superseded by the user's lightweight-card correction below. Its spotlight implementation and dated evidence remain valid.

The next section review keeps the reference's university-first horizontal cards and shallow ruby spotlight. University discovery helps a visitor recognise the institution and open its actual programmes; the spotlight promotes one exact university/programme product. Neither section expands the client's catalogue with invented products or claims.

- University cards use the existing CMS `card_logo` in a square slot, with the full wordmark as fallback and the university name separately readable. Genuine campus photos remain CMS assets. The adapter now carries this already-available field; no backend schema change is required.
- The editor's selected university order is preserved. Above 900px, each carousel page presents up to four cards in the reference's row-major 2×2 layout. Tablet and mobile flatten the same order into a single native swipe row, with 44px previous/next controls at opposite edges. Controls disappear when everything fits; reduced motion, keyboard navigation and native touch remain supported.
- Programme chips come from every published offering at that selected university. A degree with one offering links to that exact offering; multiple offerings of the same degree link to the university page. Image, name and Explore university link to the university details. Only the three fields needed for those links cross the client component boundary.
- Spotlight retains the CMS-selected published university/programme pair, authored copy and image override. Desktop frames the image on the right with a diagonal edge; mobile uses a compact photo beside the university identity and a full-width ivory details button. The button targets the exact offering, and preview enquiries retain their labelled preview behaviour.
- Both sections have scoped component styles, so the inherited listings, account pages, comparison and deferred header menus are unaffected.

Validation passed: production compilation, TypeScript and all 59 generated pages; targeted ESLint and diff checks; live CMS/media/order/exact-link checks at 360, 390, 768, 1031 and 1440px; native mobile touch, keyboard, disabled arrow endpoints and all five university/spotlight navigation paths. There was no page overflow or browser runtime error. Clean desktop and mobile captures were visually reviewed. An isolated run with seven synthetic universities also passed desktop 4+3 pagination, mobile swipe, long names and missing-image/logo fallbacks. Its framework wrappers are native Link/Image equivalents; the section code and CSS are real.

Evidence: `qa/university-spotlight/checks.json`, `layout.json`, `carousel-checks.json` and five combined section captures. Repeat the live check with `node scripts/verify-university-spotlight.cjs` against frontend 3001 and backend 1338, and the isolated check with `node scripts/verify-university-carousel.cjs`. The initial live touch failure was a test reset racing ongoing native scroll momentum; the final test uses a genuine mobile context and awaits scroll settling before reset. Application source did not need a workaround.

### Latest user correction: lightweight university cards, 12 October 2026

Campus photographs are removed from university cards at the user's request. Institution recognition comes from the official square mark and full name. The earlier photo-card reference does not override this correction. Keep the ruby/ivory palette and useful CMS programme links.

University discovery is now one ordered native carousel: 4/3/2/1 visible cards at the programme carousel's existing breakpoints. Each compact card contains its mark/name and a short footer with actual programme links plus Explore university. Remove the repeated caption, image column, image-height reserve and shadows. Use a fine individual card border; do not wrap the section in another panel. Additional CMS programmes and unusually long names can grow naturally without fixed clipping.

The heading, first card and last fully visible card share the same left/right content guides. Remove the extra 32px carousel gutters. Previous/next controls use a separate 44px row below the cards, right-aligned to the same guide, so they do not cover text or create side padding. They hide when all selected cards fit. This alignment rule should guide the subsequent section reviews.

The server passes only the university identity fields this client component needs, omitting campus image URLs and unused metadata. CMS assets and other image-led sections are retained. Network verification distinguishes a university-card photo request from a campus asset legitimately used by the separate spotlight.

That lightweight iteration passed a production build and five-width live review. The following data-led correction supersedes its sparse-card layout. Evidence remains in `qa/university-lightweight/`.

### Catalogue-backed enhancement and execution order, 12 October 2026

The user authorises parallel agents and a full local catalogue import, with homepage first, then university detail, programme/offering detail and listing UI, followed by the import and final review. Original repositories and the source database are read-only. RS branding, the approved ruby/ivory palette, auth/student/enquiry records and current CMS merchandising controls stay protected.

| Stage | Purpose and implementation | Data/control |
|---|---|---|
| Home identity and finder | Keep the existing campus hero, exact programme-first listing destination and independently authored featured offering. | Existing ordered hero media/pair and published full catalogue. |
| Programme discovery | One compact selected-product row with square marks, aligned facts and working exact-pair actions. | Home featured_offerings order; full catalogue stays separate. |
| University discovery | Data-led cards with square mark/name, location, ownership, approvals, modes, programme count and optional established year/rating/ranking. No campus photos. | Published university metadata; Home featured_universities order. Missing facts are omitted. |
| Spotlight and comparison | One selected offering and a useful two-product decision path with working details/clear/compare. | Existing authored pair, campaign image and comparison defaults. |
| Steps and optional service sections | Consistent outer content guides, restrained padding, readable icons. Mentors/student stories use native rails when enabled. | Existing steps/stats/why controls plus visibility switches. Literal student quotes remain unchanged. |
| News and Blogs | Keep reference News lead-and-two-story composition; page additional selections horizontally. Three Blog cards per wide row, with native swipe on small screens. Real dates and summaries. | Add ordered selected records and section_display latest/curated. Curated empty means empty; unset retains latest feed. Wrong feed types/unpublished records cannot appear. |
| FAQ and callback | Readable accordion rows, clear counselling CTA and functional validated enquiry. | Existing questions/header/banner/enquiry flows. |
| University detail | Ivory identity/gallery hero, recognition/facts, route tabs, readable authored content and compact admissions column. | All inherited CMS sections, programme fees, faculty/recruiters, resources and exact links. |
| Programme and offering detail | Distinct editorial product layout and explicit university/programme context. | All inherited section routes, syllabus, eligibility and actual fee semantics. No inferred university fee. |
| Listings | Open RS page with a compact filter rail/search, active URL filters, lightweight cards and pagination. | Entire published catalogue, independent from Home curation. |
| Import | Back up RS database/uploads, map identities/relations/media, import the original catalogue and rewrite editorial prose. Preserve factual values and record integrity. | Source inventory: 17 universities, 141 programmes, 1,093 content documents, 250 media records. Development/unverified news remains draft. Four old sample programme URLs redirect to verified canonical equivalents. |

Validation: production build/type check, scoped lint, actual imported record/relation/media counts, CMS curation/visibility/order, finder/filter/search/pagination, representative section/detail routes and 360/390/768/1031/1440px visual and action checks. Import and final checks are in progress; do not label this stage verified until their evidence exists.

### Homepage spacing and action polish, 11 October 2026

This follow-up changes the homepage only. Header/mega-menu work is deferred at the user's request; backend and other page components are unchanged.

- Apply consistent heading/grid spacing, put programme tabs and More filters in one wrapping toolbar, remove unnecessary card text-height reserves, and give the main card/form buttons usable heights.
- Keep the three featured programme cards together at 700–900px. At 768px the programme section is 729px high, down from 1,249px with an orphaned third card on a second row. Reduce the mobile hero's empty gap and retain horizontal university cards even at 360px.
- Link published programme titles, university campus images/names, and News/Blog images/titles to their actual details. Preserve preview-only content behaviour.
- Show comparison selection count, a two-item limit explanation, Clear selection, and the comparison link when two programmes are chosen. Closing Fees, Eligibility or Programme details returns focus to the button that opened the details.
- Preserve the authored hero slider/media options, choose the mobile video source when supplied, and ignore cancelled/vertical/control gestures when detecting a swipe.

Verification: production compilation, TypeScript and all 59 generated pages passed; targeted ESLint and `git diff --check` passed. Browser checks passed at 360, 390, 768, 1031 and 1440px, plus the selected comparison state at 700px. No horizontal overflow or browser runtime errors. Programme tabs, duration filtering/reset, clear selection, comparison details/focus, catalogue expansion, FAQ, invalid callback preservation and actual Blog/university/finder navigation passed.

Evidence is in `qa/homepage-polish/checks.json`, `after-layout.json`, full-page captures and the two focused small-width captures. Repeat with `RS_VERIFY_UI=1` and `RS_AUDIT_LABEL=after` set before running `node scripts/audit-homepage-ui.cjs` against frontend port 3001. `RS_CAPTURE_TIGHT_ONLY=1` refreshes only the 700px selection and 360px university captures.

### Hero revision: programme discovery and featured offering

The user requested reviewing one section at a time, starting with the hero. Keep the ruby/ivory identity. Frame a genuine, high-resolution Manipal campus photograph on the right with a restrained fade behind the left copy; avoid enlarging the previous 500×456 image across the entire viewport. Give the finder and featured card enough room at desktop, tablet and mobile sizes.

The finder is programme-first. The initial same-page results behaviour was superseded by the user's correction below: **Find my programme must navigate to the filtered listing page**, with every published university offering of the selected programme. Homepage curation does not limit these results.

The right-hand card is the slide's authored featured product. It is independent of the visitor's finder choice. Configure it in **Content Manager → Single Types → Home → hero_slides → offering_university + offering_program**, then Save/Publish. Both relations must correspond to a published catalogue offering. The card names the institution and full programme, provides mode/duration, links to that exact offering's fees/eligibility and separately links to its university.

The live hero now uses the unaltered 5184×3456 campus photograph from the [official MUJ Picture Gallery](https://www.jaipur.manipal.edu/picture-gallery.php): `https://www.jaipur.manipal.edu/img/gallery/IMG_9947.JPG`. It shows genuine campus buildings and landscaped grounds. The original is stored as CMS media, with frontend image optimisation and responsive CSS framing. The backend's guarded `scripts/update-rs-hero-campus.mjs` preserves the authored Manipal MBA pair, other hero fields and all other Home sections; repeated execution is idempotent.

Final hero verification passed: production build/TypeScript/all 59 generated pages, targeted ESLint and browser checks at 360, 390, 768, 1031 and 1440px. Same-page BBA and MBA results, complete-catalogue discovery, stale duration-filter reset and the exact featured offering destination passed. All hero images load; no horizontal overflow or browser runtime errors. Evidence: `qa/hero-correction/checks.json` and five `after-hero-*.png` captures. Set `RS_VERIFY_UI=1`, `RS_AUDIT_LABEL=after`, `RS_AUDIT_DIR=hero-correction` and `RS_HERO_ONLY=1` before running `node scripts/audit-homepage-ui.cjs` to repeat.

### Finder destination and university product cards — user correction

Selecting MBA/BBA/MCA and submitting **Find my programme** now opens `/programs?course=<exact CMS course slug>`. The listing heading names the chosen course and displays every published university/programme pair, including future offerings, rather than scrolling inside Home or searching for an abbreviation anywhere in the text. A programme without a course relation uses its exact programme slug as a fallback. The shareable URL retains selection on reload; search, course/mode/level/stream filters, chips and pagination remain available.

Both Home and the listing share the catalogue-only loader. It fetches all CMS pages, joins each programme to all of its published universities, keeps each university's own fee and deduplicates relation repeats. Listing pagination runs after that join. It does not fetch Home, mentors, News or Blogs. The featured hero remains the CMS-authored university/programme pair, independent of the visitor's choice.

Home and listing product cards share a university-first layout: a separate ivory header with the complete official wordmark, a readable institution name below, then ruby degree typography, full programme name, mode/level, a compact duration/mode strip and one bottom-aligned fees/eligibility CTA. Logo proportions are preserved; Chandigarh's white official wordmark uses a ruby plaque for contrast. Published syllabus links and homepage comparison controls remain functional. The hero uses the same readable identity block.

The existing published LPU Online MBA is explicitly appended as the fourth homepage product through the guarded backend helper `scripts/add-rs-fourth-featured-offering.mjs`. The first three selections and all other Home fields/hero relations remain unchanged. Home uses four columns from 1200px, two on tablet and one on mobile. The single available study mode is presented as an informational Online label; the mode selector returns automatically when multiple published modes exist.

The former three ruby service boxes become a compact light navigation row with visible arrows and existing working destinations. On mobile these links form a short vertical list. Header/mega-menu work remains deferred.

Verification and current screenshots for this correction are saved under `qa/finder-card-correction/`; repeat with `RS_VERIFY_UI=1`, `RS_AUDIT_LABEL=after`, `RS_AUDIT_DIR=finder-card-correction` and `RS_TOP_PRODUCTS=1` before running `node scripts/audit-homepage-ui.cjs` against frontend 3001 and CMS 1338.

Final production verification passed: compilation, TypeScript and all 59 generated pages; targeted ESLint and diff checks; nine browser interaction groups with no runtime errors or horizontal overflow at 360, 390, 768, 1031 and 1440px. MBA, BBA and MCA each open the exact-course listing; MBA includes both MUJ and LPU, search clearing retains the MBA filter, and product CTAs preserve their university/programme pair. Four initial homepage products share one wide desktop row. All hero/product logos load. Comparison selection/limit/clear, details/focus restoration, homepage filters/reset and existing editorial/guidance links remain functional. Read-only catalogue checks additionally covered 101 programmes with two university relations, pagination after joining, relation deduplication and university-specific fees. Visual review of desktop/mobile Home and MBA listing found no material layout issue; the CU plaque is applied only when its actual image exists so fallback initials stay readable.

### Compact hero and CMS-selected programme carousel — verified 11 October 2026, preceding iteration

This revision followed the user's compact-layout and square-logo correction. Its verified measurements and checks below describe that iteration; the subsequent card-density correction supersedes its homepage filter, logo-size and arrow-placement details. The same ruby/ivory identity and reference hierarchy remain. Hero copy, finder, actions and featured offering use a compact responsive layout with normal content flow; CMS slider/media options and the exact university/programme destination remain available.

Home programmes are one ordered, editor-selected carousel. Filters refine those selected products only, without inserting unselected catalogue offerings or a second grid row. Four cards are visible from 1200px, three at 901–1199px, two at 641–900px and one below 641px. Native touch/trackpad scrolling, Previous/Next buttons and focused left/right keys browse the remaining selections. No autoplay. Filters and CMS reordering reset to the first selected card. A single available mode is a compact informational label; multiple modes retain their working selector. The authored footer action label/visibility is preserved, and its destination is the full `/programs` listing.

The shared hero/product identity uses a 48px square slot beside the university name. University `card_logo` is a separate optional media field: the full `logo` and `fav_icon` remain untouched. Four official institution marks are configured locally; missing card marks safely use the existing logo contained within the slot, then initials. Original pixels and institution colours are preserved. Backend source/proof and CMS instructions are in `../rs-education-backend/docs/card-logo-sources.json` and that repository's README (sibling repository path from the frontend root).

Verified production build, TypeScript, all 59 pages, targeted ESLint and diff checks passed. Real CMS/browser checks passed at 360, 390, 768, 1031 and 1440px: no document overflow, all hero/product images loaded, responsive card counts, arrows/keyboard, tabs/filters/empty-result reset with focus restored, comparison selection/limit/clear/details, exact MBA/BBA/MCA listing destinations and exact product CTAs. An isolated test of the actual carousel with seven synthetic products additionally verified both ends, mobile touch input, native card controls and filter/order resets without modifying CMS selections. Header/mega-menu implementation remains deferred.

At 1440px, hero height is 390px (previously 472px) and programmes 629px (previously 715px). At 390px, hero is 657px (previously 906px) and programmes 738px (previously 2,228px). The latter reduction comes from replacing stacked product rows with one swipeable row. Measurements refer to the current local sample content; longer authored CMS text grows naturally.

Evidence: `qa/compact-carousel/checks.json`, `after-layout.json`, five `after-products-*.png` captures and `qa/programme-carousel/checks.json`. Repeat `scripts/audit-homepage-ui.cjs` with `RS_VERIFY_UI=1`, `RS_AUDIT_LABEL=after`, `RS_AUDIT_DIR=compact-carousel`, `RS_TOP_PRODUCTS=1` while ports 3001/1338 run. Run `node scripts/verify-programme-carousel.cjs` for the isolated seven-product slider checks.

### Current homepage card-density correction — 11 October 2026

This correction is limited to Home. The header/mega menu remains deferred. Remove the irrelevant **More filters** control and its advanced-filter panel from the homepage. Keep the degree tabs and the study-mode selector when multiple modes are available; a single mode remains an informational label. Study-goal, duration and budget data/controls remain available in the backend and full catalogue. Removing the homepage panel does not remove catalogue records, CMS fields or listing capabilities.

Tighten homepage programme-card spacing and use a **40px square university-mark slot** beside the institution name. Keep the official artwork contained at its natural aspect ratio. Display **Mode + Level on the same card row**. Centre each duration/mode icon together with its complete fact group, rather than centring the icon independently of its label/value. Retain readable programme identity, the actual university-specific fees/eligibility destination, working comparison selection and safe published syllabus access. Do not introduce placeholder prices, unusable syllabus links or changes to the offering pair.

Place the carousel's Previous and Next controls as **44px circular buttons**, one on each side, at the vertical midpoint of the card row. Keep both buttons inside the programme section with **32px side gutters**. Preserve native swipe/trackpad scrolling, keyboard operation, disabled states at the ends and the existing responsive visible-card counts. Degree/mode filtering still refines the CMS-selected homepage offerings; the finder and listing continue to use the complete published catalogue.

Current evidence is under `qa/card-density/`: `checks.json`, `after-layout.json`, five focused `after-section-*.png` captures, homepage/product captures and MBA listing captures. Production compilation, TypeScript, all 59 generated pages, targeted ESLint and diff checks passed. Real-browser checks passed at 360, 390, 768, 1031 and 1440px: current curated programme sections are below 600px on desktop/tablet and 740px on mobile, with no document overflow. Duration/mode icons are centred against their complete label/value group; Previous/Next controls align at the opposite carousel edges and vertical midpoint. Independent desktop/mobile visual review found no covered text, CTA overlap or material layout issue. These measurements describe current local content; longer authored text can grow naturally without fixed-height clipping.

Programme tabs, CMS-selected ordering, carousel arrows/keyboard, comparison selection/limit/clear/details and exact MBA/BBA/MCA listing/product destinations passed. The actual seven-product carousel fixture additionally passed touch swipe, both end states, native controls and reset/reordering at all five widths; its updated source hashes and proof are in `qa/programme-carousel/checks.json`. Repeat the page audit with `RS_VERIFY_UI=1`, `RS_AUDIT_LABEL=after`, `RS_AUDIT_DIR=card-density` and `RS_TOP_PRODUCTS=1`. Earlier measurements above remain historical evidence for their dated iterations.
