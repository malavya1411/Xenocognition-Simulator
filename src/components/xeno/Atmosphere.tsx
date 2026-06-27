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
}

export function AmbientParticles({ count = 38 }: { count?: number }) {
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

    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particles.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const style = getComputedStyle(document.documentElement);
      const color = style.getPropertyValue("--text-secondary").trim() || "#9a9aa8";

      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connect nearby
      ctx.strokeStyle = color;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.globalAlpha = 0.12 * (1 - d / 110);
            ctx.lineWidth = 0.5;
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
  }, [count]);

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
  const [variant, setVariant] = useState<"default" | "hover">("default");

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    let x = -100;
    let y = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
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
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
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
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 hidden md:block"
      style={{
        zIndex: 9999,
        width: variant === "hover" ? 36 : 12,
        height: variant === "hover" ? 36 : 12,
        borderRadius: "50%",
        border: "1px solid var(--text-primary)",
        background: variant === "hover" ? "color-mix(in oklab, var(--text-primary) 12%, transparent)" : "transparent",
        mixBlendMode: "difference",
        transition: "width 180ms ease, height 180ms ease, background 180ms ease",
      }}
    />
  );
}

export function WireframeSphere() {
  // CSS 3D sphere using stacked rings
  const rings = 14;
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: 520,
        height: 520,
        perspective: 1200,
        opacity: 0.18,
      }}
      aria-hidden
    >
      <div
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
                width: 520,
                height: 520,
                marginLeft: -260,
                marginTop: -260,
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
                width: 520,
                height: 520,
                marginLeft: -260,
                marginTop: -260,
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
