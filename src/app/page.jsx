// src/app/page.jsx
// ------------------------------------------------------------
// Travel Trails — The 7-Day Sri Lanka Escape landing page.
// All copy/data comes from /config.js. Colors come from the
// Travel Trails palette wired into tailwind.config.js.
// ------------------------------------------------------------

import { siteConfig } from "../../config";
import { resolveImage } from "@/lib/resolveImage";
import ImageSlot from "@/components/ImageSlot";
import HeroSlider from "@/components/HeroSlider";
import HeroCta from "@/components/HeroCta";
import BookingForm from "@/components/BookingForm";
import FaqAccordion from "@/components/FaqAccordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const { hero, stats, route, itinerary, why, testimonials, pricing, faq, enquiry } =
  siteConfig;

const heroSlidesResolved = hero.slides.map((slide) => ({
  ...slide,
  img: resolveImage(slide.id),
}));
// Once at least one hero photo exists, drop placeholder-only slides from
// the rotation — a flat placeholder card looks broken at full-bleed hero
// size (unlike the smaller itinerary/route slots, where it reads fine).
const heroPhotos = heroSlidesResolved.filter((slide) => slide.img);
const heroSlides = heroPhotos.length > 0 ? heroPhotos : heroSlidesResolved;

const iconShapeClass = {
  circle: "h-5 w-5 rounded-full bg-deep-jungle",
  square: "h-5 w-5 rounded bg-deep-jungle",
  diamond: "h-5 w-5 rotate-45 bg-deep-jungle",
  triangle:
    "h-5 w-5 bg-deep-jungle [clip-path:polygon(50%_0,100%_100%,0_100%)]",
};

