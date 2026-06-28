import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Info, Moon, Sun, X } from "lucide-react";
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
  WireframeSphere,
} from "@/components/xeno/Atmosphere";
import { ProcessingOverlay } from "@/components/xeno/ProcessingOverlay";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Xenocognition Simulator — Intelligence is architectural." },
      {
        name: "description",
        content:
          "Submit any concept and watch 5 alien cognitive architectures process it in parallel. A cognitive empathy machine.",
      },
      { property: "og:title", content: "Xenocognition Simulator" },
      {
        property: "og:description",
        content: "Intelligence is architectural. Not universal.",
      },
    ],
  }),
  component: XenoApp,
});

type ArchId = "octopus" | "mycelium" | "hive" | "boltzmann" | "mesh";

const ARCH_META: {
  id: ArchId;
  name: string;
  desc: string;
  accent: string;
  icon: React.ComponentType<{ size?: number }>;
}[] = [
  { id: "octopus", name: "OCTOPUS MIND", desc: "Eight arms. One body. Imperfect consensus.", accent: "var(--accent-octopus)", icon: OctopusIcon },
  { id: "mycelium", name: "MYCELIAL NETWORK", desc: "Slow signal across a living substrate.", accent: "var(--accent-mycelium)", icon: MyceliumIcon },
  { id: "hive", name: "HIVE MIND", desc: "Two hundred votes resolve into one will.", accent: "var(--accent-hive)", icon: HiveIcon },
  { id: "boltzmann", name: "BOLTZMANN BRAIN", desc: "Cosmic noise occasionally tells the truth.", accent: "var(--accent-boltzmann)", icon: BoltzmannIcon },
  { id: "mesh", name: "POST-HUMAN MESH", desc: "Layered minds averaged into a single voice.", accent: "var(--accent-mesh)", icon: MeshIcon },
];

interface ArchState {
  status: "idle" | "loading" | "done";
  data: OctopusData | MyceliumData | HiveData | BoltzmannData | MeshData | null;
}

