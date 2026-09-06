import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config";
import { listPublishedTours } from "@/lib/tours";
import {
  breadcrumbSchema,
  tourListingSchema,
} from "@/lib/seo/structuredData";
import JsonLd from "@/components/JsonLd";
import TourCard from "@/components/TourCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const description =
  "Browse Travel Trails' private, boutique Sri Lanka itineraries — each one a starting point we tailor to your dates and pace.";

export const metadata: Metadata = {
  title: "Sri Lanka Tours",
  description,
  alternates: { canonical: "/tours" },
};

export default async function ToursIndexPage() {
  const tours = await listPublishedTours();

  const graph = [
    tourListingSchema(tours, { name: "Sri Lanka Tours", description }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Tours", path: "/tours" },
    ]),
  ];

  return (
    <main>
      <JsonLd data={graph} />
      <Header />

      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto mb-14 max-w-[640px] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
              Our Journeys
            </p>
            <h1 className="mt-2.5 font-serif text-[clamp(30px,3.6vw,44px)] leading-tight text-ink">
              Sri Lanka Tours
            </h1>
            <p className="mt-3.5 text-lg leading-relaxed text-ink-soft">
              Every tour below is a starting point — tell us your dates and
              we&rsquo;ll shape it around you.
            </p>
          </div>

          {tours.length === 0 ? (
            <div className="mx-auto max-w-[520px] rounded-2xl border border-line bg-section-tint px-6 py-14 text-center">
              <p className="text-base text-ink-soft">
                Our tours are being finalised. In the meantime,{" "}
                <Link
                  href="/#enquiry"
                  className="font-semibold text-deep-jungle underline"
                >
                  tell us what you have in mind
                </Link>{" "}
                and we&rsquo;ll build an itinerary for you.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              href="/#enquiry"
              className="inline-flex items-center rounded-full bg-deep-jungle px-7 py-[14px] text-[15px] font-semibold text-surface transition-opacity hover:opacity-90"
            >
              {siteConfig.nav.ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
