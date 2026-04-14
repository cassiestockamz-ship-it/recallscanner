/**
 * The severity engine — turns raw NHTSA recall data into the product:
 *   tier:  'crit' | 'watch' | 'clear'
 *   score: 0–100 RecallScore
 *   badges: human-readable tags (DO NOT DRIVE / PARK OUTSIDE / FIRE RISK / …)
 *   icon:   Lucide icon name (server-safe — caller renders the component)
 *   hook:   one-line plain-English rewrite of NHTSA's consequence text
 *
 * No LLM calls at render time. Pure functions, pure heuristics. Deterministic.
 */

import type { Recall, Complaint } from "./nhtsa";
import type { ModelReliability } from "./db";

export type Tier = "crit" | "watch" | "clear";

export interface RecallSeverity {
  tier: Tier;
  score: number; // 0–100
  badges: string[];
  category: RecallCategory;
  icon: IconName;
  hook: string; // one-line plain-English
}

// ── Categories ─────────────────────────────────────────────────────────────
export type RecallCategory =
  | "airbag"
  | "brakes"
  | "electrical"
  | "engine"
  | "steering"
  | "fuel"
  | "seatbelt"
  | "software"
  | "lighting"
  | "suspension"
  | "tires"
  | "body"
  | "other";

export type IconName =
  | "shield-alert"
  | "disc-3"
  | "zap"
  | "cog"
  | "navigation"
  | "fuel"
  | "seat"
  | "cpu"
  | "lightbulb"
  | "wrench"
  | "circle-dot"
  | "car-front"
  | "alert-triangle";

export const CATEGORY_LABELS: Record<RecallCategory, string> = {
  airbag: "Airbag",
  brakes: "Brakes",
  electrical: "Electrical",
  engine: "Engine",
  steering: "Steering",
  fuel: "Fuel System",
  seatbelt: "Seat Belts",
  software: "Software",
  lighting: "Lighting",
  suspension: "Suspension",
  tires: "Tires",
  body: "Body",
  other: "Other",
};

export const CATEGORY_ICONS: Record<RecallCategory, IconName> = {
  airbag: "shield-alert",
  brakes: "disc-3",
  electrical: "zap",
  engine: "cog",
  steering: "navigation",
  fuel: "fuel",
  seatbelt: "seat",
  software: "cpu",
  lighting: "lightbulb",
  suspension: "wrench",
  tires: "circle-dot",
  body: "car-front",
  other: "alert-triangle",
};

export function categorize(component: string): RecallCategory {
  const c = (component || "").toUpperCase();
  if (c.includes("AIR BAG") || c.includes("AIRBAG")) return "airbag";
  if (c.includes("BRAKE")) return "brakes";
  if (c.includes("STEERING")) return "steering";
  if (c.includes("FUEL")) return "fuel";
  if (c.includes("SEAT BELT") || c.includes("SEATBELT")) return "seatbelt";
  if (c.includes("SOFTWARE") || c.includes("CAMERA") || c.includes("SENSOR")) return "software";
  if (c.includes("LIGHT") || c.includes("LAMP") || c.includes("HEADLAMP")) return "lighting";
  if (c.includes("SUSPENSION")) return "suspension";
  if (c.includes("TIRE") || c.includes("WHEEL")) return "tires";
  if (c.includes("EXTERIOR") || c.includes("BODY") || c.includes("STRUCTURE")) return "body";
  if (c.includes("ELECTRICAL") || c.includes("WIRING") || c.includes("BATTERY") || c.includes("POWERTRAIN")) return "electrical";
  if (c.includes("ENGINE") || c.includes("STARTER") || c.includes("TRANSMISSION")) return "engine";
  return "other";
}

// ── Severity keyword detection ─────────────────────────────────────────────

const DO_NOT_DRIVE_PATTERNS = [
  /do\s*not\s*drive/i,
  /stop\s*driving/i,
  /immediately\s*stop/i,
  /park[- ]?outside/i,
  /urgent/i,
];

const PARK_OUTSIDE_PATTERNS = [
  /park\s*outside/i,
  /park.*away\s*from/i,
  /away\s*from\s*structures/i,
];

const FIRE_PATTERNS = [
  /\bfire\b/i,
  /\bburn\b/i,
  /\bflame\b/i,
  /ignite/i,
  /smoke/i,
  /thermal/i,
];

const CRASH_PATTERNS = [
  /crash/i,
  /collision/i,
  /loss\s*of\s*control/i,
  /stall/i,
  /loss\s*of\s*power/i,
  /roll\s*away/i,
  /seize/i,
  /separation/i,
  /detach/i,
];

const INJURY_PATTERNS = [
  /injur/i,
  /fatal/i,
  /\bdeath\b/i,
  /killed/i,
];

interface SeverityFlags {
  doNotDrive: boolean;
  parkOutside: boolean;
  fireRisk: boolean;
  crashRisk: boolean;
  injuryLanguage: boolean;
}

