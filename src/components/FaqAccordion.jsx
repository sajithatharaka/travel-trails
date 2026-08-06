// src/components/FaqAccordion.jsx
// ------------------------------------------------------------
// Expand/collapse FAQ list — no external dependencies.
// ------------------------------------------------------------

"use client";

import { useState } from "react";

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className="px-5 py-5 sm:px-6">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-[15px] font-semibold text-ink sm:text-[15.5px]">
                {item.q}
              </span>
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-icon-tint text-sm font-bold text-deep-jungle transition-transform duration-200"
                style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
              >
                +
              </span>
            </button>
            {open && (
              <p className="pt-3 text-[14.5px] leading-relaxed text-ink-soft">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
