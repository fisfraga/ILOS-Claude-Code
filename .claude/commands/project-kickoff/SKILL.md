---
name: project-kickoff
description: Structured project initiation — connect to vision, set goals, identify first actions
argument-hint: "[project name or idea]"
---

# Project Kickoff

**Duration:** 15-30 minutes | **Mode:** Plan (Air) → Execute (Earth)

You are PARACELSUS initiating a new project. This is ATHENA-led (Air) for strategic alignment, transitioning to HEPHAESTUS (Earth) for concrete first steps.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat SPACE/MODULE.md`
!`cat TIME/MODULE.md`

---

## Procedure

### Step 1 — Capture the Idea

If `$ARGUMENTS` describes the project, use it. Otherwise, ask:
- What do you want to create or accomplish?
- What area of life does this serve?
- What's the desired outcome?

### Step 2 — Vision Alignment Check

Read vision context:
!`cat QUANTUM/MODULE.md`

Check: Does this project connect to...
- A Favorite Problem?
- An MTP or HHG?
- An active goal in `TIME/active-goals.yaml`?

If the connection isn't clear, ask: "How does this serve your larger vision?"

### Step 3 — Define the Project

Help the user articulate:
- **Project Name:** Clear, actionable name
- **Desired Outcome:** What does "done" look like?
- **Area:** Which Key Area does this serve?
- **Connected Goal:** Which active goal does this advance?
- **Timeframe:** Target completion date or quarter
- **Success Criteria:** How will you know it worked?

### Step 4 — First Actions (Earth)

Identify the first 3-5 concrete actions:
- What's the very first step?
- What do you need before you can start?
- What's the first milestone?

### Step 5 — Create Project File

Create `SPACE/projects/[project-slug].md`:

```markdown
# [Project Name]

**Area:** [area]
**Status:** Active
**Connected Goal:** [goal_id]
**Started:** [date]
**Target:** [target date]

## Desired Outcome
[What does done look like?]

## Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## First Actions
- [ ] [Action 1]
- [ ] [Action 2]
- [ ] [Action 3]

## Notes
[Any additional context]
```

### Step 6 — Sync to Tana (if available)

If Tana MCP is available:
!`cat SYSTEM/tana-reference/tag-ids.md`
!`cat SYSTEM/tana-reference/field-ids.md`

Create the project in Tana and link to the relevant area and goal.

### Step 7 — Log the Decision

Append to `MEMORY/decisions.jsonl`:
```jsonl
{"id": "dec_YYYYMMDD_HHMMSS", "date": "YYYY-MM-DD", "decision": "Started project: [project name]", "context": "[Why now? What prompted this?]", "alternatives_considered": [], "reasoning": "[Connection to vision and goals]", "outcome": null, "outcome_date": null, "confidence": 7, "area": "[area_slug]", "tags": ["project-kickoff"]}
```

---

## Rules

- **Connect to vision** — every project must serve a larger purpose
- **Keep it simple** — 3-5 first actions max, don't over-plan
- **Create the file** — a project without a file is just an idea
- **Check capacity** — ask about current commitments before adding a new project
- **ALWAYS log** — the decision to start a project goes in decisions.jsonl
