# The FIELD: Intelligence Layer

The FIELD is the intelligence layer that wraps around Quantum, Space, and Time. It is not a directory of data -- it is the architecture through which AI reads your identity, traverses your structure, follows your rhythm, and coaches you through it all. The FIELD is what makes ILOS a living system rather than a collection of files.

---

## What the FIELD Is

Quantum holds who you are. Space holds what matters. Time holds when things happen. The FIELD is how intelligence moves through all three -- connecting, amplifying, and compounding.

The FIELD encompasses everything about how AI operates within ILOS: what context it loads, which persona it adopts, what skills it can execute, which tools it integrates, how humans stay in control, and what principles govern the whole system.

---

## The Six Categories

### 1. Context Management
How your life data is organized for AI retrieval. The schemas, routing rules, and segmentation that make your context accessible to each agent. Defined in `ROUTING.md` and `AGENTS.md`.

### 2. Agents and Personas
Your AI coaching entities. PARACELSUS (primary coach) and the specialized agents (PROMETHEUS, ATHENA, HEPHAESTUS, MNEMOSYNE, SOPHIA, PYTHIA). Each has a distinct element, domain, and coaching posture. Defined in `.claude/agents/`.

### 3. Skills and Capabilities
What your AI can do. The 26+ slash commands are the skill surface of the FIELD -- voice processing, analysis, generation, coaching, and system operations. Defined in `.claude/commands/`.

### 4. Tools and Integrations
External systems the FIELD connects to. Tana MCP for workspace sync, voice capture pipelines, the zero-dependency HTML dashboard. Configured in `SYSTEM/`.

### 5. Human in the Loop
AI generates. Humans evaluate. The quality of AI output depends on human judgment -- your taste, your lived experience, your intuition about what resonates. PARACELSUS asks questions and offers perspectives. You decide.

### 6. AI Principles
Seven foundational mindsets governing how ILOS uses AI (see below).

---

## Where the FIELD Is Implemented

The FIELD is not a single directory. It is distributed across the system:

| Component | Location | What It Does |
|-----------|----------|-------------|
| Skills | `.claude/commands/` | 26+ slash commands -- the action surface |
| Agent personas | `.claude/agents/` | Elemental coaching entities and their behaviors |
| System instructions | `AGENTS.md` (loaded through `CLAUDE.md`) | Behavioral rules, data sources, coaching methodology |
| Context routing | `ROUTING.md` | Progressive disclosure -- what to load for each task |
| Tool config | `SYSTEM/` | Tana MCP, sync configuration, setup guides |

---

## Context Map: What Each Agent Sees

### PARACELSUS Modes

| Mode | Element | Primary Context |
|------|---------|----------------|
| Vision | Fire | `QUANTUM/vision/`, `MEMORY/wins.jsonl` (last 20) |
| Planning | Air | `TIME/active-goals.yaml`, `TIME/current-period.yaml`, `SPACE/areas/`, `SPACE/projects/`, `QUANTUM/personal-context/` |
| Review | Water | `MEMORY/wins.jsonl`, `TIME/active-goals.yaml`, `MEMORY/decisions.jsonl`, `MEMORY/experiences.jsonl`, `MEMORY/failures.jsonl` |
| Alignment | Ether | All `QUANTUM/`, `TIME/active-goals.yaml`, `MEMORY/wins.jsonl` (last 30), `SPACE/areas/` |

### Specialized Agents

| Agent | Element | Primary Context |
|-------|---------|----------------|
| PROMETHEUS (Visionary) | Fire | `QUANTUM/vision/` + `MEMORY/wins.jsonl` |
| ATHENA (Strategist) | Air | `TIME/` + `SPACE/projects/` + `QUANTUM/personal-context/` |
| HEPHAESTUS (Builder) | Earth | `SPACE/projects/` + `TIME/active-goals.yaml` |
| MNEMOSYNE (Archivist) | Water | `MEMORY/` + `TIME/active-goals.yaml` |
| SOPHIA (Sage) | Ether | `ILOS-KNOWLEDGE/` |
| PYTHIA (Self-Knower) | Ether | `QUANTUM/self-knowledge/` + `QUANTUM/personal-context/` |

---

## How the FIELD Interacts with Each Dimension

- **Reads QUANTUM** to provide coaching grounded in your identity, vision, and personal context
- **Traverses SPACE** to surface connections between areas, projects, and topics
- **Follows TIME** to track patterns, coach through VPER phases, and connect goals across horizons
- **Logs to MEMORY** to build compound intelligence over time

---

## The Seven AI Principles

**1. Context First** -- AI is only as useful as the context it has about you. Keep your Quantum, Space, and Time data current. The investment in context pays compound returns through every interaction.

**2. Human in the Loop** -- AI generates. Humans evaluate. Never let AI run fully autonomously on decisions that matter. Use coaching as input, not instruction.

**3. Compound Intelligence** -- The system gets smarter as you use it -- not because the model improves, but because the context it reads gets richer. Every win captured, every review completed, every goal set adds to the intelligence available.

**4. Voice First** -- You think faster and deeper when you speak. Voice capture accesses layers of thought that typing often misses. Let AI extract the structure. You provide the insight.

**5. Agent Architecture** -- An agent = context + skills + persona. When an interaction feels shallow, the problem is usually context (it does not know enough about you) or persona (it is not framed for this type of conversation).

**6. The AI Mirror** -- AI can reflect your own patterns, beliefs, and growth edges back to you. Treat interactions as opportunities for self-reflection, not just information retrieval.

**7. Structure Enables Intelligence** -- The entire ILOS architecture exists because AI exists. Without organized context, AI is just a chatbot. With it, AI becomes a thinking partner.

---

## The Compound Effect

Every interaction adds to MEMORY. Every review enriches the win archive. Every goal update refines the TIME context. The FIELD becomes more intelligent with every use -- not because the AI improves, but because the context it reads gets richer.

**Structure your life. Intelligence follows.**
