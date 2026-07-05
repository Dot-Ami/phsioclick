import { describe, expect, it } from "vitest";
import { tightnessWeaknessLoad } from "./load.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 5, 30, 12, 0, 0);

function daysAgo(n) {
  return new Date(NOW.getTime() - n * DAY_MS).toISOString();
}

describe("tightnessWeaknessLoad", () => {
  it("returns zeros for an empty log", () => {
    const result = tightnessWeaknessLoad({ stateChanges: [], now: NOW, windowDays: 30 });
    expect(result).toEqual({
      tightnessLoad: 0,
      weaknessLoad: 0,
      normalizedTightness: 0,
      normalizedWeakness: 0,
      windowDays: 30,
      muscleCount: 1,
    });
  });

  it("normalizes by windowDays * distinct touched muscles", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(5) },
    ];
    const result = tightnessWeaknessLoad({ stateChanges, now: NOW, windowDays: 30 });
    expect(result.tightnessLoad).toBe(6);
    expect(result.muscleCount).toBe(1);
    expect(result.normalizedTightness).toBeCloseTo(6 / 30, 6);
  });

  it("counts weakness load separately from tightness load", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "weak", timestamp: daysAgo(5) },
    ];
    const result = tightnessWeaknessLoad({ stateChanges, now: NOW, windowDays: 30 });
    expect(result.tightnessLoad).toBe(0);
    expect(result.weaknessLoad).toBe(6);
  });
});
