# Stage 02-B — Tracking & metrics implementation completion log

> One row per shipped ticket. Mirrors the U1–U8 receipt format used in [`../../02a5-ux-implementation/output/completion-log.md`](../../02a5-ux-implementation/output/completion-log.md).
> Append after each ticket lands its build gate.

---

## Status

**Stage status:** ☑ Shipped. F1–F9 all closed. Stage 02-B is complete.

**Phase progress:**

| Phase | Tickets | Status | Notes |
|-------|---------|--------|-------|
| F-Phase 0: Foundation | F1 | ☑ shipped 2026-04-19 | Schema v3 migration + `stateChanges` write-through live; v1/v2 blobs auto-seed. |
| F-Phase 1: Core dashboard metrics | F2, F3 | ☑ shipped 2026-04-19 | `src/metrics/*` module + Progress widgets light up. `useBodyBalanceScore` now derives live from M3/M4/M6/M7 (cold-start preserved at `< 7d` history). |
| F-Phase 2: Adherence + planner inline summary | F4, F6 | ☑ shipped 2026-04-19 | Plan tab gets the dismissible "since last week" card (M2 + M3 + M5). SessionPlanner + slide-out write `adherence[]` rows; M7 card lights up independently. Legacy `entries[]` `kind: "adherence"` still written for U8 milestone back-compat. |
| F-Phase 3: Goals + advanced metrics | F5, F7, F8 | ☑ shipped 2026-04-19 | F5 promoted the in-memory `goals[]` from U7 into v3 storage and added the `GoalsPanel` create/edit UI on Plan; F7 added the M2 flip-frequency bar chart + 90d rolling M6 recovery-rate trend in the Progress accordion; F8 created `src/data/assessment-drivers.js` and the dual-axis assessment-to-driver-flagged-days chart in the assessment-trends slot. |
| F-Phase 4: Polish | F9 | ☑ shipped 2026-04-20 | Export/import regression verified; docs synced (storage-schema.md, PROJECT_NOTES.md, BODY_MODEL_ROADMAP.md, CONVENTIONS.md); stage closed. |

**Build-gate ledger:**

| Ticket | Build verified | Date |
|--------|----------------|------|
| F1 | ✅ `npx vite build` clean (614 kB index, 1.34s) | 2026-04-19 |
| F2 | ✅ `npx vite build` clean (620 kB index, 1.35s) | 2026-04-19 |
| F3 | ✅ `npx vite build` clean (623 kB index, 1.26s) | 2026-04-19 |
| F4 | ✅ `npx vite build` clean (629 kB index, 1.27s) | 2026-04-19 |
| F6 | ✅ `npx vite build` clean (633 kB index, 1.29s) | 2026-04-19 |
| F5 | ✅ `npx vite build` clean (650.95 kB index, 1.43s; new GoalsPanel chunk in main bundle) | 2026-04-19 |
| F7 | ✅ `npx vite build` clean (652.61 kB index, 1.42s; new `BelowFoldCharts` lazy chunk 32.67 kB / 10.23 kB gzip) | 2026-04-19 |
| F8 | ✅ `npx vite build` clean (653.94 kB index, 1.47s; `BelowFoldCharts` chunk reused — no extra payload for correlation view) | 2026-04-19 |
| F9 | ✅ `npx vite build` clean (655.41 kB index, 2.68s; docs-only — no new code chunks) | 2026-04-20 |

---

## Ticket receipts

> Each receipt below uses the same shape used by U1–U8:
>
> ```
> ### F# — <title>
> - **Status.** ☑ shipped <date> | ▶ in progress | ☐ pending
> - **Spec.** <link>
> - **Build verified.** <yes/no, output snippet>
> - **Files touched.** <bullets>
> - **What landed.** <2–4 bullets>
> - **Acceptance trace.** <table mapping spec criteria → code/file/line>
> - **Notes for follow-on tickets.** <bullets, especially swap-points and TODO(stage-02-b) markers resolved/added>
> ```

### F1 — Schema v3 migration + stateChanges write-through

