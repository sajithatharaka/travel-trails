import { describe, it, expect } from "vitest";
import { formatPriceFrom, mergeSettings, parseHeroImages } from "@/lib/format";

describe("formatPriceFrom", () => {
  it("formats a price with a thousands separator", () => {
    expect(formatPriceFrom(980)).toBe("from $980");
    expect(formatPriceFrom(1450)).toBe("from $1,450");
  });

  it("rounds to the nearest dollar", () => {
    expect(formatPriceFrom(980.4)).toBe("from $980");
    expect(formatPriceFrom(980.6)).toBe("from $981");
  });

  it("returns null when there is no price", () => {
    expect(formatPriceFrom(null)).toBeNull();
    expect(formatPriceFrom(undefined)).toBeNull();
    expect(formatPriceFrom(Number.NaN)).toBeNull();
  });
});

describe("mergeSettings", () => {
  const defaults = { brand_name: "Travel Trails", contact_email: "a@b.com" };

  it("overrides a default with a stored non-empty string", () => {
    expect(mergeSettings(defaults, { brand_name: "TT Travel" })).toEqual({
      brand_name: "TT Travel",
      contact_email: "a@b.com",
    });
  });

  it("ignores blank, missing and non-string stored values", () => {
    expect(
      mergeSettings(defaults, {
        brand_name: "   ",
        contact_email: 42,
        extra_key: "ignored",
      }),
    ).toEqual(defaults);
  });
});

describe("parseHeroImages", () => {
  it("keeps the order of non-empty string URLs", () => {
    expect(
      parseHeroImages(["/a.jpg", "/b.jpg", "/c.jpg"]),
    ).toEqual(["/a.jpg", "/b.jpg", "/c.jpg"]);
  });

  it("drops blanks and non-string entries", () => {
    expect(
      parseHeroImages(["/a.jpg", "", "   ", 5, null, "/b.jpg"]),
    ).toEqual(["/a.jpg", "/b.jpg"]);
  });

  it("returns an empty array for a missing or non-array value", () => {
    expect(parseHeroImages(undefined)).toEqual([]);
    expect(parseHeroImages(null)).toEqual([]);
    expect(parseHeroImages("nope")).toEqual([]);
    expect(parseHeroImages({})).toEqual([]);
  });
});
