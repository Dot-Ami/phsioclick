# Screens — text wireframes

> One screen per top-tab. Plus the Body slide-out, the Settings drawer, and the global header. Density rule: **at most 3 cards above the fold per screen**. Hero answer first; everything else folds below.

Tokens referenced live in [`design-tokens.md`](./design-tokens.md). Re-shelving rationale lives in [`../references/legacy-ia-map.md`](../references/legacy-ia-map.md).

---

## Global header (all screens)

```
+--------------------------------------------------------------+
| [logo] Dot Body Map      [streak: 7d] [score: 64]    [...]   |
+--------------------------------------------------------------+
```

- Logo + wordmark left-aligned.
- **Streak badge** middle-right: small pill, `caption` size, flame icon if `current >= 3`. Tap opens Streak detail in Settings.
- **Score chip** right of streak: shows current Body Balance Score with tier color from gradient. Tap navigates to Progress.
- **Overflow menu** (`MoreHorizontal` icon): opens Settings drawer.

Mobile: streak + score collapse into a single chip showing the higher-priority of the two; overflow stays.

---

## Bottom nav (mobile) / top tabs (desktop)

Four items, in this order, always:

```
[ Today ]  [ Body ]  [ Plan ]  [ Progress ]
```

- Mobile: bottom-fixed nav, 56px tall, icons + labels.
- Desktop: top tabs under header, larger hit area.
- Active item: `brand.primary` underline + `text.primary`; inactive: `text.muted`.
- Default tab on cold launch: **Today**.

---

## Today screen (default landing)

Job: "What should I do right now?"

```
+--------------------------------------------------------------+
| Welcome back, [name or "athlete"].                           |
| Today is Thursday, April 16.                                 |
+--------------------------------------------------------------+
| HERO — Body Balance Score                                    |
| +----------------------------------------------------------+ |
| |    64                                                    | |
| |  ----+----+----+----+   tier: Balanced                  | |
| |     [score gradient bar with marker at 64]              | |
| |   +3 since last week                                     | |
| | [breakdown chip row: Symmetry 72  Tightness 58  ...]    | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
| TODAY'S SESSION                                              |
| +----------------------------------------------------------+ |
| | 4 movements - ~25 min                                    | |
| | 1. Hip flexor stretch (kneeling) - 2x30s                 | |
| | 2. Glute bridge - 3x12                                   | |
| | 3. ... [collapsed - tap to expand]                       | |
| | [start session - primary CTA]                            | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
| HOT REGIONS                       [view all on Body >]       |
| - Left hip flexor    5 tight days  [tap to flag/learn]      |
| - Right shoulder     3 tight days  [tap to flag/learn]      |
| - Lower back         2 weak days   [tap to flag/learn]      |
+--------------------------------------------------------------+
                          [fold below]
| Recent activity                                              |
| - 14:02 Marked left hip flexor as recovering                 |
| - 09:30 Completed kneeling stretch                           |
| - Yesterday 19:45 Symmetry composite improved by 4 points    |
+--------------------------------------------------------------+
```

