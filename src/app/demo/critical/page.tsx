import type { Metadata } from "next";
import { getRecallsForModel } from "@/lib/db";
import SafetyVerdict from "@/components/SafetyVerdict";
import RecallCard from "@/components/RecallCard";
import { scoreRecall } from "@/lib/severity";
import type { VinDecode } from "@/lib/nhtsa";

export const metadata: Metadata = {
  title: "Demo · Critical Verdict",
  description: "Demonstration page for the critical Safety Verdict state.",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

/**
 * Demo route — renders SafetyVerdict against the worst real recalls we
 * have in Supabase for a specific make/model, as if the user had just
 * submitted a VIN. Not indexable.
 */
export default async function CriticalDemoPage() {
  const recalls = await getRecallsForModel("ford", "f-150");

  // Take the top 6 most severe so the "top recall" is the scariest one
  // and we still have enough for the Other Open Recalls list.
  const sorted = recalls
    .map((r) => ({ recall: r, severity: scoreRecall(r) }))
    .sort((a, b) => b.severity.score - a.severity.score)
    .slice(0, 6)
    .map((s) => s.recall);

  // Synthetic VIN decode — looks like a real 2019 F-150
  const decoded: VinDecode = {
    Make: "FORD",
    Model: "F-150",
    ModelYear: "2019",
    BodyClass: "Pickup",
    VehicleType: "TRUCK",
    PlantCity: "Dearborn",
    PlantState: "Michigan",
    Manufacturer: "FORD MOTOR COMPANY",
    FuelTypePrimary: "Gasoline",
    DisplacementL: "3.5",
    EngineConfiguration: "V-Shaped",
    EngineCylinders: "6",
    DriveType: "4WD/4-Wheel Drive/4x4",
    TransmissionStyle: "Automatic",
    ErrorCode: "0",
    ErrorText: "",
  };

  const demoVin = "1FTFW1E55KFC00000";
  const remainingRecalls = sorted.slice(1).map((r) => ({ ...r, severity: scoreRecall(r) }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      {/* Demo banner */}
      <div className="mb-6 rounded-2xl border border-dashed border-[var(--color-border-hi)] bg-[var(--color-surface)] p-4 text-[12px] text-slate-500">
        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Demo</span>
        {" — "}
        Rendered with the 6 worst real recalls from our Ford F-150 Supabase data so you can see the critical Safety Verdict state. Not indexable.
      </div>

      <SafetyVerdict recalls={sorted} decoded={decoded} vin={demoVin} />

      {remainingRecalls.length > 0 && (
        <div className="mt-10">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[20px] font-bold text-slate-900">Other Open Recalls</h2>
            <span className="text-[12px] text-slate-400">{remainingRecalls.length} more</span>
          </div>
          <div className="space-y-3">
            {remainingRecalls.map((r, i) => (
              <RecallCard key={r.NHTSACampaignNumber || i} recall={r} deferPaint={i > 2} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
