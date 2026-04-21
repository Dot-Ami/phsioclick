// Stage 02-B / F2 — M8 (goal progress).
//
// For each goal, compute the relevant Stage-02 metric at goal.createdAt
// (baseline) and at `now` (current), then derive a 0..1 progressPct
// toward `targetValue`. `onTrack` is the linear-expectation check from
// the spec: `progressPct >= elapsedDays / targetWindowDays * 0.8`.
//
// Goal kinds (per plan.md §3.3):
//   reduce-flagged-days  -> M1 for goal.targetMuscleId, lower is better
//   improve-symmetry     -> M3 composite, lower is better
//   hit-adherence        -> M7 adherence rate, higher is better
//   freeform             -> no progress bar (returns progressPct: null)
//
// Until F5 ships the GoalsPanel UI, F1 persists `goals: []` literal so
// every call here returns []. The function still works against an
// arbitrary in-memory `goals[]` array passed by tests.
//
// Inline doctests:
//
//   goalProgress({ goals: [], stateChanges: [], adherence: [], now, windowDays })
//     -> []

import { adherenceRate } from "./adherence.js";
import { asDate, MS_PER_DAY } from "./helpers.js";
import { stateDaysFlagged } from "./stateHistory.js";
import { symmetryIndex } from "./symmetry.js";

function clamp01(x) {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function progressLowerIsBetter(baseline, current, target) {
  if (baseline <= target) return 1;
  return clamp01((baseline - current) / (baseline - target));
}

function progressHigherIsBetter(baseline, current, target) {
  if (target <= baseline) return 1;
  return clamp01((current - baseline) / (target - baseline));
}

function computeOne(goal, { stateChanges, adherence, now }) {
  const targetWindowDays = Number.isFinite(goal.targetWindowDays) ? goal.targetWindowDays : 30;
  const createdAt = asDate(goal.createdAt || now);
  const elapsedDays = Math.max(0, (asDate(now).getTime() - createdAt.getTime()) / MS_PER_DAY);
  const expected = clamp01(elapsedDays / Math.max(1, targetWindowDays));

  let baseline = 0;
  let current = 0;
  let target = Number.isFinite(goal.targetValue) ? goal.targetValue : 0;
  let progressPct = null;

  if (goal.kind === "reduce-flagged-days") {
    const muscleId = goal.targetMuscleId;
    if (muscleId) {
      baseline = stateDaysFlagged({ stateChanges, muscleId, now: createdAt, windowDays: targetWindowDays }).flaggedDays;
      current = stateDaysFlagged({ stateChanges, muscleId, now, windowDays: targetWindowDays }).flaggedDays;
      progressPct = progressLowerIsBetter(baseline, current, target);
    }
  } else if (goal.kind === "improve-symmetry") {
    baseline = symmetryIndex({ stateChanges, now: createdAt, windowDays: targetWindowDays, trendDays: 1 }).composite;
    current = symmetryIndex({ stateChanges, now, windowDays: targetWindowDays, trendDays: 1 }).composite;
    progressPct = progressLowerIsBetter(baseline, current, target);
  } else if (goal.kind === "hit-adherence") {
    baseline = adherenceRate({ adherence, now: createdAt, windowDays: targetWindowDays }).adherenceRate;
    current = adherenceRate({ adherence, now, windowDays: targetWindowDays }).adherenceRate;
    progressPct = progressHigherIsBetter(baseline, current, target);
  } else {
    progressPct = null;
  }

  const onTrack = progressPct == null ? null : progressPct >= expected * 0.8;
  let status = goal.status || "active";
  if (progressPct != null && progressPct >= 1 && status === "active") status = "achieved";

  return {
    goalId: goal.id,
    kind: goal.kind,
    baseline,
    current,
    target,
    progressPct,
    status,
    onTrack,
    elapsedDays,
    targetWindowDays,
  };
}

export function goalProgress({ goals, stateChanges, adherence, now }) {
  if (!Array.isArray(goals) || goals.length === 0) return [];
  return goals.map((goal) => computeOne(goal, { stateChanges, adherence, now }));
}
