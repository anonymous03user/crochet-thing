# Pattern Companion AI proxy — optional setup (for the "Parse with AI" + "Explain" features)

The Pattern Companion works fully **without** this — the row/stitch counter, pattern library,
and resume-where-you-left-off all run with zero setup. This proxy only adds the AI conveniences:
**"Parse with AI"** (turns a pasted pattern into tappable rounds with stitch targets, a glossary,
and materials) and **"What does this row mean?"** (plain-English explanations).

**Why a proxy?** The AI needs an Anthropic API key, which is a secret and can never ship inside
a public web page. This tiny free server holds the key **encrypted**, allows only the two
crochet-specific requests above (all prompting lives server-side — it cannot be used as a general
AI endpoint), is locked to your site, rate-limited, and caps input sizes so costs stay tiny.

## One-time setup (about 10 minutes)

1. **Get an Anthropic API key** at <https://console.anthropic.com> (Settings → API keys).
   Pay-as-you-go: a typical pattern parse costs a few cents; an explanation a fraction of one.

2. **Make a free Cloudflare account** at <https://dash.cloudflare.com> (same account as the
   Ravelry proxy is fine).

3. **In this folder** (`companion/proxy/`):
   ```
   cp wrangler.toml.example wrangler.toml
   ```

4. **Add the key as an encrypted secret** (NOT in any file):
   ```
   npx wrangler secret put ANTHROPIC_API_KEY
   ```

5. **(If your site isn't `anonymous03user.github.io`)** edit `ALLOWED_ORIGIN` in `worker.js`.

6. **Deploy:**
   ```
   npx wrangler deploy
   ```
   You'll get a URL like `https://crochet-companion-ai.YOURNAME.workers.dev`.

7. **In the app:** Pattern Companion → Settings → paste that URL → Test connection.
   (Or hand the URL to Claude Code to bake in as the default, like the Ravelry proxy.)

## Cost & safety notes
- The Worker only accepts `POST /parse` (max ~16k characters of pattern text, 6/minute per
  visitor) and `POST /explain` (short row text, 20/minute). Model + prompts are fixed
  server-side; the URL cannot be used to chat with the AI or run arbitrary prompts.
- Spending is bounded by those caps; you can also set a monthly spend limit in the Anthropic
  console. To lower cost further, set `MODEL = "claude-haiku-4-5"` in `wrangler.toml`.
- **Rotate** the key any time with `wrangler secret put`; **turn it all off** with
  `wrangler delete` (the app keeps working without it).
- Never paste the API key into a file, a commit, or a chat — only into `wrangler secret put`
  / the encrypted dashboard field.
