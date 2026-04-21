# CONVENTIONS.md — Invariants

> Read once. Apply always. Violating these requires explicit user consent.
> This is Layer 3 content that behaves like Layer 0 — it's short enough to internalize and stable enough to be cited by name.

---

## 1. Product scope

**Dot Body Map is not a medical tool.** All outputs are educational / self-coaching / decision-support. Every user-facing plan, hypothesis, or intervention must carry an educational-only disclaimer. Never generate copy that implies diagnosis, prescription, or replacement of in-person care.

## 2. Muscle IDs are the join key

- The **only** valid identifiers for muscles in data files are the `SUB_MUSCLES` base IDs defined in `bodymap-app/src/muscle-data.js` (no `-l`/`-r` suffix at the data layer).
- User-facing selections serialize as `{base-id}-{l|r}` (e.g. `pec-upper-l`, `glute-max-r`).
- Legacy IDs from prior schema versions are mapped by `LEGACY_ID_MAP` and normalized via `migrateLegacyId()`.
- **Do not invent new muscle IDs.** If a new muscle is needed, add it to `SUB_MUSCLES` first, then reference it from downstream data modules.

## 3. Storage schema

- **Key:** `dot-body-map-v3`
- **Current schema version:** `3` (bumped by Stage 02-B / F1, 2026-04-19). Do not bump again in any other stage without explicit user consent — the next bump is owned by whatever stage introduces a new shape, not by ad-hoc edits.
- **Shape (current, schemaVersion 3):**
  ```json
  {
    "schemaVersion": 3,
    "entries": [ ... ],            // includes { kind: "adherence", muscleId, remedyId, timestamp } rows since U8 — kept for back-compat with milestone counters; Stage 02-B / F6 ALSO forks the same event into adherence[] below
    "assessments": [ ... ],
    "muscleStates": { "glute-max-l": { "state": "weak", "updatedAt": "ISO" } },

    "onboarding":  { "completedAt": null, "intent": null, "tourSeen": { "today": false, "body": false, "plan": false, "progress": false } },
    "streak":      { "current": 0, "longest": 0, "lastActiveDate": null },
    "milestones":  [ /* { id, achievedAt } */ ],

    "stateChanges":   [ /* { id, muscleId, fromState, toState, timestamp, source } — append-only flip log; seeded from muscleStates on v2 → v3 migration with source: "migration-seed" */ ],
    "goals":          [ /* still persisted as a literal [] until Stage 02-B / F5 promotes the in-memory U7 goals[] into storage */ ],
    "adherence":      [ /* { id, date, muscleId, remedyKey, remedyTitle, status, source, timestamp } — live as of Stage 02-B / F6; deduped on (date, muscleId, remedyKey); status ∈ "suggested" | "done" | "skipped"; source ∈ "session-planner" | "slide-out" */ ],
    "dailySnapshots": [ /* reserved for future rollups; not yet written */ ]
  }
  ```
- **Authoritative reference:** `_config/storage-schema.md`. F1 already shipped the v2 → v3 migration (`migrateBlobToV3()` in `BodyMapApp.jsx`); the U7+U8 fields are now native to v3, not additive. F6 is the live writer for `adherence[]` (via `BodyMapApp.handleAdherenceChange`, deduped on `date+muscleId+remedyKey`). Stage 02-B / F9 owns the final canonical rewrite of the schema doc.
- **Export/import must include `schemaVersion` and every persisted top-level key.** Bump `schemaVersion` only when changing shape; write a migration in `BodyMapApp.jsx`'s load path.
- **Backward compatibility is mandatory.** `migrateLegacyId()` handles pre-v3 muscle IDs. `migrateBlobToV3()` handles v1/v2 blobs idempotently and is also applied on import. Any future migration must preserve existing user data and survive an Import of an older blob (initialize missing fields with safe defaults).

## 4. Build gate

No work is "done" until `cd c:\phsioclick\bodymap-app && npx vite build` succeeds cleanly. Run the build after:
- any change to `src/data/*`
- any change to `atlas-assets/*` or `muscle-data.js`
- any change to `BodyMapApp.jsx` or the component tree

