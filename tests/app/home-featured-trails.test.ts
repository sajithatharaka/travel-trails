import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard: the homepage showcases up to 4 tour tiles + a "View all
// tours" link instead of one featured day-by-day itinerary.
// See docs/requirements/home-featured-trails.md.
describe("homepage featured trails grid", () => {
  const source = readFileSync(
    join(process.cwd(), "src/app/(site)/page.tsx"),
    "utf8",
  );

  it("renders a featured-trails section built from <TourCard>", () => {
    expect(source).toContain('id="featured-trails"');
    expect(source).toContain("<TourCard");
    expect(source).toContain("trails.map(");
  });

  it("caps the grid at four tiles via listFeaturedTrails()", () => {
    expect(source).toContain("listFeaturedTrails()");
  });

  it("offers a 'View all tours' link to /tours", () => {
    const match = source.match(
      /data-testid="view-all-tours"[\s\S]*?href="\/tours"|href="\/tours"[\s\S]*?data-testid="view-all-tours"/,
    );
    expect(match).not.toBeNull();
  });

  it("no longer renders the day-by-day itinerary section or the stats bar", () => {
    expect(source).not.toContain('id="itinerary"');
    expect(source).not.toContain("Days on Trail");
  });
});
