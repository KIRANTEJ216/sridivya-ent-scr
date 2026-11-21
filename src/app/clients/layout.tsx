import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries & Case Studies",
  description:
    "Packaging for e-commerce, FMCG, pharma, food, electronics, auto and export brands, with case studies and plant capacity. Made in Jeedimetla, Hyderabad.",
  alternates: { canonical: "/clients" },
};

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
