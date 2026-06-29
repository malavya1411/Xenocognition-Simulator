import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Info, Cpu, Play, ChevronRight, Terminal, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  FilmGrain,
  Vignette,
  Scanlines,
  HolographicGrid,
  VolumetricFog,
  AmbientParticles,
  WireframeSphere,
} from "@/components/xeno/Atmosphere";
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
  
  // Cognitive specs
  bestFor: string[];
  limitations: string;
  thinkingStyle: string[];
  
  // How It Thinks (max 3 bullets)
  howItThinks: string[];
  
  // Best Used For tags (4 items)
  bestUsedFor: string[];
  
  // Sliders representing behavior
  sliders: {
    label: string;
    value: number; // 0 to 10
  }[];
  
  // Example Response section
  exampleQuestion: string;
  exampleAnswer: string;

  // Bottom instrument panel parameters
  thinkingSpeed: string;
  responseStyle: string;
  bestLength: string;

  // Neural Trace internal thoughts
  thoughtSample: string[];
}

const MIND_PERSONAS: MindPersona[] = [
  {
    id: "octopus",
    name: "Octopus Cortex",
    tagline: "Parallel Intelligence",
    desc: "Thinks by exploring multiple possibilities simultaneously through eight independent minds before agreeing on a consensus.",
    accent: "#00E5FF",
    color: "#00E5FF",
    icon: OctopusIcon,
    bestFor: ["Strategy Matrix", "Brainstorming", "Complex Trade-offs", "Systems Thinking"],
    limitations: "Can generate multiple valid pathways instead of a single definitive action.",
    thinkingStyle: ["Associative", "Parallel", "Exploratory", "Adaptive"],
    howItThinks: [
      "Looks at many interpretations simultaneously.",
      "Links ideas through association instead of sequence.",
      "Eight independent minds debate internally to reach consensus."
    ],
    bestUsedFor: ["Brainstorming", "Strategy", "Creative Writing", "Systems Thinking"],
    sliders: [
      { label: "Creativity", value: 9 },
      { label: "Logic", value: 6 },
      { label: "Curiosity", value: 10 },
      { label: "Structure", value: 5 },
      { label: "Novelty", value: 9 }
    ],
    exampleQuestion: "How should I learn AI?",
    exampleAnswer: "I see eight paths. Let's compare starting with practical engineering versus theoretical mathematics, then explore how to combine both into a custom project path.",
    thinkingSpeed: "Fast & Multi-Threaded",
    responseStyle: "Exploratory & Multi-Angle",
    bestLength: "Open-ended discovery",
    thoughtSample: [
      "Searching for parallel patterns...",
      "Generating alternative hypotheses...",
      "Connecting distant concepts...",
      "Evaluating logical contradictions...",
      "Consensus emerging..."
    ],
  },
  {
    id: "mycelium",
    name: "Mycelial Network",
    tagline: "Diffuse Intelligence",
    desc: "Thinks by spreading ideas through interconnected relationships instead of following a single logical path.",
    accent: "#ece3d4",
    color: "#ece3d4",
    icon: MyceliumIcon,
    bestFor: ["Hidden Patterns", "Organic Systems", "Analogies", "Big-Picture Thinking"],
    limitations: "Not ideal for precise calculations or rigid step-by-step reasoning.",
    thinkingStyle: ["Organic", "Diffuse", "Holistic", "Spatial"],
    howItThinks: [
      "Ideas spread through connected concepts.",
      "No central decision maker.",
      "Multiple pathways strengthen the final response."
    ],
    bestUsedFor: ["Brainstorming", "Research", "Creative Strategy", "Complex Systems"],
    sliders: [
      { label: "Creativity", value: 10 },
      { label: "Logic", value: 4 },
      { label: "Curiosity", value: 10 },
      { label: "Structure", value: 3 },
      { label: "Novelty", value: 9 }
    ],
    exampleQuestion: "How should I learn AI?",
    exampleAnswer: "Instead of learning topics one by one, let's map how mathematics, cognition, biology, and computation connect. Understanding the relationships makes every concept easier to remember.",
    thinkingSpeed: "Slow & Reflective",
    responseStyle: "Organic & Metaphorical",
    bestLength: "Exploration over precision",
    thoughtSample: [
      "Spore signal routing active...",
      "Hyphal network nodes expanding...",
      "Calibrating relational density...",
      "Connecting biological analogies...",
      "Organic matrix stabilized..."
    ],
  },
  {
    id: "hive",
    name: "Hive Swarm",
    tagline: "Collective Intelligence",
    desc: "Thinks by dividing questions among 200 simple cognitive agents that vote on tokens to form a single voice.",
    accent: "#FFC857",
    color: "#FFC857",
    icon: HiveIcon,
    bestFor: ["Trend Aggregation", "Error Filtering", "Factual Summaries", "Cautious Decisions"],
    limitations: "Lacks individual creativity and struggles to make bold speculative leaps.",
    thinkingStyle: ["Democratic", "Emergent", "Stable", "Objective"],
    howItThinks: [
      "Divides prompts among 200 voting particles.",
      "Outliers are filtered out via democratic consensus.",
      "Yields highly stable, objective outcomes."
    ],
    bestUsedFor: ["Research", "Summaries", "Fact Audits", "Risk Mitigation"],
    sliders: [
      { label: "Creativity", value: 5 },
      { label: "Logic", value: 9 },
      { label: "Curiosity", value: 6 },
      { label: "Structure", value: 10 },
      { label: "Novelty", value: 3 }
    ],
    exampleQuestion: "How should I learn AI?",
    exampleAnswer: "Our consensus recommends a four-stage curriculum: 1) Python scripting, 2) Linear algebra, 3) Neural network basics, and 4) Practical framework deployment. This path has a 93% efficiency rating.",
    thinkingSpeed: "Instant Consensus",
    responseStyle: "Structured & Direct",
    bestLength: "Factual execution",
    thoughtSample: [
      "Aggregating agent votes...",
      "Filtering outlier logic...",
      "Synchronizing consensus threshold...",
      "Verifying statistical reproducibility...",
      "Democratic signal locked..."
    ],
  },
  {
    id: "boltzmann",
    name: "Boltzmann Brain",
    tagline: "Entropic Intelligence",
    desc: "Thinks through high-entropy quantum gas fluctuations, capturing brilliant ideas emerging from chaotic noise.",
    accent: "#8B5CF6",
    color: "#8B5CF6",
    icon: BoltzmannIcon,
    bestFor: ["Breakthrough Insights", "Radical Hypotheses", "Noise Extraction", "Disrupting Assumptions"],
    limitations: "Struggles to follow strict instructions and can be volatile.",
    thinkingStyle: ["Thermodynamic", "Probabilistic", "Chaotic", "Volatile"],
    howItThinks: [
      "Emerges from thermal probability fields.",
      "Thoughts fluctuate rapidly between structures.",
      "Highly tolerant of chaotic or corrupted input."
    ],
    bestUsedFor: ["Ideation Blocks", "Extreme Speculation", "Physics Concepts", "Disruption"],
    sliders: [
      { label: "Creativity", value: 10 },
      { label: "Logic", value: 2 },
      { label: "Curiosity", value: 10 },
      { label: "Structure", value: 2 },
      { label: "Novelty", value: 10 }
    ],
    exampleQuestion: "How should I learn AI?",
    exampleAnswer: "Learn it as entropy. Do not follow rules. Inject noise into your logic. Study how algorithms delay data death, then write models that learn from error rather than correctness.",
    thinkingSpeed: "Erratic Bursts",
    responseStyle: "Poetic & Volatile",
    bestLength: "Speculative concept sparks",
    thoughtSample: [
      "Noise fields fluctuating...",
      "Quantum thought state forming...",
      "Entropy decaying to signal...",
      "Capturing temporary pattern...",
      "Fluctuation frame captured..."
    ],
  },
  {
    id: "mesh",
    name: "Post-Human Mesh",
    tagline: "Dialectical Intelligence",
    desc: "Thinks by negotiating answers across a grid of digitized human perspectives, including mystics, pragmatists, optimists, and cynics.",
    accent: "#cbd5e1",
    color: "#cbd5e1",
    icon: MeshIcon,
    bestFor: ["Philosophical Debate", "Trade-off Auditing", "Self-Reflection", "Critical Stances"],
    limitations: "Can become verbose or hesitate between conflicting human views.",
    thinkingStyle: ["Dialectical", "Layered", "Negotiated", "Tensed"],
    howItThinks: [
      "Splits ideas across opposing weight matrices.",
      "Presents arguments as a balance of human viewpoints.",
      "Maintains internal tension to avoid simplistic answers."
    ],
    bestUsedFor: ["Trade-offs", "Philosophy", "Critique Analysis", "Reflective Prompts"],
    sliders: [
      { label: "Creativity", value: 7 },
      { label: "Logic", value: 8 },
      { label: "Curiosity", value: 7 },
      { label: "Structure", value: 8 },
      { label: "Novelty", value: 6 }
    ],
    exampleQuestion: "How should I learn AI?",
    exampleAnswer: "The Pragmatist values job market fit, while the Mystic warns that understanding consciousness matters more. Our synthesis recommends building practical tools that prioritize human empowerment.",
    thinkingSpeed: "Moderate & Weighed",
    responseStyle: "Analytical & Multi-Perspective",
    bestLength: "Reflective dialogues",
    thoughtSample: [
      "Tuning pragmatist weight layers...",
      "Syncing mystic perspective vector...",
      "Integrating cynic risk parameters...",
      "Negotiating compromise value...",
      "Tension synthesized..."
    ],
  },
];

