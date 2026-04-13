import type { Recall } from "@/lib/nhtsa";

interface Props {
  make: string;
  recalls: Recall[];
  modelCount: number;
}

function categorizeComponent(component: string): string {
  const c = (component || "").toUpperCase();
  if (c.includes("AIR BAG") || c.includes("AIRBAG")) return "Air Bags";
  if (c.includes("BRAKE")) return "Brakes";
  if (c.includes("ENGINE") || c.includes("STARTER")) return "Engine";
  if (c.includes("STEERING")) return "Steering";
  if (c.includes("ELECTRICAL") || c.includes("WIRING") || c.includes("BATTERY")) return "Electrical System";
  if (c.includes("FUEL")) return "Fuel System";
  if (c.includes("SEAT BELT")) return "Seat Belts";
  if (c.includes("SOFTWARE") || c.includes("CAMERA")) return "Software / Sensors";
  if (c.includes("LIGHT") || c.includes("LAMP")) return "Lighting";
  if (c.includes("SUSPENSION")) return "Suspension";
  if (c.includes("TIRE") || c.includes("WHEEL")) return "Tires & Wheels";
  if (c.includes("EXTERIOR") || c.includes("BODY")) return "Body & Exterior";
  return "Other";
}

function parseYear(dateStr: string): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

export default function BrandEditorial({ make, recalls, modelCount }: Props) {
  const recallCount = recalls.length;

  const categoryCounts = new Map<string, number>();
  for (const r of recalls) {
    const cat = categorizeComponent(r.Component);
    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  }
  const topCategories = Array.from(categoryCounts.entries())
    .filter(([cat]) => cat !== "Other")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const yearCounts = new Map<number, number>();
  for (const r of recalls) {
    const y = parseYear(r.ReportReceivedDate);
    if (y) yearCounts.set(y, (yearCounts.get(y) || 0) + 1);
  }
  const sortedYears = Array.from(yearCounts.entries()).sort((a, b) => a[0] - b[0]);
  const latestYear = sortedYears.length ? sortedYears[sortedYears.length - 1][0] : null;
  const latestYearCount = latestYear ? yearCounts.get(latestYear) || 0 : 0;

  const modelCounts = new Map<string, number>();
  for (const r of recalls) {
    if (!r.Model) continue;
    modelCounts.set(r.Model, (modelCounts.get(r.Model) || 0) + 1);
  }
  const topModel = Array.from(modelCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  const serious = recalls.filter((r) => {
    const t = `${r.Consequence} ${r.Summary}`.toLowerCase();
    return t.includes("fire") || t.includes("crash") || t.includes("injury") || t.includes("death") || t.includes("loss of control");
  }).length;
  const seriousPct = recallCount ? Math.round((serious / recallCount) * 100) : 0;

  return (
    <section className="bg-white border border-border rounded-lg p-6 md:p-8 space-y-5 text-slate-600 text-[15px] leading-relaxed">
      <h2 className="text-xl font-bold text-slate-800">What the NHTSA data shows about {make} recalls</h2>

      <p>
        RecallScanner has indexed <strong className="text-slate-800">{recallCount.toLocaleString()} {make} recall {recallCount === 1 ? "campaign" : "campaigns"}</strong>
        {" "}across {modelCount} {modelCount === 1 ? "model" : "models"} currently tracked in the National Highway Traffic Safety Administration
        (NHTSA) public database. Each campaign represents a defect or non-compliance that {make} or NHTSA determined creates an unreasonable
        safety risk. Under federal law, every repair tied to these campaigns must be performed at no charge to the current owner, regardless
        of whether the vehicle was purchased new, used, or is outside the original warranty period.
      </p>

      {topCategories.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-2">Most common recall categories for {make}</h3>
          <p>
            Based on the current NHTSA campaign set, the three most frequent recall categories affecting {make} vehicles are{" "}
            {topCategories.map(([cat, count], i) => (
              <span key={cat}>
                <strong className="text-slate-800">{cat.toLowerCase()}</strong> ({count} {count === 1 ? "campaign" : "campaigns"})
                {i < topCategories.length - 1 ? (i === topCategories.length - 2 ? ", and " : ", ") : ""}
              </span>
            ))}
            . These categories tend to be the first place a prospective buyer should look when evaluating a used {make}, because
            they cluster around systems that are expensive to inspect independently and that most owners do not think to check
            before purchase.
          </p>
        </div>
      )}

      {topModel && topModel[1] > 0 && (
        <p>
          The {make} model with the highest count in our dataset right now is the <strong className="text-slate-800">{topModel[0]}</strong>,
          which appears in {topModel[1]} of the {recallCount} tracked campaigns. A high campaign count does not automatically mean a model
          is unreliable — it often reflects higher production volume, longer time on the road, and more thorough NHTSA surveillance.
          What matters for your specific vehicle is whether any of those campaigns are still open against your VIN.
        </p>
      )}

      {latestYear && latestYearCount > 0 && (
        <p>
          In {latestYear}, NHTSA recorded <strong className="text-slate-800">{latestYearCount} new {make} recall {latestYearCount === 1 ? "campaign" : "campaigns"}</strong>
          {" "}in our tracked dataset. Recall activity fluctuates year to year as investigations open and close, new defects are reported
          by owners, and manufacturers self-report issues they uncover through warranty claims or field data. The count for any single
          year is less meaningful than the pattern across several years, and less meaningful still than whether a campaign applies to
          your specific VIN.
        </p>
      )}

      {seriousPct > 0 && (
        <p>
          Roughly <strong className="text-slate-800">{seriousPct}%</strong> of the {make} recalls currently indexed here mention fire,
          crash, injury, death, or loss of vehicle control in the consequence language. That figure is not a measure of how dangerous
          the brand is overall — every recall involves some safety concern by definition — but it is a useful signal that a given
          campaign is worth resolving quickly rather than waiting until your next scheduled service.
        </p>
      )}

      <div>
        <h3 className="font-semibold text-slate-800 mb-2">How to use this page</h3>
        <p>
          If you already own a {make}, the fastest and most reliable answer comes from the VIN checker above. A VIN lookup queries
          NHTSA&apos;s live recall API and tells you whether <em>your specific vehicle</em> has an open, unresolved campaign — which
          is a stricter and more personal test than browsing the full model-level list. If you are researching a used {make} before
          buying, start with the model pages below to see the complete campaign history for that nameplate, then run the seller&apos;s
          VIN through the checker to confirm whether prior owners completed the free repairs or left them open.
        </p>
      </div>

      <p className="text-xs text-slate-400 pt-2 border-t border-border">
        Analysis generated from the current RecallScanner dataset, which is sourced from NHTSA&apos;s public recall and complaint APIs
        and refreshed daily. RecallScanner is independent and not affiliated with {make}, NHTSA, or any U.S. government agency.
      </p>
    </section>
  );
}
