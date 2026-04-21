# Dot Body Map — Body model, roadmap, and order of operations

> **ICM note (2026-04):** The high-level stage ledger and active-work routing now live in `CONTEXT.md` (root) and `stages/*/CONTEXT.md`. This document remains the canonical reference for **L0–L5 layer definitions, phase status tables, and data conventions**. When working in a stage, read `shared/body-model.md` first; drop here when you need the full history.

This document is the **working map** for intelligence features: what we are building, **in what order**, and how to **track progress**. It complements [`PROJECT_NOTES.md`](./PROJECT_NOTES.md) (product intent, atlas, tech) and [`NEXT_CHAT_PROMPT.md`](./NEXT_CHAT_PROMPT.md) (atlas architecture handoff).

**Principles**

- Prefer **correct sequencing** over cutting scope; use status columns to see what is done vs next.
- The app's **join key** for all new data remains **stable muscle / region IDs** and **atlas slugs** (see `muscle-data.js`).
- **Male atlas** is the reference implementation until **female parity** is explicitly scheduled.

---

## 1. Layered body model (conceptual stack)

We are not building one monolithic "AI." We are stacking **layers**, each depending on the one below.

| Layer | Name | What it answers | Depends on |
|-------|------|-----------------|------------|
| **L0** | **Movement & mechanics** | What each muscle *does* (actions, joints, planes), how joints move (DOF), **agonist / antagonist** pairs, synergist patterns. "How is the body *supposed* to move?" | Atlas + `muscle-data` IDs |
| **L1** | **Inter-regional relationships** | How regions **influence** each other: adjacency, referral-like patterns, **compensation** ("X works harder because Y is stiff/weak"), load chains. "Why might *this* show up when *that* is the story?" | L0 (roles + pairs make explanations honest) |
| **L2** | **State on the map** | User-marked **tight / weak** (and similar), L/R, history. | L0 IDs; optional L1 for smarter defaults |
| **L3** | **Remedies & interventions** | Stretch, strengthen, drill, tempo, cue — **steps** tied to muscles / states. | L2; stronger when L1 explains *why* |
| **L4** | **Movements & recruitment** | Named movements → `{ muscleId, role }` + phase timing; **red / purple / green** on paths. | L0 (actions align with recruitment) |
| **L5** | **Guided planning / diagnostic-style flow** | Intake → hypotheses → session / week plan; disclaimers. | L1–L4 + copy |

**Author alignment:** *Model how the body is supposed to move (L0) before encoding rich "this hurts → try that distant area" graphs (L1).* That order reduces hand-wavy edges and makes compensation narratives checkable against mechanics.

---

## 2. Recommended order of operations (milestones)

### Phase A — L0 foundation (movement & mechanics) ✅

**Goal:** A **queryable biomechanics layer** in data (not yet full UI polish): every muscle we care about has structured **primary actions**, **joints crossed**, **planes** (sagittal / frontal / transverse where applicable), and **antagonist / synergist** links by ID.

**Why first**

- Agonist–antagonist facts (e.g. elbow flexors vs extensors) are **stable** and **teachable**; they ground later "overcompensation" stories.
- Complex areas (spine, hip, shoulder, wrist) need **explicit joint/segment modeling** so we do not collapse everything into one vague "rotates."
- Movement recruitment (L4) and plausible compensation (L1) both **consume** the same action/pairing data.

**Concrete increments (smallest shippable)**

1. **L0.1 — Schema** — Define JSON/TS shapes for: `MuscleMechanics`, `JointSegment`, `MuscleJointContribution`, `AntagonistPair` (see §5).
2. **L0.2 — Joint catalog** — Enumerate segments you will support first (e.g. GH joint, scapulothoracic, elbow, radioulnar, wrist, hip, lumbar, cervical — **start subset**, expand).
3. **L0.3 — Seed mechanics** — Pilot on **simple 1-DOF-style pairs** (biceps ↔ triceps at elbow; hamstrings ↔ quads at knee; etc.), then shoulder, hip, spine.
4. **L0.4 — Validation rules** — Document conventions: "antagonist is pair-wise," "multi-joint muscles list all crossed joints," "plane tags optional but recommended for global muscles."
5. **L0.5 — App surfacing (minimal)** — Read-only panel or dev view: select muscle → show actions + antagonists from data (even before pretty UX).

**Exit criteria**

