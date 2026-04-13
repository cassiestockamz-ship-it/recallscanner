import type { Recall, Complaint } from "@/lib/nhtsa";
import type { ModelReliability } from "@/lib/db";

interface Props {
  make: string;
  modelDisplay: string;
  recalls: Recall[];
  complaints: Complaint[];
  reliability: ModelReliability | null;
}

function categorizeComponent(component: string): string {
  const c = (component || "").toUpperCase();
  if (c.includes("AIR BAG") || c.includes("AIRBAG")) return "air bag";
  if (c.includes("BRAKE")) return "brake";
  if (c.includes("ENGINE") || c.includes("STARTER")) return "engine";
  if (c.includes("STEERING")) return "steering";
  if (c.includes("ELECTRICAL") || c.includes("WIRING") || c.includes("BATTERY")) return "electrical";
  if (c.includes("FUEL")) return "fuel system";
  if (c.includes("SEAT BELT")) return "seat belt";
  if (c.includes("SOFTWARE") || c.includes("CAMERA")) return "software / sensor";
  if (c.includes("LIGHT") || c.includes("LAMP")) return "lighting";
  if (c.includes("SUSPENSION")) return "suspension";
  if (c.includes("TIRE") || c.includes("WHEEL")) return "tire / wheel";
  return "other";
}

function parseYear(dateStr: string): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

export default function ModelEditorial({ make, modelDisplay, recalls, complaints, reliability }: Props) {
  const recallCount = recalls.length;
  const complaintCount = complaints.length;

  // Top component categories
  const catCounts = new Map<string, number>();
  for (const r of recalls) {
    const cat = categorizeComponent(r.Component);
    catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
  }
  const topCats = Array.from(catCounts.entries())
    .filter(([c]) => c !== "other")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Year range
  const years = recalls.map((r) => parseYear(r.ReportReceivedDate)).filter((y): y is number => y !== null);
  const minYear = years.length ? Math.min(...years) : null;
  const maxYear = years.length ? Math.max(...years) : null;

  // Model years affected
  const modelYears = Array.from(new Set(recalls.map((r) => r.ModelYear).filter(Boolean))).sort();
  const modelYearRange = modelYears.length > 1
    ? `${modelYears[0]}–${modelYears[modelYears.length - 1]}`
    : modelYears[0] || null;

  // Serious incident flag
  const crashes = reliability?.crashes ?? 0;
  const fires = reliability?.fires ?? 0;
  const deaths = reliability?.deaths ?? 0;

  return (
    <section className="bg-white border border-border rounded-lg p-6 md:p-8 space-y-5 text-slate-600 text-[15px] leading-relaxed mt-6">
      <h2 className="text-xl font-bold text-slate-800">
        Understanding the {make} {modelDisplay} recall history
      </h2>

      <p>
        The {make} {modelDisplay} currently has <strong className="text-slate-800">{recallCount.toLocaleString()} recall {recallCount === 1 ? "campaign" : "campaigns"}</strong>
        {complaintCount > 0 ? (
          <>
            {" "}and <strong className="text-slate-800">{complaintCount.toLocaleString()} owner {complaintCount === 1 ? "complaint" : "complaints"}</strong>
          </>
        ) : null}
        {" "}indexed from the NHTSA public database. Each recall represents a formal campaign to fix a defect at no cost to the current owner.
        Owner complaints are self-reported incidents that haven&apos;t (yet) resulted in a recall but can indicate emerging patterns worth watching.
      </p>

      {topCats.length > 0 && (
        <p>
          The most frequent recall {topCats.length === 1 ? "category" : "categories"} for the {modelDisplay} in our dataset {topCats.length === 1 ? "is" : "are"}{" "}
          {topCats.map(([cat, count], i) => (
            <span key={cat}>
              <strong className="text-slate-800">{cat}</strong> ({count})
              {i < topCats.length - 1 ? (i === topCats.length - 2 ? ", and " : ", ") : ""}
            </span>
          ))}
          . These clusters matter when you&apos;re shopping for a used {modelDisplay}: recalls in these systems tend to be the ones
          most likely to have been skipped by previous owners, because they aren&apos;t always visible during a routine test drive or
          pre-purchase inspection.
        </p>
      )}

      {modelYearRange && (
        <p>
          The tracked recalls span <strong className="text-slate-800">model years {modelYearRange}</strong>
          {minYear && maxYear && minYear !== maxYear ? (
            <>, with campaigns reported to NHTSA between {minYear} and {maxYear}</>
          ) : null}
          . Not every model year carries every recall — each campaign is scoped to a specific year range and often a specific build
          window, which is why a VIN lookup is the only way to know whether a particular {modelDisplay} is actually affected by any
          of these campaigns.
        </p>
      )}

      {(crashes > 0 || fires > 0 || deaths > 0) && (
        <p>
          NHTSA&apos;s complaint database for the {modelDisplay} records
          {crashes > 0 ? <> <strong className="text-slate-800">{crashes} crash {crashes === 1 ? "report" : "reports"}</strong></> : null}
          {crashes > 0 && fires > 0 ? "," : null}
          {fires > 0 ? <> <strong className="text-slate-800">{fires} fire {fires === 1 ? "report" : "reports"}</strong></> : null}
          {(crashes > 0 || fires > 0) && deaths > 0 ? ", and" : null}
          {deaths > 0 ? <> <strong className="text-slate-800">{deaths} {deaths === 1 ? "fatality" : "fatalities"}</strong></> : null}
          . Complaint data is unverified and shouldn&apos;t be read as a blanket condemnation of the model — large production volumes
          naturally produce more reports — but it is useful for spotting whether a specific defect has a serious real-world pattern
          behind it.
        </p>
      )}

      <div>
        <h3 className="font-semibold text-slate-800 mb-2">How to use this page</h3>
        <p>
          The safest path for an owner is to run your VIN through the checker above. A VIN query hits NHTSA&apos;s live API and tells
          you whether <em>your specific {modelDisplay}</em> has an open, unresolved recall. If you&apos;re researching a used {modelDisplay}
          before buying, use the recall list below to understand the model&apos;s full history, then check the seller&apos;s VIN to see
          whether prior owners actually completed the free repairs — many don&apos;t, and unresolved recalls can linger for years.
        </p>
      </div>

      <p className="text-xs text-slate-400 pt-2 border-t border-border">
        Figures are generated live from the RecallScanner dataset, which is sourced from NHTSA&apos;s public recall and complaint APIs
        and refreshed daily. RecallScanner is independent and not affiliated with {make} or any U.S. government agency.
      </p>
    </section>
  );
}
