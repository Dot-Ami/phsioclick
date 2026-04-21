# Stage 02-A — Confirmed decisions

> Companion to [`ux-plan.md`](./ux-plan.md). User-confirmed answers to the structural forks plus the downstream forks resolved while writing the specs.
> Date confirmed: 2026-04-16.

---

## Locked structural decisions

| # | Decision | Options considered | Confirmed answer | Rationale |
|---|----------|--------------------|------------------|-----------|
| 1 | **Sequencing vs Stage 02 implementation** | (a) UX-first: pause Stage 02, ship UX, then resume metrics into the new shell as Stage 02-B *(recommended)* (b) UX-parallel: open as a sibling track (c) Merge into Stage 02 | **(a) UX-first.** Stage 02 stays paused. Stage 02-A.5 ships UX. Stage 02-B re-opens with F1-F9. | Shipping metrics widgets into a UI the user already finds confusing would compound the problem. UX-first means F1-F9 land in a shell that does them justice. Coordination cost of (b) is real for a single-developer project; (c) overloads one ticket with two jobs. |
| 2 | **Ambition tier** | (a) Tier 1: onboarding + polish only (b) Tier 2: onboarding + IA reshuffle + Learn layer + medium gamification + visual refresh *(recommended)* (c) Tier 3: ground-up redesign with custom illustration + heavy gamification + landing page | **(b) Tier 2.** | The user's complaints are structural (no idea where to go, doesn't teach, no reward loop) — Tier 1 polish wouldn't move the needle. Tier 3 is a multi-week undertaking that delays the metrics work; Tier 2 hits all three structural gaps without spinning up an illustration system. |

---

## Downstream decisions resolved while writing the specs

These came up while drafting `screens.md`, `design-tokens.md`, and `gamification-spec.md`. Each was resolved in the spec text; they are restated here for traceability.

### 3. New IA structure

Confirmed: **Today / Body / Plan / Progress** four-tab structure organized by user job, not data type.

Rationale: every existing tab maps cleanly into one of the four (see [`../references/legacy-ia-map.md`](../references/legacy-ia-map.md)). Default landing tab becomes Today, not Log.

### 4. Color palette direction

Confirmed: **Keep zinc neutrals + replace cyan with refined teal + add semantic state palette (amber for tight, indigo for weak, soft teal for balanced).**

Rejected alternatives:
- Red/yellow/green clinical traffic light — implies medical/risk framing that violates [`_core/CONVENTIONS.md`](../../../_core/CONVENTIONS.md) §1.
- Cyan-only (status quo) — too cold, too "tech," no semantic differentiation by state.
- Light-mode option — out of scope; CONVENTIONS §7 mandates dark theme.

Full palette in [`design-tokens.md`](./design-tokens.md) §1.

### 5. Hero number identity

Confirmed: **Body Balance Score**, derived 0-100 number on Today header + Today screen hero.

Rejected alternatives:
- "Pain Score" / "Tightness Score" — both negative framings; Body Balance is the goal-direction frame.
- Multi-number dashboard hero — violates the "one hero per screen" rule from `screens.md`.
- Tier name only (no number) — number is what people parse at a glance; tier provides context.

Formula and tiers in [`gamification-spec.md`](./gamification-spec.md) §1.

### 6. Gamification depth

Confirmed: **Three mechanics — Body Balance Score, daily Streak, Milestones (including Region mastery).**

Rejected alternatives:
- XP / levels / coins — undercut the educational tone, suggest a freemium game.
- Leaderboards / social comparison — violates "no comparative framing" rule; this app has one user.
- Push-notification streaks — violates "no nags" rule.
- Daily quests / weekly challenges — over-engineered for v1; revisit in a later UX stage if the streak mechanic isn't sticky enough.

Friction guarantees in [`gamification-spec.md`](./gamification-spec.md) §5.

### 7. Learn layer source-of-truth

Confirmed: **Auto-generated from existing L0/L1/L3 data with a small `LEARN_OVERRIDES` file for hand-tuning the highest-traffic muscles.**

