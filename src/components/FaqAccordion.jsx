// src/components/FaqAccordion.jsx
// ------------------------------------------------------------
// Animated FAQ accordion — no external dependencies
// ------------------------------------------------------------

"use client";

import { useState } from "react";

export default function FaqAccordion({ items, accentColor }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="divide-y divide-white/10">
      {items.map((item, i) => (
        <div key={i} className="py-5">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between text-left gap-4 group"
          >
            <span className="text-base font-medium text-white group-hover:opacity-80 transition-opacity">
              {item.q}
            </span>
            <span
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-transform duration-200"
              style={{
                background: `${accentColor}22`,
                color: accentColor,
                transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
              }}
            >
              +
            </span>
          </button>

          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{ maxHeight: openIndex === i ? "300px" : "0px" }}
          >
            <p className="pt-3 text-sm leading-relaxed text-white/50">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
