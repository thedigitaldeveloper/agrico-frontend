# Agrico homepage prototype

A complete standalone HTML/CSS/JavaScript homepage for design review, created on 11 October 2026. This replaces the earlier small editorial concepts as the current visual proposal. It does not replace the Next.js application route yet.

## Open it

The local preview in this session runs at http://127.0.0.1:4173/.

From this directory, a standard Python installation can serve it with:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

The page can also be opened directly from `index.html`. Fonts use Google Fonts with local font fallbacks. All photography and application assets are local; no CMS, database, build step or package installation is needed for the prototype.

## Review scope

- Responsive homepage: navigation, photo hero, course discovery, study-format comparison, institution shortlist, guidance steps, student guides and advisor invitation.
- Course search and UG/PG filters operate on eight illustrative programmes. Empty results can be reset.
- Course details, study-format comparison and guides open accessible native dialogs with Escape/close handling.
- University bookmarks persist only as institution IDs in this browser's local storage. They can be removed.
- The advisor form is a local demonstration. Use sample details; nothing is sent or stored.
- University links open official websites. Names and locations are examples for the prototype, not an Agrico partnership or programme-availability claim.
- Prominent prototype labels distinguish the design from a launched catalogue. No fabricated statistics, prices, approvals, testimonials or admission deadlines are used.

## Validation

Browser checks passed at 1440, 1024, 768, 390 and 320 pixels with no horizontal overflow. Verified search, level filters, empty state/reset, course/mode dialogs, shortlist add/remove, format comparison, guide content, advisor preview, mobile navigation, local images and absence of script errors.

The final application will still need a verified catalogue, client contact/legal details, real enquiry integration and a complete accessibility/performance review. The current preview is intentionally independent of the CMS while the visual direction is reviewed.

## Image assets and generation prompts

Both images were created with the built-in imagegen tool and saved into this project. They are illustrative generated imagery, not photos of named students or a named university. The campus caption identifies it as an illustration. Original generated files remain in the task's generated-images directory.

### `assets/student-hero.png`

Final prompt:

> Use case: photorealistic-natural. Asset type: editorial website hero photograph for Agrico, an Indian higher education discovery platform. Generate one beautiful high-resolution landscape photograph, 3:2 ratio. Three Indian university students, clearly adults around 21-24, two women and one man, in contemporary everyday smart-casual clothing, sitting together on broad pale sandstone steps in a lush modern Indian university campus, sharing a notebook and a laptop, relaxed natural smiles during a real conversation, no one looking directly at camera. Primary woman in an off-white shirt, man in a muted sage shirt, second woman in a subtle mustard top. Beautiful soft daylight, premium authentic education campaign photography, natural skin texture, realistic hands and laptop, environmental greenery, cream architecture, restrained neutral colours. Frame waist-up to three-quarter view with the group centered-right, a little natural breathing room around heads. Realistic photography, not a collage, not an illustration, no graduation caps, no logos, no typography, no text, no fake user interface. This will be cropped inside a rounded rectangular website hero on a pale cream page.

### `assets/campus-life.png`

Final prompt:

> Use case: photorealistic-natural. Asset type: supporting campus-life image for an Indian university discovery website prototype, not a depiction of any named university. Portrait 4:5 editorial architectural photograph of a beautiful modern Indian university campus courtyard, red sandstone and warm ivory contemporary academic buildings, lush landscaped walking path, mature flowering trees and palms, a few university students in the mid-distance walking casually with backpacks. Soft early morning daylight, natural true colours, calm green foliage, professional architectural photography, believable Indian campus setting, understated and aspirational. No names, no signage, no written text, no logos, no graduation hats. Composition with architecture and tree canopy in upper two thirds, path leading into the scene. No aerial view, no illustrated style.

Official institution references checked for names, locations and outbound links: [VGU](https://vgu.ac.in/), [Manipal University Jaipur](https://jaipur.manipal.edu/), [Amity University Rajasthan](https://www.amity.edu/jaipur/), [LPU](https://www.lpu.in/).
