export const FLUTES = [
  { id: "A", name: "A Flute", mm: "4.8mm", note: "Cushioning & stacking strength" },
  { id: "B", name: "B Flute", mm: "3.2mm", note: "Punch resistance, canned goods" },
  { id: "C", name: "C Flute", mm: "4.0mm", note: "All-purpose shipping workhorse" },
  { id: "E", name: "E Flute", mm: "1.6mm", note: "Print surface for retail & mailers" },
  { id: "F", name: "F Flute", mm: "0.8mm", note: "Ultra-fine, litho-lamination" },
  { id: "DW", name: "Double Wall", mm: "7.6mm", note: "Heavy stacking, fragile goods" },
  { id: "TW", name: "Triple Wall", mm: "11mm+", note: "Crate-class loads & export" },
] as const;
export type FluteId = (typeof FLUTES)[number]["id"];

export const PRINT_METHODS = [
  { id: "offset", name: "Offset Printing", note: "Crisp full-colour on litho-laminated E/F flute" },
  { id: "flexo", name: "Flexographic", note: "Fast, economical high-volume runs" },
  { id: "digital", name: "Digital Printing", note: "No plates, so versioned SKUs from 250 boxes" },
  { id: "uv", name: "UV Printing", note: "High-gloss cured inks, vibrant retail shelf pop" },
  { id: "screen", name: "Screen Printing", note: "Bold spot colour and specialty inks" },
] as const;
export type PrintMethodId = (typeof PRINT_METHODS)[number]["id"];

export const FINISHES = [
  { id: "matte-lam", name: "Matte Lamination" },
  { id: "gloss-lam", name: "Gloss Lamination" },
  { id: "spot-uv", name: "Spot UV" },
  { id: "foil", name: "Foil Stamping" },
  { id: "emboss", name: "Embossing" },
  { id: "deboss", name: "Debossing" },
  { id: "window", name: "Window Patching" },
] as const;
export type FinishId = (typeof FINISHES)[number]["id"];

export const MATERIAL_GRADES = [
  { id: "kraft-3ply", name: "3-Ply Kraft", note: "Lightweight cartons & sleeves" },
  { id: "kraft-5ply", name: "5-Ply Kraft", note: "Standard shippers & mailers" },
  { id: "kraft-7ply", name: "7-Ply Kraft", note: "Heavy-duty & export grade" },
  { id: "recycled", name: "Recycled Board", note: "High post-consumer content" },
  { id: "white-top", name: "White-Top Kraft", note: "Print-critical surfaces" },
] as const;
export type MaterialGradeId = (typeof MATERIAL_GRADES)[number]["id"];

/** Handling marks a converter can print on a shipper. These are the ISO 780
 *  pictograms a packaging buyer actually specifies, so they are drawn rather
 *  than described. Which ones belong on a given family is a commercial
 *  decision, which is why it lives in the catalogue and not in the component. */
export type ShipMark = "fragile" | "up" | "dry";

export const BOX_CATEGORIES = ["Shipping", "Mailer", "Heavy Duty", "Retail", "Food", "Display", "Rigid", "Household"] as const;
export type BoxCategory = (typeof BOX_CATEGORIES)[number];

export interface BoxType {
  id: string;
  name: string;
  category: BoxCategory;
  dimensions: { l: number; w: number; h: number };
  weightCapacity: string;
  flutes: readonly FluteId[];
  printOptions: readonly PrintMethodId[];
  finishOptions: readonly FinishId[];
  moq: string;
  leadTime: string;
  industries: readonly string[];
  desc: string;
  /** Studio render of the finished carton, the way a buyer first meets a box.
   *  Two widths ship per family (`/boxes/<id>.webp` and `-480.webp`); `w`/`h`
   *  are the intrinsic pixels of the large file so the browser can reserve the
   *  frame before the bytes land and the card never reflows. */
  photo: { w: number; h: number };
  d3: {
    /** px at scale 1 */
    w: number;
    h: number;
    d: number;
    colorway: "kraft" | "white-top" | "printed-cmyk" | "printed-orange" | "printed-cyan" | "ink";
    /** handling marks printed on the front panel */
    marks?: readonly ShipMark[];
    pattern?: "cmyk-dots" | "halftone" | "barcode" | "orange-bold" | "cyan-glow" | "window";
  };
}

