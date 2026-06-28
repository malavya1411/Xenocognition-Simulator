import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, Eye, Swords, Moon, BarChart3, HeartCrack, Hexagon } from "lucide-react";
import type { OctopusData } from "@/lib/xeno-mock";

const BIAS_ICONS = [Shield, Search, Eye, Swords, Moon, BarChart3, HeartCrack, Hexagon];

// Cubic Bezier Y-math helper
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

export function OctopusPanel({ data, loading }: { data: OctopusData | null; loading: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const eyeOffset = useRef({ x: 0, y: 0 });
  const isBlinking = useRef(false);

  // SVG-based width/height for layout tracking
  const W = 360;
  const H = 340;
  const cx = W / 2;
  const cy = 170; // Mantle center (centered vertically)

  // Eye tracking & Blinking listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + (cy / H) * rect.height;

      const dx = e.clientX - eyeX;
      const dy = e.clientY - eyeY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(3.5, Math.hypot(dx, dy) / 45); // Max offset 3.5px

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
        }, 150);
      }
    }, 4500);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(blinkInterval);
    };
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    if (loading || !data) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const scale = window.devicePixelRatio || 1;
    canvas.width = W * scale;
    canvas.height = H * scale;
    ctx.scale(scale, scale);

    const draw = () => {
      // 1. Clear with deep ocean abyss gradient
      ctx.fillStyle = "rgba(7, 9, 30, 0.25)"; // transparent overlay trail
      ctx.fillRect(0, 0, W, H);

      const time = Date.now() * 0.001;

      // Draw subtle drifting plankton dots
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
      for (let p = 0; p < 12; p++) {
        const px = (Math.sin(time * 0.5 + p * 4) * 0.5 + 0.5) * W;
        const py = ((time * 20 + p * 35) % H);
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw light rays from the top
      ctx.fillStyle = "rgba(0, 240, 255, 0.02)";
      ctx.beginPath();
      ctx.moveTo(cx - 30 + Math.sin(time * 0.4) * 20, 0);
      ctx.lineTo(cx + 40 + Math.sin(time * 0.4) * 20, 0);
      ctx.lineTo(cx + 120 + Math.cos(time * 0.3) * 30, H);
      ctx.lineTo(cx - 100 + Math.cos(time * 0.3) * 30, H);
      ctx.closePath();
      ctx.fill();

      // Mantle vertical float
      const mantleY = cy + Math.sin(time * 0.8) * 5;

      // 2. Pre-calculate dynamic tentacle coordinates
      const tentaclePoints: { bx: number; by: number; cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number }[] = [];

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 114 + (i % 2) * 8;
        
        // Swaying endpoints
        const ex = cx + Math.cos(angle) * r + Math.sin(time * 1.1 + i * 2.5) * 12;
        const ey = mantleY + Math.sin(angle) * r + Math.cos(time * 1.1 + i * 2.5) * 12;

        // Base point around mantle boundary
        const bx = cx + Math.cos(angle) * 18;
        const by = mantleY + Math.sin(angle) * 22;

        // Organic Bezier controls
        const cp1x = cx + Math.cos(angle) * 55 + Math.sin(time * 0.9 + i) * 12;
        const cp1y = mantleY + Math.sin(angle) * 55 + Math.cos(time * 0.9 + i) * 12;

        const cp2x = ex - Math.cos(angle) * 35 + Math.cos(time * 1.3 + i * 2) * 15;
        const cp2y = ey - Math.sin(angle) * 35 + Math.sin(time * 1.3 + i * 2) * 15;

        tentaclePoints.push({ bx, by, cp1x, cp1y, cp2x, cp2y, ex, ey });

        // Fast DOM updates for absolute positioned icon tips
        const tipEl = tipRefs.current[i];
        if (tipEl) {
          tipEl.style.transform = `translate(${ex}px, ${ey}px) translate(-50%, -50%)`;
        }
      }

      // 3. Draw Webbing between tentacles
      ctx.fillStyle = "rgba(0, 240, 255, 0.04)";
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const pt = tentaclePoints[i];
        const midT = getCubicBezierPoint(0.22, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
        if (i === 0) {
          ctx.moveTo(midT.x, midT.y);
        } else {
          ctx.lineTo(midT.x, midT.y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // 4. Draw Volumetric Tapered Tentacles
      for (let i = 0; i < 8; i++) {
        const pt = tentaclePoints[i];
        const isActive = active === i;

        // Draw segments to create thickness & taper
        const slices = 30;
        for (let s = 0; s <= slices; s++) {
          const t = s / slices;
          const pos = getCubicBezierPoint(t, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
          
          // Width decreases along the tentacle
          const width = (isActive ? 12 : 9.5) * (1 - t * 0.78);
          
          // 3D Shading gradient
          const grad = ctx.createRadialGradient(
            pos.x - width * 0.15, pos.y - width * 0.15, 0.5,
            pos.x, pos.y, width
          );
          
          if (isActive) {
            grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            grad.addColorStop(0.3, "#00f0ff"); // bioluminescent cyan
            grad.addColorStop(1, "#8b5cf6"); // purple
          } else {
            grad.addColorStop(0, "rgba(0, 240, 255, 0.55)");
            grad.addColorStop(0.4, "rgba(7, 10, 48, 0.9)");
            grad.addColorStop(1, "rgba(139, 92, 246, 0.15)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, width, 0, Math.PI * 2);
          ctx.fill();

          // Draw double row of suction cups
          if (s > 4 && s % 3 === 0) {
            const nextT = Math.min(1, t + 0.02);
            const nextPos = getCubicBezierPoint(nextT, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
            const dx = nextPos.x - pos.x;
            const dy = nextPos.y - pos.y;
            const len = Math.hypot(dx, dy);
            const nx = -dy / len;
            const ny = dx / len;

            const cupSize = 1.6 + (1 - t) * 1.5;
            ctx.fillStyle = isActive ? "#ec4899" : "rgba(0, 240, 255, 0.8)";
            
            ctx.beginPath();
            ctx.arc(pos.x + nx * width, pos.y + ny * width, cupSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(pos.x - nx * width, pos.y - ny * width, cupSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 5. Neural pulse travel
        const pulseT = (time * 0.4 + i * 0.12) % 1;
        const pulsePos = getCubicBezierPoint(pulseT, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
        const pulseWidth = 5 * (1 - pulseT * 0.6);

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.shadowColor = "#ec4899"; // pink highlight
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pulsePos.x, pulsePos.y, pulseWidth, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // 6. Draw Volumetric Bulbous Mantle (Head)
      const headRadiusX = 40;
      const headRadiusY = 48;
      
      const mantleGrad = ctx.createRadialGradient(
        cx - 6, mantleY - 10, 4,
        cx, mantleY, 48
      );
      mantleGrad.addColorStop(0, "rgba(0, 240, 255, 0.35)");
      mantleGrad.addColorStop(0.5, "#0b0c16");
      mantleGrad.addColorStop(1, "rgba(139, 92, 246, 0.45)");

      ctx.fillStyle = mantleGrad;
      ctx.strokeStyle = "#00f0ff"; // bioluminescent cyan
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, mantleY, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Chromatophores
      ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
      for (let s = 0; s < 8; s++) {
        const spotX = cx + Math.sin(s * 1.5) * 22;
        const spotY = mantleY - 24 + s * 5;
        const spotRadius = (Math.sin(time * 2 + s) * 0.5 + 0.5) * 2 + 1;
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Draw Blinking/Tracking Eye
      const eyeX = cx;
      const eyeY = mantleY - 4;
      const outerEyeRadius = 14;

      ctx.fillStyle = "#07080f";
      ctx.strokeStyle = "rgba(0, 240, 255, 0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, outerEyeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (!isBlinking.current) {
        const irisGrad = ctx.createRadialGradient(
          eyeX + eyeOffset.current.x, eyeY + eyeOffset.current.y, 1,
          eyeX + eyeOffset.current.x, eyeY + eyeOffset.current.y, 9
        );
        irisGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        irisGrad.addColorStop(0.4, active !== null && active >= 0 ? "#ec4899" : "#00f0ff");
        irisGrad.addColorStop(1, "#07080f");

        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(eyeX + eyeOffset.current.x, eyeY + eyeOffset.current.y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#020306";
        ctx.beginPath();
        ctx.ellipse(eyeX + eyeOffset.current.x, eyeY + eyeOffset.current.y, 6.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.beginPath();
        ctx.arc(eyeX + eyeOffset.current.x - 3, eyeY + eyeOffset.current.y - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(eyeX - 10, eyeY);
        ctx.lineTo(eyeX + 10, eyeY);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [loading, data, active]);

  const confidence = data?.centralNode.confidence ?? 0.5;
  const hasConflict = data ? data.armNodes.length >= 2 : false;

  return (
    <div ref={containerRef} className="flex h-full flex-col justify-between">
      {/* Immersive Canvas-based Giant Floating Octopus Screen */}
      <div 
        className="relative mx-auto overflow-hidden" 
        style={{ width: W, height: H, maxWidth: "100%", background: "#06060c", border: "1.2px solid var(--border-dim)", borderRadius: 10 }}
      >
        {data && !loading ? (
          <canvas ref={canvasRef} className="block w-full h-full" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <motion.svg width={220} height={220} viewBox="0 0 220 220" className="opacity-80">
              <ellipse cx="110" cy="110" rx="30" ry="36" fill="none" stroke="var(--accent-octopus)" strokeWidth="1.5" strokeDasharray="3 3" />
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2;
                const ex = 110 + Math.cos(a) * 80;
                const ey = 110 + Math.sin(a) * 80;
                return (
                  <motion.path
                    key={i}
                    d={`M ${110 + Math.cos(a) * 15},${110 + Math.sin(a) * 18} Q ${110 + Math.cos(a) * 45},${110 + Math.sin(a) * 45} ${ex},${ey}`}
                    stroke="var(--accent-octopus)"
                    strokeWidth="1.2"
                    fill="none"
                    animate={{ opacity: [0.15, 0.7, 0.15], pathLength: [0.25, 0.95, 0.25] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.15 }}
                  />
                );
              })}
            </motion.svg>
          </div>
        )}

        {/* Dynamic interactive tips elements (positioned by requestAnimationFrame loop directly) */}
        {data && !loading && Array.from({ length: 8 }).map((_, i) => {
          const Icon = BIAS_ICONS[i];
          const isActive = active === i;
          return (
            <div
              key={`tip-${i}`}
              ref={(el) => {
                tipRefs.current[i] = el;
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                zIndex: 10,
                cursor: "pointer",
              }}
              onClick={() => setActive(i)}
            >
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-full border border-pink-500/80 scale-125 animate-ping"
                  style={{ width: 28, height: 28, margin: -3 }}
                />
              )}
              <div
                className="rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  width: isActive ? 28 : 22,
                  height: isActive ? 28 : 22,
                  background: isActive ? "var(--elevated)" : "#04040a",
                  border: `1.5px solid ${isActive ? "var(--accent-octopus)" : "var(--border-glow)"}`,
                  boxShadow: isActive ? "0 0 15px var(--accent-octopus)" : "none",
                  color: isActive ? "var(--accent-octopus)" : "var(--text-secondary)",
                }}
              >
                <Icon size={isActive ? 12 : 10} strokeWidth={2.2} />
              </div>
            </div>
          );
        })}

        {/* Central Eye click interaction region */}
        {data && !loading && (
          <div
            className="absolute cursor-pointer rounded-full"
            style={{
              left: cx - 18,
              top: cy - 20, // static target centering
              width: 36,
              height: 36,
              zIndex: 15,
            }}
            onClick={() => setActive(-1)}
            title="Consensus Lobe"
          />
        )}

        {hasConflict && (
          <span 
            className="absolute right-2 top-2 font-mono text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 rounded border border-red-500/20" 
            style={{ color: "var(--alert)", background: "rgba(239, 68, 68, 0.06)" }}
          >
            ◆ neural conflict
          </span>
        )}
      </div>

      {/* Consensus / Detail Text box */}
      <div
        className="mt-4 p-4 min-h-[125px] flex flex-col justify-center transition-all duration-500"
        style={{
          background: "var(--surface)",
          border: `1px solid ${active !== null ? "var(--accent-octopus)33" : "var(--border-dim)"}`,
          borderRadius: 8,
          boxShadow: active !== null ? "0 0 15px -3px rgba(0, 240, 255, 0.05)" : "none"
        }}
      >
        <AnimatePresence mode="wait">
          {active === null && (
            <motion.p
              key="guide"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="font-mono text-[11px] leading-relaxed text-text-secondary text-center"
            >
              [ click the central mantle slit-eye for consensus • click dynamic tentacle tips for independent sensors ]
            </motion.p>
          )}
          {active === -1 && data && (
            <motion.div
              key="consensus"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="font-mono text-[9.5px] uppercase tracking-widest text-text-ghost">
                  central body • integration node
                </span>
                <span 
                  className="font-mono text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ color: "var(--accent-octopus)", background: "rgba(0, 240, 255, 0.06)" }}
                >
                  confidence: {(confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="font-serif text-base italic text-text-primary leading-relaxed">
                "{data.centralNode.response}"
              </p>
              <p className="font-mono text-[10.5px] text-text-secondary border-t border-dashed border-white/5 pt-1.5 mt-2 opacity-85">
                <span className="text-text-ghost">consensus:</span> {data.consensus}
              </p>
            </motion.div>
          )}
          {active !== null && active >= 0 && data && (
            <motion.div
              key={`arm-${active}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="font-mono text-[9.5px] uppercase tracking-widest text-text-ghost">
                  peripheral lobe {active + 1}
                </span>
                <span 
                  className="font-mono text-[9.5px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                  style={{ color: "var(--accent-octopus-pink)", background: "rgba(236, 72, 153, 0.06)" }}
                >
                  bias: {data.armNodes[active].bias}
                </span>
              </div>
              <p className="font-mono text-[12.5px] text-text-primary leading-relaxed">
                {data.armNodes[active].response}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
