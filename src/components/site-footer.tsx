"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Mail, Phone, MapPin, Clock, ArrowRight, Leaf, BadgeCheck } from "lucide-react";
import { areaAddress, navLinks, resolvedAddress, resolvedCertifications, resolvedContact, site } from "@/lib/site";

type FormState = "idle" | "sending" | "sent" | "error";

export function SiteFooter() {
  /**
   * The homepage is a worldflight, and that grammar allows exactly one element
   * in document flow: the spacer. A footer adds its own height below the track,
   * so the last leg stops where the footer starts instead of at its own end,
   * and the "nothing else in flow" rule is broken by construction.
   *
   * The NAP that the footer would have carried is not lost: it is in the
   * flight's finale, inside the fixed stage, where it is still rendered,
   * still crawlable, and still the last thing on the page.
   */
  const pathname = usePathname();
  const [status, setStatus] = useState<FormState>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");

  // This form used to flip a local flag and send nothing at all while telling
  // the visitor "Message noted". It now posts to a real endpoint.
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setFormError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website: trap }),
      });
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setFormError(typeof json.error === "string" ? json.error : "That did not send.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setFormError("We could not reach the server. Please email us directly.");
      setStatus("error");
    }
  };

  if (pathname === "/") return null;

  return (
    <footer className="relative mt-24 border-t border-line bg-ink">
      <div className="divider-flute" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr]">
        {/* brand + capability */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg corrugated-texture" aria-hidden="true">
              <Package size={18} className="text-ink-deep" strokeWidth={2.2} />
            </span>
            <div className="leading-none">
              <p className="font-display text-base font-bold">{site.name}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-text-dim">{site.tagline}</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
            {site.claim}. Corrugated shippers, rigid gift boxes, food cartons and heavy-duty
            export crates engineered, printed and dispatched from one floor.
          </p>
          <p className="mt-4 font-mono text-xs text-text-dim">EST. {site.established}</p>
        </div>

        {/* nav */}
        <nav aria-label="Footer">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-dim">Explore</h2>
          <ul className="mt-4 grid gap-2.5 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-text-muted transition-colors hover:text-text">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* certifications */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-dim">Credentials</h2>
          <ul className="mt-4 grid gap-2.5 text-sm">
            {resolvedCertifications.map((c) => (
              <li key={c} className="flex gap-2 text-text-muted">
                <BadgeCheck size={15} className="mt-0.5 shrink-0 text-cyan-print" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-5 flex gap-2 text-xs leading-relaxed text-text-dim">
            <Leaf size={14} className="mt-0.5 shrink-0 text-cyan-print" aria-hidden="true" />
            Recycled liners, water-based inks, and near-zero landfill from cutting.
          </p>
        </div>

        {/* contact + mini form */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-dim">Talk to the floor</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-text-muted">
            {resolvedContact.phone && resolvedContact.phoneHref && (
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-cyan-print" aria-hidden="true" />
                <a href={`tel:${resolvedContact.phoneHref}`} className="hover:text-text">{resolvedContact.phone}</a>
              </li>
            )}
            {resolvedContact.email && (
              <li className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-cyan-print" aria-hidden="true" />
                <a href={`mailto:${resolvedContact.email}`} className="hover:text-text">{resolvedContact.email}</a>
              </li>
            )}
            {(
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-cyan-print" aria-hidden="true" />
                <address className="not-italic">{resolvedAddress ?? areaAddress}</address>
              </li>
            )}
            {resolvedContact.hours && (
              <li className="flex items-center gap-2">
                <Clock size={14} className="shrink-0 text-cyan-print" aria-hidden="true" />
                {resolvedContact.hours}
              </li>
            )}
          </ul>
          <form className="mt-5" onSubmit={onSubmit} aria-label="Quick contact">
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="footer-website">Leave this field empty</label>
              <input
                id="footer-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
              />
            </div>

            {status === "sent" ? (
              <p
                className="rounded-lg border border-cyan-print/30 bg-cyan-print/10 px-3 py-2.5 text-xs text-cyan-print"
                role="status"
              >
                Message received. We reply within one working day.
              </p>
            ) : (
              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="footer-name" className="sr-only">Your name</label>
                    <input
                      id="footer-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name"
                      className="field-input h-11 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="footer-email" className="sr-only">Email address</label>
                    <input
                      id="footer-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="field-input h-11 text-sm"
                    />
                  </div>
                </div>
                <label htmlFor="footer-message" className="sr-only">Your message</label>
                <textarea
                  id="footer-message"
                  required
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What do you need packed?"
                  className="field-input py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn btn-steel h-11 justify-center"
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
                {formError && (
                  <p className="text-xs text-orange-print" role="alert">
                    {formError}
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-text-dim sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p className="font-mono tracking-wide">Corrugated · Rigid · Printed · Export-grade</p>
        </div>
      </div>
    </footer>
  );
}
