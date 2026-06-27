import { useState } from "react";
import { motion } from "framer-motion";
import type { BoltzmannData } from "@/lib/xeno-mock";

export function BoltzmannPanel({ data, loading }: { data: BoltzmannData | null; loading: boolean }) {
  const [stabilized, setStabilized] = useState(false);

  if (loading || !data) {
    return (
      <div className="relative flex h-full items-center justify-center overflow-hidden">
        <div className="scanlines absolute inset-0" />
        <div className="flicker chromatic-text font-mono text-xs text-text-ghost">
          ░▒▓ receiving fragments ▓▒░
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {!stabilized && (
        <div className="scanlines pointer-events-none absolute inset-0" style={{ zIndex: 1 }} />
      )}
      <div
        className={`relative flex-1 space-y-2 overflow-y-auto pr-2 ${!stabilized ? "crt-flicker" : ""}`}
        style={{ zIndex: 2 }}
      >
        {data.output.map((chunk, i) => {
          if (chunk.type === "signal") {
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="font-sans text-[15px] font-medium"
                style={{
                  color: "var(--accent-boltzmann)",
                  textShadow: stabilized
                    ? "0 0 8px color-mix(in oklab, var(--accent-boltzmann) 40%, transparent)"
                    : "0 0 10px color-mix(in oklab, var(--accent-boltzmann) 60%, transparent)",
                  background: stabilized ? "color-mix(in oklab, var(--accent-boltzmann) 6%, transparent)" : undefined,
                  padding: stabilized ? "4px 8px" : 0,
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
              animate={{ opacity: stabilized ? 0.1 : 0.5 }}
              transition={{ delay: i * 0.04 }}
              className={`font-mono text-[13px] text-text-ghost ${stabilized ? "" : "line-through"}`}
              style={{
                textShadow: stabilized
                  ? undefined
                  : "-1px 0 rgba(255,0,80,0.25), 1px 0 rgba(0,200,255,0.25)",
              }}
            >
              {chunk.text}
            </motion.p>
          );
        })}
      </div>

      <div className="relative mt-3" style={{ zIndex: 2 }}>
        <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-text-secondary">
          <span>signal / noise</span>
          <span>{(data.signalRatio * 100).toFixed(0)}%</span>
        </div>
        <div className="h-1" style={{ background: "var(--elevated)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.signalRatio * 100}%` }}
            transition={{ duration: 0.8 }}
            style={{ height: "100%", background: "var(--accent-boltzmann)" }}
          />
        </div>
        <button
          onClick={() => setStabilized((s) => !s)}
          aria-pressed={stabilized}
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary"
        >
          {stabilized ? "[ release ]" : "[ stabilize ]"}
        </button>
      </div>
    </div>
  );
}
