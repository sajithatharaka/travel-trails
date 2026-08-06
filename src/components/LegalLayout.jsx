// src/components/LegalLayout.jsx
// ------------------------------------------------------------
// Shared shell for standalone legal pages (privacy, terms,
// cookie policy) — header, title block and footer, with prose
// content passed in as children (see .legal-content in globals.css).
// ------------------------------------------------------------

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LegalLayout({ title, lastUpdated, children }) {
  return (
    <main>
      <Header />
      <section className="bg-surface px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[760px]">
          <h1 className="mb-2 font-serif text-[clamp(30px,4vw,44px)] leading-tight text-ink">
            {title}
          </h1>
          <p className="mb-10 text-[13px] font-semibold uppercase tracking-[.1em] text-terracotta">
            Last updated: {lastUpdated}
          </p>
          <div className="legal-content">{children}</div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
