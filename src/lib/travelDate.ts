// src/lib/travelDate.ts
// ------------------------------------------------------------
// A booking's travel date must always be in the future — strictly after the
// current calendar day. Shared by `EnquiryForm` (the date input's `min` and its
// submit-time guard). The `submit-booking` edge function re-checks the same rule
// server-side (it can't import from `src/`, so the check is inlined there).
// ------------------------------------------------------------

/** A `Date` as a local-calendar `YYYY-MM-DD` string. */
function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's local calendar date as `YYYY-MM-DD`. */
export function todayISODate(): string {
  return toISODate(new Date());
}

/** The earliest date a traveller may pick — tomorrow, as `YYYY-MM-DD`. */
export function earliestTravelDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISODate(d);
}

/** True when `value` is a well-formed `YYYY-MM-DD` strictly after today. */
export function isFutureTravelDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return value > todayISODate();
}
