import { NextResponse } from "next/server";
import { quoteFormSchema } from "@/lib/customizer";
import { persistRfq, notifyByEmail } from "@/lib/rfq-store";

export const runtime = "nodejs";
/** Filesystem persistence needs a long-lived Node runtime, not the edge. */
export const dynamic = "force-dynamic";

/** Crude per-IP throttle. Enough to stop casual abuse of a public form. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (throttled(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  // Guard against an oversized body before parsing it.
  const raw = await req.text();
  if (raw.length > 64_000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Honeypot: a real buyer never fills a field they cannot see.
  if (body && typeof body === "object" && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true, reference: "SDE-000000-000000" }, { status: 200 });
  }

  const parsed = quoteFormSchema.safeParse(body);
  if (!parsed.success) {
    const flat: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!flat[key]) flat[key] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed", fields: flat }, { status: 422 });
  }

  try {
    const record = await persistRfq(parsed.data, { source: "website" });
    // Notification is best effort. Storage already succeeded, so the enquiry
    // is safe even if the mail provider is down or unconfigured.
    notifyByEmail(record).catch(() => {});
    return NextResponse.json({ ok: true, reference: record.reference }, { status: 201 });
  } catch (err) {
    console.error("[RFQ] persistence failed", err);
    return NextResponse.json(
      { error: "We could not save your enquiry. Please email us directly." },
      { status: 500 }
    );
  }
}