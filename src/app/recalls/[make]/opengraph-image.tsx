import { POPULAR_MAKES, makeSlug } from "@/lib/nhtsa";
import { getModelsForMake, getRecentRecallsForMake } from "@/lib/db";
import { scoreRecall } from "@/lib/severity";
import { ogTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Brand safety profile on RecallScanner";

interface Props {
  params: Promise<{ make: string }>;
}

function findMake(slug: string): string | undefined {
  return POPULAR_MAKES.find((m) => makeSlug(m) === slug);
}

export default async function Image({ params }: Props) {
  const { make: makeParam } = await params;
  const make = findMake(makeParam) || "Unknown";
  const [models, recalls] = await Promise.all([
    getModelsForMake(makeParam),
    getRecentRecallsForMake(makeParam),
  ]);

  const scored = recalls.map(scoreRecall);
  const crit = scored.filter((s) => s.tier === "crit").length;
  const watch = scored.filter((s) => s.tier === "watch").length;
  const fireRisk = scored.filter((s) => s.badges.includes("FIRE RISK")).length;

  const tier = crit > 0 ? "crit" : watch > 0 ? "watch" : "clear";
  const subtitle =
    recalls.length === 0
      ? "No recent campaigns indexed."
      : crit > 0
      ? `${crit} critical, ${watch} watch across ${models.length} models`
      : `${recalls.length} recent campaigns across ${models.length} models`;

  return ogTemplate({
    eyebrow: "Brand Safety Profile",
    title: `${make} Recalls`,
    subtitle,
    tier,
    stats: [
      { label: "Critical", value: crit },
      { label: "Fire risk", value: fireRisk },
      { label: "Models", value: models.length },
    ],
  });
}
