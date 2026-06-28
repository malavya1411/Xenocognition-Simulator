import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowRight, 
  Moon, 
  Sun, 
  Sparkles, 
  LogOut, 
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  AmbientParticles,
  CustomCursor,
  FilmGrain,
  Vignette,
} from "@/components/xeno/Atmosphere";
import { NeuralCore } from "@/components/xeno/LandingCanvas";
import { AuthPanel } from "@/components/xeno/AuthPanel";
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

function LandingPage() {
  const { user, profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Landing Page Sub-Views: "hero" | "login" | "signup" | "onboarding"
  const [view, setView] = useState<"hero" | "login" | "signup" | "onboarding">("hero");

  // Track login state transitions to trigger onboarding
  const [prevUserUid, setPrevUserUid] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.classList.toggle("light", theme === "light");
    }
  }, [theme]);

  // Handle Auth transitions
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (prevUserUid === null) {
          // User just successfully logged in
          if (profile) {
            if (profile.onboardingCompleted) {
              navigate({ to: "/dashboard" });
            } else {
              setView("onboarding");
            }
          }
        }
        setPrevUserUid(user.uid);
      } else {
        setPrevUserUid(null);
        setView("hero");
      }
    }
  }, [user, profile, loading, prevUserUid, navigate]);

  const handleAuthSuccess = () => {
    // If the user object is updated, the useEffect above will redirect them
    // to dashboard or onboarding. If they are already logged in (e.g. email auth), we trigger here
    if (user && profile) {
      if (profile.onboardingCompleted) {
        navigate({ to: "/dashboard" });
      } else {
        setView("onboarding");
      }
    }
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
      <AmbientParticles count={45} activeArch={null} />
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
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-28 flex flex-col items-center justify-center min-h-[85vh]" style={{ zIndex: 30 }}>
        
        {/* Pulsing Central Energy Core */}
        <NeuralCore />
        
        <AnimatePresence mode="wait">
          {view === "hero" && (
            <motion.div
              key="hero-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl text-center flex flex-col items-center"
            >
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border-glow bg-elevated px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
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
              
              <p className="mt-6 text-sm font-light leading-relaxed tracking-wide text-text-secondary md:text-base max-w-lg">
                Step beyond conversational AI. Xenocognition is a simulator designed for interacting with alternative, non-human neural layouts.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                {user && profile?.onboardingCompleted ? (
                  /* User is authenticated & onboarding complete */
                  <div className="flex flex-col items-center gap-4">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">
                      Neural interface active: <span className="text-white font-bold">{profile.displayName}</span>
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate({ to: "/dashboard" })}
                        className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black transition-all hover:scale-105 hover:bg-neutral-200 cursor-pointer shadow-lg"
                      >
                        Enter Dashboard
                        <LayoutDashboard size={13} />
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-full border border-border-dim bg-surface/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-primary transition-all hover:bg-elevated hover:border-border-glow cursor-pointer"
                      >
                        Log Out <LogOut size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* User is Guest - strictly Log In and Sign In */
                  <div className="flex gap-4">
                    <button
                      onClick={() => setView("login")}
                      className="rounded-full border border-border-dim bg-surface/30 px-8 py-3 text-xs font-semibold uppercase tracking-wider text-text-primary transition-all hover:bg-elevated hover:border-border-glow cursor-pointer"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => setView("signup")}
                      className="group flex items-center gap-2 rounded-full bg-white px-8 py-3 text-xs font-semibold uppercase tracking-wider text-black transition-all hover:scale-105 hover:bg-neutral-200 cursor-pointer shadow-lg"
                    >
                      Sign In
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === "login" && (
            <motion.div key="login-view" className="w-full">
              <AuthPanel 
                mode="login" 
                onCancel={() => setView("hero")} 
                onSuccess={handleAuthSuccess} 
              />
            </motion.div>
          )}

          {view === "signup" && (
            <motion.div key="signup-view" className="w-full">
              <AuthPanel 
                mode="signup" 
                onCancel={() => setView("hero")} 
                onSuccess={handleAuthSuccess} 
              />
            </motion.div>
          )}

          {view === "onboarding" && (
            <motion.div key="onboarding-view" className="w-full">
              <OnboardingWizard 
                isOpen={true} 
                onComplete={() => navigate({ to: "/dashboard" })} 
                onCancel={handleLogout} 
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}