- **Status.** ☑ shipped 2026-04-19
- **Spec.** [`stages/02-tracking-metrics/output/plan.md` §3.1–§3.2 + §F1](../../02-tracking-metrics/output/plan.md)
- **Build verified.** ✅ `npx vite build` exit 0, 1.34 s, no warnings beyond the pre-existing >500 kB chunk-size advisory.
- **Files touched.**
  - `bodymap-app/src/BodyMapApp.jsx` — `STORAGE_SCHEMA_VERSION = 3`; new normalizers (`normalizeStateChanges`, `normalizeAdherence`, `normalizeGoals`, `normalizeDailySnapshots`); `migrateBlobToV3()` helper; new React state for `stateChanges` / `adherence` / `dailySnapshots`; load + save effects + `exportData` + `importData` updated; `handleSetMuscleState` accepts a `source` and appends a `stateChanges` event on every flip.
  - `bodymap-app/src/SessionPlanner.jsx` — `handleWizardComplete` threads `source: "intake-wizard"`.
  - `bodymap-app/src/OnboardingFlow.jsx` — `handleIntakeComplete` threads `source: "intake-wizard"`.
- **What landed.**
  - v3 blob shape lives at the same `dot-body-map-v3` key. Every load and import runs through `migrateBlobToV3`, which is idempotent on existing v3 blobs and seeds `stateChanges` from `muscleStates[id].updatedAt` (with `source: "migration-seed"`) on legacy v1/v2 blobs.
  - All four new fields (`stateChanges`, `goals`, `adherence`, `dailySnapshots`) are written on every save and included verbatim in export. `goals: []` is written literal until F5 promotes the React state.
  - Every flip — manual taps, slide-out logs, intake-wizard, onboarding intake, settings calibrate re-run — now writes exactly one `stateChanges` event with the right `fromState` / `toState` / `source`. `normal → normal` no-ops are filtered out so we don't pollute the log.
  - All `muscleId` writes go through `migrateLegacyId()`, satisfying the stable-base-IDs invariant in `_core/CONVENTIONS.md`.
- **Acceptance trace.**
  | Spec criterion (plan.md §F1) | Code |
  |------------------------------|------|
  | `schemaVersion === 3` after first load on a v2 blob; synthetic seed entries in `stateChanges` | `migrateBlobToV3()` in `BodyMapApp.jsx` (`schemaVersion: 3`, seeded events with `source: "migration-seed"`) |
  | Every `handleSetMuscleState` call appends one event with correct `fromState` / `toState` / `source` | `handleSetMuscleState()` in `BodyMapApp.jsx` (skips no-op transitions, defaults `source: "manual"`) |
  | Export JSON contains `stateChanges`, `goals: []`, `adherence: []`; re-import round-trips cleanly | `exportData()` + `importData()` (both go through `migrateBlobToV3` idempotently) |
  | `npx vite build` passes; existing tabs unchanged | Build gate green; only additive changes to existing handlers |
- **Notes for follow-on tickets.**
  - F2 metrics module reads `stateChanges`/`adherence` from React state passed in by `BodyMapApp` — no localStorage reads inside `src/metrics/*`.
  - F5 (goals) just needs to (a) replace the `goals: []` literal in the save effect with the React `goals` state, and (b) hydrate it in the load effect. The migration helper already preserves any incoming `goals[]` array via `normalizeGoals`.
  - F6 (adherence checkboxes) writes into the `adherence` React state — the persistence path is already wired.
  - The legacy `entries[]` `kind: "adherence"` rows from U8 still live alongside the new log; F6 will decide whether to migrate them or leave them as-is for back-compat. Export round-trip preserves both.

### F2 — Metrics module + live Body Balance Score

