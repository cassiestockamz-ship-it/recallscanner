import { ogTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "RecallScanner Guides";

export default function Image() {
  return ogTemplate({
    eyebrow: "Plain-English reference",
    title: "Recall guides",
    subtitle:
      "Short walkthroughs of how the vehicle recall system works, your consumer rights, and what to do if your car has an open campaign.",
    stats: [
      { label: "Guides", value: 4 },
      { label: "Min read", value: "5–7" },
    ],
  });
}
