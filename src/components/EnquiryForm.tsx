// src/components/EnquiryForm.tsx
// ------------------------------------------------------------
// Public tour enquiry form. Solves a Cloudflare Turnstile challenge, then
// POSTs to the submit-booking edge function (which verifies the token and
// writes a booking_requests row with the service role). Used on the homepage
// #enquiry section and on each /tours/[slug] page.
// ------------------------------------------------------------

"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TurnstileWidget, {
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import { PREFILL_MESSAGE_EVENT } from "@/components/HeroCta";
import { HAS_TURNSTILE } from "@/lib/turnstile";
import { resolveEdgeFunctionError } from "@/lib/edgeFunctionError";
import { earliestTravelDate, isFutureTravelDate } from "@/lib/travelDate";
type Status = "idle" | "loading" | "success" | "error";

const GENERIC_ERROR =
  "Sorry, we couldn't send your enquiry just now. Please try again in a moment, or email us directly.";

export default function EnquiryForm({
  successMessage,
  tourId,
  tourSlug,
  tourTitle,
}: {
  successMessage: string;
  tourId?: string;
  tourSlug?: string;
  tourTitle?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [minTravelDate] = useState(earliestTravelDate);
  const turnstileRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    function handlePrefill(e: Event) {
      setMessage(String((e as CustomEvent).detail ?? ""));
    }
    window.addEventListener(PREFILL_MESSAGE_EVENT, handlePrefill);
    return () => window.removeEventListener(PREFILL_MESSAGE_EVENT, handlePrefill);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (HAS_TURNSTILE && !token) {
      setStatus("error");
      setErrorMsg("Please complete the verification challenge.");
      return;
    }

    const travelDate = String(fd.get("travel_date") ?? "");
    if (travelDate && !isFutureTravelDate(travelDate)) {
      setStatus("error");
      setErrorMsg("Please choose a travel date in the future.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const fullName = String(fd.get("name") ?? "").trim();
    const [first_name, ...rest] = fullName.split(/\s+/);

    const supabase = createClient();
    const result = await supabase.functions.invoke("submit-booking", {
      body: {
        turnstileToken: token ?? "",
        tour_id: tourId ?? null,
        tour_slug: tourSlug ?? null,
        tour_title: tourTitle ?? null,
        first_name: first_name || fullName,
        last_name: rest.join(" "),
        email: String(fd.get("email") ?? "").trim(),
        travel_date: travelDate || null,
        travellers: fd.get("travellers")
          ? Number(fd.get("travellers"))
          : null,
        message: String(fd.get("message") ?? "").trim() || null,
      },
    });

    turnstileRef.current?.reset();
    setToken(null);

    const friendlyError = await resolveEdgeFunctionError(result, GENERIC_ERROR);
    if (friendlyError) {
      setStatus("error");
      setErrorMsg(friendlyError);
      return;
    }

    setStatus("success");
    form.reset();
    setMessage("");
  }

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
          Travel Date
        </label>
        <input
          id="enq-date"
          data-testid="enquiry-travel-date"
          type="date"
          name="travel_date"
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
          placeholder={
            tourTitle
              ? `Any preferences or questions about ${tourTitle}?`
              : "Which tour or region are you interested in, and any preferences?"
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={busy}
          className={`${inputClasses} min-h-[100px] resize-y`}
        />
      </div>

      {HAS_TURNSTILE && (
        <div className="sm:col-span-2">
          <TurnstileWidget ref={turnstileRef} onVerify={setToken} onExpire={() => setToken(null)} />
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
