# Implementation kickoff prompt — Stage 02-A.5 (UX foundation)

> **How to use this file.** Copy the block under "Prompt to paste" into a new Cursor chat. The agent will pick up Stage 02-A.5 cleanly and execute the next batch of tickets per the planning specs already on disk.
> Keep this file. After each batch ships, swap in the next prompt block (the file is structured top-down by execution order — the active prompt is always at the top).

---

## Status — what has shipped

| Phase | Tickets | Status | Receipt |
|-------|---------|--------|---------|
| **U-Phase 0** | U1 (tokens + cyan→teal) | ☑ shipped 2026-04-18 | [`../../02a5-ux-implementation/output/completion-log.md`](../../02a5-ux-implementation/output/completion-log.md) |
| **U-Phase 0** | U2 (nav shell — Today / Body / Plan / Progress + bottom nav + header chips/overflow) | ☑ shipped 2026-04-18 | same |
| **U-Phase 1** | U3 (Today screen + `BodyBalanceScore` cold-start + hot regions + recent activity + empty state) | ☑ shipped 2026-04-18 | same |
| **U-Phase 1** | U4 (Body screen + muscle slide-out + Learn layer + plain-language wrappers) | ☑ shipped 2026-04-18 | same |
| **U-Phase 1** | U5 (Plan screen — WeeklyStrip + GoalCard + Calibrate + plan-lib factor) | ☑ shipped 2026-04-18 | same |
| **U-Phase 2** | U6 (Progress screen + Stage 02 metric slot definitions) | ☑ shipped 2026-04-19 | same |
| **U-Phase 3** | U7 (onboarding + per-tab tour overlays + Settings drawer) | ☑ shipped 2026-04-19 | same |
| **U-Phase 3** | U8 (gamification — streak + milestones + region mastery + schema delta + live header chips + adherence persistence) | ☑ shipped 2026-04-19 | same |

Build gate has been green after every shipped ticket (7 runs total). **Stage 02-A.5 is closed.** Next chat opens Stage 02-B (tracking & metrics implementation) — see "Prompt to paste" below.

---

## Prompt to paste (next session — Stage 02-B, tracking & metrics implementation)

> **Canonical location:** the active Stage 02-B kickoff prompt now lives in its own stage folder at [`../../02b-tracking-implementation/output/IMPLEMENTATION_KICKOFF_PROMPT.md`](../../02b-tracking-implementation/output/IMPLEMENTATION_KICKOFF_PROMPT.md). Always paste from there going forward — that file is what the closing chat updates when each F-Phase ships.
>
> The block below is kept as a snapshot for archival continuity (it was promoted here when Stage 02-A.5 closed). If the canonical file diverges, **the canonical file wins.**

