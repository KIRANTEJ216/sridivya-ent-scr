# DESIGN.md — Kraft Sheet Metal (user-pinned direction)

THESIS: the site is a walk-through packaging expo where a CSS-3D corrugated box is the hero object; it refuses the category default (catalog grid + stock factory photos).

OWN-WORLD: dark ink factory shell (steel/chrome nav + panels) with warm kraft boxes as lit exhibits. Palette roles — shell: ink/steel; exhibits: kraft/tan/recycled; signals: packaging-orange (primary accent), print-cyan (secondary, print/machine contexts). Utilities: chrome-panel, metal-panel, flute, corrugated-texture, emboss, deboss, foil-stamp, shadow-depth, industrial-grid. Type: Space Grotesk display / Inter body / IBM Plex Mono for real machine data (dims, flute codes).

STORY: visitor lands inside the expo — boxes stream past, opening and rotating on scroll; interstitial walls carry the 18-year story, industries, sustainability; they customise a box live, then send an RFQ.

FIRST VIEWPORT: full-bleed dark factory floor, industrial-grid horizon, headline lower-left, box stream flowing vertically through center, "Explore the line" scroll cue. Primary action: "Get a Quote" (header) + "Customise a Box" (hero card).

FORM: Experience mode. Infinite run-ladder stream on `/` and `/boxes`. Motion: scroll-driven box opening (IO + rAF → CSS vars, zero re-renders), drag-to-spin, floating kraft-fleck particles (canvas, DPR-capped, paused offscreen, reduced-motion safe). No gradient text, no glass decoration, no icon-card grids. Depth via layer shadow + translateZ. Focus states: orange 2px ring. Radius: 12–16px panels, pills for small controls only.
