import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SITE_OG_IMAGE, OG_IMAGE_ALT } from "@/lib/seo/openGraph";

// Guards for the Open Graph / meta-description / sitemap-freshness pass.
// See docs/requirements/seo-metadata-og-images.md.

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

describe("social share image", () => {
  it("is generated at a stable 1200x630 by the opengraph-image route", () => {
    const src = read("src/app/opengraph-image.tsx");
    expect(src).toContain('from "next/og"');
    expect(src).toContain("width: 1200");
    expect(src).toContain("height: 630");
    expect(src).toContain('contentType = "image/png"');
  });

  it("twitter-image reuses the opengraph-image so both tags are emitted", () => {
    const src = read("src/app/twitter-image.tsx");
    expect(src).toMatch(/export \{[^}]*default[^}]*\} from "\.\/opengraph-image"/);
  });

  it("SITE_OG_IMAGE points at the generated route with dimensions + alt", () => {
    expect(SITE_OG_IMAGE.url).toBe("/opengraph-image");
    expect(SITE_OG_IMAGE.width).toBe(1200);
    expect(SITE_OG_IMAGE.height).toBe(630);
    expect(SITE_OG_IMAGE.alt).toBe(OG_IMAGE_ALT);
  });

  it("root layout no longer falls back to the route-map diagram for og:image", () => {
    const src = read("src/app/layout.tsx");
    expect(src).not.toContain('resolveImage("route-map")');
    expect(src).not.toContain('resolveImage("og-image")');
  });
});

describe("detail page metadata", () => {
  const tourPage = read("src/app/(site)/tours/[slug]/page.tsx");
  const blogPage = read("src/app/(site)/blog/[slug]/page.tsx");

  it("tour detail sets siteName, locale and an og:image fallback", () => {
    expect(tourPage).toContain("siteName: siteConfig.brand.name");
    expect(tourPage).toContain('locale: "en_US"');
    expect(tourPage).toContain(
      "tour.cover_image_url ? { url: tour.cover_image_url } : SITE_OG_IMAGE",
    );
  });

  it("blog detail sets siteName, locale and an og:image fallback", () => {
    expect(blogPage).toContain("siteName: siteConfig.brand.name");
    expect(blogPage).toContain('locale: "en_US"');
    expect(blogPage).toContain(
      "post.image_url ? { url: post.image_url } : SITE_OG_IMAGE",
    );
  });

  it("both detail pages give the Twitter card the same title/description/image", () => {
    for (const src of [tourPage, blogPage]) {
      expect(src).toContain(
        "twitter: { card: \"summary_large_image\", title, description, images }",
      );
    }
  });

  it("both detail pages guarantee a non-empty meta description", () => {
    expect(tourPage).toContain(
      "tour.meta_description || tour.summary || FALLBACK_DESCRIPTION",
    );
    expect(blogPage).toContain(
      "post.meta_description || post.excerpt || FALLBACK_DESCRIPTION",
    );
  });
});

describe("NAP is a single named source", () => {
  it("config exposes a structured contact block and derives contactDetails from it", () => {
    const src = read("src/config.ts");
    expect(src).toMatch(/const contact = \{/);
    expect(src).toContain("contactDetails: [\n      { label: contact.email }");
    expect(src).toContain("addressRegion:");
    expect(src).toContain("postalCode:");
  });

  it("structuredData + settings + legal pages read named contact fields, not array indices", () => {
    expect(read("src/lib/seo/structuredData.ts")).toContain(
      "const email = contact.email",
    );
    expect(read("src/lib/settings.ts")).toContain(
      "siteConfig.contact.email",
    );
    for (const p of [
      "src/app/(site)/privacy/page.tsx",
      "src/app/(site)/terms/page.tsx",
      "src/app/(site)/cookie-policy/page.tsx",
    ]) {
      expect(read(p)).toContain("const email = contact.email");
    }
  });

  it("the Terms page no longer contradicts the schema address", () => {
    expect(read("src/app/(site)/terms/page.tsx")).not.toContain("Colombo");
  });
});

describe("misc metadata hygiene", () => {
  it("robots.ts strips a trailing slash from the site URL", () => {
    expect(read("src/app/robots.ts")).toContain(
      'siteConfig.brand.siteUrl.replace(/\\/$/, "")',
    );
  });

  it("root layout no longer emits a keywords meta tag", () => {
    expect(read("src/app/layout.tsx")).not.toContain("keywords:");
  });

  it("a branded global not-found and a web manifest exist", () => {
    const nf = read("src/app/not-found.tsx");
    expect(nf).toContain("<Header />");
    expect(nf).toContain('href: "/tours"');
    expect(read("src/app/manifest.ts")).toContain("MetadataRoute.Manifest");
  });

  it("the /blog title targets a query while the h1 stays branded", () => {
    const src = read("src/app/(site)/blog/page.tsx");
    expect(src).toContain('title: "Sri Lanka Travel Blog"');
    expect(src).toContain("The Travel Trails Blog"); // still the visible h1
  });

  it("tourSchema models the 'from' price as an AggregateOffer lower bound", () => {
    const src = read("src/lib/seo/structuredData.ts");
    expect(src).toContain('"@type": "AggregateOffer"');
    expect(src).toContain("lowPrice: tour.price_from_usd");
  });
});

describe("sitemap / llms.txt freshness", () => {
  it("sitemap route has its own hourly revalidate", () => {
    expect(read("src/app/sitemap.ts")).toMatch(
      /export const revalidate = 3600/,
    );
  });

  it("admin publish actions bust the static route maps explicitly", () => {
    for (const file of [
      "src/app/admin/(dashboard)/tours/actions.ts",
      "src/app/admin/(dashboard)/content-actions.ts",
    ]) {
      const src = read(file);
      expect(src).toContain('revalidatePath("/sitemap.xml")');
      expect(src).toContain('revalidatePath("/llms.txt")');
    }
  });
});
