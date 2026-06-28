import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MeshData } from "@/lib/xeno-mock";

const ghostColors = ["#cbd5e1", "#fbbf24", "#a78bfa", "#10b981"]; // Silver, Gold, Purple, Green

export function MeshPanel({ data, loading }: { data: MeshData | null; loading: boolean }) {
  const [unmeshed, setUnmeshed] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [waveOffset, setWaveOffset] = useState(0);

  // SVG parameters
  const W = 360;
  const H = 220;
  const cx = W / 2;
  const cy = H / 2;

  // Waving path for tension meter
  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      // Speed depends on tension score
      const speed = 0.05 + data.tensionScore * 0.15;
      setWaveOffset((prev) => (prev + speed) % (Math.PI * 2));
    }, 30);
    return () => clearInterval(interval);
  }, [data]);

  // Positions for 4 perspective nodes in a clean diamond configuration
  const nodePositions = useMemo(() => [
    { x: cx - 75, y: cy - 25, label: "Pragmatist", voice: "The Pragmatist" },
    { x: cx + 75, y: cy - 25, label: "Mystic", voice: "The Mystic" },
    { x: cx, y: cy - 70, label: "Cynic", voice: "The Cynic" },
    { x: cx, y: cy + 50, label: "Optimist", voice: "The Optimist" }
  ], [cx, cy]);

  // Build sine wave path for the tension meter
  const tensionWavePath = (tension: number) => {
    const points = [];
    const amplitude = 3 + tension * 10;
    const frequency = 0.08;
    const meterHeight = 120;
    const startY = cy - 60;

    for (let y = 0; y <= meterHeight; y += 4) {
      const x = Math.sin(y * frequency + waveOffset) * amplitude;
      points.push(`${x},${startY + y}`);
    }
    return `M ${points.join(" L ")}`;
  };

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center min-h-[300px]">
        <div className="relative">
          {["P", "M", "C", "O"].map((c, i) => (
            <motion.span
              key={c}
              className="absolute font-serif text-4xl italic"
              style={{ color: ghostColors[i], left: i * 8, top: i * 8, opacity: 0.35 }}
              animate={{ opacity: [0.15, 0.65, 0.15], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            >
              {c}
            </motion.span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Immersive Mesh Viewport */}
      <div className="relative flex-1 flex gap-4">
        <div 
          className="relative flex-1 overflow-hidden"
          style={{
            background: "#08090d",
            border: "1.2px solid var(--border-dim)",
            borderRadius: 10,
            minHeight: H,
          }}
        >
          <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
          
          <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="block overflow-visible">
            <defs>
              <filter id="meshGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {!unmeshed ? (
              // MEShed State: Suspended interconnected glass nodes
              <g>
                {/* Inter-node connections filaments */}
                {nodePositions.map((n1, idx1) => 
                  nodePositions.map((n2, idx2) => {
                    if (idx1 >= idx2) return null;
                    const isFocus = hoveredNode === idx1 || hoveredNode === idx2;
                    return (
                      <line
                        key={`line-${idx1}-${idx2}`}
                        x1={n1.x}
                        y1={n1.y}
                        x2={n2.x}
                        y2={n2.y}
                        stroke="var(--accent-mesh-cyan)"
                        strokeOpacity={isFocus ? 0.65 : 0.15}
                        strokeWidth={isFocus ? 1.5 : 0.8}
                        style={{ transition: "all 300ms" }}
                      />
                    );
                  })
                )}

                {/* Connections to Central Consensus node */}
                {nodePositions.map((n, i) => {
                  const isFocus = hoveredNode === i;
                  return (
                    <motion.line
                      key={`center-line-${i}`}
                      x1={n.x}
                      y1={n.y}
                      x2={cx}
                      y2={cy - 10}
                      stroke="var(--accent-mesh-purple)"
                      strokeOpacity={isFocus ? 0.85 : 0.2}
                      strokeWidth={isFocus ? 2 : 1}
                      strokeDasharray="4 4"
                      animate={{ strokeDashoffset: [0, -20] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      style={{ transition: "stroke-opacity 300ms" }}
                    />
                  );
                })}

                {/* Perspective Floating Glass Nodes */}
                {nodePositions.map((n, i) => {
                  const isHovered = hoveredNode === i;
                  return (
                    <g 
                      key={n.label} 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode(i)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Glow halo */}
                      {isHovered && (
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={16}
                          fill="none"
                          stroke={ghostColors[i]}
                          strokeWidth="1"
                          className="pulse-ring"
                        />
                      )}
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={11}
                        fill="#06060c"
                        stroke={isHovered ? ghostColors[i] : "rgba(255,255,255,0.08)"}
                        strokeWidth="1.5"
                        style={{
                          filter: isHovered ? "url(#meshGlow)" : "none",
                          transition: "all 300ms"
                        }}
                      />
                      <text
                        x={n.x}
                        y={n.y + 3}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.8)"
                        style={{ fontSize: 7, fontFamily: "var(--font-mono)", pointerEvents: "none" }}
                      >
                        {n.label.slice(0, 3).toUpperCase()}
                      </text>
                      <text
                        x={n.x}
                        y={n.y - 16}
                        textAnchor="middle"
                        fill={isHovered ? ghostColors[i] : "var(--text-ghost)"}
                        style={{ fontSize: 7.5, fontFamily: "var(--font-mono)", tracking: "0.15em", transition: "color 300ms" }}
                      >
                        {n.label.toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {/* Central Synthesized Consensus Glass Container */}
                <g className="pointer-events-none">
                  <ellipse
                    cx={cx}
                    cy={cy - 10}
                    rx={60}
                    ry={25}
                    fill="rgba(14, 14, 25, 0.65)"
                    stroke="var(--accent-mesh)"
                    strokeWidth="1.2"
                    style={{ backdropFilter: "blur(12px)", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.04))" }}
                  />
                  <foreignObject x={cx - 52} y={cy - 28} width={104} height={36} className="overflow-hidden">
                    <div className="h-full w-full flex items-center justify-center text-center p-1 text-[9.5px] leading-tight text-text-primary font-serif italic">
                      {data.averageAnswer.length > 55 ? `${data.averageAnswer.slice(0, 52)}...` : data.averageAnswer}
                    </div>
                  </foreignObject>
                </g>
              </g>
            ) : (
              // UNMEShed State: Exploded perspective grids
              <foreignObject x={0} y={0} width={W} height={H} className="p-3">
                <div className="h-full w-full space-y-2 overflow-y-auto pr-1">
                  {data.perspectives.map((p, i) => (
                    <motion.div
                      key={p.voice}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="p-2.5 rounded border border-white/5 bg-elevated/40"
                      style={{
                        borderLeft: `2.5px solid ${ghostColors[i % ghostColors.length]}`,
                      }}
                    >
                      <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-wider text-text-ghost">
                        <span>{p.voice}</span>
                        <span style={{ color: ghostColors[i % ghostColors.length] }}>
                          {(p.weight * 100).toFixed(0)}% mesh weight
                        </span>
                      </div>
                      <p className="font-serif text-[12px] italic text-text-primary mt-1">"{p.text}"</p>
                    </motion.div>
                  ))}
                </div>
              </foreignObject>
            )}
          </svg>
        </div>

        {/* Live Tension Wave Meter */}
        <div className="flex w-12 flex-col items-center justify-between p-2 rounded-lg bg-void border border-white/5">
          <p className="font-mono text-[8px] uppercase tracking-widest text-text-ghost mb-2">tension</p>
          
          <div className="relative w-7 flex-1 border border-white/5 rounded overflow-hidden bg-black/35 flex items-center justify-center">
            {/* Dynamic Sine-wave liquid render */}
            <svg width="100%" height="100%" className="absolute inset-0 overflow-visible">
              <path
                d={tensionWavePath(data.tensionScore)}
                fill="none"
                stroke="var(--accent-mesh-purple)"
                strokeWidth="1.5"
                style={{ transform: "translateX(14px)" }}
              />
            </svg>

            {/* Glowing fill overlay */}
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500/20 to-cyan-500/10 border-t border-cyan-500/30"
              style={{ height: `${data.tensionScore * 100}%`, transition: "height 800ms" }}
            />

            <span className="relative z-10 font-mono text-[10px] font-bold text-text-primary bg-black/60 px-1 rounded">
              {data.tensionScore.toFixed(2)}
            </span>
          </div>

          <p className="mt-2 font-mono text-[7px] text-text-ghost text-center">harmonic index</p>
        </div>
      </div>

      {/* Synthesis description box */}
      <div 
        className="mt-3 p-3 min-h-[75px] flex flex-col justify-center rounded-lg bg-surface border border-white/5 transition-all duration-300"
        style={{
          borderLeft: hoveredNode !== null ? `3px solid ${ghostColors[hoveredNode]}` : "1.2px solid var(--border-dim)"
        }}
      >
        <AnimatePresence mode="wait">
          {hoveredNode === null ? (
            <motion.div
              key="general"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-text-ghost">
                Consensus synthesis
              </p>
              <p className="font-serif text-sm italic text-text-primary leading-relaxed">
                "{data.averageAnswer}"
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`node-${hoveredNode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-text-ghost flex justify-between">
                <span>{data.perspectives[hoveredNode].voice} Perspective</span>
                <span style={{ color: ghostColors[hoveredNode] }}>
                  Weight: {(data.perspectives[hoveredNode].weight * 100).toFixed(0)}%
                </span>
              </p>
              <p className="font-serif text-sm italic text-text-primary leading-relaxed">
                "{data.perspectives[hoveredNode].text}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="font-mono text-[9.5px] text-text-ghost">
          › nodes communicate via cybernetic mesh layer
        </p>

        <button
          onClick={() => setUnmeshed((u) => !u)}
          className="font-mono text-[9px] uppercase tracking-[0.25em] px-2.5 py-1 border border-white/5 rounded hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all"
        >
          [ {unmeshed ? "merge mesh" : "extract perspectives"} ]
        </button>
      </div>
    </div>
  );
}
