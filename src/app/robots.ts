import type { MetadataRoute } from "next";
import { siteConfig } from "@/config";

const siteUrl = siteConfig.brand.siteUrl.replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
