import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublishedTours, getTourBySlug, formatPriceFrom } from "@/lib/tours";
import { resolveImage } from "@/lib/resolveImage";
import ImageSlot from "@/components/ImageSlot";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateStaticParams() {
  const tours = await listPublishedTours();
  return tours.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Tour not found" };

  const title = tour.meta_title || tour.title;
  const description = tour.meta_description || tour.summary;
  return {
    title,
    description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title,
      description,
      url: `/tours/${tour.slug}`,
      type: "article",
      ...(tour.cover_image_url && { images: [{ url: tour.cover_image_url }] }),
    },
  };
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const priceFrom = formatPriceFrom(tour.price_from_usd);
  const coverImg = tour.cover_image_url || resolveImage("route-map");

  const tripJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.summary,
    ...(tour.duration_days && { duration: `P${tour.duration_days}D` }),
    itinerary: {
      "@type": "ItemList",
      itemListElement: tour.days.map((day, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "TouristAttraction",
          name: day.title,
          description: day.description,
        },
      })),
    },
    ...(priceFrom &&
      tour.price_from_usd != null && {
        offers: {
          "@type": "Offer",
          price: tour.price_from_usd,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      }),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tripJsonLd) }}
      />
      <Header />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[460px] overflow-hidden">
        <ImageSlot
          src={coverImg}
          alt={tour.title}
          placeholder={tour.title}
          sizes="100vw"
          quality={90}
          priority
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(20% 0.04 160 / 0.35) 0%, oklch(15% 0.05 160 / 0.75) 100%)",
          }}
        />
        <div className="relative z-[2] mx-auto flex h-full max-w-[1180px] flex-col justify-end px-5 pb-16 sm:px-8">
          {tour.hero_eyebrow && (
            <div
              className="text-[13px] font-semibold uppercase tracking-[.14em]"
              style={{ color: "color-mix(in oklch, #c9682f 65%, white)" }}
            >
              {tour.hero_eyebrow}
            </div>
          )}
          <h1 className="my-3 max-w-[820px] font-serif text-[clamp(32px,5vw,58px)] font-bold leading-[1.05] text-surface">
            {tour.hero_headline || tour.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-surface">
            {tour.duration_days && (
              <span className="text-[14px] font-medium">
                {tour.duration_days} days
              </span>
            )}
            {priceFrom && (
              <span className="text-[14px] font-medium">
                · {priceFrom} / person
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Summary + CTA */}
      <section className="bg-surface px-5 py-14 sm:px-8">
        <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.4fr_0.6fr] md:items-start">
          <p className="text-lg leading-relaxed text-ink-soft">
            {tour.hero_subheadline || tour.summary}
          </p>
          <Link
            href="/#enquiry"
            className="inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-[14px] text-[15px] font-semibold text-surface transition-opacity hover:opacity-90"
          >
            Enquire about this tour
          </Link>
        </div>
      </section>

      {/* Route */}
      {tour.route_stops.length > 0 && (
        <section className="bg-surface px-5 pb-8 sm:px-8">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="mb-8 font-serif text-[clamp(26px,3vw,36px)] text-ink">
              The Route
            </h2>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {tour.route_stops.map((stop) => (
                <div
                  key={stop.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-line px-4 py-3.5 text-ink"
                >
                  <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-deep-jungle text-[13px] font-bold text-surface">
                    {stop.num}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold">{stop.name}</div>
                    {stop.description && (
                      <div className="text-[13px] text-ink-soft">
                        {stop.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Itinerary */}
      {tour.days.length > 0 && (
        <section className="bg-section-tint px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="mb-8 font-serif text-[clamp(26px,3vw,36px)] text-ink">
              Day by Day
            </h2>
            {tour.days.map((day, i) => {
              const imageFirst = i % 2 === 0;
              return (
                <div
                  key={day.id}
                  className="grid grid-cols-1 items-center gap-14 border-b border-line py-14 last:border-b-0 md:grid-cols-2"
                >
                  <div
                    className={`aspect-[4/3] overflow-hidden rounded-[20px] ${
                      imageFirst ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    <ImageSlot
                      src={day.image_url}
                      alt={day.title}
                      placeholder={day.title}
                    />
                  </div>
                  <div className={imageFirst ? "md:order-2" : "md:order-1"}>
                    <span className="mb-4 inline-block rounded-full bg-jungle px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-[.1em] text-surface">
                      {day.day_label}
                    </span>
                    <h3 className="mb-3.5 font-serif text-[28px] text-ink">
                      {day.title}
                    </h3>
                    {day.description && (
                      <p className="mb-4 text-base leading-relaxed text-ink-soft">
                        {day.description}
                      </p>
                    )}
                    {day.experiences.length > 0 && (
                      <ul className="flex flex-col gap-2.5">
                        {day.experiences.map((exp) => (
                          <li
                            key={exp}
                            className="flex gap-2.5 text-[15.5px] leading-snug text-ink"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-jungle" />
                            {exp}
                          </li>
                        ))}
                      </ul>
                    )}
                    {day.note && (
                      <div className="mt-[18px] border-l-2 border-terracotta pl-3 text-[14.5px] italic text-ink-soft">
                        {day.note}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="bg-surface px-5 py-16 text-center sm:px-8">
        <Link
          href="/#enquiry"
          className="inline-flex items-center rounded-full bg-deep-jungle px-8 py-4 text-[15px] font-semibold text-surface transition-opacity hover:opacity-90"
        >
          Plan this trip with us
        </Link>
      </section>

      <Footer />
    </main>
  );
}
