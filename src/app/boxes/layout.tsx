import type { ReactNode } from "react";

/**
 * Deliberately empty. The ItemList schema for the catalogue lives on /boxes
 * itself, not here: a layout also wraps /boxes/[slug], so an ItemList emitted
 * here would claim every product detail page is a list of all eight families.
 */
export default function BoxesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
