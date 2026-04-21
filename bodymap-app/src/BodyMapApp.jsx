import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Compass,
  Gauge,
  HeartPulse,
  Settings as SettingsIcon,
} from "lucide-react";
import MuscleAtlas from "./MuscleAtlas";
import MuscleMechanicsPanel from "./MuscleMechanicsPanel";
import RelationshipEdgesPanel from "./RelationshipEdgesPanel";
import MuscleStatePanel from "./MuscleStatePanel";
import RemedyPanel from "./RemedyPanel";
import MovementRecruitmentPanel from "./MovementRecruitmentPanel";
import SessionPlanner from "./SessionPlanner";
import TodayScreen from "./TodayScreen";
import BodyScreen from "./BodyScreen";
import PlanScreen from "./PlanScreen";
import ProgressScreen from "./ProgressScreen";
import OnboardingFlow from "./OnboardingFlow";
import TourOverlay from "./TourOverlay";
import SettingsDrawer from "./SettingsDrawer";
import StreakBadge from "./StreakBadge";
import MilestoneToast from "./MilestoneToast";
import { recordActivity } from "./lib/recordActivity";
import { checkMilestones } from "./lib/checkMilestones";
import { useBodyBalanceScore } from "./lib/useBodyBalanceScore";
import { MUSCLES, getMuscle, getMuscleLabel, migrateLegacyId, fromMuscleId, getBodySlug, SUB_MUSCLES } from "./muscle-data";

const TrendCharts = lazy(() => import("./TrendCharts.jsx"));

const STORAGE_KEY = "dot-body-map-v3";
// Stage 02-B / F1 — schemaVersion bumped from 2 to 3. v3 adds the four
// append-only logs (stateChanges, goals, adherence, dailySnapshots)
// alongside the existing v2 fields and U7+U8 additions, all inside the
// same single-blob localStorage key.
const STORAGE_SCHEMA_VERSION = 3;

// Stage 02-A.5 / U7+U8 — additive defaults folded into v3 verbatim.
// These three blocks were introduced on schemaVersion=2 by U7 (onboarding)
// and U8 (streak, milestones); F1 carries them across the bump unchanged.
const DEFAULT_ONBOARDING = Object.freeze({
  completedAt: null,
  intent: null,
  tourSeen: { today: false, body: false, plan: false, progress: false },
});
const DEFAULT_STREAK = Object.freeze({
  current: 0,
  longest: 0,
  lastActiveDate: null,
});
const DEFAULT_MILESTONES = Object.freeze([]);

function normalizeOnboarding(value) {
  if (!value || typeof value !== "object") return { ...DEFAULT_ONBOARDING, tourSeen: { ...DEFAULT_ONBOARDING.tourSeen } };
  return {
    completedAt: typeof value.completedAt === "string" ? value.completedAt : null,
    intent: typeof value.intent === "string" ? value.intent : null,
    tourSeen: {
      today: !!value.tourSeen?.today,
      body: !!value.tourSeen?.body,
      plan: !!value.tourSeen?.plan,
      progress: !!value.tourSeen?.progress,
    },
  };
}

function normalizeStreak(value) {
  if (!value || typeof value !== "object") return { ...DEFAULT_STREAK };
  return {
    current: Number.isFinite(value.current) ? Math.max(0, Math.floor(value.current)) : 0,
    longest: Number.isFinite(value.longest) ? Math.max(0, Math.floor(value.longest)) : 0,
    lastActiveDate: typeof value.lastActiveDate === "string" ? value.lastActiveDate : null,
  };
}

function normalizeMilestones(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((m) => m && typeof m.id === "string" && typeof m.achievedAt === "string")
    .map((m) => ({ id: m.id, achievedAt: m.achievedAt }));
}

// Stage 02-B / F1 — v3 append-only log normalizers.
// All four logs are flat arrays and are write-through persisted into the
// same `dot-body-map-v3` key. They are deliberately permissive on read so a
// hand-edited or future-versioned blob doesn't crash the load path.
function newId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Stage 02-B / F6 — local-time YYYY-MM-DD key for adherence rows. Mirrors
// `dayKey()` in src/metrics/helpers.js without pulling the metrics module
// onto the persistence path.
function isoDayKeyLocal(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const VALID_STATES = new Set(["normal", "tight", "weak"]);

function normalizeStateChanges(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (event) =>
        event && typeof event === "object" &&
        typeof event.muscleId === "string" &&
        typeof event.timestamp === "string"
    )
    .map((event) => ({
      id: typeof event.id === "string" ? event.id : newId("sc"),
      muscleId: migrateLegacyId(event.muscleId),
      fromState: VALID_STATES.has(event.fromState) ? event.fromState : "normal",
      toState: VALID_STATES.has(event.toState) ? event.toState : "normal",
      timestamp: event.timestamp,
      source: typeof event.source === "string" ? event.source : "manual",
    }));
}

function normalizeAdherence(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row) => row && typeof row === "object" && typeof row.id === "string")
    .map((row) => ({
      ...row,
      muscleId:
        typeof row.muscleId === "string" ? migrateLegacyId(row.muscleId) : row.muscleId,
    }));
}

// Stage 02-B / F5 — goal shape normalizer. Accepts both the v3 spec shape
// (per stages/02-tracking-metrics/output/plan.md §3.3) and the legacy U7
// onboarding shape (`{ kind: "reduce"|"balance"|"explore"|"learn",
// muscleId, rationale }`) and folds U7 seeds into v3 in place so they
// persist with the same id and no duplicates.
//
// v3 kinds:
//   "reduce-flagged-days" — targets one muscleId, targetValue = max
//                           acceptable flagged days over targetWindowDays
//   "improve-symmetry"    — targets composite symmetry, lower is better
//   "hit-adherence"       — targets weekly adherence rate (0..1), higher
//                           is better
//   "freeform"            — text-only goal (notes / label), no progress bar
const VALID_GOAL_KINDS = new Set([
  "reduce-flagged-days",
  "improve-symmetry",
  "hit-adherence",
  "freeform",
]);

const U7_GOAL_KIND_MAP = {
  reduce: "reduce-flagged-days",
  balance: "improve-symmetry",
  explore: "freeform",
  learn: "freeform",
};

function normalizeOneGoal(goal) {
  if (!goal || typeof goal !== "object") return null;
  const id =
    typeof goal.id === "string" && goal.id ? goal.id : newId("g");
  const createdAt =
    typeof goal.createdAt === "string" ? goal.createdAt : new Date().toISOString();
  const status =
    goal.status === "achieved" || goal.status === "archived" ? goal.status : "active";

  const rawKind = typeof goal.kind === "string" ? goal.kind : null;
  const mappedKind = rawKind && U7_GOAL_KIND_MAP[rawKind];
  const kind = VALID_GOAL_KINDS.has(rawKind)
    ? rawKind
    : mappedKind || "freeform";

  const targetMuscleId =
    typeof goal.targetMuscleId === "string" && goal.targetMuscleId
      ? migrateLegacyId(goal.targetMuscleId)
      : typeof goal.muscleId === "string" && goal.muscleId
        ? migrateLegacyId(goal.muscleId)
        : null;

  const targetValue = Number.isFinite(goal.targetValue) ? goal.targetValue : null;
  const targetWindowDays = Number.isFinite(goal.targetWindowDays)
    ? goal.targetWindowDays
    : kind === "improve-symmetry"
      ? 60
      : 30;

  const targetMetric =
    kind === "reduce-flagged-days"
      ? "M1"
      : kind === "improve-symmetry"
        ? "M3"
        : kind === "hit-adherence"
          ? "M7"
          : null;

  const label =
    typeof goal.label === "string" && goal.label
      ? goal.label
      : typeof goal.rationale === "string"
        ? goal.rationale
        : null;
  const notes =
    typeof goal.notes === "string"
      ? goal.notes
      : typeof goal.rationale === "string"
        ? goal.rationale
        : "";

  return {
    id,
    createdAt,
    kind,
    targetMuscleId,
    targetMetric,
    targetValue,
    targetWindowDays,
    status,
    label,
    notes,
  };
}

