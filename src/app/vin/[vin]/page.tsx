import Link from "next/link";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { decodeVin, getRecallsByVin, makeSlug, modelSlug } from "@/lib/nhtsa";
import type { Metadata } from "next";
import VinChecker from "@/components/VinChecker";
import SafetyVerdict from "@/components/SafetyVerdict";
import RecallCard from "@/components/RecallCard";
import { scoreRecall } from "@/lib/severity";

interface Props {
  params: Promise<{ vin: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vin } = await params;
  return {
    title: `VIN ${vin} · Recall Check`,
    description: `Recall check results for VIN ${vin}. Full safety verdict and all open NHTSA recalls.`,
    robots: { index: false, follow: true },
    alternates: { canonical: "https://www.recallscanner.com/vin" },
  };
}

function isValidVinFormat(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

export default async function VinPage({ params }: Props) {
  const { vin } = await params;
  const vinUpper = vin.toUpperCase();
  const validFormat = isValidVinFormat(vinUpper);

  const [decoded, recallResult] = validFormat
    ? await Promise.all([decodeVin(vinUpper), getRecallsByVin(vinUpper)])
    : [null, { recalls: [], apiError: false }];

  const recalls = recallResult.recalls;
  const apiError = recallResult.apiError;
  const vinRecognized = !!(decoded && decoded.Make);

  // Sort recalls by severity (highest first); SafetyVerdict shows the top one,
  // so we show everything except the top in the "Other Open Recalls" list.
  const sortedRecalls = [...recalls].sort(
    (a, b) => scoreRecall(b).score - scoreRecall(a).score
  );
  const remainingRecalls = sortedRecalls.slice(1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="text-[12px] text-slate-400 mb-6 font-medium">
        <Link href="/" className="hover:text-[var(--color-brand)]">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/vin" className="hover:text-[var(--color-brand)]">VIN Check</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Results</span>
      </nav>

      {/* ── Invalid format state ─────────────────────────────────── */}
      {!validFormat && (
        <InvalidState vin={vinUpper} />
      )}

      {/* ── Valid format but NHTSA couldn't decode ───────────────── */}
      {validFormat && !vinRecognized && !apiError && (
        <UnknownVinState vin={vinUpper} />
      )}

      {/* ── API error ────────────────────────────────────────────── */}
      {validFormat && apiError && (
        <ApiErrorState vin={vinUpper} />
      )}

      {/* ── Happy path: the Safety Verdict ───────────────────────── */}
      {validFormat && vinRecognized && !apiError && (
        <>
          <SafetyVerdict recalls={recalls} decoded={decoded} vin={vinUpper} />

          {/* Vehicle details — collapsed-ish */}
          {decoded && (
            <details className="mt-8 group">
              <summary className="cursor-pointer list-none flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-[var(--color-brand)] transition-colors">
                <span className="inline-block w-4 text-center transition-transform group-open:rotate-90">›</span>
                Full VIN decode ({decoded.Make} {decoded.Model} · {decoded.ModelYear})
              </summary>
              <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-white p-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[13px]">
                  {[
                    ["Year", decoded.ModelYear],
                    ["Make", decoded.Make],
                    ["Model", decoded.Model],
                    ["Body", decoded.BodyClass],
                    [
                      "Engine",
                      [
                        decoded.EngineCylinders ? `${decoded.EngineCylinders}cyl` : "",
                        decoded.DisplacementL ? `${decoded.DisplacementL}L` : "",
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined,
                    ],
                    ["Drive", decoded.DriveType],
                    ["Fuel", decoded.FuelTypePrimary],
                    ["Transmission", decoded.TransmissionStyle],
                    ["Assembly Plant", [decoded.PlantCity, decoded.PlantState].filter(Boolean).join(", ")],
                    ["Manufacturer", decoded.Manufacturer],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label as string}>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
                        <div className="font-medium text-slate-700">{value as string}</div>
                      </div>
                    ))}
                </div>
              </div>
            </details>
          )}

          {/* Remaining recalls */}
          {remainingRecalls.length > 0 && (
            <div className="mt-10">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-[20px] font-bold text-slate-900">Other Open Recalls</h2>
                <span className="text-[12px] text-slate-400">
                  {remainingRecalls.length} more
                </span>
              </div>
              <div className="space-y-3">
                {remainingRecalls.map((r, i) => (
                  <RecallCard key={r.NHTSACampaignNumber || i} recall={r} deferPaint={i > 2} />
                ))}
              </div>
            </div>
          )}

          {/* Clean report — no recalls path */}
          {recalls.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-6">
              <h2 className="text-[18px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[var(--color-clear)]" />
                What's Next?
              </h2>
              <ul className="text-[14px] text-slate-600 space-y-2 leading-relaxed">
                <li>Keep up with regular maintenance per your owner's manual.</li>
                <li>
                  <a
                    href="https://www.nhtsa.gov/recalls"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-brand)] hover:underline"
                  >
                    Sign up for NHTSA recall alerts
                  </a>{" "}
                  to hear about future campaigns.
                </li>
                {decoded && (
                  <li>
                    <Link
                      href={`/recalls/${makeSlug(decoded.Make)}${decoded.Model ? `/${modelSlug(decoded.Model)}` : ""}`}
                      className="text-[var(--color-brand)] hover:underline"
                    >
                      Browse historical {decoded.Make} {decoded.Model} recalls
                    </Link>{" "}
                    to see past campaigns for this model.
                  </li>
                )}
                <li>Check back periodically. New recalls land daily.</li>
              </ul>
            </div>
          )}
        </>
      )}

      {/* Cross-links */}
      <div className="mt-12 mb-6 text-center text-[13px] text-slate-500">
        <span className="font-semibold text-slate-700">Browse more recalls:</span>{" "}
        <Link href="/recalls/ford" className="text-[var(--color-brand)] hover:underline">Ford</Link>
        {" · "}
        <Link href="/recalls/toyota" className="text-[var(--color-brand)] hover:underline">Toyota</Link>
        {" · "}
        <Link href="/recalls/honda" className="text-[var(--color-brand)] hover:underline">Honda</Link>
        {" · "}
        <Link href="/recalls/chevrolet" className="text-[var(--color-brand)] hover:underline">Chevrolet</Link>
        {" · "}
        <Link href="/recalls" className="text-[var(--color-brand)] hover:underline">All brands</Link>
      </div>

      {/* Check another */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="text-[16px] font-bold text-slate-900 mb-3">Check Another Vehicle</h2>
        <VinChecker compact />
      </div>
    </div>
  );
}

