import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, X } from "lucide-react";
import { simulateOctopus } from "@/lib/xeno-mock";

interface ArmResponse {
  name: string;
  response: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  synthesis?: string;
  conflictScore?: number;
  dominantLobe?: string;
  arms?: ArmResponse[];
  timestamp: number;
}

interface OctopusChatRealmProps {
  initialConcept: string;
  onClose: () => void;
}

// Bezier Y-math helper
function getBezierPoint(
  t: number,
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number
) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * x0 + 3 * uu * t * x1 + 3 * u * tt * x2 + ttt * x3,
    y: uuu * y0 + 3 * uu * t * y1 + 3 * u * tt * y2 + ttt * y3,
  };
}

const ARM_INFOS = [
  { name: "DEFENSIVE", color: "#EF4444", key: "defensive" },
  { name: "CURIOUS", color: "#00FFE5", key: "curious" },
  { name: "SENSUAL", color: "#EC4899", key: "sensual" },
  { name: "PREDATORY", color: "#F97316", key: "predatory" },
  { name: "PLAYFUL", color: "#FBBF24", key: "playful" },
  { name: "SKEPTICAL", color: "#94A3B8", key: "skeptical" },
  { name: "MEMORY", color: "#7C3AED", key: "memory" },
  { name: "COLOR-DRUNK", color: "rainbow", key: "color-drunk" }
];

