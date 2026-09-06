# Homepage Testimonials Marquee

_Created: 2026-09-06_

## Purpose

The **"What Our Guests Say"** section of the homepage
(`src/app/(site)/page.tsx`) previously rendered a fixed grid of the first six
testimonials (`md:grid-cols-3`). It now shows **every** visible testimonial as
an auto-scrolling marquee, mirroring the gallery ticker
(`src/components/GalleryTicker.tsx`).

Rendered by `src/components/TestimonialsMarquee.tsx` (client component — it owns
the open/closed state of the detail dialog).

## Content sources

Unchanged from [phase-3-content-cms.md](./phase-3-content-cms.md): the page
builds `reviewCards` from the `reviews` table (visible rows) and falls back to
`siteConfig.testimonials.items` when the table is empty. Each card is
`{ quote, name, trip, avatar }`; `avatar` is resolved to a URL on the server
(`resolveImage(t.avatarId)`) so the client component never imports server libs.
DB reviews have no avatar (`avatar: null`) and fall back to initials.

## Display rules

- **Marquee** — same mechanism as `GalleryTicker`: a single track pass is
  padded up to `MIN_TRACK_CARDS` (6) then doubled (`[...track, ...track]`) for a
  seamless, gapless loop under the shared `animate-ticker` keyframe.
- **Pause on hover** — the track carries
  `hover:[animation-play-state:paused]`; hovering anywhere on the strip freezes
  it so a card can be read or clicked.
- **Fixed card size** — every card is `h-64 w-80`, a flex column. The quote
  area is `flex-1 overflow-hidden`; the star row and attribution never move.
- **Clipped quote + "See more"** — quotes longer than `PREVIEW_CHAR_LIMIT`
  (168 chars) are cut to that length (trimmed, `…` appended) and a "See more"
  label is shown. Shorter quotes render in full with no label.
- **Detail dialog** — clicking a card (the whole card is a `<button>`) opens a
  modal (`role="dialog"`, `aria-modal="true"`) with the **full** quote and
  attribution. It closes on the × button, an overlay click, or `Escape`; a
  click inside the dialog does not close it (`stopPropagation`).
- The section is `overflow-hidden` and full-bleed; only the heading block keeps
  the `max-w-[640px]` / horizontal padding. This stops the doubled track from
  causing horizontal page scroll.

## Test hooks (`data-testid`)

- `testimonials-marquee` — the scrolling track
- `testimonial-card` — each card button
- `testimonial-dialog`, `testimonial-dialog-overlay`, `testimonial-dialog-close`

## Tests

- `tests/components/TestimonialsMarquee.test.tsx` — empty-state render, track
  padding/doubling, pause-on-hover class, quote clipping + "See more" (and its
  absence for short quotes), dialog opens with full quote on card click,
  dialog closes via button / overlay / Escape, inside-click does not close.
- `tests/app/home-testimonials-marquee.test.ts` — the page renders
  `<TestimonialsMarquee items={reviewCards} />`, the old `slice(0, 6)` grid is
  gone, and the marquee sits after the WHY section.

## Change history

- 2026-09-06 — Replaced the 6-card testimonials grid with an all-testimonials
  marquee: pause-on-hover, fixed-size cards, quote clipped to a character limit
  with a "See more" dialog for the full text. New component
  `TestimonialsMarquee`; `reviewCards` now carries a server-resolved `avatar`
  URL instead of `avatarId`.
