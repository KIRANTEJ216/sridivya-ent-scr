import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Quote | Custom Packaging RFQ",
  description:
    "Send dimensions, flute, print method and artwork for custom corrugated or rigid boxes. Upload dielines and artwork, get a response from the factory floor within one working day.",
  alternates: { canonical: "/quote" },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
