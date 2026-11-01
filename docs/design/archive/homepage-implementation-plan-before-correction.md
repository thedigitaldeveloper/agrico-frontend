# RS Education: approved homepage and implementation plan

Date: 11 October 2026. Colour identity and overall look approved by the user. Section layouts may be refined within this direction. This plan supersedes previous colour explorations, the Academic Editorial widget and the rejected HTML prototype.

## Exact design lock

**Rich Ruby Red + Warm Ivory** is the last generated red homepage, delivered as two successive images of one page. These are the source of visual truth:

- [Upper homepage reference](references/ruby-ivory-homepage-upper.png)
- [Lower homepage reference](references/ruby-ivory-homepage-lower.png)
- [Machine-readable design lock](design-lock.json)

| Role | Colour |
| --- | --- |
| Main actions, highlights, service and feature bands | Rich Ruby Red `#A22334` |
| Main canvas | Warm Ivory `#FCFAF5` |
| Cards and raised surfaces | White `#FFFFFF` |
| Alternating light sections | Soft Stone `#F2EEE8` |
| Dividers and borders | Warm Stone `#E6DED5` |
| Body text and supporting labels | Warm Grey `#6B6260` |

Keep ruby substantial and confident. Use light surfaces around it to preserve legibility. Use a strong editorial serif for major headlines and a clear sans-serif for body text, navigation and forms. Lora with DM Sans is a suitable implementation starting point; match the approved image proportions rather than treating this font suggestion as another design direction. Derive only accessible interaction states from the locked colours. White text on ruby is the primary button treatment. No black/charcoal surfaces, gold brand accents, pink, green, teal or orange theme. University logos retain authentic colours.

Desktop: approximately 1200-1280px content width, 24-32px grid gaps, 72-96px section separation, 20-28px card padding. Mobile: 20px side gutters, 40-56px section separation, stacked layouts, readable 16px body copy and 44px minimum interactive targets. These are implementation dimensions and can be refined in browser review. Avoid gradients to black, oversized pill containers, decorative clutter and squeezing lower content to shorten the page.

## Working location and current state

- Frontend: `D:\rs-education-frontend`, origin `thedigitaldeveloper/rs-education-frontend`.
- Backend: `D:\rs-education-backend`, origin `thedigitaldeveloper/rs-education-backend`.
- Development ports: frontend 3001, CMS 1338.
- Work only in these RS repositories. User explicitly wants a separate RS Education Codex project/chat. The original GeduConnect and GEDU repositories are reference-only.
- Before this plan, frontend main was `a5a7bae`, backend main `f3a2f86`. Both include the previously requested source updates. Recheck status before starting; preserve subsequent user work.
- Do not repeat clone/import operations. Keep RS environment values, secrets and app identity separate. A separate XAMPP database `rs_education` is now provisioned with an isolated application account. Local CMS and student login are connected; see `docs/development/local-setup.md`.
- `codex app D:\rs-education-frontend` was attempted; the user reports that it did not open the project. The user subsequently added the RS Education backend project and moved this existing chat into it; no new chat should be created.

## Student and business journey

The first decision is what to study. Start with the degree/programme, then refine study mode and university. Support direct university discovery as a secondary path. Never require Online/Distance/Regular selection before showing programmes.

Merchandise a curated collection of roughly 4-6 universities and their actual offerings. A small catalogue should feel considered and complete, without claims about hundreds of choices. Avoid stream-first mega directories. Every product card represents a university and programme, with the actual mode, duration and applicable fee context. An MBA from one university is a different selection from the same degree elsewhere.

Primary conversion: discover programme -> view its fees and eligibility -> compare if needed -> enquire with that selection intact. Use one visually dominant CTA per card. Editorial content supports this journey instead of competing with it.

## Section-by-section build specification

