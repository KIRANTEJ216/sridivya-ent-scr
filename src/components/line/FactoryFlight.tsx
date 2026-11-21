"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { LEGS, LEG_START_VH, TOTAL_WEIGHT, SEAM, HOLD_VH, seqUrl } from "@/lib/flight";
import { LEG_COPY, FINALE } from "./copy";
import { LineRail } from "./LineRail";
import { Dieline } from "./Dieline";

/**
 * The factory flight, rebuilt on an image sequence instead of video seeking.
 *
 * Why: scrubbing an H.264 file by writing `currentTime` on every scroll tick
 * asks the decoder to seek, and seeks are asynchronous. The playhead arrives
 * late and in steps, which is the "not smooth" feel. Pre-decoded frames drawn
 * to one canvas are synchronous: the frame the hand asks for is the frame that
 * paints, on the same animation frame.
 *
 * Three things make it read as one continuous machine line:
 *  1. A damped playhead (frame-rate independent lerp), so wheel ticks become a
 *     glide instead of a series of jumps.
 *  2. Sub-frame blending: the two frames either side of the playhead are mixed
 *     by the fractional part, so 15 fps source footage moves like 60.
 *  3. One-sided seams: at a leg boundary the incoming leg fades over the
 *     outgoing one, which holds underneath, so there is never a dip to black.
 *
 * Layout is a sticky stage inside a tall section, so the page continues into
 * normal, crawlable content once the line has run.
 */

const LERP = 0.085; // per 60 fps frame; lower is silkier
const STRIDES = [8, 4, 2, 1]; // coarse-to-fine loading, so scrubbing works early
const CONCURRENCY = 6;

type Frames = (HTMLImageElement | null)[];

function clamp(v: number, a = 0, b = 1) {
  return v < a ? a : v > b ? b : v;
}

/** Plateau opacity across [from, to] (in vh of track), with eased ramps. */
function plateau(t: number, from: number, to: number, ramp = 0.28) {
  const span = to - from;
  if (span <= 0) return 0;
  const r = span * ramp;
  const a = clamp((t - from) / r);
  const b = clamp((to - t) / r);
  const v = Math.min(a, b);
  return v * v * (3 - 2 * v);
}

