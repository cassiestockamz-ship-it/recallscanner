import { POPULAR_MAKES, makeSlug, unslug } from "@/lib/nhtsa";
import { getRecallsForModel, getComplaintsForModel, getModelReliability } from "@/lib/db";
import { scoreRecall, modelRecallScore } from "@/lib/severity";
import { ogTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Model safety profile on RecallScanner";

interface Props {
  params: Promise<{ make: string; model: string }>;
}

function findMake(slug: string): string | undefined {
  return POPULAR_MAKES.find((m) => makeSlug(m) === slug);
}

export default async function Image({ params }: Props) {
  const { make: makeParam, model: modelParam } = await params;
  const make = findMake(makeParam) || "Unknown";
  const modelDisplay = (modelParam ? unslug(modelParam) : "").toUpperCase();

  const [recalls, complaints, reliability] = await Promise.all([
    getRecallsForModel(makeParam, modelParam),
    getComplaintsForModel(makeParam, modelParam),
    getModelReliability(makeParam, modelParam),
  ]);

  const score = modelRecallScore(recalls, complaints, reliability);
  const scored = recalls.map(scoreRecall);
  const crit = scored.filter((s) => s.tier === "crit").length;
  const fireRisk = scored.filter((s) => s.badges.includes("FIRE RISK")).length;
  const crashRisk = scored.filter((s) => s.badges.includes("CRASH RISK")).length;

  const tier = score >= 60 ? "crit" : score >= 35 ? "watch" : "clear";
  const subtitle =
    recalls.length === 0
      ? "No campaigns indexed yet."
      : crit > 0
      ? `${crit} critical campaigns · ${recalls.length} total`
      : `${recalls.length} campaigns, none flagged critical`;

  return ogTemplate({
    eyebrow: "Model Severity Profile",
    title: `${make} ${modelDisplay}`,
    subtitle,
    tier,
    score,
    stats: [
      { label: "Critical", value: crit },
      { label: "Fire risk", value: fireRisk },
      { label: "Crash risk", value: crashRisk },
    ],
  });
}
