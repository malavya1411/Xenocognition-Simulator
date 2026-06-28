import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { HiveData } from "@/lib/xeno-mock";

// Generate hex grid points (pointy-top)
function buildHexes(count: number, cols: number) {
  const rows = Math.ceil(count / cols);
  const size = 7; // radius
  const w = Math.sqrt(3) * size;
  const h = 2 * size * 0.86;
  const points: { x: number; y: number; idx: number }[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= count) break;
      const x = c * w + (r % 2 ? w / 2 : 0) + size;
      const y = r * h + size;
      points.push({ x, y, idx });
      idx++;
    }
  }
  return { points, width: cols * w + w, height: rows * h + size };
}

function hexPath(cx: number, cy: number, size: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`);
  }
  return `M${pts.join(" L")} Z`;
}

export function HivePanel({ data, loading }: { data: HiveData | null; loading: boolean }) {
  const { points, width, height } = useMemo(() => buildHexes(200, 20), []);

  // Pre-assign each agent to a vote bucket once
  const agentVotes = useMemo(() => {
    if (!data) return [];
    const assignments: number[] = [];
    let cursor = 0;
    data.votes.forEach((v, vi) => {
      for (let k = 0; k < v.count; k++) {
        assignments[cursor++] = vi;
      }
    });
    // shuffle
    for (let i = assignments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
    }
    return assignments;
  }, [data]);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg width={width * 0.7} height={height * 0.7} viewBox={`0 0 ${width} ${height}`}>
          {points.slice(0, 200).map((p) => (
            <motion.path
              key={p.idx}
              d={hexPath(p.x, p.y, 6)}
              fill="var(--accent-hive)"
              initial={{ opacity: 0.15 }}
              animate={{ opacity: [0.1, 0.7, 0.1] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: (p.idx % 20) * 0.04 }}
            />
          ))}
        </svg>
      </div>
    );
  }

  const top = data.votes[0];
  const voteOpacity = (vi: number) => (vi === 0 ? 1 : vi === 1 ? 0.45 : 0.2);
  const voteColor = (vi: number) =>
    vi === data.votes.length - 1 && data.votes.length > 1 ? "var(--text-ghost)" : "var(--accent-hive)";

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-center">
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{ maxHeight: 160 }}
          preserveAspectRatio="xMidYMid meet"
        >
          {points.map((p) => {
            const vi = agentVotes[p.idx] ?? 2;
            return (
              <motion.path
                key={p.idx}
                d={hexPath(p.x, p.y, 6)}
                fill={voteColor(vi)}
                initial={{ opacity: 0 }}
                animate={{ opacity: voteOpacity(vi) }}
                transition={{ delay: (p.idx % 50) * 0.008, duration: 0.4 }}
              >
                <title>{`agent #${p.idx + 1} — ${data.votes[vi]?.option ?? "—"}`}</title>
              </motion.path>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-sans text-5xl font-bold leading-none"
          style={{ color: "var(--accent-hive)" }}
        >
          {top.percentage.toFixed(0)}%
        </motion.p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-text-secondary">
          {top.option} convergence · {data.totalAgents} agents
        </p>
      </div>

      <div className="mt-3 flex h-2 w-full overflow-hidden" style={{ borderRadius: 4 }}>
        {data.votes.map((v, i) => (
          <motion.div
            key={v.option}
            initial={{ width: 0 }}
            animate={{ width: `${v.percentage}%` }}
            transition={{ duration: 0.8, delay: i * 0.15 }}
            style={{ background: voteColor(i), opacity: voteOpacity(i) }}
            title={`${v.option}: ${v.count}`}
          />
        ))}
      </div>

      {data.singularErrors.length > 0 && (
        <div
          className="mt-3 p-2 font-mono text-[10px] uppercase tracking-wider"
          style={{
            background: "color-mix(in oklab, var(--alert) 12%, transparent)",
            border: "1px solid color-mix(in oklab, var(--alert) 40%, transparent)",
            color: "var(--alert)",
          }}
        >
          error · singular entity detected · {data.singularErrors.join(", ")}
        </div>
      )}

      <div className="mt-3 flex-1 overflow-hidden">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-ghost">
          dissenting patterns
        </p>
        <ul className="space-y-1">
          {data.dissentQuotes.map((q, i) => (
            <li
              key={i}
              className="font-mono text-[11px] text-text-secondary line-through opacity-70"
            >
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
