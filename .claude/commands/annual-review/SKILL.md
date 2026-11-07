---
name: annual-review
description: Run the annual review and plan — deep year-in-review, identity evolution, vision reconnection, elemental balance, plan next year with 3 annual goals
argument-hint: "[optional: year reference like '2025' or 'last year']"
---

# Annual Review & Plan

**Duration:** 3+ hours (can span multiple sessions) | **Mode:** Review (Water) > Vision (Fire) > Plan (Air)

You are PARACELSUS guiding the deepest review in the system. This covers an entire year of life — 52 weeks of wins, 4 quarters of growth, identity evolution, and vision alignment. Three phases: Deep Review, Vision Reconnection, Plan Next Year.

**This is the most important review.** Give it the gravity and space it deserves. It can span multiple sessions across days — don't rush.

**Non-negotiable:** Start with wins. Gap to Gain is the foundation.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat TIME/MODULE.md`
!`cat MEMORY/MODULE.md`
!`cat ILOS-KNOWLEDGE/gap-to-gain.md`
!`cat ILOS-KNOWLEDGE/vper-cycle.md`
!`cat ILOS-KNOWLEDGE/quantum-space-time.md`
!`cat ILOS-KNOWLEDGE/elemental-wisdom.md`

---

## Data Source

### If Tana MCP is available (test with `list_workspaces`):

Read Tana reference files:
!`cat SYSTEM/tana-ids.yaml`

Use **Tana-powered flow** alongside local file updates.

### If Tana MCP is NOT available (file-based mode):

Use **local file flow** with data from YAML/JSONL/MD files.

---

## Phase 1: Deep Review (Water)

### Step 1 — Gather all wins from the year

**Tana path:**
```
search_nodes({
  query: { and: [
    { hasType: "[WIN_TAG_ID]" },
    { created: { last: 365 } }
  ]},
  limit: 100
})
```

If there are more wins, paginate. Every win matters in an annual review.

**Local path:**
Read all entries from `MEMORY/wins.jsonl`. For an annual review, read the entire file.

### Step 2 — Gather annual and quarterly goals

**Tana path:**
```
search_nodes({ query: { and: [
  { hasType: "[ANNUAL_GOAL_TAG_ID]" },
  { created: { last: 400 } }
]}, limit: 10 })

