// Stage 02-A.5 / U8 — recordActivity.
// Pure (modulo Date.now in caller) helper that updates the streak block on a
// "meaningful action".
//
// Spec: stages/02a-ux-foundation/output/gamification-spec.md §2.
//
// Caller passes the current streak block and a Date (defaults to now); the
// returned block reflects the post-action streak. Caller persists.
//
//   const next = recordActivity(streak);
//   setStreak(next);
//
// Idempotent across same-day calls.

function localYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function previousYMD(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return localYMD(dt);
}

/**
 * @param {{current:number,longest:number,lastActiveDate:string|null}} streak
 * @param {Date} [now]
 */
export function recordActivity(streak, now = new Date()) {
  const safe = streak && typeof streak === "object"
    ? streak
    : { current: 0, longest: 0, lastActiveDate: null };
  const today = localYMD(now);
  const last = typeof safe.lastActiveDate === "string" ? safe.lastActiveDate : null;

  if (last === today) {
    return { ...safe };
  }

  if (last && last === previousYMD(today)) {
    const next = (safe.current || 0) + 1;
    return {
      current: next,
      longest: Math.max(safe.longest || 0, next),
      lastActiveDate: today,
    };
  }

  return {
    current: 1,
    longest: Math.max(safe.longest || 0, 1),
    lastActiveDate: today,
  };
}
