import "./globals.css";
import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config";
import { resolveImage } from "@/lib/resolveImage";
import { organizationSchema, webSiteSchema } from "@/lib/seo/structuredData";
import JsonLd from "@/components/JsonLd";
import { Toaster } from "@/components/ui/sonner";

const { brand, seo } = siteConfig;

const title = `${brand.name} | Private Sri Lanka Journeys`;
const description =
  "Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist.";

const logoImage = resolveImage("travel-trails-logo");

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: { default: title, template: seo.titleTemplate },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: brand.name,
    title,
    description,
    locale: "en_US",
    // og:image comes from src/app/opengraph-image.tsx (generated 1200×630).
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    // twitter:image comes from src/app/twitter-image.tsx.
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

const siteGraph = [organizationSchema(logoImage), webSiteSchema()];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <JsonLd data={siteGraph} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
