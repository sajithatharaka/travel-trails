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

  it("shows a spinner and hides the image/close button until the image loads", async () => {
    render(<GalleryTicker items={makeItems(3)} />);
    fireEvent.click(screen.getAllByTestId("gallery-image-button")[0]);

    expect(screen.getByTestId("gallery-dialog-spinner")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-dialog-image")).toHaveClass(
      "opacity-0",
    );
    expect(
      screen.queryByTestId("gallery-dialog-close"),
    ).not.toBeInTheDocument();

    fireEvent.load(screen.getByTestId("gallery-dialog-image"));

    expect(await screen.findByTestId("gallery-dialog-close")).toBeInTheDocument();
    expect(
      screen.queryByTestId("gallery-dialog-spinner"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("gallery-dialog-image")).toHaveClass(
      "opacity-100",
    );
  });

  it("resets the loading state when switching to a different image", async () => {
    render(<GalleryTicker items={makeItems(3)} />);
    const tiles = screen.getAllByTestId("gallery-image-button");

    fireEvent.click(tiles[0]);
    fireEvent.load(screen.getByTestId("gallery-dialog-image"));
    expect(await screen.findByTestId("gallery-dialog-close")).toBeInTheDocument();

    fireEvent.click(tiles[1]);
    expect(screen.getByTestId("gallery-dialog-spinner")).toBeInTheDocument();
    expect(
      screen.queryByTestId("gallery-dialog-close"),
    ).not.toBeInTheDocument();
  });

  it("closes the lightbox via the close button", async () => {
    render(<GalleryTicker items={makeItems(3)} />);
    fireEvent.click(screen.getAllByTestId("gallery-image-button")[0]);
    fireEvent.load(screen.getByTestId("gallery-dialog-image"));
    fireEvent.click(await screen.findByTestId("gallery-dialog-close"));
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

  it("closes reliably via the close button across several images in a row", async () => {
    // Regression test: the close button used to sit at a fixed-size frame's
    // corner rather than the photo's own corner, which could leave the
    // frame's stacking context swallowing clicks meant for the button.
    render(<GalleryTicker items={makeItems(5)} />);
    const tiles = screen.getAllByTestId("gallery-image-button");

    for (let i = 0; i < 5; i++) {
      fireEvent.click(tiles[i]);
      expect(screen.getByTestId("gallery-dialog")).toBeInTheDocument();
      fireEvent.load(screen.getByTestId("gallery-dialog-image"));
      fireEvent.click(await screen.findByTestId("gallery-dialog-close"));
      expect(screen.queryByTestId("gallery-dialog")).not.toBeInTheDocument();
    }
  });

  it("sizes the lightbox image to its own natural aspect ratio and keeps the close button above it", async () => {
    render(<GalleryTicker items={makeItems(1)} />);
    fireEvent.click(screen.getAllByTestId("gallery-image-button")[0]);
    fireEvent.load(screen.getByTestId("gallery-dialog-image"));

    const closeButton = await screen.findByTestId("gallery-dialog-close");
    expect(closeButton.className).toContain("z-10");

    const image = screen.getByTestId("gallery-dialog-image");
    expect(image.className).toContain("h-auto");
    expect(image.className).toContain("w-auto");
  });
});
