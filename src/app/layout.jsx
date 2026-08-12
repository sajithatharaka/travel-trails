// src/app/layout.jsx
import "./globals.css";
import { siteConfig } from "../../config";
import { resolveImage } from "@/lib/resolveImage";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";

const { brand, seo, hero, itinerary, pricing, enquiry, cookieConsent } = siteConfig;

const title = `${brand.name}| The 7-Day Sri Lanka Escape`;
const description =
  "Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist.";
// Falls back to the route map photo until a dedicated og-image is dropped
// into /public/images — see public/images/README.md.
const ogImage = resolveImage("og-image") || resolveImage("route-map") || seo.ogImage;
const logoImage = resolveImage("travel-trails-logo");

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
    locale: "en_US",
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
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: "#1c3a2c",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: brand.name,
  description,
  url: brand.siteUrl,
  ...(logoImage && { logo: `${brand.siteUrl}${logoImage}`, image: `${brand.siteUrl}${logoImage}` }),
  email: enquiry.contactDetails[0]?.label,
  telephone: enquiry.contactDetails[1]?.label,
  address: {
    "@type": "PostalAddress",
    streetAddress: "362 D/6, New Kandy Road",
    addressLocality: "Delgoda",
    addressCountry: "LK",
  },
  areaServed: {
    "@type": "Country",
    name: "Sri Lanka",
  },
  makesOffer: pricing.tiers.map((tier) => ({
    "@type": "Offer",
    name: tier.tier,
    description: tier.desc,
    price: tier.price.replace(/[^0-9.]/g, ""),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${brand.siteUrl}/#pricing`,
    itemOffered: {
      "@type": "TouristTrip",
      name: hero.headline,
      description: hero.subheadline,
      touristType: "Leisure travellers",
      itinerary: {
        "@type": "ItemList",
        itemListElement: itinerary.days.map((day, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "TouristAttraction",
            name: day.title,
            description: day.desc,
          },
        })),
      },
    },
  })),
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
        <WhatsAppButton
          number={enquiry.whatsappNumber}
          message={enquiry.whatsappMessage}
        />
        <CookieConsent config={cookieConsent} />
      </body>
    </html>
  );
}
