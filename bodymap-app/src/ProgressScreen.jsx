// Stage 02-A.5 / U6 — ProgressScreen.
// Job: "How am I doing?"
// Spec: stages/02a-ux-foundation/output/screens.md "Progress screen" +
//       stages/02a-ux-foundation/output/ux-plan.md §10 U6.
//
// Layout (above the fold):
//   - Symmetry composite trend hero with a 7/30/90 window selector
//   - Three supporting cards: tightness load (M4), recovery rate (M6),
//     adherence rate (M7)
//
// Layout (below the fold):
//   - Default-collapsed accordion of every other Stage 02 metric widget
//     (hot regions M5, flip frequency M2, assessment trends, state-change
//     timeline M9, patterns, history). Slot contracts live in
//     BelowFoldAccordion.jsx.
//
// Empty state per `screens.md` "Progress screen" empty-state spec when there
// is no entry, no assessment, and no flagged muscle.
//
// Re-homing of the legacy Dashboard content (Stage 02-A.5 / U2 children-shell):
//   - 5-card numeric grid → folded into the "More signals" accordion under the
//     Patterns slot as a re-skinned "By the numbers" row, so the dashboard
//     summary stays reachable. (Per the U4 carry-over: re-skin to U1 tokens,
//     no semantic change.)
//   - Filters + weighted heat map + recent intensity timeline → fold into the
//     accordion (history + state-change-timeline slots respectively).
//   - Patterns + chains + symmetry summary → fold into the patterns slot.
//
// Stage 02-B will swap the cold-start hero/supporting/accordion content for
// real metric outputs without changing the layout. The window selector is
// already wired through.

import { Suspense, lazy, useMemo, useState } from "react";
import { Activity, Compass, Gauge } from "lucide-react";
import SymmetryTrendHero from "./SymmetryTrendHero";
import SupportingCardsRow from "./SupportingCardsRow";
import BelowFoldAccordion from "./BelowFoldAccordion";
import GoalsPanel from "./GoalsPanel";
import MuscleAtlas from "./MuscleAtlas";
import { getMuscleLabel } from "./muscle-data";
import {
  adherenceRate as computeAdherenceRate,
  hotRegions as computeHotRegions,
  recoveryRate as computeRecoveryRate,
  stateChangesSpanDays,
  symmetryIndex,
  tightnessWeaknessLoad,
} from "./metrics";
// Stage 02-B / F8 — assessment driver lookup. Static seed; F9 docs sync
// will add coverage assertions in the storage-schema regression doc.
import ASSESSMENT_DRIVERS from "./data/assessment-drivers";

const TrendCharts = lazy(() => import("./TrendCharts.jsx"));
// Stage 02-B / F7 + F8 — Recharts-backed charts for the Progress accordion
// slots. Lazy-loaded so the Recharts payload only ships when a user opens
// the "More signals" section.
const BelowFoldCharts = lazy(() => import("./BelowFoldCharts.jsx"));

const SENSATION_TYPES = [
  "tight",
  "sharp pain",
  "dull ache",
  "pinching",
  "clicking/popping",
  "weakness",
  "numbness/tingling",
  "nothing/fine",
  "restricted range",
];

const SENSATION_COLORS = {
  tight: "#facc15",
  "sharp pain": "#ef4444",
  "dull ache": "#fb7185",
  pinching: "#f97316",
  "clicking/popping": "#eab308",
  weakness: "#60a5fa",
  "numbness/tingling": "#a78bfa",
  "nothing/fine": "#34d399",
  "restricted range": "#f59e0b",
};

const DAY_MS = 24 * 60 * 60 * 1000;

function confidenceClass(conf) {
  if (conf === "high") return "border-state-balanced/50 bg-state-balanced/10 text-state-balanced";
  if (conf === "medium") return "border-state-tight/50 bg-state-tight/10 text-state-tight";
  if (conf === "low") return "border-zinc-700 bg-zinc-800/60 text-zinc-300";
  return "border-zinc-800 bg-zinc-900 text-zinc-400";
}

