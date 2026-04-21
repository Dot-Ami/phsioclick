# Stage 04 — Content expansion (Track G)

> **Status:** ☐ Queued. Partially unblocked — female atlas infrastructure already landed in v1.
> Placeholder contract — detail fills in when scheduled.

---

## Why this stage exists

v1 shipped a working intelligence stack on the male atlas with seeded data libraries. Content work remaining is mostly **art + seeding**, not architecture:

- Female atlas SVG splits to match male parity
- New muscles missing from the atlas entirely (deep hip rotators, tibialis posterior, peroneals)
- More remedy variants per muscle (both `tight` and `weak` for more entries)
- Video links / GIFs attached to remedies
- More movements (Olympic lifts, gymnastics, common accessory patterns)

---

## Inputs

When this stage activates, read:

| File | Purpose |
|------|---------|
| `CLAUDE.md`, `CONTEXT.md` (root), `_core/CONVENTIONS.md` | Always |
| `shared/data-catalog.md` | What each data module currently contains |
| `_config/stack.md` | Where atlas and data files live |
| `PROJECT_NOTES.md` §"Known Limitations" (legacy) | Explicit list of what's missing from v1 |
| `stages/01-v1-foundation/output/completion-log.md` | D4 infrastructure note for female atlas |
| Source: `src/atlas-assets/*`, `src/muscle-data.js`, `src/data/*` | Files to extend |

---

## Candidate work (when scheduled)

### G1 — Female atlas SVG path splits

v1 wired `atlas-assets/bodyFemaleFront.js` and `bodyFemaleBack.js` to flow through the same patched-fork pattern as male. Divider arrays (`FEMALE_FRONT_DIVIDERS`, `FEMALE_BACK_DIVIDERS`) export as empty. G1 does the vector art:

- Deltoid: anterior / lateral / posterior splits
- Chest: upper / lower
- Quadriceps: RF / VL / VMO
- Gluteal: medius / maximus
- Hamstring: biceps femoris / semi-tendinosus / semi-membranosus
- Upper back: lats / infraspinatus / teres major
- Trapezius: upper / middle / lower

Acceptance: atlas click/hover/state all work bilaterally on female with the same slug semantics as male.

### G2 — Atlas-new muscles

Add SVG paths + `SUB_MUSCLES` entries for:

- Deep hip rotators (piriformis, obturators, gemelli)
- Tibialis posterior
- Peroneals / fibularis group

Each needs mechanics (L0), edges where applicable (L1), at least one remedy (L3), and recruitment hits in relevant movements (L4).

### G3 — Remedy depth

Audit `data/remedies.js`. For every muscle with only one state variant, add the other (where anatomically sensible). Target: every flagged muscle returns ≥ 2 remedies.

### G4 — Video / media attachments

Extend `REMEDIES` schema with optional `{ videoUrl, thumbnail }`. UI: `RemedyPanel` shows a play button when media exists. No change to existing text-only remedies.

### G5 — Movement catalog growth

Add accessory / conditioning patterns. Candidates: split squat, Bulgarian split squat, calf raise, lat pulldown, dip, plank, hanging leg raise, Turkish get-up.

---

## Outputs

- `output/plan.md` — ticket breakdown when scheduled
- `output/female-atlas-split-spec.md` — per-region SVG split acceptance criteria for G1
- `output/media-schema-v2.md` — if G4 requires a remedy schema bump

---

## Not dependent on Stages 02 or 03

This stage can run in parallel with Stage 02 or 03. The only coupling is the build gate and the join-key invariant.
