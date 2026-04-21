// Stage 02-A.5 / U8 — Milestone catalog.
// Source of truth for one-time, named achievements.
// Spec: stages/02a-ux-foundation/output/gamification-spec.md §3.
//
// Each entry is a frozen { id, label, description, icon, predicate } where
// `predicate(state) -> boolean` is pure. State shape:
//
//   {
//     entries:      Array<entry>,
//     assessments:  Array<assessment>,
//     muscleStates: Record<muscleId, { state, updatedAt? }>,
//     goals:        Array<{ id, status?, ... }>,
//     streak:       { current, longest, lastActiveDate },
//     onboarding:   { completedAt, intent, tourSeen },
//     score:        number|null,         // current Body Balance Score
//   }
//
// Predicates may reference any of the above fields. They MUST be defensive
// against missing fields (treat undefined arrays as empty).
//
// Stage 02-B carry-over: when stateChanges[] lands, swap proxy predicates
// (e.g. body-explored-* counts unique muscleStates keys today; will count
// unique stateChanges.muscleId then). The catalog remains the single source.

const adherenceCount = (state) =>
  (state.entries || []).filter((e) => e?.kind === "adherence").length;

const flaggedMuscleIds = (state) => Object.keys(state.muscleStates || {});

export const MILESTONES = Object.freeze([
  {
    id: "first-flip",
    label: "First flag dropped",
    description: "You marked your first muscle on the atlas.",
    icon: "target",
    predicate: (s) => flaggedMuscleIds(s).length >= 1,
  },
  {
    id: "first-remedy-done",
    label: "First remedy completed",
    description: "Effort logged. That's the loop working.",
    icon: "check-circle-2",
    predicate: (s) => adherenceCount(s) >= 1,
  },
  {
    id: "first-assessment",
    label: "First assessment logged",
    description: "Baselines beat guesses every time.",
    icon: "ruler",
    predicate: (s) => (s.assessments || []).length >= 1,
  },
  {
    id: "first-goal",
    label: "First goal set",
    description: "Direction beats motion. Nice.",
    icon: "flag",
    predicate: (s) => (s.goals || []).length >= 1,
  },
  {
    id: "first-goal-hit",
    label: "First goal achieved",
    description: "Closed the loop on a goal you set yourself.",
    icon: "trophy",
    predicate: (s) =>
      (s.goals || []).some((g) => g?.status === "achieved"),
  },
  {
    id: "streak-3",
    label: "3-day streak",
    description: "Three days in a row of paying attention.",
    icon: "flame",
    predicate: (s) => (s.streak?.current || 0) >= 3 || (s.streak?.longest || 0) >= 3,
  },
  {
    id: "streak-7",
    label: "One-week streak",
    description: "A full week of showing up. That's a habit forming.",
    icon: "flame",
    predicate: (s) => (s.streak?.current || 0) >= 7 || (s.streak?.longest || 0) >= 7,
  },
  {
    id: "streak-30",
    label: "One-month streak",
    description: "Thirty days. Consistency is the work.",
    icon: "flame",
    predicate: (s) => (s.streak?.current || 0) >= 30 || (s.streak?.longest || 0) >= 30,
  },
  {
    id: "streak-100",
    label: "100-day streak",
    description: "Triple digits. This is how change compounds.",
    icon: "flame",
    predicate: (s) =>
      (s.streak?.current || 0) >= 100 || (s.streak?.longest || 0) >= 100,
  },
  {
    id: "intake-complete",
    label: "Intake wizard complete",
    description: "Welcome aboard. Your tools are tuned.",
    icon: "compass",
    predicate: (s) => !!s.onboarding?.completedAt,
  },
  {
    id: "body-explored-10",
    label: "Mapped 10 muscles",
    description: "Ten muscles in your map. You're learning the territory.",
    icon: "map",
    predicate: (s) => flaggedMuscleIds(s).length >= 10,
  },
  {
    id: "body-explored-30",
    label: "Mapped 30 muscles",
    description: "Thirty muscles. You know your body in fine detail now.",
    icon: "map",
    predicate: (s) => flaggedMuscleIds(s).length >= 30,
  },
  {
    id: "score-balanced",
    label: "Reached Balanced tier",
    description: "Body Balance Score in the Balanced range. Maintain and refine.",
    icon: "gauge",
    predicate: (s) => typeof s.score === "number" && s.score >= 60,
  },
  {
    id: "score-resilient",
    label: "Reached Resilient tier",
    description: "Strong, balanced, and consistent. Outstanding.",
    icon: "gauge",
    predicate: (s) => typeof s.score === "number" && s.score >= 80,
  },
]);

export const MILESTONE_INDEX = Object.freeze(
  MILESTONES.reduce((acc, m) => {
    acc[m.id] = m;
    return acc;
  }, {}),
);

// Region-mastery milestones are synthesized in lib/checkMilestones.js — see
// gamification-spec.md §4. Their ids look like `region-master-{regionId}-{level}`
// so the unlock event captures the level transition.
export function regionMasteryMilestone(regionId, regionLabel, level) {
  const id = `region-master-${regionId}-${level}`;
  const labelByLevel = {
    1: `Explored the ${regionLabel} region`,
    2: `Working on the ${regionLabel} region`,
    3: `Mastered the ${regionLabel} region`,
  };
  const descByLevel = {
    1: `You flagged your first ${regionLabel.toLowerCase()} muscle.`,
    2: `Assessment logged and a remedy completed for ${regionLabel.toLowerCase()}.`,
    3: `Every ${regionLabel.toLowerCase()} sub-muscle mapped and at least one returned to normal.`,
  };
  return {
    id,
    label: labelByLevel[level] || `Region progress: ${regionLabel}`,
    description: descByLevel[level] || "Region milestone unlocked.",
    icon: level === 3 ? "award" : level === 2 ? "trending-up" : "compass",
  };
}
