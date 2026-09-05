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

## Coverage (60 vitest + 7 e2e, all green)

**Unit** — `slug` (slugify), `format` (`formatPriceFrom`, `mergeSettings`),
`getInitials`, `notify-guard` (`shouldNotifyStatusChange`), `edge-pure`
(`isUuid`, `dedupeKeyFor` confirm≠cancel, `subjectFor`, `normalizeEmail`,
`EMAIL_RE`).

**Integration** — `content-readers` (`lib/content` mapping / filtering /
graceful fallback against a mocked supabase builder); `edge-functions` (source
assertions: Turnstile-before-insert ordering, service-role writes, `invokeNotify`
wiring, `verify_jwt` flags in `config.toml`, dedupe + active-recipient filter,
RLS lockdown has no public insert, `manage-users` admin-gating).

**Component** — `EnquiryForm` + `ContactForm` (submit payload → correct edge
function; function-level and transport errors surface), `FaqAccordion`
(open / switch / collapse), `AdminFaqs` (list ordered, hidden badge, create via
dialog asserts the `insert` payload).

**E2E** — `public.spec.ts` (homepage hero + enquiry form, nav → Tours/Blog,
contact form present, `robots.txt` + `sitemap.xml`); `admin.spec.ts`
(`/admin` → login redirect, deep-link `next` param, invalid-credentials error).

## Conventions

- All form inputs carry a unique `data-testid` for UI automation.
- Deno edge functions can't run under Vitest — pure helpers live in
  `supabase/functions/_shared/pure.ts` and are unit-tested; the rest is covered
  by source-assertion integration tests (mirrors the Tree Trails repo).
- Async Server Components are covered by Playwright, not Vitest.
