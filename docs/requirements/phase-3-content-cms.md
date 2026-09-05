# Phase 3 — Content CMS (Blog, FAQ, Gallery, Reviews, Welcome Section)

**Created:** 2026-09-06

## Change history

| Date | Change |
|---|---|
| 2026-09-06 | Initial implementation. |

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

- Homepage: testimonials ← `reviews`; FAQ section + `FAQPage` JSON-LD ←
  `faqs`; About block ← active `welcome_sections` (any empty field falls back);
  new **gallery ticker** section (`GalleryTicker`, duplicated items, hover-pause)
  shown only when the gallery has photos. All fall back to `src/config.ts`.
- **`/blog`** — published-post grid. **`/blog/[slug]`** — Server Component,
  Markdown via `react-markdown` + `remark-gfm` (`components/Markdown.tsx`),
  "More Articles" (3 most-recent excluding the current), `BlogPosting` JSON-LD,
  `generateMetadata` from `meta_*`. Nav + `sitemap.ts` include blog.

## Admin

`revalidateContentCache` server action busts `CONTENT_TAG` after every edit.

- **`/admin/faqs`** — list, reorder, hide/show, create/edit dialog, delete.
- **`/admin/reviews`**, **`/admin/gallery`** (upload grid), **`/admin/welcome-section`**
  (4 image uploads) — built on the shared `lib/admin/useCrudCollection` hook
  (list + create/update/delete/toggle/reorder mutations for a runtime table).
- **`/admin/blog`** list + **`/admin/blog/[id]`** editor with
  `MarkdownEditor` (write / preview toggle), cover image, excerpt, SEO fields,
  publish toggle. `slugify` shared via `lib/slug.ts`.
- Sidebar: all Content items live (no more "soon").
- All form inputs carry `data-testid`.

## Tests

- `tests/integration/content-readers.test.ts` — `listSiteFaqs` / `listTourFaqs`
  split by `tour_id`; `listRelatedPosts` excludes current + caps count;
  `getPostBySlug`; `getActiveWelcomeSection`; graceful `[]` on query error.
- `tests/components/FaqAccordion.test.tsx` — default-open, switch, collapse.
- `tests/components/AdminFaqs.test.tsx` — renders the list ordered, marks a
  hidden row, creates a FAQ through the dialog (asserts the `insert` payload
  incl. `display_order`).
- `tests/e2e/public.spec.ts` — `/blog` heading renders.

## Acceptance criteria

- [x] Homepage FAQ / testimonials / About read from the DB with config fallback.
- [x] Admin can publish a blog post and it appears at `/blog/<slug>`.
- [x] `npm run build`, `npm run typecheck`, `npm test`, `npm run test:e2e` pass.
