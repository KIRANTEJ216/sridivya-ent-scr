/**
 * Geometry for the Sri Divya Enterprises cube mark (brand/logo/A-cube-colour.svg).
 * Each face is a 100-unit square with its letter knocked out (even-odd fill),
 * mapped onto the cube by an affine matrix. The mark occupies the square
 * 58..454 in its own coordinate space.
 */
export const SDE_VIEWBOX = { x: 58, y: 58, size: 396 } as const;

export type SdeFace = {
  letter: "E" | "S" | "D";
  /** canvas/SVG affine matrix [a, b, c, d, e, f] */
  m: [number, number, number, number, number, number];
  d: string;
  /** three-tone colour; single-ink prints ignore it */
  tone: string;
};

const FACE = "M5,5 L95,5 L95,95 L5,95 Z";

export const SDE_FACES: SdeFace[] = [
  {
    letter: "E",
    m: [1.732, 1, -1.732, 1, 256, 56],
    tone: "#C9935A",
    d: `${FACE} M29.7,21 L70.3,21 L70.3,32.6 L41.3,32.6 L41.3,44.2 L64.5,44.2 L64.5,55.8 L41.3,55.8 L41.3,67.4 L70.3,67.4 L70.3,79 L29.7,79 Z`,
  },
  {
    letter: "S",
    m: [1.732, 1, 0, 2, 82.8, 156],
    tone: "#A9753F",
    d: `${FACE} M29.7,21 L70.3,21 L70.3,32.6 L41.3,32.6 L41.3,44.2 L70.3,44.2 L70.3,79 L29.7,79 L29.7,67.4 L58.7,67.4 L58.7,55.8 L29.7,55.8 Z`,
  },
  {
    letter: "D",
    m: [1.732, -1, 0, 2, 256, 256],
    tone: "#7E5328",
    d: `${FACE} M29.7,21 L57.54,21 L70.3,33.76 L70.3,66.24 L57.54,79 L29.7,79 Z M41.3,32.6 L52.9,32.6 L58.7,38.4 L58.7,61.6 L52.9,67.4 L41.3,67.4 Z`,
  },
];

/** Paint the cube into a 2D canvas as a size×size square at (x, y). */
export function drawSdeMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color?: string
) {
  const k = size / SDE_VIEWBOX.size;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-SDE_VIEWBOX.x, -SDE_VIEWBOX.y);
  for (const f of SDE_FACES) {
    ctx.save();
    ctx.transform(...f.m);
    ctx.fillStyle = color ?? f.tone;
    ctx.fill(new Path2D(f.d), "evenodd");
    ctx.restore();
  }
  ctx.restore();
}
