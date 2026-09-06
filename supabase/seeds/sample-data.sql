-- ============================================================
-- Travel Trails — SAMPLE data for testing against a live database
-- ============================================================
-- Purpose: give every application table at least two representative rows so a
-- real (local or remote) Supabase database can be exercised end-to-end from the
-- public site and the /admin CMS without hand-entering content.
--
-- This is NOT a migration. It is never pushed by scripts/deploy-supabase.sh
-- (that only ships supabase/migrations + functions). Apply it explicitly:
--
--   Local:   supabase db reset            # if you symlink this to supabase/seed.sql
--            psql "$(supabase status -o env | grep DB_URL | cut -d= -f2)" -f supabase/seeds/sample-data.sql
--   Remote:  psql "$DATABASE_URL" -f supabase/seeds/sample-data.sql
--            (or paste into the Supabase SQL editor)
--
-- Conventions that keep it safe and reversible:
--   * Every row uses a fixed UUID in the 5eed0000-0000-4000-a000-* range, so
--     re-running is a no-op (on conflict do nothing) and teardown is exact.
--   * Every email is @example.test; every slug is prefixed `sample-`.
--   * supabase/seeds/sample-data-teardown.sql removes exactly these rows.
-- ============================================================

begin;

-- ── auth user + profile (team member) ───────────────────────────────────────
-- profiles.user_id is FK → auth.users. Inserting the auth user fires
-- public.handle_new_user(), which creates the profile and mirrors the role into
-- the JWT claim. The explicit upsert below is a harmless backstop.
-- Needs pgcrypto (crypt/gen_salt) — present in Supabase's `extensions` schema.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '5eed0000-0000-4000-a000-000000000a01',
  'authenticated', 'authenticated',
  'sample.designer@example.test',
  crypt('sample-password-123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Sample Tour Designer"}'::jsonb,
  now(), now(),
  '', '', '', ''
) on conflict (id) do nothing;

insert into auth.identities (
  provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  '5eed0000-0000-4000-a000-000000000a01',
  '5eed0000-0000-4000-a000-000000000a01',
  '{"sub":"5eed0000-0000-4000-a000-000000000a01","email":"sample.designer@example.test"}'::jsonb,
  'email', now(), now(), now()
) on conflict (provider_id, provider) do nothing;

insert into public.profiles (id, user_id, email, full_name, role)
values (
  '5eed0000-0000-4000-a000-000000000a02',
  '5eed0000-0000-4000-a000-000000000a01',
  'sample.designer@example.test',
  'Sample Tour Designer',
  'tour_designer'
) on conflict (user_id) do nothing;

-- ── tours ──────────────────────────────────────────────────────────────────
insert into public.tours (
  id, slug, title, summary,
  hero_eyebrow, hero_headline, hero_subheadline,
  duration_days, destination_count, price_from_usd,
  cover_image_url, route_map_image_url,
  is_published, is_featured, display_order,
  meta_title, meta_description
) values (
  '5eed0000-0000-4000-a000-000000000001',
  'sample-hill-country-3-day',
  'Sample · 3-Day Hill Country Trail',
  'A short sample itinerary used for testing the tour CMS and public tour page.',
  'Sample data · not a real tour',
  'Three days through Sri Lanka''s tea country',
  'Kandy, Nuwara Eliya and Ella at an easy pace.',
  3, 3, 540.00,
  '/images/day-nuwaraeliya.jpg', '/images/route-map.png',
  true, false, 10,
  'Sample · 3-Day Hill Country Trail',
  'Sample tour used for QA of the Travel Trails web app.'
), (
  '5eed0000-0000-4000-a000-000000000002',
  'sample-draft-coast-tour',
  'Sample · Draft Coast Tour',
  'An unpublished sample row for testing that drafts stay hidden from the public site.',
  null,
  'Draft coast tour',
  null,
  5, 4, null,
  null, null,
  false, false, 11,
  null, null
) on conflict (id) do nothing;

