# SEO — Metadata, Social Images, NAP & Structured-Data Fixes

_Created: 2026-09-06_

## Why

An SEO audit of the public site found gaps across the metadata and
structured-data layers (the JSON-LD entity graph from
[seo-structured-data.md](./seo-structured-data.md) was present but had
correctness issues). The four highest-impact items are detailed below; the rest
of the audit remediation is in
"[Also fixed in this pass](#also-fixed-in-this-pass-rest-of-the-audit)".

High-impact:

1. **No real social share image.** `src/app/layout.tsx` resolved `og:image` as
   `resolveImage("og-image") || resolveImage("route-map") || seo.ogImage`.
   Neither `og-image.*` nor `travel-trails-og-image.jpg` existed under
   `public/images/`, so **every** page's `og:image` / `twitter:image` fell back
   to `route-map.png` — a route-map diagram that reads as broken at 1200×630.
   No `og:image:width` / `height` / `alt` were emitted.
2. **Detail pages dropped Open Graph context.** `/tours/[slug]` and
   `/blog/[slug]` set their own `openGraph` in `generateMetadata`. Next.js
   replaces (does not merge) `openGraph` and `twitter` across route segments,
   so those pages lost `og:site_name` and `og:locale`, emitted no `og:image`
   when the tour/post had no cover, and left the Twitter card on the generic
   site-wide title/description/image.
3. **Meta description could be empty.** `tour.meta_description || tour.summary`
   (and the blog equivalent) resolved to `undefined` when both DB fields were
   blank, shipping a page with no `<meta name="description">`.
4. **`sitemap.xml` could go stale.** `src/app/sitemap.ts` had no `revalidate`
   and was in no `revalidatePath` call (unlike `/llms.txt`, which self-heals
   hourly). It relied entirely on `revalidateTag` propagating to a statically
   rendered route — unverified, so a newly published tour/post could be absent
   from the sitemap until the next deploy.

## Changes

### Generated Open Graph image

| File | Purpose |
|---|---|
| `src/app/opengraph-image.tsx` | `ImageResponse` (`next/og`) — a branded **1200×630** card: deep-jungle background (`#1c3a2c`, matches `viewport.themeColor`), terracotta accent, brand name, tagline, host. No external fonts or images, so it builds with no network access. Exports `alt` / `size` / `contentType`. |
| `src/app/twitter-image.tsx` | Re-exports `opengraph-image` so `twitter:image` is emitted explicitly rather than relying on Twitter's fall-through to `og:image`. |
| `src/lib/seo/openGraph.ts` | `SITE_OG_IMAGE` (`{ url: "/opengraph-image", width: 1200, height: 630, alt }`) and `OG_IMAGE_ALT` — the plain-data reference page `generateMetadata` uses as the image fallback. |

The file-convention routes (`/opengraph-image`, `/twitter-image`) supply the
image automatically for every route that does **not** set its own — home,
`/tours`, `/blog`, `/contact`, and the three legal pages. Verified in the build
output: `og:image` + `og:image:{type,width,height,alt}` and the matching
`twitter:image:*` tags are present on `/`.

### `src/app/layout.tsx`

Removed the `resolveImage("route-map")` fallback chain and the manual
`images` arrays from `openGraph` / `twitter`; the file-convention routes now
own those tags. `seo.ogImage` was deleted from `src/config.ts` (dead).

### `src/app/(site)/tours/[slug]/page.tsx` and `src/app/(site)/blog/[slug]/page.tsx`

`generateMetadata` now, in each of `openGraph` **and** `twitter` (set in full,
since neither merges):

- `siteName: siteConfig.brand.name`, `locale: "en_US"`.
- `images: [ cover ? { url: cover } : SITE_OG_IMAGE ]` — the tour cover /
  post image when present, else the branded card.
- `description` falls back to a module-level `FALLBACK_DESCRIPTION` constant so
  `<meta name="description">` is never empty.
- Blog also emits `modifiedTime` (was only `publishedTime`).

Verified in the build: `/tours/the-7-day-sri-lanka-escape` emits matching
`og:*` and `twitter:*` title/description and its own cover image, plus
`og:site_name`.

### `src/app/sitemap.ts`

- `export const revalidate = 3600` — an hourly safety net (build output now
  shows `/sitemap.xml` with `Revalidate 1h`).
- `siteUrl` is now trailing-slash-stripped (`.replace(/\/$/, "")`), matching
  `structuredData.ts` and `llms.txt/route.ts`.

### `src/app/admin/(dashboard)/tours/actions.ts` and `content-actions.ts`

`revalidateToursCache()` / `revalidateContentCache()` now also call
`revalidatePath("/sitemap.xml")` and `revalidatePath("/llms.txt")` so an admin
publish/unpublish refreshes both route maps immediately instead of waiting for
the hourly revalidate.

