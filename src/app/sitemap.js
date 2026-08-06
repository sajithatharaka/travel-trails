// src/app/sitemap.js
import { siteConfig } from "../../config";

const { siteUrl } = siteConfig.brand;

export default function sitemap() {
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/cookie-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
