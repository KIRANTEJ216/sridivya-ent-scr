import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { resolvedAddress, resolvedContact, site } from "@/lib/site";
import { BOXES } from "@/lib/boxes";
import "@/styles.css";
import { SITE_URL } from "@/lib/site-url";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});



export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Corrugated Box Manufacturers in Hyderabad | Sri Divya",
    template: "%s | Sri Divya Enterprises",
  },
  description:
    "Corrugated box manufacturer in Jeedimetla, Hyderabad since 2007. 3, 5 and 7 ply boxes, printed cartons, mailers and pharma packaging. Get a quote.",
  // Not a Google ranking signal, but read by Bing, Yandex and some Indian
  // directories. Kept to terms the visible page actually covers.
  keywords: [
    "corrugated box manufacturers in Hyderabad",
    "corrugated boxes Jeedimetla",
    "packaging company in Jeedimetla",
    "carton box manufacturers in Hyderabad",
    "corrugated box manufacturers Telangana",
    "packaging box manufacturers Hyderabad",
    "3 ply corrugated box",
    "5 ply corrugated box",
    "7 ply corrugated box",
    "custom printed corrugated boxes",
    "pharma carton boxes Hyderabad",
    "die-cut mailer boxes",
    "rigid box manufacturer Hyderabad",
    "export packaging boxes Hyderabad",
    "corrugated sheets Hyderabad",
    "packaging boxes near me",
    "IDA Jeedimetla packaging",
    "Quthbullapur corrugated boxes",
    "Kukatpally packaging boxes",
    "Balanagar carton boxes",
  ],
  category: "Packaging manufacturing",
  other: {
    "geo.region": "IN-TG",
    "geo.placename": "Jeedimetla, Hyderabad",
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    title: "Corrugated Box Manufacturers in Hyderabad | Sri Divya Enterprises",
    description:
      "Corrugated boxes, printed cartons and rigid packaging made in Jeedimetla, Hyderabad. Build your box in 3D, then request a quote.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Sri Divya Enterprises: custom corrugated packaging manufacturing in Hyderabad" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Custom Packaging Manufacturer`,
    description: "Custom corrugated boxes, rigid boxes, printed cartons. 18+ years. Live 3D configurator.",
    images: ["/og.jpg"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

/**
 * Manufacturer schema. Local eligibility hinges on this object being complete
 * and consistent with the visible NAP, so it is assembled from `site` rather
 * than hand-copied. `geo` is emitted only when real coordinates are supplied;
 * a fabricated pin point is worse than an absent one.
 */
const orgJsonLd = {
  "@context": "https://schema.org",
  // schema.org has no "Manufacturer" class, so Google ignored the old type.
  // LocalBusiness is what drives local-pack eligibility.
  "@type": ["LocalBusiness", "Organization"],
  "@id": `${SITE_URL}/#organization`,
  name: site.name,
  legalName: site.name,
  description:
    "Corrugated box and paper packaging manufacturer in Jeedimetla, Hyderabad, Telangana. RSC boxes, die-cut mailers, telescopic boxes, heavy-duty crates, rigid paper boxes, food cartons and display trays, printed flexo, offset and digital.",
  foundingDate: String(site.established),
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og.jpg`,
  ...(resolvedContact.phone ? { telephone: resolvedContact.phone } : {}),
  email: site.contact.email,
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  // The PostalAddress is emitted only once a real street is confirmed. A
  // structured address whose streetAddress reads "Plot No. XXX, [Industrial
  // Estate]" is worse than no address at all: it is inconsistent business
  // information, and inconsistent NAP is what disqualifies a business from
  // local-pack results. areaServed below still carries Hyderabad/Telangana.
  address: {
    "@type": "PostalAddress",
    ...(resolvedContact.street ? { streetAddress: resolvedContact.street } : {}),
    addressLocality: `${site.contact.area}, ${site.contact.locality}`,
    addressRegion: site.contact.region,
    postalCode: site.contact.postalCode,
    addressCountry: site.contact.countryCode,
  },
  ...(site.contact.geo.latitude !== null && site.contact.geo.longitude !== null
    ? {
        geo: {
          "@type": "GeoCoordinates",
          latitude: site.contact.geo.latitude,
          longitude: site.contact.geo.longitude,
        },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          resolvedAddress ?? ""
        )}`,
      }
    : {}),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  areaServed: site.serviceAreas.map((a) => ({
    "@type": "Place",
    name: `${a.name}, ${a.detail}`,
  })),
  serviceArea: [
    { "@type": "Place", name: "Jeedimetla, Hyderabad" },
    ...site.nearbyAreas.slice(1, 12).map((n) => ({ "@type": "Place", name: `${n}, Hyderabad` })),
    { "@type": "City", name: "Hyderabad" },
    { "@type": "City", name: "Secunderabad" },
    { "@type": "AdministrativeArea", name: "Telangana" },
    { "@type": "AdministrativeArea", name: "Andhra Pradesh" },
    { "@type": "Country", name: "India" },
  ],
  makesOffer: BOXES.map((b) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Product", name: b.name, description: b.desc },
  })),
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      // Same rule as the address: a placeholder telephone in ContactPoint is
      // inconsistent NAP. The property drops out; the email stays.
      ...(resolvedContact.phone ? { telephone: resolvedContact.phone } : {}),
      email: site.contact.email,
      areaServed: "IN",
      availableLanguage: ["en", "te", "hi"],
    },
  ],
  keywords:
    "corrugated boxes, carton boxes, packaging boxes, corrugated box manufacturer Hyderabad, packaging company Jeedimetla, 3 ply 5 ply 7 ply boxes, printed cartons, pharma cartons, export packaging",
  slogan: "Corrugated boxes, engineered in Hyderabad.",
  knowsAbout: [
    "corrugated boxes Hyderabad",
    "corrugated boxes Jeedimetla",
    "carton box manufacturing",
    "3 ply, 5 ply and 7 ply corrugated boxes",
    "corrugated packaging manufacturer",
    "RSC boxes",
    "die-cut mailers",
    "rigid paper boxes",
    "food packaging cartons",
    "display trays",
    "flexo and offset printing",
    "export packaging",
  ],
  // PLACEHOLDER before launch: LinkedIn company page, IndiaMART storefront,
  // Google Business Profile URL. Google cross-validates these against the
  // Business Profile, so an empty array here costs local ranking.
  sameAs: [] as string[],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-orange-print focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-deep"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <WhatsAppButton />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
