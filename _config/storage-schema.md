# Storage schema

**Key:** `dot-body-map-v3`
**Current schema version:** `3` (bumped 2026-04-19 by Stage 02-B / F1).

> **Doc status.** This file documents the live v3 shape. Stage 02-B / F9 owns the final canonical pass (regression QA + a "what changed in v3" delta callout). Until then, treat this file as the working source of truth — it tracks the codebase, not the original v2 spec.

---

## Shape

```json
{
  "schemaVersion": 3,

  "entries": [
    {
      "id": "uuid",
      "timestamp": "ISO-8601",
      "origin": "pec-upper-l",
      "sensation": null,
      "movement": "bench-press",
      "sensationType": "tight",
      "intensity": 3,
      "context": "...",
      "notes": "..."
    }
    // entries[] may also contain remedy-adherence rows shaped as
    // { kind: "adherence", muscleId, remedyId, status: "done", timestamp }
    // (Stage 02-A.5 / U4 + U8). Kept for back-compat with milestone counters;
    // Stage 02-B / F6 ALSO forks the same event into adherence[] below.
  ],

  "assessments": [
    {
      "id": "uuid",
      "timestamp": "ISO-8601",
      "testKey": "shoulder-flexion-rom",
      "leftValue": 150,
      "rightValue": 165,
      "unit": "deg"
    }
  ],

  "muscleStates": {
    "glute-max-l": { "state": "weak",  "updatedAt": "ISO-8601" },
    "pec-upper-r": { "state": "tight", "updatedAt": "ISO-8601" }
  },

  "onboarding": {
    "completedAt": null,
    "intent":      null,
    "tourSeen":    { "today": false, "body": false, "plan": false, "progress": false }
  },

  "streak": {
    "current":        0,
    "longest":        0,
    "lastActiveDate": null
  },

  "milestones": [
    { "id": "first-flip", "achievedAt": "ISO-8601" }
  ],

  "stateChanges": [
    {
      "id":        "sc-…",
      "muscleId":  "glute-max-l",
      "fromState": "normal",
      "toState":   "weak",
      "timestamp": "ISO-8601",
      "source":    "manual"   // "manual" | "intake-wizard" | "import" | "migration-seed"
    }
  ],

  "goals": [
    // Persisted as a literal [] until Stage 02-B / F5 promotes the in-memory
    // U7 goals[] React state into v3 storage. Goal row shape (per plan.md §3.3):
    // { id, kind: "reduce-flagged-days" | "improve-symmetry" | "hit-adherence" | "freeform",
    //   targetMuscleId?, baseline?, target, status: "active" | "complete" | "abandoned",
    //   createdAt, completedAt? }
  ],

  "adherence": [
    // Live as of Stage 02-B / F6. Single writer: BodyMapApp.handleAdherenceChange(row).
    // Row shape:
    // { id:         "adh-…",
    //   date:       "YYYY-MM-DD",          // local timezone day key (isoDayKeyLocal)
    //   muscleId:   "glute-max-l",         // migrated through migrateLegacyId()
    //   remedyKey:  "glute-bridge",
    //   remedyTitle:"Glute bridge",
    //   status:     "suggested" | "done" | "skipped",
    //   source:     "session-planner" | "slide-out",
    //   timestamp:  "ISO-8601" }           // last-touch (suggest, done, or skip)
    //
    // Dedup: rows are unique on (date, muscleId, remedyKey). Re-writing the
    // same triple updates status + timestamp in place — never appends.
    // Seeding: SessionPlanner seeds "suggested" rows for every remedy in the
    // current session/weekly plan; the slide-out Remedies tab seeds "suggested"
    // rows for the first six remedies on open. Both paths flow through
    // handleAdherenceChange so dedup is preserved.
  ],

  "dailySnapshots": [
    // Reserved for future cron/lazy rollups (e.g. nightly composite freeze).
    // Not yet written by any code path; safe to ignore on read.
  ]
}
```

---

## Rules

- `entries[].origin` and `muscleStates` keys are `{base-id}-{l|r}` format (from `SUB_MUSCLES`).
- `muscleStates[id].state` is one of `"tight" | "weak" | "normal"`. `"normal"` is the absence of a flag — UIs may omit it from storage.
- `migrateLegacyId()` normalizes any pre-v3 muscle IDs read from storage (or written into `stateChanges` / `adherence` / `goals.targetMuscleId`) before they reach components.
- `migrateBlobToV3()` in `BodyMapApp.jsx` is the load-path migration. It is **idempotent** (safe to re-run on a v3 blob), is also applied to imported blobs, and on a v2 blob:
  - sets `schemaVersion: 3`
  - initializes `stateChanges` / `goals` / `adherence` / `dailySnapshots` to `[]`
  - seeds one `stateChanges` event per non-normal entry in `muscleStates`, using `updatedAt` as the timestamp, `fromState: "normal"`, `toState: state`, `source: "migration-seed"`
  - preserves every existing v2 + U7+U8 field verbatim (`entries`, `assessments`, `muscleStates`, `onboarding`, `streak`, `milestones`)
- Export / import JSON files are the same shape as the stored blob. Import goes through `migrateBlobToV3`, so a user can drop a v2 (or older) export back into a v3 build cleanly.
- `stateChanges` is **append-only**. Never mutate or remove a row. Filter at read time. `normal → normal` no-ops are not logged so the array doesn't bloat.
- `adherence` rows must dedupe by `(date, muscleId, remedyKey)` so the same suggested remedy on the same day doesn't double-count.

---

## Migrations

When bumping `schemaVersion`:

1. Add a migration function in `BodyMapApp.jsx` keyed by the prior version.
2. Run migrations in the load path **and** on import, before `setState`.
3. Make the migration idempotent — running it twice on an already-migrated blob must be a no-op.
4. Preserve user data — never drop fields silently.
5. Update this file (`_config/storage-schema.md`), `_core/CONVENTIONS.md` §3, and `PROJECT_NOTES.md` §Storage in the same change.

---

## What landed in v3 (Stage 02-B progress)

| Field | Status | Owner | Purpose |
|-------|--------|-------|---------|
| `stateChanges` | ✅ live (F1) | F1 | Append-only flip log; powers M1 / M2 / M3 / M5 / M6 in `src/metrics/*` |
| `goals` | 📦 placeholder `[]` (F1) | F5 (active in F-Phase 3) | Will hold structured user goals (`reduce-flagged-days`, `improve-symmetry`, `hit-adherence`, `freeform`) once F5 promotes the in-memory U7 React state |
| `adherence` | ✅ live (F6) | F6 | Suggested + Done + Skipped remedy rows; powers M7 + the BBS adherence component. Single writer is `BodyMapApp.handleAdherenceChange`; deduped on `(date, muscleId, remedyKey)` |
| `dailySnapshots` | 📦 placeholder `[]` (F1) | future | Reserved; no current writer |
| `onboarding`, `streak`, `milestones` | ✅ native to v3 (folded from U7+U8) | — | First-run wizard / tour state, daily-action streak, milestone catalog |

Stage 02-B's tracking decisions (state history shape, granularity, symmetry definition, adherence model, goal vocabulary) live in [`../stages/02-tracking-metrics/output/decisions.md`](../stages/02-tracking-metrics/output/decisions.md). The full ticket bodies live in [`../stages/02-tracking-metrics/output/plan.md`](../stages/02-tracking-metrics/output/plan.md).
