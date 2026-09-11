import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const invoke = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ functions: { invoke } }),
}));

import ContactForm from "@/components/ContactForm";

beforeEach(() => invoke.mockReset());

describe("<ContactForm />", () => {
  it("posts to submit-contact with the form fields", async () => {
    invoke.mockResolvedValue({ data: { success: true }, error: null });
    const user = userEvent.setup();

    render(<ContactForm successMessage="Message sent" />);
    await user.type(screen.getByTestId("contact-name"), "Ada Lovelace");
    await user.type(screen.getByTestId("contact-email"), "ada@example.com");
    await user.type(screen.getByTestId("contact-message"), "Hello there");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1));
    const [fn, opts] = invoke.mock.calls[0];
    expect(fn).toBe("submit-contact");
    expect(opts.body).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello there",
      subject: "General Enquiry",
    });
    expect(await screen.findByText("Message sent")).toBeInTheDocument();
  });

  it("shows a friendly generic message instead of the raw transport error", async () => {
    invoke.mockResolvedValue({ data: null, error: { message: "network down" } });
    const user = userEvent.setup();

    render(<ContactForm successMessage="ok" />);
    await user.type(screen.getByTestId("contact-name"), "X");
    await user.type(screen.getByTestId("contact-email"), "x@example.com");
    await user.type(screen.getByTestId("contact-message"), "hi");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText(/couldn't send your message just now/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("network down")).not.toBeInTheDocument();
  });

  it("reads the function's error body on a non-2xx response", async () => {
    invoke.mockResolvedValue({
      data: null,
      error: {
        name: "FunctionsHttpError",
        message: "Edge Function returned a non-2xx status code",
        context: new Response(
          JSON.stringify({ error: "name, email and message are required" }),
          { status: 400 },
        ),
      },
    });
    const user = userEvent.setup();

    render(<ContactForm successMessage="ok" />);
    await user.type(screen.getByTestId("contact-name"), "X");
    await user.type(screen.getByTestId("contact-email"), "x@example.com");
    await user.type(screen.getByTestId("contact-message"), "hi");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText(/fill in your name, email and message/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/non-2xx status code/i)).not.toBeInTheDocument();
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
      const FreshContactForm = (await import("@/components/ContactForm"))
        .default;

      render(<FreshContactForm successMessage="done" />);

      expect(
        await screen.findByText(/verification widget couldn't load/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /send message/i }),
      ).toBeDisabled();
    });
  });
});
