-- ============================================================
-- Travel Trails — content CMS: blog, FAQ, gallery, reviews, welcome section
-- Public reads see visible/published/active rows; any signed-in team member
-- (admin or tour_designer) has full CRUD.
-- ============================================================

-- ── BLOG ─────────────────────────────────────────────────────
create table if not exists public.blogs (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  slug             text not null unique,
  title            text not null,
  excerpt          text not null default '',
  content          text not null default '',
  category         text not null default 'Sri Lanka',
  published_date   date not null default current_date,
  image_url        text,
  is_published     boolean not null default false,
  meta_title       text,
  meta_description  text
);
create index if not exists blogs_published_idx
  on public.blogs (is_published, published_date desc);

drop trigger if exists blogs_touch_updated_at on public.blogs;
create trigger blogs_touch_updated_at
  before update on public.blogs
  for each row execute function public.touch_updated_at();

-- ── FAQ ──────────────────────────────────────────────────────
create table if not exists public.faqs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  question      text not null,
  answer        text not null,
  category      text not null default 'General',
  tour_id       uuid references public.tours(id) on delete cascade,
  display_order int not null default 0,
  is_visible    boolean not null default true
);
create index if not exists faqs_visible_idx on public.faqs (is_visible, display_order);

-- ── GALLERY ──────────────────────────────────────────────────
create table if not exists public.gallery (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  alt_text      text not null default '',
  category      text not null default 'General',
  image_url     text,
  tour_id       uuid references public.tours(id) on delete cascade,
  display_order int not null default 0,
  is_visible    boolean not null default true
);
create index if not exists gallery_visible_idx on public.gallery (is_visible, display_order);

-- ── REVIEWS ──────────────────────────────────────────────────
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  reviewer_name text not null,
  rating        int not null default 5 check (rating between 1 and 5),
  review_text   text not null,
  source        text not null default 'Google',
  location      text,
  is_visible    boolean not null default true,
  display_order int not null default 0
);
create index if not exists reviews_visible_idx on public.reviews (is_visible, display_order);

-- ── WELCOME SECTIONS ─────────────────────────────────────────
create table if not exists public.welcome_sections (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  badge_text    text not null default 'Welcome to Travel Trails',
  heading       text not null,
  paragraph_1   text not null default '',
  paragraph_2   text not null default '',
  image_1_url   text, image_1_alt text not null default '',
  image_2_url   text, image_2_alt text not null default '',
  image_3_url   text, image_3_alt text not null default '',
  image_4_url   text, image_4_alt text not null default '',
  display_order int not null default 0,
  is_active     boolean not null default true
);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.blogs enable row level security;
alter table public.faqs enable row level security;
alter table public.gallery enable row level security;
alter table public.reviews enable row level security;
alter table public.welcome_sections enable row level security;

create policy "Public read published blogs"
  on public.blogs for select to anon, authenticated using (is_published = true);
create policy "Team manage blogs"
  on public.blogs for all to authenticated using (true) with check (true);

create policy "Public read visible faqs"
  on public.faqs for select to anon, authenticated using (is_visible = true);
create policy "Team manage faqs"
  on public.faqs for all to authenticated using (true) with check (true);

create policy "Public read visible gallery"
  on public.gallery for select to anon, authenticated using (is_visible = true);
create policy "Team manage gallery"
  on public.gallery for all to authenticated using (true) with check (true);

create policy "Public read visible reviews"
  on public.reviews for select to anon, authenticated using (is_visible = true);
create policy "Team manage reviews"
  on public.reviews for all to authenticated using (true) with check (true);

create policy "Public read active welcome sections"
  on public.welcome_sections for select to anon, authenticated using (is_active = true);
create policy "Team manage welcome sections"
  on public.welcome_sections for all to authenticated using (true) with check (true);

grant select on
  public.blogs, public.faqs, public.gallery, public.reviews, public.welcome_sections
  to anon;
grant select, insert, update, delete on
  public.blogs, public.faqs, public.gallery, public.reviews, public.welcome_sections
  to authenticated;
