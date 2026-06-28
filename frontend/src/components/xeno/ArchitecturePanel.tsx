import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  accentVar: string;
  icon: ReactNode;
  children: ReactNode;
  onDeepDive?: () => void;
  status?: "idle" | "loading" | "done";
  index?: number;
}

export function ArchitecturePanel({
  title,
  accentVar,
  icon,
  children,
  onDeepDive,
  status,
  index = 0,
}: Props) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 110, damping: 16, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden premium-glass"
      style={{
        borderTop: `3px solid ${accentVar}`,
        borderRadius: 12,
        minHeight: 480,
        contain: "layout style paint",
      }}
    >
      <header
        className="flex items-center justify-between gap-3 px-5 py-4 bg-void/35"
        style={{ borderBottom: "1px solid var(--border-dim)" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0" style={{ color: accentVar }}>
            {icon}
          </span>
          <h2 className="truncate font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-text-primary">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span
              className={`h-[6px] w-[6px] rounded-full ${status === "loading" ? "pulse-ring" : ""}`}
              style={{
                background: status === "done" ? accentVar : status === "loading" ? accentVar : "var(--text-ghost)",
                opacity: status === "idle" ? 0.4 : 1,
              }}
              aria-label={`status ${status}`}
            />
          )}
          {onDeepDive && (
            <button
              onClick={onDeepDive}
              aria-label={`Deep dive into ${title}`}
              className="rounded-sm p-1 text-text-ghost transition-colors hover:bg-elevated hover:text-text-primary"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </header>
      <div className="relative flex-1 p-5">{children}</div>
    </motion.section>
  );
}
