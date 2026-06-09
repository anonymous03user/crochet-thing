# crochet-thing — Crochet Toolkit

A small suite of crochet tools. Each tool is built to stand on its own, but the
browser-based ones share one common "stash" (your yarn list) so they can talk to each other.

See **[BUILD_PLAN.md](BUILD_PLAN.md)** for the full plan and the order things get built in.

---

## What's built so far

### 🧶 Stash Manager — `stash/index.html`

Keep track of the yarn you own, so you stop buying duplicate skeins or running out mid-project.

**Live app:** **https://anonymous03user.github.io/crochet-thing/stash/**

It's built to be used **on a phone, installed like an app**:

**📲 Install on an iPhone (recommended)**
1. Open **https://anonymous03user.github.io/crochet-thing/stash/** in **Safari**.
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. Open it from the new icon. From then on it runs **offline like an app**, and your stash
   is saved reliably (a Home-Screen app isn't subject to Safari's 7-day data cleanup).

Why hosted instead of a local file: iPhones only allow "install as an app + keep data + work
offline" for pages served over https. Nothing leaves the phone — **your yarn data is stored only
on your device** (no account, no server, no internet after the first load). The site just delivers
the ~60 KB app.

> ⚠️ **Keep a backup.** Phone storage can still be cleared if the device runs very low on space.
> Use **Data → Back up now** every so often and save the file off the phone (Files / iCloud, or
> email it to yourself). That backup is the one thing that always survives.

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
