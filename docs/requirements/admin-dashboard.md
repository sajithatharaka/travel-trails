# Admin Dashboard — overview cards

**Created:** 2026-09-06

## Change history

| Date | Change |
|---|---|
| 2026-09-06 | Wired the Gallery / Published Posts / Reviews cards to live DB counts (were hardcoded "Phase 3" placeholders); every card now links to its admin section. |

## Overview

`src/app/admin/(dashboard)/page.tsx` is a Server Component that renders a grid
of six overview cards. Each card shows a primary count, an optional secondary
"hint" line, an icon, and links to the matching `/admin` section.

## Card data

All counts run in parallel via `Promise.all`, each wrapped in `safeCount()`
(head + `count: "exact"` query; returns `null` on error so the card shows `—`).

| Card | Value | Hint | Link |
|---|---|---|---|
| Tours | `tours` rows | `<n> published` (`is_published = true`) | `/admin/tours` |
| Pending Bookings | `booking_requests` where `status = 'pending'` | `<n> total` | `/admin/bookings` |
| Contact Messages | `contact_submissions` rows | — | `/admin/contacts` |
| Gallery Photos | `gallery` rows | `<n> visible` (`is_visible = true`) | `/admin/gallery` |
| Published Posts | `blogs` where `is_published = true` | `<n> total` | `/admin/blog` |
| Reviews | `reviews` rows | `<n> visible` (`is_visible = true`) | `/admin/reviews` |

RLS: the admin session is an authenticated team member, so the "Team manage"
policies on each table allow the full (unfiltered) counts.

## Tests

`tests/app/admin-dashboard-cards.test.ts` — source guard: no `Phase 3` /
`href: "#"` placeholders remain, and each card queries the expected table
(with the `is_visible` / `is_published` filter where applicable) and links to
its section.
