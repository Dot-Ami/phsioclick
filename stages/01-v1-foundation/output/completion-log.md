# v1 completion log

Everything that shipped in the v1 foundation stage, by ticket. Last build verified: `npx vite build` clean on 2026-04-15.

---

## Track A — Foundation fixes

| ID | Ticket | Status | Files |
|----|--------|--------|-------|
| A1 | Fix `fromMuscleId()` parsing bug | **cancelled — not a bug** (verified `slice(0,-2)` correctly strips 2-char suffix regardless of hyphens in base) | `src/muscle-data.js` |
| A2 | Dedupe bidirectional edges in `RelationshipEdgesPanel` | ☑ | `src/RelationshipEdgesPanel.jsx` |
| A3 | Fix edge count in docs (15, not 16) | ☑ | `PROJECT_NOTES.md`, `BODY_MODEL_ROADMAP.md`, `NEXT_CHAT_PROMPT.md` |
| A4 | Empty-state message in `RemedyPanel` when muscle is marked but has no remedies | ☑ | `src/RemedyPanel.jsx` |

---

## Track B — Data library growth

| ID | Ticket | Status | Files |
|----|--------|--------|-------|
| B1 | L1 edges 15 → 32 (upper-cross, lower-cross, ankle/knee, core, upper-limb) | ☑ | `src/data/relationship-edges.js` |
| B2 | L3 remedies 11 → 35 (shoulder, hip/glute, quad/hamstring, core, misc) | ☑ | `src/data/remedies.js` |
| B3 | L4 movements 3 → 10 (OHP, row, pull-up, lunge, RDL, hip thrust, face pull) | ☑ | `src/data/movements.js` |

---

## Track C — Planner evolution

| ID | Ticket | Status | Files |
|----|--------|--------|-------|
| C1 | Planner v1.5: concrete sets/reps/duration, ordering logic, dedupe "also consider" | ☑ | `src/SessionPlanner.jsx` |
| C2 | L/R state symmetry view — show bilateral imbalances | ☑ | `src/SessionPlanner.jsx` (`SymmetryView`) |
| C3 | Weekly plan structure — multi-day templates with day-type distribution | ☑ | `src/SessionPlanner.jsx` (`buildWeeklyPlan`) |
| C4 | Intake wizard — step-by-step goal/state/lift → personalized plan | ☑ | `src/SessionPlanner.jsx` (`IntakeWizard`), `src/BodyMapApp.jsx` (pass `onSetState`) |

---

## Track D — Polish / QoL

| ID | Ticket | Status | Files |
|----|--------|--------|-------|
| D1 | Timeline chart: real calendar dates instead of sequence index | ☑ | `src/BodyMapApp.jsx` (`timelineData`), `src/TrendCharts.jsx` (`XAxis dataKey="date"`) |
| D2 | Assessment chart: sort by date, average same-day entries | ☑ | `src/BodyMapApp.jsx` (`assessmentTrendData`) |
| D3 | Mobile export/import — accessible alternative to hidden desktop row | ☑ | `src/BodyMapApp.jsx` (`mobileMenuOpen` state + expandable menu) |
| D4 | Female atlas parity — **infrastructure only**; actual SVG path splits require manual vector art (deferred to Stage 04) | ◐ | `src/atlas-assets/bodyFemaleFront.js`, `bodyFemaleBack.js` (passthrough + divider exports), `src/BodyAtlas.jsx` (imports patched assets) |

---

## Definition-of-done scorecard (original goals)

| Goal | Met? | Notes |
|------|------|-------|
| Workout planning that reflects muscle state | ☑ | Session + weekly views with remedies ordered tight → weak → "also consider" |
| Tight/weak awareness on the map | ☑ | L2 panel, L/R symmetry view |
| Body-balance cues | ☑ | Symmetry view surfaces bilateral imbalances |
| Cause/effect explanations | ☑ | L1 edges panel with inbound/outbound + kind + rationale |
| Movement visualization | ☑ | Recruitment tint on atlas with phase toggles |
| Diagnostic-style flow | ☑ (v1) | Intake wizard → populated states → generated plan (with disclaimer) |
| Not a medical tool | ☑ | Footer disclaimer present; all planner output is educational |

---

## Known open threads handed to later stages

- **No state-transition history.** `muscleStates[id].updatedAt` is overwritten on each change. Stage 02.
- **No symmetry index over time.** Only point-in-time comparison. Stage 02.
- **No adherence tracking.** Planner suggests a plan; we don't log whether it was executed. Stage 02.
- **Planner heuristics are rules-based.** No learning from user history. Stage 03.
- **Remedies lack video links.** Text-only steps. Stage 04 (content).
- **Female atlas SVG splits.** Infrastructure ready; vector art needed. Stage 04.
- **Deep hip rotators / tibialis posterior / peroneals.** Not in atlas yet. Stage 04.
