import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const invoke = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    functions: { invoke },
    auth: { getSession: async () => ({ data: { session: null } }) },
  }),
}));

import EnquiryForm from "@/components/EnquiryForm";

beforeEach(() => {
  invoke.mockReset();
});

describe("<EnquiryForm />", () => {
  it("submits the enquiry to the submit-booking function with the tour context", async () => {
    invoke.mockResolvedValue({ data: { success: true }, error: null });
    const user = userEvent.setup();

    render(
      <EnquiryForm
        successMessage="Thanks! We'll be in touch."
        tourId="tour-1"
        tourSlug="the-escape"
        tourTitle="The Escape"
      />,
    );

    await user.type(screen.getByTestId("enquiry-name"), "Jane Doe");
    await user.type(screen.getByTestId("enquiry-email"), "jane@example.com");
    await user.type(screen.getByTestId("enquiry-travellers"), "2");
    await user.type(screen.getByTestId("enquiry-message"), "Sounds great");
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    const [fn, opts] = invoke.mock.calls[0];
    expect(fn).toBe("submit-booking");
    expect(opts.body).toMatchObject({
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      travellers: 2,
      tour_id: "tour-1",
      tour_slug: "the-escape",
      tour_title: "The Escape",
      message: "Sounds great",
    });

    expect(
      await screen.findByText("Thanks! We'll be in touch."),
    ).toBeInTheDocument();
  });

  it("surfaces a function-level error and does not show success", async () => {
    invoke.mockResolvedValue({ data: { error: "Verification failed" }, error: null });
    const user = userEvent.setup();

    render(<EnquiryForm successMessage="done" />);
    await user.type(screen.getByTestId("enquiry-name"), "Bob");
    await user.type(screen.getByTestId("enquiry-email"), "bob@example.com");
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(await screen.findByText("Verification failed")).toBeInTheDocument();
    expect(screen.queryByText("done")).not.toBeInTheDocument();
  });
});
