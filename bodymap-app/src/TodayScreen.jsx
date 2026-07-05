// Stage 02-A.5 / U2 + U3 — TodayScreen.
// Job: "What should I do right now?"
// Layout per stages/02a-ux-foundation/output/screens.md "Today screen":
//   - Hero: BodyBalanceScore (real components once `stateChanges` spans 7+
//     days; the hook's own cold-start contract still renders "Calibrating"
//     for brand-new users)
//   - Card: Today's Session (derived from muscleStates as a stand-in for
//     SessionPlanner's session logic until U-Phase 1 wires it deeper)
//   - Card: Hot Regions (real M5 `hotRegions()` from src/metrics)
//   - Below the fold: Recent activity
//   - Empty state when there's no activity to surface

import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  Compass,
  Flame,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import BodyBalanceScore from "./BodyBalanceScore";
import { hotRegions } from "./metrics/hotRegions";
import { getMuscleLabel } from "./muscle-data";

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function timeAgo(timestamp) {
  const ms = Date.now() - new Date(timestamp).getTime();
  if (ms < 60_000) return "just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function summarizeSession(muscleStates) {
  const flagged = Object.entries(muscleStates).filter(
    ([, value]) => value?.state && value.state !== "normal",
  );
  if (flagged.length === 0) return null;
  const tightCount = flagged.filter(([, v]) => v.state === "tight").length;
  const weakCount = flagged.filter(([, v]) => v.state === "weak").length;
  const moves = Math.min(6, Math.max(2, flagged.length));
  const minutes = Math.min(40, Math.max(10, flagged.length * 6));
  const focus = [];
  if (tightCount > 0) focus.push(`${tightCount} tight`);
  if (weakCount > 0) focus.push(`${weakCount} weak`);
  return {
    moveCount: moves,
    minutes,
    focusLine: `${focus.join(" • ")} — focus areas pulled from your flags`,
    sample: flagged.slice(0, 3).map(([id, value]) => ({
      id,
      state: value.state,
      label: getMuscleLabel(id) || id,
    })),
  };
}

