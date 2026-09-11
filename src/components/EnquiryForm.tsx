// src/components/EnquiryForm.tsx
// ------------------------------------------------------------
// Public tour enquiry form. Rendered on every /tours/[slug] page, so a tour is
// always in context and its id/slug/title travel with the submission. Solves a
// Cloudflare Turnstile challenge, then POSTs to the submit-booking edge function
// (which verifies the token and writes a booking_requests row with the service
// role). Every field is mandatory — name, email, expected travel date,
// travellers, and message. General, tour-free "get in touch" messages use
// GeneralEnquiryForm on the homepage instead.
// ------------------------------------------------------------

"use client";

import { useState } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";
import { HAS_TURNSTILE } from "@/lib/turnstile";
import { useTurnstileSubmit } from "@/components/useTurnstileSubmit";
import { earliestTravelDate, isFutureTravelDate } from "@/lib/travelDate";

const GENERIC_ERROR =
  "Sorry, we couldn't send your enquiry just now. Please try again in a moment, or email us directly.";
const VERIFICATION_UNAVAILABLE_ERROR =
  "Sorry, the verification widget couldn't load. Please refresh the page and try again, or email us directly.";

const ALL_FIELDS_REQUIRED =
  "Please fill in every field — name, email, expected travel date, travellers and message.";

export default function EnquiryForm({
  successMessage,
  tourId,
  tourSlug,
  tourTitle,
}: {
  successMessage: string;
  tourId: string;
  tourSlug: string;
  tourTitle: string;
}) {
  const [minTravelDate] = useState(earliestTravelDate);

  const {
    status,
    errorMsg,
    token,
    setToken,
    setStatus,
    setErrorMsg,
    turnstileRef,
    handleSubmit,
  } = useTurnstileSubmit({
      functionName: "submit-booking",
      genericError: GENERIC_ERROR,
      validate: (fd) => {
        const name = String(fd.get("name") ?? "").trim();
        const email = String(fd.get("email") ?? "").trim();
        const travelDate = String(fd.get("travel_date") ?? "");
        const travellers = String(fd.get("travellers") ?? "").trim();
        const message = String(fd.get("message") ?? "").trim();
        if (!name || !email || !travelDate || !travellers || !message) {
          return ALL_FIELDS_REQUIRED;
        }
        if (!isFutureTravelDate(travelDate)) {
          return "Please choose a travel date in the future.";
        }
        if (!(Number(travellers) >= 1)) {
          return "Please enter the number of travellers.";
        }
        return null;
      },
      buildBody: (fd, turnstileToken) => {
        const fullName = String(fd.get("name") ?? "").trim();
        const [first_name, ...rest] = fullName.split(/\s+/);
        return {
          turnstileToken,
          tour_id: tourId,
          tour_slug: tourSlug,
          tour_title: tourTitle,
          first_name: first_name || fullName,
          last_name: rest.join(" "),
          email: String(fd.get("email") ?? "").trim(),
          travel_date: String(fd.get("travel_date") ?? ""),
          travellers: Number(fd.get("travellers")),
          message: String(fd.get("message") ?? "").trim(),
        };
      },
    });

  const inputClasses =
    "w-full rounded-[10px] border border-line bg-surface px-4 py-[13px] text-[14.5px] text-ink placeholder-ink-soft/60 outline-none transition-colors focus:border-terracotta disabled:opacity-50";
  const labelClasses = "mb-2 block text-[13px] font-semibold text-ink-soft";
  const busy = status === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-5 rounded-[20px] bg-section-tint p-6 sm:grid-cols-2 sm:p-10"
    >
      <div>
        <label className={labelClasses} htmlFor="enq-name">
          Full Name
        </label>
        <input
          id="enq-name"
          data-testid="enquiry-name"
          type="text"
          name="name"
          required
          placeholder="Jane Doe"
          disabled={busy}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="enq-email">
          Email
        </label>
        <input
          id="enq-email"
          data-testid="enquiry-email"
          type="email"
          name="email"
          required
          placeholder="jane@email.com"
          disabled={busy}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="enq-date">
          Expected Travel Date
        </label>
        <input
          id="enq-date"
          data-testid="enquiry-travel-date"
          type="date"
          name="travel_date"
          required
          min={minTravelDate}
          disabled={busy}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="enq-travellers">
          Travellers
        </label>
        <input
          id="enq-travellers"
          data-testid="enquiry-travellers"
          type="number"
          name="travellers"
          required
          min="1"
          placeholder="2"
          disabled={busy}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClasses} htmlFor="enq-message">
          Message
        </label>
        <textarea
          id="enq-message"
          data-testid="enquiry-message"
          name="message"
          required
          placeholder={`Any preferences or questions about ${tourTitle}?`}
          disabled={busy}
          className={`${inputClasses} min-h-[100px] resize-y`}
        />
      </div>

      {HAS_TURNSTILE && (
        <div className="sm:col-span-2">
          <TurnstileWidget
            ref={turnstileRef}
            onVerify={setToken}
            onExpire={() => setToken(null)}
            onError={() => {
              setToken(null);
              setStatus("error");
              setErrorMsg(VERIFICATION_UNAVAILABLE_ERROR);
            }}
          />
        </div>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={busy || (HAS_TURNSTILE && !token)}
          className="rounded-full bg-terracotta px-7 py-[14px] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Sending..." : "Send Enquiry"}
        </button>
      </div>

      {status === "success" && (
        <div className="text-sm font-semibold text-deep-jungle sm:col-span-2">
          {successMessage}
        </div>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 sm:col-span-2">{errorMsg}</p>
      )}
    </form>
  );
}
