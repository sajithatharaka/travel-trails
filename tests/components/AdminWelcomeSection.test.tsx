import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// vi.mock is hoisted above imports, so the mock client is built inside
// vi.hoisted() and exposed for assertions. The page reads/writes two tables
// — welcome_sections (via useCrudCollection) and site_settings (the
// relocated hero-slideshow card) — so the chain branches on table name.
const h = vi.hoisted(() => {
  const spies = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    upsert: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const welcomeRows = [
    {
      id: "1",
      badge_text: "About Travel Trails",
      heading: "Real journeys, real people",
      paragraph_1: "First paragraph.",
      paragraph_2: "Second paragraph.",
      image_url: "/images/about-1.jpg",
      image_alt: "Guide with travellers",
      display_order: 0,
      is_active: true,
    },
  ];
  const heroRow = { key: "hero_images", value: ["/hero-1.jpg", "/hero-2.jpg"] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain = (table: string): any => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c: any = {};
    for (const m of [
      "select",
      "eq",
      "order",
      "insert",
      "update",
      "delete",
      "upsert",
    ] as const) {
      c[m] = (...a: unknown[]) => {
        spies[m](...a);
        return c;
      };
    }
    c.maybeSingle = (...a: unknown[]) => {
      spies.maybeSingle(...a);
      return Promise.resolve({
        data: table === "site_settings" ? heroRow : null,
        error: null,
      });
    };
    c.then = (res: (r: unknown) => unknown) =>
      res({ data: table === "welcome_sections" ? welcomeRows : null, error: null });
    return c;
  };
  const client = {
    from: (t: string) => {
      spies.from(t);
      return chain(t);
    },
  };
  return { spies, client, welcomeRows, heroRow };
});

vi.mock("@/lib/supabase/client", () => ({ createClient: () => h.client }));
vi.mock("@/app/admin/(dashboard)/content-actions", () => ({
  revalidateContentCache: vi.fn().mockResolvedValue(undefined),
  revalidateSettingsCache: vi.fn().mockResolvedValue(undefined),
}));

import AdminWelcomeSectionPage from "@/app/admin/(dashboard)/welcome-section/page";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AdminWelcomeSectionPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  Object.values(h.spies).forEach((s) => s.mockClear());
});

describe("<AdminWelcomeSectionPage />", () => {
  it("loads straight into the editor, pre-filled with the existing content — no list, no dialog, no extra click", async () => {
    renderPage();

    const editor = await screen.findByTestId("welcome-editor");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("welcome-list")).not.toBeInTheDocument();
    expect(screen.queryByTestId("welcome-new")).not.toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByTestId("welcome-heading")).toHaveValue(
        "Real journeys, real people",
      ),
    );
    expect(within(editor).getByText("Image")).toBeInTheDocument();
    expect(within(editor).queryByText("Image 2")).not.toBeInTheDocument();

    expect(h.spies.from).toHaveBeenCalledWith("welcome_sections");
  });

  it("saves edits to the existing record (update, not insert)", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByTestId("welcome-heading")).toHaveValue(
        "Real journeys, real people",
      ),
    );
    await user.clear(screen.getByTestId("welcome-heading"));
    await user.type(screen.getByTestId("welcome-heading"), "Updated heading");
    await user.click(screen.getByTestId("welcome-save"));

    await waitFor(() => expect(h.spies.update).toHaveBeenCalledTimes(1));
    expect(h.spies.insert).not.toHaveBeenCalled();
    const payload = h.spies.update.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      heading: "Updated heading",
      image_url: "/images/about-1.jpg",
      image_alt: "Guide with travellers",
    });
    expect(payload).not.toHaveProperty("image_2_url");
    expect(h.spies.eq).toHaveBeenCalledWith("id", "1");
  });

  it("renders the relocated hero slideshow card and saves it to site_settings", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Homepage hero slideshow");
    await screen.findByText("/hero-1.jpg");

    await user.click(screen.getByTestId("settings-hero-images-save"));

    await waitFor(() => expect(h.spies.upsert).toHaveBeenCalledTimes(1));
    expect(h.spies.from).toHaveBeenCalledWith("site_settings");
    const [payload, opts] = h.spies.upsert.mock.calls[0] as [
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(payload).toMatchObject({
      key: "hero_images",
      value: ["/hero-1.jpg", "/hero-2.jpg"],
    });
    expect(opts).toMatchObject({ onConflict: "key" });
  });
});
