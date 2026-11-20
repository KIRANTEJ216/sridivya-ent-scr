import type { MetadataRoute } from "next";
import { BOXES } from "@/lib/boxes";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sridivyaenterprises.com";
  const now = new Date();

  const routes: MetadataRoute.Sitemap = ["", "/corrugated-box-manufacturers-hyderabad", "/boxes", "/custom", "/clients", "/quote"].map(
    (r) => ({
      url: `${base}${r}`,
      lastModified: now,
      changeFrequency: r === "" ? ("weekly" as const) : ("monthly" as const),
      priority: r === "" ? 1 : r === "/quote" ? 0.9 : 0.8,
    })
  );

  // Every family gets a URL of its own, so every family has to be discoverable.
  // The product pages carry the family-plus-place queries the catalogue cannot.
  const products: MetadataRoute.Sitemap = BOXES.map((b) => ({
    url: `${base}/boxes/${b.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...routes, ...products];
}
