"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, RotateCcw, Package, Ruler, Layers3, Palette, Sparkles,
} from "lucide-react";
import { BoxDieline, type Colorway } from "@/components/box-dieline";
import dynamic from "next/dynamic";

/* WebGL viewer, client only: three.js never runs on the server. */
const BoxViewer = dynamic(() => import("@/components/box-viewer/BoxViewer"), {
  ssr: false,
  loading: () => <div className="bv__loading">Loading 3D preview…</div>,
});
import {
  BOXES, FLUTES, PRINT_METHODS, FINISHES, MATERIAL_GRADES,
  getBox, type FluteId, type PrintMethodId, type FinishId, type MaterialGradeId } from "@/lib/boxes";
import type { CustomParams } from "@/lib/customizer";
import { formatMm, formatQty, cn } from "@/lib/utils";

export function Configurator({ initial }: { initial: CustomParams }) {

  const box = getBox(initial.type) ?? BOXES[1];

  const [type, setType] = useState(initial.type);
  const [l, setL] = useState(initial.l);
  const [w, setW] = useState(initial.w);
  const [h, setH] = useState(initial.h);
  const [flute, setFlute] = useState<FluteId>(initial.flute);
  const [grade, setGrade] = useState<MaterialGradeId>(initial.grade);
  const [print, setPrint] = useState<PrintMethodId>(initial.print);
  const [finish, setFinish] = useState<FinishId>(initial.finish);
  const [qty, setQty] = useState(initial.qty);
  /* Solid is the default because it is the view that answers the question the
   * sliders are asking — "what will this look like?". The blank is one click
   * away for anyone who is really asking "how is it cut?". */
  const [view, setView] = useState<"solid" | "blank">("solid");

  const current = getBox(type) ?? box;
  const previewBox = useMemo(
    () => ({
      w: Math.max(120, Math.round((l / Math.max(l, w, h)) * 250)),
      h: Math.max(50, Math.round((h / Math.max(l, w, h)) * 250)),
      d: Math.max(110, Math.round((w / Math.max(l, w, h)) * 250)),
    }),
    [l, w, h]
  );

  const printColorway: Record<PrintMethodId, Colorway> = {
    flexo: "kraft",
    offset: "white-top",
    digital: "printed-cmyk",
    uv: "printed-cyan",
    screen: "printed-orange",
  };

  const quoteHref = useMemo(() => {
    const qs = new URLSearchParams({
      box: type,
      l: String(l), w: String(w), h: String(h),
      flute, grade, print, finish, qty: String(qty),
    });
    return `/quote?${qs.toString()}`;
  }, [type, l, w, h, flute, grade, print, finish, qty]);

  const fluteInfo = FLUTES.find((f) => f.id === flute);
  const printInfo = PRINT_METHODS.find((p) => p.id === print);
  const finishInfo = FINISHES.find((f) => f.id === finish);
  const gradeInfo = MATERIAL_GRADES.find((g) => g.id === grade);

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-6">
      {/* compact intro row + sticky quote bar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker flex items-center gap-2"><Ruler size={13} aria-hidden="true" /> Live configurator</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">Your box, in 3D, before it exists.</h1>
        </div>
        <Link href={quoteHref} className="btn btn-primary h-11 px-6">
          Send this spec to Quote <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {/* side-by-side: preview | controls — everything in one viewport height */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* preview column — sticky on tall scroll, compact height */}
        <div className="metal-panel relative overflow-hidden rounded-2xl p-4 lg:sticky lg:top-24">
          <div className="pointer-events-none absolute inset-0 industrial-grid opacity-50" aria-hidden="true" />

          {/* Two views of one box. Segmented rather than a dropdown because it is
              a live A/B of the same spec, not a setting the user has chosen once. */}
          <div
            role="group"
            aria-label="Preview view"
            className="relative mb-3 inline-flex rounded-full border border-line bg-surface-2 p-0.5"
          >
            {([["solid", "Solid box"], ["blank", "Blank"]] as const).map(([id, text]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-pressed={view === id}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-medium transition-colors",
                  view === id ? "bg-orange-print/20 text-text" : "text-text-muted hover:text-text"
                )}
              >
                {text}
              </button>
            ))}
          </div>

          <div className="showcase-visual !min-h-[380px] lg:!min-h-[560px]">
            {view === "solid" ? (
              <BoxViewer
                type={type}
                l={l}
                w={w}
                h={h}
                flute={flute}
                grade={grade}
                print={print}
                finish={finish}
                label={`${current.name}, ${formatMm(l)} by ${formatMm(w)} by ${formatMm(h)}, ${fluteInfo?.name}, ${finishInfo?.name}`}
              />
            ) : (
              <BoxDieline
                key={`${type}-${flute}`}
                w={previewBox.w}
                h={previewBox.h}
                d={previewBox.d}
                colorway={printColorway[print]}
                pattern={print === "digital" ? "cmyk-dots" : print === "uv" ? "cyan-glow" : print === "screen" ? "orange-bold" : print === "offset" ? "barcode" : undefined}
                branded
                label={`${current.name} blank, ${formatMm(l)} by ${formatMm(w)} by ${formatMm(h)}, ${fluteInfo?.name}`}
              />
            )}
          </div>
          <p className="text-center font-mono text-xs text-text-dim">
            {current.name} · {fluteInfo?.name} · {printInfo?.name}
          </p>
        </div>

        {/* controls column — compact grid: two fieldsets per row on wide screens */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Box type — spans both columns, tight chip grid */}
          <fieldset className="metal-panel rounded-2xl p-4 md:col-span-2">
            <legend className="sr-only">Box type</legend>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Package size={15} className="text-orange-print" aria-hidden="true" /> Box type</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {BOXES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setType(b.id);
                    setL(b.dimensions.l); setW(b.dimensions.w); setH(b.dimensions.h);
                    if (b.flutes[0]) setFlute(b.flutes[0]);
                    if (b.printOptions[0]) setPrint(b.printOptions[0]);
                  }}
                  aria-pressed={type === b.id}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    type === b.id ? "border-orange-print bg-orange-print/15 text-text" : "border-line bg-surface-2 text-text-muted hover:text-text"
                  )}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Dimensions */}
          <fieldset className="metal-panel rounded-2xl p-4">
            <legend className="sr-only">Dimensions</legend>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Ruler size={15} className="text-orange-print" aria-hidden="true" /> Dimensions (mm)</h2>
            {([
              ["Length", l, setL, 40, 2000],
              ["Width", w, setW, 40, 2000],
              ["Height", h, setH, 20, 2000],
            ] as const).map(([label, val, set, min, max]) => (
              <div key={label} className="mt-3">
                <div className="flex items-baseline justify-between">
                  <label htmlFor={`dim-${label}`} className="field-label !mb-1.5">{label}</label>
                  <output htmlFor={`dim-${label}`} className="font-mono text-xs text-cyan-print">{formatMm(val)}</output>
                </div>
                <input
                  id={`dim-${label}`}
                  type="range" min={min} max={max} step={1} value={val}
                  onChange={(e) => set(Number(e.target.value))}
                  style={{ ["--range-fill" as string]: `${((val - min) / (max - min)) * 100}%` } as React.CSSProperties}
                />
              </div>
            ))}
          </fieldset>

          {/* Flute + grade + qty */}
          <fieldset className="metal-panel rounded-2xl p-4">
            <legend className="sr-only">Material and quantity</legend>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Layers3 size={15} className="text-orange-print" aria-hidden="true" /> Flute · board · qty</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {FLUTES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFlute(f.id)}
                  aria-pressed={flute === f.id}
                  title={f.note}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                    flute === f.id ? "border-cyan-print bg-cyan-print/15 text-text" : "border-line bg-surface-2 text-text-muted hover:text-text"
                  )}
                >
                  {f.name} <span className="font-mono text-[0.6rem] text-text-dim">{f.mm}</span>
                </button>
              ))}
            </div>
            <label htmlFor="grade-select" className="field-label mt-3">Board grade</label>
            <select id="grade-select" className="field-input !h-10" value={grade} onChange={(e) => setGrade(e.target.value as MaterialGradeId)}>
              {MATERIAL_GRADES.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.note})</option>)}
            </select>
            <div className="mt-3 flex items-baseline justify-between">
              <label htmlFor="qty" className="field-label !mb-1.5">Quantity</label>
              <output htmlFor="qty" className="font-mono text-xs text-cyan-print">{formatQty(qty)}</output>
            </div>
            <input
              id="qty" type="range" min={100} max={50000} step={100} value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              style={{ ["--range-fill" as string]: `${((qty - 100) / 49900) * 100}%` } as React.CSSProperties}
            />
          </fieldset>

          {/* Printing */}
          <fieldset className="metal-panel rounded-2xl p-4">
            <legend className="sr-only">Printing</legend>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Palette size={15} className="text-orange-print" aria-hidden="true" /> Printing</h2>
            <div className="mt-3 grid gap-1.5">
              {PRINT_METHODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPrint(p.id)}
                  aria-pressed={print === p.id}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-left transition-colors",
                    print === p.id ? "border-orange-print bg-orange-print/15" : "border-line bg-surface-2 hover:border-cyan-print/40"
                  )}
                >
                  <span className="text-xs font-semibold">{p.name}</span>
                  <span className="block text-[0.68rem] text-text-dim">{p.note}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Finish + spec summary */}
          <fieldset className="metal-panel rounded-2xl p-4">
            <legend className="sr-only">Finish</legend>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={15} className="text-orange-print" aria-hidden="true" /> Finish</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFinish(f.id)}
                  aria-pressed={finish === f.id}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                    finish === f.id ? "border-orange-print bg-orange-print/15 text-text" : "border-line bg-surface-2 text-text-muted hover:text-text"
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
            {/* spec summary — lives with finish so the CTA context is one glance */}
            <dl className="mt-4 grid gap-1 font-mono text-[0.68rem]">
              {[
                ["Dims", `${l} × ${w} × ${h}`],
                ["Flute", fluteInfo?.name ?? "Not set"],
                ["Grade", gradeInfo?.name ?? "Not set"],
                ["Print", printInfo?.name ?? "Not set"],
                ["Finish", finishInfo?.name ?? "Not set"],
                ["Qty", formatQty(qty)],
                ["MOQ", current.moq],
                ["Lead", current.leadTime],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line/50 pb-1">
                  <dt className="text-text-dim uppercase tracking-wider">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </fieldset>

          {/* bottom CTA row — spans both columns, mirrors the top bar */}
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-print/25 bg-orange-print/10 px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs text-text-muted">
              <RotateCcw size={13} aria-hidden="true" /> prototype in ~48h from spec lock · MOQ {current.moq}
            </p>
            <Link href={quoteHref} className="btn btn-primary h-11 px-6">
              Send spec to Quote <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
