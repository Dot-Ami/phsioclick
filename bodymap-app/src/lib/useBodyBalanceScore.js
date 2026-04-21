// Stage 02-A.5 / U8 — useBodyBalanceScore.
// Returns { score, components, isCalibrating } and is the canonical
// integration point for the header chip, Today hero, and StreakBadge.
//
// Spec: stages/02a-ux-foundation/output/gamification-spec.md §1.
//
// Stage 02-A.5 / U8 shipped the cold-start path only. Stage 02-B / F2
// promotes this hook to live derivation: the metric pipeline in
// `src/metrics/*` (built in F2) computes the BBS composite from the
// `stateChanges`, `adherence`, and other v3 logs. The signature is
// unchanged — every consumer (TodayScreen, BodyBalanceScore header chip,
// StreakBadge breakdown) keeps working without edits.
//
// Cold-start contract preserved: until the user has at least 7 days of
// genuine `stateChanges` history, the hook returns
// `{ score: 50, components: { ...50 each }, isCalibrating: true }` so
// the UI can show the "Calibrating" tier.

import { useMemo } from "react";

import { computeBodyBalanceScore } from "../metrics/bodyBalanceScore.js";

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

/**
 * @param {object} state — { entries, assessments, muscleStates, stateChanges, adherence, now? }
 * @returns {{ score: number, components: object, composite: number, isCalibrating: boolean }}
 */
export function useBodyBalanceScore(state) {
  return useMemo(() => {
    if (!state) return COLD_START;
    const stateChanges = Array.isArray(state.stateChanges) ? state.stateChanges : [];
    const adherence = Array.isArray(state.adherence) ? state.adherence : [];
    // Allow callers to inject a clock (used by Stage 02-B trend snapshots
    // and tests). Production callers don't pass `now`; the live wall
    // clock is fine because the derivation is memoized per render.
    const now = state.now instanceof Date ? state.now : new Date();
    return computeBodyBalanceScore({ stateChanges, adherence, now });
  }, [state]);
}
