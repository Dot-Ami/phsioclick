// Stage 02-B / F2 — M5 (hot regions this week).
//
// Top-N base IDs by flagged days in the last `windowDays` (default 7).
// Returns a label resolved through `getMuscleLabel` so the Today / Progress
// cards can render without knowing about the muscle catalog.
//
// dominantState reads tight vs weak across both sides; ties resolve to
// "tight" (the more common diagnostic pattern in this app).
//
// Inline doctests:
//
//   hotRegions({ stateChanges: [], now, windowDays: 7 })  -> []
//
//   one muscle flagged tight 4 days, another flagged weak 2 days:
//     -> [{ baseId: A, flaggedDays: 4, dominantState: "tight" },
//         { baseId: B, flaggedDays: 2, dominantState: "weak" }]

import { getMuscleLabel } from "../muscle-data.js";
import { stateDaysFlaggedAll } from "./stateHistory.js";

export function hotRegions({ stateChanges, now, windowDays = 7, topN = 5 }) {
  const m1 = stateDaysFlaggedAll({ stateChanges, now, windowDays });
  const rows = Object.values(m1.byBaseId)
    .filter((b) => b.flaggedDays_l + b.flaggedDays_r > 0)
    .map((b) => {
      const flaggedDays = Math.max(b.flaggedDays_l, b.flaggedDays_r);
      const tightTotal = b.tightDays_l + b.tightDays_r;
      const weakTotal = b.weakDays_l + b.weakDays_r;
      const dominantState = weakTotal > tightTotal ? "weak" : "tight";
      // Region label: we resolve via the left-side ID first, falling back
      // to right or the bare base ID. getMuscleLabel returns the input
      // unchanged if it can't find a match, which is fine for headers.
      const label =
        getMuscleLabel(`${b.baseId}-l`) ||
        getMuscleLabel(`${b.baseId}-r`) ||
        getMuscleLabel(b.baseId) ||
        b.baseId;
      return {
        baseId: b.baseId,
        label: typeof label === "string" ? label.replace(/\s*\((L|R)\)$/, "") : b.baseId,
        flaggedDays,
        flaggedDays_l: b.flaggedDays_l,
        flaggedDays_r: b.flaggedDays_r,
        dominantState,
      };
    })
    .sort((a, b) => b.flaggedDays - a.flaggedDays);

  return rows.slice(0, topN);
}
