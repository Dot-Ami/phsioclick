# CONTEXT.md — Layer 1: Project routing

> Read after `CLAUDE.md`. Answers *"Where do I go?"*

---

## Project at a glance

**Dot Body Map** — interactive anatomical atlas for workout planning, tight/weak awareness, and body balance. React + Vite + Tailwind, localStorage persistence (`dot-body-map-v3`, schema v3 as of Stage 02-B / F1).

**Body intelligence is a 6-layer stack** (L0 mechanics → L1 edges → L2 state → L3 remedies → L4 movements → L5 planner). All layers are live in v1.

Full layer reference: [`shared/body-model.md`](./shared/body-model.md)

---

## Active stage

**Stage 02-B is complete (☑ shipped 2026-04-20).** All nine F-tickets closed across four F-Phases. Schema v3 is live, metrics module exists, Progress + Plan + Today are fully wired, docs synced.

**No implementation stage is currently active.** Stage 03 (deeper intelligence) is ☐ queued. To begin Stage 03, create `stages/03-deeper-intelligence/CONTEXT.md` and a kickoff prompt, then update this file's Active stage pointer.

**Progress (2026-04-20):**
- Stage 02-A.5 ☑ closed. All seven U-tickets shipped — U-Phase 0 (U1 tokens, U2 nav shell), U-Phase 1 (U3 Today + Body Balance Score cold-start, U4 Body screen + muscle slide-out + Learn layer, U5 Plan screen + shared `lib/session-plan.js`), U-Phase 2 (U6 Progress shell with symmetry-trend hero + M4/M6/M7 supporting row + default-collapsed accordion of Stage 02-B slot contracts and the re-homed legacy Dashboard), U-Phase 3 (U7 six-step onboarding wizard + per-tab tour overlays + Settings drawer; U8 gamification). See `stages/02a5-ux-implementation/output/completion-log.md` for full receipts.
- Stage 02-B ☑ shipped 2026-04-20. All nine F-tickets (F1–F9) closed. Schema v3 live; `src/metrics/*` has M1–M9 + Body Balance Score; Progress hero + supporting cards + accordion slots live (including F7 flip charts and F8 assessment correlation); Plan has F4 weekly summary + F5 GoalsPanel + F6 adherence checkboxes; docs fully synced. See `stages/02b-tracking-implementation/output/completion-log.md`.

---

## Stage ledger

| # | Stage | Status | Lives in |
|---|-------|--------|----------|
| 00 | Orientation (for fresh agents) | evergreen | `stages/00-orientation/` |
| 01 | v1 foundation — 6-layer intelligence stack, planner, atlas | ☑ shipped | `stages/01-v1-foundation/` |
| 02 | Tracking & metrics (Track F) — planning | ☑ planning shipped | `stages/02-tracking-metrics/` |
| 02-A | UX foundation — onboarding, IA reshuffle, design tokens, Learn layer, medium gamification | ☑ planning shipped | `stages/02a-ux-foundation/` |
| 02-A.5 | UX foundation implementation — execute U1–U8 tickets against the codebase | ☑ shipped 2026-04-19 | `stages/02a5-ux-implementation/` |
| 02-B | Tracking & metrics implementation — F1–F9: schema v3 + metrics module + Progress widgets + adherence + goals + advanced charts + docs sync | ☑ shipped 2026-04-20 | `stages/02b-tracking-implementation/` (consumes `stages/02-tracking-metrics/output/plan.md`) |
| 03 | Deeper intelligence (Track E) | ☐ queued | `stages/03-deeper-intelligence/` |
| 04 | Content expansion — female atlas parity, new muscles (Track G) | ☐ queued | `stages/04-content-expansion/` |

---

## Where things live

### Code
- App root: `bodymap-app/`
- UI components: `bodymap-app/src/*.jsx`
- Body intelligence data: `bodymap-app/src/data/*.js`
- Atlas assets (patched SVG): `bodymap-app/src/atlas-assets/`
- Vendor baseline: `bodymap-app/vendor/react-muscle-highlighter/`

### Docs (ICM layout)
- `_core/CONVENTIONS.md` — invariants (IDs, storage, build, product scope)
- `_config/` — stable project configuration (tech stack, storage schema)
- `shared/` — cross-stage reference (body model layers, data catalog, glossary)
- `stages/NN-*/` — per-stage work with CONTEXT + references + output
- `PROJECT_NOTES.md`, `BODY_MODEL_ROADMAP.md`, `NEXT_CHAT_PROMPT.md` — legacy comprehensive docs, still authoritative

### Transcripts
Past chats (for continuity): `C:\Users\Alex_\.cursor\projects\c-phsioclick\agent-transcripts\`

---

## If you were just spun up for a new chat

1. Read `CLAUDE.md` (you should already have) and this file.
2. Open `stages/00-orientation/CONTEXT.md` for a 5-minute ramp.
3. Then open the **active** stage: `stages/02b-tracking-implementation/CONTEXT.md`. Its Inputs table tells you what else to read (the planning spec at `stages/02-tracking-metrics/output/plan.md` and the swap-point notes in `stages/02a5-ux-implementation/output/completion-log.md` are the two big ones). The next-chat kickoff prompt is at `stages/02b-tracking-implementation/output/IMPLEMENTATION_KICKOFF_PROMPT.md`.
4. Do not touch code until the stage contract tells you to.
