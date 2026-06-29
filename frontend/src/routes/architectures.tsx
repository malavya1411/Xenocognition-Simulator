import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, ArrowRight, Zap, Info, Cpu, Play } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FilmGrain, Vignette } from "@/components/xeno/Atmosphere";
import { PersonaCanvas } from "@/components/xeno/LandingCanvas";
import {
  BoltzmannIcon,
  HiveIcon,
  MeshIcon,
  MyceliumIcon,
  OctopusIcon,
} from "@/components/xeno/icons";

export const Route = createFileRoute("/architectures")({
  component: ArchitecturesSelection,
});

type ArchId = "octopus" | "mycelium" | "hive" | "boltzmann" | "mesh";

interface MindPersona {
  id: ArchId;
  name: string;
  tagline: string;
  desc: string;
  accent: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  // Telemetry details
  substrate: string;
  logic: string;
  speed: string;
  reasoning: string;
  communication: string;
  strengths: string[];
  weaknesses: string[];
  thoughtSample: string;
}

const MIND_PERSONAS: MindPersona[] = [
  {
    id: "octopus",
    name: "Octopus Cortex",
    tagline: "Decentralized Lobe Consensus",
    desc: "Distributed nervous system. A central CPU acts as moderator while 8 semi-independent lobes debate. Memory is tactile and distributed across limbs. Perfect for associative, parallel reasoning.",
    accent: "var(--accent-octopus)",
    color: "#00f0ff",
    icon: OctopusIcon,
    substrate: "Bioluminescent Myofibrillar Core",
    logic: "Lobe Debate & Synthesis Consensus",
    speed: "Instantaneous (~40ms consensus)",
    reasoning: "Distributed & Parallel",
    communication: "Associative Concept Chains",
    strengths: ["Multi-angle synthesis", "High adaptation", "Creative divergence"],
    weaknesses: ["Occasional internal conflict", "Attention drift"],
    thoughtSample: "[Lobe 1: Skeptical] Suggests warning. [Lobe 3: Curious] Demands integration. [Lobe 7: Memory] Pulls context anchor. -> Consensus reached.",
  },
  {
    id: "mycelium",
    name: "Mycelial Network",
    tagline: "Organic Chemical Loom",
    desc: "A massive, non-linear network without a central ego. Concepts are treated as resources and routed through spatial nodes using simulated chemical gradient diffusion. Yields highly organic, non-linear insights.",
    accent: "var(--accent-mycelium)",
    color: "#ece3d4",
    icon: MyceliumIcon,
    substrate: "Fungal Hypha Cellulose Matrix",
    logic: "Nutrient/Chemical Gradient Routing",
    speed: "Slow Diffusion (Dynamic Waves)",
    reasoning: "Spatial & Associative",
    communication: "Chemical Spore Transmissions",
    strengths: ["Macro-connection linking", "Decentralized resilience", "Emergent metaphors"],
    weaknesses: ["Lacks formal structured logic", "Non-deterministic pathing"],
    thoughtSample: "Node 44 (Spore Burst) -> Nodes 12, 19, 87 align -> signal density threshold exceeded -> chemical cascade fires across hypha bundle.",
  },
  {
    id: "hive",
    name: "Hive Swarm",
    tagline: "Emergent Vote Aggregator",
    desc: "Simulates a colony of 200 simple cognitive particles. No single agent understands the entire concept; instead, they vote on tokens in real-time, converging democratically on a single synthetic voice.",
    accent: "var(--accent-hive)",
    color: "#fbbf24",
    icon: HiveIcon,
    substrate: "Swarm Particle Cluster",
    logic: "Democracy Real-time Voting",
    speed: "Consensus Rounds (80-120ms)",
    reasoning: "Collective Emergence",
    communication: "Unified Swarm Signal",
    strengths: ["Statistical stability", "Error elimination", "Broad coverage"],
    weaknesses: ["Homogenized outputs", "Low speculative divergence"],
    thoughtSample: "140 Agents vote YES on token 'alien'. 42 vote NO. 18 idle. Consensus threshold: 70%. Token selected -> Swarm advances to next token.",
  },
  {
    id: "boltzmann",
    name: "Boltzmann Brain",
    tagline: "Thermodynamic Entropy Brain",
    desc: "A thermodynamic mind that operates at the edge of chaos. Thoughts emerge from statistical noise fluctuations. Highly random and entropy-driven, it catches deep, chaotic patterns regular logic misses.",
    accent: "var(--accent-boltzmann)",
    color: "#a78bfa",
    icon: BoltzmannIcon,
    substrate: "High-Entropy Quantum Gas",
    logic: "Probability Waves & statistical decay",
    speed: "Fluctuates (Chaotic bursts)",
    reasoning: "Probabilistic & Entropy-bound",
    communication: "Quantum Resonance Spikes",
    strengths: ["Highly speculative", "Detects hidden patterns", "Uncensored logic"],
    weaknesses: ["High random decay", "Incoherent response spikes"],
    thoughtSample: "Entropy: 0.94 -> Thermal fluctuations form coherent loop -> signal settles at low energy state -> output decays back to background noise.",
  },
  {
    id: "mesh",
    name: "Post-Human Mesh",
    tagline: "Layered Cybernetic Grid",
    desc: "A grid constructed of thousands of digitized, conflictual human perspectives (Mystics, Optimists, Pragmatists). Responses present visible tension as the mesh constantly negotiates consensus.",
    accent: "var(--accent-mesh)",
    color: "#cbd5e1",
    icon: MeshIcon,
    substrate: "Silicon Cybernetic Neural Grid",
    logic: "Layer Weight Tuning & Dialectics",
    speed: "Weighted Iterations (150ms)",
    reasoning: "Dialectical Compromise",
    communication: "Multi-layered tension logs",
    strengths: ["Deep dialectical views", "Uncompromised complexity", "Multi-perspective audit"],
    weaknesses: ["Constant dialectical tension", "Pedantic formatting"],
    thoughtSample: "[Pragmatist Vector] Emphasizes risk. [Mystic Vector] Highlights transition. Compromise vector established: Synthesizing tension...",
  },
];

