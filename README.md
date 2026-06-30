# Xenocognition Simulator

Intelligence is architectural, not universal.

The **Xenocognition Simulator** is a full-stack, speculative application that processes human concepts through five modeled alien and non-human cognitive frameworks. It functions as a "cognitive empathy machine," exploring how different physical architectures, substrate speeds, social aggregations, and thermodynamic properties reshape meaning.

📄 **[Full Prompt Architecture Specifications →](docs/prompt-architectures.md)**

---

## 🌌 The 5 Cognitive Architectures

### 1. Octopus Mind (Decentralized Sensation)
- **Concept**: Eight semi-autonomous peripheral nodes (arms) processing environmental sensory data, communicating with a central coordination system.
- **Biases**: Defensive, curious, sensual, predatory, playful, skeptical, memory, and color-drunk.
- **Simulation**: Each arm evaluates the prompt independently based on its specific bias, generating disjointed responses that the central node attempts to aggregate into an imperfect, shifting consensus.

### 2. Mycelial Network (Substrate Propagation)
- **Concept**: Slow, chemical-electrical signals propagating across a subterranean network of fungal hyphae.
- **Simulation**: Models concepts as nutrient drops or disturbances. Signals branch from a root node through loams, spores, and carbon paths, slowly generating a weighted structural graph (`nodes` & `edges`) depicting signal distribution and memory retention.

### 3. Hive Mind (Superorganism Will)
- **Concept**: A unified social collective composed of hundreds of micro-agents resolving individual inputs into a single collective intent.
- **Simulation**: Counts 200 distinct agent votes (Affirmative/Negative/Abstain) to reach consensus. It scans the input prompt for individualist pronouns (e.g., *I*, *me*, *my*, *myself*) and flags them as collective syntax errors, highlighting the architecture's lack of self-identity.

### 4. Boltzmann Brain (Thermodynamic Fluctuation)
- **Concept**: A hypothetical self-aware entity formed by thermal fluctuations in a high-entropy universe.
- **Simulation**: Emulates a thermodynamic quantum neural state. Outputs resolve as alternating fragments of raw cosmic noise and coherent signal chunks, complete with signal-to-noise ratios and coherence metrics.

### 5. Post-Human Mesh (Multi-Perspective Synthesis)
- **Concept**: A layered network of specialized cybernetic and post-biological nodes.
- **Simulation**: Evaluates the concept simultaneously through four distinct philosophical layers (The Pragmatist, The Mystic, The Cynic, and The Optimist), synthesizing them into a weighted average answer and calculating a dynamic cognitive tension score.

---

## 📁 Repository Structure

Following a monorepo approach, all configuration, dependencies, and code assets are encapsulated within their respective domains:

```
Xenocognition-Simulator/
├── README.md               # Project analysis and documentation
│
├── backend/                # SSR & Server Logic
│   ├── .gitignore          # Backend-specific ignore rules
│   ├── package.json        # Backend package structure
│   ├── tsconfig.json       # Backend TypeScript config
│   ├── server.ts           # Nitro server handler (swallowed error normalizer)
│   ├── start.ts            # TanStack Start middleware & error wrappers
│   └── lib/                # Server-only helper modules
│
├── docs/                   # Specifications & Guidelines
│   ├── AGENTS.md           # Instructions for AI assistants
│   ├── README.md           # Documentation overview
│   └── routes.md           # Routing conventions
│
└── frontend/               # Speculative UI & Frontend Dev Server
    ├── .gitignore          # Ignores local node_modules, builds, and logs
    ├── package.json        # Main dependencies & scripts
    ├── tsconfig.json       # Frontend path aliases & compiler options
    ├── vite.config.ts      # TanStack Start build configuration
    ├── components.json     # shadcn/ui settings
    ├── eslint.config.js    # Linting conventions
    └── src/                # React components, routes, and styles
```

---

## 🛠️ Technology Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React SSR)
- **Styling**: Vanilla CSS with Tailwind CSS configurations
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 🚀 Running Locally

All main development scripts and dependency chains are managed from the `/frontend` workspace:

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the browser**:
   Visit `http://localhost:8080` (or the port outputted in your console).
