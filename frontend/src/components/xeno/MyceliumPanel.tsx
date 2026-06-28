import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { MyceliumData } from "@/lib/xeno-mock";

export function MyceliumPanel({ data, loading }: { data: MyceliumData | null; loading: boolean }) {
  const [showLog, setShowLog] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const layout = useMemo(() => {
    if (!data) return null;
    const W = 480;
    const H = 320;
    const positions: Record<string, { x: number; y: number; depth: number }> = {};
    positions["root"] = { x: W / 2, y: H / 2, depth: 0 };
    const children: Record<string, string[]> = {};
    data.edges.forEach((e) => {
      (children[e.source] ||= []).push(e.target);
    });
    const place = (id: string, angle: number, spread: number, radius: number, depth: number) => {
      const kids = children[id] || [];
      kids.forEach((kid, i) => {
        const a = angle - spread / 2 + (spread * (i + 0.5)) / kids.length;
        const px = positions[id];
        // Add a touch of organic variance
        const jitter = (Math.sin(kid.charCodeAt(0) * 9.7) * 0.5) * 0.25;
        const r = radius * (1 + jitter);
        positions[kid] = {
          x: px.x + Math.cos(a) * r,
          y: px.y + Math.sin(a) * r,
          depth,
        };
        place(kid, a, Math.PI / 2.2, radius * 0.62, depth + 1);
      });
    };
    place("root", -Math.PI / 2, Math.PI * 1.85, 95, 1);

    // Parent map for lineage highlight
    const parent: Record<string, string> = {};
    data.edges.forEach((e) => {
      parent[e.target] = e.source;
    });

    return { positions, W, H, parent };
  }, [data]);

  // Build curved hypha path between two points
  const hyphaPath = (ax: number, ay: number, bx: number, by: number, seed: number) => {
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const offset = (Math.sin(seed * 3.7) * 0.5) * len * 0.18;
    const cx = mx + nx * offset;
    const cy = my + ny * offset;
    return `M ${ax},${ay} Q ${cx},${cy} ${bx},${by}`;
  };

  if (loading || !data || !layout) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg width={220} height={220} viewBox="0 0 220 220">
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const ex = 110 + Math.cos(a) * 80;
            const ey = 110 + Math.sin(a) * 80;
            return (
              <motion.path
                key={i}
                d={hyphaPath(110, 110, ex, ey, i)}
                stroke="var(--accent-mycelium)"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.2 }}
                animate={{ pathLength: 1, opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            );
          })}
          <circle cx={110} cy={110} r={6} fill="var(--accent-mycelium)" />
        </svg>
      </div>
    );
  }

  // Lineage for hover highlight
  const lineage = new Set<string>();
  if (hover) {
    let cur: string | undefined = hover;
    while (cur) {
      lineage.add(cur);
      cur = layout.parent[cur];
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      <div
        className="relative overflow-hidden"
        style={{
          background: "#0d0d12",
          border: "1px solid var(--border-dim)",
          borderRadius: 6,
        }}
      >
        {/* Subtle organic noise texture */}
        <div
          className="film-grain pointer-events-none absolute inset-0"
          style={{ opacity: 0.08 }}
        />
        <svg width="100%" viewBox={`0 0 ${layout.W} ${layout.H}`} className="block">
          {/* Hyphae */}
          {data.edges.map((e, i) => {
            const a = layout.positions[e.source];
            const b = layout.positions[e.target];
            if (!a || !b) return null;
            const inLineage = lineage.has(e.target) && lineage.has(e.source);
            return (
              <g key={i}>
                <motion.path
                  d={hyphaPath(a.x, a.y, b.x, b.y, i + e.target.charCodeAt(0))}
                  stroke="var(--accent-mycelium)"
                  strokeOpacity={inLineage ? 0.95 : 0.15 + e.strength * 0.35}
                  strokeWidth={(inLineage ? 1.8 : 1) + e.strength * 1.5}
                  strokeLinecap="round"
                  strokeDasharray={e.strength < 0.4 ? "3 3" : undefined}
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                />
                {/* Spore traveling along the hypha */}
                <motion.circle
                  r={1.5}
                  fill="var(--accent-mycelium)"
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: [a.x, b.x],
                    cy: [a.y, b.y],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{
                    duration: 3 + (i % 3),
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "linear",
                  }}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {data.nodes.map((n) => {
            const p = layout.positions[n.id];
            if (!p) return null;
            const isRoot = n.id === "root";
            const isHover = hover === n.id;
            const inLineage = lineage.has(n.id);
            if (isRoot) {
              // Mycelial knot — dense intersecting lines
              return (
                <g key={n.id}>
                  {Array.from({ length: 8 }).map((_, k) => {
                    const a = (k / 8) * Math.PI * 2;
                    return (
                      <line
                        key={k}
                        x1={p.x + Math.cos(a) * 18}
                        y1={p.y + Math.sin(a) * 18}
                        x2={p.x - Math.cos(a) * 18}
                        y2={p.y - Math.sin(a) * 18}
                        stroke="var(--accent-mycelium)"
                        strokeWidth="1"
                        opacity="0.7"
                      />
                    );
                  })}
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={8}
                    fill="var(--accent-mycelium)"
                    animate={{ opacity: [0.7, 1, 0.7], r: [7, 9, 7] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                  />
                  <text
                    x={p.x}
                    y={p.y + 36}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textTransform: "uppercase" }}
                  >
                    ◆ {n.label}
                  </text>
                </g>
              );
            }
            // Fruiting body: mushroom cap (ellipse) + stem (line)
            const capRx = 5 + (n.size / 24) * 5;
            const capRy = capRx * 0.65;
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: n.depth * 0.2, type: "spring", stiffness: 200, damping: 18 }}
                style={{ cursor: "pointer", transformOrigin: `${p.x}px ${p.y}px` }}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
              >
                {/* Growth ring on spawn */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  fill="none"
                  stroke="var(--accent-mycelium)"
                  initial={{ r: 0, opacity: 0.6 }}
                  animate={{ r: 18, opacity: 0 }}
                  transition={{ delay: n.depth * 0.2, duration: 1.2 }}
                />
                {/* Stem */}
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={p.x}
                  y2={p.y + capRy + 3}
                  stroke="var(--accent-mycelium)"
                  strokeWidth="1"
                  opacity={inLineage ? 0.95 : 0.5}
                />
                {/* Cap */}
                <ellipse
                  cx={p.x}
                  cy={p.y}
                  rx={capRx}
                  ry={capRy}
                  fill="var(--accent-mycelium)"
                  fillOpacity={isHover ? 0.6 : 0.3 + Math.max(0, 0.4 - n.depth * 0.1)}
                  stroke="var(--accent-mycelium)"
                  strokeOpacity={inLineage ? 1 : 0.7 - n.depth * 0.12}
                  strokeWidth={isHover ? 1.5 : 1}
                />
                {/* Gills */}
                <line
                  x1={p.x - capRx * 0.6}
                  y1={p.y + capRy * 0.4}
                  x2={p.x + capRx * 0.6}
                  y2={p.y + capRy * 0.4}
                  stroke="var(--accent-mycelium)"
                  strokeWidth="0.5"
                  opacity="0.6"
                />
                <text
                  x={p.x}
                  y={p.y + capRy + 16}
                  textAnchor="middle"
                  fill={inLineage ? "var(--accent-mycelium)" : "var(--text-secondary)"}
                  style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}
                >
                  {n.label}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 font-mono text-[10px] text-text-ghost">
        › signal propagated through {data.nodes.length - 1} associations
      </p>

      <button
        onClick={() => setShowLog((s) => !s)}
        className="mt-2 self-start font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary"
      >
        [ {showLog ? "hide" : "show"} growth log ]
      </button>
      {showLog && (
        <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto font-mono text-[10px] text-text-ghost">
          {data.growthLog.map((l, i) => (
            <li key={i}>
              <span style={{ color: "var(--accent-mycelium)" }}>›</span> {l}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
