/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

/**
 * Shared OG image renderer. Every per-route opengraph-image.tsx calls
 * one of these functions so the visual language is consistent across
 * the whole site. next/og supports a subset of CSS (flexbox + basic
 * properties), so everything here is inline styles, not Tailwind.
 *
 * All cards are 1200 × 630 (the standard Open Graph size).
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Brand palette mirrors src/app/globals.css Calm Emergency tokens
const COLOR = {
  bg: "#0b1220",          // near-black with a whisper of blue
  surface: "#101a30",
  border: "#233148",
  ink: "#f8fafc",
  muted: "#94a3b8",
  brand: "#3b82f6",
  crit: "#d9342b",
  watch: "#c27803",
  clear: "#17803a",
};

type Tier = "crit" | "watch" | "clear";

function tierColor(t: Tier): string {
  return t === "crit" ? COLOR.crit : t === "watch" ? COLOR.watch : COLOR.clear;
}

interface BaseProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  tier?: Tier;
  score?: number;
  stats?: { label: string; value: string | number }[];
}

/** The shared layout used by every OG image on the site. */
export function ogTemplate({ eyebrow, title, subtitle, tier, score, stats }: BaseProps) {
  const accent = tier ? tierColor(tier) : COLOR.brand;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COLOR.bg,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          color: COLOR.ink,
          position: "relative",
        }}
      >
        {/* Accent gradient wash top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: accent,
            display: "flex",
          }}
        />
        {/* Subtle radial glow in upper-left */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 800,
            height: 800,
            background: `radial-gradient(circle, ${accent}26 0%, transparent 60%)`,
            display: "flex",
          }}
        />

        {/* Header row: RecallScanner mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "48px 64px 0 64px",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: COLOR.brand,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            🛡
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: COLOR.ink,
            }}
          >
            RecallScanner
          </div>
        </div>

        {/* Middle: eyebrow + title + subtitle */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: accent,
              display: "flex",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: COLOR.ink,
              display: "flex",
              maxWidth: 1050,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                lineHeight: 1.3,
                color: COLOR.muted,
                display: "flex",
                maxWidth: 1000,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Footer row: score + stats */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "0 64px 48px 64px",
            gap: 24,
          }}
        >
          {/* Left: RecallScore if present */}
          {typeof score === "number" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 84,
                  fontWeight: 800,
                  color: accent,
                  lineHeight: 1,
                  display: "flex",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {score}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: COLOR.muted,
                  display: "flex",
                }}
              >
                RecallScore
              </div>
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}

          {/* Right: stat tiles */}
          {stats && stats.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 16,
              }}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                    background: COLOR.surface,
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: 14,
                    padding: "16px 22px",
                    minWidth: 120,
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: COLOR.ink,
                      lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                      display: "flex",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: COLOR.muted,
                      display: "flex",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    OG_SIZE
  );
}
