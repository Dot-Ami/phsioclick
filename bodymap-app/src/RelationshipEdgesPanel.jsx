import { useState } from "react";
import { fromMuscleId, getMuscleLabel } from "./muscle-data";
import { getEdgesForMuscle } from "./data/relationship-edges";

const KIND_LABELS = {
  compensation: "Compensation",
  "load-chain": "Load chain",
  adjacency: "Adjacency",
  referral: "Referral",
  inhibition: "Inhibition",
};

const KIND_COLORS = {
  compensation: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  "load-chain": "bg-sky-900/40 text-sky-300 border-sky-700/50",
  adjacency: "bg-zinc-800 text-zinc-300 border-zinc-600/50",
  referral: "bg-purple-900/40 text-purple-300 border-purple-700/50",
  inhibition: "bg-rose-900/40 text-rose-300 border-rose-700/50",
};

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color =
    value >= 0.8 ? "bg-emerald-500" : value >= 0.6 ? "bg-amber-500" : "bg-zinc-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 w-12 rounded-full bg-zinc-800">
        <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-zinc-500">{pct}%</span>
    </div>
  );
}

function EdgeCard({ edge, direction }) {
  const otherId = direction === "outbound" ? edge.to : edge.from;
  const otherLabel = getMuscleLabel(`${otherId}-l`)?.replace(/ \(.\)$/, "") || otherId;
  const arrow = direction === "outbound" ? "→" : "←";
  const kindClass = KIND_COLORS[edge.kind] || KIND_COLORS.adjacency;

  return (
    <div className="rounded-lg border border-zinc-700/60 bg-zinc-900/60 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <span className="text-zinc-500">{arrow}</span>
          <span className="font-medium">{otherLabel}</span>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${kindClass}`}
        >
          {KIND_LABELS[edge.kind] || edge.kind}
        </span>
      </div>

      <p className="mt-1.5 text-[11px] leading-snug text-zinc-400">
        {edge.mechanism}
      </p>

      <div className="mt-1.5 flex items-center gap-3">
        <ConfidenceBar value={edge.confidence} />
        {edge.bidirectional && (
          <span className="text-[10px] text-zinc-600">↔ bidirectional</span>
        )}
      </div>

      {edge.tags?.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {edge.tags.map((t) => (
            <span
              key={t}
              className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-500"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const ALL_KINDS = Object.keys(KIND_LABELS);

export default function RelationshipEdgesPanel({ muscleId }) {
  const [kindFilter, setKindFilter] = useState("all");

  if (!muscleId) return null;

  const parsed = fromMuscleId(muscleId);
  if (!parsed?.slug) return null;

  const { inbound, outbound } = getEdgesForMuscle(parsed.slug);
  const seen = new Set();
  const allEdges = [...outbound, ...inbound].filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  if (allEdges.length === 0) return null;

  const filtered =
    kindFilter === "all"
      ? allEdges
      : allEdges.filter((e) => e.kind === kindFilter);

  const presentKinds = [...new Set(allEdges.map((e) => e.kind))];

  return (
    <div className="mt-3 rounded-lg border border-violet-900/50 bg-violet-950/20 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-violet-400/90">
        Relationships (L1)
      </div>
      <p className="mt-1 text-[11px] leading-snug text-zinc-500">
        How this muscle relates to other regions — compensation, load chains, and inhibition patterns.
      </p>

      {presentKinds.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            onClick={() => setKindFilter("all")}
            className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
              kindFilter === "all"
                ? "border-violet-500/50 bg-violet-500/20 text-violet-300"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:text-zinc-400"
            }`}
          >
            All ({allEdges.length})
          </button>
          {ALL_KINDS.filter((k) => presentKinds.includes(k)).map((k) => {
            const count = allEdges.filter((e) => e.kind === k).length;
            return (
              <button
                key={k}
                onClick={() => setKindFilter(k)}
                className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
                  kindFilter === k
                    ? "border-violet-500/50 bg-violet-500/20 text-violet-300"
                    : "border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:text-zinc-400"
                }`}
              >
                {KIND_LABELS[k]} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-2 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-zinc-600">No edges match this filter.</p>
        ) : (
          filtered.map((edge) => (
            <EdgeCard
              key={edge.id}
              edge={edge}
              direction={outbound.includes(edge) ? "outbound" : "inbound"}
            />
          ))
        )}
      </div>
    </div>
  );
}
