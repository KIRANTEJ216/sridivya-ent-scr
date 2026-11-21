import { useId } from "react";
import { cn } from "@/lib/utils";
import { SdeMarkAt } from "@/components/sde-mark";
import { COLORWAYS, type Colorway } from "./box-dieline";
import type { ShipMark, FinishId, FluteId } from "@/lib/boxes";

/**
 * Carton3D — a solid corrugated carton, printed.
 *
 * This is the live view used by the configurator, and the sales view beside the
 * catalogue photography. The dieline is the engineering view of the same box;
 * this is what the thing looks like once it is folded, printed and taped.
 *
 * Projection is oblique (cabinet), not perspective: the front panel stays an
 * axis-aligned rectangle and depth runs up-and-right at 45°. That is not a
 * stylistic preference. The front panel carries the wordmark, the rule and the
 * handling marks, and a perspective projection would shear every one of them.
 * It is also the lesson from the CSS-3D box that never worked — a perspective
 * camera cannot be held consistent while a viewport resizes, whereas an
 * explicit projection baked into a viewBox is exact at every size and prints.
 *
 * Sharpness gets the geometry right. Getting it to read as *cardboard* rather
 * than as a flat illustration is done by the surfaces, in the order they matter:
 *
 *   1. fibre      — `feTurbulence` overlay. A flat fill reads as plastic; paper
 *                   does not. This is the single biggest cue.
 *   2. lighting   — the three planes take the lamp differently (upper-left),
 *                   with occlusion pooled into the two interior corners, so the
 *                   form turns instead of sitting on the page.
 *   3. finish     — a specular band whose width and strength come from the
 *                   chosen Finish. Matte is broad and weak; gloss and foil are
 *                   tight and hot.
 *   4. caliper    — the pale liner along the cut edge, at a thickness the chosen
 *                   Flute sets. Board with real thickness has mass.
 *   5. weight     — a cast shadow plus a tighter contact shadow. One soft blob
 *                   reads as a sticker; two read as something resting.
 *
 * All of it is deterministic from props: `useId` for the gradient ids and the
 * box dimensions for the fibre seed, so the server and client agree and React
 * does not throw the hydration away as a mismatch.
 */

/** Depth foreshortening. 0.30 gives a 45° depth edge that reads as depth
 *  without collapsing the side panel on narrow cartons. */
const DEPTH_K = 0.3;
/** The frame every carton is normalised into. It is 4:3 to match the catalogue
 *  stage — a square viewBox in a 4:3 stage letterboxes itself down to 72% and
 *  the carton swims in the leftover space. */
const FW = 400;
const FH = 300;

/** Handling red. Flexo and offset both reach this on kraft without going pink,
 *  and it is the one colour in the drawing that is never part of the board. */
const PRINT_RED = "oklch(0.62 0.22 26)";

const MARK_LABEL: Record<ShipMark, string> = {
  fragile: "FRAGILE",
  up: "UP",
  dry: "DRY",
};

/** How the lockup is set, chosen from the panel's proportions so a 600 × 1150
 *  wardrobe carton does not get the same centred block as a 400 × 300 tray. */
type Lockup = "stack" | "column" | "banner";
function lockupFor(w: number, h: number): Lockup {
  const r = w / h;
  if (r > 2.0) return "banner";
  if (r < 0.78) return "column";
  return "stack";
}

interface Frame {
  /** front panel */
  x0: number;
  y0: number;
  W: number;
  H: number;
  /** depth, already foreshortened */
  D: number;
}

function frame(w: number, h: number, d: number, pad: number): Frame {
  const Dk = d * DEPTH_K;
  const s = Math.min((FW * pad) / (w + Dk), (FH * pad) / (h + Dk));
  const W = w * s;
  const H = h * s;
  const D = Dk * s;
  return {
    W,
    H,
    D,
    // the top plane reaches D above the front panel's top edge, so the whole
    // silhouette is centred rather than the front face alone
    x0: (FW - (W + D)) / 2,
    y0: (FH - (H + D)) / 2 + D,
  };
}

