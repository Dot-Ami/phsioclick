import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function useChartSize(minHeight) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: minHeight });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.max(240, Math.floor(entry.contentRect.width));
      const height = Math.max(minHeight, Math.floor(entry.contentRect.height));
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [minHeight]);

  return { ref, size };
}

function TimelineChart({ data }) {
  const { ref, size } = useChartSize(220);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div ref={ref} className="flex h-72 items-center justify-center rounded bg-zinc-900/40 text-xs text-zinc-400">
        No timeline data yet.
      </div>
    );
  }

  return (
    <div ref={ref} className="h-72 overflow-hidden">
      {size.width > 0 && (
        <LineChart width={size.width} height={size.height} data={data}>
          <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#a1a1aa" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 10]} stroke="#a1a1aa" />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              color: "#f4f4f5",
            }}
            formatter={(value) => [`${value}`, "Intensity"]}
          />
          <Line type="monotone" dataKey="intensity" stroke="#22d3ee" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      )}
    </div>
  );
}

function AssessmentChart({ data }) {
  const { ref, size } = useChartSize(240);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div ref={ref} className="flex h-80 items-center justify-center rounded bg-zinc-900/40 text-xs text-zinc-400">
        No assessment trend data yet.
      </div>
    );
  }

  return (
    <div ref={ref} className="h-80 overflow-hidden">
      {size.width > 0 && (
        <LineChart width={size.width} height={size.height} data={data}>
          <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              color: "#f4f4f5",
            }}
            formatter={(value) => [`${value}`, "Average L/R"]}
          />
          <Line type="monotone" dataKey="avg" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      )}
    </div>
  );
}

export default function TrendCharts({ mode, data }) {
  if (mode === "assessment") return <AssessmentChart data={data} />;
  return <TimelineChart data={data} />;
}
