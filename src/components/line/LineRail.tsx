"use client";

import { useEffect, useRef, useState } from "react";
import { LEGS } from "@/lib/flight";

/**
 * The nav is a map.
 *
 * In worldflight the header must be a waypoint list, because a world you
 * cannot skip around in is a video. The engine renders no rail: it publishes
 * only --sc-seg and --sc-segp and fires sc:waypoint. Everything below is built
 * in the page, which is why it is here rather than in the kit.
 */
export function LineRail() {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const onWaypoint = (e: Event) => {
      const detail = (e as CustomEvent).detail as { index: number };
      setActive(detail.index);
    };
    addEventListener("sc:waypoint", onWaypoint);
    return () => removeEventListener("sc:waypoint", onWaypoint);
  }, []);

  // Seek a leg by scrolling to its start on the track.
  const goTo = (i: number) => {
    const root = document.querySelector<HTMLElement>(".ff");
    if (!root) return;
    const vh = window.innerHeight;
    const top = root.getBoundingClientRect().top + window.scrollY;
    const before = LEGS.slice(0, i).reduce((a, l) => a + l.weight, 0);
    window.scrollTo({ top: top + (before + 0.12) * vh, behavior: "smooth" });
  };

  return (
    <nav className="line-rail" aria-label="Production line">
      <ol ref={railRef} className="line-rail__track">
        <span className="line-rail__line" aria-hidden="true" />
        <span className="line-rail__marker" style={{ left: `${LEGS[active].plate * 100}%` }} aria-hidden="true" />
        {LEGS.map((l, i) => (
          <li key={l.id} className="line-rail__stop">
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-current={active === i ? "step" : undefined}
              className="line-rail__btn"
            >
              <span className="line-rail__dot" aria-hidden="true" />
              <span className="line-rail__label">{l.short}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="line-rail__now" aria-live="polite">
        <span className="line-rail__idx">{String(active + 1).padStart(2, "0")}</span>
        <span className="line-rail__full">{LEGS[active].label}</span>
      </p>
    </nav>
  );
}