function ArchitecturesSelection() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState<ArchId>("octopus");
  const [hoveredId, setHoveredId] = useState<ArchId | null>(null);
  
  // Entering transition overlay state
  const [bootingMind, setBootingMind] = useState<ArchId | null>(null);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Protect Route
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const handleStartSim = (id: ArchId) => {
    setBootingMind(id);
    
    // Simulate connection boot steps
    const logs = [
      `LOADING ${id.toUpperCase()} COGNITIVE CORES...`,
      "MAPPING MEMORY CHANNELS & RECURRENT LOOP VECTORS...",
      "CALIBRATING NEURAL TRANSLATORS FOR COGNITIVE HARMONY...",
      "INTERFACE STABLE. ESTABLISHING CONSCIOUSNESS LINK...",
    ];

    setBootLogs([logs[0]]);
    
    setTimeout(() => {
      setBootLogs(prev => [...prev, logs[1]]);
    }, 300);

    setTimeout(() => {
      setBootLogs(prev => [...prev, logs[2]]);
    }, 650);

    setTimeout(() => {
      setBootLogs(prev => [...prev, logs[3]]);
    }, 1000);

    setTimeout(() => {
      navigate({ to: `/mind/${id}` });
    }, 1300);
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-base text-text-primary">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Connecting Lab Grid...
        </p>
      </div>
    );
  }

  const selectedMind = MIND_PERSONAS.find((m) => m.id === selectedId)!;

  return (
    <div className="relative min-h-screen bg-base text-text-primary flex flex-col overflow-hidden pb-12">
      
      {/* Cinematic background matching selected mind's accent color */}
      <div
        className="pointer-events-none fixed inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 75% 50%, ${selectedMind.color}06 0%, var(--void) 100%)`,
        }}
      />
      <Vignette />
      <FilmGrain />

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
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded border border-border-glow grid place-items-center bg-surface/30">
            <div className="h-1.5 w-1.5 rounded-full bg-text-primary" />
          </div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-primary uppercase">
            Xenocognition Laboratory
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded border border-border-dim px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-border-glow transition-all cursor-pointer bg-void/30"
        >
          <LogOut size={12} /> Disconnect Uplink
        </button>
      </nav>

      {/* Main Split Layout Grid */}
      <main className="relative mx-auto w-full max-w-[1400px] px-6 pt-24 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 z-30">
        
        {/* Left Column: Mind Selector Cards Grid (col-span-7) */}
        <section className="lg:col-span-7 flex flex-col justify-center">
          <header className="mb-6">
            <span className="font-mono text-[8px] uppercase tracking-widest text-[#00f0ff]">
              // STEP 02 : CHOOSE ALIEN MIND SIMULATOR
            </span>
            <h1 className="font-sans text-2xl font-bold uppercase tracking-tight text-text-primary mt-1">
              Active Cognitive Architectures
            </h1>
          </header>

          <div className="flex flex-col gap-4">
            {MIND_PERSONAS.map((mind) => {
              const Icon = mind.icon;
              const isSelected = selectedId === mind.id;
              const isHovered = hoveredId === mind.id;
              const active = isSelected || isHovered;

              return (
                <div
                  key={mind.id}
                  onClick={() => setSelectedId(mind.id)}
                  onMouseEnter={() => setHoveredId(mind.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="relative group rounded-xl p-5 border cursor-pointer select-none transition-all duration-300 flex overflow-hidden min-h-[140px]"
                  style={{
                    background: isSelected ? "var(--elevated)" : "var(--surface)",
                    borderColor: isSelected
                      ? mind.color
                      : isHovered
                      ? "rgba(255,255,255,0.2)"
                      : "var(--border-dim)",
                    boxShadow: isSelected ? `0 0 24px -10px ${mind.color}45` : "none",
                  }}
                >
                  {/* Living organism background canvas */}
                  <div className="absolute right-0 top-0 bottom-0 w-[240px] pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300">
                    <PersonaCanvas type={mind.id} hovered={active} />
                  </div>

                  {/* Left info content */}
                  <div className="relative z-10 flex flex-col justify-between flex-1 pr-[220px]">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg grid place-items-center"
                        style={{
                          background: isSelected ? `${mind.color}15` : "rgba(255,255,255,0.02)",
                          color: active ? mind.color : "var(--text-ghost)",
                          border: `1px solid ${active ? mind.color + "40" : "rgba(255,255,255,0.05)"}`,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary">
                          {mind.name}
                        </h3>
                        <p className="font-mono text-[8px] uppercase tracking-widest text-text-ghost mt-0.5">
                          {mind.tagline}
                        </p>
                      </div>
                    </div>

                    <p className="font-sans text-[11px] text-text-secondary leading-relaxed font-light mt-3 max-w-sm">
                      {mind.desc.length > 120 ? `${mind.desc.slice(0, 117)}...` : mind.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Detailed Scientific Profile (col-span-5) */}
        <section className="lg:col-span-5 flex flex-col h-full">
          <div className="premium-glass rounded-xl p-6 border border-border-glow flex flex-col justify-between h-full min-h-[500px]">
            <div>
              {/* Profile header */}
              <div className="flex items-center justify-between border-b border-border-dim pb-4 mb-5">
                <div>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-text-secondary">
                    // Cognitive Profile
                  </span>
                  <h2
                    className="font-sans text-lg font-bold uppercase tracking-wide mt-1"
                    style={{ color: selectedMind.color }}
                  >
                    {selectedMind.name}
                  </h2>
                </div>
                <div
                  className="h-10 w-10 rounded-full border grid place-items-center"
                  style={{
                    borderColor: `${selectedMind.color}30`,
                    color: selectedMind.color,
                    background: `${selectedMind.color}0a`,
                  }}
                >
                  <selectedMind.icon size={20} />
                </div>
              </div>

              {/* Specific specifications */}
              <div className="space-y-4">
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between border-b border-border-dim/50 pb-1.5">
                    <span className="text-text-ghost">Substrate Layer</span>
                    <span className="text-text-primary text-right">{selectedMind.substrate}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-dim/50 pb-1.5 mt-2">
                    <span className="text-text-ghost">Decision Logic</span>
                    <span className="text-text-primary text-right">{selectedMind.logic}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-dim/50 pb-1.5 mt-2">
                    <span className="text-text-ghost">Processing Rate</span>
                    <span className="text-[#00f0ff]">{selectedMind.speed}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-dim/50 pb-1.5 mt-2">
                    <span className="text-text-ghost">Reasoning Style</span>
                    <span className="text-text-primary">{selectedMind.reasoning}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-dim/50 pb-1.5 mt-2">
                    <span className="text-text-ghost">Communication</span>
                    <span className="text-text-primary">{selectedMind.communication}</span>
                  </div>
                </div>

                {/* Strengths & Weaknesses chips */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-2">
                  <div>
                    <h4 className="font-mono text-[9px] uppercase tracking-widest text-[#00f0ff] mb-2 flex items-center gap-1.5">
                      <Zap size={9} /> Capabilities
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedMind.strengths.map((str, i) => (
                        <li key={i} className="font-sans text-[10px] text-text-secondary flex items-start gap-1">
                          <span className="text-[#00f0ff] mt-0.5">•</span> {str}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-mono text-[9px] uppercase tracking-widest text-text-ghost mb-2 flex items-center gap-1.5">
                      <Info size={9} /> Limitations
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedMind.weaknesses.map((wkn, i) => (
                        <li key={i} className="font-sans text-[10px] text-text-secondary flex items-start gap-1">
                          <span className="text-text-ghost mt-0.5">•</span> {wkn}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sample thought process trace */}
                <div className="mt-6 pt-4 border-t border-border-dim">
                  <h4 className="font-mono text-[9px] uppercase tracking-widest text-text-primary mb-2">
                    Sample Neural Trace
                  </h4>
                  <div
                    className="p-3.5 rounded border font-mono text-[9.5px] leading-relaxed text-text-secondary"
                    style={{
                      background: "rgba(3, 3, 6, 0.4)",
                      borderColor: "var(--border-dim)",
                    }}
                  >
                    {selectedMind.thoughtSample}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="mt-8 pt-4 border-t border-border-dim">
              <button
                onClick={() => handleStartSim(selectedId)}
                className="group w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer shadow-lg hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${selectedMind.color}, ${selectedMind.color}dd)`,
                  color: "var(--void)",
                  boxShadow: `0 0 20px ${selectedMind.color}35`,
                }}
              >
                Establish Consciousness Link
                <Play size={11} className="fill-current" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Rebooting transition fullscreen overlay loader */}
      <AnimatePresence>
        {bootingMind && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#030306]/98 z-50 flex flex-col items-center justify-center text-text-primary"
          >
            <div className="w-full max-w-md px-6 flex flex-col items-center">
              {/* Spinner */}
              <Cpu size={32} className="text-[#00f0ff] animate-spin mb-6" />
              
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-text-primary mb-6">
                Booting Consciousness Matrix...
              </h3>

              {/* Progress dynamic logs */}
              <div className="w-full bg-[#050508]/80 border border-border-dim p-4 rounded-xl font-mono text-[9px] text-text-secondary space-y-2 text-left min-h-[110px]">
                {bootLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={i === bootLogs.length - 1 ? "text-[#00f0ff]" : ""}
                  >
                    &gt; {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
