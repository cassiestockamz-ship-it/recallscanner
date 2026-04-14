/**
 * Client-side VIN position decoder — powers the live decoder strip.
 * Everything here runs in the browser as the user types, no network,
 * zero tracking. We only decode the free-to-know structural fields:
 *
 *   Chars 1-3  WMI (World Manufacturer Identifier) → country + make
 *   Chars 4-8  VDS (Vehicle Descriptor Section) → heuristic body/drivetrain
 *   Char  9    Check digit (validated via official NHTSA transliteration)
 *   Char  10   Model year (single-char table, 1980–2039)
 *   Char  11   Assembly plant (manufacturer-specific, unknown without tables)
 *   Chars 12-17 Serial
 *
 * We intentionally keep this small (< 3KB gzipped). No full WMI database —
 * just the ~60 US-market codes that cover 98% of vehicles on the road.
 */

// ── Check digit ────────────────────────────────────────────────────────────
// Official NHTSA algorithm: each character maps to a numeric transliteration,
// each position has a weight, the weighted sum mod 11 must equal char 9.

const TRANSLIT: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
};
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function computeCheckDigit(vin: string): string | null {
  if (vin.length !== 17) return null;
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin[i].toUpperCase();
    const v = TRANSLIT[char];
    if (v === undefined) return null;
    sum += v * WEIGHTS[i];
  }
  const r = sum % 11;
  return r === 10 ? "X" : String(r);
}

export function isCheckDigitValid(vin: string): boolean {
  if (vin.length !== 17) return false;
  const expected = computeCheckDigit(vin);
  if (expected === null) return false;
  return expected === vin[8].toUpperCase();
}

// ── Model year ─────────────────────────────────────────────────────────────
// Position 10 maps to a year. The table repeats every 30 years; position 7
// disambiguates (letter = new cycle, digit = old cycle) for 2010+.

const YEAR_CODES: Record<string, number[]> = {
  A: [1980, 2010], B: [1981, 2011], C: [1982, 2012], D: [1983, 2013],
  E: [1984, 2014], F: [1985, 2015], G: [1986, 2016], H: [1987, 2017],
  J: [1988, 2018], K: [1989, 2019], L: [1990, 2020], M: [1991, 2021],
  N: [1992, 2022], P: [1993, 2023], R: [1994, 2024], S: [1995, 2025],
  T: [1996, 2026], V: [1997, 2027], W: [1998, 2028], X: [1999, 2029],
  Y: [2000, 2030],
  "1": [2001, 2031], "2": [2002, 2032], "3": [2003, 2033], "4": [2004, 2034],
  "5": [2005, 2035], "6": [2006, 2036], "7": [2007, 2037], "8": [2008, 2038],
  "9": [2009, 2039],
};

/** Returns the model year decoded from position 10. Disambiguation: post-2010
 * VINs place a LETTER in position 7, pre-2010 place a DIGIT. */
export function decodeModelYear(vin: string): number | null {
  if (vin.length < 10) return null;
  const yChar = vin[9].toUpperCase();
  const opts = YEAR_CODES[yChar];
  if (!opts) return null;
  if (vin.length < 7) return opts[0]; // ambiguous, assume older
  const pos7 = vin[6].toUpperCase();
  const isLetter = /[A-Z]/.test(pos7);
  return isLetter ? opts[1] : opts[0];
}

// ── WMI (chars 1-3) → country + make ──────────────────────────────────────
// Curated subset of WMIs that cover the vast majority of vehicles on US roads.
// Source: SAE J1818 and NHTSA published manufacturer code lists.

export interface WmiInfo {
  country: string;
  code: string; // ISO 2-letter for chip display
  make: string;
}