| Order / section | Layout and purpose | Content and interaction | Data / small-catalogue behaviour |
| --- | --- | --- | --- |
| 1. Header | Light, compact RS identity; clean navigation with one ruby counselling action. | Programmes, Universities, Compare, News, Blogs. Search can be a compact control. Accessible mobile menu. | Use real routes and RS contact/settings. Audit inherited GeduConnect assets and copy. Do not expose empty navigation categories. |
| 2. Hero + programme finder | Split composition: editorial headline left, authentic campus image right, a white featured-offering card over the image. | Heading direction: Your degree. Your next big move. Programme chips such as MBA/BBA/BCA/MCA only when relevant. Find my programme goes to filtered choices. The offering card goes to its own details. | CMS hero content and a selected offering. One slide is static. If multiple slides are configured, keep this same composition with labelled previous/next and pause controls; do not make a new visual design. Preserve text readability on all media. |
| 3. Guidance band | Three concise service promises in one ruby band; stack naturally on mobile. | Explore programmes, compare your options, get admission guidance. Each action has an actual destination. | Descriptive benefits, not fabricated numbers, endorsements or rankings. |
| 4. Selected programmes | Three substantial typography-led white cards per desktop row; full-width stacked cards on phones. Programme tabs first, study mode secondary. | University logo/name, degree and expansion, level, actual mode, duration, useful short description, syllabus link when available. Primary: View fees & eligibility. Optional compare checkbox. | Build from actual university-programme relationships. Curate rather than duplicate generic degree cards. Up to six featured choices. Missing syllabus means no download action; missing fee means ask for current fees, never zero or invented pricing. |
| 5. Explore universities | Four generous profiles in a 2x2 desktop grid, photo and information side by side. One column on mobile. | Authentic campus/photo, university identity, location and a short list of available programmes. Explore university is the main action. | Prefer four actual universities; use an attractive two- or three-item layout when that is all the catalogue has. Never repeat a university to fill space. |
| 6. Programme spotlight | One rich ruby promotional panel with separate photo region and strong course identity. | Selected university + programme + actual mode/duration, concise benefits and View programme details. | A deliberately chosen offering. Example references show Manipal University Jaipur MBA, but examples are not a claim of a commercial partnership. Hide when no supported selection exists. |
| 7. Comparison | Spacious light section with two selected offering panels and a concise comparison table. | University, programme, mode, duration, fees with basis, eligibility and a route to full details. Allow changing selections; require two different valid offerings. | Existing comparison is mainly university-based. Reuse it only when accurately labelled. Offering-level comparison must key by university + programme + mode, not compare two arbitrary universities under programme labels. Unknown values stay explicitly unavailable. |
| 8. Admission guidance | Three numbered steps with useful copy and generous spacing. | Choose a programme -> discuss your options -> get application support. Guidance CTA opens or scrolls to the enquiry form. | Reuse editable home steps with RS wording. No guarantees of admission or placement. |
| 9. News & updates | One large leading story and two substantial stacked stories. It must read as a complete section. | Real headline, published date, brief summary, Read update and View all news. | Fetch the `news` section (News and Press release types). If content is absent, hide this block in the public page; use labelled fixture content only in local visual preview. |
| 10. From the RS blog | Three editorial image cards with distinct titles and clear reading actions. | Read blog and View all blogs. Useful programme selection, mode comparison and application guidance topics. | Fetch `blogs` (Blog type). Do not relabel Articles as Blogs, merge the feeds or invent publication dates. |
| 11. FAQ | Two-column composition: brief intro left and roomy accordion right. Stacks on mobile. | Programme choice, modes, fees, documents, comparison and counselling; keyboard-operable questions. | Reuse published FAQ data. Only emit FAQ structured data for answers visible on the page. Avoid hardcoded unverified university rules. |
| 12. Callback | Ruby panel with concise assistance copy and a readable white form surface. | Name, email, phone, optional programme selection; Request a callback. Consent starts unchecked. Show inline errors and genuine submission success/failure. | Existing enquiry contract requires name, email and phone. Preserve the selected university and programme identifiers. Do not omit email just because the generated reference did. No fake success on CMS failure. |
| 13. Footer | Complete light footer with comfortable column spacing and RS identity. | Programme/university discovery, News, Blogs, About, Contact, privacy and terms; real contact details only. | Audit old logos, domain/phone references, social links and legal identity. Omit absent contact fields instead of publishing placeholders. |

## Existing architecture and targeted changes

The frontend uses Next 16.3.4, React 19 and Tailwind 4. Read relevant installed docs in `node_modules/next/dist/docs/` before writing code. Keep the homepage as a Server Component that assembles published CMS data. Isolate client code to interactive controls: programme filters, comparison, optional slider, menu, FAQ as needed and form.

