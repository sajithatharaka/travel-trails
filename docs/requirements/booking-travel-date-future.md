# Booking Travel Date — Future Dates Only

**Created:** 2026-09-06 20:47 WEST

## Rule

A booking request's **travel date is optional**, but when supplied it must be a
real calendar date **strictly after today**. Past dates and today are rejected.

## Implementation

### Shared helper — `src/lib/travelDate.ts` (new)
- `todayISODate()` — local calendar day as `YYYY-MM-DD`.
- `earliestTravelDate()` — tomorrow as `YYYY-MM-DD` (month / year rollover safe).
- `isFutureTravelDate(value)` — `true` only for a well-formed `YYYY-MM-DD`
  strictly after `todayISODate()`.

### Client — `src/components/EnquiryForm.tsx`
- The `travel_date` input gets `min={earliestTravelDate()}` (captured once in
  `useState` so it is stable across re-renders), so the native date picker
  cannot offer today or earlier.
- `handleSubmit` guards before calling the edge function: a non-empty
  `travel_date` that fails `isFutureTravelDate` shows the inline error
  **"Please choose a travel date in the future."** and does not submit. Catches a
  value set past the browser's own `min` check.

### Server — `supabase/functions/submit-booking/index.ts`
- After the required-field checks and before the insert: a non-empty
  `travel_date` must match `^\d{4}-\d{2}-\d{2}$` and be `> today` (UTC),
  otherwise `400 { error: "travel_date must be in the future" }`. Mirrors
  `isFutureTravelDate`; the edge function can't import from `src/`.

### Error copy — `src/lib/edgeFunctionError.ts`
- `"travel_date must be in the future"` → "Please choose a travel date in the
  future." (so a client that bypasses the JS guard still sees friendly copy).

## Not done at the DB layer

No `CHECK` constraint on `booking_requests.travel_date` — Postgres `CHECK`
cannot use a non-immutable expression like `CURRENT_DATE`. The rule is enforced
at the edge function (the only insert path) and the form.

## Tests

- `tests/unit/travel-date.test.ts` — `todayISODate` / `earliestTravelDate`
  (incl. month / year-end rollover), `isFutureTravelDate` accepts future only,
  rejects today / past / malformed. Uses fake timers.
- `tests/components/EnquiryForm.test.tsx` — the date input's `min` is tomorrow
  and a future date is forwarded in the payload; a past date blocks submission
  with the inline message and no `invoke` call.
- `tests/unit/edge-function-error.test.ts` — the rejection string maps to
  friendly copy.
- `tests/integration/edge-functions.test.ts` — `submit-booking` source: the
  `travel_date must be in the future` guard sits before the insert.

## Acceptance criteria

- [x] The enquiry form cannot pick today or a past date in the picker.
- [x] A programmatically-set past / today date is rejected client-side with a
      friendly message and never reaches the function.
- [x] `submit-booking` rejects a non-future `travel_date` with `400` before any
      DB write; an absent date still succeeds.
- [x] `npm run typecheck`, `npm test` pass.
