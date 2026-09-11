# Homepage Gallery Ticker — Lightbox

_Created: 2026-09-11_

## Purpose

The **"A Few Moments From the Trail"** gallery strip
(`src/components/GalleryTicker.tsx`) auto-scrolls a track of tile images but
previously offered no way to see a photo larger than its `h-52 w-72` tile.
Tiles are now clickable and open the clicked photo in a full-size lightbox
dialog, mirroring the detail-dialog pattern already used by
`TestimonialsMarquee`.

`GalleryTicker` is a client component (`"use client"`) — it owns the
open/closed state of the lightbox.

## Display rules

- Every tile is a `<button>` (not a plain `div`) so it is keyboard-focusable
  and has an `aria-label` of `View larger image: {alt}`.
- Clicking a tile opens a lightbox: a fixed, full-viewport overlay
  (`bg-black/80`) centering the image at up to `max-w-4xl` / `70vh`, rendered
  with `object-contain` so the full photo is visible uncropped.
- The lightbox is `role="dialog"` / `aria-modal="true"`, `aria-label` set to
  the image's `alt` text.
- Closes via: the × button, clicking the overlay outside the image, or
  `Escape`. A click on the image/dialog itself does not close it
  (`stopPropagation`), matching `TestimonialsMarquee`'s dialog.
- The auto-scroll ticker keeps running behind the lightbox (`animate-ticker`
  is on the track, not the dialog); opening the dialog does not pause it.

## Test hooks (`data-testid`)

- `gallery-image-button` — each clickable tile
- `gallery-dialog-overlay`, `gallery-dialog`, `gallery-dialog-close`,
  `gallery-dialog-image`

## Tests

- `tests/components/GalleryTicker.test.tsx` — existing empty-state / padding /
  heading coverage, plus: clicking a tile opens the dialog with the matching
  image, close via × button, close via overlay click, inside-click does not
  close, close via `Escape`.

## Change history

- 2026-09-11 — Added click-to-open lightbox for gallery tiles. `GalleryTicker`
  converted to a client component; tiles changed from `<div>` to `<button>`.