Current entry points:

- `src/app/page.tsx`: replace inherited section assembly with the approved order. It currently requests Articles and still has GeduConnect metadata fallback; these need RS-specific changes.
- `src/app/globals.css`: inherited maroon/gold/charcoal palette. Map shared semantics to locked RS tokens, audit hardcoded colour utilities and validate other routes after a global change. Merely adding new tokens without removing visible old colours is insufficient.
- `src/app/layout.tsx` and `src/components/layout/*`: typography, RS header/footer and identity.
- `src/lib/cms/repositories/home.ts`: reuse existing home configuration for hero, FAQs, steps and headers. Add typed RS curation/config fields when needed instead of encoding arbitrary university order in presentation code.
- `src/lib/cms/repositories/program.ts`: programme filters and university relationships exist. `ProgramOffering` is currently a display adapter built from university fee rows, not an independent CMS offering record.
- `src/lib/cms/repositories/university.ts`: card response lacks campus images and detailed offering information. Extend the server population/read model deliberately; avoid a large unbounded waterfall of detail requests.
- `src/lib/cms/repositories/blog.ts`: separate `news` and `blogs` queries already supported. Keep their collection cache invalidation.
- `src/components/forms/enquiry-form.tsx` and existing API routes: reuse validated submission and consent behaviour while applying the new form layout.
- Backend `src/api/home/content-types/home/schema.json`: existing hero, sections, steps and FAQs; RS additions should be additive and purposeful.

### Regular, Distance and Online

All three modes are in scope for the client, but the cloned catalogue is not yet a complete multi-mode offering system. Programme `course_mode` is currently one-to-one, and several taxonomies also have restrictive relations. Inspect data and migration consequences before changing cardinalities. A university's available modes must not imply that every one of its programmes has all those modes.

For the first homepage, show only the mode actually stored on a programme-university choice. Carry that identity into detail, compare and enquiry. Represent campus, intake, attendance/contact sessions, exam location, fee basis and recognition evidence only where verified data supports them. Do not infer Regular from Full Time or assume Online means no in-person requirements.

Plan a dedicated offering record when the catalogue needs multiple modes/campuses/intakes for the same university-programme pair. That is an explicit data-model extension, not something solved by adding three filter buttons. Existing research in `docs/research/rs-education-ui-research-2026-10-11.md` provides background; recheck historical findings against the updated code.

## Execution sequence

1. Continue in this existing chat, moved by the user into the RS Education project. Read this plan and both images. Work on a `codex/rs-homepage-ruby-ivory` branch or equivalent while preserving any subsequent local work.
2. Implement theme primitives, RS header/footer and static split hero. Match desktop and mobile composition before filling the entire page.
3. Build the programme and university cards, selection identity and filtered navigation; add one spotlight. Curated CMS records determine ordering.
4. Implement comparison accurately, guidance steps, separate News and Blogs, FAQ and callback submission.
5. Add only necessary backend configuration/read-model changes, maintain RS isolation, and document any unapplied schema/data migration. Use the real RS CMS if configured. A local fixture preview can support visual review but must not silently become production content.
6. Run lint, type checking and build as configured. Run backend build if changed. Check desktop 1440, tablet 768 and mobile 390/320 widths, keyboard focus, no horizontal overflow, readable contrast, filtered programme navigation, comparison identity, FAQ, and form validation/success/failure.
7. Review screenshots against both approved references, refine section spacing and typography, and audit inherited branding. Show a running RS preview from port 3001. Report any CMS-dependent test that could not run. Commit/push only the RS repositories when the implementation and relevant checks are ready; do not deploy without a separate deployment instruction.

## Delivery status

- Approved theme and both reference images: saved in this repository.
- Section specification and existing-code mapping: prepared.
- Application implementation: started in the two RS repositories; RS logo and shared identity assets are now being integrated.
- Saved Codex project: user moved this same chat into rs-education-backend on 11 October 2026. Use explicit frontend/backend working directories because the existing session still reports its original cwd.

The user has already authorised implementation. No additional design approval is needed for the locked palette; resolve ordinary layout refinements using this plan and the reference images.
