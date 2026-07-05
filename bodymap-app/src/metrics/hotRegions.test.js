import { describe, expect, it } from "vitest";
import { hotRegions } from "./hotRegions.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 5, 30, 12, 0, 0);

function daysAgo(n) {
  return new Date(NOW.getTime() - n * DAY_MS).toISOString();
}

describe("hotRegions", () => {
  it("returns an empty list when nothing is flagged", () => {
    expect(hotRegions({ stateChanges: [], now: NOW, windowDays: 7 })).toEqual([]);
  });

  it("ranks base ids by flagged days, descending", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(3) },
      { muscleId: "quad-r", fromState: "normal", toState: "weak", timestamp: daysAgo(1) },
    ];
    const result = hotRegions({ stateChanges, now: NOW, windowDays: 7 });
    expect(result).toHaveLength(2);
    expect(result[0].baseId).toBe("hamstring");
    expect(result[0].flaggedDays).toBe(4);
    expect(result[0].dominantState).toBe("tight");
    expect(result[1].baseId).toBe("quad");
    expect(result[1].dominantState).toBe("weak");
  });

  it("caps results at topN", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", toState: "tight", timestamp: daysAgo(1) },
      { muscleId: "quad-r", toState: "tight", timestamp: daysAgo(1) },
      { muscleId: "pec-upper-l", toState: "tight", timestamp: daysAgo(1) },
    ];
    const result = hotRegions({ stateChanges, now: NOW, windowDays: 7, topN: 2 });
    expect(result).toHaveLength(2);
  });

  it("resolves ties toward tight over weak", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", toState: "tight", timestamp: daysAgo(1) },
      { muscleId: "hamstring-r", toState: "weak", timestamp: daysAgo(1) },
    ];
    const result = hotRegions({ stateChanges, now: NOW, windowDays: 7 });
    expect(result[0].dominantState).toBe("tight");
  });
});
