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
