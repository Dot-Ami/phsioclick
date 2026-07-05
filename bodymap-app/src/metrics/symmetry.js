// Stage 02-B / F2 — M3 (symmetry index).
//
// Per base ID: delta = |leftFlaggedDays - rightFlaggedDays| in window.
// Composite: mean of per-muscle deltas across base IDs whose left+right
//            flagged days > 0 (so unflagged muscles don't dilute the signal).
// Trend:     daily recompute over `trendDays` (default = windowDays).
//
// Inline doctests:
//
//   symmetryIndex({ stateChanges: [], now, windowDays: 30 })
//     -> { composite: 0, perMuscle: [], trend: [...30 zeros...], windowDays: 30 }
//
//   single-flip log on left only (5 days):
//     -> perMuscle: [{ baseId, delta: 5, leftFlaggedDays: 5, rightFlaggedDays: 0 }]
//        composite: 5
//
//   bilateral mirrored log (3 days each side):
//     -> delta 0, composite 0 (perfect symmetry)

import { addDays, dayStart } from "./helpers.js";
import { stateDaysFlaggedAll } from "./stateHistory.js";

function compositeFromByBaseId(byBaseId) {
  const deltas = [];
  for (const baseId of Object.keys(byBaseId)) {
    const b = byBaseId[baseId];
    const total = b.flaggedDays_l + b.flaggedDays_r;
    if (total <= 0) continue;
    deltas.push(Math.abs(b.flaggedDays_l - b.flaggedDays_r));
  }
  if (deltas.length === 0) return 0;
  return deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
}

export function symmetryIndex({ stateChanges, now, windowDays = 30, trendDays }) {
  const m1 = stateDaysFlaggedAll({ stateChanges, now, windowDays });
  const composite = compositeFromByBaseId(m1.byBaseId);

  const perMuscle = Object.values(m1.byBaseId)
    .filter((b) => b.flaggedDays_l + b.flaggedDays_r > 0)
    .map((b) => ({
      baseId: b.baseId,
      delta: Math.abs(b.flaggedDays_l - b.flaggedDays_r),
      leftFlaggedDays: b.flaggedDays_l,
      rightFlaggedDays: b.flaggedDays_r,
    }))
    .sort((a, b) => b.delta - a.delta);

  // Trend: for each of the last `trendDays` days, recompute the composite
  // as if "now" were that day's end. This is what the SymmetryTrendHero
  // sparkline plots so the user can watch their balance improve.
  const span = Number.isFinite(trendDays) ? trendDays : windowDays;
  const trend = [];
  const today = dayStart(now);
  for (let i = span - 1; i >= 0; i -= 1) {
    const at = addDays(today, -i);
    const dailyM1 = stateDaysFlaggedAll({ stateChanges, now: at, windowDays });
    trend.push({ date: at.toISOString().slice(0, 10), composite: compositeFromByBaseId(dailyM1.byBaseId) });
  }

  return { windowDays, composite, perMuscle, trend };
}
