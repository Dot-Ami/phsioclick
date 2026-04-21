# Gamification spec

> Three mechanics: **Body Balance Score** (hero number), **Streak** (daily activity), **Milestones** (named achievements + per-region mastery). Tone is celebratory and curious, never competitive or medical.

---

## Design principles

1. **Reward effort, not outcomes.** Logging a flag is a win. Completing a remedy is a win. Returning a muscle to normal is a bigger win — but no mechanic punishes the absence of those wins.
2. **One hero number.** Body Balance Score is the only score in the app. There is no "level", "XP", "coins" — those framings undercut the educational tone.
3. **Celebrate, then get out of the way.** Toast on hit, dismissed in 4 seconds. Never gate functionality behind a milestone.
4. **No competition with other users.** No leaderboards, no comparisons. The app has one user. Progress is against your past self.
5. **All mechanics derive from existing or already-planned data.** Body Balance Score is a function of Stage 02 metrics. Only `streak` and `milestones` add new persistence (see [`schema-delta.md`](./schema-delta.md)).

---

## 1. Body Balance Score

### Purpose

A single 0-100 number on the Today header and the Today screen hero. Answers "how am I doing right now, in one glance?"

### Formula

```
BodyBalanceScore = round(
    0.40 * symmetryComponent      // M3 composite -> 0..100
  + 0.30 * tightnessComponent     // M4 inverted normalized -> 0..100
  + 0.20 * recoveryComponent      // M6 recovery rate * 100
  + 0.10 * adherenceComponent     // M7 adherence rate * 100
)
```

Stage 02 metric references live in [`stages/02-tracking-metrics/output/plan.md`](../../02-tracking-metrics/output/plan.md) §2.

### Component definitions

All components return a 0-100 number. Higher is better.

#### Symmetry component (40%)

Stage 02 M3 composite is a delta (lower = better). Convert:

```
symmetryComponent = clamp(0, 100, 100 - composite * 5)
```

Composite of 0 (perfect symmetry) -> 100. Composite of 20 (very imbalanced) -> 0. The factor `5` is calibrated against expected real-world ranges; tune in U8 implementation.

#### Tightness component (30%)

Stage 02 M4 normalized tightness is in `[0, 1]` (1 = every muscle flagged every day). Invert:

```
tightnessComponent = clamp(0, 100, (1 - normalizedTightness) * 100)
```

#### Recovery component (20%)

Stage 02 M6 recovery rate is in `[0, 1]`. Direct:

```
recoveryComponent = recoveryRate * 100
```

When `totalFlags === 0` (no flags in window), recovery is undefined. **Default to 50** so a brand-new user doesn't get penalized — the score reflects "neutral, no data."

#### Adherence component (10%)

Stage 02 M7 adherence rate is in `[0, 1]`. Direct:

```
adherenceComponent = adherenceRate * 100
```

When `suggested === 0`, default to 50.

### Cold-start behaviour

A brand-new user with zero history shows a Body Balance Score of `50` (neutral) with the label **"Calibrating"** and copy: *"Your score will fine-tune as you flag muscles, complete remedies, and run assessments."* No tier badge until at least 7 days of `stateChanges` exist.

### Tier labels

Match the design-token gradient stops.

| Score | Tier | Label color | Subtitle copy |
|-------|------|-------------|---------------|
| 0-39 | Recovering | indigo | "You're working on it. Small wins compound." |
| 40-59 | Building | mid | "Things are moving. Keep showing up." |
| 60-79 | Balanced | teal | "You're in a good place. Maintain and refine." |
| 80-100 | Resilient | bright teal | "Strong, balanced, and consistent. Outstanding." |

**No tier ever calls a user "weak", "poor", "low", "bad", "at risk".**

### Trend marker

The hero card shows the score change since 7 days ago: `+3` in `state.balanced` color, `-2` in a muted `text.muted` color (never a warning color). Zero or "not enough history" shows `—`.

### Breakdown chip row

Below the gradient bar, a row of small chips shows each component value:

