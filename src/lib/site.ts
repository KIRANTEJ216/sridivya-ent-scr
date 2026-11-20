export const site = {
  name: "Sri Divya Enterprises",
  tagline: "Corrugated & Paper Packaging Manufacturer",
  claim: "18+ years of packaging engineering",
  established: 2007,
  city: "Hyderabad",
  region: "Telangana",
  country: "IN",

  /**
   * Every value marked PLACEHOLDER must be replaced before launch.
   *
   * Local ranking is gated on these being real and byte-identical across the
   * site, Google Business Profile and every directory. Placeholder NAP in live
   * JSON-LD reads as inconsistent business data and suppresses local-pack
   * eligibility, so leaving these blank is worse than leaving them absent.
   */
  contact: {
    phone: "+91 98XXX XXXXX", // PLACEHOLDER
    phoneHref: "+9198XXXXXXX", // PLACEHOLDER — digits only, for tel: links
    email: "sales@sridivyaenterprises.com",
    street: "Plot No. XXX, [Industrial Estate]", // PLACEHOLDER
    /** Neighbourhood the plant sits in. Drives every local-SEO surface. */
    area: "Jeedimetla",
    locality: "Hyderabad",
    region: "Telangana",
    // Jeedimetla / IDA Jeedimetla post office. Confirm against the GST
    // certificate and Google Business Profile before launch.
    postalCode: "500055",
    countryCode: "IN",
    // PLACEHOLDER. Deliberately left blank rather than approximated: a wrong
    // pin code in schema is worse than a missing one.
    geo: { latitude: null, longitude: null },
    hours: "Mon-Sat, 9:00-18:00 IST",
    hoursSchema: "Mo-Sa 09:00-18:00",

    /**
     * WhatsApp handoff for RFQs. Digits only, no +, no spaces. Empty means
     * "not configured yet" — the RFQ flow renders no WhatsApp button rather
     * than a link that goes nowhere.
     */
    whatsapp: "", // PLACEHOLDER — set to the sales line's digits
  },

  /**
   * Every entry here is a verifiable machine or plant fact, not a vanity
   * number. Unverified throughput and account-count claims were removed: a
   * procurement audit that finds one inflated figure costs more trust than a
   * modest figure ever buys.
   */
  stats: [
    { value: "2007", label: "Manufacturing since" },
    { value: "1,450", label: "mm corrugation width" },
    { value: "8,000", label: "sheets/hr flexo capacity" },
    { value: "A-F", label: "Flutes, 3/5/7-ply" },
  ],

  certifications: [
    "ISO 9001:2015, quality management [PLACEHOLDER: confirm certificate number]",
    "FSC-certified board sources [PLACEHOLDER: confirm chain of custody]",
    "FSSAI food-grade compliance [PLACEHOLDER: confirm registration]",
    "Export-grade seaworthy packing, ISPM-15 aware",
  ],
  /**
   * Local service area. These are the real industrial clusters a Hyderabad
   * packaging buyer operates in, and they map onto box types further down.
   */
  serviceAreas: [
    { name: "Hyderabad", detail: "Same-day delivery inside city limits" },
    { name: "Secunderabad & Medchal-Malkajgiri", detail: "Next-day, our own fleet" },
    { name: "Rangareddy & Nizampet", detail: "Next-day across the ORR corridor" },
    { name: "Telangana statewide", detail: "Two-day standard freight" },
    { name: "Andhra Pradesh", detail: "Two-day standard freight" },
    { name: "Pan-India & export", detail: "Container-optimised dims, ISPM-15 packing" },
  ],

  /**
   * Industrial neighbourhoods around the Jeedimetla plant. Used in visible
   * copy (never hidden) because Google ranks local relevance from what a
   * visitor can actually read.
   */
  nearbyAreas: [
    "Jeedimetla",
    "IDA Jeedimetla",
    "Quthbullapur",
    "Suchitra",
    "Kompally",
    "Gajularamaram",
    "Bollaram",
    "Gandimaisamma",
    "Dundigal",
    "Medchal",
    "Balanagar",
    "Kukatpally",
    "Sanathnagar",
    "Bachupally",
    "Nizampet",
    "Miyapur",
    "Patancheru",
    "Secunderabad",
    "Cherlapally",
    "Uppal",
  ],

  /** Headline industries, tied to the local clusters above. */
  localDemand: [
    {
      cluster: "North Hyderabad pharma (Jeedimetla, Pharma City)",
      need: "Tamper-evident cartons, batch-coded panels, validation-ready documentation",
    },
    {
      cluster: "Engineering & auto components (Medchal)",
      need: "Triple-wall crates, corner protection, moisture control",
    },
    {
      cluster: "IT corridor & D2C brands (Hitec City, Gachibowli, Madhapur)",
      need: "Unboxing-grade rigid boxes, versioned SKUs at short-run MOQs",
    },
    {
      cluster: "FMCG & retail distribution",
      need: "Retail-ready display trays, high-volume corrugated shippers",
    },
  ],

  faqs: [
    {
      q: "Where is your corrugated box factory in Hyderabad?",
      a: "Our corrugated box manufacturing unit is in Jeedimetla, in the north Hyderabad industrial belt (Medchal-Malkajgiri district, Telangana). It is close to IDA Jeedimetla, Quthbullapur, Bollaram, Kompally and Balanagar, so pickups and deliveries across north Hyderabad are quick.",
    },
    {
      q: "Do you make custom printed corrugated boxes in small quantities?",
      a: "Yes. Digital short-run printing starts at 250 boxes and plain or 1-2 colour flexo RSC shippers start at 500. Larger runs move to flexo or offset for the best per-box cost.",
    },
    {
      q: "Do you deliver across Hyderabad?",
      a: "Yes. Same-day inside Hyderabad city limits, next-day across Secunderabad, Medchal-Malkajgiri and the Rangareddy ORR corridor, and two-day standard freight across Telangana and Andhra Pradesh.",
    },
    {
      q: "What is your minimum order quantity?",
      a: "MOQ depends on the box family and print method. RSC shippers run from 500 boxes; digital short-run print can start at 250. The configurator shows the MOQ for the box you pick.",
    },
    {
      q: "Can you work from my dieline?",
      a: "Yes. Send a CAD or PDF dieline in the RFQ and we will confirm tooling, board and print feasibility against it before quoting.",
    },
    {
      q: "Which board should I use?",
      a: "A through F flutes are available, 3, 5 or 7 ply. E and B flutes for mailers and retail, C for standard shippers, BC double-wall for heavier goods. The configurator shows what each box family supports.",
    },
    {
      q: "What print and finish methods do you run in-house?",
      a: "Flexo, offset, digital, UV and screen printing, with matte and gloss lamination, spot UV, foil stamping, emboss, deboss and window patching.",
    },
    {
      q: "How quickly can you turn a prototype around?",
      a: "Single-sheet prototypes and print proofs can usually go out within a working day or two. Production slots follow the schedule agreed at quote. We do not publish a turnaround figure we cannot meet.",
    },
  ],

  sustainability: {
    headline: "Packaging that returns to the cycle",
    points: [
      "Recycled-content kraft liners up to 100% post-consumer stock",
      "Water-based inks and plastic-free laminations as standard",
      "Board waste re-pulped in-house, so cutting sends near-nothing to landfill",
      "Right-sized boxes cut void fill, freight volume and emissions",
    ],
  },
  timeline: [
    { year: "2007", title: "First corrugation line", body: "A single semi-automatic plant runs 3-ply board for the local textile trade." },
    { year: "2010", title: "Flexo printing in-house", body: "2-colour flexo brings printing under one roof; first FMCG contracts." },
    { year: "2014", title: "Die-cutting & POS displays", body: "Flatbed die-cut press unlocks mailers, trays and retail display work." },
    { year: "2018", title: "Heavy-duty & export crates", body: "Triple-wall capability and seaworthy export packaging for auto components." },
    { year: "2021", title: "Digital short-run printing", body: "Digital press serves D2C brands with 250-box MOQs and versioned artwork." },
    { year: "2026", title: "18 years on the floor", body: "7 box families, 5 print methods, 10 industries. Same floor, bigger line." },
  ],
  industries: [
    { id: "ecommerce", name: "E-Commerce & D2C", detail: "Right-sized mailers, unboxing-grade print, versioned SKUs at 250-box MOQs." },
    { id: "fmcg", name: "FMCG", detail: "High-volume retail-ready packaging with flexo and offset lines running daily." },
    { id: "food", name: "Food & Beverage", detail: "Food-grade cartons, grease-resistant liners, FSSAI-compliant convertors." },
    { id: "pharma", name: "Pharmaceuticals", detail: "Tamper-evident cartons, validation-ready documentation, batch-controlled lots." },
    { id: "electronics", name: "Electronics", detail: "ESD-safe inserts and double-wall protection for fragile high-value goods." },
    { id: "apparel", name: "Apparel & Fashion", detail: "Wardrobe cartons, rigid gift boxes and boutique finishing for retail floors." },
    { id: "furniture", name: "Furniture", detail: "Triple-wall crates, corner protection and flat-pack fitment engineering." },
    { id: "automotive", name: "Automotive", detail: "Heavy-duty racks and export-grade seaworthy packing for components." },
    { id: "luxury", name: "Luxury Products", detail: "Rigid boxes with foil stamping, spot UV and textured wrap finishes." },
    { id: "export", name: "Export Packaging", detail: "ISPM-15 aware solutions, container-optimised dims and pallet programs." },
  ],
  caseStudies: [
    {
      id: "d2c-beauty",
      client: "D2C Beauty Brand [synthetic]",
      industry: "E-Commerce & D2C",
      challenge: "Unboxing experience that survives 3-pl transit and photographs like editorial.",
      solution: "E-flute mailer with digital 4-colour print, matte lamination and tear-strip.",
      result: "0 crushed-box complaints across 2 festive-season peaks. Case study is illustrative.",
    },
    { id: "auto-export", client: "Auto Component Exporter [synthetic]", industry: "Automotive", challenge: "Seaworthy packing for machined gears moving to EU plants.", solution: "Triple-wall crate with corner posts, VCI liners and palletised fitment.", result: "Zero transit damage claims across a 14-month program. Case study is illustrative." },
    { id: "pharma-serial", client: "Regional Pharma Chain [synthetic]", industry: "Pharmaceuticals", challenge: "Tamper-evident, serial-friendly cartons at GMP hygiene levels.", solution: "B-flute cartons with debossed batch panels and validation documents.", result: "Audit-passed packaging with full lot traceability. Case study is illustrative." },
  ],
  testimonials: [
    { quote: "Prototypes in 48 hours, production slots locked the same week. They think like a design studio that happens to run a factory floor.", name: "Head of Sourcing [synthetic]", org: "FMCG Major" },
    { quote: "They re-engineered our box dims and cut freight volume by a fifth. The savings paid for the print upgrade.", name: "Ops Director [synthetic]", org: "E-Commerce Platform" },
    { quote: "Foil, spot UV, magnetic closure: our launch box looked better than the product photos.", name: "Founder [synthetic]", org: "Luxury Skincare" },
  ],
  production: {
    headline: "Plant floor, at a glance",
    rows: [
      { label: "Corrugation width", value: "1,450 mm" },
      { label: "Max sheet size", value: "1,400 × 2,200 mm" },
      { label: "Print speeds", value: "up to 8,000 sheets/hr (flexo)" },
      { label: "Board grades", value: "80–450 GSM · 3/5/7-ply" },
      { label: "Tooling", value: "In-house die-making" },
      { label: "Dispatch radius", value: "Pan-India + export" },
    ],
  },
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/boxes", label: "Boxes" },
  { href: "/custom", label: "Custom" },
  { href: "/clients", label: "Clients" },
  { href: "/corrugated-box-manufacturers-hyderabad", label: "Hyderabad" },
  { href: "/quote", label: "Quote" },
] as const;

