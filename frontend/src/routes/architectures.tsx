import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, ArrowRight, Zap, Info, Cpu, Play } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FilmGrain, Vignette } from "@/components/xeno/Atmosphere";
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
      setBootLogs((prev) => [...prev, logs[1]]);
    }, 300);

    setTimeout(() => {
      setBootLogs((prev) => [...prev, logs[2]]);
    }, 650);

    setTimeout(() => {
      setBootLogs((prev) => [...prev, logs[3]]);
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

  // Helper to color-code elements inside terminal trace logs
  const renderTrace = (id: ArchId, trace: string) => {
    if (id === "octopus") {
      return (
        <span className="font-mono leading-relaxed text-[#d0d5e0]">
          <span className="text-[#00f0ff] font-semibold">[Lobe 1: Skeptical]</span> Suggests warning.{" "}
          <span className="text-[#7b61ff] font-semibold">[Lobe 3: Curious]</span> Demands integration.{" "}
          <span className="text-[#ffb800] font-semibold">[Lobe 7: Memory]</span> Pulls context anchor.{" "}
          <span className="text-text-ghost">-&gt; Consensus reached.</span>
        </span>
      );
    }
    if (id === "mycelium") {
      return (
        <span className="font-mono leading-relaxed text-[#d0d5e0]">
          <span className="text-[#00f0ff] font-semibold">Node 44</span> (Spore Burst) -&gt;{" "}
          <span className="text-[#7b61ff] font-semibold">Nodes 12, 19, 87</span> align -&gt;{" "}
          <span className="text-text-secondary">signal density threshold exceeded</span> -&gt;{" "}
          <span className="text-[#ffb800] font-semibold">chemical cascade</span> fires across hypha bundle.
        </span>
      );
    }
    if (id === "hive") {
      return (
        <span className="font-mono leading-relaxed text-[#d0d5e0]">
          <span className="text-[#00f0ff] font-semibold">140 Agents</span> vote YES on token 'alien'.{" "}
          <span className="text-[#7b61ff] font-semibold">42 vote NO</span>. 18 idle.{" "}
          <span className="text-[#ffb800] font-semibold">Consensus threshold: 70%</span>.{" "}
          <span className="text-text-secondary">Token selected -&gt; Swarm advances.</span>
        </span>
      );
    }
    if (id === "boltzmann") {
      return (
        <span className="font-mono leading-relaxed text-[#d0d5e0]">
          <span className="text-[#00f0ff] font-semibold">Entropy: 0.94</span> -&gt;{" "}
          <span className="text-[#7b61ff] font-semibold">Thermal fluctuations</span> form coherent loop -&gt;{" "}
          <span className="text-text-secondary">signal settles at low energy state</span> -&gt;{" "}
          <span className="text-[#ffb800] font-semibold">output decays</span> back to background noise.
        </span>
      );
    }
    if (id === "mesh") {
      return (
        <span className="font-mono leading-relaxed text-[#d0d5e0]">
          <span className="text-[#00f0ff] font-semibold">[Pragmatist Vector]</span> Emphasizes risk.{" "}
          <span className="text-[#7b61ff] font-semibold">[Mystic Vector]</span> Highlights transition.{" "}
          <span className="text-[#ffb800] font-semibold">Compromise vector</span> established: Synthesizing tension...
        </span>
      );
    }
    return <span className="font-mono text-text-secondary">{trace}</span>;
  };

  return (
    <div
      className="relative min-h-screen bg-[#0a0a0f] text-text-primary flex flex-col pb-12"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }}
    >
      <Vignette />
      <FilmGrain />

      {/* Nav */}
      <nav
        className="fixed left-0 right-0 top-0 flex items-center justify-between px-6 border-b border-border-dim"
        style={{
          height: 64,
          zIndex: 40,
          backdropFilter: "blur(20px)",
          background: "rgba(10, 10, 15, 0.75)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded border border-border-glow grid place-items-center bg-surface/30">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "#ffffff" }}
          >
            Xenocognition Laboratory
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded border border-border-dim px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer bg-[#050508] text-[#a0a8b8] hover:text-white hover:border-border-glow"
          >
            <LogOut size={12} /> Disconnect Uplink
          </button>
        </div>
      </nav>

      {/* Main Split Layout Grid */}
      <main className="relative mx-auto w-full max-w-[1400px] px-6 pt-24 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 z-30">
        
        {/* Left Column: Mind Selector Cards Grid (col-span-7) */}
        <section className="lg:col-span-7 flex flex-col justify-start">
          <header className="mb-8">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[#00f0ff]">
              // STEP 02 : CHOOSE ALIEN MIND SIMULATOR
            </span>
            <h1 className="font-sans text-3xl font-bold uppercase tracking-tight text-white mt-2">
              Active Cognitive Architectures
            </h1>
          </header>

          <div className="flex flex-col gap-6">
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
                  className="relative group rounded-xl p-6 border cursor-pointer select-none transition-all duration-300 flex flex-col min-h-[140px]"
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.03)" : "rgba(14, 14, 25, 0.45)",
                    borderColor: isSelected
                      ? "rgba(0, 240, 255, 0.4)"
                      : isHovered
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255, 255, 255, 0.06)",
                    boxShadow: isSelected ? "0 0 20px rgba(0, 240, 255, 0.08)" : "none",
                  }}
                >
                  {/* Selected left indicator accent bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00f0ff]" />
                  )}

                  <div className="flex items-center gap-4">
                    {/* Icon container */}
                    <div
                      className="p-2.5 rounded-lg grid place-items-center transition-colors"
                      style={{
                        background: isSelected ? `${mind.color}15` : "rgba(255,255,255,0.02)",
                        color: active ? mind.color : "#a0a8b8",
                        border: `1px solid ${active ? mind.color + "40" : "rgba(255,255,255,0.05)"}`,
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    <div>
                      <h3 className="font-sans text-[17px] font-bold uppercase tracking-wide text-white">
                        {mind.name}
                      </h3>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-[#a0a8b8] mt-0.5">
                        {mind.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Body Copy - Full description (No truncation) */}
                  <p className="font-sans text-[14px] text-[#d0d5e0] leading-[1.6] font-normal mt-4">
                    {mind.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Detailed Scientific Profile (col-span-5) */}
        <section className="lg:col-span-5 flex flex-col h-full">
          <div className="premium-glass rounded-xl p-6 border border-border-glow flex flex-col justify-between min-h-[640px] sticky top-24">
            <div>
              {/* Profile header */}
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4 mb-6">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#a0a8b8]">
                    // Cognitive Profile
                  </span>
                  <h2 className="font-sans text-2xl font-bold uppercase tracking-wide text-white mt-1">
                    {selectedMind.name}
                  </h2>
                </div>
                <div
                  className="h-11 w-11 rounded-full border grid place-items-center"
                  style={{
                    borderColor: `${selectedMind.color}30`,
                    color: selectedMind.color,
                    background: `${selectedMind.color}0a`,
                  }}
                >
                  <selectedMind.icon size={22} />
                </div>
              </div>

              {/* Sections with dividers */}
              <div className="space-y-6">
                {/* 1. Core Identity */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-white mb-3">
                    CORE IDENTITY
                  </h4>
                  <div className="space-y-2.5 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5">
                      <span className="text-[#a0a8b8]">Substrate Layer</span>
                      <span className="text-white font-semibold text-right">
                        {selectedMind.substrate}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5 mt-2">
                      <span className="text-[#a0a8b8]">Decision Logic</span>
                      <span className="text-white font-semibold text-right">{selectedMind.logic}</span>
                    </div>
                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5 mt-2">
                      <span className="text-[#a0a8b8]">Processing Rate</span>
                      <span className="text-[#7b61ff] font-semibold">{selectedMind.speed}</span>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[rgba(255,255,255,0.08)]" />

                {/* 2. Cognitive Profile */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-white mb-3">
                    COGNITIVE PROFILE
                  </h4>
                  <div className="space-y-2.5 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5">
                      <span className="text-[#a0a8b8]">Reasoning Style</span>
                      <span className="text-white font-semibold">{selectedMind.reasoning}</span>
                    </div>
                    <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5 mt-2">
                      <span className="text-[#a0a8b8]">Communication</span>
                      <span className="text-white font-semibold">{selectedMind.communication}</span>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[rgba(255,255,255,0.08)]" />

                {/* 3. Capabilities & Limitations */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00f0ff] mb-3 flex items-center gap-1.5">
                      <Zap size={10} /> CAPABILITIES
                    </h4>
                    <ul className="space-y-2">
                      {selectedMind.strengths.map((str, i) => (
                        <li
                          key={i}
                          className="font-sans text-[11px] text-[#d0d5e0] leading-relaxed flex items-start gap-1.5"
                        >
                          <span className="text-[#00f0ff] font-extrabold">•</span> {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ffb800] mb-3 flex items-center gap-1.5">
                      <Info size={10} /> LIMITATIONS
                    </h4>
                    <ul className="space-y-2">
                      {selectedMind.weaknesses.map((wkn, i) => (
                        <li
                          key={i}
                          className="font-sans text-[11px] text-[#d0d5e0] leading-relaxed flex items-start gap-1.5"
                        >
                          <span className="text-[#ffb800] font-extrabold">•</span> {wkn}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="h-[1px] bg-[rgba(255,255,255,0.08)]" />

                {/* 4. Sample Neural Trace (Terminal block) */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-white mb-3">
                    SAMPLE NEURAL TRACE
                  </h4>
                  <div
                    className="p-4 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#050508] font-mono text-[11px] min-h-[85px] flex items-center"
                  >
                    {renderTrace(selectedMind.id, selectedMind.thoughtSample)}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Button at panel bottom */}
            <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.08)] flex flex-col items-center">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#a0a8b8] mb-3">
                Link your neural profile to initialize this architecture.
              </span>
              <button
                onClick={() => handleStartSim(selectedId)}
                className="neon-border-pulse group w-full flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer shadow-lg bg-[#00f0ff] text-black hover:scale-[1.01]"
              >
                Establish Consciousness Link
                <Play size={12} className="fill-current" />
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