```
Symmetry 72  Tightness 58  Recovery 64  Adherence 71
```

Tap a chip -> navigate to the relevant Progress widget.

### Computation cadence

Pure derivation, recomputed on every render via `useMemo`. **Not persisted.** Snapshot of "score 7 days ago" comes from re-running the formula against the historical state at that timestamp.

---

## 2. Streak

### Definition

Number of consecutive calendar days (in the user's local time zone) on which the user performed at least one **meaningful action**. A meaningful action is any of:

- Flipped a muscle state (`stateChanges` event with `source: 'manual'` or `'intake-wizard'`)
- Logged a sensation entry
- Saved an assessment
- Checked off a remedy as `done`
- Created or updated a goal

Passive opens don't count. Only the user *doing something* counts.

### Persistence

```jsonc
"streak": {
  "current": 7,
  "longest": 14,
  "lastActiveDate": "2026-04-16"   // local YYYY-MM-DD
}
```

See [`schema-delta.md`](./schema-delta.md). Computed and updated by a `recordActivity()` helper called inside every meaningful-action handler.

### Update logic

On every meaningful action, call `recordActivity(now)`:

```pseudo
today = localDate(now)
last  = streak.lastActiveDate

if last === today:
  no-op   // already counted today
else if last === yesterday:
  current += 1
  longest  = max(longest, current)
  lastActiveDate = today
else if last is null OR earlier than yesterday:
  current = 1
  longest  = max(longest, 1)
  lastActiveDate = today
```

### UI surface

- **Header pill** (all screens): flame icon + `current` number when `current >= 1`. Color: `text.muted` for 1-2 days, `state.tight` (warm amber, used positively here for "fire") for 3-6 days, `brand.primary` for 7+ days.
- **Tap behaviour:** opens a small popover showing current + longest + a 30-day mini calendar with active days highlighted.
- **Streak save grace:** if a user misses a day, do **not** auto-zero. On their next open, show a "Welcome back" toast with the option to "save your streak" (one-time, only if missed days <= 2). This is opt-in friction-relief; not a mechanic that can be gamed because it requires the user to acknowledge the miss.
- **No notifications, no nags.** No "you missed a day" anywhere. Streak is its own reward.

---

## 3. Milestones

### Definition

Named one-time achievements. Each milestone has an `id`, a `label`, an `icon`, a `condition` predicate, and a celebration copy. When condition first becomes true, fire a `MilestoneToast` and append to `milestones[]`.

### Persistence

```jsonc
"milestones": [
  { "id": "first-flip",       "achievedAt": "2026-04-10T18:22:11.014Z" },
  { "id": "streak-7",         "achievedAt": "2026-04-16T08:01:43.108Z" },
  { "id": "first-recovery",   "achievedAt": "2026-04-15T20:18:02.220Z" }
]
```

### Catalog (v1)

| `id` | Label | Icon | Condition |
|------|-------|------|-----------|
| `first-flip` | First flag dropped | `target` | `stateChanges.length === 1` (first manual or intake event) |
| `first-recovery` | First muscle returned to normal | `sparkles` | First `toState === 'normal'` event after a non-normal state |
| `first-remedy-done` | First remedy completed | `check-circle-2` | First `adherence` row with `status === 'done'` |
| `first-assessment` | First assessment logged | `ruler` | `assessments.length === 1` |
| `first-goal` | First goal set | `flag` | `goals.length === 1` |
| `first-goal-hit` | First goal achieved | `trophy` | First `goal.status === 'achieved'` |
| `streak-3` | 3-day streak | `flame` | `streak.current >= 3` (first time) |
| `streak-7` | One-week streak | `flame` | `streak.current >= 7` |
| `streak-30` | One-month streak | `flame` | `streak.current >= 30` |
| `streak-100` | 100-day streak | `flame` | `streak.current >= 100` |
| `intake-complete` | Intake wizard complete | `compass` | `onboarding.completedAt` set |
| `body-explored-10` | Mapped 10 muscles | `map` | `unique(stateChanges.muscleId).length >= 10` |
| `body-explored-30` | Mapped 30 muscles | `map` | `unique(stateChanges.muscleId).length >= 30` |
| `region-master-{regionId}` | Mastered the {regionLabel} region | `award` | See Region mastery below |
| `score-balanced` | Reached "Balanced" tier | `gauge` | `BodyBalanceScore >= 60` first time |
| `score-resilient` | Reached "Resilient" tier | `gauge` | `BodyBalanceScore >= 80` first time |

Catalog is extensible; future milestones append to a single source of truth at `bodymap-app/src/data/milestones.js` (new in U8).

### Celebration UI

`MilestoneToast` slides up from the bottom (mobile) or top-right (desktop) using `motion.celebration` easing.

```
+--------------------------------------------+
| [icon, 32px]  First muscle returned to     |
|               normal!                      |
|               That's the loop working.     |
|                                            |
|  [view milestones] [dismiss x]             |
+--------------------------------------------+
```

Auto-dismiss after 4 seconds unless hovered/touched. Plays a subtle 200ms haptic on mobile (vibration API). No sound — this is a daytime tool used in gyms.

A "Milestones" section in the Settings drawer (and in Progress under "History") lists all achieved milestones with their `achievedAt` timestamps and unachieved ones in a faint outline.

---

## 4. Region mastery

### Definition

Per **body region** (parent slug from `SLUG_META`), a 0-3 mastery level. Levels:

| Level | Name | Condition |
|-------|------|-----------|
| 0 | Unexplored | No interaction with any sub-muscle in this region |
| 1 | Explored | At least one sub-muscle flagged at least once |
| 2 | Working | At least one assessment AND at least one remedy `done` for any sub-muscle in this region |
| 3 | Mastered | All sub-muscles in this region have been flagged at least once AND at least one has reached `recovery` (tight/weak -> normal transition) |

Computed pure from `stateChanges`, `assessments`, `adherence`. **Not persisted.**

### UI surface

- **Inside the Body screen, below the atlas** (in the "Region overview" section):

  ```
  Region mastery
  Hip:        [filled][filled][outline]   Working
  Shoulder:   [filled][outline][outline]  Explored
  Lower back: [outline][outline][outline] Unexplored
  ```

- Tap a region row -> highlight that region's muscles on the atlas.
- Reaching level 2 or 3 fires a `region-master-{regionId}` milestone (one-time per region per level transition).

### Why this mechanic

Solves the user's "I have no idea where to start" problem from a different angle: it gives them a visual map of which body regions they've engaged with, nudging exploration without ever shaming.

---

## 5. Friction guarantees

These are the non-negotiables that keep gamification from becoming hostile:

- **No streak loss notifications.** Ever.
- **No milestone gating** functionality. Every feature is available from day one.
- **No comparative framing.** No "you're in the top 20%", no "average user", no leaderboards.
- **No purchasable currency, badges, or boosts.** This is not a freemium game.
- **No scary words in tier labels.** The lowest tier is "Recovering," not "Poor" or "At Risk."
- **Every celebration is dismissable.** No required acknowledge step.
- **Reduced motion respected.** All celebration animations collapse to a fade per `motion` token honoring `prefers-reduced-motion`.
- **Score is contextualized as self-coaching.** Every Body Balance Score view carries the educational disclaimer somewhere reachable.

---

## Acceptance criteria for Stage 02-A.5 ticket U8

- `recordActivity()` helper updates `streak` correctly on each meaningful action; tested against `last === today / yesterday / older / null` cases.
- Body Balance Score renders correctly for: zero-history user (50, "Calibrating"), 7-day-history user (real number, tier label appears), saturated user (>80, "Resilient" tier).
- All milestones in §3 catalog fire exactly once and persist.
- Region mastery levels transition correctly; level-up fires the appropriate milestone.
- Toast auto-dismisses, respects reduced motion, plays haptic on mobile.
- All new fields round-trip through Stage 02's existing export/import logic.
