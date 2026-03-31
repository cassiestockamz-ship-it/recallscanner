export default function SafetyProductRec() {
  const affiliateUrl =
    "https://www.amazon.com/dp/B000IE0EZO?tag=kawaiiguy0f-rs-20";

  return (
    <div className="bg-surface border border-border rounded-lg p-5 my-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-brand"
          >
            <path
              fillRule="evenodd"
              d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
              clipRule="evenodd"
            />
          </svg>
        </div>
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
