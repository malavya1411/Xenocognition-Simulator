import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowLeft, 
  LogOut, 
  Send, 
  Cpu, 
  LayoutGrid, 
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
import { OctopusChatRealm } from "@/components/xeno/OctopusChatRealm";
import { MycelialChatRealm } from "@/components/xeno/MycelialChatRealm";
import { HiveChatRealm } from "@/components/xeno/HiveChatRealm";
import { BoltzmannChatRealm } from "@/components/xeno/BoltzmannChatRealm";
import { MeshChatRealm } from "@/components/xeno/MeshChatRealm";

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
  { id: "octopus", name: "OCTOPUS MIND", tagline: "8 Autonomous Limbs", desc: "Distributed, decentralized cognition. Decisions emerge from 8 parallel sub-agents arguing to form a loose consensus.", accent: "var(--accent-octopus)", color: "#00f0ff", icon: OctopusIcon },
  { id: "mycelium", name: "MYCELIAL NETWORK", tagline: "Organic Chemical Loom", desc: "No concept of self. Processes concepts through chemical gradients and spatial proximity. Associative and spatial, not linear.", accent: "var(--accent-mycelium)", color: "#ece3d4", icon: MyceliumIcon },
  { id: "hive", name: "HIVE MIND", tagline: "Emergent Swarm Democracy", desc: "Individual nodes are simple, but intelligence emerges from swarm consensus. A real-time voting system of 200 agents.", accent: "var(--accent-hive)", color: "#fbbf24", icon: HiveIcon },
  { id: "boltzmann", name: "BOLTZMANN BRAIN", tagline: "Quantum Entropy Fluctuation", desc: "Pure thermodynamic cognition. Thoughts arise from statistical fluctuations. Highly random and chaotic with hidden patterns.", accent: "var(--accent-boltzmann)", color: "#a78bfa", icon: BoltzmannIcon },
  { id: "mesh", name: "POST-HUMAN MESH", tagline: "Layered Dissent", desc: "Millions of uploaded human minds merged. Every response is a weighted average of conflicting perspectives, displaying visible tension.", accent: "var(--accent-mesh)", color: "#cbd5e1", icon: MeshIcon },
];

interface ArchState {
  status: "idle" | "loading" | "done";
  data: OctopusData | MyceliumData | HiveData | BoltzmannData | MeshData | null;
}

