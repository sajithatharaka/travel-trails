# Supabase Deploy Script — `scripts/deploy-supabase.sh`

Created: 2026-09-10

## Purpose

`scripts/deploy-supabase.sh` pushes SQL migrations and deploys edge
functions to the linked Supabase project using the Supabase CLI via `npx`.
It reads `SUPABASE_ACCESS_TOKEN` and the project ref (from
`SUPABASE_PROJECT_REF`, or derived from `NEXT_PUBLIC_SUPABASE_URL`) out of
`.env`.

## Problem

Running the script failed at its first step with:

```
Authorization failed for the access token and project ref pair:
{"message":"Your account does not have the necessary privileges to access
this endpoint. ..."}
```

Root cause: the error comes from **`supabase link`**, not from the deploy
itself. `supabase link` calls a Management API endpoint that reads the
project's API keys (anon / service_role), which requires an
**Owner/Administrator** organization role. The access token in use belongs
to an account with a lower role, so `link` returns HTTP 403
(`LegacyLinkAuthTokenError`).

Because the script runs under `set -euo pipefail` with `supabase link` as
the first real step, that 403 aborted the whole run — even though the
operations the script actually needs (`supabase db push`,
`supabase functions deploy`) work with just `SUPABASE_ACCESS_TOKEN` and an
explicit `--project-ref`, and do not require a successful link when
`supabase/.temp/` already holds the linked-project config.

A personal access token has no permission settings of its own; it always
acts as the account that created it, with that account's organization
role. "Granting the token full access" is not a possible action.

## Fix

In `scripts/deploy-supabase.sh`:

- `supabase link` is wrapped in `if ! …; then` — a link failure prints a
  `WARN` to stderr and the script continues instead of aborting. `link` is
  still attempted because it bootstraps `supabase/.temp/` on a fresh
  checkout (the directory is gitignored).
- `supabase db push` is invoked with `--project-ref "$SUPABASE_PROJECT_REF"`.
- `supabase functions deploy` is invoked with
  `--project-ref "$SUPABASE_PROJECT_REF"`.
- The header comment documents the role requirement: `db push` /
  `functions deploy` work for a Developer role; `link` needs
  Owner/Administrator.

## `.env` handling — no env var is deployed to Supabase

The script must not push values from `.env` into the Supabase project. It
does not run `supabase secrets set`, and the CLI's `link` / `db push` /
`functions deploy` do not upload environment variables as Edge Function
secrets.

The `.env` loader reads **only an allowlist** of keys used to target and
authenticate the CLI — `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`,
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_DB_PASSWORD` — with a value already
present in the environment taking precedence. The previous blanket
`export "$key=$value"` over every line is removed, so secrets that live in
`.env` (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, service-role keys, …) are
never even loaded into the process environment. Edge Function secrets are
set out of band with `supabase secrets set` / the dashboard.

## Root-cause remediation (outside this script)

To make `supabase link` succeed (needed on fresh clones / CI where
`supabase/.temp/` does not exist), an organization Owner must raise the
token account's role to **Owner** or **Administrator** on the organization
that owns the project, then a new access token is generated from that
account. This is tracked separately from the script hardening above.

## Verification

- `bash -n scripts/deploy-supabase.sh` — syntax OK.
- `tests/unit/deploy-supabase-script.test.ts` asserts the script contract:
  `link` is non-fatal, `db push` / `functions deploy` pass `--project-ref`,
  the `.env` loader is allowlist-only (no blanket export), and the script
  never runs `supabase secrets set`.
- Manual: with a Developer-role token,
  `./scripts/deploy-supabase.sh --functions-only notify-admin-events`
  prints the link `WARN` and then deploys the function successfully.
- 2026-09-10 manual deploy: `notify-admin-events`, `submit-booking`, and
  `submit-contact` deployed to project `ahpjdbbgfzivdjrfogpg` with the
  current token (function deploy path confirmed unaffected by the `link`
  privilege gap).

## Change history

- 2026-09-10 — Initial fix: made `supabase link` non-fatal and added
  explicit `--project-ref` to `db push` and `functions deploy` so a
  Developer-role access token can complete a deploy. Documented the
  Owner/Administrator requirement for `link`.
- 2026-09-10 — Replaced the blanket `.env` export with an allowlist
  (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`,
  `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_DB_PASSWORD`) so no other `.env`
  value enters the environment or reaches Supabase.
