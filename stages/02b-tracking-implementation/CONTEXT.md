# Stage 02-B — Tracking & metrics implementation

> **Status:** ☑ Shipped (scaffolded 2026-04-19; F1–F8 shipped 2026-04-19; F9 shipped 2026-04-20; stage closed).
> **Predecessor (planning):** Stage 02 (tracking & metrics) — specs live in [`../02-tracking-metrics/output/plan.md`](../02-tracking-metrics/output/plan.md) and [`../02-tracking-metrics/output/decisions.md`](../02-tracking-metrics/output/decisions.md).
> **Predecessor (UX shell):** Stage 02-A.5 (UX foundation implementation) — receipts in [`../02a5-ux-implementation/output/completion-log.md`](../02a5-ux-implementation/output/completion-log.md). Every swap-point this stage fills was reserved there.
> **Successor:** Stage 03 (deeper intelligence) once F-Phase 4 closes.
>
> **Why this folder exists.** Stage 02 (planning) and Stage 02-A.5 (UX shell + swap-point reservations) are both shipped. Per the 02-A → 02-A.5 split that worked well, this folder is the dedicated execution stage for the tracking & metrics work — `output/plan.md` lives one folder over and is consumed read-only.

---

## Why this stage exists

Stage 02 produced nine tickets (F1–F9), a v3 schema diff, and a metric catalog (M1–M9). Stage 02-A.5 wired the UI shell that those metrics will eventually feed: every Progress card and every Today hero already has a slot, a `TODO(stage-02-b)` comment naming the metric ID, and a stable contract (props or hook signature) that does not need to change when real numbers arrive.

This stage **executes** the F1–F9 plan against the codebase ticket-by-ticket so the user can:

1. See whether they're getting more balanced over time (composite symmetry trend on the Progress hero).
2. Watch a flagged muscle resolve (state-change timeline + recovery-rate card).
3. Check that they're following through on suggested remedies (adherence rate + per-goal progress).
4. Get a single Body Balance Score on Today that reflects all of the above (the `useBodyBalanceScore` hook flips from cold-start to live derivation).

---

## Inputs

Read in this order. Stop when the active ticket has what it needs.

| File | Why read it |
|------|-------------|
| `CLAUDE.md` | Identity + non-negotiables (always) |
| `CONTEXT.md` (root) | Confirms 02-A.5 is shipped and 02-B is active |
| `_core/CONVENTIONS.md` | Invariants — especially §3 schema (live v3: `stateChanges` / `goals` / `adherence` / `dailySnapshots` + `onboarding` / `streak` / `milestones`), §4 build gate, §5 do-not-break (four-tab IA, Progress accordion live widgets, Onboarding/Tour/Settings, StreakBadge, MilestoneToast, adherence event in entries[] AND adherence[], BBS chip, SymmetryTrendHero, SupportingCardsRow with live M7, state-change timeline, hot regions, planner inline "since last week" summary, planner adherence checkboxes, slide-out Skip toggle), §7 aesthetic (tokens only) |
| `../02-tracking-metrics/CONTEXT.md` | Planning stage contract; explains why the metrics catalog is shaped the way it is |
| `../02-tracking-metrics/output/plan.md` | **The spec.** F1–F9 ticket bodies (§4), v3 schema diff + migration (§3), phased roadmap (§5), and the paste-ready first three tickets (§7) |
| `../02-tracking-metrics/output/decisions.md` | The six confirmed decision forks (state history shape, granularity, symmetry definition, adherence model, goal vocabulary, dashboard surface) |
| `../02a5-ux-implementation/output/completion-log.md` | **The swap-points.** Every U-ticket's "Notes for follow-on tickets" calls out exactly what 02-B is meant to fill. Read U6 (Progress slots) and U8 (`useBodyBalanceScore`, milestones, adherence persistence) closely |
| `../02a-ux-foundation/output/schema-delta.md` | Confirms the U7+U8 additive fields (`onboarding`, `streak`, `milestones`) — F1's v3 bump folds these in verbatim |
| `_config/storage-schema.md` | Live v3 shape. `stateChanges` / `adherence` / `goals[]` are live writers (F1 / F6 / F5). `dailySnapshots[]` reserved. F9 owns the final canonical doc pass. |
| `references/tracking-gap-analysis.md` *(in `../02-tracking-metrics/`)* | Reference: the original "what's missing" problem statement |
| `references/current-state-model.md` *(in `../02-tracking-metrics/`)* | Reference: snapshot of how state/entries/assessments work today, with extension-point hints |

