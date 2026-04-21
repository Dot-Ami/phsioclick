// Stage 02-A.5 / U6 — SymmetryTrendHero.
// Hero card on the Progress screen: the symmetry composite trend with a
// 7 / 30 / 90 window selector and a sparkline area.
//
// Spec: stages/02a-ux-foundation/output/screens.md "Progress screen" hero +
// stages/02-tracking-metrics/output/plan.md §2.3 (M3 — symmetry index).
//
// Stage 02-B / F3 lit this card up: ProgressScreen now passes the live M3
// composite computed by `src/metrics/symmetry.js` plus the rolling daily
// `[{ date, composite }]` trend. Callers without history (e.g. fresh
// installs) still pass `composite = null`, in which case the cold-start
// "Calibrating" framing renders — mirroring BodyBalanceScore so the two
// heroes stay visually consistent across Today and Progress.
//
// Slot contract (stable across the cold-start / live swap):
//   composite : { value: number /* lower-is-better */, deltaSinceLastWindow: number | null } | null
//   trend     : Array<{ date: string /* ISO date */, composite: number }> | null
//   windowDays: 7 | 30 | 90  (controlled — `onWindowChange` is the setter)

import { useId } from "react";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";

const WINDOW_OPTIONS = [7, 30, 90];

function formatComposite(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

function formatDelta(delta) {
  if (delta === null || delta === undefined || Number.isNaN(delta)) {
    return { label: "No change yet", className: "text-zinc-500", Icon: null };
  }
  if (delta < 0) {
    return {
      label: `${delta.toFixed(2)} since last window`,
      className: "text-state-balanced",
      Icon: TrendingDown,
    };
  }
  if (delta > 0) {
    return {
      label: `+${delta.toFixed(2)} since last window`,
      className: "text-zinc-400",
      Icon: TrendingUp,
    };
  }
  return { label: "No change since last window", className: "text-zinc-500", Icon: null };
}

function Sparkline({ trend, windowDays }) {
  const id = useId();
  const points = Array.isArray(trend) ? trend : [];

  if (points.length < 2) {
    return (
      <div
        role="img"
        aria-label={`${windowDays}-day symmetry trend (calibrating)`}
        className="flex h-28 items-center justify-center rounded-10 border border-dashed border-zinc-800 bg-zinc-950/40"
      >
        <p className="text-caption text-zinc-500">
          Trend will appear after {windowDays} days of activity.
        </p>
      </div>
    );
  }

  const values = points.map((p) => p.composite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1e-6, max - min);
  const width = 320;
  const height = 96;
  const padX = 6;
  const padY = 8;
  const stepX = (width - padX * 2) / Math.max(1, points.length - 1);
  const path = points
    .map((p, i) => {
      const x = padX + i * stepX;
      const y = padY + (height - padY * 2) * (1 - (p.composite - min) / span);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${windowDays}-day symmetry trend sparkline`}
      className="h-28 w-full"
    >
      <defs>
        <linearGradient id={`sparkline-fill-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L${(padX + (points.length - 1) * stepX).toFixed(1)},${height - padY} L${padX},${height - padY} Z`}
        fill={`url(#sparkline-fill-${id})`}
      />
      <path d={path} fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function SymmetryTrendHero({
  composite = null,
  trend = null,
  windowDays = 30,
  onWindowChange,
}) {
  const isColdStart = composite === null;

  const value = isColdStart ? null : composite.value;
  const delta = isColdStart ? null : composite.deltaSinceLastWindow;
  const trendInfo = formatDelta(delta);
  const TrendIcon = trendInfo.Icon;

  const subtitle = isColdStart
    ? "Your symmetry trend will fine-tune as you flag muscles and run assessments. Lower numbers mean a more balanced left/right picture."
    : "Lower is better — the gap between your left and right flags over the selected window.";

  return (
    <article
      aria-label="Symmetry composite trend"
      className="rounded-14 border border-zinc-800 bg-zinc-900/80 p-5 shadow-elev-1"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-zinc-400">
            <Activity size={14} aria-hidden="true" />
            Symmetry composite trend
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span
              className="text-display tabular-nums text-zinc-100"
              aria-live="polite"
            >
              {formatComposite(value)}
            </span>
            <span
              className="rounded-full border px-2 py-0.5 text-caption"
              style={{
                color: isColdStart ? "#71717a" : "#5eead4",
                borderColor: isColdStart ? "#71717a66" : "#5eead466",
                backgroundColor: isColdStart ? "#71717a1f" : "#5eead41f",
              }}
            >
              {isColdStart ? "Calibrating" : `${windowDays}-day composite`}
            </span>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Trend window in days"
          className="inline-flex overflow-hidden rounded-full border border-zinc-800 bg-zinc-950 text-caption"
        >
          {WINDOW_OPTIONS.map((opt) => {
            const active = opt === windowDays;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onWindowChange?.(opt)}
                className={`px-2.5 py-1 transition-colors duration-150 ease-out ${
                  active
                    ? "bg-brand text-zinc-950"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {opt}d
              </button>
            );
          })}
        </div>
      </header>

      <div className="mt-4">
        <Sparkline trend={trend} windowDays={windowDays} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-body text-zinc-300">{subtitle}</p>
        <span className={`inline-flex items-center gap-1 text-caption tabular-nums ${trendInfo.className}`}>
          {TrendIcon ? <TrendIcon size={14} aria-hidden="true" /> : null}
          {trendInfo.label}
        </span>
      </div>
    </article>
  );
}
