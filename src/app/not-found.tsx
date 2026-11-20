import Link from "next/link";
import { Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <span className="grid size-16 place-items-center rounded-2xl corrugated-texture shadow-depth" aria-hidden="true">
        <Package size={28} className="text-ink-deep" strokeWidth={2.2} />
      </span>
      <h1 className="mt-8 font-display text-4xl font-bold tracking-tight">This box isn&apos;t on the line.</h1>
      <p className="mt-3 text-text-muted">
        The page you asked for never made it past QC. The rest of the factory is open, though.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">Back to the floor</Link>
        <Link href="/boxes" className="btn btn-steel">Browse boxes</Link>
      </div>
    </div>
  );
}
