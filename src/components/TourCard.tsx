// src/components/TourCard.tsx
// ------------------------------------------------------------
// One tour tile: cover photo, duration/destination eyebrow, title, summary,
// "from $X" and a "View itinerary →" affordance. Links to /tours/<slug>.
// Used by the tours index grid and the homepage "featured trails" grid — the
// parent owns the surrounding grid/width classes.
// ------------------------------------------------------------

import Link from "next/link";
import type { TourWithChildren } from "@/lib/tours";
import { formatPriceFrom } from "@/lib/tours";
import { resolveImage } from "@/lib/resolveImage";
import ImageSlot from "@/components/ImageSlot";

export default function TourCard({ tour }: { tour: TourWithChildren }) {
  const priceFrom = formatPriceFrom(tour.price_from_usd);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      data-testid={`tour-card-${tour.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <ImageSlot
          src={tour.cover_image_url || resolveImage("route-map")}
          alt={tour.title}
          placeholder={tour.title}
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] font-semibold uppercase tracking-[.08em] text-ink-soft">
          {tour.duration_days && <span>{tour.duration_days} days</span>}
          {tour.destination_count && (
            <span>· {tour.destination_count} destinations</span>
          )}
        </div>
        <h2 className="mb-2 font-serif text-[22px] leading-tight text-ink">
          {tour.title}
        </h2>
        <p className="mb-4 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
          {tour.summary}
        </p>
        <div className="flex items-center justify-between">
          {priceFrom && (
            <span className="text-[14px] font-semibold text-deep-jungle">
              {priceFrom}
            </span>
          )}
          <span className="text-[14px] font-semibold text-terracotta group-hover:underline">
            View itinerary →
          </span>
        </div>
      </div>
    </Link>
  );
}