// Stage 02-B / F3 — Hot regions slot now consumes M5 directly (rows from
// `metrics.hotRegions(...)`). The legacy `buildHotRegionsFixture` derivation
// has been retired now that v3 stateChanges is the source of truth.
function HotRegionsSlot({ regions, onOpenBody }) {
  if (!regions.length) {
    return (
      <p className="text-body text-zinc-400">
        Nothing flagged in the last week. Open Body to flag a tight or weak area.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {regions.map((region) => {
        const stateClass =
          region.dominantState === "weak"
            ? "text-state-weak"
            : "text-state-tight";
        return (
          <li key={region.baseId}>
            <button
              type="button"
              onClick={onOpenBody}
              className="flex w-full items-center justify-between gap-3 rounded-10 border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-left transition-colors duration-150 ease-out hover:border-zinc-700"
            >
              <span className="text-body text-zinc-200">{region.label}</span>
              <span className={`text-caption tabular-nums ${stateClass}`}>
                {region.flaggedDays} {region.dominantState} day
                {region.flaggedDays === 1 ? "" : "s"}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// Stage 02-B / F3 — State-change timeline chart.
// Per-day count of stateChanges flips inside the window, split into
// "into flagged" (toState ∈ {tight, weak}) and "out of flagged"
// (toState === normal). Renders a tiny stacked-bar SVG so we don't pull
// Recharts onto the Progress screen for a single chart.
function StateChangeTimelineChart({ stateChanges, windowDays, now }) {
  const series = useMemo(() => {
    const ts = now.getTime();
    const startTs = ts - windowDays * DAY_MS;
    const days = [];
    const buckets = new Map();
    for (let i = windowDays - 1; i >= 0; i -= 1) {
      const day = new Date(ts - i * DAY_MS);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      buckets.set(key, { date: key, into: 0, out: 0 });
      days.push(key);
    }
    for (const ev of stateChanges || []) {
      const t = new Date(ev.timestamp).getTime();
      if (!Number.isFinite(t) || t <= startTs || t > ts) continue;
      const d = new Date(t);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const bucket = buckets.get(key);
      if (!bucket) continue;
      if (ev.toState === "normal") bucket.out += 1;
      else bucket.into += 1;
    }
    return days.map((k) => buckets.get(k));
  }, [stateChanges, windowDays, now]);

  const total = series.reduce((sum, b) => sum + b.into + b.out, 0);
  if (total === 0) {
    return (
      <p className="text-body text-zinc-400">
        No flips logged in the last {windowDays} days. Mark a muscle on Body
        to start the timeline.
      </p>
    );
  }

  const max = Math.max(1, ...series.map((b) => b.into + b.out));
  const width = 100;
  const height = 32;
  const stepX = width / series.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-caption text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-sm bg-state-tight" />
          Into flagged
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-sm bg-state-balanced" />
          Returned to normal
        </span>
        <span className="ml-auto tabular-nums text-zinc-500">
          {total} flip{total === 1 ? "" : "s"} · last {windowDays}d
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Per-day state-change timeline over the last ${windowDays} days`}
        preserveAspectRatio="none"
        className="h-24 w-full rounded-10 border border-zinc-800 bg-zinc-950/60"
      >
        {series.map((bucket, idx) => {
          const x = idx * stepX;
          const barW = Math.max(0.5, stepX - 0.6);
          const intoH = (bucket.into / max) * (height - 2);
          const outH = (bucket.out / max) * (height - 2);
          const intoY = height - intoH;
          const outY = height - intoH - outH;
          return (
            <g key={bucket.date}>
              {bucket.into > 0 ? (
                <rect x={x + 0.3} y={intoY} width={barW} height={intoH} fill="#facc15" opacity="0.85" />
              ) : null}
              {bucket.out > 0 ? (
                <rect x={x + 0.3} y={outY} width={barW} height={outH} fill="#34d399" opacity="0.85" />
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PatternsSlot({ patternsDetected, chains, symmetrySummary, totalLogs, highIntensityCount }) {
  const hasAnything =
    (patternsDetected?.length || 0) > 0 ||
    (chains?.length || 0) > 0 ||
    (symmetrySummary && (symmetrySummary.sensationLeftCount + symmetrySummary.sensationRightCount > 0));

  if (!hasAnything) {
    return (
      <p className="text-body text-zinc-400">
        No strong rule triggers yet. Patterns appear after repeated logs and weekly comparisons.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Re-skinned "By the numbers" — replaces the legacy 5-card grid that
          used pre-token classes. Same data, U1 token treatment. */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <div className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="text-caption text-zinc-400">Total logs</div>
          <div className="text-h2 text-zinc-100">{totalLogs}</div>
        </div>
        <div className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="text-caption text-zinc-400">Patterns (3+)</div>
          <div className="text-h2 text-zinc-100">{(chains || []).filter((c) => c.count >= 3).length}</div>
        </div>
        <div className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="text-caption text-zinc-400">Escalating</div>
          <div className="text-h2 text-zinc-100">{(chains || []).filter((c) => c.escalating).length}</div>
        </div>
        <div className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="text-caption text-zinc-400">High intensity (8+)</div>
          <div className="text-h2 text-zinc-100">{highIntensityCount}</div>
        </div>
        <div className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3">
          <div className="text-caption text-zinc-400">Symmetry snapshot</div>
          <div className="text-body-lg capitalize text-zinc-100">{symmetrySummary?.dominantSide || "—"}</div>
          <div className="mt-1 text-caption text-zinc-500">
            L {symmetrySummary?.leftAvg ?? 0} vs R {symmetrySummary?.rightAvg ?? 0} intensity
          </div>
        </div>
      </div>

      {patternsDetected?.length ? (
        <div>
          <h4 className="text-caption uppercase tracking-wide text-zinc-400">Pattern detector</h4>
          <ul className="mt-2 space-y-2">
            {patternsDetected.map((pattern) => (
              <li
                key={pattern.id}
                className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-body text-zinc-100">{pattern.title}</div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-caption ${
                      pattern.level === "risk"
                        ? "border-state-tight/50 bg-state-tight/10 text-state-tight"
                        : "border-state-balanced/50 bg-state-balanced/10 text-state-balanced"
                    }`}
                  >
                    {pattern.level}
                  </span>
                </div>
                <div className="mt-1 text-caption text-zinc-500">{pattern.trigger}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {chains?.length ? (
        <div>
          <h4 className="text-caption uppercase tracking-wide text-zinc-400">
            Dominant compensation chains
          </h4>
          <ul className="mt-2 space-y-2">
            {chains.slice(0, 8).map((chain) => (
              <li
                key={chain.key}
                className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-body text-zinc-100">
                    {getMuscleLabel(chain.originRegion)}{" "}
                    <span className="text-zinc-500">{"->"}</span>{" "}
                    {getMuscleLabel(chain.sensationRegion)}
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-caption ${confidenceClass(
                      chain.confidence,
                    )}`}
                  >
                    {chain.confidence} confidence
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-caption text-zinc-400">
                  <span>{chain.count} logs</span>
                  <span>avg {chain.average}</span>
                  <span style={{ color: SENSATION_COLORS[chain.dominantSensation] }}>
                    {chain.dominantSensation}
                  </span>
                  {chain.escalating ? (
                    <span className="text-state-tight">escalating this week</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {symmetrySummary ? (
        <div>
          <h4 className="text-caption uppercase tracking-wide text-zinc-400">
            Left / right intensity (existing data)
          </h4>
          <div className="mt-2 rounded-10 border border-zinc-800 bg-zinc-950/60 p-3 text-body">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-zinc-100">
                Dominant side load profile:{" "}
                <span className="capitalize">{symmetrySummary.dominantSide}</span>
              </span>
              <span className="text-zinc-400">
                Side delta: {symmetrySummary.sideDeltaPct}%
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-caption text-zinc-300">
              <div className="rounded-10 bg-zinc-900/70 p-2">
                Left sensation logs: {symmetrySummary.sensationLeftCount}
              </div>
              <div className="rounded-10 bg-zinc-900/70 p-2">
                Right sensation logs: {symmetrySummary.sensationRightCount}
              </div>
              <div className="rounded-10 bg-zinc-900/70 p-2">
                Left avg intensity: {symmetrySummary.leftAvg}
              </div>
              <div className="rounded-10 bg-zinc-900/70 p-2">
                Right avg intensity: {symmetrySummary.rightAvg}
              </div>
            </div>
            <p className="mt-2 text-caption text-zinc-500">
              Assessment flags &gt;15% asymmetry: {symmetrySummary.flaggedAssessments}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HistorySlot({
  view,
  onViewChange,
  filter,
  onFilterChange,
  weightedHeatScores,
  filteredEntries,
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3">
        <div className="text-caption uppercase tracking-wide text-zinc-400">Filters</div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            className="rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
            value={filter.sensationType}
            onChange={(e) => onFilterChange({ ...filter, sensationType: e.target.value })}
          >
            <option value="all">All sensations</option>
            {SENSATION_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
            value={filter.minIntensity}
            onChange={(e) =>
              onFilterChange({ ...filter, minIntensity: Number(e.target.value) })
            }
          >
            {[0, 3, 5, 7, 8].map((n) => (
              <option key={n} value={n}>
                Intensity {n}+
              </option>
            ))}
          </select>
          <select
            className="rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
            value={filter.side}
            onChange={(e) => onFilterChange({ ...filter, side: e.target.value })}
          >
            <option value="all">All sides</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-caption uppercase tracking-wide text-zinc-400">
            Weighted heat map
          </span>
          <div
            role="radiogroup"
            aria-label="Atlas view"
            className="inline-flex overflow-hidden rounded-full border border-zinc-800 bg-zinc-950 text-caption"
          >
            {[
              { id: "front", label: "Front" },
              { id: "back", label: "Back" },
            ].map((opt) => {
              const active = view === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onViewChange(opt.id)}
                  className={`px-2.5 py-1 transition-colors duration-150 ease-out ${
                    active
                      ? "bg-brand text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        <MuscleAtlas
          view={view}
          onSelect={() => {}}
          heatScores={weightedHeatScores}
          showHeat
        />
      </div>

      <div className="rounded-10 border border-zinc-800 bg-zinc-950/60 p-3">
        <div className="mb-2 text-caption uppercase tracking-wide text-zinc-400">
          Filtered entries ({filteredEntries.length})
        </div>
        {filteredEntries.length === 0 ? (
          <p className="text-body text-zinc-400">No entries match these filters yet.</p>
        ) : (
          <ul className="max-h-80 space-y-1 overflow-auto pr-1">
            {filteredEntries
              .slice()
              .reverse()
              .slice(0, 50)
              .map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-baseline justify-between gap-2 rounded-10 border border-zinc-800 bg-zinc-900/40 px-2 py-1.5 text-body text-zinc-300"
                >
                  <span>
                    <span className="text-caption uppercase tracking-wide text-zinc-500">
                      {entry.sensationType || "log"}
                    </span>
                    <span className="ml-2">
                      {getMuscleLabel(entry.sensationRegion || entry.originRegion) ||
                        "Logged"}
                    </span>
                  </span>
                  <span className="text-caption tabular-nums text-zinc-500">
                    int {entry.intensity ?? 0} ·{" "}
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ProgressScreen({
  entries = [],
  assessments = [],
  muscleStates = {},
  stateChanges = [],
  adherence = [],
  goals = [],
  chains = [],
  patternsDetected = [],
  symmetrySummary = null,
  weightedHeatScores = {},
  filteredEntries = [],
  assessmentTrendData = [],
  filter,
  onFilterChange,
  view = "front",
  onViewChange,
  onOpenBody,
  onOpenPlan,
}) {
  // Window selector is owned here so the hero and supporting row never
  // disagree. Stage 02-B / F3 reads it through the metrics module below.
  const [windowDays, setWindowDays] = useState(30);

  const hasAnyData =
    entries.length > 0 ||
    assessments.length > 0 ||
    Object.keys(muscleStates).length > 0 ||
    stateChanges.length > 0;

  const totalLogs = entries.length;
  const highIntensityCount = useMemo(
    () => entries.filter((e) => Number(e.intensity) >= 8).length,
    [entries],
  );

  // Stage 02-B / F3 — live metrics. `now` is captured once per render so
  // every metric in this section sees the same wall clock and the trend
  // sparkline aligns with the headline composite.
  const now = new Date();

  // `now` is a fresh Date every render, so these can never hit a useMemo
  // cache anyway — compute them directly rather than paying for the wrapper.
  const symmetry = (() => {
    const current = symmetryIndex({ stateChanges, now, windowDays, trendDays: windowDays });
    const previousNow = new Date(now.getTime() - windowDays * DAY_MS);
    const previous = symmetryIndex({
      stateChanges,
      now: previousNow,
      windowDays,
      trendDays: 1,
    });
    return {
      composite: current.composite,
      delta: current.composite - previous.composite,
      trend: current.trend,
    };
  })();

  const tightness = tightnessWeaknessLoad({ stateChanges, now, windowDays });

  const recovery = computeRecoveryRate({ stateChanges, now, windowDays });

  const adherenceMetric = computeAdherenceRate({ adherence, now, windowDays: 7 });

  const hotRegionsList = computeHotRegions({ stateChanges, now, windowDays: 7, topN: 5 });

  // Stage 02-B / F3 — calibration banner. Empty-state copy when the
  // user has fewer than 7 days of genuine stateChanges history. We do
  // NOT cold-start the supporting cards entirely — they still render
  // their live numbers — but the banner explains why early numbers
  // fluctuate while the v3 log fills in.
  const historySpan = useMemo(() => stateChangesSpanDays(stateChanges), [stateChanges]);
  const isCalibrating = historySpan < 7;
  const daysToCalibrate = Math.max(0, 7 - historySpan);

  // Stage 02-B / F6 — adherence card lights up as soon as the planner /
  // slide-out has written at least one row in the current 7-day window.
  // It calibrates independently of the symmetry / tightness / recovery
  // banner above so a user who has only just started checking off remedies
  // still sees their M7 number even if their stateChanges history is short.
  const adherencePropForCard =
    adherenceMetric && adherenceMetric.suggested > 0 ? adherenceMetric : null;

  // Tightness / recovery cards: pass the live metrics whenever there is
  // any genuine stateChanges history (synthetic seed alone counts as
  // "we have something to show"). On a brand-new install these stay null.
  const hasStateChanges = stateChanges.length > 0;
  const tightnessProp = hasStateChanges ? tightness : null;
  const recoveryProp = hasStateChanges ? recovery : null;
  const symmetryProp = hasStateChanges
    ? { value: symmetry.composite, deltaSinceLastWindow: symmetry.delta }
    : null;
  const symmetryTrendProp = hasStateChanges ? symmetry.trend : null;

  if (!hasAnyData) {
    return (
      <section
        aria-labelledby="progress-screen-title"
        className="space-y-4"
      >
        <header className="px-1">
          <p className="text-caption uppercase tracking-wide text-zinc-500">Progress</p>
          <h2 id="progress-screen-title" className="text-h1 text-zinc-100">
            How are you doing?
          </h2>
          <p className="mt-0.5 text-body text-zinc-400">
            The story starts with one flag. Mark a tight or weak muscle on the
            Body atlas to begin building your trend.
          </p>
        </header>

        <article
          aria-label="Get started on Progress"
          className="rounded-14 border border-zinc-800 bg-zinc-900/60 px-4 py-12 text-center"
        >
          <Gauge size={32} aria-hidden="true" className="mx-auto text-zinc-500" />
          <h3 className="mt-3 text-h2 text-zinc-100">
            Your progress story starts with one flag.
          </h3>
          <p className="mt-2 text-body-lg text-zinc-400">
            Mark a tight or weak muscle on the Body atlas to begin.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onOpenBody}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-caption font-semibold text-zinc-950 transition-colors duration-150 ease-out hover:bg-brand-hover"
            >
              <Activity size={16} aria-hidden="true" />
              Open Body atlas
            </button>
            <button
              type="button"
              onClick={onOpenPlan}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-caption text-zinc-100 hover:border-zinc-600"
            >
              <Compass size={16} aria-hidden="true" />
              Run intake wizard
            </button>
          </div>

          <div className="mt-8 text-left">
            <SymmetryTrendHero windowDays={windowDays} onWindowChange={setWindowDays} />
          </div>
        </article>
      </section>
    );
  }

  return (
    <section aria-labelledby="progress-screen-title" className="space-y-4">
      <header className="px-1">
        <p className="text-caption uppercase tracking-wide text-zinc-500">Progress</p>
        <h2 id="progress-screen-title" className="text-h1 text-zinc-100">
          How are you doing?
        </h2>
        <p className="mt-0.5 text-body text-zinc-400">
          Trends and signals across your last {windowDays} days. Open the
          accordion below for the rest.
        </p>
      </header>

      {isCalibrating ? (
        <p
          role="status"
          className="rounded-10 border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-caption text-zinc-400"
        >
          Calibrating — not enough history yet. Keep flagging muscles for
          {" "}
          {daysToCalibrate === 0 ? "a few" : daysToCalibrate} more day
          {daysToCalibrate === 1 ? "" : "s"} to sharpen these numbers.
        </p>
      ) : null}

      <SymmetryTrendHero
        composite={symmetryProp}
        trend={symmetryTrendProp}
        windowDays={windowDays}
        onWindowChange={setWindowDays}
      />

      <SupportingCardsRow
        tightnessLoad={tightnessProp}
        recoveryRate={recoveryProp}
        adherenceRate={adherencePropForCard}
        windowDays={windowDays}
      />

      <GoalsPanel
        goals={goals}
        stateChanges={stateChanges}
        adherence={adherence}
        readOnly
      />

      <BelowFoldAccordion
        slotContent={{
          hotRegions: <HotRegionsSlot regions={hotRegionsList} onOpenBody={onOpenBody} />,
          flipFrequency: (
            <Suspense fallback={<div className="h-72 rounded-10 bg-zinc-800/50" />}>
              <BelowFoldCharts
                mode="flip-frequency"
                stateChanges={stateChanges}
                windowDays={windowDays}
                now={now}
              />
            </Suspense>
          ),
          recoveryTrend: (
            <Suspense fallback={<div className="h-56 rounded-10 bg-zinc-800/50" />}>
              <BelowFoldCharts
                mode="recovery-trend"
                stateChanges={stateChanges}
                now={now}
              />
            </Suspense>
          ),
          assessmentTrends: (
            <div className="space-y-4">
              {assessmentTrendData.length > 0 ? (
                <Suspense fallback={<div className="h-72 rounded bg-zinc-800/50" />}>
                  <TrendCharts mode="assessment" data={assessmentTrendData} />
                </Suspense>
              ) : (
                <p className="text-body text-zinc-400">
                  Add a bilateral assessment on the Plan tab to start a trend here.
                </p>
              )}
              {/* Stage 02-B / F8 — dual-axis assessment-to-state correlation.
                  Sits below the per-session line so users can compare the
                  test trend against the driver muscles' flagged days from
                  M1. Empty-state copy lives inside the chart component. */}
              {assessments.length > 0 ? (
                <div className="rounded-10 border border-zinc-800 bg-zinc-950/40 p-3">
                  <p className="text-caption uppercase tracking-wide text-zinc-500">
                    Driver-muscle overlay
                  </p>
                  <div className="mt-2">
                    <Suspense fallback={<div className="h-72 rounded-10 bg-zinc-800/50" />}>
                      <BelowFoldCharts
                        mode="assessment-correlation"
                        assessments={assessments}
                        stateChanges={stateChanges}
                        drivers={ASSESSMENT_DRIVERS}
                        now={now}
                        windowDays={windowDays}
                      />
                    </Suspense>
                  </div>
                </div>
              ) : null}
            </div>
          ),
          stateChangeTimeline: (
            <StateChangeTimelineChart
              stateChanges={stateChanges}
              windowDays={windowDays}
              now={now}
            />
          ),
          patterns: (
            <PatternsSlot
              patternsDetected={patternsDetected}
              chains={chains}
              symmetrySummary={symmetrySummary}
              totalLogs={totalLogs}
              highIntensityCount={highIntensityCount}
            />
          ),
          history: (
            <HistorySlot
              view={view}
              onViewChange={onViewChange}
              filter={filter}
              onFilterChange={onFilterChange}
              weightedHeatScores={weightedHeatScores}
              filteredEntries={filteredEntries}
            />
          ),
        }}
      />
    </section>
  );
}
