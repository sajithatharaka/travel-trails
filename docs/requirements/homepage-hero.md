# Homepage Hero

_Created: 2026-09-05_

## Purpose

The full-bleed hero at the top of the homepage (`src/app/(site)/page.tsx`,
rendered through `src/components/HeroSlider.tsx`). It sets the first impression
and carries the primary calls to action.

## Content sources

The hero is driven by the **featured tour** — the published `tours` row with
`is_featured = true` (falls back to the first published tour, then to
`siteConfig.hero`). See `getFeaturedTour()` in `src/lib/tours.ts`.

| Element      | Source (in priority order)                                             |
| ------------ | -------------------------------------------------------------------- |
| Eyebrow      | `tour.hero_eyebrow` → `siteConfig.hero.eyebrow`                      |
| Headline     | `siteConfig.hero.headline` only — agency-level, never the featured tour's `hero_headline` |
| Subheadline  | `tour.hero_subheadline` → `siteConfig.hero.subheadline` (hidden if empty) |
| Background    | `settings.hero_images[]` (Site Settings) → `tour.cover_image_url` → `resolveImage(siteConfig.hero.fallbackImageId)` |
| Primary CTA  | featured tour: "See This Itinerary" → `/tours/<slug>`; otherwise `siteConfig.hero.primaryCta` |
| Secondary CTA | "Customize My Trip" → `#enquiry`, prefills the message on `GeneralEnquiryForm` via `PREFILL_MESSAGE_EVENT` |

### Background: slideshow vs. single image

The `hero_images` key in **Site Settings** holds a JSON array of public image
URLs (managed at `/admin/welcome-section`, uploaded to the `media` bucket under
`hero/`). `page.tsx` builds the `HeroSlider` slides from it:

- **2+ images** → the hero auto-rotates every 5s with dot navigation
  (`HeroSlider` handles the rotation whenever `slides.length > 1`).
- **1 image** → shown static, no dots.
- **0 images** → falls back to a single slide using `tour.cover_image_url`,
  then the bundled scenic photo.

`parseHeroImages()` (`src/lib/format.ts`) drops blank / non-string entries from
the stored value, so a malformed row degrades to the fallback rather than
rendering a broken slide.

## Background image fallback

`siteConfig.hero.fallbackImageId` (`"day-sigiriya"`) names a bundled scenic
photo in `public/images/`. It is used only when the featured tour has no
`cover_image_url`.

**Rule:** the hero background must never fall back to `route-map.png`. That
asset is a diagram, not a photograph, and renders as broken at full-bleed size.

## Change history

- **2026-09-11** — The "Homepage hero slideshow" admin card moved from
  `/admin/settings` to `/admin/welcome-section`, so the two homepage imagery
  areas (About block, hero banner) are managed from one page. No change to
  the `site_settings.hero_images` data model or public rendering — see
  [homepage-welcome-section.md](./homepage-welcome-section.md) and
  [phase-3-content-cms.md](./phase-3-content-cms.md).
- **2026-09-10** — The hero background is now a **slideshow** sourced from the
  new `hero_images` Site Settings key. Admins add/reorder/remove images at
  `/admin/settings` ("Homepage hero slideshow" card, `data-testid`
  `settings-hero-images`); uploads go to `media/hero/`. With 2+ images the hero
  auto-rotates; with none it keeps the previous featured-tour-cover fallback.
  New: migration `20260910000000_hero_images_setting.sql`,
  `parseHeroImages()` in `src/lib/format.ts`, `SiteSettings.hero_images` in
  `src/lib/settings.ts`. Tests: `tests/unit/format.test.ts`,
  `tests/app/home-hero.test.ts`.
- **2026-09-10** — The homepage hero headline no longer uses the featured
  tour's `hero_headline`. A tour name (e.g. "The 7-Day Sri Lanka Escape") is
  tour-specific and should not be the homepage `<h1>`. `heroHeadline` in
  `page.tsx` is now `siteConfig.hero.headline` ("Sri Lanka, Planned Around
  You"). The featured tour still drives the eyebrow, subheadline, background
  image and primary CTA. Tests: `tests/app/home-hero.test.ts`.
- **2026-09-10** — The homepage `#enquiry` section now renders the tour-free
  `GeneralEnquiryForm` (→ `submit-contact` → `contact_submissions`) instead of
  `EnquiryForm`, which is now tour-page-only. The "Customize My Trip" secondary
  CTA still prefills that form's message through `PREFILL_MESSAGE_EVENT`. See
  [phase-2-bookings-contacts.md](./phase-2-bookings-contacts.md).
- **2026-09-06** — Removed the "from $980 / person" price chip from the hero
  CTA row. The `formatPriceFrom(tour.price_from_usd)` span and its now-unused
  import were deleted from `page.tsx`. Price still shows on tour cards and tour
  detail pages. Tests: `tests/app/home-hero.test.ts`.
- **2026-09-05** — Fixed hero background fallback. Previously
  `page.tsx` chained `tour.cover_image_url || resolveImage("hero-1") ||
  resolveImage("route-map")`; `hero-1` has no file on disk, so a featured tour
  without a cover (the seeded state) rendered the **route map** as the hero
  backdrop. Now falls back to `siteConfig.hero.fallbackImageId`
  (`day-sigiriya.jpg`). Migration `20260901000003_seed_tour_cover_image.sql`
  also sets `cover_image_url` on the seeded "The 7-Day Sri Lanka Escape" tour so
  the admin editor reflects the intended image. Tests:
  `tests/app/home-hero.test.ts`.
