import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard: the homepage "Route" section must show the Sri Lanka
// route-map diagram in full. It is an illustration, not a photo — cropping
// it (object-cover) or forcing a container aspect ratio that does not match
// the artwork chops off the top/bottom of the island and it reads as broken.
// The old static site rendered it uncropped; this keeps parity.
// See docs/requirements/home-route-map.md.
describe("homepage route map", () => {
  const page = readFileSync(
    join(process.cwd(), "src/app/(site)/page.tsx"),
    "utf8",
  );
  // The <div class="aspect-[w/h] …"> that wraps the route-map <ImageSlot>.
  const containerMatch = page.match(
    /aspect-\[(\d+)\/(\d+)\][^"]*"\s*>\s*<ImageSlot\s+src=\{tour\.route_map_image_url[\s\S]*?\/>/,
  );

  it("wires the route-map ImageSlot inside an aspect-ratio container", () => {
    expect(containerMatch).not.toBeNull();
  });

  it("renders the route-map diagram with fit=contain so it is not cropped", () => {
    expect(containerMatch![0]).toContain('fit="contain"');
  });

  it("pins the map container aspect ratio to the artwork's real dimensions", () => {
    // Intrinsic size from the PNG IHDR chunk (bytes 16-24).
    const png = readFileSync(join(process.cwd(), "public/images/route-map.png"));
    const actual = png.readUInt32BE(16) / png.readUInt32BE(20);

    const declared = Number(containerMatch![1]) / Number(containerMatch![2]);
    // Allow a little slack, but not the old wrong 1100/1400 (~0.79 vs ~0.56).
    expect(Math.abs(declared - actual)).toBeLessThan(0.05);
  });
});
