import { useId, type ReactElement } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  rscGeometry,
  perimeter,
  slits,
  scores,
  isometricTransform,
} from "@/lib/dieline";

/**
 * BoxDieline — the carton blank, drawn.
 *
 * This replaces a CSS-3D box that never worked: six `transform-style:
 * preserve-3d` faces whose perspective collapsed at some viewport widths, whose
 * inner walls showed through the outer ones, and whose flaps floated free of the
 * rim. Perspective CSS needs a camera, a vanishing point and a clipping plane to
 * stay consistent while the viewport changes, and none of that survives being
 * driven by CSS variables from a scroll handler.
 *
 * An SVG blank needs none of it. It is one flat plane, it is exact at every
 * width, it prints, it scales, and it is the thing a packaging buyer actually
 * recognises: the unfolded blank with its cuts and scores.
 */

/**
 * One source of truth for board colour, because board colour is a property of
 * the stock, not of the drawing that shows it.
 *
 *   panel/dark/line  the unfolded blank: face fill, shaded flap, cut line
 *   top/side         the folded carton: the two receding planes, which catch
 *                    light differently from the front
 *   print            the ink a converter would actually put on this board —
 *                    dark on kraft and white-top, light on the dark boards,
 *                    which is the one thing that cannot be derived from `panel`
 */
export const COLORWAYS = {
  kraft: {
    panel: "var(--color-kraft)",
    dark: "var(--color-kraft-deep)",
    line: "var(--color-ink-deep)",
    top: "oklch(0.78 0.09 79)",
    side: "oklch(0.52 0.085 70)",
    print: "oklch(0.26 0.05 65)",
  },
  "white-top": {
    panel: "oklch(0.92 0.012 85)",
    dark: "oklch(0.8 0.03 82)",
    line: "var(--color-ink-deep)",
    top: "oklch(0.97 0.008 85)",
    side: "oklch(0.74 0.028 82)",
    print: "oklch(0.24 0.015 260)",
  },
  "printed-cmyk": {
    panel: "var(--color-kraft)",
    dark: "var(--color-kraft-deep)",
    line: "var(--color-ink-deep)",
    top: "oklch(0.78 0.09 79)",
    side: "oklch(0.52 0.085 70)",
    print: "oklch(0.26 0.05 65)",
  },
  "printed-orange": {
    panel: "oklch(0.78 0.09 70)",
    dark: "oklch(0.6 0.1 68)",
    line: "var(--color-ink-deep)",
    top: "oklch(0.86 0.1 73)",
    side: "oklch(0.6 0.1 66)",
    print: "oklch(0.25 0.06 60)",
  },
  "printed-cyan": {
    panel: "oklch(0.72 0.08 225)",
    dark: "oklch(0.55 0.09 225)",
    line: "oklch(0.16 0.02 225)",
    top: "oklch(0.81 0.085 227)",
    side: "oklch(0.5 0.085 224)",
    print: "oklch(0.97 0.01 225)",
  },
  ink: {
    panel: "oklch(0.3 0.02 260)",
    dark: "oklch(0.22 0.02 260)",
    line: "oklch(0.92 0.01 260)",
    top: "oklch(0.4 0.022 260)",
    side: "oklch(0.19 0.018 260)",
    print: "oklch(0.93 0.012 85)",
  },
} as const;

export type Colorway = keyof typeof COLORWAYS;

/** Print treatments, drawn as real marks on the front panel rather than as a
 *  background wash, so they stay legible at thumbnail size. */
const PRINTS: Record<string, ReactElement> = {
  "cmyk-dots": (
    <g>
      <circle cx="0.34" cy="0.4" r="0.055" fill="oklch(0.6 0.2 25)" />
      <circle cx="0.47" cy="0.46" r="0.045" fill="oklch(0.65 0.18 260)" />
      <circle cx="0.4" cy="0.56" r="0.05" fill="oklch(0.75 0.15 145)" />
      <circle cx="0.54" cy="0.36" r="0.038" fill="oklch(0.8 0.14 90)" />
    </g>
  ),
  halftone: (
    <g fill="oklch(0.71 0.17 55 / 0.75)">
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={i} cx={0.32 + i * 0.035} cy={0.4 + (i % 3) * 0.03} r="0.016" />
      ))}
    </g>
  ),
  barcode: (
    <g fill="oklch(0.15 0.01 260)">
      {[0, 1, 3, 4, 6, 8, 9, 11].map((i) => (
        <rect key={i} x={0.3 + i * 0.028} y="0.36" width="0.014" height="0.14" />
      ))}
    </g>
  ),
  "orange-bold": (
    <g fill="none" stroke="oklch(0.71 0.17 55 / 0.9)" strokeWidth="0.022">
      <path d="M0.3 0.42 L0.62 0.36" />
      <path d="M0.3 0.5 L0.5 0.45" />
    </g>
  ),
  "cyan-glow": (
    <g fill="oklch(0.78 0.13 220 / 0.45)">
      <path d="M0.3 0.34 L0.62 0.4 L0.6 0.5 L0.3 0.46 Z" />
    </g>
  ),
};

