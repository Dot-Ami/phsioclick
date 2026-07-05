// Stage 02-A.5 / U5 — GoalCard for the Plan screen.
// Spec: stages/02a-ux-foundation/output/screens.md "Plan screen / Your goals".
//
// Stage 02-B / F5 — when real `goals[]` rows exist, progress ring + captions
// read from M8 (`goalProgress`) so the at-a-glance card matches GoalsPanel.

import { useMemo } from "react";
import { Plus, Sparkles, Target } from "lucide-react";
import { listMarkedMuscles } from "./lib/session-plan";
import { getMuscleLabel, fromMuscleId } from "./muscle-data";
import { goalProgress } from "./metrics";

function ProgressRing({ pct }) {
  const safe = Math.max(0, Math.min(100, pct));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;
  return (
    <svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      aria-hidden="true"
      className="-rotate-90 text-brand"
    >
      <circle
        cx={22}
        cy={22}
        r={radius}
        className="stroke-zinc-700"
        strokeWidth={4}
        fill="none"
      />
      <circle
        cx={22}
        cy={22}
        r={radius}
        className="stroke-brand"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function deriveStarterGoal(muscleStates) {
  const tights = listMarkedMuscles(muscleStates).filter(([, v]) => v.state === "tight");
  if (tights.length === 0) return null;
  const [muscleId] = tights[0];
  const parsed = fromMuscleId(muscleId);
  return {
    id: "starter-tight",
    label: `Reduce ${getMuscleLabel(muscleId)} tight days by 50%`,
    targetMuscleId: parsed?.slug || muscleId,
    progressPct: 0,
    daysLeft: 14,
    status: "starter",
  };
}

function goalTitle(goal) {
  if (goal.status === "starter") return goal.label;
  if (goal.kind === "freeform") return goal.label || goal.notes || "Freeform goal";
  if (goal.kind === "hit-adherence") {
    const t = Number.isFinite(goal.targetValue) ? Math.round(goal.targetValue * 100) : "—";
    return `Weekly adherence ≥ ${t}%`;
  }
  if (goal.kind === "improve-symmetry") {
    return `Symmetry composite ≤ ${Number.isFinite(goal.targetValue) ? goal.targetValue : "—"}`;
  }
  if (goal.kind === "reduce-flagged-days" && goal.targetMuscleId) {
    return `Fewer flagged days — ${getMuscleLabel(goal.targetMuscleId)}`;
  }
  return goal.label || goal.notes || "Goal";
}

export default function GoalCard({ muscleStates, goals = [], stateChanges = [], adherence = [], onAddGoal }) {
  const starter = useMemo(() => deriveStarterGoal(muscleStates), [muscleStates]);

  const visible = goals.length > 0 ? goals.filter((g) => g.status !== "archived") : starter ? [starter] : [];

  // Captured once per render (not memoized — it's just a Date construction,
  // and every metric below should see the same wall clock within a render).
  const now = new Date();

  // `now` is a fresh Date every render, so memoizing this on [goals,
  // stateChanges, adherence, now] would never actually skip work — compute
  // it directly instead of paying for a useMemo that can't hit its cache.
  const progressById = {};
  if (goals.length) {
    const rows = goalProgress({
      goals: goals.filter((g) => g.status !== "archived"),
      stateChanges,
      adherence,
      now,
    });
    for (const r of rows) progressById[r.goalId] = r;
  }

  return (
    <article
      aria-label="Your goals"
      className="rounded-14 border border-zinc-800 bg-zinc-900/60 p-4"
    >
      <header className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-caption uppercase tracking-wide text-zinc-400">
          <Target size={14} aria-hidden="true" />
          Your goals
        </p>
        <button
          type="button"
          onClick={onAddGoal}
          className="inline-flex items-center gap-1 text-caption text-brand hover:text-brand-hover"
        >
          <Plus size={14} aria-hidden="true" />
          New goal
        </button>
      </header>

      {visible.length === 0 ? (
        <p className="mt-3 text-body text-zinc-300">
          No goals yet. Flag a tight or weak area on Body, or add a goal below.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {visible.slice(0, 2).map((goal) => {
            const progress = progressById[goal.id];
            const pct =
              goal.status === "starter"
                ? 0
                : progress?.progressPct != null && Number.isFinite(progress.progressPct)
                  ? Math.round(progress.progressPct * 100)
                  : 0;
            const onTrack = progress?.onTrack;
            const status = progress?.status || goal.status;

            return (
              <li
                key={goal.id}
                className="flex items-center gap-3 rounded-10 border border-zinc-800 bg-zinc-950/60 p-3"
              >
                <ProgressRing pct={pct} />
                <div className="min-w-0 flex-1">
                  <p className="text-body-lg text-zinc-100">{goalTitle(goal)}</p>
                  <p className="mt-0.5 text-caption text-zinc-400">
                    {goal.status === "starter" ? (
                      <span className="inline-flex items-center gap-1 text-brand">
                        <Sparkles size={12} aria-hidden="true" /> Suggested
                      </span>
                    ) : status === "achieved" ? (
                      <span className="text-state-balanced">Achieved</span>
                    ) : progress?.progressPct == null ? (
                      <span>Tracking by hand</span>
                    ) : (
                      <span>
                        {pct}% toward target
                        {onTrack ? (
                          <span className="ml-1 text-state-balanced"> · on track</span>
                        ) : (
                          <span className="ml-1 text-state-tight"> · behind pace</span>
                        )}
                      </span>
                    )}
                    {typeof goal.daysLeft === "number" ? (
                      <span className="ml-2 text-zinc-500">
                        · ~{goal.daysLeft} day{goal.daysLeft === 1 ? "" : "s"} left
                      </span>
                    ) : null}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {goals.filter((g) => g.status !== "archived").length > 2 ? (
        <p className="mt-2 text-caption text-zinc-500">
          +{goals.filter((g) => g.status !== "archived").length - 2} more in the full goals panel
          below.
        </p>
      ) : null}
    </article>
  );
}
