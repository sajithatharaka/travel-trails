-- ============================================================
-- Travel Trails — remove the SAMPLE rows added by sample-data.sql
-- ============================================================
-- Deletes exactly the fixed-UUID / tagged rows from that script and nothing
-- else. Safe to run against any environment; a no-op if the sample data was
-- never loaded.
--
--   psql "$DATABASE_URL" -f supabase/seeds/sample-data-teardown.sql
-- ============================================================

begin;

-- Children / leaf tables first.
delete from public.notification_dispatch_logs
  where id in (
    '5eed0000-0000-4000-a000-000000000901',
    '5eed0000-0000-4000-a000-000000000902'
  );

delete from public.notification_recipients
  where email in ('ops.sample@example.test', 'inactive.sample@example.test');

delete from public.contact_submissions
  where id in (
    '5eed0000-0000-4000-a000-000000000701',
    '5eed0000-0000-4000-a000-000000000702'
  );

delete from public.booking_requests
  where id in (
    '5eed0000-0000-4000-a000-000000000601',
    '5eed0000-0000-4000-a000-000000000602'
  );

delete from public.faqs
  where id in (
    '5eed0000-0000-4000-a000-000000000201',
    '5eed0000-0000-4000-a000-000000000202',
    '5eed0000-0000-4000-a000-000000000203'
  );

delete from public.gallery
  where id in (
    '5eed0000-0000-4000-a000-000000000301',
    '5eed0000-0000-4000-a000-000000000302'
  );

delete from public.tour_route_stops
  where id in (
    '5eed0000-0000-4000-a000-000000000021',
    '5eed0000-0000-4000-a000-000000000022',
    '5eed0000-0000-4000-a000-000000000023'
  );

delete from public.tour_days
  where id in (
    '5eed0000-0000-4000-a000-000000000011',
    '5eed0000-0000-4000-a000-000000000012',
    '5eed0000-0000-4000-a000-000000000013'
  );

delete from public.tours
  where id in (
    '5eed0000-0000-4000-a000-000000000001',
    '5eed0000-0000-4000-a000-000000000002'
  );

delete from public.reviews
  where id in (
    '5eed0000-0000-4000-a000-000000000401',
    '5eed0000-0000-4000-a000-000000000402'
  );

delete from public.welcome_sections
  where id = '5eed0000-0000-4000-a000-000000000501';

delete from public.blogs
  where id in (
    '5eed0000-0000-4000-a000-000000000101',
    '5eed0000-0000-4000-a000-000000000102'
  );

delete from public.site_settings
  where key = 'sample_announcement';

-- Team member: profile → identity → auth user.
delete from public.profiles
  where user_id = '5eed0000-0000-4000-a000-000000000a01';

delete from auth.identities
  where user_id = '5eed0000-0000-4000-a000-000000000a01';

delete from auth.users
  where id = '5eed0000-0000-4000-a000-000000000a01';

commit;
