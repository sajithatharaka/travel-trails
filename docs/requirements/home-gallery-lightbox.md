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
  (`bg-black/80`) centering the image, capped at `85vh` tall / `90vw` wide and
  rendered at its natural aspect ratio (`h-auto w-auto`, `object-contain`) so
  the full photo is visible uncropped.
- The dialog box shrink-wraps to the photo's own rendered size instead of a
  fixed-size frame — for photos narrower or shorter than the cap, the ×
  button (anchored to the dialog's corner) sits at the image's actual corner
  rather than floating over empty letterbox space.
- The lightbox is `role="dialog"` / `aria-modal="true"`, `aria-label` set to
  the image's `alt` text.
- Closes via: the × button, clicking the overlay outside the image, or
  `Escape`. A click on the image/dialog itself does not close it
  (`stopPropagation`), matching `TestimonialsMarquee`'s dialog.
- The auto-scroll ticker keeps running behind the lightbox (`animate-ticker`
  is on the track, not the dialog); opening the dialog does not pause it.
- While the full-size image is loading, a spinner is shown in its place and
  the × button is not rendered; once it loads, the image fades in
  (`opacity-0` → `opacity-100`) and the × button appears. The image element
  itself is `priority` (skips native lazy-loading) and hidden via `opacity`,
  not `display: none` — see change history for why.

## Test hooks (`data-testid`)

- `gallery-image-button` — each clickable tile
- `gallery-dialog-overlay`, `gallery-dialog`, `gallery-dialog-close`,
  `gallery-dialog-image`, `gallery-dialog-spinner`

## Tests

- `tests/components/GalleryTicker.test.tsx` — existing empty-state / padding /
  heading coverage, plus: clicking a tile opens the dialog with the matching
  image, close via × button, close via overlay click, inside-click does not
  close, close via `Escape`, closing via the × button across several images
  opened in a row (regression for the stuck-close-button bug), the lightbox
  image/× button carry the `h-auto w-auto` / `z-10` classes the
  corner-tracking fix depends on, the spinner shows and the image/×
  button stay hidden until the image's `load` event fires, and the loading
  state resets when switching to a different image.

## Change history

- 2026-09-11 — Added click-to-open lightbox for gallery tiles. `GalleryTicker`
  converted to a client component; tiles changed from `<div>` to `<button>`.
- 2026-09-11 — Fixed the × button's position: the dialog previously used a
  fixed-size (`max-w-4xl` / `h-[70vh]`) frame with the image fit inside it via
  `object-contain`, so for any photo whose aspect ratio didn't match the
  frame, the visible photo was smaller than the frame and the × button
  (anchored to the frame's corner) floated away from the photo's actual
  corner. The fixed-size frame div also sat later in the DOM with its own
  stacking context and no explicit `z-index` on the button, so the sliver of
  frame overlapping the button's corner could swallow clicks meant for the ×
  button — reported as the close button becoming unresponsive after opening
  a few images. Replaced the frame with a shrink-wrapped `inline-block`
  container sized to the image's own rendered box (`h-auto w-auto`, capped at
  `85vh` / `90vw`) and gave the button an explicit `z-10`, so it now always
  sits at, and is always clickable at, the photo's real corner regardless of
  aspect ratio.
- 2026-09-11 — Added a loading spinner: the full-size image and × button now
  stay hidden until the `Image`'s `load` event fires, showing a spinner in
  their place. First attempt hid the image via `hidden` (`display: none`),
  which deadlocked in real browsers — an `img` with `display: none` has no
  layout box, so Next.js's native lazy-loading (`loading="lazy"` is the
  default when `priority` isn't set) never considered it near the viewport
  and the image never started loading, so `loaded` never became `true`
  (unit tests didn't catch this because jsdom doesn't implement lazy-loading
  intersection checks). Fixed by hiding the image with `opacity-0` instead
  (which still has a real layout box — reserved immediately from the
  `width`/`height` attributes via the browser's built-in
  aspect-ratio-from-attributes behavior, which is also what lets the spinner
  overlay sit centered over the image's future position) and adding
  `priority` to skip lazy-loading entirely, since the image is already known
  to be wanted the moment the dialog opens.
