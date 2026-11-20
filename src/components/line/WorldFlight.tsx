"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LEGS, SEAM, LERP, windowFor, assetUrl } from "@/lib/flight";
import { resolvedAddress, resolvedContact } from "@/lib/site";
import { LEG_COPY, FINALE } from "./copy";
import { LineRail } from "./LineRail";
import { Dieline } from "./Dieline";

type SC = {
  mount: (root: Element) => { destroy?: () => void };
  setMotion?: (mode: "on" | "off" | null) => boolean;
  reduce?: boolean;
  motion?: () => "on" | "off" | null;
};

declare global {
  interface Window {
    ScrollCraft?: SC;
  }
}

const poster = (id: string) => assetUrl(`${id}-poster.webp`);
const clip = (id: string) => assetUrl(`${id}.mp4`);
const clipMobile = (id: string) => assetUrl(`${id}-m.mp4`);

export function WorldFlight() {
  const api = useRef<{ destroy?: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  /* null = follow the OS. Tracked separately from the effective value so the
   * control can tell "reduced because your system says so" apart from
   * "reduced because you asked for it". */
  const [motion, setMotion] = useState<"on" | "off" | null>(null);
  const [osReduced, setOsReduced] = useState(false);

  /** The effective preference, which is what the engine actually obeys. */
  const reduced = motion === null ? osReduced : motion === "off";

  /**
   * Mount on the engine being present, not on this component being present.
   *
   * The two are not the same moment. A `defer`red engine has usually run before
   * React hydrates, but on a cold cache it can land after, so both orderings
   * happen and only the poll covers the second.
   *
   * The mount target is the document, NOT this element. The engine collects
   * stages with `root.querySelectorAll('[data-sc-mode="worldflight"]')`, so the
   * root has to be an ancestor of the flight. Handing it the flight div makes it
   * search inside itself, find nothing, and build zero worlds: no spacer, no
   * fixed stage, no warning, and progress numbers that read correctly while
   * nothing on screen ever moves.
   */
  useEffect(() => {
    if (!ready || api.current || !window.ScrollCraft) return;
    api.current = window.ScrollCraft.mount(document.body);
    return () => {
      api.current?.destroy?.();
      api.current = null;
    };
  }, [ready]);

  useEffect(() => {
    if (window.ScrollCraft) setReady(true);
    const id = setInterval(() => {
      if (!window.ScrollCraft) return;
      setReady(true);
      clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, []);

  /**
   * The spacer is sized once, at mount, from innerHeight. If that measures 0,
   * the page has no scroll track, the flight never advances, and it fails
   * silently: engine mounted, legs registered, nothing in the console, and a
   * still image you cannot scroll.
   *
   * The fonts.ready half earns its place on its own. A webfont swapping in
   * changes the measured height of every copy block, so anything sized against
   * them (the scrim, the rail) is wrong until it re-measures.
   */
  useEffect(() => {
    const relayout = () => dispatchEvent(new Event("resize"));
    addEventListener("load", relayout);
    if (document.fonts?.ready) document.fonts.ready.then(relayout);
    const t = setTimeout(relayout, 400);
    return () => {
      removeEventListener("load", relayout);
      clearTimeout(t);
    };
  }, []);

/**
   * Mirror the effective preference into state.
   *
   * Read from the engine rather than recomputed here, because the engine also
   * follows live OS changes — and it is the engine that gets overridden, so the
   * two have to agree. Polled until it exists for the same reason `ready` is:
   * the engine is deferred and can land after hydration.
   */
  useEffect(() => {
    if (!ready) return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setOsReduced(mq.matches);
      const forced = window.ScrollCraft?.motion?.() ?? null;
      // Functional update, so this needs no `motion` dependency. The interval
      // holds one closure for its whole life, so reading `motion` from it would
      // compare against a stale render forever.
      setMotion((prev) => (prev === forced ? prev : forced));
    };
    sync();
    const id = setInterval(sync, 400);
    mq.addEventListener("change", sync);
    return () => {
      clearInterval(id);
      mq.removeEventListener("change", sync);
    };
  }, [ready]);

  /**
   * Overriding the engine is not enough on its own — loadClip() bails while
   * reduced, so the flip has to re-run layout and read or nothing ever loads.
   * setMotion() does both; this only has to hand it the new mode and mirror the
   * result.
   */
  const override = (next: "on" | "off") => {
    window.ScrollCraft?.setMotion?.(next);
    setMotion(next);
    setOsReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
  };

  return (
    <>
      <div
        data-sc-mode="worldflight"
        data-sc-seam={SEAM}
        data-sc-lerp={LERP}
        className="sde-flight"
      >
        {/* the one fixed stage. every leg is mounted at once and stays mounted;
            a src swap is a black frame, and a black frame is the cut this
            mode exists to remove. */}
        <div data-sc-world>
          {LEGS.map((leg) => (
            <div
              key={leg.id}
              data-sc-segment
              data-sc-w={leg.weight}
              data-sc-linger={0}
              data-sc-waypoint={leg.label}
            >
              {/* Plain img on purpose. The engine owns these nodes: it holds the
                  poster until a real frame paints, then writes opacity and
                  transform on it. next/image wraps the element in its own span
                  and owns sizing, so the poster would fight the reveal. These
                  are pre-compressed webp files, so there is no optimiser win
                  left to give up. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="sc-world__poster" src={poster(leg.id)} alt="" decoding="async" />
              <video
                data-sc-src={clip(leg.id)}
                data-sc-src-mobile={clipMobile(leg.id)}
                muted
                playsInline
                preload="none"
              />
            </div>
          ))}
        </div>

        {/* copy arrives inside the world, at waypoints. the scrim is a SIBLING
            of the copy, never a child, so it can be shaped to the copy. */}
        <div data-sc-world-copy>
          <div className="sc-world__scrim sc-scrim sc-scrim--band" aria-hidden="true" />

          {LEGS.map((leg, i) => {
            const copy = LEG_COPY[i];
            const anchor = copy.anchor === "lead" ? "sc-copy--lead" : "sc-copy--trail";
            return (
              <div
                key={leg.id}
                className={`sc-copy ${anchor} sde-copy`}
                data-sc-copy
                data-sc-window={i === 0 ? "hero" : windowFor(i)}
              >
                {i === 0 ? (
                  <header className="sde-hero">
                    <p className="sde-kicker">{copy.kicker}</p>
                    <h1 className="sde-h1">{copy.heading}</h1>
                    <p className="sde-body">{copy.body}</p>
                    <div className="sde-cta">
                      <Link href="/quote" className="btn btn-primary h-12 px-7 text-base">
                        Request a quote
                      </Link>
                      <Link href="/boxes" className="btn btn-ghost h-12 px-6 text-base">
                        See the box families
                      </Link>
                    </div>
                  </header>
                ) : (
                  <>
                    <p className="sde-kicker">{copy.kicker}</p>
                    <h2 className="sde-h2">{copy.heading}</h2>
                    <p className="sde-body">{copy.body}</p>
                    {copy.spec && <p className="sde-spec">{copy.spec}</p>}
                  </>
                )}
              </div>
            );
          })}

          {/* the signature move lives in the chrome, not in an act, so it
              outlives the leg that started it */}
          <Dieline />

          <div
            className="sc-copy sc-copy--lead sde-finale"
            data-sc-copy
            data-sc-window="finale"
          >
            <p className="sde-kicker">{FINALE.kicker}</p>
            <h2 className="sde-h2 sde-h2--xl">{FINALE.heading}</h2>
            <p className="sde-body">{FINALE.body}</p>
            {/* The homepage carries no footer, because a footer in document flow
                ends the scroll track early. So the NAP lives here, inside the
                fixed stage: last thing on the page, and still crawlable.

                Only resolved values render. A "+91 98XXX XXXXX" printed at the
                end of the journey reads as an unfinished business, which is
                exactly what the placeholder-free site must not do — so the
                address and phone simply drop out until they are real, and the
                email (which is configured) carries the line alone. */}
            <address className="sde-nap not-italic">
              {resolvedAddress && <span>{resolvedAddress}</span>}
              {resolvedContact.phone && resolvedContact.phoneHref && (
                <a href={`tel:${resolvedContact.phoneHref}`}>{resolvedContact.phone}</a>
              )}
              {resolvedContact.email && (
                <a href={`mailto:${resolvedContact.email}`}>{resolvedContact.email}</a>
              )}
            </address>
            <div className="sde-cta">
              <Link href="/quote" className="btn btn-primary h-13 px-8 text-base">
                Request a quote
              </Link>
              <Link href="/clients" className="btn btn-ghost h-12 px-6 text-base">
                Industries we serve
              </Link>
            </div>
          </div>
        </div>

        <LineRail />
        <div data-sc-spacer aria-hidden="true" />
      </div>

      {/* Reduced motion is the engine working correctly, not a fault — but it
          looks exactly like a broken hero, so it has to say so out loud and
          offer the one thing an OS preference cannot: an opt-in for this page.

          `fixed`, not `absolute`, and deliberately OUTSIDE [data-sc-world]. That
          stage is a stacking context at z-index 1 and the chrome around it sits
          at 50–60, so a control parented inside it is buried under the header
          and the line rail no matter how high its own z-index goes. As a
          viewport-pinned sibling it clears all of it.

          Deliberately NOT inside [data-sc-world-copy] either: the engine fades
          every copy window with scroll, so it would disappear exactly when
          someone reaches for it. */}
      {(reduced || motion !== null) && (
        <div className="pointer-events-auto fixed bottom-[4.75rem] right-4 z-[70] flex items-center gap-3 rounded-full border border-line bg-surface-1/90 px-3.5 py-1.5 backdrop-blur-sm sm:right-6">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-text-dim">
            {motion === null
              ? "Motion reduced by your system"
              : motion === "on"
                ? "Flight motion on"
                : "Motion paused"}
          </span>
          <button
            type="button"
            onClick={() => override(motion === "on" ? "off" : "on")}
            className="btn btn-primary !h-7 !rounded-full !px-3 !text-[0.7rem]"
          >
            {motion === "on" ? "Stop motion" : "Play anyway"}
          </button>
        </div>
      )}
    </>
  );
}