import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

const TOUR = {
  tourId: "3f8c1b2a-0000-4a0b-8c0d-000000000001",
  tourSlug: "the-escape",
  tourTitle: "The Escape",
};

function renderForm(props: Partial<React.ComponentProps<typeof EnquiryForm>> = {}) {
  return render(
    <EnquiryForm successMessage="Thanks! We'll be in touch." {...TOUR} {...props} />,
  );
}

/** Fill every mandatory field with a valid value. */
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByTestId("enquiry-name"), "Jane Doe");
  await user.type(screen.getByTestId("enquiry-email"), "jane@example.com");
  fireEvent.change(screen.getByTestId("enquiry-travel-date"), {
    target: { value: earliestTravelDate() },
  });
  await user.type(screen.getByTestId("enquiry-travellers"), "2");
  await user.type(screen.getByTestId("enquiry-message"), "Sounds great");
}

beforeEach(() => {
  invoke.mockReset();
});

describe("<EnquiryForm />", () => {
  it("submits to submit-booking with the tour context and every mandatory field", async () => {
    invoke.mockResolvedValue({ data: { success: true }, error: null });
    const user = userEvent.setup();

    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    const [fn, opts] = invoke.mock.calls[0];
    expect(fn).toBe("submit-booking");
    expect(opts.body).toMatchObject({
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      travellers: 2,
      travel_date: earliestTravelDate(),
      tour_id: TOUR.tourId,
      tour_slug: TOUR.tourSlug,
      tour_title: TOUR.tourTitle,
      message: "Sounds great",
    });

    expect(
      await screen.findByText("Thanks! We'll be in touch."),
    ).toBeInTheDocument();
  });

  it("labels the date field 'Expected Travel Date' and marks every field required", () => {
    renderForm();
    expect(screen.getByText("Expected Travel Date")).toBeInTheDocument();
    for (const testId of [
      "enquiry-name",
      "enquiry-email",
      "enquiry-travel-date",
      "enquiry-travellers",
      "enquiry-message",
    ]) {
      expect(screen.getByTestId(testId)).toBeRequired();
    }
  });

  it("blocks submit with an inline message when a mandatory field is empty", async () => {
    const user = userEvent.setup();

    renderForm();
    await user.type(screen.getByTestId("enquiry-name"), "Jane Doe");
    await user.type(screen.getByTestId("enquiry-email"), "jane@example.com");
    fireEvent.change(screen.getByTestId("enquiry-travel-date"), {
      target: { value: earliestTravelDate() },
    });
    // travellers + message left blank
    fireEvent.submit(
      screen.getByRole("button", { name: /send enquiry/i }).closest("form")!,
    );

    expect(await screen.findByText(/fill in every field/i)).toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
  });

  it("sets the travel-date input's min to tomorrow", () => {
    renderForm();
    const dateInput = screen.getByTestId(
      "enquiry-travel-date",
    ) as HTMLInputElement;
    expect(dateInput.min).toBe(earliestTravelDate());
  });

  it("blocks a past travel date before calling the function", async () => {
    const user = userEvent.setup();

    renderForm();
    await user.type(screen.getByTestId("enquiry-name"), "Jane Doe");
    await user.type(screen.getByTestId("enquiry-email"), "jane@example.com");
    await user.type(screen.getByTestId("enquiry-travellers"), "2");
    await user.type(screen.getByTestId("enquiry-message"), "Hi");
    fireEvent.change(screen.getByTestId("enquiry-travel-date"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /send enquiry/i }).closest("form")!,
    );

    expect(
      await screen.findByText(/travel date in the future/i),
    ).toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
  });

  it("maps a known function-level error to friendly copy and does not show success", async () => {
    invoke.mockResolvedValue({
      data: { error: "Verification failed" },
      error: null,
    });
    const user = userEvent.setup();

    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(
      await screen.findByText(/couldn't verify that you're human/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Verification failed")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Thanks! We'll be in touch."),
    ).not.toBeInTheDocument();
  });

  it("never shows the raw 'non-2xx status code' string when the function returns 400", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: {
        name: "FunctionsHttpError",
        message: "Edge Function returned a non-2xx status code",
        context: new Response(
          JSON.stringify({ error: "Missing verification token" }),
          { status: 400 },
        ),
      },
    });
    const user = userEvent.setup();

    renderForm();
    await fillValidForm(user);
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

    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(
      await screen.findByText(/couldn't send your enquiry just now/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument();
  });

  describe("when Turnstile fails to load (e.g. an unrecognized domain)", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.resetModules();
      delete window.turnstile;
    });

    it("shows a friendly message instead of leaving the form silently stuck", async () => {
      vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "1x00000000000000000000AA");
      window.turnstile = {
        render: (_el, opts) => {
          (opts["error-callback"] as () => void)?.();
          return "wid-1";
        },
        reset: vi.fn(),
        remove: vi.fn(),
      };
      vi.resetModules();
      const FreshEnquiryForm = (await import("@/components/EnquiryForm"))
        .default;

      render(<FreshEnquiryForm successMessage="done" {...TOUR} />);

      expect(
        await screen.findByText(/verification widget couldn't load/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /send enquiry/i }),
      ).toBeDisabled();
    });
  });
});
