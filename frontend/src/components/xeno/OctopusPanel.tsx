import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, Eye, Swords, Moon, BarChart3, HeartCrack, Hexagon, Info, Activity, Radio, Cpu, Network } from "lucide-react";
import type { OctopusData } from "@/lib/xeno-mock";

const BIAS_ICONS = [Shield, Search, Eye, Swords, Moon, BarChart3, HeartCrack, Hexagon];

const LOBE_DIAGNOSTICS = [
  {
    bias: "defensive",
    thought: "Shielding synaptic routes from external noise probes",
    confidence: 94,
    signal: 88,
    memories: "Chamber [04] thermal lockouts",
    priority: "HIGH",
    color: "#00E5FF", // Cyan
  },
  {
    bias: "curious",
    thought: "Probing higher dimensional concept vectors",
    confidence: 89,
    signal: 92,
    memories: "Unknown light polarization patterns",
    priority: "MAXIMIZE",
    color: "#8B5CF6", // Purple
  },
  {
    bias: "sensual",
    thought: "Tracing pressure gradient dynamics in limb filaments",
    confidence: 96,
    signal: 85,
    memories: "Thermal vent currents, 4.2C shift",
    priority: "NORMAL",
    color: "#3DDCFF", // Blue
  },
  {
    bias: "predatory",
    thought: "Targeting cognitive loops for memory resource harvesting",
    confidence: 91,
    signal: 90,
    memories: "Deconstructed mesh logic sequences",
    priority: "IMMEDIATE",
    color: "#FF4D6D", // Danger red
  },
  {
    bias: "playful",
    thought: "Oscillating frequencies to trigger consensus jitter",
    confidence: 78,
    signal: 82,
    memories: "Chaotic feedback resonance experiments",
    priority: "LOW",
    color: "#FFC857", // Yellow
  },
  {
    bias: "skeptical",
    thought: "Auditing consensus validity of current decision vectors",
    confidence: 98,
    signal: 95,
    memories: "Prior consensus decay logs",
    priority: "CRITICAL",
    color: "#00FFB2", // Success Green
  },
  {
    bias: "memory",
    thought: "Reconstructing spatial mapping vectors from last dive",
    confidence: 92,
    signal: 87,
    memories: "Consensus matrix index 4429",
    priority: "HIGH",
    color: "#00E5FF", // Cyan
  },
  {
    bias: "color-drunk",
    thought: "Saturating chromatophore nodes with bioluminescent bursts",
    confidence: 84,
    signal: 89,
    memories: "Bioluminescent flash reference array",
    priority: "STIMULATE",
    color: "#8B5CF6", // Purple
  },
];

function getCubicBezierPoint(
  t: number,
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number
) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * x0 + 3 * uu * t * x1 + 3 * u * tt * x2 + ttt * x3,
    y: uuu * y0 + 3 * uu * t * y1 + 3 * u * tt * y2 + ttt * y3,
  };
}

