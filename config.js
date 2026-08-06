// ============================================================
// STARTER KIT CONFIG — Edit this file to customise the page
// No need to touch any other file for basic customisation.
// ============================================================

export const siteConfig = {
  // ---------- BRAND ----------
  brand: {
    name: "YourApp",           // Product / startup name
    tagline: "Your one-line value proposition here.",
    description:
      "A short 2–3 sentence description of what you're building and who it's for. Be specific. This appears below the tagline in the hero section.",
    accentColor: "#6366f1",    // Primary accent (hex). Change to your brand color.
    logoEmoji: "⚡",            // Quick logo placeholder. Replace with <img> if you have a logo.
  },

  // ---------- HERO ----------
  hero: {
    badge: "Now accepting early access",   // Small pill above the headline (leave empty "" to hide)
    headline: "The future of [X] is here.", // Big H1 headline
    subheadline:
      "Join the waitlist and be the first to know when we launch.",
    ctaPlaceholder: "Enter your email address",
    ctaButton: "Join the Waitlist",
    successMessage: "🎉 You're on the list! We'll be in touch.",
  },

  // ---------- WHY SECTION ----------
  why: {
    sectionLabel: "WHY WE'RE BUILDING THIS",
    headline: "The problem we're solving",
    points: [
      {
        emoji: "😤",
        title: "Pain point #1",
        description:
          "Describe the frustration your target user faces today. Be specific — vague pain is unconvincing.",
      },
      {
        emoji: "🕳️",
        title: "Pain point #2",
        description:
          "What's the gap in the market? What do existing solutions miss?",
      },
      {
        emoji: "💡",
        title: "Our approach",
        description:
          "What's the core insight behind your solution? One sentence of differentiation.",
      },
    ],
  },

  // ---------- ROADMAP ----------
  roadmap: {
    sectionLabel: "ROADMAP",
    headline: "What we're building",
    phases: [
      {
        phase: "Phase 1",
        title: "Foundation",
        status: "In Progress",       // "Shipped" | "In Progress" | "Planned"
        quarter: "Q3 2025",
        items: ["Core feature A", "Core feature B", "Beta access for waitlist"],
      },
      {
        phase: "Phase 2",
        title: "Growth",
        status: "Planned",
        quarter: "Q4 2025",
        items: ["Feature C", "Integrations", "Team collaboration"],
      },
      {
        phase: "Phase 3",
        title: "Scale",
        status: "Planned",
        quarter: "Q1 2026",
        items: ["API access", "Enterprise tier", "Advanced analytics"],
      },
    ],
  },

  // ---------- FAQ ----------
  faq: {
    sectionLabel: "FAQ",
    headline: "Common questions",
    items: [
      {
        q: "When will this launch?",
        a: "We're targeting [quarter]. Waitlist members get early access and a founding member discount.",
      },
      {
        q: "Is this free to join the waitlist?",
        a: "Yes, completely free. No credit card required.",
      },
      {
        q: "Who is this for?",
        a: "Describe your target user here. Be specific — it builds trust.",
      },
      {
        q: "What happens after I sign up?",
        a: "You'll get a confirmation email. When we launch (or reach your spot), you'll be the first to know.",
      },
      {
        q: "Can I follow progress?",
        a: "Yes — follow us on [Twitter/LinkedIn link] or check back here.",
      },
    ],
  },

  // ---------- SOCIAL PROOF (optional) ----------
  // Leave testimonials as [] to hide the section entirely
  socialProof: {
    headline: "Early believers",
    testimonials: [
      // {
      //   quote: "This is exactly what I've been waiting for.",
      //   name: "Jane D.",
      //   role: "Product Manager, Acme Corp",
      // },
    ],
  },

  // ---------- FOOTER ----------
  footer: {
    ctaHeadline: "Ready to get early access?",
    ctaSubline: "Join hundreds of people already on the waitlist.",
    legal: "© 2025 YourApp. All rights reserved.",
    links: [
      // { label: "Privacy Policy", href: "/privacy" },
      // { label: "Twitter", href: "https://twitter.com/yourhandle" },
    ],
  },
};