## Tests

| File | Covers |
|---|---|
| `tests/app/og-metadata.test.ts` | `SITE_OG_IMAGE` / `OG_IMAGE_ALT` values; source scan — `opengraph-image` is `next/og` at 1200×630 with `image/png`; `twitter-image` re-exports it; layout drops `route-map` / `og-image` / `keywords`; both detail pages set `siteName` + `locale` + image fallback + description fallback + a mirrored `twitter` block; `sitemap.ts` has `revalidate = 3600`; both admin actions `revalidatePath` the two route maps; `config.ts` has a `contact` block that `structuredData` / `settings` / legal pages read by name; Terms no longer says "Colombo"; `robots.ts` strips a trailing slash; `not-found.tsx` + `manifest.ts` exist; `/blog` title vs h1; `tourSchema` `AggregateOffer` |
| `tests/unit/structuredData.test.ts` | `organizationSchema` NAP comes from `siteConfig.contact` with `addressRegion` + `postalCode`; `tourSchema.offers` is an `AggregateOffer` with `lowPrice`; `blogPostingSchema.author` is a self-contained `Organization` node |
| `tests/e2e/public.spec.ts` | `/opengraph-image` returns `200` `image/*`; homepage `<head>` has exactly one `og:image` + one `twitter:image`; `/manifest.webmanifest` serves the manifest; an unknown route returns `404` with the branded not-found page |

## Also fixed in this pass (rest of the audit)

### NAP is a single named source — `src/config.ts`

New top-level `contact` block (`email`, `phone`, `addressLine`, structured
`address` with `addressRegion` + `postalCode`) is the one source of truth.
`enquiry.contactDetails` is now derived from it; `src/lib/seo/structuredData.ts`,
`src/lib/settings.ts` and the three legal pages read `siteConfig.contact.*` by
name instead of `contactDetails[0]/[1]/[2]`. The Terms page's "based in Colombo"
line — which contradicted the Delgoda address in the schema — now says Delgoda.
`organizationSchema` `PostalAddress` gains `addressRegion` and `postalCode`.

### Structured-data correctness — `src/lib/seo/structuredData.ts`

- `blogPostingSchema.author` is now a self-contained `Organization` node
  (`@type` + `@id` + `name` + `url`), not a bare `{ "@id" }` that dangles when
  the block is read in isolation. `publisher` gains `url` too.
- `tourSchema.offers` is an `AggregateOffer` with `lowPrice` — honest for a
  "from" price — instead of an `Offer` with an exact `price`.

### Misc — `src/app`

- `robots.ts` strips a trailing slash from `siteConfig.brand.siteUrl` (matches
  `sitemap.ts` / `structuredData.ts` / `llms.txt`).
- `not-found.tsx` — branded global 404 (`Header` + `Footer` + recovery links,
  `robots: noindex, follow`).
- `manifest.ts` — `MetadataRoute.Manifest` (`/manifest.webmanifest`): name,
  colours, `/icon.png`.
- `layout.tsx` drops the `keywords` meta (ignored by Google; `seo.keywords`
  removed from config).
- `/blog` `<title>` is now `"Sri Lanka Travel Blog"` (the visible `<h1>` stays
  "The Travel Trails Blog").
- `admin/ImageUpload.tsx` preview `<img>` gets a real `alt` + `loading="lazy"`.

## Manual verification

- `npm run typecheck` — clean.
- `npm test` — 147 passing.
- `npx next build` — clean; `/opengraph-image`, `/twitter-image`,
  `/manifest.webmanifest`, `/_not-found` listed as static routes; `/sitemap.xml`
  shows `Revalidate 1h`. Built HTML inspected: `og:*` / `twitter:*` on `/`,
  `/tours/[slug]`, `/blog/[slug]`; `AggregateOffer` + full `PostalAddress` in the
  tour JSON-LD; self-contained `author` in the blog JSON-LD; no `keywords` meta.
- `npm run test:e2e` — not run here (needs a live server + browsers).
- Post-deploy: Facebook Sharing Debugger / Twitter Card Validator on a tour
  URL; publish a tour in `/admin` and confirm it appears in `/sitemap.xml`
  without a redeploy; Rich Results Test on a tour + blog URL.

## Still not done (needs infra / product input)

- Host-level canonical origin: confirm Netlify redirects non-www → www (or
  vice-versa) and HTTP → HTTPS to match `metadataBase`
  (`https://www.traveltrails.agency`).
- No `apple-icon` (only `icon.png`) — cosmetic; add a 180×180 PNG if desired.
- `contact` values (postal code `11700`, region "Western Province") are best
  guesses — confirm with the client and keep in step with the Google Business
  Profile.
