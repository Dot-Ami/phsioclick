// Stage 02-B / F4 — Planner inline "since last week" micro-summary.
// Spec: stages/02-tracking-metrics/output/plan.md §4 F4.
//
// Renders a small, dismissible card above the SessionPlanner with three
// signals derived from the v3 stateChanges log:
//
//   • Symmetry composite this week vs the prior 7 days (M3 tail-vs-prior-tail).
//   • Top hot regions this week (M5, top-3 base IDs).
//   • Total flips last 7 days vs prior 7 days (M2 totals).
//
// Hard rules from the F4 contract:
//   - Reuses the existing src/metrics named exports — no parallel
//     computations, no localStorage reads. The component receives
//     stateChanges via props the same way ProgressScreen does.
//   - Dismissal is local React state (useState). Re-appears on next
//     mount; persistence is deliberately deferred to F9.
//   - Mobile collapses to a single one-line summary above the fold;
//     desktop shows the full card.
//   - Tone is educational ("3 fewer tight days than last week — nice
//     trend"), never diagnostic.
//   - Tokens only — brand teal accents, state.tight/weak/balanced
//     chips, radius-10/14, text-caption/body, shadow-elev-1.
//   - Mirrors the ProgressScreen calibration banner pattern when
//     stateChanges spans < 7 days: collapses to a single calibration
//     line so the user knows why the card is empty.

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus, Sparkles, X } from "lucide-react";
import {
  flipFrequency,
  hotRegions,
  stateChangesSpanDays,
  symmetryIndex,
} from "./metrics";

const DAY_MS = 24 * 60 * 60 * 1000;

function describeDelta(delta, { unit, lowerIsBetter }) {
  if (delta === 0) {
    return { Icon: Minus, label: `same as prior week`, tone: "neutral", value: `0${unit}` };
  }
  const isImprovement = lowerIsBetter ? delta < 0 : delta > 0;
  const Icon = delta > 0 ? ArrowUp : ArrowDown;
  const formatted = `${delta > 0 ? "+" : ""}${Number(delta.toFixed(1))}${unit}`;
  return {
    Icon,
    tone: isImprovement ? "good" : "bad",
    label: formatted,
    value: formatted,
  };
}

function toneClass(tone) {
  if (tone === "good") return "text-state-balanced";
  if (tone === "bad") return "text-state-tight";
  return "text-zinc-400";
}

