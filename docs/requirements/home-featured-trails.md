# Homepage Featured Trails Grid

_Created: 2026-09-06_

## Purpose

The homepage (`src/app/(site)/page.tsx`) showcases the tour catalogue with a
compact grid of up to **4 tour tiles** followed by a **"View all tours"** link,
instead of expanding one featured tour into a full day-by-day itinerary on the
home page.

## Behaviour

- Section id `featured-trails`, sits directly after the **Route** section and
  before the gallery ticker. Background `bg-section-tint`.
- Header copy comes from `siteConfig.featuredTrails`
  (`sectionLabel` / `headline` / `subheadline` / `viewAllLabel`).
- Tiles: `listFeaturedTrails(limit = 4)` in `src/lib/tours.ts` — any
  `is_featured` published tours first, then the rest in `display_order`, capped
  at 4. Each tile renders `src/components/TourCard.tsx`.
- **"View all tours"** (`data-testid="view-all-tours"`) links to `/tours`.
- If there are no published tours the whole section is omitted (no empty grid).

## `TourCard`

`src/components/TourCard.tsx` — one tour tile, shared by this grid and the
`/tours` index grid (extracted from the former inline markup on
`src/app/(site)/tours/page.tsx`):

| Element        | Source                                                        |
| -------------- | ------------------------------------------------------------ |
| Cover image    | `tour.cover_image_url` → `resolveImage("route-map")`         |
| Eyebrow        | `tour.duration_days` days · `tour.destination_count` destinations |
| Title          | `tour.title`                                                 |
| Summary        | `tour.summary`                                               |
| Price          | `formatPriceFrom(tour.price_from_usd)` — shown only when set  |
| Link           | `/tours/<slug>`, `data-testid="tour-card-<slug>"`            |

The parent owns the surrounding grid classes (`lg:grid-cols-4` on the homepage,
`lg:grid-cols-3` on `/tours`).

## Not changed

- The **hero** is still driven by the featured tour — see
  [homepage-hero.md](./homepage-hero.md).
- The **Route** section (map + numbered stops) still renders from the featured
  tour — see [home-route-map.md](./home-route-map.md).
- The tour detail page (`/tours/<slug>`) still renders the full day-by-day
  itinerary.

## Change history

- **2026-09-06** — Replaced the homepage day-by-day **Itinerary** section and
  the featured-tour **stats bar** (Days / Destinations / Route Stops /
  Experiences) with the 4-tile featured-trails grid + "View all tours" link.
  Added `listFeaturedTrails()` and extracted `TourCard`. Tests:
  `tests/app/home-featured-trails.test.ts`,
  `tests/app/home-section-order.test.ts`,
  `tests/unit/tours-featured-trails.test.ts`,
  `tests/components/TourCard.test.tsx`.
