// Pure helpers shared by the edge functions. No Deno / fetch references so
// they can be unit-tested under Vitest.

export type NotifyEvent =
  | { event_type: "new_booking"; booking_id: string }
  | { event_type: "new_inquiry"; contact_submission_id: string }
  | {
      event_type: "booking_status_changed";
      booking_id: string;
      status: "confirmed" | "cancelled";
    };

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function dedupeKeyFor(b: NotifyEvent): string {
  if (b.event_type === "new_booking") return `new_booking:${b.booking_id}`;
  if (b.event_type === "new_inquiry")
    return `new_inquiry:${b.contact_submission_id}`;
  return `booking_status_changed:${b.booking_id}:${b.status}`;
}

export function subjectFor(b: NotifyEvent): string {
  if (b.event_type === "new_booking") return "New tour enquiry — Travel Trails";
  if (b.event_type === "new_inquiry")
    return "New contact message — Travel Trails";
  return `Booking request ${b.status} — Travel Trails`;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
