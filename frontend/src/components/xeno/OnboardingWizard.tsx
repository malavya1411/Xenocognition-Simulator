import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Compass, Cpu, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  BoltzmannIcon,
  HiveIcon,
  MeshIcon,
  MyceliumIcon,
  OctopusIcon,
} from "@/components/xeno/icons";

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

type ArchId = "octopus" | "mycelium" | "hive" | "boltzmann" | "mesh";

const ONBOARD_ARCH_META: {
  id: ArchId;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "octopus", name: "Octopus", icon: OctopusIcon },
  { id: "mycelium", name: "Mycelium", icon: MyceliumIcon },
  { id: "hive", name: "Hive Mind", icon: HiveIcon },
  { id: "boltzmann", name: "Boltzmann", icon: BoltzmannIcon },
  { id: "mesh", name: "Mesh", icon: MeshIcon },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onComplete, onCancel }) => {
  const { completeOnboarding, logout } = useAuth();
  const [onboardStep, setOnboardStep] = useState(1);
  const [onboardName, setOnboardName] = useState("");
  const [onboardFocus, setOnboardFocus] = useState("");
  const [onboardCuriosity, setOnboardCuriosity] = useState("");
  const [onboardPersona, setOnboardPersona] = useState<ArchId>("octopus");
  const [neuralLoadingText, setNeuralLoadingText] = useState("");
  const [cancelling, setCancelling] = useState(false);

  if (!isOpen) return null;

  const handleCancelOnboarding = async () => {
    setCancelling(true);
    try {
      await logout();
      onCancel();
    } catch (err) {
      console.error("Error logging out during onboarding cancel:", err);
    } finally {
      setCancelling(false);
    }
  };

  const submitOnboarding = async () => {
    if (!onboardName.trim() || !onboardFocus || !onboardCuriosity || !onboardPersona) {
      return;
    }
    setOnboardStep(4);
    
    const messages = [
      "Calibrating neural interface connection...",
      "Mapping local thought nodes to xeno-matrix...",
      "Integrating octopus arms sub-agents consensus...",
      "Resolving spore network chemical paths...",
      "Uplink complete. Connecting mind..."
    ];
    
    for (let i = 0; i < messages.length; i++) {
      setNeuralLoadingText(messages[i]);
      await new Promise(r => setTimeout(r, 900));
    }

    try {
      await completeOnboarding({
        displayName: onboardName,
        researchFocus: onboardFocus,
        curiosityDomain: onboardCuriosity,
        preferredPersona: onboardPersona
      });
      onComplete();
    } catch (err) {
      console.error(err);
      setOnboardStep(3); // Go back if error
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/95 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.98, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="premium-glass relative w-full max-w-xl overflow-hidden rounded-2xl p-10 bg-surface/90 border border-border-glow shadow-2xl"
      >
        {/* Back to Landing Page option available on every screen */}
        {onboardStep < 4 && (
          <button
            onClick={handleCancelOnboarding}
            disabled={cancelling}
            className="absolute top-4 left-6 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-text-ghost hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft size={10} /> Go back to landing page
          </button>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-text-secondary">
            Onboarding Phase {onboardStep} of 4
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-1 w-6 rounded-full transition-all duration-300 ${s <= onboardStep ? "bg-octopus" : "bg-border-dim"}`} 
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Subject name */}
        {onboardStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h3 className="font-sans text-2xl font-bold uppercase tracking-tight text-text-primary">
                Initialize Subject Identity
              </h3>
              <p className="text-xs text-text-secondary">
                Provide the tag/alias you want used throughout the cognitive connection simulations.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[9px] uppercase tracking-widest text-text-secondary flex items-center gap-1.5 flex-row">
                <User size={12} className="text-octopus" /> Subject Username
              </label>
              <input
                type="text"
                value={onboardName}
                onChange={(e) => setOnboardName(e.target.value)}
                placeholder="e.g. Researcher Vance"
                className="w-full rounded border border-border-glow bg-void/40 px-4 py-3 text-sm text-text-primary outline-none focus:border-octopus focus:shadow-[0_0_15px_-3px_rgba(0,240,255,0.2)] transition-all font-sans"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => onboardName.trim() && setOnboardStep(2)}
                disabled={!onboardName.trim() || cancelling}
                className="flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Next Step <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Scientific Focus */}
        {onboardStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h3 className="font-sans text-2xl font-bold uppercase tracking-tight text-text-primary">
                Select Scientific Focus
              </h3>
              <p className="text-xs text-text-secondary">
                Which discipline guides your examination of alternate intelligence?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: "philosophy", name: "Philosophy of Mind", desc: "Focuses on qualia, subjective experience, and alien morality." },
                { id: "cognitive", name: "Cognitive Science", desc: "Focuses on patterns, problem solving, and learning rates." },
                { id: "cybernetics", name: "Cybernetics & Systems", desc: "Focuses on system loops, signal delays, and networks." },
                { id: "alife", name: "Artificial Life", desc: "Focuses on emergent order, thermodynamics, and swarm structures." }
              ].map((focus) => (
                <div
                  key={focus.id}
                  onClick={() => setOnboardFocus(focus.id)}
                  className={`premium-glass p-4 rounded-xl cursor-pointer border hover:border-octopus/40 transition-all ${onboardFocus === focus.id ? "border-octopus bg-octopus/5 shadow-[0_0_15px_-4px_rgba(0,240,255,0.25)]" : "border-border-dim"}`}
                >
                  <h4 className="font-sans text-[11px] font-bold tracking-wider text-text-primary uppercase flex items-center gap-2 flex-row">
                    <Compass size={12} className={onboardFocus === focus.id ? "text-octopus" : "text-text-secondary"} /> {focus.name}
                  </h4>
                  <p className="mt-1.5 font-mono text-[9px] leading-relaxed text-text-secondary">
                    {focus.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setOnboardStep(1)}
                disabled={cancelling}
                className="rounded-full border border-border-dim bg-surface/30 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => onboardFocus && setOnboardStep(3)}
                disabled={!onboardFocus || cancelling}
                className="flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Next Step <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Curiosity and Persona */}
        {onboardStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h3 className="font-sans text-2xl font-bold uppercase tracking-tight text-text-primary">
                Initialize Architecture
              </h3>
              <p className="text-xs text-text-secondary">
                Choose which neural persona to establish as your baseline connection.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[9px] uppercase tracking-widest text-text-secondary">
                What concept are you most eager to probe?
              </label>
              <select
                value={onboardCuriosity}
                onChange={(e) => setOnboardCuriosity(e.target.value)}
                className="w-full rounded border border-border-glow bg-void/50 px-4 py-3 text-xs text-text-primary outline-none focus:border-octopus transition-all cursor-pointer font-mono uppercase tracking-wider"
              >
                <option value="" disabled>-- Choose research curiosity --</option>
                <option value="pain">Decentered pain circulating across 8 limbs</option>
                <option value="consciousness">Emergence of sense of self in a mycelial network</option>
                <option value="democracy">Hive swarm voting behavior under stress</option>
                <option value="entropy">Boltzmann spontaneous thought order from chaos</option>
                <option value="tension">Conflicting human voices merged in post-human mesh</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[9px] uppercase tracking-widest text-text-secondary">
                Initial Target Architecture
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ONBOARD_ARCH_META.map((a) => {
                  const Icon = a.icon;
                  const isSelected = onboardPersona === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => setOnboardPersona(a.id)}
                      className={`premium-glass flex flex-col items-center justify-center p-3 rounded-lg border text-center cursor-pointer transition-all ${isSelected ? "border-octopus bg-octopus/5 shadow-[0_0_10px_rgba(0,240,255,0.2)]" : "border-border-dim"}`}
                    >
                      <Icon size={16} className={isSelected ? "text-octopus" : "text-text-ghost"} />
                      <span className="mt-2 font-sans text-[8px] font-bold tracking-wider uppercase truncate w-full text-text-primary">
                        {a.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setOnboardStep(2)}
                disabled={cancelling}
                className="rounded-full border border-border-dim bg-surface/30 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={submitOnboarding}
                disabled={!onboardCuriosity || !onboardPersona || cancelling}
                className="flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Establish Connection <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Calibration neural sync loading */}
        {onboardStep === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center space-y-6"
          >
            <div className="relative flex items-center justify-center h-20 w-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-t-octopus border-r-transparent border-b-violet-400 border-l-transparent"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                className="absolute h-14 w-14 rounded-full border border-t-amber-400 border-r-transparent border-b-transparent border-l-emerald-400"
              />
              <Cpu className="text-text-primary animate-pulse" size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="font-sans text-xl font-bold uppercase tracking-wide text-text-primary animate-pulse">
                Neural Uplink Active
              </h3>
              <p className="font-mono text-[10px] text-octopus uppercase tracking-widest min-h-[16px]">
                {neuralLoadingText}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
