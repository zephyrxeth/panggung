import type { MetadataRoute } from "next";
import { searchEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

const BASE = "https://2341s.my.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const events = searchEvents({ limit: 200 });
  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/request`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/submit`, changeFrequency: "monthly", priority: 0.5 },
    ...events.map(e => ({
      url: `${BASE}/event/${e.slug}`,
      lastModified: new Date(e.starts_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
