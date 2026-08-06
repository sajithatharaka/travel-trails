// src/app/layout.jsx
import "./globals.css";
import { siteConfig } from "../../config";
import { resolveImage } from "@/lib/resolveImage";
import CookieConsent from "@/components/CookieConsent";

const { brand, seo, hero, enquiry, cookieConsent } = siteConfig;

const title = `${brand.name} — The 7-Day Sri Lanka Escape`;
const description =
  "Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist.";
// Falls back to the route map photo until a dedicated og-image is dropped
// into /public/images — see public/images/README.md.
const ogImage = resolveImage("og-image") || resolveImage("route-map") || seo.ogImage;

export const metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: title,
    template: seo.titleTemplate,
  },
  description,
  keywords: seo.keywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: brand.name,
    title,
    description,
    images: [{ url: ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: brand.name,
  description,
  url: brand.siteUrl,
  email: enquiry.contactDetails[0]?.label,
  telephone: enquiry.contactDetails[1]?.label,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Colombo",
    addressCountry: "LK",
  },
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "TouristTrip",
      name: hero.headline,
      description: hero.subheadline,
      touristType: "Leisure travellers",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <CookieConsent config={cookieConsent} />
      </body>
    </html>
  );
}
