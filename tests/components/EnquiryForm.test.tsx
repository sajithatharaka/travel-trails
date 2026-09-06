import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { earliestTravelDate } from "@/lib/travelDate";

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

  it("sets the travel-date input's min to tomorrow and forwards a future date", async () => {
    invoke.mockResolvedValue({ data: { success: true }, error: null });
    const user = userEvent.setup();

    render(<EnquiryForm successMessage="done" />);
    const dateInput = screen.getByTestId(
      "enquiry-travel-date",
    ) as HTMLInputElement;
    expect(dateInput.min).toBe(earliestTravelDate());

    await user.type(screen.getByTestId("enquiry-name"), "Jane Doe");
    await user.type(screen.getByTestId("enquiry-email"), "jane@example.com");
    fireEvent.change(dateInput, { target: { value: earliestTravelDate() } });
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    expect(invoke.mock.calls[0][1].body.travel_date).toBe(earliestTravelDate());
  });

  it("blocks a past travel date before calling the function", async () => {
    const user = userEvent.setup();

    render(<EnquiryForm successMessage="done" />);
    await user.type(screen.getByTestId("enquiry-name"), "Jane Doe");
    await user.type(screen.getByTestId("enquiry-email"), "jane@example.com");
    fireEvent.change(screen.getByTestId("enquiry-travel-date"), {
      target: { value: "2000-01-01" },
    });
    // Submit the form directly — a browser's own `min` validation would also
    // block this, but the JS guard is what produces the inline message and
    // catches a value set past the native check.
    fireEvent.submit(
      screen.getByRole("button", { name: /send enquiry/i }).closest("form")!,
    );

    expect(
      await screen.findByText(/travel date in the future/i),
    ).toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
  });

  it("maps a known function-level error to friendly copy and does not show success", async () => {
    invoke.mockResolvedValue({ data: { error: "Verification failed" }, error: null });
    const user = userEvent.setup();

    render(<EnquiryForm successMessage="done" />);
    await user.type(screen.getByTestId("enquiry-name"), "Bob");
    await user.type(screen.getByTestId("enquiry-email"), "bob@example.com");
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(
      await screen.findByText(/couldn't verify that you're human/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Verification failed")).not.toBeInTheDocument();
    expect(screen.queryByText("done")).not.toBeInTheDocument();
  });

  it("never shows the raw 'non-2xx status code' string when the function returns 400", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: {
        name: "FunctionsHttpError",
        message: "Edge Function returned a non-2xx status code",
        context: new Response(JSON.stringify({ error: "Missing verification token" }), {
          status: 400,
        }),
      },
    });
    const user = userEvent.setup();

    render(<EnquiryForm successMessage="done" />);
    await user.type(screen.getByTestId("enquiry-name"), "Bob");
    await user.type(screen.getByTestId("enquiry-email"), "bob@example.com");
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(
      await screen.findByText(/complete the verification challenge/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/non-2xx status code/i)).not.toBeInTheDocument();
  });

  it("falls back to a friendly generic message for an unrecognised failure", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: { name: "FunctionsFetchError", message: "Failed to fetch" },
    });
    const user = userEvent.setup();

    render(<EnquiryForm successMessage="done" />);
    await user.type(screen.getByTestId("enquiry-name"), "Bob");
    await user.type(screen.getByTestId("enquiry-email"), "bob@example.com");
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(
      await screen.findByText(/couldn't send your enquiry just now/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument();
  });
});
