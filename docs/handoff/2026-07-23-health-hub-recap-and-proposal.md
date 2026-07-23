# Recap & Proposal: Dot Body Map → Whole-Health Hub (2026-07-23)

> Requested by Alex: full honest recap of the project (context files, routing/hooks,
> how it works today, task log), plus a proposal for expanding scope to **all of my
> health** — diet first, blood results later once security is worthy of them.

---

## 1. Where we left off

- **Phase 1 of `PROGRAM_AUDIT.md` is complete and merged to `main`** (commits `9d0f1d6`, `8a83cf5`, handoff `69b3fbd`, 2026-07-04).
- Verified green today (2026-07-23) on a fresh clone: `npm test` → **52/52 tests pass**, `npx vite build` → passes (one chunk-size warning, known/low priority), CI workflow exists at `.github/workflows/ci.yml`.
- Today screen shows **live** Body Balance Score + trend and real M5 hot regions; remedy parent→sub fallback works; lint is at zero; dead root `BodyMapApp.jsx` is gone.
- **Phases 2–4 of the audit are still open** (see §5 task log).
- ICM stage ledger: Stages 01, 02, 02-A, 02-A.5, 02-B all shipped. Stage 03 (deeper intelligence) and 04 (content expansion) queued. No stage currently active.

## 2. Context-file map (what reads what)

| File | Layer | What it does | Health check |
|---|---|---|---|
| `CLAUDE.md` | 0 | Agent identity, non-negotiables (stable IDs, schema v3, build gate, not-medical) | ✅ accurate; still uses Windows paths (`c:\phsioclick`) that don't hold in this repo layout |
| `CONTEXT.md` | 1 | Stage routing + ledger + where things live | ⚠️ says "no active stage"; predates the July audit — doesn't mention `PROGRAM_AUDIT.md` phases as the de-facto active work |
| `_core/CONVENTIONS.md` | — | Invariants read-once-apply-always | ✅ |
| `_config/`, `shared/` | 3 | Tech stack, storage schema, body-model reference, glossary | ✅ |
| `stages/NN-*/CONTEXT.md` + `output/` | 2/4 | Per-stage contracts and receipts (completion logs are the real history) | ✅ |
| `PROJECT_NOTES.md`, `BODY_MODEL_ROADMAP.md`, `NEXT_CHAT_PROMPT.md` | legacy | Pre-ICM comprehensive docs | still authoritative, being migrated |
| `PROGRAM_AUDIT.md` | — | 2026-07-05 full audit + 4-phase game plan | **the live to-do list**; Phase 1 done, 2–4 open |
| `docs/handoff/*.md` | — | Session handoffs | this file is the newest |

**Honest note:** the ICM layer docs are good, but the *actual* current state lives in `PROGRAM_AUDIT.md` + `docs/handoff/`. `CONTEXT.md`'s "Active stage" pointer should be updated to point at the audit phases (small doc fix, queued in §5).

## 3. Routing & hooks — how the app is actually wired

**There is no router.** No `react-router`, no URL-based routes. Navigation is one line of state:

- `src/BodyMapApp.jsx:358` — `const [tab, setTab] = useState("today")` drives conditional renders of the four screens (`today` / `body` / `plan` / `progress`) plus top-nav and bottom-nav bars.
- Consequences: no deep links, browser back button does nothing, refresh always lands on Today. Fine for a personal SPA; worth adding hash-based routes when this becomes a multi-domain hub (a "share me this exact view" link is useful once diet/labs tabs exist).

**Component tree:** `main.jsx` → `BodyMapApp.jsx` (**1,346 lines** — the god component; down from 1,885 but still the place where everything meets) → screen components (`TodayScreen`, `BodyScreen`, `PlanScreen`, `ProgressScreen`) → panels/cards. State flows down via **prop drilling** (~12 props deep in places); there is **no context provider** yet.

**Hooks inventory:**

- `src/lib/useBodyBalanceScore.js` — the **only custom hook**. Wraps the M1-replay → component-scores → composite pipeline. Known flaw (audit P2-6): it memoizes on a fresh object literal each render, so the memo never hits.
- ~31 `useState`/`useEffect`/`useMemo`/`useCallback` calls inside `BodyMapApp.jsx` cover: hydration from localStorage (`dot-body-map-v3`), persistence-on-change, all domain state (`entries`, `assessments`, `muscleStates`, `stateChanges`, `goals`, `adherence`, `streak`, `milestones`, `onboarding`), and derived analytics.
- `src/metrics/` (M1–M9 + BBS) is the exemplary layer: pure functions, injected `now`, real tests. **Not hooks** — deliberately framework-free, which is exactly why they're testable.
- `src/lib/` — `session-plan.js` (L5 planner), `checkMilestones.js`, `recordActivity.js`, `regionMastery.js`, `suggestFirstGoal.js` — pure helpers called from the god component.

