import { BOXES, getBox } from "@/lib/boxes";
import { RfqForm, type QuotePrefill } from "@/components/rfq-form-client";

// server wrapper: full SSR for crawlers; reads prefill searchParams at
// request time (the client-only Suspense version rendered an empty shell)
export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string): string | undefined => {
    const v = sp[k];
    return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
  };
  const boxId = get("box");
  const box = boxId ? getBox(boxId) : undefined;
  const prefill: QuotePrefill = {
    boxType: box?.id ?? (boxId && BOXES.some((b) => b.id === boxId) ? boxId : "rsc"),
    l: Number(get("l") ?? box?.dimensions.l ?? 300),
    w: Number(get("w") ?? box?.dimensions.w ?? 200),
    h: Number(get("h") ?? box?.dimensions.h ?? 150),
    flute: get("flute") ?? box?.flutes[0] ?? "C",
    grade: get("grade") ?? "kraft-5ply",
    print: get("print") ?? box?.printOptions[0] ?? "flexo",
    finish: get("finish") ?? "matte-lam",
    qty: Number(get("qty") ?? 500),
  };
  return <RfqForm prefill={prefill} />;
}
