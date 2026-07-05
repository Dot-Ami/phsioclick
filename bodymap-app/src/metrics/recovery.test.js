import { describe, expect, it } from "vitest";
import { recoveryRate } from "./recovery.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 5, 30, 12, 0, 0);

function daysAgo(n) {
  return new Date(NOW.getTime() - n * DAY_MS).toISOString();
}

describe("recoveryRate", () => {
  it("returns zeros for an empty log", () => {
    const result = recoveryRate({ stateChanges: [], now: NOW, windowDays: 30 });
    expect(result).toEqual({
      totalFlags: 0,
      recovered: 0,
      pending: 0,
      stillFlagged: 0,
      recoveryRate: 0,
      recoveryWindowDays: 14,
      windowDays: 30,
    });
  });

  it("counts a flag that returned to normal within the recovery window as recovered", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(5) },
      { muscleId: "hamstring-l", fromState: "tight", toState: "normal", timestamp: daysAgo(2) },
    ];
    const result = recoveryRate({ stateChanges, now: NOW, windowDays: 30 });
    expect(result.totalFlags).toBe(1);
    expect(result.recovered).toBe(1);
    expect(result.recoveryRate).toBe(1);
  });

  it("counts a still-unresolved recent flag as pending, not stillFlagged", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(5) },
    ];
    const result = recoveryRate({ stateChanges, now: NOW, windowDays: 30 });
    expect(result.totalFlags).toBe(1);
    expect(result.pending).toBe(1);
    expect(result.recoveryRate).toBe(0);
  });

  it("counts a flag that outlived the recovery window as stillFlagged", () => {
    // The window is the half-open interval (now - windowDays, now], so use
    // 29 days ago (inside the 30-day window, past the 14-day recovery window).
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(29) },
    ];
    const result = recoveryRate({ stateChanges, now: NOW, windowDays: 30, recoveryWindowDays: 14 });
    expect(result.totalFlags).toBe(1);
    expect(result.stillFlagged).toBe(1);
    expect(result.recoveryRate).toBe(0);
  });

  it("counts a flip straight to another non-normal state as stillFlagged", () => {
    const stateChanges = [
      { muscleId: "hamstring-l", fromState: "normal", toState: "tight", timestamp: daysAgo(10) },
      { muscleId: "hamstring-l", fromState: "tight", toState: "weak", timestamp: daysAgo(5) },
    ];
    const result = recoveryRate({ stateChanges, now: NOW, windowDays: 30 });
    expect(result.stillFlagged).toBeGreaterThanOrEqual(1);
  });
});
