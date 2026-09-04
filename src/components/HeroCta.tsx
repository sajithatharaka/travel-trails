// src/components/HeroCta.tsx
// ------------------------------------------------------------
// Hero buttons. Wraps a smooth-scroll anchor so the click can also
// broadcast a "prefill-message" event that BookingForm listens for.
// ------------------------------------------------------------

"use client";

export const PREFILL_MESSAGE_EVENT = "prefill-message";

export default function HeroCta({
  label,
  href,
  prefillMessage,
  className,
  style,
}: {
  label: string;
  href: string;
  prefillMessage?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  function handleClick() {
    if (prefillMessage === undefined) return;
    window.dispatchEvent(
      new CustomEvent(PREFILL_MESSAGE_EVENT, { detail: prefillMessage }),
    );
  }

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {label}
    </a>
  );
}