function detectFlags(r: Recall): SeverityFlags {
  const haystack = `${r.Notes ?? ""} ${r.Consequence ?? ""} ${r.Summary ?? ""}`;
  return {
    doNotDrive: DO_NOT_DRIVE_PATTERNS.some((p) => p.test(haystack)),
    parkOutside: PARK_OUTSIDE_PATTERNS.some((p) => p.test(haystack)),
    fireRisk: FIRE_PATTERNS.some((p) => p.test(haystack)),
    crashRisk: CRASH_PATTERNS.some((p) => p.test(haystack)),
    injuryLanguage: INJURY_PATTERNS.some((p) => p.test(haystack)),
  };
}

// ── Per-recall severity ────────────────────────────────────────────────────

export function scoreRecall(r: Recall): RecallSeverity {
  const flags = detectFlags(r);
  const category = categorize(r.Component);
  const icon = CATEGORY_ICONS[category];

  // Base 0-100 score
  let score = 30;
  if (flags.crashRisk) score += 20;
  if (flags.fireRisk) score += 15;
  if (flags.injuryLanguage) score += 15;
  if (flags.parkOutside) score += 10;
  if (flags.doNotDrive) score += 25;
  if (category === "airbag") score += 10;
  if (category === "brakes") score += 10;
  if (category === "steering") score += 8;
  if (category === "fuel") score += 8;
  score = Math.max(0, Math.min(100, score));

  // Tier
  let tier: Tier = "clear";
  if (flags.doNotDrive || score >= 70) tier = "crit";
  else if (flags.fireRisk || flags.injuryLanguage || flags.crashRisk || score >= 45) tier = "watch";

  // Badges
  const badges: string[] = [];
  if (flags.doNotDrive) badges.push("DO NOT DRIVE");
  if (flags.parkOutside) badges.push("PARK OUTSIDE");
  if (flags.fireRisk) badges.push("FIRE RISK");
  if (flags.crashRisk && !flags.doNotDrive) badges.push("CRASH RISK");

  // Prefer the cached AI-generated hook from Supabase (written by the
  // translate-recalls batch script and the daily VPS ingest pipeline).
  // Fall back to the rule-based regex rewrite of NHTSA's consequence text
  // when no cached hook exists (e.g. brand-new recalls not yet translated).
  const cached = r.PlainEnglishHook?.trim();
  return {
    tier,
    score,
    badges,
    category,
    icon,
    hook: cached && cached.length > 5 ? cached : writeHook(r, category, flags),
  };
}

// ── Plain-English hook writer ──────────────────────────────────────────────
// Strip NHTSA's formal "may cause" / "can result in" phrasing and keep the meat.
// Pure text munging — no network, no model.

function writeHook(r: Recall, category: RecallCategory, flags: SeverityFlags): string {
  const consequence = (r.Consequence || "").trim();
  const summary = (r.Summary || "").trim();
  const source = consequence || summary;
  if (!source) return categoryFallbackHook(category);

  // First sentence
  let first = source.split(/(?<=[.!])\s+/)[0];
  // Drop "This defect / problem / condition" preambles
  first = first
    .replace(/^this\s+(defect|issue|problem|condition|situation)\s+/i, "")
    .replace(/^as\s+a\s+result[,]?\s+/i, "")
    .replace(/\bnhtsa\s+campaign\s+number\s+\S+\s*/i, "")
    .trim();

  // Collapse "the ... may/can/could" → "can"
  first = first.replace(/\s+may\s+cause\b/gi, " can cause");
  first = first.replace(/\s+could\s+result\s+in\b/gi, " can cause");
  first = first.replace(/\s+may\s+result\s+in\b/gi, " can cause");

  // Ensure capitalised and ends with a period
  if (first.length > 0) {
    first = first.charAt(0).toUpperCase() + first.slice(1);
    if (!/[.!]$/.test(first)) first += ".";
  }

  // If we stripped everything or it's still too long, fall back
  if (first.length < 15 || first.length > 220) return categoryFallbackHook(category);
  // Nudge towards urgency if DO-NOT-DRIVE
  if (flags.doNotDrive && !/do\s*not\s*drive/i.test(first)) {
    first = `Do not drive. ${first}`;
  }
  return first;
}

function categoryFallbackHook(cat: RecallCategory): string {
  switch (cat) {
    case "airbag":     return "Airbag or restraint system may not deploy correctly in a crash.";
    case "brakes":     return "Brake performance may be reduced, increasing stopping distance.";
    case "electrical": return "An electrical fault could disable key systems or start a fire.";
    case "engine":     return "The engine or drivetrain could stall or lose power unexpectedly.";
    case "steering":   return "Steering control could be reduced, increasing crash risk.";
    case "fuel":       return "A fuel leak or delivery fault could cause a stall or a fire.";
    case "seatbelt":   return "Seat belt may not restrain occupants correctly in a crash.";
    case "software":   return "A software defect could cause unexpected behavior while driving.";
    case "lighting":   return "Exterior lighting may not illuminate as required.";
    case "suspension": return "Suspension component could fail and affect vehicle control.";
    case "tires":      return "Tire or wheel component could fail and cause loss of control.";
    case "body":       return "A body component could detach or fail unexpectedly.";
    case "other":      return "This safety campaign may affect your vehicle.";
  }
}

