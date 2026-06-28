import { motion } from "framer-motion";

const shapes = [
  // circle
  "M50,10 a40,40 0 1,0 0.1,0",
  // hexagon
  "M50,8 L86,28 L86,72 L50,92 L14,72 L14,28 Z",
  // branching
  "M50,90 L50,55 L25,30 M50,55 L75,30 M50,90 L25,70 M50,90 L75,70",
  // static cross
  "M20,20 L80,80 M80,20 L20,80 M50,15 L50,85 M15,50 L85,50",
  // mesh
  "M35,40 a18,18 0 1,0 0.1,0 M65,40 a18,18 0 1,0 0.1,0 M50,65 a18,18 0 1,0 0.1,0",
];

const accents = [
  "var(--accent-octopus)",
  "var(--accent-hive)",
  "var(--accent-mycelium)",
  "var(--accent-boltzmann)",
  "var(--accent-mesh)",
];

export function ProcessingOverlay({ doneCount, total = 5 }: { doneCount: number; total?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ zIndex: 45, background: "color-mix(in oklab, var(--void) 92%, transparent)", backdropFilter: "blur(6px)" }}
    >
      <div className="relative h-32 w-32">
        {shapes.map((d, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 100 100"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.9, rotate: -20 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.9, 1, 1, 1.1],
              rotate: [0, 0, 10, 30],
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              repeatDelay: shapes.length * 0.9 - 0.9,
              delay: i * 0.9,
              ease: "easeInOut",
            }}
          >
            <path d={d} fill="none" stroke={accents[i]} strokeWidth={1.2} />
          </motion.svg>
        ))}
      </div>

      <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-text-secondary">
        Establishing cognitive uplink…
      </p>

      <div className="mt-6 flex gap-2">
        {accents.map((c, i) => (
          <motion.div
            key={i}
            className="h-[2px] w-16"
            style={{ background: "var(--border-dim)" }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: doneCount > i ? "100%" : "70%" }}
              transition={{ duration: doneCount > i ? 0.4 : 2 + i * 0.3, ease: "easeOut" }}
              style={{ height: "100%", background: c }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
