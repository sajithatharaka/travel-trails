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

## Delivery status

Phases 0–4 implemented on branch `feat/webapp-phase-0-1`. Remaining: SEO polish
pass, broader test coverage, and launch (DNS, Supabase secrets, first content
entry). The public site renders with `src/config.ts` fallbacks until the
Supabase migrations are pushed.
