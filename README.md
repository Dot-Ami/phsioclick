# Dot Health Hub

Personal training, body balance, and (soon) whole-health tracking, built around a
high-resolution interactive anatomical atlas. Flag muscles as tight or weak, get a
session plan with concrete remedies, and watch live metrics (Body Balance Score,
symmetry, load, recovery, adherence) respond over time.

**Live app:** https://dot-ami.github.io/phsioclick/ — auto-deployed from `main` by
`.github/workflows/deploy.yml`. All data lives in your browser's localStorage
(`dot-body-map-v3`); nothing is sent to a server.

> **Not a medical tool.** Everything the app outputs is educational /
> decision-support only.

## Development

```sh
cd bodymap-app
npm ci
npm run dev        # http://localhost:5173/
```

Gates — all three must pass before work is called "done" (CI enforces on push/PR):

```sh
npm run lint
npm test
npx vite build
```

Note: `bodymap-app/vendor/react-muscle-highlighter/` ships with its prebuilt
`dist/` committed (explicitly un-ignored) — do not delete it; the atlas
deep-imports from it.

## Where to read next

- `CLAUDE.md` / `CONTEXT.md` — agent identity and stage routing (ICM layout)
- `PROGRAM_AUDIT.md` — full 2026-07-05 audit and the 4-phase game plan
- `docs/handoff/` — session handoffs, newest first; the 2026-07-23 file holds the
  whole-health-hub roadmap (nutrition, security ladder, biomarkers)
