# Phase 4 — Settings, Notifications, Users, Technical Notes, User Guide

**Created:** 2026-09-06

## Change history

| Date | Change |
|---|---|
| 2026-09-06 | Initial implementation. |
| 2026-09-06 | Footer: copyright + "Designed and Developed by Booma Tech" now render as one centred block (`©  <year> <brand>. All rights reserved.` then a `<br />` then the attribution, link `https://boomatech.io/`, opens in a new tab, `data-testid="footer-attribution-link"`). Year is computed at render time via `new Date().getFullYear()`; brand is `settings.brand_name`. Unused `siteConfig.footer.legal` string removed in favour of `siteConfig.footer.attribution` (`prefix` / `companyName` / `companyUrl`). |

## Site settings

`20260904000000_site_settings.sql` — `site_settings (key text pk, value jsonb,
updated_at)`. Public `select`; any authenticated team member can write. Seeded
from `src/config.js` defaults.

`lib/settings.ts` — `getSiteSettings()` (cached under `SETTINGS_TAG`, wrapped in
`React.cache`) returns a typed `SiteSettings` object produced by
`mergeSettings(SETTINGS_DEFAULTS, storedRows)` (`lib/format.ts`): a stored
non-empty string overrides the config default; blanks / non-strings / unknown
keys are ignored.

Managed keys: `brand_name`, `contact_email`, `contact_phone`, `contact_address`,
`whatsapp_number`, `whatsapp_message`, `footer_description`, `footer_group_note`.

Wired into the public site: **Footer** (brand + description + group note),
**`app/(site)/layout.tsx`** (WhatsApp number + message), homepage `#enquiry`
contact list. `revalidateSettingsCache` server action busts the cache
(`revalidatePath("/", "layout")`).

The Footer's bottom block is a single centred element: the copyright line (year
computed at render time via `new Date().getFullYear()`, brand from
`settings.brand_name`), a `<br />`, then **"Designed and Developed by Booma
Tech"** (`siteConfig.footer.attribution`, link `https://boomatech.io/`).

- **`/admin/settings`** — one form for the managed keys, `upsert` on save.
  Inputs carry `data-testid` (`settings-<key>`).

## Admin-only screens

Gated by `<RequireRole adminOnly>` (client) and, for server pages,
`requireAdmin()`. Hidden from tour designers in the sidebar ("Admin" nav group,
`adminOnly: true`, filtered by `useAuth().isAdmin`).

- **`/admin/notifications`** — add / activate / deactivate / remove
  `notification_recipients`. Insert/update/delete gated to admins by RLS too.
- **`/admin/users`** — list `profiles`; create (calls the `manage-users` edge
  function with the caller's access token), change role
  (`admin` / `tour_designer`), delete. Cannot change or delete your own row.
- **`/admin/technical-notes`** — static reference: Supabase, Netlify env vars,
  Turnstile (fail-closed note), Resend secrets, the shared
  `software.treetrails@gmail.com` analytics account, registrar, and the seeded
  first admin.

## Other

- **`/admin/user-guide`** — accordion describing every admin section and how it
  maps to the public site.
- `AdminShell` sidebar: every item is live; "Settings" (Site Settings) is
  visible to all team members, the "Admin" group only to admins.

## Tests

- `tests/components/Footer.test.tsx` — renders the Booma Tech attribution link
  (href, `target="_blank"`, `rel`) and a copyright line with the current year
  (fake timers).
- `tests/unit/format.test.ts` — `mergeSettings` override / ignore rules.
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
