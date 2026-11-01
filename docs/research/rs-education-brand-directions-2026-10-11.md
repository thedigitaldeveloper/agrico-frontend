# RS Education: a distinct student experience

Research and concept review: 11 October 2026.

Later review update: the user rejected the small concept previews and requested a complete HTML/CSS homepage. The current visual proposal is now the [full homepage prototype](../../prototypes/homepage/index.html), with [scope and validation notes](../../prototypes/homepage/README.md). The three directions below remain research history, not an approved design.

## The brief, clarified

The same student may visit RS Education and either existing platform. RS Education should be recognisable as a separate product through its first screen, navigation, typography, page structure, course results, detail pages and comparison experience. The user's reference to privacy means this visible separation. Repository visibility or concealing developer identity is not the design objective.

Keep course-first discovery. A student can start with MBA, BBA or another programme, then refine relevant institutions by mode, location, budget and specialisation. Mode remains optional; direct institution search is also valid. A programme selection must not force a compulsory mode wizard before results.

## Baselines actually inspected

The supplied location was G:\GEDU. G: was not mounted during this inspection. D:\gedu was available; its active metadata, header and public site identify it as **College Nirnay**. This is the older GEDU project used for the comparison below. The user's spoken name “College Room” is not independently verified as a separate site.

| Surface | Existing identity and composition | Consequence for RS Education |
| --- | --- | --- |
| D:\gedu / [College Nirnay](https://www.collegenirnay.com/) | Pink `#EC255A`, navy `#292C6D`, Outfit. The live homepage adds lavender navigation and a large photographic banner carousel. Source order: banner, regular university showcase, online university showcase, course stream browser, advice/editorial sections. Rounded logo-centred university cards. | Change the page silhouette, typography, institution presentation and initial content hierarchy. Another colourful photographic slider with logo cards would retain too much resemblance. |
| D:\geduconnect / RS copy baseline | Maroon `#5F1D2B`, gold `#E3AB3C`, Inter and Plus Jakarta Sans. Hero carousel, dense navigation, rounded cards, statistics, course finder, university wall and recurring CTA sections. | Introduce a quieter masthead, a clear course entry point, flatter surfaces, more purposeful spacing and different results/detail templates. |
| [College Vidya](https://collegevidya.com/) | Blue-and-white marketing-led homepage, promotional hero, programme tiles and advisor content. Its [Online MBA entry](https://collegevidya.com/suggest-me-an-university/?category_id=1&course_id=1&course_slug=online-mba) proceeds to specialisation in an already-online course context. | Keep relevant course context and accessible guidance. Do not borrow the visual composition or make Online the implicit default for a mixed-mode catalogue. |
| [Shiksha MBA](https://www.shiksha.com/mba-masters-of-business-administration-chp) and [Collegedunia MBA listing](https://collegedunia.com/course/master-of-business-administration-mba-human-resource-management-colleges-in-india) | Public course routes connect programme intent to institutions and practical refinements. | Course-first is a defensible navigation pattern, not evidence that every student follows one fixed sequence. |

Evidence files in D:\gedu: `src/app/globals.css`, `src/app/layout.js`, `src/app/page.js`, `src/components/HeaderClient.jsx`, `src/components/home/DynamicBannerSlider.jsx`, `src/components/home/UniversityShowcase.jsx` and `src/components/home/CareerSection.jsx`. The homepage imports DynamicBannerSlider; unused HeroBanner/HeroSlider files were not treated as proof of the current page.

College Nirnay's public desktop first screen was visually inspected. Its lower homepage sequence was checked in active source. The GeduConnect baseline comes from source because its local page returned a server error in the earlier inspection. Shiksha and Collegedunia blocked the isolated browser; their observations are from accessible public page content. Bachelorsportal also blocked the isolated browser, so no visual conclusion from that page is used. These are qualitative observations, not conversion research or student testing.

## Three proposed directions

| Direction | Palette | Typography | Layout and interaction | Trade-off |
| --- | --- | --- | --- | --- |
| **Academic Editorial — recommended** | Deep teal `#123F3B`, warm ivory `#F4F1E9`, soft lime `#D8E79E`, secondary text `#53605A` | Lora for selective display headings; DM Sans for controls and body | One-row navigation; asymmetric typographic hero; a dark course index; horizontal programme results; a compact optional study-format comparison after course choice | Strong separation from both inspected platforms. Needs careful mobile heading length and real client photography in later sections to avoid feeling too text-heavy. |
| **Modern Finder** | Graphite `#25262A`, white `#FFFFFF`, burnt orange `#C74721`, quiet surface `#F3F3F1` | Space Grotesk headings; DM Sans body | Dark masthead; centred search; degree shortcuts; direct, compact results and filter controls | Strong search utility and modern character. Less distinctive emotionally; orange-accented search portals are common, so typography and interaction must carry the identity. |
| **Course Desk** | Espresso `#352B25`, parchment `#FAF6EF`, pale sky `#D5E9F3`, secondary text `#696056` | Small Lora editorial introduction; Space Grotesk labels; DM Sans body | Narrow guidance column beside a degree directory; level filter; restrained horizontal rows and contextual study guide | Calm and information-focused. Less expressive as a large consumer brand, and the desktop directory needs a deliberate mobile stack. |

These concepts replace the earlier provisional Education Atlas/Campus Journal/Course Workspace palette suggestions. The recommended teal direction now uses a soft lime selection accent instead of amber, to create more distance from the maroon/gold baseline. None is a final logo or approved production design.

### Recommended colour roles

Use ivory for the main canvas, teal for the wordmark/headings/primary actions and one prominent course-selection surface, white for useful reading surfaces, and lime for a small selected-course highlight. Avoid turning every section into an unrelated colour block. Course modes should be named in text; colours must not be the only indicator.

Calculated light-theme text contrast pairs:

| Foreground / background | Ratio |
| --- | --- |
| Teal / ivory | 10.34:1 |
| White / teal | 11.67:1 |
| Teal / lime | 8.80:1 |
| Secondary grey-green / ivory | 5.83:1 |
| White / burnt orange | 4.83:1 |
| Espresso / parchment | 12.79:1 |
| Dark blue-grey `#243841` / pale sky | 9.77:1 |

These pairs exceed the WCAG AA minimum of 4.5:1 for normal text. They do not establish whole-page conformance; final controls, focus states, photography, errors and disabled states still require checking. [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Distinction beyond the homepage

| Template | Proposed RS Education behaviour and composition |
| --- | --- |
| Navigation | A shallow, course-led navigation structure with institutions and guidance as clear alternatives. Degree search should be easy to reach without reproducing the inherited multi-layer mega-menu. |
| Results | Horizontal offering rows with course, institution, mode, location and fee basis in a consistent reading order. Desktop refinements beside results; a mobile filter sheet with visible selected filters. Preserve direct institution entry. |
| Programme/institution detail | Readable overview followed by anchored sections. Show actual offerings by mode and campus, then admission-session facts. Keep enquiry associated with the exact selected offering. |
| Compare | Compare programme offerings, including mode and location. Group fees, schedule, admissions and recognition evidence. Provide a focused two-option view on phones. |
| Guidance/enquiry | Invite a question after useful context is visible. Keep the chosen course and offering in the form. Distinct tone, field order, success state and follow-up copy. |
| Imagery and brand | An original wordmark, distinct crop/composition rules, selected real learning/campus imagery and clear language. Avoid the same graduate cutout, stock portrait, decorative badges and repeated banner claims. |

The UI review should cover homepage, results, detail and comparison on desktop and mobile. Compare them with the two baseline projects with logos hidden, then in grayscale. If page structure and reading order remain recognisably alike, revise them before polishing colour. This is a practical review exercise; student perception still needs real feedback.

## Regular, Distance and Online remain a data concern

The earlier audit remains applicable: course-mode taxonomy and programme filtering exist in the copy, but the offering/fee contract, university-list mode filtering, campus and study-centre fields, session context and several online-biased defaults need work. These concepts depict navigation and visual identity, not a functioning catalogue or confirmed programme availability.

Use institution + programme + mode + location as the offering identity, with session-specific fees, admissions and recognition evidence. Keep Full Time/Part Time separate from Regular/Distance/Online. Do not treat a general university approval as proof that every programme and mode is available for an admission session. The implementation plan belongs in the next planning pass after reviewing the other chat's completed upstream changes.

## Concept checks and next decision

Three interactive homepage directions were prepared for in-conversation review. They use sample courses and local state, with no live institution data, fees, ratings, applications or lead submission. Desktop and mobile geometry, theme adaptation, course selection, mode guidance, degree-level filtering and sample course search were checked. Final application implementation has not begun.

Recommended next decision: choose Academic Editorial as the brand direction, then design one real course-results page, one offering-detail page and a mobile comparison flow before extending the homepage. This will test the distinct identity across the actual student journey.
