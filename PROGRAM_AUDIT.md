# Dot Body Map — Full Program Audit

**Date:** 2026-07-05 · **Auditor:** Claude (full-repo review + live app testing)
**Method:** read every core module (app shell, all 9 metrics, lib, data layer, key screens), ran the build gate, ran ESLint, launched the dev server, and drove the real app with a headless browser (fresh user, seeded 10-day user, and flag-a-muscle flows), verifying persisted localStorage output after each interaction.

---

## 1. Executive summary

**The product is in much better shape than its repo is.** The app runs, looks polished, and the core loop (flag a muscle → session plan → progress metrics) genuinely works with zero console errors. The metrics layer (M1–M9 + Body Balance Score) is the strongest code in the project: pure, documented, windowed correctly.

The three biggest problems, in order:

1. **The repo could not build from a fresh clone** (P0 — fixed in this commit). The vendored `react-muscle-highlighter` package's `dist/` was swallowed by `.gitignore`'s `**/dist/` rule, so only its `package.json` was in git. Anyone cloning the repo got an unbuildable app. The prebuilt `dist/` is now committed with explicit un-ignore rules, and `npx vite build` passes.
2. **The Today screen never leaves "Calibrating."** It hard-codes `components={null}` into the Body Balance Score hero, so even a user with months of history sees a fake score of 50 — while the header chip and Progress tab compute live numbers from the same data. Stage 02-B wired Progress and Plan but never finished Today, despite the docs saying it did.
3. **Remedies rarely reach the user.** The remedy database is keyed by *sub-muscle* IDs (e.g. `biceps-femoris`), but flags mostly land on *parent* IDs (e.g. `hamstring-l` from an atlas tap). `getRemedies('hamstring', 'tight')` returns nothing, so the session planner shows "General stretch / release recommended" instead of the 34 real, well-written remedies sitting in `data/remedies.js`.

Everything else is fixable polish: 23 lint errors, ~1,240 lines of dead code, no tests, no CI, and a handful of small UX/copy bugs documented below.

---

## 2. What this project is (verified against docs + code)

A React 19 + Vite + Tailwind SPA: an interactive anatomical atlas for **personal training and body balance** — not a medical tool (disclaimer footer present everywhere, good).

**The 6-layer body-intelligence stack (L0–L5) is real, not aspirational:**

| Layer | Module | Status |
|---|---|---|
| L0 mechanics | `data/muscle-mechanics.js` | ✅ 58/58 sub-muscles covered |
| L1 relationship edges | `data/relationship-edges.js` | ✅ present, rendered in slide-out |
| L2 state (tight/weak) | `muscleStates` + `stateChanges` log | ✅ core loop, fully working |
| L3 remedies | `data/remedies.js` (34 remedies) | ⚠️ written but mostly unreachable (§4.2) |
| L4 movements | `data/movements.js` + recruitment panel | ✅ present |
| L5 planner | `lib/session-plan.js` + SessionPlanner | ✅ working, generic output due to L3 gap |

**Storage:** single localStorage blob `dot-body-map-v3`, schema v3, with a genuinely well-executed migration path (`migrateBlobToV3`, `migrateLegacyId`, permissive normalizers on every field). Import/export round-trips the same shape.

**Verified working by driving the real app:**
- First-run onboarding wizard renders and is skippable; per-tab tour overlays fire and dismiss.
- All four tabs (Today / Body / Plan / Progress) render with **zero console errors**.
- Atlas tap → muscle slide-out (Learn / State / Mechanics / Edges / Remedies sub-tabs) → flag tight/weak → writes `muscleStates`, appends a `stateChanges` event, bumps streak, fires milestones. Verified in persisted storage.
- Flagged muscles → Plan generates a session (tight → release/stretch, weak → activate/strengthen) and a weekly strip; Today shows the session summary.
- Progress computes live M3 symmetry trend (with 7/30/90 selector), M4 tightness load, M6 recovery, M7 adherence, plus the collapsed accordion of deeper widgets.
- Export JSON / clinical-report markdown generation code paths are sound (blob download).

