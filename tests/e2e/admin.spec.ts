import { test, expect } from "@playwright/test";

test.describe("admin auth gate", () => {
  test("unauthenticated /admin redirects to the login page", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("deep admin links also bounce to login with a next param", async ({
    page,
  }) => {
    await page.goto("/admin/tours");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Ftours/);
  });

  test("invalid credentials show an error and stay on the login page", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid|credential/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