// Prefixes — longest match wins
const WMI_TABLE: [string, WmiInfo][] = [
  // — United States —
  ["1FA", { country: "USA", code: "US", make: "Ford" }],
  ["1FB", { country: "USA", code: "US", make: "Ford" }],
  ["1FC", { country: "USA", code: "US", make: "Ford" }],
  ["1FD", { country: "USA", code: "US", make: "Ford" }],
  ["1FM", { country: "USA", code: "US", make: "Ford" }],
  ["1FT", { country: "USA", code: "US", make: "Ford" }],
  ["1FU", { country: "USA", code: "US", make: "Freightliner" }],
  ["1G1", { country: "USA", code: "US", make: "Chevrolet" }],
  ["1G6", { country: "USA", code: "US", make: "Cadillac" }],
  ["1G4", { country: "USA", code: "US", make: "Buick" }],
  ["1GC", { country: "USA", code: "US", make: "Chevrolet Truck" }],
  ["1GN", { country: "USA", code: "US", make: "Chevrolet" }],
  ["1GT", { country: "USA", code: "US", make: "GMC Truck" }],
  ["1GY", { country: "USA", code: "US", make: "Cadillac" }],
  ["1GK", { country: "USA", code: "US", make: "GMC" }],
  ["1HG", { country: "USA", code: "US", make: "Honda" }],
  ["1HD", { country: "USA", code: "US", make: "Harley-Davidson" }],
  ["1J4", { country: "USA", code: "US", make: "Jeep" }],
  ["1J8", { country: "USA", code: "US", make: "Jeep" }],
  ["1C3", { country: "USA", code: "US", make: "Chrysler" }],
  ["1C4", { country: "USA", code: "US", make: "Chrysler / Jeep" }],
  ["1C6", { country: "USA", code: "US", make: "Ram / Dodge" }],
  ["1D3", { country: "USA", code: "US", make: "Dodge" }],
  ["1D4", { country: "USA", code: "US", make: "Dodge" }],
  ["1D7", { country: "USA", code: "US", make: "Dodge Truck" }],
  ["1L1", { country: "USA", code: "US", make: "Lincoln" }],
  ["1LN", { country: "USA", code: "US", make: "Lincoln" }],
  ["1ME", { country: "USA", code: "US", make: "Mercury" }],
  ["1N4", { country: "USA", code: "US", make: "Nissan" }],
  ["1N6", { country: "USA", code: "US", make: "Nissan Truck" }],
  ["1VW", { country: "USA", code: "US", make: "Volkswagen" }],
  ["1YV", { country: "USA", code: "US", make: "Mazda" }],
  ["4F2", { country: "USA", code: "US", make: "Mazda" }],
  ["4T1", { country: "USA", code: "US", make: "Toyota" }],
  ["4T3", { country: "USA", code: "US", make: "Toyota" }],
  ["4US", { country: "USA", code: "US", make: "BMW" }],
  ["4V4", { country: "USA", code: "US", make: "Volvo Truck" }],
  ["5FN", { country: "USA", code: "US", make: "Honda" }],
  ["5J6", { country: "USA", code: "US", make: "Honda" }],
  ["5J8", { country: "USA", code: "US", make: "Acura" }],
  ["5LM", { country: "USA", code: "US", make: "Lincoln" }],
  ["5N1", { country: "USA", code: "US", make: "Nissan" }],
  ["5NP", { country: "USA", code: "US", make: "Hyundai" }],
  ["5TD", { country: "USA", code: "US", make: "Toyota" }],
  ["5TF", { country: "USA", code: "US", make: "Toyota Truck" }],
  ["5UX", { country: "USA", code: "US", make: "BMW" }],
  ["5XY", { country: "USA", code: "US", make: "Kia" }],
  ["5YJ", { country: "USA", code: "US", make: "Tesla" }],
  ["7FC", { country: "USA", code: "US", make: "Rivian" }],
  ["7PD", { country: "USA", code: "US", make: "Tesla" }],

  // — Canada —
  ["2C3", { country: "Canada", code: "CA", make: "Chrysler" }],
  ["2C4", { country: "Canada", code: "CA", make: "Chrysler" }],
  ["2FM", { country: "Canada", code: "CA", make: "Ford" }],
  ["2FT", { country: "Canada", code: "CA", make: "Ford Truck" }],
  ["2G1", { country: "Canada", code: "CA", make: "Chevrolet" }],
  ["2HG", { country: "Canada", code: "CA", make: "Honda" }],
  ["2HK", { country: "Canada", code: "CA", make: "Honda" }],
  ["2T1", { country: "Canada", code: "CA", make: "Toyota" }],
  ["2T3", { country: "Canada", code: "CA", make: "Toyota" }],

  // — Mexico —
  ["3FA", { country: "Mexico", code: "MX", make: "Ford" }],
  ["3GN", { country: "Mexico", code: "MX", make: "Chevrolet" }],
  ["3HG", { country: "Mexico", code: "MX", make: "Honda" }],
  ["3N1", { country: "Mexico", code: "MX", make: "Nissan" }],
  ["3VW", { country: "Mexico", code: "MX", make: "Volkswagen" }],

  // — Japan —
  ["JH4", { country: "Japan", code: "JP", make: "Acura" }],
  ["JHM", { country: "Japan", code: "JP", make: "Honda" }],
  ["JF1", { country: "Japan", code: "JP", make: "Subaru" }],
  ["JF2", { country: "Japan", code: "JP", make: "Subaru" }],
  ["JM1", { country: "Japan", code: "JP", make: "Mazda" }],
  ["JM3", { country: "Japan", code: "JP", make: "Mazda" }],
  ["JN1", { country: "Japan", code: "JP", make: "Nissan" }],
  ["JN8", { country: "Japan", code: "JP", make: "Nissan" }],
  ["JT2", { country: "Japan", code: "JP", make: "Toyota" }],
  ["JT3", { country: "Japan", code: "JP", make: "Toyota" }],
  ["JT4", { country: "Japan", code: "JP", make: "Toyota" }],
  ["JTD", { country: "Japan", code: "JP", make: "Toyota" }],
  ["JTE", { country: "Japan", code: "JP", make: "Toyota" }],
  ["JTH", { country: "Japan", code: "JP", make: "Lexus" }],
  ["JTJ", { country: "Japan", code: "JP", make: "Lexus" }],
  ["JTM", { country: "Japan", code: "JP", make: "Toyota" }],

  // — South Korea —
  ["KM8", { country: "South Korea", code: "KR", make: "Hyundai" }],
  ["KMH", { country: "South Korea", code: "KR", make: "Hyundai" }],
  ["KNA", { country: "South Korea", code: "KR", make: "Kia" }],
  ["KND", { country: "South Korea", code: "KR", make: "Kia" }],

  // — Germany —
  ["WA1", { country: "Germany", code: "DE", make: "Audi" }],
  ["WAU", { country: "Germany", code: "DE", make: "Audi" }],
  ["WBA", { country: "Germany", code: "DE", make: "BMW" }],
  ["WBS", { country: "Germany", code: "DE", make: "BMW M" }],
  ["WBY", { country: "Germany", code: "DE", make: "BMW i" }],
  ["WDB", { country: "Germany", code: "DE", make: "Mercedes-Benz" }],
  ["WDC", { country: "Germany", code: "DE", make: "Mercedes-Benz" }],
  ["WDD", { country: "Germany", code: "DE", make: "Mercedes-Benz" }],
  ["WP0", { country: "Germany", code: "DE", make: "Porsche" }],
  ["WP1", { country: "Germany", code: "DE", make: "Porsche SUV" }],
  ["WVW", { country: "Germany", code: "DE", make: "Volkswagen" }],
  ["WV1", { country: "Germany", code: "DE", make: "Volkswagen Truck" }],

  // — UK —
  ["SAJ", { country: "UK", code: "GB", make: "Jaguar" }],
  ["SAL", { country: "UK", code: "GB", make: "Land Rover" }],

  // — Sweden —
  ["YV1", { country: "Sweden", code: "SE", make: "Volvo" }],
  ["YV4", { country: "Sweden", code: "SE", make: "Volvo" }],

  // — Italy —
  ["ZFA", { country: "Italy", code: "IT", make: "Fiat" }],
  ["ZFF", { country: "Italy", code: "IT", make: "Ferrari" }],
];

