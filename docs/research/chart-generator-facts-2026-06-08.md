# Chart Generator — crochet-fact research results (2026-06-08)

Answers to the 8-item research prompt in `docs/research-prompts/chart-generator.md`, run as a
multi-source, cross-checked web search. Every flagged "please double-check" default in
`chart/index.html` is addressed below with: **value · confidence · caveat · source**, plus the
exact code location and a plain-English **verdict** (keep / change to X).

**Universal caveat for the whole yarn-amount side (items 1–3):** real crochet yarn-per-stitch
data is *sparse* and everything scales with **gauge, hook size, and personal tension**. The only
honest "exact" number is a swatch the crocheter measures themselves. So the table values below are
*better defaults*, not facts — keep showing them as editable "double-check" values, and keep
showing **total yards** (never a fabricated skein count) when yards-per-skein is unknown. That
design choice is correct and well-supported.

---

## TL;DR — what to change

| # | Default (where) | Current | Verdict | Recommended |
|---|---|---|---|---|
| 1 | `YDS_PER_STITCH` (line 451) | worsted `4:0.13` | **Too high ~2.5× for single crochet** — current values match *double* crochet | Re-anchor on measured **worsted sc = 0.05 yd**; see corrected table. Ideally make it depend on stitch/mode (sc tapestry vs C2C/dc) |
| 2 | `stitchAspect` ×1.3 (lines 174, 550) | 1.3 | **Acceptable, slightly high** | Keep 1.3, or nudge to **1.25** (best-supported); ideal = compute from a user swatch |
| 3 | waste % (lines 191, 471) | 15% | **Reasonable, low-middle** | Keep 15% as floor; **bump to ~20%** for colorwork (many ends) — consider that the default since this app *is* colorwork |
| 4 | reading rule (line 225, render fns) | row 1 bottom; odd R→L / even L→R | **Correct (high confidence)** | Keep. Add a **left-handed** mirror note and an **in-the-round** note |
| 5 | C2C beta (line 225, follow logic) | diagonal reading | **All conventions confirmed correct** | Keep logic; "beta" can become "confirmed" for the standard rules; add start-corner + mini-C2C caveats |
| 6 | chart legibility | — | research-backed best practices | Row numbers **both sides** (odd right / even left), **bold line every 10**, **color + symbol**, legend, start-corner marker |
| 7 | deltaE `≤5` / `≤12` (line 446) | 5 / 12 | **Both sensible, well-chosen** | Keep. Known soft spot: CIE76 over-weights blues, under-resolves greys — switch to CIEDE2000 later if blue/grey matching feels off |
| 8 | `FALLBACK_PALETTE` (line 411) | 23 generic solids | Real hex **not published as text** for budget acrylics | Verified names + **yards/skein** in hand (Super Saver 364 yd). Real hex only lives in tools (Stitch Fiddle / temperature-blanket CC BY 4.0). I can extract a real palette via browser on request |

---

## 1. Yards of yarn per stitch (by CYC weight 0–7) — `YDS_PER_STITCH`, line 451

**Headline:** your current table is roughly **2.5× too high if the chart is worked in single
crochet** (the usual graphgan/tapestry/pixel stitch). The values you have are actually in line with
**double crochet**.