export function OctopusChatRealm({ initialConcept, onClose }: OctopusChatRealmProps) {
  // --- STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const [checkedLobes, setCheckedLobes] = useState<boolean[]>(Array(8).fill(false));
  const [activeArms, setActiveArms] = useState<string[]>([]);
  
  // Interactive UI States
  const [clickedArmIndex, setClickedArmIndex] = useState<number | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Entry Animation Phase State Machine
  const [entryPlaying, setEntryPlaying] = useState<boolean>(true);
  const [entryStep, setEntryStep] = useState<number>(1);
  const [typewriterText1, setTypewriterText1] = useState("");
  const [typewriterText2, setTypewriterText2] = useState("");
  
  // Color-drunk rainbow hue tracking
  const [rainbowHue, setRainbowHue] = useState(0);
  
  // Canvas & tracking refs
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tipRefs = useRef<(HTMLDivElement | null)[]>(Array(8).fill(null));
  
  const mousePos = useRef({ x: 0, y: 0 });
  const isBlinking = useRef(false);
  const eyeCloseRatio = useRef(0);

  // Disable body scroll when mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // --- REFS FOR CANVAS & TRIGGER TO PREVENT STALE CLOSURES & FLICKERING ---
  const isThinkingRef = useRef(isThinking);
  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  const activeArmsRef = useRef(activeArms);
  useEffect(() => {
    activeArmsRef.current = activeArms;
  }, [activeArms]);

  const rainbowHueRef = useRef(rainbowHue);
  useEffect(() => {
    rainbowHueRef.current = rainbowHue;
  }, [rainbowHue]);

  // --- TRIGGER SIMULATION FUNCTION ---
  const triggerQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim() || isThinkingRef.current) return;

    // Reset clicked tooltips
    setClickedArmIndex(null);
    setIsThinking(true);
    setThinkingProgress(0);
    setCheckedLobes(Array(8).fill(false));

    // Append User message instantly
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: "user",
      text: queryText,
      timestamp: Date.now()
    };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      sessionStorage.setItem("xeno_octopus_conversation", JSON.stringify(updated));
      return updated;
    });

    const startTime = Date.now();
    let apiData: any = null;
    let animDone = false;

    // Trigger simulateOctopus API
    simulateOctopus(queryText)
      .then((data) => {
        apiData = data;
        checkCompletion();
      })
      .catch((err) => {
        console.error("simulateOctopus failed:", err);
        setIsThinking(false);
      });

    // Staggered Lobe check-in animation (2400ms duration total)
    const duration = 2400;
    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setThinkingProgress(progress);

      const updatedChecked = Array(8).fill(false);
      for (let i = 0; i < 8; i++) {
        if (elapsed >= i * 300) {
          updatedChecked[i] = true;
        }
      }
      setCheckedLobes(updatedChecked);

      if (elapsed >= duration) {
        clearInterval(updateInterval);
        animDone = true;
        checkCompletion();
      }
    }, 50);

    function checkCompletion() {
      if (apiData && animDone) {
        const armsMapped: ArmResponse[] = apiData.armNodes.map((an: any) => ({
          name: an.bias.toUpperCase(),
          response: an.response
        }));

        // Determine dominant lobe randomly from active biases, or extract from API data consensus.
        const consensusBias = apiData.consensus?.split(":")?.[0]?.replace("partial", "")?.trim()?.toUpperCase();
        const fallbackBias = apiData.armNodes[Math.floor(Math.random() * 8)]?.bias?.toUpperCase() || "CURIOUS";
        const dominantLobe = consensusBias && ARM_INFOS.some(a => a.name === consensusBias) ? consensusBias : fallbackBias;

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}-${Math.random()}`,
          sender: "ai",
          synthesis: apiData.centralNode.response,
          conflictScore: Math.max(0, Math.min(8, Math.round((1 - apiData.centralNode.confidence) * 8))),
          dominantLobe,
          arms: armsMapped,
          timestamp: Date.now()
        };

        // Update states
        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          sessionStorage.setItem("xeno_octopus_conversation", JSON.stringify(updated));
          return updated;
        });
        
        // Highlight responding arms
        setActiveArms(armsMapped.map(a => a.name));
        setIsThinking(false);
      }
    }
  }, []);

  // --- SESSION STORAGE INITIALIZATION & INITIAL CONCEPT RUNNER ---
  useEffect(() => {
    const saved = sessionStorage.getItem("xeno_octopus_conversation");
    let loadedMessages: ChatMessage[] = [];
    let hasSavedSession = false;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedMessages = parsed;
          hasSavedSession = true;
        }
      } catch (e) {
        console.error("Error loading chat session:", e);
      }
    }

    if (hasSavedSession) {
      setMessages(loadedMessages);
      setEntryPlaying(false);
      setEntryStep(5); // Skip entry animation

      // Re-activate specific arms from the last AI message
      const lastAi = [...loadedMessages].reverse().find(m => m.sender === "ai");
      if (lastAi && lastAi.arms) {
        setActiveArms((lastAi.arms as ArmResponse[]).map((a: ArmResponse) => a.name));
      }

      // Check if we need to run the initialConcept query
      const userMsgs = loadedMessages.filter(m => m.sender === "user");
      const lastUserMsg = userMsgs[userMsgs.length - 1];
      
      if (initialConcept && (!lastUserMsg || lastUserMsg.text !== initialConcept)) {
        triggerQuery(initialConcept);
      }
    } else {
      // Play full entry animation for fresh session
      setEntryPlaying(true);
      setEntryStep(1);
    }
  }, [initialConcept, triggerQuery]);

  // --- ENTRY TIMELINE SEQUENCER ---
  useEffect(() => {
    if (!entryPlaying) return;

    // Step 1: 0 - 500ms (Dot pulsing center)
    const t1 = setTimeout(() => {
      setEntryStep(2);
    }, 500);

    // Step 2: 500ms - 1500ms (SVG Arms shoot out)
    const t2 = setTimeout(() => {
      setEntryStep(3);
    }, 1500);

    // Step 3: 1500ms - 2500ms (Dot morphs to eye, text typing)
    const text1 = "NEURAL UPLINK ESTABLISHED";
    const text2 = "INITIALIZING LOBE CONSENSUS...";
    
    let text1Timer: any;
    let text2Timer: any;

    const t3 = setTimeout(() => {
      // Type out Line 1
      let idx1 = 0;
      text1Timer = setInterval(() => {
        if (idx1 <= text1.length) {
          setTypewriterText1(text1.slice(0, idx1));
          idx1++;
        } else {
          clearInterval(text1Timer);
          // Type out Line 2 after Line 1 finishes
          let idx2 = 0;
          text2Timer = setInterval(() => {
            if (idx2 <= text2.length) {
              setTypewriterText2(text2.slice(0, idx2));
              idx2++;
            } else {
              clearInterval(text2Timer);
            }
          }, 30);
        }
      }, 25);
    }, 1500);

    // Step 4: 2500ms (Smooth transition start)
    const t4 = setTimeout(() => {
      setEntryStep(4);
    }, 2500);

    // Timeline end at 3200ms
    const t5 = setTimeout(() => {
      setEntryPlaying(false);
      setEntryStep(5);
      
      // Automatically trigger query for initialConcept on first load!
      triggerQuery(initialConcept);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      if (text1Timer) clearInterval(text1Timer);
      if (text2Timer) clearInterval(text2Timer);
    };
  }, [entryPlaying, initialConcept]);

  // --- RAINBOW CYCLING TICKER ---
  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      setRainbowHue((prev) => (prev + 1) % 360);
      animFrame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // --- EYELID BLINKING CONTROLLER ---
  useEffect(() => {
    if (entryPlaying) return;
    
    const triggerBlink = () => {
      isBlinking.current = true;
      setTimeout(() => {
        isBlinking.current = false;
      }, 180);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        triggerBlink();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [entryPlaying]);

  // --- MOUSE TRACKING LISTENER ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasContainerRef.current) return;
      const rect = canvasContainerRef.current.getBoundingClientRect();
      // Relative cursor position in CSS pixels
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Old triggerQuery function removed (moved and optimized at top of component body)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    triggerQuery(inputValue.trim());
    setInputValue("");
  };

  // Refs already declared above

  // --- CANVAS RENDER LOOP (Main UI) ---
  useEffect(() => {
    if (entryPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let width = 0;
    let height = 0;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        const newWidth = Math.floor(rect.width);
        const newHeight = Math.floor(rect.height);
        
        if (newWidth !== width || newHeight !== height) {
          width = newWidth;
          height = newHeight;
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);
        }
      }
    });

    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    const drawLoop = () => {
      if (width === 0 || height === 0) {
        rafId = requestAnimationFrame(drawLoop);
        return;
      }

      // 1. Clear with trailing opacity to create organic bioluminescent smears
      ctx.fillStyle = "rgba(2, 11, 24, 0.22)"; 
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.001;

      // Base coordinates (Head centered horizontally, 42% height)
      const cx = width / 2;
      const cy = height * 0.42;

      // Octopus physical scale
      const r = Math.min(width, height) * 0.34;

      // Waving multiplier states
      const speedMult = isThinkingRef.current ? 2.8 : 1.0;
      const ampMult = isThinkingRef.current ? 1.6 : 1.0;

      // Smoothly update eye close ratio
      let targetClose = 0.0;
      if (isBlinking.current) {
        targetClose = 1.0;
      } else if (isThinkingRef.current) {
        targetClose = 0.55;
      }
      eyeCloseRatio.current += (targetClose - eyeCloseRatio.current) * 0.18;

      // --- CALCULATE TENTACLE COORDINATES ---
      const tentaclePoints: { bx: number; by: number; cp1x: number; cp1y: number; cp2x: number; cp2y: number; ex: number; ey: number }[] = [];

      for (let i = 0; i < 8; i++) {
        // Base angles offset by PI/8 to form starburst
        const baseAngle = (i / 8) * Math.PI * 2 + Math.PI / 8;

        // Sway targets using sine wave math
        const swayTime = time * 1.5 * speedMult + i * 2.2;
        const swayAmp = 14 * ampMult;

        const ex = cx + Math.cos(baseAngle) * r + Math.sin(swayTime) * swayAmp;
        const ey = cy + Math.sin(baseAngle) * r + Math.cos(swayTime) * swayAmp;

        // Tentacle roots at mantle surface boundaries
        const bx = cx + Math.cos(baseAngle) * 22;
        const by = cy + Math.sin(baseAngle) * 22;

        // Curved control points
        const cp1x = cx + Math.cos(baseAngle) * (r * 0.42) + Math.sin(time * 1.1 * speedMult + i) * (swayAmp * 0.7);
        const cp1y = cy + Math.sin(baseAngle) * (r * 0.42) + Math.cos(time * 1.1 * speedMult + i) * (swayAmp * 0.7);

        const cp2x = ex - Math.cos(baseAngle) * (r * 0.35) + Math.cos(time * 1.5 * speedMult + i * 2) * (swayAmp * 0.85);
        const cp2y = ey - Math.sin(baseAngle) * (r * 0.35) + Math.sin(time * 1.5 * speedMult + i * 2) * (swayAmp * 0.85);

        tentaclePoints.push({ bx, by, cp1x, cp1y, cp2x, cp2y, ex, ey });

        // Update DOM element references for arm labels
        const tipEl = tipRefs.current[i];
        if (tipEl) {
          tipEl.style.transform = `translate(${ex}px, ${ey}px) translate(-50%, -50%)`;
        }
      }

      // --- 1. DRAW SUBTLE BACK WEBBING ---
      ctx.fillStyle = "rgba(0, 255, 229, 0.035)";
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const pt = tentaclePoints[i];
        const midT = getBezierPoint(0.24, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
        if (i === 0) ctx.moveTo(midT.x, midT.y);
        else ctx.lineTo(midT.x, midT.y);
      }
      ctx.closePath();
      ctx.fill();

      // --- 2. DRAW VOLUMETRIC TAPERED TENTACLES ---
      for (let i = 0; i < 8; i++) {
        const pt = tentaclePoints[i];
        const armInfo = ARM_INFOS[i];
        const isResponding = activeArmsRef.current.includes(armInfo.name);
        
        // Active glow color mapping
        let glowColor = armInfo.color;
        if (glowColor === "rainbow") {
          glowColor = `hsl(${rainbowHueRef.current}, 100%, 65%)`;
        }

        const slices = 30;
        for (let s = 0; s <= slices; s++) {
          const t = s / slices;
          const pos = getBezierPoint(t, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);

          // Taper formula: thicker at base
          const thickness = (isThinkingRef.current ? 11 : 9.5) * (1 - t * 0.78);

          // Render radial gradient shading
          const grad = ctx.createRadialGradient(
            pos.x - thickness * 0.15, pos.y - thickness * 0.15, 0.5,
            pos.x, pos.y, thickness
          );

          if (isThinkingRef.current) {
            // Glow and flash all tentacles
            grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            grad.addColorStop(0.35, "#00FFE5");
            grad.addColorStop(1, "rgba(124, 94, 237, 0.2)");
          } else if (isResponding) {
            // Glow responding lobe color
            grad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
            grad.addColorStop(0.3, glowColor);
            grad.addColorStop(1, "rgba(7, 10, 48, 0.2)");
          } else {
            // Normal calm state
            grad.addColorStop(0, "rgba(0, 255, 229, 0.55)");
            grad.addColorStop(0.4, "rgba(7, 10, 48, 0.85)");
            grad.addColorStop(1, "rgba(124, 58, 237, 0.1)");
          }

          if (isResponding && !isThinkingRef.current) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 10;
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, thickness, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // Reset

          // --- DRAW SUCTION CUPS ---
          if (s > 4 && s % 3 === 0) {
            const nextT = Math.min(1, t + 0.02);
            const nextPos = getBezierPoint(nextT, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
            const dx = nextPos.x - pos.x;
            const dy = nextPos.y - pos.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;

            const cupSize = 1.6 * (1 - t * 0.55);
            ctx.fillStyle = isResponding && !isThinkingRef.current ? glowColor : "rgba(0, 255, 229, 0.75)";
            
            ctx.beginPath();
            ctx.arc(pos.x + nx * thickness, pos.y + ny * thickness, cupSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(pos.x - nx * thickness, pos.y - ny * thickness, cupSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // --- 3. BIOLUMINESCENT TRAVEL PULSES (Tip to base) ---
        const pulseT = 1.0 - ((time * 0.32 + i * 0.125) % 1.0);
        const pulsePos = getBezierPoint(pulseT, pt.bx, pt.by, pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.ex, pt.ey);
        const pulseR = 4.2 * (1 - pulseT * 0.6);

        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = isResponding && !isThinkingRef.current ? glowColor : "#00FFE5";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pulsePos.x, pulsePos.y, pulseR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }

      // --- 4. DRAW BULBOUS MANTLE (HEAD) ---
      const breathe = 1.0 + Math.sin(time * 1.5) * 0.025;
      const headX = 38 * breathe;
      const headY = 46 * breathe;

      const mantleGrad = ctx.createRadialGradient(
        cx - 6, cy - 10, 4,
        cx, cy, 46
      );
      mantleGrad.addColorStop(0, "rgba(0, 255, 229, 0.3)");
      mantleGrad.addColorStop(0.55, "#020B18");
      mantleGrad.addColorStop(1, "rgba(124, 58, 237, 0.35)");

      ctx.fillStyle = mantleGrad;
      ctx.strokeStyle = "#00FFE5";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, headX, headY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Chromatophores spots
      ctx.fillStyle = "rgba(0, 255, 229, 0.35)";
      for (let s = 0; s < 7; s++) {
        const spotX = cx + Math.sin(s * 1.6) * 20;
        const spotY = cy - 22 + s * 4.5;
        const spotRadius = (Math.sin(time * 2.2 + s) * 0.5 + 0.5) * 1.8 + 0.8;
        ctx.beginPath();
        ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 5. DRAW TRACKING / BLINKING CENTRAL EYE ---
      const eyeY = cy - 4;
      
      // Calculate mouse displacement offset (Max displacement: 4px)
      const dx = mousePos.current.x - cx;
      const dy = mousePos.current.y - eyeY;
      const dist = Math.hypot(dx, dy) || 1;
      const offsetDist = Math.min(4.0, dist / 30);
      const angle = Math.atan2(dy, dx);
      const eyeOffsetX = Math.cos(angle) * offsetDist;
      const eyeOffsetY = Math.sin(angle) * offsetDist;

      // Outer socket
      ctx.fillStyle = "#020B18";
      ctx.strokeStyle = "rgba(0, 255, 229, 0.65)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, eyeY, 13.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyelid clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, eyeY, 13.5, 0, Math.PI * 2);
      ctx.clip();

      // Iris & pupil
      const irisGrad = ctx.createRadialGradient(
        cx + eyeOffsetX, eyeY + eyeOffsetY, 0.5,
        cx + eyeOffsetX, eyeY + eyeOffsetY, 8.5
      );
      irisGrad.addColorStop(0, "#FFFFFF");
      irisGrad.addColorStop(0.3, activeArmsRef.current.length > 0 && !isThinkingRef.current ? "#EC4899" : "#00FFE5");
      irisGrad.addColorStop(1, "#020B18");

      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(cx + eyeOffsetX, eyeY + eyeOffsetY, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Slit Pupil
      ctx.fillStyle = "#020B18";
      ctx.beginPath();
      ctx.ellipse(cx + eyeOffsetX, eyeY + eyeOffsetY, 1.6, 6.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlights
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(cx + eyeOffsetX - 2.5, eyeY + eyeOffsetY - 2.5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Draw eyelids closing from top and bottom
      const coverHeight = 15 * eyeCloseRatio.current;
      ctx.fillStyle = "#020B18";
      
      // Top lid
      ctx.beginPath();
      ctx.rect(cx - 15, eyeY - 15, 30, coverHeight);
      ctx.fill();
      // Bottom lid
      ctx.beginPath();
      ctx.rect(cx - 15, eyeY + 15 - coverHeight, 30, coverHeight);
      ctx.fill();

      ctx.restore();

      // Draw closed slit line if blink is complete
      if (eyeCloseRatio.current > 0.9) {
        ctx.strokeStyle = "#00FFE5";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - 11, eyeY);
        ctx.lineTo(cx + 11, eyeY);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [entryPlaying]);

  // --- LATEST MESSAGE DERIVATIVE ---
  const lastAiMessage = useMemo(() => {
    return [...messages].reverse().find((m) => m.sender === "ai");
  }, [messages]);

  // Neural badge text logic
  const isConflict = useMemo(() => {
    if (!lastAiMessage) return false;
    return (lastAiMessage.conflictScore ?? 0) > 3;
  }, [lastAiMessage]);

  const getArmResponse = (idx: number) => {
    if (!lastAiMessage || !lastAiMessage.arms) return "LOBE SENSORS INACTIVE — AWAITING UPLINK CONCEPT";
    const armName = ARM_INFOS[idx].name;
    const match = lastAiMessage.arms.find((a) => a.name === armName);
    return match ? match.response : "LOBE DORMANT DURING PREVIOUS SYNTHESIS";
  };

  // Close tooltips if clicking background
  const handleBackgroundClick = () => {
    setClickedArmIndex(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-[#020B18] text-[#E2E8F0] font-sans select-none"
      onClick={handleBackgroundClick}
    >
      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtleBorderGlow {
          0%, 100% {
            border-color: rgba(0, 255, 229, 0.3);
            box-shadow: 0 0 8px rgba(0, 255, 229, 0.1);
          }
          50% {
            border-color: rgba(0, 255, 229, 0.85);
            box-shadow: 0 0 20px rgba(0, 255, 229, 0.35);
          }
        }
        .border-glow-pulse {
          animation: subtleBorderGlow 2.5s infinite ease-in-out;
        }
        .text-rainbow-glow {
          background: linear-gradient(to right, #EF4444, #FBBF24, #00FFE5, #7C3AED, #EC4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes floatParticle {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-10vh) translateX(var(--drift));
            opacity: 0;
          }
        }
      ` }} />

      {/* --- BACKGROUND ATMOSPHERE (pointer-events-none) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Bioluminescent particles */}
        {Array.from({ length: 18 }).map((_, i) => {
          const size = Math.random() * 3 + 1.5;
          const left = Math.random() * 100;
          const duration = Math.random() * 20 + 20;
          const delay = Math.random() * -15;
          const drift = Math.random() * 100 - 50;
          const color = Math.random() > 0.5 ? "#00FFE5" : "#7C3AED";
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}`,
                animation: `floatParticle ${duration}s infinite linear`,
                animationDelay: `${delay}s`,
                top: 0,
                // @ts-ignore
                "--drift": `${drift}px`
              }}
            />
          );
        })}

        {/* Volumetric light shafts */}
        <div 
          className="absolute top-0 left-[20%] w-[120px] h-full opacity-[0.03] pointer-events-none bg-gradient-to-b from-[#00FFE5] to-transparent origin-top rotate-[-12deg]"
          style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }}
        />
        <div 
          className="absolute top-0 right-[25%] w-[160px] h-full opacity-[0.025] pointer-events-none bg-gradient-to-b from-[#7C3AED] to-transparent origin-top rotate-[8deg]"
          style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 10% 100%)" }}
        />

        {/* Faint rising bubble circles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const rSize = Math.random() * 15 + 8;
          const rLeft = Math.random() * 90 + 5;
          const rDur = Math.random() * 12 + 15;
          const rDelay = Math.random() * -10;
          return (
            <div
              key={`bubble-${i}`}
              className="absolute rounded-full border border-[#00FFE5]/20 opacity-[0.04]"
              style={{
                width: rSize,
                height: rSize,
                left: `${rLeft}%`,
                animation: `floatParticle ${rDur}s infinite linear`,
                animationDelay: `${rDelay}s`,
                top: 0,
                // @ts-ignore
                "--drift": `${Math.random() * 60 - 30}px`
              }}
            />
          );
        })}

        {/* Coral SVG Decorations */}
        <div className="absolute bottom-[-10px] left-[-10px] opacity-20 text-[#00FFE5]">
          <svg width="240" height="240" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M 10 100 Q 25 70 20 40 Q 15 10 40 20 Q 30 50 35 70" />
            <path d="M 10 100 Q 30 80 45 65 Q 60 50 50 35 Q 45 25 55 15" />
            <path d="M 10 100 Q 15 60 12 30 Q 10 5 25 15" />
            <path d="M 45 65 Q 55 75 75 70 Q 90 65 85 50 Q 80 40 70 45" strokeWidth="0.8" />
            <path d="M 20 40 Q 35 30 50 45" strokeWidth="0.8" />
          </svg>
        </div>

        <div className="absolute top-[-10px] right-[-10px] opacity-[0.14] text-[#7C3AED]">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M 90 0 Q 75 30 80 60 Q 85 90 60 80 Q 70 50 65 30" />
            <path d="M 90 0 Q 70 20 55 35 Q 40 50 50 65" />
            <path d="M 75 30 Q 60 20 45 25" strokeWidth="0.8" />
          </svg>
        </div>
      </div>

      {/* --- ENTRY ANIMATION LAYER (Full screen) --- */}
      <AnimatePresence>
        {entryPlaying && (
          <motion.div 
            className="absolute inset-0 bg-[#020B18] z-50 flex flex-col items-center justify-center overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {/* Center Animating Area */}
            <div className="relative w-[600px] h-[550px] flex flex-col items-center justify-center">
              
              {/* SVG Overlay representing the shooting bezier tentacles */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 550">
                <defs>
                  <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Staggered Bezier Arms */}
                {entryStep >= 2 && Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
                  const cx = 300;
                  const cy = 250;
                  const r = 180;
                  
                  const ex = cx + Math.cos(angle) * r;
                  const ey = cy + Math.sin(angle) * r;
                  
                  const cp1x = cx + Math.cos(angle + 0.3) * (r * 0.45);
                  const cp1y = cy + Math.sin(angle + 0.3) * (r * 0.45);
                  
                  const cp2x = ex - Math.cos(angle - 0.25) * (r * 0.4);
                  const cp2y = ey - Math.sin(angle - 0.25) * (r * 0.4);

                  return (
                    <g key={i}>
                      {/* Purple outer glow path */}
                      <motion.path
                        d={`M ${cx},${cy} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${ex},${ey}`}
                        stroke="#7C3AED"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#glow-purple)"
                        opacity="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 85,
                          damping: 14,
                          delay: i * 0.1,
                        }}
                      />
                      {/* Cyan core path */}
                      <motion.path
                        d={`M ${cx},${cy} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${ex},${ey}`}
                        stroke="#00FFE5"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#glow-cyan)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 85,
                          damping: 14,
                          delay: i * 0.1,
                        }}
                      />

                      {/* Glowing Node at Tip */}
                      <motion.circle
                        cx={ex}
                        cy={ey}
                        r="5"
                        fill="#FFFFFF"
                        stroke="#00FFE5"
                        strokeWidth="2"
                        filter="url(#glow-cyan)"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 8,
                          delay: i * 0.1 + 0.6,
                        }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Central Dot morphing to Eye */}
              <div className="relative w-36 h-36 flex items-center justify-center z-10">
                {entryStep === 1 && (
                  <motion.div
                    className="w-4 h-4 rounded-full bg-[#00FFE5]"
                    style={{ boxShadow: "0 0 15px #00FFE5" }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                )}

                {entryStep >= 2 && entryStep <= 4 && (
                  <motion.div
                    className="relative w-12 h-12 rounded-full border-2 border-[#00FFE5] flex items-center justify-center bg-[#020B18]"
                    initial={{ scale: 0.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
                  >
                    {entryStep >= 3 && (
                      <motion.div
                        className="w-1.5 h-8 bg-[#00FFE5] rounded-full"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Typewriter Terminal Area */}
              <div className="absolute bottom-8 w-full flex flex-col items-center justify-center font-mono text-[10px] tracking-[0.25em]">
                {entryStep >= 3 && (
                  <div className="flex flex-col gap-1.5 items-center">
                    <span className="text-[#00FFE5]">{typewriterText1}</span>
                    <span className="text-[#94A3B8]">{typewriterText2}</span>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NAVBAR --- */}
      <nav className="h-[56px] border-b border-white/5 bg-[#020B18]/70 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-[#94A3B8] hover:text-[#00FFE5] transition-colors uppercase border border-white/10 rounded px-3 py-1 bg-white/5 cursor-pointer"
        >
          <ArrowLeft size={11} /> BACK TO ARCHITECTURES
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#00FFE5] uppercase tracking-[0.2em] font-sans">
              🐙 OCTOPUS MIND
            </span>
          </div>
          <span className="text-[8px] font-mono tracking-[0.18em] text-[#94A3B8] uppercase mt-0.5">
            Distributed Sensory Cognition
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[9px] text-[#94A3B8] tracking-wider">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Neural Status: SECURE</span>
          <span className="border-r border-white/10 h-3" />
          <span className="flex items-center gap-1.5">Active Limbs: 8/8 <span className="w-1.5 h-1.5 rounded-full bg-[#00FFE5] animate-ping" /></span>
        </div>
      </nav>

      {/* --- MAIN SPLIT LAYOUT --- */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* LEFT PANEL (40% width) - Interactive Canvas Octopus */}
        <motion.div 
          className="w-full md:w-[40%] h-[50%] md:h-full bg-[#020B18] border-r border-white/5 flex flex-col justify-between p-6 relative overflow-hidden"
          initial={entryStep === 4 ? { width: "100%" } : {}}
          animate={entryStep === 5 ? { width: "40%" } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Top Panel Consensus/Neural Conflict status badge */}
          <div className="flex justify-between items-start z-10">
            <span className="font-mono text-[9px] tracking-widest text-[#94A3B8]">
              // PERIPHERAL RADIAL FEED
            </span>
            
            {messages.length > 0 && lastAiMessage && (
              <span 
                className={`font-mono text-[9.5px] uppercase tracking-[0.2em] px-2.5 py-0.5 rounded border ${
                  isConflict 
                    ? "border-red-500/20 text-red-400 bg-red-950/20" 
                    : "border-[#00FFE5]/20 text-[#00FFE5] bg-[#00FFE5]/5"
                }`}
              >
                ◆ {isConflict ? "NEURAL CONFLICT" : "CONSENSUS"}
              </span>
            )}
          </div>

          {/* Octopus Canvas Area (70% Height) */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 relative w-full overflow-hidden"
            style={{ maxHeight: "70%" }}
          >
            {/* Interactive Canvas Octopus */}
            {!entryPlaying && (
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-default pointer-events-auto" />
            )}

            {/* Clickable Arm Badges positioned over tips */}
            {!entryPlaying && ARM_INFOS.map((arm, i) => {
              const isResponding = activeArms.includes(arm.name);
              const isSelected = clickedArmIndex === i;
              
              // Handle rainbow color style
              const currentLobeColor = arm.color === "rainbow" ? `hsl(${rainbowHue}, 100%, 65%)` : arm.color;
              
              return (
                <div
                  key={i}
                  ref={(el) => { tipRefs.current[i] = el; }}
                  className="absolute z-20 pointer-events-auto select-none"
                  style={{ left: 0, top: 0 }}
                >
                  {/* Ping effect on active arms */}
                  {isResponding && (
                    <div 
                      className="absolute inset-0 rounded border scale-150 animate-ping opacity-60"
                      style={{ borderColor: currentLobeColor, margin: -1 }}
                    />
                  )}

                  {/* Badge Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setClickedArmIndex(isSelected ? null : i);
                    }}
                    className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border bg-[#020B18]/90 tracking-widest cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? "scale-110" 
                        : "hover:scale-105"
                    }`}
                    style={{
                      color: isSelected || isResponding ? currentLobeColor : "#94A3B8",
                      borderColor: isSelected || isResponding ? currentLobeColor : "rgba(255,255,255,0.12)",
                      boxShadow: isSelected || isResponding ? `0 0 10px ${currentLobeColor}44` : "none"
                    }}
                  >
                    {arm.name}
                  </button>

                  {/* Tooltip Popup on Tip Click */}
                  {isSelected && (
                    <div 
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-60 p-4 rounded bg-[#0a1628] border shadow-2xl z-30 pointer-events-auto cursor-default text-left"
                      style={{ borderColor: currentLobeColor }}
                      onClick={(e) => e.stopPropagation()} // Prevent closing tooltip
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-2">
                        <span className="font-mono text-[9px] uppercase font-bold tracking-wider" style={{ color: currentLobeColor }}>
                          {arm.name} LOBE FEED
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setClickedArmIndex(null);
                          }}
                          className="text-[#94A3B8] hover:text-white cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                      <p className="font-mono text-[10.5px] text-[#E2E8F0] leading-relaxed">
                        {getArmResponse(i)}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Bottom helper text */}
          <div className="w-full text-center z-10 pt-2 shrink-0">
            <span className="font-mono text-[10px] text-[#94A3B8] tracking-widest uppercase">
              [ tap a limb to query that lobe ]
            </span>
          </div>

        </motion.div>

        {/* RIGHT PANEL (60% width) - Scrollable Chat Stream */}
        <div className="flex-1 h-[50%] md:h-full bg-[#030f1a] flex flex-col justify-between overflow-hidden relative">
          
          {/* Top Bar uplink stream badge */}
          <div className="h-[46px] border-b border-white/5 bg-[#030f1a]/80 backdrop-blur-md px-6 flex items-center font-mono text-[10px] text-[#00FFE5] tracking-widest shrink-0 select-text">
            // UPLINK STREAM — {initialConcept.toUpperCase()}
          </div>

          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin select-text">
            {messages.length === 0 && !isThinking && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <span className="font-mono text-[10px] tracking-widest text-[#00FFE5] uppercase">
                  Awaiting Neural Feed Integration...
                </span>
              </div>
            )}

            {messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div key={msg.id} className="flex justify-end select-text">
                    <div className="border border-[#00FFE5] rounded-full px-5 py-2.5 max-w-[80%] bg-[#020b18]/60 text-right">
                      <p className="font-mono text-[12px] text-[#00FFE5] tracking-wide">
                        &gt;_ {msg.text}
                      </p>
                    </div>
                  </div>
                );
              } else {
                // AI Response Structured Card
                const isExpanded = expandedCardId === msg.id;
                const dominantLobeInfo = ARM_INFOS.find(a => a.name === msg.dominantLobe);
                let dominantColor = dominantLobeInfo?.color || "#00FFE5";
                if (dominantColor === "rainbow") {
                  dominantColor = `hsl(${rainbowHue}, 100%, 65%)`;
                }

                return (
                  <div key={msg.id} className="flex justify-start w-full select-text">
                    {/* Glow pulse animation strictly around border only, no fade/blur */}
                    <div className="w-full bg-[#0a1628] rounded border border-glow-pulse flex flex-col text-left p-5 relative overflow-hidden">
                      
                      {/* Glow line decoration */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00FFE5]" />

                      {/* Header */}
                      <div className="font-mono text-[10px] text-[#7C3AED] tracking-[0.25em] mb-3 uppercase">
                        // CENTRAL NODE SYNTHESIS:
                      </div>

                      {/* Synthesis Response */}
                      <p className="text-[14px] text-[#E2E8F0] leading-relaxed font-sans font-light select-text mb-4">
                        {msg.synthesis}
                      </p>

                      {/* Expandable Section: Process Logs */}
                      <div className="border-t border-white/5 pt-3 mb-4">
                        <button
                          onClick={() => setExpandedCardId(isExpanded ? null : msg.id)}
                          className="flex items-center gap-2 font-mono text-[9.5px] text-[#94A3B8] hover:text-[#00FFE5] tracking-wider uppercase cursor-pointer"
                        >
                          <span>{isExpanded ? "▼" : "▶"} // COGNITIVE PROCESS LOGS</span>
                        </button>

                        {isExpanded && msg.arms && (
                          <div className="mt-3 pl-2 space-y-2 border-l border-white/5">
                            {msg.arms.map((arm, index) => {
                              const lobeColorInfo = ARM_INFOS.find(a => a.name === arm.name);
                              let armColor = lobeColorInfo?.color || "#00FFE5";
                              if (armColor === "rainbow") {
                                armColor = `hsl(${rainbowHue}, 100%, 65%)`;
                              }

                              return (
                                <div key={index} className="font-mono text-[10px] leading-relaxed select-text">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span 
                                      className="w-1.5 h-1.5 rounded-full" 
                                      style={{ 
                                        backgroundColor: lobeColorInfo?.color === "rainbow" ? "transparent" : armColor,
                                        background: lobeColorInfo?.color === "rainbow" ? `linear-gradient(to right, #EF4444, #FBBF24, #00FFE5, #7C3AED, #EC4899)` : undefined,
                                        boxShadow: `0 0 6px ${armColor}` 
                                      }} 
                                    />
                                    <span style={{ color: armColor }} className="font-bold tracking-widest">{arm.name} LOBE:</span>
                                  </div>
                                  <p className="text-[#94A3B8] pl-3.5 select-text">{arm.response}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center font-mono text-[9px] text-[#94A3B8] tracking-widest border-t border-white/5 pt-3">
                        <div>
                          CONFLICT SCORE: <span className="text-[#00FFE5] font-bold">{msg.conflictScore}/8</span>
                        </div>
                        <div>
                          DOMINANT LOBE: <span style={{ color: dominantColor }} className="font-bold">{msg.dominantLobe}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              }
            })}

            {/* --- THINKING / LOADING CARD --- */}
            {isThinking && (
              <div className="flex justify-start w-full">
                <div className="w-full bg-[#0a1628] rounded border border-[#00FFE5]/50 flex flex-col text-left p-5 relative overflow-hidden">
                  
                  {/* Glowing progress line */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#00FFE5]" />

                  {/* Header */}
                  <div className="font-mono text-[10px] text-[#00FFE5] tracking-[0.25em] mb-4 uppercase flex justify-between items-center">
                    <span>// POLLING 8 LOBES...</span>
                    <span className="text-[#94A3B8]">{Math.round(thinkingProgress)}%</span>
                  </div>

                  {/* Cyan progress bar */}
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-5">
                    <div 
                      className="h-full bg-[#00FFE5] transition-all duration-100 ease-out" 
                      style={{ width: `${thinkingProgress}%` }}
                    />
                  </div>

                  {/* 8 rows check-in list */}
                  <div className="space-y-2.5 mb-5 pl-1.5">
                    {ARM_INFOS.map((arm, index) => {
                      const isLobeChecked = checkedLobes[index];
                      const lobeColor = arm.color === "rainbow" ? `hsl(${rainbowHue}, 100%, 65%)` : arm.color;
                      return (
                        <div 
                          key={index} 
                          className="flex items-center justify-between font-mono text-[9.5px] tracking-wider"
                        >
                          <div className="flex items-center gap-2">
                            <span 
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                isLobeChecked ? "bg-emerald-400" : "bg-white/10"
                              }`}
                              style={{ 
                                boxShadow: isLobeChecked ? "0 0 6px #34D399" : "none" 
                              }}
                            />
                            <span style={{ color: lobeColor }} className="font-semibold">{arm.name} LOBE:</span>
                          </div>
                          
                          <span className={isLobeChecked ? "text-emerald-400" : "text-white/20"}>
                            {isLobeChecked ? "ACTIVE REPORT INTEGRATED" : "CHECKING LOBE FEED..."}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom integrations status with pulsing dots */}
                  <div className="border-t border-white/5 pt-3.5 flex items-center gap-1 font-mono text-[9.5px] text-[#94A3B8] tracking-widest uppercase">
                    INTEGRATING SENSORY SPECTRUM
                    <span className="flex gap-0.5 ml-1">
                      <span className="w-1 h-1 rounded-full bg-[#00FFE5] animate-ping" style={{ animationDelay: "0s" }} />
                      <span className="w-1 h-1 rounded-full bg-[#00FFE5] animate-ping" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1 h-1 rounded-full bg-[#00FFE5] animate-ping" style={{ animationDelay: "0.4s" }} />
                    </span>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Bottom input bar */}
          <div className="h-[76px] border-t border-white/5 bg-[#030f1a] flex items-center px-6 shrink-0 z-10 relative">
            <form onSubmit={handleSend} className="w-full flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isThinking}
                placeholder="PROBE OCTOPUS CENTRAL NODE SYSTEM..."
                className="flex-1 bg-[#020b18] border border-white/10 rounded px-4 py-2 text-[12px] font-mono text-[#E2E8F0] placeholder:text-[#94A3B8]/40 outline-none focus:border-[#00FFE5]/50 focus:box-shadow-[0_0_10px_rgba(0,255,229,0.15)] transition-all duration-300"
              />
              <button
                type="submit"
                disabled={isThinking || !inputValue.trim()}
                className="w-10 h-10 rounded bg-[#00FFE5] text-[#020B18] flex items-center justify-center cursor-pointer hover:bg-[#00FFE5]/85 disabled:bg-white/5 disabled:text-[#94A3B8]/30 transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
