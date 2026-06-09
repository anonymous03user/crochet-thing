/* Crochet Toolkit — Ravelry read-only proxy (Cloudflare Worker)
   ----------------------------------------------------------------------------
   WHY THIS EXISTS: the Substitution Calculator is a static web app. Ravelry's API
   needs a private username+password and is not browser-callable (no CORS). Putting
   credentials in the app would expose them to anyone ("view source"). So this tiny
   server sits in the middle: it holds the credentials as ENCRYPTED SECRETS, allows
   ONLY two read-only yarn lookups, locks access to your site's origin, and rate-limits.

   The app only ever stores this Worker's URL — never your Ravelry credentials.

   SETUP: see README.md in this folder. Secrets go in with `wrangler secret put`
   (or the Cloudflare dashboard, "Encrypt") — NEVER in this file or any committed file.
*/

// ---- EDIT THIS to your site's origin (where the app is hosted) -------------
var ALLOWED_ORIGIN = 'https://anonymous03user.github.io';
// ---------------------------------------------------------------------------
var RAVELRY_BASE = 'https://api.ravelry.com';
var MAX_PAGE_SIZE = 20;

// Per-IP token bucket (per-isolate; plenty for one hobby user). 30 requests / minute.
var buckets = new Map();
function rateOk(ip){
  var now = Date.now(), win = 60000, lim = 30;
  var b = buckets.get(ip);
  if(!b || now - b.start > win){ b = { start: now, count: 0 }; buckets.set(ip, b); }
  b.count++;
  return b.count <= lim;
}
function corsHeaders(origin){
  // Echo the exact allowed origin (never "*"); fall back to the configured origin.
  var o = (origin === ALLOWED_ORIGIN) ? origin : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}
function jsonResponse(obj, status, ch){
  var h = { 'Content-Type': 'application/json' };
  if(ch){ for(var k in ch) h[k] = ch[k]; }
  return new Response(JSON.stringify(obj), { status: status, headers: h });
}

export default {
  async fetch(req, env, ctx){
    var origin = req.headers.get('Origin') || '';
    var ch = corsHeaders(origin);

    if(req.method === 'OPTIONS') return new Response(null, { status: 204, headers: ch });
    if(req.method !== 'GET') return jsonResponse({ error: 'Only GET is allowed.' }, 405, ch);

    var url = new URL(req.url);
    var path = url.pathname;
    var target = null;

    // --- endpoint allowlist (only these two read-only yarn lookups) ---
    if(path === '/yarns/search.json'){
      var q = url.searchParams.get('query') || '';
      var ps = parseInt(url.searchParams.get('page_size') || '10', 10);
      if(!(ps > 0)) ps = 10;
      if(ps > MAX_PAGE_SIZE) ps = MAX_PAGE_SIZE;
      var page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
      target = RAVELRY_BASE + '/yarns/search.json?query=' + encodeURIComponent(q) + '&page_size=' + ps + '&page=' + page;
    } else if(/^\/yarns\/\d+\.json$/.test(path)){   // digits-only id
      target = RAVELRY_BASE + path;
    } else {
      return jsonResponse({ error: 'Not found.' }, 404, ch);
    }

    if(!env.RAVELRY_USER || !env.RAVELRY_PASS){
      return jsonResponse({ error: 'Proxy is missing its Ravelry secrets. See README.' }, 500, ch);
    }
    var ip = req.headers.get('CF-Connecting-IP') || 'anon';
    if(!rateOk(ip)) return jsonResponse({ error: 'Too many requests — slow down a moment.' }, 429, ch);

    // --- edge cache (1h) so repeated lookups are cheap and gentle on Ravelry ---
    var cache = caches.default;
    var cacheKey = new Request(target, { method: 'GET' });
    var hit = await cache.match(cacheKey);
    if(hit){
      var fromCache = new Response(hit.body, hit);
      for(var k1 in ch) fromCache.headers.set(k1, ch[k1]);
      return fromCache;
    }

    var auth = 'Basic ' + btoa(env.RAVELRY_USER + ':' + env.RAVELRY_PASS);
    var upstream;
    try{
      upstream = await fetch(target, { headers: { 'Authorization': auth, 'Accept': 'application/json' } });
    }catch(e){
      return jsonResponse({ error: 'Could not reach Ravelry.' }, 502, ch);
    }
    var body = await upstream.text();
    var resp = new Response(body, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=3600' }
    });
    if(upstream.status === 200) ctx.waitUntil(cache.put(cacheKey, resp.clone()));

    var out = new Response(resp.body, resp);
    for(var k2 in ch) out.headers.set(k2, ch[k2]);
    return out;
  }
};
