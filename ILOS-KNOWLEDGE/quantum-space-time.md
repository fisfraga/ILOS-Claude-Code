# The Quantum-Space-Time Framework

The Quantum-Space-Time framework describes the three fundamental dimensions across which a life is organized. It provides the architectural backbone for Intentional Life Design, explaining what information belongs where, how the dimensions interact, and why traditional organizational methods like PARA only cover part of the picture.

---

## The Three Dimensions

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
         The life you are actually living
```

### QUANTUM -- Essence

The Quantum dimension holds everything that is atemporal and aspatial -- truths about who you are that do not belong to a specific time period or organizational category because they permeate everything.

**Contents:**

- **Vision**
  - Favorite Problems: The 12 or so questions you cannot stop thinking about. Curiosities that follow you across years.
  - Massively Transformative Purposes (MTPs): Your guiding stars -- purposes big enough to inspire you for years or decades, aimed at transformation beyond personal benefit.
  - High Hard Goals (HHGs): Major life objectives that bridge your MTPs to actionable time-bound goals. They may take years but completely change your life when achieved.
  - Life Manifesto: The overarching narrative of what you stand for, what you are building, and who you are becoming.

- **Self-Knowledge**
  - Any self-knowledge frameworks you use for understanding your nature -- personality assessments, strengths profiles, values inventories, and more.
  - The directory is open-ended: add whatever frameworks resonate with you and help you understand your patterns, strengths, and growth edges.

- **Personal Context**
  - Routines and habits (what your days actually look like)
  - Energy patterns (when you are most creative, focused, or social)
  - Relationships and family situation
  - Non-negotiables and values
  - Work patterns and professional circumstances
  - Geographic and lifestyle factors
  - Current life stage and circumstances

**Why it is called "Quantum":** Just as quantum physics describes the fundamental level of reality that underlies all matter, the Quantum dimension describes the fundamental level of your identity that underlies all your plans, structures, and actions. It does not change with the weekly cycle or belong inside a project folder. It is always present, always influencing.

---

### SPACE -- Structure

The Space dimension holds the organizational categories that define what matters in your life right now. It answers the question: "What am I responsible for, working on, and interested in?"

**Contents:**

- **Areas** (12 life domains)
  - Ongoing responsibilities that never truly complete. They require continuous attention and intentional design.
  - The ILD system maps 12 Key Areas inspired by archetypal energies (zodiac houses), representing fundamental aspects of human experience:
    1. Health and Vitality
    2. Finances and Resources
    3. Intellectual Life
    4. Home and Family
    5. Creative Expression
    6. Routines and Work Life
    7. Love Relationship
    8. Emotional Life
    9. Life Vision and Meaning
    10. Career and Public Life
    11. Social Life and Community
    12. Spirituality and Inner Life
  - Each area can have its own Vision, Purpose, and Strategy, making it truly intentional.

- **Projects** (finite endeavors with outcomes)
  - Active initiatives with clear goals and deadlines.
  - Maintain 10-15 active projects at any time. Fewer means you stall; more means scattered progress.
  - Each project has a status (Active, Backlog, Completed, Abandoned), an associated area, and optionally a connected High Hard Goal.

- **Topics** (interest containers)
  - Subjects and themes that capture your curiosity but are not tied to deadlines or responsibilities.
  - Containers for knowledge you want to collect, connect, and return to.
  - Similar to "Resources" in the PARA method.

**How Space functions:** Areas, Projects, and Topics serve as "Super Folders" -- retrieval gateways that collect related items (notes, tasks, meetings) and let you find everything connected to a given domain. When you open an Area, you see all related projects, tasks, notes, strategies, and wins. The organizational structure becomes a living retrieval network rather than a static filing system.

---

### TIME -- Flow

The Time dimension holds everything that is temporal -- the rhythm of cycles through which you operate your life.

**Contents:**

- **Nested Cycles:** Year > Quarter > Month > Week > Day
  - Each cycle has its own Review and Plan rhythm.
  - Each cycle contains the same VPER pattern (Vision, Plan, Execute, Review) at its respective scale.
  - The week is the core rhythm -- the most important cycle to maintain consistently.

- **Plans:** Goals and intentions for each upcoming period. Maximum 3 goals per period.

- **Reviews:** Reflections, win extraction, and pattern recognition for each completed period.

- **Wins:** The currency of progress. Captured at every time scale, compounding into an archive of accomplishment.

- **Strategy Systems:** Repeated routines that recur at specific periodicities (daily, weekly, monthly, quarterly) and drive consistent progress.

**How Time functions:** The Time dimension provides the rhythm for living. Without it, Space is a static map and Quantum is an unrealized essence. Time is where things actually happen -- where goals are set, actions are taken, and progress is measured.

---

## How the Dimensions Interact

The three dimensions are not independent. They form a unified system where each dimension depends on and enriches the others:

**Quantum informs Space and Time:**
- Your MTPs and HHGs (Quantum) determine which projects (Space) you pursue and which goals (Time) you set.
- Your personal context (Quantum) shapes which strategies (Time) are realistic and which areas (Space) need attention.
- Your self-knowledge (Quantum) reveals your natural strengths and growth edges, helping you design routines (Time) and prioritize areas (Space) with greater self-awareness.

**Space organizes the execution of Time-based plans:**
- Areas (Space) provide the "where" for strategy systems (Time). A daily exercise routine lives in the Health and Vitality area.
- Projects (Space) provide the "what" for period goals (Time). A monthly goal to "ship the website redesign" is tied to the Website Redesign project.
- Topics (Space) capture knowledge that informs future plans (Time) and deepens your understanding of your curiosities (Quantum).

**Time provides the rhythm for operating within Space:**
- Weekly reviews surface which areas (Space) received attention and which were neglected.
- Quarterly planning prompts you to refresh your project list (Space) and reconsider your vision (Quantum).
- Daily execution turns your structured life overview (Space) into lived experience (Manifest).

---

## What Goes Where — Local Files vs. Optional Tana

ILOS is local-first: all data lives in local files (Markdown, YAML, JSONL) and is fully functional with Claude Code alone. If you also use Tana, some data can be mirrored or managed there for visual dashboards and graph-based browsing.

| Dimension | Local Files (Primary) | Tana (Optional Enhancement) |
|---|---|---|
| **Quantum: Vision** | `QUANTUM/vision/` -- MTPs, HHGs, Favorite Problems as stable Markdown references | Mirror key vision elements for dashboard views |
| **Quantum: Self-Knowledge** | `QUANTUM/self-knowledge/` -- Personality frameworks, strengths, values | Not typically needed in Tana (stable reference docs) |
| **Quantum: Personal Context** | `QUANTUM/personal-context/` -- 9 context files, updated during quarterly reviews | Can mirror for enhanced AI context queries |
| **Space: Areas, Projects, Topics** | `SPACE/areas/`, `SPACE/projects/` -- Markdown files for each area and project | Tana adds graph linking, saved searches, and visual overviews |
| **Time: Plans, Reviews, Wins** | `TIME/` for goals + `MEMORY/` for wins (JSONL append-only) | Tana adds calendar integration and time-based queries |

---

## How This Goes Beyond PARA

The PARA method (Projects, Areas, Resources, Archive) is a powerful organizational framework, but it covers only the Space dimension:

| PARA | ILD Equivalent | Dimension |
|---|---|---|
| Projects | Projects | Space |
| Areas | Areas | Space |
| Resources | Topics | Space |
| Archive | (Completed/Abandoned status) | Space |

PARA has no concept of:

- **Time:** There is no mechanism for nested planning and review cycles, no fractal rhythm of Year > Quarter > Month > Week > Day, no systematic win tracking or review process.
- **Quantum:** There is no place for vision, purpose, self-knowledge, or personal context. These foundational elements either float unconnected or get awkwardly forced into "Resources."

The Quantum-Space-Time framework adds these two critical dimensions, creating a complete architecture for organizing not just your information, but your entire life -- what you know about yourself (Quantum), how you structure what matters (Space), and how you operate through time (Time).

---

## Summary

- **QUANTUM** answers: Who am I? What do I want? What do I know about myself?
- **SPACE** answers: What am I responsible for? What am I working on? What am I curious about?
- **TIME** answers: What am I doing this week? What did I accomplish last month? What are my goals for this quarter?
- **MANIFEST** is where all three dimensions converge into the reality you are living right now.

All three dimensions are necessary. Quantum without Space and Time is an unrealized dream. Space without Quantum and Time is an organizational system with no soul. Time without Quantum and Space is a calendar with no meaning. Together, they form the complete architecture for designing a life with intention.
