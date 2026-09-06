import { describe, it, expect, afterEach, vi } from "vitest";
import {
  earliestTravelDate,
  isFutureTravelDate,
  todayISODate,
} from "@/lib/travelDate";

// Freeze "now" so the assertions don't drift across a midnight boundary.
function freeze(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

afterEach(() => {
  vi.useRealTimers();
});

describe("lib/travelDate", () => {
  it("todayISODate / earliestTravelDate are today and tomorrow", () => {
    freeze("2026-09-06T10:00:00Z");
    expect(todayISODate()).toBe("2026-09-06");
    expect(earliestTravelDate()).toBe("2026-09-07");
  });

  it("earliestTravelDate rolls over month and year ends", () => {
    freeze("2026-12-31T12:00:00Z");
    expect(earliestTravelDate()).toBe("2027-01-01");
  });

  it("isFutureTravelDate accepts only a well-formed date strictly after today", () => {
    freeze("2026-09-06T12:00:00Z");
    expect(isFutureTravelDate("2026-09-07")).toBe(true);
    expect(isFutureTravelDate("2030-01-01")).toBe(true);
    expect(isFutureTravelDate("2026-09-06")).toBe(false); // today
    expect(isFutureTravelDate("2026-09-05")).toBe(false); // past
    expect(isFutureTravelDate("2020-01-01")).toBe(false);
  });

  it("isFutureTravelDate rejects malformed input", () => {
    freeze("2026-09-06T12:00:00Z");
    expect(isFutureTravelDate("")).toBe(false);
    expect(isFutureTravelDate("07/09/2026")).toBe(false);
    expect(isFutureTravelDate("2026-9-7")).toBe(false);
    expect(isFutureTravelDate("next tuesday")).toBe(false);
  });
});