- For a defined **pilot set** of muscles (e.g. 25–40 IDs), every entry has **at least** primary actions + one **joint** + **antagonist** where anatomically clear.
- `vite build` passes; no breaking changes to Log/Dashboard/export.

**Status**

| Increment | Status | Notes |
|-----------|--------|-------|
| L0.1 Schema | ☑ done | `bodymap-app/src/data/joints.js`, `muscle-mechanics.js` + JSDoc |
| L0.2 Joint catalog | ☑ done | 9 joints: ankle, wrist, scapula, lumbar/cervical + 4 originals; omissions documented in file header |
| L0.3 Seed (simple pairs) | ☑ done | All SUB_MUSCLES covered (~55 entries); TFL antagonist corrected; conventions in file headers |
| L0.4 Validation rules | ☑ done | §2a + INTENTIONALLY OMITTED list in `joints.js` + `muscle-mechanics.js` headers |
| L0.5 Minimal UI / dev view | ☑ done | Log tab: `MuscleMechanicsPanel` under Body Intelligence |

**Code:** `bodymap-app/src/data/joints.js` (`JOINTS`, `getJoint`), `bodymap-app/src/data/muscle-mechanics.js` (`MUSCLE_MECHANICS`, `getMuscleMechanics`, `listMechanicsBaseIds`), `bodymap-app/src/MuscleMechanicsPanel.jsx`.

#### 2a. L0.4 — Data conventions (done)

- **Join keys:** Every `antagonistSubIds` / `synergistSubIds` entry MUST match a `SUB_MUSCLES` **base** `id` (no `-l`/`-r` in the data file).
- **Multi-joint muscles:** List every crossed joint in `jointIds`; use `notes` when one joint is secondary.
- **Antagonists:** "Functional opposite" for the **primary** actions in `primaryActionKeys` — not every possible co-contraction. Prefer 2–6 ids; mark debatable pairs in `notes` if needed.
- **Planes:** `planeTags` summarize the **dominant** plane for the listed actions; optional when redundant.
- **Versioning:** Bump `MUSCLE_MECHANICS_SCHEMA_VERSION` / `JOINTS_SCHEMA_VERSION` when removing or renaming keys (migration note in changelog).

#### 2b. Atlas labeling, geometry & clicks (game plan)

**Truth sources**

1. **SVG paths** (`atlas-assets`, vendor) — what the user can hit-test; may not match textbook boundaries.
2. **`muscle-data.js`** — parent/subs, labels, maps to slugs.
3. **`muscle-mechanics.js`** — L0 mechanics (orthogonal to SVG fidelity).

**Known issues (resolved)**

- **Dead `back-rhomboids` slug** — ☑ Fixed: removed from `ATLAS_SLUG_TO_SUB` and `PARENT_TO_ATLAS_SLUGS`; rhomboid-major/minor now proxy to `back-lats` in `SUB_TO_ATLAS_SLUG`.

**Known issues (open)**

- **Stacking order:** SVG paints later paths on top; a smaller/lateral path can steal clicks from the shape "under" it. Fix = reorder parts in `bodyFront`/`bodyBack` exports or trim path geometry (long-term).
- **Vendor limits:** Female atlas is still stock; hip flexors use **proxy** highlights; rhomboids share `back-lats` path.

**Interaction rule (2026-04):** Map click **always** applies selection immediately — **no sub-muscle modal**. Split slugs (`ATLAS_SLUG_TO_SUB`) → sub id; parents with subs → `{parent}-l|r` whole group; refine subs via **Log origin dropdown** only. Front **neck** `common` path uses **pointer X vs SVG midline** to choose L/R (`atlas-pointer-utils.js`).

**QA checklist (when touching atlas)**

1. Click each **parent** region L and R → correct `slug` in devtools / expected highlight extent.
2. Click each **split** sub-path → correct sub id and highlight.
3. Hover label sanity vs clicked slug.
4. **Slug map consistency** — any atlas slug in `ATLAS_SLUG_TO_SUB` or `PARENT_TO_ATLAS_SLUGS` must have a matching path in `bodyFront.js` or `bodyBack.js`; remove dead slugs immediately.
5. `npx vite build` + smoke Log/Dashboard/Planner.

**Future:** optional in-map sub-picker as a **non-blocking** chip row (not a centered modal); poster / Wikimedia swap if geometry limits training use.

---

### Phase B — L1 inter-regional relationships ✅