/* ---------------------------------------------------------------- marks --- */

/** ISO 780 pictograms, drawn rather than named, because a buyer recognises the
 *  silhouette across a room and reads the word only up close. Each mark is
 *  stroked inside a `size` box centred on (cx, cy). */
function MarkGlyph({
  mark,
  cx,
  cy,
  size,
  color,
}: {
  mark: ShipMark;
  cx: number;
  cy: number;
  size: number;
  color: string;
}) {
  const s = size / 2;
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: Math.max(0.9, size * 0.1),
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (mark === "fragile") {
    // a cracked glass: bowl, stem, foot, and the crack that means all of it
    return (
      <g>
        <path d={`M ${cx - s * 0.72} ${cy - s * 0.85} L ${cx - s * 0.42} ${cy + s * 0.1} L ${cx + s * 0.42} ${cy + s * 0.1} L ${cx + s * 0.72} ${cy - s * 0.85} Z`} {...common} />
        <path d={`M ${cx} ${cy + s * 0.1} L ${cx} ${cy + s * 0.72}`} {...common} />
        <path d={`M ${cx - s * 0.5} ${cy + s * 0.78} L ${cx + s * 0.5} ${cy + s * 0.78}`} {...common} />
        <path
          d={`M ${cx - s * 0.28} ${cy - s * 0.85} L ${cx + s * 0.04} ${cy - s * 0.4} L ${cx - s * 0.2} ${cy - s * 0.12} L ${cx + s * 0.16} ${cy + s * 0.1}`}
          {...common}
          strokeWidth={Math.max(0.7, size * 0.075)}
        />
      </g>
    );
  }

  if (mark === "up") {
    // two arrows, the way ISO 780 draws "this way up"
    const shaft = (dx: number) => (
      <g key={dx}>
        <path d={`M ${cx + dx} ${cy + s * 0.8} L ${cx + dx} ${cy - s * 0.5}`} {...common} />
        <path d={`M ${cx + dx - s * 0.32} ${cy - s * 0.12} L ${cx + dx} ${cy - s * 0.72} L ${cx + dx + s * 0.32} ${cy - s * 0.12}`} {...common} />
      </g>
    );
    return <g>{shaft(-s * 0.34)}{shaft(s * 0.34)}</g>;
  }

  // keep dry: umbrella over drops
  return (
    <g>
      <path d={`M ${cx - s * 0.85} ${cy - s * 0.18} A ${s * 0.85} ${s * 0.85} 0 0 1 ${cx + s * 0.85} ${cy - s * 0.18} Z`} {...common} />
      <path d={`M ${cx} ${cy - s * 0.18} L ${cx} ${cy + s * 0.62} A ${s * 0.26} ${s * 0.26} 0 0 0 ${cx + s * 0.26} ${cy + s * 0.88}`} {...common} />
      <path d={`M ${cx - s * 0.5} ${cy + s * 0.34} L ${cx - s * 0.5} ${cy + s * 0.56}`} {...common} strokeWidth={Math.max(0.7, size * 0.08)} />
      <path d={`M ${cx + s * 0.5} ${cy + s * 0.34} L ${cx + s * 0.5} ${cy + s * 0.56}`} {...common} strokeWidth={Math.max(0.7, size * 0.08)} />
    </g>
  );
}

/* -------------------------------------------------------------- lockup --- */

/**
 * The house mark, set on the front panel. Three arrangements so eight cartons
 * do not read as one carton photocopied eight times: a centred block for
 * square-ish panels, a stacked block riding high on tall ones, and a horizontal
 * lockup for the wide mailer and tray formats where a centred block would be
 * crushed.
 */
