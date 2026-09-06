import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/tours", () => ({
  listPublishedTours: vi.fn(),
}));
vi.mock("@/lib/content", () => ({
  listPublishedPosts: vi.fn(),
}));

import { GET } from "@/app/llms.txt/route";
import { listPublishedTours } from "@/lib/tours";
import { listPublishedPosts } from "@/lib/content";
import { siteConfig } from "@/config";

const SITE = siteConfig.brand.siteUrl.replace(/\/$/, "");

beforeEach(() => {
  vi.mocked(listPublishedTours).mockResolvedValue([
    // only the fields the route reads
    { slug: "hill-country-3-day", title: "3-Day Hill Country Trail", summary: "Tea country." },
  ] as never);
  vi.mocked(listPublishedPosts).mockResolvedValue([
    { slug: "first-trip", title: "Planning your first trip", excerpt: "Start here." },
  ] as never);
});

describe("/llms.txt", () => {
  it("is served as plain text", async () => {
    const res = await GET();
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(res.headers.get("cache-control")).toContain("s-maxage=3600");
  });

  it("lists key pages, tours and blog posts with absolute URLs", async () => {
    const body = await (await GET()).text();
    expect(body).toContain(`# ${siteConfig.brand.name}`);
    expect(body).toContain(`${SITE}/tours`);
    expect(body).toContain(
      `[3-Day Hill Country Trail](${SITE}/tours/hill-country-3-day): Tea country.`,
    );
    expect(body).toContain(
      `[Planning your first trip](${SITE}/blog/first-trip): Start here.`,
    );
    expect(body).toContain(`${SITE}/privacy`);
  });

  it("degrades gracefully when nothing is published", async () => {
    vi.mocked(listPublishedTours).mockResolvedValue([] as never);
    vi.mocked(listPublishedPosts).mockResolvedValue([] as never);
    const body = await (await GET()).text();
    expect(body).toContain("## Tours\n- (none published yet)");
    expect(body).toContain("## Blog\n- (none published yet)");
  });
});
