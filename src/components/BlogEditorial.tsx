import type { Recall } from "@/lib/nhtsa";

interface Props {
  monthLabel: string;
  recalls: Recall[];
  brandEntries: [string, Recall[]][];
  topComponents: [string, number][];
  criticalCount: number;
}

export default function BlogEditorial({ monthLabel, recalls, brandEntries, topComponents, criticalCount }: Props) {
  const totalVehiclesLine = recalls.length;
  const brandCount = brandEntries.length;
  const topBrand = brandEntries[0];
  const secondBrand = brandEntries[1];
  const topComponent = topComponents[0];
  const criticalPct = totalVehiclesLine > 0 ? Math.round((criticalCount / totalVehiclesLine) * 100) : 0;

  return (
    <section className="space-y-4 text-slate-600 text-[15px] leading-relaxed mb-10">
      <p>
        This report covers every vehicle safety recall campaign that appeared in the NHTSA public database during {monthLabel}.
        Our daily ingest pulled <strong className="text-slate-800">{totalVehiclesLine} campaigns</strong> from{" "}
        <strong className="text-slate-800">{brandCount} {brandCount === 1 ? "brand" : "different brands"}</strong> this month.
        Below is a plain-language breakdown of what was recalled, which brands were most affected, and what to do if a listed
        vehicle is in your driveway.
      </p>

      {topBrand && (
        <p>
          The brand with the most campaigns this month was <strong className="text-slate-800">{topBrand[0]}</strong>, with{" "}
          {topBrand[1].length} {topBrand[1].length === 1 ? "campaign" : "campaigns"}
          {secondBrand && (
            <>
              , followed by <strong className="text-slate-800">{secondBrand[0]}</strong> at {secondBrand[1].length}
            </>
          )}
          . A high campaign count for a single brand in a single month isn&apos;t inherently a quality signal. It often reflects
          a single defect rolled out across multiple model years or configurations, or proactive self-reporting after an internal
          investigation. The more useful question for an owner is whether any of these campaigns actually apply to the vehicle
          in your driveway, which depends on the VIN.
        </p>
      )}

      {topComponent && (
        <p>
          The most common component category in this month&apos;s recalls was{" "}
          <strong className="text-slate-800">{topComponent[0]}</strong>, appearing in {topComponent[1]}{" "}
          {topComponent[1] === 1 ? "campaign" : "campaigns"}. Clusters like this tend to come from either a shared supplier
          component used across several automakers or from a single manufacturer discovering a pattern across multiple model
          lines and filing campaigns together. Either way, it&apos;s worth a closer look if your vehicle sits in that category.
        </p>
      )}

      {criticalCount > 0 && (
        <p>
          Of the {totalVehiclesLine} campaigns indexed for {monthLabel}, <strong className="text-slate-800">{criticalCount}{" "}
          ({criticalPct}%)</strong> contain language about fire, crash, injury, or death in the consequence field. Those are the
          campaigns we&apos;ve flagged as &quot;Most Critical&quot; below. A critical flag doesn&apos;t necessarily mean anything has
          happened to the vehicles on the road (NHTSA often describes <em>potential</em> consequences in the same language), but
          it&apos;s a reasonable filter when you&apos;re prioritizing which open recall to schedule first.
        </p>
      )}

      <p>
        Everything that follows is drawn directly from NHTSA&apos;s public recall feed with no editorial alteration of the underlying
        campaign details. The grouping, totals, and &quot;most critical&quot; filter are computed live from that dataset by
        RecallScanner. If you want to verify any specific entry, the NHTSA campaign number links out to the original government
        record.
      </p>
    </section>
  );
}
