// Stage 02-B / F2 — M6 (recovery rate).
//
// Of all flips into tight/weak whose timestamp falls inside the window,
// what percentage transitioned back to "normal" within
// `recoveryWindowDays` (default 14)? A flag followed by another non-normal
// state without hitting normal first counts as "stillFlagged" — that is
// the explicit edge case in the spec.
//
// The window is for the *origination* of the flag. Recovery may happen
// after `now` for events near the window edge — those are counted as
// "pending" until `recoveryWindowDays` actually elapses.
//
// Inline doctests:
//
//   recoveryRate({ stateChanges: [], now, windowDays: 30 })
//     -> { totalFlags: 0, recovered: 0, pending: 0, stillFlagged: 0,
//          recoveryRate: 0, recoveryWindowDays: 14 }
//
//   one tight flag 5 days ago, returned to normal 2 days ago:
//     -> totalFlags: 1, recovered: 1, recoveryRate: 1
//
//   one tight flag 5 days ago, never returned (now=today):
//     -> totalFlags: 1, pending: 1, recoveryRate: 0
//
//   one tight flag 30 days ago, never returned, recoveryWindowDays=14:
//     -> totalFlags: 1, stillFlagged: 1, recoveryRate: 0

import { asDate, MS_PER_DAY } from "./helpers.js";

const NON_NORMAL = new Set(["tight", "weak"]);

export function recoveryRate({
  stateChanges,
  now,
  windowDays = 30,
  recoveryWindowDays = 14,
}) {
  const nowTs = asDate(now).getTime();
  const windowStart = nowTs - windowDays * MS_PER_DAY;
  const recoveryMs = recoveryWindowDays * MS_PER_DAY;

  // Sort once so per-muscle "next event" lookups are linear.
  const sorted = (stateChanges || [])
    .filter((ev) => ev && ev.muscleId && ev.timestamp)
    .map((ev) => ({ ...ev, _ts: asDate(ev.timestamp).getTime() }))
    .filter((ev) => Number.isFinite(ev._ts))
    .sort((a, b) => a._ts - b._ts);

  // Per-muscle ordered list of timestamps so we can scan forward from a
  // flag and find the first event with timestamp > flag._ts.
  const byMuscle = new Map();
  for (const ev of sorted) {
    if (!byMuscle.has(ev.muscleId)) byMuscle.set(ev.muscleId, []);
    byMuscle.get(ev.muscleId).push(ev);
  }

  let totalFlags = 0;
  let recovered = 0;
  let pending = 0;
  let stillFlagged = 0;

  for (const ev of sorted) {
    if (ev._ts <= windowStart || ev._ts > nowTs) continue;
    if (!NON_NORMAL.has(ev.toState)) continue;
    totalFlags += 1;

    const list = byMuscle.get(ev.muscleId) || [];
    const idx = list.indexOf(ev);
    let resolved = false;
    for (let i = idx + 1; i < list.length; i += 1) {
      const next = list[i];
      const dt = next._ts - ev._ts;
      if (dt > recoveryMs) break;
      if (next.toState === "normal") {
        recovered += 1;
        resolved = true;
        break;
      }
      // Edge case: tight -> weak (or weak -> tight) without hitting normal
      // counts as stillFlagged for recovery purposes per spec §2.6.
      stillFlagged += 1;
      resolved = true;
      break;
    }
    if (resolved) continue;

    // No qualifying next event in the recovery window — either still
    // pending (recoveryWindow hasn't elapsed yet) or genuinely stuck.
    if (nowTs - ev._ts < recoveryMs) pending += 1;
    else stillFlagged += 1;
  }

  const denom = totalFlags - pending;
  const rate = denom > 0 ? recovered / denom : 0;

  return {
    totalFlags,
    recovered,
    pending,
    stillFlagged,
    recoveryRate: rate,
    recoveryWindowDays,
    windowDays,
  };
}