---

## Process

This stage runs the nine tickets F1–F9 from `../02-tracking-metrics/output/plan.md` §4 in the four F-Phases defined in §5. Each ticket is one batch of work; each batch ends with the build gate green and a row appended to `output/completion-log.md`.

### Hard rules (apply to every ticket)

1. **Build gate is non-negotiable.** `cd c:\phsioclick\bodymap-app && npx vite build` must pass before any ticket is called "done."
2. **Do not break the v1, v2, OR v3 flows** listed in `_core/CONVENTIONS.md` §5. The "Do not break" list now includes the four-tab IA, every Progress accordion slot (live M3 hero + M4/M6/M7 cards + M5 hot regions + state-change timeline), the Onboarding wizard, per-tab tour overlays, the Settings drawer, the live StreakBadge, MilestoneToast queue, the adherence event in `entries[]`, the planner inline "since last week" summary (F4 `PlanWeeklySummary`), and the planner / slide-out adherence checkboxes that round-trip through `BodyMapApp.handleAdherenceChange` (F6).
3. **Stable muscle IDs.** Use `SUB_MUSCLES` base IDs from `bodymap-app/src/muscle-data.js` as the join key — never invent new IDs. Apply `migrateLegacyId()` to every `muscleId` that flows through the v3 migration (synthetic seeds, imported blobs, goal targets, adherence rows).
4. **Educational tone.** Metric copy is self-coaching ("aim for", "since your last flag"), never diagnostic ("you have", "you must"). The footer disclaimer stays on every screen.
5. **Tokens only.** Every new chart, card, or widget reaches for the Tailwind theme — `brand`, `state.tight/weak/balanced`, `radius-10/14/20`, `text-display/h1/h2/body-lg/body/caption/micro`, `shadow-elev-*`, motion tokens. No hex literals; no pre-token rose/cyan classes.
6. **Schema bumps go through `BodyMapApp.jsx`'s load path.** F1 is the only ticket that bumps `schemaVersion` (2 → 3). The U7+U8 additive fields (`onboarding`, `streak`, `milestones`) survive the bump verbatim — they were always intended to fold into v3.
7. **Hooks and slot contracts are stable.** `useBodyBalanceScore()` keeps its `{ score, components, isCalibrating }` shape. `MuscleAtlas.stateColors` keeps its per-state color map. `lib/session-plan.js` stays the canonical plan source. The Progress slot props on `SymmetryTrendHero` / `SupportingCardsRow` / `BelowFoldAccordion` may be **added to** but not reshaped.
8. **No new tabs.** Today / Body / Plan / Progress only. Anything that doesn't fit goes inside one of those (or the Settings drawer).

### Phase plan (mirrors `../02-tracking-metrics/output/plan.md` §5)

| Phase | Tickets | Status | Demoable milestone |
|-------|---------|--------|--------------------|
| **F-Phase 0: Foundation** | F1 | ☑ shipped 2026-04-19 | Schema v3 live; flip a muscle, see `stateChanges` grow in localStorage; v2 import migrates safely with synthetic seeds (`source: "migration-seed"`); export round-trips all new fields. Intake wizard + onboarding intake tagged `source: "intake-wizard"`. |
| **F-Phase 1: Core dashboard metrics** | F2, F3 | ☑ shipped 2026-04-19 | `src/metrics/` module live (M1-M9 + helpers + bodyBalanceScore + index barrel); Progress hero shows live composite symmetry trend with 7/30/90-day window selector + sparkline; supporting row shows live M4 + M6 (M7 cold-start until F6); hot regions slot (M5) lit; state-change timeline slot lit; `useBodyBalanceScore` returns a live composite as soon as ≥ 7 days of `stateChanges` exist (otherwise neutral 50 + `isCalibrating: true`); calibration banner explains the wait. |
| **F-Phase 2: Adherence + planner inline summary** | F4, F6 | ☑ shipped 2026-04-19 | Plan screen shows "since last week" micro-summary (M2 + M3 + M5, dismissible, calibrates < 7d); remedy rows in SessionPlanner + slide-out have Done / Skip toggles that write to `adherence[]` (deduped on date+muscleId+remedyKey); adherence rate card on Progress lights up independently as soon as `suggested > 0`; legacy `kind: "adherence"` entries still fire so U8 milestone keeps working |
| **F-Phase 3: Goals + advanced metrics** | F5, F7, F8 | ☑ shipped 2026-04-19 | `goals[]` live in v3 with GoalsPanel + GoalCard + read-only Progress summary; M2 flip-frequency chart + M6 recovery trend (`BelowFoldCharts`); M9 + `assessment-drivers.js` dual-axis correlation in assessment-trends slot |
| **F-Phase 4: Polish** | F9 | ☑ shipped 2026-04-20 | Manual export/import regression in both directions; `_config/storage-schema.md` reflects v3; legacy `PROJECT_NOTES.md` §Storage + `BODY_MODEL_ROADMAP.md` §Storage updated; `output/completion-log.md` finalized; stage closed |

