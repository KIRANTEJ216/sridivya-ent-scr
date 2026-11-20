import type { Metadata } from "next";
import Link from "next/link";
import { BoxGrid } from "@/components/box-grid";
import { areaAddress, site } from "@/lib/site";

const PATH = "/corrugated-box-manufacturers-hyderabad";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sridivyaenterprises.com";

export const metadata: Metadata = {
  title: {
    absolute: "Corrugated Box Manufacturers in Hyderabad & Jeedimetla | Sri Divya Enterprises",
  },
  description:
    "Looking for corrugated box manufacturers in Hyderabad? Sri Divya Enterprises makes 3, 5 and 7 ply corrugated boxes, printed cartons and pharma packaging in Jeedimetla. Same-day delivery in Hyderabad.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Corrugated Box Manufacturers in Hyderabad & Jeedimetla",
    description:
      "3, 5 and 7 ply corrugated boxes, printed cartons and pharma packaging made in Jeedimetla, Hyderabad.",
    url: PATH,
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Corrugated box manufacturers in Hyderabad",
      item: `${SITE_URL}${PATH}`,
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Corrugated box manufacturing",
  name: "Corrugated box manufacturing in Hyderabad",
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: site.nearbyAreas.map((n) => ({ "@type": "Place", name: `${n}, Hyderabad` })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Corrugated and paper packaging",
    itemListElement: [
      "3 ply corrugated boxes",
      "5 ply corrugated boxes",
      "7 ply corrugated boxes",
      "Printed carton boxes",
      "Die-cut mailer boxes",
      "Pharma cartons",
      "Rigid gift boxes",
      "Export packaging boxes",
    ].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Product", name: n } })),
  },
};

export default function HyderabadPage() {
  return (
    <>
      <section className="lp-hero">
        <div className="hs-wrap">
          <nav aria-label="Breadcrumb" className="mb-6 font-mono text-xs text-text-dim">
            <Link href="/" className="hover:text-text">
              Home
            </Link>{" "}
            / Corrugated box manufacturers in Hyderabad
          </nav>
          <p className="hs-eyebrow">{areaAddress}</p>
          <h1 className="lp-h1">Corrugated box manufacturers in Hyderabad, from Jeedimetla</h1>
          <p className="hs-lede">
            3, 5 and 7 ply corrugated boxes, printed carton boxes, die-cut mailers and pharma cartons,
            manufactured on our own floor in the Jeedimetla industrial area since {site.established}.
          </p>
          <div className="ff-cta">
            <Link href="/quote" className="btn btn-primary h-12 px-7 text-base">
              Request a quote
            </Link>
            <Link href="/custom" className="btn btn-ghost h-12 px-6 text-base">
              Build a box in 3D
            </Link>
          </div>
        </div>
      </section>

      <section className="hs-band">
        <div className="hs-wrap lp-prose">
          <h2>Why Hyderabad buyers source corrugated boxes from Jeedimetla</h2>
          <p>
            Jeedimetla is one of Hyderabad&apos;s oldest industrial areas, and it sits next to the
            pharma and engineering clusters of <strong>IDA Jeedimetla</strong>,{" "}
            <strong>Bollaram</strong>, <strong>Quthbullapur</strong> and <strong>Balanagar</strong>.
            A packaging company here can collect a sample in the morning and have a prototype on your
            desk the same day. For a buyer in Kukatpally, Kompally, Medchal or Secunderabad, that is
            the difference between a carton supplier and a packaging partner.
          </p>
          <p>
            Sri Divya Enterprises runs corrugation, printing, die-cutting and finishing in one unit. That
            means one team owns your box from the dieline to the dock, and a change in board grade or
            print does not have to travel between three vendors.
          </p>

          <h2>Corrugated boxes we manufacture</h2>
          <ul>
            <li>
              <strong>3 ply corrugated boxes</strong> for light cartons, sleeves and retail inner packs
            </li>
            <li>
              <strong>5 ply corrugated boxes</strong>, the standard shipper for FMCG, e-commerce and
              electronics
            </li>
            <li>
              <strong>7 ply corrugated boxes</strong> and triple-wall crates for heavy engineering and
              export loads
            </li>
            <li>
              <strong>Printed carton boxes</strong> in flexo, offset, digital, UV and screen print
            </li>
            <li>
              <strong>Die-cut mailer boxes</strong> with crash-lock bottoms for D2C and gifting
            </li>
            <li>
              <strong>Pharma cartons</strong> with batch-coded panels for Jeedimetla and Bollaram units
            </li>
            <li>
              <strong>Rigid boxes</strong> with foil stamping, spot UV, emboss and deboss
            </li>
          </ul>

          <h2>Delivery across Hyderabad and Telangana</h2>
          <p>
            Same-day inside Hyderabad city limits, next-day across Secunderabad, Medchal-Malkajgiri
            and the Rangareddy ORR corridor, and two-day freight across Telangana and Andhra Pradesh.
            We regularly deliver to {site.nearbyAreas.slice(0, -1).join(", ")} and{" "}
            {site.nearbyAreas[site.nearbyAreas.length - 1]}.
          </p>
        </div>
      </section>

      <section className="hs-band">
        <div className="hs-wrap">
          <h2 className="hs-h2">Box families made in Jeedimetla</h2>
          <BoxGrid className="mt-10" />
        </div>
      </section>

      <section className="hs-band hs-close">
        <div className="hs-wrap hs-close__inner">
          <h2 className="hs-h2">Need cartons this month? Send the size and the quantity.</h2>
          <div className="ff-cta">
            <Link href="/quote" className="btn btn-primary h-13 px-8 text-base">
              Request a quote
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  );
}
