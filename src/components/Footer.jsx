// src/components/Footer.jsx
// ------------------------------------------------------------
// Site footer — shared between the homepage and standalone pages
// (privacy, terms, cookie policy). Includes the legal links row
// those pages are linked from.
// ------------------------------------------------------------

import Link from "next/link";
import { siteConfig } from "../../config";

const { brand, footer } = siteConfig;

export default function Footer() {
  return (
    <footer className="bg-deep-jungle px-5 pb-6 pt-10 sm:px-8 sm:pb-7 sm:pt-14">
      <div className="mx-auto max-w-[1180px]">
        <div
          className="flex flex-wrap justify-between gap-8 border-b pb-8"
          style={{ borderColor: "oklch(45% 0.05 160)" }}
        >
          <div>
            <div className="mb-2.5 font-serif text-[22px] text-surface">
              {brand.name.replace(brand.nameAccentPart, "")}
              <span className="text-terracotta">{brand.nameAccentPart}</span>
            </div>
            <p
              className="max-w-[280px] text-[14.5px] leading-relaxed"
              style={{ color: "oklch(80% 0.02 160)" }}
            >
              {footer.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-8 sm:gap-14">
            <div>
              <h5 className="mb-3.5 text-sm uppercase tracking-[.04em] text-surface">
                Explore
              </h5>
              {footer.exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mb-2.5 block text-[14.5px]"
                  style={{ color: "oklch(80% 0.02 160)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <h5 className="mb-3.5 text-sm uppercase tracking-[.04em] text-surface">
                Company
              </h5>
              {footer.companyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mb-2.5 block text-[14.5px]"
                  style={{ color: "oklch(80% 0.02 160)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div>
              <h5 className="mb-3.5 text-sm uppercase tracking-[.04em] text-surface">
                Legal
              </h5>
              {footer.legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mb-2.5 block text-[14.5px]"
                  style={{ color: "oklch(80% 0.02 160)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div
          className="pt-6 text-center text-[13px]"
          style={{ color: "oklch(65% 0.02 160)" }}
        >
          {footer.legal}
        </div>
      </div>
    </footer>
  );
}
