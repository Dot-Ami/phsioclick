import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STORAGE_KEY = "dot-body-map-v1";

const MOVEMENT_GROUPS = {
  squat: [
    "Bodyweight Squat",
    "Goblet Squat",
    "Back Squat",
    "Front Squat",
    "Split Squat",
    "Bulgarian Split Squat",
  ],
  hinge: [
    "Deadlift",
    "RDL",
    "Single-leg RDL",
    "Good Morning",
    "Hip Thrust",
  ],
  push: ["Bench Press", "Overhead Press", "Push-up", "Dips", "Incline Press"],
  pull: ["Row", "Pull-up", "Lat Pulldown", "Face Pull", "Cable Row"],
  rotation: ["Thoracic Rotation", "Wood Chop", "Cable Rotation"],
  daily: [
    "Walking",
    "Sitting",
    "Standing Up",
    "Reaching Overhead",
    "Bending to Pick Something Up",
    "Carrying Load",
    "Climbing Stairs",
  ],
  assessment: [
    "Overhead Squat Test",
    "Thomas Test",
    "Wall Angel",
    "Single-leg Balance",
  ],
};

const SENSATION_TYPES = [
  "tight",
  "sharp pain",
  "dull ache",
  "pinching",
  "clicking/popping",
  "weakness",
  "numbness/tingling",
  "nothing/fine",
  "restricted range",
];

const SENSATION_COLORS = {
  tight: "#facc15",
  "sharp pain": "#ef4444",
  "dull ache": "#fb7185",
  pinching: "#f97316",
  "clicking/popping": "#eab308",
  weakness: "#60a5fa",
  "numbness/tingling": "#a78bfa",
  "nothing/fine": "#34d399",
  "restricted range": "#f59e0b",
};

const WHEN_OPTIONS = [
  "during movement",
  "after movement",
  "at rest",
  "in the morning",
  "end of work day",
];

const CONTEXT_CHIPS = ["post-leg-day", "desk-heavy day", "poor sleep", "high stress"];