export function FactoryFlight() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finaleRef = useRef<HTMLDivElement>(null);
  const dielineRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = matchMedia("(max-width: 760px), (pointer: coarse)").matches;
    const variant = mobile ? "m" : "d";

    /* ---------------- frame store + loader ---------------- */
    const frames: Frames[] = LEGS.map((l) => new Array(l.frames).fill(null));
    const requested: Set<number>[] = LEGS.map(() => new Set());
    let inflight = 0;
    let dirty = true;
    let disposed = false;
    let engaged = false;
    let focusLeg = 0;

    const nextJob = (): [number, number] | null => {
      // Legs ordered by distance from where the reader is, the current leg
      // first, then ahead before behind.
      const order = LEGS.map((_, i) => i).sort((a, b) => {
        const da = Math.abs(a - focusLeg) + (a < focusLeg ? 0.5 : 0);
        const db = Math.abs(b - focusLeg) + (b < focusLeg ? 0.5 : 0);
        return da - db;
      });
      for (const stride of STRIDES) {
        for (const li of order) {
          // Do not fetch fine passes far away from the reader.
          // Coarse frames only near the reader, fine frames only on the
          // current leg and the next: the first visit stays around 1 MB and
          // the rest arrives as the reader actually scrolls.
          const dist = li - focusLeg;
          if (stride === 8 && (dist < -1 || dist > 2)) continue;
          if (stride === 4 && (dist < 0 || dist > 1)) continue;
          if (stride < 4 && dist !== 0) continue;
          // Until the visitor scrolls, half-rate frames of the opening leg are
          // plenty: blending hides the gap and the first visit stays light.
          if (!engaged && stride === 1) continue;
          const n = LEGS[li].frames;
          for (let f = 0; f < n; f += stride) {
            if (!requested[li].has(f)) return [li, f];
          }
          if (!requested[li].has(n - 1)) return [li, n - 1];
        }
      }
      return null;
    };

    const pump = () => {
      while (!disposed && inflight < CONCURRENCY) {
        const job = nextJob();
        if (!job) return;
        const [li, f] = job;
        requested[li].add(f);
        inflight++;
        const img = new Image();
        img.decoding = "async";
        img.src = seqUrl(LEGS[li].id, f, variant);
        const done = (ok: boolean) => {
          inflight--;
          if (ok && !disposed) {
            frames[li][f] = img;
            dirty = true;
          }
          pump();
        };
        img
          .decode()
          .then(() => done(true))
          .catch(() => done(false));
      }
    };

    // Start fetching only after the page has loaded and painted, so frames
    // never compete with the HTML, fonts and poster, and never hold the
    // window load event open.
    let started = false;
    const start = () => {
      if (disposed) return;
      started = true;
      pump();
    };
    const kick = () => {
      const ric = (
        window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
      ).requestIdleCallback;
      if (ric) ric(start, { timeout: 1500 });
      else setTimeout(start, 300);
    };
    if (document.readyState === "complete") kick();
    else addEventListener("load", kick, { once: true });
    // Scrolling before load is a clear signal: start at once.
    const onFirstScroll = () => {
      engaged = true;
      start();
    };
    addEventListener("scroll", onFirstScroll, { once: true, passive: true });

    /** The requested frame, or the nearest one already loaded in that leg. */
    const frameAt = (li: number, f: number): HTMLImageElement | null => {
      const list = frames[li];
      const i = Math.round(clamp(f, 0, list.length - 1));
      if (list[i]) return list[i];
      for (let d = 1; d < list.length; d++) {
        if (list[i - d]) return list[i - d];
        if (list[i + d]) return list[i + d];
      }
      return null;
    };

    /* ---------------- canvas sizing ---------------- */
    let cw = 0;
    let ch = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 2 : 1.5);
      const r = canvas.getBoundingClientRect();
      cw = Math.max(1, Math.round(r.width * dpr));
      ch = Math.max(1, Math.round(r.height * dpr));
      canvas.width = cw;
      canvas.height = ch;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /** cover-fit with a slow camera push across each leg */
    const drawImg = (img: HTMLImageElement, alpha: number, push: number) => {
      if (alpha <= 0.001) return;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const s = Math.max(cw / iw, ch / ih) * (reduced ? 1 : 1 + push);
      const w = iw * s;
      const h = ih * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    /** draw one leg at local progress p with sub-frame blending */
    const drawLeg = (li: number, p: number, alpha: number) => {
      const n = LEGS[li].frames;
      const fpos = clamp(p) * (n - 1);
      const f0 = Math.floor(fpos);
      const frac = fpos - f0;
      const push = 0.012 + 0.05 * clamp(p);
      const a = frameAt(li, f0);
      if (!a) return false;
      drawImg(a, alpha, push);
      if (frac > 0.02 && f0 + 1 < n && frames[li][f0 + 1] && !reduced) {
        drawImg(frames[li][f0 + 1]!, alpha * frac, push);
      }
      return true;
    };

    /* ---------------- scroll -> playhead ---------------- */
    const vh = () => window.innerHeight || 1;
    const targetT = () => {
      const top = section.getBoundingClientRect().top;
      return clamp(-top / vh(), 0, TOTAL_WEIGHT + HOLD_VH);
    };

    let cur = targetT();
    let last = performance.now();
    let lastSeg = -1;
    let drewOnce = false;
    let raf = 0;

    const legAt = (t: number) => {
      let i = 0;
      while (i < LEGS.length - 1 && t >= LEG_START_VH[i + 1]) i++;
      return i;
    };

    const render = () => {
      const tt = Math.min(cur, TOTAL_WEIGHT - 0.0001);
      const li = legAt(tt);
      const start = LEG_START_VH[li];
      const w = LEGS[li].weight;
      const local = clamp((tt - start) / w);

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0b0e13";
      ctx.fillRect(0, 0, cw, ch);

      let ok: boolean;
      const half = SEAM / 2;
      const end = start + w;
      if (li < LEGS.length - 1 && tt > end - half) {
        // approaching the next leg: outgoing holds, incoming fades over it
        ok = drawLeg(li, local, 1);
        const a = clamp((tt - (end - half)) / SEAM);
        drawLeg(li + 1, 0, a * a * (3 - 2 * a));
      } else if (li > 0 && tt < start + half) {
        // just past a boundary: finish the incoming fade
        ok = drawLeg(li - 1, 1, 1);
        const a = clamp((tt - (start - half)) / SEAM);
        const ok2 = drawLeg(li, local, a * a * (3 - 2 * a));
        ok = ok || ok2;
      } else {
        ok = drawLeg(li, local, 1);
      }
      ctx.globalAlpha = 1;

      if (ok && !drewOnce) {
        drewOnce = true;
        canvas.dataset.live = "true";
        posterRef.current?.setAttribute("data-hidden", "true");
      }

      /* chrome: progress, rail, signature move */
      const root = document.documentElement;
      root.style.setProperty("--sc-seg", String(li));
      root.style.setProperty("--sc-segp", local.toFixed(4));
      if (li !== lastSeg) {
        lastSeg = li;
        focusLeg = li;
        if (started) pump();
        dispatchEvent(
          new CustomEvent("sc:waypoint", {
            detail: { index: li, count: LEGS.length, label: LEGS[li].label, progress: local },
          })
        );
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${clamp(cur / TOTAL_WEIGHT)})`;
      }
      if (dielineRef.current) {
        const on = li === 2 ? 1 : 0;
        dielineRef.current.style.opacity = String(on);
      }

      /* copy windows, in vh of track */
      LEGS.forEach((leg, i) => {
        const el = copyRefs.current[i];
        if (!el) return;
        const s = LEG_START_VH[i];
        const lw = leg.weight;
        let o: number;
        let k: number;
        if (i === 0) {
          o = 1 - clamp((cur - lw * 0.32) / (lw * 0.3));
          k = clamp(cur / (lw * 0.62));
        } else if (i === LEGS.length - 1) {
          o = plateau(cur, s + lw * 0.04, s + lw * 0.5, 0.3);
          k = clamp((cur - s) / (lw * 0.5));
        } else {
          o = plateau(cur, s + lw * 0.06, s + lw * 0.94);
          k = clamp((cur - s) / lw);
        }
        const y = reduced ? 0 : (0.5 - k) * 4; // capped at 4vh of travel
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${y.toFixed(2)}vh, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
      });
      const fin = finaleRef.current;
      if (fin) {
        const s = LEG_START_VH[LEGS.length - 1];
        const lw = LEGS[LEGS.length - 1].weight;
        const o = clamp((cur - (s + lw * 0.55)) / (lw * 0.3));
        const e = o * o * (3 - 2 * o);
        fin.style.opacity = e.toFixed(3);
        fin.style.transform = `translate3d(0, ${reduced ? 0 : ((1 - e) * 2).toFixed(2)}vh, 0)`;
        fin.style.visibility = e < 0.01 ? "hidden" : "visible";
        fin.style.pointerEvents = e > 0.5 ? "auto" : "none";
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, now - last);
      last = now;
      const target = targetT();
      const prev = cur;
      if (reduced) cur = target;
      else {
        const k = 1 - Math.pow(1 - LERP, dt / 16.667);
        cur += (target - cur) * k;
        if (Math.abs(target - cur) < 0.0004) cur = target;
      }
      if (cur !== prev) dirty = true;
      if (dirty) {
        dirty = false;
        render();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      removeEventListener("load", kick);
      removeEventListener("scroll", onFirstScroll);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const trackVh = (TOTAL_WEIGHT + HOLD_VH + 1) * 100;

  return (
    <section
      ref={sectionRef}
      className="ff"
      style={{ height: `${trackVh}svh` }}
      aria-label="Inside the Sri Divya corrugated box factory, Jeedimetla, Hyderabad"
    >
      <div className="ff__stage">
        {/* first paint and LCP: the opening frame as a real image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={posterRef}
          className="ff__poster"
          src="/line/reel-poster.webp"
          alt="Kraft paper reel unrolling into the corrugator at Sri Divya Enterprises, Jeedimetla, Hyderabad"
          fetchPriority="high"
          decoding="async"
        />
        <canvas ref={canvasRef} className="ff__canvas" aria-hidden="true" />
        <div className="ff__grade" aria-hidden="true" />
        <div className="ff__grain" aria-hidden="true" />

        {LEGS.map((leg, i) => {
          const copy = LEG_COPY[i];
          const anchor = copy.anchor === "lead" ? "ff-copy--lead" : "ff-copy--trail";
          return (
            <div
              key={leg.id}
              ref={(el) => {
                copyRefs.current[i] = el;
              }}
              className={`ff-copy ${anchor}`}
              style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
            >
              <p className="ff-kicker">
                <span className="ff-kicker__idx">{String(i + 1).padStart(2, "0")}</span>
                {copy.kicker}
              </p>
              {i === 0 ? (
                <>
                  <h1 className="ff-h1">
                    Corrugated boxes,
                    <br />
                    <span className="ff-h1__accent">engineered in Hyderabad.</span>
                  </h1>
                  <p className="ff-body">{copy.body}</p>
                  <div className="ff-cta">
                    <Link href="/quote" className="btn btn-primary h-12 px-7 text-base">
                      Request a quote
                    </Link>
                    <Link href="/boxes" className="btn btn-ghost h-12 px-6 text-base">
                      See the box families
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="ff-h2">{copy.heading}</h2>
                  <p className="ff-body">{copy.body}</p>
                  {copy.spec && <p className="ff-spec">{copy.spec}</p>}
                </>
              )}
            </div>
          );
        })}

        <div
          ref={finaleRef}
          className="ff-copy ff-copy--finale"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <p className="ff-kicker">{FINALE.kicker}</p>
          <h2 className="ff-h2 ff-h2--xl">{FINALE.heading}</h2>
          <p className="ff-body">{FINALE.body}</p>
          <div className="ff-cta">
            <Link href="/quote" className="btn btn-primary h-12 px-8 text-base">
              Request a quote
            </Link>
            <a href="#jeedimetla" className="btn btn-ghost h-12 px-6 text-base">
              Visit the factory
            </a>
          </div>
        </div>

        <div ref={dielineRef} className="ff__dieline">
          <Dieline />
        </div>

        <div className="ff__progress" aria-hidden="true">
          <div ref={barRef} className="ff__bar" />
        </div>
        <LineRail />
      </div>
    </section>
  );
}
