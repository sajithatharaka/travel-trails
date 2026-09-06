// ------------------------------------------------------------
// JSON-LD (schema.org) builders — the single source of structured data for
// the public site. Every public route composes a graph from these and renders
// it through <JsonLd> (src/components/JsonLd.tsx).
//
// Pure functions: no React, no fs, no network. Callers pass already-resolved
// image paths (via resolveImage / DB columns) so this stays unit-testable.
//
// SEO  — richer Google results (breadcrumbs, article, offers, FAQ).
// AEO  — FAQPage + speakable hints feed answer engines.
// GEO  — stable @id graph + absolute URLs help LLM crawlers resolve entities.
// ------------------------------------------------------------

import { siteConfig } from "@/config";

const { brand, seo, contact } = siteConfig;
const SITE_URL = brand.siteUrl.replace(/\/$/, "");

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
const LANG = "en";

/** Absolute URL for a site-relative path or a pass-through of an existing URL. */
export function absoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Drop undefined / null / empty-array entries so JSON-LD stays clean. */
function prune<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v == null) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    }),
  ) as T;
}

const email = contact.email;
const telephone = contact.phone;

// ── Core entities ───────────────────────────────────────────

export function organizationSchema(logoPath?: string | null) {
  const logo = absoluteUrl(logoPath);
  return prune({
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": ORGANIZATION_ID,
    name: brand.name,
    url: `${SITE_URL}/`,
    description:
      "Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist.",
    ...(logo && {
      logo: { "@type": "ImageObject", url: logo },
      image: logo,
    }),
    email,
    telephone,
    address: { "@type": "PostalAddress", ...contact.address },
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    ...(email || telephone
      ? {
          contactPoint: prune({
            "@type": "ContactPoint",
            contactType: "customer service",
            email,
            telephone,
            areaServed: "LK",
            availableLanguage: ["English"],
          }),
        }
      : {}),
    sameAs: [...seo.sameAs],
  });
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: brand.name,
    inLanguage: LANG,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

// ── Breadcrumbs ─────────────────────────────────────────────

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

// ── Generic page ────────────────────────────────────────────

export function webPageSchema(opts: {
  path: string;
  name: string;
  description?: string | null;
  breadcrumbs?: Crumb[];
  speakableSelectors?: string[];
}) {
  return prune({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(opts.path)}#webpage`,
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description ?? undefined,
    inLanguage: LANG,
    isPartOf: { "@id": WEBSITE_ID },
    ...(opts.breadcrumbs &&
      opts.breadcrumbs.length > 0 && {
        breadcrumb: breadcrumbSchema(opts.breadcrumbs),
      }),
    ...(opts.speakableSelectors &&
      opts.speakableSelectors.length > 0 && {
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: opts.speakableSelectors,
        },
      }),
  });
}

// ── FAQ ─────────────────────────────────────────────────────

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

// ── Tours ───────────────────────────────────────────────────

type TourInput = {
  slug: string;
  title: string;
  summary?: string | null;
  meta_description?: string | null;
  duration_days?: number | null;
  price_from_usd?: number | null;
  cover_image_url?: string | null;
  days?: { title: string; description?: string | null }[];
};

export function tourSchema(tour: TourInput) {
  const url = absoluteUrl(`/tours/${tour.slug}`);
  const image = absoluteUrl(tour.cover_image_url);
  return prune({
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "@id": `${url}#trip`,
    url,
    name: tour.title,
    description: tour.meta_description || tour.summary || undefined,
    image,
    touristType: ["Sightseeing", "Cultural tourism", "Nature tourism"],
    provider: { "@id": ORGANIZATION_ID },
    ...(tour.duration_days && { duration: `P${tour.duration_days}D` }),
    ...(tour.days && tour.days.length > 0
      ? {
          itinerary: {
            "@type": "ItemList",
            itemListElement: tour.days.map((day, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: prune({
                "@type": "TouristAttraction",
                name: day.title,
                description: day.description ?? undefined,
              }),
            })),
          },
        }
      : {}),
    // `price_from_usd` is a starting ("from") price, not a fixed one — model
    // it as an AggregateOffer lower bound rather than an exact Offer.price.
    ...(tour.price_from_usd != null && {
      offers: {
        "@type": "AggregateOffer",
        lowPrice: tour.price_from_usd,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url,
      },
    }),
  });
}

export function tourListingSchema(
  tours: { slug: string; title: string }[],
  opts: { path?: string; name?: string; description?: string | null } = {},
) {
  const path = opts.path ?? "/tours";
  return prune({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: opts.name ?? "Sri Lanka Tours",
    description: opts.description ?? undefined,
    inLanguage: LANG,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tours.map((tour, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/tours/${tour.slug}`),
        name: tour.title,
      })),
    },
  });
}

// ── Blog ────────────────────────────────────────────────────

type PostInput = {
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  published_date: string;
  updated_at?: string | null;
  image_url?: string | null;
  meta_description?: string | null;
};

function wordCount(text?: string | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function blogPostingSchema(post: PostInput, logoPath?: string | null) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = absoluteUrl(post.image_url);
  const logo = absoluteUrl(logoPath);
  return prune({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    datePublished: post.published_date,
    dateModified: post.updated_at || post.published_date,
    articleSection: post.category ?? undefined,
    ...(image && { image: { "@type": "ImageObject", url: image } }),
    wordCount: wordCount(post.content) || undefined,
    inLanguage: LANG,
    // Self-contained Organization nodes: this schema renders in its own
    // <script> block, so a bare { "@id" } reference to the layout's
    // Organization would dangle for consumers that read blocks in isolation.
    author: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: brand.name,
      url: `${SITE_URL}/`,
    },
    publisher: prune({
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: brand.name,
      url: `${SITE_URL}/`,
      ...(logo && { logo: { "@type": "ImageObject", url: logo } }),
    }),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: url,
  });
}

export function blogListingSchema(
  posts: { slug: string; title: string; published_date?: string }[],
  opts: { path?: string; name?: string; description?: string | null } = {},
) {
  const path = opts.path ?? "/blog";
  return prune({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: opts.name ?? "Blog",
    description: opts.description ?? undefined,
    inLanguage: LANG,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
  });
}

// ── Contact ─────────────────────────────────────────────────

export function contactPageSchema() {
  return prune({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${absoluteUrl("/contact")}#webpage`,
    url: absoluteUrl("/contact"),
    name: "Contact",
    inLanguage: LANG,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: prune({
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: brand.name,
      email,
      telephone,
    }),
  });
}
