create table if not exists leads (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null unique,
  source     text        not null default 'waitlist',
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

-- Service role (used server-side) can insert; no public access
create policy "service role insert"
  on leads for insert
  with check (true);
