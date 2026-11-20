# Marketing & SEO Knowledge Base — Sri Divya Enterprises

This folder holds the competitive intelligence and growth strategy for sridivyaenterprises.com.
All reports were generated from live research (September 5, 2026) and should be revisited quarterly.

## Documents

| Document | Contents | Read when |
|---|---|---|
| [SEO-AUDIT-REPORT.md](./SEO-AUDIT-REPORT.md) | Technical audit of the site (SSR, schema, metadata), scorecard, launch blockers, keyword strategy, 90-day roadmap, success metrics | Before any SEO work; before launch |
| [COMPETITOR-ANALYSIS-REPORT.md](./COMPETITOR-ANALYSIS-REPORT.md) | India paper-packaging market structure, 5-rival teardown (Packman, Box Makers India, impressioncart, Omdeo, Boxify), channel map, gap analysis, lead-gen playbook, projections | Planning marketing spend, new channel decisions, quarterly strategy reviews |
| [FUTURE-DEVELOPMENT-PLAN.md](./FUTURE-DEVELOPMENT-PLAN.md) | Consolidated, prioritized backlog of all recommended work (site + marketing + content) with dependencies and owner-ready checklists | Every sprint/development cycle |

## One-Page Summary (for stakeholders)

**Where we stand**: The site is technically superior to every direct competitor audited (full SSR, valid structured data, 3D configurator — all unique in this niche), but it is a new domain with zero authority, placeholder business data, and no content depth. Technical foundations: 8/10. Content/local/authority: the work is ahead.

**The three levers that decide this niche** (none require budget):
1. Google Business Profile + review engine — the Hyderabad local pack is winnable (leader: 4.6★/25 reviews)
2. AI-Overview citations — structured spec content (MOQ, flutes, lead times) is what Google's AI reads; competitors ship broken schema
3. WhatsApp response speed — 4/5 competitors treat it as the primary lead channel; buyers expect it

**Timeline honesty**: 4–6 months to meaningful organic visibility. 15–35 qualified RFQs/month by month 3 (GBP + IndiaMART + WhatsApp driven), 40–75 by month 6 (organic compounding). One landed recurring account pays for the year.

## Placeholder Data Registry

Everything marked `[placeholder]` / `[synthetic]` lives in `src/lib/site.ts` and blocks launch:
- [ ] Real phone, email, address → also update JSON-LD in `src/app/layout.tsx`
- [ ] Verified domain → set `NEXT_PUBLIC_SITE_URL` in Vercel env
- [ ] Certifications (ISO/FSC claims must be verified or removed)
- [ ] `sameAs` URLs (LinkedIn, IndiaMART, GBP)
- [ ] Real case studies + testimonials (currently labeled synthetic)
- [ ] Real factory photography (replaces `public/og.jpg` + GBP photos)
