import type { Metadata } from "next";
import { FactoryFlight } from "@/components/line/FactoryFlight";
import { HomeSections } from "@/components/home-sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "Corrugated Box Manufacturers in Hyderabad | Sri Divya",
  },
  description:
    "Corrugated box manufacturer in Jeedimetla, Hyderabad since 2007. 3, 5 and 7 ply boxes, printed cartons, mailers and pharma packaging. Get a quote.",
  alternates: { canonical: "/" },
};

/** FAQPage schema, built from the same FAQ list the page renders. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: site.faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HomePage() {
  return (
    <>
      <FactoryFlight />
      <HomeSections />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
