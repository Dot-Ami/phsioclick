// Stage 02-B / F2 — M7 (adherence rate).
//
// `adherence[]` rows are written by F6's planner UI. Each row carries a
// `date` (local YYYY-MM-DD), a `remedyKey`, an optional `muscleId`, and a
// `status` of `"suggested" | "done" | "skipped"`. F2 only computes the
// rate; it does not write rows. Until F6 ships, every call returns the
// no-data shape and the BBS treats adherence as neutral.
//
// We compute:
//   suggested = total rows in window
//   done      = status === "done"
//   skipped   = status === "skipped"
//   adherenceRate = done / max(1, suggested)
//
// Inline doctests:
//
//   adherenceRate({ adherence: [], now, windowDays: 7 })
//     -> { weekStart, suggested: 0, done: 0, skipped: 0, adherenceRate: 0 }
//
//   3 rows, 2 done 1 skipped:
//     -> suggested: 3, done: 2, skipped: 1, adherenceRate: 2/3

import { addDays, asDate, dayKey, dayStart } from "./helpers.js";

export function adherenceRate({ adherence, now, windowDays = 7 }) {
  const today = dayStart(now);
  const start = addDays(today, -(windowDays - 1));
  const startKey = dayKey(start);
  const endKey = dayKey(today);

  let suggested = 0;
  let done = 0;
  let skipped = 0;
  for (const row of adherence || []) {
    if (!row || typeof row.date !== "string") continue;
    if (row.date < startKey || row.date > endKey) continue;
    suggested += 1;
    if (row.status === "done") done += 1;
    else if (row.status === "skipped") skipped += 1;
  }

  const rate = suggested > 0 ? done / suggested : 0;
  return {
    weekStart: dayKey(start),
    suggested,
    done,
    skipped,
    adherenceRate: rate,
    windowDays,
  };
}

// Convenience used by the BBS so cold-start can return a neutral 50.
export function hasAdherenceData(adherence) {
  return Array.isArray(adherence) && adherence.length > 0;
}

// Re-export for symmetry with other metrics.
export { asDate };
