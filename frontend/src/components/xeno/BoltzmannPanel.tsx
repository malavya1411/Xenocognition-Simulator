import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BoltzmannData } from "@/lib/xeno-mock";

// Glitch character scrambler for noise chunks
function ScrambleText({ text, active }: { text: string; active: boolean }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!active) {
      setDisplayText(text);
      return;
    }

    const chars = "▰▱▰▱░▒▓█◣◥▲▼◆◇◈⬘⬙⬚❖⌬⌕⍎⍕⏧⏦";
    const interval = setInterval(
      () => {
        const scrambled = text
          .split("")
          .map((char) => {
            if (char === " ") return " ";
            return Math.random() > 0.35
              ? char
              : chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");
        setDisplayText(scrambled);
      },
      180 + Math.random() * 200,
    );

    return () => clearInterval(interval);
  }, [text, active]);

  return <span>{displayText}</span>;
}

export function BoltzmannPanel({
  data,
  loading,
}: {
  data: BoltzmannData | null;
  loading: boolean;
}) {
  const [stabilized, setStabilized] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background canvas cosmic noise particle simulation
  useEffect(() => {
    if (loading || !data) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const W = 360;
    const H = 220;
    canvas.width = W;
    canvas.height = H;

    // Stars/particles
    const particles: {
      x: number;
      y: number;
      r: number;
      alpha: number;
      speed: number;
      angle: number;
    }[] = [];
    const maxParticles = stabilized ? 15 : 45;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.1,
        speed: Math.random() * 0.4 + 0.1,
        angle: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.fillStyle = "rgba(6, 6, 12, 0.2)";
      ctx.fillRect(0, 0, W, H);

      // Quantum noise lines
      if (!stabilized) {
        ctx.strokeStyle = "rgba(167, 139, 250, 0.05)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
          const y = Math.random() * H;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }
      }

      // Draw and collapse particles
      particles.forEach((p) => {
        if (!stabilized) {
          // Unstable orbital jitter
          p.x += Math.cos(p.angle) * p.speed * 1.5;
          p.y += Math.sin(p.angle) * p.speed * 1.5;
          p.angle += (Math.random() - 0.5) * 0.5;
        } else {
          // Stable gravity pull to center
          const dx = W / 2 - p.x;
          const dy = H / 2 - p.y;
          p.x += dx * 0.02;
          p.y += dy * 0.02;
        }

        // Warp bounds
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.fillStyle = stabilized
          ? "rgba(167, 139, 250, 0.3)"
          : "rgba(249, 115, 22, 0.25)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [loading, data, stabilized]);

  if (loading || !data) {
    return (
      <div className="relative flex h-full items-center justify-center min-h-[300px] overflow-hidden rounded-lg bg-void/50 border border-white/5">
        <div className="scanlines absolute inset-0" />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="font-mono text-[10px] tracking-[0.25em] text-text-secondary uppercase"
          >
            ░▒▓ fluctuating probability ▓▒░
          </motion.div>
          <span className="font-mono text-[9px] text-text-ghost">
            quantum entropy: 100%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden">
      {/* Dynamic CRT Scanline Glitch Overlay */}
      {!stabilized && (
        <div
          className="scanlines pointer-events-none absolute inset-0 rounded-lg opacity-40"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Cosmic Quantum Particle Screen */}
      <div
        className="relative overflow-hidden p-4 min-h-[180px] flex flex-col justify-end"
        style={{
          background: "#06060c",
          border: "1.2px solid var(--border-dim)",
          borderRadius: 8,
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none opacity-60"
        />

        {/* Text Area with flicker/scramble details */}
        <div
          className={`relative space-y-2.5 overflow-y-auto max-h-[160px] pr-1.5 scrollbar-thin ${!stabilized ? "crt-flicker" : ""}`}
          style={{ zIndex: 2 }}
        >
          {data.output.map((chunk, i) => {
            if (chunk.type === "signal") {
              return (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="font-sans text-[14.5px] font-semibold leading-relaxed"
                  style={{
                    color: "var(--accent-boltzmann)",
                    textShadow: stabilized
                      ? "0 0 10px rgba(167, 139, 250, 0.45)"
                      : "0 0 14px rgba(167, 139, 250, 0.7)",
                    background: stabilized
                      ? "rgba(167, 139, 250, 0.05)"
                      : undefined,
                    padding: stabilized ? "6px 10px" : 0,
                    borderRadius: stabilized ? 4 : 0,
                  }}
                >
                  ⟢ {chunk.text}
                </motion.p>
              );
            }
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: stabilized ? 0.08 : 0.45 }}
                transition={{ delay: i * 0.02 }}
                className={`font-mono text-[12px] ${stabilized ? "" : "line-through text-orange-500/80"}`}
              >
                <ScrambleText text={chunk.text} active={!stabilized} />
              </motion.p>
            );
          })}
        </div>

        {/* Instability Indicator overlay */}
        <div className="absolute top-2 right-2 pointer-events-none font-mono text-[8px] uppercase tracking-widest text-text-ghost flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${stabilized ? "bg-purple-500" : "bg-orange-500 animate-ping"}`}
          />
          <span>{stabilized ? "coherent" : "entropy state"}</span>
        </div>
      </div>

      {/* Control Gauge bar */}
      <div className="relative mt-4" style={{ zIndex: 2 }}>
        <div className="mb-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
          <span>Signal-to-Noise Fluctuation</span>
          <span style={{ color: "var(--accent-boltzmann)" }}>
            {(data.signalRatio * 100).toFixed(0)}% Coherence
          </span>
        </div>
        <div className="h-[2px] w-full bg-void rounded overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.signalRatio * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ height: "100%", background: "var(--accent-boltzmann)" }}
          />
        </div>

        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => setStabilized((s) => !s)}
            aria-pressed={stabilized}
            className="font-mono text-[9px] uppercase tracking-[0.25em] px-2.5 py-1 border border-white/5 rounded hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all"
          >
            {stabilized ? "[ release entropy ]" : "[ stabilize signal ]"}
          </button>

          <span className="font-mono text-[9px] text-text-ghost">
            entropy: {stabilized ? "0.02e" : "0.98e"}
          </span>
        </div>
      </div>
    </div>
  );
}