---

## 3. Quality gates (as found)

| Gate | Result |
|---|---|
| `npx vite build` | ❌ **failed** on fresh clone (vendor dist missing) → ✅ fixed in this commit |
| `npx eslint .` | ❌ 23 errors, 4 warnings |
| Tests | ❌ none exist — no runner, no test script, zero coverage |
| CI | ❌ none (`.github/` absent) — the build gate in CLAUDE.md is enforced by honor system |
| Runtime console | ✅ clean across all flows tested |

---

## 4. Findings

### P0 — Repo unbuildable from fresh clone *(fixed in this commit)*
`bodymap-app/vendor/react-muscle-highlighter/` contained only `package.json`; both root and app `.gitignore` have `**/dist/` / `dist` rules that swallowed the prebuilt output `BodyAtlas.jsx` deep-imports (`dist/esm/components/SvgMaleWrapper.js`). Restored from the identical npm-registry tarball (`react-muscle-highlighter@1.2.0`, MIT) and un-ignored. Build verified green.

### P1-a — Today screen is permanently "Calibrating"
`TodayScreen.jsx:154` and `:361` render `<BodyBalanceScore components={null} trend={null} />`. `components === null` is the component's cold-start switch, so the hero shows 50/Calibrating **forever**. Meanwhile `BodyMapApp.jsx:1271` computes the live score via `useBodyBalanceScore` for the header chip. Confirmed live: with 10 days of seeded history, Progress showed composite 8.33 / load 15 day-units while Today showed "Calibrating — Symmetry — Tightness —".
**Fix:** pass `bbs.components` + a real week-over-week trend down from `BodyMapApp` (the hook already returns everything needed).

### P1-b — Today's "Hot regions" is still the pre-metrics stand-in
`TodayScreen.buildHotRegions()` counts *entry* days and clamps to `max(days, 1)` — a muscle flagged tight for 10 straight days displays "1 tight day." The real M5 `hotRegions()` metric exists in `src/metrics/hotRegions.js` and is already used by Progress. The file's own header admits it: `TODO(stage-02-b): swap deterministic stand-ins`. Confirmed live (seeded hamstring tight 10 days → Today said "1 tight day").
**Fix:** delete the stand-in, call `hotRegions({ stateChanges, now })`.

### P1-c — Remedy lookup misses parent-level flags (planner output mostly generic)
`REMEDIES` keys are sub-muscle base IDs (31 of 58 subs covered, e.g. `gastrocnemius`, `glute-max`). But atlas taps and the intake wizard flag **parent** IDs (`hamstring-l`, `gluteal-r`), and `session-plan.js` + `RemedyPanel` call `getRemedies(parsedSlug, state)` with that parent slug → empty → "General stretch / release recommended." Confirmed live: a tight hamstring produced zero concrete remedies despite `biceps-femoris` remedies existing.
**Fix (small):** in `getRemedies`, when the base ID is a parent, union remedies across `SUB_MUSCLES[parent]` (and optionally dedupe by type). One function, big product win — this single change makes the planner feel 10× smarter.

### P2 — Correctness & data-integrity risks

