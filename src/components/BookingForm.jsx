// src/components/BookingForm.jsx
// ------------------------------------------------------------
// Trip enquiry form — sends an email notification directly from
// the browser via Web3Forms (https://web3forms.com). No database,
// no server route, no backend of any kind: the fetch call below
// goes straight from the client to Web3Forms' public API, which
// emails the submission to the inbox tied to the access key.
//
// Setup: get a free access key at https://web3forms.com (just an
// email address, no account needed) and put it in .env.local as
// NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY. It's safe to expose client-side
// by design — Web3Forms rate-limits and domain-locks the key.
// ------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import { PREFILL_MESSAGE_EVENT } from "./HeroCta";

const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

export default function BookingForm({ successMessage }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    function handlePrefillMessage(e) {
      setMessage(e.detail);
    }
    window.addEventListener(PREFILL_MESSAGE_EVENT, handlePrefillMessage);
    return () =>
      window.removeEventListener(PREFILL_MESSAGE_EVENT, handlePrefillMessage);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!ACCESS_KEY) {
      setStatus("error");
      setErrorMsg(
        "Enquiry form isn't configured yet — missing NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY."
      );
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const form = e.target;
    const formData = new FormData(form);
    formData.append("access_key", ACCESS_KEY);
    formData.append("subject", "New trip enquiry — Travel Trails");
    formData.append("from_name", "Travel Trails website");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        setStatus("success");
        form.reset();
        setMessage("");
      } else {
        setStatus("error");
        setErrorMsg(result.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't reach the server. Please try again.");
    }
  }

  const inputClasses =
    "w-full rounded-[10px] border border-line bg-surface px-4 py-[13px] text-[14.5px] text-ink placeholder-ink-soft/60 outline-none transition-colors focus:border-terracotta disabled:opacity-50";
  const labelClasses = "mb-2 block text-[13px] font-semibold text-ink-soft";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-5 rounded-[20px] bg-section-tint p-6 sm:grid-cols-2 sm:p-10"
    >
      <div>
        <label className={labelClasses}>Full Name</label>
        <input
          type="text"
          name="name"
          required
          placeholder="Jane Doe"
          disabled={status === "loading"}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="jane@email.com"
          disabled={status === "loading"}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Travel Date</label>
        <input
          type="date"
          name="travel_date"
          disabled={status === "loading"}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Travellers</label>
        <input
          type="number"
          name="travellers"
          min="1"
          placeholder="2"
          disabled={status === "loading"}
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClasses}>Message</label>
        <textarea
          name="message"
          placeholder="Any preferences or questions about the itinerary?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "loading"}
          className={`${inputClasses} min-h-[100px] resize-y`}
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-terracotta px-7 py-[14px] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Send Enquiry"}
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
