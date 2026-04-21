# Learn layer spec

> The "Learn" sub-tab inside the Body slide-out. Turns clinical anatomy data into plain-language teaching. Sourced from existing L0 / L1 / L3 data; never invents new facts.

Referenced by [`screens.md`](./screens.md) "Muscle slide-out / Learn sub-tab" section.

---

## Why this exists

The user's complaint: *"It also doesn't teach me anything about my body. Like, I have no clue what I'm looking at, why I'm looking at and/or how to assess this."*

The data already exists in [`muscle-mechanics.js`](../../../bodymap-app/src/data/muscle-mechanics.js), [`relationship-edges.js`](../../../bodymap-app/src/data/relationship-edges.js), and [`remedies.js`](../../../bodymap-app/src/data/remedies.js). The current panels render it as a clinical reference sheet ("Joints crossed: shoulder, elbow. Actions: flexion, extension. Plane: sagittal."). The Learn layer rewrites that same data in second-person plain language and adds a "why this matters to you" hook when a goal references the muscle.

---

## Content model

Every muscle gets one Learn record. Records derive from existing data — no manual seeding required for v1, though a small `learn-overrides.js` allows hand-tuning the highest-traffic muscles.

```ts
type LearnContent = {
  muscleId: string;            // SUB_MUSCLES base id
  description: string;         // 3-5 sentence plain-language overview
  whatItDoes: string[];        // 2-4 bullets, action verbs in second person
  whenItActsUp: {
    tight: string;             // "If this is tight, you might notice ..."
    weak:  string;             // "If this is weak, you might notice ..."
  };
  howToTest: string;           // 1-2 sentence prompt the user can try right now
  goalHook?: {                 // present only if a goal references this muscleId
    goalId: string;
    goalLabel: string;
    progressPct: number;
  };
};
```

### Where each field comes from

| Field | Source |
|-------|--------|
| `description` | Combination of `SUB_MUSCLES[id].label`, `SUB_MUSCLES[id].notes`, and the muscle's `joints` + primary `actions` from [`muscle-mechanics.js`](../../../bodymap-app/src/data/muscle-mechanics.js), rewritten via the templates below. |
| `whatItDoes` | `muscle-mechanics.js` actions, mapped to verbs via `ACTION_VERBS` lookup (new tiny file). |
| `whenItActsUp.tight` | [`relationship-edges.js`](../../../bodymap-app/src/data/relationship-edges.js) outbound edges with `kind: 'compensation'` or `kind: 'load-chain'` originating from this muscle when `state: 'tight'`, plus rationale fields rewritten in second person. Falls back to a generic template if no edges exist. |
| `whenItActsUp.weak` | Same, but inbound edges with `kind: 'inhibition'` or compensation patterns triggered by weakness. |
| `howToTest` | Sourced from [`remedies.js`](../../../bodymap-app/src/data/remedies.js) entries with `kind: 'mobilize'` or `kind: 'activate'` — pick the simplest one and prefix with "Try this:". Falls back to a generic palpation/range cue. |
| `goalHook` | Looked up at render time from `goals[]`. |

### Override file

```js
// bodymap-app/src/data/learn-overrides.js
export const LEARN_OVERRIDES = {
  'hip-flexor': {
    description: "Your hip flexors are a small group of muscles at the front of your hip that lift your thigh toward your chest. They work hard whenever you sit, climb stairs, or run. Because most of us sit a lot, they're often the first place tightness shows up.",
    whatItDoes: [
      "Lifts your thigh forward when you walk or run",
      "Stabilizes your pelvis when you stand on one leg",
      "Helps you sit up from lying down",
    ],
    // ... full record
  },
  // 10-15 hand-tuned entries for the highest-traffic muscles in v1
};
```

The renderer prefers `LEARN_OVERRIDES[baseId]` if present; otherwise it generates from data.

---

## Copywriting style guide

All Learn content (overrides + auto-generated) follows these rules.

### Voice

- **Second person, always.** "Your hip flexor lifts your thigh." Never "The iliopsoas flexes the hip."
- **Calm, curious, never alarmed.** "If this is tight, you might notice ..." not "Tightness here can lead to chronic pain."
- **Educational, never medical.** Per [`_core/CONVENTIONS.md`](../../../_core/CONVENTIONS.md) §1. No "you have", "diagnosis", "treatment", "cure", "should", "must". Use "you might", "consider", "try", "many people find".
- **Short sentences.** Average 12-18 words. Maximum 25.
- **One idea per paragraph.** No walls of text.
- **First mention defines the term.** "Your iliopsoas (a hip flexor that runs from your spine to your thigh) ..." After that, just "your hip flexor" / "this muscle."

