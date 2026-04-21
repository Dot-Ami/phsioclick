# Handoff Prompt — Dot Body Map (legacy — see ICM structure)

> **⚠ Superseded as a starting point (2026-04).** New sessions should enter via `CLAUDE.md` → `CONTEXT.md` → the active stage under `stages/`. This file is preserved because its file-level architecture pointers remain accurate and are cited from `_config/stack.md`. Read it when you need a dense source-file map; skip it for routing.
>
> **Active work (2026-04-18 onward):** Stage 02-A.5 (UX foundation implementation) — U1 (tokens), U2 (nav shell), U3 (Today + cold-start `BodyBalanceScore`) have shipped. The next-session prompt lives at [`stages/02a-ux-foundation/output/IMPLEMENTATION_KICKOFF_PROMPT.md`](stages/02a-ux-foundation/output/IMPLEMENTATION_KICKOFF_PROMPT.md) — paste the "Prompt to paste" block to continue with U4 + U5 (Body slide-out + Learn layer + Plan screen). Live ticket status is in [`stages/02a5-ux-implementation/output/completion-log.md`](stages/02a5-ux-implementation/output/completion-log.md). Stage 02 (tracking & metrics) is paused with planning complete; it resumes as Stage 02-B after 02-A.5 ships.

## Context

You are taking over a React + Tailwind web app called **Dot Body Map**. Full project notes are in `c:\phsioclick\PROJECT_NOTES.md`. Read that file first — especially **What This Project Is** and **North star**. The intelligence roadmap, layer definitions, and status tracking live in `c:\phsioclick\BODY_MODEL_ROADMAP.md`.

**Product intent (author):** The app exists primarily for **workout planning**, understanding **where you're tight vs weak**, and **balancing the body**. It is evolving toward **diagnostic-style decision-support**: cause–effect between regions, remedies for tight/weak selections, movement visualization with recruitment coloring (primary red, secondary purple, tertiary green), and a guided session planner. All outputs are educational / decision-support — not medical advice.

**App root:** `c:\phsioclick\bodymap-app`  
**Dev server:** `http://localhost:5173/` (run `npm run dev` from app root)

---

## Key Files

### App shell
| File | Purpose |
|------|---------|
| `src/BodyMapApp.jsx` | Main shell: all tabs, state, storage load/save, export/import |
| `src/MuscleAtlas.jsx` | Atlas UI: `bodyData` merge, hover labels, unified click → select, recruitment tint pass-through |
| `src/BodyAtlas.jsx` | Renders patched SVG paths + divider strokes |
| `src/muscle-data.js` | `SLUG_META`, `SUB_MUSCLES`, `SUB_TO_ATLAS_SLUG`, `ATLAS_SLUG_TO_SUB`, `PARENT_TO_ATLAS_SLUGS`, `LEGACY_ID_MAP` |
| `src/atlas-pointer-utils.js` | Infers L/R from pointer X vs SVG midline for centerline paths |

### Atlas assets
| File | Purpose |
|------|---------|
| `src/atlas-assets/bodyFront.js` | Male front: vendor paths + split regions (deltoids, chest, quads) |
| `src/atlas-assets/bodyBack.js` | Male back: vendor paths + splits (deltoids, glutes, hams, upper-back, traps) |
| `src/atlas-assets/deltoidDivider.js` | Bezier divider helper (shared for deltoid, chest, trap splits) |

### Body model data (L0–L4)
| File | Purpose |
|------|---------|
| `src/data/joints.js` | L0 joint catalog (`JOINTS`, `getJoint`) — 9 joints with DOF |
| `src/data/muscle-mechanics.js` | L0 muscle mechanics (`MUSCLE_MECHANICS`, `getMuscleMechanics`) — ~55 sub-muscles |
| `src/data/relationship-edges.js` | L1 inter-regional edges (`RELATIONSHIP_EDGES`, `getEdgesForMuscle`, `getEdgesByKind`) |
| `src/data/remedies.js` | L3 remedy steps keyed by muscle base ID + state (`REMEDIES`, `getRemedies`) |
| `src/data/movements.js` | L4 movement catalog with phase-based recruitment (`MOVEMENTS`, `getMovement`, `getRecruitmentMap`) |

