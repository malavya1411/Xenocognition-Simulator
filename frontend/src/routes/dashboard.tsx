import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowLeft, 
  LogOut, 
  Send, 
  Cpu, 
  LayoutGrid, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  simulateBoltzmann,
  simulateHive,
  simulateMesh,
  simulateMycelium,
  simulateOctopus,
  type BoltzmannData,
  type HiveData,
  type MeshData,
  type MyceliumData,
  type OctopusData,
} from "@/lib/xeno-mock";
import { ArchitecturePanel } from "@/components/xeno/ArchitecturePanel";
import { OctopusPanel } from "@/components/xeno/OctopusPanel";
import { MyceliumPanel } from "@/components/xeno/MyceliumPanel";
import { HivePanel } from "@/components/xeno/HivePanel";
import { BoltzmannPanel } from "@/components/xeno/BoltzmannPanel";
import { MeshPanel } from "@/components/xeno/MeshPanel";
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
import { ProcessingOverlay } from "@/components/xeno/ProcessingOverlay";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
});

type ArchId = "octopus" | "mycelium" | "hive" | "boltzmann" | "mesh";
type TabId = ArchId | "compare";

const PERSONAS: {
  id: ArchId;
  name: string;
  desc: string;
  tagline: string;
  accent: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "octopus", name: "OCTOPUS MIND", tagline: "8 Semi-Autonomous Limbs", desc: "Distributed, decentralized cognition. Decisions emerge from 8 parallel sub-agents arguing to form a loose consensus.", accent: "var(--accent-octopus)", color: "#00f0ff", icon: OctopusIcon },
  { id: "mycelium", name: "MYCELIAL NETWORK", tagline: "Slow Loam Chemistry", desc: "No concept of self. Processes concepts through chemical gradients and spatial proximity. Associative and spatial, not linear.", accent: "var(--accent-mycelium)", color: "#ece3d4", icon: MyceliumIcon },
  { id: "hive", name: "HIVE MIND", tagline: "Emergent Swarm Will", desc: "Individual nodes are simple, but intelligence emerges from swarm consensus. A real-time voting system of 200 agents.", accent: "var(--accent-hive)", color: "#fbbf24", icon: HiveIcon },
  { id: "boltzmann", name: "BOLTZMANN BRAIN", tagline: "Thermodynamic Fluctuation", desc: "Pure thermodynamic cognition. Thoughts arise from statistical fluctuations. Highly random and chaotic with hidden patterns.", accent: "var(--accent-boltzmann)", color: "#a78bfa", icon: BoltzmannIcon },
  { id: "mesh", name: "POST-HUMAN MESH", tagline: "Averaged Consciousness", desc: "Millions of uploaded human minds merged. Every response is a weighted average of conflicting perspectives, displaying visible tension.", accent: "var(--accent-mesh)", color: "#cbd5e1", icon: MeshIcon },
];

interface ArchState {
  status: "idle" | "loading" | "done";
  data: OctopusData | MyceliumData | HiveData | BoltzmannData | MeshData | null;
}

