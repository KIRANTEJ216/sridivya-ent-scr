import type { MetadataRoute } from "next";
import { SITE_URL as SITE_URL_ORIGIN } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL_ORIGIN;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
