# Data catalog

What lives in `bodymap-app/src/data/` and how each module is keyed. All IDs are `SUB_MUSCLES` base IDs (no `-l`/`-r`).

---

## `joints.js` (L0)

**Exports:** `JOINTS`, `getJoint(id)`, `JOINTS_SCHEMA_VERSION`
**Shape:**
```js
{
  id: "elbow",
  name: "Elbow",
  segments: ["humerus", "ulna", "radius"],
  dof: 1,
  planes: ["sagittal"],
  notes: "..."
}
```
**Count:** 9 joints (shoulder, elbow, radioulnar, wrist, hip, knee, ankle, lumbar-spine, cervical-spine).

---

## `muscle-mechanics.js` (L0)

**Exports:** `MUSCLE_MECHANICS`, `getMuscleMechanics(baseId)`, `listMechanicsBaseIds()`, `MUSCLE_MECHANICS_SCHEMA_VERSION`
**Shape:**
```js
{
  muscleBaseId: "biceps-long",
  jointIds: ["shoulder", "elbow", "radioulnar"],
  primaryActionKeys: ["elbow-flexion", "forearm-supination", "shoulder-flexion"],
  planeTags: ["sagittal"],
  antagonistSubIds: ["triceps-long", "triceps-lateral"],
  synergistSubIds: ["brachialis", "brachioradialis"],
  notes: "..."
}
```
**Count:** ~55 entries — every `SUB_MUSCLES` base ID covered.

---

## `relationship-edges.js` (L1)

**Exports:** `RELATIONSHIP_EDGES`, `getEdgesForMuscle(baseId)`, `getEdgesByKind(kind)`
**Shape:**
```js
{
  id: "tight-hipflexor-inhibits-glute",
  from: "iliopsoas",
  to: "glute-max",
  kind: "inhibition",
  confidence: "high",
  rationale: "Reciprocal inhibition at hip; tight hip flexor dampens glute activation.",
  sources: ["Sahrmann", "Janda lower-cross"]
}
```
**Count:** 32 edges. **Kinds in use:** `compensation`, `load-chain`, `inhibition`. **Reserved:** `adjacency`, `referral`.

**Known behavior:** `getEdgesForMuscle` returns `{ inbound, outbound }`; callers must dedupe by `id` to avoid duplicate React keys (fixed in `RelationshipEdgesPanel.jsx`).

---

## `remedies.js` (L3)

**Exports:** `REMEDIES`, `getRemedies(baseId, state)`
**Shape:**
```js
{
  id: "pec-upper-stretch-doorway",
  muscleBaseId: "pec-upper",
  forState: "tight",
  title: "Doorway pec stretch",
  steps: ["Stand in doorway…", "Hold 30s…"],
  dosage: { sets: 2, duration: "30s", sides: "each" },
  kind: "stretch"
}
```
**Count:** 35 remedies across ~25 muscles. `forState` ∈ `"tight" | "weak"`.

---

## `movements.js` (L4)

**Exports:** `MOVEMENTS`, `getMovement(id)`, `getRecruitmentMap(movementId, phase?)`
**Shape:**
```js
{
  id: "bench-press",
  label: "Bench press",
  phases: ["eccentric", "concentric"],
  recruitment: [
    { muscleBaseId: "pec-major", role: "primary", phases: ["eccentric", "concentric"] },
    { muscleBaseId: "triceps-long", role: "secondary", phases: ["concentric"] },
    ...
  ]
}
```
**Count:** 10 movements — bench, squat, deadlift, OHP, barbell row, pull-up, lunge, RDL, hip thrust, face pull.
**Roles:** `primary` (red), `secondary` (purple), `tertiary` (green).

---

## Storage (L2)

Not a data module — lives in localStorage. See `_config/storage-schema.md`.

---

## Adding to any data module

1. Look up the base ID in `bodymap-app/src/muscle-data.js` (`SUB_MUSCLES`). If it doesn't exist, add it there first.
2. Append the entry with a brief header comment citing anatomical reasoning.
3. Run the build gate: `cd c:\phsioclick\bodymap-app && npx vite build`.
4. Update counts in `PROJECT_NOTES.md`, `BODY_MODEL_ROADMAP.md`, and `shared/body-model.md`.
