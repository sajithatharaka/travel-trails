import type { Metadata } from "next";
import { siteConfig } from "@/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

const { enquiry } = siteConfig;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Travel Trails about a Sri Lanka itinerary, a custom trip, or anything else.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <Header />
      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
              Contact
            </p>
            <h1 className="my-2.5 font-serif text-[clamp(28px,3.4vw,40px)] text-ink">
              Talk to a real person
            </h1>
            <p className="mb-7 text-base leading-relaxed text-ink-soft">
              Planning a trip, mid-itinerary, or just have a question? Send us a
              message and we&rsquo;ll reply within 24 hours.
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
          <ContactForm successMessage={enquiry.successMessage} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