function Lockup({
  variant,
  f,
  color,
}: {
  variant: Lockup;
  f: Frame;
  color: string;
}) {
  const { x0, y0, W, H } = f;
  // tall panels ride the block higher so it sits on the optical centre rather
  // than the mathematical one, which reads as "sinking"
  const tall = variant === "column";
  const cx = x0 + W / 2;
  const face =
    "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif";

  if (variant === "banner") {
    /* A mailer or a tray panel is only about 90 units tall once normalised, so a
     * vertically centred lockup lands straight on the handling strip, and type
     * set to fill the panel leaves no air between the two lines of the wordmark.
     * It hangs from the top quarter at a size that keeps the gap — which is
     * also where a converter puts it. */
    const m = Math.min(H * 0.36, W * 0.18);
    const cy = y0 + H * 0.14 + m / 2;
    const markX = cx - W * 0.3;
    const textX = cx - W * 0.11;
    return (
      <g fill={color}>
        <SdeMarkAt x={markX - m / 2} y={cy - m / 2} size={m} color={color} />
        <text
          x={textX}
          y={cy + H * 0.06}
          fontFamily={face}
          fontSize={H * 0.18}
          fontWeight={700}
          letterSpacing={-H * 0.006}
        >
          SRI DIVYA
        </text>
        <text
          x={textX + H * 0.022}
          y={cy + H * 0.26}
          fontFamily={face}
          fontSize={H * 0.07}
          fontWeight={500}
          letterSpacing={H * 0.03}
          fillOpacity={0.72}
        >
          ENTERPRISES
        </text>
      </g>
    );
  }

  /* Stacked block, laid out downward from an explicit top edge rather than
   * hung off the mark, because the panel has two other things on it — the rule
   * and the handling strip — and a centred block on a short panel runs straight
   * into both. `fit` is the guard for exactly that: if the block would reach
   * the strip, it shrinks rather than overlapping it. */
  let m = Math.min(W * (tall ? 0.26 : 0.23), H * (tall ? 0.15 : 0.2));
  const gapRatio = (word: number, sub: number) => ({
    gapA: word * 0.5,
    gapB: sub * 0.8,
    gapC: sub * 1.05,
  });
  const blockHeight = (mm: number) => {
    const word = mm * 0.56;
    const sub = word * 0.36;
    const { gapA, gapB, gapC } = gapRatio(word, sub);
    return mm + gapA + word + gapB + sub + gapC;
  };
  const top = y0 + H * 0.1;
  if (top + blockHeight(m) > y0 + H * 0.62) m *= (H * 0.52) / blockHeight(m);

  const wordSize = m * 0.56;
  const subSize = wordSize * 0.36;
  const { gapA, gapB, gapC } = gapRatio(wordSize, subSize);

  return (
    <g fill={color}>
      <SdeMarkAt x={cx - m / 2} y={top} size={m} color={color} />
      <text
        x={cx}
        y={top + m + gapA + wordSize * 0.76}
        textAnchor="middle"
        fontFamily={face}
        fontSize={wordSize}
        fontWeight={700}
        letterSpacing={-wordSize * 0.03}
      >
        SRI DIVYA
      </text>
      <text
        x={cx + subSize * 0.2}
        y={top + m + gapA + wordSize + gapB + subSize * 0.8}
        textAnchor="middle"
        fontFamily={face}
        fontSize={subSize}
        fontWeight={500}
        letterSpacing={subSize * 0.42}
        fillOpacity={0.72}
      >
        ENTERPRISES
      </text>
      <rect
        x={cx - W * 0.15}
        y={top + m + gapA + wordSize + gapB + subSize + gapC}
        width={W * 0.3}
        height={Math.max(0.8, W * 0.004)}
        fill={color}
        opacity={0.45}
      />
    </g>
  );
}

/* ------------------------------------------------------------- patterns --- */

/** Print treatments. Kept to the panel's edge and low-contrast so the wordmark
 *  stays the thing you read first; a wash behind the lockup would win. */
