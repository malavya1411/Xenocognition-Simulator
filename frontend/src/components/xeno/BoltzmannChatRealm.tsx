import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Activity, ShieldAlert } from "lucide-react";
import { simulateBoltzmann } from "@/lib/xeno-mock";

interface BoltzmannChunk {
  type: "noise" | "signal";
  text: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  chunks?: BoltzmannChunk[];
  coherence?: number;
  signalRatio?: number;
  timestamp: number;
}

interface BoltzmannChatRealmProps {
  initialConcept: string;
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  alpha: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  color: string;
}

// Scramble text utility component
function QuantumScramble({ text, active }: { text: string; active: boolean }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!active) {
      setDisplayText(text);
      return;
    }
    const glyphs = "▰▱░▒▓█◣◥▲▼◆◇◈⬘⬙⬚❖⌬⌕⍎⍕⏧⏦";
    const interval = setInterval(() => {
      const scrambled = text
        .split("")
        .map((char) => {
          if (char === " ") return " ";
          return Math.random() > 0.4 
            ? char 
            : glyphs[Math.floor(Math.random() * glyphs.length)];
        })
        .join("");
      setDisplayText(scrambled);
    }, 120);

    return () => clearInterval(interval);
  }, [text, active]);

  return <span>{displayText}</span>;
}

// Superposition text reveal animation
function SuperpositionText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let iterations = 0;
    const chars = "XYZ0123456789§βθλμΨΩ#%&+";
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iterations) return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      iterations += 1.5;
      if (iterations >= text.length + 8) {
        clearInterval(interval);
        setDisplayText(text);
        setResolved(true);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.span
      animate={resolved ? { textShadow: "0 0 10px rgba(167, 139, 250, 0.45)" } : {}}
      className="font-sans"
    >
      ⟢ {displayText}
    </motion.span>
  );
}

