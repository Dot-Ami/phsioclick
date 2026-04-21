# Current state model — what exists to extend

Source-code anchors for Stage 02's designers. Nothing here is a proposal; this is the as-built shape.

---

## 1. Where state is stored

**Key:** `dot-body-map-v3` (localStorage). See `_config/storage-schema.md` for the full shape.

Loaded and saved in `bodymap-app/src/BodyMapApp.jsx` in the `useEffect` blocks that wrap:

- `entries` state
- `assessments` state
- `muscleStates` state

Serialization is a single JSON blob round-trip. Import/export use the same blob.

---

## 2. Where state mutates

| Mutation | Handler | Location |
|----------|---------|----------|
| Add/edit/delete log entry | `handleSaveEntry`, `handleDeleteEntry` | `BodyMapApp.jsx` |
| Add/delete assessment | `handleSaveAssessment`, `handleDeleteAssessment` | `BodyMapApp.jsx` |
| Flip muscle state | `handleSetMuscleState(muscleId, state)` | `BodyMapApp.jsx` — **this is the point where a state-change log would be appended** |
| Intake wizard flip | `SessionPlanner`'s `IntakeWizard` calls `onSetState` prop, which is `handleSetMuscleState` | `BodyMapApp.jsx` passes `onSetState={handleSetMuscleState}` to `SessionPlanner` |

All state flips flow through `handleSetMuscleState`. Single extension point for an append-only change log — this is good news for Stage 02.

---

## 3. Where state is read

| Reader | File | Purpose |
|--------|------|---------|
| `MuscleStatePanel` | `src/MuscleStatePanel.jsx` | Read current state, offer toggle UI |
| `RemedyPanel` | `src/RemedyPanel.jsx` | Gate remedy visibility on non-normal state |
| `SessionPlanner` | `src/SessionPlanner.jsx` | Build session/weekly/symmetry plans |
| Heat map on Dashboard | inside `BodyMapApp.jsx` / `MuscleAtlas` | Color atlas by current state |
| Export | `BodyMapApp.jsx` | Include `muscleStates` in export JSON |

---

## 4. Where time-series already exists

`TrendCharts.jsx` renders two Recharts charts — both are derived in `BodyMapApp.jsx`:

- `timelineData` — last 40 entries, sorted by date, showing intensity.
- `assessmentTrendData` — assessments grouped by date, averaged per day, sorted chronologically.

Both compute from their raw arrays with `useMemo`. **This is the pattern Stage 02 will replicate** for new metrics: derive a memoized shape from the raw state-change log and pass it to a chart (or summary card).

---

## 5. Legacy ID compatibility

- All `muscleStates` keys pass through `migrateLegacyId()` on load.
- Any new state-change log must apply the same migration when importing older exports.
- Schema version bump (2 → 3) triggers a migration block in the load path — follow the existing `schemaVersion === 1` pattern (already written; used when v2 was introduced).

---

## 6. ID normalization helpers

From `src/muscle-data.js`:

- `fromMuscleId(id)` → `{ slug, side }` (parses `"pec-upper-l"` → `{ slug: "pec-upper", side: "l" }`)
- `toMuscleId(slug, side)` → `"pec-upper-l"`
- `getMuscleLabel(id)` → human-readable label

Use these everywhere. **Never** split IDs with regex or `.slice()` in new code.

---

## 7. What a state change looks like today

When the user toggles a muscle from `normal` to `tight`:

```js
handleSetMuscleState("pec-upper-l", "tight");
// → setMuscleStates(prev => ({
//     ...prev,
//     "pec-upper-l": { state: "tight", updatedAt: new Date().toISOString() }
//   }))
```

No record of the previous state, no record that a flip happened. Add a log append here.

---

## 8. Suggested extension point (for the plan — not a directive)

In `handleSetMuscleState`, after computing the new state:

```js
setStateChanges(prev => [
  ...prev,
  {
    id: uuid(),
    muscleId,
    fromState: muscleStates[muscleId]?.state ?? "normal",
    toState: state,
    timestamp: new Date().toISOString(),
    source: "manual" // | "intake-wizard" | "import"
  }
]);
```

…then persist `stateChanges` alongside `muscleStates` in the same localStorage blob under a new `stateChanges` key, with `schemaVersion` bumped to 3. The plan should confirm or revise this shape.
