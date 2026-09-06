import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GalleryTicker from "@/components/GalleryTicker";

const makeItems = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `g${i}`,
    src: `https://cdn.example/${i}.jpg`,
    alt: `Trail moment ${i}`,
  }));

describe("<GalleryTicker />", () => {
  it("renders nothing when there are no items", () => {
    const { container } = render(<GalleryTicker items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("pads a small set up to a full track before doubling it for the loop", () => {
    // 2 images, MIN_TRACK_TILES = 8 → track padded to 8, doubled to 16.
    render(<GalleryTicker items={makeItems(2)} />);
    expect(screen.getAllByAltText("Trail moment 0")).toHaveLength(8);
    expect(screen.getAllByAltText("Trail moment 1")).toHaveLength(8);
  });

  it("does not pad when there are already enough images", () => {
    // 10 images ≥ MIN_TRACK_TILES → track stays at 10, doubled to 20.
    render(<GalleryTicker items={makeItems(10)} />);
    expect(screen.getAllByAltText("Trail moment 0")).toHaveLength(2);
    expect(screen.getAllByAltText("Trail moment 9")).toHaveLength(2);
  });

  it("shows the section heading", () => {
    render(<GalleryTicker items={makeItems(3)} />);
    expect(
      screen.getByRole("heading", { name: /a few moments from the trail/i }),
    ).toBeInTheDocument();
  });
});
