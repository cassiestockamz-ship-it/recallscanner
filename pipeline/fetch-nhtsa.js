#!/usr/bin/env node
/**
 * NHTSA Pipeline — Fetches all recall/complaint/model data from NHTSA
 * and stores in Supabase. Runs daily on VPS via PM2 cron.
 *
 * Usage: node pipeline/fetch-nhtsa.js
 * Env:   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load env — VPS uses /opt/shared/.env, local uses .env.local
config({ path: "/opt/shared/.env" });
config({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASE = "https://api.nhtsa.gov";

// ── Config ──────────────────────────────────────────────────

const POPULAR_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler",
  "Dodge", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti",
  "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda",
  "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Porsche", "Ram",
  "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

const CURRENT_YEAR = new Date().getFullYear();
const MODEL_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);
const COMPLAINT_YEARS = Array.from({ length: 3 }, (_, i) => CURRENT_YEAR - i);

// Rate limiting -- NHTSA rate-limits aggressively, especially complaints
const DELAY_MS = 500;
const LONG_DELAY_MS = 3000; // after 403s
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Slug helpers (match Next.js site) ───────────────────────

function makeSlug(make) {
  return make.toLowerCase().replace(/[\s-]+/g, "-");
}

function modelSlug(model) {
  return model.toLowerCase().replace(/[\s/]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// ── NHTSA fetch helpers ─────────────────────────────────────

async function fetchJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (resp.status === 403) {
        console.warn(`  Rate limited (403), backing off ${LONG_DELAY_MS}ms...`);
        await sleep(LONG_DELAY_MS * (attempt + 1));
        continue;
      }
      if (!resp.ok) {
        console.warn(`  HTTP ${resp.status} for ${url}`);
        return null;
      }
      return await resp.json();
    } catch (err) {
      console.warn(`  Fetch error (attempt ${attempt + 1}/3): ${err.message}`);
      if (attempt < 2) await sleep(2000 * (attempt + 1));
    }
  }
  return null;
}

async function getModelsForMakeYear(make, year) {
  const data = await fetchJson(
    `${BASE}/products/vehicle/models?make=${encodeURIComponent(make)}&modelYear=${year}&issueType=r`
  );
  return (data?.results ?? []).map((r) => ({ model: r.model, year: String(year) }));
}

async function getRecallsForMakeModelYear(make, model, year) {
  const data = await fetchJson(
    `${BASE}/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`
  );
  return data?.results ?? [];
}

async function getComplaintsForMakeModelYear(make, model, year) {
  const data = await fetchJson(
    `${BASE}/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`
  );
  return data?.results ?? [];
}

// ── Telegram ────────────────────────────────────────────────

async function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {}
}

// ── Pipeline ────────────────────────────────────────────────

async function processMake(make) {
  const mSlug = makeSlug(make);
  console.log(`\n=== ${make} (${mSlug}) ===`);

  // 1. Fetch models across all years
  const allModelsRaw = [];
  for (const year of MODEL_YEARS) {
    const models = await getModelsForMakeYear(make, year);
    for (const m of models) {
      allModelsRaw.push(m);
    }
    await sleep(DELAY_MS);
  }

  // Dedupe models, keep latest year
  const modelMap = new Map();
  for (const m of allModelsRaw) {
    const base = m.model.split("(")[0].trim();
    const slug = modelSlug(base);
    const existing = modelMap.get(slug);
    if (!existing || parseInt(m.year) > existing.latestYear) {
      modelMap.set(slug, { model: base, slug, latestYear: parseInt(m.year) });
    }
  }

  const models = [...modelMap.values()];
  console.log(`  Found ${models.length} unique models`);

  // 2. Upsert models
  if (models.length > 0) {
    const modelRows = models.map((m) => ({
      make,
      make_slug: mSlug,
      model: m.model,
      model_slug: m.slug,
      latest_year: m.latestYear,
      updated_at: new Date().toISOString(),
    }));

    for (let i = 0; i < modelRows.length; i += 100) {
      const batch = modelRows.slice(i, i + 100);
      const { error } = await db
        .from("nhtsa_models")
        .upsert(batch, { onConflict: "make_slug,model_slug" });
      if (error) console.error(`  Models upsert error: ${error.message}`);
    }
  }

  // 3. Fetch recalls for each model across all years
  let recallCount = 0;
  const campaignsSeen = new Set();

  for (const m of models) {
    for (const year of MODEL_YEARS) {
      const recalls = await getRecallsForMakeModelYear(make, m.model, String(year));
      const newRecalls = recalls.filter((r) => !campaignsSeen.has(r.NHTSACampaignNumber));

      for (const r of newRecalls) {
        campaignsSeen.add(r.NHTSACampaignNumber);
      }

      if (newRecalls.length > 0) {
        const rows = newRecalls.map((r) => ({
          campaign_number: r.NHTSACampaignNumber,
          manufacturer: r.Manufacturer || null,
          make,
          make_slug: mSlug,
          model: m.model,
          model_slug: m.slug,
          model_year: r.ModelYear || String(year),
          component: r.Component || null,
          summary: r.Summary || null,
          consequence: r.Consequence || null,
          remedy: r.Remedy || null,
          report_date: r.ReportReceivedDate || null,
          notes: r.Notes || null,
          updated_at: new Date().toISOString(),
        }));

        for (let i = 0; i < rows.length; i += 100) {
          const batch = rows.slice(i, i + 100);
          const { error } = await db
            .from("nhtsa_recalls")
            .upsert(batch, { onConflict: "campaign_number" });
          if (error) console.error(`  Recalls upsert error: ${error.message}`);
        }
        recallCount += newRecalls.length;
      }

      await sleep(DELAY_MS);
    }
  }

  console.log(`  Stored ${recallCount} recalls`);

  // 4. Complaints -- skipped for now, NHTSA rate-limits this endpoint aggressively
  // TODO: add slow backfill pass for complaints separately
  const complaintCount = 0;

  return { make, models: models.length, recalls: recallCount, complaints: complaintCount };
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  // --skip N to resume after N brands (e.g., --skip 5 skips Acura-Cadillac)
  const skipArg = process.argv.find((a) => a === "--skip");
  const skipIdx = skipArg ? process.argv.indexOf(skipArg) : -1;
  const skipCount = skipIdx >= 0 ? parseInt(process.argv[skipIdx + 1]) || 0 : 0;
  const makesToProcess = POPULAR_MAKES.slice(skipCount);

  console.log(`NHTSA Pipeline starting at ${new Date().toISOString()}`);
  console.log(`Processing ${makesToProcess.length} makes (skipping first ${skipCount}), ${MODEL_YEARS.length} years each`);

  const results = [];
  for (const make of makesToProcess) {
    try {
      const result = await processMake(make);
      results.push(result);
    } catch (err) {
      console.error(`FATAL for ${make}: ${err.message}`);
      results.push({ make, models: 0, recalls: 0, complaints: 0, error: err.message });
    }
  }

  const elapsedSec = (Date.now() - startTime) / 1000;
  const elapsed = (elapsedSec / 60).toFixed(1);
  const totalModels = results.reduce((s, r) => s + r.models, 0);
  const totalRecalls = results.reduce((s, r) => s + r.recalls, 0);
  const errors = results.filter((r) => r.error);

  // Clean up models with no recalls or complaints (avoids soft 404s in GSC)
  try {
    const [{ data: recallSlugs }, { data: complaintSlugs }, { data: allModels }] = await Promise.all([
      db.from("nhtsa_recalls").select("make_slug,model_slug"),
      db.from("nhtsa_complaints").select("make_slug,model_slug"),
      db.from("nhtsa_models").select("id,make_slug,model_slug"),
    ]);
    const hasData = new Set([
      ...(recallSlugs || []).map(r => `${r.make_slug}/${r.model_slug}`),
      ...(complaintSlugs || []).map(c => `${c.make_slug}/${c.model_slug}`),
    ]);
    const orphanIds = (allModels || [])
      .filter(m => !hasData.has(`${m.make_slug}/${m.model_slug}`))
      .map(m => m.id);
    if (orphanIds.length > 0) {
      // Delete in batches of 100
      for (let i = 0; i < orphanIds.length; i += 100) {
        await db.from("nhtsa_models").delete().in("id", orphanIds.slice(i, i + 100));
      }
      console.log(`  Cleaned up ${orphanIds.length} zero-data models`);
    }
  } catch (err) {
    console.error(`  Model cleanup failed: ${err.message}`);
  }

  // Get actual DB totals for the summary (includes previously stored data)
  let dbModels = totalModels, dbRecalls = totalRecalls;
  try {
    const { data: mc } = await db.from("nhtsa_models").select("id", { count: "exact", head: true });
    const { data: rc } = await db.from("nhtsa_recalls").select("id", { count: "exact", head: true });
    // Supabase returns count in the response headers when using head:true + count:exact
    // Fallback to our run totals
  } catch {}
  try {
    const { count: mCount } = await db.from("nhtsa_models").select("*", { count: "exact", head: true });
    const { count: rCount } = await db.from("nhtsa_recalls").select("*", { count: "exact", head: true });
    if (mCount) dbModels = mCount;
    if (rCount) dbRecalls = rCount;
  } catch {}

  const status = errors.length > 0 ? "partial" : "completed";

  const summary = [
    `*NHTSA Pipeline ${status === "completed" ? "Complete" : "Partial"}* (${elapsed} min)`,
    `Brands: ${makesToProcess.length} | Models: ${totalModels} new | Recalls: ${totalRecalls} new`,
    `DB totals: ${dbModels} models, ${dbRecalls} recalls`,
    errors.length > 0 ? `Errors: ${errors.map((e) => e.make).join(", ")}` : "All brands OK",
  ].join("\n");

  console.log(`\n${summary}`);

  // Log to job_runs for Project Dash
  try {
    await db.from("job_runs").insert({
      job_name: "nhtsa-pipeline",
      status,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_sec: Math.round(elapsedSec),
      summary: {
        brands_processed: makesToProcess.length,
        models_upserted: totalModels,
        recalls_upserted: totalRecalls,
        db_total_models: dbModels,
        db_total_recalls: dbRecalls,
        errors: errors.map((e) => ({ make: e.make, error: e.error })),
      },
      error_message: errors.length > 0 ? errors.map((e) => `${e.make}: ${e.error}`).join("; ") : null,
    });
  } catch (err) {
    console.error(`Failed to log job run: ${err.message}`);
  }

  await sendTelegram(summary);
}

main().catch(async (err) => {
  console.error(`Pipeline fatal: ${err}`);
  // Log failure to job_runs
  try {
    await db.from("job_runs").insert({
      job_name: "nhtsa-pipeline",
      status: "failed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_sec: 0,
      error_message: String(err),
    });
    await sendTelegram(`*NHTSA Pipeline FAILED*\n${err.message}`);
  } catch {}
  process.exit(1);
});
