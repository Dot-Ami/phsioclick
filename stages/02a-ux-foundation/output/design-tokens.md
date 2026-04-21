# Design tokens

> Encodable as a Tailwind theme extension in `bodymap-app/tailwind.config.js`. Every value below is a directive for Stage 02-A.5 ticket U1.

---

## Design philosophy (one paragraph)

Dark-first, calm, anatomical. The app is a personal training tool, not a clinic dashboard — so the palette is restrained but **emotive on state**. Tight muscles glow warm amber (felt, not alarming). Weak muscles read soft indigo (information, not warning). Balanced muscles fade into the neutral zinc canvas (the absence of a flag). The hero number — Body Balance Score — uses a single warm-to-teal gradient so the user reads it as "where on the spectrum am I?" rather than "good/bad." We deliberately avoid the red/yellow/green clinical traffic light because nothing in this app is medical and nothing is "bad."

---

## 1. Color palette

### 1.1 Neutral canvas (kept from v1, refined)

| Token | Tailwind | Hex | Usage |
|-------|----------|-----|-------|
| `bg.canvas` | `zinc-950` | `#09090b` | Page background |
| `bg.surface` | `zinc-900` | `#18181b` | Cards, sheets, slide-out |
| `bg.surface-2` | `zinc-800` | `#27272a` | Inputs, secondary buttons |
| `bg.surface-3` | `zinc-700` | `#3f3f46` | Hover, divider on dark |
| `border.default` | `zinc-800` | `#27272a` | Card borders |
| `border.muted` | `zinc-800/60` | `#27272a99` | Footer, subtle borders |
| `text.primary` | `zinc-100` | `#f4f4f5` | Body copy |
| `text.secondary` | `zinc-300` | `#d4d4d8` | Labels |
| `text.muted` | `zinc-400` | `#a1a1aa` | Captions, placeholder |
| `text.faint` | `zinc-500` | `#71717a` | Footer, disabled |

### 1.2 Semantic state palette (NEW — replaces ad-hoc cyan)

| Token | Hex | Tailwind config | Meaning |
|-------|-----|-----------------|---------|
| `state.tight` | `#f59e0b` | `amber-500` | Tight muscle, warm but not alarming |
| `state.tight.bg` | `#f59e0b1f` | `amber-500/12` | Tight card background tint |
| `state.tight.border` | `#f59e0b40` | `amber-500/25` | Tight card border |
| `state.weak` | `#818cf8` | `indigo-400` | Weak muscle, soft and informational |
| `state.weak.bg` | `#818cf81f` | `indigo-400/12` | Weak card background tint |
| `state.weak.border` | `#818cf840` | `indigo-400/25` | Weak card border |
| `state.balanced` | `#5eead4` | `teal-300` | Returned-to-normal, positive but understated |
| `state.balanced.bg` | `#5eead41a` | `teal-300/10` | Balanced tint |

### 1.3 Brand accent (NEW — replaces cyan)

| Token | Hex | Tailwind | Meaning |
|-------|-----|----------|---------|
| `brand.primary` | `#14b8a6` | `teal-500` | Active tab, primary CTA, links |
| `brand.primary.hover` | `#0d9488` | `teal-600` | Hover state |
| `brand.primary.bg` | `#14b8a61f` | `teal-500/12` | Active tab background tint |
| `brand.primary.border` | `#14b8a640` | `teal-500/25` | Active tab border |

Why teal-500 over cyan-400: cyan reads cold and "tech"; teal reads bodily, warmer, more analog. Keeps the CONVENTIONS §7 "teal palette" promise while moving away from cyan's electric-blue tilt.

### 1.4 Score gradient (Body Balance Score)

A four-stop linear gradient tied to score tier. Always rendered horizontally on the score bar; the score's numeric label sits on top.

| Tier | Score range | Stop color | Label color |
|------|-------------|------------|-------------|
| Recovering | 0-39 | `state.weak` (`#818cf8`) | `text.primary` |
| Building | 40-59 | mix(weak, brand) (`#5e9fc6`) | `text.primary` |
| Balanced | 60-79 | `brand.primary` (`#14b8a6`) | `text.primary` |
| Resilient | 80-100 | `state.balanced` (`#5eead4`) | `text.primary` |

No red. No "you're failing" color anywhere in the app.

### 1.5 Atlas overlay colors (kept from v1)

`MuscleAtlas`'s recruitment tint stays as-is (primary/secondary/tertiary red/purple/green). These are anatomical role colors, not state colors, so they don't compete with the state palette.

---

## 2. Type scale

`font-family`: `Inter` (system fallback `ui-sans-serif`). Optional display face `Inter Display` for the hero score only — fall back to `Inter` if not available.

| Token | Size / line-height | Weight | Usage |
|-------|-------------------|--------|-------|
| `type.display` | `40px / 44px` | 600 | Body Balance Score number, milestone celebration headline |
| `type.h1` | `28px / 36px` | 600 | Screen titles (Today, Body, Plan, Progress) |
| `type.h2` | `20px / 28px` | 600 | Card titles |
| `type.body-lg` | `16px / 24px` | 500 | Primary copy, plain-language teaching paragraphs |
| `type.body` | `14px / 20px` | 400 | Default UI copy |
| `type.body-emphasis` | `14px / 20px` | 600 | Inline emphasis, button labels |
| `type.caption` | `12px / 16px` | 500 | Labels, tags, metadata |
| `type.micro` | `11px / 14px` | 600 | Badge text, layer tags (L0/L1) |

