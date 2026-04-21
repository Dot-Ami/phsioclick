# Stage 02 — Confirmed decisions

> Companion to [`plan.md`](./plan.md). This is the user-confirmed answers to the six decision forks surfaced in [`../CONTEXT.md`](../CONTEXT.md) §Process.1.
> Date confirmed: 2026-04-16.

---

## Decision table

| # | Decision | Options considered | Confirmed answer | Rationale |
|---|----------|--------------------|------------------|-----------|
| 1 | **Where does state history live?** | (a) Append-only log in same `dot-body-map-v3` blob, bump `schemaVersion` 2 -> 3 *(recommended)* (b) Separate localStorage key (c) Migrate to IndexedDB | **(a) Append-only log, same blob, bump to v3.** | Keeps the single-file export/import contract intact, minimizes migration surface, and avoids over-engineering for v1 volumes. IndexedDB is revisitable in Stage 03+ if log size becomes a problem. |
| 2 | **What granularity for state changes?** | (a) Per-flip events *(recommended)* (b) Daily snapshot (c) Both | **(a) Per-flip events, with optional opt-in daily snapshot on first open of each local day.** | Per-flip is the minimum primitive everything else derives from. A daily snapshot is redundant for derivation but useful for cheap "what did the map look like on day X" queries; ships opt-in in F-Phase 3 at earliest. |
| 3 | **Symmetry index definition** | (a) Per-muscle L/R delta + rolling composite *(recommended)* (b) Janda-style cross pattern (c) Composite score | **(a) Per-muscle L/R delta + rolling composite (mean across flagged muscles).** | Transparent, explainable, and maps 1:1 to user-facing base IDs. Janda-style weighting is clinically opinionated and deserves Stage 03 treatment once we have movement + edge data maturity. |
| 4 | **Adherence tracking** | (a) Explicit checkboxes *(recommended)* (b) Infer from log entries (c) Skip for v1 | **(a) Explicit "did this remedy" checkbox on the planner session view, minimal UI.** | Inference is unreliable without a coached structure; skipping breaks the "did the remedies help?" question entirely. Explicit + minimal keeps friction low. |
| 5 | **Goal system** | (a) Freeform text (b) Structured targets tied to muscle IDs *(recommended)* (c) Skip for v1 | **(b) Structured targets tied to muscle IDs, four fixed `kind`s (`reduce-flagged-days`, `improve-symmetry`, `hit-adherence`, `freeform`) plus optional freeform notes.** | Structure is what unlocks progress-bar UX and `onTrack` logic. Freeform is preserved as an escape valve for goals we haven't modeled. New `kind`s can be added without schema changes. |
| 6 | **Dashboard surface** | (a) New "Progress" tab (b) Expand existing Dashboard + planner-inline *(recommended)* (c) Both | **(b) Expand Dashboard with widgets + add "since last week" inline micro-summary in the Planner. No new tab.** | Keeps navigation surface stable for existing users, puts progress next to where they act on it (the planner), and avoids a tab-proliferation anti-pattern. A dedicated tab can be revisited if widgets outgrow Dashboard space. |

---

## Downstream consequences locked in by these answers

- **Storage.** `dot-body-map-v3` key stays. `schemaVersion` bumps to 3. Migration is additive and written in `BodyMapApp.jsx` load path.
- **Export/import.** Single JSON file continues to round-trip. New fields (`stateChanges`, `goals`, `adherence`, `dailySnapshots`) are part of the blob.
- **Metrics derivation.** Every metric in `plan.md` §2 is computed from raw arrays passed into pure functions — no metric requires a new persistence shape beyond what's specified here.
- **UI footprint.** Five new Dashboard widgets + one planner-inline card + one adherence affordance per remedy + one goals panel (drawer or Dashboard card). No new top-level tab.
- **Scope preserved.** No server, no ML, no medical claims, no new muscle IDs. Every new data record keys off `SUB_MUSCLES` base IDs via `fromMuscleId()` / `toMuscleId()`.

---

## Decisions deliberately deferred

These came up adjacent to the six forks above and are explicitly punted:

- **Janda cross-pattern weighting** — deferred to Stage 03 (deeper intelligence).
- **IndexedDB migration** — deferred. Revisit if `stateChanges` grows past ~10k events or cold-load perf regresses.
- **Multi-user / cloud sync** — out of scope; requires a backend decision that is not on the table.
- **Inference-based adherence** — deferred until explicit adherence data is available to train against.
- **Pearson / statistical correlation on M9** — deferred. v1 displays two lines on one chart; no scoring.
- **Coach / clinician view** — deferred (Stage H, unscoped).
