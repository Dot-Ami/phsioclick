# Stage 02-A — UX foundation (onboarding, IA, design tokens, Learn layer, gamification)

> **Status:** ☑ Planning shipped (2026-04-16). Stage 02-A.5 (implementation) is now active and is executing U1–U8 against this stage's specs — see [`../02a5-ux-implementation/output/completion-log.md`](../02a5-ux-implementation/output/completion-log.md) for live ticket status.
> **Predecessor:** Stage 02 (tracking & metrics) planning is complete; implementation paused so its widgets can land into the new shell as Stage 02-B.
> **Successor:** Stage 02-A.5 (implementation) executes U1-U8 against this stage's specs.

---

## Why this stage exists

After v1 shipped and Stage 02 was planned, the user surfaced a hard truth:

> *"When I spin up this app I have no idea what to do, where to go, how it works and how it helps me keep track of my success. It's also very bland and ugly. It also doesn't teach me anything about my body."*

That's three failures at once: **navigation/IA**, **visual language**, and **education**. Plus the absence of any reward loop ("no gamification") to make the work feel rewarding.

Shipping Stage 02's metrics into the existing shell would dump more data into a UI that already isn't legible. Stage 02-A redesigns the shell first so Stage 02-B can deliver metrics into a UX that does them justice.

---

## Inputs

Read in this order.

| File | Purpose | Why |
|------|---------|-----|
| `CLAUDE.md` | Identity + non-negotiables | Always |
| `CONTEXT.md` (root) | Stage ledger; confirms 02-A is active and 02 is paused | Always |
| `_core/CONVENTIONS.md` | Invariants (IDs, storage, build, aesthetic §7) | Visual decisions must respect §7 |
| `shared/body-model.md` | L0-L5 layer stack | Learn-layer copy is sourced from these layers |
| `_config/storage-schema.md` | v2 baseline | Schema-delta adds two small fields, no version bump |
| `stages/02-tracking-metrics/output/plan.md` | Metrics catalog M1-M9 | Body Balance Score is derived from these; Stage 02-B widgets land in the new Progress screen |
| `stages/02-tracking-metrics/output/decisions.md` | Locked Stage 02 decisions | Don't re-litigate |
| `references/current-ux-audit.md` (this stage) | Screen-by-screen audit with file+line citations | Primary problem statement |
| `references/legacy-ia-map.md` (this stage) | Where every current tab/panel/state lives | Re-shelving map for the IA reshuffle |
| `PROJECT_NOTES.md` §App tabs (legacy) | Comprehensive product context | Reference |

**Do not read** [`BODY_MODEL_ROADMAP.md`](../../BODY_MODEL_ROADMAP.md) cover-to-cover unless you need a layer-status question answered. It's long.

---

## Process

You are in **planning mode**. Do not write application code in this stage. Outputs are markdown specs that Stage 02-A.5 (implementation) executes.

### 1. Locked decisions (no need to re-confirm)

| Decision | Locked answer |
|----------|---------------|
| Sequencing vs Stage 02 implementation | UX-first. Pause Stage 02; resume as Stage 02-B once 02-A.5 ships. |
| Ambition tier | Tier 2 — onboarding + IA reshuffle + Learn layer + medium gamification + visual refresh. No custom illustration system, no marketing landing page. |

Full rationale lives in [`output/decisions.md`](./output/decisions.md). Other forks raised during writing are resolved there.

### 2. Produce the specs (output contract)

Write the files listed in **Outputs** below. The `ux-plan.md` is the top-level spec; the other files are deep-dives it references.

The IA backbone for every spec is the four-tab user-job structure:

```
Today  - what should I do right now?
Body   - show me + teach me
Plan   - goals, weekly plan, intake, assessment calibration
Progress - how am I doing?
```

Every screen and every gamification mechanic must trace back to one of these four jobs.

### 3. Hand off

Once `ux-plan.md` is approved by the user:

1. Open Stage 02-A.5 (implementation) in a new chat.
2. That stage executes U1 (tokens) -> U2 (nav shell) -> U3 (Today) -> U4 (Body) -> U5 (Plan) -> U6 (Progress, where Stage 02 metrics land) -> U7 (onboarding) -> U8 (gamification).
3. Once 02-A.5 ships, Stage 02-B re-opens with the F1-F9 tickets from `stages/02-tracking-metrics/output/plan.md`, now targeting the new Progress screen.

---

## Outputs

| File | Required? | Description |
|------|-----------|-------------|
| `output/ux-plan.md` | ✅ | Top-level spec: principles, IA, screens summary, U1-U8 tickets, phases, first-three-tickets |
| `output/decisions.md` | ✅ | Locked decisions + downstream forks resolved during writing |
| `output/design-tokens.md` | ✅ | Palette, type scale, spacing, radius, motion — encodable as Tailwind theme |
| `output/screens.md` | ✅ | Text wireframes for Today / Body / Plan / Progress with density rules and reuse-vs-replace component map |
| `output/learn-layer-spec.md` | ✅ | Content model for the in-context Learn tab + copywriting style guide |
| `output/gamification-spec.md` | ✅ | Body Balance Score formula + named tiers + streak + milestones + region mastery |
| `output/onboarding-flow.md` | ✅ | Six-step first-run wizard + intent picker + dismissable per-tab tour overlays |
| `output/schema-delta.md` | ✅ | Streak + milestones additions to the Stage 02 v3 blob (no schema version bump) |

---

## Constraints specific to this stage

Beyond `_core/CONVENTIONS.md`:

- **Design tokens are additive to Tailwind, not a replacement.** Encode as a theme extension; do not introduce a parallel CSS system.
- **The Body Balance Score is derived, never persisted.** It's a function of Stage 02 metrics. The only new persistence is `streak` + `milestones` (see `schema-delta.md`).
- **Educational tone, never medical.** Per `_core/CONVENTIONS.md` §1. Gamification copy should celebrate effort and curiosity, not "diagnose progress."
- **No new tabs beyond the four-tab IA.** If something doesn't fit Today / Body / Plan / Progress, it goes inside one of those — not a fifth tab.
- **Existing components are reused where they work.** [`MuscleAtlas.jsx`](../../bodymap-app/src/MuscleAtlas.jsx), [`BodyAtlas.jsx`](../../bodymap-app/src/BodyAtlas.jsx), the L0-L5 panels, and [`SessionPlanner.jsx`](../../bodymap-app/src/SessionPlanner.jsx) all stay; they get re-shelved + re-skinned, not rewritten.
- **Mobile-first.** Today is the default-open tab and must be thumb-reachable; the bottom nav stays mobile-only.
- **Build gate still applies** to the implementation stage that follows: `cd c:\phsioclick\bodymap-app && npx vite build` must pass before 02-A.5 is "done."

---

## How to start (for the new chat, if this stage gets re-opened)

1. Read `CLAUDE.md`, `CONTEXT.md` (root), this file.
2. Skim [`references/current-ux-audit.md`](./references/current-ux-audit.md) and [`references/legacy-ia-map.md`](./references/legacy-ia-map.md).
3. Skim [`stages/02-tracking-metrics/output/plan.md`](../02-tracking-metrics/output/plan.md) §2 (metric catalog) so you know what Body Balance Score is built on.
4. If outputs are already present, you're reviewing — read them in the order listed under Outputs above.
5. If outputs are missing, this stage's planning isn't done — produce them per the contract.

Do not spin up the dev server in this stage. Do not edit code. Implementation happens in Stage 02-A.5.
