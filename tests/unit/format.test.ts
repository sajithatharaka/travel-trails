import { describe, it, expect } from "vitest";
import { formatPriceFrom, mergeSettings } from "@/lib/format";

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
