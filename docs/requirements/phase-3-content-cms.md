# Phase 3 — Content CMS (Blog, FAQ, Gallery, Reviews, Welcome Section)

**Created:** 2026-09-06

## Change history

| Date | Change |
|---|---|
| 2026-09-06 | Initial implementation. |
| 2026-09-06 | Fix: blog editor now invalidates the `["admin-blogs"]` React Query cache on save, so a new/edited post appears on `/admin/blog` without a manual page refresh. |

## Overview

Moves the homepage FAQ, testimonials and "About" block out of `src/config.ts`
into the database, adds a homepage gallery ticker, and adds a full blog. Each
area has a `/admin` CRUD screen. Public reads fall back to `src/config.ts` when
a table is empty or unreachable.

## Data model

`20260903000000_content_cms.sql` (+ `20260903000001_seed_content.sql`):

| Table | Key columns |
|---|---|
| `blogs` | slug, title, excerpt, content (Markdown), category, published_date, image_url, `is_published`, meta_title, meta_description |
| `faqs` | question, answer, category, nullable `tour_id`, display_order, `is_visible` |
| `gallery` | alt_text, category, image_url, nullable `tour_id`, display_order, `is_visible` |
| `reviews` | reviewer_name, rating (1–5), review_text, source, location, display_order, `is_visible` |
| `welcome_sections` | badge_text, heading, paragraph_1/2, image_1..4 url+alt, display_order, `is_active` |

RLS: public `select` where `is_published` / `is_visible` / `is_active`; any
authenticated team member has full CRUD. Seed = the six config FAQ, six
testimonials and the About block.

## Reads — `lib/content.ts`

Cached under `CONTENT_TAG` with `unstable_cache` and a `safe()` wrapper that
logs and returns `[]` on error:
`listReviews`, `listSiteFaqs` (rows with no `tour_id`), `listTourFaqs(id)`,
`listGallery` (rows with an image), `getActiveWelcomeSection`,
`listPublishedPosts`, `getPostBySlug`, `listRelatedPosts(slug, limit)`.

## Public wiring

- Homepage: testimonials ← `reviews` (rendered as a pause-on-hover marquee of
  all visible reviews — see [home-testimonials-marquee.md](./home-testimonials-marquee.md));
  FAQ section + `FAQPage` JSON-LD ←
  `faqs`; About block ← active `welcome_sections` (any empty field falls back);
  new **gallery ticker** section (`GalleryTicker`, hover-pause) shown only when
  the gallery has photos. It sits directly after the itinerary and above the
  **Why Travel Trails** section (`#why`). The track pads small sets up to `MIN_TRACK_TILES` (8)
  by repeating the images, then doubles that track so the `ticker` keyframe's
  `-50%` translate loops seamlessly — this avoids the same photo being visible
  twice on screen when only a couple of gallery rows exist. All fall back to
  `src/config.ts`.
- **`/blog`** — published-post grid. **`/blog/[slug]`** — Server Component,
  Markdown via `react-markdown` + `remark-gfm` (`components/Markdown.tsx`),
  "More Articles" (3 most-recent excluding the current), `generateMetadata` from
  `meta_*`. Nav + `sitemap.ts` include blog.

The `FAQPage`, `BlogPosting` and `CollectionPage` / `BreadcrumbList` JSON-LD for
the homepage, blog list and blog detail is built by
`src/lib/seo/structuredData.ts` and rendered via `<JsonLd>` — see
[seo-structured-data.md](./seo-structured-data.md). Tour-scoped `faqs` are also
surfaced as `FAQPage` on `/tours/[slug]`.

## Admin

`revalidateContentCache` server action busts `CONTENT_TAG` after every edit.

- **`/admin/faqs`** — list, reorder, hide/show, create/edit dialog, delete.
- **`/admin/reviews`**, **`/admin/gallery`** (upload grid — compact thumbnails,
  2 columns on mobile up to 6 on wide screens), **`/admin/welcome-section`**
  (4 image uploads) — built on the shared `lib/admin/useCrudCollection` hook
  (list + create/update/delete/toggle/reorder mutations for a runtime table).
- **`/admin/blog`** list + **`/admin/blog/[id]`** editor with
  `MarkdownEditor` (write / preview toggle), cover image, excerpt, SEO fields,
  publish toggle. `slugify` shared via `lib/slug.ts`. On save the editor
  invalidates the `["admin-blogs"]` (and, when editing, `["admin-blog", id]`)
  React Query keys before navigating back, so the list reflects the change
  without a manual refresh despite the 30s `staleTime`.
- Sidebar: all Content items live (no more "soon").
- All form inputs carry `data-testid`.

## Tests

- `tests/integration/content-readers.test.ts` — `listSiteFaqs` / `listTourFaqs`
  split by `tour_id`; `listRelatedPosts` excludes current + caps count;
  `getPostBySlug`; `getActiveWelcomeSection`; graceful `[]` on query error.
- `tests/components/FaqAccordion.test.tsx` — default-open, switch, collapse.
- `tests/components/GalleryTicker.test.tsx` — renders nothing when empty; pads a
  2-image set to an 8-tile track doubled to 16; leaves a 10-image set unpadded
  (doubled to 20); heading renders.
- `tests/components/AdminFaqs.test.tsx` — renders the list ordered, marks a
  hidden row, creates a FAQ through the dialog (asserts the `insert` payload
  incl. `display_order`).
- `tests/components/AdminGallery.test.tsx` — renders the photos from supabase and
  asserts the compact multi-column thumbnail grid classes.
- `tests/app/home-section-order.test.ts` — the gallery ticker renders after the
  itinerary and before the `#why` section.
- `tests/e2e/public.spec.ts` — `/blog` heading renders.
- `tests/components/AdminBlogEditor.test.tsx` — creating a post inserts into
  `blogs` and invalidates the `["admin-blogs"]` list query.

## Acceptance criteria

- [x] Homepage FAQ / testimonials / About read from the DB with config fallback.
- [x] Admin can publish a blog post and it appears at `/blog/<slug>`.
- [x] `npm run build`, `npm run typecheck`, `npm test`, `npm run test:e2e` pass.
