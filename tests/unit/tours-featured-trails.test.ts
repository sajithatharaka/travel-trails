import { describe, it, expect, vi, beforeEach } from "vitest";

// Chainable stand-in for the supabase-js query builder (see
// tests/integration/content-readers.test.ts). Awaiting it resolves `nextResult`.
type Result = { data: unknown[] | null; error: { message: string } | null };
let nextResult: Result = { data: [], error: null };

function builder() {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "limit", "neq"]) {
    chain[m] = vi.fn(() => chain);
  }
  chain.then = (resolve: (r: Result) => unknown) => resolve(nextResult);
  return chain;
}

vi.mock("@/lib/supabase/public", () => ({
  supabasePublic: { from: vi.fn(() => builder()) },
}));

const importTours = async () => await import("@/lib/tours");

const tour = (
  id: string,
  is_featured = false,
  display_order = 0,
): Record<string, unknown> => ({
  id,
  slug: id,
  title: id.toUpperCase(),
  is_featured,
  display_order,
  days: [],
  route_stops: [],
});

beforeEach(() => {
  vi.resetModules();
  nextResult = { data: [], error: null };
});

describe("listFeaturedTrails", () => {
  it("returns an empty list when there are no published tours", async () => {
    const { listFeaturedTrails } = await importTours();
    expect(await listFeaturedTrails()).toEqual([]);
  });

  it("puts featured tours first, then the rest in display order", async () => {
    nextResult = {
      data: [
        tour("a", false, 0),
        tour("b", true, 1),
        tour("c", false, 2),
      ],
      error: null,
    };
    const { listFeaturedTrails } = await importTours();
    expect((await listFeaturedTrails()).map((t) => t.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("caps the result at the given limit (default 4)", async () => {
    nextResult = {
      data: Array.from({ length: 6 }, (_, i) => tour(`t${i}`, false, i)),
      error: null,
    };
    const { listFeaturedTrails } = await importTours();
    expect(await listFeaturedTrails()).toHaveLength(4);
    expect(await listFeaturedTrails(2)).toHaveLength(2);
  });
});