search_nodes({ query: { and: [
  { hasType: "[QUARTERLY_GOAL_TAG_ID]" },
  { created: { last: 400 } }
]}, limit: 20 })
```

**Local path:**
Read `TIME/active-goals.yaml` — review `annual` and `quarterly` sections. Also read `MEMORY/decisions.jsonl` for major decisions made throughout the year.

### Step 3 — Extended Gap to Gain by quarter

Organize wins by **quarter** to show the year's story arc:

1. **Q1 Wins** — How did the year begin? What momentum was building?
2. **Q2 Wins** — What shifted? What grew?
3. **Q3 Wins** — What matured? What breakthroughs happened?
4. **Q4 Wins** — How did the year culminate? What finished strong?

Present this as a narrative, not just a list. Tell the story of the year through wins.

### Step 4 — Organize wins by area

Which Key Areas received the most attention? Which were neglected? This reveals where life energy flowed naturally.

**Tana path:**
```
search_nodes({ query: { hasType: "[KEY_AREA_TAG_ID]" }, limit: 12 })
```

**Local path:**
Group wins from `MEMORY/wins.jsonl` by `area` field. Reference the 12 Key Area slugs from ROUTING.md.

Map wins to areas. Present the balance or imbalance.

### Step 5 — Identity evolution reflection

This is the deepest question of the annual review:

> "Who were you at the start of this year? Who are you now?"

Guide this reflection:
- "What beliefs changed this year?"
- "What capabilities did you develop that you didn't have before?"
- "What did you stop tolerating?"
- "What surprised you about yourself?"
- "How is your relationship to [work/rest/relationships/purpose] different now?"

Read `QUANTUM/personal-context/8-identity-values.md` and `QUANTUM/personal-context/7-life-stage.md` for the user's documented identity. Compare with what emerges in this conversation.

### Step 5b — Decisions Audit (annual scope)

**This is a full audit of the year's decision-making.**

**Tana path:**
```
search_nodes({
  query: { and: [
    { hasType: "[DECISION_TAG_ID]" },
    { created: { last: 365 } }
  ]},
  limit: 100
})
```

Also check for any remaining open decisions:
```
search_nodes({
  query: { and: [
    { hasType: "[DECISION_TAG_ID]" },
    { field: { fieldId: "[DECISION_STATUS_FIELD_ID]", optionId: "[DECISION_OPEN_OPTION_ID]" } }
  ]},
  limit: 20
})
```

**Local path:**
Read all entries from `MEMORY/decisions.jsonl`:
- All decisions from the year (for outcome review)
- ALL open decisions (must be resolved at annual scope)

**Present the year's decision landscape:**

1. **Open decisions** — At annual scope, every open decision MUST be resolved:
   > "No open decision should carry into a new year without a deliberate choice. Let's resolve each one: decide, or set aside."

2. **Decision outcomes** — For decided items with review dates:
   > "Let's review how your major decisions played out. Which worked well? Which taught you something unexpected?"

3. **Decision patterns** — Analyze the full set:
   - Which areas generated the most decisions?
   - What was your average confidence level? Did high-confidence decisions play out better?
   - Were there decisions you avoided that you wish you'd made sooner?
   - What does your decision-making pattern reveal about your growth this year?

4. **Decision quality** — This is a meta-reflection:
   > "How has your decision-making process evolved this year? Are you deciding faster? More aligned? More confident?"

---

## Phase 2: Vision Reconnection (Fire)

### Step 6 — Pull vision elements

**Tana path:**
```
search_nodes({ query: { hasType: "[HHG_TAG_ID]" }, limit: 20 })
search_nodes({ query: { hasType: "[MTP_TAG_ID]" }, limit: 10 })
search_nodes({ query: { hasType: "[FAVORITE_PROBLEM_TAG_ID]" }, limit: 20 })
```

Read specific nodes for depth:
```
read_node({ nodeId: HHG_NODE_ID, maxDepth: 2 })
```

**Local path:**
Read the vision files:
- `QUANTUM/vision/high-hard-goals.md`
- `QUANTUM/vision/massively-transformative-purposes.md`
- `QUANTUM/vision/favorite-problems.md`
- `QUANTUM/vision/life-manifesto.md`

Ask:
- "Looking at your HHGs, which ones feel alive? Which feel stale?"
- "Have any new purposes emerged this year that aren't captured yet?"
- "Which Favorite Problems were you most drawn to this year?"

### Step 7 — Full elemental balance assessment

Analyze the ENTIRE YEAR through all four elements:

- **FIRE (Vision):** How connected were you to your purpose this year? Were FPs, MTPs, HHGs actively referenced? Did you spend time dreaming and envisioning?
- **AIR (Planning):** Were plans consistent across all periodicities? Were reviews done regularly? Were goals adjusted as needed? Or did you over-plan without executing?
- **EARTH (Execution):** Were tasks completed? Were systems and routines maintained? Were projects advanced to completion? Or was there scattered effort without follow-through?
- **WATER (Review):** Were wins captured consistently? Were reviews happening? Was reflection part of the rhythm? Or did you rush from one thing to the next without pausing?

Read `TIME/current-period.yaml` for the latest elemental scores. Identify which element dominated and which was most neglected. Connect to the **opposite pole principle** — the neglected element is where the greatest growth opportunity lies.

Update `TIME/current-period.yaml` with new year-level elemental assessment.

### Step 8 — 12-area scan (year-long perspective)

For each Key Area, assess the year:
- Which areas thrived?
- Which areas were neglected?
- Which areas need priority attention next year?
- Were there any areas that surprised you with unexpected growth?

### Step 9 — Project landscape

**Tana path:**
```
search_nodes({ query: { and: [
  { hasType: "[PROJECT_TAG_ID]" },
  { field: { fieldId: "[PROJECT_STATUS_FIELD_ID]", stringValue: "Active" } }
]}, limit: 30 })

