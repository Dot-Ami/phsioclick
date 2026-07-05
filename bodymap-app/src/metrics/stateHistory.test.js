import { describe, expect, it } from "vitest";
import { flipFrequency, stateChangesSpanDays, stateDaysFlagged, stateDaysFlaggedAll } from "./stateHistory.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 5, 30, 12, 0, 0);

function daysAgo(n) {
  return new Date(NOW.getTime() - n * DAY_MS).toISOString();
}

describe("stateDaysFlagged", () => {
  it("returns all zeros for an empty log", () => {
    const result = stateDaysFlagged({
      stateChanges: [],
      muscleId: "pec-upper-l",
      now: NOW,
      windowDays: 30,
    });
    expect(result).toEqual({
      muscleId: "pec-upper-l",
      tightDays: 0,
      weakDays: 0,
      flaggedDays: 0,
      windowDays: 30,
    });
  });

  it("counts today + every prior day since a single flip into tight", () => {
    const stateChanges = [
      { muscleId: "pec-upper-l", fromState: "normal", toState: "tight", timestamp: daysAgo(5) },
    ];
    const result = stateDaysFlagged({ stateChanges, muscleId: "pec-upper-l", now: NOW, windowDays: 30 });
    expect(result.tightDays).toBe(6);
    expect(result.flaggedDays).toBe(6);
  });

  it("stops counting once a later event clears the flag back to normal", () => {
    const stateChanges = [
      { muscleId: "pec-upper-l", fromState: "normal", toState: "tight", timestamp: daysAgo(10) },
      { muscleId: "pec-upper-l", fromState: "tight", toState: "normal", timestamp: daysAgo(3) },
    ];
    const result = stateDaysFlagged({ stateChanges, muscleId: "pec-upper-l", now: NOW, windowDays: 30 });
    // Flagged from 10 days ago through 4 days ago inclusive = 7 days.
    expect(result.tightDays).toBe(7);
    expect(result.flaggedDays).toBe(7);
  });

  it("ignores events for other muscles", () => {
    const stateChanges = [
      { muscleId: "pec-upper-r", fromState: "normal", toState: "tight", timestamp: daysAgo(5) },
    ];
    const result = stateDaysFlagged({ stateChanges, muscleId: "pec-upper-l", now: NOW, windowDays: 30 });
    expect(result.flaggedDays).toBe(0);
  });
});

describe("stateDaysFlaggedAll", () => {
  it("rolls bilateral muscle ids up into a shared baseId entry", () => {
    const stateChanges = [
      { muscleId: "pec-upper-l", fromState: "normal", toState: "tight", timestamp: daysAgo(4) },
      { muscleId: "pec-upper-r", fromState: "normal", toState: "weak", timestamp: daysAgo(2) },
    ];
    const result = stateDaysFlaggedAll({ stateChanges, now: NOW, windowDays: 30 });
    const rolled = result.byBaseId["pec-upper"];
    expect(rolled.tightDays_l).toBe(5);
    expect(rolled.weakDays_r).toBe(3);
    expect(rolled.flaggedDays_max).toBe(5);
    expect(rolled.flaggedDays_sum).toBe(8);
  });
});

describe("flipFrequency", () => {
  it("counts only events inside the window", () => {
    const stateChanges = [
      { muscleId: "pec-upper-l", toState: "tight", timestamp: daysAgo(2) },
      { muscleId: "pec-upper-l", toState: "normal", timestamp: daysAgo(1) },
      { muscleId: "pec-upper-l", toState: "tight", timestamp: daysAgo(40) }, // outside a 7-day window
    ];
    const result = flipFrequency({ stateChanges, now: NOW, windowDays: 7 });
    expect(result.totalFlips).toBe(2);
    expect(result.byMuscleId["pec-upper-l"].flipCount).toBe(2);
  });
});

describe("stateChangesSpanDays", () => {
  it("returns 0 for fewer than two events", () => {
    expect(stateChangesSpanDays([])).toBe(0);
    expect(stateChangesSpanDays([{ timestamp: daysAgo(1) }])).toBe(0);
  });

  it("returns the day span between the earliest and latest event", () => {
    const stateChanges = [{ timestamp: daysAgo(10) }, { timestamp: daysAgo(1) }, { timestamp: daysAgo(5) }];
    expect(stateChangesSpanDays(stateChanges)).toBe(9);
  });
});
