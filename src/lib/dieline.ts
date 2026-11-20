/**
 * RSC 0201 geometry, shared by every place that draws a carton blank.
 *
 * One source of truth so the worldflight signature move and the catalogue
 * thumbnails cannot disagree about what a Regular Slotted Container is. The
 * catalogue's own RSC dimensions live in `src/lib/boxes.ts`; those are the
 * numbers the finished box is described in, and this module turns them into the
 * unfolded blank.
 *
 *   blank length = glue tab + 2L + 2W
 *   blank width  = H + 2W
 *   major flaps  = W    (front and back panels)
 *   minor flaps  = W/2  (the two side panels)
 *
 *        0  25      381            838      1194         1651
 *        |  tab |  side  |   front    |  side  |   back   |
 */

export const TAB = 25;

/** flap depths, derived from the box width */
export const majorFlap = (W: number) => W;
export const minorFlap = (W: number) => W / 2;

/** vertical stations, top of blank downward */
export function stationsY(H: number, W: number) {
  const major = majorFlap(W);
  const minor = minorFlap(W);
  return {
    majorTop: 0,
    minorTop: major - minor,
    bodyTop: major,
    bodyBot: major + H,
    minorBot: major + H + minor,
    majorBot: major + H + major,
  };
}

/** horizontal stations, left of blank rightward */
export function stationsX(L: number, W: number) {
  const tab = TAB;
  return {
    tab: tab,
    s1: tab,
    f: tab + W,
    s2: tab + W + L,
    b: tab + 2 * W + L,
    end: tab + 2 * W + 2 * L,
  };
}

export interface DielineGeometry {
  X: ReturnType<typeof stationsX>;
  Y: ReturnType<typeof stationsY>;
  width: number;
  height: number;
}

/** Finished box in mm. Falls back to the catalogue RSC if given nonsense. */
export function rscGeometry(L: number, W: number, H: number): DielineGeometry {
  const l = L > 0 ? L : 457;
  const w = W > 0 ? W : 356;
  const h = H > 0 ? H : 406;
  const X = stationsX(l, w);
  const Y = stationsY(h, w);
  return { X, Y, width: X.end, height: Y.majorBot };
}

/** Outer perimeter of the blank, clockwise. A cut. */
export function perimeter(g: DielineGeometry): string {
  const { X, Y } = g;
  return [
    `M ${X.tab} ${Y.bodyTop}`,
    `L ${X.s1} ${Y.bodyTop}`,
    `L ${X.s1} ${Y.minorTop} L ${X.f} ${Y.minorTop}`,
    `L ${X.f} ${Y.majorTop} L ${X.s2} ${Y.majorTop}`,
    `L ${X.s2} ${Y.minorTop} L ${X.b} ${Y.minorTop}`,
    `L ${X.b} ${Y.majorTop} L ${X.end} ${Y.majorTop}`,
    `L ${X.end} ${Y.bodyBot}`,
    `L ${X.b} ${Y.bodyBot} L ${X.b} ${Y.majorBot} L ${X.s2} ${Y.majorBot}`,
    `L ${X.s2} ${Y.minorBot} L ${X.s1} ${Y.minorBot}`,
    `L ${X.s1} ${Y.majorBot} L ${X.tab} ${Y.majorBot}`,
    `L ${X.tab} ${Y.bodyTop}`,
  ].join(" ");
}

/** Slits that free each flap from its neighbour. Cuts. */
export function slits(g: DielineGeometry): string {
  const { X, Y } = g;
  return [
    `M ${X.f} ${Y.minorTop} L ${X.f} ${Y.bodyTop}`,
    `M ${X.s2} ${Y.minorTop} L ${X.s2} ${Y.bodyTop}`,
    `M ${X.b} ${Y.minorTop} L ${X.b} ${Y.bodyTop}`,
    `M ${X.f} ${Y.bodyBot} L ${X.f} ${Y.minorBot}`,
    `M ${X.s2} ${Y.bodyBot} L ${X.s2} ${Y.majorBot}`,
    `M ${X.b} ${Y.bodyBot} L ${X.b} ${Y.minorBot}`,
  ].join(" ");
}

/** The folds the box actually bends on. Scores, so drawn lighter. */
export function scores(g: DielineGeometry): string {
  const { X, Y } = g;
  return [
    `M ${X.tab} ${Y.bodyTop} L ${X.end} ${Y.bodyTop}`,
    `M ${X.tab} ${Y.bodyBot} L ${X.end} ${Y.bodyBot}`,
    `M ${X.s1} ${Y.bodyTop} L ${X.s1} ${Y.bodyBot}`,
  ].join(" ");
}

/**
 * Map the blank onto an isometric plane so it reads as a sheet lying on the
 * floor rather than a diagram floating on the page. 30 degrees, the standard
 * isometric angle. Returns an SVG transform string plus the fit scale.
 */
export function isometricTransform(g: DielineGeometry, boxW: number, boxH: number) {
  const COS30 = 0.8660254;
  const SIN30 = 0.5;
  const span = g.width + g.height;
  const k = Math.min((boxW * 0.86) / (span * COS30), (boxH * 0.8) / (span * SIN30));
  return {
    k,
    transform:
      `translate(${boxW / 2} ${boxH / 2}) scale(${k}) ` +
      `matrix(${COS30} ${SIN30} ${-COS30} ${SIN30} 0 0) ` +
      `translate(${-g.width / 2} ${-g.height / 2})`,
  };
}