### Forbidden words / phrases

- "diagnose", "diagnosis", "treatment", "treat", "prescribe", "prescription"
- "cure", "fix" (use "ease", "improve", "address")
- "abnormal", "normal" in a clinical sense (use "balanced", "tight", "weak" — terms the app already uses)
- "should", "must", "need to" (use "consider", "try", "you might")
- Latin-only names without an English gloss
- Emojis (per `tone_and_style` rule — overall app voice)

### Required words / phrases

- "you", "your" (every Learn record uses these in the first sentence)
- The muscle's plain-English name on first mention
- A felt-sense cue ("you might notice", "this often shows up as", "try this")

### Example, before vs after

Before — current `MuscleMechanicsPanel` style:

> Iliopsoas. Joints: hip. Actions: flexion. Plane: sagittal. Antagonists: gluteus maximus, hamstring group.

After — Learn layer:

> Your iliopsoas is the deepest of the hip-flexor muscles, running from your lower spine down to the inside of your thigh. It lifts your thigh forward whenever you walk, run, or climb stairs.
>
> When it's tight, you might notice a pinching feeling at the front of your hip, an arched lower back when you stand for a while, or stiffness during the first few steps after sitting.
>
> Try this: stand tall and slowly lift one knee toward your chest. If one side feels noticeably harder or tighter than the other, that side may benefit from a kneeling hip-flexor stretch.

---

## Generation templates (auto-fallback)

When no override exists, the Learn renderer assembles from these templates.

### `description` template

```
Your {label} is {role-clause derived from joints+actions}. {Plain-language summary of mechanics from notes}.
```

`role-clause` examples:
- `joints: ["shoulder"], actions: ["flexion"]` -> "a muscle at the front of your shoulder that helps you lift your arm forward"
- `joints: ["knee"], actions: ["extension"]` -> "one of the muscles on the front of your thigh that straightens your knee"
- `joints: ["hip", "knee"]` -> "a muscle that crosses both your hip and knee"

### `whatItDoes` template

For each action in `actions[]`, look up `ACTION_VERBS[action]`:

```js
export const ACTION_VERBS = {
  flexion:  'bends',
  extension: 'straightens',
  abduction: 'lifts away from your body',
  adduction: 'pulls toward your body',
  rotation:  'rotates',
  // ...
};
```

Render: `"{verb} your {joint}"`. Example: `actions: ['flexion'], joints: ['hip']` -> "bends your hip".

### `whenItActsUp.tight` template

Default fallback:

> When this muscle is tight, you might notice stiffness in the area, a feeling of "pulling" during certain movements, or compensation showing up nearby.

If outbound compensation edges exist, append:

> Often when this is tight, your {edge.target.label} starts working harder to make up for it.

### `howToTest` template

Default fallback:

> Try this: move the joint this muscle controls through its full range and notice how each side compares. Tightness often shows up as a clear difference between left and right.

---

## Renderer behaviour

- **Lazy-load** the Learn content for the selected muscle only — don't precompute all 55 muscles.
- **Memoize** generated content per muscleId for the session.
- **Show "Learn more" link** at the bottom of the Learn tab pointing to the dense Mechanics / Edges sub-tabs for the user who wants the data view.
- **Goal hook is contextual:** only renders if `goals[]` contains an active goal whose `targetMuscleId` matches.

---

## Acceptance criteria for Stage 02-A.5 ticket U4 (Body slide-out)

- Every muscle in `SUB_MUSCLES` produces a non-empty Learn record (auto-generated if no override).
- `LEARN_OVERRIDES` is seeded with at least 10 hand-tuned records for the highest-traffic muscles (suggested: hip-flexor, glute-max, glute-med, lat, pec-upper, pec-lower, lower-back-erector, hamstring-biceps-femoris, quad-rectus-femoris, deltoid-anterior).
- All copy passes the style-guide checks (voice, forbidden-word lint, second-person opener).
- Empty / missing data fall back to the generic templates without crashing.
- Goal hook renders only when an active goal targets the muscle, and tapping it deep-links to that goal in Plan.
