// ============================================================
// TRAVEL TRAILS — SITE CONFIG
// Edit this file to update copy, pricing, itinerary, and contact info.
// Colors live in tailwind.config.js (deep-jungle / jungle / terracotta / etc).
// ============================================================

export const siteConfig = {
  // ---------- BRAND ----------
  brand: {
    name: "Travel Trails",
    nameAccentPart: "Trails", // the part of the name rendered in the accent color
    // Used for canonical URLs, sitemap.xml, robots.txt and JSON-LD. Override
    // with NEXT_PUBLIC_SITE_URL once the site has a real domain deployed.
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.traveltrails.agency",
  },

  // ---------- SEO ----------
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
    ogImage: "/images/travel-trails-og-image.jpg", // falls back to /public/images/route-map.jpg if missing
  },

  // ---------- NAV ----------
  // Hrefs are root-relative ("/#section") so the header works the same
  // whether it's rendered on the homepage or on a subpage like /privacy.
  nav: {
    links: [
      { label: "Route", href: "/#route" },
      { label: "Itinerary", href: "/#itinerary" },
      { label: "Why Us", href: "/#why" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/#enquiry" },
      { label: "Tree Trails Sigiriya", href: "https://treetrailssigiriya.com/", external: true },
    ],
    ctaLabel: "Book This Trip",
    ctaHref: "/#enquiry",
  },

  // ---------- HERO ----------
  hero: {
    eyebrow: "Travel Trails · Private Sri Lanka Journeys",
    headline: "The 7-Day Sri Lanka Escape",
    subheadline:
      "Every journey changes your location. The best journeys change your perspective. Welcome to Sri Lanka.",
    primaryCta: { label: "Book This Itinerary", href: "#enquiry" },
    secondaryCta: { label: "Customize My Trip", href: "#enquiry" },
    // Each slide's photo auto-loads from /public/images/<id>.jpg (or
    // .jpeg/.png/.webp) if present — see README "Photos".
    slides: [
      { id: "day-sigiriya", placeholder: "Sigiriya Lion Rock at sunrise" },
      { id: "day-nuwaraeliya", placeholder: "Tea plantations, Nuwara Eliya" },
      { id: "day-ella", placeholder: "Nine Arch Bridge, Ella" },
      { id: "day-mirissa", placeholder: "Mirissa beach at golden hour" },
      { id: "elephants", placeholder: "Elephants on safari" },
      { id: "monkeys", placeholder: "Monkeys in the wild" },
    ],
  },

  // ---------- STATS BAR ----------
  stats: [
    { value: "7", label: "Days on Trail" },
    { value: "5", label: "Destinations" },
    { value: "4", label: "Themes" },
    { value: "15+", label: "Experiences" },
  ],

  // ---------- ABOUT ----------
  about: {
    sectionLabel: "About Travel Trails",
    headline: "Rooted in Sri Lankan Hospitality",
    // Auto-loads from /public/images/about.jpg (or .jpeg/.png/.webp)
    imgPlaceholder: "Safari, Sri Lanka",
    paragraphs: [
      "Travel Trails is a travel and destination management company operating under the trusted hospitality brand of Tree Trails Sigiriya. Building on our experience in welcoming travellers to Sri Lanka, we curate thoughtfully planned journeys that combine seamless arrangements, personalised experiences, and reliable support throughout every stage of the trip.",
      "Our approach is centred on traveller wellbeing, comfort, reliability, and exceptional guest care. From carefully selected experiences and transportation to personalised itineraries and on-trip assistance, we strive to make every journey smooth, memorable, and worry-free.",
      "With Travel Trails, guests can explore Sri Lanka with confidence, knowing that every detail is thoughtfully coordinated by a team committed to delivering a high standard of service.",
    ],
  },

  // ---------- ROUTE ----------
  route: {
    sectionLabel: "The Route",
    headline: "Your Trail Across the Island",
    subheadline:
      "From the cultural heartland to the misty hills and sun-soaked south — five stops on one unforgettable route.",
    // Auto-loads from /public/images/route-map.jpg (or .jpeg/.png/.webp)
    mapPlaceholder: "Drop your Sri Lanka route map here",
    stops: [
      { num: 1, name: "Sigiriya", desc: "Rock fortress & wildlife", href: "#day-sigiriya" },
      { num: 2, name: "Kandy", desc: "Temple of the Tooth", href: "#day-kandy" },
      { num: 3, name: "Nuwara Eliya", desc: "Tea country & waterfalls", href: "#day-nuwaraeliya" },
      { num: 4, name: "Ella", desc: "Bridges & mountain views", href: "#day-ella" },
      { num: 5, name: "Mirissa", desc: "Southern coast beach", href: "#day-mirissa" },
    ],
  },

  // ---------- ITINERARY ----------
  itinerary: {
    sectionLabel: "Day by Day",
    headline: "The Full Itinerary",
    subheadline:
      "Every stop, every experience — a complete look at your seven days across the island.",
    // Each day's photo auto-loads from /public/images/<id>.jpg (or
    // .jpeg/.png/.webp), e.g. day-sigiriya.jpg — see README "Photos".
    days: [
      {
        id: "day-sigiriya",
        num: "Day 1 & 2",
        title: "Sigiriya, Nature & Heritage",
        desc: "Your journey begins with a scenic transfer from the airport to Tree Trails Sigiriya Boutique Hotel (check-in 2:00 PM), your peaceful jungle retreat.",
        expLabel: "Experiences you can enjoy",
        experiences: [
          "Climb the iconic Sigiriya Lion Rock",
          "Catch breathtaking views from Pidurangala Rock",
          "Immerse yourself in a traditional Village Tour",
          "Go on a thrilling Wildlife Safari (Minneriya / Kaudulla)",
          "Relax with an Ayurvedic Spa Treatment",
        ],
        note: "Optional stop: visit the Dambulla Cave Temple en route to Sigiriya or on your way to Kandy.",
        imgPlaceholder: "Sigiriya Lion Rock",
      },
      {
        id: "day-kandy",
        num: "Day 3",
        title: "Sigiriya → Kandy → Nuwara Eliya",
        desc: "Travel through lush landscapes to the cultural capital, Kandy, then continue on to the cool hill country of Nuwara Eliya.",
        expLabel: "Highlights",
        experiences: ["Visit the sacred Temple of the Tooth Relic"],
        note: null,
        imgPlaceholder: "Temple of the Tooth Relic, Kandy",
      },
      {
        id: "day-nuwaraeliya",
        num: "Day 4",
        title: "Nuwara Eliya, Little England of Sri Lanka",
        desc: "Enjoy a refreshing day surrounded by tea plantations and colonial charm.",
        expLabel: "Experiences include",
        experiences: [
          "Visit a Tea Factory & Plantation",
          "Explore Gregory Lake",
          "Stroll through Victoria Park",
          "Visit a Strawberry Farm",
          "Stop by the scenic Ramboda Falls",
        ],
        note: null,
        imgPlaceholder: "Tea plantations, Nuwara Eliya",
      },
      {
        id: "day-ella",
        num: "Day 5 & 6",
        title: "Ella, Adventure & Views",
        desc: "Head to the charming town of Ella, known for its breathtaking views and relaxed vibe,a two-night stay.",
        expLabel: "Must-do experiences",
        experiences: [
          "Walk along the famous Nine Arch Bridge",
          "Hike Little Adam's Peak",
          "Visit the beautiful Ravana Falls",
        ],
        note: null,
        imgPlaceholder: "Nine Arch Bridge, Ella",
      },
      {
        id: "day-mirissa",
        num: "Day 7",
        title: "Ella → Mirissa, Beach Bliss",
        desc: "Travel down to the southern coast and unwind in Mirissa, known for its golden beaches and laid-back atmosphere. Relax by the ocean, enjoy fresh seafood, or simply soak in the tropical vibes before your departure.",
        expLabel: null,
        experiences: [],
        note: null,
        imgPlaceholder: "Mirissa beach",
      },
    ],
  },

  // ---------- WHY ----------
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

  // ---------- TESTIMONIALS ----------
  testimonials: {
    sectionLabel: "Traveller Stories",
    headline: "What Our Guests Say",
    subheadline:
      "We're the team behind TreeTrails Sigiriya, and we built this agency to extend that same care to your entire Sri Lanka journey, here's what our hotel guests have been telling us.",
    // Each avatar auto-loads from /public/images/<avatarId>.jpg (or
    // .jpeg/.png/.webp) — see README "Photos".
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

  // ---------- PRICING ----------
  pricing: {
    show: false,
    sectionLabel: "Packages",
    headline: "Choose Your Trail",
    subheadline:
      "Every package covers the full 7-day route — the difference is in stays, transport and comfort.",
    featuredKey: "classic",
    tiers: [
      {
        key: "trailblazer",
        tier: "Trailblazer",
        price: "$980",
        desc: "A relaxed way to see it all, in comfortable guesthouses.",
        features: [
          "Private A/C transport & driver-guide",
          "Boutique guesthouse stays",
          "Daily breakfast",
          "Core experiences included",
        ],
      },
      {
        key: "classic",
        tier: "Trail Classic",
        price: "$1,450",
        desc: "Our signature balance of comfort and immersion.",
        features: [
          "Everything in Trailblazer",
          "Boutique & heritage hotel stays",
          "Breakfast & dinner daily",
          "All listed excursions & safaris",
          "Ayurvedic spa session included",
        ],
      },
      {
        key: "luxe",
        tier: "Trail Luxe",
        price: "$2,200",
        desc: "Top-tier stays and fully private experiences throughout.",
        features: [
          "Everything in Trail Classic",
          "Luxury & boutique 5-star stays",
          "Private safari jeep, no sharing",
          "Dedicated trip coordinator",
        ],
      },
    ],
  },

  // ---------- FAQ ----------
  faq: {
    sectionLabel: "Good to Know",
    headline: "Frequently Asked Questions",
    subheadline:
      "Everything travellers usually ask before booking the 7-Day Sri Lanka Escape.",
    items: [
      {
        q: "What's included in the price?",
        a: "Private A/C transport with a driver-guide, accommodation for all 7 nights, the meals listed for your chosen package, entrance fees for core experiences, and a dedicated trip coordinator. Flights and personal expenses aren't included.",
      },
      {
        q: "Do I need a visa for Sri Lanka?",
        a: "Most nationalities need an Electronic Travel Authorization (ETA) before arrival, arranged online in a few minutes. We'll send you the link and instructions once your trip is confirmed.",
      },
      {
        q: "What's the best time of year to do this trip?",
        a: "Sri Lanka is a year-round destination thanks to its two monsoon seasons on opposite coasts. December to March is peak season for the hill country and south coast covered on this route; we'll help you pick dates around the weather that suits you.",
      },
      {
        q: "Can the itinerary be customized?",
        a: "Yes, the 7-Day Escape is our signature route, but pace, stays and add-on experiences can all be tailored. Tell us your dates and preferences in the enquiry form and we'll adjust the plan.",
      },
      {
        q: "How many people will be in our group?",
        a: "Trips are private to your party — it's never combined with other travellers unless you specifically want a shared group tour. Vehicle and guide are yours alone.",
      },
      {
        q: "How do I pay, and what's the cancellation policy?",
        a: "A deposit secures your dates, with the balance due before departure — payment details are sent after your enquiry. Cancellation terms depend on how far out you cancel; see our Terms and Conditions for the full policy.",
      },
    ],
  },

  // ---------- ENQUIRY / CONTACT ----------
  enquiry: {
    sectionLabel: "Get In Touch",
    headline: "Ready to Walk the Trail?",
    subheadline:
      "Tell us your travel dates and we'll hold your spot on the 7-Day Sri Lanka Escape, or tailor it to suit you.",
    contactDetails: [
      { label: "hello@traveltrails.agency" },
      { label: "+94 74 362 0305" },
      { label: "362 D/6, New Kandy Road, Delgoda" },
    ],
    // Digits only (country code, no +, spaces or leading zero) — used to build the wa.me link.
    whatsappNumber: "94743620305",
    whatsappMessage: "Hi Travel Trails! I'd like to know more about the 7-Day Sri Lanka Escape.",
    // Pre-filled into the message field depending on which hero button
    // sent the visitor here (see HeroCta.jsx).
    bookMessage:
      "I'd like to book the 7-Day Sri Lanka Escape.",
    customizeMessage:
      "I'd love to customize this itinerary. Here's what we have in mind for the pace, stays and experiences:\n\n",
    successMessage: "Thanks! We'll be in touch within 24 hours.",
  },

  // ---------- FOOTER ----------
  footer: {
    description:
      "Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist.",
    exploreLinks: [
      { label: "Route", href: "/#route" },
      { label: "Itinerary", href: "/#itinerary" },
      { label: "FAQ", href: "/#faq" },
    ],
    companyLinks: [
      { label: "Why Us", href: "/#why" },
      { label: "Contact", href: "/#enquiry" },
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

  // ---------- COOKIE CONSENT ----------
  cookieConsent: {
    message:
      "We use cookies to make this site work and to understand how it's used. See our",
    policyLinkLabel: "Cookie Policy",
    policyLinkHref: "/cookie-policy",
    acceptLabel: "Accept",
    declineLabel: "Decline",
  },
};
