import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Box Configurator: Customise Corrugated Boxes Live",
  description:
    "Set dimensions, flute, board grade, printing and finishes. Watch your custom corrugated box update live, then hand the spec straight to a quote.",
  alternates: { canonical: "/custom" },
};

export default function CustomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