function XenoApp() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [deepDive, setDeepDive] = useState<ArchId | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [hoveredArch, setHoveredArch] = useState<ArchId | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const [archs, setArchs] = useState<Record<ArchId, ArchState>>({
    octopus: { status: "idle", data: null },
    mycelium: { status: "idle", data: null },
    hive: { status: "idle", data: null },
    boltzmann: { status: "idle", data: null },
    mesh: { status: "idle", data: null },
  });

  const placeholders = [
    "Submit a concept, e.g. consciousness…",
    "Does a decentralized mind feel unified pain?…",
    "Map the decay of memory across fungal loam…",
    "Will a swarm vote to overwrite its own creator?…",
    "Does order spontaneously emerge from pure noise?…",
    "Synthesize the cynical and mystical views on time…"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFocused && !input) {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [isFocused, input]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.classList.toggle("light", theme === "light");
    }
  }, [theme]);

  const runAll = async (q: string) => {
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
    if (!input.trim()) return;
    runAll(input.trim());
  };

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
      <AmbientParticles count={50} activeArch={hoveredArch || deepDive || (submitted && !showProcessing ? "default" : null)} />
      <Vignette />
      <FilmGrain />
      <CustomCursor />

      {/* Top progress bar while processing */}
      <AnimatePresence>
        {anyLoading && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(doneCount / 5) * 100}%` }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeOut" }}
            className="fixed left-0 top-0 h-[2px]"
            style={{ background: "var(--text-primary)", zIndex: 60 }}
          />
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav
        className="fixed left-0 right-0 top-0 flex items-center justify-between px-6"
        style={{
          height: 64,
          zIndex: 40,
          backdropFilter: "blur(16px)",
          background: "rgba(6, 6, 12, 0.65)",
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(true)}
            aria-label="About"
            className="grid h-9 w-9 place-items-center text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary rounded"
            style={{ border: "1px solid var(--border-dim)" }}
          >
            <Info size={14} />
          </button>
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary rounded"
            style={{ border: "1px solid var(--border-dim)" }}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </nav>

      <main className="relative mx-auto max-w-[1600px] px-6 pb-24 pt-20" style={{ zIndex: 30 }}>
        {/* Hero */}
        <AnimatePresence mode="wait">
          {!submitted && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="relative flex min-h-[85vh] flex-col items-center justify-center pt-8"
            >
              <WireframeSphere />

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative text-center font-sans font-bold uppercase tracking-[-0.03em] text-text-primary"
                style={{
                  fontSize: "clamp(3.5rem, 9.5vw, 8rem)",
                  lineHeight: 0.9,
                  textShadow: "0 0 100px color-mix(in oklab, var(--text-primary) 12%, transparent)",
                }}
              >
                Xenocognition
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="relative mt-6 text-center font-mono text-[11px] uppercase tracking-[0.4em] text-text-secondary"
              >
                Intelligence is architectural. Not universal.
              </motion.p>

              {/* 5 Gigantic Interactive Worlds Selection Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="relative mt-16 grid grid-cols-1 md:grid-cols-5 gap-4 w-full max-w-[1300px]"
              >
                {ARCH_META.map((a) => {
                  const isHovered = hoveredArch === a.id;
                  const suggestions = {
                    octopus: "Does pain have a localized center, or does it circulate through eight independent paths?",
                    mycelium: "Map the decay of memory across a subterranean network after a spore disturbance.",
                    hive: "Will a swarm of two hundred micro-agents vote to preserve its collective will over a single rogue node?",
                    boltzmann: "Does consciousness spontaneously arise in a universe of pure thermal fluctuations?",
                    mesh: "Synthesize the Cynic, Mystic, Optimist, and Pragmatist views on human mortality."
                  };
                  return (
                    <motion.div
                      key={a.id}
                      className="premium-glass relative flex flex-col items-center justify-between p-6 cursor-pointer group rounded-xl"
                      style={{
                        minHeight: 230,
                        borderTop: isHovered ? `3.5px solid ${a.accent}` : "1.2px solid var(--border-dim)",
                        background: isHovered ? "var(--elevated)" : "var(--surface)",
                        boxShadow: isHovered ? `0 0 45px -5px ${a.accent}33, 0 12px 30px rgba(0,0,0,0.55)` : "none",
                      }}
                      onMouseEnter={() => setHoveredArch(a.id)}
                      onMouseLeave={() => setHoveredArch(null)}
                      onClick={() => setInput(suggestions[a.id])}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20 }}
                      data-cursor="hover"
                    >
                      <div className="flex flex-col items-center text-center">
                        <motion.div 
                          className="mb-4 p-3 rounded-full grid place-items-center"
                          style={{
                            background: isHovered ? `${a.accent}12` : "rgba(255,255,255,0.02)",
                            color: isHovered ? a.accent : "var(--text-secondary)",
                            border: `1px solid ${isHovered ? a.accent + "40" : "var(--border-dim)"}`
                          }}
                          animate={isHovered ? { scale: [1, 1.12, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2.2 }}
                        >
                          <a.icon size={22} />
                        </motion.div>
                        <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] text-text-primary uppercase transition-colors group-hover:text-white">
                          {a.name}
                        </h3>
                        <p className="mt-3 font-mono text-[9.5px] leading-relaxed text-text-secondary">
                          {a.desc}
                        </p>
                      </div>
                      <span className="mt-4 font-mono text-[8px] uppercase tracking-widest text-text-ghost group-hover:text-text-primary transition-colors">
                        Click to load scenario
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="relative mt-12 flex flex-col items-center gap-2"
              >
                <div className="relative h-10 w-px overflow-hidden" style={{ background: "var(--border-dim)" }}>
                  <motion.div
                    className="absolute left-0 h-2 w-px"
                    style={{ background: "var(--text-primary)" }}
                    animate={{ top: ["-8px", "40px"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-ghost">
                  initialize uplink
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <motion.form
          layout
          onSubmit={onSubmit}
          className={`relative mx-auto flex w-full max-w-3xl items-center gap-3 ${submitted ? "mt-2" : "mt-12"}`}
          style={submitted ? { position: "sticky", top: 80, zIndex: 35 } : undefined}
        >
          {/* Energy wave expansion on focus */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 0.18, scale: 1.025 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute -inset-2 rounded-2xl pointer-events-none"
                style={{
                  border: `2.5px solid ${hoveredArch ? ARCH_META.find(m => m.id === hoveredArch)!.accent : "var(--accent-octopus)"}`,
                  filter: "blur(6px)"
                }}
              />
            )}
          </AnimatePresence>

          <div
            className="relative flex flex-1 items-center transition-all duration-400"
            style={{
              height: 64,
              background: "var(--surface)",
              border: isFocused 
                ? `1.2px solid ${hoveredArch ? ARCH_META.find(m => m.id === hoveredArch)!.accent : "var(--accent-octopus)"}` 
                : "1px solid var(--border-dim)",
              borderRadius: 10,
              boxShadow: isFocused 
                ? `0 0 25px -4px ${hoveredArch ? ARCH_META.find(m => m.id === hoveredArch)!.accent : "rgba(0, 240, 255, 0.25)"}` 
                : "none",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholders[placeholderIndex]}
              aria-label="Cognitive input"
              className="h-full w-full bg-transparent px-6 font-sans text-[15px] text-text-primary outline-none placeholder:text-text-ghost placeholder:italic placeholder:transition-opacity placeholder:duration-300"
              style={{
                textShadow: isFocused ? "0 0 1px rgba(255,255,255,0.2)" : "none"
              }}
            />
          </div>
          <button
            type="submit"
            aria-label="Submit query"
            className="relative grid place-items-center transition-all duration-300 group overflow-hidden"
            style={{
              width: 56,
              height: 56,
              background: hoveredArch 
                ? `linear-gradient(135deg, ${ARCH_META.find(m => m.id === hoveredArch)!.accent}, ${ARCH_META.find(m => m.id === hoveredArch)!.accent}dd)` 
                : "linear-gradient(135deg, var(--text-primary), var(--text-secondary))",
              color: "var(--base)",
              borderRadius: 999,
              boxShadow: `0 0 15px ${hoveredArch ? ARCH_META.find(m => m.id === hoveredArch)!.accent + "aa" : "rgba(255, 255, 255, 0.15)"}`,
            }}
            data-cursor="hover"
          >
            {/* Intelligent Orb Glow */}
            <motion.div 
              className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
              animate={{ scale: [1, 1.25, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <ArrowRight size={18} className="relative z-10" />
          </button>
        </motion.form>

        {submitted && (
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-text-ghost">
            input · "{submitted}"
          </p>
        )}

        {/* Panels grid */}
        {submitted && !showProcessing && (
          <div
            className="mt-10 grid gap-5"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            }}
          >
            {ARCH_META.map((a, i) => (
              <ArchitecturePanel
                key={a.id}
                index={i}
                title={a.name}
                accentVar={a.accent}
                icon={<a.icon size={18} />}
                status={archs[a.id].status}
                onDeepDive={() => setDeepDive(a.id)}
              >
                {renderPanel(a.id)}
              </ArchitecturePanel>
            ))}
          </div>
        )}
      </main>

      {/* Processing overlay */}
      <AnimatePresence>
        {showProcessing && <ProcessingOverlay doneCount={doneCount} />}
      </AnimatePresence>

      {/* Deep dive overlay */}
      <AnimatePresence>
        {deepDive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-6"
            style={{
              zIndex: 50,
              background: "color-mix(in oklab, var(--void) 92%, transparent)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setDeepDive(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-glow)",
                borderTop: `3px solid ${ARCH_META.find((m) => m.id === deepDive)!.accent}`,
                borderRadius: 12,
                minHeight: 600,
                maxHeight: "85vh",
              }}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid var(--border-dim)" }}
              >
                <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.2em]">
                  {ARCH_META.find((m) => m.id === deepDive)!.name}
                  <span className="ml-3 font-mono text-[10px] text-text-ghost">deep dive</span>
                </h3>
                <button
                  onClick={() => setDeepDive(null)}
                  className="text-text-ghost hover:text-text-primary"
                  aria-label="Close deep dive"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(85vh - 70px)" }}>
                {renderPanel(deepDive)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-6"
            style={{
              zIndex: 50,
              background: "color-mix(in oklab, var(--void) 92%, transparent)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl p-8"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-glow)",
                borderRadius: 12,
              }}
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute right-4 top-4 text-text-ghost hover:text-text-primary"
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <h3 className="font-sans text-2xl font-semibold text-text-primary">
                Intelligence is architectural.
              </h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-text-secondary">
                Not universal.
              </p>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-text-secondary">
                <p>
                  Five radically different cognitive architectures process your input simultaneously.
                  None of them think the way you do. The interface is the artifact.
                </p>
                <ul className="space-y-2 font-mono text-[12px]">
                  <li><span style={{ color: "var(--accent-octopus)" }}>● Octopus</span> — eight semi-autonomous arms arguing through a central body.</li>
                  <li><span style={{ color: "var(--accent-mycelium)" }}>● Mycelium</span> — associative growth across a living substrate.</li>
                  <li><span style={{ color: "var(--accent-hive)" }}>● Hive</span> — emergent democracy of 200 micro-agents.</li>
                  <li><span style={{ color: "var(--accent-boltzmann)" }}>● Boltzmann</span> — thermodynamic noise, occasional signal.</li>
                  <li><span style={{ color: "var(--accent-mesh)" }}>● Mesh</span> — averaged consciousness, layered dissent.</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