## 5. Do not break

The following user-visible flows must keep working. After Stage 02-A.5 the legacy "Log/Dashboard/Assessments/Planner" tabs were re-shelved into the four-tab IA (Today / Body / Plan / Progress) — every legacy flow still functions, just inside the new shells.

**Legacy flows (still required):**
- Log entry creation (now lives in the muscle slide-out on Body and as quick-log surfaces on Today / Plan)
- Dashboard content (heat map, timeline, L/R summary, compensation chains, patterns, history) — re-homed inside the **Progress accordion** below the symmetry hero. Every accordion slot must keep rendering.
- Assessments (bilateral tests, asymmetry flags, trends) — accessible from Body / Plan / Progress
- Planner (session / weekly / L/R balance / intake wizard) — `IntakeWizard` is exported from `SessionPlanner.jsx` and reused by `OnboardingFlow.jsx`
- Export JSON / Import JSON — round-trip every persisted top-level key including the U7+U8 additions
- Clinical report export

**New v2 flows (Stage 02-A.5, also required):**
- Four-tab IA (Today / Body / Plan / Progress) + bottom-nav on mobile + header chip slot
- Today screen: Body Balance Score hero (live as of Stage 02-B / F2 — composite of M3 / M4 / M6 / M7 with cold-start at `< 7d` of `stateChanges` history → `score: 50, isCalibrating: true`; M7 component lights up independently as soon as F6 has any `suggested` rows), hot regions, recent activity, empty state
- Body screen: atlas + muscle slide-out + Learn layer. Slide-out Remedies tab seeds `suggested` rows in `adherence[]` for the first six remedies on open (F6) and exposes "Mark done" + "Skip" toggles that round-trip through `handleAdherenceChange`.
- Plan screen: `PlanWeeklySummary` "since last week" micro-summary (F4 — symmetry composite delta, top 3 hot regions, total-flips delta vs prior 7d, dismissible, calibration-aware below 7 days) + WeeklyStrip + GoalCard + Calibrate (intake wizard launch) + plan generation through `lib/session-plan.js`. `SessionBlock` rows now expose "Done" / "Skip" checkbox toggles (F6) that seed and update `adherence[]` per remedy.
- Progress screen: `SymmetryTrendHero` (live M3 composite + delta + 7/30/90-day sparkline as of Stage 02-B / F3) + `SupportingCardsRow` (M4 tightness + M6 recovery live; M7 adherence live as of F6, with independent calibration — lights up whenever `adherence[].suggested > 0` even if other metrics are still cold) + `BelowFoldAccordion` (legacy Dashboard re-home + live M5 hot regions + state-change timeline as of F3; M2 flip-frequency / M9 correlation slots still reserved for F7 / F8). Calibration banner above the hero whenever `stateChangesSpanDays(stateChanges) < 7`.
- Onboarding: six-step `OnboardingFlow` first-run wizard (skippable on every step) + per-tab `TourOverlay` coachmarks (replay/reset from Settings)
- `SettingsDrawer`: Export / Import / Clinical report + Replay tour + Reset onboarding
- Gamification: live `StreakBadge` in the header, `MilestoneToast` queue (reduced-motion aware), milestone catalog + region mastery synthesis, `useBodyBalanceScore()` hook contract (live as of Stage 02-B / F2; cold-start preserved at `< 7d` history)
- Adherence event: marking a remedy "Done" in `MuscleSlideOut` writes `{ kind: "adherence", muscleId, remedyId, timestamp }` into `entries[]` **and** (since F6) forks the same event into `adherence[]` with `status: "done"`. Suggested + skipped statuses live only in `adherence[]`.