- **Status.** ☑ shipped 2026-04-19
- **Spec.** [`stages/02-tracking-metrics/output/plan.md` §2 + §F2](../../02-tracking-metrics/output/plan.md) + [`stages/02a-ux-foundation/output/gamification-spec.md` §1](../../02a-ux-foundation/output/gamification-spec.md)
- **Build verified.** ✅ `npx vite build` exit 0, 1.35 s.
- **Files touched.**
  - `bodymap-app/src/metrics/helpers.js` (new) — date helpers, `splitMuscleId` via `fromMuscleId`, `clamp`.
  - `bodymap-app/src/metrics/stateHistory.js` (new) — M1 (`stateDaysFlagged`, `stateDaysFlaggedAll`, `stateDaysFlaggedAllAt`) + M2 (`flipFrequency`) + `stateChangesSpanDays`.
  - `bodymap-app/src/metrics/symmetry.js` (new) — M3 (`symmetryIndex`) with composite + per-muscle deltas + rolling daily trend.
  - `bodymap-app/src/metrics/load.js` (new) — M4 (`tightnessWeaknessLoad`) with normalized variants.
  - `bodymap-app/src/metrics/hotRegions.js` (new) — M5 (`hotRegions`) using `getMuscleLabel` + base-ID rollup.
  - `bodymap-app/src/metrics/recovery.js` (new) — M6 (`recoveryRate`) with `pending` / `stillFlagged` edge cases.
  - `bodymap-app/src/metrics/adherence.js` (new) — M7 (`adherenceRate`) reading the v3 `adherence[]` log.
  - `bodymap-app/src/metrics/goals.js` (new) — M8 (`goalProgress`) for all four `kind`s including `freeform`.
  - `bodymap-app/src/metrics/correlation.js` (new) — M9 (`assessmentStateCorrelation`) ready for F8 to inject `assessmentDrivers`.
  - `bodymap-app/src/metrics/bodyBalanceScore.js` (new) — composite per gamification-spec §1.
  - `bodymap-app/src/metrics/index.js` (new) — barrel.
  - `bodymap-app/src/lib/useBodyBalanceScore.js` — promoted from cold-start to live derivation via `computeBodyBalanceScore`. Cold-start contract preserved (`< 7d` history → `score: 50, isCalibrating: true`).
  - `bodymap-app/src/BodyMapApp.jsx` — passes `stateChanges` and `adherence` into `useBodyBalanceScore`.
- **What landed.**
  - Every metric is pure: takes raw arrays + `now: Date` + `windowDays`, returns the shape from `plan.md` §2. No `localStorage`, no `Date.now()` inside the module.
  - Bilateral aggregates (`byBaseId`) go through `splitMuscleId`, which calls `fromMuscleId` from `muscle-data.js` — no `endsWith("-l")` string slicing.
  - Inline doctest comments at the top of each metric file cover empty / single-flip / multi-flip cases per the F2 acceptance criterion.
  - The Body Balance Score header chip now reflects M3 + M4 + M6 + M7 once the user has 7+ days of history. Below that threshold the chip stays on "—" (`isCalibrating: true`).
- **Acceptance trace.**
  | Spec criterion (plan.md §F2 / gamification-spec §1) | Code |
  |-----------------------------------------------------|------|
  | Pure functions for M1, M3, M4, M5, M6 (and M2, M7, M8, M9 too) taking raw arrays + `now: Date` + `windowDays` | `src/metrics/*.js` (each metric file) |
  | Empty input handled without throwing | All metric entry points return zero-shaped objects when given `[]` (see doctest comments) |
  | Bilateral aggregates via `fromMuscleId()` — no string slicing | `splitMuscleId` in `helpers.js`, used by `stateHistory.js`, `symmetry.js`, `hotRegions.js`, `correlation.js` |
  | Inline doctest comments demonstrate empty / single-flip / multi-flip behaviour | Header comments of each metric file |
  | BBS formula `0.4·sym + 0.3·tight + 0.2·rec + 0.1·adh` with cold-start at `<7d` | `bodyBalanceScore.js` |
- **Notes for follow-on tickets.**
  - F3 widgets (Progress) now read directly from these named exports.
  - F4 (planner inline summary) and F5 (goals UI) can compose `symmetryIndex`, `stateDaysFlagged`, `goalProgress` without re-deriving anything.
  - F6 will start writing `adherence[]` rows; `adherenceRate` is already ready and the BBS will pick the live signal up automatically.
  - F8 needs to inject `assessmentDrivers` into `assessmentStateCorrelation({ drivers })` — the metric is contract-stable; the lookup is the new file.

### F3 — Progress widgets light up

- **Status.** ☑ shipped 2026-04-19
- **Spec.** [`stages/02-tracking-metrics/output/plan.md` §F3](../../02-tracking-metrics/output/plan.md)
- **Build verified.** ✅ `npx vite build` exit 0, 1.26 s.
- **Files touched.**
  - `bodymap-app/src/ProgressScreen.jsx` — retired `buildHotRegionsFixture`; added live `useMemo` derivations for M3 (symmetry composite + delta + trend), M4 (tightness load), M6 (recovery rate), M7 (adherence rate), and M5 (hot regions). Added `StateChangeTimelineChart` (per-day flip count, into-flagged vs returned-to-normal) inline. Added the calibration banner that drops once `stateChangesSpanDays(stateChanges) >= 7`.
  - `bodymap-app/src/BodyMapApp.jsx` — passes `stateChanges` and `adherence` props through to `<ProgressScreen>`.
  - `bodymap-app/src/SymmetryTrendHero.jsx` — comment updated to reflect that the live wiring exists; slot contract unchanged.
  - `bodymap-app/src/SupportingCardsRow.jsx` — comment updated to record M4 and M6 live, M7 cold-start until F6.
  - `bodymap-app/src/BelowFoldAccordion.jsx` — comment updated to record M5 live, state-change timeline live, M2 still pending F7.
