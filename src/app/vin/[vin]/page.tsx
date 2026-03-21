import Link from "next/link";
import { decodeVin, getRecallsByVin, makeSlug, modelSlug, nhtsaRecallUrl } from "@/lib/nhtsa";
import type { Metadata } from "next";
import VinChecker from "@/components/VinChecker";

interface Props {
  params: Promise<{ vin: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vin } = await params;
  return {
    title: `VIN ${vin} Recall Check Results`,
    description: `Recall check results for VIN ${vin}. See all open safety recalls and what the manufacturer will fix for free.`,
    robots: { index: false, follow: true },
  };
}

function isValidVinFormat(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

export default async function VinPage({ params }: Props) {
  const { vin } = await params;
  const vinUpper = vin.toUpperCase();
  const validFormat = isValidVinFormat(vinUpper);

  const [decoded, recalls] = validFormat
    ? await Promise.all([decodeVin(vinUpper), getRecallsByVin(vinUpper)])
    : [null, []];

  const hasRecalls = recalls.length > 0;
  const vinRecognized = decoded && decoded.Make;
  const vehicleName = vinRecognized
    ? `${decoded.ModelYear} ${decoded.Make} ${decoded.Model}`.trim()
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/vin" className="hover:text-brand">VIN Check</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">Results</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Recall Results for VIN</h1>
      <p className="font-mono text-lg text-slate-500 tracking-wider mb-6">{vinUpper}</p>

      {/* Invalid VIN format */}
      {!validFormat && (
        <div className="rounded-lg p-6 mb-8 bg-warning-light border border-yellow-200">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-warning">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-bold text-lg text-warning">Invalid VIN Format</div>
              <div className="text-sm text-yellow-800">
                VINs must be exactly 17 characters and cannot contain I, O, or Q. Please double-check your VIN and try again.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Valid format but VIN not recognized by NHTSA */}
      {validFormat && !vinRecognized && (
        <div className="rounded-lg p-6 mb-8 bg-warning-light border border-yellow-200">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-warning">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-bold text-lg text-warning">VIN Not Recognized</div>
              <div className="text-sm text-yellow-800">
                NHTSA could not decode this VIN. It may be a non-US vehicle, a very old vehicle, or the VIN may be incorrect. Please verify and try again.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle info */}
      {vinRecognized && (
        <div className="bg-white border border-border rounded-lg p-5 mb-6">
          <h2 className="font-semibold text-lg mb-3">Vehicle Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              ["Year", decoded.ModelYear],
              ["Make", decoded.Make],
              ["Model", decoded.Model],
              ["Body", decoded.BodyClass],
              ["Engine", [decoded.EngineCylinders ? `${decoded.EngineCylinders}cyl` : "", decoded.DisplacementL ? `${decoded.DisplacementL}L` : ""].filter(Boolean).join(" ") || undefined],
              ["Drive", decoded.DriveType],
              ["Fuel", decoded.FuelTypePrimary],
              ["Transmission", decoded.TransmissionStyle],
              ["Manufacturer", decoded.Manufacturer],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label}>
                  <div className="text-slate-400 text-xs">{label}</div>
                  <div className="font-medium text-slate-700">{value}</div>
                </div>
              ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              href={`/recalls/${makeSlug(decoded.Make)}${decoded.Model ? `/${modelSlug(decoded.Model)}` : ""}`}
              className="text-sm text-brand hover:underline"
            >
              View all {decoded.Make} {decoded.Model} recalls &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Recall status banner — only show if VIN was recognized */}
      {vinRecognized && (
        <div
          className={`rounded-lg p-6 mb-8 ${
            hasRecalls
              ? "bg-danger-light border border-red-200"
              : "bg-safe-light border border-green-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {hasRecalls ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-danger">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-bold text-lg text-danger">
                    {recalls.length} Open Recall{recalls.length !== 1 ? "s" : ""} Found
                  </div>
                  <div className="text-sm text-red-700">
                    Your {vehicleName} has unresolved safety recalls. Contact your dealer for free repairs.
                  </div>
                </div>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-safe">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-bold text-lg text-safe">No Open Recalls Found</div>
                  <div className="text-sm text-green-700">
                    Your {vehicleName} has no unresolved safety recalls in the NHTSA database.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recall details */}
      {hasRecalls && (
        <div className="space-y-4 mb-12">
          <h2 className="text-xl font-bold">Recall Details</h2>
          {recalls.map((r, i) => (
            <div key={r.NHTSACampaignNumber || i} className="bg-white border border-border rounded-lg p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <a
                  href={nhtsaRecallUrl(r.NHTSACampaignNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono bg-slate-100 text-brand px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                  title="View on NHTSA.gov"
                >
                  {r.NHTSACampaignNumber} ↗
                </a>
                <span className="text-xs text-slate-400">{r.ReportReceivedDate}</span>
              </div>
              <div className="text-sm font-medium text-slate-700 mb-1">{r.Component}</div>
              <p className="text-sm text-slate-500 leading-relaxed">{r.Summary}</p>
              {r.Consequence && (
                <div className="mt-2 text-sm">
                  <span className="font-medium text-danger">Risk:</span>{" "}
                  <span className="text-slate-600">{r.Consequence}</span>
                </div>
              )}
              {r.Remedy && (
                <div className="mt-1 text-sm">
                  <span className="font-medium text-safe">Remedy:</span>{" "}
                  <span className="text-slate-600">{r.Remedy}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Check another */}
      <div className="bg-surface rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-3">Check Another Vehicle</h2>
        <VinChecker />
      </div>
    </div>
  );
}