// ── Aggregate (fleet-level) scoring ────────────────────────────────────────
// For a vehicle with N recalls, or a brand/model page header.

export interface VerdictResult {
  tier: Tier;
  label: string; // "ALL CLEAR" / "WATCH" / "ACTION NEEDED"
  sub: string;
  score: number; // 0-100 aggregate
  counts: {
    total: number;
    crit: number;
    watch: number;
    clear: number;
    fireRisk: number;
    crashRisk: number;
    doNotDrive: number;
  };
  topRecall?: Recall & { severity: RecallSeverity };
}

export function verdict(recalls: Recall[]): VerdictResult {
  if (recalls.length === 0) {
    return {
      tier: "clear",
      label: "ALL CLEAR",
      sub: "No open safety recalls found in the NHTSA database.",
      score: 0,
      counts: { total: 0, crit: 0, watch: 0, clear: 0, fireRisk: 0, crashRisk: 0, doNotDrive: 0 },
    };
  }

  const scored = recalls.map((r) => ({ ...r, severity: scoreRecall(r) }));
  scored.sort((a, b) => b.severity.score - a.severity.score);

  const counts = {
    total: scored.length,
    crit: scored.filter((r) => r.severity.tier === "crit").length,
    watch: scored.filter((r) => r.severity.tier === "watch").length,
    clear: scored.filter((r) => r.severity.tier === "clear").length,
    fireRisk: scored.filter((r) => r.severity.badges.includes("FIRE RISK")).length,
    crashRisk: scored.filter((r) => r.severity.badges.includes("CRASH RISK")).length,
    doNotDrive: scored.filter((r) => r.severity.badges.includes("DO NOT DRIVE")).length,
  };

  const topScore = scored[0].severity.score;
  const score = Math.min(100, Math.round(topScore * 0.7 + scored.length * 3));

  let tier: Tier = "watch";
  let label = "WATCH";
  let sub = "";

  if (counts.crit > 0 || counts.doNotDrive > 0) {
    tier = "crit";
    label = "ACTION NEEDED";
    sub =
      counts.doNotDrive > 0
        ? `${counts.total} open recall${counts.total === 1 ? "" : "s"}. At least one is a Do-Not-Drive notice.`
        : `${counts.total} open recall${counts.total === 1 ? "" : "s"}. At least one is critical.`;
  } else if (counts.watch > 0) {
    tier = "watch";
    label = "WATCH";
    sub = `${counts.total} open recall${counts.total === 1 ? "" : "s"}. Schedule the free repair at your dealer.`;
  } else {
    tier = "clear";
    label = "NO URGENT RECALLS";
    sub = `${counts.total} open recall${counts.total === 1 ? "" : "s"}, none flagged critical. Schedule the free repair when convenient.`;
  }

  return { tier, label, sub, score, counts, topRecall: scored[0] };
}

// ── Model-level RecallScore ────────────────────────────────────────────────
// For display on model pages: weighted from recall severity, complaint volume,
// and serious-incident counts. Cached into Supabase eventually; computed
// inline for now.

export function modelRecallScore(
  recalls: Recall[],
  complaints: Complaint[],
  reliability: ModelReliability | null
): number {
  if (recalls.length === 0 && complaints.length === 0) return 0;
  const scored = recalls.map(scoreRecall);
  const maxSeverity = scored.reduce((m, s) => Math.max(m, s.score), 0);
  const avgSeverity = scored.length ? scored.reduce((s, x) => s + x.score, 0) / scored.length : 0;
  const crits = scored.filter((s) => s.tier === "crit").length;

  const inj = reliability?.injuries ?? 0;
  const deaths = reliability?.deaths ?? 0;
  const fires = reliability?.fires ?? 0;
  const crashes = reliability?.crashes ?? 0;

  const raw =
    maxSeverity * 0.3 +
    avgSeverity * 0.15 +
    crits * 4 +
    Math.min(inj, 50) * 0.6 +
    deaths * 8 +
    fires * 1.5 +
    Math.min(crashes, 50) * 0.4 +
    Math.min(recalls.length, 30) * 0.5;

  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function tierToLabel(t: Tier): string {
  return t === "crit" ? "Critical" : t === "watch" ? "Watch" : "Resolved";
}

/** Parse a "MM/DD/YYYY" or "DD/MM/YYYY" NHTSA date → JS Date */
export function parseRecallDate(raw: string): Date | null {
  if (!raw) return null;
  const parts = raw.split("/");
  if (parts.length !== 3) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  const [a, b, y] = parts.map((p) => parseInt(p, 10));
  if (isNaN(y)) return null;
  // If first > 12 it's DD/MM/YYYY, else assume MM/DD/YYYY
  const month = a > 12 ? b : a;
  const day = a > 12 ? a : b;
  const d = new Date(y, (month || 1) - 1, day || 1);
  return isNaN(d.getTime()) ? null : d;
}

export function daysSince(raw: string): number | null {
  const d = parseRecallDate(raw);
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
