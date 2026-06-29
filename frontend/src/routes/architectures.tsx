import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, ArrowRight, Zap, Info, Cpu, Play, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FilmGrain, Vignette } from "@/components/xeno/Atmosphere";
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

  // Accordion details toggle states
  const [synthesisExpanded, setSynthesisExpanded] = useState(false);

  // Entering transition overlay state
  const [bootingMind, setBootingMind] = useState<ArchId | null>(null);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Config mapping for panel visualizer scaling
  const PANEL_HEIGHTS: Record<ArchId, number> = {
    octopus: 340,
    mycelium: 320,
    hive: 200,
    boltzmann: 220,
    mesh: 220,
  };

  const PANEL_WIDTHS: Record<ArchId, number> = {
    octopus: 360,
    mycelium: 480,
    hive: 360,
    boltzmann: 360,
    mesh: 360,
  };

  // High-fidelity static preview data for radial visualization stages
  const OCTOPUS_PREVIEW_DATA = {
    centralNode: { response: "Debating consensus vectors...", confidence: 0.82 },
    consensus: "Tuning lobe frequencies...",
    armNodes: Array.from({ length: 8 }, (_, i) => ({
      id: i,
      bias: ["defensive", "curious", "sensual", "predatory", "playful", "skeptical", "memory", "color-drunk"][i],
      response: "Active telemetry sensor listening..."
    }))
  };

  const MYCELIAL_PREVIEW_DATA = {
    nodes: [
      { id: "root", label: "Root", size: 10, depth: 0 },
      { id: "a", label: "SPORE A", size: 8, depth: 1 },
      { id: "b", label: "SPORE B", size: 8, depth: 1 },
      { id: "c", label: "SPORE C", size: 8, depth: 1 },
      { id: "d", label: "HYPHA 1", size: 6, depth: 2 },
      { id: "e", label: "HYPHA 2", size: 6, depth: 2 },
    ],
    edges: [
      { source: "root", target: "a", strength: 0.8 },
      { source: "root", target: "b", strength: 0.6 },
      { source: "root", target: "c", strength: 0.7 },
      { source: "a", target: "d", strength: 0.5 },
      { source: "b", target: "e", strength: 0.4 },
    ],
    growthLog: ["Spore routing active", "Gradient stabilized"],
  };

  const HIVE_PREVIEW_DATA = {
    votes: [
      { cluster: "Affirmative", count: 120, color: "#fbbf24" },
      { cluster: "Negative", count: 60, color: "#f59e0b" },
      { cluster: "Abstain", count: 20, color: "#475569" },
    ],
    candidateToken: "INTELLIGENCE",
  };

  const BOLTZMANN_PREVIEW_DATA = {
    output: [
      { segment: "THERMODYNAMIC", energy: 0.8, entropy: 0.4, stable: true },
      { segment: "JITTER", energy: 0.6, entropy: 0.8, stable: false },
      { segment: "QUANTUM", energy: 0.9, entropy: 0.2, stable: true },
    ],
    signalRatio: 0.72,
  };

  const MESH_PREVIEW_DATA = {
    tensionScore: 0.42,
    averageAnswer: "Synthesizing consensus across post-human mesh layers...",
    perspectives: [
      { voice: "Mystic", weight: 0.35, text: "Simulation parameters evolving." },
      { voice: "Pragmatist", weight: 0.45, text: "Systems online and verified." },
      { voice: "Optimist", weight: 0.20, text: "Interface stable." },
    ],
  };

  const renderActiveVisualizer = (id: ArchId) => {
    switch (id) {
      case "octopus":
        return <OctopusPanel data={OCTOPUS_PREVIEW_DATA as any} loading={false} previewMode={true} />;
      case "mycelium":
        return <MyceliumPanel data={MYCELIAL_PREVIEW_DATA as any} loading={false} previewMode={true} />;
      case "hive":
        return <HivePanel data={HIVE_PREVIEW_DATA as any} loading={false} previewMode={true} />;
      case "boltzmann":
        return <BoltzmannPanel data={BOLTZMANN_PREVIEW_DATA as any} loading={false} previewMode={true} />;
      case "mesh":
        return <MeshPanel data={MESH_PREVIEW_DATA as any} loading={false} previewMode={true} />;
    }
  };

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
      className="relative w-screen h-screen bg-[#0a0a0f] text-text-primary flex flex-col overflow-hidden select-none"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }}
    >
      <Vignette />
      <FilmGrain />

      {/* ── Top Bar (48px height) ── */}
      <header
        className="relative flex items-center justify-between px-6 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]"
        style={{ height: 48, zIndex: 40 }}
      >
        {/* Left segment */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-[#00f0ff]">
            // STEP 02 : CHOOSE ALIEN MIND SIMULATOR
          </span>
        </div>

        {/* Center segment */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="font-sans text-[12px] font-bold uppercase tracking-[0.25em] text-white">
            Xenocognition Laboratory
          </span>
        </div>

        {/* Right segment */}
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <div className="flex items-center gap-1.5 text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
            SYSTEM ONLINE
          </div>
          <button
            onClick={handleLogout}
            className="text-[#a0a8b8] hover:text-white uppercase transition-colors tracking-wider"
          >
            DISCONNECT UPLINK
          </button>
        </div>
      </header>

      {/* ── Main Three-Zone Dashboard Layout (Remainder of Screen, non-scrolling) ── */}
      <main className="relative flex-1 flex overflow-hidden w-full max-w-[1920px] mx-auto z-30">
        
        {/* ── ZONE A (Left Panel, 25% width) ── */}
        <section
          className="w-1/4 h-full flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#0a0a0f] overflow-y-auto"
          style={{ minWidth: 280 }}
        >
          <div className="p-5 border-b border-[rgba(255,255,255,0.04)]">
            <h2 className="font-sans text-[11px] font-bold tracking-widest text-[#a0a8b8] uppercase">
              Simulation Cores
            </h2>
          </div>

          <div className="flex-1 flex flex-col">
            {MIND_PERSONAS.map((mind) => {
              const Icon = mind.icon;
              const isSelected = selectedId === mind.id;
              const isHovered = hoveredId === mind.id;

              return (
                <div
                  key={mind.id}
                  onClick={() => setSelectedId(mind.id)}
                  onMouseEnter={() => setHoveredId(mind.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="relative cursor-pointer transition-all duration-300 border-b border-[rgba(255,255,255,0.04)] flex flex-col overflow-hidden"
                  style={{
                    background: isSelected ? "rgba(255,255,255,0.03)" : isHovered ? "rgba(255,255,255,0.01)" : "#0a0a0f",
                  }}
                >
                  {/* Selected Indicator Accent Bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00f0ff]" style={{ zIndex: 10 }} />
                  )}

                  {/* Accordion Header State */}
                  <div className="h-[64px] flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-1.5 rounded transition-colors"
                        style={{
                          background: isSelected ? `${mind.color}15` : "rgba(255,255,255,0.02)",
                          color: isSelected || isHovered ? mind.color : "#a0a8b8",
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-sans text-[13px] font-bold uppercase tracking-wide text-white">
                          {mind.name}
                        </h3>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-[#a0a8b8]">
                          {mind.tagline.slice(0, 24)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={12}
                      className="text-[#00f0ff] transition-transform duration-300"
                      style={{
                        transform: isSelected ? "rotate(90deg)" : "none",
                      }}
                    />
                  </div>

                  {/* Accordion Expanded Body Panel */}
                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden bg-[#0c0c14]/40"
                      >
                        <div className="px-5 pb-5 pt-1 text-left flex flex-col gap-3">
                          {/* Expanded status tag */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[8px] tracking-widest text-text-ghost">
                              // COGNITIVE CELL
                            </span>
                            <span
                              className="font-mono text-[8px] tracking-wider rounded border px-1.5 py-0.5"
                              style={{
                                color: mind.color,
                                borderColor: `${mind.color}30`,
                                background: `${mind.color}0a`,
                              }}
                            >
                              ONLINE
                            </span>
                          </div>
                          
                          {/* Full description text */}
                          <p className="font-sans text-[12px] text-[#d0d5e0] leading-relaxed font-normal">
                            {mind.desc}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── ZONE B (Center Panel, Live Preview Stage, 45% width) ── */}
        <section className="w-2/5 h-full flex flex-col items-center justify-center border-r border-[rgba(255,255,255,0.06)] bg-[#050508] relative">
          
          {/* Subtle static grid underlay mapping coordinates */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Centered stage for the actual panel visualizer */}
          <div 
            className="relative overflow-visible flex items-center justify-center transition-all duration-300 transform scale-[1.35] z-20 pointer-events-auto"
            style={{ 
              width: PANEL_WIDTHS[selectedMind.id], 
              height: PANEL_HEIGHTS[selectedMind.id] 
            }}
          >
            {renderActiveVisualizer(selectedMind.id)}

            {/* Inner radar details */}
            <div className="absolute top-4 left-4 font-mono text-[8px] text-text-ghost z-20 pointer-events-none">
              GRID: {selectedMind.id.toUpperCase()}_STAGE
            </div>
            <div className="absolute bottom-4 right-4 font-mono text-[8px] text-[#00f0ff] animate-pulse z-20 pointer-events-none">
              NEURAL FLOW ACTIVE
            </div>
          </div>
        </section>

        {/* ── ZONE C (Right Panel, Cognitive Profile & Synthesis Panel, 30% width) ── */}
        <section
          className="w-7/20 h-full flex flex-col justify-between bg-[#0a0a0f] relative"
          style={{ minWidth: 320 }}
        >
          {/* Scrollable details container */}
          <div className="flex-1 overflow-y-auto px-6 py-6 pb-36 space-y-6">
            
            {/* Section 1: Header info */}
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
              <div>
                <span className="font-mono text-[8px] uppercase tracking-widest text-[#a0a8b8]">
                  // Cognitive Profile
                </span>
                <h2 className="font-sans text-2xl font-bold uppercase tracking-wide text-white mt-1">
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

            {/* Section 2: Core Identity Metadata Grid */}
            <div className="space-y-3">
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-white mb-2">
                Core Identity
              </h4>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5">
                  <span className="text-[#8a8f98]">Substrate Layer</span>
                  <span className="text-[#f0f0f5] text-right font-semibold">{selectedMind.substrate}</span>
                </div>
                <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5">
                  <span className="text-[#8a8f98]">Decision Logic</span>
                  <span className="text-[#f0f0f5] text-right font-semibold">{selectedMind.logic}</span>
                </div>
                <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5">
                  <span className="text-[#8a8f98]">Processing Rate</span>
                  <span className="text-[#7b61ff] font-semibold">{selectedMind.speed}</span>
                </div>
                <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5">
                  <span className="text-[#8a8f98]">Reasoning Style</span>
                  <span className="text-[#f0f0f5] font-semibold">{selectedMind.reasoning}</span>
                </div>
                <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-1.5">
                  <span className="text-[#8a8f98]">Communication</span>
                  <span className="text-[#f0f0f5] font-semibold">{selectedMind.communication}</span>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-[rgba(255,255,255,0.08)]" />

            {/* Section 3: Capabilities & Limitations Column Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#00f0ff] mb-2 flex items-center gap-1.5">
                  <Zap size={10} /> CAPABILITIES
                </h4>
                <ul className="space-y-1.5">
                  {selectedMind.strengths.map((str, i) => (
                    <li
                      key={i}
                      className="font-sans text-[11px] text-[#d0d5e0] leading-relaxed flex items-start gap-1"
                    >
                      <span className="text-[#00f0ff] font-extrabold">•</span> {str}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ffb800] mb-2 flex items-center gap-1.5">
                  <Info size={10} /> LIMITATIONS
                </h4>
                <ul className="space-y-1.5">
                  {selectedMind.weaknesses.map((wkn, i) => (
                    <li
                      key={i}
                      className="font-sans text-[11px] text-[#d0d5e0] leading-relaxed flex items-start gap-1"
                    >
                      <span className="text-[#ffb800] font-extrabold">•</span> {wkn}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="h-[1px] bg-[rgba(255,255,255,0.08)]" />

            {/* Section 4: Sample Neural Trace Console Terminal */}
            <div>
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-white mb-2">
                Sample Neural Trace
              </h4>
              <div
                className="p-3.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#050508] font-mono text-[11px] min-h-[75px] flex items-center"
              >
                {renderTrace(selectedMind.id, selectedMind.thoughtSample)}
              </div>
            </div>

            <div className="h-[1px] bg-[rgba(255,255,255,0.08)]" />

            {/* Section 5: Central Node Synthesis (Collapsible Toggle) */}
            <div>
              <button
                onClick={() => setSynthesisExpanded(!synthesisExpanded)}
                className="flex items-center justify-between w-full font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:text-[#00f0ff] transition-colors"
              >
                <span>Central Node Synthesis</span>
                <span className="text-[#00f0ff] text-[9px]">
                  {synthesisExpanded ? "COLLAPSE [-]" : "EXPAND [+]"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {synthesisExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="font-sans text-[12.5px] text-[#d0d5e0] leading-relaxed font-light mt-3">
                      This simulated architecture represents our ongoing investigation into non-human cognition models. By establishing a direct link, you authorize our quantum array logic to map incoming context vectors across their respective distributed network lattices.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Section 6: Sticky Primary CTA (Fixed Bottom) */}
          <div
            className="absolute bottom-0 left-0 right-0 p-6 bg-[#0a0a0f] border-t border-[rgba(255,255,255,0.06)] flex flex-col items-center"
            style={{
              zIndex: 35,
              background: "linear-gradient(transparent, #0a0a0f 25%)",
            }}
          >
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#a0a8b8] mb-3">
              Requires Google Neural Uplink to initialize.
            </span>
            <button
              onClick={() => handleStartSim(selectedId)}
              className="neon-border-pulse group w-full flex items-center justify-center gap-2 rounded-full py-4 text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer shadow-lg bg-[#00f0ff] text-black hover:scale-[1.01]"
            >
              Establish Consciousness Link
              <Play size={12} className="fill-current" />
            </button>
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
