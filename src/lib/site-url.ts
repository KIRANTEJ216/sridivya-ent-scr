/**
 * The one public origin for canonicals, sitemap, robots, Open Graph and
 * JSON-LD.
 *
 * Order: an explicit NEXT_PUBLIC_SITE_URL (set this once the real domain is
 * connected), then the Vercel production URL Vercel injects at build time, then
 * the current Vercel address. Never a domain that does not resolve: a canonical
 * pointing at a dead host tells Google to index nothing.
 */
const vercelProd =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelProd ? `https://${vercelProd}` : "https://sridivya-ent-scr.vercel.app")
).replace(/\/$/, "");
