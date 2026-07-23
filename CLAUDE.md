# CLAUDE.md — Layer 0: Agent identity

> **Always loaded.** First file every agent reads. Answers the question *"Where am I?"*
> Keep this file short (~800 tokens). Detail belongs deeper in the hierarchy.

---

## You are working on: Dot Health Hub

*(Renamed from **Dot Body Map** 2026-07-23; the body map remains the flagship feature. Storage key `dot-body-map-v3` and all muscle IDs are unchanged.)*

A React + Vite + Tailwind web app built around a high-resolution anatomical atlas, expanding toward whole-health tracking (nutrition, biomarkers — see `docs/handoff/2026-07-23-health-hub-recap-and-proposal.md`).

**Live app:** https://dot-ami.github.io/phsioclick/ (auto-deploys from `main` via `.github/workflows/deploy.yml`)

**Primary purpose:** personal training and body balance — workout planning, tight/weak awareness, and identifying what to fix next. **Not** a medical diagnostic tool; all outputs are educational / decision-support with an explicit footer disclaimer.

**App root:** `c:\phsioclick\bodymap-app`
**Dev:** `cd c:\phsioclick\bodymap-app && npm run dev` → http://localhost:5173/
**Build gate:** `cd c:\phsioclick\bodymap-app && npx vite build` must pass before any work is called "done."

---

## Documentation architecture (ICM / Model Workspace Protocol)

This workspace uses **folder structure as agent architecture** (Van Clief / McDermott, 2026). Read layers top-down and stop when you have what you need.

| Layer | File | Purpose | When to read |
|-------|------|---------|-------------|
| **0** | `CLAUDE.md` | Identity (this file) | Always |
| **1** | `CONTEXT.md` | Project routing — which stage is active, where things live | On entry |
| **2** | `stages/NN-*/CONTEXT.md` | Stage contract: Inputs / Process / Outputs | When working in a stage |
| **3** | `stages/NN-*/references/` + `shared/` + `_config/` | Reference material | As needed per task |
| **4** | `stages/NN-*/output/` | Working artifacts produced by the stage | Write here, read from prior stages |

**Conventions that never change:** `_core/CONVENTIONS.md` — read once, apply always.

---

## Your job, by default

1. **Read `CONTEXT.md`** to find the active stage.
2. **Open that stage's `CONTEXT.md`** and follow its Inputs → Process → Outputs contract.
3. **Write artifacts into `stages/NN-*/output/`** — never into references, never into the code unless the stage contract says so.
4. **Respect `_core/CONVENTIONS.md`** — invariants (stable muscle IDs, storage schema, build gate, etc.).
5. If the user asks something outside the active stage, **tell them which stage it belongs in** and ask whether to switch.

---

## Legacy documents (still authoritative, being migrated)

These comprehensive documents predate the ICM restructure. They remain accurate and are referenced from the new layered docs:

- `PROJECT_NOTES.md` — full product intent, atlas architecture, tech stack, tabs, known limitations
- `BODY_MODEL_ROADMAP.md` — L0–L5 layer definitions, phase status tables, data conventions
- `NEXT_CHAT_PROMPT.md` — atlas architecture handoff (file-level pointers)

Treat these as `shared/` reference material. New content goes into the layered structure.

---

## Non-negotiables

- **Not a medical tool.** Every user-facing plan or hypothesis carries an educational-only disclaimer.
- **Stable muscle IDs** (`SUB_MUSCLES` base IDs from `bodymap-app/src/muscle-data.js`) are the join key for **all** new data. Do not invent new IDs.
- **Do not break** Log / Dashboard / Assessments / Planner, export/import, or the clinical report.
- **Storage schema v3** at key `dot-body-map-v3` — bumped by Stage 02-B / F1 (2026-04-19). v3 adds `stateChanges`, `goals`, `adherence`, `dailySnapshots` to the v2 shape; the U7+U8 additive fields (`onboarding`, `streak`, `milestones`) are now native to v3. Maintain backward compat via `migrateLegacyId()` for IDs and `migrateBlobToV3()` for blob shape.
