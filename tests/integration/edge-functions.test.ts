import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Deno edge functions can't execute under Vitest, so we assert on their
// source — the same pattern the sibling Tree Trails repo uses. These guard
// the security-critical shape: Turnstile before insert, service-role writes,
// correct verify_jwt flags, and no public insert path.

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

describe("submit-booking edge function", () => {
  const src = read("supabase/functions/submit-booking/index.ts");

  it("verifies the Turnstile token before touching the database", () => {
    const verifyAt = src.indexOf("verifyTurnstile");
    const insertAt = src.indexOf(".from(\"booking_requests\").insert");
    expect(verifyAt).toBeGreaterThan(-1);
    expect(insertAt).toBeGreaterThan(-1);
    expect(verifyAt).toBeLessThan(insertAt);
  });

  it("rejects a missing token and a failed verification", () => {
    expect(src).toMatch(/Missing verification token/);
    expect(src).toMatch(/Verification failed/);
  });

  it("rejects a non-future travel_date before inserting", () => {
    expect(src).toMatch(/travel_date must be in the future/);
    expect(src).toMatch(/travel_date <= todayUtc/);
    expect(src.indexOf("travel_date must be in the future")).toBeLessThan(
      src.indexOf(".from(\"booking_requests\").insert"),
    );
  });

  it("inserts with the service-role key", () => {
    expect(src).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("fires the admin notification after inserting", () => {
    expect(src).toMatch(/invokeNotify\(\{\s*event_type:\s*"new_booking"/);
  });
});

describe("submit-contact edge function", () => {
  const src = read("supabase/functions/submit-contact/index.ts");

  it("verifies Turnstile before inserting", () => {
    expect(src.indexOf("verifyTurnstile")).toBeLessThan(
      src.indexOf(".from(\"contact_submissions\").insert"),
    );
  });

  it("uses the service-role key and notifies", () => {
    expect(src).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(src).toMatch(/invokeNotify\(\{\s*event_type:\s*"new_inquiry"/);
  });
});

describe("notify-admin-events edge function", () => {
  const src = read("supabase/functions/notify-admin-events/index.ts");

  it("dedupes via notification_dispatch_logs", () => {
    expect(src).toMatch(/notification_dispatch_logs/);
    expect(src).toMatch(/dedupeKeyFor/);
  });

  it("only emails active recipients", () => {
    expect(src).toMatch(/notification_recipients/);
    expect(src).toMatch(/\.eq\("is_active",\s*true\)/);
  });

  it("requires an authenticated caller for status-change events", () => {
    const block = src.slice(src.indexOf("booking_status_changed"));
    expect(block).toMatch(/getUser\(\)/);
  });
});

describe("_shared/turnstile helper", () => {
  const src = read("supabase/functions/_shared/turnstile.ts");

  it("fails closed when the secret is not configured", () => {
    expect(src).toMatch(/const secret = Deno\.env\.get\("TURNSTILE_SECRET_KEY"\)/);
    expect(src).toMatch(/if \(!secret\) \{[\s\S]*?return false;/);
  });

  it("calls Cloudflare siteverify", () => {
    expect(src).toMatch(
      /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/,
    );
  });

  it("requires success AND the expected action AND an allowed hostname", () => {
    expect(src).toMatch(/TURNSTILE_ACTION = "travel-trails-form"/);
    expect(src).toMatch(/result\.success !== true/);
    expect(src).toMatch(/result\.action !== TURNSTILE_ACTION/);
    expect(src).toMatch(/!hostnames\.has\(result\.hostname\)/);
  });

  it("logs the reason for every rejection (diagnostics)", () => {
    expect(src).toMatch(/error-codes/);
    expect(src).toMatch(/\[turnstile\]/);
  });

  it("reads the hostname allowlist from TURNSTILE_ALLOWED_HOSTNAMES", () => {
    expect(src).toMatch(/Deno\.env\.get\("TURNSTILE_ALLOWED_HOSTNAMES"\)/);
  });

  it("adds loopback hosts only when TURNSTILE_ALLOW_LOCALHOST is true", () => {
    expect(src).toMatch(
      /Deno\.env\.get\("TURNSTILE_ALLOW_LOCALHOST"\) === "true"/,
    );
    expect(src).toMatch(/LOCALHOST_HOSTNAMES = \[/);
    expect(src).toMatch(/"127\.0\.0\.1"/);
  });

  it("fails closed on a malformed token or an empty hostname allowlist", () => {
    expect(src).toMatch(/token\.length > 2048/);
    expect(src).toMatch(/hostnames\.size === 0/);
  });

  it("bounds the siteverify call with a timeout", () => {
    expect(src).toMatch(/AbortSignal\.timeout\(/);
  });
});

describe("supabase/config.toml verify_jwt flags", () => {
  const toml = read("supabase/config.toml");

  it("keeps the public form functions open", () => {
    expect(toml).toMatch(
      /\[functions\.submit-booking\]\s*\nverify_jwt = false/,
    );
    expect(toml).toMatch(
      /\[functions\.submit-contact\]\s*\nverify_jwt = false/,
    );
  });

  it("keeps privileged functions JWT-gated", () => {
    expect(toml).toMatch(
      /\[functions\.notify-admin-events\]\s*\nverify_jwt = true/,
    );
    expect(toml).toMatch(/\[functions\.manage-users\]\s*\nverify_jwt = true/);
  });
});

describe("RLS lockdown migration", () => {
  const sql = read(
    "supabase/migrations/20260902000000_bookings_contacts.sql",
  );

  it("does NOT grant anon/authenticated an insert policy on the form tables", () => {
    expect(sql).not.toMatch(/booking_requests for insert/i);
    expect(sql).not.toMatch(/contact_submissions for insert/i);
    expect(sql).toMatch(/no "insert" policy/i);
  });

  it("grants insert only to service_role", () => {
    expect(sql).toMatch(
      /grant select, insert, update, delete\s*\n\s*on public\.booking_requests, public\.contact_submissions to service_role/,
    );
  });
});

describe("manage-users edge function", () => {
  const src = read("supabase/functions/manage-users/index.ts");

  it("is admin-only", () => {
    expect(src).toMatch(/app_metadata\?\.role !== "admin"/);
    expect(src).toMatch(/Forbidden: admin only/);
  });

  it("only allows the two Travel Trails roles", () => {
    expect(src).toMatch(/\["admin", "tour_designer"\]/);
  });
});
