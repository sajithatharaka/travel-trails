import { describe, it, expect, vi, beforeEach } from "vitest";

// A minimal chainable stand-in for the supabase-js query builder: every
// method returns `this`, and awaiting it resolves the configured result.
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

const importContent = async () => await import("@/lib/content");

beforeEach(() => {
  vi.resetModules();
  nextResult = { data: [], error: null };
});

describe("lib/content readers", () => {
  it("listSiteFaqs returns only rows without a tour_id", async () => {
    nextResult = {
      data: [
        { id: "1", question: "A", answer: "a", tour_id: null, display_order: 0 },
        { id: "2", question: "B", answer: "b", tour_id: "t1", display_order: 1 },
      ],
      error: null,
    };
    const { listSiteFaqs, listTourFaqs } = await importContent();
    expect((await listSiteFaqs()).map((f) => f.id)).toEqual(["1"]);
    expect((await listTourFaqs("t1")).map((f) => f.id)).toEqual(["2"]);
  });

  it("listRelatedPosts excludes the current slug and caps the count", async () => {
    nextResult = {
      data: [
        { id: "1", slug: "current", excerpt: "" },
        { id: "2", slug: "a", excerpt: "" },
        { id: "3", slug: "b", excerpt: "" },
        { id: "4", slug: "c", excerpt: "" },
        { id: "5", slug: "d", excerpt: "" },
      ],
      error: null,
    };
    const { listRelatedPosts } = await importContent();
    const related = await listRelatedPosts("current", 3);
    expect(related).toHaveLength(3);
    expect(related.map((p) => p.slug)).not.toContain("current");
  });

  it("getPostBySlug finds the matching published post", async () => {
    nextResult = {
      data: [
        { id: "1", slug: "one" },
        { id: "2", slug: "two" },
      ],
      error: null,
    };
    const { getPostBySlug } = await importContent();
    expect((await getPostBySlug("two"))?.id).toBe("2");
    expect(await getPostBySlug("missing")).toBeNull();
  });

  it("degrades to an empty list when the query errors", async () => {
    nextResult = { data: null, error: { message: "relation does not exist" } };
    const { listReviews } = await importContent();
    expect(await listReviews()).toEqual([]);
  });

  it("getActiveWelcomeSection returns the first row or null", async () => {
    nextResult = { data: [{ id: "w1", heading: "Hi" }], error: null };
    const { getActiveWelcomeSection } = await importContent();
    expect((await getActiveWelcomeSection())?.id).toBe("w1");

    vi.resetModules();
    nextResult = { data: [], error: null };
    const { getActiveWelcomeSection: again } = await importContent();
    expect(await again()).toBeNull();
  });
});
