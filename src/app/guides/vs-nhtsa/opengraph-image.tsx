import { ogTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "RecallScanner vs NHTSA: why use both";

export default function Image() {
  return ogTemplate({
    eyebrow: "Methodology · 5 min read",
    title: "RecallScanner vs NHTSA",
    subtitle:
      "NHTSA is the source of truth. We're the severity layer and the fast front door. Here's when to use which, and why they're complementary.",
  });
}