export interface BoxDielineProps {
  /** Finished box in the catalogue's units. `w` is the front panel, `d` the
   *  side panel, `h` the box height. */
  w: number;
  h: number;
  d: number;
  colorway: Colorway;
  pattern?: string;
  className?: string;
  style?: CSSProperties;
  /** Uniform scale on the rendered box, 1 = fill the frame. */
  scale?: number;
  /** Draw the maker's mark on the front panel. */
  branded?: boolean;
  /** Accessible name; omit for decorative repeats. */
  label?: string;
}

const VIEW_W = 420;
const VIEW_H = 300;

export function BoxDieline({
  w,
  h,
  d,
  colorway,
  pattern,
  className,
  style,
  scale = 1,
  branded = true,
  label,
}: BoxDielineProps) {
  const cw = COLORWAYS[colorway] ?? COLORWAYS.kraft;
  const g = rscGeometry(w, d, h);
  // useId, not a counter: a module-level sequence renders differently on the
  // server and the client, and React throws that mismatch away as a hydration
  // error rather than showing the wrong clip.
  const uid = useId();
  const { transform } = isometricTransform(g, VIEW_W, VIEW_H);
  const print = pattern ? PRINTS[pattern] : null;
  // `scale` trims the blank inside its frame without changing the geometry.
  const placed = scale === 1 ? transform : transform.replace(/scale\(([\d.]+)\)/, (_, k) => `scale(${Number(k) * scale})`);

  // Front panel, in blank coordinates, for placing print and the wordmark.
  const fw = g.X.s2 - g.X.f;
  const fh = g.Y.bodyBot - g.Y.bodyTop;
  const fx = g.X.f;
  const fy = g.Y.bodyTop;
  const k = fw / 100; // blank units per percent, for scaling print marks

  return (
    <svg
      className={cn("bdl", className)}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      style={{ ...style }}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <pattern id={`bdl-hatch-${pattern ?? "plain"}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={cw.dark} strokeWidth="1" opacity="0.28" />
        </pattern>
        {/* ids must be unique per instance or the first def wins site-wide */}
        <clipPath id={`bdl-clip${uid}`}>
          <rect x={g.X.tab} y={g.Y.majorTop} width={g.width} height={g.height} />
        </clipPath>
      </defs>

      <g transform={placed}>
        <rect
          x={g.X.tab}
          y={g.Y.majorTop}
          width={g.width}
          height={g.height}
          fill={cw.panel}
          opacity="0.9"
        />
        <rect
          x={g.X.tab}
          y={g.Y.majorTop}
          width={g.width}
          height={g.height}
          fill={`url(#bdl-hatch-${pattern ?? "plain"})`}
        />

        <g clipPath={`url(#bdl-clip${uid})`}>
          {print && (
            <g transform={`translate(${fx} ${fy}) scale(${k})`}>{print}</g>
          )}
          {branded && (
            <g
              transform={`translate(${fx + fw * 0.12} ${fy + fh * 0.6}) scale(${k * 0.055})`}
              fill={cw.line}
              opacity="0.55"
            >
              <text fontFamily="ui-monospace, monospace" fontSize="18" letterSpacing="2">
                SDE
              </text>
              <rect x="0" y="24" width="120" height="2" />
              <text y="44" fontSize="13" letterSpacing="3">
                CUSTOM
              </text>
            </g>
          )}
        </g>

        {/* scores first, lighter, so the cuts read on top */}
        <path d={scores(g)} fill="none" stroke={cw.line} strokeWidth={g.width / 900} opacity="0.35" />
        <path d={slits(g)} fill="none" stroke={cw.line} strokeWidth={g.width / 700} opacity="0.75" />
        <path
          d={perimeter(g)}
          fill="none"
          stroke={cw.line}
          strokeWidth={g.width / 380}
          strokeLinejoin="miter"
        />
      </g>
    </svg>
  );
}

