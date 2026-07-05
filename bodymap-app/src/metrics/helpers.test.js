import { describe, expect, it } from "vitest";
import { addDays, clamp, dayKey, dayEnd, dayStart, daysInWindow, groupBy, splitMuscleId } from "./helpers.js";

describe("dayKey", () => {
  it("formats a Date as local YYYY-MM-DD", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("pads single-digit month and day", () => {
    expect(dayKey(new Date(2026, 8, 1))).toBe("2026-09-01");
  });
});

describe("dayStart / dayEnd", () => {
  it("dayStart zeroes the time-of-day", () => {
    const d = dayStart(new Date(2026, 5, 15, 13, 45, 30));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  it("dayEnd is 23:59:59.999", () => {
    const d = dayEnd(new Date(2026, 5, 15, 13, 45, 30));
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
    expect(d.getMilliseconds()).toBe(999);
  });
});

describe("addDays", () => {
  it("adds whole days", () => {
    const start = new Date(2026, 0, 1);
    expect(dayKey(addDays(start, 5))).toBe("2026-01-06");
  });

  it("subtracts days with a negative n", () => {
    const start = new Date(2026, 0, 10);
    expect(dayKey(addDays(start, -5))).toBe("2026-01-05");
  });
});

describe("daysInWindow", () => {
  it("returns windowDays entries ending at now's day, oldest first", () => {
    const now = new Date(2026, 0, 10);
    const days = daysInWindow(now, 3);
    expect(days).toHaveLength(3);
    expect(dayKey(days[0])).toBe("2026-01-08");
    expect(dayKey(days[2])).toBe("2026-01-10");
  });
});

describe("groupBy", () => {
  it("groups items by the key function, skipping null keys", () => {
    const items = [{ k: "a", v: 1 }, { k: "b", v: 2 }, { k: "a", v: 3 }, { k: null, v: 4 }];
    const grouped = groupBy(items, (i) => i.k);
    expect(grouped.get("a")).toEqual([{ k: "a", v: 1 }, { k: "a", v: 3 }]);
    expect(grouped.get("b")).toEqual([{ k: "b", v: 2 }]);
    expect(grouped.has(null)).toBe(false);
  });
});

describe("splitMuscleId", () => {
  it("splits a left-side id into baseId + side 'l'", () => {
    expect(splitMuscleId("pec-upper-l")).toEqual({ baseId: "pec-upper", side: "l" });
  });

  it("splits a right-side id into baseId + side 'r'", () => {
    expect(splitMuscleId("pec-upper-r")).toEqual({ baseId: "pec-upper", side: "r" });
  });

  it("treats a midline id as having no side", () => {
    expect(splitMuscleId("core-rectus-abdominis")).toEqual({
      baseId: "core-rectus-abdominis",
      side: null,
    });
  });
});

describe("clamp", () => {
  it("passes values through when inside range", () => {
    expect(clamp(0, 100, 50)).toBe(50);
  });

  it("clamps below the minimum", () => {
    expect(clamp(0, 100, -10)).toBe(0);
  });

  it("clamps above the maximum", () => {
    expect(clamp(0, 100, 150)).toBe(100);
  });
});
