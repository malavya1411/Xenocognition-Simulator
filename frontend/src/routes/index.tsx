import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  FilmGrain,
  Vignette,
} from "@/components/xeno/Atmosphere";
import { NeuralPCBBackground } from "@/components/xeno/LandingCanvas";
import { AuthPanel } from "@/components/xeno/AuthPanel";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Xenocognition Simulator — Alien Minds, Architected" },
      {
        name: "description",
        content:
          "Step into non-human cognitive architectures. Simulate alien minds through five radical intelligence frameworks.",
      },
      { property: "og:title", content: "Xenocognition Simulator" },
      {
        property: "og:description",
        content: "Alien Minds, Architected. Intelligence is architectural, not universal.",
      },
    ],
  }),
  component: LandingPage,
}));

// Architecture identifiers for the telemetry row
const ARCH_CHIPS = [
  { id: "OCT", label: "Octopus Mind", color: "#00f0ff" },
  { id: "MYC", label: "Mycelial Network", color: "#10b981" },
  { id: "HIV", label: "Hive Mind", color: "#fbbf24" },
  { id: "BOL", label: "Boltzmann Brain", color: "#a78bfa" },
  { id: "MSH", label: "Post-Human Mesh", color: "#22d3ee" },
];

function LandingPage() {
  const { user, profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [view, setView] = useState<"hero" | "login" | "signup">("hero");
  const [activeChip, setActiveChip] = useState<number | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.classList.toggle("light", theme === "light");
    }
  }, [theme]);

  // Redirect to dashboard after auth completes
  useEffect(() => {
    if (!loading && user && profile) {
      if (view === "login" || view === "signup") {
        navigate({ to: "/dashboard" });
      }
    }
  }, [user, profile, loading, view, navigate]);

  const handleAuthSuccess = () => {
    navigate({ to: "/dashboard" });
  };

  const handleLogout = async () => {
    try {
      await logout();
      setView("hero");
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base text-text-primary">

      {/* ── Layer 0: Full-screen neural PCB canvas ── */}
      <NeuralPCBBackground />

      {/* ── Layer 1: Atmospheric overlays ── */}
      <Vignette />
      <FilmGrain />

      {/* ── Subtle scan line sweep ── */}
      <div
        className="pointer-events-none fixed left-0 top-0 w-full h-[2px] opacity-[0.06] scan-line-move"
        style={{
          background: "linear-gradient(90deg, transparent, #00f0ff, transparent)",
          zIndex: 18,
        }}
        aria-hidden
      />

      {/* ── Nav ── */}
      <nav
        className="fixed left-0 right-0 top-0 flex items-center justify-between px-6"
        style={{
          height: 64,
          zIndex: 40,
          backdropFilter: "blur(24px)",
          background: "rgba(3, 3, 6, 0.55)",
          borderBottom: "1px solid rgba(0,240,255,0.06)",
        }}
      >
        {/* Logo mark */}
        <div className="flex items-center gap-3">
          <div
            className="grid h-6 w-6 place-items-center"
            style={{
              border: "1.2px solid rgba(0,240,255,0.4)",
              borderRadius: 3,
              boxShadow: "0 0 8px rgba(0,240,255,0.15)",
            }}
          >
            <div
              className="h-[6px] w-[6px] rounded-full"
              style={{ background: "#00f0ff", boxShadow: "0 0 4px #00f0ff" }}
            />
          </div>
          <span
            className="font-mono text-[11px] font-semibold tracking-[0.35em] uppercase"
            style={{ color: "rgba(248,250,252,0.85)" }}
          >
            Xenocognition
          </span>
        </div>

        {/* Nav right */}
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "rgba(0,240,255,0.5)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "#00f0ff" }}
            />
            System Online
          </span>
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center text-text-secondary transition-all hover:text-text-primary rounded cursor-pointer"
            style={{ border: "1px solid var(--border-dim)" }}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main
        className="relative mx-auto max-w-[1200px] px-6 pb-24 pt-20 flex flex-col items-center justify-center min-h-screen"
        style={{ zIndex: 30 }}
      >
        <AnimatePresence mode="wait">

          {/* ─────────────── HERO VIEW ─────────────── */}
          {view === "hero" && (
            <motion.div
              key="hero-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center w-full"
            >
              {/* Status annotation badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mb-8 flex items-center gap-2"
              >
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em]"
                  style={{
                    border: "1px solid rgba(0,240,255,0.2)",
                    background: "rgba(0,240,255,0.04)",
                    color: "rgba(0,240,255,0.7)",
                  }}
                >
                  <Zap size={9} className="animate-pulse" />
                  Speculative Neuroscience Lab · Est. 2030
                </span>
              </motion.div>

              {/* Giant display headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="chromatic-text font-sans font-bold uppercase text-text-primary"
                style={{
                  fontSize: "clamp(3rem, 9.5vw, 7.5rem)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.04em",
                  textShadow:
                    "0 0 60px rgba(0,240,255,0.18), 0 0 120px rgba(167,139,250,0.12)",
                }}
              >
                Alien Minds,
                <br />
                Architected.
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.8 }}
                className="mt-8 max-w-[440px] font-mono text-[11.5px] leading-relaxed tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                Submit any concept and watch five non-human cognitive
                architectures process it simultaneously.
                Intelligence is architectural — not universal.
              </motion.p>

              {/* Architecture telemetry chips */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.7 }}
                className="mt-10 flex flex-wrap justify-center gap-2"
              >
                {ARCH_CHIPS.map((chip, i) => (
                  <button
                    key={chip.id}
                    onMouseEnter={() => setActiveChip(i)}
                    onMouseLeave={() => setActiveChip(null)}
                    className="flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition-all duration-300 cursor-default"
                    style={{
                      border: `1px solid ${activeChip === i ? chip.color + "60" : "rgba(255,255,255,0.06)"}`,
                      background: activeChip === i ? chip.color + "0a" : "transparent",
                      color: activeChip === i ? chip.color : "var(--text-ghost)",
                      boxShadow: activeChip === i ? `0 0 12px ${chip.color}22` : "none",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                      style={{
                        background: chip.color,
                        boxShadow: activeChip === i ? `0 0 6px ${chip.color}` : "none",
                        opacity: activeChip === i ? 1 : 0.5,
                      }}
                    />
                    {chip.label}
                  </button>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.7 }}
                className="mt-12 flex flex-wrap justify-center gap-4"
              >
                {user && profile ? (
                  // ── Authenticated state ──
                  <div className="flex flex-col items-center gap-5">
                    <p
                      className="font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: "rgba(0,240,255,0.6)" }}
                    >
                      Neural interface active ·{" "}
                      <span className="text-white font-bold">{profile.displayName}</span>
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate({ to: "/dashboard" })}
                        className="group flex items-center gap-2.5 rounded-full px-7 py-3 text-[11px] font-bold uppercase tracking-wider text-black transition-all duration-300 cursor-pointer shadow-lg hover:scale-105"
                        style={{
                          background: "linear-gradient(135deg, #00f0ff, #22d3ee)",
                          boxShadow: "0 0 24px rgba(0,240,255,0.35)",
                        }}
                      >
                        Enter Dashboard
                        <LayoutDashboard size={13} />
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer hover:border-border-glow"
                        style={{
                          border: "1px solid var(--border-dim)",
                          color: "var(--text-secondary)",
                          background: "rgba(255,255,255,0.02)",
                        }}
                      >
                        Log Out <LogOut size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── Guest state ──
                  <>
                    {/* Primary: Initialize Uplink */}
                    <button
                      id="cta-initialize-uplink"
                      onClick={() => setView("signup")}
                      className="neon-border-pulse group relative flex items-center gap-2.5 overflow-hidden rounded-full px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer hover:scale-[1.03]"
                      style={{
                        border: "1.5px solid rgba(0,240,255,0.55)",
                        background: "rgba(0,240,255,0.06)",
                        color: "#00f0ff",
                      }}
                    >
                      {/* Inner shimmer */}
                      <span
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, rgba(0,240,255,0.12) 0%, transparent 70%)",
                        }}
                      />
                      <Zap size={13} className="relative z-10" />
                      <span className="relative z-10">Initialize Uplink</span>
                      <ArrowRight
                        size={13}
                        className="relative z-10 transition-transform group-hover:translate-x-1"
                      />
                    </button>

                    {/* Secondary: Log In */}
                    <button
                      id="cta-login"
                      onClick={() => setView("login")}
                      className="flex items-center gap-2 rounded-full px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer hover:border-border-glow"
                      style={{
                        border: "1px solid var(--border-dim)",
                        color: "var(--text-secondary)",
                        background: "rgba(255,255,255,0.025)",
                      }}
                    >
                      Log In
                    </button>
                  </>
                )}
              </motion.div>

              {/* Bottom telemetry annotation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="mt-16 flex items-center gap-6"
              >
                {[
                  { label: "Architectures", value: "5" },
                  { label: "Cognitive Nodes", value: "200+" },
                  { label: "Response Modes", value: "Parallel" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className="font-mono text-[13px] font-bold"
                      style={{ color: "rgba(0,240,255,0.75)" }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="font-mono text-[8px] uppercase tracking-widest mt-0.5"
                      style={{ color: "var(--text-ghost)" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ─────────────── LOGIN VIEW ─────────────── */}
          {view === "login" && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <AuthPanel
                mode="login"
                onCancel={() => setView("hero")}
                onSuccess={handleAuthSuccess}
              />
            </motion.div>
          )}

          {/* ─────────────── SIGNUP VIEW ─────────────── */}
          {view === "signup" && (
            <motion.div
              key="signup-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <AuthPanel
                mode="signup"
                onCancel={() => setView("hero")}
                onSuccess={handleAuthSuccess}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
