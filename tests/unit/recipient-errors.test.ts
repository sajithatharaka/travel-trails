import { describe, expect, it } from "vitest";
import { recipientErrorMessage } from "@/app/admin/(dashboard)/notifications/recipientErrors";

// See docs/requirements/phase-4-settings.md 2026-09-10 — re-adding an existing
// recipient must show a plain-English message, not the raw unique-constraint
// text.
describe("recipientErrorMessage", () => {
  const duplicateError = {
    code: "23505",
    message:
      'duplicate key value violates unique constraint "notification_recipients_email_unique_idx"',
  };

  it("names the email when a 23505 unique violation is thrown while adding", () => {
    expect(recipientErrorMessage(duplicateError, "alerts@example.com")).toBe(
      "alerts@example.com is already on the notifications list.",
    );
  });

  it("still gives a readable duplicate message without the email", () => {
    expect(recipientErrorMessage(duplicateError)).toBe(
      "That email is already on the notifications list.",
    );
  });

  it("matches on the index name even when the code is absent", () => {
    expect(
      recipientErrorMessage({
        message:
          'duplicate key value violates unique constraint "notification_recipients_email_unique_idx"',
      }),
    ).toBe("That email is already on the notifications list.");
  });

  it("maps RLS / permission errors to a readable sentence", () => {
    expect(
      recipientErrorMessage({ code: "42501", message: "permission denied" }),
    ).toBe("You don't have permission to change the recipients list.");
    expect(
      recipientErrorMessage({
        message: 'new row violates row-level security policy for table "x"',
      }),
    ).toBe("You don't have permission to change the recipients list.");
  });

  it("falls back to a generic sentence for anything else", () => {
    expect(recipientErrorMessage(null)).toBe(
      "Something went wrong. Please try again.",
    );
    expect(recipientErrorMessage({ code: "08006", message: "timeout" })).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
