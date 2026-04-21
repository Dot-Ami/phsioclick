# Onboarding flow

> Six-step first-run wizard plus dismissable per-tab tour overlays. Solves the user's complaint: *"When I spin up this app I have no idea what to do, where to go, how it works."*

---

## Trigger

On every app load, check `localStorage["dot-body-map-v3"].onboarding.completedAt`. If `null`, render the `OnboardingFlow` modal as a full-screen sheet (mobile) or centered dialog (desktop).

User can skip at any step. Skipping sets `onboarding.completedAt = now` and `onboarding.intent = null`. Skipped users see the per-tab tour overlays as soon as they land on each tab; they can replay the full flow from Settings.

---

## Six steps

### Step 1 — Welcome

```
[heart-pulse icon, 64px, brand.primary]

Welcome to Dot Body Map.

This is a personal training tool for understanding
how your body feels and how you're trending over time.

It is not a medical tool. Everything here is
educational and self-coaching only.

[Get started - primary CTA]    [Skip the tour]
```

Persist nothing yet.

### Step 2 — The 30-second body model

```
[stack icon, 32px]

Your body, six layers deep.

This app stacks six layers of intelligence on a
high-resolution anatomical atlas:

  Movement & mechanics  - what each muscle does
  Relationships         - how regions affect each other
  State                 - what's tight, weak, or balanced
  Remedies              - what to do about it
  Movements             - which muscles a lift recruits
  Plan                  - the whole picture, today

You won't need to remember the layers.
We surface what's relevant when you need it.

[Got it - primary CTA]    [< back]
```

Visual: a small stacked-layers diagram with the six layer names. No interaction.

### Step 3 — What brought you here? (Intent picker)

```
What brought you here today?

+----------------------+   +----------------------+
| [target icon]        |   | [scale icon]         |
| I have a tight or    |   | I want to balance my |
| sore area I want to  |   | training - left vs   |
| address              |   | right, push vs pull  |
+----------------------+   +----------------------+

+----------------------+   +----------------------+
| [bandage icon]       |   | [book-open icon]     |
| I'm rehabbing or     |   | I just want to learn |
| working around an    |   | how my body works    |
| old issue            |   |                      |
+----------------------+   +----------------------+

[< back]
```

Single-select. Tap a card -> proceeds to step 4. Persists `onboarding.intent` to one of `tight-area`, `balance-training`, `rehab`, `learn`.

This choice biases later defaults:
- `tight-area` -> step 4 jumps the user into the intake wizard with "what's bothering you?" focus.
- `balance-training` -> intake wizard with "what are you training?" focus.
- `rehab` -> intake wizard with "what's the old issue?" focus + a callout that this app is not medical.
- `learn` -> skips the intake wizard and goes to step 5 (suggested goal) which becomes "Explore your body — flag 5 muscles you want to learn about."

### Step 4 — Quick intake (existing intake wizard, repurposed)

