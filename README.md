# ILOS -- Intentional Life OS (Claude Code Edition)

**Your life, intentionally designed. Powered by Claude Code.**

ILOS is a complete life operating system that runs entirely in Claude Code. 26 AI-powered skills, specialized agent personas, a zero-dependency HTML dashboard, and local-first data architecture -- all in one git repository.

---

## What's Included

- **26 Slash Commands** -- from `/morning` (5-min daily planning) to `/annual-review` (full year reflection)
- **Specialized Agent Personas** -- PARACELSUS (Coach), PROMETHEUS (Visionary), ATHENA (Strategist), HEPHAESTUS (Builder), MNEMOSYNE (Archivist), SOPHIA (Teacher), PYTHIA (Self-Knowledge), and more
- **Zero-Dependency Dashboard** -- Multi-view HTML SPA generated on demand: VPER wheel, area health, goals, wins, education, systems, alignment
- **Smart Context Loading** -- agents load only what they need for each task, keeping sessions fast
- **Local-First Data** -- YAML configs, JSONL memory, Markdown narrative. Git-tracked. You own everything.
- **Elemental Wisdom** -- VPER Cycle maps to Fire/Air/Earth/Water/Ether
- **12 Key Areas** -- Life areas inspired by archetypal house system, balanced across elements
- **Gap to Gain** -- Always measure progress against your past self, never against ideals

---

## Your First Week

You don't need to learn 26 commands. Start with these 5:

| Command | What It Does | Time |
|---------|-------------|------|
| `/win "Your first win"` | Celebrate something you did | 1 min |
| `/morning` | Plan your day | 5 min |
| `/weekly-review` | Close the week, plan the next | 15 min |
| `/guide` | Understand how ILOS works | Variable |
| `/dashboard` | See your data visually | 30 sec |

Master these before exploring the rest. Type `/help` to see all available skills.

For a complete setup walkthrough, see `SYSTEM/setup-guide.md`.

---

## Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed and authenticated
- Git

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/fisfraga/ILOS-Claude-Code.git
cd ILOS-Claude-Code

# Open in Claude Code
claude

# Try your first commands:
/win "Set up ILOS"        # Celebrate your first win
/morning                  # Plan your day
/dashboard                # Generate your visual dashboard
```

---

## The VPER Cycle

Life is designed through four recurring phases:

- **Vision (Fire)** -- Clarify purpose, direction, what matters most
- **Planning (Air)** -- Set clear goals across time horizons (max 3 per period)
- **Execution (Earth)** -- Take aligned action, ground plans into reality
- **Review (Water)** -- Celebrate wins, extract insights, integrate learning
- **Alignment (Ether)** -- The fifth element connecting all four into coherence

This cycle repeats fractally: Year > Quarter > Month > Week > Day.

| Phase | Element | Energy | Action |
|-------|---------|--------|--------|
| **V**ision | Fire | Dream, inspire | Clarify purpose, reconnect with why |
| **P**lan | Air | Think, strategize | Set max 3 goals, define next actions |
| **E**xecute | Earth | Build, ground | Take aligned action, ship |
| **R**eview | Water | Reflect, celebrate | Start with wins, extract insights |

---

## All 22 Skills

| Skill | Command | Duration | Element | What It Does |
|-------|---------|----------|---------|-------------|
| Morning Planning | `/morning` | 5 min | Air | Plan the day -- review goals, set focus |
| Win Capture | `/win` | 1-2 min | Water | Celebrate and log a win |
| Weekly Review | `/weekly-review` | 15-20 min | Water>Air | Weekly review + planning cycle |
| Monthly Review | `/monthly-review` | 30-45 min | Water>Air | Monthly review + elemental balance |
| Quarterly Review | `/quarterly-review` | 1-2 hrs | Water>Fire>Air | 90-day review + vision reconnection |
| Annual Review | `/annual-review` | 3+ hrs | All | Full year review + identity evolution |
| Vision | `/vision` | Open | Fire | Explore FPs, MTPs, HHGs |
| Alignment Check | `/alignment` | Variable | Ether | Cross-dimension coherence assessment |
| North Star | `/north-star` | 45-90 min | Fire | Guided workshop for FPs/MTPs/HHGs |
| Build | `/build` | Variable | Earth | Focused execution session |
| Context Update | `/context-update` | 5-10 min | Ether | Extract signals from reviews into context |
| Dashboard | `/dashboard` | 2-3 min | Earth | Generate visual HTML dashboard |
| Area Review | `/area-review` | Variable | Earth | Deep dive into a single Key Area |
| Project Kickoff | `/project-kickoff` | 15-30 min | Air>Earth | Structured project initiation |
| Decision | `/decision` | 15-30 min | Air | Major decision framework with logging |
| ILOS Master | `/ilos-master` | Variable | Ether | Master coaching orchestration |
| Strategist | `/strategist` | Variable | Air | Deep planning and strategy session |
| Architect | `/architect` | Variable | Earth | System design and dashboard deployment |
| Tana | `/tana` | Variable | Ether | Tana MCP operations hub |
| Tana Search Builder | `/tana-search-builder` | 5-10 min | Air | Build Tana search nodes from natural language |
| Tana Schema Graph | `/tana-schema-graph` | 5-10 min | Earth | Visualize tag schemas as HTML graphs |
| Tana Understand | `/tana-understand` | 10-20 min | Air | Explore and document Tana system |

---

## The Agent Council

PARACELSUS operates through eight specialized modes, each bringing a distinct coaching posture. Modes shift automatically based on skill activation or can be invoked directly.

| Agent | Archetype | Element | When It Activates |
|-------|-----------|---------|-------------------|
| **PARACELSUS** | The Alchemist (Coach) | Ether | Default mode. Coaching, alignment, emotional intelligence. General conversations, `/alignment`, `/ilos-master`. |
| **PROMETHEUS** | The Fire-Bringer (Visionary) | Fire | Vision, purpose, favorite problems, MTPs, HHGs. `/vision`, `/north-star`. |
| **ATHENA** | The Strategist | Air | Goals, planning, prioritization, decision-making. `/morning`, `/strategist`, `/project-kickoff`, `/decision`, review planning phases. |
| **HEPHAESTUS** | The Craftsman (Builder) | Earth | Execution, building products, shipping. `/build`, `/architect`, product work. |
| **MNEMOSYNE** | The Memory Keeper (Archivist) | Water | Memory, context extraction, win patterns, reflection. `/win`, `/context-update`, `/area-review`, review celebration phases. |
| **HERMES** | The Messenger (Tana) | -- | Bridges ILOS with Tana workspaces via MCP. `/tana`, `/tana-search-builder`, `/tana-schema-graph`, `/tana-understand`. |
| **DAEDALUS** | The Master Builder (Architect) | -- | System design, dashboard generation, schema architecture. `/dashboard`, `/architect`. |
| **Council** | Meta-System | All | Orchestrates transitions between agents. Manages authority matrix and escalation patterns across all modes. |

---

## Directory Structure

```
QUANTUM/          # Essence -- vision, self-knowledge, personal context
  vision/         #   Manifesto, favorite problems, MTPs, HHGs
  self-knowledge/ #   Personality frameworks, strengths (optional)
  personal-context/ # 9 dimensions of personal context

