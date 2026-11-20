import type { Metadata } from "next";
import { FactoryFlight } from "@/components/line/FactoryFlight";
import { HomeSections } from "@/components/home-sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute:
      "Corrugated Box Manufacturers in Hyderabad | Jeedimetla Packaging Company | Sri Divya Enterprises",
  },
  description:
    "Sri Divya Enterprises, Jeedimetla, Hyderabad: corrugated box manufacturer since 2007. Custom printed carton boxes, 3/5/7 ply boxes, die-cut mailers, pharma cartons and export packaging. Request a quote.",
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