Renders the existing `IntakeWizard` from [`SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx) inside the onboarding sheet, with the intro framing tuned to `onboarding.intent`. The wizard already collects goal, state, and lifts; we reuse it as-is and pipe its output into `muscleStates` via the existing `onSetState` prop.

Intro line above the wizard, parameterized by intent:

| Intent | Intro line |
|--------|------------|
| `tight-area` | "Let's map what's bothering you. We'll ask a few quick questions, then mark those areas on your body." |
| `balance-training` | "Let's get a baseline of your training. We'll ask about your main lifts and where you feel asymmetric." |
| `rehab` | "Let's set the context. Remember: this is not a medical tool. If anything is acute or worsening, see a professional." |
| `learn` | (skipped) |

Skip button always available. If skipped, no states get set; user advances to step 5.

### Step 5 — Set your first goal

Pre-fills a suggested goal based on what step 4 produced.

```
Set your first goal.

Based on what you told us, we suggest:

+--------------------------------------------------+
| [target icon]                                    |
| Reduce left hip flexor tight days by 50%         |
| over the next 30 days.                           |
|                                                  |
| Goals are how you'll see progress over time.     |
| You can change or remove this any time.          |
+--------------------------------------------------+

[Set this goal - primary CTA]    [Skip for now]    [< back]
```

Suggestion logic:
- If at least one muscle is flagged tight -> "Reduce {muscle} tight days by 50% over 30 days" using the muscle with the highest current flagged-day count.
- Else if at least one weak flag -> "Build strength in {muscle} - return to balanced within 60 days."
- Else if intent is `balance-training` -> "Improve symmetry composite from {current} to {current * 0.7} over 60 days."
- Else if intent is `learn` -> "Map and learn about 5 muscles in your body."
- Else -> no suggestion; show "Skip for now" only.

Tapping "Set this goal" creates a `goals[]` row (per Stage 02 §3.3) and fires the `first-goal` milestone (per [`gamification-spec.md`](./gamification-spec.md) §3).

### Step 6 — You're set

```
[sparkles icon, 64px, brand.primary]

You're all set.

Your Today screen will guide you from here.
We'll show you a quick tour the first time you
visit each tab - tap "Got it" to dismiss them.

A reminder: this is a self-coaching tool. It
helps you notice patterns, not diagnose them.

[Take me to Today - primary CTA]
```

On tap: sets `onboarding.completedAt = now`, navigates to Today. The Today tour overlay (next section) auto-fires.

---

## Per-tab tour overlays

After onboarding completes, each top tab fires a one-time tour overlay the first time the user visits it. State persisted in `onboarding.tourSeen[tabName] = true`.

Overlay shape:

```
[ small dimmed scrim, 30% opacity over the rest of the screen ]
[ a single popover anchored to one element, with arrow ]
[ headline + 1-2 lines + Got it ]
```

Single anchor per tab — no multi-step tours. Keep the friction floor at zero.

### Today tour

Anchor: the Body Balance Score hero card.

> **This is your Body Balance Score.**
> One number that tells you how you're trending. Tap it any time to see how it's calculated.
>
> [Got it]

### Body tour

Anchor: the atlas, with a faint pulse on a muscle the user already flagged (or any random muscle if none).

> **Tap any muscle to learn about it and mark how it feels.**
> Tight? Weak? Balanced? Tap, choose, and we'll start tracking.
>
> [Got it]

### Plan tour

Anchor: the Goals card.

> **Goals turn day-to-day flagging into long-term progress.**
> Add or edit a goal here any time. The intake wizard helps if you're not sure where to start.
>
> [Got it]

### Progress tour

Anchor: the symmetry composite trend hero.

> **This is where the story shows up.**
> Symmetry, tightness, recovery — all the patterns the data is finding. Use the window selector to look at a week, a month, or three.
>
> [Got it]

---

## Replay paths

In Settings -> Onboarding:

- **Replay first-run tour** — resets `onboarding.completedAt = null` (does not delete `intent`) and re-renders the wizard on next load.
- **Replay per-tab tours** — resets `onboarding.tourSeen = {}`. The next visit to each tab re-fires its overlay.

---

## Accessibility

- Keyboard navigation through every step (Tab/Shift-Tab/Enter/Escape).
- Screen-reader labels on every icon (decorative icons get `aria-hidden`; meaningful ones get `aria-label`).
- Focus trap inside the wizard sheet; Escape returns focus to the trigger if the user re-opens via Settings.
- Reduced motion: sheet enters via fade only; no slide.

---

## Persistence shape additions

```jsonc
"onboarding": {
  "completedAt": "2026-04-16T10:14:22.418Z",
  "intent": "tight-area",            // "tight-area" | "balance-training" | "rehab" | "learn" | null
  "tourSeen": {
    "today": true,
    "body": false,
    "plan": false,
    "progress": false
  }
}
```

Full delta lives in [`schema-delta.md`](./schema-delta.md). No schema-version bump required.

---

## Acceptance criteria for Stage 02-A.5 ticket U7

- Cold-start (empty `onboarding`) renders the wizard.
- Each step navigates Forward / Back correctly; Skip jumps to step 6 setting `intent = null`.
- Step 4 successfully delegates to existing `IntakeWizard` and pipes its state changes into `muscleStates`.
- Step 5 suggested-goal logic produces the correct suggestion for all four intents and the no-flag edge case.
- Tour overlays fire exactly once per tab and only after `onboarding.completedAt` is set.
- Replay paths in Settings restore state correctly.
- Reduced-motion users see fade-only entrances; keyboard nav works end-to-end.
