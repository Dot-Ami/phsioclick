import { describe, expect, it } from "vitest";
import { migrateBlobToV3 } from "./BodyMapApp.jsx";

describe("migrateBlobToV3", () => {
  it("passes through non-object input unchanged", () => {
    expect(migrateBlobToV3(null)).toBe(null);
    expect(migrateBlobToV3(undefined)).toBe(undefined);
  });

  it("upgrades an empty blob to a valid v3 shape with empty logs", () => {
    const result = migrateBlobToV3({});
    expect(result.schemaVersion).toBe(3);
    expect(result.stateChanges).toEqual([]);
    expect(result.goals).toEqual([]);
    expect(result.adherence).toEqual([]);
    expect(result.dailySnapshots).toEqual([]);
  });

  it("is idempotent on an already-v3 blob (no duplicate seeding)", () => {
    const v3Blob = {
      schemaVersion: 3,
      stateChanges: [
        {
          id: "sc-1",
          muscleId: "hamstring-l",
          fromState: "normal",
          toState: "tight",
          timestamp: "2026-01-01T00:00:00.000Z",
          source: "manual",
        },
      ],
      goals: [],
      adherence: [],
      dailySnapshots: [],
    };
    const result = migrateBlobToV3(v3Blob);
    expect(result.schemaVersion).toBe(3);
    expect(result.stateChanges).toHaveLength(1);
    expect(result.stateChanges[0].id).toBe("sc-1");
  });

  it("seeds stateChanges from legacy (v1/v2) muscleStates on upgrade", () => {
    const legacyBlob = {
      muscleStates: {
        "hamstring-l": { state: "tight", updatedAt: "2026-01-01T00:00:00.000Z" },
        "quad-r": { state: "normal", updatedAt: "2026-01-02T00:00:00.000Z" },
      },
    };
    const result = migrateBlobToV3(legacyBlob);
    expect(result.schemaVersion).toBe(3);
    // Only the non-"normal" muscle state produces a seeded stateChanges row.
    expect(result.stateChanges).toHaveLength(1);
    expect(result.stateChanges[0]).toMatchObject({
      muscleId: "hamstring-l",
      fromState: "normal",
      toState: "tight",
      timestamp: "2026-01-01T00:00:00.000Z",
      source: "migration-seed",
    });
  });

  it("migrates legacy muscle ids embedded in seeded stateChanges", () => {
    // legacyId -> current id mapping is exercised indirectly via migrateLegacyId;
    // an id with no legacy mapping should simply pass through unchanged.
    const legacyBlob = {
      muscleStates: {
        "unknown-legacy-id": { state: "weak", updatedAt: "2026-01-01T00:00:00.000Z" },
      },
    };
    const result = migrateBlobToV3(legacyBlob);
    expect(result.stateChanges[0].muscleId).toBe("unknown-legacy-id");
  });

  it("preserves untouched top-level fields like entries and assessments", () => {
    const blob = {
      entries: [{ id: "e1" }],
      assessments: [{ id: "a1" }],
    };
    const result = migrateBlobToV3(blob);
    expect(result.entries).toEqual([{ id: "e1" }]);
    expect(result.assessments).toEqual([{ id: "a1" }]);
  });
});
