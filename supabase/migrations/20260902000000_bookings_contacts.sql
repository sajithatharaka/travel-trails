-- ============================================================
-- Travel Trails — booking requests & contact submissions
-- Both are written ONLY by the submit-booking / submit-contact edge functions
-- (service role, after Cloudflare Turnstile verification). No public insert
-- policy exists, so a bot cannot POST rows directly through the REST API.
-- Any signed-in team member (admin or tour_designer) can read and manage them.
-- ============================================================

create table if not exists public.booking_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  tour_id       uuid references public.tours(id) on delete set null,
  tour_slug     text,
  tour_title    text,
  first_name    text not null,
  last_name     text not null default '',
  email         text not null,
  phone         text,
  travel_date   date,
  travellers    int,
  adults        int not null default 1,
  children      int not null default 0,
  message       text,
  status        text not null default 'pending'
                check (status in ('pending', 'confirmed', 'cancelled')),
  handled_by    uuid references auth.users(id) on delete set null,
  handled_at    timestamptz
);

create index if not exists booking_requests_status_idx
  on public.booking_requests (status, created_at desc);

create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text not null default 'General Enquiry',
  message    text not null
);

create index if not exists contact_submissions_created_idx
  on public.contact_submissions (created_at desc);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.booking_requests enable row level security;
alter table public.contact_submissions enable row level security;

-- NOTE: deliberately no "insert" policy for anon/authenticated.

create policy "Team read booking requests"
  on public.booking_requests for select to authenticated using (true);
create policy "Team update booking requests"
  on public.booking_requests for update to authenticated using (true) with check (true);
create policy "Team delete booking requests"
  on public.booking_requests for delete to authenticated using (true);

create policy "Team read contact submissions"
  on public.contact_submissions for select to authenticated using (true);
create policy "Team delete contact submissions"
  on public.contact_submissions for delete to authenticated using (true);

grant select, update, delete on public.booking_requests to authenticated;
grant select, delete on public.contact_submissions to authenticated;

grant select, insert, update, delete
  on public.booking_requests, public.contact_submissions to service_role;
