#!/usr/bin/env node
// Resubmit recallscanner sitemap and inspect URLs flagged in GSC.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tokensPath = path.join(os.homedir(), ".claude/tokens.env");
const env = Object.fromEntries(
  fs.readFileSync(tokensPath, "utf8").split("\n")
    .map((l) => l.replace(/^export\s+/, "").match(/^([A-Z_][A-Z0-9_]*)=(.*)$/))
    .filter(Boolean).map((m) => [m[1], m[2].replace(/^"|"$/g, "")])
);

const SITE_URL = "sc-domain:recallscanner.com";
const SITEMAP_URL = "https://www.recallscanner.com/sitemap.xml";

async function getAccessToken() {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  return (await r.json()).access_token;
}

async function resubmitSitemap(token) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps/${encodeURIComponent(SITEMAP_URL)}`;
  const r = await fetch(url, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
  return { status: r.status, body: await r.text() };
}

async function inspectUrl(token, inspectionUrl) {
  const r = await fetch(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inspectionUrl, siteUrl: SITE_URL }),
    }
  );
  return await r.json();
}

async function main() {
  const token = await getAccessToken();

  console.log("Resubmitting sitemap...");
  const sm = await resubmitSitemap(token);
  console.log("  ->", sm.status, sm.body || "(empty)");

  const samples = [
    "https://www.recallscanner.com/",
    "https://www.recallscanner.com/recalls",
    "https://www.recallscanner.com/recalls/ford",
    "https://www.recallscanner.com/recalls/ford/f-150",
    "https://www.recallscanner.com/vin",
  ];
  for (const u of samples) {
    console.log("\n== INSPECT", u);
    const r = await inspectUrl(token, u);
    if (r.error) { console.log("  ERROR:", JSON.stringify(r.error)); continue; }
    const idx = r.inspectionResult?.indexStatusResult || {};
    console.log("  verdict:", idx.verdict);
    console.log("  coverageState:", idx.coverageState);
    console.log("  pageFetchState:", idx.pageFetchState);
    console.log("  lastCrawlTime:", idx.lastCrawlTime);
    console.log("  googleCanonical:", idx.googleCanonical);
    console.log("  userCanonical:", idx.userCanonical);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
