# HANDOFF — Cricket's Crochet Toolkit

> Read this first in a new session. It is the single catch-up doc for the whole project.
> Last updated after **Module 4 (Pattern Companion)** shipped — all four planned client tools are
> live. Repo: `github.com/anonymous03user/crochet-thing` · local clone:
> `/Users/felix_diez/crochet-thing` (this is a SEPARATE repo from the `sts2-assistant` cwd the
> session may open in — always work in `/Users/felix_diez/crochet-thing`).

---

## 1. What this is, in one paragraph

A small suite of **crochet helper web apps**, built by a **non-coder owner** (you, via Claude Code)
**for a friend named "Cricket"** who crochets. Neither the owner nor Cricket can easily test, so
**everything is built to be self-verifiable** (browser-driven checks + a built-in self-test and demo
data in each tool) and every crochet-domain assumption the builder can't verify is **flagged and
editable in-app** (the project's "rule 9"). It is one installed app on Cricket's iPhone (an older
**iPhone 11 Pro Max**, low free storage), works offline, and keeps all her data on the device.

## 2. Current state — DONE

All four client modules from `BUILD_PLAN.md` are built, merged to `main`, and live:

| Module | Tool | Live URL | Status |
|---|---|---|---|
| Hub | the menu / app shell | https://anonymous03user.github.io/crochet-thing/ | ✅ |
| 2 | Stash Manager | …/crochet-thing/stash/ | ✅ |
| 1 | Chart Generator | …/crochet-thing/chart/ | ✅ |
| 3 | Substitution Calculator | …/crochet-thing/substitute/ | ✅ |
| 4 | Pattern Companion | …/crochet-thing/companion/ | ✅ (just shipped, PR #10) |

**The four apps are merged into ONE installable PWA** (PR #9): one icon ("Cricket's"), a hub menu,
each tool in its own folder, one shared manifest + one shared service worker. Cricket installs the
hub once (Safari → Share → Add to Home Screen) and the whole toolkit works offline.

**The only thing left from the original plan is Module 5 — the Deal Tracker** (an agentic/Cowork
email-digest service, a different shape from the client apps). It has **not** been started. See §9.

## 3. Architecture (how it all fits)

**One app, tools as rooms.** Rather than fusing ~250KB of working code into one page, the toolkit is
one *app identity* with the tools as separate pages:

```
crochet-thing/
  index.html              ← HUB: the menu (4 tool tiles, live stash summary, install steps)
  manifest.webmanifest    ← THE ONLY manifest (name "Cricket's Crochet Toolkit")
  sw.js                   ← THE ONLY service worker (network-first; precaches hub + all 4 tools).
                            CACHE name is currently 'crochet-toolkit-v2' — BUMP IT (v3, v4…) whenever
                            you change cached assets, or existing installs won't pick up the change.
  icons/                  ← toolkit icon (cream yarn ball on green) 180/192/512
  stash/      index.html + icons/   (+ no proxy)
  chart/      index.html + icons/   (+ no proxy)
  substitute/ index.html + icons/ + proxy/   (Ravelry)
  companion/  index.html + icons/ + proxy/   (Anthropic AI)
  docs/research/ , docs/research-prompts/
  BUILD_PLAN.md , README.md , HANDOFF.md (this file)
```

- Each tool's `<head>` points at **`../manifest.webmanifest`** and **`../icons/icon-180.png`**, and
  registers **`../sw.js`** (so the service worker scope is the repo root and one install covers
  everything). Each tool has a **"‹ Toolkit"** button that does `location.href='../'`.
- The three retired per-app service workers (`stash/sw.js`, `chart/sw.js`, `substitute/sw.js`) are
  **self-cleaning kill-switch stubs** — they exist only so a previously-installed copy unregisters
  itself and hands control to the root worker. `companion/` never had its own SW. **Do not add new
  per-tool service workers.**

**Shared data — the connective tissue.** The Stash Manager owns the yarn list at localStorage key
**`crochetToolkit.stash.v1`** (envelope `{schemaVersion, items[], projects[], settings}`; photos are
downscaled JPEG Blobs in IndexedDB `CrochetToolkitDB`, referenced as `idb:<id>` strings). The other
tools **read that key READ-ONLY** (Chart matches photo colors to owned yarn; Substitute finds
substitutes in the stash) and **never write it** (self-tested). Each tool that needs its own storage
uses its own key: `crochetToolkit.substitute.v1`, `crochetToolkit.companion.v1`.

**Two server-side proxies (secrets never in client code).** Both are tiny Cloudflare Workers that
hold credentials as encrypted secrets, are origin-locked, rate-limited, input-capped, and keep all
prompting server-side. The client only ever stores the proxy **URL** (not a secret).

| Proxy | Folder | Secret | Deployed? | Baked default in client |
|---|---|---|---|---|
| Ravelry (yarn lookup) | `substitute/proxy/` | `RAVELRY_USER`/`RAVELRY_PASS` | **YES** — `https://crochet-ravelry-proxy.crochet-thing.workers.dev` | YES (`DEFAULT_PROXY` in `substitute/index.html`) — works zero-setup |
| Anthropic AI (parse/explain) | `companion/proxy/` | `ANTHROPIC_API_KEY` | **NOT YET** | NO (`DEFAULT_PROXY=''` in `companion/index.html`) — Companion works fully without it; AI features appear once deployed + URL pasted/baked |

## 4. Per-module quick reference

### Stash Manager (`stash/index.html`)
Track yarn owned (brand/line/color/dye-lot/weight/fiber/yards/grams/skeins/gauge/hook/photo/notes),
search/filter/sort, projects, dupe-check, JSON backup/restore + CSV export, photo capture
(downscaled to IndexedDB). **Owns the shared stash store.** Built-in "Load demo data" + "Run
self-test". Photo input lets her pick from camera roll OR take a photo (PR #8).

### Chart Generator (`chart/index.html`)
Photo → griddable crochet chart. RGB↔CIELAB + deterministic k-means++ (seeded) on an area-averaged
grid (linear-light). Graphgan/pixel + C2C modes; follow-mode; B&W symbols; PNG export via Share
ladder. Reads the stash to match chart colors to owned yarn. **Crochet research was folded in**
(PR #5, `docs/research/chart-generator-facts-2026-06-08.md`): corrected yards-per-stitch table,
1.25 stitch aspect, 20% waste, both-sides row numbering, C2C bottom-right start. Camera-roll picker
(PR #8). Photo upload + take-a-photo both work.

### Substitution Calculator (`substitute/index.html`)
"Will this yarn work for that pattern, and how many skeins?" Gauge-primary green/yellow/red verdict
(gauge bands editable in Settings), weight cross-check, fiber tradeoff notes, skein math. "Find
substitutes in my stash" ranks owned yarn. **Ravelry look-up is built in and live** (deployed proxy,
baked default). Flagged assumptions + research prompt: `docs/research-prompts/substitution.md`
(NOT yet run by the owner).

### Pattern Companion (`companion/index.html`) — newest
Paste a written pattern → big hands-busy **row/stitch counter that keeps your place** (resume exactly
where you left off; every tap saved). Giant +1 STITCH, −1/Undo/Prev/Next, inverse-action undo.
**Never auto-advances a round** (deliberate design stance — a round change is always one undoable
tap; the hero count turns green at target and Next pulses, over-counting is allowed, under-target
Next asks first). Optional AI via the Anthropic proxy: **Parse** (text → rounds + stitch targets +
glossary + materials) and **Explain this row** (plain-English, cached per-round so it's free +
offline after first fetch, with a deterministic glossary-expansion fallback when offline). AI numbers
are HINTS, overridable by tapping the target. US/UK terminology banner. **Never worse with AI than
without** — a bad parse leaves a fully usable manual pattern. Flagged assumptions in Settings →
"Things Cricket should double-check". Research prompt: **not yet drafted** (the engine numbers here
are mostly UX/validation, not crochet-fact; the glossary meanings + the example pattern's stitch
counts are the things Cricket should confirm).

## 5. How to run & verify locally

```bash
cd /Users/felix_diez/crochet-thing
python3 -m http.server 5050         # serve the repo; open http://localhost:5050/
```
The repo is static — no build step. Each tool has a **"Run self-test"** button (Settings or Data tab)
that must stay all-green. The established verification loop (used for every module): serve locally →
drive it in a browser (Claude Preview MCP, or Claude-in-Chrome MCP for the *live* origin since the
Preview sandbox won't navigate cross-origin) → load demo/example → exercise the flows → check
`preview_console_logs` for errors → screenshot at 414×896 (iPhone 11 Pro Max). **Final standard:** a
live smoke test on the real GitHub Pages origin via Chrome MCP after deploy.

Pages auto-deploys from `main`/root (~30–90s). Verify a deploy by polling the live URL until your new
marker string appears, then curl the assets for 200s + MIME types.

## 6. Conventions (follow these)

- **Branch → PR → squash-merge.** Never commit straight to `main`. PR bodies are the changelog
  (plain-English; the owner is not a coder). Commit trailer:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. There is **no CI** in this
  repo; "verified" = the in-browser checks above, not a test runner.
- **Older-iOS rules (iPhone 11 Pro Max, iOS ~13–16) — reuse verbatim across tools:** NO flexbox
  `gap` (use margins; CSS *grid* gap is fine); NO native `confirm/alert/prompt` (custom dialogs); do
  NOT rely on `<a download>` (use `navigator.share` ladder → copy-text fallback); `-webkit-` prefixes
  for `sticky`/`backdrop-filter`; no `inset` shorthand; `env(safe-area-inset-*)`; guard
  `crypto.randomUUID`; register SW only when `location.protocol` starts with `http`; best-effort
  `navigator.storage.persist()`. Avoid optional chaining / nullish where trivially avoidable
  (the files are ES5-leaning `var`/`function`).
- **Rule 9 — flag assumptions.** Any crochet value a non-crocheter can't verify must be an editable,
  visibly-flagged setting + surfaced in an in-app "things to double-check" panel. Don't bury guesses.
- **Secrets:** only ever via `wrangler secret put` / the encrypted dashboard field — never in a file,
  commit, or chat. Root `.gitignore` + each `proxy/.gitignore` guard `wrangler.toml` / `.dev.vars`.
  Proxy URLs are **not** secrets and may be baked into client code.
- **Build method that worked for every module:** (1) a design **Workflow** panel (3 lenses →
  synthesize a spec) before building anything non-trivial; (2) build the single file; (3) verify
  in-browser; (4) an adversarial **Workflow** review (multi-lens find → independently verify each
  finding; most raised issues get refuted, the real ones get fixed); (5) ship + live-verify.
- **AI model:** the toolkit's AI proxy uses **`claude-opus-4-8`** with adaptive thinking and strict
  `output_config` json_schema for parsing. (Note: structured-output schemas can't contain
  `minimum`/`maxLength` etc. — range checks live in the client validator. See `claude-api` skill.)

## 7. The two proxies — operating notes

- **Ravelry (`substitute/proxy/`) — deployed by the owner.** Read-only Basic Auth creds from
  ravelry.com/pro/developer, set as `wrangler secret put RAVELRY_USER`/`RAVELRY_PASS`. Allowlists
  only `GET /yarns/search.json` + `/yarns/{id}.json`. URL is baked into `substitute/index.html`
  (`DEFAULT_PROXY`). Rotate via `wrangler secret put`; disable via `wrangler delete` (app still works
  without it). `substitute/proxy/wrangler.toml` exists locally (gitignored).
- **Anthropic AI (`companion/proxy/`) — NOT yet deployed.** To turn on Companion's AI: follow
  `companion/proxy/README.md` (get an Anthropic API key → `wrangler secret put ANTHROPIC_API_KEY` →
  `wrangler deploy`), then either paste the resulting URL into Companion → Settings, or bake it as
  `DEFAULT_PROXY` in `companion/index.html` (one-line edit, mirror how Ravelry's is baked). Caps:
  `POST /parse` ≤16k chars, 6/min; `POST /explain`, 20/min; set an Anthropic spend cap at deploy.
  **Until deployed, the Companion is fully usable as a manual counter** — only "Parse with AI" /
  "Explain this row" are dormant.

## 8. Open items / flagged for Cricket

- **Run the substitution research prompt** (`docs/research-prompts/substitution.md`) in Perplexity
  and fold answers in (same as was done for the chart — the owner runs these, Claude folds in). The
  gauge tolerance bands, weight-adjacency rules, fiber tradeoffs, and the Ravelry→CYC weight map are
  flagged guesses until confirmed.
- **Have Cricket sanity-check the flagged crochet assumptions** in each tool's "double-check" panel:
  chart yards-per-stitch + C2C; substitution thresholds; companion glossary meanings, the UK/US
  table, the **example pattern's stitch counts** (written by a non-crocheter), and the
  never-auto-advance stance (she can ask for auto-advance if she'd prefer it).
- **Optional:** deploy the Companion AI proxy (§7); extract a real branded fallback palette for the
  Chart Generator (the chart research found budget-acrylic hex isn't published as text — extractable
  from charting tools on request).
- **Module 5 — Deal Tracker (not started):** the build plan's last module. It's a different shape: an
  agentic/scheduled service that reads a dedicated deals inbox, extracts structured `Deal`s, dedupes/
  ranks, and emits a weekly digest. It is NOT a client PWA tile — it would be a Cowork/cron agent or
  a Worker on a schedule. Start it only when the owner asks; begin with a research/scoping step like
  the other modules.

## 9. Pitfalls a fresh session should know

- Work in `/Users/felix_diez/crochet-thing`, not the `sts2-assistant` cwd.
- The Claude **Preview** MCP can't navigate to external origins (it stays on localhost) — use
  **Claude-in-Chrome** MCP to test the *live* github.io site.
- Generating icons: draw on a canvas in the browser, return base64 **with a large padding string** so
  the result lands in a tool-results file, then `base64 -d`/python-decode it to PNG — don't try to
  hand-transcribe base64.
- When you change anything the service worker caches, **bump `sw.js` CACHE** (currently
  `crochet-toolkit-v2`) and note the one-time re-download in the PR.
- localStorage on Cricket's low-storage phone can be evicted — the in-app **backup/restore** (Share
  ladder) is the real durability guarantee in every tool; nudge her to use it.