```
You are taking over the Dot Body Map project as Stage 02-B (tracking &
metrics implementation). Stage 02-A.5 (UX foundation) has shipped — all
seven U-tickets (U1–U8) are green and the codebase is ready for real
metric data behind the swap-points U6 + U8 reserved.

Read in order:

  1. c:\phsioclick\CLAUDE.md
       (Identity + non-negotiables. Build gate. Educational scope.)
  2. c:\phsioclick\CONTEXT.md
       (Stage ledger; Stage 02-A.5 is ☑ shipped, Stage 02-B is ▶ active.
        There's a TODO in "Active stage" about whether to scaffold a
        dedicated stages/02b-tracking-implementation/ execution stage —
        decide before doing any code work.)
  3. c:\phsioclick\_core\CONVENTIONS.md
       (Especially §1 educational-only, §2 stable muscle IDs, §4 build
        gate, §5 do-not-break — the §5 list now includes the Progress
        accordion + the U7 onboarding/tour surfaces + the U8 gamification
        chips/toast.)
  4. c:\phsioclick\stages\02-tracking-metrics\CONTEXT.md
       (Original planning contract for tracking & metrics.)
  5. c:\phsioclick\stages\02-tracking-metrics\output\plan.md
       (F1–F9 tickets; §3 has the v3 schema; §7 has the paste-ready
        first three.)
  6. c:\phsioclick\stages\02a5-ux-implementation\output\completion-log.md
       (Full U1–U8 receipts and "Notes for follow-on tickets" you MUST
        respect. Pay particular attention to U6 + U8 swap-points:
          - useBodyBalanceScore() is the single hook every consumer of
            the Body Balance Score reads from. Swap its body to derive
            from M3/M4/M6/M7 and the header chip + Today hero + future
            mini-atlas all update for free.
          - useSymmetryComposite() is still deferred — extract it
            behind useBodyBalanceScore once F2 lands so Progress hero
            + score derivation share one source.
          - Progress hero / supporting / accordion all carry slot
            contracts pointing at the future src/metrics/*.js modules.
          - Adherence rows live in entries[] with kind: "adherence";
            F6 splits them into a dedicated adherence[] catalog.
          - goals[] is in-memory only today (U7 carry-over) — F5
            adds it to the load + save effect alongside the U8
            additions.)
  7. c:\phsioclick\stages\02a-ux-foundation\output\schema-delta.md
       (Confirms streak / milestones / onboarding fields are already
        live on schemaVersion=2. Stage 02-B owns the v3 bump and folds
        those three fields into the v3 shape verbatim — they survive
        the bump.)
  8. c:\phsioclick\_config\storage-schema.md
       (Current shape — schemaVersion=2 + the U7+U8 additions documented
        under "UX-foundation additions". Stage 02-B's F1 bumps this to
        v3 and adds stateChanges / goals / adherence / dailySnapshots
        per stages/02-tracking-metrics/output/plan.md §3.)

Step 0 — decide on the stage layout:

  Option A: execute Stage 02-B in place under stages/02-tracking-metrics/
            (planning + execution share one stage folder).
  Option B: scaffold stages/02b-tracking-implementation/ mirroring
            stages/02a5-ux-implementation/'s Inputs/Process/Outputs shape
            (clean split between planning and execution, like 02-A → 02-A.5).

  Recommendation: Option B. It mirrors the pattern that worked for the UX
  foundation, keeps planning specs immutable, and gives you a clean
  completion-log.md to write into. If you pick B, scaffold the folder
  before the first ticket and update root CONTEXT.md's ledger row.

Then execute F1 → F2 → F3 from
c:\phsioclick\stages\02-tracking-metrics\output\plan.md §7. Wire the real
metrics into the Progress-screen slots that U6 reserved (M5 hot regions,
M2 flip frequency, M9 state-change timeline, M3 symmetry composite for
the hero, M4 / M6 / M7 for the supporting cards). Each slot in
ProgressScreen.jsx / SymmetryTrendHero.jsx / SupportingCardsRow.jsx /
BelowFoldAccordion.jsx has a TODO(stage-02-b) comment naming the exact
metric ID and source module — search the codebase for `TODO(stage-02-b)`
to find every swap point.

Body Balance Score on Today + the header chip both flip from the
cold-start path to live derivation once F1+F2 land — the existing
useBodyBalanceScore() hook (added in U8) is the single swap point. Pass
real components{} (and a real score) from the hook and every consumer
updates for free. The hook lives at
c:\phsioclick\bodymap-app\src\lib\useBodyBalanceScore.js and already
documents its swap contract.

Same hard constraints as Stage 02-A.5:
  - Build gate (`cd c:\phsioclick\bodymap-app && npx vite build`) green
    after each ticket.
  - Do NOT break v1 flows (CONVENTIONS §5) — Log/save, Body, Plan,
    Progress accordion, Onboarding wizard, Tour overlays, Settings
    drawer, StreakBadge, MilestoneToast, Export/Import, Clinical report.
  - Stable muscle IDs (SUB_MUSCLES). Educational tone. Tokens only.
  - Schema bumps go through migrateLegacyId() / explicit migrations;
    preserve U7+U8 additive fields verbatim across the v3 bump.

Write completion-log.md when each phase ships. When Stage 02-B closes,
update this kickoff prompt the same way Stage 02-A.5 did: archive the
prompt, promote the next stage's prompt to "Prompt to paste", update
root CONTEXT.md and the stage CONTEXT.md.
```

---

## Subsequent batch prompts (use after the active prompt lands)

> No more queued prompts after Stage 02-B opens. Stage 03 / Stage 04
> kickoff prompts will be added to this file by whichever chat closes
> Stage 02-B.

