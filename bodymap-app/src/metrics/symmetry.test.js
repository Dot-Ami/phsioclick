import { describe, expect, it } from "vitest";
import { symmetryIndex } from "./symmetry.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 5, 30, 12, 0, 0);

function daysAgo(n) {
  return new Date(NOW.getTime() - n * DAY_MS).toISOString();
}

describe("symmetryIndex", () => {
  it("returns a zero composite with an all-zero trend for an empty log", () => {
    const result = symmetryIndex({ stateChanges: [], now: NOW, windowDays: 30 });
    expect(result.composite).toBe(0);
    expect(result.perMuscle).toEqual([]);
    expect(result.trend).toHaveLength(30);
    expect(result.trend.every((t) => t.composite === 0)).toBe(true);
  });

  it("reports the full delta when only one side is ever flagged", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(4) },
    ];
    const result = symmetryIndex({ stateChanges, now: NOW, windowDays: 30 });
    expect(result.composite).toBe(5);
    expect(result.perMuscle).toEqual([
      { baseId: "hamstring", delta: 5, leftFlaggedDays: 5, rightFlaggedDays: 0 },
    ]);
  });

  it("reports zero delta for a perfectly mirrored bilateral log", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(2) },
      { muscleId: "hamstring-r", fromState: "normal", toState: "tight", timestamp: daysAgo(2) },
    ];
    const result = symmetryIndex({ stateChanges, now: NOW, windowDays: 30 });
    expect(result.composite).toBe(0);
  });

  it("averages deltas across multiple flagged base ids", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(4) }, // delta 5
      { muscleId: "quad-r", fromState: "normal", toState: "weak", timestamp: daysAgo(0) }, // delta 1
    ];
    const result = symmetryIndex({ stateChanges, now: NOW, windowDays: 30 });
    expect(result.composite).toBe(3); // (5 + 1) / 2
  });
});
