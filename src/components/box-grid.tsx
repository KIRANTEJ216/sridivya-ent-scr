import Image from "next/image";
import Link from "next/link";
import { BOXES, photoAlt, photoSrc, type BoxType } from "@/lib/boxes";
import { cn } from "@/lib/utils";

/**
 * BoxGrid — every box family, once, and no further.
 *
 * This replaces an infinite virtualised stream that kept appending batches of
 * cards as you scrolled and grew the document without bound. A catalogue is a
 * finite thing: eight families, and a buyer needs to be able to see all eight,
 * count them, and reach the last one without scrolling forever. So the page now
 * ends.
 *
 * Each cell is a studio photograph of the finished carton rather than a flat
 * blank, because at a glance a buyer is shopping for solid boxes — and because
 * the house mark printed on the panel is the fastest way to say who presses the
 * board. The blank is still one click away on the product page, where the
 * engineering detail belongs.
 *
 * The eight shots were generated against one identical scaffold and reviewed as
 * a set, so the key light, backdrop and board colour read as a single shoot.
 * Two were rerolled: a dark box had lost the lockup against its own board, and a
 * carton had dropped the words under its handling arrows.
 */

function specLine(box: BoxType) {
  const { l, w, h } = box.dimensions;
  return `${l} × ${w} × ${h} mm`;
}

export interface BoxGridProps {
  /** Restrict to these families; omit for the full catalogue. */
  ids?: readonly string[];
  className?: string;
}

export function BoxGrid({ ids, className }: BoxGridProps) {
  const boxes = ids?.length ? BOXES.filter((b) => ids.includes(b.id)) : BOXES;
  if (!boxes.length) return null;

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {boxes.map((box) => (
        <li key={box.id} data-box-card={box.id}>
          <Link
            href={`/boxes/${box.id}`}
            className={cn(
              "group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface-2",
              "transition-[transform,border-color,box-shadow] duration-300 ease-out",
              "hover:-translate-y-1 hover:border-line-strong hover:shadow-depth-lg",
              "focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2",
              "focus-visible:outline-accent"
            )}
          >
            {/* The photograph already carries the studio backdrop, the key light
                and the contact shadow, so the stage supplies framing and nothing
                else — adding a second radial floor here just muddies an image
                that has one baked in. */}
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
              <Image
                src={photoSrc(box)}
                alt={photoAlt(box)}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              />
              <span className="absolute left-4 top-4 rounded-full border border-line bg-surface-1/85 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-text-dim">
                {box.category}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 border-t border-line p-4">
              <h3 className="text-sm font-semibold leading-snug text-text">
                {box.name}
              </h3>
              <p className="font-mono text-[0.7rem] tracking-tight text-text-dim">
                {specLine(box)}
              </p>
              <p className="line-clamp-2 text-xs leading-relaxed text-text-muted">
                {box.desc}
              </p>
              <span className="mt-auto pt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
                Specifications
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
