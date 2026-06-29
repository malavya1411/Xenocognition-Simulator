import React, { useEffect, useRef } from "react";
import { Cpu } from "lucide-react";

// ─── NeuralWebBackground ─────────────────────────────────────────────────────
// Full-screen immersive neural network canvas for the landing page hero.
// 120 nodes drawn from all 5 architecture accent palettes, connected by faint
// filament lines, with mouse-proximity glow.

interface NeuralNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  alpha: number;
  pulseOffset: number;
}

const ARCH_COLORS = [
  { fill: "#00f0ff", glow: "#00f0ff" }, // octopus cyan
  { fill: "#ec4899", glow: "#ec4899" }, // octopus pink
  { fill: "#10b981", glow: "#10b981" }, // mycelium green
  { fill: "#f59e0b", glow: "#f59e0b" }, // mycelium amber
  { fill: "#fbbf24", glow: "#fbbf24" }, // hive gold
  { fill: "#a78bfa", glow: "#a78bfa" }, // boltzmann violet
  { fill: "#f97316", glow: "#f97316" }, // boltzmann orange
  { fill: "#22d3ee", glow: "#22d3ee" }, // mesh cyan
  { fill: "#c084fc", glow: "#c084fc" }, // mesh purple
];

export const NeuralWebBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const nodesRef = useRef<NeuralNode[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * (window.devicePixelRatio || 1);
      canvas.height = h * (window.devicePixelRatio || 1);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener("resize", resize);

    // Build nodes
    const NODE_COUNT = 120;
    nodesRef.current = Array.from({ length: NODE_COUNT }, () => {
      const c = ARCH_COLORS[Math.floor(Math.random() * ARCH_COLORS.length)];
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 2.2 + 0.8,
        color: c.fill,
        glowColor: c.glow,
        alpha: Math.random() * 0.5 + 0.25,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const MAX_DIST = 130;
    const MOUSE_RADIUS = 180;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const t = Date.now() * 0.001;
      const nodes = nodesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const opacity = (1 - dist / MAX_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = nodes[i].color;
            ctx.globalAlpha = opacity;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Draw nodes
      for (const n of nodes) {
        const dx = n.x - mx;
        const dy = n.y - my;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = Math.max(0, 1 - distToMouse / MOUSE_RADIUS);
        const pulse = Math.sin(t * 1.8 + n.pulseOffset) * 0.15 + 0.85;
        const r = n.radius * (1 + mouseInfluence * 2.5) * pulse;
        const alpha = n.alpha * (1 + mouseInfluence * 0.8) * pulse;

        if (mouseInfluence > 0.05) {
          // Glow ring
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 6);
          grd.addColorStop(0, n.glowColor + "55");
          grd.addColorStop(1, n.glowColor + "00");
          ctx.fillStyle = grd;
          ctx.globalAlpha = mouseInfluence * 0.7;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core dot
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = mouseInfluence > 0.1 ? 12 : 4;
        ctx.shadowColor = n.glowColor;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 5 }}
      aria-hidden
    />
  );
};

type ArchId = "octopus" | "mycelium" | "hive" | "boltzmann" | "mesh";

export const PersonaCanvas: React.FC<{ type: ArchId; hovered: boolean }> = ({ type, hovered }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // Setup entities based on type
    const tentacles: { x: number; y: number; segments: { x: number; y: number }[] }[] = [];
    if (type === "octopus") {
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const startX = canvas.width / 2;
        const startY = canvas.height / 2;
        const segments = [];
        for (let j = 0; j < 8; j++) {
          segments.push({ x: startX + Math.cos(angle) * j * 10, y: startY + Math.sin(angle) * j * 10 });
        }
        tentacles.push({ x: startX, y: startY, segments });
      }
    }

    const mycoNodes: { x: number; y: number; targetX: number; targetY: number; radius: number }[] = [];
    if (type === "mycelium") {
      for (let i = 0; i < 20; i++) {
        mycoNodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1
        });
      }
    }

    const swarmParticles: { x: number; y: number; vx: number; vy: number }[] = [];
    if (type === "hive") {
      for (let i = 0; i < 100; i++) {
        swarmParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5
        });
      }
    }

    const cloud: { x: number; y: number; size: number; alpha: number; speed: number; color: string }[] = [];
    if (type === "boltzmann") {
      for (let i = 0; i < 60; i++) {
        cloud.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 0.02 + 0.005,
          color: Math.random() > 0.5 ? "#a78bfa" : "#f97316"
        });
      }
    }

    const meshGrid: { x: number; y: number; ox: number; oy: number }[] = [];
    const cols = 5;
    const rows = 5;
    if (type === "mesh") {
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = (canvas.width / (cols - 1)) * c;
          const y = (canvas.height / (rows - 1)) * r;
          meshGrid.push({ x, y, ox: x, oy: y });
        }
      }
    }

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (type === "octopus") {
        ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
        ctx.lineWidth = 1.5;
        tentacles.forEach((tentacle, tIdx) => {
          const baseAngle = (tIdx * Math.PI) / 4 + Math.sin(time + tIdx) * 0.15;
          const originX = canvas.width / 2;
          const originY = canvas.height / 2;
          
          ctx.beginPath();
          ctx.moveTo(originX, originY);
          
          tentacle.segments.forEach((seg, sIdx) => {
            const distance = (sIdx + 1) * 12;
            const wave = Math.sin(time * 3 - sIdx * 0.5) * (hovered ? 6 : 3);
            
            let targetX = originX + Math.cos(baseAngle) * distance + Math.cos(baseAngle + Math.PI/2) * wave;
            let targetY = originY + Math.sin(baseAngle) * distance + Math.sin(baseAngle + Math.PI/2) * wave;

            if (hovered) {
              const dx = mouseRef.current.x - targetX;
              const dy = mouseRef.current.y - targetY;
              const distToMouse = Math.sqrt(dx * dx + dy * dy);
              if (distToMouse < 60) {
                targetX += (dx / distToMouse) * (60 - distToMouse) * 0.35;
                targetY += (dy / distToMouse) * (60 - distToMouse) * 0.35;
              }
            }

            seg.x += (targetX - seg.x) * 0.2;
            seg.y += (targetY - seg.y) * 0.2;

            ctx.lineTo(seg.x, seg.y);
            
            if (sIdx % 2 === 0) {
              ctx.save();
              ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
              ctx.shadowBlur = 6;
              ctx.shadowColor = "#00f0ff";
              ctx.beginPath();
              ctx.arc(seg.x, seg.y, 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
          ctx.stroke();
        });
      }

      else if (type === "mycelium") {
        ctx.strokeStyle = "rgba(236, 227, 212, 0.12)";
        ctx.fillStyle = "rgba(236, 227, 212, 0.4)";
        
        mycoNodes.forEach((node, idx) => {
          node.x += Math.sin(time + idx) * 0.15;
          node.y += Math.cos(time + idx) * 0.15;

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();

          for (let j = idx + 1; j < mycoNodes.length; j++) {
            const other = mycoNodes[j];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 45) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }

          if (hovered) {
            const mDx = mouseRef.current.x - node.x;
            const mDy = mouseRef.current.y - node.y;
            const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
            if (mDist < 50) {
              ctx.save();
              ctx.strokeStyle = `rgba(16, 185, 129, ${0.45 * (1 - mDist / 50)})`;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        });
      }

      else if (type === "hive") {
        ctx.fillStyle = hovered ? "rgba(251, 191, 38, 0.6)" : "rgba(251, 191, 38, 0.3)";
        swarmParticles.forEach((p) => {
          if (hovered) {
            const dx = mouseRef.current.x - p.x;
            const dy = mouseRef.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
              p.vx += (dx / dist) * 0.15;
              p.vy += (dy / dist) * 0.15;
            }
            p.vx *= 0.93;
            p.vy *= 0.93;
          } else {
            p.vx += (Math.random() - 0.5) * 0.2;
            p.vy += (Math.random() - 0.5) * 0.2;
            p.vx *= 0.95;
            p.vy *= 0.95;
          }

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      else if (type === "boltzmann") {
        cloud.forEach((p, idx) => {
          p.x += Math.sin(time * 2 + idx) * 0.2;
          p.y += Math.cos(time * 2 + idx) * 0.2;

          if (hovered) {
            const dx = mouseRef.current.x - p.x;
            const dy = mouseRef.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 70) {
              const angle = Math.atan2(dy, dx) + 0.1;
              p.x += (Math.cos(angle) * dist - dx) * 0.1;
              p.y += (Math.sin(angle) * dist - dy) * 0.1;
            }
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });
      }

      else if (type === "mesh") {
        ctx.strokeStyle = "rgba(203, 213, 225, 0.1)";
        ctx.lineWidth = 1;
        
        meshGrid.forEach((node, idx) => {
          let tx = node.ox;
          let ty = node.oy;

          if (hovered) {
            const dx = mouseRef.current.x - node.ox;
            const dy = mouseRef.current.y - node.oy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 60) {
              const force = (60 - dist) * 0.25;
              tx += (dx / dist) * force;
              ty += (dy / dist) * force;
            }
          }

          node.x += (tx - node.x) * 0.15;
          node.y += (ty - node.y) * 0.15;

          ctx.fillStyle = "rgba(203, 213, 225, 0.4)";
          ctx.beginPath();
          ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
          ctx.fill();

          const colIdx = idx % cols;
          const rowIdx = Math.floor(idx / cols);

          if (colIdx < cols - 1) {
            const rightNode = meshGrid[idx + 1];
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(rightNode.x, rightNode.y);
            ctx.stroke();
          }
          if (rowIdx < rows - 1) {
            const bottomNode = meshGrid[idx + cols];
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(bottomNode.x, bottomNode.y);
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [type, hovered]);

  return (
    <canvas 
      ref={canvasRef} 
      width={240} 
      height={140} 
      className="pointer-events-auto absolute inset-0 h-full w-full opacity-60 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100" 
    />
  );
};

export const NeuralCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, hover: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left - canvas.width / 2;
      mouseRef.current.y = e.clientY - rect.top - canvas.height / 2;
    };
    const handleMouseEnter = () => { mouseRef.current.hover = true; };
    const handleMouseLeave = () => { mouseRef.current.hover = false; };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const render = () => {
      rotation += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const radG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
      radG.addColorStop(0, "rgba(22, 22, 38, 0.5)");
      radG.addColorStop(0.5, "rgba(7, 9, 30, 0.2)");
      radG.addColorStop(1, "transparent");
      ctx.fillStyle = radG;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.fill();

      for (let r = 0; r < 3; r++) {
        ctx.strokeStyle = r === 0 ? "rgba(0, 240, 255, 0.15)" : r === 1 ? "rgba(167, 139, 250, 0.1)" : "rgba(251, 191, 38, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const baseRadius = 60 + r * 20;

        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.05) {
          const wave = Math.sin(a * 8 + rotation * 15 + r * 5) * (mouseRef.current.hover ? 6 : 2);
          let warpX = 0;
          let warpY = 0;

          if (mouseRef.current.hover) {
            const dx = Math.cos(a) * baseRadius - mouseRef.current.x;
            const dy = Math.sin(a) * baseRadius - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              const force = (80 - dist) * 0.18;
              warpX = -(dx / dist) * force;
              warpY = -(dy / dist) * force;
            }
          }

          const rx = cx + Math.cos(a + rotation * (r % 2 === 0 ? 1 : -1)) * (baseRadius + wave) + warpX;
          const ry = cy + Math.sin(a + rotation * (r % 2 === 0 ? 1 : -1)) * (baseRadius + wave) + warpY;

          if (a === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      const count = 40;
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        
        const rx3d = Math.sin(phi) * Math.cos(theta + rotation * 4);
        const ry3d = Math.sin(phi) * Math.sin(theta + rotation * 4);
        const rz3d = Math.cos(phi);

        const scale = 1 / (1 - rz3d * 0.3);
        const px = cx + rx3d * 40 * scale;
        const py = cy + ry3d * 40 * scale;

        ctx.globalAlpha = Math.max(0.1, (rz3d + 1) / 2);
        ctx.beginPath();
        ctx.arc(px, py, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseenter", handleMouseEnter);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative mb-6 flex items-center justify-center">
      <canvas ref={canvasRef} width={280} height={280} className="relative z-10" />
      <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-md" />
    </div>
  );
};
