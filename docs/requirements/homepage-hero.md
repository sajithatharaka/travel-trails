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
| Headline     | `tour.hero_headline` → `siteConfig.hero.headline`                    |
| Subheadline  | `tour.hero_subheadline` → `siteConfig.hero.subheadline` (hidden if empty) |
| Background    | `tour.cover_image_url` → `resolveImage(siteConfig.hero.fallbackImageId)` |
| Primary CTA  | featured tour: "See This Itinerary" → `/tours/<slug>`; otherwise `siteConfig.hero.primaryCta` |
| Secondary CTA | "Customize My Trip" → `#enquiry`, prefills the enquiry message      |
| Price chip   | `formatPriceFrom(tour.price_from_usd)` — shown only when set          |

The hero shows a **single** background image. It is not a rotating carousel in
the current design; `HeroSlider` still supports multiple slides (with dot nav)
but the homepage passes exactly one.

## Background image fallback

`siteConfig.hero.fallbackImageId` (`"day-sigiriya"`) names a bundled scenic
photo in `public/images/`. It is used only when the featured tour has no
`cover_image_url`.

**Rule:** the hero background must never fall back to `route-map.png`. That
asset is a diagram, not a photograph, and renders as broken at full-bleed size.

## Change history

- **2026-09-05** — Fixed hero background fallback. Previously
  `page.tsx` chained `tour.cover_image_url || resolveImage("hero-1") ||
  resolveImage("route-map")`; `hero-1` has no file on disk, so a featured tour
  without a cover (the seeded state) rendered the **route map** as the hero
  backdrop. Now falls back to `siteConfig.hero.fallbackImageId`
  (`day-sigiriya.jpg`). Migration `20260901000003_seed_tour_cover_image.sql`
  also sets `cover_image_url` on the seeded "The 7-Day Sri Lanka Escape" tour so
  the admin editor reflects the intended image. Tests:
  `tests/app/home-hero.test.ts`.