function DashboardComponent() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  // Selected persona view: specific persona id or "compare" (to compare all side-by-side)
  const [activeTab, setActiveTab] = useState<TabId>("octopus");
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const [archs, setArchs] = useState<Record<ArchId, ArchState>>({
    octopus: { status: "idle", data: null },
    mycelium: { status: "idle", data: null },
    hive: { status: "idle", data: null },
    boltzmann: { status: "idle", data: null },
    mesh: { status: "idle", data: null },
  });

  // Protect Route
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, authLoading, navigate]);

  // Load preferred persona from onboarding as default
  useEffect(() => {
    if (profile?.preferredPersona) {
      setActiveTab(profile.preferredPersona as TabId);
    }
  }, [profile]);

  const runSimulation = async (q: string) => {
    setSubmitted(q);
    setArchs({
      octopus: { status: "loading", data: null },
      mycelium: { status: "loading", data: null },
      hive: { status: "loading", data: null },
      boltzmann: { status: "loading", data: null },
      mesh: { status: "loading", data: null },
    });

    const update = (id: ArchId, data: ArchState["data"]) =>
      setArchs((s) => ({ ...s, [id]: { status: "done", data } }));

    // Run all in parallel so user can switch tabs on the fly to compare responses
    simulateOctopus(q).then((d) => update("octopus", d));
    simulateMycelium(q).then((d) => update("mycelium", d));
    simulateHive(q).then((d) => update("hive", d));
    simulateBoltzmann(q).then((d) => update("boltzmann", d));
    simulateMesh(q).then((d) => update("mesh", d));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    runSimulation(input.trim());
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-base text-text-primary">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Authenticating Neural Link...
        </p>
      </div>
    );
  }

  const doneCount = Object.values(archs).filter((a) => a.status === "done").length;
  const anyLoading = Object.values(archs).some((a) => a.status === "loading");
  const showProcessing = submitted && anyLoading && doneCount === 0;

  const renderPanel = (id: ArchId) => {
    const a = archs[id];
    const loading = a.status === "loading";
    switch (id) {
      case "octopus":
        return <OctopusPanel data={a.data as OctopusData | null} loading={loading} />;
      case "mycelium":
        return <MyceliumPanel data={a.data as MyceliumData | null} loading={loading} />;
      case "hive":
        return <HivePanel data={a.data as HiveData | null} loading={loading} />;
      case "boltzmann":
        return <BoltzmannPanel data={a.data as BoltzmannData | null} loading={loading} />;
      case "mesh":
        return <MeshPanel data={a.data as MeshData | null} loading={loading} />;
    }
  };

  const activePersonaData = PERSONAS.find(p => p.id === activeTab);

  return (
    <div 
      className="relative min-h-screen overflow-x-hidden bg-base text-text-primary transition-all duration-1000 pb-20"
      style={{
        background: activeTab !== "compare" && activePersonaData
          ? `radial-gradient(circle at center, ${activePersonaData.accent}0a 0%, var(--base) 100%)`
          : "var(--base)"
      }}
    >
      <AmbientParticles count={40} activeArch={activeTab !== "compare" ? activeTab : "default"} />
      <Vignette />
      <FilmGrain />
      <CustomCursor />

      {/* Top progress bar for processing updates */}
      <AnimatePresence>
        {anyLoading && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(doneCount / 5) * 100}%` }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeOut" }}
            className="fixed left-0 top-0 h-[2px] bg-octopus"
            style={{ zIndex: 60 }}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav
        className="fixed left-0 right-0 top-0 flex items-center justify-between px-6 border-b border-border-dim"
        style={{
          height: 64,
          zIndex: 40,
          backdropFilter: "blur(20px)",
          background: "rgba(3, 3, 6, 0.4)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-text-ghost hover:text-text-primary transition-colors cursor-pointer border border-border-dim rounded px-2.5 py-1"
          >
            <ArrowLeft size={10} /> Back to Landing
          </button>
          <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-text-ghost">
            | NEURAL SIMULATOR
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-border-glow rounded-md bg-elevated/40 px-3 py-1 text-[10px] font-mono text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Uplink: <span className="text-white font-bold">{profile?.displayName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded border border-border-dim px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-border-glow transition-all cursor-pointer"
          >
            <LogOut size={12} /> Log Out
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="relative mx-auto max-w-[1400px] px-6 pt-24" style={{ zIndex: 30 }}>
        
        {/* Apple 2030 Persona Selector Tabs */}
        <section className="mt-4">
          <div className="flex border-b border-border-dim pb-px overflow-x-auto gap-2">
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              const isActive = activeTab === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className={`flex items-center gap-2 pb-3 pt-1 px-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${isActive ? "text-white border-b-2" : "text-text-ghost hover:text-text-secondary"}`}
                  style={{ borderBottomColor: isActive ? p.color : "transparent" }}
                >
                  <Icon size={14} className={isActive ? "" : "opacity-40"} />
                  {p.name.split(" ")[0]}
                </button>
              );
            })}
            <button
              onClick={() => setActiveTab("compare")}
              className={`flex items-center gap-2 pb-3 pt-1 px-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ml-auto ${activeTab === "compare" ? "text-white border-b-2 border-white" : "text-text-ghost hover:text-text-secondary"}`}
            >
              <LayoutGrid size={14} className={activeTab === "compare" ? "" : "opacity-40"} />
              Compare All
            </button>
          </div>
        </section>

        {/* Tab content */}
        <div className="mt-8 min-h-[60vh]">
          <AnimatePresence mode="wait">
            
            {activeTab !== "compare" ? (
              /* Single Persona Panel View */
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Persona Profile and Parameters */}
                <div className="premium-glass p-6 rounded-xl flex flex-col justify-between h-fit lg:col-span-1 border border-border-glow">
                  <div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-full grid place-items-center"
                        style={{
                          background: `${activePersonaData?.accent}12`,
                          color: activePersonaData?.color,
                          border: `1px solid ${activePersonaData?.color}35`
                        }}
                      >
                        {activePersonaData && <activePersonaData.icon size={22} />}
                      </div>
                      <div>
                        <h2 className="font-sans text-[11px] font-bold tracking-[0.2em] text-text-primary uppercase">
                          {activePersonaData?.name}
                        </h2>
                        <span className="font-mono text-[9px] text-text-secondary uppercase tracking-widest">
                          {activePersonaData?.tagline}
                        </span>
                      </div>
                    </div>

                    <p className="mt-6 text-xs text-text-secondary leading-relaxed font-light">
                      {activePersonaData?.desc}
                    </p>

                    <div className="mt-8 space-y-4 border-t border-border-dim pt-6">
                      <h4 className="font-mono text-[9px] uppercase tracking-widest text-text-primary">
                        Cognitive Parameters
                      </h4>
                      <div className="space-y-3 font-mono text-[9.5px]">
                        <div className="flex justify-between">
                          <span className="text-text-ghost">Decision Rate</span>
                          <span className="text-text-secondary">{activeTab === "mycelium" ? "Chemical Diffusion" : activeTab === "hive" ? "Consensus Round" : "Instantaneous"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-ghost">Self-Identity Node</span>
                          <span className="text-text-secondary">{activeTab === "mycelium" || activeTab === "hive" ? "Decentralized (None)" : "Localized / Emergent"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-ghost">Substrate</span>
                          <span className="text-text-secondary">{activeTab === "mesh" ? "Silicon Mesh" : activeTab === "boltzmann" ? "Quantum Noise" : "Organic Loom"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 border-t border-border-dim pt-6 font-mono text-[8px] text-text-ghost uppercase tracking-widest leading-normal">
                    Arch: {activeTab}<br />
                    Secure uplink calibrator active
                  </div>
                </div>

                {/* Simulation Output Area */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {submitted ? (
                    <ArchitecturePanel
                      title={`${activePersonaData?.name}`}
                      accentVar={activePersonaData?.accent || "var(--accent-octopus)"}
                      icon={activePersonaData && <activePersonaData.icon size={18} />}
                      status={archs[activeTab].status}
                      index={0}
                    >
                      {renderPanel(activeTab)}
                    </ArchitecturePanel>
                  ) : (
                    /* Initial prompt instruction */
                    <div className="premium-glass rounded-xl p-10 flex flex-col items-center justify-center text-center border border-border-dim h-[350px]">
                      <Cpu size={28} className="text-text-ghost animate-pulse mb-4" />
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary">
                        Initialize Simulation Interface
                      </h3>
                      <p className="mt-2 font-mono text-[10px] text-text-secondary max-w-sm leading-relaxed">
                        Submit a concept at the bottom to probe how the {activePersonaData?.name.toLowerCase()} processes and represents reality.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Compare All Grid View */
              <motion.div
                key="compare-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {submitted ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PERSONAS.map((p, i) => (
                      <ArchitecturePanel
                        key={p.id}
                        title={p.name}
                        accentVar={p.accent}
                        icon={<p.icon size={18} />}
                        status={archs[p.id].status}
                        index={i}
                      >
                        {renderPanel(p.id)}
                      </ArchitecturePanel>
                    ))}
                  </div>
                ) : (
                  <div className="premium-glass rounded-xl p-16 flex flex-col items-center justify-center text-center border border-border-dim min-h-[350px]">
                    <LayoutGrid size={28} className="text-text-ghost animate-pulse mb-4" />
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary">
                      Parallel Cognitive Comparison
                    </h3>
                    <p className="mt-2 font-mono text-[10px] text-text-secondary max-w-md leading-relaxed">
                      Submit a concept. Watch 5 alien architectures process it side-by-side in real time to observe the impact of substrate on thought patterns.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* INPUT PROBE BAR */}
        <div className="fixed bottom-0 left-0 right-0 py-6 border-t border-border-dim bg-[#04040a]/90 backdrop-blur-md" style={{ zIndex: 35 }}>
          <form
            onSubmit={onSubmit}
            className="relative mx-auto flex w-full max-w-3xl items-center gap-3 px-6"
          >
            <div
              className="relative flex flex-1 items-center transition-all duration-400"
              style={{
                height: 56,
                background: "var(--surface)",
                border: isFocused 
                  ? `1.2px solid ${activeTab !== "compare" && activePersonaData ? activePersonaData.color : "rgba(255,255,255,0.2)"}` 
                  : "1px solid var(--border-dim)",
                borderRadius: 10,
                boxShadow: isFocused 
                  ? `0 0 20px -5px ${activeTab !== "compare" && activePersonaData ? activePersonaData.color + "aa" : "rgba(255, 255, 255, 0.15)"}` 
                  : "none",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={activeTab === "compare" ? "Submit a concept to compare all architectures..." : `Submit a concept to probe the ${activePersonaData?.name.toLowerCase()}...`}
                aria-label="Cognitive concept input"
                className="h-full w-full bg-transparent px-6 font-sans text-sm text-text-primary outline-none placeholder:text-text-ghost placeholder:italic"
              />
            </div>
            <button
              type="submit"
              aria-label="Submit query"
              className="relative grid place-items-center transition-all duration-300 group overflow-hidden"
              style={{
                width: 50,
                height: 50,
                background: activeTab !== "compare" && activePersonaData
                  ? `linear-gradient(135deg, ${activePersonaData.color}, ${activePersonaData.color}dd)` 
                  : "linear-gradient(135deg, var(--text-primary), var(--text-secondary))",
                color: "var(--base)",
                borderRadius: 999,
              }}
            >
              <Send size={15} className="relative z-10" />
            </button>
          </form>
        </div>

      </main>

      {/* Processing overlay */}
      <AnimatePresence>
        {showProcessing && <ProcessingOverlay doneCount={doneCount} />}
      </AnimatePresence>

    </div>
  );
}
