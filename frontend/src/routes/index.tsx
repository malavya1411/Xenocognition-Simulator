import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowRight, 
  Moon, 
  Sun, 
  ChevronRight, 
  Sparkles, 
  LogOut, 
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  BoltzmannIcon,
  HiveIcon,
  MeshIcon,
  MyceliumIcon,
  OctopusIcon,
} from "@/components/xeno/icons";
import {
  AmbientParticles,
  CustomCursor,
  FilmGrain,
  Vignette,
} from "@/components/xeno/Atmosphere";
import { PersonaCanvas, NeuralCore } from "@/components/xeno/LandingCanvas";
import { AuthModal } from "@/components/xeno/AuthModal";
import { OnboardingWizard } from "@/components/xeno/OnboardingWizard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Xenocognition Simulator — Connection Interface" },
      {
        name: "description",
        content: "Step into non-human cognitive architectures. Apple 2030 speculative neuroscience lab.",
      },
    ],
  }),
  component: LandingPage,
});

type ArchId = "octopus" | "mycelium" | "hive" | "boltzmann" | "mesh";

const ARCH_META: {
  id: ArchId;
  name: string;
  desc: string;
  accent: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "octopus", name: "OCTOPUS MIND", desc: "Eight semi-autonomous arms. One shared body.", accent: "var(--accent-octopus)", color: "#00f0ff", icon: OctopusIcon },
  { id: "mycelium", name: "MYCELIAL NETWORK", desc: "Chemical gradients diffusing across fungal loam.", accent: "var(--accent-mycelium)", color: "#ece3d4", icon: MyceliumIcon },
  { id: "hive", name: "HIVE MIND", desc: "Emergent consensus from 200 voting micro-agents.", accent: "var(--accent-hive)", color: "#fbbf24", icon: HiveIcon },
  { id: "boltzmann", name: "BOLTZMANN BRAIN", desc: "Cosmic noise organizing momentarily into thought.", accent: "var(--accent-boltzmann)", color: "#a78bfa", icon: BoltzmannIcon },
  { id: "mesh", name: "POST-HUMAN MESH", desc: "Layered cybernetic minds resolving deep tension.", accent: "var(--accent-mesh)", color: "#cbd5e1", icon: MeshIcon },
];