After each ticket: append a row to `output/completion-log.md` mirroring the U1–U8 receipt format (Status, Spec, Build verified, Files touched, What landed, Acceptance trace, Notes for follow-on tickets).

### Stage close-out (when F-Phase 4 ships)

1. Append the final row + a "Stage status" block to `output/completion-log.md`.
2. Update root `CONTEXT.md`: Stage 02-B → ☑ shipped; Stage 03 (deeper intelligence) → ▶ active or ☐ queued depending on user direction.
3. Update this `CONTEXT.md`: front-matter status → ☑ shipped, every F-Phase row → ☑ shipped.
4. Promote the next stage's kickoff prompt in `output/IMPLEMENTATION_KICKOFF_PROMPT.md` (mirroring how Stage 02-A.5 archived its prompts).

---

## Outputs

| File | Required? | Description |
|------|-----------|-------------|
| Working code in `bodymap-app/src/` per F1–F9 | ✅ | `src/metrics/*` module, schema v3 migration, Progress widgets, GoalsPanel, adherence wiring, advanced charts, docs sync |
| `output/completion-log.md` | ✅ | One row per ticket: status, spec ref, build verified, files touched, what landed, acceptance trace, notes |
| `output/IMPLEMENTATION_KICKOFF_PROMPT.md` | ✅ | Maintained throughout: active prompt at top, shipped prompts archived at bottom, next-stage prompt promoted on close |
| `_config/storage-schema.md` (updated in F9) | ✅ | Full v3 shape including `stateChanges` / `goals` / `adherence` / `dailySnapshots` + the U7+U8 fields folded in |
| Root `CONTEXT.md` ledger updated when stage closes | ✅ | Stage 02-B → ☑ shipped |

---

## Constraints specific to this stage

Beyond `_core/CONVENTIONS.md`:

- **Pure metrics.** Every function in `src/metrics/*` takes raw arrays + `now: Date` + `windowDays`. No `localStorage` reads, no `Date.now()` calls inside the module. Callers inject everything. This is what makes the metrics testable and lets `useBodyBalanceScore` swap-paths land in F2 without touching every consumer.
- **Bilateral aggregates everywhere.** Any metric that computes per `{baseId}-{side}` must also expose a `byBaseId` aggregate. Use `fromMuscleId()` from `muscle-data.js` — no string slicing.
- **Synthetic seeds are honest.** F1's v2→v3 migration seeds `stateChanges` from `muscleStates[id].updatedAt` with `source: "migration-seed"`. Copy on any chart that depends on these seeds must say "since your last flag" rather than "over the last 30 days" until ≥ `windowDays` of genuine log exists.
- **Empty-state copy is mandatory.** Every new widget renders gracefully on a freshly-migrated v2 blob. The Progress slot contracts already have empty-state language — preserve it; replace only the data path.
- **No backend.** localStorage-only. No accounts, no sync, no remote analytics.
- **Bilingual chart labels stay educational.** No "diagnosis", no "should", no "must". "Aim for" / "noticing" / "trending toward" are the right register.

---

## How to start

1. Read `CLAUDE.md`, `CONTEXT.md` (root), this file.
2. Open `output/completion-log.md` — F1 through F8 are shipped; the active ticket is **F9** (export/import QA + docs sync) under **F-Phase 4**.
3. Read `../02-tracking-metrics/output/plan.md` §4 F9 and `_config/storage-schema.md`; reconcile docs with `BodyMapApp.jsx` load/save/migrate paths.
4. Search the codebase for `TODO(stage-02-b)` and confirm the swap-point your ticket fills.
5. Execute the ticket; run the build gate; append to `output/completion-log.md`; stop.

If the user asks a planning-level question (e.g. "should we add ML?" or "do we need accounts?"), reply with which stage that belongs in (Stage 03+ or out of scope) and confirm before doing anything in this stage.
