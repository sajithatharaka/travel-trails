import type { MetadataRoute } from "next";
import { siteConfig } from "@/config";
import { listPublishedTours } from "@/lib/tours";

const { siteUrl } = siteConfig.brand;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const tours = await listPublishedTours();

  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/tours`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...tours.map((tour) => ({
      url: `${siteUrl}/tours/${tour.slug}`,
      lastModified: new Date(tour.updated_at ?? tour.created_at ?? lastModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/cookie-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
