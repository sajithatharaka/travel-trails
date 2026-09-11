#!/usr/bin/env bash
# Deploys database migrations and edge functions to the linked Supabase
# project, using the Supabase CLI via `npx` (no local/global install needed).
#
# Usage:
#   ./scripts/deploy-supabase.sh              # push migrations + deploy all functions
#   ./scripts/deploy-supabase.sh --db-only     # push migrations only
#   ./scripts/deploy-supabase.sh --functions-only [name...]  # deploy functions only
#
# Required in .env (or the environment already):
#   SUPABASE_ACCESS_TOKEN   — personal access token (dashboard → account → tokens).
#     The token acts as the account that created it; its power comes from that
#     account's organization role, not from any token setting. `db push` and
#     `functions deploy` work for a Developer role; `supabase link` additionally
#     reads the project API keys and needs Owner/Administrator — a link failure
#     is treated as a warning here, not a fatal error.
#   NEXT_PUBLIC_SUPABASE_URL — used to derive the project ref, unless
#   SUPABASE_PROJECT_REF is set explicitly.
#
# Edge Function SECRETS are NOT read from .env — this script does not set them.
# Set them once per project with `supabase secrets set` (or the dashboard →
# Edge Functions → Secrets), or the functions fail at runtime:
#   RESEND_API_KEY              admin notification email send  (notify-admin-events)
#   NOTIFICATION_FROM_EMAIL     verified Resend sender, e.g. notification@traveltrails.agency
#   TURNSTILE_SECRET_KEY        Turnstile siteverify           (submit-booking / submit-contact)
#   TURNSTILE_ALLOWED_HOSTNAMES comma-separated live hostnames, never localhost
# Missing RESEND_API_KEY / NOTIFICATION_FROM_EMAIL is recorded as a `failed`
# row in notification_dispatch_logs (visible cause for "no email arrived").

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Load ONLY the keys this script needs from .env — never the whole file.
# The Supabase CLI is handed an access token and a project ref; it does not
# upload env vars as Edge Function secrets, and neither must this script.
# Function secrets (RESEND_API_KEY, TURNSTILE_SECRET_KEY, service-role keys,
# …) are set separately with `supabase secrets set` and are deliberately not
# read here, so they cannot leak into the deploy.
if [ -f .env ]; then
  for var in SUPABASE_ACCESS_TOKEN SUPABASE_PROJECT_REF NEXT_PUBLIC_SUPABASE_URL SUPABASE_DB_PASSWORD; do
    [ -n "${!var:-}" ] && continue            # value already in the environment wins
    line=$(grep -E "^[[:space:]]*(export[[:space:]]+)?${var}=" .env | tail -n1) || true
    [ -z "$line" ] && continue
    value=${line#*=}
    value=${value%$'\r'}                       # strip trailing CR from CRLF files
    value=${value#[\"\']}; value=${value%[\"\']} # strip one layer of surrounding quotes
    export "${var}=${value}"
  done
fi

: "${SUPABASE_ACCESS_TOKEN:?Set SUPABASE_ACCESS_TOKEN in .env (dashboard → account → tokens)}"
export SUPABASE_ACCESS_TOKEN

if [ -z "${SUPABASE_PROJECT_REF:-}" ]; then
  SUPABASE_PROJECT_REF=$(printf '%s' "${NEXT_PUBLIC_SUPABASE_URL:-}" | sed -nE 's#^https://([a-z0-9]+)\.supabase\.co/?$#\1#p')
fi
: "${SUPABASE_PROJECT_REF:?Could not derive project ref — set SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL in .env}"

run_db=true
run_functions=true
function_names=()

for arg in "$@"; do
  case "$arg" in
    --db-only) run_functions=false ;;
    --functions-only) run_db=false ;;
    -*) echo "Unknown flag: $arg" >&2; exit 1 ;;
    *) function_names+=("$arg") ;;
  esac
done

echo "==> Linking project ${SUPABASE_PROJECT_REF}"
# `supabase link` reads the project's API keys, which requires an Owner/Admin org
# role. `db push` and `functions deploy` only need SUPABASE_ACCESS_TOKEN plus an
# explicit --project-ref, so a link failure must not abort the deploy. It still
# bootstraps supabase/.temp on a fresh checkout, so we attempt it and warn on
# failure rather than skipping it.
if ! npx --yes supabase link --project-ref "$SUPABASE_PROJECT_REF"; then
  echo "    WARN: 'supabase link' failed (token lacks privilege to read project" >&2
  echo "    API keys, or offline). Continuing — db push / functions deploy below" >&2
  echo "    pass --project-ref explicitly and do not require a successful link." >&2
fi

if [ "$run_db" = true ]; then
  echo "==> Pushing SQL migrations (supabase/migrations)"
  npx --yes supabase db push --project-ref "$SUPABASE_PROJECT_REF"
fi

if [ "$run_functions" = true ]; then
  if [ ${#function_names[@]} -eq 0 ]; then
    while IFS= read -r -d '' dir; do
      function_names+=("$(basename "$dir")")
    done < <(find supabase/functions -mindepth 1 -maxdepth 1 -type d ! -name '_shared' -print0)
  fi

  for fn in "${function_names[@]}"; do
    echo "==> Deploying function: $fn"
    npx --yes supabase functions deploy "$fn" --project-ref "$SUPABASE_PROJECT_REF"
  done

  echo "==> Reminder: Edge Function secrets are set separately and are NOT"
  echo "    deployed by this script. Verify with: npx supabase secrets list"
  echo "    Required: RESEND_API_KEY, NOTIFICATION_FROM_EMAIL,"
  echo "             TURNSTILE_SECRET_KEY, TURNSTILE_ALLOWED_HOSTNAMES"
fi

echo "==> Done."