- **What landed.**
  - The Progress hero shows the M3 composite, the previous-window delta, and a 7 / 30 / 90-day rolling sparkline. Switching the window selector recomputes every card and the timeline.
  - Tightness, Recovery, and Hot regions cards render live numbers as soon as the user has any `stateChanges` history. Adherence stays in cold-start until F6 lands real `adherence[]` rows.
  - The State-change timeline accordion slot now renders a tiny stacked-bar SVG of per-day flip counts, colored "into flagged" (amber) vs "returned to normal" (teal). No Recharts dependency added.
  - The calibration banner ("not enough history yet — keep flagging muscles for N more days") appears whenever `stateChanges` spans fewer than 7 calendar days.
- **Acceptance trace.**
  | Spec criterion (plan.md §F3) | Code |
  |------------------------------|------|
  | Five widgets render in order: symmetry hero (with sparkline), tightness load, hot regions top-5, recovery rate, state-change timeline | `<SymmetryTrendHero>` + `<SupportingCardsRow>` + `BelowFoldAccordion` slots in `ProgressScreen.jsx` |
  | Window selector (7 / 30 / 90 days) updates all five widgets | `windowDays` state + `useMemo` deps in `ProgressScreen.jsx`; selector lives in `<SymmetryTrendHero>` and forwards to `setWindowDays` |
  | Empty-state copy when `stateChanges` spans `< 7` days | Calibration banner above the hero in `ProgressScreen.jsx` |
  | Build passes; existing tabs unchanged | Build gate green; Plan/Today/Body untouched aside from BBS receiving live data |
- **Notes for follow-on tickets.**
  - All `TODO(stage-02-b)` markers in `ProgressScreen.jsx` / `SymmetryTrendHero.jsx` / `SupportingCardsRow.jsx` / `BelowFoldAccordion.jsx` are now resolved or migrated into doc comments describing follow-on owners (F6 for adherence, F7 for flip frequency, F8 for assessment drivers).
  - Today screen still passes `components={null}` to `<BodyBalanceScore>` (only the header chip is wired to the live hook). Wiring the Today hero to `useBodyBalanceScore({ stateChanges, adherence, … })` is a one-liner candidate for F4 or F-Phase 2 polish.
  - Hot regions still reads `entries`/`muscleStates` only via the empty-state branch (when `hasAnyData` is false). All populated branches go through M5.

### F4 — Planner inline "since last week" micro-summary

- **Status.** ☑ shipped 2026-04-19
- **Spec.** [`stages/02-tracking-metrics/output/plan.md` §F4](../../02-tracking-metrics/output/plan.md)
- **Build verified.** ✅ `npx vite build` exit 0, 1.27 s.
- **Files touched.**
  - `bodymap-app/src/PlanWeeklySummary.jsx` (new) — dismissible card that composes M2 (`flipFrequency`), M3 (`symmetryIndex` composite delta), and M5 (`hotRegions`) for the current 7d window vs. the prior 7d window. Calibration branch lights up first when `stateChangesSpanDays(stateChanges) < 7`. Local `useState` owns the dismissed flag. Mobile collapses to a one-line condensed view; desktop renders three side-by-side stat tiles plus the top-3 hot-region chips.
  - `bodymap-app/src/PlanScreen.jsx` — accepts `stateChanges` and renders `<PlanWeeklySummary />` between the WeeklyStrip/Goal row and the embedded `<SessionPlanner>` slot.
  - `bodymap-app/src/BodyMapApp.jsx` — passes `stateChanges` down to `<PlanScreen>`.
