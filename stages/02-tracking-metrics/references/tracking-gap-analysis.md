# Tracking gap analysis — what v1 can't tell you today

Snapshot of the concrete gaps Stage 02 must close. Grounded in current data shapes (`_config/storage-schema.md`) and current UI (`PROJECT_NOTES.md` §App Tabs).

---

## What the app captures today

| Data | Where | Shape | Timestamp granularity |
|------|-------|-------|----------------------|
| Pain / sensation log entries | `localStorage.entries` | `{ id, timestamp, origin, sensation, movement, sensationType, intensity, context, notes }` | ISO per entry — ✅ timestamped |
| Bilateral assessments | `localStorage.assessments` | `{ id, timestamp, testKey, leftValue, rightValue, unit }` | ISO per entry — ✅ timestamped |
| Muscle state flags | `localStorage.muscleStates` | `{ [baseId-side]: { state, updatedAt } }` | **One `updatedAt` per muscle — overwritten on each change** |

## The core gap: no state history

`muscleStates` is a **latest-only** map. If on Monday `glute-max-l` is `weak` and on Wednesday the user flips it to `normal`, Monday's assertion is gone. There is no way to ask:

- How many days in the last 30 has this muscle been flagged?
- What was the state on a given past date?
- How often do states flip (possible sign of unstable assessment or real oscillation)?
- What's the rate of "tight → normal" vs "tight → still tight"?

## Secondary gaps

### 1. No symmetry index

- The planner has an L/R symmetry *view* that surfaces bilateral mismatch **right now**, but there's no rolling metric.
- No answer to: *"Has my left/right balance improved this month?"*

### 2. No adherence signal

- The planner generates a session plan. The app does not record whether the user executed it.
- No answer to: *"Did my tight hip flexors improve because of the remedies, or despite ignoring them?"*

### 3. No goal layer

- Users implicitly want outcomes (fix tight hip, balance L/R shoulder, add OHP without shoulder pain), but the data model has no notion of goals.
- No answer to: *"Am I on track with what I said I wanted?"*

### 4. No trend surfaces beyond per-entry charts

- Dashboard has a timeline chart of pain intensity (now with real dates — Track D ✅) and an assessment trend chart.
- There's no aggregated **body-level** metric — "overall tightness load," "asymmetry index," "hot regions this week."

### 5. Assessments are trended but not compared to state

- Assessment values chart over time. They are not joined to `muscleStates` — so an improving ROM test is not correlated with the tight-flag history of the muscles that drive that ROM.

---

## Implications for the data model

At minimum, Stage 02 must introduce a **state-change log** — append-only, per flip, keyed by muscle ID + timestamp + new state (+ optional source: manual, intake-wizard, import). Everything else (symmetry index, adherence, progress against goals) can derive from that log + existing entries + assessments, given a metric-computation layer.

## Implications for UI

Planner and Dashboard both need to surface progress over time. Options:

- New **Progress** tab dedicated to metrics.
- Expand **Dashboard** with progress widgets.
- Inline "since last week" micro-summaries in the Planner.

Stage 02's plan decides which combination ships first.

---

## Out of scope for Stage 02

- Server-side storage / accounts / multi-device sync.
- ML-based trend prediction. (Stage 03 territory at earliest.)
- Social / sharing / coach-review. (Stage H — unscoped.)