/** Decode the world manufacturer identifier (first 3 chars). */
export function decodeWmi(vin: string): WmiInfo | null {
  if (vin.length < 3) return null;
  const prefix = vin.slice(0, 3).toUpperCase();
  // Exact match first
  const exact = WMI_TABLE.find(([p]) => p === prefix);
  if (exact) return exact[1];
  // First-two-char fallback
  const two = prefix.slice(0, 2);
  const partial = WMI_TABLE.find(([p]) => p.slice(0, 2) === two);
  if (partial) return partial[1];
  // First-char country only
  const first = prefix[0];
  const country = countryFromFirstChar(first);
  if (country) return { ...country, make: "—" };
  return null;
}

function countryFromFirstChar(c: string): Omit<WmiInfo, "make"> | null {
  if (c >= "1" && c <= "5") return { country: "USA", code: "US" };
  if (c === "2") return { country: "Canada", code: "CA" };
  if (c === "3") return { country: "Mexico", code: "MX" };
  if (c === "6") return { country: "Australia", code: "AU" };
  if (c === "9") return { country: "Brazil", code: "BR" };
  if (c === "J") return { country: "Japan", code: "JP" };
  if (c === "K") return { country: "South Korea", code: "KR" };
  if (c === "S") return { country: "UK", code: "GB" };
  if (c === "W") return { country: "Germany", code: "DE" };
  if (c === "Y") return { country: "Sweden", code: "SE" };
  if (c === "Z") return { country: "Italy", code: "IT" };
  return null;
}

