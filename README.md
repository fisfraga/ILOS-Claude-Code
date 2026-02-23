# Intentional Life OS — Git Edition

A file-based personal operating system for living intentionally with AI as your thinking partner.

---

## What Is This?

This is your **Intentional Life OS** workspace — a structured folder system that gives AI agents (Claude Code, Cursor, Windsurf, or any AI tool) deep context about who you are, what matters to you, and where you're going. It turns any AI into a personalized life coach, planning partner, and wisdom guide.

### The Three Dimensions

Your life is organized through the **Quantum-Space-Time** framework:

```
         QUANTUM (Essence)
         Vision | Self-Knowledge | Personal Context
              |
              |  informs
              v
    TIME (Flow) <---------> SPACE (Structure)
    Plans | Reviews | Wins     Areas | Projects | Topics
              |
              |  grounds into
              v
         MANIFEST (Reality)
```

- **QUANTUM/** — Who you are. Atemporal truths: vision, identity, values, self-knowledge.
- **SPACE/** — What matters. Your 12 life areas, active projects, interests.
- **TIME/** — When things happen. Goals, reviews, plans across fractal time scales.
- **MEMORY/** — What you've learned. Wins, decisions, failures, key experiences.
- **KNOWLEDGE/** — How the system works. ILOS methodology and frameworks.

### The VPER Cycle

Every period (day, week, month, quarter, year) flows through four phases:

| Phase | Element | Energy | Action |
|-------|---------|--------|--------|
| **V**ision | Fire | Dream, inspire | Clarify purpose, reconnect with why |
| **P**lan | Air | Think, strategize | Set max 3 goals, define next actions |
| **E**xecute | Earth | Build, ground | Take aligned action, ship |
| **R**eview | Water | Reflect, celebrate | Start with wins, extract insights |

---

## Quick Start

### 1. Fill Your Context (15-30 minutes)

Start with these three files — they give the AI 80% of what it needs:

1. **`QUANTUM/personal-context/8-identity-values.md`** — Who you are, what you value
2. **`QUANTUM/vision/favorite-problems.md`** — Your 12 burning questions
3. **`TIME/active-goals.yaml`** — Your current goals (max 3 per time scale)

### 2. Run Your First Skill

Open this folder in Claude Code and try:

```
/win "Completed my first ILOS setup"
```

### 3. Explore the Framework

Read `KNOWLEDGE/ilos-overview.md` for the full system overview, or ask the AI:

> "What are my current goals and how do they connect to my vision?"

---

## Folder Structure

```
ILOS-Template/
├── ROUTING.md              # Agent context routing (progressive disclosure)
├── CLAUDE.md               # AI agent system prompt (PARACELSUS)
├── QUANTUM/                # Essence — who you are
│   ├── vision/             # Manifesto, favorite problems, MTPs, HHGs
│   ├── self-knowledge/     # Strengths, wisdom traditions (optional)
│   └── personal-context/   # 9 dimensions of personal context
├── SPACE/                  # Structure — what matters
│   ├── areas/              # 12 Key Life Areas
│   ├── projects/           # Active initiatives
│   ├── products/           # Products and offerings
│   └── topics/             # Interests and learning
├── TIME/                   # Flow — what's happening now
│   ├── active-goals.yaml   # Current goals (max 3 per scale)
│   ├── current-period.yaml # VPER phase and elemental balance
│   └── templates/          # Review templates
├── MEMORY/                 # Episodic memory (append-only logs)
│   ├── wins.jsonl          # Celebrated achievements
│   ├── decisions.jsonl     # Key decisions with reasoning
│   ├── failures.jsonl      # Lessons learned
│   └── experiences.jsonl   # Significant life moments
├── KNOWLEDGE/              # ILOS methodology reference
├── SYSTEM/                 # Configuration and setup
│   └── tana-reference/     # Optional Tana MCP integration
├── .claude/commands/       # 22 skills (slash commands)
└── .claude/agents/         # Agent personas (PARACELSUS modes)
```

---

## Skills (Slash Commands)

| Skill | Duration | Description |
|-------|----------|-------------|
| `/morning` | 5 min | Daily planning — set intention, review goals |
| `/win` | 1-2 min | Capture and celebrate a win |
| `/weekly-review` | 15-20 min | Weekly review + planning cycle |
| `/monthly-review` | 30-45 min | Monthly review + elemental balance |
| `/quarterly-review` | 1-2 hrs | Quarterly review + vision reconnection |
| `/annual-review` | 3+ hrs | Full year review + identity evolution |
| `/vision` | Open | Explore favorite problems, MTPs, HHGs |
| `/alignment` | Variable | Cross-dimension coherence check |
| `/north-star` | 45-90 min | Guided workshop for purpose clarity |
| `/build` | Variable | Focused execution session |
| `/context-update` | 5-10 min | Extract signals from reviews into context |
| `/dashboard` | 2-3 min | Generate visual HTML dashboard |
| `/area-review` | Variable | Deep dive into a single Key Area |
| `/project-kickoff` | 15-30 min | Structured project initiation |
| `/decision` | 15-30 min | Major decision framework with logging |
| `/ilos-master` | Variable | Master coaching orchestration |
| `/strategist` | Variable | Deep planning and strategy session |
| `/architect` | Variable | System design and dashboard deployment |
| `/tana` | Variable | Tana MCP operations hub |
| `/tana-search-builder` | 5-10 min | Build Tana search nodes from natural language |
| `/tana-schema-graph` | 5-10 min | Visualize tag schemas as HTML graphs |
| `/tana-understand` | 10-20 min | Explore and document Tana system |

---

## The Gap-to-Gain Philosophy

ILOS measures progress against your **past self**, not your ideals.

- **Always start reviews with wins.** Never jump to problems.
- **The Gap** = measuring against where you want to be (creates anxiety)
- **The Gain** = measuring against where you were (creates confidence)
- Every failure encodes a lesson. Every decision builds judgment.

---

## Tana Integration (Optional)

If you use [Tana](https://tana.inc) as your knowledge management tool, ILOS can sync with it via MCP (Model Context Protocol). See `SYSTEM/setup-guide.md` for configuration.

Without Tana, the system works fully with local files.

---

## Credits

Built on the shoulders of: Benjamin Hardy (Gap vs. Gain, Future Self), Steven Kotler (MTP, High Hard Goals, Flow), Tiago Forte (Second Brain, PARA), Mindvalley (12 Life Areas), Dragon Dreaming (Dream-Plan-Do-Celebrate), Dan Sullivan (Strategic Coach), and classical elemental philosophy.

Created by [Fis Fraga](https://fisfraga.com) — M.Sc. Computer Science, Tana Ambassador, 7+ years studying wisdom traditions.
