import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Guard: every public route emits JSON-LD through the shared <JsonLd>
// component, and the raw `application/ld+json` script is not hand-rolled
// anywhere except JsonLd.tsx itself. See
// docs/requirements/seo-structured-data.md.

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

const PUBLIC_ROUTES = [
  "src/app/layout.tsx",
  "src/app/(site)/page.tsx",
  "src/app/(site)/tours/page.tsx",
  "src/app/(site)/tours/[slug]/page.tsx",
  "src/app/(site)/blog/page.tsx",
  "src/app/(site)/blog/[slug]/page.tsx",
  "src/app/(site)/contact/page.tsx",
];

describe("structured data wiring", () => {
  it.each(PUBLIC_ROUTES)("%s renders <JsonLd> from the seo builders", (file) => {
    const src = read(file);
    expect(src).toMatch(/<JsonLd\s+data=/);
    expect(src).toContain("@/lib/seo/structuredData");
  });

  it("legal pages get JSON-LD via LegalLayout", () => {
    const layout = read("src/components/LegalLayout.tsx");
    expect(layout).toMatch(/<JsonLd\s+data=/);
    expect(layout).toContain("webPageSchema");
    expect(layout).toContain("breadcrumbSchema");
    for (const p of [
      "src/app/(site)/privacy/page.tsx",
      "src/app/(site)/terms/page.tsx",
      "src/app/(site)/cookie-policy/page.tsx",
    ]) {
      expect(read(p)).toMatch(/path="\/[a-z-]+"/);
    }
  });

  it("no page hand-rolls an application/ld+json script tag", () => {
    for (const file of [...PUBLIC_ROUTES, "src/components/LegalLayout.tsx"]) {
      expect(read(file)).not.toContain("application/ld+json");
    }
  });

  it("JsonLd is the only place that writes the ld+json script", () => {
    expect(read("src/components/JsonLd.tsx")).toContain("application/ld+json");
  });
});
