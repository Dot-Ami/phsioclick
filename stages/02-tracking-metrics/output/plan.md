# Stage 02 — Tracking & metrics plan (Track F)

> **Status:** Draft v1 — produced 2026-04-16.
> **Scope:** Design spec only. No application code is written in this stage.
> **Implementation handoff:** A Stage 02.5 (or inline implementation pass) consumes this file ticket-by-ticket.

Companion files: [`decisions.md`](./decisions.md) (confirmed decision table).

---

## 1. Executive summary

- **Goal.** Close the "am I actually progressing?" gap identified in [`references/tracking-gap-analysis.md`](../references/tracking-gap-analysis.md) by turning the app from point-in-time snapshots into a rolling record of state, adherence, and goal progress.
- **Single data primitive added.** An append-only `stateChanges[]` log inside the existing `dot-body-map-v3` localStorage blob, bumped to `schemaVersion: 3`. Every flip of `handleSetMuscleState` writes one event.
- **Everything else derives from it.** Symmetry index, tightness load, hot regions, recovery rate, flip frequency, assessment correlation — all computed by pure memoized functions from `stateChanges[]` + existing `entries[]` + `assessments[]`.
- **Two secondary records added:** `goals[]` (structured targets tied to muscle IDs) and `adherence[]` (explicit "did this remedy" checkboxes). Both live in the same blob. No server, no IndexedDB, no new tab.
- **UI surface is additive.** Dashboard gets new widgets (symmetry index, tightness load, hot regions, state-change timeline, recovery rate). Planner gets a "since last week" micro-summary and per-remedy adherence checkboxes. No new tab; all existing tabs keep working.
- **Shipped in 5 phases.** F-Phase 0 lays the foundation (schema + log), F-Phase 1 ships core dashboard metrics, F-Phase 2 adds adherence + planner summary, F-Phase 3 adds goals + advanced metrics, F-Phase 4 is polish/docs.
- **First three tickets** (F1 foundation, F2 metrics module, F3 dashboard widgets) are ready to paste as todos for the next session — see §7.
- **Non-negotiables respected.** Educational-only framing, stable base-IDs as join key, backward-compatible migration, export/import round-trip preserved, no medical claims.

---

## 2. Metric catalog

Every metric below is derivable from `stateChanges[]` + `entries[]` + `assessments[]`. Each specifies: definition, inputs, output shape, layer, and bilateral aggregation behaviour.

All metrics accept a `windowDays` parameter (default 30) and a `now` clock (injected for testability). All metrics that operate per `{baseId}-{side}` also expose a `byBaseId` aggregate computed as the union of both sides.

### 2.1 State days flagged (M1)

- **Layer:** L2
- **Definition:** For a given muscle, the number of calendar days in the last `windowDays` during which the muscle was in a non-normal state (`tight` or `weak`).
- **Inputs:** `stateChanges[]` filtered by `muscleId`, intersected with `[now - windowDays, now]`.
- **Algorithm:** Reconstruct the step-function of state over time by replaying `stateChanges` in order. For each day in the window, the state on that day is the most recent event `<= end-of-day`. Count days where state is `tight` or `weak`; optionally return per-state split (`tightDays`, `weakDays`).
- **Output shape:** `{ muscleId, tightDays, weakDays, flaggedDays, windowDays }`
- **Bilateral aggregate:** `byBaseId[baseId] = { tightDays_l, tightDays_r, tightDays_max, tightDays_sum, ... }`.

### 2.2 Flip frequency (M2)

- **Layer:** L2
- **Definition:** Number of state transitions for a muscle in the window. High flip counts can signal unstable self-assessment or genuine oscillation.
- **Inputs:** `stateChanges[]` filtered by `muscleId` and window.
- **Output shape:** `{ muscleId, flipCount, flipsPerWeek }`
- **Bilateral aggregate:** sum per base ID.

### 2.3 Symmetry index (M3)