Rules:

- Headings always 600 (semibold), never bold (700) — semibold reads quieter against dark surfaces.
- Body copy never below 14px on mobile.
- Numbers in metric cards use **tabular-nums** so 0/1/2 don't shift width across re-renders.

---

## 3. Spacing scale

Single 4-based scale. Reuse only these values — no `p-5`, no `p-7`.

| Token | Value | Tailwind | Common usage |
|-------|-------|----------|--------------|
| `space.0` | `0` | `0` | Reset |
| `space.1` | `4px` | `1` | Hairline gaps |
| `space.2` | `8px` | `2` | Tight stacks (icon + label) |
| `space.3` | `12px` | `3` | Inline rows |
| `space.4` | `16px` | `4` | Default card inner padding |
| `space.5` | `24px` | `6` | Section gaps |
| `space.6` | `32px` | `8` | Screen-section gaps |
| `space.7` | `48px` | `12` | Hero block padding |
| `space.8` | `64px` | `16` | Empty-state vertical padding |

---

## 4. Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `radius.sm` | `6px` | `rounded-md` | Small buttons, tags |
| `radius.md` | `10px` | `rounded-[10px]` | Inputs, secondary cards |
| `radius.lg` | `14px` | `rounded-[14px]` | Primary cards, hero |
| `radius.xl` | `20px` | `rounded-[20px]` | Slide-out sheet, onboarding modal |
| `radius.full` | `9999px` | `rounded-full` | Avatars, pills, score-bar end-caps |

Add the two off-Tailwind values (`10` and `14`) to `theme.extend.borderRadius` so `rounded-md` keeps its default and we don't accidentally drift.

---

## 5. Elevation (subtle on dark)

Soft inner-glow + 1px border combination, since drop-shadow on a near-black canvas is invisible. Encoded as box-shadow utilities.

| Token | Value | Usage |
|-------|-------|-------|
| `elev.0` | `none` | Inline elements |
| `elev.1` | `0 0 0 1px rgba(63, 63, 70, 0.6)` | Default card |
| `elev.2` | `0 0 0 1px rgba(63, 63, 70, 0.8), 0 8px 24px rgba(0,0,0,0.45)` | Hovered card, slide-out |
| `elev.3` | `0 0 0 1px rgba(20, 184, 166, 0.4), 0 0 32px rgba(20, 184, 166, 0.18)` | Active / selected card (teal glow) |
| `elev.tight` | `0 0 0 1px rgba(245, 158, 11, 0.35), 0 0 24px rgba(245, 158, 11, 0.15)` | Tight muscle card glow |
| `elev.weak` | `0 0 0 1px rgba(129, 140, 248, 0.35), 0 0 24px rgba(129, 140, 248, 0.15)` | Weak muscle card glow |

---

## 6. Motion

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `motion.instant` | `0ms` | n/a | Hover (no transition jank) |
| `motion.fast` | `150ms` | `ease-out` | Color/border state changes |
| `motion.standard` | `200ms` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Tab switch, button press |
| `motion.entrance` | `400ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Slide-out, modal, toast entry |
| `motion.celebration` | `800ms` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Milestone hit, score tier-up |

Honor `prefers-reduced-motion: reduce`. When the user has it on, all motion drops to `motion.fast` and celebration animations become a single fade.

---

## 7. Iconography

- **Library:** `lucide-react` (already React-friendly, MIT, dark-mode-tested). Add as a dependency in U1.
- **Sizes:** `14px` (inline), `18px` (default), `24px` (nav, hero), `32px` (milestone celebration).
- **Stroke:** `1.75` for default; `2` for active nav.
- **Color:** inherits from `currentColor`. Never hard-code icon color.

---

## 8. Empty states (component-level token)

Every "I have no data" state in the app must follow this shape:

```
[icon, 32px, text.muted]
[h2 message]
[body-lg supporting copy]
[primary CTA button]
```

Top-level padding: `space.7` vertical. Centered.

---

## 9. Reuse rules for the implementation stage

- **One color token per pixel.** If the implementation reaches for a hex literal, that's a violation — every visual decision goes through this file.
- **Tailwind theme extension is the contract.** Encode all of §1-§6 in `tailwind.config.js` `theme.extend`. No inline `style` props for color/spacing.
- **No new tokens without a reason.** If U3-U8 needs a value not in this file, surface it back into this file before using it.

---

## Tailwind config preview (for U1)

```js
// bodymap-app/tailwind.config.js (excerpt)
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#14b8a6', hover: '#0d9488' },
        state: {
          tight:    '#f59e0b',
          weak:     '#818cf8',
          balanced: '#5eead4',
        },
      },
      borderRadius: {
        '10': '10px',
        '14': '14px',
        '20': '20px',
      },
      fontSize: {
        display:  ['40px', { lineHeight: '44px', fontWeight: '600' }],
        h1:       ['28px', { lineHeight: '36px', fontWeight: '600' }],
        h2:       ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg':['16px', { lineHeight: '24px', fontWeight: '500' }],
        body:     ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption:  ['12px', { lineHeight: '16px', fontWeight: '500' }],
        micro:    ['11px', { lineHeight: '14px', fontWeight: '600' }],
      },
      transitionTimingFunction: {
        standard:    'cubic-bezier(0.2, 0.8, 0.2, 1)',
        entrance:    'cubic-bezier(0.16, 1, 0.3, 1)',
        celebration: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '400': '400ms',
        '800': '800ms',
      },
    },
  },
};
```
