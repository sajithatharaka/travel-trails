# Sample Seed Data

**Created:** 2026-09-06

Fixtures for exercising a **live** database (local `supabase` stack or a linked
remote project) from the public site and the `/admin` CMS without hand-entering
content. Every application table gets at least two representative rows.

## Files

| File                                      | Purpose                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `supabase/seeds/sample-data.sql`          | Inserts the sample rows. One transaction, fully idempotent.                                                        |
| `supabase/seeds/sample-data-teardown.sql` | Deletes exactly those rows. Safe on any environment; no-op if never loaded.                                        |
| `tests/integration/sample-seed.test.ts`   | Source assertions: every table covered, every insert guarded, teardown mirrors the seed, only tagged rows touched. |

Not migrations — `scripts/deploy-supabase.sh` ships only `supabase/migrations`
and functions, so these never reach production automatically.

## How to apply

```bash
# Local stack
supabase start
psql "$(supabase status -o env | grep '^DB_URL' | cut -d= -f2)" -f supabase/seeds/sample-data.sql

# Remote / linked project
psql "$DATABASE_URL" -f supabase/seeds/sample-data.sql   # or paste into the SQL editor

# Remove again
psql "$DATABASE_URL" -f supabase/seeds/sample-data-teardown.sql
```

To load automatically on every `supabase db reset`, symlink it:
`ln -s seeds/sample-data.sql supabase/seed.sql`.

## Conventions (keep the data safe and reversible)

- **Fixed UUIDs** in the `5eed0000-0000-4000-a000-*` range — re-running is a
  no-op (`on conflict do nothing`) and teardown targets exact ids.
- **Emails** always `@example.test`; **slugs** always prefixed `sample-`;
  human-facing titles start with `Sample ·`.
- Tables without a natural key (`faqs`, `gallery`, `reviews`,
  `welcome_sections`, `tour_days`, `tour_route_stops`) use explicit sample
  UUIDs. `notification_recipients` is guarded by its
  `lower(trim(email))` uniqueness; `site_settings` adds one `sample_announcement`
  key alongside the real seeded keys.

## Coverage per table

| Table                                          | Sample rows                                                                                                                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `profiles` (+ `auth.users`, `auth.identities`) | 1 `tour_designer` — `sample.designer@example.test` / `sample-password-123`. Created via the auth user so `handle_new_user()` runs. |
| `tours`                                        | 1 published (`sample-hill-country-3-day`), 1 draft (`sample-draft-coast-tour`).                                                    |
| `tour_days`                                    | 3 days on the published sample tour.                                                                                               |
| `tour_route_stops`                             | 3 stops on the published sample tour.                                                                                              |
| `booking_requests`                             | 1 `pending`, 1 `confirmed`.                                                                                                        |
| `contact_submissions`                          | 2, different subjects.                                                                                                             |
| `notification_recipients`                      | 1 active, 1 inactive.                                                                                                              |
| `notification_dispatch_logs`                   | 1 `sent` / `new_booking`, 1 `skipped` / `booking_status_changed`.                                                                  |
| `blogs`                                        | 1 published (`sample-first-post`), 1 draft.                                                                                        |
| `faqs`                                         | 1 visible site FAQ, 1 hidden, 1 tour-scoped.                                                                                       |
| `gallery`                                      | 1 visible, 1 hidden (tour-scoped).                                                                                                 |
| `reviews`                                      | 1 visible 5★, 1 hidden 4★.                                                                                                         |
| `welcome_sections`                             | 1 inactive sample section (real one stays active).                                                                                 |
| `site_settings`                                | `sample_announcement` key.                                                                                                         |

## Change history

- **2026-09-06** — created: seed + teardown scripts and the coverage test.