function Pattern({
  kind,
  f,
  color,
  avoidRight,
}: {
  kind: "cmyk-dots" | "halftone" | "barcode" | "orange-bold" | "cyan-glow" | "window";
  f: Frame;
  color: string;
  /** right edge of the handling strip, so the barcode never prints under it */
  avoidRight: number;
}) {
  const { x0, y0, W, H } = f;

  if (kind === "barcode") {
    // bottom-right, in whatever width is left once the handling strip has taken
    // its share — a barcode printed through a FRAGILE mark is not a barcode
    const barH = Math.max(2.4, H * 0.08);
    const y = y0 + H - barH * 1.9;
    const bars = [0.03, 0.012, 0.02, 0.012, 0.035, 0.012, 0.02, 0.012, 0.03];
    const total = bars.reduce((a, b) => a + b, 0);
    const right = x0 + W * 0.94;
    const left = Math.max(x0 + W * 0.06, avoidRight + W * 0.04);
    const bandW = right - left;
    if (bandW < barH) return null;
    let x = left;
    return (
      <g fill={color} opacity={0.5}>
        {bars.map((w, i) => {
          const bw = (w / total) * bandW;
          const el = <rect key={i} x={x} y={y} width={bw} height={barH} />;
          x += bw + bandW * 0.022;
          return el;
        })}
      </g>
    );
  }

  if (kind === "cmyk-dots") {
    // registration dots, top-right: the top-left is where the mark tile lives
    const r = Math.max(1.1, W * 0.011);
    const cols = ["oklch(0.72 0.19 25)", "oklch(0.6 0.14 145)", "oklch(0.62 0.19 255)", "var(--color-ink)"];
    const oy = y0 + H * 0.13;
    const gap = r * 2.6;
    const ox = x0 + W * 0.93 - gap * 3;
    return (
      <g opacity={0.85}>
        {cols.map((c, ci) =>
          [0, 1].map((ri) => (
            <circle key={`${ci}-${ri}`} cx={ox + ci * gap} cy={oy + ri * gap} r={r} fill={c} />
          ))
        )}
      </g>
    );
  }

  if (kind === "halftone") {
    const step = Math.max(2.4, W * 0.02);
    const ox = x0 + W * 0.06;
    const oy = y0 + H * 0.1;
    const dots: React.ReactElement[] = [];
    let i = 0;
    for (let yy = 0; yy < 4; yy++) {
      for (let xx = 0; xx < 7; xx++) {
        const r = Math.max(0.3, step * 0.36 * (1 - xx / 8));
        dots.push(<circle key={i++} cx={ox + xx * step} cy={oy + yy * step} r={r} />);
      }
    }
    return <g fill={color} opacity={0.16}>{dots}</g>;
  }

  if (kind === "window") {
    /* A window patch: the die-cut aperture a food or retail carton gets so the
     * product shows without opening it. Drawn as an aperture with a board lip,
     * because that is what it is on the real thing — a hole with a frame.
     *
     * It sits in the band between the wordmark's rule and the handling strip,
     * which on an 8-family catalogue is the only part of the panel nothing else
     * has claimed. Over the lockup it reads as a printing fault, not a window. */
    const ww = W * 0.52;
    const wh = H * 0.17;
    const wx = x0 + (W - ww) / 2;
    const wy = y0 + H * 0.6;
    const r = Math.min(ww, wh) * 0.2;
    return (
      <g>
        <rect x={wx - ww * 0.025} y={wy - wh * 0.07} width={ww * 1.05} height={wh * 1.14} rx={r} fill={color} opacity={0.45} />
        <rect x={wx} y={wy} width={ww} height={wh} rx={r} fill="var(--color-chrome)" opacity={0.15} />
        <rect x={wx} y={wy} width={ww} height={wh} rx={r} fill="none" stroke={color} strokeWidth={Math.max(0.7, W * 0.005)} opacity={0.65} />
      </g>
    );
  }

  // bold accent edge: a printed band along the bottom of the panel, kept thin
  // enough to sit under the handling strip rather than through it
  const accent = kind === "orange-bold" ? "oklch(0.62 0.19 45)" : "oklch(0.66 0.17 215)";
  const bandH = Math.max(2, H * 0.045);
  return <rect x={x0} y={y0 + H - bandH} width={W} height={bandH} fill={accent} opacity={0.9} />;
}

/* ------------------------------------------------------------ component --- */

