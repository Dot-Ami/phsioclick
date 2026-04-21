# Legacy IA map — where every current piece lives

> Re-shelving inventory. Lists every tab, panel, state, and storage field in v1 and shows where it lands in the new four-tab IA. Used by `screens.md` and the U1-U8 tickets.

---

## Current 4-tab structure

Source: [`bodymap-app/src/BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) lines 621-1217.

| Tab | Lines | Contents |
|-----|-------|----------|
| `log` (default) | 636-945, 1227-1244 | Atlas + origin/sensation pickers + log form + entries list + mobile menu (Export/Import/Report) |
| `dashboard` | 947-1125 | 5-card stat grid + filters + chains list + timeline chart + symmetry summary |
| `assessments` | 1127-1212 | Assessment input form + assessment list + assessment trend chart |
| `planner` | 1213-1217 | [`SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx) (intake wizard + session/weekly/symmetry views) |

---

## Component inventory

| Component | File | Layer | Used by |
|-----------|------|-------|---------|
| `BodyMapApp` | [`BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) | shell | All tabs |
| `MuscleAtlas` | [`MuscleAtlas.jsx`](../../../bodymap-app/src/MuscleAtlas.jsx) | atlas | Log tab + recruitment tint |
| `BodyAtlas` | [`BodyAtlas.jsx`](../../../bodymap-app/src/BodyAtlas.jsx) | atlas | `MuscleAtlas` |
| `MuscleMechanicsPanel` | [`MuscleMechanicsPanel.jsx`](../../../bodymap-app/src/MuscleMechanicsPanel.jsx) | L0 | Log tab side panel |
| `RelationshipEdgesPanel` | [`RelationshipEdgesPanel.jsx`](../../../bodymap-app/src/RelationshipEdgesPanel.jsx) | L1 | Log tab side panel |
| `MuscleStatePanel` | [`MuscleStatePanel.jsx`](../../../bodymap-app/src/MuscleStatePanel.jsx) | L2 | Log tab side panel |
| `RemedyPanel` | [`RemedyPanel.jsx`](../../../bodymap-app/src/RemedyPanel.jsx) | L3 | Log tab side panel |
| `MovementRecruitmentPanel` | [`MovementRecruitmentPanel.jsx`](../../../bodymap-app/src/MovementRecruitmentPanel.jsx) | L4 | Log tab side panel |
| `SessionPlanner` | [`SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx) | L5 | Planner tab |
| `TrendCharts` | [`TrendCharts.jsx`](../../../bodymap-app/src/TrendCharts.jsx) | charts | Dashboard + Assessments |

---

## State inventory

Lives in `BodyMapApp.jsx`, persisted to `localStorage["dot-body-map-v3"]` per [`_config/storage-schema.md`](../../../_config/storage-schema.md).

| State | Source of truth | Used by |
|-------|-----------------|---------|
| `tab` | local | Tab routing |
| `view` (front/back) | local | Atlas |
| `pickMode` | local | Log atlas selection |
| `form` | local | Log entry form |
| `entries[]` | localStorage | Log list, dashboard charts, chains |
| `assessments[]` | localStorage | Assessments list, trends |
| `muscleStates{}` | localStorage | Atlas heat, all L2-L5 panels |
| `recruitmentTint` | local (derived) | Atlas overlay during movement playback |
| `mobileMenuOpen` | local | Bottom mobile menu |
| `assessmentForm`, `assessmentSearch` | local | Assessments tab |

Stage 02's plan adds: `stateChanges[]`, `goals[]`, `adherence[]`, `dailySnapshots[]` (all in same blob, schema -> v3).

Stage 02-A adds: `streak{}`, `milestones[]` (see `output/schema-delta.md`).

---

## Re-shelving map: legacy -> new IA

The new IA is **Today / Body / Plan / Progress**. Every current piece moves into one of those four homes.

### `log` tab disassembled

| Current piece | Lines | Goes to |
|---------------|-------|---------|
| Atlas (front/back, click-to-pick) | 638-665 | **Body** (becomes the primary content of the Body tab) |
| Pick-mode buttons (Origin / Sensation / Log Again) | 666-679 | **Body** (re-styled as a contextual mode selector inside the muscle slide-out) |
| Log entry form (sensation, intensity, movement, notes) | rest of section | **Body** (slide-out "Log" sub-tab when a muscle is selected) + **Today** (quick-log shortcut) |
| Entries list | within section | **Progress** (history view) + **Today** (recent activity card) |
| Mobile menu (Export/Import/Report) | 1227-1244 | **Settings** drawer reachable from any tab via header overflow menu |

### `dashboard` tab disassembled

| Current piece | Lines | Goes to |
|---------------|-------|---------|
| 5-card stat grid | 949-973 | **Progress** (replaced by Body Balance Score hero + 3 supporting cards per density rule) |
| "Symmetry Snapshot" card | 966-972 | **Today** (rolled into Body Balance Score breakdown) + **Progress** (full symmetry trend) |
| Filters block | 975+ | **Progress** (collapsible, not above-fold) |
| Chains list | within section | **Progress** ("Patterns" card) |
| Timeline chart | within section | **Progress** ("History" deep-dive) |
| Heat-map render | within section | **Body** (the atlas IS the heat map; no separate widget needed) |

