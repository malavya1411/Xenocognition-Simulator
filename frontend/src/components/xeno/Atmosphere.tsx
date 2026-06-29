import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function FilmGrain() {
  return null;
}

export function Vignette() {
  return (
    <div
      className="vignette pointer-events-none fixed inset-0 bg-radial from-transparent via-transparent to-[#030306]/90"
      style={{ zIndex: 15 }}
      aria-hidden
    />
  );
}

export function Scanlines() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-[0.015] scanlines select-none"
      style={{ zIndex: 18, transform: "translate3d(0,0,0)" }}
      aria-hidden
    />
  );
}

export function VolumetricFog() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" style={{ zIndex: 1 }}>
      <motion.div
        className="absolute -left-1/4 -top-1/4 w-[70vw] h-[70vw] rounded-full blur-[80px]"
        style={{
          background: "radial-gradient(circle, rgba(0, 229, 255, 0.02) 0%, transparent 70%)",
          transform: "translate3d(0,0,0)",
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -right-1/4 -bottom-1/4 w-[80vw] h-[80vw] rounded-full blur-[100px]"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.015) 0%, transparent 70%)",
          transform: "translate3d(0,0,0)",
        }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 50, -50, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export function HolographicGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const drawGrid = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const W = window.innerWidth;
      const H = window.innerHeight;
      
      const step = 48; // Grid spacing
      const time = Date.now() * 0.0005;

      ctx.strokeStyle = "rgba(0, 229, 255, 0.025)";
      ctx.lineWidth = 0.5;

      // Draw vertical lines
      for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Draw glowing grid intersections / dot nodes
      ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
      for (let x = 0; x < W; x += step * 2) {
        for (let y = 0; y < H; y += step * 2) {
          // Subtle pulse on intersections
          const pulse = Math.sin(time + (x + y) * 0.002) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(x, y, 1 + pulse * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Render technical coordinates on occasional grid points
          if (x % (step * 8) === 0 && y % (step * 8) === 0 && x > 0 && y > 0) {
            ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
            ctx.font = "7px 'IBM Plex Mono', monospace";
            ctx.fillText(
              `[${Math.floor(x).toString().padStart(4, "0")}:${Math.floor(y).toString().padStart(4, "0")}]`,
              x + 4,
              y - 4
            );
            ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
          }
        }
      }

      raf = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 animate-grid-pulse select-none"
      style={{ zIndex: 2, transform: "translate3d(0,0,0)" }}
    />
  );
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  type: "star" | "data" | "pulse";
  pulsePhase?: number;
}

