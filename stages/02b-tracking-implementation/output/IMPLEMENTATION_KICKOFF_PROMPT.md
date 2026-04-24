# Implementation kickoff prompt — Stage 02-B (tracking & metrics)

> **How to use this file.** Copy the block under "Prompt to paste" into a new Cursor chat. The agent will pick up Stage 02-B cleanly and execute the next batch of tickets per `../../02-tracking-metrics/output/plan.md`.
> Keep this file. After each batch ships, swap in the next prompt block — the file is structured top-down by execution order, the active prompt is always at the top, shipped prompts get archived at the bottom.

---

## Status — what has shipped

| Phase | Tickets | Status | Receipt |
|-------|---------|--------|---------|
| **F-Phase 0: Foundation** | F1 (schema v3 + `stateChanges` write-through) | ☑ shipped 2026-04-19 | [`./completion-log.md` §F1](./completion-log.md) |
| **F-Phase 1: Core dashboard metrics** | F2 (metrics module + live `useBodyBalanceScore`), F3 (Progress widgets light up) | ☑ shipped 2026-04-19 | [`./completion-log.md` §F2 / §F3](./completion-log.md) |
| **F-Phase 2: Adherence + planner inline summary** | F4 (planner inline "since last week" summary), F6 (adherence checkboxes + `adherence[]` catalog write-through) | ☑ shipped 2026-04-19 | [`./completion-log.md` §F4 / §F6](./completion-log.md) |
| **F-Phase 3: Goals + advanced metrics** | F5, F7, F8 | ☑ shipped 2026-04-19 | [`./completion-log.md`](./completion-log.md) §F5 / §F7 / §F8 |
| **F-Phase 4: Polish** | F9 | ☑ shipped 2026-04-20 | [`./completion-log.md` §F9](./completion-log.md) |

Stage 02-A.5 (UX foundation implementation) shipped 2026-04-19; all eight U-tickets green; every swap-point this stage fills was reserved there. See [`../../02a5-ux-implementation/output/completion-log.md`](../../02a5-ux-implementation/output/completion-log.md) for the swap-point contracts you'll be wiring into.

Stage 02-B F-Phase 0 through F-Phase 3 shipped 2026-04-19 — schema v3 is live (`STORAGE_SCHEMA_VERSION = 3`, `dot-body-map-v3` key), `src/metrics/*` has M1–M9 + `bodyBalanceScore`, Progress hero + supporting cards + accordion slots are live (including F7 `BelowFoldCharts` and F8 assessment–driver overlay), Plan has F4 `PlanWeeklySummary` + F5 `GoalsPanel` + `GoalCard`, and F6 adherence flows through `handleAdherenceChange`. See `./completion-log.md` for receipts.

---

## Prompt to paste (next session — Stage 03 kickoff)

**Stage 02-B is complete.** The prompt below is a stub for the next stage. Flesh it out when Stage 03 is ready to begin.

```
You are starting Stage 03 (deeper intelligence) for the Dot Body Map
project. Stage 02-B (tracking & metrics implementation) shipped
2026-04-20 — schema v3 is live, src/metrics/* has M1–M9 + Body Balance
Score, every Progress / Plan / Today widget is wired, and all docs are
synced.

Read in order:
  1. c:\phsioclick\CLAUDE.md
  2. c:\phsioclick\CONTEXT.md
  3. c:\phsioclick\stages\03-deeper-intelligence\CONTEXT.md  (to be created)

Stage 03 scope (to be defined by the user):
  - ML / trend forecasting?
  - Janda cross-pattern symmetry weighting?
  - Predictive recovery windows?
  - Advanced correlation / causation insights?
  - Daily snapshot rollup automation?

Do not begin coding until the user confirms scope and tickets.
```

---

## Reference — what's on disk for Stage 02-B

For agent verification of inputs.