**Goal:** **Edges** between regions/muscles with **mechanism text**, **confidence**, and **tags** (e.g. compensation, adjacency, referral-style, load-chain). This is where "low back story → foot work" or "neck → traps" lives — but **grounded** in L0 vocabulary.

**Concrete increments**

1. **L1.1 — Edge schema** — `{ from, to, kind, mechanism, confidence, tags }` (align with earlier game plan).
2. **L1.2 — Curated v1 set** — Start with **high-confidence mechanical chains** (e.g. ankle–knee–hip; scapular stability ↔ GH) before folklore chains.
3. **L1.3 — UI: hypothesis list** — From selection, show inbound/outbound edges; filter by `kind`.
4. **L1.4 — Grow library** — Add compensatory / "clinical heuristic" edges **only** when L0 can justify or you mark `confidence` low + disclaimer.

**Exit criteria**

- ≥30 curated edges with explicit `kind` + mechanism; no orphan `from`/`to` IDs outside `muscle-data`.
- User can trace **why** an edge exists (mechanism string), not only **that** it exists.

**Status**

| Increment | Status | Notes |
|-----------|--------|-------|
| L1.1 Edge schema | ☑ done | `src/data/relationship-edges.js` — schema + `getEdgesForMuscle`, `getEdgesByKind` |
| L1.2 Curated v1 | ☑ done | 15 edges: lower-chain, scapular/GH, cervical/upper-cross, core, posterior oblique sling |
| L1.3 Hypothesis UI | ☑ done | `RelationshipEdgesPanel.jsx` — filter by kind, confidence bar, tag chips |
| L1.4 Library growth | ☑ done | 32 edges; exit target ≥30 met |

---

### Phase C — L2 state on the map ✅

**Goal:** Persisted **tight / weak** (and variants) per `muscleId`, L/R, optional history.

**Dependency note:** Can start **after L0.1** (IDs stable). Doing it **after L0.3** avoids rework if state UI wants to show "antagonist balance."

**Status**

| Item | Status | Notes |
|------|--------|-------|
| Persist tight/weak | ☑ done | `MuscleStatePanel.jsx` + `muscleStates` in localStorage (schemaVersion:2) |
| L/R + history / charts | ☑ done | State stored with timestamp; L/R symmetry view in Planner; history charts use real dates |
| Export/import includes state | ☑ done | `muscleStates` in export JSON + import hydration |

---

### Phase D — L3 remedies ✅

**Goal:** Remedy objects (steps, cautions, type) keyed by muscle + state; grow library.

**Status**

| Item | Status | Notes |
|------|--------|-------|
| Remedy schema + module | ☑ done | `src/data/remedies.js` — `REMEDIES`, `getRemedies`, `getAllRemediesForMuscle` |
| Seed content (10+ muscles) | ☑ done | 11 remedies for 8 muscles: gastroc, glute-max, iliopsoas, upper-trap, lower-trap, pec-minor, erector-spinae, serratus-ant, rectus-abdominis |
| Detail UI | ☑ done | `RemedyPanel.jsx` — shows ordered steps + cautions when state is tight/weak |

---

### Phase E — L4 movements & recruitment coloring ✅

**Goal:** Movement catalog + phase timeline + **primary / secondary / tertiary** tint on atlas paths.

**Status**

| Item | Status | Notes |
|------|--------|-------|
| Movement + recruitment schema | ☑ done | `src/data/movements.js` — `MOVEMENTS`, `getMovement`, `getRecruitmentMap` |
| First lift (e.g. bench) | ☑ done | Bench press, back squat, deadlift seeded; tint passed through `MuscleAtlas` via `recruitmentTint` prop |
| Additional lifts | ☑ done | 10 lifts: bench, squat, deadlift, OHP, row, pull-up, lunge, RDL, hip thrust, face pull |

---

### Phase F — L5 guided planner + disclaimers ✅ (v1)

**Goal:** Intake wizard → ranked hypotheses → session plan; **scope / not medical advice** copy.

**Status**

| Item | Status | Notes |
|------|--------|-------|
| Disclaimer + about copy | ☑ done | Footer on every page: "decision-support / educational, not medical advice" |
| Wizard v1 | ☑ done | `SessionPlanner.jsx` — rules-based 3-section plan from muscle states + L1 edges; Planner tab added |
| Plan output templates | ☑ done | Session/weekly/symmetry views; intake wizard; sets/reps in remedies |