| # | Finding | Where |
|---|---|---|
| 1 | `muscleStates` keys are never run through `migrateLegacyId` on hydrate or import (entries, stateChanges, goals all are). A v1/v2 import with legacy keys renders no atlas heat and silently skews plans. | `BodyMapApp.jsx:542,1136` |
| 2 | Side-channel setState pattern: `let next; setX(prev => { next = …; return next; }); use(next)` relies on React eagerly invoking the updater — not a guaranteed contract. Used in 4 places. | `handleSetMuscleState`, `completeOnboarding`, `skipOnboarding`, `upsertGoal` |
| 3 | Skipping onboarding counts as a "meaningful action": a brand-new user who dismisses the wizard instantly has a 1-day streak (confirmed live). Similarly, `intake-complete` and `region-master-*-1` milestones fired from a single muscle tap without ever running intake (confirmed in persisted `milestones[]`). Predicates are too loose; gamification loses meaning. | `skipOnboarding` → `recordMeaningfulAction`; `data/milestones.js` predicates |
| 4 | Import replaces per-field but not atomically: importing a *partial* JSON (e.g. only `entries`) keeps the rest of current state — by design or accident? Undocumented either way; a malformed file can produce a chimera blob. | `importData`, `BodyMapApp.jsx:1124` |
| 5 | 23 ESLint errors including two real smells (`set-state-in-effect` in `MuscleQuickLog.jsx:39` and `SessionPlanner.jsx:407`); the rest are unused vars/imports. Lint is not part of the build gate, so it drifts. | `npx eslint .` |
| 6 | `useBodyBalanceScore` memoizes on `[state]` where `state` is a fresh object literal each render — the memo never hits; the full M1-replay pipeline reruns on every keystroke-level render of `BodyMapApp`. Harmless today, quadratic tomorrow (see P3-perf). | `lib/useBodyBalanceScore.js:41` |

### P3 — Cleanliness, performance, copy