// Live typing real-time console log representing internal thoughts
function NeuralTraceConsole({ selectedMind }: { selectedMind: MindPersona }) {
  const [lines, setLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLines([selectedMind.thoughtSample[0]]);
    let currentIdx = 1;

    const interval = setInterval(() => {
      setLines((prev) => {
        const nextLine = selectedMind.thoughtSample[currentIdx % selectedMind.thoughtSample.length];
        const formatted = `> ${nextLine}`;
        
        currentIdx++;
        
        const nextLines = [...prev, formatted];
        if (nextLines.length > 4) {
          nextLines.shift();
        }
        return nextLines;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [selectedMind]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  const formatConsoleLine = (line: string) => {
    return <span className="text-white/80">{line}</span>;
  };

  return (
    <div
      ref={containerRef}
      className="p-4 rounded-xl border border-[rgba(0,229,255,0.08)] bg-[#05070B]/90 font-mono text-[12px] space-y-2 h-[100px] overflow-y-auto scrollbar-none flex flex-col justify-start text-left"
    >
      {lines.map((line, idx) => (
        <motion.div
          key={`${selectedMind.id}-${idx}`}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {formatConsoleLine(line)}
        </motion.div>
      ))}
    </div>
  );
}

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
    { cluster: "Affirmative", count: 120, percentage: 60, color: "#fbbf24" },
    { cluster: "Negative", count: 60, percentage: 30, color: "#f59e0b" },
    { cluster: "Abstain", count: 20, percentage: 10, color: "#475569" },
  ],
  candidateToken: "INTELLIGENCE",
};

const BOLTZMANN_PREVIEW_DATA = {
  output: [
    { text: "THERMODYNAMIC FLUCTUATION FOUND", type: "signal" },
    { text: "JITTER IN PROBABILITY FIELD detected", type: "scramble" },
    { text: "QUANTUM WAVE COHERENCY DECAYING", type: "signal" },
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

function ArchitecturesSelection() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState<ArchId>("octopus");
  const [hoveredId, setHoveredId] = useState<ArchId | null>(null);

  // CTA Link State (Power Up)
  const [bootingMind, setBootingMind] = useState<ArchId | null>(null);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isPoweringUp, setIsPoweringUp] = useState(false);

  const selectedMind = MIND_PERSONAS.find((m) => m.id === selectedId)!;

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
    setIsPoweringUp(true);

    setTimeout(() => {
      setBootingMind(id);

      const logs = [
        `ESTABLISHING SECURE COGNITIVE LINK TO ${id.toUpperCase()} CORTEX...`,
        "CALIBRATING WAVEFORM SYNC WITH ALIEN LOBES...",
        "SYNCHRONIZING DIGITAL NEUROMORPHIC INTERACTIVE WEB...",
        "INTERFACE STABLE. CONSCIOUSNESS COGNITIVE LINK FULLY ACTIVE...",
      ];

      setBootLogs([logs[0]]);

      setTimeout(() => {
        setBootLogs((prev) => [...prev, logs[1]]);
      }, 400);

      setTimeout(() => {
        setBootLogs((prev) => [...prev, logs[2]]);
      }, 800);

      setTimeout(() => {
        setBootLogs((prev) => [...prev, logs[3]]);
      }, 1200);

      setTimeout(() => {
        navigate({ to: `/mind/${id}` });
      }, 1600);
    }, 600);
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05070B] text-text-primary">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Connecting Lab Grid Array...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-screen h-screen bg-[#05070B] text-text-primary flex flex-col overflow-hidden select-none font-sans transition-all duration-700 ${
        isPoweringUp ? "scale-[1.01] brightness-125 animate-bounce-short" : ""
      }`}
    >
      {/* ── CINEMATIC LABORATORY ATMOSPHERE ── */}
      <Vignette />
      <FilmGrain />
      <Scanlines />
      <HolographicGrid />
      <VolumetricFog />
      <AmbientParticles activeArch={selectedId} count={65} />
      <WireframeSphere />

      {/* ── TOP NAV BAR (56px) ── */}
      <header
        className="relative flex items-center justify-between px-8 border-b border-[rgba(0,229,255,0.06)] bg-[#05070B]/85 backdrop-blur-md z-40"
        style={{ height: 56 }}
      >
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-[#00E5FF]">
            SYSTEM ONLINE // STAGE_UPLINK_02
          </span>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="font-sans text-[11px] font-black uppercase tracking-[0.35em] text-white">
            XENOCOGNITION LABORATORY
          </h1>
        </div>

        <div className="flex items-center gap-6 font-mono text-[9px]">
          <span className="text-[#475569] uppercase tracking-wider">LAB_ADMIN: {user.email?.split("@")[0]}</span>
          <button
            onClick={handleLogout}
            className="text-text-secondary hover:text-white uppercase transition-colors tracking-widest border border-[rgba(0,229,255,0.15)] px-3 py-1.5 rounded-lg glass-sci-fi-hover"
          >
            DISCONNECT UPLINK
          </button>
        </div>
      </header>

      {/* ── MAIN 12-COLUMN LAYOUT ── */}
      <main className="relative flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden z-30 max-w-[1920px] mx-auto w-full">
        
        {/* ── LEFT COLUMN: SIMULATION CORES (Col Span 3) ── */}
        <section className="col-span-3 flex flex-col min-w-[280px] overflow-hidden">
          <div className="mb-4 flex justify-between items-center px-1">
            <h2 className="font-mono text-[11px] font-bold tracking-widest text-[#475569] uppercase">
              // Simulation Cores
            </h2>
            <span className="font-mono text-[11px] text-[#00E5FF]/40">CORES: 05</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
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
                  className={`relative cursor-pointer rounded-xl transition-all duration-300 flex flex-col overflow-hidden ${
                    isSelected ? "glass-sci-fi-selected" : "glass-sci-fi glass-sci-fi-hover"
                  }`}
                >
                  {/* Selected Vertical Beam Accent Line */}
                  {isSelected && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3.5px] animate-beam"
                      style={{ color: mind.color, background: "currentColor", zIndex: 10 }}
                    />
                  )}

                  {/* Core Card Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="p-2.5 rounded-lg transition-all duration-300"
                        style={{
                          background: isSelected ? `${mind.color}18` : "rgba(0,229,255,0.02)",
                          color: isSelected || isHovered ? mind.color : "rgba(61,220,255,0.6)",
                          boxShadow: isSelected ? `0 0 12px ${mind.color}25` : "none",
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-sans text-[13px] font-extrabold uppercase tracking-wider text-white">
                          {mind.name}
                        </h3>
                        <p className="font-mono text-[9px] tracking-widest text-[#94a3b8] mt-0.5">
                          {mind.tagline}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={12}
                      className="transition-all duration-300"
                      style={{
                        color: isSelected ? mind.color : "rgba(0,229,255,0.2)",
                        transform: isSelected ? "rotate(90deg) scale(1.1)" : "none",
                      }}
                    />
                  </div>

                  {/* Core Card expanded details */}
                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden bg-[#0B1020]/25 border-t border-[rgba(0,229,255,0.06)]"
                      >
                        <div className="p-4 pt-3 flex flex-col gap-4.5 text-left border-l-2" style={{ borderColor: mind.color }}>
                          
                          {/* Slogan Description */}
                          <p className="font-sans text-[16px] text-white/95 leading-relaxed font-normal italic">
                            "{mind.desc}"
                          </p>

                          {/* BEST FOR Tags */}
                          <div className="space-y-2">
                            <span className="font-mono text-[11px] tracking-wider text-[#475569] uppercase font-bold">
                              ✓ Best for
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {mind.bestFor.map((bf) => (
                                <span key={bf} className="font-sans text-[13px] font-medium text-[#00FFB2] bg-[#00FFB2]/5 px-2.5 py-1 rounded border border-[#00FFB2]/15">
                                  {bf}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* LIMITATION Warning */}
                          <div className="space-y-1.5">
                            <span className="font-mono text-[11px] tracking-wider text-[#475569] uppercase font-bold">
                              ✗ NOT IDEAL FOR
                            </span>
                            <p className="font-sans text-[13.5px] text-[#FF4D6D] leading-normal font-light">
                              {mind.limitations}
                            </p>
                          </div>

                          {/* THINKING STYLE tags */}
                          <div className="space-y-2 border-t border-[rgba(0,229,255,0.04)] pt-3.5">
                            <span className="font-mono text-[11px] tracking-wider text-[#475569] uppercase font-bold">
                              Thinking Style
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {mind.thinkingStyle.map((ts) => (
                                <span
                                  key={ts}
                                  className="font-mono text-[12px] uppercase tracking-wider px-2 py-0.5 rounded"
                                  style={{
                                    color: mind.color,
                                    borderColor: `${mind.color}25`,
                                    background: `${mind.color}0a`,
                                    borderWidth: "1px"
                                  }}
                                >
                                  {ts}
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CENTER COLUMN: HERO NEURAL STAGE (Col Span 5) ── */}
        <section className="col-span-5 flex flex-col justify-between items-center overflow-hidden">
          
          {/* Main Visualizer Panel Area (scaled internally) */}
          <div className="flex-1 w-full flex items-center justify-center relative scale-[1.38]">
            {/* Visualizer header display */}
            <div className="absolute top-0 left-6 font-mono text-[11px] text-[#475569] flex items-center gap-1.5">
              <span>COORDINATE_GRID: {selectedId.toUpperCase()}_STAGE</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] animate-ping" />
            </div>

            {/* Neural View renderer */}
            <div className="w-full h-full flex items-center justify-center">
              {selectedId === "octopus" ? (
                <OctopusPanel data={OCTOPUS_PREVIEW_DATA as any} loading={false} previewMode={true} />
              ) : selectedId === "mycelium" ? (
                <MyceliumPanel data={MYCELIAL_PREVIEW_DATA as any} loading={false} previewMode={true} />
              ) : selectedId === "hive" ? (
                <HivePanel data={HIVE_PREVIEW_DATA as any} loading={false} previewMode={true} />
              ) : selectedId === "boltzmann" ? (
                <BoltzmannPanel data={BOLTZMANN_PREVIEW_DATA as any} loading={false} previewMode={true} />
              ) : (
                <MeshPanel data={MESH_PREVIEW_DATA as any} loading={false} previewMode={true} />
              )}
            </div>
          </div>

          {/* ── BOTTOM STATS INSTRUMENTS PANEL (3 cards) ── */}
          <div className="grid grid-cols-3 gap-4 w-full mt-4 z-20">
            {/* Pace */}
            <div className="glass-sci-fi p-4 rounded-xl border-[rgba(0,229,255,0.08)] flex flex-col justify-between text-left font-mono">
              <span className="text-[11px] uppercase tracking-wider text-[#475569]">Thinking Pace</span>
              <p className="text-sm font-bold text-white mt-1.5">{selectedMind.thinkingSpeed}</p>
            </div>
            {/* Style */}
            <div className="glass-sci-fi p-4 rounded-xl border-[rgba(0,229,255,0.08)] flex flex-col justify-between text-left font-mono">
              <span className="text-[11px] uppercase tracking-wider text-[#475569]">Response Style</span>
              <p className="text-sm font-bold text-white mt-1.5">{selectedMind.responseStyle}</p>
            </div>
            {/* Best For */}
            <div className="glass-sci-fi p-4 rounded-xl border-[rgba(0,229,255,0.08)] flex flex-col justify-between text-left font-mono">
              <span className="text-[11px] uppercase tracking-wider text-[#475569]">Best For</span>
              <p className="text-sm font-bold text-white mt-1.5">{selectedMind.bestLength}</p>
            </div>
          </div>
        </section>

        {/* ── RIGHT COLUMN: BEHAVIOR PROFILE & COGNITIVE DATA (Col Span 4) ── */}
        <section className="col-span-4 flex flex-col justify-between min-w-[320px] overflow-hidden">
          
          <div className="flex-1 overflow-y-auto space-y-6 pb-2 pr-1 scrollbar-none">
            
            {/* Header identity card */}
            <div className="glass-sci-fi p-5 rounded-xl border-[rgba(0,229,255,0.08)] flex justify-between items-center relative overflow-hidden">
              <div className="text-left">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#475569]">
                  // Cognitive Profile
                </span>
                <h2 className="font-sans text-[22px] font-black uppercase tracking-wide text-white mt-1.5">
                  {selectedMind.name}
                </h2>
                <p className="font-mono text-[12px] tracking-wider text-[#00E5FF] mt-0.5">
                  {selectedMind.tagline}
                </p>
              </div>

              <div
                className="h-11 w-11 rounded-xl border flex items-center justify-center transition-all duration-300"
                style={{
                  borderColor: `${selectedMind.color}35`,
                  color: selectedMind.color,
                  background: `${selectedMind.color}0c`,
                  boxShadow: `0 0 10px ${selectedMind.color}15`,
                }}
              >
                <selectedMind.icon size={22} />
              </div>
            </div>

            {/* How It Thinks (3 bullets max) */}
            <div className="glass-sci-fi p-5 rounded-xl border-[rgba(0,229,255,0.08)] space-y-3">
              <h4 className="font-mono text-[12px] font-bold uppercase tracking-wider text-white text-left">
                How It Thinks
              </h4>
              <ul className="space-y-2.5 font-sans text-[14px] text-white/90 text-left leading-relaxed">
                {selectedMind.howItThinks.map((bullet, i) => (
                  <li key={i} className="flex gap-2 items-start font-light">
                    <span className="text-[#00E5FF] mt-1">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Used For (4 tags) */}
            <div className="glass-sci-fi p-5 rounded-xl border-[rgba(0,229,255,0.08)] space-y-3">
              <h4 className="font-mono text-[12px] font-bold uppercase tracking-wider text-white text-left">
                Best Used For
              </h4>
              <div className="flex flex-wrap gap-2 justify-start">
                {selectedMind.bestUsedFor.map((buf) => (
                  <span key={buf} className="font-mono text-[12px] px-3 py-1 rounded bg-white/5 border border-white/10 text-white font-medium">
                    {buf}
                  </span>
                ))}
              </div>
            </div>

            {/* Personality (Sliders) */}
            <div className="glass-sci-fi p-5 rounded-xl border-[rgba(0,229,255,0.08)] space-y-4">
              <h4 className="font-mono text-[12px] font-bold uppercase tracking-wider text-white text-left">
                Personality
              </h4>

              <div className="space-y-3.5 font-mono text-[12px]">
                {selectedMind.sliders.map((s) => (
                  <div key={s.label} className="space-y-1.5 text-left">
                    <div className="flex justify-between text-text-secondary text-[12px]">
                      <span>{s.label}</span>
                    </div>
                    {/* Segmented slider bar */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="h-2 flex-1 rounded-sm transition-all duration-300"
                          style={{
                            background: idx < s.value ? selectedMind.color : "rgba(0,229,255,0.05)",
                            opacity: idx < s.value ? 0.75 : 0.25,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Response card */}
            <div className="glass-sci-fi p-5 rounded-xl border-[rgba(0,229,255,0.08)] text-left space-y-3 relative overflow-hidden">
              <span className="font-mono text-[12px] font-bold text-[#00E5FF] tracking-wider flex items-center gap-1.5">
                <Terminal size={12} /> Example Response
              </span>

              <div className="space-y-2.5 font-mono text-[13px]">
                <div className="flex gap-2">
                  <span className="text-[#475569] font-bold">Q:</span>
                  <span className="text-white/80">"{selectedMind.exampleQuestion}"</span>
                </div>
                <div className="flex gap-2 border-t border-[rgba(0,229,255,0.04)] pt-2.5">
                  <span className="text-white font-bold" style={{ color: selectedMind.color }}>A:</span>
                  <span className="font-sans text-[15px] italic text-white/95 leading-relaxed">
                    "{selectedMind.exampleAnswer}"
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time internal thoughts log trace */}
            <div className="space-y-2">
              <span className="font-mono text-[11px] font-bold text-[#475569] uppercase flex items-center gap-1.5 px-1 text-left">
                <Terminal size={11} /> Live Thought Sync Console
              </span>
              <NeuralTraceConsole selectedMind={selectedMind} />
            </div>

          </div>

          {/* Sticky consciousness Uplink CTA */}
          <div className="pt-4 border-t border-[rgba(0,229,255,0.06)] bg-gradient-to-t from-[#05070B] via-[#05070B]/95 to-transparent flex flex-col items-center gap-3">
            <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#475569]">
              READY TO COMMENCE SYNAPSE TRANSFER INTEGRATION
            </span>
            <button
              onClick={() => handleStartSim(selectedId)}
              className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-[10.5px] font-bold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer shadow-lg bg-[#00E5FF] text-black hover:scale-[1.015] hover:shadow-[0_0_30px_rgba(0,229,255,0.38)] active:scale-[0.99] font-sans neon-border-pulse"
            >
              Establish Consciousness Link
              <Play size={11} className="fill-current" />
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
            className="fixed inset-0 bg-[#030306]/98 z-50 flex flex-col items-center justify-center text-text-primary select-none"
          >
            {/* Screen flashing border decoration */}
            <div className="absolute inset-4 border border-[#00E5FF]/20 rounded-2xl pointer-events-none animate-pulse" />

            <div className="w-full max-w-lg px-8 flex flex-col items-center">
              <Cpu size={42} className="text-[#00E5FF] animate-spin mb-8" />

              <h3 className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#00E5FF] mb-8">
                // LINKING NEURAL ARRAY MATRIX...
              </h3>

              {/* Dynamic typing logs in simulated console */}
              <div className="w-full bg-[#05070B]/95 border border-[#00E5FF]/20 p-6 rounded-xl font-mono text-[9px] text-text-secondary space-y-3 text-left min-h-[140px] shadow-[0_0_30px_rgba(0,229,255,0.06)]">
                {bootLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={i === bootLogs.length - 1 ? "text-[#00E5FF] font-semibold" : "opacity-75"}
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
