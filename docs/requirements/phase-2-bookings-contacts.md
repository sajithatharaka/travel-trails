# Phase 2 — Booking Requests & Contacts

**Created:** 2026-09-04

## Change history

| Date | Change |
|---|---|
| 2026-09-04 | Initial implementation. |
| 2026-09-06 | Extracted pure edge-fn helpers to `_shared/pure.ts` for unit testing. |
| 2026-09-06 | Bug fix: a placeholder `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (the `.env.example` `0x<site-key>` stand-in) mounted the widget with a key Cloudflare rejects inside `turnstile.render()`; on a client-side navigation to the homepage that throw hit the route error boundary and blanked the page (arriving via the `/#faq` nav link looked like a 404). Added `src/lib/turnstile.ts` as the single site-key source (placeholder-shaped values → "not configured"), and `TurnstileWidget` now try/catches `render()` so a bad key can never take down its route. |
| 2026-09-06 | Bug fix: when `submit-booking` / `submit-contact` returned a non-2xx (e.g. Turnstile 400/403), the forms rendered `error.message` verbatim — the fixed supabase-js string `"Edge Function returned a non-2xx status code"` — because the real `{ error }` JSON body is only on `error.context`. Added `src/lib/edgeFunctionError.ts` (`resolveEdgeFunctionError`): reads the function body from `error.context`, maps the known verification/validation strings to friendly copy, and otherwise returns a generic "please try again in a moment, or email us directly" fallback. Transport failures ("Failed to fetch") and any unrecognised message now also show the fallback rather than a raw string. Wired into `EnquiryForm` and `ContactForm`. |
| 2026-09-06 | Turnstile hardening (existing-widget integration, real site key `0x4AAAAAAEqgjFCv-h6geTYP`). `verifyTurnstile` now enforces all three of Cloudflare's checks — `success` **and** `action === "travel-trails-form"` **and** `hostname` on the `TURNSTILE_ALLOWED_HOSTNAMES` allowlist — plus a malformed-token guard (non-empty, ≤ 2048 chars) and a 10s `siteverify` timeout; still fail-closed (unset secret **or** empty allowlist ⇒ reject). Added `TURNSTILE_ACTION` to `src/lib/turnstile.ts` as the single source the widget renders with and the edge function re-checks. New Supabase secret `TURNSTILE_ALLOWED_HOSTNAMES`, plus a `TURNSTILE_ALLOW_LOCALHOST=true` dev-only switch that adds the loopback hosts to the allowlist. See [turnstile-existing-widget-integration.md](./turnstile-existing-widget-integration.md). |
| 2026-09-06 | Enquiry `travel_date` must be a future date. New `src/lib/travelDate.ts` (`earliestTravelDate` / `isFutureTravelDate`); the date input is `min`-bound to tomorrow and the form blocks a past/today value before submit; `submit-booking` re-checks server-side (`400 travel_date must be in the future`) before the insert. See [booking-travel-date-future.md](./booking-travel-date-future.md). |
| 2026-09-10 | Split "contact submission" from "tour enquiry". `EnquiryForm` (→ `submit-booking` → `booking_requests`) is now **tour-page-only**: its `tourId` / `tourSlug` / `tourTitle` props are required and **every field is mandatory** — name, email, expected travel date, travellers, message — enforced in the form (`validate`) and re-checked in `submit-booking` (`400 "tour, name, email, travel date, travellers and message are required"`; `tour_id` must be a UUID; `travellers` an integer ≥ 1). The date field label is now **"Expected Travel Date"**. The homepage `#enquiry` section gets its own tour-free **`GeneralEnquiryForm`** → `submit-contact` → `contact_submissions` (no tour context; keeps the hero "Customize My Trip" prefill). Shared submit flow (Turnstile gate → invoke → reset → `resolveEdgeFunctionError`) extracted to `src/components/useTurnstileSubmit.ts` and adopted by `ContactForm`, `GeneralEnquiryForm`, `EnquiryForm`. |
| 2026-09-10 | Bug fix: a new booking / contact produced **no notification email and no trace** when the `notify-admin-events` email secrets were unset. `invokeNotify` did `await fetch(...)` without checking `res.ok`, and `notify-admin-events` returned `500` for missing `RESEND_API_KEY` / `NOTIFICATION_FROM_EMAIL` *before* writing any dispatch log — so the swallowed 500 left nothing behind. Now: `invokeNotify` logs every failure mode with an `[invokeNotify]` prefix (missing service env, non-2xx from `notify-admin-events` with status + body); `notify-admin-events` writes a `failed` row to `notification_dispatch_logs` (`details.reason = "missing_email_config"`) before the 500. `scripts/deploy-supabase.sh` now documents that Edge Function secrets (`RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_ALLOWED_HOSTNAMES`) are set separately with `supabase secrets set` and prints a post-deploy reminder. |

