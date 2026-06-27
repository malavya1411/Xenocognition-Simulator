import { useState } from "react";
import { motion } from "framer-motion";
import type { MeshData } from "@/lib/xeno-mock";

const ghostColors = ["var(--accent-mesh)", "var(--accent-hive)", "var(--accent-boltzmann)", "var(--accent-mycelium)"];

export function MeshPanel({ data, loading }: { data: MeshData | null; loading: boolean }) {
  const [unmeshed, setUnmeshed] = useState(false);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative">
          {["A", "B", "C", "D"].map((c, i) => (
            <motion.span
              key={c}
              className="absolute font-serif text-3xl italic"
              style={{ color: ghostColors[i], left: i * 5, top: i * 5, opacity: 0.4 }}
              animate={{ opacity: [0.15, 0.55, 0.15] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }}
            >
              {c}
            </motion.span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4">
      <div className="flex flex-1 flex-col">
        {!unmeshed ? (
          <div className="relative flex flex-1 items-center justify-center">
            {data.perspectives.slice(0, 4).map((p, i) => {
              const offsets = [
                { x: -3, y: -3 },
                { x: 3, y: 2 },
                { x: -2, y: 3 },
                { x: 2, y: -2 },
              ][i];
              return (
                <p
                  key={p.voice}
                  className="absolute inset-0 flex items-center justify-center px-4 text-center font-serif text-base italic"
                  style={{
                    color: ghostColors[i],
                    opacity: 0.14 + i * 0.02,
                    transform: `translate(${offsets.x}px, ${offsets.y}px)`,
                  }}
                >
                  {p.text}
                </p>
              );
            })}
            <p className="relative z-10 px-4 text-center font-sans text-lg font-medium leading-relaxed text-text-primary">
              {data.averageAnswer}
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {data.perspectives.map((p, i) => (
              <motion.div
                key={p.voice}
                initial={{ opacity: 0, x: -10, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: (i % 2 === 0 ? -1 : 1) * 1.2 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 18 }}
                className="p-3"
                style={{
                  background: "var(--elevated)",
                  borderLeft: `2px solid ${ghostColors[i % ghostColors.length]}`,
                }}
              >
                <p className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-text-ghost">
                  <span>{p.voice}</span>
                  <span style={{ color: ghostColors[i % ghostColors.length] }}>
                    {(p.weight * 100).toFixed(0)}% of mesh
                  </span>
                </p>
                <p className="font-serif text-sm italic text-text-primary">{p.text}</p>
              </motion.div>
            ))}
          </div>
        )}
        <button
          onClick={() => setUnmeshed((u) => !u)}
          className="mt-3 self-start font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary"
        >
          [ {unmeshed ? "remesh" : "unmesh"} ]
        </button>
      </div>

      <div className="flex w-8 flex-col items-center">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-text-ghost">tension</p>
        <div className="relative w-[6px] flex-1" style={{ background: "var(--elevated)" }}>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${data.tensionScore * 100}%` }}
            transition={{ duration: 0.9 }}
            className={`absolute bottom-0 w-full ${data.tensionScore > 0.7 ? "pulse-ring" : ""}`}
            style={{ background: "var(--accent-mesh)" }}
          />
        </div>
        <p className="mt-1 font-mono text-[10px]" style={{ color: "var(--accent-mesh)" }}>
          {data.tensionScore.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