| Path | What it is |
|------|------------|
| [`./CONTEXT.md`](../CONTEXT.md) | Implementation stage contract |
| [`./completion-log.md`](./completion-log.md) | Ticket receipts (F1–F8 ☑ shipped 2026-04-19; F9 next) |
| [`../../02-tracking-metrics/output/plan.md`](../../02-tracking-metrics/output/plan.md) | The spec — F1–F9 ticket bodies, M1–M9 catalog, v3 schema diff + migration |
| [`../../02-tracking-metrics/output/decisions.md`](../../02-tracking-metrics/output/decisions.md) | Six confirmed decision forks |
| [`../../02a5-ux-implementation/output/completion-log.md`](../../02a5-ux-implementation/output/completion-log.md) | U1–U8 receipts + swap-point notes |
| [`../../02a-ux-foundation/output/gamification-spec.md`](../../02a-ux-foundation/output/gamification-spec.md) | Body Balance Score formula + cold-start contract — implemented in F2 |
| [`../../02a-ux-foundation/output/schema-delta.md`](../../02a-ux-foundation/output/schema-delta.md) | U7+U8 additive fields folded into v3 by F1 |
| [`../../../_config/storage-schema.md`](../../../_config/storage-schema.md) | Current schema doc (F9 owns the final regression-QA pass + delta callout) |
| [`../../../bodymap-app/src/metrics/index.js`](../../../bodymap-app/src/metrics/index.js) | Metrics barrel — M1–M9 + bodyBalanceScore + helpers |
| [`../../../bodymap-app/src/lib/useBodyBalanceScore.js`](../../../bodymap-app/src/lib/useBodyBalanceScore.js) | Live BBS hook (cold-start preserved at <7d history; M7 live as of F6) |
| [`../../../bodymap-app/src/ProgressScreen.jsx`](../../../bodymap-app/src/ProgressScreen.jsx) | Progress widgets + read-only GoalsPanel + F7/F8 chart slots |
| [`../../../bodymap-app/src/PlanScreen.jsx`](../../../bodymap-app/src/PlanScreen.jsx) | F4 inline summary (PlanWeeklySummary) lives above the planner; F5 GoalsPanel anchors here |
| [`../../../bodymap-app/src/PlanWeeklySummary.jsx`](../../../bodymap-app/src/PlanWeeklySummary.jsx) | F4 dismissible "since last week" micro-summary card |
| [`../../../bodymap-app/src/SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx) | F6 adherence checkboxes + suggested-row seeding live here |
| [`../../../bodymap-app/src/MuscleSlideOut.jsx`](../../../bodymap-app/src/MuscleSlideOut.jsx) | F6 keeps the legacy `entries[]` adherence event AND writes `adherence[]` |
| [`../../../bodymap-app/src/BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) | Schema v3 migration + `handleSetMuscleState` + `handleAdherenceChange` (F1 + F6); F5 `goals[]` persistence |

---

### F-Phase 4 prompt (F9) — shipped 2026-04-20

```
You are closing Stage 02-B (tracking & metrics implementation). F1
through F8 have shipped. F9 is the polish + docs sync ticket that
closes the stage.

Read in order:
  1. c:\phsioclick\CLAUDE.md
  2. c:\phsioclick\CONTEXT.md
  3. c:\phsioclick\stages\02b-tracking-implementation\CONTEXT.md
  4. c:\phsioclick\stages\02b-tracking-implementation\output\completion-log.md
  5. c:\phsioclick\stages\02-tracking-metrics\output\plan.md §4 F9

Ticket: F9 — Export/import QA + docs update. See completion-log.md §F9
for the full receipt.
```

### F-Phase 3 prompt (F5 + F7 + F8) — shipped 2026-04-19

```
You are continuing the Dot Body Map project as Stage 02-B (tracking &
metrics implementation). F-Phase 0 (F1), F-Phase 1 (F2 + F3), and
F-Phase 2 (F4 + F6) have already shipped — schema v3 is live,
src/metrics/* exists with M1–M9 + bodyBalanceScore composite, every
Progress widget pulls live data, the planner shows the "since last
week" micro-summary, and adherence checkboxes in both the planner and
the muscle slide-out write to the v3 adherence[] catalog (with
dedup on date+muscleId+remedyKey). M7 is live and the Body Balance
Score auto-promotes M7 from neutral-50 to live as soon as adherence
rows exist.

This workspace uses Jake Van Clief's Interpretable Context Methodology —
folder structure as agent architecture. Read top-down, stop when you have
what you need.

Read in order:

  1. c:\phsioclick\CLAUDE.md
  2. c:\phsioclick\CONTEXT.md
  3. c:\phsioclick\_core\CONVENTIONS.md
  4. c:\phsioclick\stages\02b-tracking-implementation\CONTEXT.md
  5. c:\phsioclick\stages\02b-tracking-implementation\output\completion-log.md
  6. c:\phsioclick\stages\02-tracking-metrics\output\plan.md
  7. c:\phsioclick\stages\02a5-ux-implementation\output\completion-log.md

You are NOT scaffolding the stage and you are NOT touching anything F1,
F2, F3, F4, or F6 already shipped. Your job is to fill the F-Phase 3
swap-points: goals UI + v3 persistence (F5), flip-frequency / recovery
charts (F7), and assessment-to-state correlation (F8).

Tickets: F5 (GoalsPanel + M8 wiring), F7 (M2 flip chart + M6 recovery
trend in BelowFoldCharts), F8 (assessment-drivers.js + M9 dual-axis chart).
Full ticket bodies and constraints lived in the 2026-04-19 implementation
handoff; acceptance is recorded in completion-log.md §F5–§F8.

When done: append receipts, update CONTEXT + kickoff prompt, run
cd c:\phsioclick\bodymap-app && npx vite build.
```