---

### Ongoing / parallel tracks

| Track | Purpose | Status |
|-------|---------|--------|
| Female atlas parity | Same splits as male where feasible | ☐ todo |
| Atlas backlog (deep rotators, tib post, etc.) | `PROJECT_NOTES.md` Future Backlog | ☐ todo |
| Storage versioning | `schemaVersion` in localStorage blob + migration | ☑ done (schemaVersion:2) |
| L1 edge library growth | ≥30 edges with mechanism + confidence | ☑ done (32/30+) |
| L3 remedy library growth | More muscles, more states, video links | ☑ done (35 remedies, ~25 muscles) |
| L4 movement catalog growth | More lifts (overhead, row, lunge, pull-up) | ☑ done (10 lifts) |

---

## 3. Full pillar checklist (from game plan — cross-reference)

Use this so nothing "falls off" the radar; **order** follows §2.

**Product intent**

- [x] Workout planning hooks — Planner tab + Movement Recruitment viewer ☑
- [x] Tight vs weak awareness — `MuscleStatePanel` + `RemedyPanel` ☑
- [x] Body balance / symmetry summaries — Dashboard L/R summary (L/R state map pending)

**North star capabilities**

- [x] Cause and effect — L1 edges + `RelationshipEdgesPanel` ☑
- [x] Tight/weak + remedies — L2 state + L3 remedies ☑
- [x] Movement visualization + recruitment colors — L4 `MovementRecruitmentPanel` + atlas tint ☑
- [x] Guided diagnostic-style flow — `SessionPlanner` v1 ☑

**Cross-cutting**

- [x] Stable IDs only for joins — invariant ☑
- [ ] Female parity when feature needs granularity — parallel track
- [x] Disclaimers / scope — footer disclaimer live ☑
- [x] No unnecessary rewrite — prefer `data/` modules + incremental UI ☑

---

## 4. Opinion: your sequencing vs alternatives

**Your instinct (L0 mechanics → L1 relationships) is the right default** for a system that should stay **explainable** and **extensible**. Compensation stories without an action/pairing layer tend to become a bag of anecdotes; with L0, each L1 edge can cite **joint context**, **antagonist slack/tone**, or **kinetic chain** language.

**Nuances (so we do not stall)**

1. **Parallelism:** You can **draft L1 edge schema** while seeding L0 content, as long as **high-confidence edges** wait for L0 for the involved muscles.
2. **"Simple" L1:** Pure **topological adjacency** on the atlas ("neighbors on the map") is almost free and does not require full L0 — but it is weak for compensation; treat it as optional garnish, not a substitute for mechanics.
3. **Remedies before full L1:** Still possible for **user value**, but the roadmap above defers heavy **hypothesis** UX until L1; remedies can reference L0 actions ("strengthen elbow extension" ↔ triceps).

**Summary:** The foundation sequence (L0 → L1 → L2 → L3 → L4 → L5) is implemented in v1. All layers are live. Next work grows the data libraries (edges, remedies, movements) and deepens the Planner.

---

## 5. Data model sketch — reference shapes

**Joint / segment**

```json
{
  "id": "joint-elbow",
  "label": "Elbow",
  "degreesOfFreedom": [
    { "kind": "flexion-extension", "plane": "sagittal" }
  ]
}
```

**Muscle mechanics (per logical muscle, L/R applied at runtime)**

```json
{
  "muscleId": "biceps-long",
  "primaryActions": ["elbow-flexion", "supination-assist"],
  "jointIds": ["joint-elbow", "joint-gh"],
  "planeTags": ["sagittal"],
  "antagonistSubIds": ["triceps-long", "triceps-lateral", "triceps-medial"],
  "synergistSubIds": ["brachialis"],
  "notes": "Biarticular: also crosses glenohumeral joint."
}
```

**L1 edge (actual shape in `relationship-edges.js`)**

```json
{
  "id": "edge-glute-lowback-comp",
  "from": "glute-max",
  "to": "erector-spinae",
  "kind": "compensation",
  "mechanism": "Weak glute max during hip extension causes lumbar erector spinae to compensate, contributing to low-back fatigue.",
  "confidence": 0.9,
  "bidirectional": false,
  "tags": ["hinge-pattern", "low-back"]
}
```

**L3 remedy (actual shape in `remedies.js`)**

