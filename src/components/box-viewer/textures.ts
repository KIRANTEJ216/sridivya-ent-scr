import * as THREE from "three";
import type { FinishId, MaterialGradeId, PrintMethodId } from "@/lib/boxes";

/* Seeded RNG, so the same spec always produces the same board. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Paper = "kraft" | "kraft-dark" | "recycled" | "white" | "charcoal" | "grey-board";

export const PAPER_RGB: Record<Paper, [number, number, number]> = {
  kraft: [186, 140, 88],
  "kraft-dark": [164, 118, 70],
  recycled: [170, 150, 118],
  white: [240, 237, 230],
  charcoal: [34, 36, 40],
  "grey-board": [128, 126, 120],
};

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(2, Math.round(w));
  c.height = Math.max(2, Math.round(h));
  return c;
}

/** Canvas size for a face of aspect a/b, longest side `max` pixels. */
export function faceSize(a: number, b: number, max = 1024): [number, number] {
  return a >= b ? [max, Math.max(64, (max * b) / a)] : [Math.max(64, (max * a) / b), max];
}

/**
 * Paper surface: base colour, fibres, speckle, and (for corrugated board) the
 * faint "washboard" stripes the flutes press through the liner. That last cue
 * is what separates corrugated from card at a glance.
 */
function paintPaper(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  paper: Paper,
  opts: { corrugated: boolean; seed: number; fluteMm: number; pxPerMm: number; stripesVertical?: boolean }
) {
  const [r, g, b] = PAPER_RGB[paper];
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, w, h);
  const rand = rng(opts.seed);

  // broad mottling
  for (let i = 0; i < 40; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const rad = (0.08 + rand() * 0.25) * Math.max(w, h);
    const grd = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const d = rand() > 0.5 ? 255 : 0;
    grd.addColorStop(0, `rgba(${d},${d},${d},0.035)`);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  }

  // washboard stripes from the flutes underneath the liner
  if (opts.corrugated) {
    const pitch = Math.max(3, opts.fluteMm * 2.2 * opts.pxPerMm);
    const vertical = opts.stripesVertical ?? true;
    const span = vertical ? w : h;
    for (let p = 0; p < span; p += pitch) {
      const grd = vertical
        ? ctx.createLinearGradient(p, 0, p + pitch, 0)
        : ctx.createLinearGradient(0, p, 0, p + pitch);
      grd.addColorStop(0, "rgba(0,0,0,0.045)");
      grd.addColorStop(0.5, "rgba(255,255,255,0.035)");
      grd.addColorStop(1, "rgba(0,0,0,0.045)");
      ctx.fillStyle = grd;
      if (vertical) ctx.fillRect(p, 0, pitch, h);
      else ctx.fillRect(0, p, w, pitch);
    }
  }

  // fibres
  const fibres = Math.round((w * h) / 900);
  ctx.lineWidth = 1;
  for (let i = 0; i < fibres; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const len = 2 + rand() * 9;
    const ang = rand() * Math.PI;
    const light = rand() > 0.5;
    ctx.strokeStyle = light ? `rgba(255,245,225,${0.05 + rand() * 0.08})` : `rgba(40,25,10,${0.04 + rand() * 0.08})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
  // speckle
  for (let i = 0; i < fibres / 3; i++) {
    ctx.fillStyle = `rgba(30,18,8,${0.05 + rand() * 0.12})`;
    ctx.fillRect(rand() * w, rand() * h, 1 + rand(), 1 + rand());
  }
}

/* ------------------------------------------------------------------ art */

const RED = "#c8312b";
const GOLD = "#d4a853";

type ArtStyle = {
  ink: string; // logo / wordmark colour
  sub: string;
  marks: string | null; // handling-mark colour
};

function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, onlyMask = false) {
  // rounded square badge with an isometric carton glyph
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.07;
  const r = s * 0.18;
  ctx.beginPath();
  ctx.roundRect(x, y, s, s, r);
  if (onlyMask) ctx.fill();
  else ctx.stroke();
  const cx = x + s / 2;
  const cy = y + s / 2;
  const k = s * 0.26;
  ctx.lineJoin = "round";
  ctx.strokeStyle = onlyMask ? "#000" : color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - k);
  ctx.lineTo(cx + k, cy - k / 2);
  ctx.lineTo(cx + k, cy + k / 2);
  ctx.lineTo(cx, cy + k);
  ctx.lineTo(cx - k, cy + k / 2);
  ctx.lineTo(cx - k, cy - k / 2);
  ctx.closePath();
  ctx.moveTo(cx - k, cy - k / 2);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + k, cy - k / 2);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy + k);
  ctx.stroke();
  ctx.restore();
}

function drawWordmark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  style: ArtStyle,
  mask: boolean
) {
  const logo = s * 0.9;
  ctx.font = `700 ${s * 0.62}px "Helvetica Neue", Arial, sans-serif`;
  const word = "SRI DIVYA";
  const tw = ctx.measureText(word).width;
  const total = logo + s * 0.35 + tw;
  const x0 = cx - total / 2;
  drawLogo(ctx, x0, cy - logo / 2, logo, mask ? "#fff" : style.ink, mask);
  ctx.fillStyle = mask ? "#fff" : style.ink;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(word, x0 + logo + s * 0.35, cy + s * 0.12);
  ctx.font = `500 ${s * 0.2}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = mask ? "#fff" : style.sub;
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${s * 0.06}px`;
  ctx.fillText("ENTERPRISES · HYDERABAD", x0 + logo + s * 0.37, cy + s * 0.46);
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
}

function drawMarks(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.08;
  ctx.lineCap = "round";
  // this way up: two arrows
  for (const dx of [0.28, 0.72]) {
    const ax = x + s * dx;
    ctx.beginPath();
    ctx.moveTo(ax, y + s * 0.9);
    ctx.lineTo(ax, y + s * 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ax - s * 0.16, y + s * 0.38);
    ctx.lineTo(ax, y + s * 0.12);
    ctx.lineTo(ax + s * 0.16, y + s * 0.38);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(x + s * 0.1, y + s * 0.97);
  ctx.lineTo(x + s * 0.9, y + s * 0.97);
  ctx.stroke();
  // keep dry: umbrella
  const ux = x + s * 1.35;
  ctx.beginPath();
  ctx.arc(ux + s * 0.4, y + s * 0.45, s * 0.38, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ux + s * 0.4, y + s * 0.45);
  ctx.lineTo(ux + s * 0.4, y + s * 0.85);
  ctx.arc(ux + s * 0.3, y + s * 0.85, s * 0.1, 0, Math.PI);
  ctx.stroke();
  // fragile: glass
  const gx = x + s * 2.55;
  ctx.beginPath();
  ctx.moveTo(gx, y + s * 0.1);
  ctx.lineTo(gx + s * 0.6, y + s * 0.1);
  ctx.quadraticCurveTo(gx + s * 0.6, y + s * 0.55, gx + s * 0.3, y + s * 0.6);
  ctx.quadraticCurveTo(gx, y + s * 0.55, gx, y + s * 0.1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(gx + s * 0.3, y + s * 0.6);
  ctx.lineTo(gx + s * 0.3, y + s * 0.9);
  ctx.moveTo(gx + s * 0.1, y + s * 0.93);
  ctx.lineTo(gx + s * 0.5, y + s * 0.93);
  ctx.stroke();
  ctx.restore();
}

export type Spec = {
  print: PrintMethodId;
  finish: FinishId;
  grade: MaterialGradeId;
  paper: Paper;
  corrugated: boolean;
  fluteMm: number;
  seed: number;
};

function artStyle(spec: Spec): ArtStyle {
  const dark = spec.paper === "charcoal";
  if (spec.finish === "foil") return { ink: GOLD, sub: GOLD, marks: dark ? null : RED };
  if (dark) return { ink: "#f1ece2", sub: "#c9c2b4", marks: null };
  switch (spec.print) {
    case "flexo":
      return { ink: "#2a1c12", sub: "#3b2a1c", marks: RED };
    case "offset":
      return { ink: "#12223a", sub: "#2b3b55", marks: RED };
    case "digital":
      return { ink: "#10131a", sub: "#2a2e38", marks: RED };
    case "uv":
      return { ink: "#ffffff", sub: "#d9f6ff", marks: null };
    case "screen":
      return { ink: "#121212", sub: "#1d1d1d", marks: null };
  }
}

/** Print graphics under the wordmark, per method. */
function paintBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number, spec: Spec) {
  if (spec.paper === "charcoal") return;
  const rand = rng(spec.seed + 7);
  switch (spec.print) {
    case "offset": {
      // litho band: navy with an orange rule, full colour
      ctx.fillStyle = "#14294a";
      ctx.fillRect(0, h * 0.74, w, h * 0.26);
      ctx.fillStyle = "#ef7f16";
      ctx.fillRect(0, h * 0.715, w, h * 0.025);
      break;
    }
    case "digital": {
      const g = ctx.createLinearGradient(0, h, w, 0);
      g.addColorStop(0, "rgba(0,174,239,0.85)");
      g.addColorStop(0.5, "rgba(236,0,140,0.75)");
      g.addColorStop(1, "rgba(255,221,0,0.8)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.62);
      ctx.bezierCurveTo(w * 0.3, h * 0.5, w * 0.6, h * 0.82, w, h * 0.56);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      // halftone dots
      const step = Math.max(8, w / 70);
      for (let y = h * 0.1; y < h * 0.5; y += step)
        for (let x = w * 0.72; x < w * 0.98; x += step) {
          const rr = step * 0.35 * rand();
          ctx.fillStyle = "rgba(236,0,140,0.35)";
          ctx.beginPath();
          ctx.arc(x, y, rr, 0, Math.PI * 2);
          ctx.fill();
        }
      break;
    }
    case "uv": {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0a8fc4");
      g.addColorStop(1, "#06587d");
      ctx.fillStyle = g;
      ctx.fillRect(w * 0.06, h * 0.12, w * 0.88, h * 0.76);
      break;
    }
    case "screen": {
      ctx.fillStyle = "#ef7f16";
      ctx.fillRect(0, h * 0.3, w, h * 0.4);
      break;
    }
    default:
      break;
  }
}

export type FaceTextures = {
  map: THREE.CanvasTexture;
  rough?: THREE.CanvasTexture;
  metal?: THREE.CanvasTexture;
  bump?: THREE.CanvasTexture;
  alpha?: THREE.CanvasTexture;
};

function tex(c: HTMLCanvasElement, color = false) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/** Window patch rect, in face fractions, used by both the art and the mesh. */
export const WINDOW_RECT = { x: 0.28, y: 0.1, w: 0.44, h: 0.36 };

/**
 * Printed outer face.
 * `kind` = "front" carries the wordmark and marks; "side" carries the box
 * maker's spec line, like a real carton.
 */
export function faceTextures(
  aMm: number,
  bMm: number,
  spec: Spec,
  kind: "front" | "side" | "plain",
  specLine: string
): FaceTextures {
  const [w, h] = faceSize(aMm, bMm);
  const pxPerMm = w / aMm;
  const c = canvas(w, h);
  const ctx = c.getContext("2d")!;
  paintPaper(ctx, w, h, spec.paper, {
    corrugated: spec.corrugated,
    seed: spec.seed + (kind === "front" ? 1 : kind === "side" ? 2 : 3),
    fluteMm: spec.fluteMm,
    pxPerMm,
    stripesVertical: true,
  });

  const style = artStyle(spec);
  const needMask = kind === "front" && ["foil", "spot-uv", "emboss", "deboss"].includes(spec.finish);
  const m = needMask ? canvas(w, h) : null;
  const mctx = m?.getContext("2d") ?? null;
  if (mctx) {
    mctx.fillStyle = "#000";
    mctx.fillRect(0, 0, w, h);
  }

  if (kind === "front") {
    paintBackdrop(ctx, w, h, spec);
    const s = Math.min(w * 0.11, h * 0.2);
    const cy = spec.finish === "window" ? h * 0.26 : spec.print === "offset" ? h * 0.42 : h * 0.47;
    drawWordmark(ctx, w / 2, cy, s, style, false);
    if (mctx) drawWordmark(mctx, w / 2, cy, s, style, true);
    if (style.marks && spec.corrugated) {
      const ms = Math.min(w * 0.05, h * 0.1);
      drawMarks(ctx, w * 0.06, h - ms * 1.5, ms, style.marks);
    }
  } else if (kind === "side") {
    const s = Math.min(w * 0.08, h * 0.08);
    ctx.font = `600 ${s}px "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = spec.paper === "charcoal" ? "rgba(240,235,225,0.75)" : "rgba(40,28,18,0.82)";
    ctx.textAlign = "center";
    const lines = specLine.split("\n");
    lines.forEach((line, i) => ctx.fillText(line, w / 2, h * 0.78 + i * s * 1.35));
    if (spec.corrugated && spec.paper !== "charcoal") {
      // box maker's certificate style roundel
      ctx.strokeStyle = "rgba(40,28,18,0.6)";
      ctx.lineWidth = Math.max(2, s * 0.12);
      const r = Math.min(w, h) * 0.13;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.36, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `600 ${r * 0.26}px "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = "rgba(40,28,18,0.7)";
      ctx.fillText("SRI DIVYA", w / 2, h * 0.36 - r * 0.1);
      ctx.fillText("ENT · 2007", w / 2, h * 0.36 + r * 0.28);
    }
  }

  const out: FaceTextures = { map: tex(c, true) };

  if (mctx && m) {
    if (spec.finish === "spot-uv" || spec.finish === "foil") {
      // roughness: rough board, glossy logo
      const rc = canvas(w, h);
      const rx = rc.getContext("2d")!;
      rx.fillStyle = "#fff";
      rx.fillRect(0, 0, w, h);
      rx.globalCompositeOperation = "difference";
      rx.drawImage(m, 0, 0);
      out.rough = tex(rc);
    }
    if (spec.finish === "foil") out.metal = tex(m);
    if (spec.finish === "emboss" || spec.finish === "deboss") {
      const bc = canvas(w, h);
      const bx = bc.getContext("2d")!;
      bx.filter = `blur(${Math.max(1, w / 400)}px)`;
      if (spec.finish === "deboss") {
        bx.fillStyle = "#fff";
        bx.fillRect(0, 0, w, h);
        bx.globalCompositeOperation = "difference";
      }
      bx.drawImage(m, 0, 0);
      out.bump = tex(bc);
    }
  }

  if (kind === "front" && spec.finish === "window") {
    const ac = canvas(w, h);
    const ax = ac.getContext("2d")!;
    ax.fillStyle = "#fff";
    ax.fillRect(0, 0, w, h);
    ax.fillStyle = "#000";
    const R = WINDOW_RECT;
    // canvas y is top-down; UV v is bottom-up, the texture flip handles it
    ax.beginPath();
    ax.roundRect(R.x * w, (1 - R.y - R.h) * h, R.w * w, R.h * h, Math.min(w, h) * 0.03);
    ax.fill();
    out.alpha = tex(ac);
  }
  return out;
}

/** Inner liner: plain kraft, no print. */
export function innerTexture(paper: Paper, corrugated: boolean, seed: number) {
  const c = canvas(512, 512);
  paintPaper(c.getContext("2d")!, 512, 512, paper, { corrugated, seed, fluteMm: 3, pxPerMm: 1.2 });
  const t = tex(c, true);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/**
 * Cut edge of the board: liners top and bottom, the fluted medium between.
 * Two orientations, because a box face's UVs run along either axis.
 */
export function fluteTexture(paper: Paper, waves: number, alongU: boolean, layers = 1, solid = false) {
  const W = 1024;
  const H = 96;
  const c = canvas(W, H);
  const ctx = c.getContext("2d")!;
  const [r, g, b] = PAPER_RGB[paper === "white" || paper === "charcoal" ? "kraft" : paper];
  const outer = PAPER_RGB[paper];
  if (solid) {
    ctx.fillStyle = `rgb(${outer[0]},${outer[1]},${outer[2]})`;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let i = 0; i < 6; i++) ctx.fillRect(0, (H / 6) * i, W, 1);
  } else {
    ctx.fillStyle = `rgb(${r * 0.42},${g * 0.4},${b * 0.38})`;
    ctx.fillRect(0, 0, W, H);
    const liner = H * 0.1;
    const band = (H - liner * (layers + 1)) / layers;
    for (let L = 0; L < layers; L++) {
      const top = liner * (L + 1) + band * L;
      ctx.strokeStyle = `rgb(${r * 0.95},${g * 0.92},${b * 0.88})`;
      ctx.lineWidth = Math.max(2, band * 0.16);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = top + band / 2 + (Math.sin((x / W) * waves * Math.PI * 2) * band) / 2.3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let L = 0; L <= layers; L++) {
      const y = L * (liner + band);
      ctx.fillStyle = L === 0 || L === layers ? `rgb(${outer[0]},${outer[1]},${outer[2]})` : `rgb(${r},${g},${b})`;
      ctx.fillRect(0, y, W, liner);
    }
  }
  if (!alongU) {
    // rotate 90°: waves along v
    const c2 = canvas(H, W);
    const x2 = c2.getContext("2d")!;
    x2.translate(H, 0);
    x2.rotate(Math.PI / 2);
    x2.drawImage(c, 0, 0);
    return tex(c2, true);
  }
  return tex(c, true);
}
