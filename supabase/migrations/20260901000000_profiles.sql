-- ============================================================
-- Travel Trails — team profiles & roles
-- Roles: 'admin' (everything) and 'tour_designer' (everything except
-- user management / notification recipients / technical notes).
-- ============================================================

create table if not exists public.profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'tour_designer'
             check (role in ('admin', 'tour_designer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Any signed-in team member can read the roster.
create policy "Team can read profiles"
  on public.profiles for select to authenticated
  using (true);

-- Only admins manage profiles (the manage-users edge function uses the
-- service role and bypasses these).
create policy "Admins insert profiles"
  on public.profiles for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins update profiles"
  on public.profiles for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins delete profiles"
  on public.profiles for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select, insert, update, delete on public.profiles to authenticated;

-- ── Seed admin ───────────────────────────────────────────────
-- The first admin is sajithatharaka@gmail.com. This runs three ways so it
-- works whether the user is created before or after this migration:
--   1. a trigger stamps the profile + JWT role whenever that email signs up
--   2. a backfill covers a user that already exists
--   3. any other pre-existing auth users are seeded as tour_designer

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seeded_role text := case
    when lower(new.email) = 'sajithatharaka@gmail.com' then 'admin'
    else 'tour_designer'
  end;
begin
  insert into public.profiles (user_id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    seeded_role
  )
  on conflict (user_id) do nothing;

  -- Mirror the role into app_metadata so the JWT claim (used by RLS) is set.
  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', seeded_role)
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill existing users (if any).
insert into public.profiles (user_id, email, role)
select
  u.id,
  u.email,
  case when lower(u.email) = 'sajithatharaka@gmail.com' then 'admin' else 'tour_designer' end
from auth.users u
on conflict (user_id) do nothing;

update auth.users u
set raw_app_meta_data =
  coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object(
       'role',
       case when lower(u.email) = 'sajithatharaka@gmail.com' then 'admin'
            else coalesce(u.raw_app_meta_data ->> 'role', 'tour_designer') end
     )
where exists (select 1 from public.profiles p where p.user_id = u.id);
