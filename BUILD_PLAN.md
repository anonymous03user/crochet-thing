# Crochet Toolkit — Build Plan & Skeleton

A modular suite of crochet tools. Each module ships independently (so every one is a complete win), but the client-side apps can share a common stash data store so they talk to each other. The email deal-tracker is a separate agentic service.

**Build philosophy:** ship the smallest useful version of each module first, then layer. No untestable dead code — every feature should be reachable and demonstrable before moving on.

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────┐
│                   CROCHET TOOLKIT                         │
│                                                           │
│  CLIENT-SIDE (single-file HTML/JS, run locally or hosted) │
│  ┌───────────────┐ ┌──────────────┐ ┌─────────────────┐  │
│  │ Chart         │ │ Stash        │ │ Substitution +  │  │
│  │ Generator     │ │ Manager      │ │ Yardage Calc    │  │
│  └───────┬───────┘ └──────┬───────┘ └────────┬────────┘  │
│          │                │                  │           │
│          └────────────────┼──────────────────┘           │
│                           ▼                               │
│                  ┌──────────────────┐                     │
│                  │  Shared Stash    │  (IndexedDB/        │
│                  │  Data Store      │   localStorage)*    │
│                  └──────────────────┘                     │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Pattern Companion (AI-powered, Anthropic API)      │   │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  SERVICE-SIDE (Cowork / scheduled agent)                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Deal Tracker — reads a deals inbox, extracts,      │   │
│  │ ranks, and emits a weekly digest                   │   │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

\* Browser storage (localStorage/IndexedDB) works fine for self-hosted builds run via Claude Code. It does not work inside the Claude.ai artifact sandbox — keep state in memory there, or build/run these as standalone files.

## Shared data model — `StashItem`

The connective tissue. Define once, reuse across Stash Manager, Substitution Calc, and (optionally) Chart Generator yarn matching.

```js
StashItem = {
  id: string,            // uuid
  brand: string,         // "Lion Brand"
  line: string,          // "Wool-Ease"
  colorName: string,     // "Fisherman"
  colorHex: string,      // "#e8e2d0"  (for chart matching)
  dyeLot: string,        // important: lots vary
  weightCategory: number,// 0–7 (Craft Yarn Council standard weights)
  fiber: string,         // "80% acrylic / 20% wool"
  yardsPerSkein: number,
  gramsPerSkein: number,
  skeinsOnHand: number,
  gaugeStitches: number, // sts per 4 in
  gaugeRows: number,     // rows per 4 in
  hookSizeMm: number,
  photoDataUrl: string,  // optional
  assignedProjectId: string | null,
  notes: string
}
```

## Module 1 — Image-to-Chart Generator

The lead build. Best learning-to-payoff ratio.

**Rough idea:** Upload a photo → produce a griddable chart (graphgan / C2C / pixel chart) with a color key and per-color stitch counts. The meaty problem is reducing thousands of image colors down to N yarn colors well.

**What you'll learn**

* Canvas pixel manipulation
* Color spaces (RGB → CIELAB) and why LAB matters for perceptual distance
* k-means clustering to find the optimal palette for a given image
* Nearest-neighbor matching against a fixed real-world yarn palette

**Skeleton / phases**

1. MVP — file upload to `<canvas>`; let user set chart width in stitches; downscale to that grid; snap each cell to the nearest color in a small fixed palette; render grid + color key + counts.
2. Smarter colors — replace naive snapping with k-means in LAB space; user picks the number of colors (clusters).
3. Real yarn — match clusters to a hardcoded brand solids palette (start with ONE brand). Show estimated skeins per color using yardage math (borrow from Module 3).
4. Polish — PDF export of the chart; symbol overlay for B&W printing; row-by-row "follow mode" that highlights the current row.

**Key functions to stub**

```js
loadImageToCanvas(file) -> ImageData
downscaleToGrid(imageData, widthInStitches) -> Cell[][]
rgbToLab({r,g,b}) -> {L,a,b}
kMeansPalette(cells, k) -> Color[]            // Phase 2
nearestColor(cell, palette) -> Color          // LAB distance
matchToYarnPalette(palette, brandPalette) -> YarnColor[]  // Phase 3
renderChart(grid, palette) ; renderKey(palette, counts)
```

## Module 2 — Stash Manager

The everyday workhorse. Owns the shared `StashItem` store.

**Rough idea:** Track yarn on hand so you stop buying duplicate skeins or running out mid-project. Add / edit / delete items, photo per item, filter and search, assign to projects.

**What you'll learn**

* Designing a persistence layer (IndexedDB schema, migrations)
* Import/export (JSON + CSV) — also how the other modules read this data
* Search/filter/sort UX over a real dataset

**Skeleton / phases**

1. MVP — CRUD over `StashItem`; list + detail views; localStorage persistence.
2. Organize — filter by weight/fiber/brand; search; sort; "total yardage on hand."
3. Projects — a `Project` entity; assign stash to projects; "yarn reserved vs free."
4. Portability — JSON export/import; CSV export; optional photo storage in IndexedDB.

**Data**

```js
Project = {
  id, name, patternRef, status: "queued"|"wip"|"done",
  assignedStashIds: string[], notes, startedAt, finishedAt
}
```

## Module 3 — Substitution + Yardage Calculator

Where the Ravelry API earns its keep.

**Rough idea:** "The pattern calls for yarn X. I have Y / I want to use Z. Will it work, and how many skeins?" Compares weight category, gauge, and fiber, and computes skeins needed from total project yardage.

