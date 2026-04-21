# Stage 02-A.5 — UX foundation implementation

> **Status:** ☑ Shipped (2026-04-19). All seven U-tickets landed; every build gate green; no v1 regressions.
> **Predecessor:** Stage 02-A (UX foundation planning) — specs live in `../02a-ux-foundation/output/`.
> **Successor:** Stage 02-B (tracking & metrics implementation) — re-opens `stages/02-tracking-metrics/output/plan.md` against the new shell. Stable swap-points are reserved (`useBodyBalanceScore`, the Progress hero/supporting/accordion slot contracts, the in-memory `goals[]`, the `kind: "adherence"` entries).
>
> **Progress (2026-04-19):** U-Phase 0 (U1, U2), U-Phase 1 (U3, U4, U5), U-Phase 2 (U6), and U-Phase 3 (U7, U8) all shipped. See `output/completion-log.md` for full receipts and follow-on notes. Stage 02-A.5 is closed.

---

## Why this stage exists

Stage 02-A produced eight specs (UX plan, design tokens, screens, learn layer, gamification, onboarding, schema delta, decisions). Per ICM, planning stages only emit markdown. This stage **executes** those specs against the codebase ticket-by-ticket so the user can see and use the new app.

---

## Inputs

Read in this order. Stop reading when the active ticket has what it needs.

| File | Why read it |
|------|-------------|
| `CLAUDE.md` | Identity + non-negotiables (always) |
| `CONTEXT.md` (root) | Confirms 02-A is shipped and 02-A.5 is active |
| `_core/CONVENTIONS.md` | Invariants — especially §4 build gate, §5 do-not-break list, §7 aesthetic |
| `../02a-ux-foundation/CONTEXT.md` | The planning contract this stage executes |
| `../02a-ux-foundation/output/ux-plan.md` | Top-level spec; §10 has the U1–U8 ticket bodies, §13 has the paste-ready first three |
| `../02a-ux-foundation/output/design-tokens.md` | Token system + Tailwind config preview (U1) |
| `../02a-ux-foundation/output/screens.md` | Wireframes for Today / Body / Plan / Progress (U2–U6) |
| `../02a-ux-foundation/output/gamification-spec.md` | Body Balance Score formula + cold-start (U3, U8) |
| `../02a-ux-foundation/output/learn-layer-spec.md` | Learn-tab content model (U4) |
| `../02a-ux-foundation/output/onboarding-flow.md` | First-run wizard + per-tab tours (U7) |
| `../02a-ux-foundation/output/schema-delta.md` | Storage additions for streak/milestones/onboarding (U8) |
| `../02a-ux-foundation/references/legacy-ia-map.md` | Re-shelving inventory (U2 — what content moves where) |
| `_config/storage-schema.md` | v2 baseline (must remain back-compat) |

---

## Process

This stage runs the eight tickets U1–U8 from `../02a-ux-foundation/output/ux-plan.md` §10 in the four U-Phases defined in §11. Each ticket is one batch of work; each batch ends with the build gate green.

### Hard rules (apply to every ticket)

1. **Build gate is non-negotiable.** `cd c:\phsioclick\bodymap-app && npx vite build` must pass before any ticket is called "done."
2. **Do not break the v1 flows** listed in `_core/CONVENTIONS.md` §5. Re-shelved content must still function.
3. **Stable muscle IDs.** Use `SUB_MUSCLES` base IDs from `bodymap-app/src/muscle-data.js` as the join key — never invent new IDs.
4. **Educational tone.** No medical claims in any new copy. The footer disclaimer stays on every screen.
5. **Tokens first.** After U1, no hex literals or off-token color/spacing values. Reach for the Tailwind theme.
6. **Storage back-compat.** Until U8, no schema changes. U8 adds `streak`, `milestones`, `onboarding` per the schema delta — additive, no version bump.

### Phase plan (mirrors `ux-plan.md` §11)

| Phase | Tickets | Status | Demoable milestone |
|-------|---------|--------|--------------------|
| **U-Phase 0** | U1, U2 | ☑ shipped 2026-04-18 | New visual language + four-tab IA reachable; existing content works inside new tabs |
| **U-Phase 1** | U3, U4, U5 | ☑ shipped 2026-04-18 | Today + Body + muscle slide-out (Learn layer) + Plan screen with WeeklyStrip / GoalCard / Calibrate, plus shared `lib/session-plan.js` |
| **U-Phase 2** | U6 | ☑ shipped 2026-04-19 | Progress shell with symmetry-trend hero + M4/M6/M7 supporting cards + default-collapsed below-fold accordion; legacy Dashboard re-homed and re-skinned; slot contracts (M5/M2/M9 + existing data) ready for Stage 02-B |
| **U-Phase 3** | U7, U8 | ☑ shipped 2026-04-19 | Six-step first-run wizard + per-tab tour overlays + Settings drawer (replay/reset onboarding); gamification (streak via `recordActivity`, full milestone catalog + region mastery via `checkMilestones`, live header `StreakBadge` + cold-start `useBodyBalanceScore` swap-point, `MilestoneToast` queue; additive `streak`/`milestones`/`onboarding` on `schemaVersion=2`; MuscleSlideOut adherence event finally persisted). Closes Stage 02-A.5. |

> **Note on phase mapping:** U5 was promoted from U-Phase 2 into U-Phase 1 during execution (see `output/completion-log.md`) because it shipped in the same session as U4 and shares the new tokens / slide-out idioms. U6 now stands alone in U-Phase 2; U-Phase 3 is unchanged.

After each ticket: append a row to `output/completion-log.md` (status, files touched, build verified).

---

## Outputs

| File | Required? | Description |
|------|-----------|-------------|
| Working code in `bodymap-app/src/` per the U1–U8 tickets | ✅ | The new shell, screens, components, gamification, onboarding |
| `output/completion-log.md` | ✅ | One row per ticket: status, files touched, build verified, notes |
| `_config/storage-schema.md` (updated in U8) | ✅ | Full v3 shape including `streak`, `milestones`, `onboarding` |
| Root `CONTEXT.md` ledger updated when stage closes | ✅ | Stage 02-A.5 → ☑ shipped, Stage 02-B → ▶ active |

---

## Constraints specific to this stage

Beyond `_core/CONVENTIONS.md`:

- **No new tabs beyond the four-tab IA.** Today / Body / Plan / Progress only. Anything that doesn't fit goes inside one of those (or Settings).
- **Reuse existing components** wherever the spec says so (`MuscleAtlas`, `BodyAtlas`, L0–L5 panels, `SessionPlanner`). Re-skin via tokens; don't rewrite.
- **Stage 02 metrics are not implemented yet.** When a ticket needs an M3/M4/M5/M6/M7 value before Stage 02-B lands, use a deterministic fixture (clearly labelled in the code) and leave a `TODO(stage-02-b)` comment so the swap is trivial later.
- **Mobile-first.** Today is the default landing tab; bottom nav is mobile-only and must stay thumb-reachable.
- **Tokens are additive.** Tailwind `theme.extend` only. No parallel CSS system.

---

## How to start

1. Read `CLAUDE.md`, `CONTEXT.md` (root), this file.
2. Open the next pending ticket per `output/completion-log.md` (or U1 if the log doesn't exist yet).
3. Read the ticket body in `../02a-ux-foundation/output/ux-plan.md` §10 and any deep-dive specs it cites.
4. Execute the ticket; run the build gate; append to the completion log; stop.
