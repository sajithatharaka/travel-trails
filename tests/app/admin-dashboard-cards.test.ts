import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard: every dashboard card must be backed by a real DB count and
// link to its section. The gallery / blog / reviews cards used to be hardcoded
// "Phase 3" placeholders with value null and href "#".
// See docs/requirements/admin-dashboard.md.
describe("admin dashboard cards", () => {
  const source = readFileSync(
    join(process.cwd(), "src/app/admin/(dashboard)/page.tsx"),
    "utf8",
  );

  it("no longer ships hardcoded placeholders", () => {
    expect(source).not.toContain("Phase 3");
    expect(source).not.toContain('href: "#"');
  });

  it("counts gallery photos (total + visible)", () => {
    expect(source).toContain('supabase.from("gallery")');
    expect(source).toMatch(/from\("gallery"\)[\s\S]*?\.eq\("is_visible", true\)/);
  });

  it("counts published + total blog posts", () => {
    expect(source).toMatch(/from\("blogs"\)[\s\S]*?\.eq\("is_published", true\)/);
    expect(source).toContain('supabase.from("blogs").select("id"');
  });

  it("counts reviews (total + visible)", () => {
    expect(source).toContain('supabase.from("reviews")');
    expect(source).toMatch(/from\("reviews"\)[\s\S]*?\.eq\("is_visible", true\)/);
  });

  it("links each new card to its admin section", () => {
    expect(source).toContain('href: "/admin/gallery"');
    expect(source).toContain('href: "/admin/blog"');
    expect(source).toContain('href: "/admin/reviews"');
  });
});
