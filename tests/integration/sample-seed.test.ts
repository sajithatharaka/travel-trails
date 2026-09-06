import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// Guards for supabase/seeds/sample-data.sql — the fixture set used to exercise a
// live database from the public site and /admin. Source assertions (no DB): the
// seed must cover every application table, stay idempotent, and be fully
// reversible by its teardown script.

const root = resolve(__dirname, "../..");
const read = (p: string) => readFileSync(resolve(root, p), "utf8");

const migrationsDir = resolve(root, "supabase/migrations");
const migrationSql = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .map((f) => readFileSync(resolve(migrationsDir, f), "utf8"))
  .join("\n");

// Every table the app owns, discovered from the migrations rather than hard-coded.
const appTables = [
  ...new Set(
    [...migrationSql.matchAll(/create table if not exists public\.(\w+)/g)].map(
      (m) => m[1],
    ),
  ),
].sort();

const seed = read("supabase/seeds/sample-data.sql");
const teardown = read("supabase/seeds/sample-data-teardown.sql");

describe("sample-data.sql fixture", () => {
  it("discovers the full table list from migrations", () => {
    expect(appTables).toEqual([
      "blogs",
      "booking_requests",
      "contact_submissions",
      "faqs",
      "gallery",
      "notification_dispatch_logs",
      "notification_recipients",
      "profiles",
      "reviews",
      "site_settings",
      "tour_days",
      "tour_route_stops",
      "tours",
      "welcome_sections",
    ]);
  });

  it.each(appTables)("seeds public.%s", (table) => {
    expect(seed).toMatch(new RegExp(`insert into public\\.${table}\\b`));
  });

  it("wraps the whole script in a single transaction", () => {
    expect(seed).toMatch(/^begin;$/m);
    expect(seed.trimEnd().endsWith("commit;")).toBe(true);
    expect(teardown).toMatch(/^begin;$/m);
    expect(teardown.trimEnd().endsWith("commit;")).toBe(true);
  });

  it("makes every insert idempotent (on conflict / not exists guard)", () => {
    // Split into per-statement chunks and check each INSERT has a guard.
    const chunks = seed.split(/insert into /i).slice(1);
    for (const chunk of chunks) {
      const statement = chunk.split(/;\s*(?:--|\n|$)/)[0].toLowerCase();
      expect(
        /on conflict|where not exists/.test(statement),
        `unguarded insert: ${statement.slice(0, 60)}...`,
      ).toBe(true);
    }
  });

  it("only touches tagged sample rows (5eed UUIDs, @example.test, sample- slugs)", () => {
    expect(seed).toMatch(/5eed0000-0000-4000-a000-/);
    // No real-looking email domains, no production slugs.
    const emails = [...seed.matchAll(/[\w.+-]+@[\w.-]+\.\w+/g)].map(
      (m) => m[0],
    );
    for (const email of emails) {
      expect(email.endsWith("@example.test")).toBe(true);
    }
  });
});

describe("sample-data-teardown.sql", () => {
  it("deletes from every table the seed writes to", () => {
    // profiles is removed via public.profiles; the auth user via auth.users.
    for (const table of appTables) {
      expect(teardown).toMatch(new RegExp(`delete from public\\.${table}\\b`));
    }
    expect(teardown).toMatch(/delete from auth\.identities\b/);
    expect(teardown).toMatch(/delete from auth\.users\b/);
  });

  it("targets the same 5eed UUID range and nothing else destructive", () => {
    expect(teardown).toMatch(/5eed0000-0000-4000-a000-/);
    expect(teardown).not.toMatch(/truncate/i);
    expect(teardown).not.toMatch(/delete from \w+;/i); // no unfiltered deletes
  });
});
