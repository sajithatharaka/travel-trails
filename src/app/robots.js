// src/app/robots.js
import { siteConfig } from "../../config";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.brand.siteUrl}/sitemap.xml`,
  };
}