export function OctopusPanel({
  data,
  loading,
  previewMode = false,
}: {
  data: OctopusData | null;
  loading: boolean;
  previewMode?: boolean;
}) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const eyeOffset = useRef({ x: 0, y: 0 });
  const isBlinking = useRef(false);

  // SVG-based dimensions
  const W = 460;
  const H = 420;
  const cx = W / 2;
  const cy = H / 2;

  // Eye tracking mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;

      const dx = e.clientX - eyeX;
      const dy = e.clientY - eyeY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(6, Math.hypot(dx, dy) / 60);

      eyeOffset.current = {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      };
    };

    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        isBlinking.current = true;
        setTimeout(() => {
          isBlinking.current = false;
        }, 180);
      }
    }, 4000);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(blinkInterval);
    };
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const scale = window.devicePixelRatio || 1;
    canvas.width = W * scale;
    canvas.height = H * scale;
    ctx.scale(scale, scale);

    const draw = () => {
      // 1. Clear background
      ctx.fillStyle = "rgba(5, 7, 11, 0.22)"; // Trail fade for glowing plasma
      ctx.fillRect(0, 0, W, H);

      const time = Date.now() * 0.001;

      // Draw subtle orbital rings around core
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      
      // Orbit 1: Inner
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Orbit 2: Middle (Dashed spinning)
      ctx.strokeStyle = "rgba(139, 92, 246, 0.08)";
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(cx, cy, 110, time * 0.2, time * 0.2 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Orbit 3: Outer
      ctx.strokeStyle = "rgba(0, 229, 255, 0.03)";
      ctx.beginPath();
      ctx.arc(cx, cy, 160, 0, Math.PI * 2);
      ctx.stroke();

      // Draw floating data particles in visualization area
      ctx.fillStyle = "rgba(0, 229, 255, 0.12)";
      for (let p = 0; p < 8; p++) {
        const angleOffset = p * (Math.PI / 4);
        const radius = 90 + Math.sin(time + p) * 20;
        const px = cx + Math.cos(time * 0.3 + angleOffset) * radius;
        const py = cy + Math.sin(time * 0.3 + angleOffset) * radius;
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Volumetric breathing effect
      const breathe = Math.sin(time * 0.9) * 4;
      const mantleY = cy + breathe;

      const tentaclePoints: {
        bx: number;
        by: number;
        cp1x: number;
        cp1y: number;
        cp2x: number;
        cp2y: number;
        ex: number;
        ey: number;
      }[] = [];

      // 2. Precompute and draw Webbing and Tentacles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const r = 160 + (i % 2 === 0 ? 15 : 0) + Math.sin(time * 1.5 + i * 2) * 5;

        // Swelling endpoint coordinates
        const ex = cx + Math.cos(angle) * r + Math.sin(time * 0.8 + i * 1.5) * 10;
        const ey = cy + Math.sin(angle) * r + Math.cos(time * 0.8 + i * 1.5) * 10;

        // Base points around mantle
        const bx = cx + Math.cos(angle) * 22;
        const by = mantleY + Math.sin(angle) * 26;

        // Cybernetic control vectors for spline shapes
        const cp1x = cx + Math.cos(angle) * 75 + Math.sin(time + i) * 15;
        const cp1y = cy + Math.sin(angle) * 75 + Math.cos(time + i) * 15;

        const cp2x = ex - Math.cos(angle) * 50 + Math.cos(time * 1.2 + i * 3) * 12;
        const cp2y = ey - Math.sin(angle) * 50 + Math.sin(time * 1.2 + i * 3) * 12;

        tentaclePoints.push({ bx, by, cp1x, cp1y, cp2x, cp2y, ex, ey });

        // Update DOM ref positions for HTML absolute overlays
        const tipEl = tipRefs.current[i];
        if (tipEl) {
          tipEl.style.transform = `translate(${ex}px, ${ey}px) translate(-50%, -50%)`;
        }
      }

      // Draw webbing matrix translucent layer
      ctx.fillStyle = "rgba(0, 229, 255, 0.035)";
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const pt = tentaclePoints[i];
        const midT = getCubicBezierPoint(0.25, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
        if (i === 0) {
          ctx.moveTo(midT.x, midT.y);
        } else {
          ctx.lineTo(midT.x, midT.y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // 3. Draw plasma lines & limbs
      for (let i = 0; i < 8; i++) {
        const pt = tentaclePoints[i];
        const isHovered = hoveredNode === i;
        const isActive = active === i;
        const diag = LOBE_DIAGNOSTICS[i];

        // Core tentacle stem drawing using slices
        const slices = 32;
        for (let s = 0; s <= slices; s++) {
          const t = s / slices;
          const pos = getCubicBezierPoint(t, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
          const radius = (isHovered || isActive ? 14 : 11) * (1 - t * 0.78);

          // 3D holographic radial gradient fill
          const radialGrad = ctx.createRadialGradient(
            pos.x - radius * 0.18, pos.y - radius * 0.18, 0.5,
            pos.x, pos.y, radius
          );

          if (isHovered || isActive) {
            radialGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            radialGrad.addColorStop(0.35, diag.color);
            radialGrad.addColorStop(0.9, "#0B1020");
            radialGrad.addColorStop(1, "rgba(0, 229, 255, 0.05)");
          } else {
            radialGrad.addColorStop(0, "rgba(0, 229, 255, 0.45)");
            radialGrad.addColorStop(0.4, "rgba(11, 16, 32, 0.85)");
            radialGrad.addColorStop(1, "rgba(139, 92, 246, 0.08)");
          }

          ctx.fillStyle = radialGrad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Draw neon bioluminescent double-suction nodes
          if (s > 3 && s % 4 === 0) {
            const nextT = Math.min(1, t + 0.02);
            const nextPos = getCubicBezierPoint(nextT, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
            const dx = nextPos.x - pos.x;
            const dy = nextPos.y - pos.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;

            const cupSize = 1.8 + (1 - t) * 1.8;
            ctx.fillStyle = isHovered || isActive ? "#00FFB2" : "rgba(139, 92, 246, 0.6)";
            
            ctx.beginPath();
            ctx.arc(pos.x + nx * radius, pos.y + ny * radius, cupSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(pos.x - nx * radius, pos.y - ny * radius, cupSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Draw flowing plasma signals traveling out to limbs (multiple pulses)
        const pulseCount = 2;
        for (let pIdx = 0; pIdx < pulseCount; pIdx++) {
          const pulseT = ((time * (0.35 + pIdx * 0.1)) + i * 0.125 + (pIdx * 0.5)) % 1;
          const pPos = getCubicBezierPoint(pulseT, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
          const pRadius = 3.5 * (1 - pulseT * 0.5);

          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.shadowColor = diag.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(pPos.x, pPos.y, pRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      }

      // 4. Draw Central Lobe Mantle (Brain Core)
      const headRx = 46;
      const headRy = 54;
      const mantleGrad = ctx.createRadialGradient(
        cx - 6, mantleY - 14, 4,
        cx, mantleY, 56
      );
      mantleGrad.addColorStop(0, "rgba(0, 229, 255, 0.45)");
      mantleGrad.addColorStop(0.4, "#0B1020");
      mantleGrad.addColorStop(1, "rgba(139, 92, 246, 0.35)");

      ctx.fillStyle = mantleGrad;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(0, 229, 255, 0.35)";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(cx, mantleY, headRx, headRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw bioluminescent dots (chromatophores pulsing)
      for (let s = 0; s < 10; s++) {
        const spotX = cx + Math.sin(s * 1.8) * 26;
        const spotY = mantleY - 30 + s * 6;
        const pulseRadius = (Math.sin(time * 3.5 + s) * 0.5 + 0.5) * 1.8 + 1;
        ctx.fillStyle = s % 2 === 0 ? "#00E5FF" : "#8B5CF6";
        ctx.beginPath();
        ctx.arc(spotX, spotY, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Draw Blinking / Tracking Eye
      const eyeX = cx;
      const eyeY = mantleY - 6;
      const eyeR = 15;

      ctx.fillStyle = "#05070B";
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (!isBlinking.current) {
        const irisGrad = ctx.createRadialGradient(
          eyeX + eyeOffset.current.x, eyeY + eyeOffset.current.y, 1,
          eyeX + eyeOffset.current.x, eyeY + eyeOffset.current.y, 10
        );
        irisGrad.addColorStop(0, "#ffffff");
        irisGrad.addColorStop(0.3, "#00E5FF");
        irisGrad.addColorStop(0.7, "#8B5CF6");
        irisGrad.addColorStop(1, "#05070B");

        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(eyeX + eyeOffset.current.x, eyeY + eyeOffset.current.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Slit pupil (alien)
        ctx.fillStyle = "#05070B";
        ctx.beginPath();
        ctx.ellipse(eyeX + eyeOffset.current.x, eyeY + eyeOffset.current.y, 7, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spark highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(eyeX + eyeOffset.current.x - 3.5, eyeY + eyeOffset.current.y - 3.5, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Blinked line
        ctx.strokeStyle = "#00E5FF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(eyeX - 11, eyeY);
        ctx.lineTo(eyeX + 11, eyeY);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [hoveredNode, active]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col justify-center items-center select-none w-full h-full"
    >
      {/* Outer spinning dash ring decoration */}
      <div
        className="absolute border border-dashed border-[#00E5FF]/10 rounded-full pointer-events-none"
        style={{
          width: 380,
          height: 380,
          top: "calc(50% - 190px)",
          left: "calc(50% - 190px)",
          animation: "spin 90s linear infinite",
        }}
      />

      {/* Main Canvas view */}
      <div
        className="relative overflow-visible"
        style={{ width: W, height: H }}
      >
        <canvas ref={canvasRef} className="block w-full h-full rounded-2xl" />

        {/* Floating Holographic Lobe Node Targets */}
        {Array.from({ length: 8 }).map((_, i) => {
          const Icon = BIAS_ICONS[i];
          const diag = LOBE_DIAGNOSTICS[i];
          const isHovered = hoveredNode === i;
          const isActive = active === i;

          return (
            <div
              key={`node-${i}`}
              ref={(el) => {
                tipRefs.current[i] = el;
              }}
              className="absolute z-30 cursor-pointer"
              style={{ left: 0, top: 0 }}
              onMouseEnter={() => setHoveredNode(i)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setActive(isActive ? null : i)}
            >
              {/* Outer pulsing ring when active/hovered */}
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.div
                    className="absolute -inset-2 rounded-full border border-dashed opacity-80"
                    style={{ borderColor: diag.color }}
                    animate={{ rotate: 360, scale: [0.95, 1.05, 0.95] }}
                    transition={{
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Core Node circle */}
              <div
                className="rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  width: isHovered || isActive ? 34 : 26,
                  height: isHovered || isActive ? 34 : 26,
                  background: isHovered || isActive ? "rgba(11, 16, 32, 0.85)" : "#05070B",
                  border: `1.5px solid ${isHovered || isActive ? diag.color : "rgba(0, 229, 255, 0.25)"}`,
                  boxShadow: isHovered || isActive ? `0 0 16px ${diag.color}` : "0 0 6px rgba(0,229,255,0.05)",
                  color: isHovered || isActive ? "#ffffff" : "rgba(61, 220, 255, 0.7)",
                }}
              >
                <Icon size={isHovered || isActive ? 15 : 12} strokeWidth={2.2} />
              </div>

              {/* Holographic Diagnostic Tooltip Popup */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15, x: "-50%" }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute pointer-events-none z-50 glass-sci-fi px-4 py-3 rounded-lg flex flex-col gap-2 min-w-[200px]"
                    style={{
                      left: "50%",
                      bottom: 40,
                      borderColor: diag.color,
                      boxShadow: `0 8px 30px -10px rgba(0,0,0,0.9), 0 0 15px -3px ${diag.color}22`,
                    }}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-[#00E5FF]/10 pb-1">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-text-secondary flex items-center gap-1">
                        <Cpu size={10} style={{ color: diag.color }} /> LOBE {i + 1} // {diag.bias}
                      </span>
                      <span
                        className="font-mono text-[9px] uppercase px-1 rounded font-bold"
                        style={{ color: diag.color, background: `${diag.color}15` }}
                      >
                        {diag.priority}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="font-mono text-[10px] text-white leading-relaxed">
                      &gt; "{diag.thought}"
                    </p>

                    {/* Telemetry Stats */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 font-mono text-[8px] text-text-secondary border-t border-[#00E5FF]/5 pt-1.5">
                      <div className="flex items-center gap-1">
                        <Activity size={8} className="text-[#00FFB2]" /> Conf: {diag.confidence}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Radio size={8} className="text-[#3DDCFF]" /> Sig: {diag.signal}dB
                      </div>
                      <div className="col-span-2 mt-0.5 border-t border-[#00E5FF]/5 pt-1 text-[7px] text-text-ghost flex items-center gap-1 truncate">
                        <Network size={8} /> Mem: {diag.memories}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Central Eye target interaction */}
        <div
          className="absolute cursor-pointer rounded-full"
          style={{
            left: cx - 22,
            top: cy - 22,
            width: 44,
            height: 44,
            zIndex: 35,
          }}
          onClick={() => setActive(active === -1 ? null : -1)}
          title="Central Core Synthesis"
        />
      </div>

      {/* Console details panel under the canvas */}
      {!previewMode && (
        <div className="w-full max-w-[420px] mt-4 z-20">
          <AnimatePresence mode="wait">
            {active === null && (
              <motion.div
                key="default-guide"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 0.8, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="glass-sci-fi px-4 py-3 rounded-lg border-[#00E5FF]/10 text-center font-mono text-[10px] text-text-secondary"
              >
                [ SELECT CENTROIDS FOR DIRECT TELEMETRY STREAM & CONNECTIONS ]
              </motion.div>
            )}

            {active === -1 && data && (
              <motion.div
                key="central-status"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="glass-sci-fi px-4 py-3.5 rounded-lg border-[#00E5FF]/30 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center border-b border-[#00E5FF]/10 pb-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-text-secondary">
                    CENTRAL INTEGRATION NODE
                  </span>
                  <span className="font-mono text-[9px] uppercase text-[#00FFB2] font-semibold flex items-center gap-1">
                    CONFIDENCE {(data.centralNode.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="font-mono text-xs text-white italic leading-relaxed">
                  "{data.centralNode.response}"
                </p>
                <div className="font-mono text-[9px] text-[#3DDCFF] border-t border-[#00E5FF]/10 pt-1.5 mt-1">
                  &gt;&gt; ACTIVE PROCESS: {data.consensus}
                </div>
              </motion.div>
            )}

            {active !== null && active >= 0 && data && (
              <motion.div
                key={`lobe-${active}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="glass-sci-fi px-4 py-3.5 rounded-lg flex flex-col gap-2"
                style={{ borderColor: `${LOBE_DIAGNOSTICS[active].color}33` }}
              >
                <div className="flex justify-between items-center border-b border-[#00E5FF]/10 pb-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-text-secondary">
                    PERIPHERAL LOBE {active + 1}
                  </span>
                  <span
                    className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded"
                    style={{
                      color: LOBE_DIAGNOSTICS[active].color,
                      background: `${LOBE_DIAGNOSTICS[active].color}15`,
                    }}
                  >
                    BIAS: {data.armNodes[active]?.bias || LOBE_DIAGNOSTICS[active].bias}
                  </span>
                </div>
                <p className="font-mono text-xs text-white leading-relaxed">
                  &gt; "{LOBE_DIAGNOSTICS[active].thought}"
                </p>
                <div className="grid grid-cols-3 gap-2 mt-1.5 font-mono text-[9px] text-text-secondary border-t border-[#00E5FF]/10 pt-2">
                  <div>
                    CONFIDENCE: <span className="text-white font-bold">{LOBE_DIAGNOSTICS[active].confidence}%</span>
                  </div>
                  <div>
                    SIGNAL: <span className="text-white font-bold">{LOBE_DIAGNOSTICS[active].signal}dB</span>
                  </div>
                  <div>
                    PRIORITY: <span style={{ color: LOBE_DIAGNOSTICS[active].color }} className="font-bold">{LOBE_DIAGNOSTICS[active].priority}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