**Stable contracts (do not rename):**
- `useBodyBalanceScore()` shape: `{ score, components, isCalibrating }` — every consumer (TodayScreen hero, header chip, future mini-atlas) reads from this single hook. Stage 02-B swaps the body, not the signature.
- `MuscleAtlas.stateColors` map (per-state color tokens) — reused by every muscle-tinted view.
- `lib/session-plan.js` — canonical plan source for Today / Plan / WeeklyStrip / future Progress.
- The Progress slot contracts in `ProgressScreen.jsx` / `SymmetryTrendHero.jsx` / `SupportingCardsRow.jsx` / `BelowFoldAccordion.jsx` are stable. F3 + F6 resolved the symmetry hero, supporting cards (including M7 adherence), and state-change timeline slots. Remaining markers are `TODO(f7-flip-frequency)` / `TODO(f8-correlation)` and name the exact metric ID and source module the owning ticket fills. Do not reshape the slots — fill them.
- `BodyMapApp.handleAdherenceChange(row)` is the **single entry point** for every write to `adherence[]`. It dedupes on `(date, muscleId, remedyKey)`, normalizes muscle IDs through `migrateLegacyId()`, and stamps `source` ∈ `"session-planner" | "slide-out"`. Do not write to `adherence[]` from anywhere else — feed events through this handler so dedup + persistence stay invariant. `SessionPlanner` and the slide-out Remedies tab both call it for both seeding and status flips.
- Local-day keys for adherence rows use `YYYY-MM-DD` in the user's **local** timezone (helpers `isoDayKeyLocal` / `todayKey` / `planTodayKey` in the consuming files). Do not switch to UTC `toISOString().slice(0,10)` — it would shift "today" across midnight in some zones and break dedup.
- The metrics module at `bodymap-app/src/metrics/*` (M1–M9 + `bodyBalanceScore` + helpers + barrel index) is a stable surface as of Stage 02-B / F2. Pure functions only — every function takes raw arrays + `now: Date` + `windowDays`. No `localStorage` reads, no `Date.now()` inside the module. Bilateral aggregates use `splitMuscleId` → `fromMuscleId` from `muscle-data.js` — no string slicing. New metric files added later must follow the same contract.

## 6. Documentation discipline (ICM)

- **New content goes into the layered structure** (`stages/*/output/`, `shared/`, `_config/`). Don't add standalone top-level markdown files.
- **References are read-only** from the stage's perspective. Copy what you need into `output/` rather than mutating references.
- **Stage contracts (`CONTEXT.md`)** always have three sections: Inputs (table), Process, Outputs.
- **Stage handoffs** happen via `output/` folders: stage N's output is stage N+1's input.
- **Legacy docs** (`PROJECT_NOTES.md`, `BODY_MODEL_ROADMAP.md`, `NEXT_CHAT_PROMPT.md`) remain authoritative for comprehensive product / architecture context. Link to them; don't duplicate them.

## 7. Aesthetic

- **Tokens only after U1.** Every color, radius, type size, shadow, and motion duration comes from the Tailwind theme defined in `bodymap-app/tailwind.config.js` (brand teal, `state.tight/weak/balanced`, `radius-10/14/20`, `text-display/h1/h2/body-lg/body/caption/micro`, `shadow-elev-1..elev-weak`, `transition-duration-150/200/400/800`, `ease-standard/entrance/celebration`). **No hex literals. No pre-token rose/cyan classes.** If you reach for a value the tokens don't expose, propose a token addition before hard-coding.
- Dark clinical theme on the atlas (zinc/teal palette, subtle borders). Keep the default unselected atlas fill/stroke neutral — do not introduce bright defaults.
- Body intelligence panels use small, dense, labeled sections with `L0` / `L1` / etc. tags so users learn the layer vocabulary.
- **Tone is curious + reassuring + educational.** Onboarding copy is never diagnostic. Milestone copy is celebratory, never competitive (no "level up", "XP", leaderboards, comparisons). The footer disclaimer is mandatory on every screen.
- **Reduced motion** (`prefers-reduced-motion`) must be respected by every animation that translates / scales (notably `MilestoneToast` and `TourOverlay`).

## 8. Data additions must cite sources in headers

When appending to `relationship-edges.js`, `remedies.js`, or `movements.js`, include a brief comment citing the anatomical / biomechanical reasoning and a confidence tag (`high`/`med`/`low`) where the data module already uses one. Do not seed data "by vibes."

## 9. Git discipline

Working directory is **not** a git repo today. Do not initialize one without explicit user consent. When version control is introduced, commits must pass the build gate first.