Rejected alternatives:
- Hand-write Learn content for all 55 muscles — too expensive for v1; auto-generation gets to 80% with templates.
- Source from external content (e.g. Wikipedia) — license, accuracy, and tone control issues.
- LLM-generated at runtime — adds an external dependency the app deliberately avoids; runtime cost; consistency risk.

Templates and override pattern in [`learn-layer-spec.md`](./learn-layer-spec.md).

### 8. Onboarding intent picker

Confirmed: **Four intents — `tight-area`, `balance-training`, `rehab`, `learn`.** Persisted in `onboarding.intent`.

Rejected alternatives:
- No intent picker (skip straight to intake) — loses the chance to bias defaults and copy.
- Free-text intent ("tell us in your own words") — adds friction; nothing useful to do with the text in v1.
- Many intents (8+) — choice overload; four maps cleanly to actual usage patterns.

The four intents bias step 5 (suggested first goal) and step 4 (intake wizard intro copy) in [`onboarding-flow.md`](./onboarding-flow.md).

### 9. Schema bump for UX additions

Confirmed: **No schema-version bump.** Add three optional fields (`streak`, `milestones`, `onboarding`) inside the same Stage 02 v3 blob.

Rejected alternatives:
- Bump to v4 — unnecessary; additions are non-breaking and have safe defaults.
- Separate localStorage key for UX state — fragments persistence, breaks export/import single-file contract.

Migration logic in [`schema-delta.md`](./schema-delta.md).

### 10. Atlas component reuse

Confirmed: **[`MuscleAtlas.jsx`](../../../bodymap-app/src/MuscleAtlas.jsx) and [`BodyAtlas.jsx`](../../../bodymap-app/src/BodyAtlas.jsx) reused unchanged.** Re-styled via design tokens; interaction model preserved.

Rejected alternatives:
- Rebuild atlas with new SVG library — months of work for no UX gain.
- Switch to 3D model — out of scope; tech, performance, and asset implications are huge.

### 11. Logo / brand identity

Confirmed: **Defer to a later stage.** Keep current "Dot Body Map" wordmark; just refresh the tagline and apply new tokens.

Rejected alternatives:
- Commission a new logo as part of Stage 02-A — Tier 3 territory, explicitly out of scope.
- Rename the product — out of scope; product naming is a separate decision.

Current tagline ("Clinical compensation tracker") gets replaced with something audience-appropriate in U1, e.g. "A personal training tool for body balance."

---

## Downstream consequences locked in by these decisions

- **Storage stays on `dot-body-map-v3`.** No new keys, no new schema versions in either Stage 02 or 02-A.
- **No backend.** Streak and milestones are local-only; no sync, no leaderboard.
- **Body intelligence layers (L0-L5) are still the underlying model.** UI surfaces them in plain language but the data graph and join keys are untouched.
- **Educational-only stance is preserved.** Every gamification copy item passes the forbidden-words list in [`learn-layer-spec.md`](./learn-layer-spec.md).
- **Mobile-first.** Today is default landing; bottom nav stays mobile-only; slide-out is bottom-anchored on mobile.
- **No new tabs ever.** If a future feature doesn't fit Today / Body / Plan / Progress, it goes inside one of those or in Settings.

---

## Decisions deliberately deferred

- **Custom illustration system** — Tier 3, deferred. Lucide icons cover v1.
- **Marketing landing page / install flow** — out of scope; deferred (probably its own stage).
- **Sound design** — explicitly excluded ("daytime tool used in gyms" — see [`gamification-spec.md`](./gamification-spec.md) §3).
- **Internationalization** — deferred. v1 is English-only.
- **Theming (light mode)** — deferred. CONVENTIONS §7 mandates dark.
- **A11y audit** — basic patterns followed (keyboard nav, reduced motion, screen-reader labels) but a full WCAG audit is its own stage.
- **Animation system beyond design tokens** — no Framer Motion or similar in v1; Tailwind transitions and CSS keyframes only.
