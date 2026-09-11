import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("opens a lightbox dialog with the full image on tile click", () => {
    render(<GalleryTicker items={makeItems(3)} />);
    expect(screen.queryByTestId("gallery-dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByTestId("gallery-image-button")[0]);

    const dialog = screen.getByTestId("gallery-dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByTestId("gallery-dialog-image")).toHaveAttribute(
      "alt",
      "Trail moment 0",
    );
  });

  it("closes the lightbox via the close button", () => {
    render(<GalleryTicker items={makeItems(3)} />);
    fireEvent.click(screen.getAllByTestId("gallery-image-button")[0]);
    fireEvent.click(screen.getByTestId("gallery-dialog-close"));
    expect(screen.queryByTestId("gallery-dialog")).not.toBeInTheDocument();
  });

  it("closes the lightbox via an overlay click", () => {
    render(<GalleryTicker items={makeItems(3)} />);
    fireEvent.click(screen.getAllByTestId("gallery-image-button")[0]);
    fireEvent.click(screen.getByTestId("gallery-dialog-overlay"));
    expect(screen.queryByTestId("gallery-dialog")).not.toBeInTheDocument();
  });

  it("does not close the lightbox when clicking inside the dialog", () => {
    render(<GalleryTicker items={makeItems(3)} />);
    fireEvent.click(screen.getAllByTestId("gallery-image-button")[0]);
    fireEvent.click(screen.getByTestId("gallery-dialog"));
    expect(screen.getByTestId("gallery-dialog")).toBeInTheDocument();
  });

  it("closes the lightbox on Escape", () => {
    render(<GalleryTicker items={makeItems(3)} />);
    fireEvent.click(screen.getAllByTestId("gallery-image-button")[0]);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("gallery-dialog")).not.toBeInTheDocument();
  });
});
