// src/components/TestimonialsMarquee.tsx
// ------------------------------------------------------------
// Auto-scrolling strip of guest testimonials, mirroring GalleryTicker:
// a single track pass is padded up to MIN_TRACK_CARDS then doubled for a
// seamless loop, and hovering pauses it. Cards are a fixed size — long
// quotes are clipped to PREVIEW_CHAR_LIMIT with a "See more" affordance
// that opens the full testimonial in a dialog.
// ------------------------------------------------------------

"use client";

import { useEffect, useState } from "react";
import ImageSlot from "./ImageSlot";
import { getInitials } from "@/lib/getInitials";

export type TestimonialMarqueeItem = {
  quote: string;
  name: string;
  trip: string;
  avatar: string | null;
};

// Longer quotes are clipped to this many characters so every card is the
// same height and the track never reflows mid-scroll.
const PREVIEW_CHAR_LIMIT = 168;

// Minimum cards in a single track pass. With fewer real testimonials than
// this the track would be narrower than the viewport, so both halves of the
// seamless loop (see `loop` below) show at once and read as duplication.
const MIN_TRACK_CARDS = 6;

function clipQuote(text: string) {
  if (text.length <= PREVIEW_CHAR_LIMIT) {
    return { preview: text, clipped: false };
  }
  return {
    preview: `${text.slice(0, PREVIEW_CHAR_LIMIT).trimEnd()}…`,
    clipped: true,
  };
}

function Stars() {
  return (
    <div className="mb-3 tracking-[2px] text-terracotta" aria-hidden>
      ★★★★★
    </div>
  );
}

function Attribution({
  item,
  size,
}: {
  item: TestimonialMarqueeItem;
  size: "card" | "dialog";
}) {
  const avatar = size === "dialog" ? "h-11 w-11" : "h-10 w-10";
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className={`${avatar} shrink-0 overflow-hidden rounded-full`}>
        <ImageSlot
          src={item.avatar}
          alt={item.name}
          placeholder="Guest photo"
          initials={getInitials(item.name)}
          shape="circle"
        />
      </div>
      <div>
        <div className="text-[14.5px] font-semibold">{item.name}</div>
        <div className="text-[13px]" style={{ color: "oklch(80% 0.03 160)" }}>
          {item.trip}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsMarquee({
  items,
}: {
  items: TestimonialMarqueeItem[];
}) {
  const [active, setActive] = useState<TestimonialMarqueeItem | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  if (items.length === 0) return null;

  const repeats = Math.ceil(MIN_TRACK_CARDS / items.length);
  const track = Array.from({ length: repeats }, () => items).flat();
  // Doubled so the -50% translate in the `ticker` keyframe lands the second
  // copy exactly where the first started — a seamless, gapless loop.
  const loop = [...track, ...track];

  return (
    <>
      <div
        className="flex w-max gap-6 px-5 animate-ticker hover:[animation-play-state:paused] sm:px-8"
        data-testid="testimonials-marquee"
      >
        {loop.map((item, i) => {
          const { preview, clipped } = clipQuote(item.quote);
          return (
            <button
              key={`${item.name}-${i}`}
              type="button"
              onClick={() => setActive(item)}
              aria-label={`Read ${item.name}'s full review`}
              data-testid="testimonial-card"
              className="flex h-64 w-80 shrink-0 cursor-pointer flex-col rounded-2xl bg-card-jungle p-7 text-left text-surface transition-transform duration-200 hover:-translate-y-1"
            >
              <Stars />
              <p
                className="flex-1 overflow-hidden text-[15px] leading-relaxed"
                style={{ color: "oklch(94% 0.01 90)" }}
              >
                &ldquo;{preview}&rdquo;
              </p>
              {clipped && (
                <span className="mt-2 text-[13px] font-semibold text-terracotta">
                  See more
                </span>
              )}
              <Attribution item={item} size="card" />
            </button>
          );
        })}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
          onClick={() => setActive(null)}
          data-testid="testimonial-dialog-overlay"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${active.name}'s review`}
            onClick={(e) => e.stopPropagation()}
            data-testid="testimonial-dialog"
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card-jungle p-8 text-surface shadow-xl"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close review"
              data-testid="testimonial-dialog-close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg leading-none text-surface transition-colors hover:bg-white/20"
            >
              ×
            </button>
            <Stars />
            <p
              className="text-[16px] leading-relaxed"
              style={{ color: "oklch(94% 0.01 90)" }}
            >
              &ldquo;{active.quote}&rdquo;
            </p>
            <Attribution item={active} size="dialog" />
          </div>
        </div>
      )}
    </>
  );
}