## Overview

Public enquiry and contact forms, protected by Cloudflare Turnstile, written to
the database only by service-role edge functions, with a Resend email to the
configured recipients. Admin queues to triage and respond.

## Data model

`20260902000000_bookings_contacts.sql`:

| Table | Notes |
|---|---|
| `booking_requests` | tour_id / tour_slug / tour_title, first/last name, email, phone, travel_date, travellers, adults, children, message, `status` (`pending` / `confirmed` / `cancelled`), handled_by / handled_at. Written only by `submit-booking`, which now requires tour context + name + email + travel_date + travellers + message (columns stay nullable for historical rows). **No public insert policy.** |
| `contact_submissions` | name, email, phone, subject, message — **never any tour context**. Written by `submit-contact` from both `/contact` (`ContactForm`) and the homepage `#enquiry` section (`GeneralEnquiryForm`). **No public insert policy.** |

`20260902000001_notifications.sql`:

| Table | Notes |
|---|---|
| `notification_recipients` | email, is_active. Read: any team member. Write: **admin only** (`app_metadata.role = 'admin'`). |
| `notification_dispatch_logs` | unique `dedupe_key`, event_type, status, details — makes retries idempotent. |

RLS: `booking_requests` / `contact_submissions` — `select` / `update` / `delete`
to any authenticated team member; **insert only to `service_role`**. Verified by
`tests/integration/edge-functions.test.ts`.

## Edge functions

- **`_shared/turnstile.ts`** — `verifyTurnstile`, `jsonResponse`, `invokeNotify`
  (server-to-server call to `notify-admin-events` with the service-role bearer).
  `invokeNotify` is best-effort — it never blocks the form submission — but
  logs every failure mode with an `[invokeNotify]` prefix (missing service env;
  a non-2xx from `notify-admin-events`, with status and response body) so a
  silently missing email is traceable from the submit-* function logs.
  `verifyTurnstile` is fail-closed and requires **all** of: `TURNSTILE_SECRET_KEY`
  set; a well-formed token (non-empty, ≤ 2048 chars); a non-empty
  hostname allowlist; and a `siteverify` response with `success === true`,
  `action === "travel-trails-form"`, and `hostname` on the allowlist. The
  allowlist is `TURNSTILE_ALLOWED_HOSTNAMES` (never `localhost`), plus the
  loopback hosts when `TURNSTILE_ALLOW_LOCALHOST=true` (local dev only). The
  `siteverify` call is bounded by a 10s timeout; a network error or non-2xx from
  Cloudflare rejects.
- **`_shared/pure.ts`** — `isUuid`, `dedupeKeyFor`, `subjectFor`,
  `normalizeEmail`, `EMAIL_RE` (no Deno/fetch — unit-tested).
- **`submit-booking`, `submit-contact`** (`verify_jwt = false`): validate →
  verify Turnstile → insert with the service role → `invokeNotify`.
  `submit-booking` treats every field as **mandatory** — `tour_id` (a UUID),
  `first_name`, `email`, `travel_date`, `travellers` (integer ≥ 1) and a
  non-empty `message` — returning `400 "tour, name, email, travel date,
  travellers and message are required"` before the insert. It then rejects a
  `travel_date` that isn't `YYYY-MM-DD` strictly after today (UTC) with
  `400 travel_date must be in the future` — see
  [booking-travel-date-future.md](./booking-travel-date-future.md).
  `submit-contact` (name / email / message required) is the only tour-free
  path — used by both `/contact` and the homepage `#enquiry` section.