export default function TodayScreen({
  entries,
  muscleStates,
  stateChanges,
  bbs,
  bbsTrend,
  onOpenBody,
  onOpenPlan,
  onOpenProgress,
}) {
  const hotRegionsList = useMemo(
    () => hotRegions({ stateChanges: stateChanges ?? [], now: new Date(), windowDays: 7 }),
    [stateChanges],
  );
  const session = useMemo(() => summarizeSession(muscleStates), [muscleStates]);

  const recentActivity = useMemo(() => {
    return entries
      .slice()
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 4);
  }, [entries]);

  const hasAnyData = entries.length > 0 || Object.keys(muscleStates).length > 0;

  return (
    <section aria-labelledby="today-screen-title" className="space-y-4">
      <header className="px-1">
        <h2 id="today-screen-title" className="text-h2 text-zinc-100">
          Welcome back, athlete.
        </h2>
        <p className="mt-1 text-caption text-zinc-400">Today is {formatToday()}.</p>
      </header>

      {hasAnyData ? (
        <>
          <BodyBalanceScore
            components={bbs?.isCalibrating ? null : bbs?.components ?? null}
            trend={bbsTrend ?? null}
          />

          <article
            aria-label="Today's session"
            className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-zinc-400">
                <Activity size={14} aria-hidden="true" />
                Today&apos;s session
              </p>
              <button
                type="button"
                onClick={onOpenPlan}
                className="inline-flex items-center gap-1 text-caption text-brand hover:text-brand-hover"
              >
                Open Plan <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
            {session ? (
              <div className="mt-3 space-y-3">
                <p className="text-body-lg text-zinc-100">
                  <span className="tabular-nums">{session.moveCount}</span> movements ·{" "}
                  <span className="tabular-nums">~{session.minutes} min</span>
                </p>
                <p className="text-caption text-zinc-400">{session.focusLine}</p>
                <ul className="space-y-1 text-body text-zinc-300">
                  {session.sample.map((item, index) => (
                    <li key={item.id} className="flex items-baseline gap-2">
                      <span className="tabular-nums text-zinc-500">
                        {index + 1}.
                      </span>
                      <span>
                        {item.label}
                        <span className="ml-1 text-caption text-zinc-500">
                          ({item.state})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={onOpenPlan}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-caption font-semibold text-zinc-950 transition-colors duration-150 ease-out hover:bg-brand-hover"
                >
                  Start session <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-body text-zinc-300">
                  No session yet. Flag a tight or weak muscle to generate one.
                </p>
                <button
                  type="button"
                  onClick={onOpenBody}
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-caption text-zinc-100 hover:border-zinc-600"
                >
                  Open Body atlas <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            )}
          </article>

          <article
            aria-label="Hot regions"
            className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-zinc-400">
                <Flame size={14} aria-hidden="true" />
                Hot regions
              </p>
              <button
                type="button"
                onClick={onOpenBody}
                className="inline-flex items-center gap-1 text-caption text-brand hover:text-brand-hover"
              >
                View all on Body <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
            {hotRegionsList.length === 0 ? (
              <p className="mt-3 text-body text-zinc-400">
                Nothing flagged in the last week.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {hotRegionsList.map((region) => {
                  const stateClass =
                    region.dominantState === "weak"
                      ? "text-state-weak"
                      : "text-state-tight";
                  return (
                    <li
                      key={region.baseId}
                      className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={onOpenBody}
                        className="flex w-full items-center justify-between gap-3 text-left"
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
            )}
          </article>

          <details className="rounded-14 border border-zinc-800 bg-zinc-900/40 p-4">
            <summary className="flex cursor-pointer items-center justify-between text-caption uppercase tracking-wide text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} aria-hidden="true" />
                Recent activity
              </span>
              <span className="text-zinc-500">{recentActivity.length}</span>
            </summary>
            {recentActivity.length === 0 ? (
              <p className="mt-3 text-body text-zinc-400">
                Nothing logged yet today. Open Body to flag a muscle.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {recentActivity.map((entry) => {
                  const region = entry.sensationRegion || entry.originRegion;
                  const label = region ? getMuscleLabel(region) || region : "Logged";
                  return (
                    <li
                      key={entry.id}
                      className="flex items-baseline justify-between gap-2 text-body text-zinc-300"
                    >
                      <span>
                        <span className="text-caption uppercase tracking-wide text-zinc-500">
                          {entry.sensationType || "log"}
                        </span>
                        <span className="ml-2">{label}</span>
                      </span>
                      <span className="text-caption tabular-nums text-zinc-500">
                        {timeAgo(entry.timestamp)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-caption text-zinc-500">
              Full history lives on{" "}
              <button
                type="button"
                onClick={onOpenProgress}
                className="text-brand hover:text-brand-hover"
              >
                Progress
              </button>
              .
            </p>
          </details>
        </>
      ) : (
        <article
          aria-label="Get started"
          className="rounded-14 border border-zinc-800 bg-zinc-900/60 px-4 py-12 text-center"
        >
          <HeartPulse
            size={32}
            aria-hidden="true"
            className="mx-auto text-zinc-500"
          />
          <h3 className="mt-3 text-h2 text-zinc-100">
            Let&apos;s start by mapping how you feel.
          </h3>
          <p className="mt-2 text-body-lg text-zinc-400">
            Tap Body to flag a tight or weak area, or run the intake wizard from Plan.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onOpenPlan}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-caption font-semibold text-zinc-950 transition-colors duration-150 ease-out hover:bg-brand-hover"
            >
              <Compass size={16} aria-hidden="true" />
              Run intake wizard
            </button>
            <button
              type="button"
              onClick={onOpenBody}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-caption text-zinc-100 hover:border-zinc-600"
            >
              <Activity size={16} aria-hidden="true" />
              Open Body atlas
            </button>
          </div>
          <BodyBalanceScore components={null} trend={null} />
        </article>
      )}
    </section>
  );
}
