// Stage 02-B / F2 — metrics barrel.
//
// Anything that needs M1-M9 or the Body Balance Score should import from
// this file so swap-points stay stable. Each metric is pure, takes raw
// arrays + `now: Date` + `windowDays`, and returns the shape defined in
// stages/02-tracking-metrics/output/plan.md §2.
//
// No re-exports are bundled into a single object — named exports preserve
// tree-shaking for code-split UI surfaces (Today / Progress / Plan).

export {
  stateDaysFlagged,
  stateDaysFlaggedAll,
  stateDaysFlaggedAllAt,
  flipFrequency,
  stateChangesSpanDays,
} from "./stateHistory.js";
export { symmetryIndex } from "./symmetry.js";
export { tightnessWeaknessLoad } from "./load.js";
export { hotRegions } from "./hotRegions.js";
export { recoveryRate } from "./recovery.js";
export { adherenceRate, hasAdherenceData } from "./adherence.js";
export { goalProgress } from "./goals.js";
export { assessmentStateCorrelation } from "./correlation.js";
export { computeBodyBalanceScore } from "./bodyBalanceScore.js";