**The only two genuinely *measured* numbers in the wild** (FreshStitches / Shiny Happy World, one
educator's measured tension, published with hook + method):

- **Worsted (CYC 4) single crochet = 1.8 in/stitch = 0.050 yd** — hook H/5.0 mm. **Confidence: medium-high.**
- **Bulky (CYC 5) single crochet ≈ 2.75 in/stitch = 0.076 yd** — hook K/6.5 mm. **Confidence: medium.**

Cross-check (independent): worsted sc gauge is ~2.75–3.5 sts/in → a stitch is ~0.29–0.36 in wide,
so 1.8 in of yarn ≈ 5–7× the stitch width, matching the crocheters' "~6× the gap" rule of thumb.
No source produced a *different* per-stitch number, so 1.8 in stands as the best anchor.

**Your current values vs. measured (single crochet):**

| CYC | Weight | Current (yd) | = inches | Measured/expected sc (yd) | Ratio current ÷ expected |
|---|---|---|---|---|---|
| 0 | lace | 0.05 | 1.8″ | ~0.020 | ~2.5× |
| 4 | worsted | **0.13** | **4.7″** | **0.050 (measured)** | **~2.6×** |
| 5 | bulky | 0.18 | 6.5″ | 0.076 (measured) | ~2.4× |

Notice your **lace** value (0.05) is exactly the **measured worsted** value — the whole table reads
as if shifted up. The reason it's ~2.5× high is that **0.13 yd/worsted ≈ a double-crochet stitch**
(a dc uses ~2–2.5× an sc per stitch → ~0.10–0.125 yd worsted). So the table isn't random — it's a
*dc* table sitting in an app that (for tapestry) charts *sc*.

**Recommended corrected single-crochet table** (anchored on the two measured points; the rest scaled
by CYC recommended-hook diameter — a proxy for stitch size):

```js
// single crochet, yards per stitch — anchored on measured worsted(1.8")/bulky(2.75")
var YDS_PER_STITCH={0:0.02,1:0.025,2:0.033,3:0.042,4:0.05,5:0.076,6:0.11,7:0.16};
//  inches:        0.7   0.9    1.2    1.5   1.8*  2.75*  4.0   5.8     (*=measured)
```

- **Confidence:** worsted & bulky **medium-high/medium** (measured); weights 0,1,2,3,6,7 are
  **low** (extrapolated — flag them, don't present as fact). Jumbo (7) is essentially a guess.
- **Caveat:** scales with tension/hook/gauge; a swatch is the only exact answer.

**Better fix (matches project "rule 9" — isolate the assumption):** the app has *both* an sc
tapestry mode and a C2C mode. Per-stitch yarn genuinely differs by stitch, so a single table can't
be right for both. Options:
- keep the corrected **sc** table above for tapestry, and
- for **C2C**, use a per-**tile** figure, not per-stitch. A C2C tile (ch-3 + 3 dc) has **no
  published constant** — every authoritative C2C source says *swatch it*. Reported spread:
  **~0.35 yd/tile** (one crafter, ~13″) to **~1.5 yd/tile** worsted. **⚠ Check how C2C feeds the
  estimator:** if it multiplies tile-count × 0.13, C2C is *under*-counted ~3–5×; if it counts the 3
  underlying dc per tile, ~0.39 yd/tile, which is at least in range.

**Double crochet, for reference:** no clean per-weight published numbers. Rule of thumb (well
replicated): **dc uses ~25% less yarn than sc for the same *area*** (it covers more area), but
**more yarn per *stitch*** (~2–2.5× sc). Worsted dc ≈ 0.10–0.125 yd/stitch (**low confidence**).

*Sources:* Shiny Happy World [single vs double](https://www.shinyhappyworld.com/2017/05/how-much-yarn-does-crochet-use-single-vs-double-crochet.html) ·
[exact-yardage method (1.8″ worked example)](https://www.shinyhappyworld.com/2016/04/how-to-knit-or-crochet-using-an-exact-amount-of-yardage.html) ·
[how-much-yarn chart (bulky 2.75″)](https://www.shinyhappyworld.com/2014/03/how-much-yarn-do-i-need.html) ·
CYC hooks/gauge [Standard Yarn Weight System](https://www.craftyarncouncil.com/standards/yarn-weight-system) ·
C2C per-tile [Stardust Gold yardage](https://stardustgoldcrochet.com/c2c-yardage-calculator-how-much-yarn-do-i-need-for-my-c2c-blanket/) ·
dc-25%-less [Crochet Yarn Calculator](https://www.crochetyarncalculator.com/), [Easy Crochet](https://easycrochet.com/yarn-for-crochet-project/).

---

## 2. Single-crochet stitch aspect ratio — `stitchAspect` ×1.3 (lines 174, 550)

**Value: ~1.25 central, sane range 1.2–1.3.** This is the **gauge ratio** (rows-per-inch ÷
stitches-per-inch) — the right quantity for a 1-cell-per-stitch grid, because rows pack tighter than
stitches in sc, so a photo charted square comes out vertically squashed unless you stretch height.

Real published worsted sc gauges and their ratios: 16 sc × 20 rows → **1.25** (the most-cited
"textbook" worsted gauge); Vanna's Choice 12 × 15 → 1.25; Pound of Love 14 × 18 → 1.29; a 14 × 17
example → 1.21; a 13 × 14 outlier → 1.08. Cluster ≈ **1.25**, spread **1.1–1.3**.

- **Verdict on ×1.3:** **acceptable, sits at the top of the supported range.** It will never make an
  image look *squashed* (good); at worst slightly *stretched tall* if the user's real gauge is
  squarer. **1.25** is the single most defensible default. Don't go above ~1.3.
- **Watch out:** the "a single crochet is ~10% wider than tall" (≈1.1) figure floating around is the
  *bare-stitch shape*, **not** the gauge ratio — wrong number for charting. Stitches nest vertically,
  so effective row pitch is shorter and the ratio is higher (~1.25).
- **Confidence:** gauge data & ~1.25 central value **high**; the exact best constant **medium** (it's
  genuinely yarn/hook/tension dependent — tapestry's recommended tighter tension pushes it toward 1.3).
- **Ideal:** if the app ever takes a user swatch (sts/in and rows/in), compute the ratio directly and
  let the fixed multiplier be only a fallback. dc/hdc are *more* stretched than sc, not less — sc is
  the squarest, which is why sc is the right charting stitch.

*Sources:* [Mama In A Stitch gauge](https://www.mamainastitch.com/guide-to-crochet-knitting-gauge/) ·
[Craftematics 16×20](https://www.craftematics.com/post/gauge) ·
[Lion Brand Vanna's Choice 12×15](https://www.lionbrand.com/products/vannas-choice-yarn) ·
[Willow Crochet — sc preferred, swapping squashes/stretches](https://www.willowcrochet.com/which-stitch-is-best-for-graphgans-single-crochet-vs-half-double-crochet/) ·
[Sarah Maker tapestry](https://sarahmaker.com/tapestry-crochet/) ·
[Stardust Gold size calculator (separate sts/rows inputs)](https://stardustgoldcrochet.com/row-by-row-blanket-size-calculator-this-is-how-big-you-graphgan-blanket-will-be/).

---

## 3. Waste / overage % — default 15% (lines 191, 471)

**Value: 10–15% standard; ~20% for blankets / heavy texture / colorwork.** Consistent across
multiple independent crochet sources. Drivers: weaving in ends (the big one — every color join =
two tails), color changes, gauge swatch, frogging/fixes, plus the practical "buy one extra skein to
match the dye lot."

- **Verdict:** **15% is reasonable** and sits squarely in the recommended band. But this app is
  *specifically colorwork* (many color changes → many ends), which is exactly the case the sources
  push to the **high end (15–20%+)**. Consider defaulting to **18–20%**, or keep 15% and surface a
  hint like "use 20% for many-color charts." Plain single-color simple work can sit at ~10%.
- **Confidence:** **high** for the 10–15% baseline; **medium-high** for the 20% colorwork bump.

*Sources:* [Crochet Yarn Calculator (10–15% buffer)](https://www.crochetyarncalculator.com/) ·
[Crochify (more for textured/blankets)](https://www.crochify-patterns.com/pages/crochet-yarn-calculator) ·
[Complete Calculators (20% blankets)](https://completecalculators.com/calculators/crochet/yarn-yardage-calculator) ·
[The Crochet Project (buy extra / dye lot)](https://thecrochetproject.com/blogs/blog-the-crochet-project/how-to-calculate-the-amount-of-yarn-you-need).

---

## 4. Tapestry/graphgan reading conventions — line 225 + `renderChart()`/`renderFollowBar()`

**Your rule is correct.** For a **right-handed** crocheter working **flat and turning each row**:

- **Row 1 is at the bottom, worked bottom-to-top.** ✅ **Confirmed, high confidence.**
- **Odd rows (1,3,5…) read right→left; even rows (2,4,6…) read left→right** — the boustrophedon
  zig-zag, exactly because you turn at each row end and the back now faces you. ✅ **Confirmed, high.**
  (Odd rows = Right Side; even = Wrong Side.)

Two additions worth surfacing in the UI:

- **Left-handed = full mirror:** start **bottom-left**, odd rows **left→right**, even rows
  **right→left**. For *asymmetric* images (letters, logos), a left-hander working a right-handed
  chart will flip the picture horizontally — they should mirror the chart first. **High confidence.**
- **Worked in the round (no turning): every round reads the *same* direction** (right→left for a
  right-hander). The alternating rule is **flat-work only**. **High confidence.** (Minor: line 225
  says "read top-to-bottom with row 1 at the bottom" — slightly contradictory wording; the *work*
  direction is bottom-to-top. Consider rewording to "row 1 at the bottom, worked upward.")

*Sources:* [Pattern Paradise — read a graph](https://pattern-paradise.com/2016/10/03/tutorial-read-graph/) ·
[HappyHooker — left-handed tapestry](https://happyhooker.wordpress.com/2013/01/24/how-to-follow-a-chart-for-tapestry-crochet/) ·
[Willow Crochet — beginner graphgan tips](https://www.willowcrochet.com/5-beginner-tips-for-crocheters-tackling-their-first-graphgan-blanket/).

---

## 5. C2C (corner-to-corner) conventions — "beta", line 225 + follow logic

**Every C2C rule you encoded is confirmed correct** (high confidence, many concordant sources):

- **Each diagonal across the grid = one C2C "row" of tiles** (you build on the bias, not in
  horizontal rows). ✅
- **Increase one tile per row to the widest diagonal, then decrease one tile per row** to the
  opposite corner; decreases are worked as slip stitches. ✅
- **Start bottom-right → top-left** is the **published standard** (and the **same for left-handers**
  when working from a graph — the chart isn't mirrored). ✅ *Caveat:* from a graph the start corner
  isn't strictly mandatory (symmetry), and a minority of tutorials start bottom-left — so "standard,"
  not "only." Confidence high (standard) / medium (universality).
- **N×N square → 1 tile per grid square (ch-3 + 3 dc) → 2N−1 diagonal rows** = (N−1 increases) + (1
  widest row of N tiles) + (N−1 decreases). ✅ Structure confirmed; sources show it by worked
  example rather than stating the literal "2N−1" formula (but the formula is correct).
- **Reading:** follow the diagonal in a zig-zag, odd rows ↙ (bottom-right→top-left), even ↗
  (bottom-left→top-right), with RS/WS alternating — distinct from straight row-by-row tapestry. ✅
- **Rectangles:** increase both ends to the shorter side → "straight" phase (increase one end /
  decrease the other) → decrease both ends. ✅

**One naming caveat to flag:** "mini C2C" in the wild usually means **half-double-crochet** tiles,
not single crochet; pure-sc mini-C2C exists but is uncommon. And a "single crochet graph" usually
means the **tapestry** (horizontal) method, where each grid square is often **2 sc × 2 rows**
(since one sc is only square-ish when doubled) — not a diagonal C2C. Worth keeping the modes clearly
separated in the UI. The C2C logic itself is sound enough to **graduate from "beta"** for standard
square/rectangle graphs.

*Sources:* [Sarah Maker C2C](https://sarahmaker.com/c2c-crochet/) ·
[Pixel Crochet — read C2C charts](https://pixelcrochet.com/how-to-read-c2c-charts-written-patterns/) ·
[Morine's Shop — read a C2C graph](https://www.morinesshop.com/how-to-read-a-c2c-crochet-graph/) ·
[Make & Do Crew — C2C for beginners](https://makeanddocrew.com/how-to-corner-to-corner-crochet-c2c-for-beginners/) ·
[ChristaCoDesign — C2C decrease](https://christacodesign.com/how-to-decrease-c2c-crochet-tutorial/).

---

## 6. What a beginner most needs printed on a colorwork chart

Research-backed best practices (mix of high and medium-high confidence):

- **Row numbers on *both* sides — odd numbers down the right edge, even down the left.** This isn't
  decoration: the *side* of the number encodes the reading direction (right = read right→left). It
  bakes the boustrophedon rule into the chart so the beginner doesn't have to remember it. **High.**
  (In-the-round charts can number one side only.)
- **Bold gridlines every 10 squares** (a 10×10 block grid) — standard counting aid; catches a
  miscount before it compounds. **Medium-high** (universal convention from cross-stitch/knitting).
- **Color blocks *plus* a letter/symbol in each square ("both").** Pure color is most intuitive, but
  a per-square symbol survives hard-to-distinguish shades, grayscale printing, and color-blindness.
  **A legend/key is mandatory.** Include **color names** (and brand/shade) in the legend. **High** for
  legend; **medium-high** for color+symbol redundancy.
- **Mark the starting corner** (bottom-right RH / bottom-left LH). **High.**
- **A current-row highlighter / row counter** and **counting stitches at the end of every row** are
  the most-repeated practical error-preventers. **High.**
- Offering a **written "crochet-by-numbers" row list** (e.g. "2A, 3B, 1A…") alongside the grid
  removes square-counting error entirely. **High.** Keep first designs simple (3–4 colors, ~20×20).

*Sources:* [AllFreeCrochet — read crochet charts](https://www.allfreecrochetafghanpatterns.com/Picture-Afghans/Crochet-Graphghan-Patterns-How-Read-Crochet-Charts) ·
[KnitPicks — row numbers both sides](https://www.knitpicks.com/learning-center/how-to-read-knitting-charts) ·
[Nimble Needles — why odd-right/even-left](https://nimble-needles.com/tutorials/read-knitting-charts-for-beginners/) ·
[Willow Crochet — highlighter/row counter](https://www.willowcrochet.com/5-beginner-tips-for-crocheters-tackling-their-first-graphgan-blanket/).

---

## 7. CIE76 deltaE thresholds `≤5` / `≤12` — `matchQuality()`, line 446

**Both are sensible — and well-chosen for *this* job (matching a chart color to a real skein).**

JND landmarks (CIE76 ΔE\*ab, normal observer, daylight): **<1** imperceptible · **1–2** perceptible
on close inspection (practical revised JND ≈ **2.3**) · **2–5** perceptible at a glance · **5–10**
clearly noticeable · **>10–12** distinct/different color family (Euclidean ΔE "works poorly above
~10 units").

- **`≤5` = "great match / same color":** **reasonable, mildly generous** — and generous is the right
  direction here, because real yarn varies by dye lot, isn't a flat patch, and published yarn hex
  values are themselves *approximations of fiber color*; lighting/screen variance alone eats several
  ΔE. ✅
- **`≤12` = "close":** **reasonable outer bound.** Two colors at ΔE 12 are clearly distinguishable
  side-by-side, so the label "close" (not "match") is exactly right. ✅
- **Confidence: high.**
- **Known soft spot (worth a code comment):** CIE76 is **not perceptually uniform** — it
  **over-weights blues** (two identical-looking navies can score ΔE 6–10 and get wrongly demoted from
  "great" to "close") and **under-resolves neutrals/greys** (slightly different greys may read as a
  "great match"). The fix, if blue/grey matching ever feels off, is to switch the distance function to
  **CIEDE2000** (same LAB inputs, drop-in) and then tighten thresholds (~3 / ~8, since ΔE2000 units
  are more honest). **Not urgent** — CIE76 at 5/12 is fine for a first pass. Your code comment at line
  262 ("squared CIE76 … good enough") is accurate.

*Sources:* [Wikipedia — Color difference (CIE76, JND≈2.3, >10 units, CIEDE2000 blue term)](https://en.wikipedia.org/wiki/Color_difference) ·
[Konica Minolta — what is Delta E](https://sensing.konicaminolta.eu/mi-en/colourblogtop/colour-blog/whatisdeltae) ·
[Delta-E formula guide (1–3 / 3–5 / >5)](https://skychemi.com/color-difference-formula-delta-e/) ·
[ViewSonic — Delta E & color accuracy](https://www.viewsonic.com/library/creative-work/what-is-delta-e-and-why-is-it-important-for-color-accuracy/).

---

## 8. Real worsted palette to replace `FALLBACK_PALETTE` (line 411) — *optional*

Goal: swap the 23 generic named solids (made-up hex) for a real, buyable line. **What's verified vs.
not:**

- **Verified — yards per skein (high confidence):** Red Heart Super Saver (CYC 4, 100% acrylic,
  7 oz) = **364 yd**; Caron Simply Soft (6 oz) = **315 yd**; Lion Brand Vanna's Choice (3.5 oz) =
  **170 yd**. Super Saver is the cleanest pick (biggest solid range, ~64 colors, longest skein).
- **Verified — color *names***: full Super Saver and Vanna's Choice solid name lists obtained (e.g.
  Super Saver 311 White, 319 Cherry Red, 387 Soft Navy, 368 Paddy Green, 528 Medium Purple…).
- **NOT obtainable as text — hex codes.** No brand or major retailer publishes hex for these budget
  acrylics; every official source shows photographed swatch JPGs only. **No hex was fabricated.** The
  hex *does* exist inside two tools, both of which render client-side (so a plain page fetch returns
  nothing usable):
  - **temperature-blanket.com "Yarn Colorways"** — CC BY 4.0 licensed, schema = name+hex+brand+href,
    explicitly notes "hex are approximations of fiber colors" (gated behind a free RapidAPI key).
  - **Stitch Fiddle** built-in palettes — Red Heart Super Saver (64 colors) selectable when charting.

**Recommendation:** keep the current generic palette as the safe default for now. If you want a real
Super Saver palette (name + approximate hex + 364 yd/skein) wired into `FALLBACK_PALETTE`, I can
extract one via the in-browser tools and hand back a ready-to-paste JS array — just say the word.
Flag the hex as "approximate (fiber color)" in a `_hex_note`, consistent with rule 9.

*Sources:* [Red Heart Super Saver — Yarnspirations (364 yd)](https://www.yarnspirations.com/products/red-heart-super-saver-yarn) ·
[Super Saver color names chart](https://undertherainbow.us/online-craft-mall/colorcharts/redheartsupersaveryarn.htm) ·
[Vanna's Choice official (names, 170 yd)](https://www.lionbrand.com/products/vannas-choice-yarn) ·
[Caron Simply Soft — Ravelry (315 yd)](https://www.ravelry.com/yarns/library/caron-simply-soft) ·
[temperature-blanket Yarn Palette Creator (CC BY 4.0 hex source)](https://temperature-blanket.com/yarn?f=red_heart-super_saver_solids) ·
[Stitch Fiddle crochet colors](https://www.stitchfiddle.com/en/chart/create/crochet/colors).

---

## Confidence summary (what to trust)

- **Solid / high confidence:** reading conventions (item 4), C2C conventions (item 5), chart-legibility
  best practices (item 6), deltaE 5/12 being sensible + the CIE76 blue weakness (item 7), yards-per-skein
  (item 8).
- **Good but tension-dependent:** aspect ratio ~1.25 (item 2), waste 15–20% (item 3).
- **Sparse / partly extrapolated — keep flagged as "double-check":** per-stitch yardage for everything
  but worsted & bulky sc (item 1), any fixed C2C-per-tile constant (item 1), yarn hex codes (item 8).

*Method: 5 parallel web-search passes (one per topic cluster) + targeted verification on the two
load-bearing points (the 1.8″ worsted anchor and whether real hex exists). No citation was used that
wasn't actually retrieved; no number or hex was invented.*
