// Stage 02-A.5 / U8 — checkMilestones.
// Diff catalog predicates against the persisted milestones[] and return the
// list of newly-fired milestone records (id + achievedAt) for the toast queue.
//
// Spec: stages/02a-ux-foundation/output/gamification-spec.md §3 + §4.
//
// Pure; takes:
//   state — see data/milestones.js for state shape.
//   alreadyAchieved — array of { id, achievedAt } from data.milestones.
//
// Returns:
//   { newlyFired: Array<{ id, achievedAt }>, catalog: Array<MilestoneMeta> }
//
// catalog includes meta for both static catalog entries and synthesized
// region-mastery entries the toast UI needs to render. The MilestoneToast
// pulls label / description / icon from this list.

import {
  MILESTONES,
  MILESTONE_INDEX,
  regionMasteryMilestone,
} from "../data/milestones";
import { computeRegionMasteryLevels } from "./regionMastery";

export function checkMilestones(state, alreadyAchieved = []) {
  const ts = new Date().toISOString();
  const seenIds = new Set(
    (alreadyAchieved || []).map((m) => m && m.id).filter(Boolean),
  );
  const newlyFired = [];
  const synthCatalog = [];

  for (const def of MILESTONES) {
    if (seenIds.has(def.id)) continue;
    let pass = false;
    try {
      pass = !!def.predicate(state);
    } catch {
      pass = false;
    }
    if (pass) {
      newlyFired.push({ id: def.id, achievedAt: ts });
      seenIds.add(def.id);
    }
  }

  const regionLevels = computeRegionMasteryLevels(state);
  for (const region of regionLevels) {
    if (region.level < 1) continue;
    for (let lvl = 1; lvl <= region.level; lvl += 1) {
      const meta = regionMasteryMilestone(region.regionId, region.regionLabel, lvl);
      synthCatalog.push(meta);
      if (!seenIds.has(meta.id)) {
        newlyFired.push({ id: meta.id, achievedAt: ts });
        seenIds.add(meta.id);
      }
    }
  }

  return {
    newlyFired,
    catalog: [...MILESTONES, ...synthCatalog],
  };
}

export function getMilestoneMeta(id, extraCatalog = []) {
  if (MILESTONE_INDEX[id]) return MILESTONE_INDEX[id];
  return extraCatalog.find((m) => m.id === id) || null;
}
