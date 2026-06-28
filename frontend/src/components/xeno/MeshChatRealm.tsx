import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Activity, Info } from "lucide-react";
import { simulateMesh } from "@/lib/xeno-mock";

interface Perspective {
  voice: string;
  text: string;
  weight: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  averageAnswer?: string;
  perspectives?: Perspective[];
  tensionScore?: number;
  timestamp: number;
}

interface MeshChatRealmProps {
  initialConcept: string;
  onClose: () => void;
}

interface NetworkNode {
  x: number;
  y: number;
  z?: number;
  r: number;
  label: string;
  color: string;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
}

interface Pulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

const GHOST_COLORS = ["#cbd5e1", "#fbbf24", "#a78bfa", "#10b981"]; // Pragmatist (Silver), Mystic (Gold), Cynic (Purple), Optimist (Green)

export function MeshChatRealm({ initialConcept, onClose }: MeshChatRealmProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProgress, setThinkingProgress] = useState(0);

  // Synchronization states
  const [synchronized, setSynchronized] = useState(false);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Hover states
  const [hoverCore, setHoverCore] = useState(false);
  const [activeNodeDetail, setActiveNodeDetail] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasFrontRef = useRef<HTMLCanvasElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isThinkingRef = useRef(isThinking);
  const isSynchronizingRef = useRef(isSynchronizing);
  const synchronizedRef = useRef(synchronized);
  const hoverCoreRef = useRef(hoverCore);
  const orbitCenterXRef = useRef<number | null>(null);
  const orbitCenterYRef = useRef<number | null>(null);

  useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);
  useEffect(() => { isSynchronizingRef.current = isSynchronizing; }, [isSynchronizing]);
  useEffect(() => { synchronizedRef.current = synchronized; }, [synchronized]);
  useEffect(() => { hoverCoreRef.current = hoverCore; }, [hoverCore]);

  // Disable body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, synchronized]);

  // Load session or initialize
  useEffect(() => {
    const saved = sessionStorage.getItem("xeno_mesh_conversation");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Error loading mesh session:", e);
      }
    }
  }, []);

  // Main trigger simulation
  const triggerQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim() || isThinkingRef.current) return;

    setIsThinking(true);
    setThinkingProgress(0);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText,
      timestamp: Date.now(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      sessionStorage.setItem("xeno_mesh_conversation", JSON.stringify(updated));
      return updated;
    });

    const startTime = Date.now();
    let apiData: any = null;
    let animDone = false;

    simulateMesh(queryText)
      .then((data) => {
        apiData = data;
        checkCompletion();
      })
      .catch((err) => {
        console.error("simulateMesh failed:", err);
        setIsThinking(false);
      });

    // Mesh convergence animation (3.0s duration)
    const duration = 3000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setThinkingProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        animDone = true;
        checkCompletion();
      }
    }, 50);

    function checkCompletion() {
      if (apiData && animDone) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          averageAnswer: apiData.averageAnswer,
          perspectives: apiData.perspectives,
          tensionScore: apiData.tensionScore,
          timestamp: Date.now(),
        };

        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          sessionStorage.setItem("xeno_mesh_conversation", JSON.stringify(updated));
          return updated;
        });
        setIsThinking(false);
      }
    }
  }, []);

  // Establish Neural Uplink Ceremony
  const startSynchronization = () => {
    if (isSynchronizing) return;
    setIsSynchronizing(true);
    setSyncProgress(0);

    const duration = 3000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setSyncProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setSynchronized(true);
        setIsSynchronizing(false);
        // Fire initial query after syncing if not already in history
        setMessages((prev) => {
          const userMsgs = prev.filter(m => m.sender === "user");
          const lastUserMsg = userMsgs[userMsgs.length - 1];
          if (initialConcept && (!lastUserMsg || lastUserMsg.text !== initialConcept)) {
            setTimeout(() => triggerQuery(initialConcept), 50);
          }
          return prev;
        });
      }
    }, 30);
  };

  // --- CRYSTALLINE OBSERVATORY CANVAS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasFront = canvasFrontRef.current;
    if (!canvas || !canvasFront) return;
    const ctxBack = canvas.getContext("2d");
    const ctxFront = canvasFront.getContext("2d");
    if (!ctxBack || !ctxFront) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    canvasFront.width = width;
    canvasFront.height = height;

    // Define calm floating stardust particles for background drift inside chat
    interface StarParticle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      color: string;
    }
    const stars: StarParticle[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.4, // Slightly larger base for light bloom
        speedX: (Math.random() - 0.5) * 0.1,
        speedY: (Math.random() - 0.5) * 0.1,
        alpha: Math.random() * 0.35 + 0.2,
        color: Math.random() > 0.5 ? "#22d3ee" : "#cbd5e1",
      });
    }

    // Define 5 key points (Pragmatist, Mystic, Cynic, Optimist, and Central Mesh Core)
    const nodes: NetworkNode[] = [
      { x: width * 0.25, y: height * 0.35, r: 8, label: "PRAGMATIST", color: GHOST_COLORS[0], targetX: width * 0.25, targetY: height * 0.35, vx: 0, vy: 0 },
      { x: width * 0.75, y: height * 0.35, r: 8, label: "MYSTIC", color: GHOST_COLORS[1], targetX: width * 0.75, targetY: height * 0.35, vx: 0, vy: 0 },
      { x: width * 0.35, y: height * 0.75, r: 8, label: "CYNIC", color: GHOST_COLORS[2], targetX: width * 0.35, targetY: height * 0.75, vx: 0, vy: 0 },
      { x: width * 0.65, y: height * 0.75, r: 8, label: "OPTIMIST", color: GHOST_COLORS[3], targetX: width * 0.65, targetY: height * 0.75, vx: 0, vy: 0 },
      { x: width / 2, y: height / 2, r: 15, label: "CORE MESH", color: "#cbd5e1", targetX: width / 2, targetY: height / 2, vx: 0, vy: 0 },
    ];

    const pulses: Pulse[] = [];
    let rafId: number;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvasFront.width = width;
      canvasFront.height = height;

      // Recalculate node positions
      nodes[0].targetX = width * 0.2;
      nodes[0].targetY = height * 0.4;
      nodes[1].targetX = width * 0.8;
      nodes[1].targetY = height * 0.4;
      nodes[2].targetX = width * 0.3;
      nodes[2].targetY = height * 0.75;
      nodes[3].targetX = width * 0.7;
      nodes[3].targetY = height * 0.75;
      nodes[4].targetX = width / 2;
      nodes[4].targetY = height / 2;

      nodes.forEach((n) => {
        n.x = n.targetX;
        n.y = n.targetY;
        n.z = 0;
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize positions

    const draw = () => {
      const cx = width / 2;
      const cy = height / 2;

      // Space void background (back canvas only)
      ctxBack.fillStyle = "#0a0c10";
      ctxBack.fillRect(0, 0, width, height);

      // Clear front transparent canvas
      ctxFront.clearRect(0, 0, width, height);

      // Draw Earth horizon atmospheric haze at the bottom (back canvas)
      const gradient = ctxBack.createLinearGradient(0, height - 120, 0, height);
      gradient.addColorStop(0, "rgba(34, 211, 238, 0)");
      gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.03)");
      gradient.addColorStop(1, "rgba(192, 132, 252, 0.08)");
      ctxBack.fillStyle = gradient;
      ctxBack.fillRect(0, height - 120, width, 120);

      // Draw Earth curved outline (back canvas)
      ctxBack.strokeStyle = "rgba(34, 211, 238, 0.08)";
      ctxBack.lineWidth = 1;
      ctxBack.beginPath();
      ctxBack.arc(width / 2, height * 2.2, height * 1.5, Math.PI * 1.25, Math.PI * 1.75);
      ctxBack.stroke();

      if (synchronizedRef.current) {
        // --- CALM FLOATING BACKGROUND PARTICLES (WHEN INSIDE REALM) ---
        stars.forEach((s) => {
          s.x += s.speedX;
          s.y += s.speedY;

          // Wrap boundaries
          if (s.x < 0) s.x = width;
          if (s.x > width) s.x = 0;
          if (s.y < 0) s.y = height;
          if (s.y > height) s.y = 0;

          ctxBack.save();
          ctxBack.shadowBlur = 4;
          ctxBack.shadowColor = s.color;
          ctxBack.fillStyle = s.color;
          ctxBack.globalAlpha = s.alpha;
          ctxBack.beginPath();
          ctxBack.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctxBack.fill();

          // Hot inner white light core
          ctxBack.fillStyle = "#ffffff";
          ctxBack.globalAlpha = s.alpha * 0.8;
          ctxBack.beginPath();
          ctxBack.arc(s.x, s.y, s.size * 0.45, 0, Math.PI * 2);
          ctxBack.fill();
          ctxBack.restore();
        });
      } else {
        // --- 3D ORBITING OBSERVATORY NETWORK (GATEWAY & TRANSITION STATE) ---
        // Update nodes positions with floating 3D orbital drift around core
        const time = Date.now() * 0.0006;
        const rx = Math.min(width, height) * 0.35;
        const ry = Math.min(width, height) * 0.055; // Flattened ellipse to prevent text overlap

        // Get exact coordinates of the sphere element in the DOM
        let targetCenterX = cx;
        let targetCenterY = cy - 20;

        if (!synchronizedRef.current) {
          const sphereEl = document.getElementById("mesh-sphere-core");
          if (sphereEl) {
            const rect = sphereEl.getBoundingClientRect();
            targetCenterX = rect.left + rect.width / 2;
            targetCenterY = rect.top + rect.height / 2;
          }
        }

        // Smoothly interpolate center of the orbit based on state
        if (orbitCenterXRef.current === null) {
          orbitCenterXRef.current = targetCenterX;
        } else {
          orbitCenterXRef.current += (targetCenterX - orbitCenterXRef.current) * 0.12;
        }

        if (orbitCenterYRef.current === null) {
          orbitCenterYRef.current = targetCenterY;
        } else {
          orbitCenterYRef.current += (targetCenterY - orbitCenterYRef.current) * 0.12;
        }

        nodes.forEach((n, idx) => {
          if (idx === 4) {
            // Central Core stays centered on the sphere
            n.x = orbitCenterXRef.current!;
            n.y = orbitCenterYRef.current!;
            n.z = 0;
            return;
          }

          // 3D Elliptical Orbit
          const angle = time + idx * (Math.PI / 2);
          const z = Math.sin(angle); // -1 is back, 1 is front
          n.x = orbitCenterXRef.current! + Math.cos(angle) * rx;
          n.y = orbitCenterYRef.current! + z * ry;
          n.z = z;
          n.r = 8 * (1.1 + z * 0.25); // Scale size based on depth
        });

        const core = nodes[4];

        // Draw quadratic bezier connection curves based on depth
        nodes.slice(0, 4).forEach((n, idx) => {
          const isHover = !synchronizedRef.current && hoverCoreRef.current;
          // Nodes in front (z > 0) draw connections on ctxFront; nodes in back (z <= 0) on ctxBack
          const ctx = n.z! > 0 ? ctxFront : ctxBack;

          ctx.strokeStyle = `rgba(34, 211, 238, ${isHover ? 0.24 : 0.06 + (n.r / 10) * 0.06})`;
          ctx.lineWidth = isHover ? 1.2 : 0.6;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          const cpX = (n.x + core.x) / 2 + Math.sin(time + idx) * 35;
          const cpY = (n.y + core.y) / 2 + Math.cos(time + idx) * 35;
          ctx.quadraticCurveTo(cpX, cpY, core.x, core.y);
          ctx.stroke();
        });

        // Generate random pulses traveling along network paths
        const pulseChance = isThinkingRef.current ? 0.25 : isSynchronizingRef.current ? 0.45 : 0.035;
        if (Math.random() < pulseChance && pulses.length < 40) {
          const from = Math.floor(Math.random() * 4); // Always from perspective nodes to core
          const to = 4;
          pulses.push({
            fromNode: from,
            toNode: to,
            progress: 0,
            speed: 0.006 + Math.random() * 0.012,
            color: GHOST_COLORS[from],
          });
        }

        // Update and draw pulses along Bezier quadratic curves
        pulses.forEach((p, idx) => {
          p.progress += p.speed;
          if (p.progress >= 1) {
            pulses.splice(idx, 1);
            return;
          }

          const from = nodes[p.fromNode];
          const to = nodes[p.toNode];
          
          // Draw pulse on corresponding canvas layer
          const ctx = from.z! > 0 ? ctxFront : ctxBack;

          const cpX = (from.x + to.x) / 2 + Math.sin(time + p.fromNode) * 35;
          const cpY = (from.y + to.y) / 2 + Math.cos(time + p.fromNode) * 35;

          // Quadratic Bezier interpolation
          const u = 1 - p.progress;
          const tt = p.progress * p.progress;
          const uu = u * u;
          const px = uu * from.x + 2 * u * p.progress * cpX + tt * to.x;
          const py = uu * from.y + 2 * u * p.progress * cpY + tt * to.y;

          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Draw perspective nodes as glass spheres
        nodes.forEach((n, idx) => {
          const isCore = idx === 4;
          if (isCore && !synchronizedRef.current) return;

          // Core or nodes in back go to ctxBack. Front nodes (z > 0) go to ctxFront (over HTML)
          const ctx = (isCore || n.z! <= 0) ? ctxBack : ctxFront;

          // Calculate opacity based on node depth/scale
          const zRatio = isCore ? 1 : (n.r - 6) / 4; 
          ctx.save();
          ctx.globalAlpha = 0.4 + zRatio * 0.6;

          // Outer glass ring
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
          ctx.stroke();

          // Node center void
          ctx.fillStyle = "#0a0c10";
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();

          // High gloss glass gradient
          const grad = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, 1, n.x, n.y, n.r);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
          grad.addColorStop(1, "rgba(255, 255, 255, 0.01)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();

          // Label
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.font = "bold 6.5px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(n.label.slice(0, 3), n.x, n.y + 2.5);
          ctx.restore();
        });
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    triggerQuery(inputValue.trim());
    setInputValue("");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0c10] overflow-hidden select-none">
      {/* Background Crystalline Canvas (z-0) */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Foreground Crystalline Canvas (z-20 - draws nodes in front of HTML) */}
      <canvas ref={canvasFrontRef} className="absolute inset-0 pointer-events-none z-20" />

      {/* Cybernetic Telemetry Readouts (FUI overlay) */}
      {!synchronized && (
        <>
          <div className="absolute top-24 left-6 pointer-events-none font-mono text-[7px] text-cyan-400/40 uppercase tracking-widest space-y-1 z-30">
            <div>// CYBERNETIC MESH PROTOCOL</div>
            <div>SYNAPSE COUNT: 5 CORES</div>
            <div>TENSION INDEX: {isSynchronizing ? "STABILIZING" : "STABLE"}</div>
            <div>PERSPECTIVES: BOUNDED</div>
          </div>
          <div className="absolute top-24 right-6 pointer-events-none font-mono text-[7px] text-cyan-400/40 uppercase tracking-widest text-right space-y-1 z-30">
            <div>OBSERVATION STABILITY: {(syncProgress * 0.995).toFixed(1)}%</div>
            <div>INTEGRATION WEIGHT: 1.0</div>
            <div>NEURAL PULSES: ACTIVE</div>
          </div>
          <div className="absolute bottom-6 left-6 pointer-events-none font-mono text-[7px] text-cyan-400/40 uppercase tracking-widest space-y-1 z-30">
            <div>LOC: MESH_OBSERVATORY_CORE</div>
            <div>MEMBRANE: CHAT_CHAMBER_1</div>
          </div>
          <div className="absolute bottom-6 right-6 pointer-events-none font-mono text-[7px] text-cyan-400/40 uppercase tracking-widest text-right space-y-1 z-30">
            <div>OBSERVER: CYCLIC_UPLINK</div>
            <div>CONVERGENCE: EMERGENCY</div>
          </div>
        </>
      )}

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-6 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Disconnect Uplink
        </button>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#cbd5e1] uppercase tracking-widest">
          <Activity size={12} className="animate-pulse" /> Neural Synapse: {synchronized ? "LINKED" : "UNBOUNDED"}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!synchronized ? (
          // --- GATEWAY PANEL ---
          <motion.div
            key="gateway"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center"
          >
            <div className="mb-2 font-mono text-[10px] text-cyan-400 uppercase tracking-[0.3em] opacity-80 animate-pulse">
              Substrate: Cybernetic Mesh Layer
            </div>
            <h1 className="font-serif text-3xl font-bold text-white uppercase tracking-wider mb-6">
              Post-Human Mesh
            </h1>
            <p className="font-mono text-[11px] leading-relaxed text-slate-300 max-w-sm mb-12">
              Merge with a cathedral of collective human viewpoints. Synchronize independent weights to establish a consensus membrane.
            </p>

            {/* Monumental control: Floating Crystalline Sphere */}
            <div
              id="mesh-sphere-core"
              className="relative cursor-pointer"
              onMouseEnter={() => setHoverCore(true)}
              onMouseLeave={() => setHoverCore(false)}
              onClick={startSynchronization}
            >
              {/* Outer glass refraction ring */}
              <div className="absolute inset-[-25px] rounded-full bg-cyan-500/5 blur-3xl transition-all duration-700" />
              
              {/* Spherical Gateway */}
              <motion.div
                animate={{
                  boxShadow: hoverCore 
                    ? "0 0 50px rgba(34, 211, 238, 0.3), inset 0 0 30px rgba(192, 132, 252, 0.2)"
                    : "0 0 30px rgba(34, 211, 238, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.05)"
                }}
                className="relative w-36 h-36 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center transition-all duration-500"
              >
                {/* Refraction gloss */}
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/20" />
                <div className="absolute top-2 left-6 w-8 h-4 rounded-full bg-white/10 blur-[1px] rotate-[-15deg]" />

                {!isSynchronizing && (
                  <span className="relative z-10 font-mono text-[9px] font-bold text-white tracking-[0.2em] text-center px-4 uppercase select-none leading-normal">
                    {hoverCore ? "Establish Neural Uplink" : "Offline"}
                  </span>
                )}

                {isSynchronizing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-full">
                    <span className="font-mono text-xs font-bold text-cyan-400 animate-pulse">MERGING {Math.round(syncProgress)}%</span>
                  </div>
                )}
              </motion.div>
            </div>

            <button
              onClick={startSynchronization}
              className="mt-36 px-6 py-2.5 font-mono text-[9px] font-bold text-black uppercase tracking-[0.25em] bg-white hover:bg-cyan-400 rounded transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer"
            >
              {isSynchronizing ? "Interfacing Synaptic Weights..." : "Merge With The Mesh"}
            </button>
          </motion.div>
        ) : (
          // --- CHAT INTERFACE ---
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 flex flex-col w-full h-full max-w-5xl px-6 pt-24 pb-28"
          >
            {/* Status bar */}
            <div className="mb-4 flex items-center justify-between p-3 rounded border border-white/5 bg-black/40 backdrop-blur-md font-mono text-[8px] uppercase tracking-wider text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>Synchronized Neural Mesh Protocol</span>
              </div>
              <div>Harmonizer: active convergence</div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <div className="font-mono text-[10px] text-[#cbd5e1] uppercase tracking-widest animate-pulse">
                    Mesh filaments idle. Awaiting Uplink command.
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <span className="font-mono text-[7px] text-[#cbd5e1] uppercase tracking-widest mb-1.5 px-2">
                    {msg.sender === "user" ? "Synapse Node input" : "Synthesized Consensus"}
                  </span>

                  {msg.sender === "user" ? (
                    <div className="relative p-4 max-w-md rounded bg-[#101216]/65 border border-slate-700/20 text-slate-200 text-xs font-mono leading-relaxed backdrop-blur-md">
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-slate-400/40" />
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-slate-400/40" />
                      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-slate-400/40" />
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-slate-400/40" />
                      {msg.text}
                    </div>
                  ) : (
                    // Crystalline multi-perspective panel
                    <div className="relative w-full p-6 rounded-xl bg-[#101216]/80 border border-white/10 shadow-[0_0_35px_rgba(255,255,255,0.03)] backdrop-blur-lg space-y-6 overflow-hidden">
                      {/* Corner Brackets */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/50" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/50" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50" />
                      
                      {/* Crystalline matrix grid background */}
                      <div className="absolute inset-0 opacity-[0.01] bg-[linear-gradient(rgba(255,255,255,0.15)_0.5px,transparent_0.5px),linear-gradient(90deg,rgba(255,255,255,0.15)_0.5px,transparent_0.5px)] [background-size:24px_24px] pointer-events-none" />

                      {/* Main Consensus Text */}
                      <div className="relative z-10 pb-5 border-b border-white/5">
                        <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-widest text-slate-400 mb-2">
                          <Activity size={10} className="text-cyan-400" />
                          <span>Average Answer Convergence</span>
                        </div>
                        <p className="font-serif text-[15px] leading-relaxed text-white font-medium italic">
                          "{msg.averageAnswer}"
                        </p>
                      </div>

                      {/* Perspective grid */}
                      {msg.perspectives && (
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {msg.perspectives.map((p, pi) => (
                            <div
                              key={p.voice}
                              className="p-3.5 rounded bg-black/30 border border-white/5 flex flex-col justify-between"
                              style={{ borderTop: `2px solid ${GHOST_COLORS[pi % GHOST_COLORS.length]}` }}
                            >
                              <div className="space-y-1.5">
                                <div className="flex justify-between font-mono text-[8px] text-slate-400 uppercase tracking-widest">
                                  <span>{p.voice}</span>
                                  <span style={{ color: GHOST_COLORS[pi % GHOST_COLORS.length] }}>{(p.weight * 100).toFixed(0)}%</span>
                                </div>
                                <p className="font-serif text-[11px] text-slate-200 italic leading-normal">
                                  "{p.text}"
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tension Indicator */}
                      {msg.tensionScore !== undefined && (
                        <div className="relative z-10 flex items-center justify-between pt-1 font-mono text-[8.5px] uppercase tracking-widest text-slate-400">
                          <span>Mesh Tension Score</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400"
                                style={{ width: `${msg.tensionScore * 100}%` }}
                              />
                            </div>
                            <span className="text-cyan-400 font-bold">{msg.tensionScore.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex flex-col items-start">
                  <span className="font-mono text-[7px] text-cyan-400 uppercase tracking-widest mb-1.5 px-2 animate-pulse">
                    Mesh perspectives converging
                  </span>
                  <div className="p-5 w-full max-w-xl rounded bg-[#101216]/50 border border-white/10 backdrop-blur-md space-y-3">
                    <div className="flex justify-between items-center font-mono text-[8px] text-slate-400 uppercase tracking-widest">
                      <span>Resolving network perspective weights...</span>
                      <span>{Math.round(thinkingProgress)}%</span>
                    </div>
                    <div className="h-[1.5px] w-full bg-slate-950 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                        style={{ width: `${thinkingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSend}
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/40 to-transparent flex gap-3 z-30"
            >
              <div className="relative flex-1 h-12 bg-black/50 border border-white/10 rounded overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all">
                {/* Micro corner brackets inside input wrapper */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/40" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/40" />
                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/40" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/40" />
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="INJECT TELEMETRY RESPONSE INTO CONVERGENCE CORE..."
                  disabled={isThinking}
                  className="w-full h-full bg-transparent px-4 font-mono text-[10px] tracking-wider text-white outline-none placeholder:text-slate-700 uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={isThinking || !inputValue.trim()}
                className="w-12 h-12 flex items-center justify-center bg-white disabled:bg-slate-800 text-black disabled:text-slate-500 transition-all cursor-pointer hover:bg-cyan-400"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
