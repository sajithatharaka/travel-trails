# Phase 2 — Booking Requests & Contacts

**Created:** 2026-09-04

## Change history

| Date | Change |
|---|---|
| 2026-09-04 | Initial implementation. |
| 2026-09-06 | Extracted pure edge-fn helpers to `_shared/pure.ts` for unit testing. |
| 2026-09-06 | Bug fix: a placeholder `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (the `.env.example` `0x<site-key>` stand-in) mounted the widget with a key Cloudflare rejects inside `turnstile.render()`; on a client-side navigation to the homepage that throw hit the route error boundary and blanked the page (arriving via the `/#faq` nav link looked like a 404). Added `src/lib/turnstile.ts` as the single site-key source (placeholder-shaped values → "not configured"), and `TurnstileWidget` now try/catches `render()` so a bad key can never take down its route. |

## Overview

Public enquiry and contact forms, protected by Cloudflare Turnstile, written to
the database only by service-role edge functions, with a Resend email to the
configured recipients. Admin queues to triage and respond.

## Data model

`20260902000000_bookings_contacts.sql`:

| Table | Notes |
|---|---|
| `booking_requests` | tour_id / tour_slug / tour_title, first/last name, email, phone, travel_date, travellers, adults, children, message, `status` (`pending` / `confirmed` / `cancelled`), handled_by / handled_at. **No public insert policy.** |
| `contact_submissions` | name, email, phone, subject, message. **No public insert policy.** |

`20260902000001_notifications.sql`:

| Table | Notes |
|---|---|
| `notification_recipients` | email, is_active. Read: any team member. Write: **admin only** (`app_metadata.role = 'admin'`). |
| `notification_dispatch_logs` | unique `dedupe_key`, event_type, status, details — makes retries idempotent. |

RLS: `booking_requests` / `contact_submissions` — `select` / `update` / `delete`
to any authenticated team member; **insert only to `service_role`**. Verified by
`tests/integration/edge-functions.test.ts`.

## Edge functions

- **`_shared/turnstile.ts`** — `verifyTurnstile` (fail-closed: returns `false`
  when `TURNSTILE_SECRET_KEY` is unset), `jsonResponse`, `invokeNotify`
  (server-to-server call to `notify-admin-events` with the service-role bearer).
- **`_shared/pure.ts`** — `isUuid`, `dedupeKeyFor`, `subjectFor`,
  `normalizeEmail`, `EMAIL_RE` (no Deno/fetch — unit-tested).
- **`submit-booking`, `submit-contact`** (`verify_jwt = false`): validate →
  verify Turnstile → insert with the service role → `invokeNotify`.
- **`notify-admin-events`** (`verify_jwt = true`): dedupe check → active
  recipients → one Resend email → log dispatch. `booking_status_changed`
  requires an authenticated caller. Travel Trails jungle/terracotta HTML
  templates (`template.ts`).
- `supabase/config.toml` registers all functions with the right `verify_jwt`.

## Frontend

- **`lib/turnstile.ts`** — resolves `NEXT_PUBLIC_TURNSTILE_SITE_KEY` once and
  exports `TURNSTILE_SITE_KEY` / `HAS_TURNSTILE`. Placeholder-shaped values
  (empty, `< >`, shorter than 8 chars) count as "not configured". Used by
  `TurnstileWidget`, `EnquiryForm`, `ContactForm`, and the `(site)` layout so
  they agree on whether Turnstile is on.
- **`TurnstileWidget`** — renders nothing when no real key is configured. When a
  key is set, `render()` is wrapped in try/catch: a rejected key is logged and
  the widget stays empty, never bubbling into the route's error boundary.
  `api.js` loaded once in `app/(site)/layout.tsx` when a key is set.
- **`EnquiryForm`** → `submit-booking`. On the homepage `#enquiry` and each
  `/tours/[slug]` `#enquire` section (tour context attached). Inputs carry
  `data-testid` (`enquiry-name`, `enquiry-email`, …).
- **`ContactForm`** + **`/contact`** page → `submit-contact`. Inputs carry
  `data-testid` (`contact-name`, …). Nav / footer "Contact" points to `/contact`.
- **`lib/notify.ts`** — `notifyBookingStatusChange` (admin access token) and
  `shouldNotifyStatusChange` guard.
- **`/admin/bookings`** — status-filtered list, detail dialog, Confirm / Cancel
  (saves status + emails the traveller), delete.
- **`/admin/contacts`** — list, detail dialog, delete.
- Dashboard shows pending-booking and contact counts.

## Tests

- `tests/integration/edge-functions.test.ts` — Turnstile-before-insert ordering,
  service-role usage, `invokeNotify` wiring, `verify_jwt` flags, dedupe, active-
  recipient filter, RLS lockdown (no public insert), fail-closed helper.
- `tests/unit/edge-pure.test.ts` — `isUuid`, `dedupeKeyFor` (confirm ≠ cancel),
  `subjectFor`, `normalizeEmail`, `EMAIL_RE`.
- `tests/unit/notify-guard.test.ts` — `shouldNotifyStatusChange`.
- `tests/components/EnquiryForm.test.tsx`, `ContactForm.test.tsx` — submit
  payload to the right function; function-level and transport errors surface.
- `tests/unit/turnstile.test.ts` — placeholder / short / angle-bracketed keys
  resolve to "not configured"; a real-looking key is trimmed and accepted.
- `tests/components/TurnstileWidget.test.tsx` — a throwing `render()` is
  swallowed (render tree survives, error logged); a placeholder key renders
  nothing and never calls `turnstile.render()`.
- `tests/e2e/public.spec.ts` — the contact form is present and functional.

## Known limitation

With `TURNSTILE_SECRET_KEY` unset on Supabase, every submission is rejected
server-side even though the UI accepts input — intentional fail-closed. Set the
secret before go-live. Until `/admin/notifications` exists (Phase 4), add a
`notification_recipients` row directly.

## Acceptance criteria

- [x] Bot cannot POST to `booking_requests` / `contact_submissions` via REST.
- [x] A tour-page enquiry reaches `/admin/bookings`; Confirm/Cancel emails the
      traveller (given recipients + Resend secrets).
- [x] `npm run build`, `npm run typecheck`, `npm test` pass.
