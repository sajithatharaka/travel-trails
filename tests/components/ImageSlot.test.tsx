import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ImageSlot from "@/components/ImageSlot";

describe("<ImageSlot />", () => {
  it("defaults to object-cover for photos", () => {
    render(<ImageSlot src="/images/about.jpeg" alt="About" />);
    const img = screen.getByAltText("About");
    expect(img.className).toContain("object-cover");
    expect(img.className).not.toContain("object-contain");
  });

  it('uses object-contain (no crop) when fit="contain"', () => {
    render(
      <ImageSlot src="/images/route-map.png" alt="Route map" fit="contain" />,
    );
    const img = screen.getByAltText("Route map");
    expect(img.className).toContain("object-contain");
    expect(img.className).not.toContain("object-cover");
  });

  it("falls back to the labelled placeholder when src is absent", () => {
    render(<ImageSlot placeholder="Route map" />);
    expect(screen.getByText("Route map")).toBeInTheDocument();
  });
});
