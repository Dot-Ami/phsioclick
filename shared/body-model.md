# Body model — L0 through L5

Cross-stage reference. Canonical definitions for the six-layer intelligence stack that Dot Body Map is built around. Full historical status tables and open decisions live in `BODY_MODEL_ROADMAP.md` (legacy, still authoritative).

---

## The stack

Each layer depends on those below it.

| Layer | Name | What it answers | Depends on |
|-------|------|-----------------|------------|
| **L0** | Movement & mechanics | What each muscle *does* — actions, joints, planes, DOF, agonist/antagonist pairs, synergists. "How is the body *supposed* to move?" | Atlas + `muscle-data` IDs |
| **L1** | Inter-regional relationships | How regions influence each other: adjacency, compensation, load chains, inhibition. "Why might *this* show up when *that* is the story?" | L0 |
| **L2** | State on the map | User-marked tight / weak per muscle, L/R. | L0 IDs |
| **L3** | Remedies & interventions | Stretch / strengthen / drill / tempo / cue — steps tied to muscle + state. | L2 (+ L1 for "why") |
| **L4** | Movements & recruitment | Named movements → `{ muscleId, role }` + phase timing. Primary red / secondary purple / tertiary green. | L0 |
| **L5** | Guided planning | Intake → hypotheses → session / week plan with disclaimers. | L1–L4 |

**Design rule:** model mechanics (L0) before encoding narratives (L1). Antagonist facts are stable; compensation stories need L0 grounding to stay honest.

---

## Status (v1 complete)

| Layer | Data | UI | Notes |
|---|---|---|---|
| L0 | `data/joints.js` (9 joints), `data/muscle-mechanics.js` (~55 entries) | `MuscleMechanicsPanel` | All `SUB_MUSCLES` covered |
| L1 | `data/relationship-edges.js` (32 edges) | `RelationshipEdgesPanel` | Kinds: compensation, load-chain, inhibition (adjacency / referral reserved) |
| L2 | `muscleStates` in localStorage | `MuscleStatePanel` | Tight / weak / normal per `{id}-{l|r}` |
| L3 | `data/remedies.js` (35 remedies, ~25 muscles) | `RemedyPanel` | Empty-state message when no remedies seeded |
| L4 | `data/movements.js` (10 movements) | `MovementRecruitmentPanel` | Phase-based recruitment tint on atlas |
| L5 | Rules in `SessionPlanner.jsx` | `SessionPlanner` | Session / weekly / L/R symmetry views + intake wizard |

---

## Join-key convention

- Every cross-layer reference is by `SUB_MUSCLES` base `id` (no side suffix in data files).
- The `-l` / `-r` suffix is user-state only — applied at UI and storage, stripped at the data layer via `fromMuscleId()`.
- When a layer needs a bilateral aggregate, it computes over both sides of the same base ID.

---

## Where to go from here

| Track | What | Stage |
|-------|------|-------|
| **F** | Tracking & metrics — state history, progress over time, symmetry index, adherence | `stages/02-tracking-metrics/` |
| **E** | Deeper intelligence — better cause/effect inference, movement-specific compensation, smarter planner heuristics | `stages/03-deeper-intelligence/` |
| **G** | Content expansion — female atlas parity, deep hip rotators, tibialis posterior, peroneals, more remedies / movements | `stages/04-content-expansion/` |
| **H** | New features (future) — social sharing, video links, coach review mode | Not yet scoped |
