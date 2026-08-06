// src/components/CookieConsent.jsx
// ------------------------------------------------------------
// Bottom-of-screen cookie notice. Choice is remembered in
// localStorage so the banner only shows once per browser.
// ------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "travel-trails-cookie-consent";

export default function CookieConsent({ config }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function respond(value) {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-surface px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:px-6 sm:py-5">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4">
        <p className="max-w-[720px] text-[13.5px] leading-relaxed text-ink-soft sm:text-[14px]">
          {config.message}{" "}
          <Link
            href={config.policyLinkHref}
            className="font-semibold text-deep-jungle underline"
          >
            {config.policyLinkLabel}
          </Link>
          .
        </p>
        <div className="flex w-full shrink-0 gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => respond("declined")}
            className="flex-1 rounded-full border border-line px-5 py-2.5 text-[13.5px] font-semibold text-ink-soft transition-colors hover:border-jungle sm:flex-none"
          >
            {config.declineLabel}
          </button>
          <button
            type="button"
            onClick={() => respond("accepted")}
            className="flex-1 rounded-full bg-deep-jungle px-5 py-2.5 text-[13.5px] font-semibold text-surface transition-opacity hover:opacity-90 sm:flex-none"
          >
            {config.acceptLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
