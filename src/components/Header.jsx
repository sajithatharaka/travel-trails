// src/components/Header.jsx
// ------------------------------------------------------------
// Sticky nav bar — shared between the homepage and standalone
// pages (privacy, terms, cookie policy) so navigation is
// consistent site-wide. Links are root-relative ("/#route") so
// they resolve correctly from any page.
//
// Below md, nav links + CTA move into a toggled dropdown panel —
// there isn't room for them in the bar itself, and hiding them
// with no alternative (the old behavior) left mobile visitors
// with no way to navigate at all.
// ------------------------------------------------------------

"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "../../config";

const { brand, nav } = siteConfig;

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-line backdrop-blur-md"
      style={{ background: "oklch(99% 0.005 90 / 0.9)" }}
    >
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 sm:h-[76px] sm:px-8">
        <Link
          href="/"
          onClick={close}
          className="font-serif text-[19px] font-bold text-deep-jungle sm:text-[22px]"
        >
          {brand.name.replace(brand.nameAccentPart, "")}
          <span className="text-terracotta">{brand.nameAccentPart}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href={nav.ctaHref}
          className="hidden items-center rounded-full bg-deep-jungle px-[22px] py-[11px] text-sm font-semibold text-surface transition-opacity hover:opacity-90 md:inline-flex"
        >
          {nav.ctaLabel}
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center text-deep-jungle md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open ? (
              <path
                d="M4 4l14 14M18 4L4 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M2.5 6h17M2.5 11h17M2.5 16h17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-surface px-5 py-4 md:hidden">
          <div className="flex flex-col">
            {nav.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="rounded-lg px-2 py-3 text-[15.5px] font-medium text-ink-soft transition-colors hover:bg-section-tint hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href={nav.ctaHref}
            onClick={close}
            className="mt-2 flex items-center justify-center rounded-full bg-deep-jungle px-6 py-3 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
          >
            {nav.ctaLabel}
          </Link>
        </div>
      )}
    </nav>
  );
}
