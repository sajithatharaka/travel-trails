import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Supabase client stub — records the insert payload, resolves every chain.
const h = vi.hoisted(() => {
  const spies = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  };
  const chain = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c: any = {};
    for (const m of ["select", "insert", "update", "eq", "single"] as const) {
      c[m] = (...a: unknown[]) => {
        spies[m](...a);
        return c;
      };
    }
    c.then = (res: (r: unknown) => unknown) => res({ data: null, error: null });
    return c;
  };
  return {
    spies,
    client: {
      from: (t: string) => {
        spies.from(t);
        return chain();
      },
    },
  };
});

vi.mock("@/lib/supabase/client", () => ({ createClient: () => h.client }));
vi.mock("@/app/admin/(dashboard)/content-actions", () => ({
  revalidateContentCache: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useParams: () => ({ id: "new" }),
}));
vi.mock("@/components/admin/MarkdownEditor", () => ({
  default: () => <div data-testid="markdown-editor" />,
}));
vi.mock("@/components/admin/ImageUpload", () => ({
  default: () => <div data-testid="image-upload" />,
}));

import BlogEditorPage from "@/app/admin/(dashboard)/blog/[id]/page";

beforeEach(() => {
  Object.values(h.spies).forEach((s) => s.mockClear());
});

describe("<BlogEditorPage /> new post", () => {
  it("invalidates the admin blog list query after creating a post", async () => {
    const user = userEvent.setup();
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidate = vi.spyOn(qc, "invalidateQueries");

    render(
      <QueryClientProvider client={qc}>
        <BlogEditorPage />
      </QueryClientProvider>,
    );

    await user.type(screen.getByTestId("blog-title"), "Hiking Ella Rock");
    await user.click(screen.getByTestId("blog-save"));

    await waitFor(() => expect(h.spies.insert).toHaveBeenCalledTimes(1));
    expect(h.spies.from).toHaveBeenCalledWith("blogs");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["admin-blogs"] });
  });
});
