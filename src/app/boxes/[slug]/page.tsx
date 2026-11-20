import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BOXES, fluteName, printName, finishName, photoAlt, photoSrc } from "@/lib/boxes";
import { resolvedAddress, site } from "@/lib/site";
import { BoxDieline } from "@/components/box-dieline";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sridivyaenterprises.com";

/**
 * One page per box family.
 *
 * This is the page that ranks. The catalogue is a scroll theatre with a heading
 * that never changes and no per-product text, so it could not compete for
 * "RSC box manufacturer Hyderabad" or any other family-plus-place query. Each
 * family needs its own URL, its own title, and enough prose on it to be worth
 * the impression.
 */
export function generateStaticParams() {
  return BOXES.map((b) => ({ slug: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const box = BOXES.find((b) => b.id === slug);
  if (!box) return {};

  /* No brand suffix here: the root layout applies `%s | ${site.name}`, so
   * including it produced "... | Sri Divya Enterprises | Sri Divya Enterprises"
   * in every tab and every search result. */
  const title = `${box.name} Manufacturer in Hyderabad`;
  const description = `${box.name} in ${box.dimensions.l} x ${box.dimensions.w} x ${box.dimensions.h} mm. ${box.desc} Corrugated ${fluteName(box.flutes[0])} board, ${box.printOptions.length} print methods, MOQ ${box.moq}, ${box.leadTime}. Made in Hyderabad, delivered across Telangana.`;

  return {
    title,
    description,
    alternates: { canonical: `/boxes/${box.id}` },
    openGraph: {
      title,
      description,
      url: `${base}/boxes/${box.id}`,
      type: "website",
      // The studio render is this family only, which is the whole point of an
      // own OG image: a link to /boxes/rsc must not preview as a different box.
      images: [
        {
          url: `${base}${photoSrc(box)}`,
          width: box.photo.w,
          height: box.photo.h,
          alt: photoAlt(box),
        },
      ],
    },
  };
}

function customHref(box: (typeof BOXES)[number]) {
  const qs = new URLSearchParams({
    type: box.id,
    l: String(box.dimensions.l),
    w: String(box.dimensions.w),
    h: String(box.dimensions.h),
    flute: box.flutes[0] ?? "C",
    print: box.printOptions[0] ?? "flexo",
  });
  return `/custom?${qs.toString()}`;
}

export default async function BoxDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const box = BOXES.find((b) => b.id === slug);
  if (!box) notFound();

  const d = box.dimensions;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: box.name,
    description: box.desc,
    sku: box.id,
    category: box.category,
    image: [`${base}${photoSrc(box)}`],
    brand: { "@type": "Brand", name: site.name },
    material: "Corrugated kraft board",
    size: {
      "@type": "QuantitativeValue",
      value: d.l,
      unitText: "MM",
    },
    weight: { "@type": "QuantitativeValue", value: box.weightCapacity },
    manufacturer: {
      "@type": "Organization",
      name: site.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.contact.street,
        addressLocality: site.contact.locality,
        addressRegion: site.contact.region,
        postalCode: site.contact.postalCode,
        addressCountry: site.contact.countryCode,
      },
      areaServed: site.serviceAreas.map((a) => a.name),
    },
    offers: {
      "@type": "Offer",
      // No price is published on this site by policy, so the offer carries
      // availability and a route to a quote instead of a number we would have
      // to invent. A fabricated price is worse than no price.
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${base}/quote?box=${box.id}`,
      seller: { "@type": "Organization", name: site.name },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Box families", item: `${base}/boxes` },
      { "@type": "ListItem", position: 3, name: box.name, item: `${base}/boxes/${box.id}` },
    ],
  };

  // Every product page answers the same buying questions, so the FAQ block is
  // shared rather than invented eight times and drifting apart.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 sm:px-6">
        <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-text-dim">
          <li><Link href="/" className="hover:text-kraft">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/boxes" className="hover:text-kraft">Box families</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-text-muted">{box.name}</li>
        </ol>
      </nav>

      <article className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mt-6">
          <p className="kicker">{box.category} · manufactured in Hyderabad</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            {box.name}
          </h1>
          <p className="mt-4 max-w-2xl text-text-muted">{box.desc}</p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div>
            {/* What the buyer is actually buying, then how it is made. The
                render answers "is this the box I want"; the blank underneath
                answers "can you build it", which is a different question and
                belongs a tier below. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-ink-deep">
              <Image
                src={photoSrc(box)}
                alt={photoAlt(box)}
                width={box.photo.w}
                height={box.photo.h}
                sizes="(min-width: 1024px) 46vw, 94vw"
                priority
                className="h-full w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full border border-line bg-surface-1/85 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-text-dim">
                {box.category}
              </span>
            </div>

            <div className="metal-panel relative mt-6 overflow-hidden rounded-2xl p-4">
              <div className="pointer-events-none absolute inset-0 industrial-grid opacity-40" aria-hidden="true" />
              <BoxDieline
                w={box.d3.w}
                h={box.d3.h}
                d={box.d3.d}
                colorway={box.d3.colorway}
                pattern={box.d3.pattern}
                label={`${box.name} blank, ${d.l} by ${d.w} by ${d.h} millimetres`}
              />
              <p className="mt-2 text-center font-mono text-xs text-text-dim">
                Blank shown at 1:1 proportion · {d.l} × {d.w} × {d.h} mm finished
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">Specification</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
              <Spec label="Dimensions" value={`${d.l} × ${d.w} × ${d.h} mm`} />
              <Spec label="Load" value={box.weightCapacity} />
              <Spec
                label="Board"
                value={box.flutes.map(fluteName).join(" · ")}
              />
              <Spec
                label="Printing"
                value={box.printOptions.map(printName).join(" · ")}
              />
              <Spec
                label="Finishing"
                value={box.finishOptions.map(finishName).join(" · ")}
              />
              <Spec label="Minimum order" value={box.moq} />
              <Spec label="Lead time" value={box.leadTime} />
              <Spec
                label="Industries"
                value={box.industries.join(", ")}
              />
            </dl>

            <h2 className="mt-8 font-display text-xl font-semibold">Where it is used</h2>
            <p className="mt-2 text-text-muted">
              {box.name} runs in {box.industries.join(", ")} accounts across Hyderabad and
              Telangana. Every run is confirmed against your dieline or dimensions before
              board is cut, so tooling feasibility is settled before anyone quotes a price.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={customHref(box)} className="btn btn-primary h-12 px-7 text-base">
                Configure this box
              </Link>
              <Link href={`/quote?box=${box.id}`} className="btn btn-ghost h-12 px-6 text-base">
                Request a quote
              </Link>
            </div>
          </div>
        </div>

        {/* Local intent. A buyer in Hyderabad is choosing on proximity, and the
            page should say so in words, not only in schema. */}
        <section className="mt-16 border-t border-line pt-10" aria-labelledby="local-heading">
          <h2 id="local-heading" className="font-display text-2xl font-semibold">
            Made in Hyderabad, delivered across Telangana
          </h2>
          <p className="mt-3 max-w-3xl text-text-muted">
            {site.name} has run corrugation and converting in Hyderabad since 2007. Current
            capacity is {site.stats[1].value} {site.stats[1].label} on {site.stats[2].value}{" "}
            {site.stats[2].label}. We deliver {site.serviceAreas[0].detail.toLowerCase()} in{" "}
            {site.serviceAreas[0].name}, {site.serviceAreas[1].detail.toLowerCase()} across{" "}
            {site.serviceAreas[1].name}, and {site.serviceAreas[3].detail.toLowerCase()}{" "}
            statewide.
            {resolvedAddress && ` Plant address: ${resolvedAddress}.`}
          </p>
        </section>

        <section className="mt-12 border-t border-line pt-10" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-display text-2xl font-semibold">
            Questions buyers ask about {box.name.toLowerCase()}
          </h2>
          <div className="mt-4 grid gap-3">
            {site.faqs.map((f) => (
              <details key={f.q} className="metal-panel rounded-xl p-4">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <nav aria-label="Other families" className="mt-12 border-t border-line pt-8">
          <h2 className="font-display text-lg font-semibold">Other box families</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {BOXES.filter((b) => b.id !== box.id).map((b) => (
              <li key={b.id}>
                <Link
                  href={`/boxes/${b.id}`}
                  className="chip inline-flex min-h-11 items-center px-4 text-sm hover:border-kraft"
                >
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-text-dim">{label}</dt>
      <dd className="mt-1 text-sm text-text-muted">{value}</dd>
    </div>
  );
}

