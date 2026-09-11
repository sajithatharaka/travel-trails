# Travel Trails — Requirements Index

The static Travel Trails marketing site is being rebuilt as a Next.js 16 +
Supabase web app, porting the Tree Trails Sigiriya admin CMS and shaping it
around bookable tour packages. Roles: **admin** and **tour_designer**
(everything except user management, notification recipients and technical notes).

| Doc | Scope |
|---|---|
| [phase-0-1-foundation-and-tours.md](./requirements/phase-0-1-foundation-and-tours.md) | TypeScript + App Router + Supabase auth shell; tour packages CMS + public tour pages |
| [phase-2-bookings-contacts.md](./requirements/phase-2-bookings-contacts.md) | Booking-request & contact forms, Turnstile, edge functions, Resend notifications, admin queues |
| [turnstile-existing-widget-integration.md](./requirements/turnstile-existing-widget-integration.md) | Wiring the pre-created Turnstile widget + server-side `success`/`action`/`hostname` enforcement (Cloudflare existing-widget flow) |
| [booking-travel-date-future.md](./requirements/booking-travel-date-future.md) | Enquiry form + `submit-booking` reject any `travel_date` that is not strictly after today |
| [phase-3-content-cms.md](./requirements/phase-3-content-cms.md) | Blog, FAQ, gallery, reviews, welcome-section CMS + public wiring |
| [phase-4-settings.md](./requirements/phase-4-settings.md) | Editable site settings, notification recipients, user management, technical notes, user guide |
| [admin-dashboard.md](./requirements/admin-dashboard.md) | Admin dashboard overview cards, each backed by a live DB count and linked to its section |
| [homepage-hero.md](./requirements/homepage-hero.md) | Full-bleed homepage hero: content sources, single background image, CTAs |
| [homepage-welcome-section.md](./requirements/homepage-welcome-section.md) | Homepage "About" block: content source, single image, inline (non-popup) admin editor at `/admin/welcome-section` |
| [home-route-map.md](./requirements/home-route-map.md) | Homepage Route section: uncropped island diagram (`fit="contain"`, artwork aspect ratio) + stop list |
| [home-featured-trails.md](./requirements/home-featured-trails.md) | Homepage 4-tile featured-trails grid + "View all tours" link; shared `TourCard`; replaces the day-by-day itinerary + stats bar |
| [home-testimonials-marquee.md](./requirements/home-testimonials-marquee.md) | Homepage "What Our Guests Say": paused-on-hover marquee of all testimonials, fixed-size cards with clipped quote + "See more" dialog |
| [home-gallery-lightbox.md](./requirements/home-gallery-lightbox.md) | Homepage gallery ticker: click a tile to open the full image in a lightbox dialog |
| [testing.md](./requirements/testing.md) | Vitest (unit / integration / component) + Playwright (e2e) setup and coverage |
| [sample-seed-data.md](./requirements/sample-seed-data.md) | Idempotent sample rows for every table, for testing against a live database |
| [seo-structured-data.md](./requirements/seo-structured-data.md) | JSON-LD entity graph on every public page + `/llms.txt` for SEO / AEO / GEO |
| [seo-metadata-og-images.md](./requirements/seo-metadata-og-images.md) | Generated OG/Twitter image, meta-description fallbacks, per-page social context, sitemap freshness, single-source NAP, structured-data correctness, 404 + manifest |
| [deployment-netlify-nextjs-runtime.md](./requirements/deployment-netlify-nextjs-runtime.md) | `netlify.toml` + `@netlify/plugin-nextjs` to enable the Next.js Runtime and stop site-wide 404s |
| [supabase-deploy-script.md](./requirements/supabase-deploy-script.md) | `scripts/deploy-supabase.sh`: `supabase link` made non-fatal + explicit `--project-ref` so a Developer-role access token can deploy; allowlist-only `.env` read (no env var is pushed to Supabase); `link` needs Owner/Admin |

## Delivery status

Phases 0–4 implemented on branch `feat/webapp-phase-0-1`, plus the SEO
structured-data pass ([seo-structured-data.md](./requirements/seo-structured-data.md)).
Remaining: broader test coverage and launch (DNS, Supabase secrets, first
content entry). The public site renders with `src/config.ts` fallbacks until the
Supabase migrations are pushed.