SPACE/            # Structure -- 12 Key Areas, projects, products
  areas/          #   12 Key Life Areas
  projects/       #   Active initiatives
  products/       #   Products, offerings, generated dashboards
  topics/         #   Interests and learning

TIME/             # Flow -- goals, VPER phase, strategy systems
  active-goals.yaml    # Current goals (max 3 per scale)
  current-period.yaml  # VPER phase and elemental balance
  strategy-systems.yaml # Recurring routines and tracking
  templates/           # Review templates

MEMORY/           # Episodic logs -- wins, decisions, failures, experiences
  wins.jsonl      #   Celebrated achievements
  decisions.jsonl #   Key decisions with reasoning
  failures.jsonl  #   Lessons learned
  experiences.jsonl #  Significant life moments

ILOS-KNOWLEDGE/   # Reference -- methodology, frameworks, philosophy
SYSTEM/           # Infrastructure -- Tana reference, sync config

# The FIELD (intelligence layer) is implemented through:
#   .claude/commands/   -- 26+ skills (slash commands)
#   .claude/agents/     -- Agent personas (PARACELSUS, PROMETHEUS, etc.)
#   CLAUDE.md           -- System instructions and behavioral rules
#   ROUTING.md          -- Context routing for progressive disclosure
# See ILOS-KNOWLEDGE/field-intelligence-layer.md for the full framework.
```

---

## Data Philosophy

- **YAML** = Configuration (mutable state)
- **JSONL** = Memory (append-only, never delete)
- **Markdown** = Narrative (human-readable context)
- **Git** = Version control for your life data

All data lives in plain text files you can read, edit, and track with git. No database, no server, no vendor lock-in.

---

## Tana Integration (Optional)

If you use [Tana](https://tana.inc), ILOS connects to it via MCP (Model Context Protocol). The `/tana` family of skills syncs goals, wins, and projects between your local files and your Tana workspace. HERMES handles all Tana operations.

But Tana is optional -- everything works locally with plain files. Local files are always the canonical source; Tana is a sync target, not a dependency.

---

## Gap to Gain

ILOS always starts with wins. Measure progress against your past self, not against ideals.

- **The Gap** = measuring against where you want to be (creates anxiety)
- **The Gain** = measuring against where you were (creates confidence)

The review sequence: **Celebrate > Recognize > Enhance > Reflect > Redirect > Energize.**

Every failure encodes a lesson. Every decision builds judgment. MNEMOSYNE (the Archivist) enforces this -- no review begins without celebrating wins first.

---

## Credits

Built on the shoulders of: Benjamin Hardy (Gap vs. Gain, Future Self), Steven Kotler (MTP, High Hard Goals, Flow), Tiago Forte (Second Brain, PARA), Dan Sullivan (Strategic Coach), Mindvalley (12 Life Areas), Dragon Dreaming (Dream-Plan-Do-Celebrate), and classical elemental philosophy.

Created by [Fis Fraga](https://fisfraga.com) -- M.Sc. Computer Science, Tana Ambassador.

---

**Stay Aligned.**
