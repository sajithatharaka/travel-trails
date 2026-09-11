// src/components/GeneralEnquiryForm.tsx
// ------------------------------------------------------------
// Public "get in touch" form for the homepage #enquiry section. Tour-free:
// it POSTs to the submit-contact edge function, which writes a
// contact_submissions row — no tour context is attached. The hero
// "Customize My Trip" CTA prefills the message via PREFILL_MESSAGE_EVENT.
// Tour-specific enquiries use EnquiryForm on the /tours/[slug] pages instead.
// ------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";
import { PREFILL_MESSAGE_EVENT } from "@/components/HeroCta";
import { HAS_TURNSTILE } from "@/lib/turnstile";
import { useTurnstileSubmit } from "@/components/useTurnstileSubmit";

const GENERIC_ERROR =
  "Sorry, we couldn't send your enquiry just now. Please try again in a moment, or email us directly.";

const SUBJECT = "Website enquiry";

export default function GeneralEnquiryForm({
  successMessage,
}: {
  successMessage: string;
}) {
  const [message, setMessage] = useState("");

  const { status, errorMsg, token, setToken, turnstileRef, handleSubmit } =
    useTurnstileSubmit({
      functionName: "submit-contact",
      genericError: GENERIC_ERROR,
      buildBody: (fd, turnstileToken) => ({
        turnstileToken,
        name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        phone: String(fd.get("phone") ?? "").trim() || null,
        subject: SUBJECT,
        message: String(fd.get("message") ?? "").trim(),
      }),
      onSuccess: () => setMessage(""),
    });

  useEffect(() => {
    function handlePrefill(e: Event) {
      setMessage(String((e as CustomEvent).detail ?? ""));
    }
    window.addEventListener(PREFILL_MESSAGE_EVENT, handlePrefill);
    return () => window.removeEventListener(PREFILL_MESSAGE_EVENT, handlePrefill);
  }, []);

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
        <label className={labelClasses} htmlFor="gen-name">
          Full Name
        </label>
        <input
          id="gen-name"
          data-testid="general-enquiry-name"
          type="text"
          name="name"
          required
          placeholder="Jane Doe"
          disabled={busy}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="gen-email">
          Email
        </label>
        <input
          id="gen-email"
          data-testid="general-enquiry-email"
          type="email"
          name="email"
          required
          placeholder="jane@email.com"
          disabled={busy}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClasses} htmlFor="gen-phone">
          Phone (optional)
        </label>
        <input
          id="gen-phone"
          data-testid="general-enquiry-phone"
          type="tel"
          name="phone"
          placeholder="+94 …"
          disabled={busy}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClasses} htmlFor="gen-message">
          Message
        </label>
        <textarea
          id="gen-message"
          data-testid="general-enquiry-message"
          name="message"
          required
          placeholder="Which tour or region are you interested in, and any preferences?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={busy}
          className={`${inputClasses} min-h-[120px] resize-y`}
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
