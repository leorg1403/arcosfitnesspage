import type { MetadataRoute } from "next";

const BASE = "https://www.arcosfitness.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/clases-reservas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/hyrox`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/membresias`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
