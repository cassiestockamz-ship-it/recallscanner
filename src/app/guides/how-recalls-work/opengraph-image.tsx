import { ogTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "How vehicle recalls actually work";

export default function Image() {
  return ogTemplate({
    eyebrow: "Primer · 6 min read",
    title: "How vehicle recalls actually work",
    subtitle:
      "What triggers a recall, who pays for the repair, and why so many open campaigns linger for years on cars that are still on the road.",
  });
}
