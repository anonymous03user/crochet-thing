/* Cricket's Crochet Toolkit — Pattern Companion AI proxy (Cloudflare Worker)
   ----------------------------------------------------------------------------
   WHY THIS EXISTS: the Pattern Companion is a static web app. The Anthropic API key
   is a secret and can never ship in client code. This Worker holds the key as an
   ENCRYPTED SECRET and exposes exactly two narrow, crochet-only endpoints:

     POST /parse    { pattern: "<the pasted pattern text>" }
                    -> strict JSON: rounds, stitch counts, abbreviations, materials
     POST /explain  { instruction: "<one round's text>", context: "<optional>" }
                    -> { explanation: "plain-language help for that round" }

   ALL prompting lives HERE, server-side. The client only ever sends pattern text —
   it cannot choose the model, the prompt, or the output shape — so this Worker can't
   be repurposed as a general AI endpoint. It is also origin-locked, rate-limited,
   and input-capped.

   SETUP (see README.md): wrangler secret put ANTHROPIC_API_KEY
   Optional env var MODEL overrides the default model id.
*/

var ALLOWED_ORIGIN = 'https://anonymous03user.github.io';
var DEFAULT_MODEL = 'claude-opus-4-8';
var MAX_PATTERN_CHARS = 16000;     // ~a long multi-page pattern; caps cost per call
var MAX_INSTRUCTION_CHARS = 1200;
var ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

/* The strict JSON schema the parse must return (Anthropic structured outputs).
   The API guarantees the response text is valid JSON matching this shape.
   Do NOT add minimum/maximum/maxLength here — structured outputs reject those
   keywords; range checks live in the client's validateParsed instead. */
var PARSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'terminology', 'abbreviations', 'materials', 'rounds', 'warnings'],
  properties: {
    title: { type: ['string', 'null'] },
    terminology: { type: 'string', enum: ['US', 'UK', 'unknown'] },
    abbreviations: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['abbr', 'meaning'], properties: { abbr: { type: 'string' }, meaning: { type: 'string' } } } },
    materials: { type: 'object', additionalProperties: false,
      required: ['yarnWeight', 'hookMm', 'estYards', 'notes'],
      properties: { yarnWeight: { type: ['integer', 'null'] }, hookMm: { type: ['number', 'null'] },
        estYards: { type: ['integer', 'null'] }, notes: { type: ['string', 'null'] } } },
    rounds: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['index', 'label', 'instruction', 'stitchCount', 'note'],
      properties: { index: { type: 'integer' }, label: { type: 'string' },
        instruction: { type: 'string' }, stitchCount: { type: ['integer', 'null'] },
        note: { type: ['string', 'null'] } } } },
    warnings: { type: 'array', items: { type: 'string' } }
  }
};

var PARSE_SYSTEM = [
  'You parse written crochet patterns into structured data for a row-by-row counter app.',
  'Rules:',
  '- One entry per worked row/round, in order. Expand nothing: keep each round\'s original',
  '  instruction text verbatim in "instruction" (trimmed). "label" is the human label, e.g.',
  '  "Round 3" or "Rows 5-8" (a repeated block may be ONE entry with the repeat noted in "note").',
  '- "stitchCount" is the stitch total AT THE END of that round if the pattern states it',
  '  (e.g. "(18)" or "— 18 sts") or if it is trivially computable; otherwise null. Never guess.',
  '- Detect US vs UK terminology if possible (UK uses "dc" for what US calls "sc", "tr" for US',
  '  "dc", "htr", "miss" instead of "skip"). Set "terminology" accordingly and add a warning if UK.',
  '- "abbreviations": every abbreviation the pattern actually uses, with the meaning IN THE',
  '  PATTERN\'S OWN terminology.',
  '- "materials": Craft Yarn Council weight 0-7 if stated/inferable, hook size in mm (convert',
  '  letter sizes), total estimated yards if stated. Null when unknown — never invent numbers.',
  '- "warnings": anything the counter app should surface — multiple sizes (say which size you',
  '  parsed and add per-size caveats), references to charts/photos you cannot see, unclear rounds,',
  '  special stitches defined in the pattern, UK terminology.',
  '- If the text is not a crochet pattern at all, return zero rounds and one warning saying so.'
].join('\n');

var EXPLAIN_SYSTEM = [
  'You explain ONE row/round of a crochet pattern to a beginner, in plain English.',
  '2-5 short sentences. Spell out each abbreviation the first time. Walk through the row in',
  'order ("you\'ll make 1 single crochet in each of the next 4 stitches, then..."), state how',
  'many stitches you should end with if knowable, and add one gentle tip if there is a common',
  'mistake. No greetings, no markdown headers, no fluff.'
].join('\n');