- **`notify-admin-events`** (`verify_jwt = true`): dedupe check → active
  recipients → one Resend email → log dispatch. `booking_status_changed`
  requires an authenticated caller. Travel Trails jungle/terracotta HTML
  templates (`template.ts`). If `RESEND_API_KEY` or `NOTIFICATION_FROM_EMAIL`
  is unset it writes a `failed` row to `notification_dispatch_logs`
  (`details.reason = "missing_email_config"`) and returns `500` — the missing
  email is visible in `/admin` rather than lost.
- Edge Function **secrets** are per-project and set with `supabase secrets set`
  (or the dashboard), *not* by `scripts/deploy-supabase.sh`. Required:
  `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL` (a Resend-verified sender),
  `TURNSTILE_SECRET_KEY`, `TURNSTILE_ALLOWED_HOSTNAMES`. Check with
  `npx supabase secrets list`.
- `supabase/config.toml` registers all functions with the right `verify_jwt`.

## Frontend

- **`lib/turnstile.ts`** — resolves `NEXT_PUBLIC_TURNSTILE_SITE_KEY` once and
  exports `TURNSTILE_SITE_KEY` / `HAS_TURNSTILE` / `TURNSTILE_ACTION`.
  Placeholder-shaped values (empty, `< >`, shorter than 8 chars) count as "not
  configured". Used by `TurnstileWidget`, `useTurnstileSubmit` (and through it
  `EnquiryForm`, `ContactForm`, `GeneralEnquiryForm`), and the `(site)` layout so
  they agree on whether Turnstile is on. `TURNSTILE_ACTION`
  (`"travel-trails-form"`) is the single action name the widget renders with and
  the edge function re-checks server-side.
- **`TurnstileWidget`** — renders nothing when no real key is configured. When a
  key is set, `render()` is wrapped in try/catch: a rejected key is logged and
  the widget stays empty, never bubbling into the route's error boundary.
  `api.js` loaded once in `app/(site)/layout.tsx` when a key is set.
