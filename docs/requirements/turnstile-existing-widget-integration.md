# Turnstile — Existing-Widget Integration

**Created:** 2026-09-06 20:30 WEST

## Context

The Cloudflare Turnstile widget was created out of band; this task wires the
already-existing widget into the app and hardens server-side verification to
Cloudflare's own guidance (the "existing-widget" flow of
`https://developers.cloudflare.com/turnstile/spin/prompt.md`).

- **Site key:** `0x4AAAAAAEqgjFCv-h6geTYP` (public — lives in
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, already set in `.env` / Netlify).
- **Assigned action:** `travel-trails-form`.
- **Secret:** `TURNSTILE_SECRET_KEY` — a Supabase Function secret set with
  `supabase secrets set`; never in `.env.local` or the client bundle. Retrieval
  is a manual operator step (the Spin skill's Wrangler retrieval flow is for a
  Cloudflare Workers backend, not Supabase Edge Functions).

## What changed

### Frontend
- `src/lib/turnstile.ts` — new export `TURNSTILE_ACTION = "travel-trails-form"`,
  the single source for the action the widget renders with.
- `src/components/TurnstileWidget.tsx` — renders with `action: TURNSTILE_ACTION`
  instead of an inline string literal.

### Edge functions
- `supabase/functions/_shared/turnstile.ts` — `verifyTurnstile` is fail-closed
  and now requires **all** of:
  1. `TURNSTILE_SECRET_KEY` set (unchanged).
  2. A well-formed token: a non-empty string of ≤ 2048 chars.
  3. A non-empty hostname allowlist. The production set is
     `TURNSTILE_ALLOWED_HOSTNAMES` (comma-separated, whitespace trimmed;
     `localhost` must never be listed). For local dev,
     `TURNSTILE_ALLOW_LOCALHOST=true` adds `localhost` / `127.0.0.1` / `::1` to
     the allowlist without touching the production list — never enable it in
     production.
  4. A `siteverify` response with `success === true`,
     `action === "travel-trails-form"`, and `hostname` on the allowlist.
  The `siteverify` request is bounded by a 10-second timeout; a network error or
  a non-2xx from Cloudflare rejects. Callers (`submit-booking`, `submit-contact`)
  are unchanged — they already reject with `403 Verification failed` on `false`.
  Every rejection path `console.warn`s a `[turnstile] …` line naming the failed
  check (missing secret, empty allowlist, malformed token, siteverify
  `error-codes`, action mismatch, hostname not on allowlist) — read it in the
  Supabase edge-function logs when a real submission is refused.

## Troubleshooting "We couldn't verify that you're human"

That copy (`src/lib/edgeFunctionError.ts`) maps the function's `403
Verification failed`, i.e. `verifyTurnstile` returned `false`. After deploying
the functions (`supabase functions deploy submit-contact submit-booking`) and
setting the secrets, reproduce once and read the `[turnstile]` log line:

| Log line | Fix |
|---|---|
| `TURNSTILE_SECRET_KEY is not set` | `supabase secrets set TURNSTILE_SECRET_KEY=…` (the secret of **this** widget, `0x4AAAAAAEqgjFCv-h6geTYP`). |
| `no hostname allowlist` | `supabase secrets set TURNSTILE_ALLOWED_HOSTNAMES=…`; local dev: `TURNSTILE_ALLOW_LOCALHOST=true`. |
| `success=false, error-codes: ["invalid-input-secret"]` | secret belongs to a different widget than the rendered sitekey — set the matching one. |
| `error-codes: ["invalid-input-response"] / ["timeout-or-duplicate"]` | token expired or already used (single-use, 300s) — reset the widget between attempts. |
| `action mismatch: got …` | something other than `TurnstileWidget` rendered the widget without `action: "travel-trails-form"`. |
| `hostname "x" not in allowlist […]` | add `x` (the exact host the page ran on — `www.` vs apex, a `*.netlify.app` preview, `localhost`) to `TURNSTILE_ALLOWED_HOSTNAMES`. |

### Config / reference
- `.env.example`, `.env` — document the new `TURNSTILE_ALLOWED_HOSTNAMES`
  Supabase Function secret.
- `src/app/admin/(dashboard)/technical-notes/page.tsx` — Turnstile note updated
  to list both secrets and the three-way `siteverify` check.

## New secret

| Secret | Where | Value | Unset behaviour |
|---|---|---|---|
| `TURNSTILE_ALLOWED_HOSTNAMES` | `supabase secrets set` | `www.traveltrails.agency,traveltrails.agency` | every submission rejected (fail-closed) |
| `TURNSTILE_ALLOW_LOCALHOST` | local dev only | `true` | loopback hosts not accepted (default) |

## Tests

- `tests/unit/turnstile.test.ts` — `TURNSTILE_ACTION` resolves to
  `"travel-trails-form"`.
- `tests/components/TurnstileWidget.test.tsx` — the widget calls
  `turnstile.render()` with `action: "travel-trails-form"` and the configured
  site key.
- `tests/integration/edge-functions.test.ts` — source assertions on
  `_shared/turnstile.ts`: the `success` + `action` + hostname-allowlist checks,
  the `TURNSTILE_ALLOWED_HOSTNAMES` read, the `TURNSTILE_ALLOW_LOCALHOST` dev
  switch, the malformed-token / empty-allowlist fail-closed guards, and the
  `AbortSignal.timeout` bound.

  (Deno edge functions can't execute under Vitest, so these stay source-string
  assertions — the established pattern for this file.)

## Acceptance criteria

- [x] Widget renders with the real site key and action `travel-trails-form`.
- [x] `verifyTurnstile` rejects unless `success` **and** `action` **and**
      `hostname` all pass, plus a well-formed token and a configured allowlist.
- [x] `verifyTurnstile` stays fail-closed when either secret is unset.
- [x] `npm run typecheck`, `npm test` pass.
- [ ] `TURNSTILE_SECRET_KEY` and `TURNSTILE_ALLOWED_HOSTNAMES` set on Supabase;
      one real end-to-end submission verified and a token replay rejected
      (launch task).