-- ── tour_days ──────────────────────────────────────────────────────────────
insert into public.tour_days (
  id, tour_id, day_label, title, description,
  experiences_label, experiences, note, image_url, anchor, display_order
) values (
  '5eed0000-0000-4000-a000-000000000011',
  '5eed0000-0000-4000-a000-000000000001',
  'Day 1', 'Arrive in Kandy',
  'Transfer from the airport, an evening walk around the lake and the Temple of the Tooth.',
  'Experiences', array['Temple of the Tooth', 'Kandy Lake walk'],
  'Optional cultural dance show in the evening.', null, 'day-kandy', 0
), (
  '5eed0000-0000-4000-a000-000000000012',
  '5eed0000-0000-4000-a000-000000000001',
  'Day 2', 'Kandy to Nuwara Eliya',
  'Scenic drive past tea estates with a factory visit and a stop at Ramboda Falls.',
  'Experiences', array['Tea factory tour', 'Gregory Lake', 'Ramboda Falls'],
  null, null, 'day-nuwaraeliya', 1
), (
  '5eed0000-0000-4000-a000-000000000013',
  '5eed0000-0000-4000-a000-000000000001',
  'Day 3', 'Ella and departure',
  'Nine Arch Bridge at sunrise, Little Adam''s Peak, then the transfer for departure.',
  'Experiences', array['Nine Arch Bridge', 'Little Adam''s Peak'],
  null, null, 'day-ella', 2
) on conflict (id) do nothing;

-- ── tour_route_stops ───────────────────────────────────────────────────────
insert into public.tour_route_stops (
  id, tour_id, num, name, description, anchor, display_order
) values (
  '5eed0000-0000-4000-a000-000000000021',
  '5eed0000-0000-4000-a000-000000000001', 1, 'Kandy', 'Temple of the Tooth', 'day-kandy', 0
), (
  '5eed0000-0000-4000-a000-000000000022',
  '5eed0000-0000-4000-a000-000000000001', 2, 'Nuwara Eliya', 'Tea country', 'day-nuwaraeliya', 1
), (
  '5eed0000-0000-4000-a000-000000000023',
  '5eed0000-0000-4000-a000-000000000001', 3, 'Ella', 'Bridges & views', 'day-ella', 2
) on conflict (id) do nothing;

-- ── booking_requests ───────────────────────────────────────────────────────
insert into public.booking_requests (
  id, tour_id, tour_slug, tour_title,
  first_name, last_name, email, phone,
  travel_date, travellers, adults, children, message, status
) values (
  '5eed0000-0000-4000-a000-000000000601',
  '5eed0000-0000-4000-a000-000000000001', 'sample-hill-country-3-day', 'Sample · 3-Day Hill Country Trail',
  'Ada', 'Sample', 'ada.sample@example.test', '+94 70 000 0001',
  current_date + 30, 2, 2, 0, 'Sample pending booking for QA.', 'pending'
), (
  '5eed0000-0000-4000-a000-000000000602',
  '5eed0000-0000-4000-a000-000000000001', 'sample-hill-country-3-day', 'Sample · 3-Day Hill Country Trail',
  'Grace', 'Sample', 'grace.sample@example.test', null,
  current_date + 60, 4, 2, 2, 'Sample confirmed booking for QA.', 'confirmed'
) on conflict (id) do nothing;

-- ── contact_submissions ────────────────────────────────────────────────────
insert into public.contact_submissions (
  id, name, email, phone, subject, message
) values (
  '5eed0000-0000-4000-a000-000000000701',
  'Alan Sample', 'alan.sample@example.test', '+94 70 000 0002',
  'General Enquiry', 'Sample contact submission used to test the admin contacts queue.'
), (
  '5eed0000-0000-4000-a000-000000000702',
  'Edith Sample', 'edith.sample@example.test', null,
  'Custom itinerary', 'Second sample contact submission with a different subject.'
) on conflict (id) do nothing;

-- ── notification_recipients ────────────────────────────────────────────────
insert into public.notification_recipients (id, email, is_active)
select v.id, v.email, v.is_active
from (values
  ('5eed0000-0000-4000-a000-000000000801'::uuid, 'ops.sample@example.test', true),
  ('5eed0000-0000-4000-a000-000000000802'::uuid, 'inactive.sample@example.test', false)
) as v(id, email, is_active)
where not exists (
  select 1 from public.notification_recipients r
  where lower(trim(r.email)) = lower(trim(v.email))
);

-- ── notification_dispatch_logs ─────────────────────────────────────────────
insert into public.notification_dispatch_logs (
  id, dedupe_key, event_type, status, details
) values (
  '5eed0000-0000-4000-a000-000000000901',
  'sample-new_booking-5eed0000-0000-4000-a000-000000000601',
  'new_booking', 'sent', '{"sample": true, "to": 1}'::jsonb
), (
  '5eed0000-0000-4000-a000-000000000902',
  'sample-booking_status_changed-5eed0000-0000-4000-a000-000000000602',
  'booking_status_changed', 'skipped', '{"sample": true, "reason": "no active recipients"}'::jsonb
) on conflict (dedupe_key) do nothing;

