import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// vi.mock is hoisted above imports, so the mock client is built inside
// vi.hoisted() and exposed for assertions.
const h = vi.hoisted(() => {
  const spies = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
  };
  const rows = [
    {
      id: "1",
      question: "What's included?",
      answer: "Transport and stays.",
      category: "General",
      display_order: 0,
      is_visible: true,
    },
    {
      id: "2",
      question: "Do I need a visa?",
      answer: "Usually an ETA.",
      category: "General",
      display_order: 1,
      is_visible: false,
    },
  ];
  const chain = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c: any = {};
    for (const m of [
      "select",
      "eq",
      "order",
      "insert",
      "update",
      "delete",
    ] as const) {
      c[m] = (...a: unknown[]) => {
        spies[m](...a);
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

import AdminFaqsPage from "@/app/admin/(dashboard)/faqs/page";

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AdminFaqsPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  Object.values(h.spies).forEach((s) => s.mockClear());
});

describe("<AdminFaqsPage />", () => {
  it("lists the FAQs returned by supabase, ordered", async () => {
    renderPage();
    expect(await screen.findByText("What's included?")).toBeInTheDocument();
    expect(screen.getByText("Do I need a visa?")).toBeInTheDocument();
    expect(h.spies.from).toHaveBeenCalledWith("faqs");
    expect(h.spies.order).toHaveBeenCalledWith("display_order", {
      ascending: true,
    });
  });

  it("marks the hidden FAQ", async () => {
    renderPage();
    await screen.findByText("Do I need a visa?");
    expect(screen.getByText("Hidden")).toBeInTheDocument();
  });

  it("creates a FAQ through the New dialog", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("What's included?");

    await user.click(screen.getByTestId("faq-new"));
    await user.type(screen.getByTestId("faq-question"), "How do I pay?");
    await user.type(
      screen.getByTestId("faq-answer"),
      "A deposit secures dates.",
    );
    await user.click(screen.getByTestId("faq-save"));

    await waitFor(() => expect(h.spies.insert).toHaveBeenCalledTimes(1));
    expect(h.spies.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        question: "How do I pay?",
        answer: "A deposit secures dates.",
        display_order: 2,
      }),
    );
  });
});
