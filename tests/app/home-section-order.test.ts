import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard: the homepage gallery ticker must sit above the "Why
// Travel Trails" section (after the featured-trails grid, before WHY /
// testimonials). See docs/requirements/phase-3-content-cms.md → "Public wiring".
describe("homepage section order", () => {
  const source = readFileSync(
    join(process.cwd(), "src/app/(site)/page.tsx"),
    "utf8",
  );

  it("renders the gallery ticker before the WHY section", () => {
    const galleryIndex = source.indexOf("<GalleryTicker");
    const whyIndex = source.indexOf('<section id="why"');

    expect(galleryIndex).toBeGreaterThan(-1);
    expect(whyIndex).toBeGreaterThan(-1);
    expect(galleryIndex).toBeLessThan(whyIndex);
  });

  it("renders the gallery ticker after the featured-trails section", () => {
    const trailsIndex = source.indexOf('id="featured-trails"');
    const galleryIndex = source.indexOf("<GalleryTicker");

    expect(trailsIndex).toBeGreaterThan(-1);
    expect(galleryIndex).toBeGreaterThan(trailsIndex);
  });
});