export const BOXES: readonly BoxType[] = [
  {
    id: "rsc",
    name: "Regular Slotted Container",
    category: "Shipping",
    dimensions: { l: 457, w: 356, h: 406 },
    weightCapacity: "up to 25 kg",
    flutes: ["C", "DW"],
    printOptions: ["flexo", "digital", "offset"],
    finishOptions: ["matte-lam", "gloss-lam"],
    moq: "500 boxes",
    leadTime: "5–7 working days",
    industries: ["ecommerce", "fmcg", "food"],
    desc: "The industry standard shipper. All flaps equal length; outer flaps meet at the centre. Maximum stacking strength per gram of board.",
    photo: { w: 900, h: 675 },
    d3: { w: 250, h: 220, d: 190, colorway: "kraft" , marks: ["up"] },
  },
  {
    id: "die-cut-mailer",
    name: "Die-Cut Mailer Box",
    category: "Mailer",
    dimensions: { l: 305, w: 229, h: 102 },
    weightCapacity: "up to 8 kg",
    flutes: ["E", "B"],
    printOptions: ["digital", "offset", "uv"],
    finishOptions: ["matte-lam", "gloss-lam", "spot-uv", "foil"],
    moq: "250 boxes",
    leadTime: "4–6 working days",
    industries: ["ecommerce", "apparel", "luxury"],
    desc: "One-piece die-cut with auto-bottom crash lock. The D2C unboxing favourite. Tears open clean, no tape, photographs beautifully.",
    photo: { w: 900, h: 675 },
    d3: { w: 262, h: 96, d: 190, colorway: "printed-cmyk", pattern: "cmyk-dots" , marks: ["fragile", "up"] },
  },
    {
    id: "telescopic",
    name: "Telescopic Box",
    category: "Shipping",
    dimensions: { l: 406, w: 406, h: 305 },
    weightCapacity: "up to 18 kg",
    flutes: ["B", "C", "DW"],
    printOptions: ["flexo", "offset", "screen"],
    finishOptions: ["matte-lam", "window"],
    moq: "500 boxes",
    leadTime: "6–8 working days",
    industries: ["electronics", "fmcg", "automotive"],
    desc: "Two-piece design: a full-depth lid slides over the base. When contents must drop in from above and lock rigid.",
    photo: { w: 900, h: 675 },
    d3: { w: 240, h: 250, d: 210, colorway: "white-top" , marks: ["fragile", "up", "dry"] },
  },
  {
    id: "heavy-duty-crate",
    name: "Heavy-Duty Shipping Crate",
    category: "Heavy Duty",
    dimensions: { l: 1200, w: 800, h: 1000 },
    weightCapacity: "up to 300 kg",
    flutes: ["TW", "DW"],
    printOptions: ["flexo", "screen"],
    finishOptions: [],
    moq: "100 crates",
    leadTime: "8–12 working days",
    industries: ["automotive", "furniture", "export"],
    desc: "Triple-wall crate-class board with engineered corner posts. Replaces wooden crates at a fraction of weight and ISPM-15 paperwork.",
    photo: { w: 900, h: 675 },
    d3: { w: 250, h: 240, d: 205, colorway: "kraft", pattern: "barcode" , marks: ["up"] },
  },
  {
    id: "rigid-gift",
    name: "Premium Rigid Paper Box",
    category: "Rigid",
    dimensions: { l: 254, w: 254, h: 76 },
    weightCapacity: "up to 5 kg",
    flutes: [],
    printOptions: ["offset", "uv", "screen"],
    finishOptions: ["foil", "spot-uv", "emboss", "deboss", "matte-lam", "gloss-lam"],
    moq: "500 boxes",
    leadTime: "8–10 working days",
    industries: ["luxury", "apparel", "fmcg"],
    desc: "Chipboard wrapped in specialty paper. Magnetic closures, foil-stamped logos, silk linings. The luxury retail launch box.",
    photo: { w: 900, h: 675 },
    d3: { w: 250, h: 90, d: 250, colorway: "ink", pattern: "orange-bold" , marks: ["fragile"] },
  },
  {
    id: "food-carton",
    name: "Food Packaging Carton",
    category: "Food",
    dimensions: { l: 190, w: 130, h: 180 },
    weightCapacity: "up to 3 kg",
    flutes: ["E", "F", "B"],
    printOptions: ["offset", "flexo", "digital"],
    finishOptions: ["matte-lam", "gloss-lam", "window"],
    moq: "1,000 units",
    leadTime: "5–7 working days",
    industries: ["food", "fmcg", "pharma"],
    desc: "Food-grade board with grease-resistant barriers. Window-patch ready for bakery, QSR and fresh formats.",
    photo: { w: 900, h: 675 },
    d3: { w: 180, h: 210, d: 150, colorway: "printed-orange", pattern: "window" , marks: ["up", "dry"] },
  },
  {
    id: "display-tray",
    name: "Display Tray",
    category: "Display",
    dimensions: { l: 400, w: 300, h: 90 },
    weightCapacity: "up to 15 kg",
    flutes: ["B", "E", "DW"],
    printOptions: ["offset", "uv", "flexo"],
    finishOptions: ["gloss-lam", "spot-uv"],
    moq: "300 trays",
    leadTime: "6–9 working days",
    industries: ["fmcg", "food", "luxury"],
    desc: "Shelf-ready retail trays that go from corrugator to checkout without repacking. Full-bleed UV print for shelf pop.",
    photo: { w: 900, h: 675 },
    d3: { w: 255, h: 90, d: 165, colorway: "printed-cyan", pattern: "cyan-glow" , marks: ["fragile", "up"] },
  },
  {
    id: "wardrobe",
    name: "Wardrobe Carton",
    category: "Household",
    dimensions: { l: 610, w: 470, h: 1150 },
    weightCapacity: "up to 30 kg",
    flutes: ["C", "DW", "B"],
    printOptions: ["flexo", "screen", "digital"],
    finishOptions: ["matte-lam"],
    moq: "200 boxes",
    leadTime: "6–8 working days",
    industries: ["apparel", "export", "furniture"],
    desc: "Tall-format hanging wardrobe with metal hanging bar ports. Suits hanging, folded or mover-grade garment logistics.",
    photo: { w: 900, h: 675 },
    d3: { w: 170, h: 300, d: 150, colorway: "kraft" , marks: ["up"] },
  },
] as const;