- **`lib/edgeFunctionError.ts`** — `resolveEdgeFunctionError({ data, error }, fallback)`.
  supabase-js reports an edge function's non-2xx as a `FunctionsHttpError` whose
  `.message` is the fixed `"Edge Function returned a non-2xx status code"`; the
  useful `{ error }` body is only on `error.context` (a `Response`). The resolver
  reads that body, maps the known server strings (`Missing verification token`,
  `Verification failed`, `Bad request`, the three "…are required" validation
  messages — including the tour-enquiry "tour, name, email, travel date,
  travellers and message are required" → "Please fill in every field…") to
  friendly copy, and returns the caller's generic `fallback` for
  transport failures and anything unrecognised. Never surfaces a raw internal
  string. Returns `null` on success.
- **`useTurnstileSubmit`** (`src/components/useTurnstileSubmit.ts`) — the shared
  submit flow for the three public forms: gate on a solved Turnstile token, run
  the form's `validate(fd)`, `supabase.functions.invoke(functionName, { body })`,
  reset the widget, then map any failure through `resolveEdgeFunctionError`.
  Returns `{ status, errorMsg, token, setToken, turnstileRef, handleSubmit }`.
- **`EnquiryForm`** → `submit-booking`. **Only** on the `/tours/[slug]`
  `#enquire` section — `tourId` / `tourSlug` / `tourTitle` are required props and
  always travel with the submission. Every field is mandatory (name, email,
  expected travel date, travellers, message); an empty field blocks submit with
  an inline "fill in every field" message. Inputs carry `data-testid`
  (`enquiry-name`, `enquiry-email`, …). The `travel_date` input is labelled
  **"Expected Travel Date"**, `min`-bound to tomorrow (`lib/travelDate.ts`), and
  a past / today value is blocked before submit with an inline "choose a travel
  date in the future" message. Errors routed through `resolveEdgeFunctionError`
  (fallback: "…couldn't send your enquiry just now…").
- **`GeneralEnquiryForm`** → `submit-contact` → `contact_submissions`. The
  homepage `#enquiry` "get in touch" form — **tour-free** (no `tour_*` in the
  payload), `subject: "Website enquiry"`. Keeps the hero "Customize My Trip"
  prefill (`PREFILL_MESSAGE_EVENT`). Inputs carry `data-testid`
  (`general-enquiry-name`, …).
- **`ContactForm`** + **`/contact`** page → `submit-contact`. Inputs carry
  `data-testid` (`contact-name`, …). Nav / footer "Contact" points to `/contact`.
  Errors routed through `resolveEdgeFunctionError` (fallback: "…couldn't send
  your message just now…").
- **`lib/notify.ts`** — `notifyBookingStatusChange` (admin access token) and
  `shouldNotifyStatusChange` guard.
- **`/admin/bookings`** — status-filtered list, detail dialog, Confirm / Cancel
  (saves status + emails the traveller), delete.
- **`/admin/contacts`** — list, detail dialog, delete.
- Dashboard shows pending-booking and contact counts.

## Tests

- `tests/integration/edge-functions.test.ts` — Turnstile-before-insert ordering,
  service-role usage, `invokeNotify` wiring, `verify_jwt` flags, dedupe, active-
  recipient filter, RLS lockdown (no public insert), fail-closed helper, the
  `verifyTurnstile` `success` + `action` + hostname-allowlist checks, the
  malformed-token / empty-allowlist guards, the `siteverify` timeout, the
  `submit-booking` non-future `travel_date` guard sitting before the insert,
  the `submit-booking` mandatory-fields guard (tour UUID + name + email + travel
  date + travellers ≥ 1 + message) sitting before the insert,
  `invokeNotify` logging every failure mode, `notify-admin-events` writing a
  `failed` dispatch row on missing email config, and `deploy-supabase.sh`
  documenting the required Edge Function secrets.
- `tests/unit/travel-date.test.ts` — `todayISODate` / `earliestTravelDate`
  (rollover) and `isFutureTravelDate` (future only; rejects today / past /
  malformed).
- `tests/unit/edge-pure.test.ts` — `isUuid`, `dedupeKeyFor` (confirm ≠ cancel),
  `subjectFor`, `normalizeEmail`, `EMAIL_RE`.
- `tests/unit/notify-guard.test.ts` — `shouldNotifyStatusChange`.
- `tests/components/EnquiryForm.test.tsx`, `ContactForm.test.tsx`,
  `GeneralEnquiryForm.test.tsx` — submit payload to the right function; a known
  function-level error is shown as friendly copy; a non-2xx `FunctionsHttpError`
  is read from `error.context` (never the raw "non-2xx status code" string); an
  unrecognised / transport failure shows the generic fallback. `EnquiryForm`
  also: the "Expected Travel Date" label, every field marked `required`, and an
  empty field blocking submit with an inline message. `GeneralEnquiryForm` also:
  no `tour_*` keys in the payload and the hero `PREFILL_MESSAGE_EVENT` prefill.
- `tests/unit/edge-function-error.test.ts` — `resolveEdgeFunctionError`: success →
  `null`, 200-body error mapping (incl. the tour-enquiry mandatory-fields
  message), `error.context` body parsing, fallback for unknown message /
  transport failure / non-JSON body.
- `tests/unit/turnstile.test.ts` — placeholder / short / angle-bracketed keys
  resolve to "not configured"; a real-looking key is trimmed and accepted;
  `TURNSTILE_ACTION` is `"travel-trails-form"`.
- `tests/components/TurnstileWidget.test.tsx` — a throwing `render()` is
  swallowed (render tree survives, error logged); a placeholder key renders
  nothing and never calls `turnstile.render()`; a real key calls
  `turnstile.render()` with `action: "travel-trails-form"`.
- `tests/e2e/public.spec.ts` — the homepage `GeneralEnquiryForm`
  (`general-enquiry-*`) and the `/contact` `ContactForm` are present.

## Known limitation

With `TURNSTILE_SECRET_KEY` **or** `TURNSTILE_ALLOWED_HOSTNAMES` unset on
Supabase, every submission is rejected server-side even though the UI accepts
input — intentional fail-closed. Set both before go-live
(`TURNSTILE_ALLOWED_HOSTNAMES` = the live hostnames, comma-separated, no
`localhost`). For local dev set `TURNSTILE_ALLOW_LOCALHOST=true` rather than
adding loopback hosts to the allowlist. Until `/admin/notifications` exists
(Phase 4), add a `notification_recipients` row directly.

## Acceptance criteria

- [x] Bot cannot POST to `booking_requests` / `contact_submissions` via REST.
- [x] A tour-page enquiry reaches `/admin/bookings`; Confirm/Cancel emails the
      traveller (given recipients + Resend secrets).
- [x] `npm run build`, `npm run typecheck`, `npm test` pass.
