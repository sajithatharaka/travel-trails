// src/components/GalleryTicker.tsx
// Auto-scrolling gallery strip. Items are duplicated for a seamless loop;
// hovering pauses the animation.

import ImageSlot from "./ImageSlot";

export type GalleryTickerItem = { id: string; src: string; alt: string };

export default function GalleryTicker({
  items,
}: {
  items: GalleryTickerItem[];
}) {
  const loop = [...items, ...items];
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
          <div
            key={`${img.id}-${i}`}
            className="h-52 w-72 shrink-0 overflow-hidden rounded-2xl"
          >
            <ImageSlot src={img.src} alt={img.alt} placeholder={img.alt} />
          </div>
        ))}
      </div>
    </section>
  );
}
