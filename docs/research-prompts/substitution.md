# Research prompt — Substitution Calculator crochet facts

Module 3 ships with **flagged, editable** crochet assumptions the builder (a non-crocheter) could
not verify. Run the prompt below in **Perplexity Deep Research** (or hand it to a crocheter) and
paste the answers back so the defaults can be corrected. Until then, every threshold is editable in
the app's **Settings → "Assumptions you can edit"** and the verdict stays deliberately conservative
(gauge must be known on both sides to ever say "good"; missing data caps at "maybe / swatch it").

Where each value lives in `substitute/index.html` (the CALC module's CONSTANTS):
- `GAUGE_BANDS = { tight:5, workable:10, risky:15 }` — % difference in stitches-per-4in
- `weightAdjacency()` + `ADJACENT_WORKABLE` — how a one/two-category weight gap is treated
- `FIBER_NOTES` — the plain-language fiber tradeoff strings
- `RAVELRY_WEIGHT_MAP` — Ravelry `yarn_weight.name` → CYC 0–7
- size-factor guidance (the "Different size" note) and the optional waste %
- the "+1 skein for dye-lot" suggestion

---

## Prompt (scope to CROCHET; per-item structured answers; allow "UNKNOWN"; cite sources)

> I'm building a yarn-substitution calculator for crochet. Answer each numbered item separately.
> For every value give: the value (or range), a confidence label (high / medium / low), the
> gauge/tension caveat, and a source. Prefer crochet-specific sources; don't pass knitting numbers
> off as crochet. Say "UNKNOWN" rather than guessing.
>
> 1. **Gauge tolerance for "will this substitute work?"** Comparing stitches-per-4-inches: is ~5%
>    difference effectively "the same gauge"? Is ~10% the outer edge of "just change hook size"? Is
>    ~15% the line beyond which the finished size is clearly wrong? What % stitch-gauge error
>    produces roughly one garment size of difference?
> 2. **Weight-category adjacency.** Is a one-category jump on the Craft Yarn Council 0–7 scale (e.g.
>    DK↔Worsted) routinely workable with a hook change + swatch? For which project types does that
>    break (drapey garments vs structured bags/amigurumi)? Is a 2+ category jump always a poor swap?
> 3. **Fiber tradeoffs**, as one-line plain-language rules a beginner can act on: acrylic vs wool
>    (warmth, blocking, felting, washability, pilling); cotton (no stretch/memory, drape, sagging);
>    bamboo/rayon/silk (drape, slipperiness); superwash wool (grows/relaxes when wet-blocked).
> 4. **Hierarchy.** Should fiber only ever *demote* a substitution by one step and never override a
>    good gauge match (i.e., gauge = "will it work," fiber = "how it feels/cares")? Or are there
>    cases where fiber should hard-fail a swap (e.g., cotton for a stretchy ribbed garment)?
> 5. **Row gauge.** For crochet, can the *pass/fail* verdict rely on stitch gauge alone (rows being
>    hook/tension-dominated), or does row gauge need to be checked too?
> 6. **Ravelry weight names → CYC 0–7.** Confirm the mapping, especially: Aran (4 vs 5?),
>    Sport/DK and Light/DK boundaries, UK ply names (4-ply→1, 8-ply→3, 10/12-ply→4?), and that
>    category-0 lace gauge is often quoted in *double* crochet rather than single.
> 7. **Size factor.** For making a different size than the pattern lists, is ~1.15–1.4× yarn per
>    size up a sensible ballpark (yarn scales with area, not length)? What caveat should be shown?
> 8. **Overage.** Is a default safety/waste margin of 0% reasonable for substitution (assuming the
>    pattern's stated yardage already includes overage), with an optional 10–15% toggle? And is
>    "buy one extra skein for dye-lot safety" the right standard advice?
