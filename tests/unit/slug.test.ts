import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("The 7-Day Sri Lanka Escape")).toBe(
      "the-7-day-sri-lanka-escape",
    );
  });

  it("collapses runs of non-alphanumerics into one hyphen", () => {
    expect(slugify("Kandy  &  Ella —  Hills!!")).toBe("kandy-ella-hills");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Hello World--  ")).toBe("hello-world");
  });

  it("drops accents' surrounding punctuation but keeps digits", () => {
    expect(slugify("Day 1 & 2")).toBe("day-1-2");
  });

  it("returns an empty string for punctuation-only input", () => {
    expect(slugify("---")).toBe("");
  });
});
