import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/settings", () => ({
  getSiteSettings: vi.fn(async () => ({
    brand_name: "Travel Trails",
    footer_description: "Private, boutique journeys across Sri Lanka.",
    footer_group_note: "Part of a group of companies.",
  })),
}));

import Footer from "@/components/Footer";

describe("<Footer />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2031-03-14T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the Booma Tech attribution linking to boomatech.io", async () => {
    render(await Footer());

    const link = screen.getByTestId("footer-attribution-link");
    expect(link).toHaveTextContent("Booma Tech");
    expect(link).toHaveAttribute("href", "https://boomatech.io/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      screen.getByText(/Designed and Developed by/i),
    ).toBeInTheDocument();
  });

  it("shows the copyright year from the current date", async () => {
    render(await Footer());

    expect(
      screen.getByText(/© 2031 Travel Trails\. All rights reserved\./),
    ).toBeInTheDocument();
  });
});
