import { NextResponse } from "next/server";
import { z } from "zod";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(120),
  email: z.string().trim().email("That email address does not look right"),
  message: z.string().trim().min(10, "Add a little more detail").max(2000),
  // Honeypot. Filled by bots, never by people.
  website: z.string().max(0).optional().or(z.literal("")),
});

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
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > 32_000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const flat: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!flat[key]) flat[key] = issue.message;
    }
    return NextResponse.json({ error: "Validation failed", fields: flat }, { status: 422 });
  }

  const { name, email, message } = parsed.data;
  const storeDir = path.join(process.cwd(), "data");
  const storeFile = path.join(storeDir, "messages.jsonl");

  try {
    await mkdir(storeDir, { recursive: true });
    await appendFile(
      storeFile,
      JSON.stringify({ name, email, message, receivedAt: new Date().toISOString() }) + "\n",
      "utf8"
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[contact] persistence failed", err);
    return NextResponse.json(
      { error: `We could not save that. Please email us at ${"sales@sridivyaenterprises.com"} instead.` },
      { status: 500 }
    );
  }
}