const REGIONS = [
  { id: "neck", label: "Neck", view: "front", x: 150, y: 76, movementGroups: ["rotation", "daily", "assessment"] },
  { id: "upper-traps", label: "Upper Traps", view: "back", x: 150, y: 86, movementGroups: ["pull", "daily", "assessment"] },
  { id: "front-delt-l", label: "Front Delt (L)", view: "front", x: 112, y: 110, movementGroups: ["push", "daily", "assessment"] },
  { id: "front-delt-r", label: "Front Delt (R)", view: "front", x: 188, y: 110, movementGroups: ["push", "daily", "assessment"] },
  { id: "rear-delt-l", label: "Rear Delt (L)", view: "back", x: 114, y: 112, movementGroups: ["pull", "assessment"] },
  { id: "rear-delt-r", label: "Rear Delt (R)", view: "back", x: 186, y: 112, movementGroups: ["pull", "assessment"] },
  { id: "chest-upper", label: "Upper Chest", view: "front", x: 150, y: 128, movementGroups: ["push", "daily"] },
  { id: "chest-lower", label: "Lower Chest", view: "front", x: 150, y: 154, movementGroups: ["push", "daily"] },
  { id: "rhomboids", label: "Rhomboids", view: "back", x: 150, y: 136, movementGroups: ["pull", "assessment"] },
  { id: "lats-l", label: "Lats (L)", view: "back", x: 120, y: 168, movementGroups: ["pull", "hinge"] },
  { id: "lats-r", label: "Lats (R)", view: "back", x: 180, y: 168, movementGroups: ["pull", "hinge"] },
  { id: "core-abs", label: "Core / Abs", view: "front", x: 150, y: 210, movementGroups: ["squat", "hinge", "daily"] },
  { id: "oblique-l", label: "Oblique (L)", view: "front", x: 126, y: 212, movementGroups: ["rotation", "daily"] },
  { id: "oblique-r", label: "Oblique (R)", view: "front", x: 174, y: 212, movementGroups: ["rotation", "daily"] },
  { id: "lower-back", label: "Lower Back", view: "back", x: 150, y: 214, movementGroups: ["hinge", "squat", "daily"] },
  { id: "hip-flexor-l", label: "Hip Flexor (L)", view: "front", x: 132, y: 258, movementGroups: ["squat", "hinge", "daily"] },
  { id: "hip-flexor-r", label: "Hip Flexor (R)", view: "front", x: 168, y: 258, movementGroups: ["squat", "hinge", "daily"] },
  { id: "glute-max", label: "Glute Max", view: "back", x: 150, y: 276, movementGroups: ["hinge", "squat", "daily"] },
  { id: "glute-med-l", label: "Glute Med (L)", view: "back", x: 128, y: 266, movementGroups: ["hinge", "single-leg", "assessment"] },
  { id: "glute-med-r", label: "Glute Med (R)", view: "back", x: 172, y: 266, movementGroups: ["hinge", "single-leg", "assessment"] },
  { id: "quads-l", label: "Quads (L)", view: "front", x: 132, y: 318, movementGroups: ["squat", "daily"] },
  { id: "quads-r", label: "Quads (R)", view: "front", x: 168, y: 318, movementGroups: ["squat", "daily"] },
  { id: "hamstring-l", label: "Hamstrings (L)", view: "back", x: 132, y: 320, movementGroups: ["hinge", "squat"] },
  { id: "hamstring-r", label: "Hamstrings (R)", view: "back", x: 168, y: 320, movementGroups: ["hinge", "squat"] },
  { id: "knee-l", label: "Knee (L)", view: "front", x: 132, y: 384, movementGroups: ["squat", "daily", "assessment"] },
  { id: "knee-r", label: "Knee (R)", view: "front", x: 168, y: 384, movementGroups: ["squat", "daily", "assessment"] },
  { id: "calf-l", label: "Calf (L)", view: "back", x: 132, y: 438, movementGroups: ["daily", "assessment"] },
  { id: "calf-r", label: "Calf (R)", view: "back", x: 168, y: 438, movementGroups: ["daily", "assessment"] },
  { id: "shin-l", label: "Shin (L)", view: "front", x: 132, y: 438, movementGroups: ["daily"] },
  { id: "shin-r", label: "Shin (R)", view: "front", x: 168, y: 438, movementGroups: ["daily"] },
  { id: "ankle-l", label: "Ankle (L)", view: "front", x: 132, y: 486, movementGroups: ["daily", "assessment"] },
  { id: "ankle-r", label: "Ankle (R)", view: "front", x: 168, y: 486, movementGroups: ["daily", "assessment"] },
  { id: "foot-l", label: "Foot (L)", view: "front", x: 128, y: 530, movementGroups: ["daily", "assessment"] },
  { id: "foot-r", label: "Foot (R)", view: "front", x: 172, y: 530, movementGroups: ["daily", "assessment"] },
];

const ASSESSMENT_TESTS = [
  { name: "Overhead Squat", unit: "score" },
  { name: "Thomas Test", unit: "deg" },
  { name: "Wall Angel", unit: "pass/fail" },
  { name: "Single-leg Balance", unit: "sec" },
];

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getConfidence(count) {
  if (count >= 8) return "high";
  if (count >= 5) return "medium";
  if (count >= 3) return "low";
  return "none";
}

function confidenceClass(conf) {
  if (conf === "high") return "bg-emerald-600/25 text-emerald-200 border-emerald-400/40";
  if (conf === "medium") return "bg-yellow-600/20 text-yellow-200 border-yellow-400/40";
  if (conf === "low") return "bg-sky-600/20 text-sky-200 border-sky-400/40";
  return "bg-zinc-700 text-zinc-200 border-zinc-500";
}

function toLabel(id) {
  return REGIONS.find((r) => r.id === id)?.label || id;
}

