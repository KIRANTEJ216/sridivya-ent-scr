# BRIEF — Sri Divya Enterprises: "The Line"

Site: corrugated and paper packaging manufacturer, Hyderabad, Telangana.
Established 2007. B2B lead generation plus a working 3D box configurator.

---

## 1. What this is, and who it is for

A corrugated packaging manufacturer's marketing and lead-generation site for
procurement heads at e-commerce, FMCG, pharma, electronics, apparel, furniture,
automotive, luxury and export businesses, with a bias toward Hyderabad and
Telangana accounts.

## 2. What the visitor must believe by the end

> This factory can spec my box correctly, print it properly, and get it to me.

Not "we make boxes". The visitor is buying risk reduction: will the box fit,
will it print, will it arrive intact, and will this vendor answer the phone.

## 3. The one action

**Request a quote.** Label used identically everywhere: `Request a quote`.

## 4. Vibe

Industrial, documentary, precise. Unhurried. The confidence of a floor that has
been running since 2007, not the enthusiasm of a startup.

Reference register: corrugated board macro photography, TSIIC industrial-estate
photography, technical dieline drawings.

## 5. The scroll journey, in the client's words

1. **Recognition** — "this is a real factory"
2. **Material** — "the board they start with"
3. **The turn** — "flat sheet becomes a box" (the peak)
4. **Substance** — "they print it properly"
5. **Precision** — "they cut it accurately"
6. **Care** — "they finish it well"
7. **Release** — "it arrives at my dock"

## 6. Energy curve

Calm and deliberate at the bench. Rising through board stock. The peak is a
held, quiet, enormous moment rather than a loud one. Precise and quick through
print and die-cut. Warm and settled at dispatch.

## 7. Feeling curve (written before the acts existed)

| Leg | Emotion | What on screen causes it |
|---|---|---|
| 1 Dieline bench | Focus | A drawing being authored. Nobody is selling yet |
| 2 Board stock | Anticipation | Raw reels. Nothing made. The eye waits |
| 3 Corrugation | **Awe (PEAK)** | Flat sheet becoming a three-dimensional box |
| 4 Print | Confidence | Colour landing accurately on board |
| 5 Die-cut | Precision | A knife finding the score line exactly |
| 6 Finish | Care | Foil catching the light |
| 7 Dispatch | Release | Stacked cartons, tailgate, Hyderabad traffic |

**The peak:** *"the sheet of paper folded itself into a box."* It lives in leg 3.

## 8. One unbroken world or distinct scenes

**One continuous world.** The manufacturing process has real physical stages and
"where you are" on the line is meaningful information. This is the whole reason
for choosing `worldflight` over act mode.

## 9. Structural fork, and why the other seven lost

| Grammar | Why not |
|---|---|
| Filmic one-shot | The default drift. Bans multi-route chrome, which a B2B site with a configurator and five indexable routes cannot afford |
| Chaptered editorial | Forbids the full-bleed hero. This page's hero IS the factory |
| Live surface | Too narrow. The local-SEO and lead-capture content needs a normal document surface |
| Typographic poster | Forbids photography. Corrugated board and a press are the subject |
| Gallery / catalog | Already what `/boxes` is. Would repeat the existing design |
| Split stage | No genuine two-sided argument. The two sides would be decorative |
| Rhythmic cutlist | Bans pinning. This is a considered B2B purchase, not a launch |

## 10. Assets

None supplied by the client. Fully generated. One shared style preamble, seven
legs chained start-frame-to-start-frame.

**Centre-safe framing constraint.** `object-fit: cover` crops a 16:9 frame to
roughly the centre 26% on a 390x844 phone. Subject inside the centre 35% of frame
width; depth stacked vertically, never spread horizontally.

## 11. The completed tell-someone sentence

**It's the site where you scroll through the factory and watch flat board become
a box.**

---

## Authored silence

Leg 2 (board stock) is deliberately quiet: low camera energy, long take, almost
no copy. It exists so the peak in leg 3 lands. This is authored, not dead
scroll, and the verification pass must be able to tell the difference.

## Score

| Beat | Leg | Device | Weight | Clip | Why this one |
|---|---|---|---|---|---|
| Recognition | 1 Dieline bench | `worldflight` leg | 0.86vh | 4s | Establishes inside the world, no separate title stage |
| Material | 2 Board stock | `worldflight` leg | 1.075vh | 5s | The authored silence before the peak |
| Turn | 3 Corrugation | `worldflight` leg | **1.935vh** | **9s** | Longest clip, therefore largest span. The peak |
| Substance | 4 Print | `worldflight` leg | 1.075vh | 5s | |
| Precision | 5 Die-cut | `worldflight` leg | 1.075vh | 5s | |
| Care | 6 Finish | `worldflight` leg | 1.075vh | 5s | |
| Release | 7 Dispatch | `worldflight` leg | 1.29vh | 6s | Arrival at a place, with the CTA object in it |

`rate = weight / clip_seconds = 0.215` on every leg, by construction.

## Signature move

**The dieline draws itself.** A fixed-chrome SVG RSC dieline whose
`stroke-dashoffset` is driven from `--sc-segp`. During the corrugation leg the
blank scores, cuts, folds and erects; dimension lines and callouts arrive once
it settles. Coded in page JS reading the engine's own progress variable. The
engine is never edited.

## Signature-adjacent, but required by the grammar

The nav is a **map**: a horizontal line schematic (reel, corrugator, press,
die-cutter, finisher, truck) with a live position marker driven by the
`sc:waypoint` event, clickable to seek. The engine renders no rail; it publishes
only `--sc-seg` / `--sc-segp`, so this must be built in the page.

## Fingerprint gate

Registry was empty at build time. This is the first build; nothing to clear.
Row appended to `scrollcraft/FINGERPRINTS.md` after shipping.