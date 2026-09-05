-- ============================================================
-- Seed: give "The 7-Day Sri Lanka Escape" a hero cover image.
-- The original seed (20260901000002) left cover_image_url null, so the
-- homepage hero fell back to route-map.png — a diagram, not a photo.
-- Point it at a bundled scenic photo. Only fills a null value, so a
-- cover set later from /admin/tours is never overwritten. Idempotent.
-- ============================================================

update public.tours
set cover_image_url = '/images/day-sigiriya.jpg'
where slug = 'the-7-day-sri-lanka-escape'
  and cover_image_url is null;
