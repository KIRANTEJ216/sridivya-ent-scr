import type { LegId } from "@/lib/flight";

export type LegCopy = {
  leg: LegId;
  kicker: string;
  heading: string;
  body: string;
  /** Optional short data line rendered in mono beneath the body. */
  spec?: string;
  anchor: "lead" | "trail";
};

/**
 * Copy windows. Each block declares its window against the whole track, not a
 * leg, and each is a plateau (ramp in over 30%, hold, ramp out over 30%).
 *
 * The page is deliberately short on prose: a continuous world has room for
 * lines, not essays. Everything long-form lives on /clients, which is linked
 * from the finale. Anchors alternate so the eye is never parked in the same
 * corner twice.
 */
export const LEG_COPY: LegCopy[] = [
  {
    leg: "reel",
    kicker: "Jeedimetla, Hyderabad · since 2007",
    heading: "Corrugated boxes, engineered in Hyderabad.",
    body: "It starts as a reel of kraft paper. Recycled-content liners and fluting medium run into our corrugator in Jeedimetla and come out as 3, 5 or 7 ply board, graded for the load it has to carry.",
    anchor: "lead",
  },
  {
    leg: "diecut",
    kicker: "Die-cutting line",
    heading: "Cut to the millimetre.",
    body: "Flatbed die-cutting with our own tool room. Slots, crease lines, crash-lock bottoms and window cut-outs are pressed in one pass, so every blank in a run matches the first one you approved.",
    spec: "In-house dies · flutes A to F",
    anchor: "trail",
  },
  {
    leg: "flat",
    kicker: "The flat blank",
    heading: "One sheet. Every fold already decided.",
    body: "A die-cut blank carries the whole box in its score lines: panels, flaps and glue tab. This is where the dieline we agreed with you becomes board you can hold.",
    anchor: "lead",
  },
  {
    leg: "erect",
    kicker: "Sheet to box",
    heading: "Flat sheet. Then a box.",
    body: "Lift the panels along the scores and the blank stands up as a shipper, mailer or carton, square and strong because the creases were cut for this board, not guessed.",
    spec: "RSC · mailers · telescopic · crates",
    anchor: "trail",
  },
  {
    leg: "fold",
    kicker: "Folding & gluing",
    heading: "Folded, glued, counted.",
    body: "Automatic folder-gluing for volume runs, hand finishing for rigid and luxury boxes. Every batch is counted and checked against the approved sample before it leaves the line.",
    anchor: "lead",
  },
  {
    leg: "store",
    kicker: "Flat storage & dispatch",
    heading: "Stored flat. Delivered across Hyderabad.",
    body: "Boxes ship flat-packed and pallet-strapped to save your warehouse space. Same-day inside Hyderabad, next-day across Secunderabad, Medchal and the ORR corridor.",
    spec: "Pan-India and export",
    anchor: "lead",
  },
];

export const FINALE = {
  kicker: "Talk to the floor",
  heading: "Send the dimensions. Get real numbers.",
  body: "No pricing on this site. Every quote comes from the people who will run your job, usually within one working day.",
};