- **What landed.**
  - The Plan tab now opens with a "since last week" card that mirrors the Progress hero in spirit but stays scoped to the planner (no window selector, no sparkline). Three stats render: symmetry composite delta (M3), total flips delta (M2), and the top-3 flagged regions of the week (M5).
  - Calibration framing surfaces the same days-to-7 message used elsewhere so the cold-start UX matches the Progress banner — no false signal is shown until `stateChanges` covers ≥7 days.
  - Card is dismissible per session (component-local state; not persisted) per the plan.md §F4 acceptance criterion. Token-only styling: `rounded-14`, `border-zinc-800`, `bg-zinc-900/60`, brand teal accents for the dismiss button, `state-tight` / `state-balanced` colors for delta direction.
  - Educational tone: every stat carries a short sentence explaining what "good" means (lower symmetry composite is better, fewer flips means a calmer body, hot regions are flag-day counts not pain).
- **Acceptance trace.**
  | Spec criterion (plan.md §F4) | Code |
  |------------------------------|------|
  | Card sits above the planner widget on the Plan tab | `<PlanWeeklySummary stateChanges={stateChanges} />` rendered in `PlanScreen.jsx` between weekly/goal row and `planner` slot |
  | Symmetry composite delta vs prior 7 days (M3) | `symmetryIndex({ stateChanges, now, windowDays: 7 })` vs `now - 7d` in `PlanWeeklySummary.jsx` |
  | Top-3 hot regions this week (M5) | `hotRegions({ stateChanges, now, windowDays: 7, topN: 3 })` |
  | Total flips last 7 days vs prior 7 days (M2) | `flipFrequency({ stateChanges, now, windowDays: 7 })` vs `now - 7d` |
  | Reuses existing `src/metrics` exports — no re-derivation | All three metrics imported from the `./metrics` barrel |
  | Dismissible via component-local state | `useState(false)` + close button; not persisted |
  | Mobile-friendly collapse | Stat row uses `grid-cols-1 md:grid-cols-3`; condensed mobile copy |
  | Calibration when `< 7d` of `stateChanges` | `stateChangesSpanDays(stateChanges) < 7` branch returns the calibrating card |
- **Notes for follow-on tickets.**
  - F5 can drop a Goals row into the same card or alongside it without re-deriving M3 — `PlanWeeklySummary` exports nothing yet but its memoized stats are easy to factor out into a small hook if F7 wants the same slice on the Today screen.
  - F7 (advanced metrics) should reuse the `flipFrequency` delta math from this file; consider promoting `describeDelta` into `src/metrics/helpers.js` if a third surface needs the same wording.

### F6 — Adherence checkboxes + adherence[] catalog write-through

- **Status.** ☑ shipped 2026-04-19
- **Spec.** [`stages/02-tracking-metrics/output/plan.md` §F6](../../02-tracking-metrics/output/plan.md)
- **Build verified.** ✅ `npx vite build` exit 0, 1.29 s.
- **Files touched.**
  - `bodymap-app/src/BodyMapApp.jsx` — added `isoDayKeyLocal()` helper; new `handleAdherenceChange(row)` writes/updates the v3 `adherence[]` log with dedup on (`date`, `muscleId`, `remedyKey`); `saveSlideOutLog` now forks adherence events into both the legacy `entries[]` log AND `handleAdherenceChange` so the U8 first-remedy-done milestone keeps firing while M7 reads from a single source. New props pumped down to `<BodyScreen>` and `<SessionPlanner>`.
  - `bodymap-app/src/BodyScreen.jsx` — accepts and forwards `adherence` + `onAdherenceChange` to `<MuscleSlideOut>`.
  - `bodymap-app/src/MuscleSlideOut.jsx` — `RemediesWithAdherence` now reads `adherenceList` (the global v3 log) instead of a local `Set`, and seeds "suggested" rows for the first six displayed remedies on Remedies-tab open. `markDone(remedy)` now toggles between "done" (writes via `onSaveLog` so legacy back-compat is preserved AND updates the v3 log via `handleAdherenceChange`) and reverting back to "suggested". Added a "Skip" button that writes `status: "skipped"` directly through `onAdherenceChange`.
  - `bodymap-app/src/SessionPlanner.jsx` — accepts `adherence` + `onAdherenceChange`. Indexes today's adherence rows by `${muscleId}::${remedyKey}` and seeds "suggested" rows whenever the marked-muscles set changes (idempotent via dedup). `<SessionBlock>` now renders Done / Skip checkbox-style buttons per remedy, reading row status from the global log so the UI and persisted catalog stay aligned across re-renders.
  - `bodymap-app/src/ProgressScreen.jsx` — adherence card now lights up as soon as `adherenceMetric.suggested > 0` rather than gating on the global stateChanges calibration banner.
