import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Eye, Swords, Moon, BarChart3, HeartCrack, Hexagon } from "lucide-react";
import type { OctopusData } from "@/lib/xeno-mock";

const BIAS_ICONS = [Shield, Search, Eye, Swords, Moon, BarChart3, HeartCrack, Hexagon];

export function OctopusPanel({ data, loading }: { data: OctopusData | null; loading: boolean }) {
  const [active, setActive] = useState<number | null>(null);

  // SVG canvas
  const W = 320;
  const H = 320;
  const cx = W / 2;
  const cy = 130;

  // 8 tentacles — endpoint positions arranged in a fan around mantle
  const endpoints = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        // Spread tentacles in lower hemisphere + a bit to sides
        const angle = -Math.PI / 2 + Math.PI * 0.18 + (i / 7) * Math.PI * 1.64;
        const r = 130 + (i % 2) * 8;
        return {
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
          angle,
        };
      }),
    []
  );

  // Build curved tentacle path with bezier — adds natural sway
  const tentaclePath = (ex: number, ey: number, i: number, wave: number) => {
    const dx = ex - cx;
    const dy = ey - cy;
    const mx = cx + dx * 0.35;
    const my = cy + dy * 0.35 + Math.sin(i * 1.7 + wave) * 14;
    const cx2 = cx + dx * 0.7 + Math.cos(i * 2.1 + wave) * 18;
    const cy2 = cy + dy * 0.7 + Math.sin(i * 1.3 + wave) * 8;
    return `M ${cx},${cy + 20} Q ${mx},${my} ${cx2},${cy2} T ${ex},${ey}`;
  };

  // Compute suction cup positions along a curved path approximation
  const suctionCups = (ex: number, ey: number, i: number) => {
    const cups = [];
    for (let t = 0.45; t < 0.95; t += 0.18) {
      const x = cx + (ex - cx) * t + Math.cos(i * 2.1) * 12 * Math.sin(t * Math.PI);
      const y = cy + 20 + (ey - cy - 20) * t + Math.sin(i * 1.3) * 6 * Math.sin(t * Math.PI);
      cups.push({ x, y });
    }
    return cups;
  };

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.svg width={220} height={220} viewBox="0 0 220 220">
          <ellipse cx="110" cy="80" rx="32" ry="38" fill="var(--accent-octopus)" fillOpacity="0.1" stroke="var(--accent-octopus)" strokeWidth="1.5" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = -Math.PI / 2 + Math.PI * 0.2 + (i / 7) * Math.PI * 1.6;
            const ex = 110 + Math.cos(a) * 90;
            const ey = 80 + Math.sin(a) * 90;
            return (
              <motion.path
                key={i}
                d={`M 110,100 Q ${110 + Math.cos(a) * 30},${100 + Math.sin(a) * 40} ${ex},${ey}`}
                stroke="var(--accent-octopus)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12 }}
              />
            );
          })}
        </motion.svg>
      </div>
    );
  }

  const confidence = data.centralNode.confidence;
  const pupilSize = 4 + confidence * 10;
  const hasConflict = data.armNodes.length >= 2;

  return (
    <div className="flex h-full flex-col">
      <div className="relative mx-auto" style={{ width: W, maxWidth: "100%" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {/* Faint crosshatch tissue background */}
          <defs>
            <pattern id="tissue" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0 6 L6 0" stroke="var(--accent-octopus)" strokeWidth="0.3" opacity="0.12" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#tissue)" />

          {/* Tentacles */}
          {endpoints.map((p, i) => {
            const isActive = active === i;
            return (
              <g key={i}>
                <motion.path
                  d={tentaclePath(p.x, p.y, i, 0)}
                  stroke="var(--accent-octopus)"
                  strokeOpacity={isActive ? 0.95 : 0.55}
                  strokeWidth={isActive ? 2.6 : 1.6}
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d: [
                      tentaclePath(p.x, p.y, i, 0),
                      tentaclePath(p.x, p.y, i, 1),
                      tentaclePath(p.x, p.y, i, 2),
                      tentaclePath(p.x, p.y, i, 0),
                    ],
                  }}
                  transition={{ duration: 6 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Suction cups */}
                {suctionCups(p.x, p.y, i).map((c, ci) => (
                  <circle
                    key={ci}
                    cx={c.x}
                    cy={c.y}
                    r={1.6}
                    fill="var(--accent-octopus)"
                    opacity={isActive ? 0.95 : 0.7}
                  />
                ))}
              </g>
            );
          })}

          {/* Mantle */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={48}
            ry={58}
            fill="var(--accent-octopus)"
            fillOpacity="0.12"
            stroke="var(--accent-octopus)"
            strokeWidth="2"
          />
          {/* Inner glow ring */}
          <ellipse cx={cx} cy={cy} rx={42} ry={52} fill="none" stroke="var(--accent-octopus)" strokeOpacity="0.25" strokeWidth="1" />

          {/* Eye */}
          <g style={{ cursor: "pointer" }} onClick={() => setActive(-1)}>
            <circle cx={cx} cy={cy - 8} r={14} fill="var(--surface)" stroke="var(--accent-octopus)" strokeWidth="1" />
            <circle cx={cx} cy={cy - 8} r={10} fill="var(--accent-octopus)" fillOpacity="0.25" />
            <motion.circle
              cx={cx}
              cy={cy - 8}
              animate={{ r: pupilSize }}
              transition={{ duration: 0.8 }}
              fill="var(--accent-octopus)"
            />
            {/* Specular highlight */}
            <circle cx={cx - 3} cy={cy - 11} r={1.2} fill="var(--text-primary)" opacity="0.7" />
          </g>

          {/* Tentacle tip nodes with bias icons */}
          {endpoints.map((p, i) => {
            const Icon = BIAS_ICONS[i];
            const isActive = active === i;
            return (
              <g
                key={`tip-${i}`}
                style={{ cursor: "pointer" }}
                onClick={() => setActive(i)}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 14 : 11}
                  fill="var(--surface)"
                  stroke="var(--accent-octopus)"
                  strokeWidth={isActive ? 2 : 1.4}
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 0 8px var(--accent-octopus))"
                      : undefined,
                    transition: "all 200ms",
                  }}
                />
                <foreignObject x={p.x - 7} y={p.y - 7} width={14} height={14} style={{ pointerEvents: "none" }}>
                  <div style={{ color: "var(--accent-octopus)", display: "grid", placeItems: "center", width: 14, height: 14 }}>
                    <Icon size={10} strokeWidth={1.8} />
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {hasConflict && (
          <span className="absolute right-0 top-0 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--alert)" }}>
            ◆ neural conflict
          </span>
        )}
      </div>

      {/* Consensus / detail */}
      <div
        className="mt-3 min-h-[110px] p-3"
        style={{
          background: "var(--elevated)",
          border: "1px dashed color-mix(in oklab, var(--accent-octopus) 50%, transparent)",
          borderRadius: 6,
        }}
      >
        {active === null && (
          <p className="font-mono text-[11px] text-text-secondary">
            click the eye for consensus — click any tentacle tip for that arm's voice
          </p>
        )}
        {active === -1 && (
          <>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-text-ghost">
              central body · confidence {(confidence * 100).toFixed(0)}%
            </p>
            <p className="font-serif text-base italic text-text-primary">
              {data.centralNode.response}
            </p>
            <p className="mt-2 font-mono text-[11px] text-text-secondary line-through">
              {data.consensus}
            </p>
          </>
        )}
        {active !== null && active >= 0 && (
          <>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-text-ghost">
              tentacle {active + 1} · {data.armNodes[active].bias}
            </p>
            <p className="font-mono text-sm text-text-primary">
              {data.armNodes[active].response}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