### F-Phase 2 prompt (F4 → F6) — shipped 2026-04-19

```
You are continuing the Dot Body Map project as Stage 02-B (tracking &
metrics implementation). F-Phase 0 (F1) and F-Phase 1 (F2 + F3) have
already shipped — schema v3 is live, src/metrics/* exists with M1–M9 +
bodyBalanceScore composite, every Progress widget pulls live data, and
useBodyBalanceScore() returns the real composite as soon as the user
has 7+ days of stateChanges history (cold-start neutral 50 below that).

This workspace uses Jake Van Clief's Interpretable Context Methodology —
folder structure as agent architecture. Read top-down, stop when you have
what you need.

Read in order:

  1. c:\phsioclick\CLAUDE.md
  2. c:\phsioclick\CONTEXT.md
  3. c:\phsioclick\_core\CONVENTIONS.md
  4. c:\phsioclick\stages\02b-tracking-implementation\CONTEXT.md
  5. c:\phsioclick\stages\02b-tracking-implementation\output\completion-log.md
  6. c:\phsioclick\stages\02-tracking-metrics\output\plan.md
  7. c:\phsioclick\stages\02a5-ux-implementation\output\completion-log.md

Tickets:
  F4 — Planner inline "since last week" micro-summary (per plan.md §4 F4)
       Card above the session/weekly tabs showing M3 composite delta vs
       prior 7d, top-3 hot regions (M5), total flips delta (M2). Local
       useState dismissal. Mobile collapses to one-line. Calibration line
       when stateChanges < 7d. Reuses src/metrics exports — no new
       metrics. Touches Plan only.

  F6 — Adherence checkboxes + adherence[] catalog (per plan.md §4 F6 +
       §3.1 schema)
       BodyMapApp handleAdherenceChange handler appends/updates rows in
       adherence React state, deduped on (date, muscleId, remedyKey).
       SessionPlanner + RemedyPanel seed "suggested" rows per remedy when
       a session is generated. Done / Skip checkboxes flip status.
       MuscleSlideOut continues writing kind: "adherence" to entries[]
       AND ALSO writes adherence[] rows with status: "done". Adherence
       card on Progress goes live with M7; calibration logic lights up
       independently.
```

### F-Phase 0 + F-Phase 1 prompt (F1 → F2 → F3) — shipped 2026-04-19

```
You are continuing the Dot Body Map project as Stage 02-B (tracking &
metrics implementation). Stage 02-A.5 (UX foundation) has shipped — all
eight U-tickets are green and the codebase is ready for real metric data
behind the swap-points U6 + U8 reserved.

Read in order:
  1. c:\phsioclick\CLAUDE.md
  2. c:\phsioclick\CONTEXT.md
  3. c:\phsioclick\_core\CONVENTIONS.md
  4. c:\phsioclick\stages\02b-tracking-implementation\CONTEXT.md
  5. c:\phsioclick\stages\02b-tracking-implementation\output\completion-log.md
  6. c:\phsioclick\stages\02-tracking-metrics\output\plan.md
  7. c:\phsioclick\stages\02-tracking-metrics\output\decisions.md
  8. c:\phsioclick\stages\02a5-ux-implementation\output\completion-log.md
  9. c:\phsioclick\stages\02a-ux-foundation\output\schema-delta.md
 10. c:\phsioclick\_config\storage-schema.md

Tickets (in order):
  F1 — Schema v3 migration + stateChanges write-through (per plan.md §4 F1
       + §3 schema diff + §3.2 migration)
  F2 — Metrics module (per plan.md §4 F2 + §2 metric catalog) — pure
       functions M1–M9 + bodyBalanceScore + index barrel; live
       useBodyBalanceScore composing M3/M4/M6/M7 with cold-start <7d.
  F3 — Progress widgets light up (per plan.md §4 F3) — adapt to U6
       Progress shell (NOT the legacy Dashboard); search the codebase
       for `TODO(stage-02-b)` to find every slot.
```

_(Originally drafted as the "Prompt to paste" before F-Phase 0 + F-Phase 1 shipped 2026-04-19. Later phase prompts were promoted as each phase activated; F-Phase 3 full text is abbreviated above with a pointer to `completion-log.md`.)_
