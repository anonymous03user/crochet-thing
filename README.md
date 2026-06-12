# Cricket's Crochet Toolkit

**One installable app, three crochet helpers inside it** — a yarn stash tracker, a
photo-to-chart generator, and a yarn substitution calculator. They all share one yarn list
(saved on the device) so they can talk to each other.

**Live app (the menu / home screen):** **https://anonymous03user.github.io/crochet-thing/**

**📲 Install on an iPhone (one time)**
1. Open **https://anonymous03user.github.io/crochet-thing/** in **Safari**.
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. Open it from the new **Cricket's** icon. The whole toolkit then runs **offline like a real
   app** — pick a tool from the menu, and use the **‹ Toolkit** button to get back.

Why hosted instead of a local file: iPhones only allow "install as an app + keep data + work
offline" for pages served over https. Nothing leaves the phone — **your yarn data is stored only
on your device** (no account, no server, no internet after the first load). Installing as a
Home-Screen app also protects the data from Safari's 7-day cleanup of regular websites.

> ⚠️ **Keep a backup.** Phone storage can still be cleared if the device runs very low on space.
> Use **Stash Manager → Data → Back up now** every so often and save the file off the phone
> (Files / iCloud, or email it to yourself). That backup is the one thing that always survives.

Under the hood each tool is its own small page (`stash/`, `chart/`, `substitute/`) behind one
app identity (root `manifest.webmanifest` + one service worker `sw.js` that caches the whole
toolkit for offline use). See **[BUILD_PLAN.md](BUILD_PLAN.md)** for the original plan.

---

## The three tools

### 🧶 Stash Manager — `stash/index.html`

Keep track of the yarn you own, so you stop buying duplicate skeins or running out mid-project.

What it does:
- **Add / edit / delete yarn** — brand, line, color, dye lot, weight, fiber, yards & grams per
  skein, how many skeins you have, gauge, hook size, a photo, and notes.
- **Search, filter and sort** your stash, with a running total of "yarn on hand."
- **"You may already own this"** warning while you add yarn (and a heads-up when a color
  matches but the **dye lot** is different).
- **Projects** — make a project, reserve yarn for it, and see "reserved vs. free" yardage.
- **Backup & restore** — export your whole stash (with photos) to a file, and import it back.
  Also a spreadsheet (CSV) export.

> ⚠️ **Back up now and then.** Your data lives only in this browser. If you clear your
> browsing data it's gone — so use the **Data → Export / Backup** button to save a real file
> every so often (and before switching computers).

**Not sure if it works?** Open it, go to the **Data** tab, and click **Load demo data** to see
it populated, or **Run self-test** to confirm saving, backup and restore all work.

#### For the crocheter — please sanity-check these

The person who built this doesn't crochet, so a few choices need a real crocheter's eyes:
- Yarn **weights** use the Craft Yarn Council 0–7 scale (0 Lace … 4 Medium/Worsted … 7 Jumbo).
- **Gauge** is entered *per 4 inches* (both stitches and rows).
- **Hook size** is in **millimetres**.
- The duplicate warning matches **brand + line + color name**, and flags a different **dye lot**.

If any of that doesn't match how you actually track yarn, say so and it can be changed.

---

### 🖼️ Chart Generator — `chart/index.html`

Turn a photo into a **griddable crochet chart** (graphgan / single-crochet pixel / C2C) with a
color key, per-color stitch counts, and yarn matching.

**Direct link:** **https://anonymous03user.github.io/crochet-thing/chart/** (or just open it
from the toolkit menu).

What it does:
- Pick or take a photo → set the **width in stitches** and **how many colors** → **Generate**.
- It reduces the photo's colors to a handful of yarn colors (perceptual color matching) and draws a
  grid chart: row 1 at the bottom, bold lines every 10, row numbers, and optional **letters for
  black-&-white printing**.
- **Reads your stash** (from the Stash Manager) to match each chart color to **yarn you already
  own**, with skein estimates — plus a built-in palette fallback and a per-color "use a different
  yarn" dropdown.
- **Follow mode** highlights one row at a time with a plain-English readout ("Row 7: 4 cream, 2
  navy…"). **Export** the chart + key as an image (color or B&W) or print it.

> The builder doesn't crochet, so the yarn-amount math (yards per stitch), the C2C "beta" mode, and a
> few other numbers are **flagged guesses you can edit** — see
> [docs/research-prompts/chart-generator.md](docs/research-prompts/chart-generator.md) for the
> questions to confirm. Always check colors against real yarn in good light.

### 🧮 Substitution Calculator — `substitute/index.html`

"The pattern calls for yarn X; I have/want yarn Y — **will it work, and how many skeins?**"

**Direct link:** **https://anonymous03user.github.io/crochet-thing/substitute/** (or open it
from the toolkit menu).

What it does:
- Enter the pattern's yarn and the yarn you'd use — by hand, **from your stash**, or by
  **Ravelry look-up** (built in — search a yarn by name and its details auto-fill).
- Get a clear **green / yellow / red verdict** with plain-language reasons and one concrete fix.
  Gauge is treated as the real decider; weight category is a cross-check; fiber is a tradeoff note.
- **"Find substitutes in my stash"** ranks every yarn you own against the pattern's yarn.
- Works out **skeins to buy** (with leftover and a "+1 for dye-lot safety" nudge), and tells you
  "you own N / need M" when the candidate came from your stash.
- The "will it work" thresholds are flagged, editable assumptions (Settings) — see
  [docs/research-prompts/substitution.md](docs/research-prompts/substitution.md).

The Ravelry look-up goes through a tiny read-only proxy that keeps the API credentials off the
site entirely — see [substitute/proxy/README.md](substitute/proxy/README.md).

## Coming next (see the build plan)

Pattern Companion (AI) and an email Deal Tracker.
