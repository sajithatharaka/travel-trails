# Deployment — Netlify Next.js Runtime

Created: 2026-09-06

## Problem

The production Netlify site returned **"Page not found"** for every route,
including `/`.

Root cause: the site is a Next.js 16 App Router app with SSR (server
components, Supabase SSR, Resend email, dynamic route segments). There is
no `output: "export"` in `next.config.ts`, so the build produces a server
app, not a static site.

Netlify was configured with:

| Setting            | Value              |
| ------------------ | ------------------ |
| Runtime            | **Not set**        |
| Build command      | `npm run build`    |
| Publish directory  | `.next`            |
| Base directory     | `/`                |

With the Next.js Runtime disabled ("Runtime: Not set"), Netlify published
the `.next` directory as plain static files. `.next` has no `index.html`,
so all paths 404.

The repository had no `netlify.toml` and `@netlify/plugin-nextjs` was not
in `package.json`, so Netlify's framework auto-detection never enabled the
runtime.

## Fix

Added `netlify.toml` at the repo root:

- `[build] command = "npm run build"`
- `[build.environment] NODE_VERSION = "22"` (Next 16 needs a modern Node)
- `[[plugins]] package = "@netlify/plugin-nextjs"` — forces Netlify to
  install and run the Next.js Runtime on every build, independent of
  dashboard auto-detection.

Publish directory stays `.next` (Netlify Next.js Runtime v5 expects that).

## Required Netlify dashboard configuration

The runtime fixes serving, but the app still needs its environment
variables set under **Site settings → Environment variables** (values are
not in the repo):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `SUPABASE_ACCESS_TOKEN` (only if Supabase deploy runs from Netlify)
- `RESEND_API_KEY`

## Verification

1. Trigger a deploy (push to the connected branch or "Clear cache and
   deploy site").
2. Deploy log should show `@netlify/plugin-nextjs` running and the site
   Runtime showing as **Next.js**.
3. `/`, `/tours`, `/blog`, `/contact`, and `/admin/login` all render
   instead of 404.

## Tests

No automated test added: this is Netlify build/hosting configuration and
is only exercisable against Netlify's build pipeline, which is outside the
Vitest/Playwright harness. Verification is the manual deploy checklist
above.

## Change history

- 2026-09-06 — Initial fix: added `netlify.toml` with the Next.js Runtime
  plugin to resolve site-wide "Page not found".
