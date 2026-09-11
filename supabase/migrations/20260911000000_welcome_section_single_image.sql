-- ============================================================
-- Travel Trails — welcome_sections: single image, not four.
-- The homepage About block only ever rendered image_1_url/image_1_alt;
-- image_2..4 were captured in the admin form but never displayed anywhere.
-- Rename the one that's actually used and drop the dead ones.
-- ============================================================

alter table public.welcome_sections rename column image_1_url to image_url;
alter table public.welcome_sections rename column image_1_alt to image_alt;
alter table public.welcome_sections drop column image_2_url;
alter table public.welcome_sections drop column image_2_alt;
alter table public.welcome_sections drop column image_3_url;
alter table public.welcome_sections drop column image_3_alt;
alter table public.welcome_sections drop column image_4_url;
alter table public.welcome_sections drop column image_4_alt;
