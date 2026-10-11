#!/usr/bin/env node
/**
 * recall-alerts.mjs
 *
 * Matches new NHTSA recalls against active recall_subscribers (make, model,
 * optional year) and emails one plain alert per subscriber and campaign.
 *
 * DRY RUN is the default: prints subscriber ids and campaign numbers, sends
 * nothing, writes nothing. Sending needs BOTH --send and BREVO_API_KEY.
 *
 * "New" means nhtsa_recalls.report_date (text DD/MM/YYYY) is on or after the
 * last-run date kept in scripts/.recall-alerts-state.json (gitignored), and
 * the subscriber/campaign pair is not already in that file's `sent` list.
 * The first real send run only sets the marker to today (baseline, no mail),
 * so subscribers never get the whole back catalogue.
 *
 * Flags:
 *   --send          really send (also needs BREVO_API_KEY)
 *   --since YYYY-MM-DD   override the marker (dry run: default is 7 days ago)
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, BREVO_API_KEY, UNSUBSCRIBE_SECRET (send only),
 *      ALERT_FROM_EMAIL (send only), RS_SITE_URL (default https://www.recallscanner.com)
 *
 * Addresses are never printed or logged.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const BREVO = process.env.BREVO_API_KEY;
const SITE = process.env.RS_SITE_URL || "https://www.recallscanner.com";
const FROM = process.env.ALERT_FROM_EMAIL;
const args = process.argv.slice(2);
const SEND = args.includes("--send");
const sinceArg = args.includes("--since") ? args[args.indexOf("--since") + 1] : null;
const STATE = path.join(path.dirname(fileURLToPath(import.meta.url)), ".recall-alerts-state.json");

if (!SUPABASE_URL || !KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY are required");
  process.exit(1);
}

const slug = (s) => String(s ?? "").toLowerCase().replace(/[\s/]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
const makeSlug = (s) => String(s ?? "").toLowerCase().replace(/[\s-]+/g, "-");
/** report_date DD/MM/YYYY to a YYYYMMDD number (0 when unparseable). */
const dayNum = (d) => {
  const m = String(d ?? "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]) : 0;
};
const isoNum = (iso) => Number(iso.replaceAll("-", ""));
const today = new Date().toISOString().slice(0, 10);

async function rest(table, qs) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` },
    });
    if (!r.ok) throw new Error(`${table}: HTTP ${r.status}`);
    const page = await r.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

/** model_year is one year ("2021") or, rarely, a range ("2019-2021"). */
function yearMatches(modelYear, year) {
  if (!year) return true;
  const ys = String(modelYear ?? "").match(/\d{4}/g);
  if (!ys) return false;
  const lo = Number(ys[0]), hi = Number(ys[ys.length - 1]);
  return year >= lo && year <= hi;
}

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, "utf8")) : null;
let sinceIso = sinceArg || state?.lastRun;
if (!sinceIso) {
  if (SEND && BREVO) {
    fs.writeFileSync(STATE, JSON.stringify({ lastRun: today, sent: [] }));
    console.log(`First send run: marker set to ${today}, nothing sent.`);
    process.exit(0);
  }
  sinceIso = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
}
const since = isoNum(sinceIso);
const sent = new Set(state?.sent ?? []);

const subs = (await rest("recall_subscribers", "unsubscribed_at=is.null&make=not.is.null&model=not.is.null&select=id,email,make,model,year,vin")).filter((s) => s.email);
const recalls = (await rest("nhtsa_recalls", "select=campaign_number,make,make_slug,model,model_slug,model_year,summary,consequence,remedy,report_date")).filter((r) => dayNum(r.report_date) >= since);

console.log(`${SEND && BREVO ? "SEND" : "DRY RUN"}: ${subs.length} active subscribers with a vehicle, ${recalls.length} recalls reported since ${sinceIso}`);

const matches = [];
for (const s of subs) {
  const ms = makeSlug(s.make), mo = slug(s.model);
  for (const r of recalls) {
    if (r.make_slug !== ms || r.model_slug !== mo) continue;
    if (!yearMatches(r.model_year, s.year)) continue;
    if (sent.has(`${s.id}:${r.campaign_number}`)) continue;
    matches.push({ s, r });
  }
}
for (const { s, r } of matches) console.log(`subscriber ${s.id}: ${r.campaign_number}`);
console.log(`${matches.length} match(es) for ${new Set(matches.map((m) => m.s.id)).size} subscriber(s)`);

if (!(SEND && BREVO)) {
  if (SEND && !BREVO) console.log("--send given but BREVO_API_KEY is not set: nothing sent.");
  process.exit(0);
}
if (!FROM) {
  console.error("ALERT_FROM_EMAIL is required to send");
  process.exit(1);
}

import crypto from "node:crypto";

const SECRET = process.env.UNSUBSCRIBE_SECRET;
if (!SECRET) {
  console.error("UNSUBSCRIBE_SECRET is required to send (signs the unsubscribe link)");
  process.exit(1);
}
const probe = await fetch(`${SITE}/unsubscribe`, { method: "GET", redirect: "manual" }).catch(() => null);
if (!probe || probe.status !== 200) {
  console.error(`Refusing to send: ${SITE}/unsubscribe does not return 200 (got ${probe ? probe.status : "no response"}). Build the route first.`);
  process.exit(1);
}

// One email per subscriber per run, listing every matched campaign.
const bySub = new Map();
for (const m of matches) {
  if (!bySub.has(m.s.id)) bySub.set(m.s.id, { s: m.s, rs: [] });
  bySub.get(m.s.id).rs.push(m.r);
}

let ok = 0;
for (const { s, rs } of bySub.values()) {
  const vehicle = [s.year, s.make, s.model].filter(Boolean).join(" ");
  const page = `${SITE}/recalls/${rs[0].make_slug}/${rs[0].model_slug}`;
  // Token = HMAC-SHA256(UNSUBSCRIBE_SECRET, String(id)) as hex; the /unsubscribe route must verify the same.
  const token = crypto.createHmac("sha256", SECRET).update(String(s.id)).digest("hex");
  const unsub = `${SITE}/unsubscribe?id=${s.id}&t=${token}`;
  const blocks = rs.map((r) =>
    [
      `Campaign number: ${r.campaign_number}${r.model_year ? ` (model year ${r.model_year})` : ""}`,
      r.summary ? `What NHTSA says: ${r.summary}` : "",
      r.remedy ? `The fix: ${r.remedy}` : "",
    ].filter(Boolean).join("\n")
  );
  const text = [
    `NHTSA has filed ${rs.length === 1 ? "a new recall" : `${rs.length} new recalls`} that may cover your ${vehicle}.`,
    "",
    blocks.join("\n\n"),
    `\nAll recalls for this model: ${page}`,
    `Check a specific VIN: ${SITE}/vin`,
    `\nYou get this because you asked for alerts for your ${vehicle}. Stop them here: ${unsub}`,
  ].join("\n");
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO, "content-type": "application/json" },
    body: JSON.stringify({
      sender: { email: FROM, name: "RecallScanner" },
      to: [{ email: s.email }],
      subject: `New NHTSA recall for your ${vehicle}`,
      textContent: text,
    }),
  });
  if (res.ok) {
    for (const r of rs) sent.add(`${s.id}:${r.campaign_number}`);
    ok++;
  } else {
    console.error(`send failed for subscriber ${s.id}: HTTP ${res.status}`);
  }
}
fs.writeFileSync(STATE, JSON.stringify({ lastRun: today, sent: [...sent] }));
console.log(`sent ${ok} of ${bySub.size} subscriber email(s)`);