-- ── blogs ──────────────────────────────────────────────────────────────────
insert into public.blogs (
  id, slug, title, excerpt, content, category, published_date, image_url,
  is_published, meta_title, meta_description
) values (
  '5eed0000-0000-4000-a000-000000000101',
  'sample-first-post',
  'Sample · Planning your first trip to Sri Lanka',
  'A published sample blog post for testing the blog list and detail pages.',
  E'## Sample content\n\nThis is **sample** markdown body copy used only for QA.\n\n- point one\n- point two\n',
  'Sri Lanka', current_date - 7, '/images/day-sigiriya.jpg',
  true,
  'Sample · Planning your first trip to Sri Lanka',
  'Sample blog post used for QA of the Travel Trails web app.'
), (
  '5eed0000-0000-4000-a000-000000000102',
  'sample-draft-post',
  'Sample · Draft post',
  'An unpublished sample post for testing that drafts do not appear publicly.',
  E'Draft body copy.\n',
  'Travel tips', current_date, null,
  false, null, null
) on conflict (id) do nothing;

-- ── faqs ───────────────────────────────────────────────────────────────────
insert into public.faqs (id, question, answer, category, tour_id, display_order, is_visible)
values (
  '5eed0000-0000-4000-a000-000000000201',
  'Sample · Is this real content?',
  'No — this FAQ row is sample data for testing the FAQ accordion and admin list.',
  'General', null, 10, true
), (
  '5eed0000-0000-4000-a000-000000000202',
  'Sample · Hidden question',
  'This FAQ is not visible and should be filtered out of public reads.',
  'General', null, 11, false
), (
  '5eed0000-0000-4000-a000-000000000203',
  'Sample · Tour-scoped question',
  'This FAQ is linked to the sample tour to test per-tour FAQ filtering.',
  'Tour', '5eed0000-0000-4000-a000-000000000001', 12, true
) on conflict (id) do nothing;

-- ── gallery ────────────────────────────────────────────────────────────────
insert into public.gallery (id, alt_text, category, image_url, tour_id, display_order, is_visible)
values (
  '5eed0000-0000-4000-a000-000000000301',
  'Sample gallery image — tea plantation', 'Hill Country',
  '/images/day-nuwaraeliya.jpg', null, 10, true
), (
  '5eed0000-0000-4000-a000-000000000302',
  'Sample gallery image — hidden', 'General',
  '/images/day-ella.jpg', '5eed0000-0000-4000-a000-000000000001', 11, false
) on conflict (id) do nothing;

-- ── reviews ────────────────────────────────────────────────────────────────
insert into public.reviews (
  id, reviewer_name, rating, review_text, source, location, is_visible, display_order
) values (
  '5eed0000-0000-4000-a000-000000000401',
  'Sample Reviewer', 5,
  'Sample five-star review used to test the reviews carousel and admin list.',
  'Google', 'Australia', true, 10
), (
  '5eed0000-0000-4000-a000-000000000402',
  'Sample Reviewer Two', 4,
  'Sample four-star review that is hidden and should not render publicly.',
  'TripAdvisor', 'Germany', false, 11
) on conflict (id) do nothing;

-- ── welcome_sections ───────────────────────────────────────────────────────
insert into public.welcome_sections (
  id, badge_text, heading, paragraph_1, paragraph_2,
  image_1_url, image_1_alt, image_2_url, image_2_alt,
  display_order, is_active
) values (
  '5eed0000-0000-4000-a000-000000000501',
  'Sample badge',
  'Sample · Welcome section heading',
  'First sample paragraph for testing the homepage welcome block.',
  'Second sample paragraph.',
  '/images/day-sigiriya.jpg', 'Sample welcome image 1',
  '/images/day-kandy.jpg', 'Sample welcome image 2',
  10, false
) on conflict (id) do nothing;

-- ── site_settings ──────────────────────────────────────────────────────────
-- The real keys are seeded by migration 20260904000000. Add one clearly-sample
-- key so this table is represented and covered by teardown.
insert into public.site_settings (key, value) values
  ('sample_announcement', '"Sample seed data is loaded in this database."'::jsonb)
on conflict (key) do nothing;

commit;
