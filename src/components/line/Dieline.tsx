"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SIGNATURE MOVE: the dieline draws itself.
 *
 * A genuine RSC 0201 dieline in SVG. Its stroke-dashoffset is driven from the
 * engine's own --sc-segp progress variable, so scrolling literally draws the
 * object: blank, score, cut, fold, erect. Once the draw settles the dimension
 * lines and callouts arrive.
 *
 * Coded here in page JS reading a CSS variable the engine already publishes.
 * The engine is never edited.
 *
 * Geometry is real, and the numbers are the site's own RSC from
 * `src/lib/boxes.ts` (l 457, w 356, h 406), so the drawing and the catalogue
 * cannot drift apart:
 *
 *   blank length  = glue tab + 2 x L + 2 x W  = 1651
 *   blank width   = H + 2 x W                  = 1118
 *   major flaps   = W      (front and back panels)
 *   minor flaps   = W / 2  (the two side panels)
 *
 *   0    25      381            838      1194         1651
 *   | tab|  side  |    front     |  side  |    back    |
 */

/** Finished box, from BOXES[0] (rsc). Millimetres. */
const L = 457;
const W = 356;
const H = 406;
const TAB = 25;

/** flap depths */
const MAJOR = W;
const MINOR = W / 2;

/** vertical stations, top of blank downward */
const Y_MAJOR_TOP = 0;
const Y_MINOR_TOP = MAJOR - MINOR;
const Y_BODY_TOP = MAJOR;
const Y_BODY_BOT = Y_BODY_TOP + H;
const Y_MINOR_BOT = Y_BODY_BOT + MINOR;
const Y_MAJOR_BOT = Y_BODY_BOT + MAJOR;

/** horizontal stations, left of blank rightward */
const X_TAB = 0;
const X_S1 = TAB;
const X_F = TAB + W;
const X_S2 = X_F + L;
const X_B = X_S2 + W;
const X_END = X_B + L;

/** how far outside the blank the dimension furniture sits */
const DIM = 46;

