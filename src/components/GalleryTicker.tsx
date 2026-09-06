// src/components/GalleryTicker.tsx
// Auto-scrolling gallery strip. A single track pass is padded up to
// MIN_TRACK_TILES and then doubled for a seamless loop; hovering pauses it.

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
