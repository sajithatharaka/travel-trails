import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config";
import { resolveImage } from "@/lib/resolveImage";

// Regression guard: the homepage hero must never fall back to the route map.
// route-map.png is a diagram and renders as broken at full-bleed hero size.
// See docs/requirements/homepage-hero.md.
describe("homepage hero fallback image", () => {
  it("config points at a bundled scenic photo, not the route map", () => {
    const id = siteConfig.hero.fallbackImageId;
    expect(id).toBeTruthy();
    expect(id).not.toContain("route-map");
  });

  it("resolves to a real file under /public/images", () => {
    const url = resolveImage(siteConfig.hero.fallbackImageId);
    expect(url).toBeTruthy();
    expect(url).toMatch(/^\/images\/.+\.(jpg|jpeg|png|webp)$/);
    expect(url).not.toContain("route-map");
    expect(existsSync(join(process.cwd(), "public", url!))).toBe(true);
  });

  it("does not render a price chip in the hero CTA row", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/(site)/page.tsx"),
      "utf8",
    );
    expect(src).not.toContain("/ person");
    expect(src).not.toContain("formatPriceFrom");
  });

  it("hero headline is agency-level, not the featured tour's hero_headline", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/(site)/page.tsx"),
      "utf8",
    );
    // The homepage <h1> must come from siteConfig, so a tour name like
    // "The 7-Day Sri Lanka Escape" can never become the homepage headline.
    expect(src).toMatch(/const heroHeadline = hero\.headline;/);
    expect(src).not.toMatch(/heroHeadline = tour\?\.hero_headline/);
  });

  it("hero slideshow is driven by settings.hero_images", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/(site)/page.tsx"),
      "utf8",
    );
    // Site Settings images take priority; the tour cover is only the fallback.
    expect(src).toMatch(/settings\.hero_images\.length > 0/);
    expect(src).toMatch(/<HeroSlider slides=\{heroSlides\}>/);
  });

  it("the cover-image seed migration uses a real scenic photo", () => {
    const sql = readFileSync(
      join(
        process.cwd(),
        "supabase/migrations/20260901000003_seed_tour_cover_image.sql",
      ),
      "utf8",
    );
    const match = sql.match(/cover_image_url\s*=\s*'([^']+)'/);
    expect(match).not.toBeNull();
    const path = match![1];
    expect(path).not.toContain("route-map");
    expect(existsSync(join(process.cwd(), "public", path))).toBe(true);
  });
});
