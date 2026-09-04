import "./globals.css";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config";
import { resolveImage } from "@/lib/resolveImage";
import { Toaster } from "@/components/ui/sonner";

const { brand, seo, enquiry } = siteConfig;

const title = `${brand.name} | Private Sri Lanka Journeys`;
const description =
  "Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist.";

const ogImage =
  resolveImage("og-image") || resolveImage("route-map") || seo.ogImage;
const logoImage = resolveImage("travel-trails-logo");

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: { default: title, template: seo.titleTemplate },
  description,
  keywords: [...seo.keywords],
  alternates: { canonical: "/" },
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

export const viewport: Viewport = {
  themeColor: "#1c3a2c",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: brand.name,
  description,
  url: brand.siteUrl,
  ...(logoImage && {
    logo: `${brand.siteUrl}${logoImage}`,
    image: `${brand.siteUrl}${logoImage}`,
  }),
  email: enquiry.contactDetails[0]?.label,
  telephone: enquiry.contactDetails[1]?.label,
  address: {
    "@type": "PostalAddress",
    streetAddress: "362 D/6, New Kandy Road",
    addressLocality: "Delgoda",
    addressCountry: "LK",
  },
  areaServed: { "@type": "Country", name: "Sri Lanka" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
