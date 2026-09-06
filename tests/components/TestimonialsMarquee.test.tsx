import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";

const SHORT = "Loved every minute of it.";
const LONG =
  "This was hands down the best trip we have ever taken. Every day was thoughtfully planned, the guides were warm and knowledgeable, the stays were gorgeous, and we never once felt rushed or herded around like tourists.";

const makeItems = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    quote: i === 0 ? LONG : `${SHORT} #${i}`,
    name: `Guest ${i}`,
    trip: `Trip ${i}`,
    avatar: null,
  }));

describe("<TestimonialsMarquee />", () => {
  it("renders nothing when there are no items", () => {
    const { container } = render(<TestimonialsMarquee items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("pads a small set up to a full track before doubling it for the loop", () => {
    // 2 items, MIN_TRACK_CARDS = 6 → track padded to 6, doubled to 12.
    render(<TestimonialsMarquee items={makeItems(2)} />);
    expect(screen.getAllByTestId("testimonial-card")).toHaveLength(12);
  });

  it("pauses the marquee on hover", () => {
    render(<TestimonialsMarquee items={makeItems(3)} />);
    expect(screen.getByTestId("testimonials-marquee").className).toContain(
      "hover:[animation-play-state:paused]",
    );
  });

  it("clips long quotes and shows a See more affordance", () => {
    render(<TestimonialsMarquee items={[makeItems(1)[0]]} />);
    const card = screen.getAllByTestId("testimonial-card")[0];
    expect(within(card).getByText(/See more/)).toBeInTheDocument();
    expect(card.textContent).toContain("…");
    // The full quote text is not rendered in the card.
    expect(card.textContent).not.toContain("herded around like tourists");
  });

  it("does not show See more for short quotes", () => {
    render(
      <TestimonialsMarquee
        items={[{ quote: SHORT, name: "Ada", trip: "Hills", avatar: null }]}
      />,
    );
    expect(screen.queryByText(/See more/)).not.toBeInTheDocument();
  });

  it("opens a dialog with the full quote when a card is clicked", async () => {
    const user = userEvent.setup();
    render(<TestimonialsMarquee items={[makeItems(1)[0]]} />);

    await user.click(screen.getAllByTestId("testimonial-card")[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/herded around like tourists/)).toBeInTheDocument();
    expect(within(dialog).getByText("Guest 0")).toBeInTheDocument();
  });

  it("closes the dialog on the close button, overlay click and Escape", async () => {
    const user = userEvent.setup();
    render(<TestimonialsMarquee items={makeItems(3)} />);
    const openFirst = () =>
      user.click(screen.getAllByTestId("testimonial-card")[0]);

    await openFirst();
    await user.click(screen.getByTestId("testimonial-dialog-close"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await openFirst();
    await user.click(screen.getByTestId("testimonial-dialog-overlay"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await openFirst();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps a click inside the dialog from closing it", async () => {
    const user = userEvent.setup();
    render(<TestimonialsMarquee items={makeItems(3)} />);

    await user.click(screen.getAllByTestId("testimonial-card")[0]);
    await user.click(screen.getByTestId("testimonial-dialog"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
