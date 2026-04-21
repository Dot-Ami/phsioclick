# Current UX audit — what's wrong today

> Source-grounded breakdown of the v1 shell as of 2026-04-16. Every claim cites a file and line so the redesign starts from facts, not vibes.

---

## Top-level diagnosis

The app is a **data-tool** dressed as a **personal-training tool**. Information architecture is organized around what the database stores (logs, dashboards, assessments, planner) rather than what the user is trying to do today. Combined with no onboarding, no in-context teaching, and a flat zinc/cyan palette with no hierarchy, the user lands on the Log tab and is asked to translate a personal goal ("I want to fix this tight hip") into a database action ("file a log entry") with no guide.

Five compounding failures:

1. **No first-run experience.** Cold-start lands on Log with empty state and no narrative.
2. **IA is by data type, not user job.** Tabs in [`BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) lines 621-632: `Log` / `Dashboard` / `Assessments` / `Planner`. None of those are the question a user asks themselves walking into a session.
3. **Visual hierarchy is flat.** Five-card stat grid on Dashboard (lines 949-973), four-tab pill row in header (line 620), no hero number, no above-the-fold answer to "how am I doing?"
4. **No teaching layer.** L0 mechanics, L1 edges, L3 remedies all exist as data ([`muscle-mechanics.js`](../../../bodymap-app/src/data/muscle-mechanics.js), [`relationship-edges.js`](../../../bodymap-app/src/data/relationship-edges.js), [`remedies.js`](../../../bodymap-app/src/data/remedies.js)) but the panels render them as clinical reference, not as plain-language teaching.
5. **No reward loop.** A flip-to-normal, a streak, a completed remedy, a goal hit — none of these have any visual celebration. Effort feels invisible.

---

## Screen-by-screen

### 1. Header / global nav — [`BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) lines 617-634

```617:619:bodymap-app/src/BodyMapApp.jsx
        <header className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
          <h1 className="text-xl font-semibold sm:text-2xl">Dot Body Map</h1>
          <p className="mt-1 text-sm text-zinc-400">Clinical compensation tracker — interactive anatomical SVG atlas with L/R distinction.</p>
```

- **Tagline is wrong for the audience.** "Clinical compensation tracker" reads like marketing copy for a clinic SaaS, not a personal-training tool. The product brief in [`CLAUDE.md`](../../../CLAUDE.md) is explicit: personal training and body balance.
- **Tabs are pill buttons** with cyan-tinted active state. Functional but no visual hierarchy between primary (most-used) and secondary tabs. Mobile-friendly but emotionally inert.
- **No streak / no score / no "today" anchor** in the header. Nothing reminds you why you opened the app.

### 2. Log tab — [`BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) lines 636-945

- **Default landing tab.** First-run users see the atlas with "Select Origin / Select Sensation / Log Again" buttons (lines 666-679) and a side panel for the form. There is no narrative for *why* you'd want to log anything.
- **Atlas selector requires meta-knowledge.** You have to know what "origin" vs "sensation" means before clicking. No tooltip on first hover. No example.
- **Pick mode UX is bimodal.** Click-then-mode-switch (lines 600-607) is unintuitive on first use; users tap a muscle expecting "show me this muscle" but instead select an origin.
- **No call to action besides logging.** A user who just wants to mark something tight has to first understand the log form schema (intensity, sensation type, movement context, notes).
- **Bottom mobile menu** (lines 1227-1244) only shows on the Log tab — Export/Import/Report. Reasonable, but it implies the Log tab is the "home" tab, which it shouldn't be.

### 3. Dashboard tab — [`BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) lines 947-1125

```949:973:bodymap-app/src/BodyMapApp.jsx
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="text-xs text-zinc-400">Total Logs</div>
                <div className="text-xl font-semibold">{entries.length}</div>
```

- **Five equal-weight stat cards.** "Total Logs / Patterns (3+) / Escalating / High Intensity (8+) / Symmetry Snapshot." None is a hero. None answers "am I getting better?" — they all answer "what's in your database?"
- **"Symmetry Snapshot"** shows dominant side and L vs R intensity averages but as a bottom-of-card afterthought. The single most useful balance signal in the app is buried.
- **Filters block** below the stats (lines 975+) takes premium screen real estate before the user has any reason to filter.
- **Charts and chains** are below the fold and require domain knowledge to interpret.
- **Empty state is silent.** A new user with zero logs sees five "0" cards and no instruction.

### 4. Assessments tab — [`BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) lines 1127-1212

- **Form-first, no scaffolding.** Search-test, pick-test, enter-left, enter-right, save. No "what tests should I do?" or "here's a starter battery" guide.
- **Trends chart is below the form.** A user who already has data still has to scroll past the input form to see how they're trending.
- **Disconnected from muscles.** Assessments are not joined back to the muscle states they're supposed to drive. (Stage 02 §M9 fixes the data side; UX side is unaddressed.)

### 5. Planner tab — [`BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) lines 1213-1217

