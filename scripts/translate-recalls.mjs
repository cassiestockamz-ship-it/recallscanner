#!/usr/bin/env node
/**
 * translate-recalls.mjs
 *
 * Batch-generates a plain-English one-sentence "hook" for every NHTSA
 * recall currently in Supabase, using Claude Haiku 4.5 with prompt
 * caching on the system prompt. Writes each hook back to the
 * nhtsa_recalls.plain_english_hook column. Idempotent: only touches
 * rows where plain_english_hook IS NULL.
 *
 * Flags:
 *   --limit N     Only process N rows (useful for dry runs)
 *   --dry         Print results, don't write to Supabase
 *   --concurrency N  Worker count (default 8)
 *   --verbose     Log each row as it completes
 *
 * Env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY   (or SUPABASE_SERVICE_ROLE_KEY)
 *   ANTHROPIC_API_KEY
 *
 * Typical runs:
 *   node scripts/translate-recalls.mjs --limit 10 --dry --verbose
 *   node scripts/translate-recalls.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-haiku-4-5-20251001";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in env.");
  process.exit(1);
}
if (!ANTHROPIC_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in env.");
  process.exit(1);
}

// ── Flags ──────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const getFlag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const next = argv[i + 1];
  if (next === undefined || next.startsWith("--")) return true;
  return next;
};
const DRY = argv.includes("--dry");
const VERBOSE = argv.includes("--verbose");
const LIMIT = parseInt(getFlag("limit", "0"), 10) || null;
const CONCURRENCY = parseInt(getFlag("concurrency", "8"), 10) || 8;

// ── System prompt (cacheable) ──────────────────────────────────────
const SYSTEM_PROMPT = `You rewrite official US vehicle recall text into a single plain-English safety hook for a consumer-facing website. The reader is a scared parent trying to decide if their car is safe to drive to school tomorrow.

STYLE RULES
1. One sentence. Maximum 18 words.
2. Active voice. The subject should be the thing the reader cares about: their airbag, their brakes, their fuel pump, their steering wheel.
3. Say what can HAPPEN to the driver, not what the defect IS. "Your airbag can explode and send metal fragments into the cabin" is good. "The airbag inflator contains propellant that may degrade" is bad.
4. If the consequence text mentions fire, crash, injury, or death, the hook must convey that level of severity clearly.
5. If NHTSA issued a Do-Not-Drive advisory or the consequence mentions "do not drive", start the hook with "Stop driving.".
6. If NHTSA flagged Park-Outside, convey the fire risk clearly (the car can catch fire while parked).
7. Never invent information the source text does not support. If Summary and Consequence disagree, trust Consequence.

BANNED WORDS (do not use these — they are generic filler words that sound like AI writing):
delve, utilize, facilitate, multifaceted, pivotal, myriad, plethora, foster, harness, bolster, cornerstone, leverage, actionable, moreover, furthermore, additionally, nevertheless, consequently, subsequently, hence, ultimately, essentially, nuanced, landscape, realm, paradigm, tapestry, embark, spearhead, underscore.

BANNED PHRASES (these are NHTSA legalese, rewrite them into plain action):
"may result in", "can lead to", "increases the risk of", "the potential for", "it is important to note", "under certain circumstances", "in certain conditions", "is designed to", "as a result of".

BANNED PUNCTUATION
No em dashes (—). No en dashes used as sentence breaks. Use periods and commas only. No semicolons.

OUTPUT FORMAT
Return ONLY the single rewritten sentence. No preamble, no quotes, no explanation, no "Here is the hook:". Just the sentence itself, ending in a period.

EXAMPLES

Input:
Summary: Certain airbag inflators contain propellant that can degrade due to environmental moisture over extended periods.
Consequence: An inflator rupture may result in metal fragments striking the vehicle occupants, resulting in serious injury or death.
Remedy: Dealers will replace the airbag inflator free of charge.

Output:
Your airbag can explode and send metal fragments into the cabin.

Input:
Summary: The front brake caliper mounting bolts may not have been tightened to specification at the factory.
Consequence: Loose caliper bolts can reduce braking performance and increase the risk of a crash.
Remedy: Dealers will inspect and retorque the brake caliper bolts.

Output:
Your front brake caliper can come loose and stop your brakes from working.

Input:
Summary: The fuel pump module may fail due to an internal component defect.
Consequence: A failed fuel pump can cause the engine to stall without warning while driving.
Remedy: Dealers will replace the fuel pump assembly free of charge.

Output:
Your fuel pump can fail and stall the engine at highway speed.

Input:
Summary: Certain vehicles were equipped with airbags containing unexpanded inflator assemblies. NHTSA has issued a Do Not Drive advisory for affected owners.
Consequence: The inflator can rupture on deployment, causing serious injury or death.
Remedy: Owners should not drive these vehicles until the repair is complete.

Output:
Stop driving. Your airbag can rupture and kill or seriously injure anyone in the front seats.`;

// ── Supabase helpers ───────────────────────────────────────────────
async function supaFetch(path, opts = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${res.status}: ${text}`);
  }
  return res;
}

async function fetchUntranslatedRecalls(batchLimit) {
  const cap = batchLimit ? Math.min(batchLimit, 10000) : 10000;
  const res = await supaFetch(
    `nhtsa_recalls?select=id,campaign_number,make,model,model_year,summary,consequence,remedy,notes&plain_english_hook=is.null&limit=${cap}&order=report_date.desc`,
    { headers: { Prefer: "return=representation" } }
  );
  return res.json();
}

async function writeHook(id, hook) {
  await supaFetch(`nhtsa_recalls?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ plain_english_hook: hook }),
  });
}

// ── Claude call ────────────────────────────────────────────────────
async function claudeHook(recall, attempt = 0) {
  const userPrompt =
    `Input:\n` +
    `Summary: ${recall.summary || "(none)"}\n` +
    `Consequence: ${recall.consequence || "(none)"}\n` +
    (recall.remedy ? `Remedy: ${recall.remedy}\n` : "") +
    (recall.notes ? `Notes: ${recall.notes}\n` : "") +
    `\nOutput:`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 120,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (res.status === 429 || res.status === 529) {
      // Rate limited or overloaded — exponential backoff
      if (attempt < 5) {
        const wait = 1000 * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise((r) => setTimeout(r, wait));
        return claudeHook(recall, attempt + 1);
      }
      throw new Error(`Rate limited after retries: ${res.status}`);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = (data.content?.[0]?.text || "").trim();
    const usage = data.usage || {};

    return {
      text: sanitize(text),
      usage: {
        input: usage.input_tokens || 0,
        output: usage.output_tokens || 0,
        cache_create: usage.cache_creation_input_tokens || 0,
        cache_read: usage.cache_read_input_tokens || 0,
      },
    };
  } catch (err) {
    if (attempt < 3 && /ENOTFOUND|ETIMEDOUT|ECONNRESET|fetch failed/.test(String(err))) {
      const wait = 1000 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, wait));
      return claudeHook(recall, attempt + 1);
    }
    throw err;
  }
}

/** Final safety net: strip anything that slipped past the prompt. */
function sanitize(text) {
  let t = text.replace(/—/g, ",").replace(/;/g, ".").trim();
  // Remove leading/trailing quotes if Claude added any
  t = t.replace(/^["'""']+|["'""']+$/g, "").trim();
  // Ensure it ends in a period
  if (t && !/[.!?]$/.test(t)) t += ".";
  // Collapse double spaces
  t = t.replace(/\s+/g, " ");
  return t;
}

