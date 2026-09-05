import { describe, it, expect } from "vitest";
import {
  isUuid,
  dedupeKeyFor,
  subjectFor,
  normalizeEmail,
  EMAIL_RE,
} from "../../supabase/functions/_shared/pure";

const UUID = "3b241101-e2bb-4255-8caf-4136c566a962";

describe("isUuid", () => {
  it("accepts a canonical v4 uuid", () => {
    expect(isUuid(UUID)).toBe(true);
  });
  it("rejects junk", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid(`${UUID}extra`)).toBe(false);
  });
});

describe("dedupeKeyFor", () => {
  it("keys new bookings by id", () => {
    expect(dedupeKeyFor({ event_type: "new_booking", booking_id: UUID })).toBe(
      `new_booking:${UUID}`,
    );
  });
  it("keys inquiries by submission id", () => {
    expect(
      dedupeKeyFor({ event_type: "new_inquiry", contact_submission_id: UUID }),
    ).toBe(`new_inquiry:${UUID}`);
  });
  it("keys status changes by id AND status so confirm and cancel differ", () => {
    const confirmed = dedupeKeyFor({
      event_type: "booking_status_changed",
      booking_id: UUID,
      status: "confirmed",
    });
    const cancelled = dedupeKeyFor({
      event_type: "booking_status_changed",
      booking_id: UUID,
      status: "cancelled",
    });
    expect(confirmed).toBe(`booking_status_changed:${UUID}:confirmed`);
    expect(confirmed).not.toBe(cancelled);
  });
});

describe("subjectFor", () => {
  it("returns a distinct subject per event type", () => {
    expect(subjectFor({ event_type: "new_booking", booking_id: UUID })).toMatch(
      /enquiry/i,
    );
    expect(
      subjectFor({ event_type: "new_inquiry", contact_submission_id: UUID }),
    ).toMatch(/contact/i);
    expect(
      subjectFor({
        event_type: "booking_status_changed",
        booking_id: UUID,
        status: "cancelled",
      }),
    ).toMatch(/cancelled/i);
  });
});

describe("normalizeEmail / EMAIL_RE", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Foo@Bar.COM ")).toBe("foo@bar.com");
  });
  it("validates shape", () => {
    expect(EMAIL_RE.test("a@b.com")).toBe(true);
    expect(EMAIL_RE.test("nope")).toBe(false);
    expect(EMAIL_RE.test("a@b")).toBe(false);
  });
});
