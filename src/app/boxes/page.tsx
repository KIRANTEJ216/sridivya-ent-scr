"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BoxGrid } from "@/components/box-grid";
import { BOXES, BOX_CATEGORIES, photoSrc, type BoxCategory } from "@/lib/boxes";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sridivyaenterprises.com";

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${site.name} | Corrugated Box Catalogue`,
  numberOfItems: BOXES.length,
  itemListElement: BOXES.map((b, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: b.name,
    url: `${base}/boxes/${b.id}`,
    image: `${base}${photoSrc(b)}`,
  })),
};

export default function BoxesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BoxCategory | "All">("All");

  const filterIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BOXES.filter((b) => {
      const inCat = category === "All" || b.category === category;
      const inQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.desc.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.industries.some((i) => i.includes(q));
      return inCat && inQuery;
    }).map((b) => b.id);
  }, [query, category]);

  const hasFilters = query.trim() !== "" || category !== "All";

  return (
    <div className="pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      {/* search + filter bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-labelledby="boxes-title">
        <p className="kicker">The full catalog</p>
        <h1 id="boxes-title" className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
          Every box family we build.
        </h1>
        <p className="mt-4 max-w-2xl text-text-muted">
          All {BOXES.length} families in one place. Search or filter to narrow the
          list, then open any carton for its full dieline, board and print spec.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" aria-hidden="true" />
            <label htmlFor="box-search" className="sr-only">Search boxes</label>
            <input
              id="box-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mailers, pharma, telescopic…"
              className="field-input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
            <SlidersHorizontal size={14} className="text-text-dim" aria-hidden="true" />
            {(["All", ...BOX_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c as BoxCategory | "All")}
                aria-pressed={category === c}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  category === c
                    ? "border-orange-print bg-orange-print/15 text-text"
                    : "border-line bg-surface-2 text-text-muted hover:border-cyan-print/50 hover:text-text"
                )}
              >
                {c}
              </button>
            ))}
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
                className="ml-1 inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs text-text-dim transition-colors hover:text-text"
              >
                <X size={12} aria-hidden="true" /> Clear
              </button>
            )}
          </div>
        </div>

        {filterIds.length === 0 && (
          <p className="mt-10 rounded-xl border border-line bg-surface-2 p-6 text-center text-text-muted" role="status">
            No box families match that filter. Clear it to see all {BOXES.length}.
          </p>
        )}
      </section>

      {/* the catalogue: every family once, and the page ends */}
      {filterIds.length > 0 && (
        <section className="mt-12 scroll-mt-24" aria-labelledby="boxes-collection">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="boxes-collection" className="text-lg font-semibold text-text">
              {category === "All" ? "All box families" : `${category} boxes`}
            </h2>
            <p className="font-mono text-xs text-text-dim" role="status">
              {filterIds.length} {filterIds.length === 1 ? "family" : "families"}
            </p>
          </div>
          <BoxGrid ids={filterIds} />
        </section>
      )}
    </div>
  );
}