// ── Sub-states ───────────────────────────────────────────────────

function InvalidState({ vin }: { vin: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-watch-ring)] bg-[var(--color-watch-soft)] p-6 mb-6">
      <div className="flex items-start gap-4">
        <AlertTriangle size={28} className="text-[var(--color-watch)] shrink-0 mt-1" />
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-watch-ink)] mb-2">
            That VIN doesn't look right
          </h1>
          <p className="text-[14px] text-slate-600 leading-relaxed mb-3">
            <span className="font-mono font-medium">{vin}</span> isn't a valid 17-character VIN.
            VINs are always exactly 17 characters and never contain <span className="font-mono">I</span>,{" "}
            <span className="font-mono">O</span>, or <span className="font-mono">Q</span> (to avoid confusion with <span className="font-mono">1</span> and <span className="font-mono">0</span>).
          </p>
          <div className="text-[13px] text-slate-500 leading-relaxed">
            You can find your VIN on:
            <ul className="list-disc pl-5 mt-1">
              <li>The lower-left corner of the windshield, visible from outside</li>
              <li>The driver's-side door jamb sticker</li>
              <li>Your registration card or insurance policy</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-5 pt-5 border-t border-[var(--color-watch-ring)]">
        <VinChecker compact autoFocus />
      </div>
    </div>
  );
}

function UnknownVinState({ vin }: { vin: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-watch-ring)] bg-[var(--color-watch-soft)] p-6 mb-6">
      <div className="flex items-start gap-4">
        <Info size={28} className="text-[var(--color-watch)] shrink-0 mt-1" />
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-watch-ink)] mb-2">
            NHTSA couldn't decode this VIN
          </h1>
          <p className="text-[14px] text-slate-600 leading-relaxed">
            The format of <span className="font-mono font-medium">{vin}</span> looks right, but NHTSA's
            database didn't recognize it. This usually means the vehicle is very old, was imported from outside
            North America, or there's a typo somewhere in the string. Double-check every character and try again.
          </p>
        </div>
      </div>
      <div className="mt-5 pt-5 border-t border-[var(--color-watch-ring)]">
        <VinChecker compact autoFocus />
      </div>
    </div>
  );
}

function ApiErrorState({ vin }: { vin: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-watch-ring)] bg-[var(--color-watch-soft)] p-6 mb-6">
      <div className="flex items-start gap-4">
        <AlertTriangle size={28} className="text-[var(--color-watch)] shrink-0 mt-1" />
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-watch-ink)] mb-2">
            NHTSA is temporarily unavailable
          </h1>
          <p className="text-[14px] text-slate-600 leading-relaxed">
            We couldn't reach the NHTSA recall database to check <span className="font-mono font-medium">{vin}</span>.
            This does <strong>not</strong> mean your vehicle has no recalls. We just can't confirm right now.
            Try again in a few minutes, or check directly at{" "}
            <a
              href="https://www.nhtsa.gov/recalls"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-brand)] underline"
            >
              nhtsa.gov/recalls
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
