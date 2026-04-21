// Stage 02-B / F2 — M1 (state days flagged) + M2 (flip frequency).
//
// Both metrics replay `stateChanges[]` to reconstruct the per-muscle
// step-function of state. M1 then asks "on how many calendar days in the
// window was this muscle in tight or weak?" and M2 asks "how many flips
// happened inside the window?".
//
// Inline doctests (verified by hand against the spec in
// stages/02-tracking-metrics/output/plan.md §2.1 / §2.2):
//
//   stateDaysFlagged({ stateChanges: [], muscleId: "pec-upper-l", now, windowDays: 30 })
//     -> { muscleId, tightDays: 0, weakDays: 0, flaggedDays: 0, windowDays: 30 }
//
//   single flip into tight 5 days ago, no clear:
//     -> tightDays: 6 (today + 5 prior days), flaggedDays: 6
//
//   two flips: tight 10 days ago, normal 3 days ago:
//     -> tightDays: 7 (10 days ago through 4 days ago), flaggedDays: 7

import { addDays, asDate, dayEnd, dayStart, daysInWindow, groupBy, splitMuscleId } from "./helpers.js";

const NORMAL = "normal";

// Replay a sorted list of stateChanges for a single muscle and return the
// state at `at` (Date). If the muscle has no events <= at, returns "normal".
function stateAt(events, at) {
  const t = at.getTime();
  let current = NORMAL;
  for (const ev of events) {
    if (asDate(ev.timestamp).getTime() > t) break;
    current = ev.toState || NORMAL;
  }
  return current;
}

// M1 for one muscle. The events list is filtered & sorted internally.
export function stateDaysFlagged({ stateChanges, muscleId, now, windowDays = 30 }) {
  const filtered = (stateChanges || [])
    .filter((ev) => ev && ev.muscleId === muscleId)
    .map((ev) => ({ ...ev, _ts: asDate(ev.timestamp).getTime() }))
    .sort((a, b) => a._ts - b._ts);

  let tightDays = 0;
  let weakDays = 0;
  for (const day of daysInWindow(now, windowDays)) {
    const state = stateAt(filtered, dayEnd(day));
    if (state === "tight") tightDays += 1;
    else if (state === "weak") weakDays += 1;
  }
  return {
    muscleId,
    tightDays,
    weakDays,
    flaggedDays: tightDays + weakDays,
    windowDays,
  };
}

// M1 across all muscles seen in `stateChanges`. Returns:
//   { byMuscleId: { [muscleId]: { tightDays, weakDays, flaggedDays, ... } },
//     byBaseId:   { [baseId]:   { tightDays_l, tightDays_r, tightDays_max,
//                                 tightDays_sum, weakDays_*, flaggedDays_* } },
//     windowDays }
//
// Bilateral aggregation goes through `splitMuscleId` (which calls
// `fromMuscleId`) so we never slice "-l" / "-r" off a string by hand.
export function stateDaysFlaggedAll({ stateChanges, now, windowDays = 30 }) {
  const muscleIds = [...new Set((stateChanges || []).map((ev) => ev?.muscleId).filter(Boolean))];
  const byMuscleId = {};
  for (const muscleId of muscleIds) {
    byMuscleId[muscleId] = stateDaysFlagged({ stateChanges, muscleId, now, windowDays });
  }

  const byBaseId = {};
  for (const muscleId of muscleIds) {
    const { baseId, side } = splitMuscleId(muscleId);
    if (!byBaseId[baseId]) {
      byBaseId[baseId] = {
        baseId,
        tightDays_l: 0,
        tightDays_r: 0,
        weakDays_l: 0,
        weakDays_r: 0,
        flaggedDays_l: 0,
        flaggedDays_r: 0,
      };
    }
    const m = byMuscleId[muscleId];
    if (side === "l") {
      byBaseId[baseId].tightDays_l += m.tightDays;
      byBaseId[baseId].weakDays_l += m.weakDays;
      byBaseId[baseId].flaggedDays_l += m.flaggedDays;
    } else if (side === "r") {
      byBaseId[baseId].tightDays_r += m.tightDays;
      byBaseId[baseId].weakDays_r += m.weakDays;
      byBaseId[baseId].flaggedDays_r += m.flaggedDays;
    } else {
      byBaseId[baseId].tightDays_l += m.tightDays;
      byBaseId[baseId].weakDays_l += m.weakDays;
      byBaseId[baseId].flaggedDays_l += m.flaggedDays;
    }
  }
  for (const baseId of Object.keys(byBaseId)) {
    const b = byBaseId[baseId];
    b.tightDays_max = Math.max(b.tightDays_l, b.tightDays_r);
    b.tightDays_sum = b.tightDays_l + b.tightDays_r;
    b.weakDays_max = Math.max(b.weakDays_l, b.weakDays_r);
    b.weakDays_sum = b.weakDays_l + b.weakDays_r;
    b.flaggedDays_max = Math.max(b.flaggedDays_l, b.flaggedDays_r);
    b.flaggedDays_sum = b.flaggedDays_l + b.flaggedDays_r;
  }

  return { byMuscleId, byBaseId, windowDays };
}

// M2 — flip frequency in the window. A "flip" is any stateChanges row
// whose timestamp falls in (now - windowDays, now]. Per-muscle and per
// base-ID rollups so the planner / dashboard charts can pick a side.
export function flipFrequency({ stateChanges, now, windowDays = 30 }) {
  const nowTs = asDate(now).getTime();
  const windowStart = nowTs - windowDays * 24 * 60 * 60 * 1000;
  const inWindow = (stateChanges || []).filter((ev) => {
    const t = asDate(ev?.timestamp).getTime();
    return Number.isFinite(t) && t > windowStart && t <= nowTs;
  });

  const byMuscle = groupBy(inWindow, (ev) => ev.muscleId);
  const byMuscleId = {};
  for (const [muscleId, events] of byMuscle.entries()) {
    byMuscleId[muscleId] = {
      muscleId,
      flipCount: events.length,
      flipsPerWeek: (events.length / windowDays) * 7,
    };
  }

  const byBaseId = {};
  for (const muscleId of Object.keys(byMuscleId)) {
    const { baseId } = splitMuscleId(muscleId);
    if (!byBaseId[baseId]) {
      byBaseId[baseId] = { baseId, flipCount: 0, flipsPerWeek: 0 };
    }
    byBaseId[baseId].flipCount += byMuscleId[muscleId].flipCount;
    byBaseId[baseId].flipsPerWeek += byMuscleId[muscleId].flipsPerWeek;
  }

  return { byMuscleId, byBaseId, windowDays, totalFlips: inWindow.length };
}

// Convenience for callers that need to know whether the user has enough
// genuine history for the cold-start "Calibrating" copy to drop.
export function stateChangesSpanDays(stateChanges) {
  const events = (stateChanges || [])
    .filter((ev) => ev && ev.timestamp)
    .map((ev) => asDate(ev.timestamp).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  if (events.length < 2) return 0;
  return Math.floor((events[events.length - 1] - events[0]) / (24 * 60 * 60 * 1000));
}

// Internal helper exported for symmetry trend reuse: given a snapshot
// date `at`, recompute M1 across all muscles as if `now = at`.
export function stateDaysFlaggedAllAt({ stateChanges, at, windowDays }) {
  return stateDaysFlaggedAll({ stateChanges, now: at, windowDays });
}

// Re-exported for symmetry / hot-region rollups that want the day axis.
export { daysInWindow, dayStart, addDays };
