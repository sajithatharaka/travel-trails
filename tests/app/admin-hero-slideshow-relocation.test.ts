import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard: the "Homepage hero slideshow" admin card lives on
// /admin/welcome-section (alongside the About block it sits next to on the
// homepage), not on /admin/settings where it originally shipped.
// See docs/requirements/homepage-welcome-section.md and
// docs/requirements/homepage-hero.md.
describe("hero slideshow admin card relocation", () => {
  const settingsSource = readFileSync(
    join(
      process.cwd(),
      "src/app/admin/(dashboard)/settings/page.tsx",
    ),
    "utf8",
  );
  const welcomeSource = readFileSync(
    join(
      process.cwd(),
      "src/app/admin/(dashboard)/welcome-section/page.tsx",
    ),
    "utf8",
  );

  it("is no longer on the Settings page", () => {
    expect(settingsSource).not.toContain("hero_images");
    expect(settingsSource).not.toContain("Homepage hero slideshow");
  });

  it("is on the Welcome Section page, still keyed on hero_images", () => {
    expect(welcomeSource).toContain("Homepage hero slideshow");
    expect(welcomeSource).toContain('"hero_images"');
    expect(welcomeSource).toContain('data-testid="settings-hero-images"');
  });

  it("the welcome-section editor is inline content, not a popup Dialog", () => {
    // The plain (non-Alert) Dialog primitive is only used for the old
    // add/edit popup — its import being gone confirms the editor is inline.
    // AlertDialog (the delete confirmation) is unaffected and stays.
    expect(welcomeSource).not.toContain('from "@/components/ui/dialog"');
    expect(welcomeSource).toContain('data-testid="welcome-editor"');
  });
});
