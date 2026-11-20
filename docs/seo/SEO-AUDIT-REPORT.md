# SEO Audit & Growth Report — Sri Divya Enterprises

**Site**: sridivyaenterprises.com (Sri Divya Enterprises — custom corrugated & paper packaging manufacturer)
**Report date**: September 5, 2026
**Audited by**: SEO Specialist agent (Claude Code session)
**Audit method**: Crawled the production Next.js build exactly as Googlebot receives it (raw HTML, pre-JavaScript) across all 5 routes; validated structured data, meta tags, heading hierarchy, internal links, and content depth against the target keyword set.

---

## Target Keywords

- custom corrugated boxes
- paper packaging manufacturer
- rigid box manufacturer
- custom carton boxes
- industrial packaging solutions
- printed packaging boxes
- corrugated packaging supplier

---

## 1. Critical Issues Found & Fixed During This Audit

| # | Severity | Issue | Status |
|---|---|---|---|
| 1 | **P0 — Critical** | `/custom` and `/quote` shipped **empty HTML to crawlers** (client-only Suspense fallback). Google saw a blank page: 0 words, no H1, no form — the two highest-intent conversion pages were invisible to search. | ✅ **Fixed** — rebuilt as server components with request-time searchParams. Verified: 245 and 222 words of crawlable content, one H1 each |
| 2 | **P0 — Critical** | `ManufacturingBusiness` schema missing `url`, `logo`, `openingHours`, `priceRange`, `addressCountry`; `sameAs` absent | ✅ **Fixed** — verified in rendered JSON-LD |
| 3 | **P1** | Missing `og:locale` | ✅ **Fixed** — `en_IN` live |
| 4 | **P1** | No OG/Twitter image | ✅ **Fixed earlier** — 1200×630 `og.jpg` on all routes |
| 5 | **P1** | `/boxes` title had zero target keywords ("Box Catalog — Every Family in 3D") | ✅ **Fixed** — now keyword-loaded |
| 6 | **P1** | No Product schema for the 8 box types | ✅ **Fixed earlier** — `ItemList` + 8 `Product` nodes with `Offer` objects verified |
| 7 | **P1** | Home H1 had no target keyword | ✅ **Fixed** — "Custom corrugated boxes, engineered open." |
| 8 | **P2** | `/api/*` crawlable (wasted crawl budget) | ✅ **Fixed** — robots.txt disallow |

---

## 2. Current State Scorecard

```
Technical foundations    ████████░░  8/10   (SSR now clean; domain + NAP unresolved)
On-page optimization     ███████░░░  7/10   (titles/desc/H1s strong; content depth uneven)
Structured data          ███████░░░  7/10   (Org + Product live; FAQ/Breadcrumb missing)
Content & topical depth  ███░░░░░░░  3/10   (no blog, no guides, thin /clients page)
Local SEO (India B2B)    █░░░░░░░░░  1/10   (placeholder NAP, no citations, no GBP)
Link authority           ░░░░░░░░░░  0/10   (new domain, zero backlinks)
```

**What's genuinely solid**: unique titles/descriptions/canonicals on all 5 routes, one H1 per page, clean heading hierarchy, skip-link + full landmarks + aria-labels on every 3D exhibit, sitemap/robots wired, all routes cross-linked 3–5×, static-first pages (~103 kB shared JS — Core Web Vitals should pass easily), semantic `dl` spec tables on every box card.

**Word counts as crawled**: Home 866 · Boxes 687 · Custom 245 · Clients 393 · Quote 222. Custom and Quote are fine as tool pages; Clients is thin for a money page.

---

## 3. Launch Blockers (before the domain goes live)

These cannot be coded around — they need real data:

1. **Domain**: everything currently points at unverified `sridivyaenterprises.com` (canonicals, sitemap, OG, JSON-LD). Verify ownership → set `NEXT_PUBLIC_SITE_URL` in Vercel env → deploy. Every absolute URL flips automatically.
2. **NAP in structured data**: placeholder phone/address/coordinates are being emitted in live JSON-LD — Google reads this as inconsistent business data and it **suppresses local pack eligibility**. Real address, real `geo` coordinates, real phone.
3. **`sameAs` is an empty array**: add LinkedIn company page, IndiaMART storefront, Google Business Profile URL. For Indian B2B manufacturing, these three links are trust signals Google cross-validates.
4. **Certifications**: remove unverified ISO/FSC claims (or the `[placeholder]` suffix renders publicly) — unverifiable trust claims hurt E-E-A-T rather than help.
5. **Search Console + Bing Webmaster**: verify on day one, submit the sitemap, request indexing for all 5 routes.

---

## 4. The Niche Battle Plan — How to Win "Custom Packaging India"

### 4.1 The competitive reality

Short-tail terms ("corrugated boxes", "packaging manufacturer") belong to decades-old giants and IndiaMART's domain authority. You will not outrank them head-on in year one — and you don't need to. This niche is won on:

- **City/product long-tails** (buyer intent, low competition)
- **Manufacturing credibility content** (specs, tolerances, MOQ logic — stuff only a real factory can write)
- **The 3D configurator itself** (nobody in this niche has an interactive one — it's a link magnet)

### 4.2 Keyword strategy — three tiers

**Tier 1 — money pages (existing routes, optimize on-page):**

| Keyword | Target page | Status |
|---|---|---|
| custom corrugated boxes | Home | ✅ done |
| corrugated box types | /boxes | ✅ done |
| rigid box manufacturer | dedicated box page | 🔜 build |
| die-cut mailer boxes | dedicated box page | 🔜 build |
| heavy duty corrugated crates | dedicated box page | 🔜 build |
| food grade carton manufacturer | dedicated box page | 🔜 build |

**Tier 2 — city-modified (add to footer/copy, not title tags):**

- corrugated box manufacturer in Hyderabad (or actual city)
- packaging boxes supplier near [city]
- Export intent: corrugated boxes export India, seaworthy packaging manufacturer

**Tier 3 — informational (blog, builds topical authority):**

| Article | Target query | Why we win it |
|---|---|---|
| Flute Types Guide (A/B/C/E/F + DW/TW) | "corrugated flute types" | Data layer already exists in `lib/boxes.ts`; reference tables attract links |
| Flexo vs Offset vs Digital for boxes | "flexo vs offset printing" | Genuine manufacturing comparison, zero credible rivals writing this |
| Dieline basics + free checklist | "what is a dieline" | Pairs with the RFQ upload field |
| Box strength: 3-ply vs 5-ply vs 7-ply | "5 ply vs 7 ply corrugated box" | Pure spec knowledge |
| ECT/BCT explained | "corrugated box strength grades" | B2B buyers search this before RFQ |
| RSC vs die-cut mailer (cost/use) | "die cut box vs RSC" | Feeds configurator CTAs |

Six articles built around existing `lib/boxes.ts` data = fastest topical-authority play available. Add FAQPage schema to each.

### 4.3 Structural gaps to close (in priority order)

1. **Dedicated product pages** — `/boxes/die-cut-mailer-box` etc. (8 URLs). Right now all eight box types share one page's authority. Each product page gets: its own title, its `Product` schema node moved from /boxes, 800+ words of specs, its own OG image. **Single biggest organic-traffic unlock — 8 new money pages for ~a day of templating.**
2. **FAQPage schema on /quote** — "What is your MOQ?", "How fast are prototypes?", "Do you accept dielines?" FAQ rich results double SERP footprint.
3. **BreadcrumbList schema** — trivial, gives rich breadcrumbs on new product pages.
4. **Thin /clients page** — 393 words. Expand each case study to 250+ words with real (permissioned) client stories.
5. **Per-page OG images** — render each box type as its own 1200×630 from the 3D engine.

### 4.4 Link building — earned, in this niche's actual channels

- **Supplier directories**: IndiaMART, TradeIndia, ExportersIndia, Udaan — real referral traffic + citation trust. Consistent NAP everywhere.
- **Google Business Profile** — real floor photos. "Corrugated box manufacturer near me" is how local procurement shortlists.
- **The configurator as a linkable asset**: pitch to packaging-design subreddits, industrial design blogs, Shopify/ecom ops newsletters — "a 3D box configurator from an actual factory" is genuinely novel in this niche.
- **Flute guide as digital PR**: reference-table play. Packaging blogs and procurement guides link to definitive spec tables.
- **Packaging/design agencies**: buyers won't link, but their agencies will — pitch dieline/FAQ content.

### 4.5 90-day roadmap

| Window | Actions | Expected outcome |
|---|---|---|
| **Week 1 (launch)** | Real NAP + domain + `sameAs`, GSC/Bing verified, GBP listing, IndiaMART/TradeIndia citations | Indexation, citation consistency baseline |
| **Weeks 2–4** | 8 dedicated box product pages + FAQ schema + breadcrumbs; expand /clients | 13 indexable money pages, long-tail eligibility |
| **Weeks 5–8** | Flute guide + print-methods comparison + dieline article (3 posts), each with FAQPage schema; per-box OG images | First informational rankings, topical authority signals |
| **Weeks 9–12** | Configurator PR push, city landing copy in footer/about, remaining 3 articles, review GSC queries → iterate titles | First page-1 long-tails, 15–25 referring citations |

### 4.6 Success metrics

- **Month 3**: 13+ money pages + 6 guides indexed; 20+ directory citations; first page-1 rankings on 5+ long-tails (city/product)
- **Month 6**: top-3 for 3+ city-modified money terms; 100+ organic RFQ-form paths in GA4; first non-directory referring domains
- **Year 1**: >25% organic traffic growth quarter-over-quarter from month 6; /quote organic entries converting >2% to submitted RFQs

**Honest timeline**: 4–6 months to meaningful organic visibility for a new domain at single-digit authority. The configurator buys attention; product pages + flute guide convert it into rankings.

---

## 5. Files & Locations (for future development reference)

| Item | Path | Notes |
|---|---|---|
| Site config (NAP, stats, certifications — all placeholders) | `src/lib/site.ts` | Replace before launch |
| Box catalog data (8 types, flutes, prints, finishes) | `src/lib/boxes.ts` | Feeds product pages + guides |
| Root metadata + JSON-LD (ManufacturingBusiness) | `src/app/layout.tsx` | `sameAs` array waiting for real URLs |
| Product schema (ItemList + 8 Products) | `src/app/boxes/layout.tsx` | Move per-product on dedicated pages |
| Route metadata | `src/app/{boxes,custom,clients,quote}/layout.tsx` | All keyword-loaded |
| Sitemap | `src/app/sitemap.ts` | Add 8 product URLs + 6 guide URLs when built |
| Robots | `src/app/robots.ts` | `/api/` disallowed |
| OG image | `public/og.jpg` | 1200×630 — replace with floor photography |
| Product truths / claims ceiling | `PRODUCT.md` | Placeholder registry |
| Design system contract | `DESIGN.md` | Kraft Sheet Metal direction |

### Built-ready next steps (awaiting real data)

1. GBP profile URL → `sameAs` array in `src/app/layout.tsx`
2. Real address + geo coordinates → `src/lib/site.ts` + `GeoCoordinates` in JSON-LD + map embed on /quote
3. IndiaMART / LinkedIn / TradeIndia URLs → `sameAs` array
4. First review URLs → `Review` nodes inside ManufacturingBusiness JSON-LD + review strip on /clients
5. Real factory photos → replace `og.jpg`, GBP posts, /clients case studies