### UI panels (body intelligence stack)
| File | Purpose |
|------|---------|
| `src/MuscleMechanicsPanel.jsx` | L0 read-only: joints, action keys, antagonists, synergists for selected muscle |
| `src/RelationshipEdgesPanel.jsx` | L1 inbound/outbound edges for selected muscle; filter by kind |
| `src/MuscleStatePanel.jsx` | L2 tight/weak/normal toggle per muscle; persisted in localStorage |
| `src/RemedyPanel.jsx` | L3 displays applicable remedies when a muscle has a non-normal state |
| `src/MovementRecruitmentPanel.jsx` | L4 movement selector; passes recruitment tint map to atlas |
| `src/SessionPlanner.jsx` | L5 session/weekly/symmetry planner with intake wizard, using muscle states + L1 edges |

---

## Current Atlas Implementation

**Approach:** Vendor SVG art is forked under `src/atlas-assets/`; paths are subdivided with new slugs and merged by slug at render time (same mechanism as the original library). Highlights on the atlas always commit immediately — no modal picker.

**Click behavior (unified):**
- Split atlas slug (`ATLAS_SLUG_TO_SUB`) → directly selects sub-muscle id (e.g. `quad-rectus-femoris` → `rectus-femoris-l`)
- Parent with subs but no specific split path → selects `{parent}-l|r` whole group; refine via Log dropdown
- Centerline `common` paths → infers L/R from click X vs SVG midline (`atlas-pointer-utils.js`)
- No sub-muscle modal on the map

**Male splits implemented:**

| Vendor slug | Result |
|-------------|--------|
| `deltoids` | Front: `deltoid-anterior` + `deltoid-lateral`; Back: `deltoid-posterior` + `deltoid-lateral`; dividers |
| `chest` | `chest-upper`, `chest-lower`; dividers |
| `quadriceps` | `quad-rectus-femoris`, `quad-vastus-lateralis`, `quad-vastus-medialis` |
| `gluteal` | `gluteal-medius`, `gluteal-maximus` |
| `hamstring` | `hamstring-biceps-femoris`, `hamstring-semitendinosus`, `hamstring-semimembranosus` |
| `upper-back` | `back-lats`, `back-infraspinatus`, `back-teres-major` (rhomboids use `back-lats` as proxy — no separate path) |
| `trapezius` (back) | `trap-upper`, `trap-middle`, `trap-lower`; dividers |

**Female:** Still uses stock library paths (no splits yet).

---

## Storage

**Key:** `dot-body-map-v3` | **Schema version:** `2`

Stored JSON shape:
```json
{
  "schemaVersion": 2,
  "entries": [...],
  "assessments": [...],
  "muscleStates": {
    "glute-max-l": { "state": "weak", "updatedAt": "ISO string" }
  }
}
```

`migrateLegacyId()` handles backward compat for pre-v3 IDs.

---

## App Tabs

| Tab | What it does |
|-----|-------------|
| **Log** | Origin + sensation (atlas or dropdowns), movement, sensation type, intensity, context, notes. Body Intelligence stack shown when origin is selected: L0 mechanics panel → L1 relationship edges → L2 muscle state toggle → L3 remedies → L4 recruitment viewer |
| **Dashboard** | Stats, heat map on atlas, timeline charts, compensation chains, L/R symmetry summary |
| **Assessments** | Bilateral tests, asymmetry flags, assessment trends |
| **Planner** | Enhanced planner with session/weekly/symmetry views, intake wizard, concrete sets/reps/duration from remedies, L1 edge "also consider", L/R asymmetry detection |

---

## Constraints (always apply)

- Do not break Log / Dashboard / Assessments / Planner, export/import, or clinical report export.
- Keep **backward compatibility**: `LEGACY_ID_MAP` + `migrateLegacyId()` for old saved IDs.
- Keep the **dark clinical** aesthetic on the atlas default fill/stroke.
- Run **`npx vite build`** before calling any atlas or data work done.
- All new data modules MUST use base sub-muscle IDs from `muscle-data.js` as join keys — do not invent new IDs.

---

## Quick Commands

```bash
cd c:\phsioclick\bodymap-app && npm run dev
cd c:\phsioclick\bodymap-app && npx vite build
```

---

## Future / Not Yet Done

- Female atlas splits (parity with male)
- Deep hip rotators, tibialis posterior, peroneals (atlas art)
- Female atlas path splits (infrastructure ready, SVG geometry work needed)
- Video links for remedies
- More remedy variants (e.g. both tight+weak for more muscles)
- Deeper intake wizard intelligence (connect lift picks to recruitment data)
- See full backlog in `PROJECT_NOTES.md` and status tables in `BODY_MODEL_ROADMAP.md`
