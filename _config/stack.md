# Tech stack

| Layer | Tech |
|---|---|
| Framework | React (Vite) |
| Styling | Tailwind CSS |
| Atlas (male) | Patched fork: `BodyAtlas.jsx` + `atlas-assets/bodyFront.js` / `bodyBack.js` |
| Atlas (female) | `atlas-assets/bodyFemaleFront.js` / `bodyFemaleBack.js` — infrastructure patched, SVG splits TBD |
| Charts | Recharts (lazy loaded via `TrendCharts.jsx`) |
| Storage | localStorage JSON blob (`schemaVersion: 3`, key `dot-body-map-v3`) — see `_config/storage-schema.md` |
| Language | JavaScript (JSX) |

**App root:** `c:\phsioclick\bodymap-app`

## Dev commands

```bash
cd c:\phsioclick\bodymap-app
npm run dev        # http://localhost:5173/
npx vite build     # build gate (must pass before "done")
```

## Key source files

| File | Purpose |
|---|---|
| `src/BodyMapApp.jsx` | Main shell: tabs, state, storage load/save, export/import, mobile menu |
| `src/MuscleAtlas.jsx` | Atlas UI: `bodyData` merge, hover labels, unified click → select, recruitment tint |
| `src/BodyAtlas.jsx` | Renders patched SVG paths + divider strokes |
| `src/muscle-data.js` | `SLUG_META`, `SUB_MUSCLES`, atlas maps, `LEGACY_ID_MAP`, helper fns |
| `src/atlas-pointer-utils.js` | Infers L/R from click X vs SVG midline for centerline paths |
| `src/atlas-assets/deltoidDivider.js` | Bezier divider curves (deltoid, chest, trap internal lines) |
| `src/TrendCharts.jsx` | Recharts timeline and assessment charts |
| `src/lib/useBodyBalanceScore.js` | React hook for the Body Balance Score (live as of Stage 02-B / F2; cold-start preserved at `< 7d` history). Stable shape: `{ score, components, isCalibrating }` |
| `src/lib/session-plan.js` | Canonical session/weekly plan source consumed by Today / Plan / WeeklyStrip |
| `src/lib/recordActivity.js` | Daily-action streak updater (writes `streak.{current,longest,lastActiveDate}`) |
| `src/metrics/index.js` | Barrel export for the metrics module — M1–M9 + `bodyBalanceScore` + `helpers`. Pure functions; take raw arrays + `now: Date` + `windowDays`. No `localStorage` reads, no `Date.now()` inside the module |
| `src/ProgressScreen.jsx` + `SymmetryTrendHero.jsx` + `SupportingCardsRow.jsx` + `BelowFoldAccordion.jsx` | Progress screen widgets — slot contracts named in `_core/CONVENTIONS.md` §5 |
| `src/OnboardingFlow.jsx` + `TourOverlay.jsx` + `SettingsDrawer.jsx` + `StreakBadge.jsx` + `MilestoneToast.jsx` | First-run onboarding, per-tab tour, settings drawer, gamification surfaces |

## Metrics module (Stage 02-B / F2)

| File | Metric | Notes |
|---|---|---|
| `src/metrics/helpers.js` | shared utils | `dayKey`, `addDays`, `daysInWindow`, `splitMuscleId` (via `fromMuscleId`), `clamp` |
| `src/metrics/stateHistory.js` | M1 + M2 | `stateDaysFlagged`, `stateDaysFlaggedAll`, `flipFrequency`, `stateChangesSpanDays` |
| `src/metrics/symmetry.js` | M3 | `symmetryIndex` — composite + per-muscle deltas + daily trend |
| `src/metrics/load.js` | M4 | `tightnessWeaknessLoad` |
| `src/metrics/hotRegions.js` | M5 | `hotRegions` — top-N base IDs by flagged days |
| `src/metrics/recovery.js` | M6 | `recoveryRate` |
| `src/metrics/adherence.js` | M7 | `adherenceRate` — reads v3 `adherence[]` log (live once F6 ships) |
| `src/metrics/goals.js` | M8 | `goalProgress` — for the four `kind` values (live once F5 ships) |
| `src/metrics/correlation.js` | M9 | `assessmentStateCorrelation` — accepts an `assessmentDrivers` map (F8 seeds it) |
| `src/metrics/bodyBalanceScore.js` | composite | `computeBodyBalanceScore` — formula per `stages/02a-ux-foundation/output/gamification-spec.md` §1 |

## Body intelligence modules (data)

| File | Layer | Contents |
|---|---|---|
| `src/data/joints.js` | L0 | 9 joint catalog entries with DOF |
| `src/data/muscle-mechanics.js` | L0 | ~55 sub-muscle mechanics (joints, actions, antagonists, synergists) |
| `src/data/relationship-edges.js` | L1 | 32 inter-regional edges (compensation, load-chain, inhibition) |
| `src/data/remedies.js` | L3 | 35 remedy entries for ~25 muscles |
| `src/data/movements.js` | L4 | 10 movements with phase-based recruitment |

## Body intelligence UI panels

| File | Layer |
|---|---|
| `src/MuscleMechanicsPanel.jsx` | L0 |
| `src/RelationshipEdgesPanel.jsx` | L1 |
| `src/MuscleStatePanel.jsx` | L2 |
| `src/RemedyPanel.jsx` | L3 |
| `src/MovementRecruitmentPanel.jsx` | L4 |
| `src/SessionPlanner.jsx` | L5 |
