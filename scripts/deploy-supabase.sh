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
#   SUPABASE_ACCESS_TOKEN   — personal access token (dashboard → account → tokens)
#   NEXT_PUBLIC_SUPABASE_URL — used to derive the project ref, unless
#   SUPABASE_PROJECT_REF is set explicitly.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ -f .env ]; then
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" == \#* ]] && continue
    export "$key=$value"
  done < <(grep -vE '^[[:space:]]*(#|$)' .env)
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
npx --yes supabase link --project-ref "$SUPABASE_PROJECT_REF"

if [ "$run_db" = true ]; then
  echo "==> Pushing SQL migrations (supabase/migrations)"
  npx --yes supabase db push
fi

if [ "$run_functions" = true ]; then
  if [ ${#function_names[@]} -eq 0 ]; then
    while IFS= read -r -d '' dir; do
      function_names+=("$(basename "$dir")")
    done < <(find supabase/functions -mindepth 1 -maxdepth 1 -type d ! -name '_shared' -print0)
  fi

  for fn in "${function_names[@]}"; do
    echo "==> Deploying function: $fn"
    npx --yes supabase functions deploy "$fn"
  done
fi

echo "==> Done."
