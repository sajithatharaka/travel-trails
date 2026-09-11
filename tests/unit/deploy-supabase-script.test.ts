import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// See docs/requirements/supabase-deploy-script.md 2026-09-10 — the
// "Authorization failed for the access token and project ref pair" error came
// from `supabase link` (needs an Owner/Admin org role), not from the deploy.
// `link` must not abort the script, and `db push` / `functions deploy` must
// pass --project-ref so a Developer-role token can still deploy.
const script = readFileSync(
  resolve(__dirname, "../../scripts/deploy-supabase.sh"),
  "utf8",
);

const lineWith = (needle: string) =>
  script.split("\n").find((l) => l.includes(needle) && !l.trimStart().startsWith("#"));

describe("scripts/deploy-supabase.sh", () => {
  it("treats a `supabase link` failure as non-fatal", () => {
    expect(script).toMatch(/if !\s+npx --yes supabase link --project-ref/);
  });

  it("passes --project-ref to `supabase db push`", () => {
    const line = lineWith("supabase db push");
    expect(line).toBeDefined();
    expect(line).toContain('--project-ref "$SUPABASE_PROJECT_REF"');
  });

  it("passes --project-ref to `supabase functions deploy`", () => {
    const line = lineWith("supabase functions deploy");
    expect(line).toBeDefined();
    expect(line).toContain('--project-ref "$SUPABASE_PROJECT_REF"');
  });

  it("still attempts `supabase link` to bootstrap supabase/.temp on fresh checkouts", () => {
    expect(script).toContain("npx --yes supabase link --project-ref");
  });

  // The script must not push arbitrary .env values into Supabase. It reads
  // only an allowlist of keys needed to target/authenticate the CLI, and
  // never runs `supabase secrets set`.
  it("loads only an allowlist of keys from .env, not the whole file", () => {
    expect(script).toMatch(
      /for var in SUPABASE_ACCESS_TOKEN SUPABASE_PROJECT_REF NEXT_PUBLIC_SUPABASE_URL SUPABASE_DB_PASSWORD/,
    );
    // no blanket "export everything from .env" loop
    expect(script).not.toMatch(/export "\$key=\$value"/);
  });

  it("never sets Edge Function secrets", () => {
    expect(lineWith("supabase secrets set")).toBeUndefined();
  });
});
