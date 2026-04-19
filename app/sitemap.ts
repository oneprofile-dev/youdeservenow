import type { MetadataRoute } from "next";
import { getAllResultIds } from "@/lib/db";
import { getSiteUrl } from "@/lib/utils";
import { PSEO_PAGES } from "@/lib/pseo-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  // Only include result IDs that actually exist in the DB (dead-link guard)
  let resultIds: string[] = [];
  try {
    resultIds = await getAllResultIds();
  } catch {
    // If DB is unavailable during build, skip result routes rather than fail
  }

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

  const pseoRoutes: MetadataRoute.Sitemap = PSEO_PAGES.map((page) => ({
    url: `${siteUrl}/for/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const resultRoutes: MetadataRoute.Sitemap = resultIds.map((id) => ({
    url: `${siteUrl}/result/${id}`,
    changeFrequency: "never" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...pseoRoutes, ...resultRoutes];
}
