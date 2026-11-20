import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients & Industries: Industries Served and Packaging Case Studies",
  description:
    "Ten industries, one factory floor: e-commerce, FMCG, food, pharma, electronics, apparel, furniture, automotive, luxury and export packaging, with case studies and production capacity.",
  alternates: { canonical: "/clients" },
};

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