**What you'll learn**

* API auth (Ravelry read-only basic auth) and rate-limit handling
* Modeling substitution rules (gauge tolerance, weight adjacency)
* Unit math (yards/meters, grams/oz, gauge conversion)

**Ravelry API notes**

* Still live + free for read-only. Create a developer app at `https://www.ravelry.com/pro/developer` → get a read-only username/password (basic auth).
* Useful endpoints: yarn search, yarn details (weight, grams, yardage, gauge), pattern search/details (yardage, gauge, yarn suggestions).
* Never ship those credentials in client-side code. For a learning build, proxy calls through a tiny local server (or a Cowork/edge function) that holds the secret.

**Skeleton / phases**

1. MVP (offline) — manual entry of both yarns' weight + gauge; output a compatibility verdict + skeins-needed from total yardage.
2. Ravelry lookup — type a yarn name → autofill its stats from the API.
3. Stash-aware — "substitute from my stash": scan `StashItem`s for compatible matches.
4. Confidence — score matches (exact weight + gauge in tolerance = green; adjacent weight = yellow; mismatch = red) with a plain-language explanation of the tradeoff.

**Core math to stub**

```js
skeinsNeeded(totalYards, yardsPerSkein) -> ceil(...)
totalYardsFromPattern(patternYardage, sizeFactor) -> number
gaugeCompatible(a, b, tolerance=10%) -> boolean
weightAdjacency(catA, catB) -> "exact"|"adjacent"|"far"
substitutionScore(target, candidate) -> {tier, reasons[]}
```

## Module 4 — Pattern Companion (AI-powered)

Uses the Anthropic API for the genuinely useful AI bits.

**Rough idea:** Paste a written pattern → get a row/stitch counter, an abbreviation glossary, a "where am I" tracker, and on-demand plain-language explanations of confusing instructions.

**What you'll learn**

* Structured output from an LLM (parse a freeform pattern into typed rounds/rows)
* Designing prompts that return strict JSON for UI hydration
* Stateful UI (counters, progress) layered over parsed data

**Skeleton / phases**

1. Counter — manual row + stitch counters with persistence. No AI yet.
2. Parse — send pattern text to the API; ask for JSON: `rounds[]` with stitch counts, abbreviations used, materials. Hydrate the counter from it.
3. Explain — "what does this row mean?" → API explanation in plain language.
4. Track — persist current position per project; resume where you left off.

**Prompt contract** (return JSON only, no prose/markdown)

```json
{
  "abbreviations": [{"abbr": "sc", "meaning": "single crochet"}],
  "materials": {"yarnWeight": 4, "hookMm": 5.0, "estYards": 350},
  "rounds": [{"index": 1, "instruction": "...", "stitchCount": 6}]
}
```

Parse defensively: strip code fences, try/catch the `JSON.parse`, validate shape before hydrating UI.

## Module 5 — Deal Tracker (Cowork / agentic service)

Your original instinct — built the durable way.

**Rough idea:** Instead of scraping retail sites (fragile, often against ToS, trips bot detection), sign up for retailer newsletters with a dedicated deals inbox. An agent reads that inbox on a schedule, extracts structured offers, dedupes/ranks them, and emits a weekly digest.

**Why this approach**

* Parsing emails you opted into is durable and ToS-friendly.
* The hard/interesting part is structured extraction from messy marketing HTML — a real, transferable skill (same muscle as invoice/receipt parsing).

**What you'll learn**

* Agentic + scheduled workflows in Cowork
* Structured extraction from noisy input
* Dedup/ranking heuristics; idempotent digest generation

**Skeleton / phases**

1. Collect — set up a dedicated Gmail label/inbox; subscribe to target retailers (Michaels, Hobby Lobby, Lion Brand/Yarnspirations, WeCrochet, LoveCrafts, etc.).
2. Extract — agent reads unprocessed emails; per email, extract a list of `Deal`s.
3. Rank + dedupe — collapse duplicates; rank by % off / fiber / weight you care about.
4. Emit — weekly digest as markdown (or push to a Notion DB / send yourself an email).

**Extracted shape**

```js
Deal = {
  retailer: string,
  product: string,
  brand: string | null,
  originalPrice: number | null,
  salePrice: number | null,
  percentOff: number | null,
  url: string,
  expiresAt: string | null,   // ISO if stated
  capturedFrom: string,       // email message id (for idempotency)
  capturedAt: string
}
```

**Extraction prompt contract** (JSON only)

```json
{ "deals": [ { "retailer": "...", "product": "...", "salePrice": 0,
               "percentOff": 0, "url": "...", "expiresAt": null } ] }
```

## Suggested build order

1. **Stash Manager (Module 2)** first — it defines the shared data model everything else leans on, and it's immediately useful.
2. **Chart Generator (Module 1)** — the most fun + the richest learning; mostly standalone.
3. **Substitution Calc (Module 3)** — reuses stash data; adds the Ravelry API skill.
4. **Pattern Companion (Module 4)** — adds the LLM-structured-output skill.
5. **Deal Tracker (Module 5)** — different muscle (agentic/scheduled); do it when you want a break from front-end work.

## Cross-cutting conventions

* Keep each client module a single self-contained file where practical.
* One source of truth for `StashItem`; other modules import/read it.
* Secrets (Ravelry creds, API keys) never live in client code — proxy them.
* Every feature must be reachable and demoable before you move on. No dead code.
* Defensive JSON parsing on every LLM/API response.
