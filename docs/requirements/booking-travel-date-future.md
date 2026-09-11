# Booking Travel Date — Future Dates Only

**Created:** 2026-09-06 20:47 WEST

## Change history

| Date | Change |
|---|---|
| 2026-09-06 | Initial rule: `travel_date` optional, but must be strictly after today when supplied. |
| 2026-09-10 | `travel_date` is now a **mandatory** field on the tour enquiry form (`EnquiryForm` is tour-page-only and every field is required). The future-date rule is unchanged; it now always runs. `submit-booking` folds the presence check into the combined "…are required" `400` and keeps the separate `travel_date must be in the future` `400`. Label changed to "Expected Travel Date". |

## Rule

A tour enquiry's **travel date is mandatory**, and it must be a real calendar
date **strictly after today**. Empty values, past dates, and today are rejected.

## Implementation

### Shared helper — `src/lib/travelDate.ts` (new)
- `todayISODate()` — local calendar day as `YYYY-MM-DD`.
- `earliestTravelDate()` — tomorrow as `YYYY-MM-DD` (month / year rollover safe).
- `isFutureTravelDate(value)` — `true` only for a well-formed `YYYY-MM-DD`
  strictly after `todayISODate()`.

### Client — `src/components/EnquiryForm.tsx`
- The `travel_date` input is `required`, labelled **"Expected Travel Date"**, and
  gets `min={earliestTravelDate()}` (captured once in `useState` so it is stable
  across re-renders), so the native date picker cannot offer today or earlier.
- The form's `validate(fd)` (run by `useTurnstileSubmit` before the edge call)
  blocks an empty `travel_date` with the combined "fill in every field" message,
  then a value that fails `isFutureTravelDate` with the inline error
  **"Please choose a travel date in the future."** Catches a value set past the
  browser's own `min` / `required` checks.

### Server — `supabase/functions/submit-booking/index.ts`
- The combined required-field check rejects a missing `travel_date` before the
  insert. Then, still before the insert, `travel_date` must match
  `^\d{4}-\d{2}-\d{2}$` and be `> today` (UTC), otherwise
  `400 { error: "travel_date must be in the future" }`. Mirrors
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
- `tests/components/EnquiryForm.test.tsx` — the date input is `required` and its
  `min` is tomorrow; a future date is forwarded in the payload; a past date
  blocks submission with the inline message and no `invoke` call.
- `tests/unit/edge-function-error.test.ts` — the rejection string maps to
  friendly copy.
- `tests/integration/edge-functions.test.ts` — `submit-booking` source: the
  `travel_date must be in the future` guard sits before the insert.

## Acceptance criteria

- [x] The enquiry form cannot pick today or a past date in the picker.
- [x] A programmatically-set past / today date is rejected client-side with a
      friendly message and never reaches the function.
- [x] `submit-booking` rejects a missing or non-future `travel_date` with `400`
      before any DB write.
- [x] `npm run typecheck`, `npm test` pass.
