#!/usr/bin/env node
// Full GSC audit: inspection API for all non-indexed URLs, performance data, sitemap status
import https from 'node:https';
import querystring from 'node:querystring';

const SITE = 'sc-domain:recallscanner.com';
const SITE_URL = 'https://www.recallscanner.com/';

async function getToken() {
  const body = querystring.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data).access_token); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function gscPost(token, path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'searchconsole.googleapis.com',
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function gscGet(token, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'searchconsole.googleapis.com',
      path,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

const token = await getToken();
const today = new Date().toISOString().split('T')[0];
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

console.log('='.repeat(70));
console.log(`GSC AUDIT: ${SITE}`);
console.log(`Range: ${monthAgo} -> ${today}`);
console.log('='.repeat(70));

// 1. Overall performance
console.log('\n## 1. OVERALL PERFORMANCE (last 30 days)');
const perfOverall = await gscPost(token,
  `/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
  { startDate: monthAgo, endDate: today, dimensions: [], rowLimit: 1 });
if (perfOverall.body.rows?.[0]) {
  const r = perfOverall.body.rows[0];
  console.log(`  Clicks: ${r.clicks} | Impressions: ${r.impressions} | CTR: ${(r.ctr*100).toFixed(2)}% | Pos: ${r.position.toFixed(1)}`);
} else {
  console.log('  No data');
}

// 2. Top queries
console.log('\n## 2. TOP 15 QUERIES');
const topQueries = await gscPost(token,
  `/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
  { startDate: monthAgo, endDate: today, dimensions: ['query'], rowLimit: 15 });
(topQueries.body.rows || []).forEach(r => {
  console.log(`  ${r.clicks.toString().padStart(3)} clk / ${r.impressions.toString().padStart(5)} imp / pos ${r.position.toFixed(1).padStart(5)} - ${r.keys[0]}`);
});

// 3. Top pages
console.log('\n## 3. TOP 15 PAGES');
const topPages = await gscPost(token,
  `/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
  { startDate: monthAgo, endDate: today, dimensions: ['page'], rowLimit: 15 });
(topPages.body.rows || []).forEach(r => {
  console.log(`  ${r.clicks.toString().padStart(3)} clk / ${r.impressions.toString().padStart(5)} imp / pos ${r.position.toFixed(1).padStart(5)} - ${r.keys[0]}`);
});

// 4. Sitemap status
console.log('\n## 4. SITEMAP STATUS');
const sitemaps = await gscGet(token, `/webmasters/v3/sites/${encodeURIComponent(SITE)}/sitemaps`);
(sitemaps.body.sitemap || []).forEach(s => {
  console.log(`  ${s.path}`);
  console.log(`    Submitted: ${s.lastSubmitted} | Downloaded: ${s.lastDownloaded}`);
  console.log(`    Warnings: ${s.warnings || 0} | Errors: ${s.errors || 0}`);
  (s.contents || []).forEach(c => {
    console.log(`    ${c.type}: submitted ${c.submitted} / indexed ${c.indexed}`);
  });
});

// 5. URL Inspection on the 4 example 404 URLs
console.log('\n## 5. 404 URL INSPECTION');
const urlsToInspect = [
  'https://www.recallscanner.com/recalls/ford/f-150-super-crew',
  'https://www.recallscanner.com/recalls/lexus/rx-350',
  'https://www.recallscanner.com/recalls/dodge/challenger-srt-hellcat',
  'https://www.recallscanner.com/recalls/chevrolet/silverado-2500'
];
for (const url of urlsToInspect) {
  const insp = await gscPost(token, '/v1/urlInspection/index:inspect', {
    inspectionUrl: url,
    siteUrl: SITE
  });
  const result = insp.body?.inspectionResult?.indexStatusResult;
  if (result) {
    console.log(`  ${url}`);
    console.log(`    Verdict: ${result.verdict} | Coverage: ${result.coverageState}`);
    console.log(`    Robots: ${result.robotsTxtState} | Last crawled: ${result.lastCrawlTime}`);
    if (result.referringUrls) {
      console.log(`    Referring URLs (${result.referringUrls.length}):`);
      result.referringUrls.slice(0, 5).forEach(u => console.log(`      - ${u}`));
    }
  } else {
    console.log(`  ${url}: ${JSON.stringify(insp.body).slice(0, 200)}`);
  }
}

// 6. Query GSC for any query that returns a 404 URL
console.log('\n## 6. ALL UNIQUE PAGES (for 404 pattern analysis)');
const allPages = await gscPost(token,
  `/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
  { startDate: monthAgo, endDate: today, dimensions: ['page'], rowLimit: 500 });
const allUrls = (allPages.body.rows || []).map(r => r.keys[0]);
console.log(`  Total unique pages with impressions: ${allUrls.length}`);

// Sample /recalls/* paths to find others potentially 404
const modelUrls = allUrls.filter(u => /\/recalls\/[^/]+\/[^/]+$/.test(u));
console.log(`  Model-level pages: ${modelUrls.length}`);
console.log('\n  Sample model pages (first 10):');
modelUrls.slice(0, 10).forEach(u => console.log(`    ${u}`));
