// src/components/GalleryTicker.tsx
// Auto-scrolling gallery strip. A single track pass is padded up to
// MIN_TRACK_TILES and then doubled for a seamless loop; hovering pauses it.
// Clicking a tile opens the full image in a lightbox dialog, mirroring the
// detail dialog in TestimonialsMarquee.

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ImageSlot from "./ImageSlot";

export type GalleryTickerItem = { id: string; src: string; alt: string };

// Minimum tiles in a single track pass. With fewer real images than this the
// track would be narrower than the viewport, so both halves of the seamless
// loop (see `loop` below) show at once and read as accidental duplication.
const MIN_TRACK_TILES = 8;

export default function GalleryTicker({
  items,
}: {
  items: GalleryTickerItem[];
}) {
  const [active, setActive] = useState<GalleryTickerItem | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  if (items.length === 0) return null;

  const repeats = Math.ceil(MIN_TRACK_TILES / items.length);
  const track = Array.from({ length: repeats }, () => items).flat();
  // Doubled so the -50% translate in the `ticker` keyframe lands the second
  // copy exactly where the first started — a seamless, gapless loop.
  const loop = [...track, ...track];
  return (
    <section className="overflow-hidden bg-section-tint py-14">
      <div className="mx-auto mb-8 max-w-[640px] px-5 text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
          The Island
        </p>
        <h2 className="mt-2.5 font-serif text-[clamp(26px,3vw,36px)] leading-tight text-ink">
          A Few Moments From the Trail
        </h2>
      </div>
      <div className="flex w-max gap-4 animate-ticker hover:[animation-play-state:paused]">
        {loop.map((img, i) => (
          <button
            key={`${img.id}-${i}`}
            type="button"
            onClick={() => setActive(img)}
            aria-label={`View larger image: ${img.alt}`}
            data-testid="gallery-image-button"
            className="h-52 w-72 shrink-0 cursor-pointer overflow-hidden rounded-2xl"
          >
            <ImageSlot src={img.src} alt={img.alt} placeholder={img.alt} />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
          onClick={() => setActive(null)}
          data-testid="gallery-dialog-overlay"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.alt}
            onClick={(e) => e.stopPropagation()}
            data-testid="gallery-dialog"
            className="relative inline-block max-w-full"
          >
            {/* Sized to the photo's own rendered box (not a fixed-size
                frame) so the button below tracks its actual corner instead
                of floating over empty letterbox space for narrower images.
                `priority` skips native lazy-loading — with `opacity-0`
                instead of `hidden` the element still has real layout size
                (browsers reserve it from the width/height attributes) so
                the image is free to load while invisible; `display: none`
                would give it no box to become visible in and the image
                would never finish loading. */}
            <Image
              src={active.src}
              alt={active.alt}
              width={1600}
              height={1200}
              sizes="90vw"
              priority
              onLoad={() => setLoaded(true)}
              className={`block h-auto max-h-[85vh] min-h-40 min-w-40 w-auto max-w-[90vw] rounded-2xl object-contain transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
              data-testid="gallery-dialog-image"
            />
            {!loaded && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                data-testid="gallery-dialog-spinner"
              >
                <div
                  aria-label="Loading image"
                  className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"
                />
              </div>
            )}
            {loaded && (
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close image"
                data-testid="gallery-dialog-close"
                className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg leading-none text-ink shadow-lg transition-colors hover:bg-white/90"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