function StateDot({ state }) {
  const cls =
    state === "weak"
      ? "bg-state-weak"
      : state === "tight"
        ? "bg-state-tight"
        : "bg-state-balanced";
  return <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 rounded-full ${cls}`} />;
}

export default function PlanWeeklySummary({ stateChanges = [] }) {
  const [dismissed, setDismissed] = useState(false);

  const summary = useMemo(() => {
    const span = stateChangesSpanDays(stateChanges);
    if (span < 7) {
      return { kind: "calibrating", daysToCalibrate: Math.max(0, 7 - span) };
    }
    const now = new Date();
    const priorNow = new Date(now.getTime() - 7 * DAY_MS);

    const currentSym = symmetryIndex({
      stateChanges,
      now,
      windowDays: 7,
      trendDays: 1,
    });
    const priorSym = symmetryIndex({
      stateChanges,
      now: priorNow,
      windowDays: 7,
      trendDays: 1,
    });

    const currentFlips = flipFrequency({ stateChanges, now, windowDays: 7 });
    const priorFlips = flipFrequency({
      stateChanges,
      now: priorNow,
      windowDays: 7,
    });

    const hot = hotRegions({ stateChanges, now, windowDays: 7, topN: 3 });

    return {
      kind: "live",
      symmetry: {
        current: Number(currentSym.composite.toFixed(1)),
        prior: Number(priorSym.composite.toFixed(1)),
        delta: Number((currentSym.composite - priorSym.composite).toFixed(1)),
      },
      flips: {
        current: currentFlips.totalFlips,
        prior: priorFlips.totalFlips,
        delta: currentFlips.totalFlips - priorFlips.totalFlips,
      },
      hot,
    };
  }, [stateChanges]);

  if (dismissed) return null;

  if (summary.kind === "calibrating") {
    const days = summary.daysToCalibrate;
    return (
      <p
        role="status"
        className="rounded-10 border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-caption text-zinc-400"
      >
        Calibrating — your weekly summary unlocks once you have{" "}
        {days === 0 ? "a few" : days} more day{days === 1 ? "" : "s"} of
        flagged history.
      </p>
    );
  }

  const sym = describeDelta(summary.symmetry.delta, {
    unit: "",
    lowerIsBetter: true,
  });
  const flips = describeDelta(summary.flips.delta, {
    unit: "",
    lowerIsBetter: true,
  });

  // Mobile: single-line summary above the fold.
  // Desktop (sm+): full card with the three signals plus dismiss.
  return (
    <article
      aria-label="Since last week"
      className="rounded-14 border border-zinc-800 bg-zinc-900/60 shadow-elev-1"
    >
      <header className="flex items-center justify-between gap-2 border-b border-zinc-800/80 px-3 py-2">
        <p className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-zinc-400">
          <Sparkles size={14} aria-hidden="true" className="text-brand" />
          Since last week
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss weekly summary"
          className="rounded-full border border-zinc-800 bg-zinc-900 p-1 text-zinc-500 transition-colors duration-150 ease-out hover:text-zinc-200"
        >
          <X size={12} aria-hidden="true" />
        </button>
      </header>

      <div className="px-3 py-3">
        {/* Mobile: one-line summary */}
        <p className="text-body text-zinc-200 sm:hidden">
          <span className={`font-medium ${toneClass(sym.tone)}`}>
            {sym.tone === "good"
              ? "More balanced"
              : sym.tone === "bad"
                ? "Less balanced"
                : "Holding steady"}
          </span>
          {" · "}
          <span className={toneClass(flips.tone)}>
            {summary.flips.delta === 0
              ? `${summary.flips.current} flip${summary.flips.current === 1 ? "" : "s"}`
              : summary.flips.delta < 0
                ? `${Math.abs(summary.flips.delta)} fewer flip${Math.abs(summary.flips.delta) === 1 ? "" : "s"} this week`
                : `${summary.flips.delta} more flip${summary.flips.delta === 1 ? "" : "s"} this week`}
          </span>
          {summary.hot.length > 0 ? (
            <>
              {" · top: "}
              <span className="text-zinc-300">{summary.hot[0].label}</span>
            </>
          ) : null}
        </p>

        {/* Desktop: full card */}
        <div className="hidden gap-4 sm:grid sm:grid-cols-3">
          <div>
            <p className="text-caption text-zinc-500">Symmetry trend</p>
            <p className="mt-1 flex items-baseline gap-1.5 text-h2 text-zinc-100 tabular-nums">
              {summary.symmetry.current}
              <span className={`text-caption ${toneClass(sym.tone)} flex items-center gap-0.5`}>
                <sym.Icon size={12} aria-hidden="true" />
                {sym.value}
              </span>
            </p>
            <p className="mt-1 text-caption text-zinc-400">
              Lower is better. Prior 7d: {summary.symmetry.prior}.
            </p>
          </div>

          <div>
            <p className="text-caption text-zinc-500">Total flips · 7d</p>
            <p className="mt-1 flex items-baseline gap-1.5 text-h2 text-zinc-100 tabular-nums">
              {summary.flips.current}
              <span className={`text-caption ${toneClass(flips.tone)} flex items-center gap-0.5`}>
                <flips.Icon size={12} aria-hidden="true" />
                {flips.value}
              </span>
            </p>
            <p className="mt-1 text-caption text-zinc-400">
              {summary.flips.delta === 0
                ? "Same pace as last week — nice consistency."
                : summary.flips.delta < 0
                  ? `${Math.abs(summary.flips.delta)} fewer than last week — nice trend.`
                  : `${summary.flips.delta} more than last week — keep noticing.`}
            </p>
          </div>

          <div>
            <p className="text-caption text-zinc-500">Hot regions · 7d</p>
            {summary.hot.length === 0 ? (
              <p className="mt-1 text-body text-zinc-400">
                Nothing flagged this week — keep moving.
              </p>
            ) : (
              <ul className="mt-1 space-y-1">
                {summary.hot.map((region) => (
                  <li
                    key={region.baseId}
                    className="flex items-center justify-between gap-2 text-body text-zinc-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <StateDot state={region.dominantState} />
                      <span className="truncate">{region.label}</span>
                    </span>
                    <span className="text-caption tabular-nums text-zinc-500">
                      {region.flaggedDays}d
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
