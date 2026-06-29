import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { FilmGrain, Vignette } from "@/components/xeno/Atmosphere";
import { NeuralWebBackground } from "@/components/xeno/LandingCanvas";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/sync")({
  component: SyncComponent,
});

const SYNC_STEPS = [
  { time: 0, text: "INITIALIZING LAB UPLINK INTERFACE..." },
  { time: 400, text: "VERIFYING IDENTITY & COGNITIVE SIGNATURE..." },
  { time: 900, text: "TUNING SYNAPSE COORDINATE GRID TO 44.1 HZ..." },
  { time: 1400, text: "CALIBRATING QUANTUM EXCITATIONS & DECENTRALIZED LOBES..." },
  { time: 1900, text: "COMPILING ALIEN COGNITION TRANSLATORS..." },
  { time: 2400, text: "WORKSPACE SYNCHRONIZED. INTERFACE ONLINE." },
];

function SyncComponent() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  // Handle progression
  useEffect(() => {
    if (loading || !user) return;

    const startTime = Date.now();
    const duration = 2600; // 2.6 seconds

    // Telemetry logs generator
    const logIntervals = SYNC_STEPS.map((step) => {
      return setTimeout(() => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${step.text}`]);
      }, step.time);
    });

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(progressTimer);
        // Delay slightly for dramatic effect before redirecting
        setTimeout(() => {
          navigate({ to: "/architectures" });
        }, 300);
      }
    }, 16);

    return () => {
      clearInterval(progressTimer);
      logIntervals.forEach((id) => clearTimeout(id));
    };
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-base text-text-primary">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Connecting Lab Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-base text-text-primary flex flex-col items-center justify-center">
      {/* Immersive neural web background */}
      <NeuralWebBackground />
      <Vignette />
      <FilmGrain />

      {/* Lab monitor layout container */}
      <div className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center">
        
        {/* Connection status tag */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-octopus/20 bg-octopus/5 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-[#00f0ff] mb-8">
          <Zap size={10} className="animate-pulse" /> Established secure channel
        </span>

        {/* Circular sync progress indicator */}
        <div className="relative w-44 h-44 mb-10 flex items-center justify-center">
          {/* Background track circle */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="76"
              className="stroke-void"
              strokeWidth="2.5"
              fill="transparent"
            />
            {/* Glowing progress stroke */}
            <motion.circle
              cx="88"
              cy="88"
              r="76"
              stroke="#00f0ff"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 76}
              animate={{ strokeDashoffset: 2 * Math.PI * 76 * (1 - progress / 100) }}
              transition={{ ease: "linear", duration: 0.1 }}
              style={{
                filter: "drop-shadow(0 0 6px rgba(0, 240, 255, 0.4))",
              }}
            />
          </svg>

          {/* Core readout */}
          <div className="text-center">
            <div className="font-mono text-xs text-text-ghost uppercase tracking-widest">
              Syncing
            </div>
            <div className="font-sans text-3xl font-extrabold tracking-tight mt-1 text-text-primary">
              {progress}%
            </div>
          </div>
        </div>

        {/* Console readout block */}
        <div className="w-full premium-glass rounded-xl p-5 border border-border-dim font-mono text-[9px] text-text-secondary leading-relaxed min-h-[140px] text-left">
          <div className="border-b border-border-dim pb-2 mb-3 text-text-ghost uppercase tracking-widest flex justify-between">
            <span>Neural Telemetry Log</span>
            <span className="animate-pulse">Active</span>
          </div>
          <div className="space-y-1.5">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -3 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={i === logs.length - 1 ? "text-[#00f0ff]" : ""}
              >
                {log}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
