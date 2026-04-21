# Stage 02 — Tracking & metrics (Track F) — planning

> **Status:** ☑ **Planning shipped** 2026-04-16. `output/plan.md` + `output/decisions.md` are authoritative; F1–F9 ticket bodies and the v3 schema spec are stable.
> **Implementation lives in:** [`stages/02b-tracking-implementation/`](../02b-tracking-implementation/CONTEXT.md) — scaffolded 2026-04-19 after Stage 02-A.5 closed. That stage is the **active stage today**; it consumes this folder's `output/plan.md` ticket-by-ticket and writes its receipts into `02b-tracking-implementation/output/completion-log.md`.
> **Do not edit `output/plan.md` from the implementation stage.** If a spec change is needed, raise it with the user, amend `plan.md` here, and reference the diff from the implementation stage's completion log. Planning artifacts are read-only inputs to 02-B.
> **What 02-A.5 already built that 02-B drops into:** the `useBodyBalanceScore()` hook (single swap-point for header chip + Today hero + future consumers), the Progress hero / supporting / accordion slot contracts (`TODO(stage-02-b)` comments name the exact metric ID + module), in-memory `goals[]` (F5 promotes this to v3 storage), and `kind: "adherence"` rows in `entries[]` (F6 splits these into a dedicated `adherence[]` catalog).

---

## Why this stage exists

After v1 shipped, the user explicitly asked:

> *"because I do need to [know] where we are in the over-arching long-term goal and how we're tracking metrics"*

Today the app captures point-in-time snapshots (muscle states, entries, assessments) but has **no systematic way to answer**:

1. *Am I getting more balanced over time?*
2. *Is the tight hip I flagged three weeks ago actually resolving?*
3. *Am I following through on the remedies the planner suggested?*
4. *Which movements or muscles are trending in the wrong direction?*

Stage 02 designs the metrics & tracking system that fills that gap. It is the bridge between "the app captured data" and "the app tells you whether you're progressing against your goals."

---

## Inputs

Read in this order.

| File | Purpose | Why |
|------|---------|-----|
| `CLAUDE.md` | Identity + non-negotiables | Always |
| `CONTEXT.md` (root) | Stage ledger, confirms this stage is active | Always |
| `_core/CONVENTIONS.md` | Invariants (IDs, storage schema, build gate) | Any data-shape decision depends on these |
| `shared/body-model.md` | L0–L5 layer definitions | So tracking metrics map cleanly onto layers |
| `_config/storage-schema.md` | Current persistence shape | You are extending this |
| `references/tracking-gap-analysis.md` (this stage) | Exactly what's missing today | Primary problem statement |
| `references/current-state-model.md` (this stage) | Snapshot of how state/entries/assessments work now | Starting point for extensions |
| `stages/01-v1-foundation/output/completion-log.md` | What already shipped | Don't re-design what exists |
| `PROJECT_NOTES.md` §Storage + §App Tabs (legacy) | Full context on what data flows through the app | Reference |

**Do not read** `BODY_MODEL_ROADMAP.md` cover-to-cover unless the user asks a specific layer question. It's long.

---

## Process

You are in **planning mode, not implementation mode.** Do not write application code in this stage unless the user explicitly asks. Focus on decomposition, sequencing, and decision points.

### 1. Confirm scope with the user

Before producing specs, surface these forks and recommend a v1 default for each:

| Decision | Options | Recommend for v1 |
|----------|---------|------------------|
| Where does state history live? | Append-only log in localStorage / separate keyed collection / migrate to IndexedDB | Append-only log, same localStorage key, schema bump to v3 |
| What granularity for state changes? | Per flip (tight→normal is one event) / daily snapshot / both | Per flip, with optional daily snapshot on open |
| Symmetry index definition | L/R delta per muscle / Janda-style cross pattern / composite score | Per-muscle L/R delta + rolling composite |
| Adherence tracking | Explicit "I did this remedy" checkboxes / infer from log entries / skip for v1 | Explicit check, minimal UI |
| Goal system | Freeform text / structured targets (e.g. "reduce L-hip-flexor tight days by 50%") / skip for v1 | Structured targets, tied to muscle IDs |
| Dashboard surface | New "Progress" tab / expand existing Dashboard / planner-inline summary | Expand Dashboard + planner-inline summary |

Flag these, recommend defaults, and **do not block** the rest of the plan on unresolved ones.

### 2. Produce the plan (output contract)

Write a single structured spec at `output/plan.md` with these sections:

1. **Executive summary** — 5–8 bullets: what we're building, in what order, and why.
2. **Metric catalog** — every metric the system will compute, with definition, required inputs, output shape, and which layer (L0–L5) it illuminates.
3. **Data model extensions** — schema diff from current `_config/storage-schema.md` (additions only; preserve backward compat). Include a migration note.
4. **Work breakdown** — numbered tickets F1, F2, …, each with:
   - Purpose
   - Inputs (files / data)
   - Acceptance criteria (2–4 bullets)
   - Rough effort (S / M / L)
   - Risk (low / med / high)
   - Dependencies (which tickets block it)
5. **Phased roadmap** — F-Phase 0 → F-Phase N. Each phase names a demoable milestone and its exit criteria.
6. **Open decisions** — table from §1 above, with the user's confirmed answers once they've chimed in.
7. **First three concrete tickets** — titles + 2–3 acceptance criteria, ready to paste as todos for the next implementation session.

### 3. Hand off

Once `output/plan.md` is approved by the user, this stage's contract is met. The implementation session opens a new chat, reads the plan, and executes ticket by ticket — probably as **Stage 02.5** (implementation) with its own `CONTEXT.md` created at that time, or inline under this stage's `output/` if the plan is short enough to execute in one pass.

---

## Outputs

| File | Required? | Description |
|------|-----------|-------------|
| `output/plan.md` | ✅ | Full spec per §2 of Process |
| `output/decisions.md` | ✅ | User-confirmed answers to the decision table |
| `output/metric-catalog.md` | optional | If metric catalog grows past ~5 metrics, split it out of `plan.md` for readability |
| `output/schema-v3-migration.md` | optional | If the schema bump is non-trivial, detail the migration here |

---

## Constraints specific to this stage

Beyond `_core/CONVENTIONS.md`:

- **Schema bumps are expensive.** If v3 is needed, justify it and write the migration spec. Preserve every existing field.
- **New data must survive export/import.** The existing JSON round-trip must continue to work; new fields belong inside the same blob at the existing key.
- **No backend.** v1 is localStorage-only. Don't design features that require a server unless the user explicitly opens that door.
- **Respect the non-medical stance.** Progress metrics are self-coaching signals, not clinical measurements. Copy around them should reflect that.
- **Bilateral aggregation.** Every metric that can be computed per-side should also produce a base-ID aggregate so downstream UIs can show either.

---

## How to start (for the new chat)

**You are almost certainly in the wrong place if you landed here for implementation work.** Planning is shipped. Open [`stages/02b-tracking-implementation/CONTEXT.md`](../02b-tracking-implementation/CONTEXT.md) — that's where execution lives.

If you're here to **read** the planning record:

1. Read `CLAUDE.md`, `CONTEXT.md` (root), this file.
2. Read `output/plan.md` (the F1–F9 spec) and `output/decisions.md` (the six confirmed decisions).
3. Cross-reference `references/tracking-gap-analysis.md` and `references/current-state-model.md` for the original gap.

If you're here to **amend** the planning record (rare): make the edit in `output/plan.md` here, note the diff in the implementation stage's `output/completion-log.md`, and confirm with the user before any code work resumes.