export const BOX_IDS = BOXES.map((b) => b.id);

export function isBoxId(id: string | undefined | null): id is BoxType["id"] {
  return !!id && BOXES.some((b) => b.id === id);
}
export function isFluteId(id: string | undefined | null): id is FluteId {
  return !!id && FLUTES.some((f) => f.id === id);
}
export function isPrintId(id: string | undefined | null): id is PrintMethodId {
  return !!id && PRINT_METHODS.some((p) => p.id === id);
}
export function isFinishId(id: string | undefined | null): id is FinishId {
  return !!id && FINISHES.some((f) => f.id === id);
}
export function isGradeId(id: string | undefined | null): id is MaterialGradeId {
  return !!id && MATERIAL_GRADES.some((g) => g.id === id);
}
export function getBox(id: string | undefined | null): BoxType | undefined {
  return BOXES.find((b) => b.id === id);
}
export function fluteName(id: FluteId): string {
  return FLUTES.find((f) => f.id === id)?.name ?? id;
}
export function printName(id: PrintMethodId): string {
  return PRINT_METHODS.find((p) => p.id === id)?.name ?? id;
}
export function finishName(id: FinishId): string {
  return FINISHES.find((f) => f.id === id)?.name ?? id;
}

/* ---------- product photography ---------- */

/** The studio render of a finished carton. Paths are derived from the family
 *  id rather than stored per entry, so adding a family and dropping two files
 *  into /public/boxes is the whole job. */
export function photoSrc(box: BoxType): string {
  return `/boxes/${box.id}.webp`;
}
export function photoSrcSmall(box: BoxType): string {
  return `/boxes/${box.id}-480.webp`;
}
/** Alt text names the box and its size, because that is what a screen-reader
 *  user is missing when a photo replaces a labelled drawing — and because it is
 *  the same string the search engines read. No trailing "carton": half these
 *  family names already end in one. */
export function photoAlt(box: BoxType): string {
  const { l, w, h } = box.dimensions;
  return `${box.name}, ${l} × ${w} × ${h} mm`;
}
