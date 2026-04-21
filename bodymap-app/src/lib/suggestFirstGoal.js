// Stage 02-A.5 / U7 — suggestFirstGoal.
// Pure function used by step 5 of the onboarding wizard.
//
// Spec: stages/02a-ux-foundation/output/onboarding-flow.md §"Step 5 — Set
// your first goal", "Suggestion logic" bullets.
//
// Input:
//   intent — one of "tight-area" | "balance-training" | "rehab" | "learn" | null
//   muscleStates — { [muscleId]: { state, updatedAt? } }
//   entries — Array<{ originRegion, sensationRegion, sensationType, timestamp }>
//
// Output:
//   {
//     regionId,           // muscleId target ("" if none, e.g. for "explore" / "learn")
//     kind,               // "reduce" | "balance" | "explore" | "learn"
//     rationale: string,  // user-facing one-liner the wizard renders verbatim
//   }
//
// "kind" maps to a future Stage 02-B / F5 goal schema; for U7+U8 the wizard
// only needs the rationale string and the regionId.

import { fromMuscleId, getMuscleLabel } from "../muscle-data";

const DAY_MS = 24 * 60 * 60 * 1000;

function tightFlagDays(entries, muscleId) {
  if (!muscleId || !Array.isArray(entries)) return 0;
  const cutoff = Date.now() - 30 * DAY_MS;
  const days = new Set();
  for (const entry of entries) {
    if (!entry?.timestamp) continue;
    const ts = new Date(entry.timestamp).getTime();
    if (Number.isNaN(ts) || ts < cutoff) continue;
    if (entry.sensationType && entry.sensationType !== "tight") continue;
    const region = entry.sensationRegion || entry.originRegion;
    if (region !== muscleId) continue;
    days.add(new Date(ts).toISOString().slice(0, 10));
  }
  return days.size;
}

function pickHighestFlaggedTight(muscleStates, entries) {
  const tights = Object.entries(muscleStates || {}).filter(
    ([, v]) => v?.state === "tight",
  );
  if (tights.length === 0) return null;

  const ranked = tights
    .map(([muscleId, value]) => ({
      muscleId,
      days: tightFlagDays(entries, muscleId),
      updatedAt: value?.updatedAt ? new Date(value.updatedAt).getTime() : 0,
    }))
    .sort((a, b) => b.days - a.days || b.updatedAt - a.updatedAt);

  return ranked[0]?.muscleId || tights[0][0];
}

function pickFirstWeak(muscleStates) {
  const weaks = Object.entries(muscleStates || {}).filter(
    ([, v]) => v?.state === "weak",
  );
  if (weaks.length === 0) return null;
  return weaks
    .sort((a, b) => {
      const aTs = a[1]?.updatedAt ? new Date(a[1].updatedAt).getTime() : 0;
      const bTs = b[1]?.updatedAt ? new Date(b[1].updatedAt).getTime() : 0;
      return bTs - aTs;
    })[0][0];
}

function muscleNiceLabel(muscleId) {
  const label = getMuscleLabel(muscleId);
  if (!label) return "your flagged muscle";
  const parsed = fromMuscleId(muscleId);
  const sideWord =
    parsed?.side === "left" ? "left " : parsed?.side === "right" ? "right " : "";
  const stripped = label.replace(/\s*\([LR]\)$/, "");
  return `${sideWord}${stripped}`.trim().toLowerCase();
}

/**
 * @param {"tight-area"|"balance-training"|"rehab"|"learn"|null} intent
 * @param {Record<string, { state: string, updatedAt?: string }>} muscleStates
 * @param {Array<object>} entries
 * @returns {{ regionId: string, kind: "reduce"|"balance"|"explore"|"learn", rationale: string }}
 */
export function suggestFirstGoal(intent, muscleStates = {}, entries = []) {
  const tight = pickHighestFlaggedTight(muscleStates, entries);
  if (tight) {
    return {
      regionId: tight,
      kind: "reduce",
      rationale: `Reduce ${muscleNiceLabel(tight)} tight days by 50% over the next 30 days.`,
    };
  }

  const weak = pickFirstWeak(muscleStates);
  if (weak) {
    return {
      regionId: weak,
      kind: "balance",
      rationale: `Build strength in ${muscleNiceLabel(weak)} — return to balanced within 60 days.`,
    };
  }

  if (intent === "balance-training") {
    return {
      regionId: "",
      kind: "balance",
      rationale:
        "Improve your symmetry composite as you log training across both sides over the next 60 days.",
    };
  }

  if (intent === "learn") {
    return {
      regionId: "",
      kind: "learn",
      rationale: "Map and learn about 5 muscles in your body.",
    };
  }

  return {
    regionId: "",
    kind: "explore",
    rationale:
      "Flag your first muscle on the Body atlas — your goal will tune itself from there.",
  };
}
