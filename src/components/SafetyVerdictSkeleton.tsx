import { Loader2 } from "lucide-react";

/**
 * Skeleton placeholder shown while NHTSA is being queried for a VIN.
 * Matches the shape of <SafetyVerdict /> so the final render doesn't
 * cause a layout shift when it swaps in. Pure server-renderable.
 */
export default function SafetyVerdictSkeleton() {
  return (
    <section aria-busy="true" aria-live="polite">
      {/* Big verdict card shell */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white">
        <div className="p-6 md:p-10">
          <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
            <div className="flex-1 min-w-0 w-full">
              {/* Icon + eyebrow */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center">
                  <Loader2 size={20} className="animate-spin text-slate-400" />
                </div>
                <div className="h-3 w-24 rounded bg-slate-100" />
              </div>

              {/* Headline */}
              <div className="h-12 w-56 max-w-full rounded bg-slate-100 mb-3 animate-pulse" />

              {/* Sub */}
              <div className="space-y-2 max-w-[52ch]">
                <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
              </div>

              {/* Vehicle row */}
              <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex items-center gap-3 flex-wrap">
                <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>

            {/* Dial */}
            <div className="shrink-0 self-center md:self-start">
              <div className="relative w-[140px] h-[140px] grid place-items-center">
                <div
                  className="absolute inset-0 rounded-full border-[7px] border-slate-100"
                  aria-hidden
                />
                <div className="text-center">
                  <Loader2 size={24} className="animate-spin text-slate-400 mx-auto" />
                  <div className="h-2 w-16 rounded bg-slate-100 mt-3 mx-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Count tiles skeleton */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--color-border)] bg-white p-3"
              >
                <div className="h-2 w-16 rounded bg-slate-100 mb-2" />
                <div className="h-6 w-8 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status line below */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[13px] text-slate-500">
        <Loader2 size={13} className="animate-spin" />
        <span>Checking NHTSA for open recalls…</span>
      </div>
    </section>
  );
}
