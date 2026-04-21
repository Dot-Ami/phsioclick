# Dot Body Map — Project Notes

> **Documentation layout note (2026-04):** This workspace now uses an ICM (Interpretable Context Methodology) folder structure. Start new sessions at `CLAUDE.md` → `CONTEXT.md` → the active stage under `stages/`. This file remains authoritative for comprehensive product / architecture context and is referenced from `shared/body-model.md` and `stages/00-orientation/CONTEXT.md`. See `_core/CONVENTIONS.md` for invariants.

## What This Project Is (author intent)

**Dot Body Map** is a React + Tailwind web app built around a **high-resolution anatomical atlas**. The **primary motivation** is **personal training and body balance**:

- **Workout planning** — structure training around what you want to develop and what needs attention.
- **Tight vs weak patterns** — understand *where* you tend to be tight or weak and how that skews your body, not just log pain for its own sake.
- **Balancing the body** — use the map and data as a lens for symmetry, priorities, and "what to fix next."

The app **also** supports logging origin/sensation, movements, and intensity (useful for spotting patterns over time), but that workflow is **secondary** to the goals above — not the reason the project was started.

**Roadmap stance:** The product is **not** a medical diagnostic tool. It is intended to evolve toward **decision-support and guided planning**: given what hurts, what you want to train, or what feels wrong in a movement, the app should suggest causes, remedies, and a concrete game plan. All outputs carry an explicit scope disclaimer — educational / self-coaching, not medical advice.

---

## North Star (where the body map is heading)

The granular atlas is **foundation data**. On top of it, the direction is:

1. **Cause and effect** — Model how one region, posture, or movement pattern influences others (e.g. "if this is tight, what downstream effects show up?"). Grounded in L0 mechanics vocabulary.
2. **Tight / weak on the map** — Select a muscle and mark **tight** or **weak**; surface **remedies** (stretch, strengthen, drill, tempo) with step-by-step instructions.
3. **Movement-realistic visualization** — Play a movement (bench press, squat, deadlift) and color muscles by recruitment role on the same SVG paths used for selection:
   - **Primary movers** — red
   - **Secondary movers** — purple
   - **Tertiary / stabilizers** — green
4. **Guided planning** — From "this is tight/weak" → prioritized session plan (stretch tight first, activate/strengthen weak, consider related muscles via L1 edges).
5. **Diagnostic-style flow (future)** — Intake wizard → ranked hypotheses → week/session plan with disclaimers.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React (Vite) |
| Styling | Tailwind CSS |
| Atlas (male) | Patched fork: `BodyAtlas.jsx` + `atlas-assets/bodyFront.js` / `bodyBack.js` |
| Atlas (female) | Stock `bodyFemaleFront` / `bodyFemaleBack` (no path splits yet) |
| Charts | Recharts (lazy loaded via `TrendCharts.jsx`) |
| Storage | localStorage JSON blob (`schemaVersion: 2`) |
| Language | JavaScript (JSX) |

**App root:** `c:\phsioclick\bodymap-app`

### Key source files

| File | Purpose |
|---|---|
| `src/BodyMapApp.jsx` | Main app shell: all tabs, state, storage load/save, export/import |
| `src/MuscleAtlas.jsx` | Atlas: `bodyData` merge, hover labels, unified click → select, recruitment tint |
| `src/BodyAtlas.jsx` | Renders merged SVG paths + non-interactive divider strokes |
| `src/muscle-data.js` | `SLUG_META`, `SUB_MUSCLES`, atlas maps, `LEGACY_ID_MAP` — the stable ID join key |
| `src/atlas-pointer-utils.js` | Infers L/R from click X vs SVG midline for centerline paths |
| `src/atlas-assets/deltoidDivider.js` | Bezier divider curves (deltoid, chest, trap internal lines) |
| `src/TrendCharts.jsx` | Recharts timeline and assessment charts |

### Body intelligence data modules

