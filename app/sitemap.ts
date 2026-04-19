import type { MetadataRoute } from "next";
import { getAllResultIds } from "@/lib/db";
import { getSiteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const resultIds = await getAllResultIds();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  const resultRoutes: MetadataRoute.Sitemap = resultIds.map((id) => ({
    url: `${siteUrl}/result/${id}`,
    changeFrequency: "never" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...resultRoutes];
}
