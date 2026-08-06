// src/components/HeroSlider.jsx
// ------------------------------------------------------------
// Full-height hero with auto-rotating background slides + dot nav.
// ------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import ImageSlot from "./ImageSlot";

export default function HeroSlider({ slides, children }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[92vh] min-h-[640px] overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <ImageSlot
            src={slide.img}
            alt={slide.placeholder}
            placeholder={slide.placeholder}
            preload={i === 0}
            sizes="100vw"
            quality={90}
            imgClassName="scale-110"
          />
        </div>
      ))}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(20% 0.04 160 / 0.35) 0%, oklch(18% 0.05 160 / 0.55) 60%, oklch(15% 0.05 160 / 0.75) 100%)",
        }}
      />

      <div className="relative z-[2] mx-auto flex h-full max-w-[1180px] flex-col justify-end px-5 pb-28 sm:px-8 sm:pb-[140px]">
        {children}
      </div>

      <div className="absolute bottom-5 right-5 z-[3] flex gap-2 sm:bottom-7 sm:right-8">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            className="h-2 cursor-pointer transition-all duration-200"
            style={{
              width: i === index ? "22px" : "8px",
              borderRadius: i === index ? "4px" : "9999px",
              background: i === index ? "#ffffff" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
