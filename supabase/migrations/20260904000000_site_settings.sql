-- ============================================================
-- Travel Trails — editable site chrome (key/value).
-- Public read; any signed-in team member can write. Values are JSON so a
-- key can hold a string, number, array or object.
-- ============================================================

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Public read site settings"
  on public.site_settings for select to anon, authenticated using (true);

create policy "Team manage site settings"
  on public.site_settings for all to authenticated using (true) with check (true);

grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;

-- Seed the keys the admin form knows about, from src/config.js defaults.
insert into public.site_settings (key, value) values
  ('brand_name',          '"Travel Trails"'::jsonb),
  ('contact_email',       '"hello@traveltrails.agency"'::jsonb),
  ('contact_phone',       '"+94 74 362 0305"'::jsonb),
  ('contact_address',     '"362 D/6, New Kandy Road, Delgoda"'::jsonb),
  ('whatsapp_number',     '"94743620305"'::jsonb),
  ('whatsapp_message',    '"Hi Travel Trails! I''d like to know more about your Sri Lanka tours."'::jsonb),
  ('footer_description',   '"Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist."'::jsonb),
  ('footer_group_note',    '"Travel Trails is part of a group of companies spanning the Hospitality and Manufacturing industries, including Valista Packaging, providers of corrugated carton solutions."'::jsonb)
on conflict (key) do nothing;