function normalizeGoals(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of value) {
    const goal = normalizeOneGoal(raw);
    if (!goal) continue;
    if (seen.has(goal.id)) continue;
    seen.add(goal.id);
    out.push(goal);
  }
  return out;
}

function normalizeDailySnapshots(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (snap) => snap && typeof snap === "object" && typeof snap.date === "string"
  );
}

// Stage 02-B / F1 — fold v1/v2 (with U7+U8 additive fields) into v3 in
// place. Idempotent on already-v3 blobs so import never double-seeds.
//
// Migration rules (per stages/02-tracking-metrics/output/plan.md §3.2):
//  1. Initialize the four new logs if missing.
//  2. If schemaVersion < 3, seed `stateChanges` from current
//     `muscleStates[id].updatedAt` with `source: "migration-seed"` so the
//     dashboards have a non-zero baseline on day one.
//  3. Apply `migrateLegacyId()` to every muscleId that lands in v3 logs.
//  4. Preserve every existing field (entries, assessments, muscleStates,
//     onboarding, streak, milestones) untouched.
function migrateBlobToV3(parsed) {
  if (!parsed || typeof parsed !== "object") return parsed;
  const incomingVersion = Number.isFinite(parsed.schemaVersion) ? parsed.schemaVersion : 1;

  const baseGoals = normalizeGoals(parsed.goals);
  const baseAdherence = normalizeAdherence(parsed.adherence);
  const baseDailySnapshots = normalizeDailySnapshots(parsed.dailySnapshots);

  if (incomingVersion >= 3) {
    return {
      ...parsed,
      schemaVersion: 3,
      stateChanges: normalizeStateChanges(parsed.stateChanges),
      goals: baseGoals,
      adherence: baseAdherence,
      dailySnapshots: baseDailySnapshots,
    };
  }

  const muscleStates =
    parsed.muscleStates && typeof parsed.muscleStates === "object" ? parsed.muscleStates : {};
  const seededStateChanges = Object.entries(muscleStates)
    .map(([rawId, value]) => {
      if (!value || typeof value !== "object") return null;
      const state = typeof value.state === "string" ? value.state : null;
      const updatedAt = typeof value.updatedAt === "string" ? value.updatedAt : null;
      if (!state || !updatedAt || !VALID_STATES.has(state) || state === "normal") return null;
      return {
        id: newId("sc"),
        muscleId: migrateLegacyId(rawId),
        fromState: "normal",
        toState: state,
        timestamp: updatedAt,
        source: "migration-seed",
      };
    })
    .filter(Boolean);

  return {
    ...parsed,
    schemaVersion: 3,
    stateChanges: [...normalizeStateChanges(parsed.stateChanges), ...seededStateChanges],
    goals: baseGoals,
    adherence: baseAdherence,
    dailySnapshots: baseDailySnapshots,
  };
}

