# Testing

**Created:** 2026-09-06

## Stack

| Layer | Tool | Location |
|---|---|---|
| Unit + integration + component | Vitest 3 (jsdom) + React Testing Library | `tests/**/*.test.{ts,tsx}` |
| End-to-end | Playwright (Chromium) | `tests/e2e/*.spec.ts` |

Scripts: `npm test` (`vitest run`), `npm run test:watch`, `npm run test:e2e`,
`npm run typecheck` (`tsc --noEmit` for the app **and** `-p tsconfig.test.json`
for the test tree).

## Config

- `vitest.config.mts` — `@vitejs/plugin-react`, explicit `@ → src` alias,
  jsdom, `tests/setup.ts`; excludes `tests/e2e`.
- `tests/setup.ts` — `@testing-library/jest-dom`, auto-cleanup, and module
  stubs so server-flavoured code imports under jsdom: `server-only` → `{}`,
  `next/cache` (`unstable_cache` passthrough, `revalidate*` no-ops),
  `next/navigation` (router / params / pathname / searchParams). Also polyfills
  `matchMedia`, `ResizeObserver`, `scrollIntoView`, pointer-capture for Radix.
- `tsconfig.test.json` — extends the base, adds vitest / jest-dom / node types,
  includes `tests/**` + `supabase/functions/_shared/pure.ts`.
- `playwright.config.ts` — `webServer` runs a production build (`next start` on
  port 3117; `build && start` on CI) so it never collides with a `next dev`
  lockfile. `baseURL` set; `reuseExistingServer` locally.

## Coverage (all green)

**Unit** — `slug` (slugify), `format` (`formatPriceFrom`, `mergeSettings`),
`getInitials`, `notify-guard` (`shouldNotifyStatusChange`), `edge-pure`
(`isUuid`, `dedupeKeyFor` confirm≠cancel, `subjectFor`, `normalizeEmail`,
`EMAIL_RE`); `structuredData` (every JSON-LD builder — `@type`/`@context`,
`absoluteUrl`, `sameAs` only when configured, breadcrumb positions, `ItemList`
lengths, FAQ mapping, tour `offers`/`itinerary` omission, blog `wordCount` +
`dateModified` fallback). See [seo-structured-data.md](./seo-structured-data.md).

**Integration** — `content-readers` (`lib/content` mapping / filtering /
graceful fallback against a mocked supabase builder); `edge-functions` (source
assertions: Turnstile-before-insert ordering, service-role writes, `invokeNotify`
wiring, `verify_jwt` flags in `config.toml`, dedupe + active-recipient filter,
RLS lockdown has no public insert, `manage-users` admin-gating, and
`verifyTurnstile`'s `success`/`action`/`hostname`-allowlist + malformed-token +
`TURNSTILE_ALLOW_LOCALHOST` + `siteverify`-timeout guards);
`sample-seed` (source assertions on `supabase/seeds/sample-data.sql` — every
table from the migrations is seeded, every insert is idempotent, teardown
mirrors it, only tagged `5eed…` / `@example.test` rows are touched). See
[sample-seed-data.md](./sample-seed-data.md).

**Component** — `EnquiryForm` + `ContactForm` (submit payload → correct edge
function; function-level and transport errors surface), `FaqAccordion`
(open / switch / collapse), `AdminFaqs` (list ordered, hidden badge, create via
dialog asserts the `insert` payload).

**App (source assertions)** — `home-hero`, `home-section-order`,
`technical-notes-host`; `structured-data` (every public route + `LegalLayout`
renders `<JsonLd>` from the seo builders, no page hand-rolls the `ld+json` script);
`llms-txt` (`/llms.txt` route handler → `text/plain`, cache header, tour/blog/
policy links with absolute URLs, empty-state fallback).

**E2E** — `public.spec.ts` (homepage hero + enquiry form, nav → Tours/Blog,
contact form present, `robots.txt` + `sitemap.xml`, `/llms.txt` plain text,
every public route embeds a valid `application/ld+json` graph); `admin.spec.ts`
(`/admin` → login redirect, deep-link `next` param, invalid-credentials error).

## Git hooks

- **`.husky/pre-commit`** runs `npm test` (`vitest run`) before every commit;
  a failing suite aborts the commit. Playwright e2e is **not** run here (kept
  fast — it needs a production build).
- Managed by **husky 9** (`devDependencies`), wired through the `prepare` script
  (`husky`) so `.husky/_` is installed on `npm install`. `git config
  core.hooksPath` is set to `.husky/_` by husky.
- Bypass only in a genuine emergency with `git commit --no-verify`; fix the
  suite instead.

## Conventions

- All form inputs carry a unique `data-testid` for UI automation.
- Deno edge functions can't run under Vitest — pure helpers live in
  `supabase/functions/_shared/pure.ts` and are unit-tested; the rest is covered
  by source-assertion integration tests (mirrors the Tree Trails repo).
- Async Server Components are covered by Playwright, not Vitest.