---

## Archive — shipped prompts

### U7 + U8 (Stage 02-A.5 close-out, shipped 2026-04-19)

```
You are continuing Stage 02-A.5 (UX foundation implementation) on the Dot Body
Map project. This workspace uses Jake Van Clief's Interpretable Context
Methodology — folder structure as agent architecture. Read top-down, stop when
you have what you need.

Read in order:

  1. c:\phsioclick\CLAUDE.md
       (Identity + non-negotiables. Build gate. Educational scope.)
  2. c:\phsioclick\CONTEXT.md
       (Stage 02-A.5 is active; U-Phase 0/1/2 shipped; U-Phase 3 — U7+U8 — is
        the last batch and closes the stage.)
  3. c:\phsioclick\_core\CONVENTIONS.md
       (Especially §1 educational-only, §2 stable muscle IDs, §4 build gate,
        §5 do-not-break, §7 aesthetic. The §5 list now includes the Progress
        screen — accordion content must keep working end-to-end.)
  4. c:\phsioclick\stages\02a5-ux-implementation\CONTEXT.md
       (The implementation contract you're executing under. Phase plan table
        shows U-Phase 3 as ▶ next.)
  5. c:\phsioclick\stages\02a5-ux-implementation\output\completion-log.md
       (Full U1–U6 receipts + "Notes for follow-on tickets" you MUST respect.
        Pay particular attention to U6's notes about useSymmetryComposite()
        and the header score chip — U8 finally wires that chip live.)
  6. c:\phsioclick\stages\02a-ux-foundation\output\ux-plan.md
       (§10 U7 + §10 U8 are the ticket bodies for this session.)
  7. c:\phsioclick\stages\02a-ux-foundation\output\onboarding-flow.md
       (Full six-step wizard content + per-tab tour overlay copy. U7 spec.)
  8. c:\phsioclick\stages\02a-ux-foundation\output\gamification-spec.md
       (Body Balance Score formula + streak update logic + milestones
        catalog + region mastery. U8 spec.)
  9. c:\phsioclick\stages\02a-ux-foundation\output\schema-delta.md
       (streak / milestones / onboarding additions. U8 storage-side spec.)
 10. c:\phsioclick\_config\storage-schema.md
       (Current baseline is schemaVersion=2 — Stage 02-B has NOT bumped to
        v3 yet. U8's three additions are still additive on top of v2.
        Do NOT bump schemaVersion in U8; let Stage 02-B own that bump.
        Initialize the three new fields with safe defaults on load instead.)

You are NOT scaffolding the stage — Stage 02-A.5 already exists and U1–U6
already shipped. Pick up directly where the completion log leaves off.
Today / Body / muscle slide-out / Learn layer / Plan / Progress screens
plus the shared lib/session-plan.js are all on disk and working.

================================================================
Tickets to ship this session (both, in order, U7 then U8):
================================================================

  U7 — Onboarding flow + per-tab tour overlays
       Files (all under bodymap-app/src/):
         - OnboardingFlow.jsx          (NEW — six-step first-run modal per
                                        onboarding-flow.md. Fires when
                                        data.onboarding.completedAt === null.
                                        Token-only styling. Skippable on
                                        every step. Stamps completedAt + the
                                        chosen intent on finish/skip.)
         - lib/suggestFirstGoal.js     (NEW — pure function:
                                        (intent, muscleStates, entries) -> {
                                          regionId, kind: "balance"|"reduce"
                                          |"explore"|"learn",
                                          rationale: string
                                        }. Used by step 5 of the wizard.)
         - TourOverlay.jsx             (NEW — per-tab one-step coachmark.
                                        Default-on for first visit to each
                                        tab; tracked in
                                        data.onboarding.tourSeen[tabName].
                                        Dismissable; "Replay tour" in
                                        Settings re-arms all four flags.)
         - SettingsDrawer.jsx          (NEW — overflow-menu home. The U2
                                        header overflow currently exposes
                                        Export / Import / Clinical report —
                                        move those into this drawer and add
                                        "Replay tour" + "Reset onboarding"
                                        entries. Do NOT remove or rename
                                        any existing handler — just re-home.)
         - BodyMapApp.jsx              (mount OnboardingFlow + TourOverlay
                                        at the app root; replace the
                                        overflow-menu inline JSX with the
                                        new SettingsDrawer; thread
                                        data.onboarding through state.)

       Acceptance: ux-plan.md §10 U7 + onboarding-flow.md every step.
       Build gate green after U7 before starting U8.

  U8 — Gamification: streak, milestones, region mastery, schema delta
       Files:
         - StreakBadge.jsx             (NEW — replaces the U2 "—" header
                                        placeholder. Reads data.streak.
                                        Cold-start: muted "Day 0".)
         - MilestoneToast.jsx          (NEW — 4-second celebration toast
                                        per gamification-spec.md §3. Queue-
                                        based — multiple unlocks in one
                                        save chain stack and dismiss in
                                        order. Token-only. Reduced-motion
                                        respects prefers-reduced-motion.)
         - data/milestones.js          (NEW — full gamification-spec §3
                                        catalog as a frozen array of
                                        { id, label, description, predicate }
                                        records. Predicates are pure
                                        (state) -> boolean.)
         - lib/recordActivity.js       (NEW — single helper called by every
                                        meaningful-action handler (log save,
                                        assessment save, mark done,
                                        calibrate, plan generate). Updates
                                        streak.current / longest /
                                        lastActiveDate per gamification-
                                        spec.md §2 and returns the updated
                                        streak block. Pure modulo Date.now.)
         - lib/checkMilestones.js      (NEW — runs the catalog predicates
                                        against state, diffs against
                                        data.milestones, and returns
                                        newly-fired milestones for the
                                        toast queue.)
         - lib/useBodyBalanceScore.js  (NEW — hook returning
                                        { score, components, isCalibrating }.
                                        Cold-start path returns
                                        { score: null, components: null,
                                          isCalibrating: true } — same shape
                                        TodayScreen and StreakBadge already
                                        consume. The Stage 02-B swap-point:
                                        when M3/M4/M6/M7 land, this hook
                                        starts returning real numbers and
                                        every consumer updates for free.
                                        Mirrors the U6 carry-over note about
                                        useSymmetryComposite().)
         - BodyMapApp.jsx              (1) Mount StreakBadge in the U2
                                        header chip slot. (2) Wire
                                        recordActivity + checkMilestones
                                        into every save handler. (3) Apply
                                        the additive schema-delta migration
                                        on load: if streak / milestones /
                                        onboarding fields are missing,
                                        initialize them to the defaults in
                                        schema-delta.md. Do NOT bump
                                        schemaVersion — keep it at 2 until
                                        Stage 02-B owns the v3 bump.
                                        (4) Verify the existing Export /
                                        Import handlers round-trip the
                                        three new fields verbatim.)
         - _config/storage-schema.md   (UPDATED — document the three new
                                        optional fields under the
                                        schemaVersion=2 baseline with a note
                                        that they will be folded into the
                                        Stage 02-B v3 bump per
                                        schema-delta.md. Update the "Shape"
                                        block and add a "UX-foundation
                                        additions" subsection.)

       Acceptance: ux-plan.md §10 U8 + gamification-spec.md §1–§4 +
       schema-delta.md acceptance criteria.

Constraints (hard, every ticket):
  - Build gate: `cd c:\phsioclick\bodymap-app && npx vite build` must pass
    after EACH ticket (run twice: once after U7, once after U8).
  - Do NOT break the v1 flows in CONVENTIONS §5 — Log/save, Dashboard
    (now Progress), Assessments, Planner, Export/Import, Clinical report.
    Add the new Progress accordion (U6) to your mental "do-not-break" list:
    every accordion slot must keep rendering.
  - Stable muscle IDs from SUB_MUSCLES. Never invent new IDs.
  - Educational tone. Onboarding copy is curious + reassuring, never
    diagnostic. Milestone copy is celebratory, never competitive
    (no "level up", "XP", leaderboards, comparisons).
  - Tokens only. Tailwind theme (brand teal, state.tight/weak/balanced,
    radius-10/14/20, text-display/h1/h2/body-lg/body/caption/micro,
    shadow-elev-1..elev-weak, transition-duration-150/200/400/800,
    ease-standard/entrance/celebration). NO hex literals, NO
    pre-token rose/cyan classes.
  - Schema additions are ADDITIVE on schemaVersion=2. Stage 02-B owns
    the v3 bump. Defaults must work for any user state and survive an
    Import of an older blob.
  - Reduced motion: MilestoneToast and TourOverlay must respect
    prefers-reduced-motion (no slide / scale animations when set).

Carry-overs from U1–U6 you must honor:
  - **useSymmetryComposite() is still deferred** (U6 carry-over). U8 ships
    useBodyBalanceScore() instead — the body-balance hook is the right
    integration point for the header chip. When Stage 02-B / F2 ships M3,
    a thin useSymmetryComposite() can extract behind it; do not pre-build.
  - **Header score chip placeholder** is in BodyMapApp.jsx as a literal
    "—" today (U2). U8 swaps it for <StreakBadge /> next to the chip and
    wires the chip itself through useBodyBalanceScore() — until F1+F2 land,
    isCalibrating === true, so the chip shows the muted "Calibrating" pill,
    same pattern as the Today hero and the Progress hero.
  - **MuscleAtlas.stateColors is a stable contract** (U4) — if region
    mastery needs a per-region rendering, reuse it.
  - **lib/session-plan.js is the canonical plan source** (U5) — if the
    onboarding "suggested first goal" step writes a plan, go through it.
  - **Adherence event** lives in entries[] as
    `{ kind: "adherence", muscleId, remedyId, timestamp }` (U4). The
    "Marked X remedies done" milestone reads from there.
  - **Progress accordion slots** (U6) are token-clean and stable. Do not
    touch ProgressScreen / SymmetryTrendHero / SupportingCardsRow /
    BelowFoldAccordion in U7+U8 unless you spot a regression.
  - **Hot regions stand-in** lives in two places (TodayScreen and
    ProgressScreen) per U6's note. U7+U8 don't need to consolidate, but
    if you reach for it, extract to lib/hot-regions.js together.
  - **TodayScreen + BodyScreen + PlanScreen** are stable; only touch them
    if a tour overlay anchor or the header chip needs a class hook.

When BOTH U7 and U8 have shipped and BOTH build runs are green, do the
Stage 02-A.5 close-out:

  1. Append a U7 row AND a U8 row to:
       c:\phsioclick\stages\02a5-ux-implementation\output\completion-log.md
     (Mirror the U1–U6 row format: Status, Spec, Build verified, Files
      touched, What landed, Acceptance trace, Notes for follow-on tickets.)
  2. Update the build-gate ledger and stage-status block at the bottom of
     completion-log.md so the stage closes cleanly.
  3. Update c:\phsioclick\CONTEXT.md:
       - Stage 02-A.5 ledger row → ☑ shipped
       - Stage 02-B ledger row → ▶ active (implementation)
       - "Active stage" pointer → stages/02b-tracking-implementation/
         (or stages/02-tracking-metrics/ if 02-B hasn't been scaffolded
          yet — leave a TODO so the next chat creates the 02-B
          implementation stage)
       - "Progress" line → reflect U7+U8 shipped and Stage 02-A.5 closed
  4. Update c:\phsioclick\stages\02a5-ux-implementation\CONTEXT.md:
       - Front-matter status → ☑ shipped
       - Phase plan table U-Phase 3 row → ☑ shipped
  5. Update this file
     (c:\phsioclick\stages\02a-ux-foundation\output\IMPLEMENTATION_KICKOFF_PROMPT.md):
       - Status table U7 + U8 rows → ☑ shipped
       - Promote the "Stage 02-B kickoff prompt" below to "Prompt to paste"
         for the next chat
       - Move the U7+U8 prompt into an "Archive — shipped prompts" section
         at the bottom of the file

Then stop and hand control back. The next session opens Stage 02-B
(tracking & metrics implementation) and starts wiring real Stage 02
metrics into the Progress slot contracts U6 reserved.
```

