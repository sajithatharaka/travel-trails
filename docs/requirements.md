# Travel Trails — Requirements Index

The static Travel Trails marketing site is being rebuilt as a Next.js 16 +
Supabase web app, porting the Tree Trails Sigiriya admin CMS and shaping it
around bookable tour packages. Roles: **admin** and **tour_designer**
(everything except user management, notification recipients and technical notes).

| Doc | Scope |
|---|---|
| [phase-0-1-foundation-and-tours.md](./requirements/phase-0-1-foundation-and-tours.md) | TypeScript + App Router + Supabase auth shell; tour packages CMS + public tour pages |
| [phase-2-bookings-contacts.md](./requirements/phase-2-bookings-contacts.md) | Booking-request & contact forms, Turnstile, edge functions, Resend notifications, admin queues |
| [phase-3-content-cms.md](./requirements/phase-3-content-cms.md) | Blog, FAQ, gallery, reviews, welcome-section CMS + public wiring |
| [phase-4-settings.md](./requirements/phase-4-settings.md) | Editable site settings, notification recipients, user management, technical notes, user guide |
| [testing.md](./requirements/testing.md) | Vitest (unit / integration / component) + Playwright (e2e) setup and coverage |
| [sample-seed-data.md](./requirements/sample-seed-data.md) | Idempotent sample rows for every table, for testing against a live database |
| [seo-structured-data.md](./requirements/seo-structured-data.md) | JSON-LD entity graph on every public page + `/llms.txt` for SEO / AEO / GEO |
| [seo-metadata-og-images.md](./requirements/seo-metadata-og-images.md) | Generated OG/Twitter image, meta-description fallbacks, per-page social context, sitemap freshness, single-source NAP, structured-data correctness, 404 + manifest |

## Delivery status

Phases 0–4 implemented on branch `feat/webapp-phase-0-1`, plus the SEO
structured-data pass ([seo-structured-data.md](./requirements/seo-structured-data.md)).
Remaining: broader test coverage and launch (DNS, Supabase secrets, first
content entry). The public site renders with `src/config.ts` fallbacks until the
Supabase migrations are pushed.
