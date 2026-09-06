// ------------------------------------------------------------
// Global 404. Next renders this (inside the root layout) whenever a route
// calls notFound() or no segment matches — e.g. an unpublished / deleted
// tour or blog slug. Branded, with links back into the site so crawlers and
// visitors can recover instead of hitting a dead end.
// ------------------------------------------------------------

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Browse tours" },
  { href: "/blog", label: "Read the blog" },
  { href: "/contact", label: "Contact us" },
];

export default function NotFound() {
  return (
    <main>
      <Header />
      <section className="bg-surface px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-[560px] text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[.14em] text-terracotta">
            404
          </p>
          <h1 className="mt-2.5 font-serif text-[clamp(30px,4vw,44px)] leading-tight text-ink">
            This trail doesn&rsquo;t exist
          </h1>
          <p className="mt-3.5 text-lg leading-relaxed text-ink-soft">
            The page you were looking for may have moved or been unpublished.
            Try one of these instead:
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center rounded-full border border-line px-5 py-2.5 text-[14px] font-semibold text-deep-jungle transition-colors hover:border-jungle"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