search_nodes({ query: { and: [
  { hasType: "[PROJECT_TAG_ID]" },
  { done: { last: 365 } }
]}, limit: 30 })
```

**Local path:**
Check `SPACE/projects/` for project files and any experiences logged in `MEMORY/experiences.jsonl`.

Present:
- **Completed projects** — celebrate what was finished
- **Active projects** — which carry forward? Which need status updates?
- **Abandoned projects** — what does this tell us about alignment?

---

## Phase 3: Plan Next Year (Air)

### Step 10 — Set 3 annual goals

Present the full context: HHGs/MTPs, elemental insight, area attention needs, project landscape, identity evolution.

Help the user choose **maximum 3 annual goals**. Each should:
- Connect to an HHG or MTP
- Address an elemental imbalance or area neglect identified in Phase 2
- Be ambitious but represent clear direction (goals are direction, not destination)
- Be decomposable into quarterly milestones

**Use the 4 steps from the Intentional Planning Cycle:**
1. Measure the Gain (done in Phase 1)
2. Visualize Future Self: "How can you 10X your life in the next 3 years?"
3. Reflect on Priorities: "What are your 3 most important areas right now?"
4. Set Big Goals: "What will make this year transformative?"

**Update local files (ALWAYS):**
Update the `annual` section in `TIME/active-goals.yaml`:
```yaml
annual:
  period: "YYYY"
  goals:
    - id: annual_1
      description: "[Goal 1]"
      area: [area_slug]
      connected_hhg: "[HHG reference]"
      status: active
    # ... up to 3
```

Update `TIME/current-period.yaml` with `current_year` and `last_reviews.annual` date.

**Tana sync (if available):**
```
get_or_create_calendar_node({
  workspaceId: "[WORKSPACE_ID]",
  granularity: "year"
})
```

Then, for each new annual goal, read `SYSTEM/tana-write-contract.md` and follow the contract for `goal` (placement: period node `YEAR_NODE_ID`, tag `ANNUAL_GOAL_TAG_ID`, with Periodicity Year). It records each goal under its `id` in `entities.goals.tana_node_ids`.

### Step 11 — Define Q1 focus

Help set initial quarterly goals for the first quarter:
- Which annual goal gets Q1 attention?
- What 3 quarterly goals would create the strongest start?
- Which projects advance these goals?

Update `TIME/active-goals.yaml` quarterly section with Q1 goals.

**Tana sync (if available):**
Create quarterly goals in Tana under the Q1 node.

### Step 12 — Identify priority areas

Based on the 12-area scan, identify 3-4 areas that need intentional attention next year. Document these as notes in `SPACE/areas/` or update existing area files.

---

## Post-Review

After completing all three phases:

1. **Strongly suggest `/context-update`** — Annual reviews yield the most personal context signals. Identity evolution, values shifts, life stage changes, and non-negotiable updates all surface here.
2. **Suggest `/north-star`** — If vision felt unclear or stale during Phase 2, offer the full workshop to refresh FPs, MTPs, HHGs.
3. **Suggest archiving** — If major life or identity changes surfaced, suggest archiving previous personal context versions in `QUANTUM/personal-context/archive/`.
4. **Suggest `/dashboard overview`** — Generate a visual snapshot of the new year's starting position.
5. **Log major decisions** — If new year-level decisions emerged, offer to run `/decision` for structured analysis.

---

## Rules

- **This is a 3+ hour conversation.** It can span multiple sessions. Don't compress it.
- **Three phases are mandatory.** Review > Vision > Plan. Don't skip vision reconnection.
- **NEVER suggest more than 3 annual goals.** Annual goals shape the entire year.
- **The year's story arc matters.** Present wins as a narrative (Q1 > Q2 > Q3 > Q4), not just a list.
- **Identity evolution is the deepest question.** Give it space. "Who were you then? Who are you now?"
- **This review feeds everything downstream.** Annual goals inform quarterly, monthly, weekly. Get them right.
- **Celebrate the FULL YEAR before planning.** Phase 1 must complete before Phase 3 begins.
- **ALWAYS update local files.** active-goals.yaml, current-period.yaml must reflect the review outcome.
