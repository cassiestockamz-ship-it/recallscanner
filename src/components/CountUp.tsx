"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** Target number to count up to */
  value: number;
  /** Duration in ms. Default 800. */
  duration?: number;
  /** Tailwind / plain className forwarded to the output span */
  className?: string;
  /** Optional prefix (e.g. "$") */
  prefix?: string;
  /** Optional suffix (e.g. "%") */
  suffix?: string;
  /** Format the final value (defaults to toLocaleString for thousands separators) */
  format?: (n: number) => string;
}

/**
 * Lightweight count-up animation. Ticks from 0 to `value` over `duration`
 * using a single requestAnimationFrame loop with an ease-out cubic curve.
 * Respects prefers-reduced-motion (snaps straight to the final value).
 *
 * Runs once per mount. If `value` changes later, it re-animates from the
 * current displayed number to the new target (not from 0).
 */
export default function CountUp({
  value,
  duration = 800,
  className,
  prefix = "",
  suffix = "",
  format,
}: Props) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const from = fromRef.current;
    const to = value;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic: fast at the start, settles at the end
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  const output = format ? format(display) : display.toLocaleString();
  return (
    <span className={className}>
      {prefix}
      {output}
      {suffix}
    </span>
  );
}
