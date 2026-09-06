# Homepage Route Map

_Created: 2026-09-06_

## Purpose

The **Route** section of the homepage (`src/app/(site)/page.tsx`, `id="route"`)
shows the illustrated "trail across the island" map on the left and the numbered
list of stops on the right. The map is a hand-drawn diagram of Sri Lanka
(`public/images/route-map.png`, intrinsic 941 × 1672), not a photo.

## Content sources

| Element   | Source (in priority order)                                        |
| --------- | ---------------------------------------------------------------- |
| Map image | `tour.route_map_image_url` → `resolveImage("route-map")`          |
| Stops     | `tour.route_stops[]` (`num`, `name`, `description`, `anchor`)     |

The section renders only when a featured/published `tour` exists and it has at
least one route stop.

## Display rules

- The map is a **diagram** and must be shown **in full** — never cropped.
  - `ImageSlot` is rendered with `fit="contain"` (added to `ImageSlot` as a
    prop; default remains `"cover"` for photos).
  - The wrapping `<div>` uses `aspect-[941/1672]` so the container matches the
    artwork's real proportions. Regression: it was briefly `aspect-[1100/1400]`
    (≈0.79 vs the artwork's ≈0.56), which — together with `object-cover` — cut
    the top and bottom off the island so the map read as broken. This is what
    "the map is not shown on the new app" referred to.
- Height is fixed (`h-[420px]`, `md:h-[520px]`) with `w-auto`, centred via
  `justify-self-center`.

## Tests

- `tests/components/ImageSlot.test.tsx` — `fit` prop selects
  `object-contain` vs `object-cover`; placeholder fallback still works.
- `tests/app/home-route-map.test.ts` — the route-map `ImageSlot` is wired with
  `fit="contain"` and its container's `aspect-[w/h]` stays within 0.05 of
  `route-map.png`'s intrinsic ratio (guards against the crop regression).

## Change history

- 2026-09-06 — Fixed the route map not displaying properly on the web app:
  restored the container aspect ratio to the artwork's proportions
  (`aspect-[941/1672]`) and switched the slot to `fit="contain"` so the full
  island renders, matching the previous static site.
