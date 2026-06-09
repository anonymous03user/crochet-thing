# crochet-thing — Crochet Toolkit

A small suite of crochet tools. Each tool is built to stand on its own, but the
browser-based ones share one common "stash" (your yarn list) so they can talk to each other.

See **[BUILD_PLAN.md](BUILD_PLAN.md)** for the full plan and the order things get built in.

---

## What's built so far

### 🧶 Stash Manager — `stash-manager.html`

Keep track of the yarn you own, so you stop buying duplicate skeins or running out mid-project.

**How to use it:** just **double-click `stash-manager.html`** — it opens in your web browser.
There's nothing to install, no account, no internet needed. Everything is saved on your own
computer, inside the browser.

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

## Coming next (see the build plan)

Image-to-Chart Generator, Substitution + Yardage Calculator, Pattern Companion (AI), and an
email Deal Tracker.