- **What landed.**
  - The Plan tab session view now ships per-remedy Done / Skip toggles. Tapping Done writes a row to `adherence[]` with `status: "done"`. Tapping Skip writes `status: "skipped"`. Tapping Done a second time reverts the row to `status: "suggested"` so the user can correct a misclick.
  - Whenever the planner shows a remedy, a "suggested" row is auto-written (deduped) so M7 has both a numerator and a denominator from day one — no more 0% headlines on cold-start.
  - The slide-out Remedies tab uses the same global `adherence[]` log as the planner: a remedy marked done in the slide-out shows as Done on the Plan tab and counts toward M7 the same way. The legacy `entries[]` `kind: "adherence"` row still fires from the slide-out so the U8 first-remedy-done milestone keeps working unchanged.
  - The Progress tab Adherence card (M7) now lights up independently: it switches from the cold-start dash to the live "X of Y this week" headline as soon as any adherence row exists in the current 7-day window, regardless of whether the symmetry / tightness / recovery banner is still calibrating.
  - Storage path: every adherence write goes through the existing v3 save effect (`useEffect` snapshotting the v3 blob to `dot-body-map-v3`). Export and re-import round-trip preserves the rows. `migrateLegacyId()` is applied to every `muscleId` written into the log.
- **Acceptance trace.**
  | Spec criterion (plan.md §F6) | Code |
  |------------------------------|------|
  | `handleAdherenceChange(adherenceRow)` in `BodyMapApp.jsx` appending/updating `adherence` React state | `handleAdherenceChange()` in `BodyMapApp.jsx` (dedup by `date+muscleId+remedyKey`, writes via `setAdherence`) |
  | `SessionPlanner` seeds "suggested" rows when a session is generated | `useEffect` in `SessionPlanner.jsx` that emits one suggested row per displayed remedy via `onAdherenceChange` |
  | Done / Skip buttons per remedy | `<SessionBlock>` per-remedy `<button>` pair (`onMark={handleMarkRemedy}`) |
  | `MuscleSlideOut` continues writing `kind: "adherence"` to `entries[]` AND writes `adherence[]` rows with `status: "done"` for slide-out completions | `markDone()` in `MuscleSlideOut.jsx` calls `onSaveLog`, which forks into `entries[]` and `handleAdherenceChange` inside `BodyMapApp.saveSlideOutLog` |
  | Dedup on (`date`, `muscleId`, `remedyKey`) | `findIndex` block in `handleAdherenceChange` |
  | Adherence card on Progress goes live with M7 from `adherence[]` | `adherencePropForCard = adherenceMetric && adherenceMetric.suggested > 0 ? adherenceMetric : null` in `ProgressScreen.jsx` |
  | Calibration logic lights up independently | Adherence card no longer gated on the symmetry calibration banner — only on its own `suggested > 0` |
  | All `muscleId` writes go through `migrateLegacyId()` | `handleAdherenceChange` calls `migrateLegacyId(row.muscleId)` before persisting |
  | Build green, no broken existing flows | Build gate passed; legacy `entries[]` adherence path + U8 milestone unchanged |
- **Notes for follow-on tickets.**
  - The Body Balance Score auto-promotes M7 from the neutral-50 cold-start contribution to the live signal as soon as `adherence[]` has data; no extra wiring needed.
  - F5 (goals) can write similar suggested → done state machines into a `goalProgress` log and reuse the same dedup pattern.
  - F7 (advanced metrics — flip frequency) can read both planner adherence and stateChanges to compute "did marking this remedy done correlate with the muscle returning to normal within the recovery window?". The data is now in the same shape M9 expects.
  - The session-planner seed is bound to `markedMuscles` identity, not a calendar tick. If a session crosses midnight while open, the user will see the prior day's seeded rows until they re-mark a muscle — acceptable for now since the Plan tab is rarely held open across days; revisit in F-Phase 4 polish if export reports show it.

### F5 — Goals data model + GoalsPanel + goal-progress wiring