/** How each finish catches the key light. This is the surface the configurator's
 *  Finish row actually drives, so it has to be legible: a matte carton and a
 *  gloss carton genuinely do not look the same under the same lamp. */
const FINISH_SPEC: Record<FinishId, { spread: number; strength: number; tint: string }> = {
  "matte-lam": { spread: 0.46, strength: 0.1, tint: "#fff6e8" },
  "gloss-lam": { spread: 0.2, strength: 0.32, tint: "#fffdf6" },
  "spot-uv": { spread: 0.15, strength: 0.4, tint: "#ffffff" },
  foil: { spread: 0.26, strength: 0.36, tint: "#ffe7a8" },
  emboss: { spread: 0.24, strength: 0.16, tint: "#fff3dd" },
  deboss: { spread: 0.17, strength: 0.13, tint: "#ffeed6" },
  window: { spread: 0.34, strength: 0.18, tint: "#fffdf7" },
};

/** Caliper in millimetres. Board thickness at the cut edge is the most obvious
 *  tell that a box has weight, so the flute control moves a real dimension. */
const FLUTE_MM: Record<FluteId, number> = {
  A: 4.8,
  B: 3.2,
  C: 4.0,
  E: 1.6,
  F: 0.8,
  DW: 7.6,
  TW: 11,
};

export interface Carton3DProps {
  /** front panel, at scale 1 */
  w: number;
  h: number;
  /** depth */
  d: number;
  colorway: Colorway;
  pattern?: "cmyk-dots" | "halftone" | "barcode" | "orange-bold" | "cyan-glow" | "window";
  marks?: readonly ShipMark[];
  /** surface finish — drives the specular band */
  finish?: FinishId;
  /** board caliper — drives the cut-edge thickness */
  flute?: FluteId;
  /** print the house mark on the front panel */
  brand?: boolean;
  /** what to name the carton, for assistive tech */
  label: string;
  /** fraction of the frame the carton fills */
  scale?: number;
  className?: string;
}

