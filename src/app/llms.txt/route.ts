import { BOXES } from "@/lib/boxes";
import { areaAddress, resolvedContact, site } from "@/lib/site";
import { SITE_URL } from "@/lib/site-url";

/**
 * llms.txt: a plain-text brief for AI assistants (ChatGPT, Perplexity, Gemini)
 * so they can describe the business accurately. Built from the same data the
 * pages render, so it cannot drift from the site.
 */
export const dynamic = "force-static";

export function GET() {
  const u = (p: string) => `${SITE_URL}${p}`;
  const body = `# ${site.name}

> Corrugated box and paper packaging manufacturer in ${areaAddress}, India. Manufacturing since ${site.established}. Makes custom 3, 5 and 7 ply corrugated boxes, printed cartons, die-cut mailers, pharma cartons, rigid gift boxes, display trays and export packaging for businesses across Hyderabad, Telangana and India.

## Key facts
- Location: ${areaAddress} (north Hyderabad industrial belt, near IDA Jeedimetla, Quthbullapur, Bollaram, Kompally and Balanagar)
- Established: ${site.established}
- Flutes: A, B, C, E, F, double wall and triple wall; 3, 5 and 7 ply
- Printing in-house: flexo, offset, digital, UV and screen
- Finishes: matte and gloss lamination, spot UV, foil stamping, emboss, deboss, window patching
- Plant: ${site.production.rows.map((r) => `${r.label} ${r.value}`).join("; ")}
- Minimum order: from 250 boxes (digital) and 500 boxes (RSC shippers)
- Delivery: same-day inside Hyderabad, next-day across Secunderabad, Medchal-Malkajgiri and the ORR corridor, two-day across Telangana and Andhra Pradesh, pan-India and export
- Hours: ${site.contact.hours}
- Email: ${resolvedContact.email ?? ""}${resolvedContact.phone ? `\n- Phone: ${resolvedContact.phone}` : ""}
- Pricing: quote-based only; request a quote at ${u("/quote")}

## Pages
- [Home](${u("/")}): the factory, box range, Jeedimetla location, industries, FAQs
- [Corrugated box manufacturers in Hyderabad](${u("/corrugated-box-manufacturers-hyderabad")}): local service page
- [Box types](${u("/boxes")}): all box families
${BOXES.map((b) => `- [${b.name}](${u(`/boxes/${b.id}`)}): ${b.desc}`).join("\n")}
- [3D box configurator](${u("/custom")}): set size, flute, board, print and finish, then send to quote
- [Industries and case studies](${u("/clients")})
- [Request a quote](${u("/quote")})

## Areas served
${site.nearbyAreas.join(", ")}, Hyderabad, Secunderabad, Telangana, Andhra Pradesh, pan-India and export.

## FAQs
${site.faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
