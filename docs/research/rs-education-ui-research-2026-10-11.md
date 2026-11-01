# RS Education UI and catalogue research

Research date: 11 October 2026. Planning handoff for 12 October 2026.

Same-day follow-up: completed source changes through frontend `be6831e` and backend `4d125fa` were imported after this baseline audit. Those updates remove multiple sample fallbacks, align program pricing with university `program_fees`, refresh published CMS/media content and improve the editor. Treat the original code-gap notes below as historical findings and recheck the updated source before planning fixes. The user also rejected the initial small design concepts; the current proposal is the [complete HTML/CSS homepage prototype](../../prototypes/homepage/index.html).

RS Education should use course-first discovery, with Regular, Distance and Online available as prominent refinements within each course. Direct institution search and mode landing pages provide additional entry paths. The copied application contains useful catalogue foundations, but it is not yet a complete platform for all three modes. Its public experience is strongly oriented toward online education. The strongest proposed direction is a course explorer with its own navigation, page composition, result cards and enquiry journey. Choosing a mode must not be a compulsory first step.

This is research and a proposed direction, not an approved design or implementation plan. Application code and CMS schemas were not changed. No RS Education database has been provisioned, so existing schema support is distinguished from populated content and verified runtime behavior.

## What the reference platforms suggest

| Reference | Observed pattern | Proposed lesson for RS Education |
| --- | --- | --- |
| [College Vidya](https://collegevidya.com/) | Comparison is prominent in the header. The captured homepage uses blue accents, a wide promotional hero, advisor credibility content and grouped programme tiles. | Make comparison discoverable and explain the value of guidance. Build an original visual identity and a different first-screen composition. |
| [Collegedunia](https://collegedunia.com/) | Public homepage content organizes discovery around study goal, city, courses, exams, rankings, reviews and comparison. | Regular students need location and admissions context early in their journey. Keep the initial navigation smaller than a large directory. |
| [Shiksha](https://www.shiksha.com/) | Public navigation connects disciplines to colleges, entrance exams, reviews, questions and admission tools. | Connect courses to admissions and practical decisions. Predictors require reliable data and should not be included merely as a visual feature. |
| [IGNOU admissions information](https://www.ignou.ac.in/announcement/MediaRelease?nav=210) | The university publishes distinct admission entry points for ODL and Online programmes. | Keep Distance and Online visibly distinct even when the awarding institution is the same. |

These are observed navigation/content patterns, not evidence of higher conversion rates. College Vidya desktop and mobile screens were inspected at 1440 and 390 pixels. Some images did not load in the research session. Collegedunia and Shiksha blocked the isolated browser, so their observations are based on accessible public page content; their live mobile interactions were not verified. The College Vidya dashboard entry did not expose a complete comparison journey in the unauthenticated session.

### Verified course discovery entry paths

The follow-up inspection supports course/goal-first discovery as the proposed default for RS Education. These are available navigation paths, not analytics establishing how most students behave.

- **Shiksha:** its public MBA navigation places MBA/PGDM, Distance MBA and Online MBA alongside specialisations, colleges and exams. The [MBA course hub](https://www.shiksha.com/mba-masters-of-business-administration-chp) provides course information and college options. A visitor can enter through a course or directly through a college search; an initial mode selection is not required on the inspected public route.
- **Collegedunia:** the homepage exposes study-goal categories such as Management with MBA/PGDM, plus general search. A [course-specific college listing](https://collegedunia.com/course/master-of-business-administration-mba-human-resource-management-colleges-in-india) offers location, fee, specialisation and study-format refinements. This supports a course-to-college-list path rather than a mandatory mode-first sequence.
- **College Vidya:** the observed homepage Online MBA card links to a course-prefilled recommendation flow. Opening [that exact entry](https://collegevidya.com/suggest-me-an-university/?category_id=1&course_id=1&course_slug=online-mba) displayed specialisation choices and Help Me Decide. Online is already part of the selected course context; the student was not first asked to choose among Regular, Distance and Online. No personal details were entered and the later questionnaire was not completed.

Proposed default: course/degree → relevant offerings, with mode, location, budget and specialisation refinements → shortlist/compare → guidance. Keep direct institution search and optional mode shortcuts. A course page should expose relevant results immediately rather than making every refinement a separate compulsory wizard step.

## What the copy already supports

Frontend snapshot: `51bbd5cad74835ffd7ed1c9482cd0836a8234003`.
Backend snapshot: `af304d40319bf7698fe99903adac1406292bb2ea`.

| Capability | Current support | Practical consequence |
| --- | --- | --- |
| Study-mode taxonomy | `course-mode` has editable name and slug. Seed fixtures include Full Time, Part Time, Online and Distance. | Modes are not hardcoded to Online in the schema. Seed fixtures do not establish what exists in a live CMS. |
| Mode on programmes | `program.course_mode` exists; programme queries filter by its slug. | A programme listing can already filter a configured mode. |
| Mode on universities | `university.course_modes` exists and is populated on the detail response. | A university can be described with mode relations, subject to reviewing relation cardinalities. |
| Programme listing and homepage finder | `/programs` has a Mode filter. The homepage finder stores mode values and exposes choices when more than one mode is present. | Useful logic can be reused behind a newly designed interface. |
| University discovery | Repository supports stream, ownership, approval, state, city and search; listing UI exposes only some of these. There is no mode query parameter in the repository. Card population also omits `course_modes`. | A working university mode filter requires frontend queries and API/card data changes. |
| Courses and specialisations | Course, level, stream, programme, duration and eligibility structures exist. | The academic catalogue does not need to start from zero. |
| Fees | University has repeatable `program_fees` entries containing programme, fee and note. Frontend programme pages instead expect `program_offerings` with richer fee information. | The copied baseline has a contract mismatch. Adding a new mode would not resolve fee comparison. |
| Admission content | Exams, eligibility, brochures and flexible content sections exist. | Useful general content foundation; structured session-specific admission rules are missing. |
| Campus and distance support | University address and campus-tour content exist. No dedicated campus entity, programme-to-study-centre mapping or structured attendance/exam-travel requirements were found. | Regular and Distance discovery need additional structured fields. A campus video is not a campus data model. |
| Enquiries | Lead can reference university and programme. | It cannot reliably identify a particular campus, intake and offering. Extend the submission contract with the new catalogue model. |
| Search and comparison | Search groups universities/programmes/courses; comparison is primarily university based. | Mode, campus, session and fee basis need to remain visible and stable through search, shortlist, comparison and enquiries. |

### Code evidence

Frontend paths below are relative to this repository:

- `src/lib/cms/repositories/program.ts:93` and `:112`: mode parameter and filter; `:45` and `:83`: expected offering contract.
- `src/app/programs/page.tsx`: mode filter wired into the listing.
- `src/components/home/course-finder-data.ts:82` and `course-finder.tsx:123`: mode data and conditional filter choices.
- `src/lib/cms/repositories/university.ts:95`: university list parameters and filters without mode.
- `src/components/program/program-detail-view.tsx:145`: consumes `program_offerings`.
- `src/components/program/program-hero.tsx:64`: missing mode defaults to Online; nearby code synthesizes a 4.8 rating fallback.
- `src/components/program/program-facts.ts:26`: duration fallback infers duration from online-oriented slugs.
- `src/lib/cms/repositories/navigation.ts:32` and `:86`: default recognition label and hardcoded fee labels.
- `src/lib/cms/repositories/search.ts`: search contract lacks mode/campus/session context.
- `src/app/page.tsx`, `src/app/globals.css`, `src/components/layout/site-footer.tsx`: inherited layout, maroon/gold identity and online-focused copy.
- `src/app/robots.ts:11`: indexing currently permits only the old GeduConnect production hostname.

Backend evidence in `D:/rs-education-backend`:

- `src/api/course-mode/content-types/course-mode/schema.json` and `scripts/seed-dev.ts`.
- `src/api/program/content-types/program/schema.json:72`.
- `src/api/university/content-types/university/schema.json:117`.
- `src/components/college/program-fee.json` and `src/utils/populate.ts:109`.
- `src/api/enquiry/content-types/enquiry/schema.json`.

The mode relation on programme is currently `oneToOne`; university modes use `oneToMany`. Shared taxonomy values normally call for many programmes to one mode and many universities to many modes. Confirm the installed Strapi relationship behavior and migration requirements before bulk content entry; no live relation-reassignment test was performed in this research.

## The catalogue pattern to plan around

Use one institution identity and keep its individual study options explicit. “This university offers Online and Regular education” does not prove that each of its degrees is offered in both modes.

The proposed record students compare is an **offering**: a specific institution, programme, study mode and delivery location. Its admission sessions hold the changing fees, deadlines and recognition evidence.

```text
Institution ─┬─ Campus or approved learning-centre references
             └─ Offering ─┬─ Programme and specialisation
                          ├─ Study mode
                          ├─ Campus or learning-centre coverage, where applicable
                          └─ Admission session ── Fees, eligibility, dates and evidence
```

For example, a fictional Sample University might offer MBA Finance in Online and Regular modes, but MBA General in Distance mode. Each can have different fees, class requirements and application dates. These are separate offerings under one institution, not three unrelated university copies. They must not inherit one another's fee or approval simply because the institution matches.

Keep the current course/degree and programme/specialisation taxonomy where it fits. Audit existing online-prefixed names/slugs and map old records before normalizing them; do not rename or merge them blindly. A separate `program-offering` content type is the recommended direction because the university-programme pair now needs more information than a price. The current repeatable fee component could work for a very small catalogue, but becomes awkward for campus, mode, intake and historical changes.

Separate these dimensions:

- **Study mode:** Regular/on-campus, Distance/ODL, Online.
- **Study schedule:** Full time, part time, weekend or other published schedule.
- **Class delivery:** Campus sessions, live classes, recordings, self-study or a documented combination.
- **Assessment:** Actual examination location/method and any practical or contact-session requirements.

“Full Time” is not a reliable synonym for Regular, and Online must not automatically imply no physical examination. Use explicit published requirements. The UI labels may be friendly, while the underlying mode codes remain stable.

### Proposed minimum fields

| Entity | Fields needed for the first dependable version |
| --- | --- |
| Institution | Identity, institution type, official website, logo, general recognition evidence, location and available offerings. Keep awarding institution distinct from an affiliated college or learning centre when those are in scope. |
| Programme | Degree/course, specialisation, level and subject taxonomy. |
| Offering | Institution, programme, mode, campus/centre coverage where applicable, duration range, delivery schedule, teaching language, examination/attendance requirements and source URL. |
| Admission session | Session label, application status and dates, exact eligibility, entrance requirements, tuition and mandatory extra charges, fee basis, currency, source URL and last verification date. |
| Recognition evidence | Programme, mode and session coverage, recognition/entitlement status, official evidence URL and verification date. |
| Enquiry | Offering and session identifiers, selected mode/location plus existing consent and contact fields. |

Public comparison should normalize tuition to a clearly labelled basis where enough data exists. Show hostel, travel and other costs separately. A missing fee is “Not published”, not zero. Do not estimate EMI, placement outcomes or ratings merely to fill a card.

For ODL/Online, recognition is session-sensitive. UGC's official FAQ directs students to verify the admission session and warns that a previous year's recognition does not establish the next session's status. This supports storing programme/mode/session evidence rather than showing one blanket badge for every course. See [UGC DEB FAQ](https://debold.ugc.ac.in/FAQ) and the [official 2025 student notice](https://deb.ugc.ac.in/Uploads/Notices_Upload/UGC_20250919164025_1.pdf). Historical notice deadlines must not become current admission dates.

## Proposed student journey

Start with course search and familiar degree shortcuts such as MBA, BBA, BCA and B.Tech. Provide “Help me choose a course” for undecided visitors. Display Regular, Distance and Online choices within the course context, alongside other relevant filters; support direct institute search as an equally accessible shortcut.

| Selected path | First useful filters | Card facts | Detail sections |
| --- | --- | --- | --- |
| Regular | Course, preferred city/state, budget, entrance exam, institution type | Actual campus, tuition basis, duration, entrance requirement, admission status | Campus and facilities, course fees, eligibility/exams, admissions, accommodation and sourced outcomes |
| Distance | Course, state/centre coverage, budget, language, required travel | ODL label, study support, contact-session requirements, examination arrangements, tuition basis | Study material, learning support, required attendance/travel, assessment, fees and session recognition |
| Online | Course, budget, eligibility, class schedule, language | Live/recorded structure, examination requirements, duration, tuition basis | Learning delivery, schedule, assessments, support, fees and session recognition |

Shared journey: **choose/search a course → view offerings and refine mode/location/budget as needed → save a shortlist → compare the same degree and fee basis → request guidance for the selected option**.

Persist the selected course and any selected mode in URLs and navigation. A visitor who arrives directly on a Distance result should keep that context through details and enquiry. Clearing a filter should be explicit. Switching modes must refresh result counts, available filters, displayed fees and the selected offering; it must not merely recolor a badge.

Allow cross-mode comparison intentionally. Keep a common cost/duration/eligibility summary and show mode-specific differences below it; use “Not applicable” when appropriate. A regular campus placement statistic must not appear as the outcome of its online offering.

## Information architecture proposal

Proposed main navigation: **Explore Courses · Colleges and Universities · Compare · Admission Guides · Talk to an Advisor**. Put mode selection within discovery and its landing pages. Keep shortlist available on desktop and mobile.

Proposed routes for discussion, not a committed migration:

- `/study/regular`, `/study/distance`, `/study/online`: curated mode landing pages.
- `/courses/mba`: a mode-neutral degree guide with available paths.
- `/explore?mode=distance&course=mba`: shareable filtered results.
- `/institutions/{slug}`: institution overview and its actual offerings.
- `/offerings/{stable-slug}`: the specific programme, mode and location, with session selection.
- `/compare`: selected offering identifiers, not only university names.

Keep the existing URLs until redirect, canonical and sitemap rules are designed. Index useful curated pages; control combinatorial search/filter pages deliberately. The inherited old-domain-only robots rule must be replaced before a future RS Education launch.

## Three distinct visual directions

The follow-up [brand direction brief](rs-education-brand-directions-2026-10-11.md) incorporates the older GEDU/College Nirnay baseline and the user's clarification: the same student should experience recognisably different platforms. These are design hypotheses for tomorrow, not validated preferences.

| Direction | Visual language | First screen and browsing structure | Trade-off |
| --- | --- | --- | --- |
| **Academic Editorial — recommended starting point** | Deep teal `#123F3B`, warm ivory `#F4F1E9`, soft lime `#D8E79E`; Lora display headings and DM Sans body; crisp panels and limited shadows | Asymmetric typographic introduction, a dark course index, optional study-format guide and horizontal offering rows | Changes typography and composition as well as colour. Main light-theme text pairs were contrast-checked in the follow-up brief; whole-page accessibility remains to be verified during implementation. |
| **Modern Finder** | Graphite, white and burnt orange; Space Grotesk headings and DM Sans body | Dark masthead, centred course search, degree shortcuts and compact results | Direct and efficient; a familiar search-portal pattern, so typography and interaction need to carry the brand. |
| **Course Desk** | Espresso, parchment and pale sky; restrained editorial and directory typography | Narrow guidance column beside a degree directory with contextual study-format guidance | Calm and distinctive in structure, but less expressive as a mass-market brand. |

The original app uses maroon/gold, Inter/Plus Jakarta Sans, rounded cards, a hero carousel, trust metrics, course finder, university wall, comparison band and a long repeated marketing-section sequence. RS Education should establish a different composition as well as a different palette.

For Academic Editorial, explore this homepage sequence: course search and degree shortcuts; a short guide to choosing a course and its study mode; relevant course collections; location-based Regular discovery; transparent comparison examples; admission guides; a focused advisor invitation. Avoid reusing the original hero-carousel composition, university logo wall placement, card silhouette, dense mega-menu and repeated CTA bands.

Use original brand assets, course copy and a distinct tone. Prototype typography with at most two font families, then test legibility rather than selecting fonts solely for novelty. Do not copy reference-platform imagery, logos or proprietary page compositions into RS Education.

## Page and mobile behavior to sketch tomorrow

Prepare desktop and mobile sketches for four templates: homepage, offering results, offering detail and comparison. These reveal the site's identity more reliably than a homepage alone.

- **Results:** readable horizontal rows on desktop; stacked facts on mobile. Mode/location sit close to the course name. Primary action opens details; shortlist is secondary. Sorting names its basis.
- **Detail:** compact fact summary and anchored content navigation. Show institution and exact mode before price. A contextual guidance action remembers the selected offering/session.
- **Comparison:** pin option names, group matching facts and offer “Show differences”. On phones, use a two-option view or a labelled horizontal table with sticky headers; do not shrink a desktop table into unreadable text.
- **Forms:** ask for contact details when the student requests advice. Browsing and comparison should work before sign-in. Preserve the user's selected mode/course instead of asking them to enter it again.
- **Mobile navigation:** shallow menu, accessible filter sheet, visible active filters and shortlist count. Sticky actions must leave content and controls reachable.
- **States:** include no results, missing fees, unpublished sessions, unavailable modes and loading/error views. Mode must be communicated with text, not color alone. Keyboard focus and comfortable touch targets are part of the design.

A useful review exercise is to hide the logo and compare grayscale screenshots of the two products across all four templates. If the silhouette, information hierarchy and interaction sequence still look the same, the redesign has not met this client's requirement. This is a qualitative design check, not a guarantee about every visitor's perception.

## Work to reuse and work to change

Reuse the CMS content foundation, content rendering, API utilities, pagination, responsive primitives and appropriate authentication/enquiry logic after the outstanding source fixes are reviewed. Reuse should happen below the visible composition; sharing utilities does not require sharing screen layouts.

Change the navigation model, homepage sequence, cards, listing controls, detail layout, comparison unit, form flow and brand voice. Repair the offering/fee contract and normalize modes before importing substantial catalogue data. Carry the new offering identifier through search, shortlist and enquiries.

The CMS admin is not the main public brand surface, but visitors still see API-provided content, media, contact details, social previews and form destinations. Separate client databases, media storage, domains, analytics, notification recipients and secrets are still needed. Inspect inherited source names in metadata, logo alt text, WhatsApp messages, legal copy and emails as part of future launch work.

The other chat's fixes are not automatically present in these RS Education snapshots. Fetch and review the completed upstream changes before implementing overlapping fee, fallback or cache fixes; do not duplicate work against the older copy.

## Decisions for the next planning session

1. Which degrees and learner goals should be emphasized at launch, and what is the client's actual catalogue split across modes?
2. Which states/cities and learner languages are in scope? Are affiliated colleges and learning centres included?
3. Select one visual direction, then review the four page templates in desktop and mobile form.
4. Confirm logo, brand assets, final domain, business contact details and advisor workflow.
5. Approve the offering/session model and content responsibilities before bulk data entry.

The suggested first implementation slice is one representative institution with distinct Regular, Distance and Online offerings using clearly labelled test content. Confirm that fees, recognition, search context and enquiries stay attached to the selected option, then extend to the catalogue. No prediction engine, artificial ratings or large dashboard is needed for that slice.

## Research boundaries

No application code, original-project files, database, live content or running server settings were changed. The running original homepage returned a server-error state during the observation, so its visual baseline here comes from source components and design tokens. No fix was attempted in the other chat's workspace. Detailed authenticated competitor flows and live CMS data behavior remain outside this research pass.
