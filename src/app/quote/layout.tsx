import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Quote for Custom Boxes",
  description:
    "Send box size, flute, print and quantity for custom corrugated or rigid boxes. Get a quote from our Jeedimetla factory within one working day.",
  alternates: { canonical: "/quote" },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
