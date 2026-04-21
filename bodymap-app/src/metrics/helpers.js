// Stage 02-B / F2 — shared helpers for src/metrics/*.
//
// Hard rules (kept identical across every metric file):
//   - Pure. No localStorage, no Date.now(), no React, no fetch.
//   - Every public metric takes a `now: Date` so callers can run them
//     against historical snapshots (used by symmetry trend + goal baseline).
//   - Bilateral aggregation always goes through `fromMuscleId()` from
//     `src/muscle-data.js`. No string slicing on muscle IDs.
//
// All windows are interpreted as the half-open interval
// `(now - windowDays * 1d, now]` measured in milliseconds. We use local
// calendar days for `dayKey()` so streaks and "today" framing agree with
// the user's wall clock.

import { fromMuscleId } from "../muscle-data.js";

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function asDate(value) {
  if (value instanceof Date) return value;
  return new Date(value);
}

// Local-time YYYY-MM-DD key. Used by every per-day metric so the same
// "today" answer holds across timezones and DST flips.
export function dayKey(date) {
  const d = asDate(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Local-time start-of-day. Endpoint of the day's "what was the state?" query.
export function dayStart(date) {
  const d = asDate(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function dayEnd(date) {
  const d = asDate(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function addDays(date, n) {
  const d = asDate(date);
  return new Date(d.getTime() + n * MS_PER_DAY);
}

// Returns the array of `windowDays` Date objects representing dayStart()
// for each day in (now - windowDays, now], oldest first.
export function daysInWindow(now, windowDays) {
  const end = dayStart(now);
  const out = [];
  for (let i = windowDays - 1; i >= 0; i -= 1) {
    out.push(addDays(end, -i));
  }
  return out;
}

// Group an array by a key function into a Map<string, T[]>.
export function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (key == null) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

// Resolve `{ baseId, side }` from a muscleId without slicing strings.
// Returns side as "l" / "r" / null so it round-trips with toMuscleId().
export function splitMuscleId(muscleId) {
  const info = fromMuscleId(muscleId);
  if (!info) return { baseId: muscleId, side: null };
  if (info.side === "left") return { baseId: info.slug, side: "l" };
  if (info.side === "right") return { baseId: info.slug, side: "r" };
  return { baseId: info.slug, side: null };
}

export function clamp(min, max, value) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
