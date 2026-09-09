"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TurnstileWidget, {
  type TurnstileHandle,
} from "@/components/TurnstileWidget";
import { HAS_TURNSTILE } from "@/lib/turnstile";
import { resolveEdgeFunctionError } from "@/lib/edgeFunctionError";
type Status = "idle" | "loading" | "success" | "error";

const GENERIC_ERROR =
  "Sorry, we couldn't send your message just now. Please try again in a moment, or email us directly.";
const VERIFICATION_UNAVAILABLE_ERROR =
  "Sorry, the verification widget couldn't load. Please refresh the page and try again, or email us directly.";

export default function ContactForm({
  successMessage,
}: {
  successMessage: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (HAS_TURNSTILE && !token) {
      setStatus("error");
      setErrorMsg("Please complete the verification challenge.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const supabase = createClient();
    const result = await supabase.functions.invoke("submit-contact", {
      body: {
        turnstileToken: token ?? "",
        name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        phone: String(fd.get("phone") ?? "").trim() || null,
        subject: String(fd.get("subject") ?? "").trim() || "General Enquiry",
        message: String(fd.get("message") ?? "").trim(),
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
