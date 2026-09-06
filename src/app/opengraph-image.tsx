// ------------------------------------------------------------
// Site-wide social share image — generated 1200×630 PNG.
//
// Next renders this for `og:image` / `twitter:image` on every public route
// that doesn't set its own (home, /tours, /blog, /contact, legal pages).
// Tour and blog detail pages pass their own cover photo and fall back to
// this via SITE_OG_IMAGE (src/lib/seo/openGraph.ts).
//
// Kept deliberately typographic (no external fonts / images) so it builds
// with zero network access. See docs/requirements/seo-metadata-og-images.md.
// ------------------------------------------------------------

import { ImageResponse } from "next/og";
import { siteConfig } from "@/config";
import { OG_IMAGE_ALT } from "@/lib/seo/openGraph";

export const alt = OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DEEP_JUNGLE = "#1c3a2c";
const TERRACOTTA = "#c9682f";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: DEEP_JUNGLE,
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(201,104,47,0.28) 0%, rgba(28,58,44,0) 55%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#e8a274",
          }}
        >
          Private Sri Lanka Journeys
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", fontSize: 118, fontWeight: 700, lineHeight: 1 }}>
            {siteConfig.brand.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              lineHeight: 1.35,
              maxWidth: "820px",
              color: "rgba(255,255,255,0.82)",
            }}
          >
            Boutique journeys planned by locals — for travellers who want more
            than a checklist.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              width: "56px",
              height: "6px",
              backgroundColor: TERRACOTTA,
              borderRadius: "3px",
            }}
          />
          <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.6)" }}>
            {new URL(siteConfig.brand.siteUrl).host}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
