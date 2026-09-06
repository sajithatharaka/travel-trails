import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard: the homepage "What Our Guests Say" section renders every
// testimonial as a paused-on-hover marquee (like the gallery ticker), not the
// old fixed 6-card grid. See docs/requirements/home-testimonials-marquee.md.
describe("homepage testimonials marquee", () => {
  const page = readFileSync(
    join(process.cwd(), "src/app/(site)/page.tsx"),
    "utf8",
  );

  it("renders <TestimonialsMarquee /> with the full review list", () => {
    expect(page).toContain("<TestimonialsMarquee items={reviewCards} />");
  });

  it("no longer caps the testimonials at 6 cards in a grid", () => {
    expect(page).not.toContain("reviewCards.slice(0, 6)");
    expect(page).not.toContain('<div className="grid gap-7 md:grid-cols-3">');
  });

  it("places the testimonials marquee after the WHY section", () => {
    const whyIndex = page.indexOf('<section id="why"');
    const marqueeIndex = page.indexOf("<TestimonialsMarquee");
    expect(whyIndex).toBeGreaterThan(-1);
    expect(marqueeIndex).toBeGreaterThan(whyIndex);
  });
});
