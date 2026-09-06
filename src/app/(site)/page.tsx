// src/app/(site)/page.tsx
// ------------------------------------------------------------
// Travel Trails homepage. Hero / route / day-by-day itinerary come from the
// "featured" tour in the database (managed at /admin/tours). About / why /
// testimonials / FAQ still come from src/config.ts (Phase 3 moves them to the DB).
// ------------------------------------------------------------

import Link from "next/link";
import { siteConfig } from "@/config";
import { getFeaturedTour, formatPriceFrom } from "@/lib/tours";
import {
  listReviews,
  listSiteFaqs,
  getActiveWelcomeSection,
  listGallery,
} from "@/lib/content";
import { getSiteSettings } from "@/lib/settings";
import { resolveImage } from "@/lib/resolveImage";
import { getInitials } from "@/lib/getInitials";
import { faqSchema, webPageSchema } from "@/lib/seo/structuredData";
import JsonLd from "@/components/JsonLd";
import ImageSlot from "@/components/ImageSlot";
import HeroSlider from "@/components/HeroSlider";
import HeroCta from "@/components/HeroCta";
import EnquiryForm from "@/components/EnquiryForm";
import FaqAccordion from "@/components/FaqAccordion";
import GalleryTicker from "@/components/GalleryTicker";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const { hero, about, why, testimonials, faq, enquiry } = siteConfig;

const iconShapeClass: Record<string, string> = {
  circle: "h-5 w-5 rounded-full bg-deep-jungle",
  square: "h-5 w-5 rounded bg-deep-jungle",
  diamond: "h-5 w-5 rotate-45 bg-deep-jungle",
  triangle:
    "h-5 w-5 bg-deep-jungle [clip-path:polygon(50%_0,100%_100%,0_100%)]",
};

