"use client";

import TurnstileWidget from "@/components/TurnstileWidget";
import { HAS_TURNSTILE } from "@/lib/turnstile";
import { useTurnstileSubmit } from "@/components/useTurnstileSubmit";

const GENERIC_ERROR =
  "Sorry, we couldn't send your message just now. Please try again in a moment, or email us directly.";

export default function ContactForm({
  successMessage,
}: {
  successMessage: string;
}) {
  const { status, errorMsg, token, setToken, turnstileRef, handleSubmit } =
    useTurnstileSubmit({
      functionName: "submit-contact",
      genericError: GENERIC_ERROR,
      buildBody: (fd, turnstileToken) => ({
        turnstileToken,
        name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        phone: String(fd.get("phone") ?? "").trim() || null,
        subject: String(fd.get("subject") ?? "").trim() || "General Enquiry",
        message: String(fd.get("message") ?? "").trim(),
      }),
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
        <label className={labelClasses}>Name</label>
        <input data-testid="contact-name" type="text" name="name" required placeholder="Jane Doe" disabled={busy} className={inputClasses} />
      </div>
      <div>
        <label className={labelClasses}>Email</label>
        <input data-testid="contact-email" type="email" name="email" required placeholder="jane@email.com" disabled={busy} className={inputClasses} />
      </div>
      <div>
        <label className={labelClasses}>Phone (optional)</label>
        <input data-testid="contact-phone" type="tel" name="phone" placeholder="+94 …" disabled={busy} className={inputClasses} />
      </div>
      <div>
        <label className={labelClasses}>Subject</label>
        <input data-testid="contact-subject" type="text" name="subject" placeholder="General Enquiry" disabled={busy} className={inputClasses} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClasses}>Message</label>
        <textarea data-testid="contact-message" name="message" required placeholder="How can we help?" disabled={busy} className={`${inputClasses} min-h-[120px] resize-y`} />
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
          {busy ? "Sending..." : "Send Message"}
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
