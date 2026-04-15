import { ogTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "RecallScanner — severity-scored vehicle recall lookups";

export default function Image() {
  return ogTemplate({
    eyebrow: "The verdict layer on top of NHTSA",
    title: "Is your car safe to drive?",
    subtitle:
      "Check any VIN against the official NHTSA database. Plain-English verdict in seconds. Free, unlimited, no signup.",
    stats: [
      { label: "Free", value: "100%" },
      { label: "Updated", value: "Daily" },
    ],
  });
}
