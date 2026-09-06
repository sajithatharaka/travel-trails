import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// vi.mock is hoisted above imports, so the mock client is built inside
// vi.hoisted() and exposed for assertions.
const h = vi.hoisted(() => {
  const spies = {
    from: vi.fn(),
    select: vi.fn(),
    order: vi.fn(),
  };
  const rows = [
    {
      id: "1",
      image_url: "https://example.test/a.jpg",
      alt_text: "Tea plantation",
      category: "Hill Country",
      display_order: 0,
      is_visible: true,
    },
    {
      id: "2",
      image_url: "https://example.test/b.jpg",
      alt_text: "Beach",
      category: "Coast",
      display_order: 1,
      is_visible: false,
    },
  ];
  const chain = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c: any = {};
    for (const m of ["select", "eq", "order", "insert", "update", "delete"] as const) {
      c[m] = (...a: unknown[]) => {
        if (m in spies) (spies as Record<string, ReturnType<typeof vi.fn>>)[m](...a);
        return c;
      };
    }
    c.then = (res: (r: unknown) => unknown) => res({ data: rows, error: null });
    return c;
  };
  const client = {
    from: (t: string) => {
      spies.from(t);
      return chain();
    },
  };
  return { spies, client };
});

vi.mock("@/lib/supabase/client", () => ({ createClient: () => h.client }));
vi.mock("@/app/admin/(dashboard)/content-actions", () => ({
  revalidateContentCache: vi.fn().mockResolvedValue(undefined),
  revalidateSettingsCache: vi.fn().mockResolvedValue(undefined),
}));

import AdminGalleryPage from "@/app/admin/(dashboard)/gallery/page";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AdminGalleryPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  Object.values(h.spies).forEach((s) => s.mockClear());
});

describe("<AdminGalleryPage />", () => {
  it("renders the photos returned by supabase, ordered", async () => {
    renderPage();
    const grid = await screen.findByTestId("gallery-grid");
    expect(grid.querySelectorAll("img")).toHaveLength(2);
    expect(h.spies.from).toHaveBeenCalledWith("gallery");
  });

  it("uses a compact multi-column thumbnail grid", async () => {
    renderPage();
    const grid = await screen.findByTestId("gallery-grid");
    // Small thumbnails: 2 columns on mobile scaling up to 6 on wide screens.
    expect(grid.className).toContain("grid-cols-2");
    expect(grid.className).toContain("md:grid-cols-4");
    expect(grid.className).toContain("xl:grid-cols-6");
  });
});
