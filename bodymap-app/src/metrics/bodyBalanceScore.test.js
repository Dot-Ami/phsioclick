import { describe, expect, it } from "vitest";
import { computeBodyBalanceScore } from "./bodyBalanceScore.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 5, 30, 12, 0, 0);

function daysAgo(n) {
  return new Date(NOW.getTime() - n * DAY_MS).toISOString();
}

describe("computeBodyBalanceScore", () => {
  it("is calibrating with a neutral 50 score under 7 days of history", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(2) },
    ];
    const result = computeBodyBalanceScore({ stateChanges, adherence: [], now: NOW });
    expect(result.isCalibrating).toBe(true);
    expect(result.score).toBe(50);
    expect(result.components).toEqual({ symmetry: 50, tightness: 50, recovery: 50, adherence: 50 });
  });

  it("computes a live score once span reaches 7+ days, defaulting neutral recovery/adherence", () => {
    // stateChangesSpanDays needs 2+ events to establish a non-zero span.
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(10) },
      { muscleId: "hamstring-l", fromState: "tight", toState: "normal", timestamp: daysAgo(0) },
    ];
    const result = computeBodyBalanceScore({ stateChanges, adherence: [], now: NOW });
    expect(result.isCalibrating).toBe(false);
    // adherence defaults to 50 (no adherence rows logged yet).
    expect(result.components.adherence).toBe(50);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("rewards perfect symmetry and low tightness with a higher score", () => {
    const balanced = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(9) },
      { muscleId: "hamstring-r", fromState: "normal", toState: "tight", timestamp: daysAgo(9) },
      { muscleId: "hamstring-l", fromState: "tight", toState: "normal", timestamp: daysAgo(8) },
      { muscleId: "hamstring-r", fromState: "tight", toState: "normal", timestamp: daysAgo(8) },
    ];
    const imbalanced = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(10) },
      { muscleId: "hamstring-r", fromState: "normal", toState: "normal", timestamp: daysAgo(0) },
    ];
    const balancedScore = computeBodyBalanceScore({ stateChanges: balanced, adherence: [], now: NOW });
    const imbalancedScore = computeBodyBalanceScore({ stateChanges: imbalanced, adherence: [], now: NOW });
    expect(balancedScore.score).toBeGreaterThan(imbalancedScore.score);
  });
});
