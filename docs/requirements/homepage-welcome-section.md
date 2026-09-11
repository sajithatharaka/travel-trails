# Homepage Welcome Section

_Created: 2026-09-11_

## Purpose

The "About Travel Trails" block on the homepage
(`src/app/(site)/page.tsx`, the `aboutBlock` derived value). Badge, heading,
two copy paragraphs and one image, sitting between the itinerary and the
"Why Travel Trails" section.

## Content source

Driven by the first active `welcome_sections` row (`getActiveWelcomeSection()`
in `src/lib/content.ts`), ordered by `display_order`. Any empty field falls
back to the bundled `siteConfig.about` copy. Managed at
`/admin/welcome-section`.

| Element     | Source (in priority order)                              |
| ----------- | --------------------------------------------------------- |
| Badge       | `welcome_sections.badge_text` → `siteConfig.about.sectionLabel` |
| Heading     | `welcome_sections.heading` → `siteConfig.about.headline` |
| Paragraphs  | `welcome_sections.paragraph_1`/`paragraph_2` (blank ones dropped) → `siteConfig.about.paragraphs` |
| Image       | `welcome_sections.image_url` → `resolveImage("about")`   |
| Image alt   | `welcome_sections.image_alt` → `"About Travel Trails"`   |

### Single image only

`welcome_sections` has exactly **one** image column pair (`image_url`,
`image_alt`) — not four. The admin form originally captured four
image+alt-text slots, but the homepage only ever rendered the first one;
images 2–4 were saved to the database and never displayed anywhere. Rather
than build out real multi-image support here, the unused slots were dropped
(migration `20260911000000_welcome_section_single_image.sql`) so the admin
form matches what's actually rendered. See
[phase-3-content-cms.md](./phase-3-content-cms.md) for the full data model.

The homepage's *other* big imagery area — the full-bleed hero banner above
this section — has its own, separate multi-image slideshow. See
[homepage-hero.md](./homepage-hero.md).

## Admin — `/admin/welcome-section`

- **A single always-editing form** (`data-testid` `welcome-editor`), not a
  list you open a row from. The page loads straight into the form, pre-filled
  from the existing record (the one `display_order`-first row — in practice
  there's only ever one), and there's one **Save** button in the page header.
  No "New variant", no popup dialog, no delete — the table only ever holds
  the one row this page edits; if none exists yet, Save creates it.
- The page also hosts the **"Homepage hero slideshow"** card
  (`data-testid` `settings-hero-images`) — moved here from `/admin/settings`
  so both homepage imagery areas are managed from one page. It writes to
  `site_settings.hero_images` and is otherwise unchanged; see
  [homepage-hero.md](./homepage-hero.md) for that data model.

## Change history

- **2026-09-11** — `/admin/welcome-section` simplified from a variants
  list (New/Edit-in-a-popup/Delete) to a single always-editing form, pre-filled
  on load — the homepage only ever used one row, so the list and its extra
  click to open the editor added nothing. Tests:
  `tests/components/AdminWelcomeSection.test.tsx`.
- **2026-09-11** — Reduced `welcome_sections` from four image slots to one
  (`image_url`/`image_alt`), since only the first ever rendered. Moved the
  "Homepage hero slideshow" admin card in from `/admin/settings`. Migration:
  `20260911000000_welcome_section_single_image.sql`. Tests:
  `tests/components/AdminWelcomeSection.test.tsx`,
  `tests/app/admin-hero-slideshow-relocation.test.ts`.
