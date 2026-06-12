# Ravelry proxy — optional setup (for the "Look up on Ravelry" feature)

> **Already done for this site.** The app ships pointing at a pre-deployed proxy
> (`https://crochet-ravelry-proxy.crochet-thing.workers.dev`), so on
> `https://anonymous03user.github.io` the Ravelry look-up **works out of the box — no setup**.
> Follow the steps below only if you want your **own** proxy — required if you host the app
> anywhere else, because the built-in Worker only accepts requests from that origin
> (`ALLOWED_ORIGIN` in `worker.js`).

The Substitution Calculator works fully **without** this — you can type yarn details in by
hand or pull them from your Stash Manager. This proxy only adds the convenience of **looking
up a yarn by name on Ravelry** and auto-filling its weight, gauge, fiber, and yards/skein.

**Why a proxy at all?** Ravelry's API needs a private username + password and can't be called
safely from a web page. This tiny free server holds those credentials **encrypted**, only allows
two read-only yarn lookups, and is locked to your site. The app only ever stores this server's
**URL** — never your Ravelry login.

## One-time setup (about 10 minutes)

1. **Get read-only Ravelry API credentials.**
   Go to <https://www.ravelry.com/pro/developer> → create an app → choose **"Basic Auth: read-only
   access."** You'll get a **username** and a **password** (these are API credentials, not your
   normal Ravelry login).

2. **Make a free Cloudflare account** at <https://dash.cloudflare.com> (Workers free tier is plenty).

3. **Install Wrangler** (Cloudflare's tool) — needs Node.js installed:
   ```
   npm install -g wrangler
   wrangler login
   ```

4. **In this folder** (`substitute/proxy/`):
   ```
   cp wrangler.toml.example wrangler.toml
   ```

5. **Add your credentials as encrypted secrets** (they are NOT stored in any file):
   ```
   wrangler secret put RAVELRY_USER     # paste the read-only username
   wrangler secret put RAVELRY_PASS     # paste the read-only password
   ```

6. **(If your site isn't `anonymous03user.github.io`)** edit `ALLOWED_ORIGIN` at the top of
   `worker.js` to your site's origin.

7. **Deploy:**
   ```
   wrangler deploy
   ```
   You'll get a URL like `https://crochet-ravelry-proxy.YOURNAME.workers.dev`.

8. **In the app:** open **Settings → Ravelry**, paste that URL, tap **Test connection**. Done.

## Safety notes
- The Worker URL only allows **rate-limited, read-only yarn lookups**. It never exposes your
  credentials, and it's locked to your site's origin.
- **Rotate** credentials any time by re-running `wrangler secret put`.
- **Turn it off** completely with `wrangler delete` (the app keeps working without it).
- Never paste your Ravelry username/password into a file, a commit, or a chat — only into
  `wrangler secret put` / the encrypted dashboard field.
