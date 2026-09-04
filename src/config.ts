// ============================================================
// TRAVEL TRAILS — SITE CONFIG (build-time constants)
//
// Tour content (hero, route, day-by-day itinerary, pricing) now lives in the
// database and is managed from /admin/tours. What remains here is chrome that
// isn't editable yet: brand, nav, footer, cookie copy, and the "why us" /
// testimonials / FAQ blocks (Phase 3 moves those into the DB too).
//
// `hero` below is only a fallback for the homepage when no tour is marked
// "featured".
// ============================================================

export const siteConfig = {
  brand: {
    name: "Travel Trails",
    nameAccentPart: "Trails",
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.traveltrails.agency",
  },

  seo: {
    titleTemplate: "%s | Travel Trails",
    keywords: [
      "Sri Lanka tour package",
      "Sri Lanka itinerary",
      "private Sri Lanka tours",
      "boutique Sri Lanka travel",
      "7 day Sri Lanka trip",
      "Sigiriya Kandy Ella Mirissa tour",
    ],
    ogImage: "/images/travel-trails-og-image.jpg",
  },

  nav: {
    links: [
      { label: "Tours", href: "/tours" },
      { label: "Why Us", href: "/#why" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/contact" },
      {
        label: "Tree Trails Sigiriya",
        href: "https://treetrailssigiriya.com/",
        external: true,
      },
    ],
    ctaLabel: "Plan My Trip",
    ctaHref: "/#enquiry",
  },

  // Homepage hero fallback — used only when no tour is marked featured.
  hero: {
    eyebrow: "Travel Trails · Private Sri Lanka Journeys",
    headline: "Sri Lanka, Planned Around You",
    subheadline:
      "Every journey changes your location. The best journeys change your perspective. Welcome to Sri Lanka.",
    primaryCta: { label: "Browse Tours", href: "/tours" },
    secondaryCta: { label: "Customize My Trip", href: "#enquiry" },
  },

  about: {
    sectionLabel: "About Travel Trails",
    headline: "Rooted in Sri Lankan Hospitality",
    imgPlaceholder: "Safari, Sri Lanka",
    paragraphs: [
      "Travel Trails is a travel and destination management company operating under the trusted hospitality brand of Tree Trails Sigiriya. Building on our experience in welcoming travellers to Sri Lanka, we curate thoughtfully planned journeys that combine seamless arrangements, personalised experiences, and reliable support throughout every stage of the trip.",
      "Our approach is centred on traveller wellbeing, comfort, reliability, and exceptional guest care. From carefully selected experiences and transportation to personalised itineraries and on-trip assistance, we strive to make every journey smooth, memorable, and worry-free.",
      "With Travel Trails, guests can explore Sri Lanka with confidence, knowing that every detail is thoughtfully coordinated by a team committed to delivering a high standard of service.",
    ],
  },

  why: {
    sectionLabel: "Why Travel Trails",
    headline: "A Boutique Way to See Sri Lanka",
    subheadline:
      "We plan every trail personally — small enough to care, local enough to know the way.",
    points: [
      {
        shape: "circle",
        title: "Local Experts",
        description:
          "Born-and-raised guides who know every back road, viewpoint and family-run kitchen.",
      },
      {
        shape: "square",
        title: "Boutique Stays",
        description:
          "Handpicked jungle retreats and hill bungalows, never big chain hotels.",
      },
      {
        shape: "diamond",
        title: "Tailored Journeys",
        description:
          "Every itinerary is adjusted to your pace, interests and travel dates.",
      },
      {
        shape: "triangle",
        title: "Always On Call",
        description:
          "A dedicated trip coordinator reachable throughout your entire stay.",
      },
    ],
  },

  testimonials: {
    sectionLabel: "Traveller Stories",
    headline: "What Our Guests Say",
    subheadline:
      "We're the team behind TreeTrails Sigiriya, and we built this agency to extend that same care to your entire Sri Lanka journey, here's what our hotel guests have been telling us.",
    items: [
      {
        quote:
          "Beautiful, peaceful new property! The deluxe rooms feature a treehouse where you have a great view of Sigiriya Rock. It's also a serene place to just sit and listen to the birds. Lovely pool, good restaurant, and exceptionally friendly and accommodating staff. It's a great value for the money as well!",
        name: "Stacy",
        trip: "United States",
        avatarId: "avatar-stacy",
      },
      {
        quote:
          "We stayed 2 nights on this beautiful location with beautiful people. The very nice room was situated in a little house with a nice terrace outside, so clean and looked like a totally new place. The service was brilliant — they arranged a transfer to Pidurangala at 5am and a very good taxi driver for our next leg. Tree Trails, thank you so much for taking care of us! We loved our stay with you.",
        name: "Britt",
        trip: "Netherlands",
        avatarId: "avatar-britt",
      },
      {
        quote:
          "Our room was on the top floor with a direct view of Lion Rock — perfect. The staff was very friendly and helpful. They can help you book a tuk tuk or driver. We booked rides through them and got very good and professional drivers.",
        name: "Dolores",
        trip: "Croatia",
        avatarId: "avatar-dolores",
      },
      {
        quote:
          "The property is in a great location, surrounded by wildlife. The sounds alone were my favourite part. The staff are all so friendly. They organised for a tuk tuk to take us to Lion Rock at 5am so we could see the sunrise. Food in the restaurant is made to order and was so nice. We have been travelling for a couple months and this is my favourite place we have ever stayed.",
        name: "Gemma",
        trip: "Ireland",
        avatarId: "avatar-gemma",
      },
      {
        quote:
          "Such a peaceful place and we were so well looked after by the kind staff. The breakfast was a feast and we even were able to have it in our treehouse. Was great to have a pool if needed, but the star of the show was the roof of the treehouse — an absolute haven with stunning views over the jungle canopy, Sigiriya and Pidurangala rocks. Thank you so much for our delightful stay!",
        name: "Rowena",
        trip: "United Kingdom",
        avatarId: "avatar-rowena",
      },
      {
        quote:
          "Perfect location, peaceful and serene atmosphere, very clean and comfortable. Above all absolutely caring staff.",
        name: "Khalid",
        trip: "United Kingdom",
        avatarId: "avatar-khalid",
      },
    ],
  },

  faq: {
    sectionLabel: "Good to Know",
    headline: "Frequently Asked Questions",
    subheadline:
      "Everything travellers usually ask before booking a Travel Trails journey.",
    items: [
      {
        q: "What's included in the price?",
        a: "Private A/C transport with a driver-guide, accommodation for every night of the route, the meals listed for your chosen tour, entrance fees for core experiences, and a dedicated trip coordinator. Flights and personal expenses aren't included.",
      },
      {
        q: "Do I need a visa for Sri Lanka?",
        a: "Most nationalities need an Electronic Travel Authorization (ETA) before arrival, arranged online in a few minutes. We'll send you the link and instructions once your trip is confirmed.",
      },
      {
        q: "What's the best time of year to visit?",
        a: "Sri Lanka is a year-round destination thanks to its two monsoon seasons on opposite coasts. December to March is peak season for the hill country and south coast; we'll help you pick dates around the weather that suits you.",
      },
      {
        q: "Can the itinerary be customized?",
        a: "Yes. Our published tours are starting points — pace, stays and add-on experiences can all be tailored. Tell us your dates and preferences in the enquiry form and we'll adjust the plan.",
      },
      {
        q: "How many people will be in our group?",
        a: "Trips are private to your party — never combined with other travellers unless you specifically want a shared group tour. Vehicle and guide are yours alone.",
      },
      {
        q: "How do I pay, and what's the cancellation policy?",
        a: "A deposit secures your dates, with the balance due before departure — payment details are sent after your enquiry. Cancellation terms depend on how far out you cancel; see our Terms and Conditions for the full policy.",
      },
    ],
  },

  enquiry: {
    sectionLabel: "Get In Touch",
    headline: "Ready to Walk the Trail?",
    subheadline:
      "Tell us your travel dates and the tour you have in mind, and we'll hold your spot — or tailor it to suit you.",
    contactDetails: [
      { label: "hello@traveltrails.agency" },
      { label: "+94 74 362 0305" },
      { label: "362 D/6, New Kandy Road, Delgoda" },
    ],
    whatsappNumber: "94743620305",
    whatsappMessage:
      "Hi Travel Trails! I'd like to know more about your Sri Lanka tours.",
    bookMessage: "I'd like to book a Travel Trails tour.",
    customizeMessage:
      "I'd love to customize this itinerary. Here's what we have in mind for the pace, stays and experiences:\n\n",
    successMessage: "Thanks! We'll be in touch within 24 hours.",
  },

  footer: {
    description:
      "Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist.",
    exploreLinks: [
      { label: "Tours", href: "/tours" },
      { label: "FAQ", href: "/#faq" },
    ],
    companyLinks: [
      { label: "Why Us", href: "/#why" },
      { label: "Contact", href: "/contact" },
    ],
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
    groupNote:
      "Travel Trails is part of a group of companies spanning the Hospitality and Manufacturing industries, including Valista Packaging, providers of corrugated carton solutions.",
    legal: `© ${new Date().getFullYear()} Travel Trails. All rights reserved.`,
  },

  cookieConsent: {
    message:
      "We use cookies to make this site work and to understand how it's used. See our",
    policyLinkLabel: "Cookie Policy",
    policyLinkHref: "/cookie-policy",
    acceptLabel: "Accept",
    declineLabel: "Decline",
  },
} as const;

export type SiteConfig = typeof siteConfig;
