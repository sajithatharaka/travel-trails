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
});
