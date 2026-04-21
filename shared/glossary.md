# Glossary

Terms used throughout Dot Body Map code and docs. When in doubt, cite from here.

---

**Adherence row** — A v3 `adherence[]` entry: `{ id, date, muscleId, remedyKey, remedyLabel, status, suggestedAt, completedAt | null, source }`. Populated by Stage 02-B / F6. Powers M7 + the BBS adherence component. Lives alongside the legacy `entries[]` `kind: "adherence"` row (kept for back-compat with milestone counters).

**Atlas** — The interactive SVG body map. Males uses patched-fork SVG paths under `atlas-assets/`; females uses the vendor library (splits TBD).

**Base ID** — A `SUB_MUSCLES` identifier without a side suffix (e.g. `pec-upper`). Used in data files.

**Body Balance Score (BBS)** — A 0–100 composite of M3 (symmetry) · M4 (tightness load) · M6 (recovery rate) · M7 (adherence rate), weighted per `stages/02a-ux-foundation/output/gamification-spec.md` §1. Surfaced via the `useBodyBalanceScore()` hook (`{ score, components, isCalibrating }`) and rendered in the header chip + Today hero. Live as of Stage 02-B / F2.

**Calibration banner / cold-start** — Behavior when the user has fewer than 7 days of `stateChanges` history. The BBS returns `{ score: 50, isCalibrating: true }`; the Progress screen renders a "Calibrating — keep flagging muscles for N more days" banner above the symmetry hero. Lifts automatically once `stateChangesSpanDays(stateChanges) >= 7`.

**Body intelligence stack** — The L0–L5 vertical: mechanics → edges → state → remedies → movements → planner. See `shared/body-model.md`.

**Compensation** — L1 edge kind: muscle A works harder because muscle B is stiff or weak.

**Decision-support** — The app's role: it offers hypotheses, priorities, and remedy options. It does not diagnose, prescribe, or replace clinical care.

**Edge** — An L1 relationship between two muscles. Has `kind`, `confidence`, and a `rationale`.

**Inhibition** — L1 edge kind: reciprocal inhibition at a joint (e.g. tight hip flexor dampens glute firing).

**Intake wizard** — Planner sub-flow that walks the user through goal / tight / weak / lift inputs and populates `muscleStates`.

**Join key** — The muscle base ID (`SUB_MUSCLES`) is the sole join key between data modules. Atlas slugs are *rendering* keys, not data keys.

**Load-chain** — L1 edge kind: force transmission through a kinetic chain (e.g. weak glute-med → increased knee valgus demand on VMO).

**L/R symmetry view** — Planner view that surfaces left/right state imbalances for the same base muscle.

**Legacy ID** — A muscle ID from a prior schema version. Normalized on load via `migrateLegacyId()`.

**Mechanics** — L0 layer: the biomechanical facts about a muscle (joints crossed, action keys, planes, antagonists, synergists).

**Metrics module** — `bodymap-app/src/metrics/*` (Stage 02-B / F2). Pure functions M1–M9 + `bodyBalanceScore` + `helpers`. Every function takes raw arrays (`stateChanges`, `adherence`, `assessments`, …) + `now: Date` + `windowDays`. No `localStorage` reads, no `Date.now()` inside the module. Bilateral aggregates use `splitMuscleId` → `fromMuscleId` from `muscle-data.js`.

**Movement** — An L4 entry describing a compound lift or exercise with phase-keyed muscle recruitment roles.

**Muscle ID (user-facing)** — `{base-id}-{l|r}` (e.g. `pec-upper-l`). Used in UI selections, `muscleStates` keys, and `entries[].origin`.

**Patched fork** — Our copy of the vendor SVG body assets, with added split paths and divider strokes for finer muscle regions.

**Recruitment tint** — L4 overlay: the atlas colors muscles by role during a selected movement's phase. Primary red, secondary purple, tertiary green.

**Remedy** — An L3 intervention: stretch, strengthen, mobilize, activate, or release, keyed by `(muscleBaseId, forState)`.

**Role** — In L4, a muscle's role in a movement: `primary` / `secondary` / `tertiary`.

**Schema version** — `3` today (bumped 2026-04-19 by Stage 02-B / F1). Stored at the root of the localStorage blob (`schemaVersion: 3`, key `dot-body-map-v3`). Bump only when the shape changes; write a migration in `BodyMapApp.jsx`'s load path. Full shape: `_config/storage-schema.md`.

**SessionPlanner (L5)** — The planner component. Views: session / weekly / L/R symmetry. Intake wizard is a sub-mode.

**State** — An L2 user assertion about a muscle: `tight`, `weak`, or `normal`.

**Stage (ICM)** — A numbered folder under `stages/` representing a sequenced phase of work. Has `CONTEXT.md` (contract), `references/`, `output/`.

**stateChanges** — Append-only flip log persisted on the v3 blob: `{ id, muscleId, fromState, toState, timestamp, source }`. Source is one of `"manual" | "intake-wizard" | "import" | "migration-seed"`. `normal → normal` no-ops are filtered out. Seeded from existing `muscleStates` on v2 → v3 migration. Powers M1 / M2 / M3 / M5 / M6 + the BBS.

**Tight / weak** — The two non-normal L2 states. Drives L3 remedy visibility and L5 planner ordering.

**Track (F, E, G, H)** — Informal grouping of related work:
- **Track F** = tracking & metrics (= Stage 02)
- **Track E** = deeper intelligence (= Stage 03)
- **Track G** = content / art expansion (= Stage 04)
- **Track H** = new features (unscoped)