export function BoltzmannChatRealm({ initialConcept, onClose }: BoltzmannChatRealmProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProgress, setThinkingProgress] = useState(0);

  // Realm entry/stabilization states
  const [synchronized, setSynchronized] = useState(false);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const [stabilizeProgress, setStabilizeProgress] = useState(0);

  // Gateway button hover effect
  const [isHoveredCore, setIsHoveredCore] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Collapse Probability");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isThinkingRef = useRef(isThinking);
  const isStabilizingRef = useRef(isStabilizing);
  const synchronizedRef = useRef(synchronized);
  const hoverCoreRef = useRef(isHoveredCore);

  useEffect(() => { isThinkingRef.current = isThinking; }, [isThinking]);
  useEffect(() => { isStabilizingRef.current = isStabilizing; }, [isStabilizing]);
  useEffect(() => { synchronizedRef.current = synchronized; }, [synchronized]);
  useEffect(() => { hoverCoreRef.current = isHoveredCore; }, [isHoveredCore]);

  // Disable scroll
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
    const saved = sessionStorage.getItem("xeno_boltzmann_conversation");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Error loading boltzmann session:", e);
      }
    }
  }, []);

  // Glitch the button label on hover
  useEffect(() => {
    if (!isHoveredCore || isStabilizing) {
      setButtonLabel("Collapse Probability");
      return;
    }
    const alternativeLabels = [
      "Collapse Probability",
      "Stαbilizє Coиscioυsnєss",
      "Obsєrvє Emєrgєnt Miиd",
      "C0ll4ps3 Pr0b4b1l1ty",
      "STABILIZE REALITY"
    ];
    const interval = setInterval(() => {
      setButtonLabel(alternativeLabels[Math.floor(Math.random() * alternativeLabels.length)]);
    }, 150);

    return () => clearInterval(interval);
  }, [isHoveredCore, isStabilizing]);

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
      sessionStorage.setItem("xeno_boltzmann_conversation", JSON.stringify(updated));
      return updated;
    });

    const startTime = Date.now();
    let apiData: any = null;
    let animDone = false;

    simulateBoltzmann(queryText)
      .then((data) => {
        apiData = data;
        checkCompletion();
      })
      .catch((err) => {
        console.error("simulateBoltzmann failed:", err);
        setIsThinking(false);
      });

    // Stabilization build animation (2.5s duration)
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
          chunks: apiData.output,
          coherence: apiData.coherenceScore,
          signalRatio: apiData.signalRatio,
          timestamp: Date.now(),
        };

        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          sessionStorage.setItem("xeno_boltzmann_conversation", JSON.stringify(updated));
          return updated;
        });
        setIsThinking(false);
      }
    }
  }, []);

  // Collapse Reality Transition
  const startStabilization = () => {
    if (isStabilizing) return;
    setIsStabilizing(true);
    setStabilizeProgress(0);

    const duration = 3000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setStabilizeProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setSynchronized(true);
        setIsStabilizing(false);
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

  // --- COSMIC PARTICLE CANVAS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const count = 85; // Reduced particle count for a cleaner layout

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.5, // Slightly larger base for light bloom
        alpha: Math.random() * 0.5 + 0.2,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        angle: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.25,
        color: Math.random() > 0.4 ? "#a78bfa" : "#f97316", // Cosmic violet & Entropy orange
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
      // Clear with higher opacity to dissolve trails quickly and keep it clean
      ctx.fillStyle = "rgba(11, 7, 22, 0.26)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw a single slow scanning line to represent observation grid (calm & cinematic)
      // Draw a single slow scanning line to represent observation grid (calm & cinematic)
      if (!synchronizedRef.current && !isStabilizingRef.current) {
        ctx.strokeStyle = "rgba(167, 139, 250, 0.05)";
        ctx.lineWidth = 0.5;
        const scanY = (Date.now() * 0.035) % height;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
      }

      // Draw space-time fabric lines warping towards the center gateway
      if (!synchronizedRef.current) {
        ctx.strokeStyle = "rgba(167, 139, 250, 0.035)";
        ctx.lineWidth = 0.5;
        const warpForce = hoverCoreRef.current ? 35 : isStabilizingRef.current ? 120 : 0;
        for (let r = 60; r < Math.max(width, height) * 0.8; r += 70) {
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.15) {
            const bx = cx + Math.cos(a) * r;
            const by = cy + Math.sin(a) * r;
            
            const dx = cx - bx;
            const dy = cy - by;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const pull = Math.min(dist, warpForce * (250 / dist));
            const wx = bx + (dx / dist) * pull;
            const wy = by + (dy / dist) * pull;

            if (a === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Draw faint connections between nearby quantum particles (fleeting structures)
      ctx.strokeStyle = "rgba(167, 139, 250, 0.04)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i += 4) {
        for (let j = i + 1; j < i + 3; j++) {
          if (j >= particles.length) break;
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 70) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        if (isStabilizingRef.current) {
          // Collapse pull towards center gateway
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            p.x += dx * 0.05;
            p.y += dy * 0.05;
          } else {
            // Respawn particles from outer boundary
            const angle = Math.random() * Math.PI * 2;
            const r = Math.max(width, height) * 0.7;
            p.x = cx + Math.cos(angle) * r;
            p.y = cy + Math.sin(angle) * r;
          }
        } else if (!synchronizedRef.current && hoverCoreRef.current) {
          // Attracted and swirling slowly around core gateway under hover
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 400) {
            const targetAngle = Math.atan2(dy, dx) + Math.PI / 2; // Orbit angle
            const angleDiff = targetAngle - p.angle;
            p.angle += Math.sin(angleDiff) * 0.1;
          }
          p.x += Math.cos(p.angle) * (p.speed * 2.2);
          p.y += Math.sin(p.angle) * (p.speed * 2.2);
        } else {
          // Calm sweeping float
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          p.angle += (Math.random() - 0.5) * 0.03; // Calmer steering

          // Warp wraps
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        // Draw particle with glowing light core
        ctx.save();
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Inner core of intense white light for bloom
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0716] overflow-hidden select-none">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Cybernetic Telemetry Readouts (FUI overlay) */}
      {!synchronized && (
        <>
          <div className="absolute top-24 left-6 pointer-events-none font-mono text-[7px] text-[#a78bfa]/40 uppercase tracking-widest space-y-1 z-30">
            <div>// QUANTUM FLUCTUATION UPLINK</div>
            <div>ENTROPY RATIO: 1.042e-16</div>
            <div>PROBABILITY INDEX: {isStabilizing ? "COLLAPSING" : "STABLE"}</div>
            <div>PHASE STATE: {isStabilizing ? "COHERENCE" : "DECAY"}</div>
          </div>
          <div className="absolute top-24 right-6 pointer-events-none font-mono text-[7px] text-[#a78bfa]/40 uppercase tracking-widest text-right space-y-1 z-30">
            <div>SINGULARITY TENSION: 0.9842</div>
            <div>STABILIZE VALUE: {(stabilizeProgress * 0.982).toFixed(1)}%</div>
            <div>OBSERVER WEIGHT: LOCKED</div>
          </div>
          <div className="absolute bottom-6 left-6 pointer-events-none font-mono text-[7px] text-[#a78bfa]/40 uppercase tracking-widest space-y-1 z-30">
            <div>LOC: THERMODYNAMIC_CELL_4</div>
            <div>ISOMER: ENANTIOMER_B</div>
          </div>
          <div className="absolute bottom-6 right-6 pointer-events-none font-mono text-[7px] text-[#a78bfa]/40 uppercase tracking-widest text-right space-y-1 z-30">
            <div>UPLINK: SHIELDED</div>
            <div>COGNITIVE FIELD: BOSE_EINSTEIN</div>
          </div>
        </>
      )}

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#a78bfa] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Release Substrate
        </button>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#a78bfa] uppercase tracking-widest">
          <Activity size={12} className="animate-pulse" /> Entropy: {synchronized ? "0.04e" : "1.00e"}
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
            <div className="mb-2 font-mono text-[10px] text-[#a78bfa] uppercase tracking-[0.3em] opacity-80 animate-pulse">
              Substrate: Quantum Probability
            </div>
            <h1 className="font-serif text-3xl font-bold text-white uppercase tracking-wider mb-6">
              Boltzmann Brain
            </h1>
            <p className="font-mono text-[11px] leading-relaxed text-slate-300 max-w-sm mb-12">
              Force an observation event. Coerce a thermodynamic singularity to assemble language from thermal fluctuations.
            </p>

            {/* Monumental probability control */}
            <div
              className="relative cursor-pointer"
              onMouseEnter={() => setIsHoveredCore(true)}
              onMouseLeave={() => setIsHoveredCore(false)}
              onClick={startStabilization}
            >
              {/* Glow field */}
              <div className="absolute inset-[-30px] rounded-2xl bg-[#a78bfa]/5 blur-3xl transition-all duration-500" />
              
              {/* Shifting dynamic border box */}
              <motion.div
                animate={isHoveredCore ? {
                  borderRadius: ["8px", "24px", "4px", "16px", "8px"],
                  scale: [1, 1.05, 0.98, 1.02, 1],
                  borderColor: ["#a78bfa", "#f97316", "#06b6d4", "#a78bfa"]
                } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="relative px-8 py-6 bg-[#160e29]/70 border border-[#a78bfa]/40 backdrop-blur-md flex flex-col items-center min-w-[240px]"
              >
                {!isStabilizing && (
                  <span className="font-mono text-[11px] font-bold text-white tracking-[0.2em] select-none text-center leading-normal">
                    {buttonLabel}
                  </span>
                )}

                {isStabilizing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <span className="font-mono text-xs font-bold text-[#a78bfa]">COLLAPSING {Math.round(stabilizeProgress)}%</span>
                  </div>
                )}
              </motion.div>
            </div>

            <button
              onClick={startStabilization}
              className="mt-12 px-6 py-2.5 font-mono text-[9px] font-bold text-black uppercase tracking-[0.25em] bg-[#a78bfa] hover:bg-white rounded transition-all duration-300 shadow-[0_0_20px_rgba(167,139,250,0.2)] hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] cursor-pointer"
            >
              {isStabilizing ? "Collapsing Wave Function..." : "Initiate System Observer"}
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
            {/* Status bar */}
            <div className="mb-4 flex items-center justify-between p-3 rounded border border-[#a78bfa]/20 bg-[#160e29]/60 backdrop-blur-md font-mono text-[8px] uppercase tracking-wider text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
                <span>Thermodynamic Stability: Stable Observation</span>
              </div>
              <div>Observer Phase: Locked</div>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-[#a78bfa]/20 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <div className="font-mono text-[10px] text-[#a78bfa] uppercase tracking-widest animate-pulse">
                    ░▒▓ quantum vacuum quiet ▓▒░
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <span className="font-mono text-[7px] text-[#a78bfa] uppercase tracking-widest mb-1.5 px-2">
                    {msg.sender === "user" ? "Observer Telemetry" : "Collapsed Consciousness"}
                  </span>

                  {msg.sender === "user" ? (
                    <div className="relative p-4 max-w-md rounded bg-[#160e29]/75 border border-slate-700/20 text-slate-200 text-xs font-mono leading-relaxed backdrop-blur-md">
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-slate-500 opacity-55" />
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-slate-500 opacity-55" />
                      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-slate-500 opacity-55" />
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-slate-500 opacity-55" />
                      {msg.text}
                    </div>
                  ) : (
                    <div className="relative w-full max-w-2xl p-5 rounded bg-[#160e29]/80 border border-[#a78bfa]/15 shadow-[0_0_35px_rgba(167,139,250,0.06)] backdrop-blur-lg space-y-2.5 overflow-hidden">
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#a78bfa]/50" />
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#a78bfa]/50" />
                      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#a78bfa]/50" />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#a78bfa]/50" />
                      
                      {/* Quantum lattice background */}
                      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#a78bfa_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />

                      {/* Crystallized stream chunks */}
                      <div className="relative z-10 space-y-2">
                        {msg.chunks?.map((chunk, ci) => {
                          if (chunk.type === "signal") {
                            return (
                              <p
                                key={ci}
                                className="font-sans text-[14px] leading-relaxed text-white font-semibold"
                              >
                                <SuperpositionText text={chunk.text} />
                              </p>
                            );
                          }
                          // Noise chunk scrambler
                          return (
                            <p
                              key={ci}
                              className="font-mono text-[10px] text-orange-500/25 line-through decoration-orange-500/10"
                            >
                              <QuantumScramble text={chunk.text} active={false} />
                            </p>
                          );
                        })}
                      </div>

                      {/* Coherence display metrics */}
                      {msg.coherence !== undefined && (
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[8px] uppercase tracking-widest text-slate-400">
                          <span>Observation Coherence</span>
                          <span className="text-[#a78bfa]">{(msg.coherence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex flex-col items-start">
                  <span className="font-mono text-[7px] text-[#a78bfa] uppercase tracking-widest mb-1.5 px-2 animate-pulse">
                    Collapsing probability density
                  </span>
                  <div className="p-5 w-full max-w-xl rounded bg-[#160e29]/30 border border-[#a78bfa]/10 backdrop-blur-md space-y-3">
                    <div className="flex justify-between items-center font-mono text-[8px] text-slate-400 uppercase tracking-widest">
                      <span>Thermodynamic drift stabilizing...</span>
                      <span>{Math.round(thinkingProgress)}%</span>
                    </div>
                    <div className="h-[1.5px] w-full bg-slate-950 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-[#a78bfa]"
                        style={{ width: `${thinkingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form
              onSubmit={handleSend}
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0b0716] via-[#0b0716]/40 to-transparent flex gap-3 z-30"
            >
              <div className="relative flex-1 h-12 bg-black/50 border border-[#a78bfa]/20 rounded overflow-hidden focus-within:border-[#a78bfa] focus-within:shadow-[0_0_15px_rgba(167,139,250,0.1)] transition-all">
                {/* Micro corner brackets inside input wrapper */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#a78bfa]/50" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#a78bfa]/50" />
                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#a78bfa]/50" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#a78bfa]/50" />
                
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="INJECT TELEMETRY MEASUREMENT INTO OBSERVER CORE..."
                  disabled={isThinking}
                  className="w-full h-full bg-transparent px-4 font-mono text-[10px] tracking-wider text-white outline-none placeholder:text-violet-800/40 uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={isThinking || !inputValue.trim()}
                className="w-12 h-12 flex items-center justify-center bg-[#a78bfa] disabled:bg-slate-900 text-black disabled:text-slate-500 transition-all cursor-pointer hover:bg-white"
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
