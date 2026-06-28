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
  const [archs, setArchs] = useState<Record<ArchId, ArchState>>({
    octopus: { status: "idle", data: null },
    mycelium: { status: "idle", data: null },
    hive: { status: "idle", data: null },
    boltzmann: { status: "idle", data: null },
    mesh: { status: "idle", data: null },
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
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
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "var(--base)", color: "var(--text-primary)" }}>
      <AmbientParticles count={40} />
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
          backdropFilter: "blur(12px)",
          background: "color-mix(in oklab, var(--base) 70%, transparent)",
          borderBottom: "1px solid var(--border-dim)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-6 w-6 place-items-center"
            style={{ border: "1px solid var(--text-primary)" }}
          >
            <div className="h-[6px] w-[6px] rounded-full" style={{ background: "var(--text-primary)" }} />
          </div>
          <span className="font-sans text-[13px] font-semibold tracking-[0.25em] text-text-primary">
            XENOCOGNITION
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(true)}
            aria-label="About"
            className="grid h-9 w-9 place-items-center text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
            style={{ border: "1px solid var(--border-dim)" }}
          >
            <Info size={14} />
          </button>
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
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
              className="relative flex min-h-[80vh] flex-col items-center justify-center"
            >
              <WireframeSphere />

              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "-0.02em" }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative text-center font-sans font-bold uppercase text-text-primary"
                style={{
                  fontSize: "clamp(3rem, 9vw, 7rem)",
                  lineHeight: 0.95,
                  textShadow: "0 0 80px color-mix(in oklab, var(--text-primary) 8%, transparent)",
                }}
              >
                Xenocognition
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="relative mt-6 text-center font-mono text-[13px] uppercase tracking-[0.3em] text-text-secondary"
              >
                Intelligence is architectural. Not universal.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="relative mt-16 flex flex-wrap items-center justify-center gap-2"
              >
                {ARCH_META.map((a) => (
                  <div
                    key={a.id}
                    className="group flex items-center gap-2 px-4 py-2 transition-colors"
                    style={{
                      border: "1px solid var(--border-dim)",
                      borderRadius: 4,
                    }}
                    data-cursor="hover"
                  >
                    <span
                      className="h-[6px] w-[6px] rounded-full transition-transform group-hover:scale-150"
                      style={{ background: a.accent }}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary group-hover:text-text-primary">
                      {a.name}
                    </span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="relative mt-20 flex flex-col items-center gap-2"
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
                  initialize
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <motion.form
          layout
          onSubmit={onSubmit}
          className={`relative mx-auto flex max-w-3xl items-center gap-3 ${submitted ? "mt-2" : "mt-12"}`}
          style={submitted ? { position: "sticky", top: 80, zIndex: 35 } : undefined}
        >
          <div
            className="relative flex flex-1 items-center transition-all"
            style={{
              height: 64,
              background: "var(--surface)",
              border: "1px solid var(--border-dim)",
              borderRadius: 8,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Submit a concept, question, or moral dilemma for cognitive analysis…"
              aria-label="Cognitive input"
              className="h-full w-full bg-transparent px-6 font-sans text-[15px] text-text-primary outline-none placeholder:italic placeholder:text-text-ghost"
            />
          </div>
          <button
            type="submit"
            aria-label="Submit query"
            className="grid place-items-center transition-transform hover:scale-105"
            style={{
              width: 56,
              height: 56,
              background: "var(--text-primary)",
              color: "var(--base)",
              borderRadius: 999,
            }}
            data-cursor="hover"
          >
            <ArrowRight size={18} />
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
