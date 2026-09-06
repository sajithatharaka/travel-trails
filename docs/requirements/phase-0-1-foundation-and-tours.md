# Phase 0–1 — Foundation & Tour Packages

**Created:** 2026-09-04

## Change history

| Date | Change |
|---|---|
| 2026-09-04 | Initial implementation (Phase 0 foundation + Phase 1 tours). |
| 2026-09-04 | Seed tour given a bundled cover image; hero fallback image id in config. |

## Phase 0 — Foundation

- Converted the project to **TypeScript** (`tsconfig.json`, all `.jsx/.js` → `.tsx/.ts`,
  `config.js` → `src/config.ts` trimmed to non-tour chrome).
- `next.config.ts` (Turbopack default); Supabase Storage image `remotePatterns`.
- **`src/proxy.ts`** (Next 16 `middleware` → `proxy` rename, Node runtime):
  refreshes the Supabase auth cookie and redirects unauthenticated `/admin/*`
  (except `/admin/login`) to the login page with a `next` param.
- Supabase clients: `client.ts` (browser), `server.ts` (per-request, async
  `cookies()`), `public.ts` (cookie-less reader for cached reads), `proxy.ts`
  (session refresh helper).
- Auth: `lib/auth.ts` (`getSession` / `requireSession` / `requireAdmin`),
  client `AuthProvider` + `useAuth`, `RequireRole` guard, `/admin/login`,
  guarded `app/admin/(dashboard)` shell (`AdminShell` grouped sidebar).
- Route groups: public pages under `app/(site)`, admin under `app/admin`.
- shadcn/ui component set copied from Tree Trails; Tailwind keeps the brand
  palette and adds shadcn semantic tokens + `forest/cream/earth/...` aliases;
  `tailwindcss-animate` + `@tailwindcss/typography`.
- **Migration `20260901000000_profiles.sql`** — `profiles` table (role
  `admin | tour_designer`), an `on_auth_user_created` trigger that seeds
  `sajithatharaka@gmail.com` as admin (everyone else `tour_designer`) and
  mirrors the role into `app_metadata` for the JWT claim.
- **Edge function `manage-users`** — admin-only create / delete / set-role.

## Phase 1 — Tour packages

**Tables** (`20260901000001_tours.sql`, `20260901000002/3_*` seed):

| Table | Purpose |
|---|---|
| `tours` | slug, title, summary, hero_*, duration_days, destination_count, `price_from_usd` (single "from" price, USD), cover/route-map image, `is_published`, `is_featured`, `display_order`, meta_* |
| `tour_days` | day_label, title, description, `experiences text[]`, experiences_label, note, image_url, anchor, display_order |
| `tour_route_stops` | num, name, description, anchor, display_order |

RLS: public `select` on published tours (+ their days/stops); any authenticated
team member has full CRUD. A public `media` storage bucket (public read,
authenticated write). Seed = "The 7-Day Sri Lanka Escape" ported from `config.js`.

**Reads** — `lib/tours.ts`: `listPublishedTours`, `getFeaturedTour`,
`getTourBySlug` cached with `unstable_cache` under `TOURS_TAG`;
`formatPriceFrom` (moved to `lib/format.ts`).

**Admin** — `/admin/tours`: list with publish / feature (only one) / reorder /
delete; `/admin/tours/[id]` full editor with day and route sub-editors, a "from"
price, cover + route-map + per-day `ImageUpload` (Supabase Storage). Mutations
call the `revalidateToursCache` server action (`revalidateTag(TOURS_TAG, "max")`).

**Public** — `/tours` index and `/tours/[slug]` detail (Server Components,
`generateMetadata`, an inline `EnquiryForm`). The homepage hero and Route
section come from the featured tour (`src/config.ts` `hero` is only a fallback
when nothing is featured); the homepage no longer expands one tour into a
day-by-day itinerary — instead it shows a 4-tile "featured trails" grid +
"View all tours" link, see
[home-featured-trails.md](./home-featured-trails.md). The full day-by-day
itinerary lives on `/tours/[slug]`. Dynamic `sitemap.ts` includes published
tours.

The `TouristTrip` / `CollectionPage` / `BreadcrumbList` JSON-LD for these routes
is built by `src/lib/seo/structuredData.ts` and rendered via `<JsonLd>` — see
[seo-structured-data.md](./seo-structured-data.md).

## Tests

`tests/unit/slug.test.ts`, `tests/unit/format.test.ts`,
`tests/unit/getInitials.test.ts`, `tests/integration/edge-functions.test.ts`
(manage-users admin-gating + role list), `tests/e2e/admin.spec.ts`
(auth-gate redirect + `next` param + invalid-credentials error),
`tests/e2e/public.spec.ts` (tours nav + sitemap).

## Acceptance criteria

- [x] `npm run build` and `npm run typecheck` pass.
- [x] `/admin` redirects to `/admin/login` when signed out.
- [x] The featured tour drives the homepage; site renders with config fallbacks
      when Supabase is unconfigured.
- [x] Admin can create a second tour, reorder, publish and feature it.
- [ ] Supabase project migrations pushed; `sajithatharaka@gmail.com` created.
