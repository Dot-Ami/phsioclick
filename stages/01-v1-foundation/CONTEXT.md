# Stage 01 — v1 foundation (shipped)

> **Status:** ☑ Complete as of 2026-04-15.
> This stage is archival. Read it to understand what shipped in v1 and why. Do not add work here — new work goes into stages 02, 03, or 04.

---

## Inputs

| File | Why |
|------|-----|
| `PROJECT_NOTES.md` | Canonical v1 product and architecture description |
| `BODY_MODEL_ROADMAP.md` | L0–L5 status tables (still accurate) |
| `NEXT_CHAT_PROMPT.md` | File-level handoff for v1 architecture |

---

## Process (what was done)

v1 delivered the complete 6-layer body-intelligence stack plus a usable planner and the four app tabs.

**Tracks executed:**
- **Track A (Foundation fixes)** — bidirectional edge dedupe, empty-state for remedies panel, doc count corrections. A1 (fromMuscleId bug) verified as non-bug and cancelled.
- **Track B (Data library growth)** — L1 edges 15→32, L3 remedies 11→35, L4 movements 3→10.
- **Track C (Planner evolution)** — session / weekly / L/R symmetry views, intake wizard, concrete sets/reps/duration, L1-edge "also consider" block.
- **Track D (Polish / QoL)** — timeline chart uses real dates, assessment chart sorts by date and averages same-day entries, mobile export/import menu, female-atlas infrastructure patched (paths TBD).

Details in `output/completion-log.md`.

---

## Outputs

| File | What it is |
|------|-----------|
| `output/completion-log.md` | Ticket-by-ticket record of what shipped, with file references |

Downstream stages can cite the completion log as authoritative for "what is already done."

---

## Handoffs

- **To Stage 02 (tracking & metrics):** v1 stores `muscleStates` with a single `updatedAt` per muscle. No transition history, no symmetry index, no progress metric. Stage 02 designs the system to fill that gap.
- **To Stage 03 (deeper intelligence):** v1 planner uses simple rules (tight before weak, inbound/outbound edges). Stage 03 can build smarter heuristics on top.
- **To Stage 04 (content expansion):** v1 female atlas routes through `atlas-assets/bodyFemaleFront.js` / `bodyFemaleBack.js` with divider infrastructure in place but no geometry splits. Stage 04 does the vector art and wires splits in.