export default function Page() {
  return (
    <main>
      {/* ─── NAV ─────────────────────────────────────────── */}
      <Header />

      {/* ─── HERO ────────────────────────────────────────── */}
      <HeroSlider slides={heroSlides}>
        <div
          className="text-[13px] font-semibold uppercase tracking-[.14em]"
          style={{ color: "color-mix(in oklch, #c9682f 65%, white)" }}
        >
          {hero.eyebrow}
        </div>
        <h1 className="my-3 max-w-[820px] font-serif text-[clamp(38px,5.6vw,68px)] font-bold leading-[1.05] text-surface">
          {hero.headline}
        </h1>
        <p
          className="mb-8 max-w-[560px] text-lg leading-relaxed"
          style={{ color: "oklch(94% 0.01 90)" }}
        >
          {hero.subheadline}
        </p>
        <div className="flex flex-wrap gap-4">
          <HeroCta
            href={hero.primaryCta.href}
            label={hero.primaryCta.label}
            prefillMessage={enquiry.bookMessage}
            className="inline-flex items-center rounded-full bg-terracotta px-7 py-[14px] text-[15px] font-semibold text-surface transition-opacity hover:opacity-90"
          />
          <HeroCta
            href={hero.secondaryCta.href}
            label={hero.secondaryCta.label}
            prefillMessage={enquiry.customizeMessage}
            className="inline-flex items-center rounded-full border-[1.5px] px-7 py-[14px] text-[15px] font-semibold text-surface"
            style={{ borderColor: "oklch(99% 0.01 90 / 0.7)" }}
          />
        </div>
      </HeroSlider>

      {/* ─── STATS BAR ───────────────────────────────────── */}
      <div className="bg-deep-jungle py-9">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-6 px-8 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-serif text-[34px] font-bold text-surface">
                {stat.value}
              </div>
              <div
                className="mt-1 text-sm"
                style={{ color: "oklch(85% 0.03 160)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ROUTE ───────────────────────────────────────── */}
      <section id="route" className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-14 max-w-[640px] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
              {route.sectionLabel}
            </p>
            <h2 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
              {route.headline}
            </h2>
            <p className="mt-3.5 text-lg leading-relaxed text-ink-soft">
              {route.subheadline}
            </p>
          </div>
          <div className="grid gap-14 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="aspect-[1100/1872] h-[420px] w-auto justify-self-center overflow-hidden rounded-3xl border border-line md:h-[520px]">
              <ImageSlot
                src={resolveImage("route-map")}
                alt="Sri Lanka route map"
                placeholder={route.mapPlaceholder}
              />
            </div>
            <div className="flex flex-col gap-3.5">
              {route.stops.map((stop) => (
                <a
                  key={stop.num}
                  href={stop.href}
                  className="flex items-center gap-3.5 rounded-2xl border border-line px-4 py-3.5 text-ink transition-colors hover:border-jungle"
                >
                  <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-deep-jungle text-[13px] font-bold text-surface">
                    {stop.num}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold">{stop.name}</div>
                    <div className="text-[13px] text-ink-soft">{stop.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ITINERARY ───────────────────────────────────── */}
      <section id="itinerary" className="bg-section-tint px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-14 max-w-[640px] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
              {itinerary.sectionLabel}
            </p>
            <h2 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
              {itinerary.headline}
            </h2>
            <p className="mt-3.5 text-lg leading-relaxed text-ink-soft">
              {itinerary.subheadline}
            </p>
          </div>

          {itinerary.days.map((day, i) => {
            const imageFirst = i % 2 === 0;
            return (
              <div
                key={day.id}
                id={day.id}
                className="grid scroll-mt-24 grid-cols-1 items-center gap-14 border-b border-line py-14 last:border-b-0 md:grid-cols-2"
              >
                <div
                  className={`aspect-[4/3] overflow-hidden rounded-[20px] ${
                    imageFirst ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <ImageSlot
                    src={resolveImage(day.id)}
                    alt={day.imgPlaceholder}
                    placeholder={day.imgPlaceholder}
                  />
                </div>
                <div className={imageFirst ? "md:order-2" : "md:order-1"}>
                  <span className="mb-4 inline-block rounded-full bg-jungle px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-[.1em] text-surface">
                    {day.num}
                  </span>
                  <h3 className="mb-3.5 font-serif text-[28px] text-ink">
                    {day.title}
                  </h3>
                  <p className="mb-4 text-base leading-relaxed text-ink-soft">
                    {day.desc}
                  </p>
                  {day.experiences.length > 0 && (
                    <>
                      <div
                        className="mb-2.5 text-[13px] font-bold uppercase tracking-[.08em]"
                        style={{ color: "color-mix(in oklch, #c9682f 80%, black)" }}
                      >
                        {day.expLabel}
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
        </div>
      </section>

      {/* ─── WHY ─────────────────────────────────────────── */}
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
                <h4 className="mb-2 font-serif text-lg text-ink">
                  {point.title}
                </h4>
                <p className="text-[14.5px] leading-relaxed text-ink-soft">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────── */}
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
          </div>
          <div className="grid gap-7 md:grid-cols-3">
            {testimonials.items.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-card-jungle p-8 text-surface"
              >
                <div className="mb-3.5 tracking-[2px] text-terracotta">
                  ★★★★★
                </div>
                <p
                  className="mb-6 text-[15.5px] leading-relaxed"
                  style={{ color: "oklch(94% 0.01 90)" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full">
                    <ImageSlot
                      src={resolveImage(t.avatarId)}
                      alt={t.name}
                      placeholder="Guest photo"
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

      {/* ─── PRICING ─────────────────────────────────────── */}
      {pricing.show && (
        <section id="pricing" className="bg-section-tint px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="mx-auto mb-14 max-w-[640px] text-center">
              <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
                {pricing.sectionLabel}
              </p>
              <h2 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
                {pricing.headline}
              </h2>
              <p className="mt-3.5 text-lg leading-relaxed text-ink-soft">
                {pricing.subheadline}
              </p>
            </div>
            <div className="grid items-stretch gap-7 md:grid-cols-3">
              {pricing.tiers.map((tier) => {
                const featured = tier.key === pricing.featuredKey;
                return (
                  <div
                    key={tier.key}
                    className={`relative flex flex-col rounded-[20px] bg-surface px-[30px] py-9 ${
                      featured ? "border-2 border-terracotta md:-translate-y-2.5" : "border border-line"
                    }`}
                  >
                    {featured && (
                      <div className="absolute -top-3.5 left-[30px] rounded-full bg-terracotta px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.06em] text-surface">
                        Most Popular
                      </div>
                    )}
                    <div className="mb-2.5 text-[13px] font-bold uppercase tracking-[.08em] text-jungle">
                      {tier.tier}
                    </div>
                    <div className="mb-1 font-serif text-[38px] text-ink">
                      {tier.price}{" "}
                      <span className="font-sans text-[15px] font-medium text-ink-soft">
                        / person
                      </span>
                    </div>
                    <div className="mb-6 text-[14.5px] leading-snug text-ink-soft">
                      {tier.desc}
                    </div>
                    <ul className="mb-7 flex flex-1 flex-col gap-3">
                      {tier.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex gap-2.5 text-[14.5px] text-ink"
                        >
                          <span className="font-bold text-jungle">✓</span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="#enquiry"
                      className={`rounded-full px-7 py-[14px] text-center text-[15px] font-semibold ${
                        featured
                          ? "bg-terracotta text-surface"
                          : "bg-section-tint text-deep-jungle"
                      }`}
                    >
                      Choose {tier.tier}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ─────────────────────────────────────────── */}
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
          <FaqAccordion items={faq.items} />
        </div>
      </section>

      {/* ─── ENQUIRY ─────────────────────────────────────── */}
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
              {enquiry.contactDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center gap-3.5 text-[15px] text-ink"
                >
                  <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-icon-tint">
                    <div className="h-2 w-2 rounded-full bg-deep-jungle" />
                  </div>
                  {detail.label}
                </div>
              ))}
            </div>
          </div>
          <BookingForm successMessage={enquiry.successMessage} />
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
