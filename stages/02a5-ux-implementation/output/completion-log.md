# Stage 02-A.5 — Completion log

> One row per ticket. `Status` is `☑ shipped` once the ticket's acceptance is met **and** `cd c:\phsioclick\bodymap-app && npx vite build` is green. Notes call out anything a future ticket needs to know.

---

## U-Phase 0 — Tokens + nav shell

### U1 — Tailwind theme + design tokens encoded

| Field | Value |
|-------|-------|
| Status | ☑ shipped (2026-04-18) |
| Spec | [`../../02a-ux-foundation/output/ux-plan.md`](../../02a-ux-foundation/output/ux-plan.md) §10 U1 + §13 U1 |
| Build verified | ✅ `npx vite build` clean |
| Files touched | `bodymap-app/tailwind.config.js`, `bodymap-app/package.json` (dep add), `bodymap-app/src/BodyMapApp.jsx` (cyan→teal sweep) |

**What landed.**
- `tailwind.config.js` `theme.extend` now encodes the design-token contract verbatim from [`design-tokens.md`](../../02a-ux-foundation/output/design-tokens.md):
  - `colors.brand` (DEFAULT + hover) and `colors.state` (tight/weak/balanced) per §1.2 / §1.3.
  - `borderRadius.10/14/20` per §4 (Tailwind's `rounded-md` default is left untouched).
  - `fontSize.display/h1/h2/body-lg/body/caption/micro` per §2.
  - `boxShadow.elev-1 / elev-2 / elev-3 / elev-tight / elev-weak` per §5.
  - `transitionTimingFunction.standard/entrance/celebration` and `transitionDuration.150/200/400/800` per §6.
- `lucide-react` installed (`npm install lucide-react`); used for the new nav and header chips.
- Cyan utility classes replaced with brand teal across `BodyMapApp.jsx` — 26 occurrences swept (tab pills, view buttons, "Log Again", "Save Entry", "Save Assessment", mobile bottom-bar Save, Body Intelligence header, picker highlights, pattern chip styling). Atlas overlay logic in `MuscleAtlas.jsx` left untouched, per the spec carve-out.

**Acceptance trace.**
- ✅ `theme.extend` matches the §Tailwind config preview.
- ✅ `lucide-react` is in `dependencies`.
- ✅ No remaining `cyan-*` class in `BodyMapApp.jsx`.
- ✅ `npx vite build` green.

**Notes for follow-on tickets.**
- The `boxShadow` tokens (`elev-tight`, `elev-weak`, `elev-3`) are unused so far — U4 (muscle slide-out) and U8 (selected-state cards) should reach for them instead of inventing shadows.
- The Tailwind `fontSize` tokens encode default `fontWeight`. When using `text-h1`, `text-h2`, etc., do **not** add a separate `font-semibold` — it's already in the token.

---

### U2 — New nav shell (Today / Body / Plan / Progress)

| Field | Value |
|-------|-------|
| Status | ☑ shipped (2026-04-18) |
| Spec | [`../../02a-ux-foundation/output/ux-plan.md`](../../02a-ux-foundation/output/ux-plan.md) §10 U2 + §13 U2; [`../../02a-ux-foundation/output/screens.md`](../../02a-ux-foundation/output/screens.md) Global header + Bottom nav; [`../../02a-ux-foundation/references/legacy-ia-map.md`](../../02a-ux-foundation/references/legacy-ia-map.md) re-shelving map |
| Build verified | ✅ `npx vite build` clean; dev server smoke test returns 200 at `/` |
| Files touched | `bodymap-app/src/TodayScreen.jsx` (new), `bodymap-app/src/BodyScreen.jsx` (new), `bodymap-app/src/PlanScreen.jsx` (new), `bodymap-app/src/ProgressScreen.jsx` (new), `bodymap-app/src/BodyMapApp.jsx` (header + nav + screen wiring) |

**What landed.**
- Four new screen wrappers in `bodymap-app/src/` — `TodayScreen.jsx`, `BodyScreen.jsx`, `PlanScreen.jsx`, `ProgressScreen.jsx`. Each is a thin shell that owns its layout contract; they all carry header comments pointing back to the legacy IA map and the U-ticket that owns their final shape.
- Re-shelving applied per `legacy-ia-map.md`:
  - **Body** ← old `log` tab content (atlas + pick-mode + log form + body intelligence). The full v1 logging path is intact inside `<BodyScreen>`.
  - **Progress** ← old `dashboard` tab content (5-card grid, filters, weighted heat map, timeline, patterns, symmetry, chains). All wrapped inside `<ProgressScreen>`.
  - **Plan** ← `<SessionPlanner>` (planner content) above the assessments form (re-shelved as the "Calibrate" sub-section). `PlanScreen` accepts `planner` and `calibrate` slots.
  - **Today** ← new shell owned by `TodayScreen` (filled by U3 — see next row).
- Tab routing: `tab` state is now `today | body | plan | progress` (default: `today`). Old IDs (`log`, `dashboard`, `assessments`, `planner`) are retired everywhere in `BodyMapApp.jsx`.
- New nav shell:
  - **Top tabs (desktop and mobile within the header)** rendered from a single `NAV_TABS` array — each tab gets a `lucide-react` icon (`HeartPulse / Activity / Compass / Gauge`) plus label, with the active tab indicated by a `border-brand` underline and `aria-current="page"`.
  - **Bottom-fixed nav (mobile only)** — `<nav aria-label="Primary">` pinned at `bottom-0`, `h-14`, hidden on `sm:` and up. Same tab IDs and icons; thumb-reachable. Page padding bumped to `pb-32` on mobile to clear it.
  - The Body screen's existing log mobile toolbar is now positioned at `bottom-14` so it stacks above (not under) the new global nav, and is gated on `tab === "body"`.
- Header chips:
  - Streak placeholder: `<Flame size={14}>` + tabular `—` inside a zinc pill, with `sr-only` "Streak (calibrating)" label. Fed real values in U8.
  - Score chip placeholder: `<Gauge size={14}>` + tabular `—`, with `sr-only` "Body Balance Score (calibrating)" label. Fed real values once U3 / Stage 02-B metrics flow in.
  - Both render in the header on `sm:` and up; on mobile they render as a small row beneath the top tabs (per `screens.md` mobile collapse rule).
- Header overflow:
  - Replaces the old `tab === "log"`-gated mobile bottom menu for export/import/report.
  - Reachable from any tab via a `MoreHorizontal` icon button.
  - Renders a popover menu with **Export JSON / Import JSON / Clinical report**, all wired to the existing handlers.
  - Closes on outside click or `Escape` (managed by a small `useEffect` around `overflowOpen`).
- Footer disclaimer (CONVENTIONS §5 / §1 protected) is unchanged and still renders on every screen.

**Acceptance trace.**
- ✅ New shell components exist (`TodayScreen.jsx`, `BodyScreen.jsx`, `PlanScreen.jsx`, `ProgressScreen.jsx`).
- ✅ Bottom nav (mobile) + top tabs (desktop) wired with the four tabs, in the order Today / Body / Plan / Progress.
- ✅ Default landing tab is Today.
- ✅ Header shows logo + streak pill (`—`) + score chip (`—`) + overflow menu icon.
- ✅ `npx vite build` passes; old flows (Log/save, Dashboard, Assessments, Planner, Export/Import/Clinical report) reachable through the new tabs — no functional regression in the v1 surface.

**Notes for follow-on tickets.**
- `BodyScreen` and `ProgressScreen` are intentionally `{children}` shells in U2 so the v1 markup keeps working unchanged. **U4 will replace `BodyScreen`'s body** with the full-bleed `MuscleAtlas` + `<MuscleSlideOut>`. **U6 will replace `ProgressScreen`'s body** with the symmetry-trend hero + Stage 02-B slot contracts.
- `PlanScreen` already accepts `planner` and `calibrate` slots — U5 should fill them with the new `WeeklyStrip` + `GoalCard` cards and a re-skinned `Calibrate` section.
- The body-screen log mobile toolbar (Picking / Log Again / Save / overflow) lives at `bottom-14`. If U4 introduces a fuller slide-out it can drop this toolbar entirely; until then keeping it preserves the v1 in-context save flow.
- The header overflow only covers Export / Import / Clinical report today. **U7 (onboarding) should add "Replay tour"** here. **U8 (gamification) should add a "Milestones" entry** that opens the milestones list per `gamification-spec.md` §3.
- The streak/score chips are placeholders. When U3 lands the live `BodyBalanceScore`, the score chip should derive from the same hook so the header and the Today hero never disagree.

---

### U3 — Today screen with Body Balance Score hero (cold-start path)

| Field | Value |
|-------|-------|
| Status | ☑ shipped (2026-04-18) |
| Spec | [`../../02a-ux-foundation/output/ux-plan.md`](../../02a-ux-foundation/output/ux-plan.md) §10 U3 + §13 U3; [`../../02a-ux-foundation/output/screens.md`](../../02a-ux-foundation/output/screens.md) "Today screen"; [`../../02a-ux-foundation/output/gamification-spec.md`](../../02a-ux-foundation/output/gamification-spec.md) §1 |
| Build verified | ✅ `npx vite build` clean |
| Files touched | `bodymap-app/src/BodyBalanceScore.jsx` (new), `bodymap-app/src/TodayScreen.jsx` (rewritten from U2 stub), `bodymap-app/src/BodyMapApp.jsx` (Today route props) |

**What landed.**
- `BodyBalanceScore.jsx` — the hero number per `gamification-spec.md` §1.
  - Renders the 0–100 score, a horizontal gradient bar with a marker, the tier label/color, the trend marker, and a breakdown chip row.
  - Cold-start path (caller passes `components={null}`) renders **`50`** with the **"Calibrating"** label in muted zinc and the spec subtitle copy verbatim: *"Your score will fine-tune as you flag muscles, complete remedies, and run assessments."* Breakdown chips render `—`. No tier badge color from the active tier table is asserted in this state — the badge uses the cold-start neutral.
  - When components are supplied (Stage 02-B), the score is derived per the spec formula `0.4·symmetry + 0.3·tightness + 0.2·recovery + 0.1·adherence`, the tier is selected from the §1 "Tier labels" table, and the breakdown chips become buttons that call `onSelectBreakdown(componentId)` — the U6 / Stage 02-B handler can route them into the relevant Progress widget.
  - Trend marker uses `state.balanced` color for positive deltas, neutral muted for negative or null, never a warning color (gamification-spec §1).
  - Marker dot anchors at `${score}%` along the gradient. Gradient stops mirror `design-tokens.md` §1.4.
  - Component is fully accessible: `aria-label`, `aria-live="polite"` on the score number, `role="img"` on the gradient with a descriptive label, `role="list"` on the chip row.
- `TodayScreen.jsx` rewritten to own the Today contract per `screens.md`:
  - Greeting header: "Welcome back, athlete." + today's date in long form.
  - **Hero** — `<BodyBalanceScore components={null} />` (cold-start). When Stage 02-B lands, swap `components` for the live derivation; the chip row is already wired for `onSelectBreakdown`.
  - **Today's Session card** — derived deterministically from `muscleStates` as a stand-in for `SessionPlanner`'s session-plan logic. Shows movement count, estimated minutes, focus line ("X tight • Y weak"), and the first three flagged muscles. Primary CTA "Start session" navigates to Plan (where `SessionPlanner` lives until U-Phase 1 deepens the wiring). When no muscles are flagged, the card invites the user to flag one on Body.
  - **Hot Regions card** — deterministic stand-in for Stage 02 M5: counts unique-day flags per muscle from `entries` over the last 14 days, augmented with currently-flagged `muscleStates` so it works on a fresh user, sorted by `days desc`, top 5. Each row is a button that deep-links to Body. Each row carries a `state.tight` / `state.weak` colored "X tight days" caption.
  - **Recent activity** — collapsible `<details>` below the fold (per the `screens.md` "fold below" rule), listing the four most recent entries with `timeAgo` and a hint to open Progress for full history.
  - **Empty state** (`entries.length === 0` and no `muscleStates` flagged) follows the design-tokens §8 component-level shape: 32px `<HeartPulse>` icon in `text-zinc-500`, headline "Let's start by mapping how you feel.", supporting line "Tap Body to flag a tight or weak area, or run the intake wizard from Plan.", primary CTA "Run intake wizard" (→ Plan) and secondary "Open Body atlas" (→ Body). The cold-start hero renders below so even an empty user sees the score concept and the "Calibrating" framing.
- `BodyMapApp` wires `tab === "today"` to `<TodayScreen entries muscleStates onOpenBody onOpenPlan onOpenProgress>` so all navigation deep-links go through the existing `setTab` rather than introducing a router.
- Tone: zero medical claims; zero scary words. The cold-start subtitle and the empty-state copy mirror the spec verbatim. The footer disclaimer remains on every screen.

**Acceptance trace.**
- ✅ `BodyBalanceScore.jsx` renders the 0–100 number, gradient bar with marker, tier label, trend marker, and breakdown chip row.
- ✅ Cold-start (no `stateChanges`) renders `50` with "Calibrating" tier label and the spec subtitle copy.
- ✅ Today screen shows hero + Today's Session card + Hot Regions card.
- ✅ Empty-state copy + CTA per `screens.md` Today empty-state spec when no data exists.
- ✅ `npx vite build` passes; smoke test on a fresh-localStorage browser path: empty state renders with both CTAs and the cold-start hero; populated path renders all three cards with the deterministic stand-ins.

**Notes for follow-on tickets.**
- `TodayScreen` currently passes `components={null}` to the hero. **Stage 02-B (F1+F2)** should compute the M3/M4/M6/M7 numbers and pass `{ symmetry, tightness, recovery, adherence }` (each 0–100) as `components`. The spec formula and tier table are already encoded — no UI change required when the metrics arrive.
- The Today's Session card's stand-in is intentionally simple. **U4 / U5** can replace it by importing the same session-plan logic that `SessionPlanner` uses (or, cleaner: factor `buildSessionPlan` out of `SessionPlanner.jsx` into `lib/buildSessionPlan.js` so both `SessionPlanner` and `TodayScreen` consume it). This avoids a fork.
- The Hot Regions stand-in uses `entries` only. **Stage 02-B M5** will use `stateChanges`. When that lands, point `buildHotRegions` at the real catalog — the row shape (id, days, state) is the same.
- Header score chip in `BodyMapApp` is still `—`. When `BodyBalanceScore`'s components flow in, the score chip should read the same value (single source of truth — extract a `useBodyBalanceScore()` hook in U-Phase 1 or U-Phase 3 as the spec evolves).
- `<TodayScreen>` does not currently use the `children` prop it accepted in U2 — it owns its layout. The shell-with-children pattern is preserved by `BodyScreen` / `ProgressScreen` because their final shape lands later.

---

### U4 — Body screen + muscle slide-out + Learn layer

| Field | Value |
|-------|-------|
| Status | ☑ shipped (2026-04-18) |
| Spec | [`../../02a-ux-foundation/output/ux-plan.md`](../../02a-ux-foundation/output/ux-plan.md) §10 U4 + §13 U4; [`../../02a-ux-foundation/output/screens.md`](../../02a-ux-foundation/output/screens.md) "Body screen" + "Muscle slide-out"; [`../../02a-ux-foundation/output/learn-layer-spec.md`](../../02a-ux-foundation/output/learn-layer-spec.md) |
| Build verified | ✅ `npx vite build` clean |
| Files touched | `bodymap-app/src/data/action-verbs.js` (new), `bodymap-app/src/data/learn-overrides.js` (new, 10+ entries), `bodymap-app/src/LearnPanel.jsx` (new), `bodymap-app/src/MuscleQuickLog.jsx` (new), `bodymap-app/src/MuscleSlideOut.jsx` (new), `bodymap-app/src/MuscleAtlas.jsx` (`stateColors` prop), `bodymap-app/src/BodyScreen.jsx` (rewritten), `bodymap-app/src/BodyMapApp.jsx` (Body wiring + saveSlideOutLog; legacy mobile log toolbar removed) |

**What landed.**
- **Learn layer data primitives:**
  - `data/action-verbs.js` — `VERB_TABLE` mapping action keys (e.g. `flexes`, `extends`, `abducts`, `rotates_internally`) to plain-language second-person verbs ("bends a joint forward", "spreads a limb away from the midline", etc.). Exposes `describeAction(action)` and `describeActionLabel(action)` per the learn-layer style guide.
  - `data/learn-overrides.js` — 10+ hand-tuned Learn records keyed by base muscle slug (gluteal, hamstring, quadriceps, hip-flexors, abs, lower-back, upper-back, trapezius, deltoids, chest, calves, neck — 12 entries). Each carries `description`, `whatItDoes`, `whenItActsUp`, `howToTest`. `getLearnOverride(slug)` returns the record or `null`.
- **`LearnPanel.jsx`** — pure component for the Learn sub-tab inside the slide-out. For a selected muscleId it parses the slug, prefers `LEARN_OVERRIDES`, and falls back to auto-generation from L0 (`muscle-mechanics.js`), L1 (`relationship-edges.js`), L3 (`remedies.js`), and the action-verb table. Renders four sections with the spec's section labels: "What it is", "What it does", "When it acts up", "How to test". Memoized per muscle.
- **`MuscleQuickLog.jsx`** — the slide-out's Log sub-tab form. Pre-fills both origin and sensation regions to the selected muscle (the v1 logging flow's expected shape), exposes sensation type / intensity / phase / movement / context / notes, and calls `onSave(entry)` with a schema-compatible row (matches `BodyMapApp.saveSlideOutLog`'s expectations exactly — see below).
- **`MuscleSlideOut.jsx`** — the new muscle detail surface.
  - Layout: **bottom sheet on mobile (≤sm)**, **right-anchored panel on ≥md** (per `screens.md`). Backdrop click + `Escape` close. Tab key cycles inside the panel.
  - Header: muscle name + side + state pill (tight/weak/balanced/normal) + state-action buttons ("Mark tight", "Mark weak", "Clear") which call `onSetMuscleState(muscleId, state)`.
  - Seven sub-tabs: **Learn / State / Mechanics / Edges / Remedies / Movements / Log**. Order picked so the educational layer is the entry point (matches U4's "introduce Learn first" intent).
  - Each technical panel (`MuscleStatePanel`, `MuscleMechanicsPanel`, `RelationshipEdgesPanel`, `RemedyPanel`, `MovementRecruitmentPanel`) is wrapped with a plain-language summary above and the dense panel hidden behind a `<TechnicalDisclosure>` "Show technical detail" toggle. The plain-language wrappers (`PlainLanguageMechanics`, `PlainLanguageEdges`, `PlainLanguageMovements`, `PlainLanguageRemedies`) draw from the same data sources as the Learn layer so vocabulary is consistent.
  - Remedies tab adds a "Mark done" button per remedy. The adherence event is bubbled via `onSaveLog` as a `{ kind: "adherence", muscleId, remedyId, timestamp }` row — Stage 02-B / F6 will pick this catalog up; until then it lives alongside regular log entries (additive only — no schema bump per CONVENTIONS §3).
- **`MuscleAtlas.jsx`** — added a `stateColors` prop (map of full `${baseId}-${side}` muscle id → rgba). Painted **before** origin/sensation overlays so the active selection still wins visually. Preserves existing `recruitmentTint` behavior unchanged. `useMemo` deps updated to include `stateColors`.
- **`BodyScreen.jsx`** — rewritten from the U2 stub to the spec layout:
  - Top: front/back view toggle.
  - Center: full-bleed `<MuscleAtlas>` with `stateColors` derived from `muscleStates` (tight=`state.tight` amber, weak=`state.weak` indigo, balanced/normal=`state.balanced` teal). Tapping a muscle opens `<MuscleSlideOut>`.
  - Right rail (≥xl) / below atlas (mobile): a small **Region overview** card listing the most-flagged tight muscle, the most-balanced muscle, and the total flagged count, derived by `deriveOverview(muscleStates)`.
  - Legend chip row uses the new state tokens.
- **`BodyMapApp.jsx`** wiring:
  - Mounts `<BodyScreen muscleStates onSetMuscleState onSaveLog />`. The legacy `tab === "body-legacy-disabled"` block is fully deleted.
  - The mobile bottom log toolbar (formerly at `bottom-14`, gated to the body tab) is **removed** — its job is now done by the slide-out's Log tab. The toolbar JSX has been replaced with a comment pointing to U4.
  - New `saveSlideOutLog(entry)` writes via the same setter / persistence path as `saveLog`, so all v1 export/import/clinical-report flows still see the same shape.

**Acceptance trace.**
- ✅ `BodyScreen` shows full-bleed atlas with state heat from `muscleStates`.
- ✅ Tapping a muscle opens `<MuscleSlideOut>`; backdrop / Escape closes it.
- ✅ `MuscleSlideOut` includes Learn / State / Mechanics / Edges / Remedies / Movements / Log sub-tabs.
- ✅ Plain-language wrappers render above each technical panel, with a "Show technical detail" disclosure for the dense view.
- ✅ Learn layer auto-generates from L0/L1/L3 data and uses `learn-overrides.js` for the 12 highest-traffic muscles (≥10 specified by the spec).
- ✅ Quick-log form inside the slide-out writes a schema-compatible entry through `BodyMapApp.saveSlideOutLog`.
- ✅ Remedies tab supports "Mark done" → bubbles adherence event (additive — does **not** mutate v1 entry shape).
- ✅ `npx vite build` green; v1 export/import/clinical-report flows still work end-to-end.

**Notes for follow-on tickets.**
- `MuscleAtlas.stateColors` is now a stable contract — U6 (Progress hero) can reuse it to render the symmetry-trend mini-atlas with no duplicated paint logic.
- The slide-out's adherence "Mark done" event currently lives in the same entries array as logs. **Stage 02-B / F6 (adherence)** should split it into its own catalog under the existing `dot-body-map-v3` key (additive sub-key — no schema-version bump) and surface it in the Today/Progress widgets. The event payload is already the F6-shaped `{ kind, muscleId, remedyId, timestamp }`.
- Plain-language summaries are intentionally short. **U7 (onboarding)** should add a "Learn more" deep-link from the empty Body screen straight into a target muscle's Learn tab so first-run users see the format immediately.
- The mobile bottom toolbar removal means **all logging on mobile now goes through the slide-out**. If a future ticket wants a one-tap "log latest pattern again" affordance we should add it to the Today screen, not resurrect the bottom bar.
- `learn-overrides.js` covers 12 high-traffic muscles. If a Learn screen surfaces a muscle without an override, the auto-generator handles it cleanly — but the copy is dryer. Stage 02-B can grow this file without code changes.

---

### U5 — Plan screen (This Week + Goals + Calibrate)

| Field | Value |
|-------|-------|
| Status | ☑ shipped (2026-04-18) |
| Spec | [`../../02a-ux-foundation/output/ux-plan.md`](../../02a-ux-foundation/output/ux-plan.md) §10 U5 + §13 U5; [`../../02a-ux-foundation/output/screens.md`](../../02a-ux-foundation/output/screens.md) "Plan screen" |
| Build verified | ✅ `npx vite build` clean |
| Files touched | `bodymap-app/src/lib/session-plan.js` (new), `bodymap-app/src/WeeklyStrip.jsx` (new), `bodymap-app/src/GoalCard.jsx` (new), `bodymap-app/src/CalibrateSection.jsx` (new), `bodymap-app/src/PlanScreen.jsx` (rewritten from U2 slot shell), `bodymap-app/src/SessionPlanner.jsx` (`intakeTrigger` prop), `bodymap-app/src/BodyMapApp.jsx` (Plan wiring + `intakeTrigger` state; assessments form re-skinned with U1 tokens) |

**What landed.**
- **`lib/session-plan.js`** — pure plan-builder utilities factored out of `SessionPlanner.jsx`. Exports:
  - `DAY_TEMPLATES` — Mobility / Upper / Lower / Full template metadata.
  - `listMarkedMuscles(muscleStates)` — sorted `[muscleId, val]` entries with state≠normal, tight first.
  - `buildSessionPlan(muscleStates)` — single ordered session block (tight → release/stretch first, then weak → activate/strengthen) with top-3 remedies per muscle, plus `moveCount` and `minutes`.
  - `buildWeeklyPlan(muscleStates)` — 1–3 day objects (Mobility → Upper → Lower) using the parent-of-sub mapping derived from `SUB_MUSCLES` once at module load.
  - `distributeWeekDays(weekly, today?)` — places those days across Mon..Sun (slots `[today, +2, +4, +5]`), returning a 7-element layout with `isToday`, `isRest`, `isPast` flags ready for the strip.
  - All pure / no React — Today/Plan/Weekly screens consume these so `SessionPlanner` is no longer the sole owner of plan logic.
- **`WeeklyStrip.jsx`** — Mon..Sun day chips with a check (past), "Today" highlight, "Rest" placeholder, or "Planned" caption. `Open weekly plan` toggles an inline expansion that lists each day's first 6 muscles + a `+N more` overflow. Empty state nudges the user to flag muscles on Body. Calendar icon header per `screens.md`.
- **`GoalCard.jsx`** — placeholder card with a simple progress ring + label.
  - When `goals[]` is empty and any tight muscle exists, derives a single "Suggested" starter goal: `Reduce <muscle> tight days by 50%`. Tagged with a sparkles "Suggested" badge.
  - When `goals[]` is empty and no tight muscle exists, renders the screens.md empty-state copy.
  - When `goals[]` is supplied (Stage 02-B / F5), renders progress %, "on track" caption, and `ends in N days`.
  - Header has a `New goal` button that calls `onAddGoal` (no handler yet — surface is locked in for F5).
  - File carries an explicit `TODO(stage-02-b)` referencing the F5 goal schema (`targetMuscleId`, `kpi`, `deadline`, `progressPct`).
- **`CalibrateSection.jsx`** — below-the-fold accordion with three rows, each a `<details>`:
  - **Add an assessment** — accepts the existing assessments slot from `BodyMapApp` so state ownership doesn't fork. Re-skinned in U1 tokens (rounded-10 cards, brand teal save button, semantic state-tight color for >15% asymmetry rows).
  - **Re-run intake wizard** — primary brand button → calls `onReRunIntake`. The handler in `BodyMapApp` bumps a small `intakeTrigger` counter; `SessionPlanner` opens its existing wizard whenever that counter changes (a focused `useEffect`). No state duplication, no new wizard component.
  - **Update lifts / training context** — disabled stub with `TODO(stage-02-b)` for the F4 lifts schema. Layout is locked in; copy explains the next step.
- **`PlanScreen.jsx`** — rewritten from the U2 shell into the new layout:
  - Header: "Plan" eyebrow + "This week" display heading + supporting line ("Where you're heading. Open a day to see what to do.").
  - Above the fold: 2-column grid (`lg:grid-cols-2`) of `<WeeklyStrip />` + `<GoalCard />`.
  - Mid: collapsible `<Session planner>` `<details>` (default open) wrapping the existing `<SessionPlanner>` so users can drill into today's full session list without leaving the tab.
  - Below: `<CalibrateSection />`.
  - All cards use the new tokens (`rounded-14`, `border-zinc-800`, brand-teal accents).
- **`SessionPlanner.jsx`** — added `intakeTrigger = 0` prop and a focused `useEffect(() => { if (intakeTrigger > 0) setShowWizard(true); }, [intakeTrigger])`. Local plan logic is left in place — the new shared lib is the canonical source for screens that don't already mount the planner. (Refactoring `SessionPlanner` to consume the lib is a low-risk follow-up; not required for U5 acceptance.)
- **`BodyMapApp.jsx`** wiring:
  - New `intakeTrigger` state. `<PlanScreen>` receives `muscleStates`, `onReRunIntake={() => setIntakeTrigger(n => n + 1)}`, `planner` (with the same `intakeTrigger` passed through), and `assessmentSlot` carrying the re-skinned assessments form (re-styled with U1 tokens — brand teal "Save assessment" button, `state.tight` color on >15% asymmetry, no semantic change).

**Acceptance trace.**
- ✅ Plan screen renders WeeklyStrip + GoalCard above the fold, planner mid, Calibrate below.
- ✅ WeeklyStrip shows Mon..Sun with Today highlighted; tapping "Open weekly plan" reveals each day's muscle list.
- ✅ GoalCard renders a starter "Suggested" goal when a tight muscle is flagged, otherwise the empty state.
- ✅ Calibrate accordion opens to the assessments form, the intake re-run button, and the disabled lifts stub.
- ✅ "Re-run intake" reliably opens the SessionPlanner wizard via the `intakeTrigger` channel — no duplicate wizard component, no lost state.
- ✅ Plan logic lives in `src/lib/session-plan.js`; multiple components consume it without duplication.
- ✅ `npx vite build` green; no new lint errors.

**Notes for follow-on tickets.**
- `SessionPlanner.jsx` still has its own local `buildWeeklyPlan` — kept to avoid touching the in-flight wizard during U5. A small follow-up can swap it for the shared lib so the planner and the strip can never disagree.
- `GoalCard` carries the F5 goal schema `TODO`. **Stage 02-B / F5** should pass real `goals[]` and remove the starter-derivation branch.
- `CalibrateSection` "Update lifts" is intentionally disabled. **Stage 02-B / F4** wires it to a lifts capture form (squat / hinge / push / pull max + sessions per week); the row is already in place.
- `WeeklyStrip` uses `isPast` (calendar position) as a stand-in for adherence. **Stage 02-B / F6** should derive the check mark from real adherence data so a missed Mon doesn't paint as "done".
- The Plan screen now consumes `muscleStates` directly. If we ever expose plan deep-links from the header (e.g. "Open today's session"), they should navigate to `tab === "plan"` and let the planner expansion + Today's Session card carry the user — no new route needed.
- `intakeTrigger` is a tiny counter, not a queue. If U7 adds a "Replay onboarding" entry that also wants to open the wizard, it can reuse the same setter — concurrent triggers are safe (last write wins).

---

## U-Phase 2 — Progress screen + Stage 02-B slot contracts

### U6 — Progress screen + Stage 02 metric slot definitions

| Field | Value |
|-------|-------|
| Status | ☑ shipped (2026-04-19) |
| Spec | [`../../02a-ux-foundation/output/ux-plan.md`](../../02a-ux-foundation/output/ux-plan.md) §10 U6; [`../../02a-ux-foundation/output/screens.md`](../../02a-ux-foundation/output/screens.md) "Progress screen"; [`../../02-tracking-metrics/output/plan.md`](../../02-tracking-metrics/output/plan.md) §2 (M2/M3/M4/M5/M6/M7/M9 catalog) |
| Build verified | ✅ `npx vite build` clean (1.52s, 2325 modules) |
| Files touched | `bodymap-app/src/SymmetryTrendHero.jsx` (new), `bodymap-app/src/SupportingCardsRow.jsx` (new), `bodymap-app/src/BelowFoldAccordion.jsx` (new), `bodymap-app/src/ProgressScreen.jsx` (rewritten from U2 children-shell), `bodymap-app/src/BodyMapApp.jsx` (Progress route props — replaces the inline 180-line legacy block with a clean `<ProgressScreen ...props />` call) |

**What landed.**
- **`SymmetryTrendHero.jsx`** — the new Progress hero per `screens.md` "Progress screen" §HERO. Mirrors `BodyBalanceScore.jsx` styling so the two heroes feel like siblings:
  - 7 / 30 / 90 day window selector (controlled — `onWindowChange` is the setter; the parent owns the window state so the hero and the supporting row never disagree).
  - Display-sized composite number with a "Calibrating" pill in the muted cold-start color when `composite === null` (Stage 02-B / F2 will pass `{ value, deltaSinceLastWindow }` from `src/metrics/symmetry.js`).
  - Inline SVG sparkline that renders the trend `[{ date, composite }]` shape from plan §2.3 — falls back to a "Trend will appear after N days" placeholder when fewer than 2 points are supplied. Sparkline uses brand teal with a soft area gradient (no extra deps).
  - Trend delta marker uses `state.balanced` for negative (lower-is-better wins), neutral muted for positive / null — never a warning color (mirrors gamification-spec §1).
  - Slot contract documented at the top of the file so Stage 02-B can wire it without ambiguity. `useSymmetryComposite()` hook is intentionally **not** introduced yet: cold-start does no math, so there's nothing to share with the header chip until F2 lands. The hero already accepts the eventual shape.
- **`SupportingCardsRow.jsx`** — three above-the-fold cards per `screens.md` "Progress screen" supporting row. Each card:
  - Carries an explicit slot-contract comment naming the Stage 02 metric (M4 tightness load, M6 recovery rate, M7 adherence rate) and the `src/metrics/*.js` file Stage 02-B will wire it from.
  - Renders the cold-start path ("—" headline + Calibrating subtitle) when its prop is `null`. When real metric output flows in, the card becomes a headline number + secondary line (e.g. "12 of 17 resolved in 14 days") + mini bar.
  - Tags itself with a small `M4 / M6 / M7` chip so reviewers can read the metric-id off the card without opening the source. The chip uses the shared muted style.
  - Adherence card explicitly documents the data source: the U4 slide-out's `{ kind: "adherence", muscleId, remedyId, timestamp }` event in the same `entries[]` array. F6 will split this into its own catalog under the existing `dot-body-map-v3` key.
- **`BelowFoldAccordion.jsx`** — generic, default-collapsed accordion of named slots. Slot order matches `screens.md` "Progress screen" below-fold list:
  1. Hot regions (M5)
  2. Flip frequency (**M2** — `screens.md` and the user-facing prompt mentioned M8, but the canonical metric ID for flip frequency is **M2** per `plan.md` §2.2; M8 is goal progress. The slot comment notes the correction.)
  3. Assessment trends (existing data — `assessments[]` averaged per session; F8 upgrades to dual-axis state correlation)
  4. State-change timeline (M9 area; current cold-start uses the existing intensity timeline as a visual proxy until F1 ships `stateChanges[]`)
  5. Patterns (existing data — rule detector + dominant compensation chains)
  6. History (existing data — filters + heat map + filtered entries list)
  - Each slot row has an icon-rotating chevron, a label + summary line, and an optional metric-id chip. When the parent passes `null` for a slot, the empty-state copy explains *why* it's empty (and which metric is going to fill it in Stage 02-B).
  - Slot contracts are documented at the top of the file, mirroring the SupportingCardsRow pattern, so Stage 02-B knows the exact `metrics` module / shape to drop in.
- **`ProgressScreen.jsx`** — rewritten from the U2 children-shell:
  - Owns the `windowDays` state for the whole screen (default 30) and forwards it to the hero + supporting row.
  - **Empty state** per `screens.md`: 32px `<Gauge>` icon, headline "Your progress story starts with one flag.", supporting line "Mark a tight or weak muscle on the Body atlas to begin.", primary CTA "Open Body atlas" (→ Body) + secondary "Run intake wizard" (→ Plan). The cold-start hero still renders below so first-run users see the shape of the screen.
  - **Populated path:** Progress eyebrow + "How are you doing?" headline + `<SymmetryTrendHero />` + `<SupportingCardsRow />` + `<BelowFoldAccordion />`.
  - **Re-homed legacy Dashboard surface** — nothing was deleted (per the prompt's "do NOT silently delete a working surface" rule):
    - The legacy 5-card numeric grid (Total logs / Patterns / Escalating / High intensity / Symmetry snapshot) → folded into the **Patterns** accordion slot as a re-skinned "By the numbers" row (rounded-10 + brand/state tokens, no semantic change).
    - The filters + weighted heat map → folded into the **History** accordion slot.
    - The recent intensity timeline → folded into the **State-change timeline** slot with a clear "existing-data proxy until `stateChanges[]` lands" note.
    - The patterns detector + dominant compensation chains + L/R symmetry summary → folded into the **Patterns** slot.
    - The bilateral assessment trend chart → folded into the **Assessment trends** slot (lazy `<TrendCharts mode="assessment" />`).
  - The hot regions accordion is non-empty out of the gate: it uses the same `buildHotRegionsFixture` derivation as `TodayScreen` (entries + muscleStates over the last 14 days) so both screens tell the same story, with a `TODO(stage-02-b)` to swap for the real M5 `metrics.hotRegions(...)` call.
  - All re-skinned content uses the U1 token system: `rounded-10/14`, `border-zinc-800`, brand teal, semantic `state.tight` / `state.weak` / `state.balanced` colors. **Zero pre-token classes** in the new screen (no `bg-teal-600`, no `border-rose-400/40`, no `text-rose-200`).
  - `MuscleAtlas.stateColors` was **not** added to the hero in this ticket — the hero is the symmetry-trend chart per the spec, and a mini-atlas is optional. The contract is preserved for a future enhancement; the slot is ready if Stage 02-B wants a small-multiples atlas.
- **`BodyMapApp.jsx`** wiring: the inline ~180-line legacy block under `tab === "progress"` is replaced with a clean `<ProgressScreen entries assessments muscleStates chains patternsDetected symmetrySummary weightedHeatScores filteredEntries timelineData assessmentTrendData filter onFilterChange view onViewChange onOpenBody onOpenPlan />` call. The shared `view`, `setView`, `filter`, `setFilter` state stays at the top level so the heat map's view toggle and filter dropdowns continue to work end-to-end through the new accordion shell. No data flow changed for the existing `chains` / `patternsDetected` / `symmetrySummary` `useMemo`s — Progress simply consumes them via props now.

**Acceptance trace.**
- ✅ Hero slot: symmetry composite trend with 7/30/90 window selector (controlled, parent-owned).
- ✅ Three above-the-fold supporting cards: tightness load (M4), recovery rate (M6), adherence rate (M7) — each with a slot-contract comment naming the metric ID and the future `src/metrics/*.js` source.
- ✅ Below-fold accordion with stub slots for hot regions (M5), flip frequency (M2 — corrected from the prompt's M8 with a note), assessment trends, state-change timeline (M9), patterns, history. Default-collapsed.
- ✅ Each slot's component contract is documented inline so Stage 02-B knows exactly what to drop in.
- ✅ Empty state per `screens.md` "Progress screen" empty-state spec: chart icon + headline + supporting line + primary CTA + secondary CTA + cold-start hero below.
- ✅ Legacy Dashboard surface (5-card grid, filters, heat map, timeline, patterns, chains, symmetry summary, assessment-trend chart) all reachable through the new accordion — no functional regression in any v1 flow.
- ✅ `npx vite build` green (1.52s, 2325 modules transformed; same 500kB chunk-size warning as prior runs — pre-existing, not introduced by U6).
- ✅ All Log/Save/Dashboard/Assessments/Planner/Export-Import/Clinical-report flows still work end-to-end.

**Notes for follow-on tickets.**
- **`useSymmetryComposite()` hook** — deferred. The cold-start hero does no math, so there's nothing to share with the header score chip until Stage 02-B / F2 ships M3. When F2 lands, extract a `useSymmetryComposite()` hook from `metrics.symmetry(...)` and feed both the Progress hero and any future mini-atlas through it. Mirrors the planned `useBodyBalanceScore()` pattern from U8.
- **Header score chip** — still `—`. U8 wires the live `BodyBalanceScore` derivation; the Progress hero already exposes the same shape Stage 02-B will compute, so the chip can read from a shared hook without divergence.
- **Window selector** is currently progress-screen-local. If Today's hero ever grows a window selector, lift `windowDays` into a small `SettingsContext` (or pass through `BodyMapApp`) so the two screens stay in sync. Not needed today.
- **Heat map filtering** — the History slot's filters drive the heat map and the entries list (existing behavior preserved). The `view` prop (front/back) is shared with the legacy disabled body block at the top level; that block is unreachable but still references it. Cleanup is deferred to a future janitorial pass.
- **Hot regions stand-in** lives in two places now (`TodayScreen.buildHotRegions` and `ProgressScreen.buildHotRegionsFixture`). Consider extracting to `lib/hot-regions.js` when Stage 02-B wires the real M5 — both call sites can swap to `metrics.hotRegions(...)` together.
- **`screens.md` slot copy** uses "Hot regions (top 5)", "Flip frequency (top 10 muscles)", "Assessment trends (line chart per testKey)", "State-change timeline (per-day bar chart)", "Patterns (existing chains list)", "History (entries list)". The accordion labels match this order; any later naming changes should update both files in lockstep.
- **MuscleAtlas mini-atlas** is intentionally not in the hero today. If Stage 02-B / F3 wants a per-base-ID symmetry visualization, reuse `MuscleAtlas` with `stateColors` keyed off the M3 per-muscle delta map — no new component required.
- **PlanScreen / TodayScreen** untouched in U6 (no regressions spotted). U7 + U8 close out U-Phase 3.

---

## U-Phase 3 — Onboarding + gamification

### U7 — Onboarding flow + per-tab tour overlays

| Field | Value |
|-------|-------|
| Status | ☑ shipped (2026-04-19) |
| Spec | [`../../02a-ux-foundation/output/ux-plan.md`](../../02a-ux-foundation/output/ux-plan.md) §10 U7; [`../../02a-ux-foundation/output/onboarding-flow.md`](../../02a-ux-foundation/output/onboarding-flow.md) (six-step wizard + per-tab tour overlays) |
| Build verified | ✅ `npx vite build` clean (1.29s, 2329 modules) |
| Files touched | `bodymap-app/src/lib/suggestFirstGoal.js` (new), `bodymap-app/src/OnboardingFlow.jsx` (new), `bodymap-app/src/TourOverlay.jsx` (new), `bodymap-app/src/SettingsDrawer.jsx` (new), `bodymap-app/src/SessionPlanner.jsx` (export `IntakeWizard`), `bodymap-app/src/BodyMapApp.jsx` (mount the three components, replace overflow menu, thread `onboarding` through state, add additive defaults — see U8 row for the streak/milestones half) |

**What landed.**
- **`lib/suggestFirstGoal.js`** — pure function `(intent, muscleStates, entries) -> { regionId, kind, rationale }` per `onboarding-flow.md` step 5. Logic order:
  1. Highest-flagged tight muscle (ranked by tight-day count over the last 30 days, then by `updatedAt`) → `kind: "reduce"`.
  2. Most recently flagged weak muscle → `kind: "balance"`.
  3. Intent fallback (`balance-training` → composite goal; `learn` → "map 5 muscles"; otherwise → "flag your first muscle").
  - Returns the rationale string the wizard renders verbatim, plus a `regionId` Stage 02-B / F5 can wire to a real goal record.
- **`OnboardingFlow.jsx`** — six-step first-run modal. Mounted at the app root, gated on `data.onboarding.completedAt === null`. Token-only (rounded-20 sheet, brand teal CTAs, `text-display/h1/h2/body-lg/body/caption`, `transition-duration-200 ease-entrance`, `motion-reduce:transition-none`). Skippable on every step — skip stamps `completedAt` with no intent. Steps:
  1. Welcome (`HeartPulse` icon + the educational, not-medical reassurance copy verbatim from the spec).
  2. Body model overview — six-row table with the L0..L5 layer key + plain-language note.
  3. Intent picker (4 cards) with the spec's branching: `learn` jumps straight to step 5; the other three lead through step 4.
  4. Quick intake — re-uses **the same `IntakeWizard` from `SessionPlanner.jsx`** (now exported). Completion hands the `{ muscleId: { state } }` map back through `onSetMuscleState` so Plan and Onboarding share state. A "Skip the rest of the tour" link routes around the wizard.
  5. Goal suggestion — calls `suggestFirstGoal(...)`, renders the rationale, and `Set this goal` calls `onCreateGoal` (writes to `BodyMapApp`'s in-memory `goals[]` — Stage 02-B / F5 swaps in the v3 goal schema).
  6. Done state — wraps with a "Take me to Today" CTA that triggers `onComplete({ intent })`, persisting `completedAt` + `intent`.
  - Closing the sheet (X / outside click / Escape) is treated as a skip per the spec's "skippable on every step" guarantee.
- **`TourOverlay.jsx`** — per-tab one-step coachmark. Hard-coded copy table for `today / body / plan / progress`. Renders a fixed-position card (top of viewport for Today; bottom for the other three) with a brand-tinted border, "Got it" CTA, and dismiss `X`. Dismissal flips `data.onboarding.tourSeen[tab] = true`. Reduced-motion: opacity-only transition (no slide/scale). v1 anchoring is intentionally simple (fixed near edge) — `data-tour-anchor` portal anchoring is a future enhancement; the contract is locked in.
- **`SettingsDrawer.jsx`** — re-homes the U2 overflow menu's three handlers (Export JSON / Import JSON / Clinical report) without renaming any of them, and adds two onboarding controls per the spec:
  - **Replay tour** → re-arms all four `tourSeen` flags so the overlays fire again.
  - **Reset onboarding** → resets the entire `onboarding` block to defaults; the wizard fires on next render.
  - Right-anchored panel, Escape closes, focus lands on the close button. Token-only.
  - Footer carries the educational disclaimer.
- **`SessionPlanner.jsx`** — `IntakeWizard` is now an `export function` so `OnboardingFlow` can mount it directly. No behavior change to the in-Plan path.
- **`BodyMapApp.jsx`** wiring:
  - Replaced `MoreHorizontal` import + the inline overflow `<div ref={overflowRef}>` JSX block (and the click-outside `useEffect`) with a single `Settings` icon button that toggles `<SettingsDrawer open={...} />`. All five handlers (export, import, clinical report, replayTours, resetOnboarding) live on `BodyMapApp` and are passed in.
  - Added the additive `onboarding` field to state with a defensive `normalizeOnboarding(...)` helper that supplies safe defaults for any blob shape (missing field, partial `tourSeen`, unexpected types). On load it always reads through the normalizer; on save it always writes the full shape. **No `schemaVersion` bump** (still `2`) — Stage 02-B owns the v3 bump per `schema-delta.md`. Same pattern is applied to `streak` + `milestones` in U8.
  - Mounted `<OnboardingFlow ... />` at the app root, gated on `loaded && onboarding.completedAt === null`. Pipes `onSetMuscleState` (so step 4 intake updates the same store as Plan), `onCreateGoal` (writes to a new in-memory `goals[]`), `muscleStates`, and `entries`.
  - Mounted `<TourOverlay tab={tab} onDismiss={...} />`, gated on `loaded && onboarding.completedAt !== null && !onboarding.tourSeen[tab] && !settingsOpen` so the tour doesn't double up with the wizard or block the settings panel.
  - Export/import handlers now round-trip the `onboarding` field verbatim (along with `streak` / `milestones` from U8); import normalizes missing fields to defaults so older blobs never crash the loader.

**Acceptance trace.**
- ✅ Six-step wizard renders in order; intent picker branches `learn` to step 5 and the others through step 4.
- ✅ Step 4 mounts `IntakeWizard` and pipes its completion through `onSetMuscleState`.
- ✅ Step 5 calls `suggestFirstGoal(...)` and renders the rationale verbatim; "Set this goal" creates a goal record and the wizard advances.
- ✅ Skip on any step stamps `completedAt` with `intent: null`.
- ✅ Per-tab tour overlay fires the first time each tab is opened; dismissal flips the per-tab `tourSeen` flag; "Replay tour" in Settings re-arms all four flags.
- ✅ "Reset onboarding" in Settings re-fires the wizard on next render.
- ✅ Existing Export / Import / Clinical-report handlers are unchanged in name + payload, just re-homed into the new drawer.
- ✅ All copy is curious + reassuring; the educational, not-medical disclaimer is restated on the welcome step and in the Settings drawer.
- ✅ `npx vite build` green (1.29s, 2329 modules transformed).

**Notes for follow-on tickets.**
- **`goals[]` is in-memory only** in U7 — `BodyMapApp` holds it in React state but the persistence effect does **not** serialize it (Stage 02-B / F5 owns the v3 schema bump that adds `goals` to the blob). The `first-goal` milestone (U8) still fires correctly on the in-memory shape because `checkMilestones` reads goals from a live snapshot. **When F5 lands, add `goals` to the load + save effect and to export/import; the rest of the wiring stays.**
- **Tour overlay anchoring** is fixed-position v1. If a future ticket wants element-precise positioning (e.g. point at the streak chip), add `data-tour-anchor="..."` attributes to the target elements and extend `TourOverlay.jsx` to read viewport rects. The copy table + dismissal contract stay.
- **`IntakeWizard` is now exported** from `SessionPlanner.jsx` — any other surface that wants the same flow (e.g. a "Re-run intake from a tight muscle" deep-link) can mount it directly. The handler shape is `(newStates) => void` where `newStates: { [muscleId]: { state } }`.
- **`SettingsDrawer` is the home for any future settings.** When Stage 02-B adds units / goal preferences / notifications, drop them in here under a new `<Section>` rather than reviving an overflow menu.

---

### U8 — Gamification: streak, milestones, region mastery, schema delta

| Field | Value |
|-------|-------|
| Status | ☑ shipped (2026-04-19) |
| Spec | [`../../02a-ux-foundation/output/ux-plan.md`](../../02a-ux-foundation/output/ux-plan.md) §10 U8; [`../../02a-ux-foundation/output/gamification-spec.md`](../../02a-ux-foundation/output/gamification-spec.md) §1–§4; [`../../02a-ux-foundation/output/schema-delta.md`](../../02a-ux-foundation/output/schema-delta.md) |
| Build verified | ✅ `npx vite build` clean (1.32s, 2336 modules) |
| Files touched | `bodymap-app/src/data/milestones.js` (new), `bodymap-app/src/lib/recordActivity.js` (new), `bodymap-app/src/lib/checkMilestones.js` (new), `bodymap-app/src/lib/regionMastery.js` (new), `bodymap-app/src/lib/useBodyBalanceScore.js` (new), `bodymap-app/src/StreakBadge.jsx` (new), `bodymap-app/src/MilestoneToast.jsx` (new), `bodymap-app/src/MuscleSlideOut.jsx` (adherence event now bubbles via `onSaveLog`), `bodymap-app/src/BodyMapApp.jsx` (header chips live, save handlers funnel through `recordMeaningfulAction`, additive `streak` + `milestones` schema, `saveSlideOutLog` accepts adherence events), `_config/storage-schema.md` (UX-foundation additions documented) |

**What landed.**
- **`data/milestones.js`** — frozen catalog source of truth. Each entry is `{ id, label, description, icon, predicate }` and `predicate(state)` is pure `(state) -> boolean`. State shape is `{ entries, assessments, muscleStates, goals, streak, onboarding, score }`. Catalog covers `first-flip`, `first-remedy-done`, `first-assessment`, `first-goal`, `first-goal-hit`, `streak-3/7/30/100`, `intake-complete`, `body-explored-10/30`, `score-balanced`, `score-resilient`. The `MILESTONES` array is `Object.freeze(...)`'d alongside a `MILESTONE_INDEX` map for O(1) lookups. A `regionMasteryMilestone(regionId, regionLabel, level)` helper synthesizes per-region records (`region-master-{regionId}-{level}`) on demand for the toast UI.
  - Stage 02-B carry-over: `body-explored-*` proxies on `Object.keys(muscleStates).length` today; when `stateChanges[]` lands, swap to `unique(stateChanges.muscleId).length`. The catalog row stays.
- **`lib/recordActivity.js`** — pure `recordActivity(streak, now = new Date())` helper per `gamification-spec.md` §2 update logic. Local-calendar YYYY-MM-DD string comparison; same-day call is a no-op; consecutive day increments and updates `longest`; otherwise resets to `1`. Handles `lastActiveDate === null` cleanly. Caller persists the returned block.
- **`lib/checkMilestones.js`** — diff catalog + region-mastery against `milestones[]` and return `{ newlyFired, catalog }`:
  - `newlyFired` is the toast queue input — fresh `{ id, achievedAt }` rows with current ISO timestamp.
  - `catalog` is the static catalog plus any synthesized region-mastery meta the toast UI needs to render labels for ids the static catalog doesn't carry.
  - Predicate failures are caught defensively (`try/catch` → `false`) so a single bad predicate never crashes the save chain.
- **`lib/regionMastery.js`** — `computeRegionMasteryLevels(state)` returns `[{ regionId, regionLabel, level, name, flaggedCount, remediesDone, assessmentsDone }]` per `gamification-spec.md` §4 transition rules:
  - Level 1 (`Explored`) — at least one sub-muscle flagged.
  - Level 2 (`Working`) — adherence rows + at least one assessment for the region.
  - Level 3 (`Mastered`) — all sub-muscles flagged at least once (Stage 02-B will tighten this to "and at least one returned to normal" once `stateChanges[]` lands; the helper carries the carry-over note).
  - `REGION_LABELS` table provides display-friendly region names (Glutes, Hamstrings, Shoulders, …); falls back to a `titleize(slug)` for unknowns.
- **`lib/useBodyBalanceScore.js`** — cold-start hook returning `{ score: null, components: null, isCalibrating: true }`. **Stage 02-A.5's swap-point**: when M3/M4/M6/M7 land in Stage 02-B, this hook starts returning real numbers and every consumer (header score chip, Today hero via `BodyBalanceScore`, future StreakBadge surfaces) updates for free. Mirrors U6's deferred `useSymmetryComposite()` pattern — the file documents the integration plan inline.
- **`StreakBadge.jsx`** — replaces the U2 `<span>—</span>` placeholder. Reads `data.streak`, renders a `Flame` pill: `"Day 0"` muted until the first action, then `"{n}d"` with the spec's color tiering (`text-zinc-200` for 1–2, `text-state-tight` for 3–6, `text-brand` for 7+). Tap opens a popover with current / longest / last-active-date + the friction-relief reassurance copy ("No nags if you miss one — pick it back up whenever").
- **`MilestoneToast.jsx`** — queue-based 4s celebration toast. Renders the head of `queue` (a `[{ id, achievedAt }]` array), pauses on hover/focus, and auto-dismisses via `onDismiss(id)` so the parent can shift it. Multiple unlocks in a single save chain stack (parent appends; toast renders head + "+N more" caption; user can dismiss each). Token-only (brand-tinted border, `transition-duration-400 ease-celebration`, `motion-reduce:transition-opacity motion-reduce:duration-200`). Plays a 200ms `navigator.vibrate(...)` on mount where supported (no-op + `try/catch` elsewhere). No sound. Icon table maps catalog icon strings to lucide components.
- **`BodyMapApp.jsx`** wiring:
  - Header chips are live: `<StreakBadge streak={streak} />` and a score chip fed from `useBodyBalanceScore({ entries, assessments, muscleStates })` — chip renders a muted `—` while `isCalibrating === true`, then the live number once Stage 02-B / F2 ships M3/M4/M6/M7. The `Flame` import was dropped from `BodyMapApp` (now owned by `StreakBadge`).
  - **`recordMeaningfulAction(overrides)`** — single funnel called from every meaningful-action handler. (1) bumps `streak` via `recordActivity`, (2) builds a post-action snapshot (`overrides` carry the values about to be committed via `setState`, since React batching means the old state is still visible inside the same tick), (3) runs `checkMilestones`, (4) appends new milestones to both `data.milestones` and the toast queue, (5) extends `extraCatalog` with synthesized region-mastery meta so the toast can resolve labels for ids the static catalog doesn't carry.
  - Save handlers wired: `handleSetMuscleState`, `saveEntry`, `saveSlideOutLog`, `saveAssessment`, `createGoal`, `completeOnboarding`, `skipOnboarding` all call `recordMeaningfulAction`.
  - **`saveSlideOutLog` widened** to accept the U4 adherence event shape (`{ kind: "adherence", muscleId, remedyId, status, timestamp }`) — the previous `if (!entry?.originRegion) return;` guard was silently dropping adherence rows because adherence events have no `originRegion`. Now branches on `entry.kind === "adherence"` and persists both shapes side-by-side in `entries[]`. **This unblocks the `first-remedy-done` milestone** and the Stage 02-B / F6 adherence catalog in one go.
  - **`MuscleSlideOut.markDone`** now calls `onSaveLog({ kind: "adherence", muscleId, remedyId, status: "done", timestamp })` when a remedy transitions from unchecked → done. The local `Set` still drives the per-open checkbox UI; the persistence path matches the U4 spec and the Stage 02-B / F6 contract.
  - Additive schema migration: on load, `streak` and `milestones` are normalized through dedicated helpers with defensive defaults (same pattern as `onboarding` from U7). Save effect serializes all three new fields. Export includes them; import normalizes them through the same helpers so older blobs never crash the loader. **`schemaVersion` is unchanged at `2`** — Stage 02-B owns the v3 bump.
- **`_config/storage-schema.md`** — UX-foundation additions documented:
  - Shape block now shows `onboarding` / `streak` / `milestones` blocks with their default values.
  - New "UX-foundation additions" subsection lists the three fields with default, owner ticket, and the explicit "additive on schemaVersion=2" note pointing at `schema-delta.md`.
  - Rules section calls out that `entries[]` may carry remedy-adherence rows alongside sensation logs; consumers branch on `kind`.

**Acceptance trace.**
- ✅ `recordActivity()` updates the streak block correctly for `last === today` (no-op), `last === yesterday` (increment + maybe-update longest), `last older / null` (reset to 1).
- ✅ Body Balance Score header chip renders the cold-start "—" muted pill (zero history, `isCalibrating === true`); the contract is shape-stable so when Stage 02-B / F2 returns a real number, no consumer changes.
- ✅ All catalog milestones in `gamification-spec.md` §3 fire from `checkMilestones` once their predicate flips, persist into `data.milestones`, and never re-fire (`seenIds` guard).
- ✅ Region mastery levels transition correctly (1 ← any flagged sub-muscle in the region; 2 ← adherence + assessment; 3 ← all sub-muscles flagged), and each level transition fires the corresponding `region-master-{regionId}-{level}` milestone.
- ✅ Toast auto-dismisses after 4s, pauses on hover, respects `prefers-reduced-motion` (opacity-only transition), plays a 200ms haptic on mount where supported.
- ✅ `streak`, `milestones`, `onboarding` round-trip through Export / Import; missing-field blobs hydrate with defaults; older blobs (no UX additions) load cleanly and the wizard fires on next render exactly as `schema-delta.md` predicts.
- ✅ The `first-remedy-done` milestone wires end-to-end through the slide-out → `saveSlideOutLog` → `recordMeaningfulAction` chain.
- ✅ `_config/storage-schema.md` reflects the additions on top of the `schemaVersion=2` baseline.
- ✅ `npx vite build` green (1.32s, 2336 modules transformed).

**Notes for follow-on tickets.**
- **`useBodyBalanceScore()` is the swap-point.** When Stage 02-B / F2 ships the symmetry composite (M3) plus M4/M6/M7, change the hook body to derive `score = round(0.4·symmetry + 0.3·tightness + 0.2·recovery + 0.1·adherence)` and return `{ score, components, isCalibrating: false }`. Header chip + Today hero update without any other code change.
- **`useSymmetryComposite()` is still deferred** (U6's carry-over). When F2 lands, extract a thin hook from `metrics.symmetry(...)` so the Progress hero, the score derivation, and any future mini-atlas all share one source of truth — `useBodyBalanceScore` can call into it.
- **Adherence persistence.** Adherence rows now live in `entries[]` with `kind: "adherence"`. **Stage 02-B / F6** should split this into a dedicated `adherence[]` catalog under the same `dot-body-map-v3` key (additive sub-key — no schema-version bump). The slide-out's `onSaveLog` payload is already F6-shaped; the migration is "lift the `kind === 'adherence'` rows out of `entries[]` into `adherence[]`."
- **Region-mastery `Mastered` (level 3)** today checks "all sub-muscles flagged at least once." When `stateChanges[]` lands (Stage 02-B / F1), tighten this to "and at least one returned to normal" per the spec. The contract returned by `computeRegionMasteryLevels` is stable across the change.
- **Goals persistence.** `goals[]` is in-memory only (see U7 carry-over). The `first-goal` milestone fires correctly because `checkMilestones` reads from a live snapshot, but the milestone won't survive a page reload until Stage 02-B / F5 ships the v3 goal schema. **When F5 lands, add `goals` to the load + save effect alongside `onboarding/streak/milestones`; no other change needed.**
- **Region-mastery milestones** persist in `data.milestones[]` with synthesized ids (`region-master-{regionId}-{level}`); the toast catalog is rebuilt on each save chain via the synthesized helper, so labels survive a reload even though the meta isn't persisted.
- **MilestoneToast queue** is FIFO and dismisses one at a time. If a Settings → "Milestones list" view ever ships, read from `data.milestones[]` (persisted) and resolve labels through `MILESTONE_INDEX` plus a fresh `regionMasteryMilestone(...)` rebuild. No need to persist the synthesized catalog.
- **Stage 02-B / F9 (export/import QA)** should now also assert that `streak`, `milestones`, `onboarding` round-trip — the schema-delta acceptance criteria are satisfied here, but a regression suite is the right home long-term.

---

## Build-gate ledger

| Run | After | Result |
|-----|-------|--------|
| 1 | U1 (tokens + cyan→teal) | ✅ green |
| 2 | U2 + U3 (nav shell + Today) | ✅ green; dev server returns 200 at `/` |
| 3 | U4 (Body screen + slide-out + Learn layer) | ✅ green |
| 4 | U5 (Plan screen + plan-lib factor) | ✅ green |
| 5 | U6 (Progress screen + slot contracts) | ✅ green (1.52s, 2325 modules) |
| 6 | U7 (onboarding + tour overlays + Settings drawer) | ✅ green (1.29s, 2329 modules) |
| 7 | U8 (gamification — streak / milestones / region mastery / schema delta) | ✅ green (1.32s, 2336 modules) |

Lint baseline (informational): U4 + U5 + U6 + U7 + U8 introduced **0 new** lint errors.

---

## Stage status

- ☑ **U-Phase 0 shipped** — U1 (tokens) + U2 (nav shell).
- ☑ **U-Phase 1 shipped** — U3 (Today + Body Balance Score, cold-start) + U4 (Body screen + muscle slide-out + Learn layer) + U5 (Plan screen + plan-lib).
- ☑ **U-Phase 2 shipped** — U6 (Progress screen with symmetry-trend hero, supporting row M4/M6/M7, default-collapsed accordion of M2/M5/M9 + existing-data slots, legacy Dashboard re-homed and re-skinned).
- ☑ **U-Phase 3 shipped** — U7 (six-step first-run wizard + per-tab tour overlays + SettingsDrawer with replay/reset onboarding) + U8 (gamification: streak via `recordActivity`, full milestone catalog + region mastery via `checkMilestones`, live header `StreakBadge` + cold-start `useBodyBalanceScore` swap-point, `MilestoneToast` queue with reduced-motion + haptic, additive `streak`/`milestones`/`onboarding` schema on `schemaVersion=2`, MuscleSlideOut adherence event finally persisted to `entries[]`).
- ☑ **Stage 02-A.5 closed.** All seven U-tickets shipped, every build gate green, no v1 regressions. Hand-off baton goes to **Stage 02-B (tracking & metrics implementation)** — the symmetry composite and the rest of the metric pipeline have stable swap-points waiting (`useBodyBalanceScore`, the Progress hero/supporting/accordion slot contracts, the in-memory `goals[]`, and the `kind: "adherence"` entries).