| File | Layer | Contents |
|---|---|---|
| `src/data/joints.js` | L0 | 9 joint catalog entries with DOF |
| `src/data/muscle-mechanics.js` | L0 | ~55 sub-muscle mechanics entries (joints, actions, antagonists, synergists) |
| `src/data/relationship-edges.js` | L1 | 32 inter-regional edges (compensation, load-chain, inhibition) |
| `src/data/remedies.js` | L3 | 35 remedy entries for ~25 muscles (stretch, strengthen, mobilize, activate, release) |
| `src/data/movements.js` | L4 | 10 movements (bench, squat, deadlift, OHP, row, pull-up, lunge, RDL, hip thrust, face pull) |

### Body intelligence UI panels

| File | Layer | What it shows |
|---|---|---|
| `src/MuscleMechanicsPanel.jsx` | L0 | Joints crossed, action keys, plane tags, antagonists, synergists |
| `src/RelationshipEdgesPanel.jsx` | L1 | Inbound/outbound edges for selected muscle; filter by kind |
| `src/MuscleStatePanel.jsx` | L2 | Tight/weak/normal toggle; persisted to localStorage |
| `src/RemedyPanel.jsx` | L3 | Step-by-step remedies when muscle state is tight or weak |
| `src/MovementRecruitmentPanel.jsx` | L4 | Movement selector + recruitment tint on the atlas |
| `src/SessionPlanner.jsx` | L5 | Rules-based session plan from muscle states + L1 edges |

---

## How the Atlas Works (male)

1. **Vendor baseline** — Paths imported from `vendor/react-muscle-highlighter/.../bodyFront.js` and `bodyBack.js`.
2. **Replacements** — `bodyFront` / `bodyBack` exports `flatMap` the vendor array; e.g. `slug === 'deltoids'` → multiple entries with new slugs.
3. **Highlighting** — `MuscleAtlas` builds `data` with `{ slug, color, side }`. `BodyAtlas` merges by slug.
4. **Sub-muscles** — `getBodySlug(id)` returns either a parent slug or an atlas slug from `SUB_TO_ATLAS_SLUG`. Split parents use `PARENT_TO_ATLAS_SLUGS` to light all sub-regions when "entire group" is selected.
5. **Direct pick** — Clicking a path whose slug is in `ATLAS_SLUG_TO_SUB` sets the sub-muscle id immediately. Other parents with subs set `{parent}-l|r` (whole group); refine via Log dropdown. No sub-muscle modal on the map.
6. **Dividers** — `FRONT_DIVIDERS` / `BACK_DIVIDERS` are stroked paths (pointer-events none) for internal muscle boundary lines.
7. **Recruitment tint** — `MuscleAtlas` accepts a `recruitmentTint` map `{ [muscleBaseId]: hexColor }` and overlays it on the atlas; primary/secondary/tertiary colors are assigned by the `MovementRecruitmentPanel`.

### Implemented split / re-slug regions (male)

| Vendor slug | Result |
|-------------|--------|
| `deltoids` | Front: `deltoid-anterior` + `deltoid-lateral`; Back: `deltoid-posterior` + `deltoid-lateral`; dividers |
| `chest` | `chest-upper`, `chest-lower`; dividers |
| `quadriceps` | `quad-rectus-femoris`, `quad-vastus-lateralis`, `quad-vastus-medialis` |
| `gluteal` | `gluteal-medius`, `gluteal-maximus` |
| `hamstring` | `hamstring-biceps-femoris`, `hamstring-semitendinosus`, `hamstring-semimembranosus` |
| `upper-back` | `back-lats`, `back-infraspinatus`, `back-teres-major` (rhomboids use `back-lats` as proxy — no separate path) |
| `trapezius` (back only in assets) | `trap-upper`, `trap-middle`, `trap-lower`; dividers |

---

## Data Model (`muscle-data.js`)

