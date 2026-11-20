/**
 * The flight: seven legs of one continuous production line.
 *
 * Two rules govern everything here.
 *
 * 1. `weight / clipSeconds` is identical on every leg (0.215 vh per second of
 *    film). Vary it and the world surges and drags for reasons the reader
 *    cannot see. The peak therefore earns its larger span by being a LONGER
 *    CLIP, never a fatter weight.
 *
 * 2. The track is (sum of weights + 1) viewport-heights. The +1 is not padding:
 *    without it the last leg's final second is a place the reader can never
 *    come to rest.
 */

export type LegId = "reel" | "diecut" | "flat" | "erect" | "fold" | "store";

export type Leg = {
  id: LegId;
  /** Published on the sc:waypoint event and used as the rail label. */
  label: string;
  /** Short label for the line schematic. */
  short: string;
  /** Scroll this leg owns, in viewport-heights. */
  weight: number;
  /** Film length in seconds. weight = clipSeconds * RATE. */
  clipSeconds: number;
  /** Plate position along the line schematic, 0..1. */
  plate: number;
  /** Frames in the extracted image sequence (12 fps). */
  frames: number;
};

const RATE = 0.215;

function leg(
  id: LegId,
  label: string,
  short: string,
  clipSeconds: number,
  plate: number
): Leg {
  return {
    id,
    label,
    short,
    clipSeconds,
    weight: Number((clipSeconds * RATE).toFixed(4)),
    plate,
    frames: Math.round(clipSeconds * 12) + 1,
  };
}

/**
 * Six phases of the line, generated on kie.ai (seedream still + kling 5s clip
 * each). Every clip is 5s, so every leg has the same weight and the world moves
 * at one pace from reel to rack.
 */
export const LEGS: Leg[] = [
  leg("reel", "Kraft reel", "Reel", 5, 0.0),
  leg("diecut", "Die-cutting", "Die-cut", 5, 0.2),
  leg("flat", "Flat blank", "Blank", 5, 0.4),
  leg("erect", "Sheet to box", "Box", 5, 0.6),
  leg("fold", "Folding", "Folding", 5, 0.8),
  leg("store", "Flat storage", "Storage", 5, 1.0),
];

export const TOTAL_WEIGHT = LEGS.reduce((a, l) => a + l.weight, 0);
export const TRACK_VH = Number((TOTAL_WEIGHT + 1).toFixed(4));
export const SEAM = 0.16;
export const LERP = 0.12;

/** Cumulative start of each leg along the track, in viewport-heights. */
export const LEG_START_VH: number[] = (() => {
  const out: number[] = [];
  let acc = 0;
  for (const l of LEGS) {
    out.push(Number(acc.toFixed(4)));
    acc += l.weight;
  }
  return out;
})();

/** Fraction along the whole track where a leg begins and ends. */
export function legFractions(i: number): { from: number; to: number } {
  const start = LEG_START_VH[i];
  const end = start + LEGS[i].weight;
  return { from: start / TRACK_VH, to: end / TRACK_VH };
}

/**
 * Copy window fractions, derived from the weights rather than hand-typed, so
 * they cannot drift when a leg is retimed. A window is a plateau: it ramps in
 * over the first 30%, holds at full opacity, ramps out over the last 30%. A
 * triangle would touch opacity 1 for a single pixel and every heading would
 * read faintly. These still get retuned against real frames before shipping.
 */
export function windowFor(i: number): string {
  const { from, to } = legFractions(i);
  return `${from.toFixed(4)} ${to.toFixed(4)}`;
}

export const assetUrl = (f: string) => `/world/${f}`;

/** Extra scroll (vh) after the last frame so the finale can come to rest. */
export const HOLD_VH = 0.7;

/** One frame of a leg's image sequence. `f` is zero-based. */
export const seqUrl = (id: LegId, f: number, variant: "d" | "m") =>
  `/${variant === "m" ? "line-m" : "line"}/${id}/${String(f + 1).padStart(3, "0")}.webp`;