---

## Reference — what's on disk for Stage 02-A planning

For agent verification of inputs.

| Path | What it is |
|------|------------|
| [`stages/02a-ux-foundation/CONTEXT.md`](../CONTEXT.md) | Stage contract (Inputs/Process/Outputs) |
| [`stages/02a-ux-foundation/references/current-ux-audit.md`](../references/current-ux-audit.md) | What's wrong today, file+line cited |
| [`stages/02a-ux-foundation/references/legacy-ia-map.md`](../references/legacy-ia-map.md) | Re-shelving inventory: legacy tabs/components/state -> new IA |
| [`stages/02a-ux-foundation/output/ux-plan.md`](./ux-plan.md) | Top-level spec; U1-U8 tickets in §10; first-three in §13 |
| [`stages/02a-ux-foundation/output/decisions.md`](./decisions.md) | 11 confirmed decisions + deferred list |
| [`stages/02a-ux-foundation/output/design-tokens.md`](./design-tokens.md) | Palette, type scale, spacing, radius, motion + Tailwind config preview |
| [`stages/02a-ux-foundation/output/screens.md`](./screens.md) | Wireframes for Today / Body / Plan / Progress + slide-out + Settings |
| [`stages/02a-ux-foundation/output/learn-layer-spec.md`](./learn-layer-spec.md) | Learn-tab content model + copywriting style guide |
| [`stages/02a-ux-foundation/output/gamification-spec.md`](./gamification-spec.md) | Body Balance Score formula + streak + milestones + region mastery |
| [`stages/02a-ux-foundation/output/onboarding-flow.md`](./onboarding-flow.md) | Six-step first-run wizard + per-tab tour overlays |
| [`stages/02a-ux-foundation/output/schema-delta.md`](./schema-delta.md) | streak + milestones + onboarding additions to Stage 02 v3 blob |