```1213:1217:bodymap-app/src/BodyMapApp.jsx
        {tab === "planner" && (
          <section className="mx-auto max-w-2xl">
            <SessionPlanner muscleStates={muscleStates} onSetState={handleSetMuscleState} />
          </section>
        )}
```

- **Single-component dump.** Renders [`SessionPlanner.jsx`](../../../bodymap-app/src/SessionPlanner.jsx) and nothing else. No surrounding context, no "today's session at a glance," no week view above session view.
- **`max-w-2xl` constraint** wastes desktop horizontal space.
- **Planner contains everything good** (intake wizard, weekly plan, symmetry view, session) but is hidden as the rightmost tab — most users never get there.

### 6. Footer — [`BodyMapApp.jsx`](../../../bodymap-app/src/BodyMapApp.jsx) lines 1219-1224

- Disclaimer is correct and well-placed. Keep as-is in the redesign.

### 7. Atlas + L0-L5 panels (cross-cutting)

- **Panels render as clinical reference.** [`MuscleMechanicsPanel.jsx`](../../../bodymap-app/src/MuscleMechanicsPanel.jsx), [`RelationshipEdgesPanel.jsx`](../../../bodymap-app/src/RelationshipEdgesPanel.jsx), [`RemedyPanel.jsx`](../../../bodymap-app/src/RemedyPanel.jsx), [`MovementRecruitmentPanel.jsx`](../../../bodymap-app/src/MovementRecruitmentPanel.jsx) all show structured data with layer-prefix labels (L0, L1, etc.).
- **Educational only by accident.** The data is rich but the rendering is "anatomy textbook" — joints crossed, action keys, plane tags, antagonists. A user without a kinesiology background bounces.
- **No "Learn" entry point** on a muscle tap. Selection sets state for downstream panels but doesn't open a "what does this muscle do, and why does it matter to me?" view.

---

## Visual language audit

Read [`_core/CONVENTIONS.md`](../../../_core/CONVENTIONS.md) §7 first — the existing rule is "dark zinc/teal, neutral defaults, dense labeled L0/L1 tags."

What that produces in practice:

- **Color palette in use:** `zinc-950` background, `zinc-900` cards, `zinc-800` borders, `zinc-700` secondary buttons, `cyan-400/500/600/700` for active state. No semantic palette for tight (warning) vs weak (information) vs balanced (positive).
- **No type scale.** Sizes are ad hoc: `text-xs`, `text-sm`, `text-xl`, `text-2xl`. No display weight for hero numbers.
- **No motion.** No transitions on tab switch, no entrance animation on modals, no celebration on a state flip.
- **Density is "dashboard at full zoom"** everywhere. Even the Log tab (lines 636-945) is dense. There is no breathing room and no place for the eye to land first.
- **Iconography is text-only.** No icons in the header, tabs, or stat cards.
- **Empty states are "0" instead of "do this first."**

---

## Educational gap audit

The app already owns most of the content it needs to teach the user — the rendering just doesn't teach.

| Existing data | Currently rendered as | Could be rendered as |
|---------------|----------------------|----------------------|
| `muscle-mechanics.js` joints/actions | "Joints: shoulder, elbow. Actions: flexion, extension." | "This muscle bends your shoulder forward and helps you push." |
| `relationship-edges.js` rationale field | "compensation: glute-max -> erector-spinae" | "When your glutes are weak, your lower back often picks up the slack." |
| `remedies.js` instructions | Dense step list | Step list + "why this helps" + "when to do it" |
| Muscle tags in `SUB_MUSCLES` | Dropdown labels | Tappable card with picture + name + plain-language summary |

There is no copywriting style guide and no "explain it like I just walked in" pass on any panel.

---

## Reward-loop gap audit

| Moment a celebration could fire | Currently | Should |
|---------------------------------|-----------|--------|
| First muscle ever flagged | Silent | Welcome milestone + nudge to read the Learn tab |
| First time a tight muscle returns to normal | Silent | "Recovered" toast + region mastery progress |
| First completed remedy | Silent | Streak begins + adherence rate appears |
| Daily app open | Silent | Streak counter + today's hero card |
| Goal hit | (No goals exist yet) | Confetti + share / archive / set next goal |
| 7 / 30 / 100-day streak | (No streak exists) | Named milestone, region-specific badge |

None of these exist. The app records the data; it never reflects effort back at the user.

---

## What this audit implies for Stage 02-A specs

- **Nav must be re-shelved by user job.** -> `screens.md` defines Today / Body / Plan / Progress.
- **Visual language needs a proper token system.** -> `design-tokens.md` adds palette (with semantic tight/weak/balanced colors), type scale, spacing, radius, motion.
- **Every screen needs a hero answer.** -> Today gets the Body Balance Score; Body gets the muscle-detail slide-out; Plan gets today's session at the top; Progress gets the symmetry composite trend.
- **Teaching becomes a first-class panel.** -> `learn-layer-spec.md` defines content model + copywriting style guide.
- **Reward loop is engineered.** -> `gamification-spec.md` defines streak, milestones, score tiers, region mastery.
- **First-run is designed, not assumed.** -> `onboarding-flow.md` defines the six-step wizard + per-tab tour overlays.
