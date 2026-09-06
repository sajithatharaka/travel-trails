import type { MetadataRoute } from "next";
import { siteConfig } from "@/config";

// Web app manifest — lets the site be installed / added to a home screen and
// gives Android/Chrome a name, colours and icon. Referenced automatically by
// Next as <link rel="manifest">.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.brand.name} — Private Sri Lanka Journeys`,
    short_name: siteConfig.brand.name,
    description:
      "Private, boutique journeys across Sri Lanka. Planned by locals, for travellers who want more than a checklist.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1c3a2c",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
    ],
  };
}