var buckets = new Map();
function rateOk(ip, limit){
  var now = Date.now(), win = 60000;
  var key = ip + ':' + limit;
  var b = buckets.get(key);
  if(!b || now - b.start > win){ b = { start: now, count: 0 }; buckets.set(key, b); }
  b.count++;
  return b.count <= limit;
}
function corsHeaders(origin){
  var o = (origin === ALLOWED_ORIGIN) ? origin : ALLOWED_ORIGIN;
  return { 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
}
function json(obj, status, ch){
  var h = { 'Content-Type': 'application/json' };
  for(var k in ch) h[k] = ch[k];
  return new Response(JSON.stringify(obj), { status: status, headers: h });
}

async function callAnthropic(env, body){
  var resp = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  var data = await resp.json().catch(function(){ return null; });
  return { status: resp.status, data: data };
}
function firstText(data){
  if(!data || !Array.isArray(data.content)) return null;
  for(var i = 0; i < data.content.length; i++){
    if(data.content[i] && data.content[i].type === 'text') return data.content[i].text;
  }
  return null;
}

export default {
  async fetch(req, env){
    var ch = corsHeaders(req.headers.get('Origin') || '');
    if(req.method === 'OPTIONS') return new Response(null, { status: 204, headers: ch });
    if(req.method !== 'POST') return json({ error: 'Only POST is allowed.' }, 405, ch);
    if(!env.ANTHROPIC_API_KEY) return json({ error: 'Proxy is missing its API key. See README.' }, 500, ch);

    var path = new URL(req.url).pathname;
    var ip = req.headers.get('CF-Connecting-IP') || 'anon';
    var body = await req.json().catch(function(){ return null; });
    if(!body || typeof body !== 'object') return json({ error: 'Bad request body.' }, 400, ch);
    var model = env.MODEL || DEFAULT_MODEL;

    if(path === '/parse'){
      var pattern = (typeof body.pattern === 'string') ? body.pattern.trim() : '';
      if(!pattern) return json({ error: 'No pattern text.' }, 400, ch);
      if(pattern.length > MAX_PATTERN_CHARS) return json({ error: 'Pattern too long — split it into parts under ' + MAX_PATTERN_CHARS + ' characters.' }, 413, ch);
      if(!rateOk(ip, 6)) return json({ error: 'Too many parses — wait a minute.' }, 429, ch);

      var r = await callAnthropic(env, {
        model: model,
        max_tokens: 12000,
        thinking: { type: 'adaptive' },
        system: PARSE_SYSTEM,
        output_config: { format: { type: 'json_schema', schema: PARSE_SCHEMA } },
        messages: [{ role: 'user', content: 'Parse this crochet pattern:\n\n' + pattern }]
      });
      if(r.data && r.data.stop_reason === 'max_tokens'){
        return json({ error: 'Pattern too long to read in one go — try splitting it into parts.' }, 502, ch);
      }
      if(r.status !== 200 || !firstText(r.data)){
        var msg = (r.status === 429) ? 'The AI is busy — try again in a minute.' : 'The AI could not parse this right now.';
        return json({ error: msg }, 502, ch);
      }
      // structured outputs guarantee valid JSON, but stay defensive anyway
      var parsed; try{ parsed = JSON.parse(firstText(r.data)); }catch(_){ return json({ error: 'The AI returned something unreadable.' }, 502, ch); }
      return json({ parsed: parsed }, 200, ch);
    }

    if(path === '/explain'){
      var instruction = (typeof body.instruction === 'string') ? body.instruction.trim() : '';
      var context = (typeof body.context === 'string') ? body.context.trim().slice(0, MAX_INSTRUCTION_CHARS) : '';
      if(!instruction) return json({ error: 'No instruction.' }, 400, ch);
      if(instruction.length > MAX_INSTRUCTION_CHARS) return json({ error: 'That row is too long to explain in one go.' }, 413, ch);
      if(!rateOk(ip, 20)) return json({ error: 'Too many requests — wait a minute.' }, 429, ch);

      var r2 = await callAnthropic(env, {
        model: model,
        max_tokens: 1000,
        system: EXPLAIN_SYSTEM,
        messages: [{ role: 'user', content: (context ? 'Pattern context: ' + context + '\n\n' : '') + 'Explain this row/round:\n' + instruction }]
      });
      if(r2.data && r2.data.stop_reason === 'max_tokens'){
        // truncated explanation — let the client fall back to its offline glossary explanation
        return json({ error: 'The explanation got cut off — try a shorter row.' }, 502, ch);
      }
      var text = firstText(r2.data);
      if(r2.status !== 200 || !text) return json({ error: 'The AI could not explain this right now.' }, 502, ch);
      return json({ explanation: text.trim() }, 200, ch);
    }

    return json({ error: 'Not found.' }, 404, ch);
  }
};