/**
 * One formatter, so the footer and the JSON-LD can never drift apart. NAP that
 * disagrees between the visible page and the structured data is exactly what
 * Google reads as inconsistent business information.
 */
/**
 * Area-level address, safe to show and to emit in schema even before the plot
 * number is confirmed: every part of it is true at the neighbourhood level.
 */
export const areaAddress = `${site.contact.area}, ${site.contact.locality}, ${site.contact.region} ${site.contact.postalCode}`;

export function formatAddress(c: typeof site.contact = site.contact): string {
  return [c.street, c.locality, c.region, c.postalCode].filter(Boolean).join(", ");
}

/* ------------------------------------------------------------------------- *
 * Placeholder suppression
 *
 * Until the real NAP and certificate numbers land, those values must not be
 * rendered anywhere: not in the footer, not in the homepage finale, not in the
 * clients page, and above all not in JSON-LD. A placeholder address in live
 * structured data is read by Google as inconsistent business information, which
 * suppresses local-pack eligibility — so an absent value is strictly better
 * than a fake one, even though it costs the NAP signal until it is filled in.
 *
 * Detection is by marker rather than by a hand-maintained flag list, so a new
 * placeholder cannot be added without also being suppressed.
 * ------------------------------------------------------------------------- */

const PLACEHOLDER_RE = /PLACEHOLDER|\bX{3,}\b|\[Industrial Estate\]/;

