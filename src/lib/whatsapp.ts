import { site } from "@/lib/site";

/**
 * WhatsApp sales line, digits only with country code (e.g. 919876543210).
 *
 * Set NEXT_PUBLIC_WHATSAPP_NUMBER in Vercel (or .env locally). It is inlined at
 * build time, so redeploy after changing it. Falls back to site.contact.whatsapp.
 */
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || site.contact.whatsapp || ""
).replace(/[^\d]/g, "");

export const hasWhatsApp = WHATSAPP_NUMBER.length >= 10;

export function waLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const WA_GREETING = `Hi ${site.name}, I'd like a quote for corrugated boxes.`;

type QuoteSummary = {
  reference?: string | null;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  boxType: string;
  length: number;
  width: number;
  height: number;
  flute: string;
  grade: string;
  print: string;
  finish?: string;
  quantity: number;
  message?: string;
};

export function quoteMessage(q: QuoteSummary): string {
  return [
    `New quote request${q.reference ? ` ${q.reference}` : ""} from the website`,
    ``,
    `Company: ${q.company}`,
    `Contact: ${q.contactName}`,
    `Phone: ${q.phone}`,
    `Email: ${q.email}`,
    ``,
    `Box: ${q.boxType}`,
    `Size (mm): ${q.length} x ${q.width} x ${q.height}`,
    `Flute: ${q.flute} | Board: ${q.grade}`,
    `Print: ${q.print}${q.finish ? ` | Finish: ${q.finish}` : ""}`,
    `Quantity: ${q.quantity}`,
    q.message ? `\nNotes: ${q.message}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
}
