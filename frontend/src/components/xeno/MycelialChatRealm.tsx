import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, X, Terminal } from "lucide-react";
import { simulateMycelium } from "@/lib/xeno-mock";

interface MycelialNode {
  id: string;
  label: string;
  type: "root" | "hypha" | "spore";
  // Physics coordinates
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Visuals
  targetRadius: number;
  radius: number;
  sproutTime: number;
  description?: string;
}

interface MycelialEdge {
  from: string;
  to: string;
  strength: number;
  sproutTime: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  synthesis?: string;
  spreadScore?: number;
  dominantPath?: string[];
  nodes?: { label: string; response: string }[];
  timestamp: number;
}

interface MycelialChatRealmProps {
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

const STATIC_HYPHAE = [
  { label: "loam", desc: "Mineral soil substrate containing decayed organic matter." },
  { label: "carbon", desc: "Energy substrate exchanged throughout the network nodes." },
  { label: "spore", desc: "Reproductive node propagating neural connections." },
  { label: "share", desc: "Resource allocation lobe distributing nutrient signals." },
  { label: "exchange", desc: "Bidirectional chemical signaling boundary." },
  { label: "below", desc: "Deep subterranean memory substrate linking old growths." }
];

export function MycelialChatRealm({ initialConcept, onClose }: MycelialChatRealmProps) {
  // --- STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const [checkedLogs, setCheckedLogs] = useState<string[]>([]);
  const [showLogsOverlay, setShowLogsOverlay] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 400 });
  
  // Interactive UI States
  const [clickedNodeId, setClickedNodeId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Network simulation data
  const [networkNodes, setNetworkNodes] = useState<MycelialNode[]>([]);
  const [networkEdges, setNetworkEdges] = useState<MycelialEdge[]>([]);
  const [dominantPath, setDominantPath] = useState<string[]>([]);
  const [responseTimeStamp, setResponseTimeStamp] = useState<number>(0);
  
  // Canvas refs
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Cache variables in refs to prevent re-instantiating the Canvas draw loop
  const nodesRef = useRef<MycelialNode[]>([]);
  const edgesRef = useRef<MycelialEdge[]>([]);
  const dominantPathRef = useRef<string[]>([]);
  const responseTimeRef = useRef<number>(0);
  const isThinkingRef = useRef(isThinking);

  // Sync refs with state
  useEffect(() => {
    nodesRef.current = networkNodes;
  }, [networkNodes]);

  useEffect(() => {
    edgesRef.current = networkEdges;
  }, [networkEdges]);

  useEffect(() => {
    dominantPathRef.current = dominantPath;
  }, [dominantPath]);

  useEffect(() => {
    responseTimeRef.current = responseTimeStamp;
  }, [responseTimeStamp]);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  // Disable body scroll when mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // --- INITIALIZE DEFAULT NETWORK STRUCTURE ---
  const initializeNetwork = useCallback((concept: string) => {
    const w = 400; // fallback width
    const h = 400; // fallback height
    
    // Create Root
    const rootNode: MycelialNode = {
      id: "root",
      label: concept.toUpperCase(),
      type: "root",
      x: w / 2,
      y: h / 2,
      vx: 0,
      vy: 0,
      targetRadius: 18,
      radius: 18,
      sproutTime: Date.now() - 1000
    };

    // Create 5 Hypha nodes in circle
    const hyphae: MycelialNode[] = STATIC_HYPHAE.map((hInfo, i) => {
      const angle = (i / STATIC_HYPHAE.length) * Math.PI * 2;
      const dist = 120 + Math.random() * 30;
      return {
        id: `hypha-${hInfo.label}`,
        label: hInfo.label.toUpperCase(),
        type: "hypha",
        x: w / 2 + Math.cos(angle) * dist,
        y: h / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        targetRadius: 10,
        radius: 10,
        sproutTime: Date.now() - 1000,
        description: hInfo.desc
      };
    });

    // Create Spores
    const spores: MycelialNode[] = Array.from({ length: 8 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 170 + Math.random() * 50;
      return {
        id: `spore-${i}`,
        label: "SPORE",
        type: "spore",
        x: w / 2 + Math.cos(angle) * dist,
        y: h / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        targetRadius: 5,
        radius: 5,
        sproutTime: Date.now() - 1000
      };
    });

    // Connections (Root to Hyphae)
    const initialEdges: MycelialEdge[] = hyphae.map(hn => ({
      from: "root",
      to: hn.id,
      strength: 0.4 + Math.random() * 0.5,
      sproutTime: Date.now() - 1000
    }));

    setNetworkNodes([rootNode, ...hyphae, ...spores]);
    setNetworkEdges(initialEdges);
  }, []);

  // --- SESSION STORAGE INITIALIZATION & INITIAL CONCEPT RUNNER ---
  useEffect(() => {
    const saved = sessionStorage.getItem("xeno_mycelial_conversation");
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
        console.error("Error loading mycelial session:", e);
      }
    }

    // Always seed initial concept if it's new
    const userMsgs = loadedMessages.filter(m => m.sender === "user");
    const lastUserMsg = userMsgs[userMsgs.length - 1];

    if (hasSavedSession) {
      setMessages(loadedMessages);
      
      // Load last AI message metrics
      const lastAi = [...loadedMessages].reverse().find(m => m.sender === "ai");
      if (lastAi) {
        setDominantPath(lastAi.dominantPath || []);
        initializeNetwork(lastAi.nodes?.[0]?.label || initialConcept);
      } else {
        initializeNetwork(initialConcept);
      }

      if (initialConcept && (!lastUserMsg || lastUserMsg.text !== initialConcept)) {
        triggerQuery(initialConcept);
      }
    } else {
      initializeNetwork(initialConcept);
      triggerQuery(initialConcept);
    }
  }, [initialConcept]);

  // --- TRIGGER SIMULATION FUNCTION (6s Slow Chemical Loader) ---
  const triggerQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim() || isThinkingRef.current) return;

    setClickedNodeId(null);
    setIsThinking(true);
    setThinkingProgress(0);
    setCheckedLogs([]);

    // Append User message instantly
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: "user",
      text: queryText,
      timestamp: Date.now()
    };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      sessionStorage.setItem("xeno_mycelial_conversation", JSON.stringify(updated));
      return updated;
    });

    const startTime = Date.now();
    let apiData: any = null;
    let animDone = false;

    // Trigger simulateMycelium API
    simulateMycelium(queryText)
      .then((data) => {
        apiData = data;
        checkCompletion();
      })
      .catch((err) => {
        console.error("simulateMycelium failed:", err);
        setIsThinking(false);
      });

    // Slow Chemical Diffusion log runner (6000ms duration)
    const duration = 6000;
    const logTimeline = [
      { t: 0, text: "SIGNAL PROPAGATING THROUGH ROOT..." },
      { t: 800, text: "DIFFUSING CHEMICAL GRADIENTS TO SUBSTRATE..." },
      { t: 1600, text: "HYPHA BRANCH INITIATING: carbon exchange nodes..." },
      { t: 2400, text: "SPORE NODE AMPLIFICATION: active absorption..." },
      { t: 3200, text: "ROUTING ORGANIC RESISTANCE: adjusting chemical potential..." },
      { t: 4000, text: "LOAM GRADIENTS INTERSECTING: merging signals..." },
      { t: 4800, text: "RESOLVING DECISION MATRIX: stabilizing pathways..." },
      { t: 5600, text: "NUTRIENT consensus spike: preparing synthesis..." }
    ];

    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setThinkingProgress(progress);

      // Append logs sequentially
      const triggeredLogs = logTimeline
        .filter(l => elapsed >= l.t)
        .map(l => {
          const timestamp = new Date(startTime + l.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          return `$ [${timestamp}] ${l.text}`;
        });
      setCheckedLogs(triggeredLogs);

      if (elapsed >= duration) {
        clearInterval(updateInterval);
        animDone = true;
        checkCompletion();
      }
    }, 50);

    function checkCompletion() {
      if (apiData && animDone) {
        // Map API response to our custom mycelial chat format
        // API returns nodes like [{ id, label, size, depth }]. We map to type and add description.
        const nodesMapped = apiData.nodes.map((n: any) => ({
          label: n.label.toUpperCase(),
          response: `Spread activity spikes ${Math.round((n.size || 10) * 4)}% matching substrate loam.`
        }));

        const activePath = apiData.nodes.slice(0, 3).map((n: any) => n.id);
        const synthesisText = `Decentralized mycorrhizal mesh resolves: "${apiData.consensus || 'Partial link established via loam gradient.'}"`;

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}-${Math.random()}`,
          sender: "ai",
          synthesis: synthesisText,
          spreadScore: Math.min(100, Math.max(10, Math.round(apiData.nodes.length * 8 + Math.random() * 12))),
          dominantPath: activePath.map((id: string) => {
            const match = apiData.nodes.find((n: any) => n.id === id);
            return match ? match.label.toUpperCase() : "HYPHA";
          }),
          nodes: nodesMapped,
          timestamp: Date.now()
        };

        // Update main chat list
        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          sessionStorage.setItem("xeno_mycelial_conversation", JSON.stringify(updated));
          return updated;
        });

        // Trigger dynamic graph growth with newly returned terms!
        triggerNetworkGrowth(apiData, activePath);
        setIsThinking(false);
      }
    }
  }, [initializeNetwork]);

  // --- DYNAMIC GRAPH GROWTH ANIMATION ON NEW DATA ---
  const triggerNetworkGrowth = (apiData: any, activePath: string[]) => {
    setResponseTimeStamp(Date.now());
    setDominantPath(activePath);

    // Get current nodes and see if we need to add new ones
    setNetworkNodes((prevNodes) => {
      const updatedNodes = [...prevNodes];
      
      // Update root label
      const rootNode = updatedNodes.find(n => n.id === "root");
      if (rootNode && apiData.nodes[0]) {
        rootNode.label = apiData.nodes[0].label.toUpperCase();
      }

      // Add new hypha nodes if they aren't in the graph yet
      apiData.nodes.slice(1, 5).forEach((apiNode: any, index: number) => {
        const nodeID = `hypha-${apiNode.label.toLowerCase()}`;
        if (!updatedNodes.some(n => n.id === nodeID)) {
          // Calculate spawn position spreading outward from center
          const angle = Math.random() * Math.PI * 2;
          const dist = 130 + Math.random() * 40;
          const w = canvasRef.current?.width ? canvasRef.current.width / window.devicePixelRatio : 400;
          const h = canvasRef.current?.height ? canvasRef.current.height / window.devicePixelRatio : 400;

          updatedNodes.push({
            id: nodeID,
            label: apiNode.label.toUpperCase(),
            type: "hypha",
            x: w / 2 + Math.cos(angle) * dist,
            y: h / 2 + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            targetRadius: 10,
            radius: 0, // Starts at 0 for sprouting animation!
            sproutTime: Date.now(),
            description: `Diffused chemical link representing concept association.`
          });
        }
      });

      return updatedNodes;
    });

    // Add new edges progressively
    setNetworkEdges((prevEdges) => {
      const updatedEdges = [...prevEdges];

      apiData.nodes.slice(1, 5).forEach((apiNode: any) => {
        const nodeID = `hypha-${apiNode.label.toLowerCase()}`;
        if (!updatedEdges.some(e => e.to === nodeID)) {
          updatedEdges.push({
            from: "root",
            to: nodeID,
            strength: 0.4 + Math.random() * 0.5,
            sproutTime: Date.now()
          });
        }
      });

      return updatedEdges;
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    triggerQuery(inputValue.trim());
    setInputValue("");
  };

  // --- CANVAS GRAPH SIMULATION AND RENDERING LOOP ---
  useEffect(() => {
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
          setCanvasDimensions({ width: newWidth, height: newHeight });
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          // If nodes are initialized, keep root centered on resize
          nodesRef.current.forEach((n) => {
            if (n.id === "root") {
              n.x = width / 2;
              n.y = height / 2;
            }
          });
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

      // 1. Opaque dark background
      ctx.fillStyle = "#020a06";
      ctx.fillRect(0, 0, width, height);

      const time = Date.now() * 0.001;
      const center = { x: width / 2, y: height / 2 };

      // Make sure root stays centered
      const rootNode = nodesRef.current.find(n => n.id === "root");
      if (rootNode) {
        rootNode.x = center.x;
        rootNode.y = center.y;
      }

      // --- RUN GENTLE SPRING SIMULATION ---
      nodesRef.current.forEach((n) => {
        if (n.id === "root") return;

        // Sprouting animation: grow radius from 0 to targetRadius over 800ms
        const age = Date.now() - n.sproutTime;
        const sproutProgress = Math.min(1.0, age / 800);
        n.radius = n.targetRadius * sproutProgress;

        // Force calculations
        let fx = 0;
        let fy = 0;

        // 1. Weak gravity pulling towards root center
        const dx = center.x - n.x;
        const dy = center.y - n.y;
        const dist = Math.hypot(dx, dy) || 1;
        
        if (n.type === "hypha") {
          // spring attraction to center
          const k = 0.0003;
          const restLength = 120;
          const extension = dist - restLength;
          fx += (dx / dist) * extension * k;
          fy += (dy / dist) * extension * k;
        } else {
          // spores gravitate weakly
          fx += (dx / dist) * 0.003;
          fy += (dy / dist) * 0.003;
        }

        // 2. Node-node repulsion
        nodesRef.current.forEach((other) => {
          if (other.id === n.id) return;
          const odx = n.x - other.x;
          const ody = n.y - other.y;
          const odist = Math.hypot(odx, ody) || 1;
          const minDist = n.radius + other.radius + 35;
          if (odist < minDist) {
            const force = (minDist - odist) * 0.007;
            fx += (odx / odist) * force;
            fy += (ody / odist) * force;
          }
        });

        // Apply forces & drift
        n.vx = (n.vx + fx) * 0.92;
        n.vy = (n.vy + fy) * 0.92;

        n.x += n.vx;
        n.y += n.vy;

        // Add gentle sin wave float drift
        if (n.type === "hypha") {
          n.x += Math.sin(time * 0.7 + n.x * 0.01) * 0.06;
          n.y += Math.cos(time * 0.7 + n.y * 0.01) * 0.06;
        } else {
          // Spores float more freely
          n.x += Math.sin(time * 1.2 + n.x * 0.05) * 0.12;
          n.y += Math.cos(time * 1.2 + n.y * 0.05) * 0.12;
        }

        // Keep inside boundaries
        n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x));
        n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y));
      });

      // --- 2. DRAW STATIC BRANCHING BACKGROUND ROOT TEXTURE ---
      ctx.strokeStyle = "rgba(34, 197, 94, 0.045)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Simple fixed root decoration on canvas
      ctx.moveTo(0, height); ctx.quadraticCurveTo(width * 0.25, height * 0.6, width * 0.1, height * 0.4);
      ctx.moveTo(width, 0); ctx.quadraticCurveTo(width * 0.7, height * 0.3, width * 0.8, height * 0.6);
      ctx.stroke();

      // --- 3. DRAW EDGES (Bezier paths) ---
      edgesRef.current.forEach((edge) => {
        const fromNode = nodesRef.current.find(n => n.id === edge.from);
        const toNode = nodesRef.current.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return;

        // Edge age/drawing animation
        const edgeAge = Date.now() - edge.sproutTime;
        const edgeProgress = Math.min(1.0, edgeAge / 800);

        // Coordinates
        const bx = fromNode.x;
        const by = fromNode.y;
        const ex = toNode.x;
        const ey = toNode.y;

        // Curved organic bezier controls
        const angle = Math.atan2(ey - by, ex - bx);
        const dist = Math.hypot(ex - bx, ey - by);
        const cp1x = bx + Math.cos(angle + 0.45) * (dist * 0.45);
        const cp1y = by + Math.sin(angle + 0.45) * (dist * 0.45);
        const cp2x = ex - Math.cos(angle - 0.25) * (dist * 0.35);
        const cp2y = ey - Math.sin(angle - 0.25) * (dist * 0.35);

        // Highlights for dominantPath edges
        const isDominant = dominantPathRef.current.includes(toNode.id.replace("hypha-", "").toUpperCase());
        const timeSinceResponse = Date.now() - responseTimeRef.current;
        const pulseCycle = 1500; // ms
        const pulsesCount = 3;
        
        // Active pulse effect check
        let isGlowPulse = false;
        let pulseLocation = 0.0; // t on bezier
        if (isDominant && timeSinceResponse < pulseCycle * pulsesCount) {
          isGlowPulse = true;
          pulseLocation = (timeSinceResponse % pulseCycle) / pulseCycle;
        }

        // Draw bezier segments up to edgeProgress
        ctx.beginPath();
        ctx.moveTo(bx, by);
        
        const slices = 30;
        const drawLimit = Math.floor(slices * edgeProgress);
        
        for (let s = 1; s <= drawLimit; s++) {
          const t = (s / slices) * edgeProgress;
          const p = getBezierPoint(t, bx, by, cp1x, cp1y, cp2x, cp2y, ex, ey);
          ctx.lineTo(p.x, p.y);
        }
        
        // Coloring
        if (isDominant) {
          // Bright white-green dominant path edge
          ctx.strokeStyle = "rgba(134, 239, 172, 0.95)";
          ctx.lineWidth = isGlowPulse ? 3.5 : 2.5;
          ctx.shadowColor = "#4ade80";
          ctx.shadowBlur = 8;
        } else {
          // Standard soft green edge
          ctx.strokeStyle = `rgba(34, 197, 94, ${edge.strength * 0.7})`;
          ctx.lineWidth = 1.6;
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset

        // Draw additional dominant pulse travel overlay
        if (isGlowPulse) {
          const pulsePos = getBezierPoint(pulseLocation, bx, by, cp1x, cp1y, cp2x, cp2y, ex, ey);
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowColor = "#AFFFCF";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(pulsePos.x, pulsePos.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // Reset
        }

        // --- 4. SIGNAL TRAVEL DOTS (Slow Traversal) ---
        if (!isThinkingRef.current) {
          const dotsCount = 2;
          const loopDuration = 5500; // slow chemical traversal
          
          for (let d = 0; d < dotsCount; d++) {
            const startOffset = d * (loopDuration / dotsCount);
            const dotT = ((Date.now() + startOffset) % loopDuration) / loopDuration;
            
            // Limit dot position based on edge draw growth
            if (dotT <= edgeProgress) {
              const dotPos = getBezierPoint(dotT, bx, by, cp1x, cp1y, cp2x, cp2y, ex, ey);
              
              // Draw glowing green dot with white core
              ctx.fillStyle = "rgba(134, 239, 172, 0.4)";
              ctx.beginPath();
              ctx.arc(dotPos.x, dotPos.y, 4.5, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "#FFFFFF";
              ctx.beginPath();
              ctx.arc(dotPos.x, dotPos.y, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      });

      // --- 5. DRAW NODES ---
      nodesRef.current.forEach((node) => {
        if (node.radius <= 0) return;

        ctx.save();
        
        if (node.type === "root") {
          // pulsing root scale
          const pulseScale = 1.0 + Math.sin(time * (Math.PI * 2 / 3.0)) * 0.085;
          const finalR = node.radius * pulseScale;

          // Glowing Halo
          ctx.fillStyle = "rgba(175, 255, 207, 0.12)";
          ctx.beginPath();
          ctx.arc(node.x, node.y, finalR * 2.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(175, 255, 207, 0.28)";
          ctx.beginPath();
          ctx.arc(node.x, node.y, finalR * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Core node
          const radGrad = ctx.createRadialGradient(
            node.x - finalR * 0.2, node.y - finalR * 0.2, 0.5,
            node.x, node.y, finalR
          );
          radGrad.addColorStop(0, "#FFFFFF");
          radGrad.addColorStop(0.3, "#AFFFCF");
          radGrad.addColorStop(1, "#22C55E");
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, finalR, 0, Math.PI * 2);
          ctx.fill();

          // Label
          ctx.fillStyle = "#AFFFCF";
          ctx.font = "bold 9.5px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // Draw text with a very dark background stroke to ensure legibility
          ctx.strokeStyle = "#020a06";
          ctx.lineWidth = 3.5;
          ctx.strokeText(node.label, node.x, node.y + finalR + 15);
          ctx.fillText(node.label, node.x, node.y + finalR + 15);

        } else if (node.type === "hypha") {
          const isHighlight = dominantPathRef.current.includes(node.label);

          // Glowing halo if highlighted
          if (isHighlight) {
            ctx.fillStyle = "rgba(74, 222, 128, 0.25)";
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = "rgba(34, 197, 94, 0.12)";
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 1.6, 0, Math.PI * 2);
            ctx.fill();
          }

          // Core
          ctx.fillStyle = isHighlight ? "#AFFFCF" : "#22C55E";
          ctx.strokeStyle = "#020a06";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Label
          ctx.fillStyle = isHighlight ? "#AFFFCF" : "#6b7280";
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeStyle = "#020a06";
          ctx.lineWidth = 3;
          ctx.strokeText(node.label, node.x, node.y + node.radius + 12);
          ctx.fillText(node.label, node.x, node.y + node.radius + 12);

        } else {
          // Spore Node
          ctx.fillStyle = "rgba(22, 101, 52, 0.6)";
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      rafId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  // --- CLICK COORDINATES DETECTOR FOR TOOLTIPS ---
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Search for clicked hypha node
    let matchedNode: MycelialNode | null = null;
    for (const node of nodesRef.current) {
      if (node.type === "hypha") {
        const dist = Math.hypot(node.x - clickX, node.y - clickY);
        // Click tolerance of radius + 15px
        if (dist <= node.radius + 15) {
          matchedNode = node;
          break;
        }
      }
    }

    if (matchedNode) {
      setClickedNodeId(matchedNode.id);
    } else {
      setClickedNodeId(null);
    }
  };

  const handleContainerClick = () => {
    setClickedNodeId(null);
  };

  // Find currently clicked node metadata
  const selectedNode = useMemo(() => {
    return networkNodes.find(n => n.id === clickedNodeId);
  }, [clickedNodeId, networkNodes]);

  const lastAiMessage = useMemo(() => {
    return [...messages].reverse().find(m => m.sender === "ai");
  }, [messages]);

  const getNodeAssociationResponse = (label: string) => {
    if (!lastAiMessage || !lastAiMessage.nodes) return "LOBE FEED DORMANT — CONCEPT SIGNAL INACTIVE";
    const match = lastAiMessage.nodes.find(n => n.label === label);
    return match ? match.response : "NODE SUB-SIGNAL INACTIVE FOR THIS CONCEPT PATHWAY";
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-[#020a06] text-[#E2E8F0] font-sans select-none"
      onClick={handleContainerClick}
    >
      {/* Dynamic Keyframes Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes borderGreenPulse {
          0%, 100% {
            border-color: rgba(34, 197, 94, 0.3);
            box-shadow: 0 0 8px rgba(34, 197, 94, 0.15);
          }
          50% {
            border-color: rgba(34, 197, 94, 0.9);
            box-shadow: 0 0 18px rgba(34, 197, 94, 0.4);
          }
        }
        .border-green-pulse {
          animation: borderGreenPulse 2.8s infinite ease-in-out;
        }
        @keyframes driftSpore {
          0% {
            transform: translateY(100vh) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.55;
          }
          90% {
            opacity: 0.55;
          }
          100% {
            transform: translateY(-10vh) translateX(var(--drift)) scale(0.85);
            opacity: 0;
          }
        }
      ` }} />

      {/* --- BACKGROUND ATMOSPHERE (Drifting spores) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soil Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-[#0a0a06] to-transparent opacity-80" />
        
        {/* Floating Spores */}
        {Array.from({ length: 24 }).map((_, i) => {
          const size = Math.random() * 2.5 + 1.2;
          const left = Math.random() * 100;
          const duration = Math.random() * 25 + 25;
          const delay = Math.random() * -20;
          const drift = Math.random() * 80 - 40;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-[#22C55E]"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                boxShadow: "0 0 6px rgba(34, 197, 94, 0.6)",
                animation: `driftSpore ${duration}s infinite linear`,
                animationDelay: `${delay}s`,
                top: 0,
                // @ts-ignore
                "--drift": `${drift}px`
              }}
            />
          );
        })}
      </div>

      {/* --- NAVBAR --- */}
      <nav className="h-[56px] border-b border-green-950/20 bg-[#020a06]/85 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-[#6b7280] hover:text-[#22C55E] transition-colors uppercase border border-green-950/30 rounded px-3 py-1 bg-green-950/5 cursor-pointer"
        >
          <ArrowLeft size={11} /> BACK TO ARCHITECTURES
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[12px] font-bold text-[#22C55E] uppercase tracking-[0.2em] font-mono">
            ⬡ MYCELIAL NETWORK
          </span>
          <span className="text-[8px] font-mono tracking-[0.18em] text-[#6b7280] uppercase mt-0.5">
            Organic Chemical Loom
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[9px] text-[#6b7280] tracking-wider">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> Substrate: ONLINE</span>
          <span className="border-r border-green-950/30 h-3" />
          <span className="flex items-center gap-1.5">Hyphae: ACTIVE <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" /></span>
        </div>
      </nav>

      {/* --- MAIN SPLIT LAYOUT --- */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* LEFT PANEL (45% width) - Interactive Canvas Network */}
        <div className="w-full md:w-[45%] h-[50%] md:h-full bg-[#020a06] border-r border-green-950/20 flex flex-col justify-between p-6 relative overflow-hidden">
          
          <div className="flex justify-between items-start z-10">
            <span className="font-mono text-[9px] tracking-widest text-[#6b7280]">
              // CHEMICAL GRADIENT MONITOR
            </span>
          </div>

          {/* Canvas Wrapper */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 relative w-full overflow-hidden"
          >
            <canvas 
              ref={canvasRef} 
              onClick={handleCanvasClick}
              className="absolute inset-0 w-full h-full block cursor-pointer pointer-events-auto" 
            />

            {/* Clicked Node Tooltip popup */}
            {selectedNode && selectedNode.type === "hypha" && (
              <div 
                className="absolute z-30 w-64 p-4 rounded bg-[#081a0e] border border-[#22C55E] shadow-2xl pointer-events-auto cursor-default text-left"
                style={{
                  left: `${Math.min(canvasDimensions.width - 275, Math.max(15, selectedNode.x - 128))}px`,
                  top: `${Math.min(canvasDimensions.height - 180, Math.max(15, selectedNode.y - 145))}px`
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-green-950/30 pb-1.5 mb-2">
                  <span className="font-mono text-[9.5px] uppercase font-bold tracking-wider text-[#AFFFCF]">
                    ◉ {selectedNode.label} NODE
                  </span>
                  <button 
                    onClick={() => setClickedNodeId(null)}
                    className="text-[#6b7280] hover:text-[#22C55E] cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </div>
                <p className="font-mono text-[10.5px] text-[#AFFFCF] leading-tight mb-2">
                  {selectedNode.description}
                </p>
                <p className="font-mono text-[10px] text-[#6b7280] leading-snug border-t border-green-950/20 pt-1.5">
                  {getNodeAssociationResponse(selectedNode.label)}
                </p>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="w-full flex items-center justify-between border-t border-green-950/30 pt-3 z-10 shrink-0 font-mono text-[9.5px] text-[#6b7280] tracking-widest uppercase">
            <span>
              ▸ mycelial network: {networkNodes.filter(n => n.type === 'hypha').length} segments · active paths highlighted
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLogsOverlay(true);
              }}
              className="text-[#22C55E] hover:text-[#AFFFCF] transition-colors cursor-pointer font-bold border border-green-900/30 rounded px-2.5 py-0.5 bg-green-950/5"
            >
              [ SHOW GROWTH LOG ]
            </button>
          </div>

        </div>

        {/* RIGHT PANEL (55% width) - Chat Stream */}
        <div className="flex-1 h-[50%] md:h-full bg-[#030f07] flex flex-col justify-between overflow-hidden relative">
          
          <div className="h-[46px] border-b border-green-950/20 bg-[#030f07]/80 backdrop-blur-md px-6 flex items-center font-mono text-[10px] text-[#22C55E] tracking-widest shrink-0 select-text">
            // CHEMICAL SIGNAL RECEIVED — {initialConcept.toUpperCase()}
          </div>

          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin select-text">
            {messages.length === 0 && !isThinking && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <span className="font-mono text-[10px] tracking-widest text-[#22C55E] uppercase">
                  Awaiting Chemical Gradient Influx...
                </span>
              </div>
            )}

            {messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div key={msg.id} className="flex justify-end select-text">
                    <div className="border border-[#22C55E]/30 rounded-full px-5 py-2.5 max-w-[80%] bg-[#22c55e]/5 text-right">
                      <p className="font-mono text-[12px] text-[#22C55E] tracking-wide">
                        &gt;_ {msg.text}
                      </p>
                    </div>
                  </div>
                );
              } else {
                // AI Mycelial Synthesis structured card
                const isExpanded = expandedCardId === msg.id;
                
                return (
                  <div key={msg.id} className="flex justify-start w-full select-text">
                    <div className="w-full bg-[#081a0e] rounded border border-green-pulse flex flex-col text-left p-5 relative overflow-hidden select-text">
                      
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#22C55E]" />

                      {/* Header */}
                      <div className="font-mono text-[10px] text-[#22C55E] tracking-[0.25em] mb-3 uppercase">
                        // MYCELIAL SYNTHESIS:
                      </div>

                      {/* Text synthesis */}
                      <p className="text-[14px] text-[#E2E8F0] leading-relaxed font-sans font-light select-text mb-4">
                        {msg.synthesis}
                      </p>

                      {/* Expandable Logs */}
                      <div className="border-t border-green-950/20 pt-3 mb-4">
                        <button
                          onClick={() => setExpandedCardId(isExpanded ? null : msg.id)}
                          className="flex items-center gap-2 font-mono text-[9.5px] text-[#6b7280] hover:text-[#22C55E] tracking-wider uppercase cursor-pointer"
                        >
                          <span>{isExpanded ? "▼" : "▶"} // NETWORK GROWTH LOG</span>
                        </button>

                        {isExpanded && msg.nodes && (
                          <div className="mt-3 pl-2 space-y-2.5 border-l border-green-950/25">
                            {msg.nodes.map((node, index) => (
                              <div key={index} className="font-mono text-[10px] leading-relaxed select-text">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[#22C55E]">◉</span>
                                  <span className="text-[#22C55E] font-bold tracking-widest">{node.label} NODE:</span>
                                </div>
                                <p className="text-[#6b7280] pl-4 select-text">{node.response}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center font-mono text-[9px] text-[#6b7280] tracking-widest border-t border-green-950/20 pt-3">
                        <div>
                          SPREAD SCORE: <span className="text-[#22C55E] font-bold">{msg.spreadScore}%</span>
                        </div>
                        <div>
                          DOMINANT PATH: <span className="text-[#AFFFCF] font-bold">
                            {msg.dominantPath && msg.dominantPath.length > 0 
                              ? msg.dominantPath.join(" ➔ ") 
                              : "ROOT"}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              }
            })}

            {/* --- SLOW THINKING / LOADING CARD --- */}
            {isThinking && (
              <div className="flex justify-start w-full">
                <div className="w-full bg-[#081a0e] rounded border border-[#22C55E]/50 flex flex-col text-left p-5 relative overflow-hidden">
                  
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#22C55E]" />

                  {/* Header */}
                  <div className="font-mono text-[10px] text-[#22C55E] tracking-[0.25em] mb-4 uppercase flex justify-between items-center">
                    <span>// CHEMICAL DIFFUSION IN PROGRESS...</span>
                    <span className="text-[#6b7280] animate-pulse">ORGANIC DIFFUSION</span>
                  </div>

                  {/* Slow progress bar */}
                  <div className="w-full h-1 bg-green-950/20 rounded-full overflow-hidden mb-5">
                    <div 
                      className="h-full bg-[#22C55E] transition-all duration-100 ease-out" 
                      style={{ width: `${thinkingProgress}%` }}
                    />
                  </div>

                  {/* Signal propagation logs */}
                  <div className="space-y-2 font-mono text-[9px] text-[#6b7280] leading-snug">
                    {checkedLogs.map((logLine, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-[#22C55E]">❯</span>
                        <span>{logLine}</span>
                      </div>
                    ))}
                  </div>

                  {/* Staggered dots */}
                  <div className="border-t border-green-950/20 pt-3.5 mt-4 flex items-center gap-1 font-mono text-[9px] text-[#6b7280] tracking-widest uppercase">
                    PROPAGATING CHEMOTAXIS SIGNALS
                    <span className="flex gap-0.5 ml-1">
                      <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-ping" style={{ animationDelay: "0s" }} />
                      <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-ping" style={{ animationDelay: "0.3s" }} />
                      <span className="w-1 h-1 rounded-full bg-[#22C55E] animate-ping" style={{ animationDelay: "0.6s" }} />
                    </span>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="h-[76px] border-t border-green-950/20 bg-[#030f07] flex items-center px-6 shrink-0 z-10 relative">
            <form onSubmit={handleSend} className="w-full flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isThinking}
                placeholder="Introduce a chemical signal to the network..."
                className="flex-1 bg-[#020a06] border border-green-950/30 rounded px-4 py-2 text-[12px] font-mono text-[#E2E8F0] placeholder:text-[#6b7280]/40 outline-none focus:border-[#22C55E]/50 focus:box-shadow-[0_0_10px_rgba(34,197,94,0.15)] transition-all duration-300"
              />
              <button
                type="submit"
                disabled={isThinking || !inputValue.trim()}
                className="w-10 h-10 rounded bg-[#22C55E] text-[#020a06] flex items-center justify-center cursor-pointer hover:bg-[#22C55E]/85 disabled:bg-white/5 disabled:text-[#6b7280]/30 transition-colors"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* --- GROWTH LOG OVERLAY MODAL --- */}
      <AnimatePresence>
        {showLogsOverlay && (
          <motion.div 
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogsOverlay(false)}
          >
            <motion.div
              className="w-full max-w-lg bg-[#081a0e] border border-[#22C55E] rounded-lg p-5 flex flex-col max-h-[70vh]"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-green-950/30 pb-3 mb-4">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#AFFFCF]">
                  <Terminal size={14} className="text-[#22C55E]" />
                  <span>// SUBTERRANEAN GROWTH MATRIX LOG</span>
                </div>
                <button 
                  onClick={() => setShowLogsOverlay(false)}
                  className="text-[#6b7280] hover:text-[#22C55E]"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-[#6b7280] space-y-2 select-text pr-2 scrollbar-thin">
                {checkedLogs.length === 0 ? (
                  <div className="text-center py-10 opacity-30 text-[#AFFFCF]">
                    No signals propagated in current session.
                  </div>
                ) : (
                  checkedLogs.map((logLine, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-[#22C55E] font-bold">❯</span>
                      <span>{logLine}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-green-950/20 pt-3 mt-4 text-right font-mono text-[9px] text-[#6b7280]">
                Matrix online | online node instances: {networkNodes.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