### `assessments` tab disassembled

| Current piece | Lines | Goes to |
|---------------|-------|---------|
| Assessment input form | 1127-1200 | **Plan** ("Calibrate" sub-section: starter battery + add custom) |
| Assessment list | within section | **Plan** + **Progress** (trend) |
| Assessment trend chart | 1205-1210 | **Progress** ("Assessment trend" card) + **Body** (when a muscle is selected, show the assessments that drive it via Stage 02 §M9 `assessmentDrivers`) |

### `planner` tab disassembled

| Current piece | Goes to |
|---------------|---------|
| `SessionPlanner` intake wizard | **Plan** (entry point) + **Onboarding flow** (first-run also runs intake) |
| Today's session view | **Today** (hero session card) |
| Weekly plan view | **Plan** (default sub-view) |
| Symmetry view | **Progress** (rolled into the Symmetry trend card) |
| `onSetState` flip handler | **Body** (every muscle slide-out has a State control that calls this) + **Today** (quick flip from "hot regions" card) |

### Atlas + L0-L5 panels

These all live inside the **Body** tab. The atlas is the persistent canvas; tapping a muscle opens a slide-out with sub-tabs in this exact order:

1. **Learn** (NEW, sourced from L0/L1 in plain language — see `output/learn-layer-spec.md`)
2. **State** (L2 — current `MuscleStatePanel` re-skinned)
3. **Mechanics** (L0 — current `MuscleMechanicsPanel` re-skinned with plain-language section above the data table)
4. **Edges** (L1 — current `RelationshipEdgesPanel` re-skinned)
5. **Remedies** (L3 — current `RemedyPanel` re-skinned + adherence checkbox per remedy from Stage 02 F6)
6. **Movements** (L4 — current `MovementRecruitmentPanel` re-skinned)
7. **Log** (move log form here so logging is in-context to a selected muscle)

### Settings (new, not a tab)

A header overflow menu reachable from any tab. Houses:

- Export JSON / Import JSON / Clinical report (from current Log tab mobile menu)
- Atlas: front/back default, male/female (current top-of-Log buttons)
- Daily-snapshot opt-in toggle (Stage 02 schema feature)
- Onboarding tour: replay
- About / disclaimer (link)

---

## What is reused vs replaced

**Reused as-is (logic only; visuals get new tokens):**

- [`MuscleAtlas.jsx`](../../../bodymap-app/src/MuscleAtlas.jsx) — interaction model is good
- [`BodyAtlas.jsx`](../../../bodymap-app/src/BodyAtlas.jsx) — SVG rendering
- [`SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx) — intake wizard, weekly plan, session plan logic
- All L0-L5 panel components — re-skinned with new tokens, plain-language wrapper added; data layer unchanged

**Replaced wholesale:**

- The four-pill tab nav in `BodyMapApp.jsx` lines 620-633 — becomes a four-item bottom nav on mobile + top nav on desktop
- The Log tab as a "default landing" — becomes Today
- The 5-card Dashboard stat grid lines 949-973 — replaced by Body Balance Score hero + 3 supporting cards on Progress
- The Log tab side panel that bundles all L0-L5 panels at once — replaced by a focused slide-out triggered by muscle selection on Body

**Net component additions (delivered in Stage 02-A.5):**

- `TodayScreen.jsx` (new)
- `BodyScreen.jsx` (new — wraps `MuscleAtlas` + slide-out)
- `PlanScreen.jsx` (new — wraps `SessionPlanner` + assessment calibration)
- `ProgressScreen.jsx` (new — hosts Stage 02 metrics widgets)
- `MuscleSlideOut.jsx` (new — sub-tab container around the L0-L5 panels)
- `LearnPanel.jsx` (new — plain-language teaching content per muscle)
- `BodyBalanceScore.jsx` (new — derived hero number with tier label and breakdown)
- `StreakBadge.jsx` (new — small persistent header element)
- `MilestoneToast.jsx` (new — celebration on milestone hit)
- `OnboardingFlow.jsx` (new — six-step first-run wizard)
- `SettingsDrawer.jsx` (new — overflow menu)

---

## Storage keys touched by Stage 02-A

Same `dot-body-map-v3` blob, no new schema version bump (Stage 02 already plans to bump to v3). New fields per `output/schema-delta.md`:

```diff
 {
   "schemaVersion": 3,
   "entries": [...],
   "assessments": [...],
   "muscleStates": {...},
   "stateChanges": [...],
   "goals": [...],
   "adherence": [...],
   "dailySnapshots": [...],
+  "streak":     { "current": 0, "longest": 0, "lastActiveDate": null },
+  "milestones": [{ "id": "first-flip", "achievedAt": "ISO" }],
+  "onboarding": { "completedAt": null, "intent": null, "tourSeen": {} }
 }
```

`onboarding` is the third small addition needed to power the first-run wizard's "have we seen this before?" check and per-tab tour-overlay dismiss state.
