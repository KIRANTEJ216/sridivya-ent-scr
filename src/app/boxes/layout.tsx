import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * /boxes is a client page, so its metadata lives here. Product pages under
 * /boxes/[slug] set their own title, description and canonical, which override
 * these. The ItemList schema stays on /boxes itself (see the page).
 */
export const metadata: Metadata = {
  title: "Corrugated Box Types & Sizes",
  description:
    "Eight corrugated and rigid box families with sizes, flutes, print options and MOQs. Made in Jeedimetla, Hyderabad, delivered across Telangana.",
  alternates: { canonical: "/boxes" },
};

export default function BoxesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