**Improvement path (already specced as audit Phase 3):** extract `src/persistence.js` (schema consts, normalizers, migrate, load/save), move derived analytics into `src/metrics/entries.js`, and introduce a `BodyDataProvider` context to end prop drilling. **This is the prerequisite for the health-hub expansion** — new domains (nutrition, labs) should never be added to a 1,346-line component.

## 4. How the practice works right now (the core loop)

1. **Onboard** — six-step wizard (skippable) + per-tab tour overlays.
2. **Flag** — tap a muscle on the atlas (Body tab) → slide-out with Learn / State / Mechanics / Edges / Remedies → mark **tight** or **weak**. Writes `muscleStates`, appends an immutable `stateChanges` event, bumps streak, fires milestones.
3. **Plan** — L5 planner turns flags into a session (tight → release/stretch, weak → activate/strengthen) with real remedies (parent→sub fallback works since Phase 1), weekly summary, goals panel, adherence checkboxes.
4. **See truth** — Today: live Body Balance Score + trend + M5 hot regions + session summary. Progress: M3 symmetry trend hero (7/30/90d), M4 tightness load, M6 recovery, M7 adherence, deeper widgets in accordion.
5. **Own your data** — export/import JSON, clinical-report markdown. Everything is one localStorage blob (`dot-body-map-v3`); no server, no account, no network calls.

The 6-layer body-intelligence stack (L0 mechanics → L5 planner) is real and live; all four tabs render with zero console errors.

## 5. Task log — what works, what doesn't, what's next

### ✅ Done & verified
- [x] Repo builds from fresh clone (vendor dist restored) — P0
- [x] Today wired to live BBS/trend + real M5 hot regions — P1-a/b
- [x] Remedy parent→sub fallback — P1-c
- [x] Lint zero; dead code removed (root `BodyMapApp.jsx`, legacy tab)
- [x] Vitest: 52 tests over `src/metrics/*` + `migrateBlobToV3`
- [x] CI: lint → test → build on push/PR to main

### ⚠️ Known-broken / open (audit Phase 2 — product correctness)
- [ ] `muscleStates` **keys** never run through `migrateLegacyId` on hydrate (`BodyMapApp.jsx:401`) or import (`:903`) — a legacy import renders no atlas heat *(verified still open today)*
- [ ] Two "Your goals" surfaces on Plan with contradictory state — merge into one
- [ ] Gamification too loose: skipping onboarding starts a streak; `intake-complete` fires without intake; region mastery L1 from one tap
- [ ] Import is per-field, not atomic — partial/malformed JSON can produce a chimera blob; decide all-or-nothing + confirm dialog
- [ ] Copy bugs *(verified still present)*: `CalibrateSection.jsx:95` says "Coming in Stage 02-B" (02-B shipped); `BodyScreen.jsx:182` "flagged this week" counts all-time; recovery-rate phrasing; `index.html` title; template README

### 🔧 Open (audit Phase 3 — architecture)
- [ ] Split `BodyMapApp.jsx` → `src/persistence.js` + metrics moves + `BodyDataProvider`
- [ ] Replace side-channel setState updaters (4 places) with compute-then-set
- [ ] Fix `useBodyBalanceScore` memo key; cache per-muscle day-state series
- [ ] Optional: types (JSDoc `checkJs`) on `src/metrics/` + `src/data/`

### 📦 Open (audit Phase 4 — content)
- [ ] Remedies: 31/58 sub-muscles covered, 27 have none
- [ ] Learn overrides: only 11 muscles; visible filler text everywhere else
- [ ] Female atlas: assets shipped but no gender toggle (dead weight until Track G)

### 📄 Doc drift
- [ ] `CONTEXT.md` active-stage pointer → point at audit phases / next stage
- [ ] Windows-only paths in CLAUDE.md/legacy docs

## 6. Seeing it on your phone

The cloud dev server in agent sessions isn't reachable from a phone. Real options, best first:

1. **Static hosting + PWA (recommended).** The app is 100% client-side, so a static deploy of `dist/` *is* the full app. Add a deploy workflow (GitHub Pages or Vercel git-integration) so every push to `main` updates a URL you open on your phone. Then add a **PWA manifest + service worker** so it installs to your home screen and works offline — it stops being "a website" and becomes your health app.
2. **Local network:** on a computer, `npm run dev -- --host` and open the LAN URL from your phone (same Wi-Fi).

**Caveat that matters for the hub direction:** localStorage is per-device-per-browser. Phone data and desktop data will be *separate universes* until we add sync (see §7.4). Export/import JSON is the manual bridge in the meantime.

## 7. Proposal: from Body Map to Whole-Health Hub

Direction confirmed 2026-07-23: not a pivot — the physiology core stays (and keeps making recommendations). We're widening the lens to **all health inputs**: diet now, blood results when security earns it.