const MOVEMENT_GROUPS = {
  squat: [
    "Bodyweight Squat",
    "Goblet Squat",
    "Back Squat",
    "Front Squat",
    "Split Squat",
    "Bulgarian Split Squat",
    "Step-up",
    "Pistol Squat (assisted)",
  ],
  hinge: [
    "Deadlift",
    "Romanian Deadlift",
    "Single-leg RDL",
    "Good Morning",
    "Hip Thrust",
    "Kettlebell Swing",
    "Cable Pull-through",
  ],
  push: [
    "Bench Press",
    "Incline Press",
    "Overhead Press",
    "Push-up",
    "Dips",
    "Landmine Press",
  ],
  pull: ["Row", "Chest-supported Row", "Cable Row", "Lat Pulldown", "Pull-up", "Face Pull"],
  rotation: ["Thoracic Rotation", "Wood Chop", "Cable Rotation", "Pallof Press", "Open Book"],
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
    "Hip Internal Rotation",
    "Ankle Dorsiflexion Knee-to-wall",
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

const WHEN_OPTIONS = ["during movement", "after movement", "at rest", "in the morning", "end of work day"];
const PHASE_OPTIONS = ["before movement", "during movement", "after movement"];
const CONTEXT_CHIPS = ["post-leg-day", "desk-heavy day", "poor sleep", "high stress"];

const ASSESSMENT_TESTS = [
  { name: "Overhead Squat", unit: "score" },
  { name: "Thomas Test", unit: "deg" },
  { name: "Wall Angel", unit: "pass/fail" },
  { name: "Single-leg Balance", unit: "sec" },
  { name: "Hip Internal Rotation", unit: "deg" },
  { name: "Hip External Rotation", unit: "deg" },
  { name: "Ankle Dorsiflexion Knee-to-wall", unit: "cm" },
  { name: "90/90 Hip Lift Hold", unit: "sec" },
  { name: "Side Plank Endurance", unit: "sec" },
  { name: "Single-leg Sit-to-stand", unit: "reps" },
];

const MOVEMENT_BIOMECH_HINTS = {
  squat: {
    primeRegions: ["abs-l", "abs-r", "gluteal-l", "gluteal-r",
      "quadriceps-l", "quadriceps-r"],
    note: "Primary demand: trunk stiffness + coordinated knee/hip flexion and extension.",
  },
  hinge: {
    primeRegions: ["gluteal-l", "gluteal-r", "hamstring-l", "hamstring-r",
      "lower-back-l", "lower-back-r"],
    note: "Primary demand: posterior chain force with spinal bracing and hip displacement.",
  },
  push: {
    primeRegions: ["chest-l", "chest-r", "deltoids-l", "deltoids-r",
      "triceps-l", "triceps-r"],
    note: "Primary demand: shoulder girdle control and force transfer through trunk.",
  },
  pull: {
    primeRegions: ["upper-back-l", "upper-back-r", "trapezius-l", "trapezius-r",
      "biceps-l", "biceps-r"],
    note: "Primary demand: scapular control, shoulder extension/adduction, trunk stability.",
  },
  rotation: {
    primeRegions: ["obliques-l", "obliques-r", "abs-l", "abs-r",
      "lower-back-l", "lower-back-r"],
    note: "Primary demand: rotational power + anti-rotation control across trunk and hips.",
  },
  daily: {
    primeRegions: ["abs-l", "abs-r", "quadriceps-l", "quadriceps-r",
      "gluteal-l", "gluteal-r"],
    note: "Primary demand: low-level stabilization and repeatable gait/posture mechanics.",
  },
  assessment: {
    primeRegions: ["abs-l", "abs-r", "gluteal-l", "gluteal-r",
      "ankles-l", "ankles-r"],
    note: "Primary demand: movement quality, control, and asymmetry detection.",
  },
};

const EMPTY_FORM = {
  originRegion: "",
  sensationRegion: "",
  movement: "",
  sensationType: "tight",
  intensity: 4,
  whenLabel: "during movement",
  phase: "during movement",
  notes: "",
  context: [],
};

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toLabel(regionId) {
  return getMuscleLabel(regionId);
}

function confidenceLabel(count) {
  if (count >= 8) return "high";
  if (count >= 5) return "medium";
  if (count >= 3) return "low";
  return "none";
}

function confidenceClass(conf) {
  if (conf === "high") return "bg-emerald-500/20 text-emerald-200 border-emerald-400/50";
  if (conf === "medium") return "bg-amber-500/20 text-amber-200 border-amber-400/50";
  if (conf === "low") return "bg-sky-500/20 text-sky-200 border-sky-400/50";
  return "bg-zinc-700 text-zinc-200 border-zinc-500";
}

function sideOf(regionId) {
  const info = getBodySlug(regionId) || fromMuscleId(regionId);
  if (info?.side === "left") return "left";
  if (info?.side === "right") return "right";
  return "midline";
}

function migrateEntries(entries) {
  return entries.map((e) => ({
    ...e,
    originRegion: migrateLegacyId(e.originRegion),
    sensationRegion: migrateLegacyId(e.sensationRegion),
  }));
}

export default function BodyMapApp() {
  const [loaded, setLoaded] = useState(false);
  // U2: new four-tab IA — Today / Body / Plan / Progress (default: today).
  const [tab, setTab] = useState("today");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState("front");
  const [pickMode, setPickMode] = useState("origin");
  const [entries, setEntries] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [muscleStates, setMuscleStates] = useState({});
  const [recruitmentTint, setRecruitmentTint] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [movementSearch, setMovementSearch] = useState("");
  const [assessmentSearch, setAssessmentSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState({ sensationType: "all", minIntensity: 0, side: "all" });
  const [assessmentForm, setAssessmentForm] = useState({
    test: ASSESSMENT_TESTS[0].name,
    leftValue: "",
    rightValue: "",
    unit: ASSESSMENT_TESTS[0].unit,
  });
  // Stage 02-A.5 / U5: Calibrate "Re-run intake" bumps this counter; SessionPlanner
  // opens its wizard whenever the value changes.
  const [intakeTrigger, setIntakeTrigger] = useState(0);
  // Stage 02-A.5 / U7+U8 — additive on schemaVersion=2.
  const [onboarding, setOnboarding] = useState(() => normalizeOnboarding(null));
  const [streak, setStreak] = useState(() => normalizeStreak(null));
  const [milestones, setMilestones] = useState(() => normalizeMilestones(null));
  // Stage 02-A.5 / U7 — onboarding step 5 seeds goals here. Stage 02-B / F5
  // persists the same React state to v3 `goals[]` on every save.
  const [goals, setGoals] = useState([]);
  // Stage 02-A.5 / U8 — milestone toast queue + extra synthesized catalog
  // entries (region-mastery) so the toast can resolve labels for ids that
  // aren't in the static catalog.
  const [toastQueue, setToastQueue] = useState([]);
  const [extraCatalog, setExtraCatalog] = useState([]);
  // Stage 02-B / F1 — v3 append-only logs. `stateChanges` is the
  // foundational record every Stage 02-B metric (M1-M9) computes from;
  // `adherence` is owned by F6 UI; `dailySnapshots` is opt-in future work.
  const [stateChanges, setStateChanges] = useState([]);
  const [adherence, setAdherence] = useState([]);
  const [dailySnapshots, setDailySnapshots] = useState([]);

  useEffect(() => {
    const hydrateFromParsed = (raw) => {
      // Stage 02-B / F1 — every load path goes through migrateBlobToV3 so
      // a v1 or v2 blob is upgraded in memory before any state setter runs.
      const parsed = migrateBlobToV3(raw);
      setEntries(migrateEntries(Array.isArray(parsed.entries) ? parsed.entries : []));
      setAssessments(Array.isArray(parsed.assessments) ? parsed.assessments : []);
      setMuscleStates(parsed.muscleStates && typeof parsed.muscleStates === "object" ? parsed.muscleStates : {});
      setOnboarding(normalizeOnboarding(parsed.onboarding));
      setStreak(normalizeStreak(parsed.streak));
      setMilestones(normalizeMilestones(parsed.milestones));
      setStateChanges(Array.isArray(parsed.stateChanges) ? parsed.stateChanges : []);
      // Stage 02-B / F5 — goals[] is now persisted. migrateBlobToV3 already
      // applied `normalizeGoals` (which folds U7-shaped seeds into v3 and
      // runs migrateLegacyId on every targetMuscleId), so we just hydrate.
      setGoals(Array.isArray(parsed.goals) ? parsed.goals : []);
      setAdherence(Array.isArray(parsed.adherence) ? parsed.adherence : []);
      setDailySnapshots(Array.isArray(parsed.dailySnapshots) ? parsed.dailySnapshots : []);
      setLoaded(true);
    };
    const storage = window.storage || window.localStorage;
    const maybe = storage?.getItem?.(STORAGE_KEY);
    if (!maybe) {
      setLoaded(true);
      return;
    }
    if (typeof maybe.then === "function") {
      maybe
        .then((raw) => hydrateFromParsed(safeParse(raw || "{}", {})))
        .catch(() => setLoaded(true));
      return;
    }
    hydrateFromParsed(safeParse(maybe || "{}", {}));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const storage = window.storage || window.localStorage;
    const payload = JSON.stringify({
      schemaVersion: STORAGE_SCHEMA_VERSION,
      entries,
      assessments,
      muscleStates,
      onboarding,
      streak,
      milestones,
      // Stage 02-B / F5 — goals[] is now write-through. F1's literal
      // placeholder is replaced with the live React state so create / edit /
      // archive operations from GoalsPanel + the U7 onboarding seed survive
      // a page reload.
      stateChanges,
      goals,
      adherence,
      dailySnapshots,
    });
    const maybe = storage?.setItem?.(STORAGE_KEY, payload);
    if (maybe && typeof maybe.catch === "function") maybe.catch(() => {});
  }, [
    loaded,
    entries,
    assessments,
    muscleStates,
    onboarding,
    streak,
    milestones,
    stateChanges,
    goals,
    adherence,
    dailySnapshots,
  ]);

  const movementOptions = useMemo(() => {
    const muscle = getMuscle(form.originRegion);
    const keys = muscle?.movementGroups?.length ? muscle.movementGroups : Object.keys(MOVEMENT_GROUPS);
    const expanded = keys.flatMap((k) => MOVEMENT_GROUPS[k] || []);
    const unique = [...new Set(expanded)];
    if (!movementSearch.trim()) return unique;
    const q = movementSearch.trim().toLowerCase();
    return unique.filter((m) => m.toLowerCase().includes(q));
  }, [form.originRegion, movementSearch]);

  const bodyIntel = useMemo(() => {
    const muscle = getMuscle(form.originRegion);
    if (!muscle) return null;

    const movementGroup =
      Object.entries(MOVEMENT_GROUPS).find(([, names]) => names.includes(form.movement))?.[0] ||
      muscle.movementGroups?.[0] ||
      "daily";

    const movementIntel = MOVEMENT_BIOMECH_HINTS[movementGroup] || MOVEMENT_BIOMECH_HINTS.daily;
    const topCompensators = (muscle.commonCompensators || [])
      .slice(0, 4)
      .map((id) => ({ id, label: toLabel(id) }));

    const mismatchRisk =
      form.sensationRegion &&
      form.sensationRegion !== form.originRegion &&
      !movementIntel.primeRegions.includes(form.sensationRegion);

    return {
      regionLabel: muscle.label,
      movementGroup,
      movementNote: movementIntel.note,
      primaryActions: muscle.primaryActions || [],
      primeRegions: movementIntel.primeRegions || [],
      topCompensators,
      mismatchRisk,
      clinicalNotes: muscle.clinicalNotes,
    };
  }, [form.originRegion, form.movement, form.sensationRegion]);

  const assessmentOptions = useMemo(() => {
    if (!assessmentSearch.trim()) return ASSESSMENT_TESTS;
    const q = assessmentSearch.toLowerCase();
    return ASSESSMENT_TESTS.filter((t) => t.name.toLowerCase().includes(q));
  }, [assessmentSearch]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (filter.sensationType !== "all" && entry.sensationType !== filter.sensationType) return false;
      if (Number(entry.intensity) < Number(filter.minIntensity)) return false;
      if (filter.side === "left") {
        const left = sideOf(entry.originRegion) === "left" || sideOf(entry.sensationRegion) === "left";
        if (!left) return false;
      }
      if (filter.side === "right") {
        const right = sideOf(entry.originRegion) === "right" || sideOf(entry.sensationRegion) === "right";
        if (!right) return false;
      }
      return true;
    });
  }, [entries, filter]);

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

  const chains = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => {
      const key = `${entry.originRegion}->${entry.sensationRegion}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          originRegion: entry.originRegion,
          sensationRegion: entry.sensationRegion,
          count: 0,
          intensities: [],
          sensations: {},
          timestamps: [],
        });
      }
      const chain = map.get(key);
      chain.count += 1;
      chain.intensities.push(Number(entry.intensity) || 0);
      chain.sensations[entry.sensationType] = (chain.sensations[entry.sensationType] || 0) + 1;
      chain.timestamps.push(new Date(entry.timestamp).getTime());
    });

    const now = Date.now();
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    return [...map.values()]
      .map((chain) => {
        const last7 = [];
        const prev7 = [];
        chain.timestamps.forEach((ts, idx) => {
          if (ts >= now - WEEK) last7.push(chain.intensities[idx]);
          else if (ts >= now - 2 * WEEK && ts < now - WEEK) prev7.push(chain.intensities[idx]);
        });
        const lastAvg = last7.reduce((a, b) => a + b, 0) / Math.max(1, last7.length);
        const prevAvg = prev7.reduce((a, b) => a + b, 0) / Math.max(1, prev7.length);
        const dominantSensation = Object.entries(chain.sensations).sort((a, b) => b[1] - a[1])[0]?.[0] || "tight";
        return {
          ...chain,
          average: Number(
            (chain.intensities.reduce((sum, n) => sum + n, 0) / Math.max(1, chain.intensities.length)).toFixed(2)
          ),
          confidence: confidenceLabel(chain.count),
          escalating: last7.length >= 2 && prev7.length >= 2 && lastAvg - prevAvg >= 1,
          dominantSensation,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  const weightedHeatScores = useMemo(() => {
    const scores = {};
    filteredEntries.forEach((entry) => {
      scores[entry.sensationRegion] = (scores[entry.sensationRegion] || 0) + (Number(entry.intensity) || 0);
    });
    return scores;
  }, [filteredEntries]);

  const timelineData = useMemo(() => {
    return filteredEntries
      .slice()
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-40)
      .map((entry) => ({
        date: new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        intensity: Number(entry.intensity) || 0,
      }));
  }, [filteredEntries]);

  const assessmentTrendData = useMemo(() => {
    const byDate = {};
    assessments.forEach((a) => {
      const date = new Date(a.timestamp).toLocaleDateString();
      const left = Number(a.leftValue);
      const right = Number(a.rightValue);
      if (Number.isNaN(left) || Number.isNaN(right)) return;
      if (!byDate[date]) byDate[date] = { sum: 0, count: 0, ts: new Date(a.timestamp).getTime() };
      byDate[date].sum += (left + right) / 2;
      byDate[date].count += 1;
    });
    return Object.entries(byDate)
      .map(([date, { sum, count, ts }]) => ({ date, avg: Number((sum / count).toFixed(2)), ts }))
      .sort((a, b) => a.ts - b.ts);
  }, [assessments]);

  const symmetrySummary = useMemo(() => {
    const sensationLeft = entries.filter((e) => sideOf(e.sensationRegion) === "left");
    const sensationRight = entries.filter((e) => sideOf(e.sensationRegion) === "right");
    const leftAvg =
      sensationLeft.reduce((sum, e) => sum + (Number(e.intensity) || 0), 0) / Math.max(1, sensationLeft.length);
    const rightAvg =
      sensationRight.reduce((sum, e) => sum + (Number(e.intensity) || 0), 0) / Math.max(1, sensationRight.length);
    const sideDeltaPct = (Math.abs(leftAvg - rightAvg) / Math.max(1, (leftAvg + rightAvg) / 2)) * 100;

    const flaggedAssessments = assessments.filter((item) => {
      const left = Number(item.leftValue);
      const right = Number(item.rightValue);
      if (Number.isNaN(left) || Number.isNaN(right)) return false;
      const base = Math.max(1, (Math.abs(left) + Math.abs(right)) / 2);
      const asymPct = (Math.abs(left - right) / base) * 100;
      return asymPct > 15;
    }).length;

    return {
      sensationLeftCount: sensationLeft.length,
      sensationRightCount: sensationRight.length,
      leftAvg: Number(leftAvg.toFixed(2)),
      rightAvg: Number(rightAvg.toFixed(2)),
      sideDeltaPct: Number(sideDeltaPct.toFixed(1)),
      dominantSide:
        sideDeltaPct < 8
          ? "balanced"
          : leftAvg > rightAvg
            ? "left-heavy"
            : "right-heavy",
      flaggedAssessments,
    };
  }, [entries, assessments]);

  const patternsDetected = useMemo(() => {
    const detections = [];

    const referralChains = chains.filter((c) => c.originRegion !== c.sensationRegion && c.count >= 3);
    referralChains.slice(0, 3).forEach((chain) => {
      detections.push({
        id: `referral-${chain.key}`,
        level: "pattern",
        title: `${toLabel(chain.originRegion)} refers to ${toLabel(chain.sensationRegion)}`,
        trigger: `Trigger: same remote origin -> sensation pair logged ${chain.count} times.`,
      });
    });

    chains
      .filter((c) => c.escalating)
      .slice(0, 2)
      .forEach((chain) => {
        detections.push({
          id: `escalating-${chain.key}`,
          level: "risk",
          title: `${toLabel(chain.originRegion)} -> ${toLabel(chain.sensationRegion)} is escalating`,
          trigger: "Trigger: 7-day average intensity increased >= 1 point vs prior 7 days.",
        });
      });

    chains
      .filter((c) => c.average >= 7 && c.count >= 2)
      .slice(0, 2)
      .forEach((chain) => {
        detections.push({
          id: `high-strain-${chain.key}`,
          level: "risk",
          title: `High-strain chain: ${toLabel(chain.originRegion)} -> ${toLabel(chain.sensationRegion)}`,
          trigger: `Trigger: average intensity ${chain.average} across ${chain.count} logs.`,
        });
      });

    return detections.slice(0, 6);
  }, [chains]);

  // Stage 02-A.5 / U8 — single funnel for "user did something meaningful":
  // (1) bumps the streak via recordActivity(), (2) runs the milestone catalog
  // against the post-action snapshot, (3) appends newly-fired milestones to
  // both data.milestones and the toast queue.
  // Pass `nextState` overrides for fields the caller is about to mutate so
  // predicates see post-action truth (saveEntry hasn't committed setEntries
  // by the time recordMeaningfulAction runs in the same tick).
  const recordMeaningfulAction = (overrides = {}) => {
    const nextStreak = recordActivity(streak);
    setStreak(nextStreak);
    const snapshot = {
      entries: overrides.entries || entries,
      assessments: overrides.assessments || assessments,
      muscleStates: overrides.muscleStates || muscleStates,
      goals: overrides.goals || goals,
      streak: nextStreak,
      onboarding: overrides.onboarding || onboarding,
      score: bbs.score,
    };
    const { newlyFired, catalog } = checkMilestones(snapshot, milestones);
    if (newlyFired.length === 0) return;
    setMilestones((prev) => [...prev, ...newlyFired]);
    setToastQueue((prev) => [...prev, ...newlyFired]);
    const synth = catalog.filter((m) => !m.predicate);
    if (synth.length > 0) {
      setExtraCatalog((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const item of synth) {
          if (!seen.has(item.id)) {
            merged.push(item);
            seen.add(item.id);
          }
        }
        return merged;
      });
    }
  };

  // Stage 02-B / F1 — every flip writes one event to the append-only
  // stateChanges log. Callers can pass a `source` so we can later
  // distinguish manual tap-throughs ("manual"), the intake wizard
  // ("intake-wizard"), bulk imports ("import"), and synthetic seeds
  // ("migration-seed"). normal -> normal flips do not write events.
  const handleSetMuscleState = (muscleId, stateValue, source = "manual") => {
    const timestamp = new Date().toISOString();
    const normalizedId = migrateLegacyId(muscleId);
    const fromState = muscleStates[muscleId]?.state || "normal";
    const toState = stateValue || "normal";

    let nextStates;
    setMuscleStates((prev) => {
      if (!stateValue) {
        const next = { ...prev };
        delete next[muscleId];
        nextStates = next;
        return next;
      }
      nextStates = { ...prev, [muscleId]: { state: stateValue, updatedAt: timestamp } };
      return nextStates;
    });

    if (fromState !== toState) {
      setStateChanges((prev) => [
        ...prev,
        {
          id: newId("sc"),
          muscleId: normalizedId,
          fromState,
          toState,
          timestamp,
          source,
        },
      ]);
    }

    recordMeaningfulAction({ muscleStates: nextStates });
  };

  const saveEntry = () => {
    if (!form.originRegion || !form.sensationRegion || !form.movement) return;
    const newEntry = { id: crypto.randomUUID(), ...form, timestamp: new Date().toISOString() };
    const nextEntries = [...entries, newEntry];
    setEntries(nextEntries);
    setForm((prev) => ({ ...prev, notes: "", intensity: Math.max(2, prev.intensity - 1) }));
    recordMeaningfulAction({ entries: nextEntries });
  };

  // Stage 02-A.5 / U4 — Slide-out Log sub-tab calls this with a partial entry
  // already pre-filled to the selected muscle. U8 widened the contract so the
  // remedy-adherence event ({ kind: "adherence", muscleId, remedyId, timestamp })
  // also lands in entries[] and powers the first-remedy-done milestone.
  // Stage 02-B / F6 — adherence events ALSO flow through to the v3 adherence[]
  // log via handleAdherenceChange below so M7 / SupportingCardsRow have a
  // single source of truth. Legacy entries[] write stays for U8 milestone
  // back-compat.
  const saveSlideOutLog = (entry) => {
    if (!entry) return;
    const isAdherence = entry.kind === "adherence";
    if (!isAdherence && !entry.originRegion) return;
    const newEntry = isAdherence
      ? {
          id: crypto.randomUUID(),
          timestamp: entry.timestamp || new Date().toISOString(),
          ...entry,
        }
      : {
          id: crypto.randomUUID(),
          whenLabel: entry.phase || "during movement",
          context: [],
          ...entry,
        };
    const nextEntries = [...entries, newEntry];
    setEntries(nextEntries);
    if (isAdherence && entry.remedyId) {
      handleAdherenceChange({
        muscleId: entry.muscleId || null,
        remedyKey: entry.remedyId,
        remedyTitle: entry.remedyTitle || null,
        status: entry.status === "skipped" ? "skipped" : "done",
        source: "slide-out",
      });
    }
    recordMeaningfulAction({ entries: nextEntries });
  };

  // Stage 02-B / F6 — single entry point for writes to the append-only
  // adherence[] log. Dedupes by (date, muscleId, remedyKey) so seeding a
  // suggested row from SessionPlanner and later marking it done updates the
  // same row in place. Status transitions:
  //   suggested -> done  (user checked off in planner / slide-out)
  //   suggested -> skipped (user dismissed in planner)
  //   done      -> suggested (user un-checked the toggle)
  // Persistence is handled by the existing useEffect that snapshots the v3
  // shape to localStorage whenever any of the v3 logs change.
  const handleAdherenceChange = (row) => {
    if (!row || typeof row !== "object" || !row.remedyKey) return;
    const date = row.date || isoDayKeyLocal(new Date());
    const muscleId = row.muscleId ? migrateLegacyId(row.muscleId) : null;
    const remedyKey = row.remedyKey;
    const status = row.status || "suggested";
    const source = row.source || "session-planner";

    setAdherence((prev) => {
      const idx = prev.findIndex(
        (r) =>
          r.date === date &&
          (r.muscleId || null) === (muscleId || null) &&
          r.remedyKey === remedyKey,
      );
      const timestamp = new Date().toISOString();
      if (idx >= 0) {
        const merged = {
          ...prev[idx],
          status,
          source: prev[idx].source || source,
          remedyTitle: row.remedyTitle || prev[idx].remedyTitle || null,
          timestamp,
        };
        const next = [...prev];
        next[idx] = merged;
        return next;
      }
      return [
        ...prev,
        {
          id: newId("ad"),
          date,
          muscleId,
          remedyKey,
          remedyTitle: row.remedyTitle || null,
          status,
          source,
          timestamp,
        },
      ];
    });
  };

  const saveAssessment = () => {
    if (!assessmentForm.leftValue || !assessmentForm.rightValue) return;
    const newAssessment = { id: crypto.randomUUID(), ...assessmentForm, timestamp: new Date().toISOString() };
    const nextAssessments = [...assessments, newAssessment];
    setAssessments(nextAssessments);
    setAssessmentForm((prev) => ({ ...prev, leftValue: "", rightValue: "" }));
    recordMeaningfulAction({ assessments: nextAssessments });
  };

  const loadLastEntry = () => {
    if (!entries.length) return;
    const last = entries[entries.length - 1];
    setForm((prev) => ({ ...prev, ...last, notes: "" }));
    const muscle = getMuscle(last.originRegion);
    setView(muscle?.primaryView || "front");
    setPickMode("origin");
  };

  const muscleDropdownGroups = useMemo(() => {
    return MUSCLES.filter((m) => m.side === 'left').map((m) => ({
      slug: m.slug,
      groupLabel: m.label.replace(/ \(L\)$/, ''),
      subs: SUB_MUSCLES[m.slug] || null,
    }));
  }, []);

  const exportData = () => {
    // Stage 02-B / F5 — export mirrors the persisted v3 shape exactly,
    // including live goals[] (F1 wrote a literal []; F5 promoted the
    // React state into the persisted blob).
    const payload = {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      entries,
      assessments,
      muscleStates,
      onboarding,
      streak,
      milestones,
      stateChanges,
      goals,
      adherence,
      dailySnapshots,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dot-body-map-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportClinicalReport = () => {
    const dateLabel = new Date().toLocaleString();
    const topChains = chains.slice(0, 5);
    const topPatterns = patternsDetected.slice(0, 6);
    const highIntensityCount = entries.filter((e) => Number(e.intensity) >= 8).length;

    const markdown = [
      "# Dot Body Map Clinical Snapshot",
      "",
      `Generated: ${dateLabel}`,
      "",
      "## Overview",
      `- Total logs: ${entries.length}`,
      `- Patterns (3+ repeats): ${chains.filter((c) => c.count >= 3).length}`,
      `- Escalating chains: ${chains.filter((c) => c.escalating).length}`,
      `- High intensity logs (8+): ${highIntensityCount}`,
      "",
      "## Symmetry Summary",
      `- Dominant side profile: ${symmetrySummary.dominantSide}`,
      `- Side delta: ${symmetrySummary.sideDeltaPct}%`,
      `- Left avg intensity: ${symmetrySummary.leftAvg}`,
      `- Right avg intensity: ${symmetrySummary.rightAvg}`,
      `- Left sensation logs: ${symmetrySummary.sensationLeftCount}`,
      `- Right sensation logs: ${symmetrySummary.sensationRightCount}`,
      `- Assessment flags >15% asymmetry: ${symmetrySummary.flaggedAssessments}`,
      "",
      "## Top Compensation Chains",
      ...(topChains.length
        ? topChains.map(
            (chain, idx) =>
              `${idx + 1}. ${toLabel(chain.originRegion)} -> ${toLabel(chain.sensationRegion)} | logs: ${chain.count}, avg intensity: ${chain.average}, confidence: ${chain.confidence}, escalating: ${chain.escalating ? "yes" : "no"}`
          )
        : ["- No chains available yet."]),
      "",
      "## Rule-based Pattern Detections",
      ...(topPatterns.length
        ? topPatterns.map((p, idx) => `${idx + 1}. [${p.level}] ${p.title} — ${p.trigger}`)
        : ["- No rule triggers yet."]),
      "",
      "## Notes",
      "- This report is generated from in-app logs and is not a medical diagnosis.",
      "",
    ].join("\n");

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dot-body-map-clinical-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rawParsed = safeParse(text, null);
    if (!rawParsed) return;
    // Stage 02-B / F1 — run the same v3 migration on imported blobs so a
    // user importing a v1 or v2 export gets the synthetic seed treatment
    // and lands on schemaVersion: 3 in memory immediately.
    const parsed = migrateBlobToV3(rawParsed);
    if (Array.isArray(parsed.entries)) setEntries(migrateEntries(parsed.entries));
    if (Array.isArray(parsed.assessments)) setAssessments(parsed.assessments);
    if (parsed.muscleStates && typeof parsed.muscleStates === "object") setMuscleStates(parsed.muscleStates);
    if ("onboarding" in parsed) setOnboarding(normalizeOnboarding(parsed.onboarding));
    if ("streak" in parsed) setStreak(normalizeStreak(parsed.streak));
    if ("milestones" in parsed) setMilestones(normalizeMilestones(parsed.milestones));
    if (Array.isArray(parsed.stateChanges)) setStateChanges(parsed.stateChanges);
    // Stage 02-B / F5 — goals[] round-trips through migrateBlobToV3 →
    // normalizeGoals so legacy U7 seeds in older exports get folded into
    // v3 shape and migrateLegacyId() runs on every targetMuscleId.
    if (Array.isArray(parsed.goals)) setGoals(parsed.goals);
    if (Array.isArray(parsed.adherence)) setAdherence(parsed.adherence);
    if (Array.isArray(parsed.dailySnapshots)) setDailySnapshots(parsed.dailySnapshots);
    event.target.value = "";
  };

  // Stage 02-A.5 / U7 — onboarding handlers.
  const completeOnboarding = ({ intent }) => {
    let nextOnboarding;
    setOnboarding((prev) => {
      nextOnboarding = {
        ...prev,
        completedAt: new Date().toISOString(),
        intent: intent || prev.intent || null,
      };
      return nextOnboarding;
    });
    recordMeaningfulAction({ onboarding: nextOnboarding });
  };
  const skipOnboarding = () => {
    let nextOnboarding;
    setOnboarding((prev) => {
      nextOnboarding = {
        ...prev,
        completedAt: prev.completedAt || new Date().toISOString(),
      };
      return nextOnboarding;
    });
    recordMeaningfulAction({ onboarding: nextOnboarding });
  };
  const dismissTour = (tabName) => {
    setOnboarding((prev) => ({
      ...prev,
      tourSeen: { ...prev.tourSeen, [tabName]: true },
    }));
  };
  const replayTours = () => {
    setOnboarding((prev) => ({
      ...prev,
      tourSeen: { today: false, body: false, plan: false, progress: false },
    }));
  };
  const resetOnboarding = () => {
    setOnboarding({ ...DEFAULT_ONBOARDING, tourSeen: { ...DEFAULT_ONBOARDING.tourSeen } });
  };
  // Stage 02-B / F5 — every goal write goes through normalizeOneGoal so
  // U7 seeds, GoalsPanel inserts, and imported blobs all land in the same
  // v3 shape with migrateLegacyId() applied to targetMuscleId. Dedup mirrors
  // F6's adherence pattern (findIndex by id, merge in place).
  const upsertGoal = (input, { fromOnboarding = false } = {}) => {
    const normalized = normalizeOneGoal(input);
    if (!normalized) return null;
    let nextGoals;
    setGoals((prev) => {
      const idx = prev.findIndex((g) => g.id === normalized.id);
      if (idx === -1) {
        nextGoals = [...prev, normalized];
      } else {
        const merged = { ...prev[idx], ...normalized };
        nextGoals = [...prev];
        nextGoals[idx] = merged;
      }
      return nextGoals;
    });
    if (fromOnboarding) {
      recordMeaningfulAction({ goals: nextGoals });
    }
    return normalized;
  };
  const createGoal = (goal) => upsertGoal(goal, { fromOnboarding: true });
  const handleAddGoal = (goal) => upsertGoal(goal);
  const handleUpdateGoal = (id, patch) => {
    if (!id || !patch) return;
    setGoals((prev) => {
      const idx = prev.findIndex((g) => g.id === id);
      if (idx === -1) return prev;
      const merged = normalizeOneGoal({ ...prev[idx], ...patch, id });
      if (!merged) return prev;
      const next = [...prev];
      next[idx] = merged;
      return next;
    });
  };
  const handleArchiveGoal = (id) => {
    if (!id) return;
    setGoals((prev) => {
      const idx = prev.findIndex((g) => g.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...prev[idx], status: "archived" };
      return next;
    });
  };

  const selectByMap = (muscleId) => {
    if (pickMode === "origin") {
      setForm((prev) => ({ ...prev, originRegion: muscleId }));
      setPickMode("sensation");
      return;
    }
    setForm((prev) => ({ ...prev, sensationRegion: muscleId }));
  };

  // U2: four-tab IA — Today / Body / Plan / Progress.
  const NAV_TABS = [
    { id: "today", label: "Today", Icon: HeartPulse },
    { id: "body", label: "Body", Icon: Activity },
    { id: "plan", label: "Plan", Icon: Compass },
    { id: "progress", label: "Progress", Icon: Gauge },
  ];

  const topTabClass = (id) =>
    `flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors duration-150 ease-out ${
      tab === id
        ? "border-brand text-zinc-100"
        : "border-transparent text-zinc-400 hover:text-zinc-200"
    }`;

  const bottomTabClass = (id) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors duration-150 ease-out ${
      tab === id ? "text-brand" : "text-zinc-400"
    }`;

  // Stage 02-A.5 / U8 — header chips: live streak + Body Balance Score.
  // Stage 02-B / F2 promoted the hook from cold-start to live derivation;
  // we now feed it the v3 stateChanges + adherence logs so the score
  // reflects M3 / M4 / M6 / M7 once the user has 7+ days of history.
  const bbs = useBodyBalanceScore({
    entries,
    assessments,
    muscleStates,
    stateChanges,
    adherence,
  });

  const streakChip = <StreakBadge streak={streak} />;

  const scoreChip = (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-caption text-zinc-400"
      aria-label={
        bbs.isCalibrating
          ? "Body Balance Score: calibrating"
          : `Body Balance Score: ${bbs.score}`
      }
      title={bbs.isCalibrating ? "Calibrating — score sharpens with use" : undefined}
    >
      <Gauge size={14} aria-hidden="true" />
      <span className="tabular-nums">{bbs.isCalibrating ? "—" : bbs.score}</span>
    </span>
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-3 pb-32 text-zinc-100 sm:p-5 sm:pb-5">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 rounded-14 border border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center justify-between gap-3 px-4 pt-4">
            <div>
              <h1 className="text-xl font-semibold sm:text-2xl">Dot Body Map</h1>
              <p className="mt-1 text-caption text-zinc-400 sm:text-sm">
                Personal training &amp; body balance — educational, not medical.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                {streakChip}
                {scoreChip}
              </div>
              <button
                type="button"
                aria-label="Open settings"
                aria-haspopup="dialog"
                aria-expanded={settingsOpen}
                className="rounded-full border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-300 transition-colors duration-150 ease-out hover:text-zinc-100"
                onClick={() => setSettingsOpen(true)}
              >
                <SettingsIcon size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1 overflow-x-auto px-2 sm:gap-2 sm:px-4">
            {NAV_TABS.map((navItem) => {
              const NavIcon = navItem.Icon;
              return (
                <button
                  key={navItem.id}
                  type="button"
                  aria-current={tab === navItem.id ? "page" : undefined}
                  className={topTabClass(navItem.id)}
                  onClick={() => setTab(navItem.id)}
                >
                  <NavIcon size={16} aria-hidden="true" />
                  {navItem.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-2 sm:hidden">
            {streakChip}
            {scoreChip}
          </div>
        </header>

        {tab === "body" && (
          <BodyScreen
            muscleStates={muscleStates}
            onSetMuscleState={handleSetMuscleState}
            onSaveLog={saveSlideOutLog}
            adherence={adherence}
            onAdherenceChange={handleAdherenceChange}
          />
        )}

        {tab === "body-legacy-disabled" && (
          <div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-zinc-300">Muscle Atlas</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`rounded px-2 py-1 text-xs ${view === "front" ? "bg-teal-600 text-teal-50" : "bg-zinc-800 text-zinc-300"}`}
                    onClick={() => setView("front")}
                  >
                    Front
                  </button>
                  <button
                    className={`rounded px-2 py-1 text-xs ${view === "back" ? "bg-teal-600 text-teal-50" : "bg-zinc-800 text-zinc-300"}`}
                    onClick={() => setView("back")}
                  >
                    Back
                  </button>
                </div>
              </div>

              <MuscleAtlas
                view={view}
                pickMode={pickMode}
                onSelect={selectByMap}
                origin={form.originRegion}
                sensation={form.sensationRegion}
                recruitmentTint={recruitmentTint}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-200" onClick={() => setPickMode("origin")}>
                  Select Origin
                </button>
                <button
                  className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-200"
                  onClick={() => setPickMode("sensation")}
                >
                  Select Sensation
                </button>
                <button className="rounded-md bg-teal-700/60 px-3 py-2 text-sm text-teal-100" onClick={loadLastEntry}>
                  Log Again
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="text-sm text-zinc-300">
                Origin: <span className="text-zinc-100">{form.originRegion ? toLabel(form.originRegion) : "None selected"}</span>
              </div>
              <div className="text-sm text-zinc-300">
                Sensation:{" "}
                <span className="text-zinc-100">{form.sensationRegion ? toLabel(form.sensationRegion) : "None selected"}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Origin selector</label>
                  <select
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={form.originRegion}
                    onChange={(e) => setForm((prev) => ({ ...prev, originRegion: e.target.value }))}
                  >
                    <option value="">Select origin region...</option>
                    {muscleDropdownGroups.map((g) => (
                      <optgroup key={`origin-grp-${g.slug}`} label={g.groupLabel}>
                        <option value={`${g.slug}-l`}>{g.groupLabel} (L) — whole group</option>
                        <option value={`${g.slug}-r`}>{g.groupLabel} (R) — whole group</option>
                        {g.subs && g.subs.map((sub) => (
                          <option key={`origin-${sub.id}-l`} value={`${sub.id}-l`}>↳ {sub.label} (L)</option>
                        ))}
                        {g.subs && g.subs.map((sub) => (
                          <option key={`origin-${sub.id}-r`} value={`${sub.id}-r`}>↳ {sub.label} (R)</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Sensation selector</label>
                  <select
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={form.sensationRegion}
                    onChange={(e) => setForm((prev) => ({ ...prev, sensationRegion: e.target.value }))}
                  >
                    <option value="">Select sensation region...</option>
                    {muscleDropdownGroups.map((g) => (
                      <optgroup key={`sensation-grp-${g.slug}`} label={g.groupLabel}>
                        <option value={`${g.slug}-l`}>{g.groupLabel} (L) — whole group</option>
                        <option value={`${g.slug}-r`}>{g.groupLabel} (R) — whole group</option>
                        {g.subs && g.subs.map((sub) => (
                          <option key={`sensation-${sub.id}-l`} value={`${sub.id}-l`}>↳ {sub.label} (L)</option>
                        ))}
                        {g.subs && g.subs.map((sub) => (
                          <option key={`sensation-${sub.id}-r`} value={`${sub.id}-r`}>↳ {sub.label} (R)</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {commonPairs.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Common pair suggestions</label>
                  <div className="flex flex-wrap gap-2">
                    {commonPairs.map((pair) => (
                      <button
                        key={pair.regionId}
                        onClick={() => setForm((prev) => ({ ...prev, sensationRegion: pair.regionId }))}
                        className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200"
                      >
                        {pair.label} ({pair.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {bodyIntel && (
                <>
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-3">
                    <div className="text-xs font-medium uppercase tracking-wide text-teal-300">Body Intelligence</div>
                    <div className="mt-1 text-sm text-zinc-200">
                      Muscle focus: <span className="font-medium">{bodyIntel.regionLabel}</span> ({bodyIntel.movementGroup})
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">{bodyIntel.movementNote}</div>

                    <div className="mt-2">
                      <div className="text-xs text-zinc-400">Primary actions</div>
                      <ul className="mt-1 space-y-1 text-xs text-zinc-300">
                        {bodyIntel.primaryActions.slice(0, 3).map((action) => (
                          <li key={action}>• {action}</li>
                        ))}
                      </ul>
                    </div>

                    {bodyIntel.topCompensators.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-zinc-400">Likely compensators if overloaded</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {bodyIntel.topCompensators.map((comp) => (
                            <span key={comp.id} className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                              {comp.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {bodyIntel.clinicalNotes && (
                      <div className="mt-2 text-xs text-zinc-500 italic">{bodyIntel.clinicalNotes}</div>
                    )}

                    {bodyIntel.mismatchRisk && (
                      <div className="mt-2 rounded border border-rose-400/40 bg-rose-500/10 px-2 py-1.5 text-xs text-rose-200">
                        Selected sensation site is outside the main prime movers for this pattern, which can indicate compensation or referral.
                      </div>
                    )}
                  </div>
                  <MuscleMechanicsPanel muscleId={form.originRegion} />
                  <RelationshipEdgesPanel muscleId={form.originRegion} />
                  <MuscleStatePanel muscleId={form.originRegion} muscleStates={muscleStates} onSetState={handleSetMuscleState} />
                  <RemedyPanel muscleId={form.originRegion} muscleStates={muscleStates} />
                </>
              )}
              <MovementRecruitmentPanel onRecruitmentChange={setRecruitmentTint} />

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Search movement</label>
                <input
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                  placeholder="e.g. squat, deadlift, rotation..."
                  value={movementSearch}
                  onChange={(e) => setMovementSearch(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Movement pattern</label>
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

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Sensation</label>
                  <select
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={form.sensationType}
                    onChange={(e) => setForm((prev) => ({ ...prev, sensationType: e.target.value }))}
                  >
                    {SENSATION_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">When</label>
                  <select
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    value={form.whenLabel}
                    onChange={(e) => setForm((prev) => ({ ...prev, whenLabel: e.target.value }))}
                  >
                    {WHEN_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Before / During / After movement</label>
                <select
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                  value={form.phase}
                  onChange={(e) => setForm((prev) => ({ ...prev, phase: e.target.value }))}
                >
                  {PHASE_OPTIONS.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Intensity: {form.intensity}</label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={form.intensity}
                  className="h-7 w-full"
                  onChange={(e) => setForm((prev) => ({ ...prev, intensity: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-zinc-400">Context</label>
                <div className="flex flex-wrap gap-2">
                  {CONTEXT_CHIPS.map((chip) => {
                    const active = form.context.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        className={`rounded-full border px-3 py-1.5 text-xs ${
                          active
                            ? "border-teal-400/50 bg-teal-500/20 text-teal-100"
                            : "border-zinc-600 bg-zinc-800 text-zinc-300"
                        }`}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            context: active ? prev.context.filter((c) => c !== chip) : [...prev.context, chip],
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
                <label className="mb-1 block text-xs text-zinc-400">Notes</label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="hidden flex-wrap gap-2 sm:flex">
                <button className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-teal-50" onClick={saveEntry}>
                  Save Entry
                </button>
                <button className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-200" onClick={() => setForm(EMPTY_FORM)}>
                  Clear
                </button>
                <button className="rounded-md bg-zinc-700 px-3 py-2 text-sm text-zinc-200" onClick={exportData}>
                  Export JSON
                </button>
                <button className="rounded-md bg-zinc-700 px-3 py-2 text-sm text-zinc-200" onClick={exportClinicalReport}>
                  Export Clinical Report
                </button>
                <label className="cursor-pointer rounded-md bg-zinc-700 px-3 py-2 text-sm text-zinc-200">
                  Import JSON
                  <input type="file" accept="application/json" className="hidden" onChange={importData} />
                </label>
              </div>
            </div>
          </div>
          </div>
        )}

        {tab === "progress" && (
          <ProgressScreen
            entries={entries}
            assessments={assessments}
            muscleStates={muscleStates}
            stateChanges={stateChanges}
            adherence={adherence}
            goals={goals}
            chains={chains}
            patternsDetected={patternsDetected}
            symmetrySummary={symmetrySummary}
            weightedHeatScores={weightedHeatScores}
            filteredEntries={filteredEntries}
            timelineData={timelineData}
            assessmentTrendData={assessmentTrendData}
            filter={filter}
            onFilterChange={setFilter}
            view={view}
            onViewChange={setView}
            onOpenBody={() => setTab("body")}
            onOpenPlan={() => setTab("plan")}
          />
        )}

        {tab === "plan" && (
          <PlanScreen
            muscleStates={muscleStates}
            stateChanges={stateChanges}
            adherence={adherence}
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onArchiveGoal={handleArchiveGoal}
            onReRunIntake={() => setIntakeTrigger((n) => n + 1)}
            planner={
              <SessionPlanner
                muscleStates={muscleStates}
                onSetState={handleSetMuscleState}
                intakeTrigger={intakeTrigger}
                adherence={adherence}
                onAdherenceChange={handleAdherenceChange}
              />
            }
            assessmentSlot={
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="space-y-3 rounded-10 border border-zinc-800 bg-zinc-950/40 p-4">
                  <h4 className="text-caption uppercase tracking-wide text-zinc-400">Assessment Tracker</h4>
                  <input
                    className="w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                    placeholder="Search tests..."
                    value={assessmentSearch}
                    onChange={(e) => setAssessmentSearch(e.target.value)}
                  />
                  <select
                    className="w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 focus:border-brand focus:outline-none"
                    value={assessmentForm.test}
                    onChange={(e) => {
                      const picked = ASSESSMENT_TESTS.find((t) => t.name === e.target.value);
                      setAssessmentForm((prev) => ({ ...prev, test: e.target.value, unit: picked?.unit || "score" }));
                    }}
                  >
                    {assessmentOptions.map((test) => (
                      <option key={test.name} value={test.name}>
                        {test.name}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                      placeholder="Left value"
                      value={assessmentForm.leftValue}
                      onChange={(e) => setAssessmentForm((prev) => ({ ...prev, leftValue: e.target.value }))}
                    />
                    <input
                      className="rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                      placeholder="Right value"
                      value={assessmentForm.rightValue}
                      onChange={(e) => setAssessmentForm((prev) => ({ ...prev, rightValue: e.target.value }))}
                    />
                  </div>

                  <input
                    className="w-full rounded-10 border border-zinc-700 bg-zinc-900 px-3 py-2 text-body text-zinc-200 placeholder:text-zinc-500 focus:border-brand focus:outline-none"
                    placeholder="Unit"
                    value={assessmentForm.unit}
                    onChange={(e) => setAssessmentForm((prev) => ({ ...prev, unit: e.target.value }))}
                  />

                  <button
                    className="rounded-10 bg-brand px-3 py-2 text-body font-medium text-zinc-900 transition-colors duration-150 ease-out hover:bg-brand-hover"
                    onClick={saveAssessment}
                  >
                    Save assessment
                  </button>

                  <div className="max-h-80 space-y-2 overflow-auto pr-1">
                    {assessments
                      .slice()
                      .reverse()
                      .map((item) => {
                        const left = Number(item.leftValue);
                        const right = Number(item.rightValue);
                        const base = Math.max(1, (Math.abs(left) + Math.abs(right)) / 2);
                        const asymPct = (Math.abs(left - right) / base) * 100;
                        const isFlagged = asymPct > 15;
                        return (
                          <div key={item.id} className="rounded-10 border border-zinc-800 bg-zinc-900/70 p-3">
                            <div className="flex items-center justify-between text-body">
                              <span className="text-zinc-200">{item.test}</span>
                              <span className={`text-caption ${isFlagged ? "text-state-tight" : "text-zinc-400"}`}>
                                asymmetry {Number.isFinite(asymPct) ? `${asymPct.toFixed(1)}%` : "n/a"}
                              </span>
                            </div>
                            <div className="mt-1 text-caption text-zinc-500">
                              L {item.leftValue} / R {item.rightValue} {item.unit} • {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="rounded-10 border border-zinc-800 bg-zinc-950/40 p-4">
                  <h4 className="mb-3 text-caption uppercase tracking-wide text-zinc-400">Assessment trend</h4>
                  <Suspense fallback={<div className="h-80 rounded bg-zinc-800/50" />}>
                    <TrendCharts mode="assessment" data={assessmentTrendData} />
                  </Suspense>
                </div>
              </div>
            }
          />
        )}

        {tab === "today" && (
          <TodayScreen
            entries={entries}
            muscleStates={muscleStates}
            onOpenBody={() => setTab("body")}
            onOpenPlan={() => setTab("plan")}
            onOpenProgress={() => setTab("progress")}
          />
        )}

        <footer className="mt-8 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-4 py-3 text-center text-[11px] leading-relaxed text-zinc-600">
          <strong className="text-zinc-500">Decision-support / educational tool only.</strong>{" "}
          Dot Body Map is not a medical device and does not provide clinical diagnosis, treatment prescriptions,
          or replace in-person assessment by a qualified practitioner.
          Suggestions are generated from structured rules and user-entered data — always seek professional care for injuries or persistent pain.
        </footer>
      </div>

      {/* Stage 02-A.5 / U4: legacy mobile log toolbar removed; the Body
          screen's MuscleSlideOut / Log sub-tab handles muscle-scoped logging. */}

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onExport={exportData}
        onImport={importData}
        onClinicalReport={exportClinicalReport}
        onReplayTour={replayTours}
        onResetOnboarding={resetOnboarding}
      />

      {loaded && onboarding.completedAt === null && (
        <OnboardingFlow
          open
          onSkip={skipOnboarding}
          onComplete={completeOnboarding}
          onSetMuscleState={handleSetMuscleState}
          onCreateGoal={createGoal}
          muscleStates={muscleStates}
          entries={entries}
        />
      )}

      {loaded && onboarding.completedAt !== null && !onboarding.tourSeen[tab] && !settingsOpen && (
        <TourOverlay tab={tab} onDismiss={() => dismissTour(tab)} />
      )}

      <MilestoneToast
        queue={toastQueue}
        catalog={extraCatalog}
        onDismiss={(id) => setToastQueue((prev) => prev.filter((m) => m.id !== id))}
      />


      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t border-zinc-800 bg-zinc-950/95 backdrop-blur sm:hidden"
      >
        {NAV_TABS.map((navItem) => {
          const NavIcon = navItem.Icon;
          return (
            <button
              key={navItem.id}
              type="button"
              aria-current={tab === navItem.id ? "page" : undefined}
              className={bottomTabClass(navItem.id)}
              onClick={() => setTab(navItem.id)}
            >
              <NavIcon
                size={20}
                aria-hidden="true"
                strokeWidth={tab === navItem.id ? 2 : 1.75}
              />
              {navItem.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
