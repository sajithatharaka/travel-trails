import { test, expect } from "@playwright/test";

test.describe("public site", () => {
  test("homepage renders a hero heading and the enquiry form", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByTestId("enquiry-name")).toBeVisible();
    await expect(page.getByTestId("enquiry-email")).toBeVisible();
  });

  test("nav links reach Tours and Blog", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Tours", exact: true }).first().click();
    await expect(page).toHaveURL(/\/tours$/);
    await expect(
      page.getByRole("heading", { name: /sri lanka tours/i }),
    ).toBeVisible();

    await page.goto("/blog");
    await expect(
      page.getByRole("heading", { name: /travel trails blog/i }),
    ).toBeVisible();
  });

  test("contact page shows the contact form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByTestId("contact-name")).toBeVisible();
    await expect(page.getByTestId("contact-message")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send message/i }),
    ).toBeVisible();
  });

  test("robots.txt and sitemap.xml are served", async ({ request }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
  });

  test("web app manifest is served", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ name: expect.stringContaining("Travel Trails") });
  });

  test("unknown routes return a branded 404", async ({ page }) => {
    const res = await page.goto("/no-such-trail-xyz");
    expect(res?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: /this trail doesn.t exist/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse tours" })).toBeVisible();
  });

  test("opengraph-image is served as a real image", async ({ request }) => {
    const res = await request.get("/opengraph-image");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/");
  });

  test("homepage head advertises an og:image and twitter:image", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.locator('head meta[property="og:image"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('head meta[name="twitter:image"]'),
    ).toHaveCount(1);
  });

  test("llms.txt is served as plain text with tour and blog sections", async ({
    request,
  }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");
    const body = await res.text();
    expect(body).toContain("## Tours");
    expect(body).toContain("## Blog");
  });

  for (const route of [
    "/",
    "/tours",
    "/blog",
    "/contact",
    "/privacy",
    "/terms",
    "/cookie-policy",
  ]) {
    test(`${route} embeds valid JSON-LD structured data`, async ({ page }) => {
      await page.goto(route);
      const blocks = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      expect(blocks.length).toBeGreaterThan(0);
      for (const block of blocks) {
        const parsed = JSON.parse(block);
        const nodes = Array.isArray(parsed) ? parsed : [parsed];
        for (const node of nodes) {
          expect(node["@context"]).toBe("https://schema.org");
          expect(node["@type"]).toBeTruthy();
        }
      }
    });
  }
});