export function AmbientParticles({
  count = 60,
  activeArch = null,
}: {
  count?: number;
  activeArch?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Color helpers based on active architecture
    const getArchColor = (arch: string | null, type: string) => {
      if (type === "star") {
        return "rgba(255, 255, 255, 0.6)";
      }
      switch (arch) {
        case "octopus":
          return Math.random() > 0.4 ? "#00E5FF" : "#8B5CF6";
        case "mycelium":
          return Math.random() > 0.3 ? "#ece3d4" : "#FFC857";
        case "hive":
          return "#FFC857";
        case "boltzmann":
          return Math.random() > 0.5 ? "#8B5CF6" : "#FF4D6D";
        case "mesh":
          return Math.random() > 0.5 ? "#cbd5e1" : "#3DDCFF";
        default:
          return "#3DDCFF";
      }
    };

    // Initialize particles
    particles.current = Array.from({ length: count }, () => {
      const typeRand = Math.random();
      let type: "star" | "data" | "pulse" = "star";
      let size = Math.random() * 1.2 + 0.4;
      if (typeRand > 0.7) {
        type = "data";
        size = Math.random() * 2 + 1.2;
      } else if (typeRand > 0.9) {
        type = "pulse";
        size = Math.random() * 3 + 2;
      }

      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size,
        color: getArchColor(activeArch, type),
        alpha: Math.random() * 0.3 + 0.1,
        type,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const ps = particles.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const time = Date.now() * 0.001;

      // Update and draw particles
      for (const p of ps) {
        // Slow float logic
        if (activeArch === "mycelium") {
          p.vy = -Math.abs(p.vy) - 0.015;
          p.vx += (Math.random() - 0.5) * 0.02;
        } else if (activeArch === "octopus") {
          p.vx = Math.sin(time * 0.4 + p.y * 0.005) * 0.15;
          p.vy += (Math.random() - 0.5) * 0.01;
        } else if (activeArch === "boltzmann") {
          // Chaos quantum jump
          if (Math.random() > 0.995) {
            p.x = Math.random() * W;
            p.y = Math.random() * H;
          }
          p.vx += (Math.random() - 0.5) * 0.08;
          p.vy += (Math.random() - 0.5) * 0.08;
        } else if (activeArch === "hive") {
          const dx = W / 2 - p.x;
          const dy = H / 2 - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          p.vx += (dx / dist) * 0.008 + (Math.random() - 0.5) * 0.04;
          p.vy += (dy / dist) * 0.008 + (Math.random() - 0.5) * 0.04;
        } else {
          p.vx += (Math.random() - 0.5) * 0.006;
          p.vy += (Math.random() - 0.5) * 0.006;
        }

        const maxSpeed = activeArch === "boltzmann" ? 1.2 : 0.4;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around margins
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        // Pulsing stars and data indicators
        let alpha = p.alpha;
        if (p.type === "star") {
          alpha = (Math.sin(time * 2 + (p.pulsePhase ?? 0)) * 0.5 + 0.5) * p.alpha * 1.5;
        }

        ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.type === "data") {
          // Render data points as small glowing crosshairs or hollow squares
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw radial glow for larger elements
        if (p.type === "pulse") {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
          glow.addColorStop(0, p.color + "22");
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Connect nearby nodes to form neural filaments (neural network web)
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          if (ps[i].type === "star" || ps[j].type === "star") continue; // Star particles do not connect
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.hypot(dx, dy);
          const maxDist = activeArch === "mycelium" ? 120 : 90;
          if (d < maxDist) {
            ctx.globalAlpha = (activeArch === "mesh" ? 0.15 : 0.06) * (1 - d / maxDist);
            ctx.strokeStyle = ps[i].color;
            ctx.lineWidth = activeArch === "mesh" ? 0.6 : 0.35;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, activeArch]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 select-none"
      style={{ zIndex: 3, transform: "translate3d(0,0,0)" }}
      aria-hidden
    />
  );
}

export function WireframeSphere() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rings = 12; // slightly reduced for clean minimal style

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let targetRotateX = 15;
    let targetRotateY = 0;
    let currentRotateX = 15;
    let currentRotateY = 0;
    let raf = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPercent = (clientX / window.innerWidth - 0.5) * 2;
      const yPercent = (clientY / window.innerHeight - 0.5) * 2;

      targetRotateY = xPercent * 15;
      targetRotateX = 15 - yPercent * 15;
    };

    const tick = () => {
      currentRotateX += (targetRotateX - currentRotateX) * 0.05;
      currentRotateY += (targetRotateY - currentRotateY) * 0.05;
      container.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
      style={{
        width: 600,
        height: 600,
        perspective: 1500,
        opacity: 0.06,
        zIndex: 2,
      }}
      aria-hidden
    >
      <div
        ref={containerRef}
        className="sphere-rot relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {Array.from({ length: rings }).map((_, i) => {
          const lat = (i / (rings - 1)) * 180 - 90;
          return (
            <div
              key={`lat-${i}`}
              className="absolute left-1/2 top-1/2"
              style={{
                width: 600,
                height: 600,
                marginLeft: -300,
                marginTop: -300,
                border: "1px solid rgba(0, 229, 255, 0.15)",
                borderRadius: "50%",
                transform: `rotateX(${lat}deg) translateZ(0)`,
                transformStyle: "preserve-3d",
              }}
            />
          );
        })}
        {Array.from({ length: rings }).map((_, i) => {
          const lon = (i / rings) * 180;
          return (
            <div
              key={`lon-${i}`}
              className="absolute left-1/2 top-1/2"
              style={{
                width: 600,
                height: 600,
                marginLeft: -300,
                marginTop: -300,
                border: "1px solid rgba(0, 229, 255, 0.15)",
                borderRadius: "50%",
                transform: `rotateY(${lon}deg)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