- **Dead code (~1,240 lines):** the entire `body-legacy-disabled` tab (~320 lines of unreachable JSX in `BodyMapApp.jsx:1357–1668`); stale root-level `BodyMapApp.jsx` (919 lines, an old version — still referenced by `tailwind.config.js` `content`!); assorted unused vars flagged by lint.
- **God component:** `BodyMapApp.jsx` is 1,885 lines mixing schema/migration/normalizers (~460 lines), derived analytics (chains, patterns, symmetry — which belong in `src/metrics/`), export/import, and all screen wiring with 12-prop drilling. The persistence layer alone deserves its own module.
- **Performance:** `symmetryIndex` with `trendDays: 30/90` recomputes full M1 replay per trend day → O(trendDays × muscles × windowDays × events). Fine at personal-app scale, but it runs inside render-memos fed by unstable references. Cache per-muscle day-state series once per (stateChanges, window).
- **Bundle:** main chunk 655 kB minified (warning at build). Recharts is already lazy-split (good); the male+female atlas path data and lucide icons dominate. Low priority, but code-split the female atlas until a gender toggle exists (it's imported but no UI exposes `gender`).
- **Copy/UX bugs:** Plan shows **two** "Your goals" panels with contradictory state (suggested-goal card says "Reduce Hamstrings (L)…" while GoalsPanel below says "No active goals yet" — confirmed in screenshot); Body overview says "flagged this week" but counts all-time; Recovery card can read "100% — 1 of 3 resolved" (rate excludes pending, the copy doesn't say so); Calibrate section still says "Coming in Stage 02-B" though 02-B shipped; `index.html` title is the default `bodymap-app`; `README.md` is the untouched Vite template.
- **Doc drift:** `CONTEXT.md` claims "Progress + Plan + Today are fully wired" — Today is not (P1-a/b). CLAUDE.md/legacy docs use Windows-only paths (`c:\phsioclick\...`) that don't hold in this repo layout.

### Architecture — what's genuinely good (keep doing this)

- **`src/metrics/` is exemplary:** pure functions, injected `now`, documented inline doctests, windowing rules stated once in `helpers.js`, named exports for tree-shaking. This is the pattern the rest of the app should converge on.
- **Stable-ID discipline** (`SUB_MUSCLES` base IDs + `LEGACY_ID_MAP` + `migrateLegacyId`) is consistently applied on the event logs.
- **Migration engineering** (v1→v2→v3 with seed events, idempotent re-runs, permissive normalizers) is unusually careful for a side project.
- **Layered data modules** (`data/*.js` with schema versions and typedef'd shapes) make Stage 04 content expansion a pure content task.

### Content coverage (Stage 04 raw material)

| Dataset | Coverage |
|---|---|
| Muscle mechanics | 58/58 sub-muscles ✅ |
| Remedies | 31/58 sub-muscles, **0/24 parent groups** (27 subs have none: all triceps heads, biceps heads, lateral delt, mid-trap, rhomboids, teres, supraspinatus, vastus lat./int., semitendinosus/membranosus, tibialis, scalenes, …) |
| Learn overrides (plain-language) | 11 muscles — everything else gets the visible filler "We're still seeding the action data for this muscle" (confirmed on Abs, a day-one muscle) |
| Female atlas | assets exist (`bodyFemale*.js`) but no gender toggle in any screen — dead weight until Track G |

---

## 5. Game plan

### Phase 0 — Repo health (this commit) ✅
- [x] Restore vendored `dist/`, un-ignore it, build green from fresh clone.
- [x] This audit document.

### Phase 1 — Ship the truth (highest value ÷ effort, ~1 short session each)
1. **Wire Today to real metrics** — pass `bbs.components` + trend into the hero; replace `buildHotRegions` stand-in with M5. *(Fixes the app lying to its most-viewed screen.)*
2. **Parent→sub remedy fallback** in `getRemedies`. *(Instantly upgrades planner output from generic to specific.)*
3. **Lint to zero + delete dead code** — remove the `body-legacy-disabled` block, root `BodyMapApp.jsx` (and its tailwind `content` entry), unused vars; fix the two `set-state-in-effect`s (`intakeTrigger` can be handled in the click handler; `MuscleQuickLog` reset via `key={muscleId}`).
4. **Add vitest + first tests** where they're nearly free: `src/metrics/*` (pure, doctests already written — turn them into real tests) and `migrateBlobToV3` (v1/v2/v3/garbage fixtures). Add `npm test` to the definition of "done" next to the build gate.
5. **Minimal CI** — GitHub Action: install → build → lint → test on push/PR.

### Phase 2 — Product correctness (1–2 sessions)
6. Single goals surface on Plan (merge the suggested-goal card into GoalsPanel; one source of truth).
7. Tighten gamification: skip-onboarding shouldn't start a streak; `intake-complete` should require intake; region mastery level 1 should need more than one tap.
8. Copy pass: "flagged this week", recovery-rate phrasing, "Coming in Stage 02-B", app `<title>`, real README (setup, build gate, vendor note).
9. Run `muscleStates` keys through `migrateLegacyId` on hydrate/import; decide and document partial-import semantics (recommend: validate whole file, all-or-nothing, with a confirm dialog).

### Phase 3 — Architecture hardening (one focused session)
10. Split `BodyMapApp.jsx` (~1,885 → ~400 lines): `src/persistence.js` (schema consts, normalizers, migrate, load/save), move chains/patterns/symmetrySummary derivations into `src/metrics/entries.js` (same pure style), and a `BodyDataProvider` context to end 12-prop drilling.
11. Replace side-channel setState updaters with compute-then-set (`const next = f(current); setX(next); use(next)`).
12. Memoize BBS on `[stateChanges, adherence]`; cache per-muscle day-state series for trend recomputes.
13. Optional: TypeScript (or JSDoc `checkJs`) on `src/metrics/` + `src/data/` first — the pure layers where types pay off immediately.

### Phase 4 — Product expansion (existing roadmap, now unblocked)
14. **Content sprint (Track G / Stage 04):** remedies for the 27 uncovered sub-muscles, learn-overrides beyond 11 muscles (the filler text is user-visible on day one), then female atlas parity + gender toggle.
15. **Stage 03 deeper intelligence** per the stage ledger — the clean metrics layer makes this tractable; keep new intelligence in the same pure-module pattern.

**Suggested order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8, then reassess.** Items 1+2 alone change what the product feels like; items 4+5 stop regressions from ever landing silently again.

---

*Build verified green and all findings reproduced against commit `ad836a0` on 2026-07-05.*
