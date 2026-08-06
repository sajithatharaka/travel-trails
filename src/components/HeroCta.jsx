// src/components/HeroCta.jsx
// ------------------------------------------------------------
// Both hero buttons ("Book This Itinerary" and "Customize My Trip")
// use this. A plain anchor would just smooth-scroll to the enquiry
// form (globals.css sets scroll-behavior: smooth) — this wraps it in
// a client component so the click can also broadcast a
// "prefill-message" event, which BookingForm listens for to pre-fill
// its message field with copy appropriate to which button was
// clicked. Same-page only: hero and form always render together, so
// BookingForm is already mounted by click time.
// ------------------------------------------------------------

"use client";

export const PREFILL_MESSAGE_EVENT = "prefill-message";

export default function HeroCta({ label, href, prefillMessage, className, style }) {
  function handleClick() {
    window.dispatchEvent(
      new CustomEvent(PREFILL_MESSAGE_EVENT, { detail: prefillMessage })
    );
  }

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {label}
    </a>
  );
}