### 7.1 Principles (carry forward what already works)
- **Event-log + pure-metrics pattern everywhere.** `stateChanges` → add `nutritionLog`, `biomarkerReadings`, `bodyMetrics` as append-only logs; new metrics live in `src/metrics/` as pure, tested functions. This pattern is the project's best asset — new domains inherit it, never bypass it.
- **Stable IDs for every domain.** Like `SUB_MUSCLES` base IDs: a curated nutrient/food-group ID list and a curated biomarker ID list (e.g. `hba1c`, `ldl-c`, `ferritin`, `vitamin-d`, `testosterone-total`) — never free-text keys.
- **Local-first, no third parties.** Health data never leaves the device by default. Sync, if ever, is opt-in and end-to-end encrypted.
- **Still not a medical tool.** Biomarkers displayed against published reference ranges with trends — educational/decision-support framing, disclaimer everywhere, and *stronger* wording on the labs surface ("discuss with your clinician").

### 7.2 Schema v4 (additive, same migration discipline)
`dot-body-map-v3` → `dot-health-hub-v4` via `migrateBlobToV4` (idempotent, permissive normalizers, `migrateLegacyId`-style key stability):
- `nutritionLog[]` — `{ date, mealType, items[], protein, energy, notes, source }`
- `nutritionTargets` — protein/energy/hydration targets (can be derived from training load)
- `biomarkerReadings[]` — `{ biomarkerId, value, unit, drawDate, labName?, enteredAt }`
- `bodyMetrics[]` — `{ date, weight?, sleepHours?, restingHr?, … }` (cheap to add, huge for correlations)

### 7.3 Diet track (Stage 05 — first new domain)
- **v1 = friction-minimal logging:** meal-level entries with a small food-group/portion vocabulary + protein estimate. No barcode scanning, no 40-field forms — the enemy of a diet log is friction.
- **Metrics M10–M12:** protein adherence vs. target, energy trend, consistency streak — same windowing rules as `helpers.js`.
- **Cross-domain intelligence (the payoff):** planner-aware targets ("heavy leg session planned → protein target bumps"), and correlation of nutrition adherence with M6 recovery — this is where the hub becomes smarter than the sum of its tabs.
- Today screen evolves into the whole-health dashboard: BBS + nutrition adherence + recovery + streak.

### 7.4 Security ladder (gates before blood data)
Current honest posture: **plaintext localStorage, no lock, exports contain everything.** Fine for muscle flags; not worthy of labs. Ship in order, each gate before the next data tier:
1. **App lock** — PIN/passphrase, optional WebAuthn (Face ID / fingerprint via platform authenticator on the PWA).
2. **Encryption at rest** — WebCrypto AES-GCM, key derived from passphrase (PBKDF2/Argon2); blob unreadable without unlock.
3. **Export tiers** — default export *excludes* biomarkers; explicit "include sensitive" toggle with warning; clinical report gets a redaction option.
4. **No-network guarantee** — CSP with no external connect-src; make "your data never leaves this device" a *verifiable* claim, stated in Settings.
5. *(Only then, if wanted)* **opt-in E2E-encrypted sync** to solve the phone↔desktop split — client-side encrypted before upload, server sees ciphertext only.

### 7.5 Blood results track (Stage 06 — after the ladder)
- **Phase A: manual entry** of a curated panel (lipids, HbA1c/glucose, CBC basics, ferritin/iron, vitamin D, thyroid, hormones) with units, reference ranges, draw dates → trend charts + "changed since last draw" view.
- **Phase B: PDF import** — parse lab PDFs *locally in the browser* (no upload) to prefill Phase A forms; user confirms every value.
- **Physiology tie-ins** stay educational: e.g. low ferritin + falling M6 recovery → "worth discussing fatigue with your clinician", vitamin D + training-load context. Correlations shown, causation never claimed.

### 7.6 Proposed order of operations
| # | Work | Why first | Size |
|---|---|---|---|
| 1 | Audit Phase 2 (correctness + copy + import atomicity) | Trust before new data domains | ~1–2 sessions |
| 2 | Audit Phase 3 (persistence split + provider + memo fixes) | Structural prerequisite for v4 schema & new tabs | 1 focused session |
| 3 | Deploy + PWA (auto-deploy on push, manifest, offline) | Phone access — the thing that makes it a daily-use app | ~1 session |
| 4 | Security ladder steps 1–2 (lock + encryption at rest) | Gate for everything sensitive | ~1 session |
| 5 | Stage 05: nutrition (schema v4, logging, M10–M12, Today integration) | The confirmed next domain | 2–3 sessions |
| 6 | Security steps 3–4, then Stage 06: biomarkers Phase A | Only after the ladder | 2 sessions |
| 7 | Reassess: Stage 03 (deeper intelligence) & 04 (content) fold into hub roadmap | — | — |

Naming: suggest the ICM ledger gains **Stage 05 — Nutrition** and **Stage 06 — Biomarkers**, with Stage 03/04 kept but re-sequenced. Product name can stay Dot Body Map or become **Dot Health Hub** with Body Map as its flagship tab — user's call.

---

*Repo state verified 2026-07-23 against `main` (`69b3fbd`): 52/52 tests, build green, lint zero.*
