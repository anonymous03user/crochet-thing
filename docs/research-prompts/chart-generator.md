# Research prompt — Chart Generator crochet facts

The Chart Generator ships with a few **flagged, editable assumptions** the builder (a non-crocheter)
could not verify. Run the prompt below in **Perplexity Deep Research** (or hand it to a crocheter)
and paste the answers back so the defaults can be corrected. Until then, every one of these is shown
in the app as an editable, "please double-check" value, and the yarn-amount estimate also shows total
yards (never a fabricated skein count) when yards-per-skein is unknown.

Where each value lives in the code (`chart/index.html`):
- `YDS_PER_STITCH` table (by Craft Yarn Council weight 0–7) and the per-color `estimateForColor()` math
- `stitchAspect` (the "stitches wider than tall ×1.3" toggle)
- waste default (15%) in the estimate options
- boustrophedon reading + "row 1 at bottom" in `renderChart()` / `renderFollowBar()`
- C2C diagonal rules in the C2C mode help + follow logic
- the deltaE match thresholds (`matchQuality()`: ≤5 "great", ≤12 "close")
- the built-in `FALLBACK_PALETTE` (generic named solids)

---

## Prompt (scope tight; per-item structured answers; allow "UNKNOWN"; cite sources)

> I'm building a tool that turns a photo into a crochet colorwork chart and estimates yarn amounts.
> Answer each numbered item separately. For every number, give: the value (or a range), a confidence
> label (high / medium / low), the gauge/tension caveat, and a source. Say "UNKNOWN" rather than
> guessing. Prefer crochet-specific sources; don't pass knitting numbers off as crochet.
>
> 1. **Yards of yarn consumed by ONE single-crochet stitch**, for each Craft Yarn Council yarn
>    weight 0–7 (lace, super-fine/fingering, fine/sport, light/DK, medium/worsted, bulky,
>    super-bulky, jumbo), at the standard recommended hook for each weight. Also give the same for
>    one **double-crochet** stitch and one **C2C tile**, if known.
> 2. **Stitch aspect ratio** for single-crochet tapestry/graphgan work — how much wider than tall a
>    single crochet stitch is (stitches-per-inch vs rows-per-inch). What "height per stitch"
>    multiplier keeps a charted photo from looking vertically squashed? (The app currently offers a
>    ×1.3 toggle.)
> 3. A reasonable **yarn waste / overage percentage** to add for weaving in ends, color joins, and a
>    gauge swatch. (App default: 15%.)
> 4. **Tapestry / graphgan reading conventions**: is row 1 at the bottom, worked bottom-to-top? Do
>    odd rows read right→left and even rows left→right for a right-handed crocheter (turning at each
>    end)? How does left-handedness flip this?
> 5. **C2C (corner-to-corner) conventions**: that each diagonal line on the grid = one C2C "row" of
>    tiles; the increase-until-the-widest-diagonal-then-decrease rule; which bottom corner to start
>    from; and how a square graph maps onto C2C tiles. (This mode is currently labeled "beta.")
> 6. What a **beginner most needs printed** on a colorwork chart to follow it (row numbers on one or
>    both sides? bold gridlines every 10? color names vs. letter symbols vs. both?).
> 7. Are a **CIE76 deltaE of ~5 and ~12** sensible thresholds for "this yarn is the same color" vs
>    "close enough" when matching a chart color to real yarn under normal light?
> 8. (Optional) One common worsted-weight brand's **solid-color line** — color names, hex codes, and
>    yards per skein — to replace the app's generic fallback palette with real, buyable colors.