- **Status.** ☑ shipped 2026-04-19
- **Spec.** [`stages/02-tracking-metrics/output/plan.md` §3.3 + §4 F5](../../02-tracking-metrics/output/plan.md)
- **Build verified.** ✅ `npx vite build` exit 0 (post-receipt refresh).
- **Files touched.**
  - `bodymap-app/src/BodyMapApp.jsx` — `goals` hydrated from `migrateBlobToV3` / `normalizeGoals` on load + import; save effect writes live `goals` array; `normalizeOneGoal` maps U7 onboarding shapes to v3 kinds; `handleAddGoal` / `handleUpdateGoal` / `handleArchiveGoal` + `upsertGoal` dedupe by `id` (F6-style merge).
  - `bodymap-app/src/GoalsPanel.jsx` — list + create/edit modal for four kinds; M8-driven rows (`goalProgress`); `id="dot-goals-panel"` for Plan scroll target.
  - `bodymap-app/src/GoalCard.jsx` — at-a-glance ring + copy wired to M8 for persisted goals; `New goal` scrolls to full panel.
  - `bodymap-app/src/PlanScreen.jsx` — `GoalsPanel` between `PlanWeeklySummary` and planner; passes `stateChanges` / `adherence` into `GoalCard`.
  - `bodymap-app/src/ProgressScreen.jsx` — read-only `GoalsPanel` below supporting cards (full edit stays on Plan).
- **What landed.**
  - v3 `goals[]` is the single persistence path for wizard seeds and GoalsPanel CRUD; export/import round-trip through `normalizeGoals` + `migrateLegacyId` on `targetMuscleId`.
  - Active goals show live baseline / current / target / `onTrack` from M8; freeform shows “tracking by hand” with no bar.
- **Acceptance trace.**
  | Criterion | Code |
  |-----------|------|
  | Persist + reload | Save `useEffect` includes `goals` in JSON payload to `dot-body-map-v3` |
  | Export/import | `exportData` + `importData` → `migrateBlobToV3` → `setGoals` |
  | M8 progress | `GoalsPanel` + `GoalCard` call `goalProgress` from `./metrics` |
  | U7 seeds | `normalizeOneGoal` + `U7_GOAL_KIND_MAP` in `BodyMapApp.jsx` |
- **Notes for follow-on tickets.**
  - F9: final storage-schema.md pass should mention `goals[]` as live (already true in code).

### F7 — Flip frequency + recovery rate trend charts

- **Status.** ☑ shipped 2026-04-19
- **Spec.** [`stages/02-tracking-metrics/output/plan.md` §4 F7](../../02-tracking-metrics/output/plan.md)
- **Build verified.** ✅ `npx vite build` exit 0; `BelowFoldCharts` lazy chunk present.
- **Files touched.**
  - `bodymap-app/src/BelowFoldCharts.jsx` — `FlipFrequencyChart` (M2, top 10, L/R/combined); `RecoveryRateTrendChart` (M6 sampled weekly ~90d); calibration copy when `stateChangesSpanDays < 7` for both flip-frequency and recovery trend paths per spec.
  - `bodymap-app/src/ProgressScreen.jsx` — lazy `BelowFoldCharts` in `flipFrequency` + `recoveryTrend` accordion slots; `windowDays` passed to flip-frequency only.
- **What landed.**
  - Flip-frequency respects the hero window selector; recovery trend uses rolling weekly M6 samples with fixed lookback.
  - Recharts strokes/fills use theme-mirrored token constants (documented beside `tailwind.config.js` brand / state colors).
- **Notes for follow-on tickets.**
  - F9 polish: optional chunk-size note only; no metric changes.

### F8 — Assessment-to-state correlation view

- **Status.** ☑ shipped 2026-04-19
- **Spec.** [`stages/02-tracking-metrics/output/plan.md` §3.4 + §4 F8](../../02-tracking-metrics/output/plan.md)
- **Build verified.** ✅ `npx vite build` exit 0.
- **Files touched.**
  - `bodymap-app/src/data/assessment-drivers.js` — `ASSESSMENT_DRIVERS` maps every `ASSESSMENT_TESTS[].name` to `SUB_MUSCLES` base IDs; `migrateLegacyId` applied at module load.
  - `bodymap-app/src/BelowFoldCharts.jsx` — `AssessmentCorrelationChart`: dual-axis ComposedChart (assessment line + driver flagged-day bars); L/R picker; `useEffect` keeps test selector in sync; educational legend copy.
  - `bodymap-app/src/ProgressScreen.jsx` — `assessmentTrends` slot: existing `TrendCharts` + correlation block gated on `assessments.length`; passes `drivers`, `windowDays`, `now` into lazy chart.
