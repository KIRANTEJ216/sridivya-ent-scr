import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { QuoteFormValues } from "./customizer";

export type RfqRecord = QuoteFormValues & {
  reference: string;
  receivedAt: string;
  source?: string;
};

// Vercel's filesystem is read-only except /tmp, and /tmp is per-instance and
// temporary. There, WhatsApp and email are the real delivery channels.
const STORE_DIR = process.env.VERCEL ? "/tmp/sde-data" : path.join(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "rfqs.jsonl");

/** Reference a buyer can quote back: SDE-YYMMDD-XXXXXX */
export function makeReference(now = new Date()): string {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `SDE-${yy}${mm}${dd}-${rand}`;
}

/**
 * Append the RFQ to durable storage.
 *
 * This used to be a console.log that returned ok:true, so every enquiry the
 * floor ever received was silently discarded while the buyer saw a success
 * screen. Persistence now has to actually succeed before the API reports
 * success; a write failure throws and the route returns 500 rather than lying.
 */
export async function persistRfq(
  data: QuoteFormValues,
  meta: { source?: string } = {}
): Promise<RfqRecord> {
  const record: RfqRecord = {
    ...data,
    reference: makeReference(),
    receivedAt: new Date().toISOString(),
    source: meta.source,
  };

  await mkdir(STORE_DIR, { recursive: true });
  await appendFile(STORE_FILE, JSON.stringify(record) + "\n", "utf8");

  return record;
}

/** Best-effort read used by the ops view. Returns [] when nothing is stored yet. */
export async function listRfqs(limit = 200): Promise<RfqRecord[]> {
  let raw: string;
  try {
    raw = await readFile(STORE_FILE, "utf8");
  } catch {
    return [];
  }
  const lines = raw.split("\n").filter(Boolean);
  const out: RfqRecord[] = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line) as RfqRecord);
    } catch {
      /* skip a torn line rather than losing the whole file */
    }
  }
  return out.reverse().slice(0, limit);
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string
  );

/**
 * Optional email notification. Skipped unless RESEND_API_KEY is set, so the
 * site works without it. The stored file is always the source of truth.
 */
export async function notifyByEmail(r: RfqRecord): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const to = process.env.RFQ_NOTIFY_EMAIL;
  if (!to) return;

  const row = (k: string, v: string | number) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#8a8578;font-size:13px">${escapeHtml(k)}</td>` +
    `<td style="padding:6px 0;font-size:13px">${escapeHtml(String(v))}</td></tr>`;

  const html = `<div style="font-family:system-ui,sans-serif">
  <p style="font-size:15px"><strong>New RFQ ${escapeHtml(r.reference)}</strong></p>
  <table style="border-collapse:collapse;margin-top:10px">
    ${row("Company", r.company)}
    ${row("Contact", r.contactName)}
    ${row("Email", r.email)}
    ${row("Phone", r.phone)}
    ${row("Box", r.boxType)}
    ${row("Dimensions (mm)", `${r.length} x ${r.width} x ${r.height}`)}
    ${row("Flute", r.flute)}
    ${row("Board", r.grade)}
    ${row("Print", r.print)}
    ${row("Finish", r.finish || "-")}
    ${row("Quantity", r.quantity)}
    ${r.industries.length ? row("Industries", r.industries.join(", ")) : ""}
    ${r.message ? row("Message", r.message) : ""}
    ${r.artworkNote ? row("Artwork", r.artworkNote) : ""}
    ${r.dielineNote ? row("Dieline", r.dielineNote) : ""}
  </table></div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      from: process.env.RFQ_FROM_EMAIL ?? "onwebsite@sridivyaenterprises.com",
      to: [to],
      subject: `RFQ ${r.reference}: ${r.company} (${r.quantity} x ${r.boxType})`,
      html,
    }),
  });
}