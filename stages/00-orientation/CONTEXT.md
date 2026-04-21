# Stage 00 — Orientation

> Evergreen stage. Read this if you are a fresh agent just spun up on this project.
> ~5-minute ramp. Contract is informational — no outputs required.

---

## Inputs

| File | Why read it |
|------|-------------|
| `CLAUDE.md` | Layer 0 — agent identity, the ICM pattern, non-negotiables |
| `CONTEXT.md` (root) | Layer 1 — which stage is active, stage ledger |
| `_core/CONVENTIONS.md` | Invariants that apply to everything you do |
| `shared/body-model.md` | L0–L5 layer stack (the mental model for the whole app) |
| `shared/glossary.md` | Terms you will see constantly ("base ID", "edge", "recruitment tint") |
| `_config/stack.md` | Where the code lives |
| `_config/storage-schema.md` | Persistence shape (v3 as of Stage 02-B / F1) |

**Read selectively.** If you already know the project, skip `shared/body-model.md` and `glossary.md` and go straight to the active stage.

---

## Process

1. **Confirm the active stage** from `CONTEXT.md` (root). Today (post-2026-04-19) that is **`stages/02b-tracking-implementation/`** — Stage 02-B, wiring real tracking metrics into the swap-points Stage 02-A.5 reserved.
   - **F-Phase 0** (F1: schema v3 + `stateChanges` write-through) → ☑ shipped 2026-04-19. The localStorage blob is now `schemaVersion: 3`; `migrateBlobToV3()` handles v1/v2 blobs idempotently on load + import.
   - **F-Phase 1** (F2: `src/metrics/*` module M1–M9 + live `useBodyBalanceScore`; F3: Progress widgets light up) → ☑ shipped 2026-04-19. The Body Balance Score, the Progress symmetry hero, tightness / recovery / hot-regions cards, and the state-change timeline all render live data once the user has 7+ days of `stateChanges` history (cold-start at `score: 50, isCalibrating: true` below that).
   - **F-Phase 2** (F4: `PlanWeeklySummary` "since last week" micro-summary; F6: adherence checkboxes + `adherence[]` catalog write-through) → ☑ shipped 2026-04-19. Plan screen now carries the dismissible week-over-week card; `SessionPlanner` and the slide-out Remedies tab seed `suggested` rows and toggle `done` / `skipped` through `BodyMapApp.handleAdherenceChange`. The M7 adherence card lights up independently as soon as any `suggested` row exists.
   - **F-Phase 3** (F5 goals + GoalsPanel + v3 persistence; F7 flip-frequency / recovery charts; F8 assessment-to-state correlation) → ☑ shipped 2026-04-19.
   - **F-Phase 4** (F9 export/import regression + final docs sync) → ▶ active; closes the stage. Paste-ready prompt: `stages/02b-tracking-implementation/output/IMPLEMENTATION_KICKOFF_PROMPT.md`.

   Stage 02-A (UX foundation) and Stage 02-A.5 (UX foundation implementation) have shipped. Stage 02 (tracking & metrics planning) is closed; its `output/plan.md` is what 02-B executes against. Stage 03 (deeper intelligence) opens once F-Phase 4 closes.
2. **Read that stage's `CONTEXT.md`.** Its Inputs table tells you what else to open.
3. **Do not touch code** unless the active stage's contract says to. Planning stages (02 and 02-A) produce markdown specs, not JSX. Implementation stages (02-A.5, 02-B) execute those specs.
4. **Ask before diverging.** If the user asks for something outside the active stage, respond with which stage it belongs in and confirm before switching.

---

## Outputs

None. This stage exists to orient, not to produce artifacts.

---

## Legacy docs — read if comprehensive context is useful

These three documents predate the ICM restructure. They remain authoritative and detailed:

| File | When to read |
|------|--------------|
| `PROJECT_NOTES.md` | You need full product context — atlas architecture, tabs, known limitations, roadmap backlog |
| `BODY_MODEL_ROADMAP.md` | You need layered phase status, data conventions, or historical decisions |
| `NEXT_CHAT_PROMPT.md` | You need a file-level pointer to every important source file |

The new layered docs distill from these three. When they conflict, the newer layered doc wins — but raise the discrepancy so it can be reconciled.

---

## A note on the ICM approach

This workspace follows the **Interpretable Context Methodology** (Van Clief & McDermott, 2026 — arXiv:2603.16021). The short version:

- Folders = stages. Numbers encode order.
- Each stage's `CONTEXT.md` is a **contract**: Inputs (what it reads), Process (what it does), Outputs (what it produces).
- `output/` folders connect stages: stage N's output is stage N+1's input.
- Agents read layers top-down and stop when they have enough context. Don't read everything.

If this pattern is unfamiliar, see `shared/glossary.md` under "Stage (ICM)".