function LandingPage() {
  const { user, profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"login" | "signup">("login");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [hoveredArch, setHoveredArch] = useState<ArchId | null>(null);

  // Track user login transition to avoid auto-redirect loops
  const [prevUserUid, setPrevUserUid] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.classList.toggle("light", theme === "light");
    }
  }, [theme]);

  // Auth monitoring and onboarding trigger
  useEffect(() => {
    if (!loading) {
      if (user) {
        // If they just logged in (transitioned from logged out)
        if (prevUserUid === null) {
          if (profile) {
            if (profile.onboardingCompleted) {
              navigate({ to: "/dashboard" });
            } else {
              setIsOnboarding(true);
            }
          }
        }
        setPrevUserUid(user.uid);
      } else {
        setPrevUserUid(null);
        setIsOnboarding(false);
      }
    }
  }, [user, profile, loading, prevUserUid, navigate]);

  const handleStartConnection = () => {
    if (user) {
      if (profile?.onboardingCompleted) {
        navigate({ to: "/dashboard" });
      } else {
        setIsOnboarding(true);
      }
    } else {
      setAuthInitialTab("signup");
      setShowAuthModal(true);
    }
  };

  const handleCardClick = () => {
    if (user) {
      navigate({ to: "/dashboard" });
    } else {
      setAuthInitialTab("login");
      setShowAuthModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <div 
      className="relative min-h-screen overflow-x-hidden transition-all duration-1000" 
      style={{ 
        background: hoveredArch === "octopus" ? "radial-gradient(circle at center, var(--accent-octopus-bg) 0%, var(--base) 100%)" :
                    hoveredArch === "mycelium" ? "radial-gradient(circle at center, var(--accent-mycelium-bg) 0%, var(--base) 100%)" :
                    hoveredArch === "hive" ? "radial-gradient(circle at center, var(--accent-hive-bg) 0%, var(--base) 100%)" :
                    hoveredArch === "boltzmann" ? "radial-gradient(circle at center, var(--accent-boltzmann-bg) 0%, var(--base) 100%)" :
                    hoveredArch === "mesh" ? "radial-gradient(circle at center, var(--accent-mesh-bg) 0%, var(--base) 100%)" : "var(--base)",
        color: "var(--text-primary)" 
      }}
    >
      <AmbientParticles count={40} activeArch={hoveredArch} />
      <Vignette />
      <FilmGrain />
      <CustomCursor />

      {/* Nav */}
      <nav
        className="fixed left-0 right-0 top-0 flex items-center justify-between px-6"
        style={{
          height: 64,
          zIndex: 40,
          backdropFilter: "blur(20px)",
          background: "rgba(3, 3, 6, 0.4)",
          borderBottom: "1px solid var(--border-dim)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-6 w-6 place-items-center"
            style={{ border: "1.2px solid var(--text-primary)", borderRadius: 2 }}
          >
            <div className="h-[6px] w-[6px] rounded-full" style={{ background: "var(--text-primary)" }} />
          </div>
          <span className="font-sans text-[12px] font-semibold tracking-[0.3em] text-text-primary">
            XENOCOGNITION
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary rounded border border-border-dim cursor-pointer"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          
          {user && profile?.onboardingCompleted ? (
            /* Logged In, Onboarding completed: dashboard link + logout button */
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="flex items-center gap-1.5 rounded border border-border-glow bg-elevated px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-primary hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                <LayoutDashboard size={12} /> Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded border border-border-dim px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-border-glow transition-all cursor-pointer"
              >
                <LogOut size={12} /> Log Out
              </button>
            </div>
          ) : (
            /* Logged Out / Incomplete: sign-in + login links */
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthInitialTab("login");
                  setShowAuthModal(true);
                }}
                className="rounded border border-border-dim px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-border-glow transition-all cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setAuthInitialTab("signup");
                  setShowAuthModal(true);
                }}
                className="rounded bg-text-primary px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-base hover:bg-white transition-all shadow-lg cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-28" style={{ zIndex: 30 }}>
        
        {/* HERO SECTION */}
        <div className="relative flex flex-col items-center justify-center pt-4 text-center">
          <NeuralCore />
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl animate-fade-in"
          >
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border-glow bg-elevated px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              <Sparkles size={10} className="text-octopus animate-pulse" /> Speculative Neuroscience Lab 2030
            </span>
            <h1
              className="font-sans font-bold uppercase tracking-[-0.04em] text-text-primary"
              style={{
                fontSize: "clamp(2.5rem, 7.5vw, 5.5rem)",
                lineHeight: 0.95,
              }}
            >
              Alien Minds,<br />Architected
            </h1>
            <p className="mt-6 text-sm font-light leading-relaxed tracking-wide text-text-secondary md:text-base">
              Step beyond conversational AI. Xenocognition is a simulator designed for interacting with alternative, non-human neural layouts.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={handleStartConnection}
                className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black transition-all hover:scale-105 hover:bg-neutral-200 cursor-pointer shadow-lg"
              >
                {user && profile?.onboardingCompleted ? "Enter Dashboard" : "Access Neural Uplink"}
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#personas"
                className="rounded-full border border-border-dim bg-surface/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-primary transition-all hover:bg-elevated hover:border-border-glow cursor-pointer"
              >
                Scan Personas
              </a>
            </div>
          </motion.div>
        </div>

        {/* 5 PERSONAS SPECULATIVE GRID */}
        <section id="personas" className="mt-28">
          <div className="mb-10 text-center md:text-left">
            <h2 className="font-sans text-[11px] font-bold tracking-[0.25em] text-text-secondary uppercase">
              // Core Cognitive Layouts
            </h2>
            <p className="mt-2 text-2xl font-semibold text-text-primary">
              Five architectures. Unique realities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            {ARCH_META.map((a) => {
              const isHovered = hoveredArch === a.id;
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.id}
                  className="premium-glass relative flex flex-col justify-between overflow-hidden p-6 cursor-pointer group rounded-xl"
                  style={{
                    minHeight: 250,
                    borderTop: isHovered ? `3.5px solid ${a.accent}` : "1.2px solid var(--border-dim)",
                    background: isHovered ? "var(--elevated)" : "var(--surface)",
                    boxShadow: isHovered ? `0 0 35px -5px ${a.accent}25, 0 12px 30px rgba(0,0,0,0.55)` : "none",
                  }}
                  onMouseEnter={() => setHoveredArch(a.id)}
                  onMouseLeave={() => setHoveredArch(null)}
                  onClick={handleCardClick}
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                >
                  <PersonaCanvas type={a.id} hovered={isHovered} />

                  <div className="relative z-20 flex flex-col">
                    <div 
                      className="mb-4 w-fit p-2.5 rounded-full grid place-items-center"
                      style={{
                        background: isHovered ? `${a.accent}12` : "rgba(255,255,255,0.02)",
                        color: isHovered ? a.accent : "var(--text-secondary)",
                        border: `1px solid ${isHovered ? a.accent + "40" : "var(--border-dim)"}`
                      }}
                    >
                      <Icon size={20} className={isHovered ? "text-white" : "text-text-secondary"} />
                    </div>
                    
                    <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] text-text-primary uppercase transition-colors group-hover:text-white">
                      {a.name}
                    </h3>
                  </div>

                  <div className="relative z-20 mt-8">
                    <p className="font-mono text-[9.5px] leading-relaxed text-text-secondary">
                      {a.desc}
                    </p>
                    <span className="mt-4 flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-text-ghost group-hover:text-text-primary transition-colors">
                      Sync layout <ChevronRight size={10} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

      </main>

      {/* MODALS */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
            initialTab={authInitialTab}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOnboarding && (
          <OnboardingWizard 
            isOpen={isOnboarding} 
            onComplete={() => {
              setIsOnboarding(false);
              navigate({ to: "/dashboard" });
            }}
            onCancel={() => {
              setIsOnboarding(false);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