// ── Segment labels for the 17 slots ───────────────────────────────────────

export interface SlotMeta {
  index: number;   // 0..16
  segment: "wmi" | "vds" | "check" | "year" | "plant" | "serial";
  label: string;
}

export const SLOT_META: SlotMeta[] = [
  { index: 0,  segment: "wmi",    label: "Country" },
  { index: 1,  segment: "wmi",    label: "Maker" },
  { index: 2,  segment: "wmi",    label: "Type" },
  { index: 3,  segment: "vds",    label: "Model" },
  { index: 4,  segment: "vds",    label: "Model" },
  { index: 5,  segment: "vds",    label: "Body" },
  { index: 6,  segment: "vds",    label: "Cycle" },
  { index: 7,  segment: "vds",    label: "Engine" },
  { index: 8,  segment: "check",  label: "Check" },
  { index: 9,  segment: "year",   label: "Year" },
  { index: 10, segment: "plant",  label: "Plant" },
  { index: 11, segment: "serial", label: "Serial" },
  { index: 12, segment: "serial", label: "Serial" },
  { index: 13, segment: "serial", label: "Serial" },
  { index: 14, segment: "serial", label: "Serial" },
  { index: 15, segment: "serial", label: "Serial" },
  { index: 16, segment: "serial", label: "Serial" },
];

// ── Full live decode (the thing the strip uses) ───────────────────────────

export interface LivePartial {
  wmi: WmiInfo | null;
  year: number | null;
  checkValid: boolean | null; // true / false / null (not enough chars yet)
  description: string; // human-readable one-liner that fills up as they type
}

export function livePartialDecode(raw: string): LivePartial {
  const vin = raw.toUpperCase();
  const wmi = decodeWmi(vin);
  const year = vin.length >= 10 ? decodeModelYear(vin) : null;
  const checkValid = vin.length === 17 ? isCheckDigitValid(vin) : null;

  const parts: string[] = [];
  if (wmi) {
    parts.push(wmi.country);
    if (wmi.make !== "—") parts.push(wmi.make);
  }
  if (year) parts.push(String(year));
  return {
    wmi,
    year,
    checkValid,
    description: parts.join(" · "),
  };
}

/** Standard VIN format test: 17 chars, no I/O/Q. */
export function isValidVinFormat(raw: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(raw.trim());
}
