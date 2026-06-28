import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const accents = [
  "#00f0ff", // octopus
  "#ece3d4", // mycelium
  "#fbbf24", // hive
  "#a78bfa", // boltzmann
  "#cbd5e1", // mesh
];

const archNames = [
  "OCTOPUS MIND (Decentralized Lobe Consensus)",
  "MYCELIAL NETWORK (Hypha Substrate Growth)",
  "HIVE MIND (Swarm Vote Aggregator)",
  "BOLTZMANN BRAIN (Entropy Fluctuation Coherence)",
  "POST-HUMAN MESH (Cybernetic Layer Synthesis)",
];

export function ProcessingOverlay({ doneCount, total = 5 }: { doneCount: number; total?: number }) {
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate mock neural telemetry logs periodically
  useEffect(() => {
    const logs = [
      "ESTABLISHING NEURAL UPLINK...",
      "SPAWNING OCTOPUS ARM BIASES...",
      "TENTACLE 3 REPORTING CURIOUS RETRIEVAL...",
      "OCTOPUS CENTRAL INTEGRATION NODE WAITING...",
      "PROBING LOAM FOR SPORE ASSOCIATIONS...",
      "MYCELIUM SPREADING SIGNAL TO SPORE SUBSTRATE...",
      "HYPHA EXCHANGE CHANNELS ENGAGED...",
      "BROADCASTING INTENT TO 200 SWARM AGENTS...",
      "HIVE MIND COMPILING COLLECTIVE intention...",
      "VOTE QUANTUM CLUSTERS STABILIZING...",
      "MEASURING BOLTZMANN THERMODYNAMIC JITTER...",
      "DECODING QUANTUM NOISE CHUNKS...",
      "BOLTZMANN BRAIN SIGNAL RESOLVING...",
      "ALIGNING CYBERNETIC MESH NODES...",
      "SYNTHESIZING MYSTIC AND OPTIMIST VECTORS...",
      "POST-HUMAN COGNITIVE TENSION SOLVED...",
    ];

    setTelemetryLogs([logs[0]]);

    const interval = setInterval(() => {
      setTelemetryLogs((prev) => {
        const nextLog = logs[Math.floor(Math.random() * logs.length)];
        // Keep last 4 logs
        return [...prev.slice(-3), `[${new Date().toLocaleTimeString()}] ${nextLog}`];
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Canvas-based neural signal burst background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Neural filament paths
    const filaments: { points: { x: number; y: number }[]; age: number; maxAge: number; color: string }[] = [];

    const draw = () => {
      ctx.fillStyle = "rgba(3, 3, 6, 0.2)";
      ctx.fillRect(0, 0, W, H);

      // Randomly spawn neural firing bursts
      if (Math.random() > 0.88 && filaments.length < 8) {
        const points = [];
        let curX = Math.random() * W;
        let curY = Math.random() * H;
        const color = accents[Math.floor(Math.random() * accents.length)];
        
        for (let i = 0; i < 8; i++) {
          points.push({ x: curX, y: curY });
          curX += (Math.random() - 0.5) * 80;
          curY += (Math.random() - 0.5) * 80;
        }

        filaments.push({
          points,
          age: 0,
          maxAge: 40 + Math.random() * 40,
          color,
        });
      }

      // Draw filaments
      filaments.forEach((fil, idx) => {
        fil.age++;
        if (fil.age >= fil.maxAge) {
          filaments.splice(idx, 1);
          return;
        }

        ctx.strokeStyle = fil.color;
        ctx.shadowColor = fil.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 0.8 * (1 - fil.age / fil.maxAge);
        ctx.globalAlpha = 0.4 * (1 - fil.age / fil.maxAge);

        ctx.beginPath();
        ctx.moveTo(fil.points[0].x, fil.points[0].y);
        for (let i = 1; i < fil.points.length; i++) {
          ctx.lineTo(fil.points[i].x, fil.points[i].y);
        }
        ctx.stroke();
        
        ctx.shadowBlur = 0; // Reset
        ctx.globalAlpha = 1;
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-void"
      style={{ zIndex: 60 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Volumetric Center Glowing Orb */}
      <div className="relative h-44 w-44 flex items-center justify-center z-10">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${accents[doneCount % accents.length]} 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />

        {/* Dynamic Concentric Neural Filaments Ripple */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
            className="absolute h-36 w-36 rounded-full border border-dashed"
            style={{ borderColor: accents[doneCount % accents.length] }}
          />
        ))}

        <div className="text-center font-mono text-[12px] font-bold z-10 flex flex-col">
          <span className="text-text-secondary uppercase">COGNITION</span>
          <span className="text-xl text-text-primary mt-1 font-sans font-extrabold tracking-widest">
            {((doneCount / total) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="w-full max-w-xl px-6 mt-12 z-10 space-y-6">
        {/* Architectural checklist telemetry tracker */}
        <div className="space-y-2 border border-white/5 bg-surface/50 p-4 rounded-xl backdrop-blur-md">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-ghost mb-3">
            Uplink Telemetry Status
          </p>
          
          <div className="space-y-2">
            {archNames.map((name, i) => {
              const isActive = doneCount === i;
              const isDone = doneCount > i;
              return (
                <div key={name} className="flex items-center justify-between font-mono text-[9.5px]">
                  <span className={isDone ? "text-text-primary" : isActive ? "text-white font-bold" : "text-text-ghost"}>
                    {name}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <span 
                      className="h-1.5 w-1.5 rounded-full" 
                      style={{
                        background: isDone ? accents[i] : isActive ? accents[i] : "var(--text-ghost)",
                        boxShadow: isActive ? `0 0 10px ${accents[i]}` : "none",
                      }}
                    />
                    <span className={isDone ? "text-text-primary" : isActive ? "text-white font-bold animate-pulse" : "text-text-ghost"}>
                      {isDone ? "RESOLVED" : isActive ? "COGNITING" : "QUEUEING"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time telemetry log feed */}
        <div className="bg-black/40 border border-white/5 p-3 rounded-lg min-h-[90px] font-mono text-[9px] text-text-ghost space-y-1">
          {telemetryLogs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span style={{ color: accents[doneCount % accents.length] }}>$</span>
              <span className={index === telemetryLogs.length - 1 ? "text-text-secondary" : ""}>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
