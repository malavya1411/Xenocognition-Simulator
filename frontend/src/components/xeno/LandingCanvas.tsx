import React, { useEffect, useRef } from "react";
import { Cpu } from "lucide-react";

// ─── NeuralPCBBackground ──────────────────────────────────────────────────────
// Generative Neural-PCB hybrid animation. Three depth layers:
//   0 – Deep amber backbone (slow, rare signals, ring topology)
//   1 – Mid cyan / purple active network (cursor-reactive, signal-heavy)
//   2 – Foreground cursor whiskers (ephemeral white hair-lines)
//
// Signal packets travel along organic bezier traces with purpose:
//   spawn → accelerate → converge at junctions → trigger flares.
// Uses an object pool of 180 signals to avoid GC stutter.

// ── Internal types ────────────────────────────────────────────────────────────

interface PCBNode {
  id: number;
  x: number; y: number;
  layer: 0 | 1;
  isConvergence: boolean;
  phase: number;       // breathing offset
  traffic: number;     // 0-1, dims→brightens junction pad
  edgeIds: number[];
}

interface PCBEdge {
  id: number;
  from: number; to: number;
  layer: 0 | 1;
  cpx1: number; cpy1: number;  // cubic bezier control points
  cpx2: number; cpy2: number;
  phosphor: number;            // 0-1 post-spike glow (decays)
  color: "cyan" | "purple" | "amber";
}

interface PCBSignal {
  active: boolean;
  edgeId: number;
  t: number;           // 0-1 position along edge
  speed: number;
  dir: 1 | -1;         // 1=forward ghost=-1
  color: "cyan" | "purple" | "amber" | "ghost" | "spike";
  alpha: number;
  isSpike: boolean;
}

interface PCBCloud {
  x: number; y: number;
  r: number; alpha: number;
  phase: number;
  vx: number; vy: number;
}

interface PCBWhisker {
  x: number; y: number;
  dx: number; dy: number;
  alpha: number;
}

// ── Pure utility functions ────────────────────────────────────────────────────

function pcbHash(a: number, b: number): number {
  const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function pcbBezAt(
  t: number,
  p0x: number, p0y: number,
  p1x: number, p1y: number,
  p2x: number, p2y: number,
  p3x: number, p3y: number
): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u*u*u*p0x + 3*u*u*t*p1x + 3*u*t*t*p2x + t*t*t*p3x,
    y: u*u*u*p0y + 3*u*u*t*p1y + 3*u*t*t*p2y + t*t*t*p3y,
  };
}

function pcbDist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function sigRGBA(c: PCBSignal["color"], a: number): string {
  const alpha = a.toFixed(3);
  switch (c) {
    case "cyan":   return `rgba(0,240,255,${alpha})`;
    case "purple": return `rgba(123,97,255,${alpha})`;
    case "amber":  return `rgba(255,184,0,${alpha})`;
    case "ghost":  return `rgba(255,40,80,${alpha})`;
    case "spike":  return `rgba(255,255,255,${alpha})`;
  }
}

// ── Network builder ───────────────────────────────────────────────────────────