function pending(v: unknown): boolean {
  return typeof v === "string" && PLACEHOLDER_RE.test(v);
}

/** Contact fields with anything still unresolved removed. Null means "omit". */
export const resolvedContact = {
  phone: pending(site.contact.phone) ? null : site.contact.phone,
  phoneHref: pending(site.contact.phoneHref) ? null : site.contact.phoneHref,
  email: pending(site.contact.email) ? null : site.contact.email,
  street: pending(site.contact.street) ? null : site.contact.street,
  locality: site.contact.locality,
  region: site.contact.region,
  postalCode: pending(site.contact.postalCode) ? null : site.contact.postalCode,
  countryCode: site.contact.countryCode,
  geo:
    site.contact.geo.latitude != null && site.contact.geo.longitude != null
      ? site.contact.geo
      : null,
  hours: site.contact.hours,
  /** Digits only, for wa.me. Empty when not configured. */
  whatsapp: site.contact.whatsapp.replace(/[^\d]/g, ""),
} as const;

/** True when a street address can actually be shown. */
export const hasStreetAddress = resolvedContact.street !== null;

/** One-line address, or null when no street is confirmed. */
export const resolvedAddress = hasStreetAddress
  ? [
      resolvedContact.street,
      resolvedContact.locality,
      resolvedContact.region,
      resolvedContact.postalCode,
    ]
      .filter(Boolean)
      .join(", ")
  : null;

/** Certification claims that are not awaiting document confirmation. */
export const resolvedCertifications = site.certifications.filter((c) => !pending(c));
