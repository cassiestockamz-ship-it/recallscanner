import { ogTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "Your rights when a vehicle is recalled";

export default function Image() {
  return ogTemplate({
    eyebrow: "Rights · 7 min read",
    title: "Your rights when a vehicle is recalled",
    subtitle:
      "Free repairs, any authorized dealer, loaners, refunds, and the right to be notified. Here's what federal law actually guarantees you.",
  });
}
