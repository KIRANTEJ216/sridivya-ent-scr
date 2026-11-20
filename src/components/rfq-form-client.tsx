"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, FileUp, Paperclip, Send } from "lucide-react";
import {
  BOXES, FLUTES, PRINT_METHODS, FINISHES, MATERIAL_GRADES,
} from "@/lib/boxes";
import { quoteFormSchema } from "@/lib/customizer";
import { site } from "@/lib/site";
import { hasWhatsApp, quoteMessage, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export interface QuotePrefill {
  boxType: string;
  l: number;
  w: number;
  h: number;
  flute: string;
  grade: string;
  print: string;
  finish: string;
  qty: number;
}

export function RfqForm({ prefill }: { prefill: QuotePrefill }) {

  const [form, setForm] = useState({
    company: "", contactName: "", email: "", phone: "",
    boxType: prefill.boxType,
    length: prefill.l, width: prefill.w, height: prefill.h,
    flute: prefill.flute, grade: prefill.grade, print: prefill.print, finish: prefill.finish,
    quantity: prefill.qty,
    industries: [] as string[],
    message: "",
    artworkNote: "", dielineNote: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [artworkName, setArtworkName] = useState<string | null>(null);
  const [dielineName, setDielineName] = useState<string | null>(null);
  // Honeypot. Hidden from people, irresistible to bots. Never validated.
  const [trap, setTrap] = useState("");
  const [waHref, setWaHref] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    setServerError(null);
    const parsed = quoteFormSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      setStatus("error");
      return;
    }
    // Open the WhatsApp tab now, inside the click, so the browser does not
    // block it as a popup; it is pointed at the chat once the RFQ is saved.
    const waTab = hasWhatsApp ? window.open("", "_blank") : null;
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, artworkName, dielineName, website: trap }),
      });
      const json = await res.json().catch(() => ({}) as Record<string, unknown>);
      if (!res.ok) {
        if (json.fields && typeof json.fields === "object") {
          setErrors(json.fields as Record<string, string>);
        }
        setServerError(typeof json.error === "string" ? json.error : "Something went wrong.");
        setStatus("error");
        waTab?.close();
        return;
      }
      const ref = typeof json.reference === "string" ? json.reference : null;
      setReference(ref);
      if (hasWhatsApp) {
        const href = waLink(quoteMessage({ ...parsed.data, reference: ref }));
        setWaHref(href);
        if (waTab) waTab.location.href = href;
      }
      setStatus("sent");
    } catch {
      waTab?.close();
      setServerError("We could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  };

  const fieldErr = (k: string) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-1.5 text-xs text-orange-print" role="alert">
        {errors[k]}
      </p>
    ) : null;

  if (status === "sent") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 size={48} className="text-cyan-print" aria-hidden="true" />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Spec received.</h1>
        <p className="mt-3 text-text-muted">
          The floor has your RFQ. Expect a call or a quote in your inbox within one working
          day &mdash; {site.contact.hours}.
        </p>
        {reference && (
          <p className="mt-6 font-mono text-xs text-text-dim">
            Quote this reference: <span className="text-text">{reference}</span>
          </p>
        )}
        <p className="mt-2 text-xs text-text-dim">
          Keep it for follow-up. If nothing arrives in a working day, call the floor.
        </p>
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-8 h-12 px-7 text-base"
            style={{ background: "#25D366", color: "#062d17", fontWeight: 600 }}
          >
            Send this quote on WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <p className="kicker">Request for quotation</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Send the spec. We&apos;ll send numbers.</h1>
      <p className="mt-4 max-w-xl text-text-muted">
        Dimensions, board, print, quantity: whatever you have locked. Artwork and dielines
        can follow later; the quote starts with this form.
      </p>

      <form className="mt-10 grid gap-8" onSubmit={onSubmit} noValidate>
        {/* Honeypot. aria-hidden and off-screen; a person never fills it. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="rfq-website">Leave this field empty</label>
          <input
            id="rfq-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </div>
        {/* contact */}
        <fieldset className="grid gap-4 rounded-2xl border border-line bg-surface-2 p-6 sm:grid-cols-2">
          <legend className="sr-only">Your details</legend>
          <div className="sm:col-span-2">
            <label htmlFor="company" className="field-label">Company</label>
            <input id="company" className="field-input" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Acme Retail Pvt Ltd" aria-invalid={!!errors.company} aria-describedby={errors.company ? "err-company" : undefined} />
            {fieldErr("company")}
          </div>
          <div>
            <label htmlFor="contactName" className="field-label">Contact name</label>
            <input id="contactName" className="field-input" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Priya Sharma" aria-invalid={!!errors.contactName} aria-describedby={errors.contactName ? "err-contactName" : undefined} />
            {fieldErr("contactName")}
          </div>
          <div>
            <label htmlFor="email" className="field-label">Work email</label>
            <input id="email" type="email" className="field-input" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="priya@acme.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined} />
            {fieldErr("email")}
          </div>
          <div>
            <label htmlFor="phone" className="field-label">Phone</label>
            <input id="phone" type="tel" className="field-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Mobile number" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "err-phone" : undefined} />
            {fieldErr("phone")}
          </div>
          <div>
            <label htmlFor="qty" className="field-label">Quantity (boxes)</label>
            <input id="qty" type="number" min={1} className="field-input" value={form.quantity} onChange={(e) => set("quantity", Number(e.target.value))} aria-invalid={!!errors.quantity} aria-describedby={errors.quantity ? "err-quantity" : undefined} />
            {fieldErr("quantity")}
          </div>
        </fieldset>

        {/* box spec */}
        <fieldset className="grid gap-4 rounded-2xl border border-line bg-surface-2 p-6 sm:grid-cols-2">
          <legend className="sr-only">Box specification</legend>
          <div>
            <label htmlFor="boxType" className="field-label">Box type</label>
            <select id="boxType" className="field-input" value={form.boxType} onChange={(e) => set("boxType", e.target.value)}>
              {BOXES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="flute" className="field-label">Flute</label>
            <select id="flute" className="field-input" value={form.flute} onChange={(e) => set("flute", e.target.value)}>
              {FLUTES.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.mm})</option>)}
            </select>
          </div>
          {([["length", "Length (mm)"], ["width", "Width (mm)"], ["height", "Height (mm)"]] as const).map(([k, label]) => (
            <div key={k}>
              <label htmlFor={k} className="field-label">{label}</label>
              <input id={k} type="number" min={1} className="field-input" value={form[k]} onChange={(e) => set(k, Number(e.target.value))} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `err-${k}` : undefined} />
              {fieldErr(k)}
            </div>
          ))}
          <div>
            <label htmlFor="grade" className="field-label">Board grade</label>
            <select id="grade" className="field-input" value={form.grade} onChange={(e) => set("grade", e.target.value)}>
              {MATERIAL_GRADES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="print" className="field-label">Printing</label>
            <select id="print" className="field-input" value={form.print} onChange={(e) => set("print", e.target.value)}>
              {PRINT_METHODS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="finish" className="field-label">Finish (optional)</label>
            <select id="finish" className="field-input" value={form.finish} onChange={(e) => set("finish", e.target.value)}>
              <option value="">None selected</option>
              {FINISHES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </fieldset>

        {/* industries */}
        <fieldset className="rounded-2xl border border-line bg-surface-2 p-6">
          <legend className="field-label !mb-3">Your industry</legend>
          <div className="flex flex-wrap gap-2">
            {site.industries.map((ind) => {
              const on = form.industries.includes(ind.id);
              return (
                <button
                  key={ind.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    set("industries", on ? form.industries.filter((x) => x !== ind.id) : [...form.industries, ind.id])
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    on ? "border-cyan-print bg-cyan-print/15 text-text" : "border-line text-text-muted hover:text-text"
                  )}
                >
                  {ind.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* uploads */}
        <fieldset className="grid gap-4 rounded-2xl border border-line bg-surface-2 p-6 sm:grid-cols-2">
          <legend className="sr-only">Artwork & dieline</legend>
          {([
            ["artwork", "Artwork file (AI / PDF / PNG)", artworkName, setArtworkName],
            ["dieline", "Dieline file (PDF / DXF)", dielineName, setDielineName],
          ] as const).map(([key, label, name, setName]) => (
            <div key={key}>
              <span className="field-label">{label}</span>
              <label
                htmlFor={`upload-${key}`}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line px-4 py-4 text-sm text-text-dim transition-colors hover:border-cyan-print/60 hover:text-text"
              >
                {key === "artwork" ? <FileUp size={18} aria-hidden="true" /> : <Paperclip size={18} aria-hidden="true" />}
                <span>{name ?? "Attach file (any format, we confirm by email)"}</span>
                <input
                  id={`upload-${key}`}
                  type="file"
                  className="sr-only"
                  accept={key === "artwork" ? ".ai,.pdf,.png,.jpg,.eps" : ".pdf,.dxf,.dwg"}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setName(f.name);
                  }}
                />
              </label>
            </div>
          ))}
        </fieldset>

        {/* message */}
        <fieldset className="rounded-2xl border border-line bg-surface-2 p-6">
          <legend className="sr-only">Project notes</legend>
          <label htmlFor="message" className="field-label">Anything else: product, deadlines, delivery city</label>
          <textarea id="message" className="field-input" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="e.g. shipping ceramic mugs to tier-2 cities, need crush test advice…" />
        </fieldset>

        {status === "error" && Object.keys(errors).length === 0 && (
          <p className="rounded-lg border border-orange-print/40 bg-orange-print/10 px-4 py-3 text-sm text-orange-print" role="alert">
            {serverError ?? "Something went wrong sending the form."} Try again, or email{" "}
            <a href={`mailto:${site.contact.email}`} className="underline">{site.contact.email}</a>{" "}
            directly.
          </p>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-text-dim">Reply within one working day. No pricing on this site. Quotes come from the floor, person to person.</p>
          <button type="submit" className="btn btn-primary h-12 px-8 text-base" disabled={status === "sending"}>
            <Send size={16} aria-hidden="true" />
            {status === "sending" ? "Sending…" : "Send RFQ"}
          </button>
        </div>
      </form>
    </div>
  );
}