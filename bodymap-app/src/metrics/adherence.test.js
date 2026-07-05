import { describe, expect, it } from "vitest";
import { adherenceRate, hasAdherenceData } from "./adherence.js";
import { dayKey } from "./helpers.js";

const NOW = new Date(2026, 5, 30, 12, 0, 0);

function dateNDaysAgo(n) {
  return dayKey(new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000));
}

describe("adherenceRate", () => {
  it("returns the no-data shape for an empty log", () => {
    const result = adherenceRate({ adherence: [], now: NOW, windowDays: 7 });
    expect(result.suggested).toBe(0);
    expect(result.done).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.adherenceRate).toBe(0);
  });

  it("computes the rate from done vs skipped rows in the window", () => {
    const adherence = [
      { date: dateNDaysAgo(1), status: "done" },
      { date: dateNDaysAgo(2), status: "done" },
      { date: dateNDaysAgo(3), status: "skipped" },
    ];
    const result = adherenceRate({ adherence, now: NOW, windowDays: 7 });
    expect(result.suggested).toBe(3);
    expect(result.done).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.adherenceRate).toBeCloseTo(2 / 3, 6);
  });

  it("excludes rows outside the window", () => {
    const adherence = [{ date: dateNDaysAgo(20), status: "done" }];
    const result = adherenceRate({ adherence, now: NOW, windowDays: 7 });
    expect(result.suggested).toBe(0);
  });
});

describe("hasAdherenceData", () => {
  it("is false for an empty or non-array input", () => {
    expect(hasAdherenceData([])).toBe(false);
    expect(hasAdherenceData(null)).toBe(false);
  });

  it("is true once at least one row exists", () => {
    expect(hasAdherenceData([{ date: "2026-01-01", status: "done" }])).toBe(true);
  });
});