1. **`SLUG_META`** — One entry per parent body region. Not every entry has a 1:1 vendor SVG slug.

2. **`SUB_MUSCLES`** — Parent slug → list of sub-muscles with `id`, `label`, `actions`, `notes`.

   | Parent | Sub-muscles (summary) |
   |---|---|
   | chest | pec-major, pec-upper, pec-lower, pec-minor, serratus-ant |
   | deltoids | anterior, lateral, posterior delt |
   | trapezius | upper, middle, lower trap |
   | biceps | long, short, brachialis |
   | triceps | long, lateral, medial |
   | quadriceps | RF, VL, VMO, vastus intermedius |
   | hamstring | biceps femoris, semitendinosus, semimembranosus |
   | gluteal | max, med, min |
   | calves | gastroc, soleus |
   | upper-back | lats, rhomboids, teres major, infraspinatus, teres minor, supraspinatus, subscapularis |
   | lower-back | erector spinae, QL, multifidus |
   | abs | rectus abdominis, transverse abdominis |
   | obliques | external / internal oblique, serratus anterior |
   | forearm | wrist flexors/extensors, brachioradialis |
   | neck | SCM, scalenes, levator scapulae |
   | adductors | magnus, longus, gracilis |
   | tibialis | tibialis anterior |
   | hip-flexors | iliopsoas, TFL, sartorius |

3. **`MUSCLES`** — Auto-built list for dropdowns and labels.

**ID format:**
- Parent: `{slug}-{l|r}` → `chest-l`, `deltoids-r`
- Sub: `{sub-id}-{l|r}` → `pec-upper-l`, `anterior-delt-r`

**Important maps:**
- `SUB_TO_ATLAS_SLUG` — sub id → SVG slug for fill (deep muscles → overlying region as proxy).
- `ATLAS_SLUG_TO_SUB` — reverse for direct clicks.
- `PARENT_TO_ATLAS_SLUGS` — expand "entire group" to all atlas sub-slugs.
- `LEGACY_ID_MAP` + `migrateLegacyId()` — old saved IDs → current.

**Exports:** `getMuscle`, `getMuscleLabel`, `toMuscleId`, `fromMuscleId`, `getBodySlug`, `getSubMuscles`, `migrateLegacyId`, `ATLAS_SLUG_TO_SUB`, `PARENT_TO_ATLAS_SLUGS`, etc.

### Deep / proxy highlights

Some subs have no dedicated path. They map to the closest visible region (e.g. glute-min → gluteal-medius, supraspinatus → `trap-upper`, hip flexor subs → abs / obliques / adductors). Clinical text still describes the real muscle.

---

## Storage

**Key:** `dot-body-map-v3` | **Current schema version:** `2`

```json
{
  "schemaVersion": 2,
  "entries": [ ... ],
  "assessments": [ ... ],
  "muscleStates": {
    "glute-max-l": { "state": "weak", "updatedAt": "2026-04-14T..." }
  }
}
```

`migrateLegacyId()` handles backward compat. Export / import both include `muscleStates` and `schemaVersion`.

---

## App Tabs

1. **Log** — Origin + sensation (atlas or dropdowns), movement, sensation type, intensity, context, notes → localStorage. When an origin is selected, the **Body Intelligence Stack** appears in the side panel:
   - **L0 Mechanics panel** — joints crossed, action keys, antagonists, synergists
   - **L1 Relationships panel** — inbound/outbound edges; filter by kind (compensation, load-chain, inhibition, etc.)
   - **L2 Muscle state** — tight / weak / normal toggle; persists to localStorage
   - **L3 Remedies** — step-by-step interventions (visible only when tight/weak is set)
   - **L4 Movement Recruitment** — select a movement to see recruitment tint on the atlas

2. **Dashboard** — Stats, **heat map** on atlas, timeline, compensation-style chains, L/R summary.

3. **Assessments** — Bilateral tests, asymmetry flags, trends.

