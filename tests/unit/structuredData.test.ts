import { describe, expect, it } from "vitest";

import {
  ORGANIZATION_ID,
  WEBSITE_ID,
  absoluteUrl,
  blogListingSchema,
  blogPostingSchema,
  breadcrumbSchema,
  contactPageSchema,
  faqSchema,
  organizationSchema,
  tourListingSchema,
  tourSchema,
  webPageSchema,
  webSiteSchema,
} from "@/lib/seo/structuredData";
import { siteConfig } from "@/config";

const SITE = siteConfig.brand.siteUrl.replace(/\/$/, "");

describe("absoluteUrl", () => {
  it("prefixes site-relative paths with the site URL", () => {
    expect(absoluteUrl("/images/x.jpg")).toBe(`${SITE}/images/x.jpg`);
    expect(absoluteUrl("images/x.jpg")).toBe(`${SITE}/images/x.jpg`);
  });

  it("passes through absolute URLs and drops empty input", () => {
    expect(absoluteUrl("https://cdn.test/x.png")).toBe("https://cdn.test/x.png");
    expect(absoluteUrl(null)).toBeUndefined();
    expect(absoluteUrl("")).toBeUndefined();
  });
});

describe("organizationSchema", () => {
  it("is a TravelAgency with the shared @id and no empty sameAs", () => {
    const org = organizationSchema();
    expect(org["@type"]).toBe("TravelAgency");
    expect(org["@id"]).toBe(ORGANIZATION_ID);
    expect(org).not.toHaveProperty("sameAs"); // seo.sameAs is [] by default
    expect(org.contactPoint).toMatchObject({ "@type": "ContactPoint" });
  });

  it("takes NAP from siteConfig.contact (named, not positional)", () => {
    const org = organizationSchema() as {
      email?: string;
      telephone?: string;
      address?: Record<string, string>;
    };
    expect(org.email).toBe(siteConfig.contact.email);
    expect(org.telephone).toBe(siteConfig.contact.phone);
    expect(org.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: "Delgoda",
      postalCode: siteConfig.contact.address.postalCode,
      addressCountry: "LK",
    });
  });

  it("emits an absolute logo ImageObject when a logo path is supplied", () => {
    const org = organizationSchema("/images/logo.png") as { logo?: unknown };
    expect(org.logo).toEqual({
      "@type": "ImageObject",
      url: `${SITE}/images/logo.png`,
    });
  });

  it("includes sameAs once the config lists profile URLs", () => {
    const sameAs = siteConfig.seo.sameAs as string[];
    sameAs.push("https://www.instagram.com/traveltrails");
    try {
      expect((organizationSchema() as { sameAs?: string[] }).sameAs).toEqual([
        "https://www.instagram.com/traveltrails",
      ]);
    } finally {
      sameAs.length = 0;
    }
  });
});

describe("webSiteSchema", () => {
  it("links to the organization as publisher", () => {
    const site = webSiteSchema();
    expect(site["@id"]).toBe(WEBSITE_ID);
    expect(site.publisher).toEqual({ "@id": ORGANIZATION_ID });
    expect(site.inLanguage).toBe("en");
  });
});

describe("breadcrumbSchema", () => {
  it("numbers items from 1 with absolute item URLs", () => {
    const crumbs = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Tours", path: "/tours" },
      { name: "Trip", path: "/tours/trip" },
    ]);
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect(crumbs.itemListElement.map((e) => e.position)).toEqual([1, 2, 3]);
    expect(crumbs.itemListElement[2].item).toBe(`${SITE}/tours/trip`);
  });
});

describe("webPageSchema", () => {
  it("embeds a breadcrumb and speakable spec when provided", () => {
    const page = webPageSchema({
      path: "/",
      name: "Home",
      description: "d",
      breadcrumbs: [{ name: "Home", path: "/" }],
      speakableSelectors: ["#about p"],
    }) as Record<string, unknown>;
    expect(page["@id"]).toBe(`${SITE}/#webpage`);
    expect(page.isPartOf).toEqual({ "@id": WEBSITE_ID });
    expect((page.breadcrumb as { "@type": string })["@type"]).toBe(
      "BreadcrumbList",
    );
    expect((page.speakable as { cssSelector: string[] }).cssSelector).toEqual([
      "#about p",
    ]);
  });

  it("omits breadcrumb / speakable when not provided", () => {
    const page = webPageSchema({ path: "/x", name: "X" });
    expect(page).not.toHaveProperty("breadcrumb");
    expect(page).not.toHaveProperty("speakable");
  });
});