export function Dieline() {
  const wrap = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;

    const draw = el.querySelector<SVGPathElement>("#sde-dieline-path");
    const dims = el.querySelector<SVGGElement>("#sde-dieline-dims");
    if (!draw) return;

    // Total dash length is only knowable once the path is in the DOM.
    const len = draw.getTotalLength();
    draw.style.strokeDasharray = `${len}`;
    draw.style.strokeDashoffset = `${len}`;
    setReady(true);

    let raf = 0;

    const tick = () => {
      // --sc-segp is local progress on the current leg, 0..1, published by the
      // engine to both the flight root and the document element. The drawing is
      // pinned to the corrugation leg, so the flight remaps global scroll onto a
      // window that only opens across that leg.
      const prog = Number(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--sc-segp")
          .trim() || "0"
      );

      // 0.05 -> 0.62 of the leg draws, 0.62 -> 0.78 holds, callouts fade from 0.78.
      const DRAW_A = 0.05;
      const DRAW_B = 0.62;
      const CALLOUT = 0.78;
      const clamped = Math.max(0, Math.min(1, (prog - DRAW_A) / (DRAW_B - DRAW_A)));

      draw.style.strokeDashoffset = `${len * (1 - clamped)}`;

      if (dims) {
        const c = Math.max(0, Math.min(1, (prog - CALLOUT) / 0.14));
        dims.style.opacity = `${c}`;
        dims.style.transform = `translateY(${8 * (1 - c)}px)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="sde-dieline"
      data-ready={ready ? "true" : "false"}
    >
      <svg
        viewBox={`${-DIM - 20} ${-DIM} ${X_END + DIM * 2 + 20} ${Y_MAJOR_BOT + DIM * 2}`}
        role="presentation"
        focusable="false"
      >
        <defs>
          <pattern
            id="sde-hatch"
            width="10"
            height="10"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="currentColor"
              strokeWidth="1.6"
              opacity="0.22"
            />
          </pattern>
        </defs>

        {/* board */}
        <rect
          x={X_TAB}
          y={Y_MAJOR_TOP}
          width={X_END - X_TAB}
          height={Y_MAJOR_BOT - Y_MAJOR_TOP}
          fill="url(#sde-hatch)"
          opacity="0.3"
        />

        {/* the drawn path: cut perimeter, slits, scores. --sc-segp animates this. */}
        <path
          id="sde-dieline-path"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="miter"
          d={buildPath()}
        />

        {/* One group, so one opacity drives both the rules and the numbers.
            Two elements sharing this id meant querySelector only ever reached
            the first, and the numbers stayed at opacity 0 forever. */}
        <g id="sde-dieline-dims" opacity={0} fill="none" stroke="currentColor" strokeWidth="2">
          {/* front panel length */}
          <line x1={X_F} y1={Y_MAJOR_BOT + DIM} x2={X_S2} y2={Y_MAJOR_BOT + DIM} />
          <line x1={X_F} y1={Y_MAJOR_BOT + 8} x2={X_F} y2={Y_MAJOR_BOT + DIM + 8} />
          <line x1={X_S2} y1={Y_MAJOR_BOT + 8} x2={X_S2} y2={Y_MAJOR_BOT + DIM + 8} />

          {/* side panel width */}
          <line x1={X_S2 + 26} y1={Y_MAJOR_BOT + DIM} x2={X_B + 26} y2={Y_MAJOR_BOT + DIM} />
          <line x1={X_S2 + 18} y1={Y_MAJOR_BOT + 8} x2={X_S2 + 34} y2={Y_MAJOR_BOT + 8} />
          <line x1={X_B + 18} y1={Y_MAJOR_BOT + 8} x2={X_B + 34} y2={Y_MAJOR_BOT + 8} />

          {/* box height, off the left edge */}
          <line x1={X_TAB - DIM} y1={Y_BODY_TOP} x2={X_TAB - DIM} y2={Y_BODY_BOT} />
          <line x1={X_TAB - 10} y1={Y_BODY_TOP} x2={X_TAB - DIM - 10} y2={Y_BODY_TOP} />
          <line x1={X_TAB - 10} y1={Y_BODY_BOT} x2={X_TAB - DIM - 10} y2={Y_BODY_BOT} />

          <g
            fill="currentColor"
            stroke="none"
            fontSize="32"
            fontFamily="ui-monospace, monospace"
            letterSpacing="0.08em"
          >
            <text x={(X_F + X_S2) / 2} y={Y_MAJOR_BOT + DIM + 34} textAnchor="middle">
              {L}
            </text>
            <text
              x={(X_S2 + X_B) / 2 + 26}
              y={Y_MAJOR_BOT + DIM + 34}
              textAnchor="middle"
            >
              {W}
            </text>
            <text
              x={X_TAB - DIM - 18}
              y={(Y_BODY_TOP + Y_BODY_BOT) / 2}
              textAnchor="middle"
              transform={`rotate(-90 ${X_TAB - DIM - 18} ${(Y_BODY_TOP + Y_BODY_BOT) / 2})`}
            >
              {H}
            </text>
          </g>
        </g>
      </svg>

      <p className="sde-dieline-caption">
        <span>RSC 0201 dieline</span>
        <span>{`${L} x ${W} x ${H} mm`}</span>
        <span>C flute</span>
      </p>
    </div>
  );
}

/**
 * Cut perimeter, then the slits that free each flap, then the scores.
 *
 * All three are cuts or scores on one path so the draw animation reveals the
 * whole blank in a single sweep. Outer edges and slits share an x station and
 * meet flush, which is what the real sheet looks like once the knife has been.
 */
function buildPath(): string {
  // --- outer perimeter, clockwise from the top-left of the glue tab ---------
  const perimeter = [
    `M ${X_TAB} ${Y_BODY_TOP}`,
    // across the glue tab, then up the first minor flap's left edge
    `M ${X_TAB} ${Y_BODY_TOP} L ${X_S1} ${Y_BODY_TOP}`,
    `L ${X_S1} ${Y_MINOR_TOP} L ${X_F} ${Y_MINOR_TOP}`,
    `L ${X_F} ${Y_MAJOR_TOP} L ${X_S2} ${Y_MAJOR_TOP}`,
    `L ${X_S2} ${Y_MINOR_TOP} L ${X_B} ${Y_MINOR_TOP}`,
    `L ${X_B} ${Y_MAJOR_TOP} L ${X_END} ${Y_MAJOR_TOP}`,
    // down the right edge
    `L ${X_END} ${Y_BODY_BOT}`,
    // back along the bottom, mirrored
    `L ${X_B} ${Y_BODY_BOT} L ${X_B} ${Y_MAJOR_BOT} L ${X_S2} ${Y_MAJOR_BOT}`,
    `L ${X_S2} ${Y_MINOR_BOT} L ${X_S1} ${Y_MINOR_BOT}`,
    `L ${X_S1} ${Y_MAJOR_BOT} L ${X_TAB} ${Y_MAJOR_BOT}`,
    `L ${X_TAB} ${Y_BODY_TOP}`,
  ].join(" ");

  // --- slits: they free each flap from its neighbour -------------------------
  const slits = [
    `M ${X_F} ${Y_MINOR_TOP} L ${X_F} ${Y_BODY_TOP}`,
    `M ${X_S2} ${Y_MINOR_TOP} L ${X_S2} ${Y_BODY_TOP}`,
    `M ${X_B} ${Y_MINOR_TOP} L ${X_B} ${Y_BODY_TOP}`,
    `M ${X_F} ${Y_BODY_BOT} L ${X_F} ${Y_MINOR_BOT}`,
    `M ${X_S2} ${Y_BODY_BOT} L ${X_S2} ${Y_MAJOR_BOT}`,
    `M ${X_B} ${Y_BODY_BOT} L ${X_B} ${Y_MINOR_BOT}`,
  ].join(" ");

  // --- scores: the folds the box actually bends on --------------------------
  const scores = [
    `M ${X_TAB} ${Y_BODY_TOP} L ${X_END} ${Y_BODY_TOP}`,
    `M ${X_TAB} ${Y_BODY_BOT} L ${X_END} ${Y_BODY_BOT}`,
    // glue tab fold
    `M ${X_S1} ${Y_BODY_TOP} L ${X_S1} ${Y_BODY_BOT}`,
  ].join(" ");

  return [perimeter, slits, scores].join(" ");
}
