# Schema delta — UX foundation additions

> Three small additions to the Stage 02 v3 schema. **No schema-version bump.** Stage 02 already plans `schemaVersion: 3`; we add three optional fields inside the same blob.

Sources:
- Base schema: [`_config/storage-schema.md`](../../../_config/storage-schema.md)
- Stage 02 additions (v3 base): [`stages/02-tracking-metrics/output/plan.md`](../../02-tracking-metrics/output/plan.md) §3.1
- Spec drivers: [`gamification-spec.md`](./gamification-spec.md), [`onboarding-flow.md`](./onboarding-flow.md)

---

## Diff against Stage 02's v3 blob

```diff
 {
   "schemaVersion": 3,
   "entries":        [ ... ],
   "assessments":    [ ... ],
   "muscleStates":   { ... },
   "stateChanges":   [ ... ],
   "goals":          [ ... ],
   "adherence":      [ ... ],
   "dailySnapshots": [ ... ],
+
+  "streak": {
+    "current": 0,
+    "longest": 0,
+    "lastActiveDate": null
+  },
+
+  "milestones": [
+    { "id": "first-flip", "achievedAt": "2026-04-10T18:22:11.014Z" }
+  ],
+
+  "onboarding": {
+    "completedAt": null,
+    "intent": null,
+    "tourSeen": {}
+  }
 }
```

---

## Field-by-field

### `streak`

```ts
type Streak = {
  current: number;            // consecutive days of meaningful activity
  longest: number;            // best ever
  lastActiveDate: string|null; // local YYYY-MM-DD; null if never active
};
```

- Updated by a single `recordActivity(now)` helper called from every meaningful-action handler (see [`gamification-spec.md`](./gamification-spec.md) §2 for full update logic).
- `lastActiveDate` is a **local-calendar** date string, not an ISO timestamp, because "did the user do something today?" is a calendar question, not a timezone-of-event question.
- Default on cold-start: `{ current: 0, longest: 0, lastActiveDate: null }`.

### `milestones`

```ts
type Milestone = {
  id: string;        // matches catalog id from gamification-spec.md §3
  achievedAt: string; // ISO-8601 timestamp
};
```

- Append-only. Once a milestone fires it stays in `milestones[]` for life of the user's data.
- Catalog source of truth: `bodymap-app/src/data/milestones.js` (new module created in Stage 02-A.5 ticket U8).
- Unknown ids on import are preserved verbatim, so future catalog additions don't break old exports.

### `onboarding`

```ts
type Onboarding = {
  completedAt: string|null;                          // ISO when user finished or skipped wizard
  intent: 'tight-area'|'balance-training'|'rehab'|'learn'|null;
  tourSeen: { [tabName: string]: boolean };          // 'today' | 'body' | 'plan' | 'progress'
};
```

- `completedAt === null` means the wizard has never been seen and will fire on next load.
- `intent === null` means the user skipped the intent picker.
- `tourSeen` is open-shaped so future per-tab tours can append without schema changes.

---

## Migration

**No schema version bump required.** The Stage 02 migration (v2 -> v3, see [`stages/02-tracking-metrics/output/plan.md`](../../02-tracking-metrics/output/plan.md) §3.2) is extended in Stage 02-A.5 ticket U8 to also initialize these three fields when missing:

```js
// inside the Stage 02 migration block, after initializing stateChanges/goals/adherence/dailySnapshots
if (!data.streak)      data.streak      = { current: 0, longest: 0, lastActiveDate: null };
if (!data.milestones)  data.milestones  = [];
if (!data.onboarding)  data.onboarding  = { completedAt: null, intent: null, tourSeen: {} };
```

This means:

- A v2 user upgrading -> sees the onboarding wizard on next load (good — they finally get the intro).
- A v3 user from Stage 02 implementation (without UX additions) -> also sees the wizard on next load. Same result.
- A v3 user from Stage 02-A.5+ -> nothing fires, blob already has the fields.

### Backward compatibility on import

If the user imports an older blob that lacks any of the three fields, the loader applies the same defensive defaults as on initial load. **No data is dropped** — even if the imported blob has unknown fields (e.g. from a future version), they survive a load + save round-trip via the existing pass-through pattern in [`bodymap-app/src/BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx)'s save effect.

### Export round-trip

All three new fields are part of the same `dot-body-map-v3` blob, so the existing JSON export already includes them automatically once they're added to the React state and the save effect serializes the full state.

Stage 02 ticket F9 (export/import QA) extends to verify these three fields round-trip.

---

## Why no version bump

Schema-version bumps are expensive (per [`stages/02-tracking-metrics/CONTEXT.md`](../../02-tracking-metrics/CONTEXT.md) §Constraints). These three additions:

- Add fields, never remove or rename any existing field.
- Have safe defaults that work for any user state.
- Don't change semantics of any existing field.

That's the textbook "additive change, no version bump needed" pattern. We piggyback on Stage 02's v3 bump and stay within `schemaVersion: 3`.

---

## Storage-schema doc update

The Stage 02 F9 ticket already plans to update [`_config/storage-schema.md`](../../../_config/storage-schema.md) with the v3 shape. Stage 02-A.5 ticket U8 extends that doc update to include `streak`, `milestones`, and `onboarding`.

After both stages ship, the canonical v3 shape in `_config/storage-schema.md` is:

```jsonc
{
  "schemaVersion": 3,
  "entries":        [...],
  "assessments":    [...],
  "muscleStates":   {...},
  "stateChanges":   [...],
  "goals":          [...],
  "adherence":      [...],
  "dailySnapshots": [...],
  "streak":         { "current": 0, "longest": 0, "lastActiveDate": null },
  "milestones":     [],
  "onboarding":     { "completedAt": null, "intent": null, "tourSeen": {} }
}
```

---

## Acceptance criteria for Stage 02-A.5 ticket U8 (data-side)

- Migration initializes `streak`, `milestones`, `onboarding` for any blob missing them, including freshly v3-migrated and pure-v2 blobs.
- Import preserves these fields verbatim; missing-field blobs get defaults applied.
- Export includes all three fields.
- No regression in Stage 02's `stateChanges` / `goals` / `adherence` / `dailySnapshots` round-trip.
- `_config/storage-schema.md` reflects the full final v3 shape.
