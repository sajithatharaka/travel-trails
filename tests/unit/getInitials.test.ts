import { describe, it, expect } from "vitest";
import { getInitials } from "@/lib/getInitials";

describe("getInitials", () => {
  it("takes the first two letters of a single name", () => {
    expect(getInitials("Stacy")).toBe("ST");
  });

  it("takes first + last initials for multi-word names", () => {
    expect(getInitials("Hannah Tom")).toBe("HT");
  });

  it("skips ampersands", () => {
    expect(getInitials("Hannah & Tom")).toBe("HT");
  });

  it("returns an empty string for empty input", () => {
    expect(getInitials("")).toBe("");
    expect(getInitials("   ")).toBe("");
  });
});