Above-the-fold cards: **3** (Hero, Today's Session, Hot Regions).

Empty state (no flags yet):

```
[heart-pulse icon]
"Let's start by mapping how you feel."
"Tap Body to flag a tight or weak area, or run the intake wizard."
[Run intake wizard - primary CTA]   [Open Body atlas - secondary]
```

Reuses Stage 02 metrics: M1 (state days flagged), M3 (symmetry), M4 (tightness load), M5 (hot regions). New components: `BodyBalanceScore`, `TodaysSessionCard`, `HotRegionsCard`, `RecentActivityList`.

---

## Body screen

Job: "Show me + teach me."

```
+--------------------------------------------------------------+
| [Front | Back]            [Male / Female]      [Reset view]  |
+--------------------------------------------------------------+
| +----------------------------------------------------------+ |
| |                                                          | |
| |               [ Anatomical atlas SVG ]                   | |
| |               (existing MuscleAtlas)                     | |
| |                                                          | |
| |  state heat: tight=amber, weak=indigo, recovering=teal   | |
| +----------------------------------------------------------+ |
| Legend: tight (amber) | weak (indigo) | recovering (teal)    |
+--------------------------------------------------------------+
                         [fold below]
| Region overview                                              |
| - Most flagged this week: Left hip flexor                    |
| - Most balanced base ID: Right calf                          |
| - Untouched regions: 3 (tap to assess)                       |
+--------------------------------------------------------------+
```

Atlas is the screen. No competing widgets above the fold. Tapping a muscle opens the **Muscle slide-out** (next section).

Mobile: atlas is full-width minus 16px gutter; legend below.
Desktop: atlas centered with `max-w-3xl`, legend left rail.

Empty state: same atlas with a contextual tooltip "Tap any muscle to learn what it does and mark how it feels."

Reuses [`MuscleAtlas.jsx`](../../../bodymap-app/src/MuscleAtlas.jsx) and [`BodyAtlas.jsx`](../../../bodymap-app/src/BodyAtlas.jsx) unchanged. New component: `BodyScreen.jsx` is a thin wrapper.

---

## Muscle slide-out (Body screen child)

Triggered by selecting a muscle on the atlas. Slides up from bottom on mobile (60% height, drag to dismiss), slides in from right on desktop (`max-w-md`).

Sub-tab order, always:

```
+--------------------------------------------------------------+
| [muscle name]  [side: L | R | Both]                   [x]    |
+--------------------------------------------------------------+
| [ Learn ]  [ State ]  [ Mechanics ]  [ Edges ]               |
| [ Remedies ]  [ Movements ]  [ Log ]                         |
+--------------------------------------------------------------+
| [tab content]                                                |
+--------------------------------------------------------------+
```

Default sub-tab on first-ever open: **Learn**. After that, remember last-opened sub-tab in local state (per session, not persisted).

### Learn sub-tab (NEW)

See [`learn-layer-spec.md`](./learn-layer-spec.md) for content model. Layout:

```
[plain-language description, 3-5 sentences, body-lg]

What it does
- bends your shoulder forward
- helps you push and lift overhead

When it acts up
"If this is tight, you might notice ..."
"If this is weak, you might notice ..."

How to test it yourself
[try-this prompt, 1-2 sentences]

Why it matters for your goal
[only shown if a goal references this muscle]
[tap to view goal]
```

### State sub-tab

Three big buttons: **Tight (amber)**, **Weak (indigo)**, **Normal (zinc)**. Active state filled with `state.X.bg` + `state.X.border`. Below: small caption "Last changed 3 days ago" + history micro-sparkline.

### Mechanics / Edges / Movements sub-tabs

Re-skinned existing panels. Each gets a **plain-language summary card on top** before the data table:

```
[plain-language paragraph]
[expand: technical view ↓]
   [existing dense panel content, collapsed by default]
```

### Remedies sub-tab

Re-skinned [`RemedyPanel.jsx`](../../../bodymap-app/src/RemedyPanel.jsx). Each remedy row has:

```
[remedy name]                          [done ✓ / skip]
why this helps: [one-sentence rationale]
[steps, expandable]
```

The `[done ✓]` checkbox writes to `adherence[]` (Stage 02 F6). Checking fires `MilestoneToast` if it's a first-time-this-week.

### Log sub-tab

Compact log form scoped to this muscle. Sensation, intensity, movement context, notes. Pre-fills `originRegion` to this muscle.

---

## Plan screen

Job: "Set up training and goals."

```
+--------------------------------------------------------------+
| THIS WEEK                                                    |
| +----------------------------------------------------------+ |
| | Mon  Tue  Wed  Thu  Fri  Sat  Sun                        | |
| | [✓]  [✓]  [ ]  [today: session]  [ ]  [rest]  [ ]        | |
| | [open weekly plan ↓]                                     | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
| YOUR GOALS                                  [+ new goal]     |
| +----------------------------------------------------------+ |
| | Reduce L-hip-flexor tight days by 50%                    | |
| | [progress ring 38%]   on track   ends in 12 days         | |
| +----------------------------------------------------------+ |
| [+1 more goal collapsed]                                     |
+--------------------------------------------------------------+
                         [fold below]
| Calibrate                                                    |
| - Add an assessment (search tests / starter battery)         |
| - Re-run intake wizard                                       |
| - Update lifts / training context                            |
+--------------------------------------------------------------+
```

Above-the-fold cards: **2** (This Week, Your Goals). Calibration is intentionally below — it's setup, not daily.

Empty state (no week, no goals):

```
[compass icon]
"Let's build your week."
"Run the intake wizard once and we'll suggest a starting plan and a first goal."
[Run intake wizard - primary]
```

Reuses [`SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx) (intake wizard + `buildWeeklyPlan`). New components: `PlanScreen.jsx`, `WeeklyStrip.jsx`, `GoalCard.jsx` (already specced in Stage 02 F5), `CalibrateSection.jsx`.

---

## Progress screen

Job: "How am I doing?"

This is where Stage 02's metrics widgets land (Stage 02-B will fill these in). Slot definitions:

```
+--------------------------------------------------------------+
| HERO — Symmetry composite trend (30-day)                     |
| +----------------------------------------------------------+ |
| | composite: 0.42  -0.08 since last month                  | |
| | [line chart: composite over 30 days]                     | |
| | [window selector: 7 / 30 / 90]                           | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
| Tightness load   |   Recovery rate   |   Adherence rate     |
| 12 day-units     |   58% (7 of 12)   |   71% this week      |
| [mini bar]       |   [donut]         |   [mini bar]         |
+--------------------------------------------------------------+
                         [fold below]
| Hot regions (top 5)                                          |
| Flip frequency (top 10 muscles)                              |
| Assessment trends (line chart per testKey)                   |
| State-change timeline (per-day bar chart)                    |
| Patterns (existing chains list)                              |
| History (entries list)                                       |
+--------------------------------------------------------------+
```

Above-the-fold: **1 hero + 3 supporting cards** (4 cards but in a hero+row structure). Window selector at top of hero applies to all charts in this screen.

Below the fold: a stacked accordion of every other Stage 02 metric widget. Default-collapsed; user expands what they want.

Reuses Stage 02 F2 metrics + F3/F7/F8 widgets (delivered in Stage 02-B). New shell component: `ProgressScreen.jsx`.

Empty state:

```
[chart icon]
"Your progress story starts with one flag."
"Mark a tight or weak muscle on the Body atlas to begin."
[Open Body atlas - primary]
```

---

## Settings drawer (overflow menu, all screens)

```
+--------------------------------------------------------------+
| Settings                                              [x]    |
+--------------------------------------------------------------+
| Atlas                                                        |
|   - Default view: [Front] [Back]                             |
|   - Body model: [Male] [Female]                              |
|                                                              |
| Tracking                                                     |
|   - Daily snapshot on first open: [toggle]                   |
|                                                              |
| Onboarding                                                   |
|   - Replay first-run tour                                    |
|   - Replay per-tab tour                                      |
|                                                              |
| Data                                                         |
|   - Export JSON                                              |
|   - Import JSON                                              |
|   - Clinical report                                          |
|                                                              |
| About                                                        |
|   - Version, disclaimer, attribution                         |
+--------------------------------------------------------------+
```

Reuses existing export/import/clinical-report logic from `BodyMapApp.jsx` mobile menu (lines 1227-1244) — same handlers, new home.

---

## Cross-screen rules

1. **One hero per screen.** No screen has two competing focal points.
2. **No more than 3 cards above the fold** (hero counts as 1).
3. **Empty states always show:** icon + headline + supporting line + one primary CTA.
4. **Layer tags (L0/L1/...)** appear only inside the Muscle slide-out's Mechanics/Edges sub-tabs, never on the main screens. The user shouldn't have to learn the layer vocabulary to use the app.
5. **Disclaimer** stays in footer on every screen, exactly as in [`BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) lines 1219-1224.
6. **Mobile-first.** Every screen must function with one thumb. Bottom nav stays reachable. Slide-out is bottom-anchored on mobile.
7. **No new tabs.** If a future feature doesn't fit one of the four jobs, it goes inside Settings or as a sub-tab in Body's slide-out.

---

## Reuse-vs-replace summary

| Existing | New home | Reused as-is | Re-skinned | Replaced |
|----------|----------|--------------|------------|----------|
| `MuscleAtlas` | Body | ✅ | | |
| `BodyAtlas` | Body | ✅ | | |
| `MuscleStatePanel` | Body slide-out / State | | ✅ | |
| `MuscleMechanicsPanel` | Body slide-out / Mechanics | | ✅ + plain-language top | |
| `RelationshipEdgesPanel` | Body slide-out / Edges | | ✅ + plain-language top | |
| `RemedyPanel` | Body slide-out / Remedies | | ✅ + adherence checkbox | |
| `MovementRecruitmentPanel` | Body slide-out / Movements | | ✅ + plain-language top | |
| `SessionPlanner` (intake + weekly + session) | Plan + Today | | ✅ split + re-skin | |
| `SessionPlanner` (symmetry view) | Progress | | ✅ moved | |
| `TrendCharts` | Progress | | ✅ + new chart variants | |
| Log form | Body slide-out / Log + Today quick-log | | ✅ moved | |
| Dashboard 5-stat grid | Progress hero + 3 cards | | | ✅ replaced |
| 4-pill tab nav | Bottom nav + top tabs | | | ✅ replaced |
| Mobile menu (Export/Import/Report) | Settings drawer | | ✅ moved | |
