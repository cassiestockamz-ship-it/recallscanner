import Image from "next/image";

export default function SafetyProductRec() {
  const affiliateUrl =
    "https://www.amazon.com/dp/B000IE0EZO?tag=kawaiiguy0f-rs-20";

  return (
    <div className="bg-surface border border-border rounded-lg p-5 my-8">
      <div className="flex items-start gap-4">
        <a
          href={affiliateUrl}
          target="_blank"
          rel="sponsored noopener"
          className="flex-shrink-0"
        >
          <Image
            src="/images/resqme.jpg"
            alt="resqme car escape tool"
            width={80}
            height={45}
            className="rounded object-cover"
          />
        </a>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 mb-1">
            Stay prepared on the road
          </p>
          <p className="text-xs text-slate-500 leading-relaxed mb-2">
            The{" "}
            <a
              href={affiliateUrl}
              target="_blank"
              rel="sponsored noopener"
              className="text-brand hover:underline font-medium"
            >
              resqme keychain car escape tool
            </a>{" "}
            is a compact 2-in-1 seatbelt cutter and window breaker. Made in the
            USA, used by first responders, and small enough to clip to your keys.
          </p>
          <p className="text-[10px] text-slate-400">
            As an Amazon Associate, we earn from qualifying purchases.
          </p>
        </div>
      </div>
    </div>
  );
}