```json
{
  "id": "rem-glutemax-weak-strengthen",
  "muscleBaseId": "glute-max",
  "forState": "weak",
  "type": "strengthen",
  "title": "Hip thrust",
  "steps": [
    { "order": 1, "instruction": "Sit on the floor with upper back against a bench, knees bent." }
  ],
  "caution": "Keep ribs down to avoid lumbar hyperextension."
}
```

**L4 movement / recruitment (actual shape in `movements.js`)**

```json
{
  "id": "mov-bench-press",
  "name": "Barbell Bench Press",
  "pattern": "push",
  "muscles": [
    { "muscleBaseId": "pec-major", "role": "primary", "phases": ["concentric", "eccentric"] },
    { "muscleBaseId": "anterior-delt", "role": "secondary", "phases": ["concentric", "eccentric"] }
  ]
}
```

---

## 6. How to keep tracking lightweight

- Update **Status** tables in §2 as items move: `☐ todo` → `◐ in progress` → `☑ done`.
- For each session, append a dated entry to §7 Changelog below.
- When adding new data (edges, remedies, movements), add the count to the parallel tracks table in §2.

---

## 7. Changelog

- **2026-04-04** — L0.1/L0.2 starter + L0.3 pilot: `src/data/joints.js`, `src/data/muscle-mechanics.js` (elbow/GH/knee/hip joints; biceps/triceps + quad/hamstring subs).
- **2026-04-04** — L0.5: `MuscleMechanicsPanel` on Log tab below Body Intelligence (`BodyMapApp.jsx`).
- **2026-04-04** — L0 bulk seed: delts, pecs, cuff, scaps/traps, glutes, calves/TA, core/obliques, forearms, hip flexors/adductors, neck, serratus; new joints in `joints.js`.
- **2026-04-04** — Atlas UX: removed sub-muscle **modal**; unified map click → immediate select (whole group or split sub). `BodyAtlas` infers L/R for `common` paths when parent has subs. L0.4 + atlas game plan in §2a–2b.
- **2026-04-14** — Phase A close-out: L0.4 conventions written into data file headers; TFL antagonist fixed (`posterior-delt` → `adductor-magnus`/`adductor-longus`); INTENTIONALLY OMITTED joint list added.
- **2026-04-14** — Atlas QA: dead `back-rhomboids` slug removed from `ATLAS_SLUG_TO_SUB` and `PARENT_TO_ATLAS_SLUGS`; rhomboids remapped to `back-lats` proxy in `SUB_TO_ATLAS_SLUG`.
- **2026-04-14** — Phase B (L1): `src/data/relationship-edges.js` (15 edges, schema v1); `RelationshipEdgesPanel.jsx` (filter by kind, confidence bar).
- **2026-04-14** — Phase C (L2): `MuscleStatePanel.jsx` (tight/weak/normal toggle); `muscleStates` persisted in localStorage with `schemaVersion:2`; export/import updated.
- **2026-04-14** — Phase D (L3): `src/data/remedies.js` (11 remedies, 8 muscles, schema v1); `RemedyPanel.jsx`.
- **2026-04-14** — Phase E (L4): `src/data/movements.js` (bench press, back squat, deadlift; schema v1); `MovementRecruitmentPanel.jsx`; `recruitmentTint` prop on `MuscleAtlas`.
- **2026-04-14** — Phase F (L5): `SessionPlanner.jsx` (rules-based 3-section plan: tight → weak → L1 edge "also consider"); Planner tab; disclaimer footer on all pages.
- **2026-04-15** — Bug fixes: deduplicated bidirectional edges in `RelationshipEdgesPanel`; added empty-state message in `RemedyPanel`; fixed doc edge count (was 16, actually 15).
- **2026-04-15** — L1 library growth: 15 → 32 edges. Added upper-cross/shoulder (5), lower-cross/hip (4), ankle/knee (2), core/trunk (2), upper-limb (3), cross-body (1) edges.
- **2026-04-15** — L3 library growth: 11 → 35 remedies. Added shoulder complex (6), hip/glute (5), quad/hamstring (3), core/trunk (4), misc (6) remedies.
- **2026-04-15** — L4 movement growth: 3 → 10 lifts. Added overhead press, barbell row, pull-up, lunge, Romanian deadlift, hip thrust, face pull.
- **2026-04-15** — L5 planner v2: `SessionPlanner.jsx` rewritten with session/weekly/symmetry views, intake wizard, concrete sets/reps/duration from remedies, deduplication of "also consider" targets.
- **2026-04-15** — Charts: timeline chart uses real calendar dates (was sequence index); assessment chart sorts chronologically and averages same-day entries.
- **2026-04-15** — Mobile: added expandable menu on mobile bottom bar for Export JSON / Import JSON / Report.
- **2026-04-15** — Female atlas: created patched asset files (`bodyFemaleFront.js`, `bodyFemaleBack.js`) routing through vendor data with infrastructure for future path splits; connected divider system.

