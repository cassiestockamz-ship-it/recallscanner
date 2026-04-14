import { AlertOctagon, Flame, Car, HeartPulse, Users } from "lucide-react";
import type { Recall, Complaint } from "@/lib/nhtsa";
import type { ModelReliability } from "@/lib/db";
import { scoreRecall, modelRecallScore } from "@/lib/severity";
import ScoreDial from "./ScoreDial";

interface Props {
  make: string;
  modelDisplay: string;
  recalls: Recall[];
  complaints: Complaint[];
  reliability: ModelReliability | null;
}

/**
 * Server component — displayed as the hero on /recalls/[make]/[model].
 * Shows the at-a-glance RecallScore + count tiles derived from live data.
 */
export default function ModelSeverityHeader({ make, modelDisplay, recalls, complaints, reliability }: Props) {
  const score = modelRecallScore(recalls, complaints, reliability);

  const scored = recalls.map(scoreRecall);
  const crits = scored.filter((s) => s.tier === "crit").length;
  const fires = scored.filter((s) => s.badges.includes("FIRE RISK")).length;
  const crashRisks = scored.filter((s) => s.badges.includes("CRASH RISK")).length;
  const injuries = reliability?.injuries ?? complaints.reduce((s, c) => s + (c.numberOfInjuries || 0), 0);
  const deaths = reliability?.deaths ?? complaints.reduce((s, c) => s + (c.numberOfDeaths || 0), 0);

  // Tier derived from score
  let tierLabel = "Generally clean";
  let tierSub = "No critical campaigns flagged.";
  let tierColor = "var(--color-clear)";
  if (score >= 60) {
    tierLabel = "High-severity history";
    tierSub = `${crits} critical campaign${crits === 1 ? "" : "s"} among ${recalls.length} total.`;
    tierColor = "var(--color-crit)";
  } else if (score >= 35) {
    tierLabel = "Watch";
    tierSub = `${recalls.length} recall campaign${recalls.length === 1 ? "" : "s"}, verify by VIN.`;
    tierColor = "var(--color-watch)";
  } else if (recalls.length > 0) {
    tierLabel = "Routine recalls";
    tierSub = `${recalls.length} campaign${recalls.length === 1 ? "" : "s"}, none flagged critical.`;
    tierColor = "var(--color-clear)";
  }

  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-white overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-slate-500 mb-2">
              RecallScanner Severity Profile
            </div>
            <h1 className="text-[32px] md:text-[40px] leading-[1.04] font-bold tracking-tight text-slate-900 mb-1">
              {make} {modelDisplay}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className="text-[13px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md"
                style={{ background: tierColor, color: "white" }}
              >
                {tierLabel}
              </span>
              <span className="text-[13px] text-slate-500">{tierSub}</span>
            </div>
          </div>
          <ScoreDial score={score} color={tierColor} />
        </div>

        {/* Count tiles */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
          <Tile icon={<AlertOctagon size={14} />} label="Critical" value={crits} tone={crits > 0 ? "crit" : "muted"} />
          <Tile icon={<Flame size={14} />} label="Fire risk" value={fires} tone={fires > 0 ? "crit" : "muted"} />
          <Tile icon={<Car size={14} />} label="Crash risk" value={crashRisks} tone={crashRisks > 0 ? "watch" : "muted"} />
          <Tile icon={<HeartPulse size={14} />} label="Injuries" value={injuries} tone={injuries > 0 ? "watch" : "muted"} />
          <Tile icon={<Users size={14} />} label="Deaths" value={deaths} tone={deaths > 0 ? "crit" : "muted"} />
        </div>
      </div>
    </section>
  );
}

function Tile({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "crit" | "watch" | "muted" }) {
  const toneClasses =
    tone === "crit"  ? "border-[var(--color-crit-ring)] bg-[var(--color-crit-soft)] text-[var(--color-crit-ink)]" :
    tone === "watch" ? "border-[var(--color-watch-ring)] bg-[var(--color-watch-soft)] text-[var(--color-watch-ink)]" :
                       "border-[var(--color-border)] bg-white text-slate-400";
  return (
    <div className={`rounded-xl border p-3 ${toneClasses}`}>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold mb-1">
        {icon} {label}
      </div>
      <div className="text-[22px] font-bold tabular-nums leading-none">{value.toLocaleString()}</div>
    </div>
  );
}
