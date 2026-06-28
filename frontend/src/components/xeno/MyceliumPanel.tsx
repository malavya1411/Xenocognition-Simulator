import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MyceliumData } from "@/lib/xeno-mock";

export function MyceliumPanel({ data, loading }: { data: MyceliumData | null; loading: boolean }) {
  const [showLog, setShowLog] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [ambientSpores, setAmbientSpores] = useState<{ id: number; x: number; y: number; size: number; speed: number }[]>([]);

  // Generate ambient floating spores inside the panel
  useEffect(() => {
    if (loading || !data) return;
    const spores = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 460 + 10,
      y: Math.random() * 260 + 50,
      size: Math.random() * 2 + 0.8,
      speed: Math.random() * 0.4 + 0.15,
    }));
    setAmbientSpores(spores);

    const interval = setInterval(() => {
      setAmbientSpores((prev) =>
        prev.map((s) => ({
          ...s,
          y: s.y - s.speed,
          x: s.x + Math.sin(s.y * 0.05) * 0.25,
          // Reset when floating off-screen
          ...(s.y < 10 ? { y: 310, x: Math.random() * 460 + 10 } : {}),
        }))
      );
    }, 30);

    return () => clearInterval(interval);
  }, [loading, data]);

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
      <div className="flex h-full items-center justify-center min-h-[300px]">
        <svg width={220} height={220} viewBox="0 0 220 220">
          <defs>
            <radialGradient id="myceliumGlowLoad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-mycelium-amber)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent-mycelium-amber)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={110} cy={110} r={40} fill="url(#myceliumGlowLoad)" />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const ex = 110 + Math.cos(a) * 80;
            const ey = 110 + Math.sin(a) * 80;
            return (
              <motion.path
                key={i}
                d={hyphaPath(110, 110, ex, ey, i)}
                stroke="var(--accent-mycelium-green)"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.15 }}
                animate={{ pathLength: 1, opacity: [0.15, 0.75, 0.15] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
              />
            );
          })}
          <circle cx={110} cy={110} r={5} fill="var(--accent-mycelium)" />
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
    <div className="relative flex h-full flex-col justify-between">
      <div
        className="relative overflow-hidden"
        style={{
          background: "radial-gradient(circle at center, #0f110d 0%, #06070a 100%)",
          border: "1.2px solid var(--border-dim)",
          borderRadius: 10,
        }}
      >
        <div
          className="film-grain pointer-events-none absolute inset-0 opacity-[0.06]"
        />

        <svg width="100%" viewBox={`0 0 ${layout.W} ${layout.H}`} className="block overflow-visible">
          <defs>
            {/* Soft bioluminescence filter */}
            <filter id="myceliumGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <radialGradient id="sporeLight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-mycelium-amber)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-mycelium-amber)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Underlayer organic light spots */}
          {data.nodes.map((n) => {
            const p = layout.positions[n.id];
            if (!p || n.id === "root") return null;
            const inLineage = lineage.has(n.id);
            return (
              <circle
                key={`glow-${n.id}`}
                cx={p.x}
                cy={p.y}
                r={24}
                fill="url(#sporeLight)"
                opacity={inLineage || hover === n.id ? 0.8 : 0.25}
                style={{ transition: "opacity 300ms" }}
              />
            );
          })}

          {/* Subterranean Loam Spores drifting upwards */}
          {ambientSpores.map((spore) => (
            <circle
              key={`spore-${spore.id}`}
              cx={spore.x}
              cy={spore.y}
              r={spore.size}
              fill="var(--accent-mycelium-amber)"
              opacity={0.35 + (spore.size / 3) * 0.4}
            />
          ))}

          {/* Hyphae Connections */}
          {data.edges.map((e, i) => {
            const a = layout.positions[e.source];
            const b = layout.positions[e.target];
            if (!a || !b) return null;
            const inLineage = lineage.has(e.target) && lineage.has(e.source);
            return (
              <g key={i}>
                {/* Background shadow filament */}
                <path
                  d={hyphaPath(a.x, a.y, b.x, b.y, i + e.target.charCodeAt(0))}
                  stroke="var(--accent-mycelium-green)"
                  strokeOpacity="0.08"
                  strokeWidth={2.5 + e.strength * 2}
                  fill="none"
                />
                
                {/* Core Hypha thread */}
                <motion.path
                  d={hyphaPath(a.x, a.y, b.x, b.y, i + e.target.charCodeAt(0))}
                  stroke={inLineage ? "var(--accent-mycelium-amber)" : "var(--accent-mycelium-green)"}
                  strokeOpacity={inLineage ? 1 : 0.25 + e.strength * 0.3}
                  strokeWidth={(inLineage ? 2.2 : 1) + e.strength * 1.2}
                  strokeLinecap="round"
                  strokeDasharray={e.strength < 0.4 ? "4 4" : undefined}
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: i * 0.04 }}
                  style={{ transition: "stroke 300ms, stroke-width 300ms" }}
                />

                {/* Spore pulses traveling through network channels */}
                <motion.circle
                  r={1.8}
                  fill={inLineage ? "var(--accent-mycelium-amber)" : "var(--accent-mycelium)"}
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: [a.x, b.x],
                    cy: [a.y, b.y],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{
                    duration: 2.8 + (i % 3) * 0.5,
                    repeat: Infinity,
                    delay: i * 0.35,
                    ease: "easeInOut",
                  }}
                  style={{ filter: "url(#myceliumGlow)" }}
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
              // Mycelial knot - central coordination hub
              return (
                <g key={n.id}>
                  {Array.from({ length: 12 }).map((_, k) => {
                    const a = (k / 12) * Math.PI * 2;
                    return (
                      <line
                        key={k}
                        x1={p.x + Math.cos(a) * 20}
                        y1={p.y + Math.sin(a) * 20}
                        x2={p.x - Math.cos(a) * 20}
                        y2={p.y - Math.sin(a) * 20}
                        stroke="var(--accent-mycelium-green)"
                        strokeWidth="0.8"
                        opacity="0.5"
                      />
                    );
                  })}
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={9}
                    fill="var(--accent-mycelium)"
                    animate={{ opacity: [0.75, 1, 0.75], r: [8.5, 10.5, 8.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: "url(#myceliumGlow)" }}
                  />
                  <text
                    x={p.x}
                    y={p.y + 40}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    style={{ fontSize: 9.5, fontFamily: "var(--font-mono)", letterSpacing: "0.22em", textTransform: "uppercase" }}
                  >
                    ◆ {n.label}
                  </text>
                </g>
              );
            }

            // Fungal Sprout / Fruiting body
            const capRx = 6 + (n.size / 24) * 6;
            const capRy = capRx * 0.62;
            
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: n.depth * 0.15, type: "spring", stiffness: 180, damping: 16 }}
                style={{ cursor: "pointer", transformOrigin: `${p.x}px ${p.y}px` }}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
              >
                {/* Expanding glow wave on spawn */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  fill="none"
                  stroke="var(--accent-mycelium-amber)"
                  initial={{ r: 0, opacity: 0.8 }}
                  animate={{ r: 24, opacity: 0 }}
                  transition={{ delay: n.depth * 0.15, duration: 1.4 }}
                />

                {/* Sprout Stem */}
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={p.x}
                  y2={p.y + capRy + 4}
                  stroke={inLineage ? "var(--accent-mycelium-amber)" : "var(--accent-mycelium-green)"}
                  strokeWidth="1.2"
                  opacity={inLineage ? 0.95 : 0.45}
                  style={{ transition: "stroke 300ms" }}
                />

                {/* Sprout Cap (Bioluminescent Lamp) */}
                <ellipse
                  cx={p.x}
                  cy={p.y}
                  rx={capRx}
                  ry={capRy}
                  fill={inLineage ? "var(--accent-mycelium-amber)" : "var(--accent-mycelium)"}
                  fillOpacity={isHover ? 0.85 : 0.4 + Math.max(0, 0.45 - n.depth * 0.12)}
                  stroke={inLineage ? "var(--accent-mycelium-amber)" : "var(--accent-mycelium-green)"}
                  strokeOpacity={inLineage ? 1 : 0.7 - n.depth * 0.1}
                  strokeWidth={isHover ? 2 : 1.2}
                  style={{ filter: isHover || inLineage ? "url(#myceliumGlow)" : "none", transition: "all 300ms" }}
                />

                {/* Gill markings */}
                <line
                  x1={p.x - capRx * 0.65}
                  y1={p.y + capRy * 0.35}
                  x2={p.x + capRx * 0.65}
                  y2={p.y + capRy * 0.35}
                  stroke={inLineage ? "#06060c" : "var(--accent-mycelium-green)"}
                  strokeWidth="0.8"
                  opacity="0.75"
                />

                <text
                  x={p.x}
                  y={p.y + capRy + 18}
                  textAnchor="middle"
                  fill={inLineage ? "var(--accent-mycelium-amber)" : "var(--text-secondary)"}
                  style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: inLineage ? "bold" : "normal" }}
                >
                  {n.label}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="font-mono text-[10px] text-text-ghost">
          › mycelial network: {data.nodes.length} segments • active paths highlighted
        </p>
        
        <button
          onClick={() => setShowLog((s) => !s)}
          className="font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-1 border border-white/5 rounded hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all"
        >
          [ {showLog ? "hide" : "show"} growth log ]
        </button>
      </div>

      <AnimatePresence>
        {showLog && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2"
          >
            <ul className="max-h-24 space-y-1.5 overflow-y-auto p-2 font-mono text-[9.5px] text-text-ghost bg-void/50 border border-white/5 rounded">
              {data.growthLog.map((l, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: "var(--accent-mycelium-amber)" }}>›</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
