# Handoff: Dot Body Map — Phase 1 complete, planning next (2026-07-04)

## Where we are
- **Phase 1 of `PROGRAM_AUDIT.md` is complete** and merged to `main` on GitHub (`Dot-Ami/phsioclick`).
- App root: `c:\phsioclick\bodymap-app`. Dev: `cd bodymap-app && npm run dev` → http://localhost:5173/
- Gates all green locally: `npm run lint` (0 issues), `npm test` (52 tests), `npm run build`.
- CI workflow added: `.github/workflows/ci.yml` (lint → test → build on push/PR to main).
- Today screen now shows **live** Body Balance Score + trend and real M5 hot regions; remedy parent→sub fallback works.
- Dead root `BodyMapApp.jsx` removed; ~589 lines of legacy JSX/dead code removed from `src/BodyMapApp.jsx`.

## What just happened this session
- Executed Phase 1 from `PROGRAM_AUDIT.md`: P1-a/b/c fixes, lint-to-zero, dead code removal, vitest + 52 tests, GitHub Actions CI.
- Commits on `main`:
  - `9d0f1d6` — prior audit + vendor dist restore
  - `8a83cf5` — Phase 1 complete (this session's work)
- Notion project page `PhysioClick` updated with current state (see Notion UUID below).

## Next actions (in order)
1. **Start dev server** — `cd c:\phsioclick\bodymap-app && npm run dev`, open http://localhost:5173/, click through Today / Body / Plan / Progress tabs with seeded or fresh data.
2. **Read `PROGRAM_AUDIT.md` Phases 2–4** — identify what to tackle next; do NOT re-do Phase 1.
3. **Planning session with user** — walk the live app together, note UX gaps, prioritize Phase 2 items (P0 bugs, muscleStates migrateLegacyId on hydrate, import atomicity, etc.).
4. **Optional quick wins from audit** before big refactors:
   - P0: run `migrateLegacyId` on `muscleStates` keys during hydrate/import
   - Phase 2: split `BodyMapApp.jsx` persistence into `src/persistence.js` (audit item 10 — later phase but high leverage)

## Read these first
1. `c:\phsioclick\PROGRAM_AUDIT.md` — full audit + 4-phase game plan
2. `c:\phsioclick\CLAUDE.md` — agent identity + conventions
3. `c:\phsioclick\CONTEXT.md` — active stage routing
4. `c:\phsioclick\docs\handoff\2026-07-04-phase1-complete-planning-next.md` — this file
5. Notion: PhysioClick project page — `3458aff3-c54a-81b7-aeca-f62adcb5b89e`

## Do NOT
- Re-litigate Phase 1 scope — it is done and verified.
- Re-add the deleted root `BodyMapApp.jsx` or its tailwind content entry.
- Treat the app as a medical diagnostic tool — educational/decision-support only (footer disclaimer required).
- Invent new muscle IDs — use stable `SUB_MUSCLES` base IDs from `bodymap-app/src/muscle-data.js`.
- Break Log / Dashboard / Assessments / Planner, export/import, or clinical report flows.