---

## 8. How to phrase goals for assistants (copy-paste)

Use this at the start of a new chat (or point the model at this file). The goal is **one clear story**: *isolated mechanics first, holistic system second*, without sounding like we are only building a pain log or only building compensation folklore.

### 8.1 One paragraph (elevator)

**Dot Body Map** is a workout- and balance-oriented body atlas app. The long-term direction is **decision-support** (hypotheses, remedies, movement recruitment, planning) — **not** replacing in-person care. We built the project in two stages: (1) **In isolation:** encode how each joint and muscle is *supposed* to behave — actions, planes/DOF, agonist/antagonist and synergists — using our stable muscle IDs. (2) **As a holistic system:** encode how regions *influence* each other (chains, compensation, adjacency) on top of that mechanics layer. All layers (L0–L5) are live in v1; current work grows the data libraries and deepens the Planner.

### 8.2 Full context block (new chat / handoff)

Paste and fill the bracketed bits:

```text
Project: Dot Body Map (React/Vite, atlas in bodymap-app). Read PROJECT_NOTES.md + BODY_MODEL_ROADMAP.md.

Primary product goals: workout planning, tight/weak awareness, body balance—not primarily a compensation tracker.

Roadmap method: Layered body model L0–L5, all live in v1:
- L0: joint catalog + muscle mechanics (joints.js, muscle-mechanics.js)
- L1: inter-regional edges (relationship-edges.js, RelationshipEdgesPanel)
- L2: tight/weak state per muscle (MuscleStatePanel, localStorage)
- L3: remedy steps (remedies.js, RemedyPanel)
- L4: movement recruitment tint (movements.js, MovementRecruitmentPanel)
- L5: session planner + disclaimer (SessionPlanner, Planner tab, footer)

Current focus: [e.g. grow L1 edge library / add overhead press to L4 / improve Planner].

Non-goals for this thread: [e.g. no ML / no backend / no skeletal animation].

Constraints: preserve Log/Dashboard/Assessments/Planner; backward-compatible muscle IDs (migrateLegacyId); schemaVersion:2 in localStorage; all data modules use SUB_MUSCLES base IDs as join keys.

What I want from you: [your ask].
```

### 8.3 Phrases that reduce misunderstanding

- Say **"mechanics layer before relationship graph"** instead of only "cause and effect first."
- Say **"holistic system = edges between regions with mechanism + confidence"** so it is not confused with "one big 3D simulation."
- Say **"join key = muscle IDs + atlas slugs"** whenever discussing new data so IDs are not invented ad hoc.
- Say **"decision-support / educational, not medical diagnosis"** whenever scope could drift into clinical claims.

### 8.4 What to avoid (ambiguous phrasing)

- **"Build the AI"** — too vague; specify which layer (L0–L5).
- **"Map the body"** — clarify *mechanics* vs *relationships* vs *atlas art*.
- **"Like a physio would"** — implies tacit knowledge; ask for **structured, auditable data** instead.

### 8.5 Filled handoff example (project defaults — copy as-is)

Use this when you do not want to edit brackets; adjust only **Current focus** and **This session**.

```text
Project: Dot Body Map (React/Vite, atlas in bodymap-app). Read PROJECT_NOTES.md + BODY_MODEL_ROADMAP.md + §9 for decided defaults.

Primary product goals: workout planning, tight/weak awareness, body balance—not primarily a compensation tracker.

Roadmap method: Layered body model L0–L5, all live in v1. See §1–§2 for layer definitions and status. Growing data libraries and deepening the Planner are the current focus.

Standing non-goals: no ML for core logic v1; no backend/multi-user sync until local model is solid; no skeletal rig or full pose animation until phase-tint recruitment validates for 5+ lifts.

Constraints: preserve Log/Dashboard/Assessments/Planner; backward-compatible muscle IDs + migrateLegacyId; schemaVersion:2; all new data MUST use SUB_MUSCLES base IDs as join keys.

Decisions already made: §9 (JSON rules, repo remedies, phase tinting, extended localStorage, rules-based planner, male-first granularity).

This session: [your ask].
```

