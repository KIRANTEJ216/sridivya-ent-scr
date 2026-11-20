"use client";

import { motion } from "framer-motion";
import { Quote, Building2, Gauge, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { resolvedCertifications, site } from "@/lib/site";

// Declared here rather than in the root layout so the schema sits on the page
// that actually renders the questions.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: site.faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const },
};

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <p className="kicker flex items-center gap-2"><Building2 size={13} aria-hidden="true" /> Clients & industries</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-6xl">
        The floor ships to ten trades before lunch.
      </h1>
      <p className="mt-4 max-w-2xl text-text-muted">
        From 250-box D2C runs to container-loads of export crates, the same line re-tools
        between them daily.
      </p>

      {/* industries grid */}
      <section aria-labelledby="industries-heading" className="mt-14">
        <h2 id="industries-heading" className="font-display text-2xl font-bold tracking-tight">Industries served</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {site.industries.map((ind, i) => (
            <motion.li
              key={ind.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.04 }}
              className="metal-panel card-hover rounded-xl p-5"
            >
              <h3 className="font-display text-sm font-semibold">{ind.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">{ind.detail}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* case studies */}
      <section aria-labelledby="cases-heading" className="mt-20">
        <h2 id="cases-heading" className="font-display text-2xl font-bold tracking-tight">Case studies</h2>
        <p className="mt-2 text-xs text-text-dim">Illustrative engagements. Replace with real, permissioned stories before launch.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {site.caseStudies.map((cs, i) => (
            <motion.article
              key={cs.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-6"
            >
              <p className="kicker !text-[0.6rem]">{cs.industry}</p>
              <h3 className="font-display text-lg font-semibold tracking-tight">{cs.client}</h3>
              <p className="text-sm leading-relaxed text-text-muted"><span className="text-text-dim">Challenge: </span>{cs.challenge}</p>
              <p className="text-sm leading-relaxed text-text-muted"><span className="text-text-dim">Solution: </span>{cs.solution}</p>
              <p className="mt-auto text-sm leading-relaxed text-cyan-print">{cs.result}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* testimonials */}
      <section aria-labelledby="testimonials-heading" className="mt-20">
        <h2 id="testimonials-heading" className="font-display text-2xl font-bold tracking-tight">What the floor hears</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {site.testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.06 }}
              className="rounded-xl border border-line bg-surface-2 p-6"
            >
              <Quote size={18} className="text-orange-print" aria-hidden="true" />
              <blockquote className="mt-3 text-sm leading-relaxed text-text-muted">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-xs">
                <span className="font-semibold text-text">{t.name}</span>
                <span className="text-text-dim"> · {t.org}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* production capacity */}
      <section aria-labelledby="capacity-heading" className="mt-20">
        <div className="chrome-panel relative overflow-hidden rounded-2xl p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 industrial-grid opacity-40" aria-hidden="true" />
          <div className="relative">
            <h2 id="capacity-heading" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
              <Gauge size={20} className="text-orange-print" aria-hidden="true" /> {site.production.headline}
            </h2>
            <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {site.production.rows.map((r) => (
                <div key={r.label} className="bg-surface px-5 py-4">
                  <dt className="text-[0.65rem] uppercase tracking-[0.12em] text-text-dim">{r.label}</dt>
                  <dd className="mt-1 font-mono text-sm font-medium">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="mt-16 flex justify-center">
        <Link href="/quote" className="btn btn-primary h-12 px-8 text-base">Put the floor to work</Link>
      </div>

      {/*
        Local SEO, in words.
        The manufacturer schema in the root layout already tells a crawler the
        address and the service area, but schema is a claim, not content. These
        are the sentences a Hyderabad buyer would actually read, and the ones the
        placeholder NAP cannot be trusted to carry on its own.
      */}
      <section aria-labelledby="local-heading" className="mt-20 border-t border-line pt-12">
        <h2 id="local-heading" className="font-display text-2xl font-bold tracking-tight">
          Corrugated packaging, manufactured in Hyderabad
        </h2>
        <p className="mt-3 max-w-3xl text-text-muted">
          {site.name} has converted board in Hyderabad since 2007, on {site.stats[1].value}{" "}
          {site.stats[1].label} of corrugation and {site.stats[2].value} {site.stats[2].label}.
          Most of what leaves the plant is used within a day of the drive, which is the
          practical difference between a Hyderabad supplier and one three states away.
        </p>

        <h3 className="mt-8 font-display text-lg font-semibold">Where the demand comes from</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {site.localDemand.map((d) => (
            <div key={d.cluster} className="chrome-panel rounded-xl p-5">
              <dt className="font-medium">{d.cluster}</dt>
              <dd className="mt-1.5 text-sm text-text-muted">{d.need}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-10 font-display text-lg font-semibold">Where we deliver</h3>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">
          {site.serviceAreas.map((a) => (
            <li key={a.name} className="flex flex-wrap items-baseline justify-between gap-2 bg-surface px-5 py-3.5">
              <span className="font-medium">{a.name}</span>
              <span className="text-sm text-text-dim">{a.detail}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-10 font-display text-lg font-semibold">Certifications</h3>
        <ul className="mt-4 grid gap-2">
          {resolvedCertifications.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-sm text-text-muted">
              <BadgeCheck size={16} className="mt-0.5 shrink-0 text-kraft" aria-hidden="true" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
        {/* The pending items are suppressed rather than shown-with-a-warning.
            A public page listing "ISO 9001:2015 [PLACEHOLDER]" is read by a
            procurement auditor exactly as a certification claim, and the
            bracketed caveat does not undo it. Claims we cannot document are
            simply not made until the certificate numbers are in hand. */}
        <p className="mt-3 text-xs text-text-dim">
          Certificate numbers for our quality, chain-of-custody and food-grade registrations
          are published on request once verified against the issuing body&apos;s records.
        </p>
      </section>

      <section aria-labelledby="faq-heading" className="mt-20 border-t border-line pt-12">
        <h2 id="faq-heading" className="font-display text-2xl font-bold tracking-tight">
          Questions we get before the first order
        </h2>
        <div className="mt-5 grid gap-3">
          {site.faqs.map((f) => (
            <details key={f.q} className="chrome-panel rounded-xl p-5">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}
