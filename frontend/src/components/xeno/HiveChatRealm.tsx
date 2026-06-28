import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, X, Users, AlertTriangle } from "lucide-react";
import { simulateHive } from "@/lib/xeno-mock";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  synthesis?: string;
  votes?: { option: string; count: number; percentage: number }[];
  consensus?: string;
  dissent?: string[];
  singularErrors?: string[];
  timestamp: number;
}

interface HiveChatRealmProps {
  initialConcept: string;
  onClose: () => void;
}

interface SwarmAgent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  orbitRadius: number;
  angle: number;
  speed: number;
}

export function HiveChatRealm({ initialConcept, onClose }: HiveChatRealmProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProgress, setThinkingProgress] = useState(0);

  // Immersive flow states
  const [synchronized, setSynchronized] = useState(false);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Keep track of interaction states for the canvas loop
  const hoverCore = useRef(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const isThinkingRef = useRef(isThinking);
  const isSynchronizingRef = useRef(isSynchronizing);
  const synchronizedRef = useRef(synchronized);

  // Sync refs
  useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);
  useEffect(() => { isSynchronizingRef.current = isSynchronizing; }, [isSynchronizing]);
  useEffect(() => { synchronizedRef.current = synchronized; }, [synchronized]);

  // Disable page scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, synchronized]);

  // Load session or initialize
  useEffect(() => {
    const saved = sessionStorage.getItem("xeno_hive_conversation");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Error loading hive session:", e);
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
      sessionStorage.setItem("xeno_hive_conversation", JSON.stringify(updated));
      return updated;
    });

    const startTime = Date.now();
    let apiData: any = null;
    let animDone = false;

    // Call API
    simulateHive(queryText)
      .then((data) => {
        apiData = data;
        checkCompletion();
      })
      .catch((err) => {
        console.error("simulateHive failed:", err);
        setIsThinking(false);
      });

    // Swarm agreement build animation (2.5s duration)
    const duration = 2500;
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
          synthesis: `The Collective Consciousness resolves: "${apiData.consensus}. Dissenting cells report: ${apiData.dissentQuotes.join(', ')}."`,
          votes: apiData.votes,
          consensus: apiData.consensus,
          dissent: apiData.dissentQuotes,
          singularErrors: apiData.singularErrors,
          timestamp: Date.now(),
        };

        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          sessionStorage.setItem("xeno_hive_conversation", JSON.stringify(updated));
          return updated;
        });
        setIsThinking(false);
      }
    }
  }, []);

  // Initiate Uplink Ceremony
  const startSynchronization = () => {
    if (isSynchronizing) return;
    setIsSynchronizing(true);
    setSyncProgress(0);

    const duration = 3000; // 3 seconds cinematic buildup
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

  // --- SWARM CANVAS SIMULATION ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const agents: SwarmAgent[] = [];
    const count = 350; // High density swarm

    // Initialize particles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const orbit = 50 + Math.random() * 300;
      agents.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.3 ? "#fbbf24" : "#f59e0b", // Honey Gold & Amber
        orbitRadius: orbit,
        angle: angle,
        speed: 0.005 + Math.random() * 0.01,
      });
    }

    let rafId: number;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      // Clear with slight alpha to create organic trails
      ctx.fillStyle = "rgba(18, 14, 5, 0.08)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      agents.forEach((agent) => {
        // 1. Behavior modifications based on state
        if (isSynchronizingRef.current) {
          // Spiraling into the core center
          agent.angle += agent.speed * 4;
          agent.orbitRadius -= 1.8;
          if (agent.orbitRadius < 10) {
            agent.orbitRadius = 300 + Math.random() * 200;
          }
          const targetX = cx + Math.cos(agent.angle) * agent.orbitRadius;
          const targetY = cy + Math.sin(agent.angle) * agent.orbitRadius;
          agent.x += (targetX - agent.x) * 0.12;
          agent.y += (targetY - agent.y) * 0.12;
        } else if (!synchronizedRef.current && hoverCore.current) {
          // Attracted to the gateway core button
          const dx = mousePos.current.x - agent.x;
          const dy = mousePos.current.y - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 400) {
            agent.vx += (dx / dist) * 0.25;
            agent.vy += (dy / dist) * 0.25;
          }
          // Cap speeds
          const speed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
          if (speed > 4) {
            agent.vx = (agent.vx / speed) * 4;
            agent.vy = (agent.vy / speed) * 4;
          }
          agent.x += agent.vx;
          agent.y += agent.vy;
        } else {
          // Standard organic swarming (flocking + noise)
          agent.x += agent.vx;
          agent.y += agent.vy;

          // Boundary bounce or wrap
          if (agent.x < 0) agent.x = width;
          if (agent.x > width) agent.x = 0;
          if (agent.y < 0) agent.y = height;
          if (agent.y > height) agent.y = 0;

          // Slight random drift
          agent.vx += (Math.random() - 0.5) * 0.15;
          agent.vy += (Math.random() - 0.5) * 0.15;

          // Reacting to AI Thinking (speed up particles)
          const limit = isThinkingRef.current ? 4.5 : 1.8;
          const speed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
          if (speed > limit) {
            agent.vx = (agent.vx / speed) * limit;
            agent.vy = (agent.vy / speed) * limit;
          }
        }

        // Draw particle
        ctx.save();
        ctx.shadowBlur = isThinkingRef.current ? 8 : 4;
        ctx.shadowColor = agent.color;
        ctx.fillStyle = agent.color;
        ctx.globalAlpha = isSynchronizingRef.current 
          ? agent.alpha * 1.5 
          : agent.alpha;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw faint connections between nearby swarm agents (constellation effect)
      if (synchronizedRef.current && !isThinkingRef.current) {
        ctx.strokeStyle = "rgba(251, 191, 36, 0.02)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < agents.length; i += 6) {
          for (let j = i + 1; j < i + 4; j++) {
            if (j >= agents.length) break;
            const dx = agents[i].x - agents[j].x;
            const dy = agents[i].y - agents[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 60) {
              ctx.beginPath();
              ctx.moveTo(agents[i].x, agents[i].y);
              ctx.lineTo(agents[j].x, agents[j].y);
              ctx.stroke();
            }
          }
        }
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
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#120e05] overflow-hidden select-none"
    >
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#fbbf24] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Close Realm
        </button>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#fbbf24] uppercase tracking-widest">
          <Users size={12} className="animate-pulse" /> Swarm Sync: {synchronized ? "ONLINE" : "OFFLINE"}
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
            <div className="mb-2 font-mono text-[10px] text-[#fbbf24] uppercase tracking-[0.3em] opacity-80 animate-pulse">
              Substrate: Swarm Intelligence
            </div>
            <h1 className="font-serif text-3xl font-bold text-white uppercase tracking-wider mb-6">
              The Hive Mind
            </h1>
            <p className="font-mono text-[11px] leading-relaxed text-slate-300 max-w-sm mb-12">
              Cross the sensory threshold to merge your query with a collective of 200 autonomous cognitive cells.
            </p>

            {/* Monumental Control Honeycomb Core */}
            <div
              className="relative cursor-pointer group"
              onMouseEnter={() => {
                hoverCore.current = true;
                if (canvasRef.current) {
                  const rect = canvasRef.current.getBoundingClientRect();
                  mousePos.current = { x: rect.width / 2, y: rect.height / 2 };
                }
              }}
              onMouseLeave={() => {
                hoverCore.current = false;
              }}
              onClick={startSynchronization}
            >
              {/* Outer Golden Glow rings */}
              <div className="absolute inset-[-20px] rounded-full bg-[#fbbf24]/5 blur-2xl group-hover:bg-[#fbbf24]/15 transition-all duration-700" />
              <div className="absolute inset-0 rounded-full border border-[#fbbf24]/10 animate-ping opacity-60" style={{ animationDuration: "3s" }} />

              {/* Honeycomb core geometry */}
              <div className="relative w-36 h-36 flex items-center justify-center bg-[#1e1708] border border-[#fbbf24]/30 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.15)] group-hover:border-[#fbbf24] group-hover:shadow-[0_0_60px_rgba(251,191,36,0.3)] transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:12px_12px]" />
                
                {/* SVG Glowing Hexagon Core */}
                <svg className="w-16 h-16 text-[#fbbf24] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm8 14.3l-8 4-8-4v-8.6l8-4 8 4v8.6z" />
                  <path d="M12 6.5l-5 2.5v6l5 2.5 5-2.5v-6l-5-2.5zm3 7.8l-3 1.5-3-1.5v-3.6l3-1.5 3 1.5v3.6z" />
                </svg>
              </div>

              {/* Synchronizing Overlay */}
              {isSynchronizing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <span className="font-mono text-xs font-bold text-[#fbbf24]">{Math.round(syncProgress)}%</span>
                </div>
              )}
            </div>

            <button
              onClick={startSynchronization}
              className="mt-12 px-6 py-2.5 font-mono text-[9px] font-bold text-black uppercase tracking-[0.25em] bg-[#fbbf24] hover:bg-white rounded transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] cursor-pointer"
            >
              {isSynchronizing ? "Synchronizing Swarm..." : "Synchronize With The Hive"}
            </button>
          </motion.div>
        ) : (
          // --- CHAT INTERFACE ---
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 flex flex-col w-full h-full max-w-4xl px-6 pt-24 pb-28"
          >
            {/* Swarm Status Bar */}
            <div className="mb-4 flex items-center justify-between p-3 rounded border border-[#fbbf24]/20 bg-[#1e1708]/60 backdrop-blur-md font-mono text-[8px] uppercase tracking-wider text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24] animate-ping" />
                <span>Synchronized Swarm Dynamics</span>
              </div>
              <div>Consensus Weight: 200 Sub-units</div>
            </div>

            {/* Honeycomb Chat Chamber Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-[#fbbf24]/20 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <svg className="w-12 h-12 text-[#fbbf24] animate-pulse mb-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
                  </svg>
                  <p className="font-mono text-[10px] text-[#fbbf24] uppercase tracking-widest">
                    Swarm channels open. Awaiting telemetry.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Sender badge */}
                  <span className="font-mono text-[7px] text-[#fbbf24] uppercase tracking-widest mb-1.5 px-2">
                    {msg.sender === "user" ? "Uplink Source" : "Swarm Synthesis"}
                  </span>

                  {msg.sender === "user" ? (
                    <div className="p-4 max-w-md rounded-xl bg-slate-900/60 border border-slate-700/40 text-slate-100 text-xs font-mono leading-relaxed backdrop-blur-md">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#1e1708]/80 border border-[#fbbf24]/30 shadow-[0_0_30px_rgba(251,191,36,0.05)] backdrop-blur-lg">
                      {msg.votes && (
                        <div className="mb-4 grid grid-cols-3 gap-3 border-b border-[#fbbf24]/10 pb-4">
                          {msg.votes.map((v, vi) => (
                            <div key={v.option} className="flex flex-col font-mono">
                              <span className="text-[7.5px] uppercase text-slate-400 tracking-wider">
                                {v.option}
                              </span>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-[12px] font-bold text-white">{v.count}</span>
                                <span className="text-[7px] text-[#fbbf24]">({v.percentage}%)</span>
                              </div>
                              <div className="h-[2px] w-full bg-slate-800 rounded mt-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-[#fbbf24]"
                                  style={{ width: `${v.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="font-sans text-[13.5px] text-white leading-relaxed font-semibold">
                        {msg.synthesis}
                      </p>

                      {msg.singularErrors && msg.singularErrors.length > 0 && (
                        <div className="mt-4 flex items-start gap-2 p-2.5 rounded bg-amber-950/40 border border-amber-800/30 text-amber-300 font-mono text-[9px] leading-relaxed">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Cell Conflict:</span> Singular pronouns detected in inputs ({msg.singularErrors.join(", ")}). Hive minds require collective framing.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex flex-col items-start">
                  <span className="font-mono text-[7px] text-[#fbbf24] uppercase tracking-widest mb-1.5 px-2 animate-pulse">
                    Consensus forming
                  </span>
                  <div className="p-5 w-full max-w-xl rounded-2xl bg-[#1e1708]/40 border border-[#fbbf24]/15 backdrop-blur-md space-y-3">
                    <div className="flex justify-between items-center font-mono text-[8px] text-slate-400 uppercase tracking-widest">
                      <span>Polling 200 cognitive cell receptors...</span>
                      <span>{Math.round(thinkingProgress)}%</span>
                    </div>
                    <div className="h-[1.5px] w-full bg-slate-900 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-[#fbbf24]"
                        style={{ width: `${thinkingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <form
              onSubmit={handleSend}
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex gap-3"
            >
              <div className="relative flex-1 flex items-center h-12 bg-black/40 border border-[#fbbf24]/30 rounded-lg hover:border-[#fbbf24] focus-within:border-[#fbbf24] transition-all">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Inject concept into the Hive..."
                  disabled={isThinking}
                  className="w-full h-full bg-transparent px-4 font-mono text-[11px] text-white outline-none placeholder:text-slate-500"
                />
              </div>
              <button
                type="submit"
                disabled={isThinking || !inputValue.trim()}
                className="w-12 h-12 flex items-center justify-center bg-[#fbbf24] disabled:bg-slate-800 text-black disabled:text-slate-500 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.15)] transition-all cursor-pointer hover:bg-white"
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