---

## 9. Decisions answered (defaults for this project)

These are **working defaults** for Dot Body Map so assistants do not re-litigate the same forks unless you explicitly reopen them. Reasoning is short on purpose.

### 9.1 Architecture & storage

| Question | Options | **Our answer** | Why |
|----------|---------|------------------|-----|
| Where does "intelligence" live? | Hard-coded in JSX vs data modules vs remote API | **Data modules in repo** (`src/data/*.js` exports) | Diffable, versioned, testable; UI stays thin. |
| Persistence | Extend localStorage vs SQLite/WASM vs backend | **Extend existing localStorage JSON blob** + `schemaVersion` | Matches current app; ship fast; export/import remains migration path. |
| When to add SQLite/backend | Never vs multi-device vs collaboration | **Defer** until you need sync, accounts, or shared libraries | Avoid premature infra. |

### 9.2 Stage 2 "cause and effect" / holistic links

| Question | Options | **Our answer** | Why |
|----------|---------|------------------|-----|
| Representation | Rule/edge JSON vs graph DB vs Markdown→parser | **Versioned JSON list of edges** `{ from, to, kind, mechanism, confidence, tags }` | Enough to ship; grep/review friendly; import into a graph DB later if needed. |
| Confidence | Binary vs numeric vs enum | **0–1 float + optional `evidence` note** | Supports "show me strong vs speculative links" in UI later. |
| Grounding | Free text only vs must cite L0 | **Mechanism text must use L0 vocabulary** (joints, actions, pairs) where possible | Keeps compensation stories checkable. |

### 9.3 Remedies

| Question | Options | **Our answer** | Why |
|----------|---------|------------------|-----|
| Source | Repo JSON vs headless CMS vs licensed library | **Repo JSON** keyed by `muscleId` + `forState` | Same as movements; you own the copy; CMS later if non-devs edit weekly. |
| Media | Text only vs embedded video | **Steps + optional external URL** v1 | No hosting liability v1; keep links optional. |

### 9.4 Movement visualization

| Question | Options | **Our answer** | Why |
|----------|---------|------------------|-----|
| Approach | Phase tint on SVG vs morph vs skeletal rig | **Phase-based recruitment tinting** on existing atlas paths (primary red, secondary purple, tertiary green) | Uses current forked SVG; teaches recruitment without animation pipeline. |
| When to upgrade art | Never vs after N lifts vs Wikimedia swap | **After 5+ lifts validate UX**; atlas art backlog stays in `PROJECT_NOTES.md` | Prove data model before heavy art investment. |

### 9.5 Guided planner / "diagnostic-style" behavior

| Question | Options | **Our answer** | Why |
|----------|---------|------------------|-----|
| Core engine | Pure rules/templates vs LLM | **Rules + templates** for hypotheses and plan skeletons | Deterministic, auditable; LLM only for optional prose expansion later with guardrails. |
| Legal/UX | Hidden disclaimer vs explicit modal/footer | **Explicit copy**: decision-support / educational; not medical diagnosis; seek in-person care when appropriate | Aligns with author intent in `PROJECT_NOTES.md`. |

### 9.6 Female atlas & feature gating

| Question | Options | **Our answer** | Why |
|----------|---------|------------------|-----|
| Ship order | Block features until parity vs male-first | **Male-first** for mechanics (L0) and recruitment; **label** where female is still stock library | Unblocks intelligence work; parity is a parallel milestone. |

### 9.7 What we are explicitly *not* doing in v1 (unless you change §9)

- **ML** as the source of truth for edges or plans.
- **Real-time pose estimation** from camera.
- **Replacing** clinical care copy — language stays **supporting**, not authoritative diagnosis.

### 9.8 Summary sentence for any assistant

**Store mechanics and relationships as versioned JSON keyed to existing muscle IDs; extend localStorage (schemaVersion:2); visualize movements as phased recruitment tinting on the current SVG; explain holistic links with mechanism + confidence grounded in L0; use rules/templates for planner v1; disclaim diagnostic scope; ship male-first with honest UI labels until female splits land.**
