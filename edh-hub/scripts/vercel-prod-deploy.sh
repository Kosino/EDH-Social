#!/usr/bin/env bash
# Deploy edh-hub to the existing Vercel project (Git-linked "EDH Social").
# Requires a real account token — NOT anonymous vcn_ tokens.
#
# Cursor: add Runtime Secret VERCEL_TOKEN (and optional VERCEL_ORG_ID /
# VERCEL_PROJECT_ID), then start a NEW agent before running this.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "Missing VERCEL_TOKEN. Create one at https://vercel.com/account/tokens" >&2
  exit 1
fi

if [[ "${VERCEL_TOKEN}" == vcn_* ]]; then
  echo "VERCEL_TOKEN looks like an anonymous claim token (vcn_). Use an account token." >&2
  exit 1
fi

echo "== whoami =="
npx --yes vercel@latest whoami --token "$VERCEL_TOKEN"

if [[ ! -f .vercel/project.json ]]; then
  echo "== link (non-interactive if ORG/PROJECT ids set) =="
  if [[ -n "${VERCEL_ORG_ID:-}" && -n "${VERCEL_PROJECT_ID:-}" ]]; then
    mkdir -p .vercel
    printf '{"orgId":"%s","projectId":"%s"}\n' "$VERCEL_ORG_ID" "$VERCEL_PROJECT_ID" > .vercel/project.json
  else
    npx --yes vercel@latest link --yes --token "$VERCEL_TOKEN"
  fi
fi

# Pull env from Vercel project when present; otherwise push local public env.
if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

echo "== production deploy =="
npx --yes vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN" \
  ${NEXT_PUBLIC_SUPABASE_URL:+--env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"} \
  ${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:+--env NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"} \
  ${NEXT_PUBLIC_SUPABASE_URL:+--build-env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"} \
  ${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:+--build-env NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"}
