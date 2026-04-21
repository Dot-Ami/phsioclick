// Stage 02-B / F2 — Body Balance Score composite.
//
// Wraps M3 (symmetry composite), M4 (normalized tightness), M6 (recovery
// rate), M7 (adherence rate) into the single 0..100 hero number defined
// in stages/02a-ux-foundation/output/gamification-spec.md §1.
//
//   BodyBalanceScore = round(
//       0.40 * symmetryComponent      // 100 - composite * 5,        clamp 0..100
//     + 0.30 * tightnessComponent     // (1 - normalizedTightness) * 100, clamp 0..100
//     + 0.20 * recoveryComponent      // recoveryRate * 100; default 50 if no flags
//     + 0.10 * adherenceComponent     // adherenceRate * 100; default 50 if no rows
//   )
//
// Cold-start contract (per gamification-spec §1):
//   - A user with < 7 days of stateChanges history shows score 50 with
//     `isCalibrating: true` so the UI can render the "Calibrating" tier.
//   - Otherwise we compute the live composite. The hook in
//     `src/lib/useBodyBalanceScore.js` is the canonical integration point.

import { adherenceRate, hasAdherenceData } from "./adherence.js";
import { clamp } from "./helpers.js";
import { tightnessWeaknessLoad } from "./load.js";
import { recoveryRate } from "./recovery.js";
import { stateChangesSpanDays } from "./stateHistory.js";
import { symmetryIndex } from "./symmetry.js";

const COLD_START = Object.freeze({
  score: 50,
  components: Object.freeze({
    symmetry: 50,
    tightness: 50,
    recovery: 50,
    adherence: 50,
  }),
  composite: 0,
  isCalibrating: true,
});

export function computeBodyBalanceScore({ stateChanges, adherence, now, windowDays = 30 }) {
  const span = stateChangesSpanDays(stateChanges);
  if (span < 7) {
    return { ...COLD_START, components: { ...COLD_START.components } };
  }

  const sym = symmetryIndex({ stateChanges, now, windowDays, trendDays: 1 });
  const load = tightnessWeaknessLoad({ stateChanges, now, windowDays });
  const rec = recoveryRate({ stateChanges, now, windowDays });
  const adh = adherenceRate({ adherence, now, windowDays: 7 });

  const symmetryComponent = clamp(0, 100, 100 - sym.composite * 5);
  const tightnessComponent = clamp(0, 100, (1 - load.normalizedTightness) * 100);
  const recoveryComponent = rec.totalFlags > 0 ? clamp(0, 100, rec.recoveryRate * 100) : 50;
  const adherenceComponent = hasAdherenceData(adherence) && adh.suggested > 0
    ? clamp(0, 100, adh.adherenceRate * 100)
    : 50;

  const score = Math.round(
    0.40 * symmetryComponent +
      0.30 * tightnessComponent +
      0.20 * recoveryComponent +
      0.10 * adherenceComponent
  );

  return {
    score,
    components: {
      symmetry: Math.round(symmetryComponent),
      tightness: Math.round(tightnessComponent),
      recovery: Math.round(recoveryComponent),
      adherence: Math.round(adherenceComponent),
    },
    composite: sym.composite,
    isCalibrating: false,
  };
}
