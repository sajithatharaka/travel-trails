# Phase 4 — Settings, Notifications, Users, Technical Notes, User Guide

**Created:** 2026-09-06

## Change history

| Date | Change |
|---|---|
| 2026-09-06 | Initial implementation. |
| 2026-09-06 | Footer: copyright + "Designed and Developed by Booma Tech" now render as one centred block (`©  <year> <brand>. All rights reserved.` then a `<br />` then the attribution, link `https://boomatech.io/`, opens in a new tab, `data-testid="footer-attribution-link"`). Year is computed at render time via `new Date().getFullYear()`; brand is `settings.brand_name`. Unused `siteConfig.footer.legal` string removed in favour of `siteConfig.footer.attribution` (`prefix` / `companyName` / `companyUrl`). |
| 2026-09-10 | Technical Notes → Resend entry: spell out that `RESEND_API_KEY` **and** `NOTIFICATION_FROM_EMAIL` are both required Edge Function secrets (not deployed by `scripts/deploy-supabase.sh`) and that a missing one now leaves a `failed` / `missing_email_config` row in `notification_dispatch_logs` instead of failing silently. See [phase-2-bookings-contacts.md](./phase-2-bookings-contacts.md) 2026-09-10. |
| 2026-09-10 | Site Settings gains a **`hero_images`** key (JSON array of public image URLs) driving the homepage hero slideshow. Migration `20260910000000_hero_images_setting.sql` seeds it to `[]`. `getSiteSettings()` returns `hero_images: string[]` via `parseHeroImages()` (`lib/format.ts`, drops blanks/non-strings). `/admin/settings` adds a "Homepage hero slideshow" card (`data-testid="settings-hero-images"`) to upload (to `media/hero/`), reorder and remove images; saved as one `upsert` row alongside the text keys. Homepage: `HeroSlider` slides come from `settings.hero_images` when non-empty (2+ ⇒ auto-rotate), else the featured-tour cover fallback. See [homepage-hero.md](./homepage-hero.md) 2026-09-10. Tests: `tests/unit/format.test.ts`, `tests/app/home-hero.test.ts`. |
| 2026-09-10 | `/admin/notifications`: raw Postgres errors are no longer shown to the admin. All three mutations route errors through `recipientErrorMessage(error, email?)` (`notifications/recipientErrors.ts`): a `23505` unique violation (or the index name in the message) on **add** becomes **"`<email>` is already on the notifications list."** (naming the address the admin typed), an RLS / `42501` error becomes **"You don't have permission to change the recipients list."**, and everything else becomes **"Something went wrong. Please try again."** — no raw PostgREST text ever reaches the toast. Covered by `tests/unit/recipient-errors.test.ts`. |
| 2026-09-11 | Footer "Explore" column gains a **Blog** link (`/blog`), added to `siteConfig.footer.exploreLinks` between Tours and FAQ so it matches the header nav. Covered by `tests/components/Footer.test.tsx`. |

## Site settings

`20260904000000_site_settings.sql` — `site_settings (key text pk, value jsonb,
updated_at)`. Public `select`; any authenticated team member can write. Seeded
from `src/config.js` defaults.

`lib/settings.ts` — `getSiteSettings()` (cached under `SETTINGS_TAG`, wrapped in
`React.cache`) returns a typed `SiteSettings` object: the text keys come from
`mergeSettings(SETTINGS_TEXT_DEFAULTS, storedRows)` (`lib/format.ts`) — a stored
non-empty string overrides the config default; blanks / non-strings / unknown
keys are ignored — and `hero_images` comes from `parseHeroImages(raw.hero_images)`
(array of non-empty string URLs, `[]` when missing or malformed).

Managed text keys: `brand_name`, `contact_email`, `contact_phone`,
`contact_address`, `whatsapp_number`, `whatsapp_message`, `footer_description`,
`footer_group_note`. Managed non-text key: `hero_images` (`string[]`, homepage
hero slideshow — see [homepage-hero.md](./homepage-hero.md)).

Wired into the public site: **Footer** (brand + description + group note),
**`app/(site)/layout.tsx`** (WhatsApp number + message), homepage `#enquiry`
contact list. `revalidateSettingsCache` server action busts the cache
(`revalidatePath("/", "layout")`).

The Footer's bottom block is a single centred element: the copyright line (year
computed at render time via `new Date().getFullYear()`, brand from
`settings.brand_name`), a `<br />`, then **"Designed and Developed by Booma
Tech"** (`siteConfig.footer.attribution`, link `https://boomatech.io/`).

- **`/admin/settings`** — one form for the managed keys, `upsert` on save.
  Text inputs carry `data-testid` (`settings-<key>`). A "Homepage hero
  slideshow" card (`data-testid="settings-hero-images"`) manages `hero_images`:
  `ImageUpload` (folder `hero`, bucket `media`) appends a URL; each row has
  reorder (up/down) and remove (`settings-hero-image-remove-<i>`) controls; the
  array is written as one `hero_images` row in the same `upsert`.

## Admin-only screens

Gated by `<RequireRole adminOnly>` (client) and, for server pages,
`requireAdmin()`. Hidden from tour designers in the sidebar ("Admin" nav group,
`adminOnly: true`, filtered by `useAuth().isAdmin`).

- **`/admin/notifications`** — add / activate / deactivate / remove
  `notification_recipients`. Insert/update/delete gated to admins by RLS too.
  The unique index is on `lower(trim(email))`, so a duplicate add (any casing /
  whitespace) is caught and shown as "`<email>` is already on the notifications
  list." via `recipientErrorMessage()` rather than the raw constraint error.
- **`/admin/users`** — list `profiles`; create (calls the `manage-users` edge
  function with the caller's access token), change role
  (`admin` / `tour_designer`), delete. Cannot change or delete your own row.
- **`/admin/technical-notes`** — static reference: Supabase, Netlify env vars,
  Turnstile (fail-closed note), Resend secrets (`RESEND_API_KEY` +
  `NOTIFICATION_FROM_EMAIL`, both required; set with `supabase secrets set`, not
  by the deploy script; a missing one is recorded as a `failed` dispatch row),
  the shared `software.treetrails@gmail.com` analytics account, registrar, and
  the seeded first admin.

## Other

- **`/admin/user-guide`** — accordion describing every admin section and how it
  maps to the public site.
- `AdminShell` sidebar: every item is live; "Settings" (Site Settings) is
  visible to all team members, the "Admin" group only to admins.

## Tests

- `tests/components/Footer.test.tsx` — renders the Booma Tech attribution link
  (href, `target="_blank"`, `rel`) and a copyright line with the current year
  (fake timers).
- `tests/unit/format.test.ts` — `mergeSettings` override / ignore rules and
  `parseHeroImages` (order kept, blanks / non-strings / non-arrays dropped).
- `tests/app/home-hero.test.ts` — the homepage `HeroSlider` is fed from
  `settings.hero_images`.
- `tests/integration/edge-functions.test.ts` — `manage-users` is admin-only and
  only allows the two Travel Trails roles.
- `tests/e2e/admin.spec.ts` — admin-only routes still bounce to login when
  signed out.

## Acceptance criteria

- [x] An admin can change brand / contact details and the public site reflects
      them within the cache window (no deploy).
- [x] Tour designers do not see Notifications / Users / Technical Notes.
- [x] `npm run build`, `npm run typecheck`, `npm test`, `npm run test:e2e` pass.
- [ ] First `notification_recipients` row added; Resend + Turnstile secrets set
      on Supabase (launch task).
