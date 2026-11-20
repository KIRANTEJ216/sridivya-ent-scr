import Link from "next/link";
import { ArrowUpRight, MapPin, Truck, Factory, ShieldCheck } from "lucide-react";
import { BoxGrid } from "@/components/box-grid";
import { FLUTES, PRINT_METHODS } from "@/lib/boxes";
import { areaAddress, site } from "@/lib/site";

/**
 * Everything after the flight. The flight sells the feeling; this is the part a
 * buyer (and a search engine) reads. All keywords here are visible prose, never
 * hidden text: Google treats hidden keyword blocks as spam.
 */
export function HomeSections() {
  return (
    <div className="hs">
      {/* ---------- intro / local positioning ---------- */}
      <section className="hs-band hs-intro" aria-labelledby="intro-h">
        <div className="hs-wrap hs-intro__grid">
          <div>
            <p className="hs-eyebrow">Corrugated box manufacturers in Hyderabad</p>
            <h2 id="intro-h" className="hs-h2">
              A packaging factory in Jeedimetla that answers the phone, holds the spec and ships on
              time.
            </h2>
          </div>
          <div className="hs-intro__copy">
            <p>
              Sri Divya Enterprises has manufactured <strong>corrugated boxes</strong>,{" "}
              <strong>printed cartons</strong> and <strong>paper packaging</strong> in Hyderabad since{" "}
              {site.established}. Board, print, die-cutting and finishing all run under one roof at our{" "}
              <strong>Jeedimetla</strong> unit, so a 3-ply shipper for a local distributor and a
              foil-stamped rigid box for a D2C launch come off the same floor with the same checks.
            </p>
            <p>
              We supply pharma units in IDA Jeedimetla and Bollaram, engineering firms in Balanagar and
              Medchal, FMCG distributors across Secunderabad, and e-commerce brands from Kukatpally to
              Hitec City.
            </p>
          </div>
        </div>
        <dl className="hs-wrap hs-stats">
          {site.stats.map((s) => (
            <div key={s.label} className="hs-stat">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- products ---------- */}
      <section className="hs-band" aria-labelledby="products-h">
        <div className="hs-wrap">
          <div className="hs-head">
            <div>
              <p className="hs-eyebrow">Box families</p>
              <h2 id="products-h" className="hs-h2">
                Corrugated boxes, cartons and rigid boxes, made to your dimensions
              </h2>
            </div>
            <Link href="/boxes" className="hs-link">
              All box types <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <BoxGrid className="mt-10" />
        </div>
      </section>

      {/* ---------- capability strip ---------- */}
      <section className="hs-band hs-cap" aria-labelledby="cap-h">
        <div className="hs-wrap">
          <h2 id="cap-h" className="hs-h2 hs-h2--sm">
            Board and print, specified rather than guessed
          </h2>
          <div className="hs-cap__grid">
            <div className="hs-card">
              <h3>Flute profiles</h3>
              <ul>
                {FLUTES.map((f) => (
                  <li key={f.id}>
                    <span className="hs-mono">{f.name}</span>
                    <span>{f.note}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hs-card">
              <h3>Print methods in-house</h3>
              <ul>
                {PRINT_METHODS.map((p) => (
                  <li key={p.id}>
                    <span className="hs-mono">{p.name}</span>
                    <span>{p.note}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hs-card hs-card--accent">
              <h3>Plant floor</h3>
              <ul>
                {site.production.rows.map((r) => (
                  <li key={r.label}>
                    <span className="hs-mono">{r.label}</span>
                    <span>{r.value}</span>
                  </li>
                ))}
              </ul>
              <Link href="/custom" className="btn btn-primary mt-6 h-11 px-5 text-sm">
                Build a box in 3D
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Jeedimetla / local ---------- */}
      <section id="jeedimetla" className="hs-band hs-local" aria-labelledby="local-h">
        <div className="hs-wrap hs-local__grid">
          <div>
            <p className="hs-eyebrow">Jeedimetla, Hyderabad</p>
            <h2 id="local-h" className="hs-h2">
              Your local packaging company in north Hyderabad
            </h2>
            <p className="hs-lede">
              Our corrugated box plant sits in the Jeedimetla industrial belt, so most of north and
              west Hyderabad is a short run for our trucks. Visit the floor, approve a sample in person,
              or collect a prototype the same day it is cut.
            </p>
            <ul className="hs-facts">
              <li>
                <MapPin size={18} aria-hidden="true" />
                <span>
                  <strong>{areaAddress}</strong>
                  <br />
                  Medchal-Malkajgiri district, Telangana
                </span>
              </li>
              <li>
                <Truck size={18} aria-hidden="true" />
                <span>Same-day inside Hyderabad, next-day across Secunderabad and the ORR corridor</span>
              </li>
              <li>
                <Factory size={18} aria-hidden="true" />
                <span>Corrugation, printing, die-cutting and finishing in one unit</span>
              </li>
              <li>
                <ShieldCheck size={18} aria-hidden="true" />
                <span>Pharma-grade cartons for IDA Jeedimetla and Bollaram units</span>
              </li>
            </ul>
            <div className="ff-cta">
              <Link href="/quote" className="btn btn-primary h-12 px-7 text-base">
                Request a quote
              </Link>
              <a
                className="btn btn-ghost h-12 px-6 text-base"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${site.name} corrugated boxes Jeedimetla Hyderabad`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions
              </a>
            </div>
          </div>

          <div className="hs-map">
            <iframe
              title="Map of Jeedimetla, Hyderabad, where Sri Divya Enterprises manufactures corrugated boxes"
              src="https://www.google.com/maps?q=Jeedimetla,+Hyderabad,+Telangana+500055&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="hs-areas">
              <h3>Areas we deliver to every week</h3>
              <ul>
                {site.nearbyAreas.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- industries ---------- */}
      <section className="hs-band" aria-labelledby="ind-h">
        <div className="hs-wrap">
          <p className="hs-eyebrow">Who we pack for</p>
          <h2 id="ind-h" className="hs-h2">Packaging for Hyderabad&apos;s industries</h2>
          <ul className="hs-ind">
            {site.industries.map((i) => (
              <li key={i.id}>
                <h3>{i.name} packaging</h3>
                <p>{i.detail}</p>
              </li>
            ))}
          </ul>
          <ul className="hs-clusters">
            {site.localDemand.map((d) => (
              <li key={d.cluster}>
                <strong>{d.cluster}</strong>
                <span>{d.need}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="hs-band" aria-labelledby="faq-h">
        <div className="hs-wrap hs-faq">
          <div>
            <p className="hs-eyebrow">Questions buyers ask</p>
            <h2 id="faq-h" className="hs-h2">Corrugated box FAQs</h2>
            <p className="hs-lede">
              Still deciding on a flute or a print method? Send us the product and the shipping route
              and we will spec the box with you.
            </p>
          </div>
          <div className="hs-faq__list">
            {site.faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- closing CTA ---------- */}
      <section className="hs-band hs-close" aria-labelledby="close-h">
        <div className="hs-wrap hs-close__inner">
          <h2 id="close-h" className="hs-h2">
            Send the dimensions. Get a quote from the people who will run the job.
          </h2>
          <div className="ff-cta">
            <Link href="/quote" className="btn btn-primary h-13 px-8 text-base">
              Request a quote
            </Link>
            <Link href="/corrugated-box-manufacturers-hyderabad" className="btn btn-ghost h-12 px-6 text-base">
              Why buyers in Hyderabad choose us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
