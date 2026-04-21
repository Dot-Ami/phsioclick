// Stage 02-B / F2 — M4 (tightness / weakness load).
//
// Body-wide rollup. Sums tight/weak days across every muscle ever touched
// in `stateChanges`, then normalizes by `windowDays * muscleCount` so the
// gamification BBS can read the result as a [0,1] value.
//
// We use `muscleCount = max(1, distinct touched muscleIds)` rather than
// the full SUB_MUSCLES catalog. A user who has only ever flagged 4
// muscles should see a normalized number that reflects "how flagged are
// the muscles I track?" — not "how flagged is my entire body?". The BBS
// formula is calibrated against this denominator.
//
// Inline doctests:
//
//   tightnessWeaknessLoad({ stateChanges: [], now, windowDays: 30 })
//     -> { tightnessLoad: 0, weaknessLoad: 0,
//          normalizedTightness: 0, normalizedWeakness: 0, windowDays: 30 }
//
//   one muscle flagged tight for last 6 days (windowDays=30):
//     tightnessLoad: 6, weaknessLoad: 0,
//     normalizedTightness: 6 / (30 * 1) = 0.2

import { stateDaysFlaggedAll } from "./stateHistory.js";

export function tightnessWeaknessLoad({ stateChanges, now, windowDays = 30 }) {
  const m1 = stateDaysFlaggedAll({ stateChanges, now, windowDays });
  const muscleIds = Object.keys(m1.byMuscleId);
  const muscleCount = Math.max(1, muscleIds.length);

  let tightnessLoad = 0;
  let weaknessLoad = 0;
  for (const id of muscleIds) {
    tightnessLoad += m1.byMuscleId[id].tightDays;
    weaknessLoad += m1.byMuscleId[id].weakDays;
  }

  const denom = windowDays * muscleCount;
  return {
    tightnessLoad,
    weaknessLoad,
    normalizedTightness: denom > 0 ? tightnessLoad / denom : 0,
    normalizedWeakness: denom > 0 ? weaknessLoad / denom : 0,
    windowDays,
    muscleCount,
  };
}
