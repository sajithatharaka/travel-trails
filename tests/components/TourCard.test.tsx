import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TourCard from "@/components/TourCard";
import type { TourWithChildren } from "@/lib/tours";

const tour = {
  id: "t1",
  slug: "hill-country-3-day",
  title: "3-Day Hill Country Trail",
  summary: "Tea country, waterfalls and a hill-station railway.",
  price_from_usd: 540,
  duration_days: 3,
  destination_count: 3,
  cover_image_url: "/images/about.jpeg",
  days: [],
  route_stops: [],
} as unknown as TourWithChildren;

describe("<TourCard />", () => {
  it("links to the tour detail page", () => {
    render(<TourCard tour={tour} />);
    expect(screen.getByTestId("tour-card-hill-country-3-day")).toHaveAttribute(
      "href",
      "/tours/hill-country-3-day",
    );
  });

  it("shows the title, summary, duration/destination eyebrow and price", () => {
    render(<TourCard tour={tour} />);
    expect(screen.getByText("3-Day Hill Country Trail")).toBeInTheDocument();
    expect(
      screen.getByText("Tea country, waterfalls and a hill-station railway."),
    ).toBeInTheDocument();
    expect(screen.getByText("3 days")).toBeInTheDocument();
    expect(screen.getByText("· 3 destinations")).toBeInTheDocument();
    expect(screen.getByText("from $540")).toBeInTheDocument();
  });

  it("omits the price when price_from_usd is null", () => {
    render(<TourCard tour={{ ...tour, price_from_usd: null } as TourWithChildren} />);
    expect(screen.queryByText(/^from \$/)).not.toBeInTheDocument();
  });
});
