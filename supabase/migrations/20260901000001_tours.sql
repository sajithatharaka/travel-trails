-- ============================================================
-- Travel Trails — tour packages
-- A tour owns its hero, day-by-day plan and route. Pricing is a single
-- "from" figure (USD). Public reads see published rows only; any signed-in
-- team member (admin or tour_designer) has full CRUD.
-- ============================================================

create table if not exists public.tours (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  slug                 text not null unique,
  title                text not null,
  summary              text not null default '',
  hero_eyebrow         text,
  hero_headline        text not null,
  hero_subheadline     text,
  duration_days        int,
  destination_count    int,
  price_from_usd        numeric(10,2),
  cover_image_url       text,
  route_map_image_url   text,
  is_published          boolean not null default false,
  is_featured           boolean not null default false,
  display_order         int not null default 0,
  meta_title            text,
  meta_description       text
);

create index if not exists tours_published_order_idx
  on public.tours (is_published, display_order);

create table if not exists public.tour_days (
  id                 uuid primary key default gen_random_uuid(),
  tour_id            uuid not null references public.tours(id) on delete cascade,
  created_at         timestamptz not null default now(),
  day_label          text not null,
  title              text not null,
  description        text not null default '',
  experiences_label  text,
  experiences        text[] not null default '{}',
  note               text,
  image_url          text,
  anchor             text,
  display_order      int not null default 0
);

create index if not exists tour_days_tour_idx on public.tour_days (tour_id, display_order);

create table if not exists public.tour_route_stops (
  id            uuid primary key default gen_random_uuid(),
  tour_id       uuid not null references public.tours(id) on delete cascade,
  created_at    timestamptz not null default now(),
  num           int not null,
  name          text not null,
  description   text,
  anchor        text,
  display_order int not null default 0
);

create index if not exists tour_route_stops_tour_idx
  on public.tour_route_stops (tour_id, display_order);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tours_touch_updated_at on public.tours;
create trigger tours_touch_updated_at
  before update on public.tours
  for each row execute function public.touch_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.tours enable row level security;
alter table public.tour_days enable row level security;
alter table public.tour_route_stops enable row level security;

create policy "Public read published tours"
  on public.tours for select to anon, authenticated
  using (is_published = true);

create policy "Team manage tours"
  on public.tours for all to authenticated
  using (true) with check (true);

create policy "Public read days of published tours"
  on public.tour_days for select to anon, authenticated
  using (exists (
    select 1 from public.tours t
    where t.id = tour_days.tour_id and t.is_published = true
  ));

create policy "Team manage tour days"
  on public.tour_days for all to authenticated
  using (true) with check (true);

create policy "Public read stops of published tours"
  on public.tour_route_stops for select to anon, authenticated
  using (exists (
    select 1 from public.tours t
    where t.id = tour_route_stops.tour_id and t.is_published = true
  ));

create policy "Team manage tour route stops"
  on public.tour_route_stops for all to authenticated
  using (true) with check (true);

grant select on public.tours, public.tour_days, public.tour_route_stops to anon;
grant select, insert, update, delete
  on public.tours, public.tour_days, public.tour_route_stops to authenticated;

-- ── Storage: media bucket ────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do nothing;

do $$ begin
  create policy "Public read media"
    on storage.objects for select to anon, authenticated
    using (bucket_id = 'media');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Team upload media"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'media');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Team update media"
    on storage.objects for update to authenticated
    using (bucket_id = 'media');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Team delete media"
    on storage.objects for delete to authenticated
    using (bucket_id = 'media');
exception when duplicate_object then null; end $$;
