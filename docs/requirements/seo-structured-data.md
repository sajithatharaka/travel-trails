# SEO / AEO / GEO — Structured Data

_Created: 2026-09-06_

## Why

The public site had partial JSON-LD (a `TravelAgency` in the root layout, a
`FAQPage` on the homepage, a thin `TouristTrip` on tour detail, a thin
`BlogPosting` on blog detail) and nothing on the tours list, blog list, contact
page or the three legal pages. There was no `WebSite`/`Organization` entity
graph, no `BreadcrumbList` anywhere, and no machine-readable site map for LLM
crawlers.

This pass gives every public route a complete, cross-linked schema.org graph so
the site is friendly to:

- **SEO** — Google rich results (breadcrumbs, article, offers, FAQ, item lists).
- **AEO** (answer engines) — `FAQPage` + `speakable` hints, absolute URLs,
  resolvable entities.
- **GEO** (generative engines / LLM crawlers) — a stable `@id` graph and a
  `/llms.txt` outline of the site.

Metadata (`generateMetadata`, `src/app/sitemap.ts`, `src/app/robots.ts`) was
mostly solid; a later audit fixed the Open Graph image, meta-description
fallbacks, per-page social context and sitemap freshness — see
[seo-metadata-og-images.md](./seo-metadata-og-images.md).

## Building blocks

### `src/lib/seo/structuredData.ts`

Pure, server-safe builder functions (no React, no `fs`, no network). Callers
pass already-resolved image paths. All URL/image fields are made absolute via
`absoluteUrl()`. `prune()` drops `null`/`undefined`/empty-array keys.

| Builder | Emits |
|---|---|
| `organizationSchema(logoPath?)` | `TravelAgency`, `@id` `…/#organization`, logo `ImageObject`, `contactPoint`, `sameAs` (only when `siteConfig.seo.sameAs` is non-empty) |
| `webSiteSchema()` | `WebSite`, `@id` `…/#website`, `publisher` → organization |
| `breadcrumbSchema(items)` | `BreadcrumbList` with 1-based positions and absolute `item` URLs |
| `webPageSchema({ path, name, description?, breadcrumbs?, speakableSelectors? })` | `WebPage`, `isPartOf` → website, optional embedded breadcrumb + `SpeakableSpecification` |
| `faqSchema(items)` | `FAQPage` (`{ q, a }[]` → `Question`/`Answer`) |
| `tourSchema(tour)` | `TouristTrip`, `@id`, absolute `url`/`image`, `provider` → organization, `touristType`, `duration`, `itinerary` `ItemList`, `offers` |
| `tourListingSchema(tours, opts?)` | `CollectionPage` + `ItemList` of tour URLs |
| `blogPostingSchema(post, logoPath?)` | `BlogPosting`, `@id`, absolute `image` `ImageObject`, `author`/`publisher` → organization, `isPartOf` → website, `inLanguage`, `wordCount`, `dateModified` falls back to `datePublished` |
| `blogListingSchema(posts, opts?)` | `CollectionPage` + `ItemList` of post URLs |
| `contactPageSchema()` | `ContactPage`, `mainEntity` → organization with `contactPoint` |

`ORGANIZATION_ID` / `WEBSITE_ID` are exported for cross-references.

### `src/components/JsonLd.tsx`

Renders `data` (one node or an array) as a single
`<script type="application/ld+json">`. An array is emitted as a JSON-LD graph
array so `@id` references resolve within one document. This is the **only**
place the raw script tag is written — pages must not hand-roll it.

### `src/config.ts`

`seo.sameAs: string[]` — canonical brand profile URLs (Instagram, Facebook, …).
Empty by default; `sameAs` is omitted from the graph until it is populated.

## Per-route graph

| Route | Nodes |
|---|---|
| `src/app/layout.tsx` (all pages) | `organizationSchema()` + `webSiteSchema()` |
| `/` `src/app/(site)/page.tsx` | `webPageSchema` (with `speakable` `#about h2`, `#about p`, `#faq`) + `faqSchema` (DB FAQs, config fallback) |
| `/tours` | `tourListingSchema` + `breadcrumbSchema` (Home › Tours) |
| `/tours/[slug]` | `tourSchema` + `breadcrumbSchema` (Home › Tours › title); `faqSchema` too when `listTourFaqs(tour.id)` is non-empty |
| `/blog` | `blogListingSchema` + `breadcrumbSchema` (Home › Blog) |
| `/blog/[slug]` | `blogPostingSchema` + `breadcrumbSchema` (Home › Blog › title) |
| `/contact` | `contactPageSchema` + `breadcrumbSchema` (Home › Contact) |
| `/privacy`, `/terms`, `/cookie-policy` | via `LegalLayout` (`path` + `description` props): `webPageSchema` + `breadcrumbSchema` (Home › title) |

## `/llms.txt` — `src/app/llms.txt/route.ts`

`text/plain` route handler, `revalidate = 3600`, `s-maxage=3600`. Outputs a
Markdown-style outline: brand summary, key page links, a `## Tours` list and a
`## Blog` list generated from `listPublishedTours()` / `listPublishedPosts()`
(title + absolute URL + summary/excerpt), and a `## Policies` list. Degrades to
`- (none published yet)` when a section is empty. `robots.ts` already allows
`/`, so crawlers can reach it.

## Tests

| File | Covers |
|---|---|
| `tests/unit/structuredData.test.ts` | every builder — `@type`/`@context`, `absoluteUrl`, `sameAs` present only when configured, breadcrumb positions, `ItemList` lengths, FAQ mapping, tour `offers`/`itinerary` omission, blog `wordCount` + `dateModified` fallback, absolute images |
| `tests/app/structured-data.test.ts` | source scan — every public route + `LegalLayout` renders `<JsonLd>` from the seo builders; no page hand-rolls `application/ld+json` |
| `tests/app/llms-txt.test.ts` | route handler — `text/plain`, cache header, tour/blog/policy links with absolute URLs, empty-state fallback |
| `tests/e2e/public.spec.ts` | each public route serves ≥1 `application/ld+json` block that parses and has `@context: https://schema.org`; `/llms.txt` serves plain text with `## Tours` / `## Blog` |

## Manual verification

- `npm run typecheck && npm test && npm run build` — all green.
- `npm run dev`, then paste each route's JSON-LD into
  [validator.schema.org](https://validator.schema.org) / Google Rich Results
  Test — no errors; `@id` cross-refs resolve (Organization ↔ WebSite ↔
  WebPage/Breadcrumb).
- `curl -s localhost:3000/llms.txt` — plain text, lists every published tour and
  post with absolute URLs.

## Follow-ups

- Populate `siteConfig.seo.sameAs` once the client confirms their social
  accounts.
- `travel-trails-logo.png` is present under `public/images/` so the JSON-LD
  `logo` / `image` resolve. The social share image is now generated
  (`src/app/opengraph-image.tsx`) — no static asset needed. See
  [seo-metadata-og-images.md](./seo-metadata-og-images.md).