- **What landed.**
  - M9 (`assessmentStateCorrelation`) composed in UI with static driver map; empty states when no assessments or no matching series.
- **Notes for follow-on tickets.**
  - F9: doc sync for driver map + manual regression on assessment import/export.

### F9 — Export/import QA + docs update

- **Status.** ☑ shipped 2026-04-20
- **Spec.** [`stages/02-tracking-metrics/output/plan.md` §F9](../../02-tracking-metrics/output/plan.md)
- **Build verified.** ✅ `npx vite build` exit 0, 2.68 s; 655.41 kB index.
- **Files touched.**
  - `_config/storage-schema.md` — removed "Doc status / working source of truth" banner; added "What changed in v3 vs v2" delta callout; fixed `goals` row from "placeholder" to "✅ live (F5)"; updated goals shape comment.
  - `PROJECT_NOTES.md` — §Tech Stack row bumped `schemaVersion: 2` → `3` with link to schema doc; §Storage fully rewritten with v3 JSON shape, migration and legacy-ID notes, and canonical-doc link.
  - `BODY_MODEL_ROADMAP.md` — four stale `schemaVersion:2` references bumped to `3`: §2 ongoing tracks table, §8.2 handoff template, §8.5 filled example, §9.8 summary sentence.
  - `_core/CONVENTIONS.md` — §3 schema shape comment for `goals[]` updated from "still placeholder" to "live as of F5".
  - `stages/02b-tracking-implementation/output/completion-log.md` — F9 receipt row + stage-shipped block.
  - `stages/02b-tracking-implementation/CONTEXT.md` — front-matter status → ☑ shipped; F-Phase 4 row → ☑ shipped.
  - `CONTEXT.md` (root) — Stage 02-B → ☑ shipped; Stage 03 → ☐ queued.
  - `stages/02b-tracking-implementation/output/IMPLEMENTATION_KICKOFF_PROMPT.md` — status table all ☑; active prompt archived; Stage 03 stub promoted.
- **What landed.**
  - Every doc that referenced `schemaVersion: 2` now says `3` and describes the full v3 shape (including `stateChanges`, `goals`, `adherence`, `dailySnapshots`, `onboarding`, `streak`, `milestones`).
  - The schema doc's working-draft banner is replaced by a permanent "v3 vs v2" delta callout — no more ambiguity about whether the doc is authoritative.
  - Build gate green (docs-only change — no code diff).
- **Acceptance trace.**
  | Spec criterion (plan.md §F9) | Evidence |
  |------------------------------|----------|
  | `_config/storage-schema.md` reflects v3; "Gaps" / working-draft banner removed | Delta callout added; banner removed; goals row fixed |
  | `PROJECT_NOTES.md` §Storage updated | Tech stack table + §Storage fully rewritten |
  | `BODY_MODEL_ROADMAP.md` §Storage updated | Four `schemaVersion:2` refs → `3` |
  | Docs and code agree on the schema | All docs now show `schemaVersion: 3` with all 10 top-level keys matching `BodyMapApp.jsx` exportData payload |
  | `npx vite build` passes | ✅ 655.41 kB, 2.68s, no errors |
- **Notes for follow-on tickets.**
  - Stage 02-B is complete. No follow-on within this stage.
  - Stage 03 (deeper intelligence) can start fresh — all schema, metrics, and UI wiring are documented and stable.

---

## Stage status: ☑ Shipped

**Stage 02-B (tracking & metrics implementation) is complete.** All nine tickets (F1–F9) shipped across four F-Phases between 2026-04-19 and 2026-04-20. The user now has:

- **Schema v3** with append-only `stateChanges`, structured `goals`, deduped `adherence`, and reserved `dailySnapshots`.
- **Metrics module** (`src/metrics/*`) with M1–M9 + Body Balance Score composite, all pure functions.
- **Progress dashboard** with live symmetry hero, supporting cards, state-change timeline, flip-frequency charts, recovery trend, and assessment correlation.
- **Plan screen** with weekly summary, goals panel, and per-remedy adherence checkboxes.
- **Documentation** fully synced: `storage-schema.md`, `PROJECT_NOTES.md`, `BODY_MODEL_ROADMAP.md`, and `CONVENTIONS.md` all reflect v3.
- **Build gate** green on every ticket.

Successor: **Stage 03 — Deeper intelligence** (☐ queued).
