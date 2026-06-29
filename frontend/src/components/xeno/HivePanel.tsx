import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HiveData } from "@/lib/xeno-mock";

interface SwarmAgent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  clusterIdx: number; // 0: Affirmative, 1: Negative, 2: Abstain
}

export function HivePanel({
  data,
  loading,
  previewMode = false,
}: {
  data: HiveData | null;
  loading: boolean;
  previewMode?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const agentsRef = useRef<SwarmAgent[]>([]);
  const animationRef = useRef<number>(0);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

  // SVG dimensions for canvas viewport
  const W = 360;
  const H = 200;

  // Pre-calculate target cluster coordinates
  const clusterCenters = useMemo(
    () => [
      { x: W * 0.25, y: H * 0.55, name: "Affirmative", color: "#fbbf24" }, // Left
      { x: W * 0.75, y: H * 0.55, name: "Negative", color: "#f59e0b" }, // Right
      { x: W * 0.5, y: H * 0.35, name: "Abstain", color: "#475569" }, // Top Center
    ],
    [],
  );

  // Initialize/reset agents when state changes
  useEffect(() => {
    const agents: SwarmAgent[] = [];
    const count = 200;

    // Distribute agent cluster assignments based on real votes
    let assignments: number[] = [];
    if (data) {
      data.votes.forEach((v, vi) => {
        for (let k = 0; k < v.count; k++) {
          assignments.push(vi);
        }
      });
      // Fallback/fill to 200
      while (assignments.length < count) assignments.push(2);
    } else {
      // Idle/loading: all assigned to central swarm (-1)
      assignments = Array(count).fill(-1);
    }

    // Shuffle assignments
    for (let i = assignments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
    }

    for (let i = 0; i < count; i++) {
      const clusterIdx = assignments[i];
      // Random coordinates around center
      agents.push({
        x: W / 2 + (Math.random() - 0.5) * 60,
        y: H / 2 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        clusterIdx,
        color: clusterIdx >= 0 ? clusterCenters[clusterIdx].color : "#fbbf24",
      });
    }

    agentsRef.current = agents;
  }, [data, loading, clusterCenters]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // Support retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const tick = () => {
      // Soft background erase to create organic trail / motion blur
      ctx.fillStyle = "rgba(6, 6, 12, 0.28)";
      ctx.fillRect(0, 0, W, H);

      const agents = agentsRef.current;

      // Draw cluster centers / heatmaps if data is loaded
      if (data && !loading) {
        clusterCenters.forEach((c, idx) => {
          const voteInfo = data.votes[idx];
          if (!voteInfo) return;

          // Glowing underlying heatmap
          const gradient = ctx.createRadialGradient(
            c.x,
            c.y,
            2,
            c.x,
            c.y,
            40 + voteInfo.percentage * 0.2,
          );
          gradient.addColorStop(0, `${c.color}1c`);
          gradient.addColorStop(1, "rgba(6, 6, 12, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 40 + voteInfo.percentage * 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Dotted outer containment orbit
          ctx.strokeStyle = `${c.color}22`;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.arc(c.x, c.y, 24, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]); // Reset line dash

          // Draw cluster titles
          ctx.fillStyle =
            hoveredCluster === c.name ? "#ffffff" : "rgba(148, 163, 184, 0.4)";
          ctx.font = "bold 8px 'Space Grotesk', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(c.name.toUpperCase(), c.x, c.y - 32);
          ctx.font = "8px 'IBM Plex Mono', monospace";
          ctx.fillText(`${voteInfo.count} V`, c.x, c.y + 36);
        });
      }

      // Update and draw agents
      agents.forEach((agent) => {
        let tx = W / 2;
        let ty = H / 2;

        if (data && !loading && agent.clusterIdx >= 0) {
          // Attract to cluster center
          const target = clusterCenters[agent.clusterIdx];
          tx = target.x;
          ty = target.y;
        }

        // Vector to target
        const dx = tx - agent.x;
        const dy = ty - agent.y;
        const dist = Math.hypot(dx, dy);

        // Physics: attraction force + swarm turbulence noise
        const force = loading ? 0.05 : 0.025;
        if (dist > 1) {
          agent.vx += (dx / dist) * force;
          agent.vy += (dy / dist) * force;
        }

        // Add alignment / separation vector
        agents.forEach((other) => {
          if (agent === other) return;
          const odx = other.x - agent.x;
          const ody = other.y - agent.y;
          const odist = Math.hypot(odx, ody);
          if (odist < 10) {
            // Push away from neighbors
            agent.vx -= (odx / odist) * 0.04;
            agent.vy -= (ody / odist) * 0.04;
          }
        });

        // Add organic jitter noise
        agent.vx += (Math.random() - 0.5) * 0.35;
        agent.vy += (Math.random() - 0.5) * 0.35;

        // Friction / speed limits
        const friction = loading ? 0.94 : 0.9;
        agent.vx *= friction;
        agent.vy *= friction;

        agent.x += agent.vx;
        agent.y += agent.vy;

        // Boundaries safety
        if (agent.x < 10) agent.x = 10;
        if (agent.x > W - 10) agent.x = W - 10;
        if (agent.y < 10) agent.y = 10;
        if (agent.y > H - 10) agent.y = H - 10;

        // Draw agent particle
        ctx.fillStyle = data ? agent.color : "#fbbf24";
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw local web links among nearby agents of the same cluster
      agents.forEach((agent, idx) => {
        if (idx % 6 === 0) {
          agents.forEach((other, oidx) => {
            if (idx === oidx || agent.clusterIdx !== other.clusterIdx) return;
            const dist = Math.hypot(other.x - agent.x, other.y - agent.y);
            if (dist < 14) {
              ctx.strokeStyle = `${agent.color}15`;
              ctx.lineWidth = 0.45;
              ctx.beginPath();
              ctx.moveTo(agent.x, agent.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          });
        }
      });

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationRef.current);
  }, [data, clusterCenters, hoveredCluster]);

  const top = data?.votes[0];

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Living Swarm Canvas Viewport */}
      <div
        className="relative overflow-hidden flex justify-center items-center"
        style={previewMode ? { minHeight: H } : {
          background: "#08080f",
          border: "1.2px solid var(--border-dim)",
          borderRadius: 10,
          minHeight: H,
        }}
      >
        <canvas ref={canvasRef} className="block" />

        {/* Swarm State overlay indicators */}
        {!previewMode && (
          <div className="absolute top-2 left-2 flex gap-1.5 pointer-events-none">
            <span className="h-[5px] w-[5px] rounded-full bg-amber-500 animate-ping" />
            <span className="font-mono text-[8px] uppercase tracking-widest text-text-ghost">
              {loading ? "converging" : "consensus: active"}
            </span>
          </div>
        )}

        {/* Interactive Mouse Hover Hotspots for Clusters */}
        {data && !loading && (
          <div className="absolute inset-0 pointer-events-none flex">
            {/* Left quadrant - Affirmative */}
            <div
              className="w-1/3 h-full pointer-events-auto cursor-pointer"
              onMouseEnter={() => setHoveredCluster("Affirmative")}
              onMouseLeave={() => setHoveredCluster(null)}
            />
            {/* Middle top quadrant - Abstain */}
            <div
              className="w-1/3 h-1/2 pointer-events-auto cursor-pointer"
              onMouseEnter={() => setHoveredCluster("Abstain")}
              onMouseLeave={() => setHoveredCluster(null)}
            />
            {/* Right quadrant - Negative */}
            <div
              className="w-1/3 h-full pointer-events-auto cursor-pointer ml-auto"
              onMouseEnter={() => setHoveredCluster("Negative")}
              onMouseLeave={() => setHoveredCluster(null)}
            />
          </div>
        )}
      </div>

      {!previewMode && data && !loading && top && (
        <div className="mt-4 flex flex-col space-y-3">
          {/* Swarm consensus text */}
          <div className="text-center">
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-sans text-5xl font-extrabold leading-none tracking-tighter"
              style={{
                color: "var(--accent-hive)",
                textShadow: "0 0 25px rgba(251, 191, 36, 0.25)",
              }}
            >
              {top.percentage.toFixed(0)}%
            </motion.p>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-text-secondary">
              {top.option} Convergence • {data.totalAgents} Agents
            </p>
          </div>

          {/* Liquid Live-updating Heatmap Bar */}
          <div className="relative h-2 w-full bg-void overflow-hidden rounded-md border border-white/5">
            <div className="absolute inset-0 flex">
              {data.votes.map((v, i) => {
                const colors = ["#fbbf24", "#f59e0b", "#475569"];
                return (
                  <motion.div
                    key={v.option}
                    initial={{ width: 0 }}
                    animate={{ width: `${v.percentage}%` }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    style={{
                      background: colors[i],
                      opacity: hoveredCluster === v.option ? 1 : 0.65,
                      boxShadow:
                        hoveredCluster === v.option
                          ? `0 0 12px ${colors[i]}`
                          : "none",
                    }}
                    className="h-full transition-all duration-300"
                  />
                );
              })}
            </div>
          </div>

          {/* Swarm entity error detection warning */}
          {data.singularErrors.length > 0 && (
            <div className="p-2.5 font-mono text-[9px] uppercase tracking-widest rounded border flex items-center gap-2 border-amber-500/20 bg-amber-500/5 text-amber-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>
                Collective error: singular pronouns identified:{" "}
                {data.singularErrors.join(", ")}
              </span>
            </div>
          )}

          {/* swarms voice / dissentQuotes */}
          <div className="border-t border-dashed border-white/5 pt-2 mt-1">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-text-ghost">
              dissenting swarms (sub-harmonics)
            </p>
            <ul className="space-y-1">
              {data.dissentQuotes.map((q, i) => (
                <li
                  key={i}
                  className="font-mono text-[10px] text-text-secondary line-through opacity-65 hover:opacity-100 transition-opacity cursor-default"
                >
                  › {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
