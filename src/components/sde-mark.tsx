import { SDE_FACES, SDE_VIEWBOX } from "@/lib/sde-mark";

/**
 * Sri Divya Enterprises brand mark: an isometric carton with S, D and E
 * knocked out of its three visible faces. Source: brand/logo/A-cube-colour.svg.
 * Letters and face gaps are transparent, so the mark reads on dark and light
 * backgrounds alike.
 */
export function SdeMark({ className, title }: { className?: string; title?: string }) {
  const { x, y, size } = SDE_VIEWBOX;
  return (
    <svg
      viewBox={`${x} ${y} ${size} ${size}`}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <SdeMarkFaces />
    </svg>
  );
}

/** The bare faces in mark space (58..454), for embedding in other SVGs.
 *  Pass `color` for a single-ink print; omit it for the three-tone mark. */
export function SdeMarkFaces({ color }: { color?: string }) {
  return (
    <>
      {SDE_FACES.map((f) => (
        <path
          key={f.letter}
          transform={`matrix(${f.m.join(",")})`}
          fill={color ?? f.tone}
          fillRule="evenodd"
          d={f.d}
        />
      ))}
    </>
  );
}

/** Mark placed as a size×size square at (x, y) inside a parent SVG. */
export function SdeMarkAt({ x, y, size, color }: { x: number; y: number; size: number; color?: string }) {
  const k = size / SDE_VIEWBOX.size;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(${-SDE_VIEWBOX.x} ${-SDE_VIEWBOX.y})`}>
      <SdeMarkFaces color={color} />
    </g>
  );
}
