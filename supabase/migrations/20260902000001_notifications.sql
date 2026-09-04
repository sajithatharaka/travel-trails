-- ============================================================
-- Travel Trails — admin notification recipients & dispatch log
-- The submit-* edge functions and the admin (on status change) invoke
-- notify-admin-events, which reads active recipients here and records each
-- send in notification_dispatch_logs (dedupe_key keeps retries idempotent).
-- ============================================================

create table if not exists public.notification_recipients (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email      text not null,
  is_active  boolean not null default true,
  created_by uuid references auth.users(id) on delete set null
);

create unique index if not exists notification_recipients_email_unique_idx
  on public.notification_recipients (lower(trim(email)));

create table if not exists public.notification_dispatch_logs (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dedupe_key text not null unique,
  event_type text not null
             check (event_type in ('new_booking', 'new_inquiry', 'booking_status_changed')),
  status     text not null check (status in ('sent', 'skipped', 'failed')),
  details    jsonb not null default '{}'::jsonb
);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.notification_recipients enable row level security;
alter table public.notification_dispatch_logs enable row level security;

create policy "Team read notification recipients"
  on public.notification_recipients for select to authenticated using (true);

create policy "Admins insert notification recipients"
  on public.notification_recipients for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins update notification recipients"
  on public.notification_recipients for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins delete notification recipients"
  on public.notification_recipients for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Team read notification dispatch logs"
  on public.notification_dispatch_logs for select to authenticated using (true);

grant select, insert, update, delete on public.notification_recipients to authenticated;
grant select on public.notification_dispatch_logs to authenticated;

grant select, insert, update, delete
  on public.notification_recipients, public.notification_dispatch_logs to service_role;