function DashboardComponent() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  // Selected agent view
  const [activeTab, setActiveTab] = useState<TabId>("octopus");
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showOctopusRealm, setShowOctopusRealm] = useState(false);
  const [showMycelialRealm, setShowMycelialRealm] = useState(false);
  const [showHiveRealm, setShowHiveRealm] = useState(false);
  const [showBoltzmannRealm, setShowBoltzmannRealm] = useState(false);
  const [showMeshRealm, setShowMeshRealm] = useState(false);

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

    simulateOctopus(q).then((d) => update("octopus", d));
    simulateMycelium(q).then((d) => update("mycelium", d));
    simulateHive(q).then((d) => update("hive", d));
    simulateBoltzmann(q).then((d) => update("boltzmann", d));
    simulateMesh(q).then((d) => update("mesh", d));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    if (activeTab === "octopus") {
      setShowOctopusRealm(true);
    } else if (activeTab === "mycelium") {
      setShowMycelialRealm(true);
    } else {
      runSimulation(query);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-base text-text-primary">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Connecting Neural Workspace...
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
      className="relative min-h-screen bg-base text-text-primary pb-28 transition-all duration-700"
      style={{
        background: activeTab !== "compare" && activePersonaData
          ? `radial-gradient(circle at center, ${activePersonaData.accent}07 0%, var(--base) 100%)`
          : "var(--base)"
      }}
    >
      <AmbientParticles count={35} activeArch={activeTab !== "compare" ? activeTab : "default"} />
      <Vignette />
      <FilmGrain />
      <CustomCursor />

      {/* Top progress bar */}
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

      {/* Nav */}
      <nav
        className="fixed left-0 right-0 top-0 flex items-center justify-between px-6 border-b border-border-dim"
        style={{
          height: 64,
          zIndex: 40,
          backdropFilter: "blur(20px)",
          background: "rgba(3, 3, 6, 0.4)",
        }}
      >
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-text-ghost hover:text-text-primary transition-colors cursor-pointer border border-border-dim rounded px-2.5 py-1"
        >
          <ArrowLeft size={10} /> Back to Landing
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded border border-border-dim px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-border-glow transition-all cursor-pointer"
        >
          <LogOut size={12} /> Log Out
        </button>
      </nav>

      {/* Main Container */}
      <main className="relative mx-auto max-w-[1400px] px-6 pt-24" style={{ zIndex: 30 }}>
        
        {/* Welcome Username Header */}
        <header className="mb-8 border-b border-border-dim pb-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-text-ghost">
            // Neural Uplink Established
          </span>
          <h1 className="font-sans text-3xl font-bold uppercase tracking-tight text-text-primary mt-1">
            Welcome, {profile?.displayName || "Researcher"}
          </h1>
        </header>

        {/* 5 Clickable Agent Cards Option Grid */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-[10px] font-bold tracking-[0.2em] text-text-secondary uppercase">
              Select Architecture Persona
            </h2>
            <button
              onClick={() => setActiveTab("compare")}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "compare" ? "border-white bg-white text-black" : "border-border-dim text-text-secondary hover:text-white"}`}
            >
              <LayoutGrid size={11} /> Compare All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              const isSelected = activeTab === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className="premium-glass p-4 rounded-xl cursor-pointer border flex flex-col justify-between hover:scale-[1.02] transition-all group select-none min-h-[110px]"
                  style={{
                    borderColor: isSelected ? p.color : "var(--border-dim)",
                    boxShadow: isSelected ? `0 0 20px -6px ${p.color}35` : "none",
                    background: isSelected ? "var(--elevated)" : "var(--surface)"
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div 
                      className="p-2 rounded-full grid place-items-center"
                      style={{
                        background: isSelected ? `${p.accent}12` : "rgba(255,255,255,0.02)",
                        color: isSelected ? p.color : "var(--text-ghost)",
                        border: `1px solid ${isSelected ? p.color + "30" : "transparent"}`
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="font-sans text-[10px] font-bold tracking-wider text-text-primary uppercase group-hover:text-white transition-colors">
                      {p.name.split(" ")[0]}
                    </h3>
                    <p className="font-mono text-[8px] text-text-secondary uppercase tracking-widest truncate mt-0.5">
                      {p.tagline}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Console view */}
        <div className="min-h-[50vh]">
          <AnimatePresence mode="wait">
            
            {activeTab !== "compare" ? (
              /* Focus View for Single Agent */
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Info Panel */}
                <div className="premium-glass p-6 rounded-xl flex flex-col justify-between h-fit lg:col-span-1 border border-border-glow">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-text-secondary">
                      // Architectural Profile
                    </span>
                    <h2 className="font-sans text-lg font-bold tracking-wide text-text-primary uppercase mt-1">
                      {activePersonaData?.name}
                    </h2>
                    <p className="mt-4 text-xs text-text-secondary leading-relaxed font-light">
                      {activePersonaData?.desc}
                    </p>

                    <div className="mt-6 space-y-4 border-t border-border-dim pt-6">
                      <h4 className="font-mono text-[9px] uppercase tracking-widest text-text-primary">
                        System Configuration
                      </h4>
                      <div className="space-y-3 font-mono text-[9px]">
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
                      {activeTab === "octopus" && (
                        <button
                          onClick={() => setShowOctopusRealm(true)}
                          className="w-full mt-4 flex items-center justify-center gap-2 rounded border border-[#00FFE5]/30 hover:border-[#00FFE5] bg-[#00FFE5]/5 hover:bg-[#00FFE5]/15 py-2 text-[10px] font-mono tracking-widest text-[#00FFE5] transition-all cursor-pointer uppercase font-bold"
                        >
                          🐙 INITIATE UPLINK REALM
                        </button>
                      )}
                      {activeTab === "mycelium" && (
                        <button
                          onClick={() => setShowMycelialRealm(true)}
                          className="w-full mt-4 flex items-center justify-center gap-2 rounded border border-[#22C55E]/30 hover:border-[#22C55E] bg-[#22C55E]/5 hover:bg-[#22C55E]/15 py-2 text-[10px] font-mono tracking-widest text-[#22C55E] transition-all cursor-pointer uppercase font-bold"
                        >
                          ⬡ INITIATE UPLINK REALM
                        </button>
                      )}
                      {activeTab === "hive" && (
                        <button
                          onClick={() => setShowHiveRealm(true)}
                          className="w-full mt-4 flex items-center justify-center gap-2 rounded border border-[#fbbf24]/30 hover:border-[#fbbf24] bg-[#fbbf24]/5 hover:bg-[#fbbf24]/15 py-2 text-[10px] font-mono tracking-widest text-[#fbbf24] transition-all cursor-pointer uppercase font-bold"
                        >
                          🐝 INITIATE SWARM REALM
                        </button>
                      )}
                      {activeTab === "boltzmann" && (
                        <button
                          onClick={() => setShowBoltzmannRealm(true)}
                          className="w-full mt-4 flex items-center justify-center gap-2 rounded border border-[#a78bfa]/30 hover:border-[#a78bfa] bg-[#a78bfa]/5 hover:bg-[#a78bfa]/15 py-2 text-[10px] font-mono tracking-widest text-[#a78bfa] transition-all cursor-pointer uppercase font-bold"
                        >
                          ⚛ INITIATE QUANTUM REALM
                        </button>
                      )}
                      {activeTab === "mesh" && (
                        <button
                          onClick={() => setShowMeshRealm(true)}
                          className="w-full mt-4 flex items-center justify-center gap-2 rounded border border-[#cbd5e1]/30 hover:border-[#cbd5e1] bg-[#cbd5e1]/5 hover:bg-[#cbd5e1]/15 py-2 text-[10px] font-mono tracking-widest text-[#cbd5e1] transition-all cursor-pointer uppercase font-bold"
                        >
                          🕸 INITIATE NEURAL REALM
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-border-dim pt-4 font-mono text-[8px] text-text-ghost uppercase tracking-widest">
                    Uplink secure | {activeTab} protocol online
                  </div>
                </div>

                {/* Console Output Visualizer */}
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
                    <div className="premium-glass rounded-xl p-10 flex flex-col items-center justify-center text-center border border-border-dim h-[300px]">
                      <Cpu size={24} className="text-text-ghost animate-pulse mb-3" />
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary">
                        Uplink Stream Idle
                      </h3>
                      <p className="mt-2 font-mono text-[9px] text-text-secondary max-w-sm leading-relaxed">
                        Submit a concept at the bottom of the console to probe the {activePersonaData?.name.toLowerCase()}'s thought process.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Compare Grid View */
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
                  <div className="premium-glass rounded-xl p-16 flex flex-col items-center justify-center text-center border border-border-dim min-h-[300px]">
                    <LayoutGrid size={24} className="text-text-ghost animate-pulse mb-3" />
                    <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary">
                      Parallel Cognitive Comparison
                    </h3>
                    <p className="mt-2 font-mono text-[9px] text-text-secondary max-w-md leading-relaxed">
                      Submit a concept below. Observe and compare how all 5 architectures process the concept in parallel.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 py-6 border-t border-border-dim bg-[#04040a]/95 backdrop-blur-md" style={{ zIndex: 35 }}>
          <form
            onSubmit={onSubmit}
            className="relative mx-auto flex w-full max-w-3xl items-center gap-3 px-6"
          >
            <div
              className="relative flex flex-1 items-center transition-all duration-400"
              style={{
                height: 52,
                background: "var(--surface)",
                border: isFocused 
                  ? `1.2px solid ${activeTab !== "compare" && activePersonaData ? activePersonaData.color : "rgba(255,255,255,0.2)"}` 
                  : "1px solid var(--border-dim)",
                borderRadius: 10,
                boxShadow: isFocused 
                  ? `0 0 15px -4px ${activeTab !== "compare" && activePersonaData ? activePersonaData.color + "66" : "rgba(255, 255, 255, 0.15)"}` 
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
                className="h-full w-full bg-transparent px-6 font-sans text-xs text-text-primary outline-none placeholder:text-text-ghost"
              />
            </div>
            <button
              type="submit"
              aria-label="Submit query"
              className="relative grid place-items-center transition-all duration-300 group overflow-hidden"
              style={{
                width: 46,
                height: 46,
                background: activeTab !== "compare" && activePersonaData
                  ? `linear-gradient(135deg, ${activePersonaData.color}, ${activePersonaData.color}dd)` 
                  : "linear-gradient(135deg, var(--text-primary), var(--text-secondary))",
                color: "var(--base)",
                borderRadius: 999,
              }}
            >
              <Send size={14} className="relative z-10" />
            </button>
          </form>
        </div>

      </main>

      <AnimatePresence>
        {showProcessing && <ProcessingOverlay doneCount={doneCount} />}
      </AnimatePresence>

      {showOctopusRealm && (
        <OctopusChatRealm
          initialConcept={input.trim() || submitted || "xenocognition"}
          onClose={() => {
            setShowOctopusRealm(false);
            setInput("");
          }}
        />
      )}

      {showMycelialRealm && (
        <MycelialChatRealm
          initialConcept={input.trim() || submitted || "xenocognition"}
          onClose={() => {
            setShowMycelialRealm(false);
            setInput("");
          }}
        />
      )}

      {showHiveRealm && (
        <HiveChatRealm
          initialConcept={input.trim() || submitted || "xenocognition"}
          onClose={() => {
            setShowHiveRealm(false);
            setInput("");
          }}
        />
      )}

      {showBoltzmannRealm && (
        <BoltzmannChatRealm
          initialConcept={input.trim() || submitted || "xenocognition"}
          onClose={() => {
            setShowBoltzmannRealm(false);
            setInput("");
          }}
        />
      )}

      {showMeshRealm && (
        <MeshChatRealm
          initialConcept={input.trim() || submitted || "xenocognition"}
          onClose={() => {
            setShowMeshRealm(false);
            setInput("");
          }}
        />
      )}

    </div>
  );
}