4. **Planner** — Enhanced session planner with three view modes:
   - **Session view**: Stretch/release tight → activate/strengthen weak → "also consider" via L1 edges; remedies include sets/reps/duration
   - **Weekly view**: Multi-day templates (mobility/recovery, upper, lower, full) with muscle distribution
   - **L/R Balance view**: Bilateral asymmetry detection (left vs right state comparison)
   - **Intake Wizard**: Step-by-step goal/tight/weak/lift setup that populates muscle states and generates a personalized plan

---

## Atlas QA Checklist

Run after any atlas or `muscle-data` changes:

1. **`npx vite build`** — must succeed.
2. **Legacy IDs** — e.g. `migrateLegacyId('iliopsoas-l')` → `iliopsoas-l`; `migrateLegacyId('pec-major-upper-l')` → `pec-upper-l`.
3. **`getBodySlug`** — e.g. `pec-upper-l` → `chest-upper`; `teres-major-l` → `back-teres-major`; `infraspinatus-r` → `back-infraspinatus`.
4. **Slug map consistency** — Any atlas slug in `ATLAS_SLUG_TO_SUB` or `PARENT_TO_ATLAS_SLUGS` must have a matching path in `bodyFront.js` or `bodyBack.js`; remove dead slugs immediately.
5. **Browser smoke** — App loads, no runtime errors, click each region, verify L/R highlight and hover label.

---

## Known Limitations

1. **Female atlas** — No custom splits; granularity is library default.
2. **Hip flexors** — Data + picker only; highlights use proxy regions (no new SVG paths).
3. **Supraspinatus / subscapularis** — Proxy highlights (upper trap / infraspinatus area); anatomy is anterior or deep to drawn paths.
4. **Rhomboids** — `back-lats` used as proxy highlight (no separate rhomboid path in vendor art); major/minor are data-only distinctions.
5. **L1 edge library** — 32 edges (target met: ≥ 30).
6. **L3 remedy library** — 35 remedies for ~25 muscles; grows with use.
7. **L4 movement catalog** — 10 lifts (bench, squat, deadlift, OHP, row, pull-up, lunge, RDL, hip thrust, face pull).

---

## Roadmap & Body-Model Sequencing

**Single source of truth for layer definitions (L0–L5), status, and order of operations:** [`BODY_MODEL_ROADMAP.md`](./BODY_MODEL_ROADMAP.md)

That doc defines the layered body model, tracks phase status with ☐/◐/☑, records open decisions (§9), and has handoff phrasing for future assistants (§8).

---

## Future Backlog

### Intelligence (priority for stated vision)
- ~~Grow **L1 edge library** to ≥ 30~~ ☑ 32 edges
- ~~Grow **L3 remedy library**~~ ☑ 35 remedies for ~25 muscles; video links still TODO
- ~~Grow **L4 movement catalog**~~ ☑ 10 lifts
- ~~**L5 planner v2** — Intake wizard, weekly plan templates~~ ☑ Session/weekly/symmetry views + intake wizard
- ~~**Bilateral state view**~~ ☑ L/R asymmetry view in Planner
- **Disclaimer / scope** already present in footer; deeper "about" modal for L5 planner features

### Atlas / content
- **Deep hip rotators** — Piriformis, obturators, gemelli
- **Tibialis posterior**, **peroneals (fibularis)**
- **Female asset parity** — Port male splits to female front/back
- **Full SVG swap** — Wikimedia `Muscles_front_and_back.svg` if vendor art limits coverage

### Polish
- Mobile layout improvements
- More movement patterns, session grouping, export/report improvements

---

## Dev Server

```bash
cd c:\phsioclick\bodymap-app
npm run dev
# http://localhost:5173/
```

```bash
npx vite build
```

---

## Conversation History

Past chat transcripts: `C:\Users\Alex_\.cursor\projects\c-phsioclick\agent-transcripts\` (search by topic / filename).