function pcbBuild(
  w: number, h: number,
  nodes: PCBNode[],
  edges: PCBEdge[],
  clouds: PCBCloud[]
) {
  nodes.length = 0;
  edges.length = 0;
  clouds.length = 0;

  let nid = 0;
  let eid = 0;

  // Helper: push a node
  const mkNode = (x: number, y: number, layer: 0 | 1, isConvergence: boolean): number => {
    nodes.push({ id: nid, x, y, layer, isConvergence, phase: Math.random() * Math.PI * 2, traffic: 0, edgeIds: [] });
    return nid++;
  };

  // Helper: add organic bezier edge
  const mkEdge = (from: number, to: number, layer: 0 | 1, color: PCBEdge["color"]) => {
    const n0 = nodes[from]; const n1 = nodes[to];
    const dx = n1.x - n0.x; const dy = n1.y - n0.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const px = -dy / len; const py = dx / len;
    const o1 = (pcbHash(from * 7.3 + eid, to * 2.1) - 0.5) * len * 0.38;
    const o2 = (pcbHash(from * 3.1, to * 5.7 + eid) - 0.5) * len * 0.38;
    const e: PCBEdge = {
      id: eid,
      from, to, layer,
      cpx1: n0.x + dx * 0.32 + px * o1, cpy1: n0.y + dy * 0.32 + py * o1,
      cpx2: n0.x + dx * 0.67 + px * o2, cpy2: n0.y + dy * 0.67 + py * o2,
      phosphor: 0, color,
    };
    edges.push(e);
    nodes[from].edgeIds.push(eid);
    nodes[to].edgeIds.push(eid);
    eid++;
  };

  // ── Layer 0: Deep amber backbone (9-node distorted ring) ─────────────────
  const DEEP_N = 9;
  const deepR = Math.min(w, h) * 0.44;
  const deepIds: number[] = [];
  for (let i = 0; i < DEEP_N; i++) {
    const angle = (i / DEEP_N) * Math.PI * 2;
    const r = deepR * (0.72 + pcbHash(i * 4.1, i * 1.9) * 0.36);
    const nx = Math.max(25, Math.min(w - 25, w / 2 + Math.cos(angle) * r * (w > h ? w / h : 1)));
    const ny = Math.max(25, Math.min(h - 25, h / 2 + Math.sin(angle) * r));
    deepIds.push(mkNode(nx, ny, 0, false));
  }
  // Ring + 3 cross-chords
  for (let i = 0; i < DEEP_N; i++) mkEdge(deepIds[i], deepIds[(i + 1) % DEEP_N], 0, "amber");
  mkEdge(deepIds[0], deepIds[4], 0, "amber");
  mkEdge(deepIds[2], deepIds[6], 0, "amber");
  mkEdge(deepIds[1], deepIds[7], 0, "amber");

  // ── Layer 1: 5 convergence basins (pentagonal, peripheral) ───────────────
  // Central 36% of viewport is the "dead zone" – no convergence nodes there
  const rawBasins = [
    { x: w * 0.10, y: h * 0.13 },
    { x: w * 0.89, y: h * 0.11 },
    { x: w * 0.05, y: h * 0.70 },
    { x: w * 0.92, y: h * 0.75 },
    { x: w * 0.50, y: h * 0.91 },
  ];

  const basinIds: number[] = [];
  const satsByBasin: number[][] = [];

  for (let b = 0; b < rawBasins.length; b++) {
    const bp = rawBasins[b];
    // Perlin-style distort
    bp.x = Math.max(30, Math.min(w - 30, bp.x + (pcbHash(b * 11.1, b * 3.7) - 0.5) * w * 0.05));
    bp.y = Math.max(30, Math.min(h - 30, bp.y + (pcbHash(b * 2.3, b * 8.9) - 0.5) * h * 0.05));

    const bid = mkNode(bp.x, bp.y, 1, true);
    basinIds.push(bid);

    // Synaptic cloud hovering near basin
    clouds.push({
      x: bp.x + (Math.random() - 0.5) * 75,
      y: bp.y + (Math.random() - 0.5) * 75,
      r: 55 + Math.random() * 65, alpha: 0,
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.13,
      vy: (Math.random() - 0.5) * 0.13,
    });

    // 6-8 satellites per basin
    const satR = Math.min(w, h) * 0.17;
    const satCount = 6 + Math.floor(Math.random() * 3);
    const satIds: number[] = [];
    for (let s = 0; s < satCount; s++) {
      const sa = (s / satCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.9;
      const sr = satR * (0.38 + Math.random() * 0.62);
      const sx = Math.max(15, Math.min(w - 15, bp.x + Math.cos(sa) * sr));
      const sy = Math.max(15, Math.min(h - 15, bp.y + Math.sin(sa) * sr));
      const sid = mkNode(sx, sy, 1, false);
      satIds.push(sid);
      mkEdge(sid, bid, 1, Math.random() > 0.45 ? "cyan" : "purple");
    }
    // Satellite ring links
    for (let s = 0; s < satIds.length - 1; s++) {
      if (Math.random() > 0.42) mkEdge(satIds[s], satIds[s + 1], 1, Math.random() > 0.5 ? "cyan" : "purple");
    }
    // Fractal dendrite branch
    if (satIds.length >= 2) {
      const pn = nodes[satIds[Math.floor(Math.random() * satIds.length)]];
      const bx = Math.max(15, Math.min(w - 15, pn.x + (Math.random() - 0.5) * satR * 0.5));
      const by = Math.max(15, Math.min(h - 15, pn.y + (Math.random() - 0.5) * satR * 0.5));
      const cid = mkNode(bx, by, 1, false);
      mkEdge(pn.id, cid, 1, "cyan");
      satIds.push(cid);
    }
    satsByBasin.push(satIds);
  }

  // Basin inter-spine (recurrent purple memory loops)
  const interSpine: [number, number][] = [[0,1],[0,2],[1,3],[2,4],[3,4],[0,3],[1,4]];
  for (const [a, bb] of interSpine) mkEdge(basinIds[a], basinIds[bb], 1, "purple");

  // Cross-layer bridges: deep → nearest mid satellite
  for (const did of deepIds) {
    const dn = nodes[did];
    let nearId = -1; let nearD = Infinity;
    for (const sats of satsByBasin) {
      for (const sid of sats) {
        const d = pcbDist(dn.x, dn.y, nodes[sid].x, nodes[sid].y);
        if (d < nearD && d < Math.min(w, h) * 0.40) { nearD = d; nearId = sid; }
      }
    }
    if (nearId >= 0 && Math.random() > 0.32) mkEdge(did, nearId, 0, "amber");
  }
}

// ── Signal pool helpers ───────────────────────────────────────────────────────

function getIdle(pool: PCBSignal[]): PCBSignal | null {
  for (const s of pool) { if (!s.active) return s; }
  return null;
}

function spawn(
  pool: PCBSignal[],
  edgeId: number,
  color: PCBSignal["color"],
  isGhost = false,
  isSpike = false
): boolean {
  const s = getIdle(pool);
  if (!s) return false;
  s.active = true;
  s.edgeId = edgeId;
  s.dir = isGhost ? -1 : 1;
  s.t = isGhost ? 1.0 : 0.0;
  s.color = color;
  s.alpha = isSpike ? 1.0 : 0.6 + Math.random() * 0.38;
  s.speed = isSpike
    ? 0.014
    : color === "amber"
    ? 0.001 + Math.random() * 0.0013
    : 0.0028 + Math.random() * 0.0042;
  s.isSpike = isSpike;
  return true;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const NeuralPCBBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w = 0; let h = 0;
    let rafId = 0;

    // Network state
    const nodes: PCBNode[] = [];
    const edges: PCBEdge[] = [];
    const clouds: PCBCloud[] = [];

    // Pre-filtered layer slices (rebuilt on resize)
    let midEdges: PCBEdge[] = [];
    let deepEdges: PCBEdge[] = [];

    // Signal pool (object-pooled, no GC churn)
    const MAX_SIG = 180;
    const signals: PCBSignal[] = Array.from({ length: MAX_SIG }, () => ({
      active: false, edgeId: 0, t: 0, speed: 0.003,
      dir: 1 as const, color: "cyan" as const, alpha: 1, isSpike: false,
    }));

    // Cursor whiskers (24 slots)
    const whiskers: PCBWhisker[] = Array.from({ length: 24 }, () => ({
      x: 0, y: 0, dx: 0, dy: 0, alpha: 0,
    }));

    const mouse = { x: -2000, y: -2000 };

    // System pulse
    let nextPulseAt = performance.now() + 8000 + Math.random() * 4000;
    let pulseX = -Infinity;
    let pulseStartT = 0;

    // Spawn throttle
    let lastSpawnT = 0;
    let lastWhiskerT = 0;

    // ── Resize / rebuild ────────────────────────────────────────────────────
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pcbBuild(w, h, nodes, edges, clouds);
      midEdges = edges.filter(e => e.layer === 1);
      deepEdges = edges.filter(e => e.layer === 0);
      for (const s of signals) s.active = false;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Event listeners ─────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastWhiskerT > 18) {
        for (let i = 0; i < 3; i++) {
          const wk = whiskers.find(w => w.alpha <= 0);
          if (!wk) break;
          const a = Math.random() * Math.PI * 2;
          wk.x = e.clientX; wk.y = e.clientY;
          wk.dx = Math.cos(a) * (18 + Math.random() * 28);
          wk.dy = Math.sin(a) * (18 + Math.random() * 28);
          wk.alpha = 0.55 + Math.random() * 0.35;
        }
        lastWhiskerT = now;
      }
      mouse.x = e.clientX; mouse.y = e.clientY;
    };

    const onLeave = () => { mouse.x = -2000; mouse.y = -2000; };

    const onClick = (e: MouseEvent) => {
      // Find nearest convergence node
      let nearId = -1; let nearD = Infinity;
      for (const n of nodes) {
        if (!n.isConvergence) continue;
        const d = pcbDist(e.clientX, e.clientY, n.x, n.y);
        if (d < nearD) { nearD = d; nearId = n.id; }
      }
      if (nearId < 0) return;

      // Fire spike on all edges of nearest convergence node
      for (const eid of nodes[nearId].edgeIds) {
        spawn(signals, eid, "spike", false, true);
        if (edges[eid]) edges[eid].phosphor = 1.0;
      }

      // Delayed chain: neighbours of that node fire too
      setTimeout(() => {
        for (const eid of nodes[nearId].edgeIds) {
          const nbId = edges[eid]?.from === nearId ? edges[eid]?.to : edges[eid]?.from;
          if (nbId == null) continue;
          for (const neid of nodes[nbId]?.edgeIds ?? []) {
            if (neid === eid) continue;
            spawn(signals, neid, "spike", false, true);
            if (edges[neid]) edges[neid].phosphor = Math.min(1, (edges[neid].phosphor || 0) + 0.65);
          }
        }
      }, 110);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);

    // ── Spawn helper (called each frame) ────────────────────────────────────
    const trySpawn = (now: number) => {
      if (now - lastSpawnT < 72) return;
      lastSpawnT = now;

      let active = 0;
      for (const s of signals) { if (s.active) active++; }
      if (active >= MAX_SIG * 0.88) return;

      // Mid-layer signal
      if (midEdges.length > 0) {
        const e = midEdges[Math.floor(Math.random() * midEdges.length)];
        const isGhost = Math.random() < 0.038;
        spawn(signals, e.id, isGhost ? "ghost" : (Math.random() > 0.45 ? "cyan" : "purple"), isGhost);
      }

      // Deep signal (rare)
      if (Math.random() < 0.11 && deepEdges.length > 0) {
        const e = deepEdges[Math.floor(Math.random() * deepEdges.length)];
        spawn(signals, e.id, "amber");
      }

      // Magnetic pull: spawn toward cursor
      if (mouse.x > -100) {
        let nearEdgeId = -1; let nearED = Infinity;
        for (const e of midEdges) {
          const n0 = nodes[e.from];
          const d = pcbDist(mouse.x, mouse.y, n0.x, n0.y);
          if (d < nearED && d < 210) { nearED = d; nearEdgeId = e.id; }
        }
        if (nearEdgeId >= 0 && Math.random() < 0.32) spawn(signals, nearEdgeId, "cyan");
      }
    };

    // ── Main animation loop ──────────────────────────────────────────────────
    const tick = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      // Deep void background with lighter center (text zone breathing room)
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.72);
      bg.addColorStop(0, "#0b0b14");
      bg.addColorStop(1, "#050508");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── System pulse wave (every 8-12 s, sweeps L→R) ─────────────────────
      if (now >= nextPulseAt) {
        pulseX = -w * 0.05;
        pulseStartT = now;
        nextPulseAt = now + 8000 + Math.random() * 4000;
      }
      let pulseAlpha = 0;
      if (pulseX > -w * 0.04) {
        const age = (now - pulseStartT) / 1600;
        pulseX = age * w * 1.2 - w * 0.05;
        pulseAlpha = Math.max(0, 1 - age) * 0.22;
        if (age >= 1) pulseX = -Infinity;
      }

      // ── Advance signals ───────────────────────────────────────────────────
      trySpawn(now);

      for (const sig of signals) {
        if (!sig.active) continue;
        sig.t += sig.speed * sig.dir;

        if (sig.isSpike) {
          sig.alpha = Math.max(0, sig.alpha - 0.007);
          if (sig.alpha <= 0) { sig.active = false; continue; }
        }

        if (sig.t > 1 || sig.t < 0) {
          const edge = edges[sig.edgeId];
          sig.active = false;
          if (!edge || sig.isSpike) continue;

          const arrivedAt = sig.dir === 1 ? edge.to : edge.from;
          const nd = nodes[arrivedAt];
          if (!nd) continue;
          nd.traffic = Math.min(1, nd.traffic + 0.45);

          // Convergence flare: if high-traffic basin, fire along all connected edges
          if (nd.isConvergence && nd.traffic > 0.68 && Math.random() < 0.28) {
            for (const neid of nd.edgeIds.slice(0, 5)) {
              if (neid === sig.edgeId) continue;
              spawn(signals, neid, sig.color === "ghost" ? "ghost" : (Math.random() > 0.5 ? "cyan" : "purple"));
            }
          }
        }
      }

      // Decay traffic & phosphor
      for (const n of nodes) { if (n.traffic > 0) n.traffic = Math.max(0, n.traffic - 0.004); }
      for (const e of edges) { if (e.phosphor > 0) e.phosphor = Math.max(0, e.phosphor - 0.005); }

      ctx.globalCompositeOperation = "screen";

      // ── Layer 0: Deep amber backbone traces ───────────────────────────────
      for (const e of edges) {
        if (e.layer !== 0) continue;
        const n0 = nodes[e.from]; const n1 = nodes[e.to];
        const ph = e.phosphor;
        const pb = pulseAlpha > 0 && Math.abs(n0.x - pulseX) < 140 ? pulseAlpha : 0;

        // Outer glow
        ctx.beginPath();
        ctx.moveTo(n0.x, n0.y);
        ctx.bezierCurveTo(e.cpx1, e.cpy1, e.cpx2, e.cpy2, n1.x, n1.y);
        ctx.strokeStyle = `rgba(255,184,0,${0.048 + ph * 0.22 + pb * 0.28})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sharp inner core
        ctx.beginPath();
        ctx.moveTo(n0.x, n0.y);
        ctx.bezierCurveTo(e.cpx1, e.cpy1, e.cpx2, e.cpy2, n1.x, n1.y);
        ctx.strokeStyle = `rgba(255,220,140,${0.018 + ph * 0.1 + pb * 0.12})`;
        ctx.lineWidth = 0.35;
        ctx.stroke();
      }

      // ── Synaptic clouds (diffuse purple volumes) ──────────────────────────
      for (const cl of clouds) {
        cl.x += cl.vx; cl.y += cl.vy;
        cl.phase += 0.0038;
        cl.alpha = 0.038 + Math.sin(cl.phase) * 0.022;

        // Dissipate when signals pass through
        for (const sig of signals) {
          if (!sig.active) continue;
          const edge = edges[sig.edgeId];
          if (!edge) continue;
          const n0 = nodes[edge.from]; const n1 = nodes[edge.to];
          const pos = pcbBezAt(sig.t, n0.x, n0.y, edge.cpx1, edge.cpy1, edge.cpx2, edge.cpy2, n1.x, n1.y);
          if (pcbDist(pos.x, pos.y, cl.x, cl.y) < cl.r * 0.55) cl.alpha *= 0.9;
        }

        const cg = ctx.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, cl.r);
        cg.addColorStop(0, `rgba(123,97,255,${cl.alpha})`);
        cg.addColorStop(1, "rgba(123,97,255,0)");
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Layer 1: Mid cyan / purple active network ─────────────────────────
      for (const e of edges) {
        if (e.layer !== 1) continue;
        const n0 = nodes[e.from]; const n1 = nodes[e.to];
        const ph = e.phosphor;
        const pb = pulseAlpha > 0 && Math.abs(n0.x - pulseX) < 110 ? pulseAlpha : 0;
        const mD = Math.min(pcbDist(mouse.x, mouse.y, n0.x, n0.y), pcbDist(mouse.x, mouse.y, n1.x, n1.y));
        const mB = Math.max(0, 1 - mD / 230) * 0.22;

        const baseA = (e.color === "purple" ? 0.055 : 0.072) + ph * 0.2 + pb * 0.18 + mB;

        // Glow outer
        ctx.beginPath();
        ctx.moveTo(n0.x, n0.y);
        ctx.bezierCurveTo(e.cpx1, e.cpy1, e.cpx2, e.cpy2, n1.x, n1.y);
        ctx.strokeStyle = e.color === "purple" ? `rgba(123,97,255,${baseA})` : `rgba(0,240,255,${baseA})`;
        ctx.lineWidth = e.color === "purple" ? 0.85 : 0.95;
        ctx.stroke();

        // Sharp inner core (60% opacity white-tinted)
        ctx.beginPath();
        ctx.moveTo(n0.x, n0.y);
        ctx.bezierCurveTo(e.cpx1, e.cpy1, e.cpx2, e.cpy2, n1.x, n1.y);
        ctx.strokeStyle = e.color === "purple"
          ? `rgba(200,180,255,${0.042 + ph * 0.12 + mB * 0.55})`
          : `rgba(200,255,255,${0.052 + ph * 0.14 + mB * 0.55})`;
        ctx.lineWidth = 0.28;
        ctx.stroke();
      }

      // ── Signal packets ────────────────────────────────────────────────────
      for (const sig of signals) {
        if (!sig.active) continue;
        const edge = edges[sig.edgeId];
        if (!edge) continue;
        const n0 = nodes[edge.from]; const n1 = nodes[edge.to];
        const pos = pcbBezAt(sig.t, n0.x, n0.y, edge.cpx1, edge.cpy1, edge.cpx2, edge.cpy2, n1.x, n1.y);
        const r = sig.isSpike ? 3.2 : sig.color === "amber" ? 2.1 : 1.7;
        const gr = r * 5.5;

        // Radial glow aura
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, gr);
        grd.addColorStop(0, sigRGBA(sig.color, sig.alpha * 0.72));
        grd.addColorStop(0.42, sigRGBA(sig.color, sig.alpha * 0.18));
        grd.addColorStop(1, sigRGBA(sig.color, 0));
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, gr, 0, Math.PI * 2);
        ctx.fill();

        // Hard core dot
        ctx.globalAlpha = sig.alpha;
        ctx.fillStyle = sigRGBA(sig.color, 1);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── Junction pads (nodes) ─────────────────────────────────────────────
      const tt = now * 0.001;
      for (const n of nodes) {
        const breathe = Math.sin(tt * 1.15 + n.phase) * 0.28 + 0.72;
        const tg = n.traffic;
        if (n.isConvergence) {
          // Convergence basin: large glow pad + ring
          const r = 7 + tg * 6;
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3.2);
          grd.addColorStop(0, `rgba(0,240,255,${(0.28 + tg * 0.55) * breathe})`);
          grd.addColorStop(0.5, `rgba(0,240,255,${(0.08 + tg * 0.18) * breathe})`);
          grd.addColorStop(1, "rgba(0,240,255,0)");
          ctx.fillStyle = grd;
          ctx.beginPath(); ctx.arc(n.x, n.y, r * 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(0,240,255,${(0.42 + tg * 0.5) * breathe})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.stroke();
        } else if (n.layer === 1) {
          const r = 2 + tg * 2.2;
          const isPurple = n.edgeIds.some(eid => edges[eid]?.color === "purple");
          ctx.fillStyle = isPurple
            ? `rgba(123,97,255,${(0.18 + tg * 0.55) * breathe})`
            : `rgba(0,240,255,${(0.18 + tg * 0.55) * breathe})`;
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
        } else {
          const r = 2.4 + tg * 2;
          ctx.fillStyle = `rgba(255,184,0,${(0.14 + tg * 0.32) * breathe})`;
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
        }
      }

      // ── Cursor whiskers (foreground, ephemeral) ───────────────────────────
      for (const wk of whiskers) {
        if (wk.alpha <= 0) continue;
        wk.alpha = Math.max(0, wk.alpha - 0.032);
        ctx.beginPath();
        ctx.moveTo(wk.x, wk.y);
        ctx.lineTo(wk.x + wk.dx * wk.alpha, wk.y + wk.dy * wk.alpha);
        ctx.strokeStyle = `rgba(255,255,255,${wk.alpha * 0.5})`;
        ctx.lineWidth = 0.45;
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("click", onClick);
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
