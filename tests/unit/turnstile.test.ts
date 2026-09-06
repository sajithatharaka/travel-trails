import { describe, it, expect, afterEach, vi } from "vitest";

// src/lib/turnstile.ts resolves the site key at module load, so each case
// stubs the env var and re-imports the module fresh.
async function load(value: string | undefined) {
  vi.resetModules();
  if (value === undefined) vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
  else vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", value);
  return import("@/lib/turnstile");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("lib/turnstile", () => {
  it("treats an unset key as not configured", async () => {
    const { TURNSTILE_SITE_KEY, HAS_TURNSTILE } = await load(undefined);
    expect(TURNSTILE_SITE_KEY).toBeUndefined();
    expect(HAS_TURNSTILE).toBe(false);
  });

  it("treats the .env.example placeholder as not configured", async () => {
    const { TURNSTILE_SITE_KEY, HAS_TURNSTILE } = await load("0x<site-key>");
    expect(TURNSTILE_SITE_KEY).toBeUndefined();
    expect(HAS_TURNSTILE).toBe(false);
  });

  it("rejects any angle-bracketed or too-short placeholder", async () => {
    expect((await load("<your-key>")).HAS_TURNSTILE).toBe(false);
    expect((await load("0x")).HAS_TURNSTILE).toBe(false);
    expect((await load("   ")).HAS_TURNSTILE).toBe(false);
  });

  it("accepts a real-looking site key and trims it", async () => {
    const { TURNSTILE_SITE_KEY, HAS_TURNSTILE } = await load(
      "  1x00000000000000000000AA  ",
    );
    expect(TURNSTILE_SITE_KEY).toBe("1x00000000000000000000AA");
    expect(HAS_TURNSTILE).toBe(true);
  });

  it("exposes the shared form action the edge functions re-check", async () => {
    const { TURNSTILE_ACTION } = await load("1x00000000000000000000AA");
    expect(TURNSTILE_ACTION).toBe("travel-trails-form");
  });
});
