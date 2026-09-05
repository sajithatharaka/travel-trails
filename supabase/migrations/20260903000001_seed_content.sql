-- ============================================================
-- Seed FAQ + reviews + welcome section from the original src/config.js.
-- Idempotent — only inserts when the table is empty.
-- ============================================================

insert into public.faqs (question, answer, category, display_order, is_visible)
select v.q, v.a, 'General', v.ord, true
from (values
  ('What''s included in the price?',
   'Private A/C transport with a driver-guide, accommodation for every night of the route, the meals listed for your chosen tour, entrance fees for core experiences, and a dedicated trip coordinator. Flights and personal expenses aren''t included.', 0),
  ('Do I need a visa for Sri Lanka?',
   'Most nationalities need an Electronic Travel Authorization (ETA) before arrival, arranged online in a few minutes. We''ll send you the link and instructions once your trip is confirmed.', 1),
  ('What''s the best time of year to visit?',
   'Sri Lanka is a year-round destination thanks to its two monsoon seasons on opposite coasts. December to March is peak season for the hill country and south coast; we''ll help you pick dates around the weather that suits you.', 2),
  ('Can the itinerary be customized?',
   'Yes. Our published tours are starting points — pace, stays and add-on experiences can all be tailored. Tell us your dates and preferences in the enquiry form and we''ll adjust the plan.', 3),
  ('How many people will be in our group?',
   'Trips are private to your party — never combined with other travellers unless you specifically want a shared group tour. Vehicle and guide are yours alone.', 4),
  ('How do I pay, and what''s the cancellation policy?',
   'A deposit secures your dates, with the balance due before departure — payment details are sent after your enquiry. Cancellation terms depend on how far out you cancel; see our Terms and Conditions for the full policy.', 5)
) as v(q, a, ord)
where not exists (select 1 from public.faqs);

insert into public.reviews (reviewer_name, rating, review_text, source, location, display_order, is_visible)
select v.name, 5, v.txt, 'Google', v.loc, v.ord, true
from (values
  ('Stacy', 'Beautiful, peaceful new property! The deluxe rooms feature a treehouse where you have a great view of Sigiriya Rock. It''s also a serene place to just sit and listen to the birds. Lovely pool, good restaurant, and exceptionally friendly and accommodating staff. It''s a great value for the money as well!', 'United States', 0),
  ('Britt', 'We stayed 2 nights on this beautiful location with beautiful people. The very nice room was situated in a little house with a nice terrace outside, so clean and looked like a totally new place. The service was brilliant — they arranged a transfer to Pidurangala at 5am and a very good taxi driver for our next leg. Tree Trails, thank you so much for taking care of us! We loved our stay with you.', 'Netherlands', 1),
  ('Dolores', 'Our room was on the top floor with a direct view of Lion Rock — perfect. The staff was very friendly and helpful. They can help you book a tuk tuk or driver. We booked rides through them and got very good and professional drivers.', 'Croatia', 2),
  ('Gemma', 'The property is in a great location, surrounded by wildlife. The sounds alone were my favourite part. The staff are all so friendly. They organised for a tuk tuk to take us to Lion Rock at 5am so we could see the sunrise. Food in the restaurant is made to order and was so nice. We have been travelling for a couple months and this is my favourite place we have ever stayed.', 'Ireland', 3),
  ('Rowena', 'Such a peaceful place and we were so well looked after by the kind staff. The breakfast was a feast and we even were able to have it in our treehouse. Was great to have a pool if needed, but the star of the show was the roof of the treehouse — an absolute haven with stunning views over the jungle canopy, Sigiriya and Pidurangala rocks. Thank you so much for our delightful stay!', 'United Kingdom', 4),
  ('Khalid', 'Perfect location, peaceful and serene atmosphere, very clean and comfortable. Above all absolutely caring staff.', 'United Kingdom', 5)
) as v(name, txt, loc, ord)
where not exists (select 1 from public.reviews);

insert into public.welcome_sections (badge_text, heading, paragraph_1, paragraph_2, display_order, is_active)
select
  'About Travel Trails',
  'Rooted in Sri Lankan Hospitality',
  'Travel Trails is a travel and destination management company operating under the trusted hospitality brand of Tree Trails Sigiriya. Building on our experience in welcoming travellers to Sri Lanka, we curate thoughtfully planned journeys that combine seamless arrangements, personalised experiences, and reliable support throughout every stage of the trip.',
  'Our approach is centred on traveller wellbeing, comfort, reliability, and exceptional guest care. From carefully selected experiences and transportation to personalised itineraries and on-trip assistance, we strive to make every journey smooth, memorable, and worry-free.',
  0, true
where not exists (select 1 from public.welcome_sections);
