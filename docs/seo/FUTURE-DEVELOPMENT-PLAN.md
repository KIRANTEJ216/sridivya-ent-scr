# Future Development Plan — sridivyaenterprises.com

**Consolidated from**: SEO-AUDIT-REPORT.md + COMPETITOR-ANALYSIS-REPORT.md (both Sept 5, 2026)
**Purpose**: prioritized, dependency-aware backlog for every recommended piece of work. Check items off as they land.

---

## Phase 0 — Launch Blockers (cannot ship without)

- [ ] **Real NAP** — replace phone/email/address in `src/lib/site.ts`; sync JSON-LD in `src/app/layout.tsx`
- [ ] **Domain verification** — set `NEXT_PUBLIC_SITE_URL` in Vercel env; confirm canonicals/sitemap/OG all resolve
- [ ] **Certifications** — verify ISO/FSC claims or remove `[placeholder]` suffixes entirely
- [ ] **GA4 property** — create, wire events: `rfq_submit`, `configurator_visit`, `whatsapp_click`, `tel_click`
- [ ] **Google Search Console + Bing Webmaster** — verify, submit sitemap, request indexing on all routes
- [ ] **Real factory photography** — replace `public/og.jpg`; feed GBP + /clients + product pages
- [ ] **Real case studies/testimonials** — replace `[synthetic]` entries in `site.ts` (permissioned, named clients preferred)

## Phase 1 — Week 1: Citations & GBP

- [ ] **Google Business Profile** — create at business.google.com (video verification: signage + floor + GST certificate)
  - Category: Manufacturer (+ Packaging supply store secondary)
  - Products: all 8 box types with photos/dims/MOQs
  - Website link with UTM (`?utm_source=google&utm_medium=organic&utm_campaign=gbp`)
  - Seed 3–5 Q&A; 10+ photos
- [ ] **IndiaMART listing** — 8 box types, photos, MOQs, certifications
- [ ] **TradeIndia + ExportersIndia** — identical NAP everywhere
- [ ] **LinkedIn company page** — URL goes into `sameAs` array
- [ ] **sameAs array** — fill in `src/app/layout.tsx` with GBP + LinkedIn + IndiaMART URLs
- [ ] **Bing Places + Apple Business Connect** — import from GBP

## Phase 2 — Weeks 2–4: Site Conversion Layer

- [ ] **WhatsApp CTA** — floating button + spec-card row + quote form (needs real number); UTM-tag the wa.me link
- [ ] **"48h Prototype" trust chip** — global header, next to phone
- [ ] **MOQ + lead time in meta descriptions** — all route layouts
- [ ] **GA4 events** — as spec'd in Phase 0
- [ ] **Review engine SOP** — post-delivery WhatsApp ask message template; reply-to-all within 48h

## Phase 3 — Weeks 2–6: Content Expansion (the 8 product pages)

Build `/boxes/[slug]` dedicated pages, one per box type:

- [ ] die-cut-mailer-box · rsc · telescopic · heavy-duty-crate · rigid-gift · food-carton · display-tray · wardrobe
- Each page: unique keyword title, 800+ words from `lib/boxes.ts` data, `Product` schema node (move from /boxes ItemList), own OG image (render from 3D engine), FAQ section
- [ ] **FAQPage schema on /quote** (MOQ, lead time, dielines, artwork, industries)
- [ ] **BreadcrumbList schema** across routes
- [ ] **Sitemap update** — add 8 product URLs
- [ ] **Export-grade positioning** on heavy-duty-crate page ("seaworthy", "ISPM-15 aware" — verify claims)
- [ ] **City-modified copy** — natural placements in footer/about (not title tags)

## Phase 4 — Weeks 5–10: Content Authority (guides)

`/guides` route, one article every 7–10 days, FAQPage schema on each:

- [ ] Corrugated Flute Types Guide (A/B/C/E/F + DW/TW) — comparison table is the link magnet
- [ ] Flexo vs Offset vs Digital Printing for Boxes
- [ ] What Is a Dieline? (+ checklist → pairs with RFQ upload)
- [ ] 3-ply vs 5-ply vs 7-ply Box Strength
- [ ] ECT/BCT Explained
- [ ] RSC vs Die-Cut Mailer
- [ ] Sitemap + internal links from each guide to matching product page

## Phase 5 — Weeks 9–12: Authority & PR

- [ ] **Configurator PR push** — pitch to Packaging South Asia, Packaging Insider, ecom/design newsletters, relevant subreddits (disclose affiliation)
- [ ] **Flute guide digital PR** — email 20 packaging bloggers/procurement docs
- [ ] **Reddit cadence** — monitor r/hyderabad, r/india, r/ecommerce packaging threads; 2–3 genuine answers/month
- [ ] **LinkedIn founder content** — plant-floor videos (corrugation, die-cutting, foil); cross-post to GBP
- [ ] **Merchant Center decision** — optionally list 2–3 stock sizes with prices to capture Shopping-tab demand → funnel to configurator

## Phase 6 — Month 4+: Iterate

- [ ] GSC Performance loop — find queries with impressions at position 8–30; deepen those pages
- [ ] Expand winning product pages with client-project photos
- [ ] GBP weekly posts (dispatch news, guide links)
- [ ] Quarterly re-run of competitor teardown (this folder, dated)

---

## KPI Gates

| Gate | Metric | Target |
|---|---|---|
| Exit Phase 0 | GSC indexation | All routes + product pages in `site:` query |
| Exit Phase 1 | Citations | 6–10 directories live, NAP identical everywhere, GBP verified |
| Exit Phase 3 | Indexable money pages | 13+ |
| Month 3 | Qualified RFQs | 15–35/month across channels |
| Month 3 | Local pack | First "near me" appearances (Hyd) |
| Month 6 | Organic | 500–1,500 sessions/month; top-3 on 3+ city long-tails; 100+ organic RFQ paths |
| Month 6 | Reviews | 6+ GBP reviews (1/month cadence) |
| Month 6 | Referring domains | 3–10 earned (non-directory) |

## Hard Rules (from the audits)

1. Never buy links / PBNs — new-domain risk is asymmetric
2. NAP must be character-identical across site, JSON-LD, and every directory
3. No pricing on custom B2B pages (deliberate strategy — quotes come person-to-person)
4. No unverified claims (certs, clients, capacity) — E-E-A-T risk
5. Don't chase "buy boxes online" head terms — Upack/Avon/Gurez own that intent; stay in custom-manufacture
6. AI Overviews are a primary target — every new page ships with structured spec data (MOQ, lead time, flutes, dimensions)

## Review Cadence

- **Monthly**: GSC + GA4 + GBP insights review (30 min)
- **Quarterly**: re-run competitor teardown; update this plan + reports in this folder with dates