function pickRegion(view, regionId) {
  const region = REGIONS.find((r) => r.id === regionId);
  if (region && region.view === view) return region;
  return null;
}

function BodyFigure({
  view,
  originRegion,
  sensationRegion,
  onPick,
  pickMode,
  heatScores = {},
  links = [],
  showHeat = false,
}) {
  const points = REGIONS.filter((r) => r.view === view);
  const maxScore = Math.max(1, ...Object.values(heatScores));

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-3">
      <svg viewBox="0 0 300 580" className="w-full max-w-[340px] mx-auto">
        <rect x="92" y="40" width="116" height="512" rx="56" fill="#27272a" />
        <circle cx="150" cy="34" r="24" fill="#27272a" />
        <rect x="52" y="102" width="36" height="150" rx="16" fill="#27272a" />
        <rect x="212" y="102" width="36" height="150" rx="16" fill="#27272a" />
        <rect x="104" y="546" width="32" height="22" rx="8" fill="#27272a" />
        <rect x="164" y="546" width="32" height="22" rx="8" fill="#27272a" />

        {links.map((link) => {
          const origin = pickRegion(view, link.originRegion);
          const sensation = pickRegion(view, link.sensationRegion);
          if (!origin || !sensation) return null;
          return (
            <line
              key={link.key}
              x1={origin.x}
              y1={origin.y}
              x2={sensation.x}
              y2={sensation.y}
              stroke={SENSATION_COLORS[link.sensationType] || "#94a3b8"}
              strokeOpacity={0.6}
              strokeWidth={Math.min(10, 1 + link.count)}
            />
          );
        })}

        {points.map((region) => {
          const isOrigin = originRegion === region.id;
          const isSensation = sensationRegion === region.id;
          const score = heatScores[region.id] || 0;
          const heatOpacity = showHeat ? Math.max(0.12, score / maxScore) : 0.2;
          const fill = isOrigin
            ? "#22d3ee"
            : isSensation
              ? "#f472b6"
              : `rgba(244, 244, 245, ${heatOpacity})`;

          return (
            <g key={region.id}>
              <circle
                cx={region.x}
                cy={region.y}
                r={isOrigin || isSensation ? 10 : 8}
                fill={fill}
                stroke={isOrigin || isSensation ? "#fafafa" : "#52525b"}
                strokeWidth={isOrigin || isSensation ? 2 : 1}
                className="cursor-pointer transition-all"
                onClick={() => onPick(region.id)}
              />
              {(isOrigin || isSensation) && (
                <text x={region.x + 12} y={region.y + 4} fontSize="11" fill="#e4e4e7">
                  {pickMode === "origin" && isOrigin ? "Origin" : "Sensation"}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 text-xs text-zinc-400">
        Tap a region to select {pickMode === "origin" ? "movement origin" : "sensation location"}.
      </div>
    </div>
  );
}

export default function BodyMapApp() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [entries, setEntries] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [tab, setTab] = useState("log");
  const [view, setView] = useState("front");
  const [pickMode, setPickMode] = useState("origin");
  const [form, setForm] = useState({
    originRegion: "",
    sensationRegion: "",
    movement: "",
    sensationType: "tight",
    intensity: 4,
    whenLabel: "during movement",
    notes: "",
    context: [],
  });
  const [assessmentForm, setAssessmentForm] = useState({
    test: ASSESSMENT_TESTS[0].name,
    leftValue: "",
    rightValue: "",
    unit: ASSESSMENT_TESTS[0].unit,
  });

  useEffect(() => {
    const storage = window.storage || window.localStorage;
    if (!storage || !storage.getItem) {
      setIsLoaded(true);
      return;
    }
    const maybe = storage.getItem(STORAGE_KEY);
    if (maybe && typeof maybe.then === "function") {
      maybe
        .then((raw) => {
          const parsed = safeParse(raw || "{}", {});
          setEntries(Array.isArray(parsed.entries) ? parsed.entries : []);
          setAssessments(Array.isArray(parsed.assessments) ? parsed.assessments : []);
          setIsLoaded(true);
        })
        .catch(() => setIsLoaded(true));
      return;
    }
    const parsed = safeParse(maybe || "{}", {});
    setEntries(Array.isArray(parsed.entries) ? parsed.entries : []);
    setAssessments(Array.isArray(parsed.assessments) ? parsed.assessments : []);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const storage = window.storage || window.localStorage;
    if (!storage || !storage.setItem) return;
    const payload = JSON.stringify({ entries, assessments });
    const maybe = storage.setItem(STORAGE_KEY, payload);
    if (maybe && typeof maybe.catch === "function") {
      maybe.catch(() => {});
    }
  }, [entries, assessments, isLoaded]);

  const movementOptions = useMemo(() => {
    const region = REGIONS.find((r) => r.id === form.originRegion);
    const keys = region?.movementGroups?.length ? region.movementGroups : Object.keys(MOVEMENT_GROUPS);
    return keys.flatMap((key) => MOVEMENT_GROUPS[key] || []);
  }, [form.originRegion]);

  const commonPairs = useMemo(() => {
    if (!form.originRegion) return [];
    const counts = {};
    entries
      .filter((e) => e.originRegion === form.originRegion)
      .forEach((e) => {
        counts[e.sensationRegion] = (counts[e.sensationRegion] || 0) + 1;
      });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([regionId, count]) => ({ regionId, count, label: toLabel(regionId) }));
  }, [entries, form.originRegion]);

  const chainStats = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => {
      const key = `${e.originRegion}->${e.sensationRegion}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          originRegion: e.originRegion,
          sensationRegion: e.sensationRegion,
          count: 0,
          intensities: [],
          sensations: {},
          timestamps: [],
        });
      }
      const stat = map.get(key);
      stat.count += 1;
      stat.intensities.push(Number(e.intensity) || 0);
      stat.sensations[e.sensationType] = (stat.sensations[e.sensationType] || 0) + 1;
      stat.timestamps.push(new Date(e.timestamp).getTime());
    });

    const now = Date.now();
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    return [...map.values()]
      .map((stat) => {
        const conf = getConfidence(stat.count);
        const avgIntensity =
          stat.intensities.reduce((sum, n) => sum + n, 0) / Math.max(1, stat.intensities.length);

        let last7 = [];
        let prev7 = [];
        stat.timestamps.forEach((ts, i) => {
          const intensity = stat.intensities[i] || 0;
          if (ts >= now - WEEK) last7.push(intensity);
          else if (ts >= now - 2 * WEEK && ts < now - WEEK) prev7.push(intensity);
        });
        const lastAvg = last7.reduce((a, b) => a + b, 0) / Math.max(1, last7.length);
        const prevAvg = prev7.reduce((a, b) => a + b, 0) / Math.max(1, prev7.length);
        const escalating = last7.length >= 2 && prev7.length >= 2 && lastAvg - prevAvg >= 1;
        const dominantSensation = Object.entries(stat.sensations).sort((a, b) => b[1] - a[1])[0]?.[0] || "tight";

        return {
          ...stat,
          confidence: conf,
          avgIntensity: Number(avgIntensity.toFixed(2)),
          escalating,
          dominantSensation,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  const weightedHeatScores = useMemo(() => {
    const scores = {};
    entries.forEach((e) => {
      scores[e.sensationRegion] = (scores[e.sensationRegion] || 0) + (Number(e.intensity) || 0);
    });
    return scores;
  }, [entries]);

  const connectionLinks = useMemo(() => {
    return chainStats.slice(0, 10).map((c) => ({
      key: c.key,
      originRegion: c.originRegion,
      sensationRegion: c.sensationRegion,
      count: c.count,
      sensationType: c.dominantSensation,
    }));
  }, [chainStats]);

  const timelineData = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-30)
      .map((e, idx) => ({
        idx: idx + 1,
        intensity: Number(e.intensity) || 0,
        label: `${toLabel(e.originRegion)} -> ${toLabel(e.sensationRegion)}`,
      }));
  }, [entries]);

  const assessmentTrendData = useMemo(() => {
    const byDate = {};
    assessments.forEach((a) => {
      const key = new Date(a.timestamp).toLocaleDateString();
      const left = Number(a.leftValue);
      const right = Number(a.rightValue);
      if (Number.isNaN(left) || Number.isNaN(right)) return;
      byDate[key] = (left + right) / 2;
    });
    return Object.entries(byDate).map(([date, avg]) => ({ date, avg: Number(avg.toFixed(2)) }));
  }, [assessments]);

  const loadLastEntry = () => {
    if (!entries.length) return;
    const last = entries[entries.length - 1];
    setForm((prev) => ({
      ...prev,
      originRegion: last.originRegion,
      sensationRegion: last.sensationRegion,
      movement: last.movement,
      sensationType: last.sensationType,
      intensity: last.intensity,
      whenLabel: last.whenLabel,
      notes: "",
      context: last.context || [],
    }));
    setView(REGIONS.find((r) => r.id === last.originRegion)?.view || "front");
    setPickMode("origin");
  };

  const saveEntry = () => {
    if (!form.originRegion || !form.sensationRegion || !form.movement) return;
    setEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...form,
        timestamp: new Date().toISOString(),
      },
    ]);
    setForm((prev) => ({ ...prev, notes: "", intensity: Math.max(2, prev.intensity - 1) }));
  };

  const addAssessment = () => {
    if (!assessmentForm.leftValue || !assessmentForm.rightValue) return;
    setAssessments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...assessmentForm,
        timestamp: new Date().toISOString(),
      },
    ]);
    setAssessmentForm((prev) => ({ ...prev, leftValue: "", rightValue: "" }));
  };

  const patternCard = (chain) => (
    <div key={chain.key} className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-zinc-200">
          {toLabel(chain.originRegion)} <span className="text-zinc-500">{"->"}</span> {toLabel(chain.sensationRegion)}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${confidenceClass(chain.confidence)}`}>
          {chain.confidence} confidence
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <span>{chain.count} logs</span>
        <span>avg intensity {chain.avgIntensity}</span>
        <span style={{ color: SENSATION_COLORS[chain.dominantSensation] }}>
          {chain.dominantSensation}
        </span>
        {chain.escalating && <span className="text-rose-300">escalating this week</span>}
      </div>
    </div>
  );

  const tabButtonClass = (id) =>
    `px-3 py-1.5 rounded-md text-sm border transition ${
      tab === id
        ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-200"
        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
    }`;

  const selectByMap = (regionId) => {
    if (pickMode === "origin") {
      setForm((prev) => ({ ...prev, originRegion: regionId }));
      setPickMode("sensation");
      return;
    }
    setForm((prev) => ({ ...prev, sensationRegion: regionId }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-3 sm:p-5">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Dot Body Map</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Interactive compensation tracker with persistent logs, trend visibility, and quick re-entry flow.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={tabButtonClass("log")} onClick={() => setTab("log")}>
              Log
            </button>
            <button className={tabButtonClass("dashboard")} onClick={() => setTab("dashboard")}>
              Dashboard
            </button>
            <button className={tabButtonClass("assessments")} onClick={() => setTab("assessments")}>
              Assessments
            </button>
          </div>
        </header>

        {tab === "log" && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-zinc-300">Map Picker</div>
                <div className="flex items-center gap-2">
                  <button
                    className={`px-2 py-1 text-xs rounded ${view === "front" ? "bg-cyan-600 text-cyan-50" : "bg-zinc-800 text-zinc-300"}`}
                    onClick={() => setView("front")}
                  >
                    Front
                  </button>
                  <button
                    className={`px-2 py-1 text-xs rounded ${view === "back" ? "bg-cyan-600 text-cyan-50" : "bg-zinc-800 text-zinc-300"}`}
                    onClick={() => setView("back")}
                  >
                    Back
                  </button>
                </div>
              </div>

              <BodyFigure
                view={view}
                originRegion={form.originRegion}
                sensationRegion={form.sensationRegion}
                onPick={selectByMap}
                pickMode={pickMode}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-200 text-sm hover:bg-zinc-700"
                  onClick={() => setPickMode("origin")}
                >
                  Select Origin
                </button>
                <button
                  className="px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-200 text-sm hover:bg-zinc-700"
                  onClick={() => setPickMode("sensation")}
                >
                  Select Sensation
                </button>
                <button
                  className="px-3 py-1.5 rounded-md bg-cyan-700/60 text-cyan-100 text-sm hover:bg-cyan-700"
                  onClick={loadLastEntry}
                >
                  Log Again
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Selected Origin</label>
                  <div className="text-sm text-zinc-100">{form.originRegion ? toLabel(form.originRegion) : "None"}</div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Selected Sensation Location</label>
                  <div className="text-sm text-zinc-100">{form.sensationRegion ? toLabel(form.sensationRegion) : "None"}</div>
                </div>

                {commonPairs.length > 0 && (
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Common Pair Suggestions</label>
                    <div className="flex flex-wrap gap-2">
                      {commonPairs.map((p) => (
                        <button
                          key={p.regionId}
                          onClick={() => setForm((prev) => ({ ...prev, sensationRegion: p.regionId }))}
                          className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
                        >
                          {p.label} ({p.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Movement Pattern</label>
                  <select
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={form.movement}
                    onChange={(e) => setForm((prev) => ({ ...prev, movement: e.target.value }))}
                  >
                    <option value="">Select movement...</option>
                    {movementOptions.map((movement) => (
                      <option key={movement} value={movement}>
                        {movement}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">What do you feel?</label>
                  <select
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={form.sensationType}
                    onChange={(e) => setForm((prev) => ({ ...prev, sensationType: e.target.value }))}
                  >
                    {SENSATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Intensity: {form.intensity}</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={form.intensity}
                    onChange={(e) => setForm((prev) => ({ ...prev, intensity: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">When?</label>
                  <select
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={form.whenLabel}
                    onChange={(e) => setForm((prev) => ({ ...prev, whenLabel: e.target.value }))}
                  >
                    {WHEN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Session Context</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTEXT_CHIPS.map((chip) => {
                      const active = form.context.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={`rounded-full border px-2.5 py-1 text-xs ${
                            active
                              ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
                              : "border-zinc-600 bg-zinc-800 text-zinc-300"
                          }`}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              context: active
                                ? prev.context.filter((c) => c !== chip)
                                : [...prev.context, chip],
                            }))
                          }
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Anything else you noticed..."
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={saveEntry}
                    className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-cyan-50 hover:bg-cyan-500"
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() =>
                      setForm({
                        originRegion: "",
                        sensationRegion: "",
                        movement: "",
                        sensationType: "tight",
                        intensity: 4,
                        whenLabel: "during movement",
                        notes: "",
                        context: [],
                      })
                    }
                    className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "dashboard" && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="text-xs text-zinc-400">Total Logs</div>
                <div className="text-xl font-semibold">{entries.length}</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="text-xs text-zinc-400">Patterns Detected</div>
                <div className="text-xl font-semibold">{chainStats.filter((c) => c.count >= 3).length}</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="text-xs text-zinc-400">Escalating Chains</div>
                <div className="text-xl font-semibold">{chainStats.filter((c) => c.escalating).length}</div>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="text-xs text-zinc-400">High Intensity (8+)</div>
                <div className="text-xl font-semibold">{entries.filter((e) => Number(e.intensity) >= 8).length}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm text-zinc-300">Weighted Heat Map + Chains</div>
                  <div className="flex gap-2">
                    <button
                      className={`px-2 py-1 text-xs rounded ${view === "front" ? "bg-cyan-600 text-cyan-50" : "bg-zinc-800 text-zinc-300"}`}
                      onClick={() => setView("front")}
                    >
                      Front
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded ${view === "back" ? "bg-cyan-600 text-cyan-50" : "bg-zinc-800 text-zinc-300"}`}
                      onClick={() => setView("back")}
                    >
                      Back
                    </button>
                  </div>
                </div>
                <BodyFigure
                  view={view}
                  originRegion={form.originRegion}
                  sensationRegion={form.sensationRegion}
                  onPick={() => {}}
                  pickMode="origin"
                  heatScores={weightedHeatScores}
                  links={connectionLinks}
                  showHeat
                />
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="text-sm text-zinc-300 mb-3">Recent Intensity Timeline</div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                      <XAxis dataKey="idx" stroke="#a1a1aa" />
                      <YAxis domain={[0, 10]} stroke="#a1a1aa" />
                      <Tooltip
                        contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", color: "#f4f4f5" }}
                        formatter={(value) => [`${value}`, "Intensity"]}
                        labelFormatter={(label) => `Log ${label}`}
                      />
                      <Line type="monotone" dataKey="intensity" stroke="#22d3ee" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm text-zinc-300">Dominant Compensation Chains</h3>
              {chainStats.length === 0 ? (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-400">
                  No patterns yet. Add a few logs to reveal repeated origin {"->"} sensation chains.
                </div>
              ) : (
                chainStats.slice(0, 8).map(patternCard)
              )}
            </div>
          </section>
        )}

        {tab === "assessments" && (
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
              <h3 className="text-sm text-zinc-300">Assessment Tracker</h3>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Test</label>
                <select
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                  value={assessmentForm.test}
                  onChange={(e) => {
                    const picked = ASSESSMENT_TESTS.find((t) => t.name === e.target.value);
                    setAssessmentForm((prev) => ({
                      ...prev,
                      test: e.target.value,
                      unit: picked?.unit || "score",
                    }));
                  }}
                >
                  {ASSESSMENT_TESTS.map((test) => (
                    <option key={test.name} value={test.name}>
                      {test.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Left</label>
                  <input
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={assessmentForm.leftValue}
                    onChange={(e) => setAssessmentForm((prev) => ({ ...prev, leftValue: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Right</label>
                  <input
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={assessmentForm.rightValue}
                    onChange={(e) => setAssessmentForm((prev) => ({ ...prev, rightValue: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Unit</label>
                <input
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                  value={assessmentForm.unit}
                  onChange={(e) => setAssessmentForm((prev) => ({ ...prev, unit: e.target.value }))}
                />
              </div>

              <button
                onClick={addAssessment}
                className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-cyan-50 hover:bg-cyan-500"
              >
                Save Assessment
              </button>

              <div className="max-h-72 overflow-auto space-y-2 pr-1">
                {assessments
                  .slice()
                  .reverse()
                  .map((item) => {
                    const left = Number(item.leftValue);
                    const right = Number(item.rightValue);
                    const denominator = Math.max(1, (Math.abs(left) + Math.abs(right)) / 2);
                    const asymPct = (Math.abs(left - right) / denominator) * 100;
                    const isFlagged = asymPct > 15;
                    return (
                      <div key={item.id} className="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-200">{item.test}</span>
                          <span className={`text-xs ${isFlagged ? "text-rose-300" : "text-zinc-400"}`}>
                            asymmetry {Number.isFinite(asymPct) ? `${asymPct.toFixed(1)}%` : "n/a"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          L {item.leftValue} / R {item.rightValue} {item.unit} •{" "}
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <h3 className="text-sm text-zinc-300 mb-3">Monthly Progress Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assessmentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="date" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", color: "#f4f4f5" }}
                      formatter={(value) => [`${value}`, "Average L/R"]}
                    />
                    <Line type="monotone" dataKey="avg" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