- **Layer:** L2
- **Definition:** Per base ID, the absolute difference in flag-days between left and right over the window. Composite score is the mean of per-muscle deltas across all base IDs with any flagged days in the window (so unflagged muscles don't dilute the signal).
- **Per-muscle output:** `{ baseId, delta, leftFlaggedDays, rightFlaggedDays }`
- **Composite output:** `{ windowDays, composite, trend: [{ date, composite }] }` where `trend` is a rolling daily recompute for charting improvement.
- **Inputs:** M1 per side, joined by base ID.
- **Design note:** Per-muscle delta only; no Janda cross-pattern weighting in v1 (kept for Stage 03).

### 2.4 Tightness / weakness load (M4)

- **Layer:** L2
- **Definition:** Body-wide rollup. `tightnessLoad = sum over all muscles of tightDays`; `weaknessLoad = sum of weakDays`. Normalized variant divides by `windowDays * muscleCount`.
- **Output shape:** `{ tightnessLoad, weaknessLoad, normalizedTightness, normalizedWeakness, windowDays }`
- **Bilateral:** computed across all sides by default; optional `byBaseId` rollup.

### 2.5 Hot regions this week (M5)

- **Layer:** L2
- **Definition:** Top-N base IDs by flagged-days in the last 7 days (default `N=5`).
- **Output shape:** `[{ baseId, label, flaggedDays, dominantState }]` sorted desc.
- **Inputs:** M1 with `windowDays=7`, aggregated by base ID.

### 2.6 Recovery rate (M6)

- **Layer:** L2
- **Definition:** Of all flips into `tight` or `weak` whose timestamp falls in the window, what percentage transitioned back to `normal` within `recoveryWindowDays` (default 14)?
- **Output shape:** `{ totalFlags, recovered, pending, stillFlagged, recoveryRate, recoveryWindowDays }`
- **Bilateral:** computed across all muscles; optional per base ID.
- **Edge case:** a flag that was followed by another non-normal state (e.g. `tight -> weak`) without hitting `normal` counts as "stillFlagged" for recovery purposes.

### 2.7 Adherence rate (M7)

- **Layer:** L3 / L5
- **Definition:** Of the remedies suggested by the planner in a given week, what percentage were checked off by the user?
- **Inputs:** `adherence[]` filtered to week + the set of remedy keys the planner surfaced (captured at plan-generation time into `adherence[]` as `status: "suggested"`).
- **Output shape:** `{ weekStart, suggested, done, skipped, adherenceRate }`
- **Design note:** Adherence is opt-in and minimal UI. Missing checks are treated as unknown, not "skipped," unless the user explicitly skips.

### 2.8 Goal progress (M8)

- **Layer:** L5
- **Definition:** For each goal in `goals[]`, compute the goal-specific metric (M1/M3/M7 depending on `targetMetric`) at goal creation (`createdAt` baseline) and at `now`, then report percent change toward `targetValue`.
- **Output shape:** `{ goalId, baseline, current, target, progressPct, status, onTrack }`
- **`onTrack`** is a simple linear-expectation check: `expectedProgress = elapsedDays / targetWindowDays`; `onTrack = progressPct >= expectedProgress * 0.8` (20 pp grace).

### 2.9 Assessment-to-state correlation (M9)

- **Layer:** L0 / L2
- **Definition:** For each bilateral assessment (e.g. shoulder-flexion-ROM), plot trend alongside the flag-day count of the driver muscles over the same window. Correlation is visual (two lines on one chart) rather than a Pearson score in v1.
- **Inputs:** `assessments[]` + M1 for the driver muscles specified by an `assessmentDrivers` lookup (new, small data module — see §3.4).
- **Output shape:** `[{ date, assessmentValueLeft, assessmentValueRight, driverFlaggedDaysLeft, driverFlaggedDaysRight }]`
- **Design note:** `assessmentDrivers` is a small static map per `testKey`. Populated pragmatically; this is a display aid, not inference.

---

## 3. Data model extensions

### 3.1 Schema diff (v2 -> v3)

Same localStorage key (`dot-body-map-v3`), same single-blob export/import. Additions only.

```jsonc
{
  "schemaVersion": 3,

  // unchanged from v2
  "entries":      [ /* ... */ ],
  "assessments":  [ /* ... */ ],
  "muscleStates": { /* ... */ },

  // NEW in v3
  "stateChanges": [
    {
      "id": "uuid",
      "muscleId": "pec-upper-l",
      "fromState": "normal",
      "toState": "tight",
      "timestamp": "2026-04-16T09:12:03.471Z",
      "source": "manual"       // "manual" | "intake-wizard" | "import" | "migration-seed"
    }
  ],

  "goals": [
    {
      "id": "uuid",
      "createdAt": "2026-04-16T09:12:03.471Z",
      "kind": "reduce-flagged-days",   // see §3.3 for allowed kinds
      "targetMuscleId": "hip-flexor-l", // optional, depends on kind
      "targetMetric": "M1",             // which metric the goal tracks
      "targetValue": 5,                 // meaning depends on kind
      "targetWindowDays": 30,
      "status": "active",               // "active" | "achieved" | "archived"
      "notes": ""
    }
  ],

  "adherence": [
    {
      "id": "uuid",
      "date": "2026-04-16",             // local calendar date, not ISO ts
      "remedyKey": "hip-flexor-stretch-kneeling",
      "muscleId": "hip-flexor-l",       // optional, for remedies that are muscle-scoped
      "status": "done",                 // "suggested" | "done" | "skipped"
      "notes": ""
    }
  ],

  "dailySnapshots": [                   // OPTIONAL, opt-in via user setting
    {
      "date": "2026-04-16",
      "muscleStatesSnapshot": { "pec-upper-l": "tight" }
    }
  ]
}
```

### 3.2 Migration (v2 -> v3)

In `BodyMapApp.jsx` load path, alongside the existing `schemaVersion === 1` block:

1. If `schemaVersion < 3`:
   - Initialize `stateChanges = []`, `goals = []`, `adherence = []`, `dailySnapshots = []`.
   - **Seed `stateChanges`** with one synthetic event per entry in `muscleStates`, using that muscle's `updatedAt` as the timestamp, `fromState: "normal"`, `toState: state`, `source: "migration-seed"`. This gives day-one metrics a non-zero baseline instead of "no history at all."
   - Apply `migrateLegacyId()` to every synthetic `muscleId`.
   - Set `schemaVersion = 3`.
2. Preserve every existing field untouched.
3. On **import**, run the same migration against the imported blob before `setState`. `migrateLegacyId()` must be applied to `muscleId` fields in `stateChanges`, `goals.targetMuscleId`, and `adherence.muscleId`.
4. On **export**, include all new fields verbatim.

**Risk:** the synthetic seeding is a best-effort backfill, not a real history. Copy near the first chart that depends on it should say "since your last flag" rather than "over the last 30 days" until there is at least `windowDays` of genuine log.

### 3.3 Goal `kind` vocabulary (v1)

Fixed enum to keep UI tractable:

| `kind` | `targetMetric` | Meaning of `targetValue` |
|--------|---------------|--------------------------|
| `reduce-flagged-days` | M1 | Maximum acceptable flagged days over `targetWindowDays` for `targetMuscleId`. Progress = baseline -> current, target = this value. |
| `improve-symmetry` | M3 | Maximum acceptable composite symmetry index over `targetWindowDays`. |
| `hit-adherence` | M7 | Minimum acceptable adherence rate (0-1) over `targetWindowDays`. |
| `freeform` | none | Pure notes goal; shows in UI but no progress bar. |

New kinds can be added in later stages without breaking storage (unknown kinds render as `freeform`).

### 3.4 `assessmentDrivers` lookup

New tiny data module at `src/data/assessment-drivers.js`:

```js
export const ASSESSMENT_DRIVERS = {
  "shoulder-flexion-rom": ["lat", "pec-upper", "pec-lower", "teres-major"],
  // ...
};
```

Used only by M9. Values are `SUB_MUSCLES` base IDs. Missing entries are fine — M9 falls back to "no drivers mapped" for that test.

### 3.5 Storage schema doc update

`_config/storage-schema.md` is updated in F9 to reflect v3 and remove the "Gaps" note.

---

## 4. Work breakdown

Each ticket below follows the stage contract's ticket shape: Purpose / Inputs / Acceptance criteria / Effort / Risk / Dependencies.

### F1 — Schema v3 migration + stateChanges write-through

- **Purpose.** Land the foundational append-only log so every subsequent metric has raw material to compute from.
- **Inputs.**
  - [`src/BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) — load/save effects, `handleSetMuscleState`, intake-wizard prop wiring.
  - [`_config/storage-schema.md`](../../../_config/storage-schema.md) — current shape.
  - [`references/current-state-model.md`](../references/current-state-model.md) §7-8 — suggested extension point.
- **Acceptance criteria.**
  - `schemaVersion === 3` after first load on a v2 blob; synthetic seed entries present in `stateChanges`.
  - Every call to `handleSetMuscleState` appends exactly one event with correct `fromState`/`toState`/`source`.
  - Export JSON contains `stateChanges`, `goals: []`, `adherence: []`; re-importing that JSON round-trips cleanly.
  - `npx vite build` passes; existing tabs (Log, Dashboard, Assessments, Planner) unchanged in behaviour.
- **Effort.** M. **Risk.** Low.
- **Dependencies.** None — blocks everything else.

### F2 — Metrics module

- **Purpose.** Pure, memoizable functions for M1-M9 so UI widgets can compose them without duplicating logic.
- **Inputs.** `stateChanges[]`, `entries[]`, `assessments[]`, `adherence[]`, `goals[]`, `muscleStates`. ID helpers from [`src/muscle-data.js`](../../../bodymap-app/src/muscle-data.js).
- **Deliverable.** New `src/metrics/` folder with one file per metric family (e.g. `stateHistory.js`, `symmetry.js`, `load.js`, `recovery.js`, `adherence.js`, `goals.js`, `correlation.js`) and an `index.js` barrel. Each function is pure, takes a `now: Date` parameter, and returns the shapes defined in §2.
- **Acceptance criteria.**
  - Each metric has a small unit-test-style scratch file (or inline doctest-style comment) that covers: empty log, single-flip log, multi-flip log, bilateral aggregation.
  - No reads from `localStorage` inside the metrics module. Callers pass raw arrays in.
  - No `Date.now()` called directly — always go through the injected `now` for deterministic snapshots.
- **Effort.** M. **Risk.** Low.
- **Dependencies.** F1.

### F3 — Dashboard progress widgets

- **Purpose.** Expose M1, M3, M4, M5, M6 on the existing Dashboard tab.
- **Inputs.** F2 metrics module; [`src/BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) Dashboard section; [`src/TrendCharts.jsx`](../../../bodymap-app/src/TrendCharts.jsx) pattern for Recharts usage.
- **Widgets (in this visual order).**
  1. Symmetry index card: composite score + 30-day sparkline of daily recompute.
  2. Tightness/weakness load card: two numbers + small bar.
  3. Hot regions this week: top-5 list with base-ID label + flagged-day count.
  4. Recovery rate card: percentage + "N of M flags resolved in 14 days".
  5. State-change timeline chart: per-day count of flips, colored by direction (into/out of flagged).
- **Acceptance criteria.**
  - All widgets render correctly on a freshly-migrated v2 blob (even with mostly synthetic seeds).
  - Window is 30 days by default, with a selector for 7/30/90.
  - Empty-state copy ("not enough history yet — keep flagging muscles for N more days") when `stateChanges` spans < 7 days.
  - Clinical-theme aesthetic preserved (zinc/teal, dense, labeled with layer tags).
- **Effort.** M. **Risk.** Med (Recharts sizing + dense layout).
- **Dependencies.** F2.

### F4 — Planner inline "since last week" micro-summary

- **Purpose.** Surface week-over-week deltas at the top of the Planner so the user sees progress in the same place they plan.
- **Inputs.** F2 metrics; [`src/SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx).
- **Deliverable.** A small card above the session/weekly/symmetry tabs showing: symmetry composite delta, hot regions this week, and total flips last 7 days vs prior 7 days.
- **Acceptance criteria.**
  - Card is dismissible (persisted dismiss via local state — no schema change).
  - Uses the same educational-only tone; no "diagnosis" copy.
  - Collapses gracefully on mobile.
- **Effort.** S. **Risk.** Low.
- **Dependencies.** F2.

### F5 — Goals data model + create/edit UI + goal-progress wiring

- **Purpose.** Let the user define structured long-term targets and see progress against them.
- **Inputs.** F1 (goals persisted), F2 (M8 computation), [`src/BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) for a new small UI (drawer or card on Dashboard).
- **Deliverable.**
  - `GoalsPanel.jsx` component with list + create/edit modal.
  - Supports the four `kind` values in §3.3.
  - Goal progress card on Dashboard showing each active goal with a progress bar, baseline, current, target, and `onTrack` indicator.
- **Acceptance criteria.**
  - Creating a goal persists to `goals[]` and immediately renders a progress card.
  - Archiving a goal hides it from active views but retains it in export.
  - All copy is self-coaching, not medical ("aim for" not "must achieve").
  - Export/import round-trip preserves goals.
- **Effort.** L. **Risk.** Med.
- **Dependencies.** F1, F2.

### F6 — Adherence checkboxes on planner session + rate metric

- **Purpose.** Make adherence a first-class signal by recording whether the user executed remedies the planner surfaced.
- **Inputs.** [`src/SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx), [`src/RemedyPanel.jsx`](../../../bodymap-app/src/RemedyPanel.jsx), F2 adherence metric.
- **Deliverable.**
  - When the planner renders a session, it also appends an `adherence` row with `status: "suggested"` per remedy (dedupe by `date + remedyKey`).
  - Each remedy row has a "Done" checkbox; checking flips `status` to `done`. A "Skip" link sets `skipped`.
  - Dashboard gets a compact adherence-rate card; planner shows the rate for the current week.
- **Acceptance criteria.**
  - Suggesting the same remedy twice on the same day does not create duplicates.
  - Adherence rate handles no-data gracefully (renders `—` and empty-state copy).
  - Export/import round-trip preserves adherence records.
- **Effort.** M. **Risk.** Med (planner state wiring).
- **Dependencies.** F1, F2.

### F7 — Recovery rate + flip frequency charts

- **Purpose.** Expose M2 and a richer M6 view as Dashboard charts.
- **Inputs.** F2.
- **Deliverable.** Two Recharts charts: per-muscle top-10 flip frequency bar chart; recovery rate trend over last 90 days.
- **Acceptance criteria.**
  - Charts render with empty `stateChanges` (empty-state) without crashing.
  - Per-base-ID toggle: "left only / right only / combined."
- **Effort.** M. **Risk.** Low.
- **Dependencies.** F2.

### F8 — Assessment-to-state correlation view

- **Purpose.** Expose M9. Join assessment trends to the flag-day count of their driver muscles.
- **Inputs.** F2, `src/data/assessment-drivers.js` (new, see §3.4), existing assessment trend UI.
- **Deliverable.**
  - `assessment-drivers.js` seeded for the 3-5 existing `testKey`s.
  - Dual-axis chart: left Y = assessment value, right Y = flagged-day count for drivers. Both lines stratified by side where applicable.
- **Acceptance criteria.**
  - Missing driver map renders a "no drivers mapped yet" note instead of crashing.
  - Chart window matches dashboard window selector.
- **Effort.** M. **Risk.** Med (dual-axis + bilateral split can get visually busy).
- **Dependencies.** F2.

### F9 — Export/import QA + docs update

- **Purpose.** Guarantee the schema bump is safe and the docs match reality.
- **Inputs.** Completed F1-F8; [`_config/storage-schema.md`](../../../_config/storage-schema.md); [`PROJECT_NOTES.md`](../../../PROJECT_NOTES.md); [`BODY_MODEL_ROADMAP.md`](../../../BODY_MODEL_ROADMAP.md) §Storage.
- **Deliverable.**
  - Manual regression: export v2 blob -> import into v3 build -> verify all widgets populate, no data lost.
  - Manual regression: export v3 blob -> re-import -> all new fields survive.
  - Update `_config/storage-schema.md` to show v3 shape; remove the "Gaps as of 2026-04-15" section or replace with "Shipped in Stage 02."
  - Update `PROJECT_NOTES.md` §Storage and roadmap tables.
- **Acceptance criteria.**
  - `npx vite build` passes.
  - Docs and code agree on the schema.
  - A "what shipped" note is added to `stages/02-tracking-metrics/output/completion-log.md` (new file, mirrors the v1 completion log).
- **Effort.** S. **Risk.** Low.
- **Dependencies.** F1-F8.

---

## 5. Phased roadmap

Each phase is demoable. Phases are sized so the user can feel progress after each one.

| Phase | Tickets | Demoable milestone | Exit criteria |
|-------|---------|--------------------|---------------|
| **F-Phase 0: Foundation** | F1 | Flip a muscle, open devtools, see `stateChanges` grow in localStorage. Re-import a v2 export and watch the migration seed. | Schema v3 live; migration safe; export/import round-trips; no regressions in existing tabs. |
| **F-Phase 1: Core dashboard metrics** | F2, F3 | Dashboard shows symmetry index, tightness load, hot regions, recovery rate, state-change timeline for the last 30 days. | 5 widgets render on both populated and empty data; window selector works; build passes. |
| **F-Phase 2: Adherence + planner inline summary** | F4, F6 | Planner shows "since last week" card; each remedy has a Done/Skip; adherence rate card appears on Dashboard. | Suggested/done/skipped records persist; adherence rate computes; no duplicate suggestions; export/import round-trips. |
| **F-Phase 3: Goals + advanced metrics** | F5, F7, F8 | User creates "reduce L-hip-flexor tight days by 50%" goal and sees progress bar; dashboard shows flip-frequency and assessment-to-state charts. | Four goal kinds supported; progress bars render; `onTrack` indicator correct on a synthetic fixture; advanced charts render on populated and empty data. |
| **F-Phase 4: Polish** | F9 | Clean build + updated docs + completion log. | `_config/storage-schema.md` reflects v3; `PROJECT_NOTES.md` updated; `completion-log.md` written; `npx vite build` clean. |

---

## 6. Open decisions

All six of the decision forks from the stage contract have been confirmed. Full rationale in [`decisions.md`](./decisions.md).

| Decision | Confirmed answer |
|----------|------------------|
| Where does state history live? | Append-only log inside same `dot-body-map-v3` blob; bump to `schemaVersion: 3`. |
| State-change granularity | Per-flip events; optional opt-in daily snapshot on first open of each local day (shipped in F-Phase 3 at earliest). |
| Symmetry index definition | Per-muscle L/R delta + rolling composite (mean across flagged muscles). |
| Adherence tracking | Explicit checkboxes on planner session; minimal UI. |
| Goal system | Structured targets tied to muscle IDs, four fixed `kind`s + freeform notes. |
| Dashboard surface | Expand existing Dashboard + add planner-inline "since last week" micro-summary. No new tab. |

---

## 7. First three concrete tickets (paste into next session)

Ready-to-execute tickets for F-Phase 0 and F-Phase 1. Each has a title and 2-3 acceptance criteria.

### F1 — Schema v3 migration + stateChanges write-through

- [ ] On load, if `schemaVersion < 3`, migrate in place: add `stateChanges`, `goals`, `adherence`, `dailySnapshots` as empty arrays; seed `stateChanges` from `muscleStates[id].updatedAt` with `source: "migration-seed"`; set `schemaVersion = 3`. Preserve every existing field.
- [ ] `handleSetMuscleState` appends a `{ id, muscleId, fromState, toState, timestamp, source }` event to `stateChanges` on every flip. Intake-wizard flips use `source: "intake-wizard"`.
- [ ] Export JSON contains all four new fields; re-importing the same JSON produces a byte-for-byte equivalent blob (aside from ordering of unordered maps). `npx vite build` passes.

### F2 — Metrics module

- [ ] New `src/metrics/` folder with pure functions for M1 (state days flagged), M3 (symmetry index), M4 (tightness/weakness load), M5 (hot regions), M6 (recovery rate). Each takes raw arrays + `now: Date` + `windowDays` and returns shapes per §2.
- [ ] Every function handles empty input without throwing; bilateral aggregates are computed via `fromMuscleId()` — no string slicing.
- [ ] Small self-contained scratch tests (or inline doctest-style comments) demonstrate empty, single-flip, and multi-flip behaviour per metric.

### F3 — Dashboard progress widgets

- [ ] Dashboard renders five new widgets in this order: symmetry index card (with 30-day sparkline), tightness/weakness load card, hot regions this week (top-5), recovery rate card, state-change timeline chart.
- [ ] A window selector (7 / 30 / 90 days) at the top of the widget cluster updates all five widgets.
- [ ] Empty-state copy appears when `stateChanges` spans < 7 days: "Not enough history yet — keep flagging muscles for N more days." Build passes and all existing tabs are unchanged.

---

## Appendix — What this plan deliberately does **not** ship

- No server, accounts, or multi-device sync. Out of scope for v1 per stage constraints.
- No ML / predictive trend. Stage 03 at earliest.
- No Janda cross-pattern weighting in the symmetry index. Stage 03.
- No video links on remedies. Stage 04 (content).
- No new tabs. All surface is additive on Dashboard + Planner.

---

## Appendix — Files the implementation session will touch

Reference map for the handoff.

| Area | File | Change |
|------|------|--------|
| Persistence / migration | [`bodymap-app/src/BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) | Load-path migration, new state arrays, new handlers |
| State mutation | [`bodymap-app/src/BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) `handleSetMuscleState` | Append to `stateChanges` on every flip |
| Intake wizard source tagging | [`bodymap-app/src/SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx) + prop wiring | Pass `source: "intake-wizard"` through |
| Metrics | `bodymap-app/src/metrics/*` (new) | M1-M9 pure functions |
| Dashboard | [`bodymap-app/src/BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) + [`bodymap-app/src/TrendCharts.jsx`](../../../bodymap-app/src/TrendCharts.jsx) | New widgets |
| Planner inline summary | [`bodymap-app/src/SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx) | Card above session/weekly/symmetry tabs |
| Goals | `bodymap-app/src/GoalsPanel.jsx` (new) | Create/edit/list + progress cards |
| Adherence | [`bodymap-app/src/SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx), [`bodymap-app/src/RemedyPanel.jsx`](../../../bodymap-app/src/RemedyPanel.jsx) | Checkboxes + suggestion writes |
| Assessment drivers | `bodymap-app/src/data/assessment-drivers.js` (new) | Static map per `testKey` |
| Docs | [`_config/storage-schema.md`](../../../_config/storage-schema.md), [`PROJECT_NOTES.md`](../../../PROJECT_NOTES.md) | v3 schema, "Gaps" section retired |
| Stage completion | `stages/02-tracking-metrics/output/completion-log.md` (new) | Mirror v1 completion-log format |
