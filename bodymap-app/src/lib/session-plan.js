// Stage 02-A.5 / U5 — Shared plan-builder utilities.
// Factored out of SessionPlanner.jsx so the new TodayScreen, PlanScreen, and
// WeeklyStrip can all derive plans from the same source of truth.
//
// Pure functions; no React. Inputs are app-level data (muscleStates entries +
// metadata); outputs are plain objects describing a session or a week.
//
// Stage 02-A scope: keep the existing day-template heuristics and the
// state-priority sort. Real periodization lands in Stage 02-B (F5+F7).

import { fromMuscleId, getMuscleLabel, SUB_MUSCLES } from "../muscle-data";
import { getRemedies } from "../data/remedies";

const STATE_PRIORITY = { tight: 1, weak: 2 };
const TYPE_ORDER = {
  release: 0,
  stretch: 1,
  mobilize: 2,
  activate: 3,
  strengthen: 4,
};

export const DAY_TEMPLATES = {
  mobility: { label: "Mobility / Recovery", sections: ["tight"] },
  upper: {
    label: "Upper Body",
    groups: [
      "chest",
      "deltoids",
      "trapezius",
      "biceps",
      "triceps",
      "upper-back",
      "forearm",
      "neck",
    ],
  },
  lower: {
    label: "Lower Body",
    groups: [
      "quadriceps",
      "hamstring",
      "gluteal",
      "calves",
      "adductors",
      "tibialis",
      "hip-flexors",
    ],
  },
  full: { label: "Full Body", groups: null },
};

const PARENT_OF_SUB = (() => {
  const map = new Map();
  for (const [parent, subs] of Object.entries(SUB_MUSCLES)) {
    for (const sub of subs) map.set(sub.id, parent);
  }
  return map;
})();

/**
 * Normalise muscleStates dict → sorted [muscleId, val] entries with state ≠ normal.
 * @param {Record<string, { state: string }>} muscleStates
 */
export function listMarkedMuscles(muscleStates) {
  return Object.entries(muscleStates || {})
    .filter(([, v]) => v?.state && v.state !== "normal")
    .sort(
      (a, b) =>
        (STATE_PRIORITY[a[1].state] || 9) - (STATE_PRIORITY[b[1].state] || 9),
    );
}

/**
 * Build a single ordered session block: tight → release/stretch first, then
 * weak → activate/strengthen. Each entry includes the recommended remedies.
 *
 * @param {Record<string, { state: string }>} muscleStates
 * @returns {{ tight: SessionItem[], weak: SessionItem[], moveCount: number, minutes: number }}
 */
export function buildSessionPlan(muscleStates) {
  const marked = listMarkedMuscles(muscleStates);
  const tightItems = [];
  const weakItems = [];

  for (const [muscleId, val] of marked) {
    const parsed = fromMuscleId(muscleId);
    if (!parsed) continue;
    const remedies = [...getRemedies(parsed.slug, val.state)].sort(
      (a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9),
    );
    const item = {
      muscleId,
      label: getMuscleLabel(muscleId) || muscleId,
      state: val.state,
      remedies: remedies.slice(0, 3),
    };
    if (val.state === "tight") tightItems.push(item);
    else if (val.state === "weak") weakItems.push(item);
  }

  const moveCount = Math.min(6, Math.max(2, marked.length));
  const minutes = Math.min(40, Math.max(10, marked.length * 6));

  return {
    tight: tightItems,
    weak: weakItems,
    moveCount,
    minutes,
  };
}

const isUpper = (g) => DAY_TEMPLATES.upper.groups.includes(g);
const isLower = (g) => DAY_TEMPLATES.lower.groups.includes(g);

/**
 * Build a multi-day weekly plan from marked muscle states. Returns 1–3 day
 * objects: optional Mobility, then Upper, then Lower (in that order).
 *
 * @param {Record<string, { state: string }>} muscleStates
 */
export function buildWeeklyPlan(muscleStates) {
  const marked = listMarkedMuscles(muscleStates);

  const tightByGroup = {};
  const weakByGroup = {};

  for (const [muscleId, val] of marked) {
    const parsed = fromMuscleId(muscleId);
    if (!parsed) continue;
    const parent = PARENT_OF_SUB.get(parsed.slug) || parsed.slug;
    const bucket = val.state === "tight" ? tightByGroup : weakByGroup;
    if (!bucket[parent]) bucket[parent] = [];
    bucket[parent].push(muscleId);
  }

  const upperTight = Object.keys(tightByGroup).filter(isUpper);
  const lowerTight = Object.keys(tightByGroup).filter(isLower);
  const upperWeak = Object.keys(weakByGroup).filter(isUpper);
  const lowerWeak = Object.keys(weakByGroup).filter(isLower);

  const days = [];

  if (upperTight.length > 0 || lowerTight.length > 0) {
    days.push({
      type: "mobility",
      label: "Day 1 — Mobility / Recovery",
      muscleIds: [
        ...upperTight.flatMap((g) => tightByGroup[g]),
        ...lowerTight.flatMap((g) => tightByGroup[g]),
      ],
      focus: "tight",
    });
  }

  if (upperWeak.length > 0 || upperTight.length > 0) {
    days.push({
      type: "upper",
      label: `Day ${days.length + 1} — Upper Body`,
      muscleIds: [
        ...upperTight.flatMap((g) => tightByGroup[g]),
        ...upperWeak.flatMap((g) => weakByGroup[g]),
      ],
      focus: "mixed",
    });
  }

  if (lowerWeak.length > 0 || lowerTight.length > 0) {
    days.push({
      type: "lower",
      label: `Day ${days.length + 1} — Lower Body`,
      muscleIds: [
        ...lowerTight.flatMap((g) => tightByGroup[g]),
        ...lowerWeak.flatMap((g) => weakByGroup[g]),
      ],
      focus: "mixed",
    });
  }

  if (days.length === 0 && marked.length > 0) {
    days.push({
      type: "full",
      label: "Day 1 — Full Body",
      muscleIds: marked.map(([id]) => id),
      focus: "mixed",
    });
  }

  return days;
}

/**
 * Distribute up to 7 day objects across Mon..Sun. Uses simple spacing so the
 * limited day templates we have land on distinct calendar days. Stage 02-B
 * will replace this with the F7 periodization schedule.
 *
 * @param {ReturnType<typeof buildWeeklyPlan>} weekly
 * @returns {Array<{ dayName: string, label: string | null, type: string | null, muscleIds: string[], isToday: boolean, isRest: boolean, isPast: boolean }>}
 */
export function distributeWeekDays(weekly, today = new Date()) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const jsDay = today.getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;

  const layout = new Array(7).fill(null);

  if (weekly && weekly.length > 0) {
    const slots = [todayIdx, todayIdx + 2, todayIdx + 4, todayIdx + 5]
      .map((n) => n % 7)
      .slice(0, weekly.length);
    weekly.forEach((day, i) => {
      const slot = slots[i];
      layout[slot] = day;
    });
  }

  return dayNames.map((dayName, idx) => {
    const day = layout[idx];
    return {
      dayName,
      label: day?.label || null,
      type: day?.type || null,
      muscleIds: day?.muscleIds || [],
      isToday: idx === todayIdx,
      isRest: !day,
      isPast: idx < todayIdx,
    };
  });
}
