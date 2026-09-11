import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const invoke = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ functions: { invoke } }),
}));

import GeneralEnquiryForm from "@/components/GeneralEnquiryForm";
import { PREFILL_MESSAGE_EVENT } from "@/components/HeroCta";

beforeEach(() => invoke.mockReset());

describe("<GeneralEnquiryForm />", () => {
  it("posts to submit-contact with no tour context", async () => {
    invoke.mockResolvedValue({ data: { success: true }, error: null });
    const user = userEvent.setup();

    render(<GeneralEnquiryForm successMessage="Thanks — we'll reply soon." />);
    await user.type(screen.getByTestId("general-enquiry-name"), "Ada Lovelace");
    await user.type(
      screen.getByTestId("general-enquiry-email"),
      "ada@example.com",
    );
    await user.type(
      screen.getByTestId("general-enquiry-message"),
      "Interested in a custom Sri Lanka trip",
    );
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    const [fn, opts] = invoke.mock.calls[0];
    expect(fn).toBe("submit-contact");
    expect(opts.body).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Interested in a custom Sri Lanka trip",
      subject: "Website enquiry",
    });
    expect(opts.body).not.toHaveProperty("tour_id");
    expect(opts.body).not.toHaveProperty("tour_slug");
    expect(opts.body).not.toHaveProperty("tour_title");

    expect(
      await screen.findByText("Thanks — we'll reply soon."),
    ).toBeInTheDocument();
  });

  it("prefills the message when the hero CTA broadcasts PREFILL_MESSAGE_EVENT", () => {
    render(<GeneralEnquiryForm successMessage="ok" />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent(PREFILL_MESSAGE_EVENT, {
          detail: "I'd like to customize a trip.",
        }),
      );
    });

    expect(screen.getByTestId("general-enquiry-message")).toHaveValue(
      "I'd like to customize a trip.",
    );
  });

  it("maps a known function error to friendly copy", async () => {
    invoke.mockResolvedValue({
      data: { error: "Verification failed" },
      error: null,
    });
    const user = userEvent.setup();

    render(<GeneralEnquiryForm successMessage="ok" />);
    await user.type(screen.getByTestId("general-enquiry-name"), "X");
    await user.type(screen.getByTestId("general-enquiry-email"), "x@example.com");
    await user.type(screen.getByTestId("general-enquiry-message"), "hi");
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(
      await screen.findByText(/couldn't verify that you're human/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("ok")).not.toBeInTheDocument();
  });
});
