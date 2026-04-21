# Stage 03 — Deeper intelligence (Track E)

> **Status:** ☐ Queued. Do not start until Stage 02 ships.
> Placeholder contract — detail fills in after Stage 02's plan is approved.

---

## Why this stage exists

v1's planner (`SessionPlanner.jsx`) uses transparent rules: "stretch tight before strengthening weak," "surface inbound edges as 'also consider'." That's honest and explainable, but it's thin. Users want the app to get smarter as it learns what their body actually does.

This stage explores **deeper heuristics** without crossing into black-box ML — keeping the cause/effect story legible.

---

## Inputs

When this stage activates, read:

| File | Purpose |
|------|---------|
| `CLAUDE.md`, `CONTEXT.md` (root), `_core/CONVENTIONS.md` | Always |
| `shared/body-model.md` | L0–L5 reference |
| `shared/data-catalog.md` | What the intelligence layers contain today |
| `stages/02-tracking-metrics/output/plan.md` | **Precondition** — this stage consumes state-change history |
| `stages/01-v1-foundation/output/completion-log.md` | What already shipped |
| Source: `src/SessionPlanner.jsx`, `src/data/relationship-edges.js`, `src/data/muscle-mechanics.js` | Current rules baseline |

---

## Candidate work (for scoping when activated)

- **E1** — Weight L1 edges by user history (e.g. boost compensation hypotheses when the user has flagged the upstream muscle tight for ≥ N days).
- **E2** — Movement-specific compensation suggestions (when user logs pain during a specific movement, surface only the edges relevant to that movement's recruitment pattern from `data/movements.js`).
- **E3** — Multi-step cause chains (if A inhibits B and B compensates via C, surface A → C with reduced confidence and a full rationale path).
- **E4** — Planner personalization (prioritize remedies the user has actually followed through on, per Stage 02 adherence data).
- **E5** — Assessment-driven hypotheses (pair ROM test results to likely tight/weak muscles and pre-populate state suggestions).

---

## Outputs

TBD once this stage activates. Expected at minimum:

- `output/plan.md` — scoped tickets E1–En
- `output/heuristic-specs.md` — precise definitions of each scoring / ranking rule

---

## Hard dependency

Stage 03 **cannot start** until Stage 02 ships a state-change log and at least some metric surfaces. Most of this stage's heuristics need history to be meaningful.
