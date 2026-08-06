// src/components/EmailForm.jsx
// ------------------------------------------------------------
// Reusable email capture form — used in Hero and Footer CTA
// Props:
//   placeholder  : string  (from config)
//   buttonText   : string  (from config)
//   successMsg   : string  (from config)
//   accentColor  : string  (hex, from config)
//   size         : "lg" | "sm"  (lg = hero, sm = footer)
// ------------------------------------------------------------

"use client";

import { useState, useTransition } from "react";
import { captureEmail } from "@/lib/actions";

export default function EmailForm({
  placeholder = "Enter your email",
  buttonText = "Join Waitlist",
  successMsg = "🎉 You're on the list!",
  accentColor = "#6366f1",
  size = "lg",
}) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const isLg = size === "lg";

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.target);

    startTransition(async () => {
      const result = await captureEmail(formData);

      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(result.error || "Something went wrong.");
      }
    });
  }

  if (status === "success") {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${
          isLg ? "text-lg" : "text-sm"
        }`}
        style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}15` }}
      >
        <span className="text-xl">✓</span>
        <span className="font-medium">{successMsg}</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder={placeholder}
          disabled={isPending}
          className={`flex-1 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 
            focus:outline-none focus:ring-2 transition-all
            ${isLg ? "px-5 py-4 text-base" : "px-4 py-3 text-sm"}
            disabled:opacity-50`}
          style={{ focusBorderColor: accentColor }}
        />
        <button
          type="submit"
          disabled={isPending}
          className={`rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95
            ${isLg ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"}
            disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
          style={{ backgroundColor: accentColor }}
        >
          {isPending ? "Joining..." : buttonText}
        </button>
      </form>

      {status === "error" && (
        <p className="mt-2 text-sm text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
