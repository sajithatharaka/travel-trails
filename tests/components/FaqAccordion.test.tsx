import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FaqAccordion from "@/components/FaqAccordion";

const items = [
  { q: "What's included?", a: "Transport, stays and a guide." },
  { q: "Do I need a visa?", a: "Most nationalities need an ETA." },
];

describe("<FaqAccordion />", () => {
  it("opens the first item by default", () => {
    render(<FaqAccordion items={items} />);
    expect(screen.getByText("Transport, stays and a guide.")).toBeInTheDocument();
    expect(
      screen.queryByText("Most nationalities need an ETA."),
    ).not.toBeInTheDocument();
  });

  it("switches which answer is shown when another question is clicked", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={items} />);

    await user.click(screen.getByRole("button", { name: /do i need a visa/i }));

    expect(
      await screen.findByText("Most nationalities need an ETA."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Transport, stays and a guide."),
    ).not.toBeInTheDocument();
  });

  it("collapses an open item when its own header is clicked again", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={items} />);

    await user.click(screen.getByRole("button", { name: /what's included/i }));
    expect(
      screen.queryByText("Transport, stays and a guide."),
    ).not.toBeInTheDocument();
  });
});
