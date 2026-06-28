import { useEffect, useRef, useState } from "react";

export function FilmGrain() {
  return (
    <div
      className="film-grain pointer-events-none fixed inset-0"
      style={{ zIndex: 20 }}
      aria-hidden
    />
  );
}

export function Vignette() {
  return (
    <div
      className="vignette pointer-events-none fixed inset-0"
      style={{ zIndex: 15 }}
      aria-hidden
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
}

export function AmbientParticles({
  count = 45,
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

    // Color helpers based on architecture
    const getArchColor = (arch: string | null) => {
      switch (arch) {
        case "octopus":
          return Math.random() > 0.4 ? "#00f0ff" : "#ec4899";
        case "mycelium":
          return Math.random() > 0.3 ? "#ece3d4" : "#f59e0b";
        case "hive":
          return "#fbbf24";
        case "boltzmann":
          return Math.random() > 0.5 ? "#a78bfa" : "#f97316";
        case "mesh":
          return Math.random() > 0.5 ? "#cbd5e1" : "#22d3ee";
        default:
          return "#94a3b8"; // Default slate/secondary
      }
    };

    // Initialize particles
    particles.current = Array.from({ length: count }, () => {
      const size = Math.random() * 2 + 0.8;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size,
        color: getArchColor(activeArch),
        alpha: Math.random() * 0.4 + 0.2,
      };
    });

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const ps = particles.current;
      const W = window.innerWidth;
      const H = window.innerHeight;

      // Update and draw particles
      for (const p of ps) {
        // Architecture-specific physics adjustments
        if (activeArch === "mycelium") {
          // Slow upward drift like spores
          p.vy = -Math.abs(p.vy) - 0.02;
          if (p.vy < -0.3) p.vy = -0.15;
          p.vx += (Math.random() - 0.5) * 0.05;
        } else if (activeArch === "octopus") {
          // Floating underwater plankton motion (sine wave sway)
          p.vx = Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.2;
          p.vy += (Math.random() - 0.5) * 0.02;
        } else if (activeArch === "boltzmann") {
          // High entropy jitter
          if (Math.random() > 0.98) {
            p.x = Math.random() * W;
            p.y = Math.random() * H;
          }
          p.vx += (Math.random() - 0.5) * 0.1;
          p.vy += (Math.random() - 0.5) * 0.1;
        } else if (activeArch === "hive") {
          // Swarming attraction to center
          const dx = W / 2 - p.x;
          const dy = H / 2 - p.y;
          const dist = Math.hypot(dx, dy);
          p.vx += (dx / dist) * 0.01 + (Math.random() - 0.5) * 0.05;
          p.vy += (dy / dist) * 0.01 + (Math.random() - 0.5) * 0.05;
        } else {
          // Default gentle float
          p.vx += (Math.random() - 0.5) * 0.01;
          p.vy += (Math.random() - 0.5) * 0.01;
        }

        // Speed caps
        const maxSpeed = activeArch === "boltzmann" ? 1.5 : 0.6;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connect nearby particles with thin filaments (neural visualizer)
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.hypot(dx, dy);
          const maxDist = activeArch === "mycelium" ? 140 : 100;
          if (d < maxDist) {
            ctx.globalAlpha =
              (activeArch === "mesh" ? 0.22 : 0.09) * (1 - d / maxDist);
            ctx.strokeStyle = ps[i].color;
            ctx.lineWidth = activeArch === "mesh" ? 0.8 : 0.45;
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
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 10 }}
      aria-hidden
    />
  );
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [variant, setVariant] = useState<"default" | "hover">("default");

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let targetX = -100;
    let targetY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("button, a, input, textarea, [data-cursor='hover']")) {
        setVariant("hover");
      } else {
        setVariant("default");
      }
    };

    const tick = () => {
      // Spring physics interpolation
      // Dot follows cursor closely
      dotX += (targetX - dotX) * 0.22;
      dotY += (targetY - dotY) * 0.22;

      // Ring lags behind gracefully
      ringX += (targetX - ringX) * 0.12;
      ringY += (targetY - ringY) * 0.12;

      dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      {/* Interactive micro-dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 hidden md:block"
        style={{
          zIndex: 9999,
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "var(--text-primary)",
        }}
      />
      {/* Elastic lag ring */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 hidden md:block"
        style={{
          zIndex: 9998,
          width: 24,
          height: 24,
          borderRadius: "50%",
          border:
            "1.2px solid color-mix(in oklab, var(--text-primary) 50%, transparent)",
          background: "transparent",
        }}
      />
    </>
  );
}

export function WireframeSphere() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rings = 18;

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
      const xPercent = (clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const yPercent = (clientY / window.innerHeight - 0.5) * 2; // -1 to 1

      // Subtle tilt
      targetRotateY = xPercent * 25;
      targetRotateX = 15 - yPercent * 25;
    };

    const tick = () => {
      currentRotateX += (targetRotateX - currentRotateX) * 0.08;
      currentRotateY += (targetRotateY - currentRotateY) * 0.08;
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
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: 580,
        height: 580,
        perspective: 1200,
        opacity: 0.14,
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
                width: 580,
                height: 580,
                marginLeft: -290,
                marginTop: -290,
                border: "1px solid var(--text-secondary)",
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
                width: 580,
                height: 580,
                marginLeft: -290,
                marginTop: -290,
                border: "1px solid var(--text-secondary)",
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