export default async function HomePage() {
  const [tour, reviews, dbFaqs, welcome, gallery, settings] = await Promise.all([
    getFeaturedTour(),
    listReviews(),
    listSiteFaqs(),
    getActiveWelcomeSection(),
    listGallery(),
    getSiteSettings(),
  ]);

  const contactDetails = [
    settings.contact_email,
    settings.contact_phone,
    settings.contact_address,
  ].filter(Boolean);

  // FAQ — DB rows, falling back to the bundled config list.
  const faqItems =
    dbFaqs.length > 0
      ? dbFaqs.map((f) => ({ q: f.question, a: f.answer }))
      : faq.items.map((i) => ({ q: i.q, a: i.a }));

  const homeGraph = [
    webPageSchema({
      path: "/",
      name: `${siteConfig.brand.name} | Private Sri Lanka Journeys`,
      description:
        "Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist.",
      speakableSelectors: ["#about h2", "#about p", "#faq"],
    }),
    faqSchema(faqItems),
  ];

  // Testimonials — reviews table, falling back to config.
  const reviewCards =
    reviews.length > 0
      ? reviews.map((r) => ({
          quote: r.review_text,
          name: r.reviewer_name,
          trip: r.location ?? r.source,
          avatarId: "",
        }))
      : testimonials.items.map((t) => ({
          quote: t.quote,
          name: t.name,
          trip: t.trip,
          avatarId: t.avatarId,
        }));

  // About block — active welcome_section, falling back to config.about.
  const aboutBlock = welcome
    ? {
        label: welcome.badge_text,
        headline: welcome.heading,
        paragraphs: [welcome.paragraph_1, welcome.paragraph_2].filter(Boolean),
        image: welcome.image_1_url || resolveImage("about"),
        imageAlt: welcome.image_1_alt || "About Travel Trails",
      }
    : {
        label: about.sectionLabel,
        headline: about.headline,
        paragraphs: [...about.paragraphs],
        image: resolveImage("about"),
        imageAlt: about.imgPlaceholder,
      };

  const heroEyebrow = tour?.hero_eyebrow || hero.eyebrow;
  const heroHeadline = tour?.hero_headline || hero.headline;
  const heroSub = tour?.hero_subheadline || hero.subheadline;
  const heroImg =
    tour?.cover_image_url || resolveImage(hero.fallbackImageId);

  const primaryCta = tour
    ? { label: "See This Itinerary", href: `/tours/${tour.slug}` }
    : hero.primaryCta;

  const stats: { value: string; label: string }[] = [];
  if (tour) {
    if (tour.duration_days)
      stats.push({ value: String(tour.duration_days), label: "Days on Trail" });
    if (tour.destination_count)
      stats.push({
        value: String(tour.destination_count),
        label: "Destinations",
      });
    if (tour.route_stops.length)
      stats.push({
        value: String(tour.route_stops.length),
        label: "Route Stops",
      });
    const expCount = tour.days.reduce((n, d) => n + d.experiences.length, 0);
    if (expCount)
      stats.push({ value: `${expCount}+`, label: "Experiences" });
  }

  const priceFrom = formatPriceFrom(tour?.price_from_usd);

  return (
    <main>
      <JsonLd data={homeGraph} />

      <Header />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <HeroSlider
        slides={[{ id: "hero", img: heroImg, placeholder: "Sri Lanka" }]}
      >
        <div
          className="text-[13px] font-semibold uppercase tracking-[.14em]"
          style={{ color: "color-mix(in oklch, #c9682f 65%, white)" }}
        >
          {heroEyebrow}
        </div>
        <h1 className="my-3 max-w-[820px] font-serif text-[clamp(38px,5.6vw,68px)] font-bold leading-[1.05] text-surface">
          {heroHeadline}
        </h1>
        {heroSub && (
          <p
            className="mb-8 max-w-[560px] text-lg leading-relaxed"
            style={{ color: "oklch(94% 0.01 90)" }}
          >
            {heroSub}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <HeroCta
            href={primaryCta.href}
            label={primaryCta.label}
            className="inline-flex items-center rounded-full bg-terracotta px-7 py-[14px] text-[15px] font-semibold text-surface transition-opacity hover:opacity-90"
          />
          <HeroCta
            href="#enquiry"
            label="Customize My Trip"
            prefillMessage={enquiry.customizeMessage}
            className="inline-flex items-center rounded-full border-[1.5px] px-7 py-[14px] text-[15px] font-semibold text-surface"
            style={{ borderColor: "oklch(99% 0.01 90 / 0.7)" }}
          />
          {priceFrom && (
            <span className="text-[14px] font-medium text-surface/80">
              {priceFrom} / person
            </span>
          )}
        </div>
      </HeroSlider>

      {/* ─── STATS BAR ────────────────────────────────────── */}
      {stats.length > 0 && (
        <div className="bg-deep-jungle py-9">
          <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-6 px-8 text-center md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-[34px] font-bold text-surface">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm" style={{ color: "oklch(85% 0.03 160)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ABOUT / WELCOME ──────────────────────────────── */}
      <section id="about" className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
              {aboutBlock.label}
            </p>
            <h2 className="mt-2.5 mb-5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
              {aboutBlock.headline}
            </h2>
            <div className="flex flex-col gap-4">
              {aboutBlock.paragraphs.map((p, i) => (
                <p key={i} className="text-base leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-[20px] md:order-2">
            <ImageSlot
              src={aboutBlock.image}
              alt={aboutBlock.imageAlt}
              placeholder={aboutBlock.imageAlt}
            />
          </div>
        </div>
      </section>

      {/* ─── ROUTE ────────────────────────────────────────── */}
      {tour && tour.route_stops.length > 0 && (
        <section id="route" className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="mx-auto mb-14 max-w-[640px] text-center">
              <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
                The Route
              </p>
              <h2 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
                Your Trail Across the Island
              </h2>
            </div>
            <div className="grid gap-14 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div className="aspect-[1100/1400] h-[420px] w-auto justify-self-center overflow-hidden rounded-3xl border border-line md:h-[520px]">
                <ImageSlot
                  src={tour.route_map_image_url || resolveImage("route-map")}
                  alt={`${tour.title} route map`}
                  placeholder="Route map"
                />
              </div>
              <div className="flex flex-col gap-3.5">
                {tour.route_stops.map((stop) => (
                  <a
                    key={stop.id}
                    href={stop.anchor ? `#${stop.anchor}` : undefined}
                    className="flex items-center gap-3.5 rounded-2xl border border-line px-4 py-3.5 text-ink transition-colors hover:border-jungle"
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
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── ITINERARY ────────────────────────────────────── */}
      {tour && tour.days.length > 0 && (
        <section
          id="itinerary"
          className="bg-section-tint px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-[1180px]">
            <div className="mx-auto mb-14 max-w-[640px] text-center">
              <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
                Day by Day
              </p>
              <h2 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
                {tour.title}
              </h2>
              {tour.summary && (
                <p className="mt-3.5 text-lg leading-relaxed text-ink-soft">
                  {tour.summary}
                </p>
              )}
            </div>

            {tour.days.map((day, i) => {
              const imageFirst = i % 2 === 0;
              return (
                <div
                  key={day.id}
                  id={day.anchor ?? undefined}
                  className="grid scroll-mt-24 grid-cols-1 items-center gap-14 border-b border-line py-14 last:border-b-0 md:grid-cols-2"
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
                      <>
                        <div
                          className="mb-2.5 text-[13px] font-bold uppercase tracking-[.08em]"
                          style={{
                            color: "color-mix(in oklch, #c9682f 80%, black)",
                          }}
                        >
                          {day.experiences_label || "Experiences you can enjoy"}
                        </div>
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
                      </>
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

            <div className="pt-12 text-center">
              <Link
                href={`/tours/${tour.slug}`}
                className="inline-flex items-center rounded-full bg-deep-jungle px-7 py-[14px] text-[15px] font-semibold text-surface transition-opacity hover:opacity-90"
              >
                Full tour details
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── GALLERY ──────────────────────────────────────── */}
      {gallery.length > 0 && (
        <GalleryTicker
          items={gallery.map((g) => ({
            id: g.id,
            src: g.image_url as string,
            alt: g.alt_text,
          }))}
        />
      )}

      {/* ─── WHY ──────────────────────────────────────────── */}
      <section id="why" className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-14 max-w-[640px] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
              {why.sectionLabel}
            </p>
            <h2 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
              {why.headline}
            </h2>
            <p className="mt-3.5 text-lg leading-relaxed text-ink-soft">
              {why.subheadline}
            </p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {why.points.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-line px-[26px] py-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-icon-tint">
                  <div className={iconShapeClass[point.shape]} />
                </div>
                <h4 className="mb-2 font-serif text-lg text-ink">{point.title}</h4>
                <p className="text-[14.5px] leading-relaxed text-ink-soft">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────── */}
      <section className="bg-deep-jungle px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-14 max-w-[640px] text-center">
            <p
              className="text-[13px] font-semibold uppercase tracking-[.14em]"
              style={{ color: "color-mix(in oklch, #c9682f 65%, white)" }}
            >
              {testimonials.sectionLabel}
            </p>
            <h2 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-surface">
              {testimonials.headline}
            </h2>
            {testimonials.subheadline && (
              <p
                className="mt-3.5 text-lg leading-relaxed"
                style={{ color: "oklch(85% 0.02 90)" }}
              >
                {testimonials.subheadline}
              </p>
            )}
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {reviewCards.slice(0, 6).map((t) => (
              <div
                key={t.name + t.quote.slice(0, 12)}
                className="rounded-2xl bg-card-jungle p-8 text-surface"
              >
                <div className="mb-3.5 tracking-[2px] text-terracotta">★★★★★</div>
                <p
                  className="mb-6 text-[15.5px] leading-relaxed"
                  style={{ color: "oklch(94% 0.01 90)" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full">
                    <ImageSlot
                      src={t.avatarId ? resolveImage(t.avatarId) : null}
                      alt={t.name}
                      placeholder="Guest photo"
                      initials={getInitials(t.name)}
                      shape="circle"
                    />
                  </div>
                  <div>
                    <div className="text-[14.5px] font-semibold">{t.name}</div>
                    <div
                      className="text-[13px]"
                      style={{ color: "oklch(80% 0.03 160)" }}
                    >
                      {t.trip}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[820px]">
          <div className="mx-auto mb-14 max-w-[640px] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
              {faq.sectionLabel}
            </p>
            <h2 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
              {faq.headline}
            </h2>
            <p className="mt-3.5 text-lg leading-relaxed text-ink-soft">
              {faq.subheadline}
            </p>
          </div>
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* ─── ENQUIRY ──────────────────────────────────────── */}
      <section id="enquiry" className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
              {enquiry.sectionLabel}
            </p>
            <h2 className="my-2.5 font-serif text-[clamp(28px,3.2vw,38px)] text-ink">
              {enquiry.headline}
            </h2>
            <p className="mb-7 text-base leading-relaxed text-ink-soft">
              {enquiry.subheadline}
            </p>
            <div className="flex flex-col gap-4">
              {contactDetails.map((detail) => (
                <div
                  key={detail}
                  className="flex items-center gap-3.5 text-[15px] text-ink"
                >
                  <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-icon-tint">
                    <div className="h-2 w-2 rounded-full bg-deep-jungle" />
                  </div>
                  {detail}
                </div>
              ))}
            </div>
          </div>
          <EnquiryForm
            successMessage={enquiry.successMessage}
            tourId={tour?.id}
            tourSlug={tour?.slug}
            tourTitle={tour?.title}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
