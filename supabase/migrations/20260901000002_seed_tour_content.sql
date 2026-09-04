-- ============================================================
-- Seed: "The 7-Day Sri Lanka Escape" — ported from the original
-- src/config.js so the site launches with its current content.
-- Idempotent: re-running does nothing once the tour exists.
-- ============================================================

insert into public.tours (
  slug, title, summary,
  hero_eyebrow, hero_headline, hero_subheadline,
  duration_days, destination_count, price_from_usd,
  is_published, is_featured, display_order,
  meta_title, meta_description
) values (
  'the-7-day-sri-lanka-escape',
  'The 7-Day Sri Lanka Escape',
  'Every stop, every experience — a complete look at your seven days across the island.',
  'Travel Trails · Private Sri Lanka Journeys',
  'The 7-Day Sri Lanka Escape',
  'Every journey changes your location. The best journeys change your perspective. Welcome to Sri Lanka.',
  7, 5, 980,
  true, true, 0,
  'The 7-Day Sri Lanka Escape',
  'A private 7-day Sri Lanka itinerary — Sigiriya, Kandy, Nuwara Eliya, Ella and Mirissa — planned by the team behind Tree Trails Sigiriya.'
)
on conflict (slug) do nothing;

-- Route stops
insert into public.tour_route_stops (tour_id, num, name, description, anchor, display_order)
select t.id, v.num, v.name, v.description, v.anchor, v.display_order
from public.tours t
cross join (values
  (1, 'Sigiriya',      'Rock fortress & wildlife',    'day-sigiriya',    0),
  (2, 'Kandy',         'Temple of the Tooth',         'day-kandy',       1),
  (3, 'Nuwara Eliya',  'Tea country & waterfalls',    'day-nuwaraeliya', 2),
  (4, 'Ella',          'Bridges & mountain views',    'day-ella',        3),
  (5, 'Mirissa',       'Southern coast beach',        'day-mirissa',     4)
) as v(num, name, description, anchor, display_order)
where t.slug = 'the-7-day-sri-lanka-escape'
  and not exists (select 1 from public.tour_route_stops s where s.tour_id = t.id);

-- Days
insert into public.tour_days
  (tour_id, day_label, title, description, experiences_label, experiences, note, anchor, display_order)
select t.id, v.day_label, v.title, v.description, v.experiences_label, v.experiences, v.note, v.anchor, v.display_order
from public.tours t
cross join (values
  (
    'Day 1 & 2',
    'Sigiriya, Nature & Heritage',
    'Your journey begins with a scenic transfer from the airport to Tree Trails Sigiriya Boutique Hotel (check-in 2:00 PM), your peaceful jungle retreat.',
    'Experiences you can enjoy',
    array[
      'Climb the iconic Sigiriya Lion Rock',
      'Catch breathtaking views from Pidurangala Rock',
      'Immerse yourself in a traditional Village Tour',
      'Go on a thrilling Wildlife Safari (Minneriya / Kaudulla)',
      'Relax with an Ayurvedic Spa Treatment'
    ],
    'Optional stop: visit the Dambulla Cave Temple en route to Sigiriya or on your way to Kandy.',
    'day-sigiriya',
    0
  ),
  (
    'Day 3',
    'Sigiriya to Kandy to Nuwara Eliya',
    'Travel through lush landscapes to the cultural capital, Kandy, then continue on to the cool hill country of Nuwara Eliya.',
    'Highlights',
    array['Visit the sacred Temple of the Tooth Relic'],
    null,
    'day-kandy',
    1
  ),
  (
    'Day 4',
    'Nuwara Eliya, Little England of Sri Lanka',
    'Enjoy a refreshing day surrounded by tea plantations and colonial charm.',
    'Experiences include',
    array[
      'Visit a Tea Factory & Plantation',
      'Explore Gregory Lake',
      'Stroll through Victoria Park',
      'Visit a Strawberry Farm',
      'Stop by the scenic Ramboda Falls'
    ],
    null,
    'day-nuwaraeliya',
    2
  ),
  (
    'Day 5 & 6',
    'Ella, Adventure & Views',
    'Head to the charming town of Ella, known for its breathtaking views and relaxed vibe, a two-night stay.',
    'Must-do experiences',
    array[
      'Walk along the famous Nine Arch Bridge',
      'Hike Little Adam''s Peak',
      'Visit the beautiful Ravana Falls'
    ],
    null,
    'day-ella',
    3
  ),
  (
    'Day 7',
    'Ella to Mirissa, Beach Bliss',
    'Travel down to the southern coast and unwind in Mirissa, known for its golden beaches and laid-back atmosphere. Relax by the ocean, enjoy fresh seafood, or simply soak in the tropical vibes before your departure.',
    null,
    array[]::text[],
    null,
    'day-mirissa',
    4
  )
) as v(day_label, title, description, experiences_label, experiences, note, anchor, display_order)
where t.slug = 'the-7-day-sri-lanka-escape'
  and not exists (select 1 from public.tour_days d where d.tour_id = t.id);
