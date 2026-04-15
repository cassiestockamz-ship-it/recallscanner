import { ogTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "edge";
export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "What to do if your car has an open recall";

export default function Image() {
  return ogTemplate({
    eyebrow: "Action · 6 min read",
    title: "What to do if your car has an open recall",
    subtitle:
      "A five-step playbook from reading the campaign text to calling the dealer to handling Do-Not-Drive notices.",
  });
}