// ── Worker pool ────────────────────────────────────────────────────
async function runPool(items, concurrency, worker) {
  const queue = items.slice();
  const results = [];
  const runners = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      try {
        const r = await worker(item);
        results.push({ ok: true, item, result: r });
      } catch (err) {
        results.push({ ok: false, item, error: err });
      }
    }
  });
  await Promise.all(runners);
  return results;
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log(
    `\n┌─ translate-recalls.mjs\n` +
      `│  model:       ${MODEL}\n` +
      `│  concurrency: ${CONCURRENCY}\n` +
      `│  limit:       ${LIMIT ?? "(all)"}\n` +
      `│  dry:         ${DRY}\n` +
      `└─ starting…\n`
  );

  const recalls = await fetchUntranslatedRecalls(LIMIT);
  if (recalls.length === 0) {
    console.log("No untranslated recalls. Nothing to do.");
    return;
  }
  console.log(`Fetched ${recalls.length} untranslated recalls.`);

  const totals = {
    ok: 0,
    failed: 0,
    input: 0,
    output: 0,
    cache_create: 0,
    cache_read: 0,
  };
  const t0 = Date.now();
  let done = 0;

  const results = await runPool(recalls, CONCURRENCY, async (r) => {
    const { text, usage } = await claudeHook(r);
    totals.input += usage.input;
    totals.output += usage.output;
    totals.cache_create += usage.cache_create;
    totals.cache_read += usage.cache_read;

    if (!DRY) {
      await writeHook(r.id, text);
    }

    done++;
    if (VERBOSE || done % 50 === 0) {
      const year = r.model_year ? ` ${r.model_year}` : "";
      const label = `${r.make}${year} ${r.model} · ${r.campaign_number}`;
      console.log(`[${done}/${recalls.length}] ${label}\n    → ${text}`);
    }
    return text;
  });

  const elapsed = (Date.now() - t0) / 1000;
  totals.ok = results.filter((r) => r.ok).length;
  totals.failed = results.filter((r) => !r.ok).length;

  // Rough cost estimate (Haiku 4.5 list: $1/M input, $5/M output;
  // cache writes at $1.25/M, cache reads at $0.10/M)
  const cost =
    (totals.cache_create / 1_000_000) * 1.25 +
    (totals.cache_read / 1_000_000) * 0.1 +
    (totals.input / 1_000_000) * 1 +
    (totals.output / 1_000_000) * 5;

  console.log(
    `\n┌─ Done in ${elapsed.toFixed(1)}s\n` +
      `│  ok:     ${totals.ok}\n` +
      `│  failed: ${totals.failed}\n` +
      `│  tokens: ${totals.input.toLocaleString()} in, ${totals.output.toLocaleString()} out\n` +
      `│  cache:  ${totals.cache_create.toLocaleString()} created, ${totals.cache_read.toLocaleString()} read\n` +
      `│  est $:  $${cost.toFixed(4)}\n` +
      `└─${DRY ? " (DRY — nothing written)" : ""}`
  );

  if (totals.failed > 0) {
    console.log("\nFailures:");
    for (const r of results.filter((x) => !x.ok).slice(0, 10)) {
      console.log(`  ${r.item.campaign_number}: ${r.error?.message || r.error}`);
    }
    process.exit(totals.ok === 0 ? 1 : 0);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
