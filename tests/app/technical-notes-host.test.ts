import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard: the platform is hosted on Netlify, not Vercel. The
// Technical Notes admin reference must name Netlify for hosting / env vars.
// See docs/requirements/phase-4-settings.md → "/admin/technical-notes".
describe("technical notes host reference", () => {
  const source = readFileSync(
    join(process.cwd(), "src/app/admin/(dashboard)/technical-notes/page.tsx"),
    "utf8",
  );

  it("names Netlify as the host", () => {
    expect(source).toContain('name: "Netlify"');
  });

  it("does not mention Vercel", () => {
    expect(source).not.toMatch(/vercel/i);
  });
});
