// Stage 02-A.5 / U8 — Region mastery (per-region 0-3 level).
// Spec: stages/02a-ux-foundation/output/gamification-spec.md §4.
//
// Pure derivation from { entries, assessments, muscleStates }.
// Region = parent slug from muscle-data SUB_MUSCLES (e.g. "gluteal", "chest").
//
// Stage 02-B carry-over: when stateChanges[] persists, re-derive level 3
// (`Mastered`) from real recovery transitions instead of "no longer flagged"
// heuristic. The contract — { regionId, regionLabel, level, name } — is stable.

import { SUB_MUSCLES, fromMuscleId, getMuscleLabel } from "../muscle-data";

const REGION_LABELS = {
  chest: "Chest",
  obliques: "Obliques",
  abs: "Abs",
  biceps: "Biceps",
  triceps: "Triceps",
  neck: "Neck",
  trapezius: "Trapezius",
  deltoids: "Shoulders",
  forearm: "Forearm",
  quadriceps: "Quadriceps",
  hamstring: "Hamstrings",
  gluteal: "Glutes",
  calves: "Calves",
  "upper-back": "Upper back",
  "lower-back": "Lower back",
  adductors: "Adductors",
  tibialis: "Shin",
  "hip-flexors": "Hip flexors",
};

const LEVEL_NAMES = ["Unexplored", "Explored", "Working", "Mastered"];

function regionForMuscleId(muscleId) {
  const parsed = fromMuscleId(muscleId);
  if (!parsed) return null;
  // sub-muscle slugs aren't direct keys of SUB_MUSCLES; map back via label match
  if (SUB_MUSCLES[parsed.slug]) return parsed.slug;
  for (const [parent, subs] of Object.entries(SUB_MUSCLES)) {
    if (subs.some((s) => s.id === parsed.slug)) return parent;
  }
  return null;
}

export function computeRegionMasteryLevels(state) {
  const { entries = [], assessments = [], muscleStates = {} } = state || {};

  const flaggedByRegion = {};
  for (const muscleId of Object.keys(muscleStates)) {
    const region = regionForMuscleId(muscleId);
    if (!region) continue;
    if (!flaggedByRegion[region]) flaggedByRegion[region] = new Set();
    flaggedByRegion[region].add(muscleId);
  }

  const adherenceByRegion = {};
  for (const entry of entries) {
    if (entry?.kind !== "adherence" || !entry.muscleId) continue;
    const region = regionForMuscleId(entry.muscleId);
    if (!region) continue;
    adherenceByRegion[region] = (adherenceByRegion[region] || 0) + 1;
  }

  const assessmentByRegion = {};
  for (const assessment of assessments) {
    const candidate = assessment?.muscleId || assessment?.targetMuscleId;
    const region = candidate ? regionForMuscleId(candidate) : null;
    if (region) {
      assessmentByRegion[region] = (assessmentByRegion[region] || 0) + 1;
    }
  }

  const allRegions = new Set([
    ...Object.keys(SUB_MUSCLES),
    ...Object.keys(flaggedByRegion),
    ...Object.keys(adherenceByRegion),
    ...Object.keys(assessmentByRegion),
  ]);

  const out = [];
  for (const region of allRegions) {
    const flaggedCount = flaggedByRegion[region]?.size || 0;
    const remediesDone = adherenceByRegion[region] || 0;
    const assessmentsDone = assessmentByRegion[region] || 0;
    const subs = SUB_MUSCLES[region] || [];
    const allSubsFlagged =
      subs.length > 0 &&
      subs.every((s) =>
        Object.keys(flaggedByRegion[region] || {}).length === 0
          ? false
          : Array.from(flaggedByRegion[region] || []).some((id) => id.startsWith(`${s.id}-`)),
      );

    let level = 0;
    if (flaggedCount >= 1) level = 1;
    if (level === 1 && remediesDone >= 1 && assessmentsDone >= 1) level = 2;
    if (level === 2 && allSubsFlagged) level = 3;

    out.push({
      regionId: region,
      regionLabel: REGION_LABELS[region] || titleize(region),
      level,
      name: LEVEL_NAMES[level],
      flaggedCount,
      remediesDone,
      assessmentsDone,
    });
  }

  out.sort((a, b) => b.level - a.level || a.regionLabel.localeCompare(b.regionLabel));
  return out;
}

function titleize(slug) {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function muscleLabelOrId(id) {
  return getMuscleLabel(id) || id;
}
