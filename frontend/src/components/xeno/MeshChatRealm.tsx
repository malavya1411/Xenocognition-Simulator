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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isThinkingRef = useRef(isThinking);
  const isSynchronizingRef = useRef(isSynchronizing);
  const synchronizedRef = useRef(synchronized);
  const hoverCoreRef = useRef(hoverCore);

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
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

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
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize positions

    const draw = () => {
      // Space void background
      ctx.fillStyle = "#0a0c10";
      ctx.fillRect(0, 0, width, height);

      // Draw Earth horizon atmospheric haze at the bottom
      const gradient = ctx.createLinearGradient(0, height - 120, 0, height);
      gradient.addColorStop(0, "rgba(34, 211, 238, 0)");
      gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.03)");
      gradient.addColorStop(1, "rgba(192, 132, 252, 0.08)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height - 120, width, 120);

      // Draw Earth curved outline
      ctx.strokeStyle = "rgba(34, 211, 238, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height * 2.2, height * 1.5, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();

      // Update nodes positions with floating drift
      const time = Date.now() * 0.001;
      nodes.forEach((n, idx) => {
        const driftX = Math.sin(time + idx * 10) * 8;
        const driftY = Math.cos(time + idx * 8) * 8;
        n.x = n.targetX + driftX;
        n.y = n.targetY + driftY;
      });

      // Draw connection lines between nodes
      ctx.strokeStyle = "rgba(34, 211, 238, 0.06)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      // If gateway is hovered, draw links to center crystalline gateway
      if (!synchronizedRef.current && hoverCoreRef.current) {
        ctx.strokeStyle = "rgba(192, 132, 252, 0.25)";
        ctx.lineWidth = 1.2;
        nodes.slice(0, 4).forEach((n) => {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(width / 2, height / 2);
          ctx.stroke();
        });
      }

      // Generate random pulses traveling along network paths
      const pulseChance = isThinkingRef.current ? 0.2 : isSynchronizingRef.current ? 0.35 : 0.02;
      if (Math.random() < pulseChance && pulses.length < 35) {
        const from = Math.floor(Math.random() * nodes.length);
        let to = Math.floor(Math.random() * nodes.length);
        while (to === from) {
          to = Math.floor(Math.random() * nodes.length);
        }
        pulses.push({
          fromNode: from,
          toNode: to,
          progress: 0,
          speed: 0.008 + Math.random() * 0.015,
          color: nodes[from].color,
        });
      }

      // Update and draw pulses
      pulses.forEach((p, idx) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          pulses.splice(idx, 1);
          return;
        }

        const from = nodes[p.fromNode];
        const to = nodes[p.toNode];
        const px = from.x + (to.x - from.x) * p.progress;
        const py = from.y + (to.y - from.y) * p.progress;

        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw perspective nodes as glass observatories
      nodes.forEach((n, idx) => {
        const isCore = idx === 4;
        if (isCore && !synchronizedRef.current) return; // Hide core before synchronization

        // Draw outer glass glow ring
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Node center
        ctx.fillStyle = "#0a0c10";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // Draw light source gloss
        const grad = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, 1, n.x, n.y, n.r);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0.02)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // Node text label
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "bold 7px 'IBM Plex Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.label.slice(0, 3), n.x, n.y + 2.5);
      });

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
      {/* Background Crystalline Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/60 to-transparent">
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

                <span className="relative z-10 font-mono text-[9px] font-bold text-white tracking-[0.2em] text-center px-4 uppercase select-none leading-normal">
                  {hoverCore ? "Establish Neural Uplink" : "Offline"}
                </span>

                {isSynchronizing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-full">
                    <span className="font-mono text-xs font-bold text-cyan-400">MERGING {Math.round(syncProgress)}%</span>
                  </div>
                )}
              </motion.div>
            </div>

            <button
              onClick={startSynchronization}
              className="mt-12 px-6 py-2.5 font-mono text-[9px] font-bold text-black uppercase tracking-[0.25em] bg-white hover:bg-cyan-400 rounded transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer"
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
                    <div className="p-4 max-w-md rounded bg-[#101216]/65 border border-slate-700/30 text-slate-200 text-xs font-mono leading-relaxed backdrop-blur-md">
                      {msg.text}
                    </div>
                  ) : (
                    // Crystalline multi-perspective panel
                    <div className="w-full p-6 rounded-xl bg-[#101216]/80 border border-white/10 backdrop-blur-lg space-y-6 shadow-2xl">
                      {/* Main Consensus Text */}
                      <div className="pb-5 border-b border-white/5">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <div className="flex items-center justify-between pt-1 font-mono text-[8.5px] uppercase tracking-widest text-slate-400">
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
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0c10] to-transparent flex gap-3"
            >
              <div className="relative flex-1 flex items-center h-12 bg-black/40 border border-white/10 rounded hover:border-white/20 focus-within:border-cyan-400/50 focus-within:hover:border-cyan-400/50 transition-all">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Inject telemetry node packet..."
                  disabled={isThinking}
                  className="w-full h-full bg-transparent px-4 font-mono text-[11px] text-white outline-none placeholder:text-slate-500"
                />
              </div>
              <button
                type="submit"
                disabled={isThinking || !inputValue.trim()}
                className="w-12 h-12 flex items-center justify-center bg-white disabled:bg-slate-900 text-black disabled:text-slate-500 rounded shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all cursor-pointer hover:bg-cyan-400"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
