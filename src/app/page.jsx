// src/app/page.jsx
// ------------------------------------------------------------
// Landing page — all copy/colors come from /config.js
// Sections: Hero → Why → Roadmap → FAQ → Footer CTA
// ------------------------------------------------------------

import { siteConfig } from "../../config";
import EmailForm from "@/components/EmailForm";
import FaqAccordion from "@/components/FaqAccordion";

const { brand, hero, why, roadmap, faq, socialProof, footer } = siteConfig;

// Status badge styles for roadmap phases
const statusStyles = {
  Shipped: { bg: "#22c55e20", text: "#22c55e", label: "✓ Shipped" },
  "In Progress": { bg: "#f59e0b20", text: "#f59e0b", label: "⚡ In Progress" },
  Planned: { bg: "#ffffff15", text: "#ffffff60", label: "○ Planned" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ─── NAV ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span>{brand.logoEmoji}</span>
            <span>{brand.name}</span>
          </span>
          {/* Scroll-to-waitlist link */}
          <a
            href="#waitlist"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: brand.accentColor }}
          >
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-24 text-center">
        {/* Ambient glow behind hero */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
          style={{ background: brand.accentColor }}
        />

        <div className="relative mx-auto max-w-3xl">
          {/* Badge */}
          {hero.badge && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-white/60">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: brand.accentColor }}
              />
              {hero.badge}
            </div>
          )}

          <h1 className="mb-5 text-5xl font-black leading-tight tracking-tight md:text-6xl">
            {hero.headline}
          </h1>

          <p className="mx-auto mb-4 max-w-xl text-lg leading-relaxed text-white/50">
            {brand.description}
          </p>

          <p className="mb-10 text-base text-white/40">{hero.subheadline}</p>

          {/* Email capture */}
          <div id="waitlist" className="mx-auto max-w-xl">
            <EmailForm
              placeholder={hero.ctaPlaceholder}
              buttonText={hero.ctaButton}
              successMsg={hero.successMessage}
              accentColor={brand.accentColor}
              size="lg"
            />
            <p className="mt-3 text-xs text-white/25">
              No spam. No credit card. Unsubscribe any time.
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHY ─────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          {/* Section label */}
          <p
            className="mb-3 text-xs font-bold tracking-widest uppercase"
            style={{ color: brand.accentColor }}
          >
            {why.sectionLabel}
          </p>
          <h2 className="mb-12 text-3xl font-bold md:text-4xl">{why.headline}</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {why.points.map((point, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition-all hover:border-white/10 hover:bg-white/[0.05]"
              >
                <div className="mb-4 text-3xl">{point.emoji}</div>
                <h3 className="mb-2 text-base font-semibold">{point.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROADMAP ─────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p
            className="mb-3 text-xs font-bold tracking-widest uppercase"
            style={{ color: brand.accentColor }}
          >
            {roadmap.sectionLabel}
          </p>
          <h2 className="mb-12 text-3xl font-bold md:text-4xl">
            {roadmap.headline}
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {roadmap.phases.map((phase, i) => {
              const style = statusStyles[phase.status] || statusStyles["Planned"];
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-white/[0.03] p-6"
                >
                  {/* Phase header */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/30">
                      {phase.phase}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {style.label}
                    </span>
                  </div>

                  <h3 className="mb-1 text-base font-semibold">{phase.title}</h3>
                  <p className="mb-4 text-xs text-white/30">{phase.quarter}</p>

                  <ul className="space-y-2">
                    {phase.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-white/50"
                      >
                        <span style={{ color: brand.accentColor }} className="mt-0.5 shrink-0">
                          →
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF (hidden if no testimonials) ────── */}
      {socialProof.testimonials.length > 0 && (
        <section className="border-t border-white/5 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              {socialProof.headline}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {socialProof.testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-white/[0.03] p-6"
                >
                  <p className="mb-4 text-sm leading-relaxed text-white/60">
                    "{t.quote}"
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ─────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <p
            className="mb-3 text-xs font-bold tracking-widest uppercase"
            style={{ color: brand.accentColor }}
          >
            {faq.sectionLabel}
          </p>
          <h2 className="mb-10 text-3xl font-bold md:text-4xl">{faq.headline}</h2>
          <FaqAccordion items={faq.items} accentColor={brand.accentColor} />
        </div>
      </section>

      {/* ─── FOOTER CTA ──────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            {footer.ctaHeadline}
          </h2>
          <p className="mb-10 text-white/40">{footer.ctaSubline}</p>
          <EmailForm
            placeholder={hero.ctaPlaceholder}
            buttonText={hero.ctaButton}
            successMsg={hero.successMessage}
            accentColor={brand.accentColor}
            size="sm"
          />
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-xs text-white/20 sm:flex-row">
          <span>{footer.legal}</span>
          {footer.links.length > 0 && (
            <div className="flex gap-6">
              {footer.links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="hover:text-white/50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>
    </main>
  );
}