export function Carton3D({
  w,
  h,
  d,
  colorway,
  pattern,
  marks,
  finish = "matte-lam",
  flute = "C",
  brand = true,
  label,
  scale = 0.86,
  className,
}: Carton3DProps) {
  const uid = useId().replace(/:/g, "");
  const c = COLORWAYS[colorway];
  const f = frame(w, h, d, scale);
  const spec = FINISH_SPEC[finish] ?? FINISH_SPEC["matte-lam"];

  const front = `M ${f.x0} ${f.y0} h ${f.W} v ${f.H} h ${-f.W} Z`;
  const top = `M ${f.x0} ${f.y0} l ${f.D} ${-f.D} h ${f.W} l ${-f.D} ${f.D} Z`;
  const side = `M ${f.x0 + f.W} ${f.y0} l ${f.D} ${-f.D} v ${f.H} l ${-f.D} ${f.D} Z`;
  /* one clip over all three planes, so fibre and specular never spill onto the
     backdrop the way a per-panel clip would let them */
  const body = `${front} ${top} ${side}`;

  const lockup = lockupFor(w, h);
  const list = marks ?? [];

  /* Deterministic from props, never from a counter or Math.random: the fibre
     seed has to come out identical on the server and the client or React throws
     the hydration away as a mismatch. */
  const fibreSeed = ((w * 7 + h * 13 + d * 29) % 97) + 1;
  const coreW = f.W * 0.0032 * (FLUTE_MM[flute] / 4);

  // Red is spent only on FRAGILE. Up and dry stay in the board's own ink, which
  // is how a converter actually prints them and it leaves red meaning one thing.
  const markInk = (m: ShipMark) => (m === "fragile" ? PRINT_RED : c.print);

  /* The handling strip is anchored to the bottom edge and sized upward, not
   * centred at a fixed fraction. A 90-unit-tall mailer panel and a 300-unit
   * wardrobe panel both have to fit the same strip above the same baseline, and
   * a fixed fraction puts one of them through the floor. */
  const count = Math.max(1, list.length);
  const labelSize = Math.min(f.W * 0.07, f.H * 0.07);
  const glyph = Math.min(f.H * 0.19, f.W * 0.15, (f.W * 0.8) / count / 2.6);
  const labelBase = f.y0 + f.H - Math.max(1.5, f.H * 0.055);
  const glyphCY = labelBase - labelSize * 0.45 - glyph / 2;
  const slot = Math.min(glyph * 2.5, (f.W * 0.82) / count);
  const stripX = f.x0 + f.W / 2 - (slot * count) / 2;
  const stripRight = stripX + slot * count;

  const describe = [
    label,
    brand ? "printed with the Sri Divya Enterprises mark" : null,
    list.length > 0 ? `marked ${list.map((m) => MARK_LABEL[m]).join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const specA = Math.max(0.02, 0.42 - spec.spread);
  const specB = Math.min(0.98, 0.42 + spec.spread);

  return (
    <svg
      viewBox={`0 0 ${FW} ${FH}`}
      /* The stage and this frame are both 4:3, so `meet` is exact rather than
       * letterboxing. `w-full h-auto` would size by width and push the bottom
       * third off the stage. */
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={describe}
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      className={cn("block h-full w-full overflow-visible", className)}
    >
      <defs>
        {/* Lit from upper-left, as every one of the studio renders is. The three
            planes therefore take the light differently, and that difference is
            the whole reason a flat shape reads as a solid. */}
        <linearGradient id={`${uid}-front`} x1="0.1" y1="0" x2="0.75" y2="1">
          <stop offset="0" stopColor={c.panel} />
          <stop offset="0.55" stopColor={c.panel} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
        <linearGradient id={`${uid}-top`} x1="0.15" y1="1" x2="0.85" y2="0">
          <stop offset="0" stopColor={c.panel} />
          <stop offset="1" stopColor={c.top} />
        </linearGradient>
        <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0" stopColor={c.side} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>

        {/* environment reflection — the finish control's visible output */}
        <linearGradient id={`${uid}-spec`} x1="0" y1="0" x2="1" y2="0.55">
          <stop offset="0" stopColor={spec.tint} stopOpacity="0" />
          <stop offset={specA} stopColor={spec.tint} stopOpacity={spec.strength} />
          <stop offset={specB} stopColor={spec.tint} stopOpacity="0" />
        </linearGradient>

        {/* occlusion where the planes meet — without it the corners are joins,
            and a visible join is the thing that makes a drawing look like one */}
        <linearGradient id={`${uid}-occ-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.26" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-occ-side`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.3" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={`${uid}-cast`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-contact`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-vig`} cx="0.42" cy="0.36" r="0.8">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.26" />
        </radialGradient>

        {/* Board fibre. This one filter is most of the difference between
            "packaging" and "brown box": without it the panel is a flat fill and
            the eye reads plastic. Tiled inside a pattern so the filter raster is
            180x180 rather than the whole viewport, desaturated and overlay
            blended so it modulates the board colour instead of greying it.

            `stitchTiles="stitch"` is load-bearing, not an optimisation: without
            it the turbulence does not wrap at the tile boundary and the pattern
            repeats with a visible seam, which shows up as a grid of blocks
            across the board. */}
        <filter
          id={`${uid}-turb`}
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            seed={fibreSeed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <pattern id={`${uid}-fibre`} width="180" height="180" patternUnits="userSpaceOnUse">
          <rect width="180" height="180" filter={`url(#${uid}-turb)`} />
        </pattern>

        <clipPath id={`${uid}-body`}>
          <path d={body} />
        </clipPath>
        <clipPath id={`${uid}-face`}>
          <path d={front} />
        </clipPath>
      </defs>

      {/* cast shadow on the floor, then the tighter contact shadow — one soft
          blob under a box reads as a sticker, two read as weight */}
      <ellipse
        cx={f.x0 + f.W / 2 + f.D * 0.45}
        cy={f.y0 + f.H + f.H * 0.06}
        rx={(f.W + f.D) * 0.72}
        ry={f.H * 0.13}
        fill={`url(#${uid}-cast)`}
      />
      <ellipse
        cx={f.x0 + f.W / 2 + f.D * 0.2}
        cy={f.y0 + f.H + f.H * 0.012}
        rx={(f.W + f.D) * 0.5}
        ry={f.H * 0.045}
        fill={`url(#${uid}-contact)`}
      />

      {/* side sits behind the front so their shared edge stays one clean line */}
      <path d={side} fill={`url(#${uid}-side)`} />
      <path d={top} fill={`url(#${uid}-top)`} />
      <path d={front} fill={`url(#${uid}-front)`} />

      <g clipPath={`url(#${uid}-body)`}>
        <rect
          x={0}
          y={0}
          width={FW}
          height={FH}
          fill={`url(#${uid}-fibre)`}
          opacity={0.26}
          style={{ mixBlendMode: "overlay" }}
        />
      </g>

      {/* occlusion in the two interior corners */}
      <g clipPath={`url(#${uid}-body)`}>
        <rect x={f.x0} y={f.y0} width={f.W} height={f.H * 0.22} fill={`url(#${uid}-occ-top)`} />
        <rect
          x={f.x0 + f.W * 0.78}
          y={f.y0}
          width={f.W * 0.22}
          height={f.H}
          fill={`url(#${uid}-occ-side)`}
        />
      </g>

      {/* the seam where the top flaps meet, with the closure tape over it. Clipped to
         the body: the tape is a stroke that starts inside the top face but runs
         out past its left edge, and unclipped it leaves a grey stub hanging in
         the air beside the box. */}
      <g opacity={0.55} clipPath={`url(#${uid}-body)`}>
        <path
          d={`M ${f.x0 + f.D / 2} ${f.y0 - f.D / 2} L ${f.x0 + f.W + f.D / 2} ${f.y0 - f.D / 2}`}
          stroke={c.dark}
          strokeWidth={Math.max(0.5, f.D * 0.012)}
        />
        <path
          d={`M ${f.x0 + f.D / 2 - f.D * 0.1} ${f.y0 - f.D / 2 - f.D * 0.085} L ${f.x0 + f.W + f.D / 2 - f.D * 0.1} ${f.y0 - f.D / 2 - f.D * 0.085}`}
          stroke={c.top}
          strokeWidth={Math.max(1, f.D * 0.055)}
          opacity={0.6}
        />
      </g>

      {/* cut edge of the board: the pale liner you see on a knife edge, at a
          thickness the flute control sets */}
      <path d={top} fill="none" stroke={c.line} strokeWidth={coreW} opacity={0.28} />
      <path
        d={`M ${f.x0 + f.W} ${f.y0} L ${f.x0 + f.W} ${f.y0 + f.H}`}
        stroke={c.line}
        strokeWidth={Math.max(0.5, f.W * 0.005)}
        opacity={0.3}
      />

      <g clipPath={`url(#${uid}-face)`}>
        {pattern && <Pattern kind={pattern} f={f} color={c.print} avoidRight={stripRight} />}
        {brand && <Lockup variant={lockup} f={f} color={c.print} />}
        {list.map((m, i) => (
          <g key={m}>
            <MarkGlyph
              mark={m}
              cx={stripX + slot * (i + 0.5)}
              cy={glyphCY}
              size={glyph}
              color={markInk(m)}
            />
            <text
              x={stripX + slot * (i + 0.5)}
              y={labelBase}
              textAnchor="middle"
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize={labelSize}
              fontWeight={600}
              letterSpacing={labelSize * 0.06}
              fill={markInk(m)}
            >
              {MARK_LABEL[m]}
            </text>
          </g>
        ))}
      </g>

      {/* environment reflection sits over the print, because that is the order
          light actually reaches them: board, then ink, then what the lamp
          returns off the ink */}
      <g clipPath={`url(#${uid}-body)`}>
        <rect x={0} y={0} width={FW} height={FH} fill={`url(#${uid}-spec)`} />
        <rect x={0} y={0} width={FW} height={FH} fill={`url(#${uid}-vig)`} />
      </g>
    </svg>
  );
}
