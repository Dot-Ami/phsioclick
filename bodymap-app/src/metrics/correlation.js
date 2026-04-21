// Stage 02-B / F2 — M9 (assessment-to-state correlation).
//
// For each assessment row in the window, emit a point with the
// assessment value (split L/R) and the flagged-day count for the driver
// muscles of that test, computed via M1 over the same window. The
// dashboard chart in F8 plots both axes; F2 only computes the data.
//
// `assessmentDrivers` is the lookup from `src/data/assessment-drivers.js`
// (created in F8). For F2 we accept it as an injected map so the metric
// stays pure and the F8 ticket can swap implementations without touching
// this file. Missing driver entries return zero flagged days, never throw.
//
// Inline doctests:
//
//   assessmentStateCorrelation({ assessments: [], stateChanges: [], drivers: {}, now })
//     -> []

import { asDate } from "./helpers.js";
import { stateDaysFlagged } from "./stateHistory.js";

function flaggedFor(drivers, testKey, side, { stateChanges, now, windowDays }) {
  const baseIds = drivers?.[testKey];
  if (!Array.isArray(baseIds) || baseIds.length === 0) return 0;
  let total = 0;
  for (const baseId of baseIds) {
    const muscleId = `${baseId}-${side}`;
    total += stateDaysFlagged({ stateChanges, muscleId, now, windowDays }).flaggedDays;
  }
  return total;
}

export function assessmentStateCorrelation({
  assessments,
  stateChanges,
  drivers,
  now,
  windowDays = 30,
}) {
  if (!Array.isArray(assessments) || assessments.length === 0) return [];
  const sorted = assessments
    .filter((a) => a && a.timestamp)
    .map((a) => ({ ...a, _ts: asDate(a.timestamp).getTime() }))
    .filter((a) => Number.isFinite(a._ts))
    .sort((a, b) => a._ts - b._ts);

  return sorted.map((a) => {
    const at = new Date(a._ts);
    const testKey = a.test || a.testKey || a.name;
    return {
      date: at.toISOString().slice(0, 10),
      testKey,
      assessmentValueLeft: Number(a.leftValue),
      assessmentValueRight: Number(a.rightValue),
      driverFlaggedDaysLeft: flaggedFor(drivers, testKey, "l", { stateChanges, now: at, windowDays }),
      driverFlaggedDaysRight: flaggedFor(drivers, testKey, "r", { stateChanges, now: at, windowDays }),
    };
  });
}
