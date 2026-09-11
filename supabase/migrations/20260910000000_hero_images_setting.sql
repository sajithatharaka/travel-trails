-- ============================================================
-- Travel Trails — homepage hero slideshow images.
-- A single `site_settings` row holding a JSON array of public image URLs.
-- When it has 2+ entries the homepage hero auto-rotates through them;
-- with 0 entries the hero falls back to the featured tour's cover image.
-- ============================================================

insert into public.site_settings (key, value) values
  ('hero_images', '[]'::jsonb)
on conflict (key) do nothing;