describe("faqSchema", () => {
  it("maps question/answer pairs onto FAQPage entities", () => {
    const faq = faqSchema([{ q: "Q1?", a: "A1" }]);
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity[0]).toEqual({
      "@type": "Question",
      name: "Q1?",
      acceptedAnswer: { "@type": "Answer", text: "A1" },
    });
  });
});

describe("tourSchema", () => {
  const tour = {
    slug: "hill-country",
    title: "Hill Country Trail",
    summary: "Tea country at an easy pace.",
    meta_description: null,
    duration_days: 3,
    price_from_usd: 540,
    cover_image_url: "/images/cover.jpg",
    days: [
      { title: "Day 1", description: "Arrive" },
      { title: "Day 2", description: "Drive" },
    ],
  };

  it("builds a TouristTrip with absolute url/image, provider ref and offers", () => {
    const t = tourSchema(tour) as Record<string, unknown>;
    expect(t["@type"]).toBe("TouristTrip");
    expect(t.url).toBe(`${SITE}/tours/hill-country`);
    expect(t.image).toBe(`${SITE}/images/cover.jpg`);
    expect(t.provider).toEqual({ "@id": ORGANIZATION_ID });
    expect(t.duration).toBe("P3D");
    expect(t.offers).toMatchObject({
      "@type": "AggregateOffer",
      lowPrice: 540,
      priceCurrency: "USD",
      url: `${SITE}/tours/hill-country`,
    });
    const itinerary = t.itinerary as { itemListElement: unknown[] };
    expect(itinerary.itemListElement).toHaveLength(2);
  });

  it("omits offers and itinerary when data is missing", () => {
    const t = tourSchema({
      slug: "draft",
      title: "Draft",
      price_from_usd: null,
      duration_days: null,
      days: [],
    });
    expect(t).not.toHaveProperty("offers");
    expect(t).not.toHaveProperty("itinerary");
  });
});

describe("tourListingSchema", () => {
  it("is a CollectionPage whose ItemList mirrors the input order", () => {
    const list = tourListingSchema([
      { slug: "a", title: "A" },
      { slug: "b", title: "B" },
    ]);
    expect(list["@type"]).toBe("CollectionPage");
    const items = list.mainEntity.itemListElement;
    expect(items).toHaveLength(2);
    expect(items[1]).toMatchObject({
      position: 2,
      url: `${SITE}/tours/b`,
      name: "B",
    });
  });
});

describe("blogPostingSchema", () => {
  const post = {
    slug: "first-post",
    title: "Planning your first trip",
    excerpt: "A short intro.",
    content: "one two three four five",
    category: "Sri Lanka",
    published_date: "2026-08-01",
    updated_at: null,
    image_url: "/images/post.jpg",
    meta_description: null,
  };

  it("enriches BlogPosting with absolute image, org refs and word count", () => {
    const a = blogPostingSchema(post, "/images/logo.png") as Record<
      string,
      unknown
    >;
    expect(a["@type"]).toBe("BlogPosting");
    expect(a.image).toEqual({
      "@type": "ImageObject",
      url: `${SITE}/images/post.jpg`,
    });
    expect(a.author).toMatchObject({
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
    });
    expect(a.wordCount).toBe(5);
    expect(a.inLanguage).toBe("en");
    expect(a.mainEntityOfPage).toBe(`${SITE}/blog/first-post`);
  });

  it("falls back dateModified to datePublished when updated_at is absent", () => {
    const a = blogPostingSchema(post);
    expect(a.dateModified).toBe("2026-08-01");
  });
});

describe("blogListingSchema", () => {
  it("lists every post in an ItemList", () => {
    const list = blogListingSchema([
      { slug: "a", title: "A" },
      { slug: "b", title: "B" },
      { slug: "c", title: "C" },
    ]);
    expect(list["@type"]).toBe("CollectionPage");
    expect(list.mainEntity.itemListElement).toHaveLength(3);
  });
});

describe("contactPageSchema", () => {
  it("is a ContactPage pointing at the organization", () => {
    const c = contactPageSchema() as Record<string, { "@id"?: string }>;
    expect(c["@type"]).toBe("ContactPage");
    expect(c.mainEntity["@id"]).toBe(ORGANIZATION_ID);
  });
});