## Reference — what's on disk for Stage 02-A.5 implementation

| Path | What it is |
|------|------------|
| [`stages/02a5-ux-implementation/CONTEXT.md`](../../02a5-ux-implementation/CONTEXT.md) | Implementation stage contract |
| [`stages/02a5-ux-implementation/output/completion-log.md`](../../02a5-ux-implementation/output/completion-log.md) | U1–U6 receipts + follow-on notes; the next session (U7 + U8) appends here and writes the stage close-out block |
| [`bodymap-app/src/lib/session-plan.js`](../../../bodymap-app/src/lib/session-plan.js) | Shared plan-builder (factored out of `SessionPlanner` in U5). Canonical source for Today / Plan / WeeklyStrip / future Progress |
| [`bodymap-app/src/MuscleSlideOut.jsx`](../../../bodymap-app/src/MuscleSlideOut.jsx) | Muscle detail surface from U4. Uses `MuscleAtlas.stateColors` contract — reusable for any muscle-tinted view |
| [`bodymap-app/src/ProgressScreen.jsx`](../../../bodymap-app/src/ProgressScreen.jsx) | Progress shell from U6. Owns `windowDays` state, empty state, and the legacy Dashboard re-home into the accordion. Receives data via props from `BodyMapApp` (entries, assessments, muscleStates, chains, patternsDetected, symmetrySummary, weightedHeatScores, filteredEntries, timelineData, assessmentTrendData) |
| [`bodymap-app/src/SymmetryTrendHero.jsx`](../../../bodymap-app/src/SymmetryTrendHero.jsx) | U6 hero. Cold-start "Calibrating" path + 7/30/90 window selector + sparkline. Slot contract for M3 composite is documented at the top of the file. Stage 02-B / F2 swap point |
| [`bodymap-app/src/SupportingCardsRow.jsx`](../../../bodymap-app/src/SupportingCardsRow.jsx) | U6 above-the-fold cards. M4 tightness load + M6 recovery rate + M7 adherence rate. Each card has a slot-contract comment with the metric ID and the future `src/metrics/*.js` source module name |
| [`bodymap-app/src/BelowFoldAccordion.jsx`](../../../bodymap-app/src/BelowFoldAccordion.jsx) | U6 default-collapsed accordion. Slots: hot regions (M5), flip frequency (M2), assessment trends (existing data), state-change timeline (M9), patterns (existing), history (existing). Each slot's empty-state copy explains *which* metric will fill it in Stage 02-B |
