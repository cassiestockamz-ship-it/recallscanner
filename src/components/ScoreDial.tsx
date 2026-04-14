interface Props {
  /** 0–100 */
  score: number;
  /** Stroke color (hex or CSS color) */
  color: string;
  size?: number;
}

/**
 * Pure SVG score dial. Server-renderable, zero JS, animates via CSS on mount.
 * Circumference: 2πr = 2π·45 ≈ 282.743
 */
export default function ScoreDial({ score, color, size = 140 }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamped / 100) * circ;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="transform -rotate-90"
        aria-hidden
      >
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="7"
        />
        {/* Progress */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="animate-score-sweep"
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.32, 0.72, 0, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className="text-[36px] font-bold leading-none tabular-nums"
            style={{ color }}
          >
            {clamped}
          </div>
          <div className="text-[9px] uppercase tracking-[0.12em] font-bold text-slate-500 mt-1">
            RecallScore
          </div>
        </div>
      </div>
    </div>
  );
}
