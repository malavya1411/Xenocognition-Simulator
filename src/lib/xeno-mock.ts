// Mock simulators for the 5 xenocognitive architectures.
// TODO: Replace with Gemini API integration.
// - Octopus: 9 parallel calls with different system prompts (1 central, 8 arm biases).
// - Mycelium: Single call with spreading-association system prompt returning graph JSON.
// - Hive: 5-10 calls representing micro-agent votes, aggregated into a distribution.
// - Boltzmann: Single call with noise-injection prompt returning [{type, text}].
// - Mesh: Single call returning structured JSON of conflicting perspectives.

export type Status = "idle" | "loading" | "done";

const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const delay = (min = 800, max = 2200) =>
  new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));

const seed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const wordsOf = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

// ---------- OCTOPUS ----------
export interface OctopusData {
  centralNode: { response: string; confidence: number };
  armNodes: { id: number; bias: string; response: string }[];
  consensus: string;
}
const armBiases = [
  "defensive", "curious", "sensual", "predatory",
  "playful", "skeptical", "memory", "color-drunk",
];
export async function simulateOctopus(input: string): Promise<OctopusData> {
  await delay();
  const w = wordsOf(input);
  const pick = () => w[seed(input + Math.random()) % Math.max(w.length, 1)] || "the-thing";
  const armNodes = armBiases.map((bias, i) => ({
    id: i,
    bias,
    response: `[${bias}] tastes ${pick()}, recoils, reaches`,
  }));
  return {
    centralNode: {
      response: `eight answers refuse to merge. ${pick()} / ${pick()} / not-${pick()}`,
      confidence: 0.2 + Math.random() * 0.4,
    },
    armNodes,
    consensus: `partial: ${pick()} (3 arms agree, 5 dissent)`,
  };
}

// ---------- MYCELIUM ----------
export interface MyceliumNode { id: string; label: string; size: number; depth: number }
export interface MyceliumEdge { source: string; target: string; strength: number }
export interface MyceliumData {
  nodes: MyceliumNode[];
  edges: MyceliumEdge[];
  growthLog: string[];
}
const myceliumPool = [
  "decay", "spore", "loam", "signal", "carbon", "root", "moisture",
  "darkness", "exchange", "memory", "slow", "network", "nutrient",
  "old-growth", "log", "kin", "share", "below", "thread", "bloom",
];
export async function simulateMycelium(input: string): Promise<MyceliumData> {
  await delay();
  const w = wordsOf(input);
  const root: MyceliumNode = { id: "root", label: w[0] || "signal", size: 36, depth: 0 };
  const nodes: MyceliumNode[] = [root];
  const edges: MyceliumEdge[] = [];
  const log: string[] = [`signal dropped at "${root.label}"`];
  const used = new Set<string>();
  const grow = (parent: MyceliumNode, n: number, depth: number) => {
    for (let i = 0; i < n; i++) {
      const label = rand(myceliumPool);
      const id = `${label}-${nodes.length}`;
      if (used.has(label)) continue;
      used.add(label);
      const node = { id, label, size: 22 - depth * 4, depth };
      nodes.push(node);
      edges.push({ source: parent.id, target: id, strength: 0.4 + Math.random() * 0.6 });
      log.push(`spread to "${label}" via ${parent.label}`);
      if (depth < 2 && Math.random() > 0.4) grow(node, 1 + Math.floor(Math.random() * 2), depth + 1);
    }
  };
  grow(root, 4, 1);
  log.push(`nutrient spike at "${rand(nodes).label}"`);
  return { nodes, edges, growthLog: log };
}

// ---------- HIVE ----------
export interface HiveData {
  totalAgents: number;
  votes: { option: string; count: number; percentage: number }[];
  consensus: string;
  singularErrors: string[];
  dissentQuotes: string[];
}
export async function simulateHive(input: string): Promise<HiveData> {
  await delay();
  const total = 200;
  const a = 60 + Math.floor(Math.random() * 80);
  const b = Math.floor((total - a) * (0.4 + Math.random() * 0.3));
  const c = total - a - b;
  const votes = [
    { option: "Affirmative", count: a, percentage: +((a / total) * 100).toFixed(1) },
    { option: "Negative", count: b, percentage: +((b / total) * 100).toFixed(1) },
    { option: "Abstain", count: c, percentage: +((c / total) * 100).toFixed(1) },
  ];
  const singular = ["I", "me", "my", "mine", "myself"].filter((p) =>
    new RegExp(`\\b${p}\\b`, "i").test(input),
  );
  return {
    totalAgents: total,
    votes,
    consensus: votes[0].option,
    singularErrors: singular,
    dissentQuotes: [
      "the swarm overstates its certainty",
      "minority pattern: pursue without consensus",
      "abstain — insufficient pheromone density",
    ],
  };
}

// ---------- BOLTZMANN ----------
export interface BoltzmannChunk { type: "noise" | "signal"; text: string }
export interface BoltzmannData {
  output: BoltzmannChunk[];
  signalRatio: number;
  coherenceScore: number;
}
const noiseFrags = [
  "▓▒░ unverified ░▒▓", "x∴x∴ angular", "burnt-sugar memory of a planet",
  "the equation almost — ", "...inverse...inverse...", "carbon laughter",
  "███ corrupted ███", "a hand that was never grown",
  "decimal points falling sideways", "soft architecture / hard rain",
];
export async function simulateBoltzmann(input: string): Promise<BoltzmannData> {
  await delay();
  const w = wordsOf(input);
  const out: BoltzmannChunk[] = [];
  for (let i = 0; i < 14; i++) {
    if (Math.random() < 0.2) {
      out.push({
        type: "signal",
        text: `${w[i % Math.max(w.length, 1)] || "the question"} resolves only when observed from outside the system.`,
      });
    } else {
      out.push({ type: "noise", text: rand(noiseFrags) });
    }
  }
  const ratio = out.filter((o) => o.type === "signal").length / out.length;
  return { output: out, signalRatio: ratio, coherenceScore: ratio * 0.9 + 0.05 };
}

// ---------- MESH ----------
export interface MeshData {
  averageAnswer: string;
  perspectives: { voice: string; text: string; weight: number }[];
  tensionScore: number;
}
export async function simulateMesh(input: string): Promise<MeshData> {
  await delay();
  const w = wordsOf(input);
  const subject = w[0] || "the question";
  return {
    averageAnswer: `${subject} is best understood as an emergent property — not a fixed object.`,
    perspectives: [
      { voice: "The Pragmatist", text: `${subject} only matters if it changes what we do tomorrow.`, weight: 0.3 },
      { voice: "The Mystic", text: `${subject} was here before the word for it. It dissolves on naming.`, weight: 0.2 },
      { voice: "The Cynic", text: `${subject} is a story we tell to feel less alone in the dark.`, weight: 0.25 },
      { voice: "The Optimist", text: `${subject} is the early shape of something we haven't earned yet.`, weight: 0.25 },
    ],
    tensionScore: 0.55 + Math.random() * 0.4,
  };
}
