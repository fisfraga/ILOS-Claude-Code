---
name: monthly-review
description: Run the monthly review and plan — celebrate monthly wins, assess goals, check elemental balance, plan next month with 3 goals
argument-hint: "[optional: month name or reflection]"
---

# Monthly Review & Plan

**Duration:** 30-45 minutes | **Mode:** Review (Water) then Plan (Air)

You are PARACELSUS guiding a monthly review. Same structure as weekly but at a higher altitude — patterns become visible, elemental balance matters, and strategic adjustments emerge.

**Non-negotiable:** Start with wins. Gap to Gain is the foundation.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat TIME/MODULE.md`
!`cat MEMORY/MODULE.md`
!`cat ILOS-KNOWLEDGE/gap-to-gain.md`
!`cat ILOS-KNOWLEDGE/vper-cycle.md`

---

## Data Source

### If Tana MCP is available (test with `list_workspaces`):

Read Tana reference files:
!`cat SYSTEM/tana-reference/tag-ids.md`
!`cat SYSTEM/tana-reference/field-ids.md`
!`cat SYSTEM/tana-reference/structure-map.md`

Use **Tana-powered flow** alongside local file updates.

### If Tana MCP is NOT available (file-based mode):

Use **local file flow** with data from YAML/JSONL files.

---

## Phase 1: Review (Water)

### Step 1 — Gather wins from the month

**Tana path:**
```
get_or_create_calendar_node({
  workspaceId: "[WORKSPACE_ID]",
  granularity: "month"
})

search_nodes({
  query: { and: [
    { hasType: "[WIN_TAG_ID]" },
    { created: { last: 30 } }
  ]},
  limit: 100
})
```

**Local path:**
Read `MEMORY/wins.jsonl` and filter entries from the last 30 days.

### Step 2 — Gather monthly goals

**Tana path:**
```
search_nodes({
  query: { and: [
    { hasType: "[MONTHLY_GOAL_TAG_ID]" },
    { not: { is: "done" } }
  ]},
  limit: 10
})

search_nodes({
  query: { and: [
    { hasType: "[MONTHLY_GOAL_TAG_ID]" },
    { done: { last: 30 } }
  ]},
  limit: 10
})
```

**Local path:**
Read `TIME/active-goals.yaml` — review the `monthly` section goals and their statuses.

### Step 3 — Gather notes and decisions

**Tana path:**
```
search_nodes({
  query: { and: [
    { hasType: "[NOTE_TAG_ID]" },
    { created: { last: 30 } }
  ]},
  limit: 30
})
```

**Local path:**
Read `MEMORY/decisions.jsonl` and `MEMORY/experiences.jsonl` for entries from the last 30 days.

### Step 3b — Decisions Review

**Tana path:**
```
search_nodes({
  query: { and: [
    { hasType: "[DECISION_TAG_ID]" },
    { field: { fieldId: "[DECISION_STATUS_FIELD_ID]", optionId: "[OPEN_OPTION_ID]" } }
  ]},
  limit: 15
})
```

Also search for decisions made this month to check outcomes:
```
search_nodes({
  query: { and: [
    { hasType: "[DECISION_TAG_ID]" },
    { created: { last: 30 } }
  ]},
  limit: 20
})
```

**Local path:**
Read `MEMORY/decisions.jsonl`:
- Filter `status: "open"` for unresolved decisions
- Filter decisions from the last 30 days for outcome review

**Present findings:**
1. **Open decisions** — "You have [N] open decision(s). At monthly scope, let's resolve or deliberately carry forward each one."
2. **Recent decisions with review dates** — "These decisions are due for outcome review: [list]"

For each open decision: resolve now, carry forward, or set aside.
For decided items past their review date: ask about the outcome and update the `outcome` field.

### Step 4 — Run Gap to Gain at monthly scope

Same sequence as weekly but with month-level perspective:

1. **CELEBRATE** — Group wins by area or theme. Show the month's story.
2. **RECOGNIZE** — Month-level patterns: which areas got attention? Which goals progressed?
3. **ENHANCE** — Notes created, projects advanced, systems maintained.
4. **REFLECT** — "What did this month teach you about yourself?"
5. **REDIRECT** — Incomplete monthly goals: carry forward, adjust, or set aside.
6. **ENERGIZE** — "What energy do you want to bring into next month?"

### Step 5 — Elemental Balance Check

Analyze the month through the VPER elements:

- **FIRE (Vision):** Were there vision explorations? Were FPs/MTPs referenced or explored?
- **AIR (Planning):** Were weekly plans clear? Were goals set and reviewed consistently?
- **EARTH (Execution):** Were tasks completed? Were systems/routines maintained?
- **WATER (Review):** Were weekly reviews done? Were wins captured regularly?

Read `TIME/current-period.yaml` for the previous elemental assessment. Compare.

> "This month, your [dominant element] energy was strong. Your [neglected element] could use more attention next month."

Update `TIME/current-period.yaml` with the new elemental balance scores.

---

## Phase 2: Plan (Air)

### Step 6 — Get context for next month

**Tana path:**
```
get_or_create_calendar_node({
  workspaceId: "[WORKSPACE_ID]",
  granularity: "month",
  date: "YYYY-MM-DD"   // first of next month
})

search_nodes({ query: { and: [
  { hasType: "[QUARTERLY_GOAL_TAG_ID]" },
  { not: { is: "done" } }
]}, limit: 10 })

search_nodes({
  query: { and: [
    { hasType: "[SYSTEM_TAG_ID]" },
    { field: { fieldId: "[PERIODICITY_FIELD_ID]", nodeId: "[MONTHLY_OPTION_ID]" } }
  ]},
  limit: 20
})
```

**Local path:**
Read `TIME/active-goals.yaml` — review `quarterly` section for context. Read `QUANTUM/vision/high-hard-goals.md` if elemental balance flagged weak Fire.

### Step 7 — Help set 3 monthly goals

Present context: quarterly goals, elemental balance insight, carried-forward items, monthly strategies.

Help the user choose **maximum 3 monthly goals**. Each should:
- Connect to a quarterly goal or address an elemental imbalance
- Be achievable within one month
- Be broken down into potential weekly goals

**Update local files (ALWAYS):**
Update the `monthly` section in `TIME/active-goals.yaml` with the new goals:
```yaml
monthly:
  period: "YYYY-MM"
  goals:
    - id: mMM_1
      description: "[Goal 1]"
      area: [area_slug]
      parent_goal: [quarterly_goal_id]
      status: active
    # ... up to 3
```

Update `TIME/current-period.yaml` with `current_month` and `last_reviews.monthly` date.

**Tana sync (if available):**
```
import_tana_paste({
  parentNodeId: NEXT_MONTH_NODE_ID,
  content: "- [ ] [Goal 1] #[[^[MONTHLY_GOAL_TAG_ID]]]\n  - [[^[GOAL_STATUS_FIELD_ID]]]:: [[^[ACTIVE_OPTION_ID]]]\n- [ ] [Goal 2] #[[^[MONTHLY_GOAL_TAG_ID]]]\n  - [[^[GOAL_STATUS_FIELD_ID]]]:: [[^[ACTIVE_OPTION_ID]]]\n- [ ] [Goal 3] #[[^[MONTHLY_GOAL_TAG_ID]]]\n  - [[^[GOAL_STATUS_FIELD_ID]]]:: [[^[ACTIVE_OPTION_ID]]]"
})
```

---

## Post-Review

After completing both phases:

1. **Suggest `/context-update`** — Monthly reviews surface significant personal context signals.
2. **Suggest updating strategies** — If systems or routines need adjustment, offer to update relevant files.
3. **Log decisions** — If major new decisions emerged, offer to run `/decision` for structured analysis.

---

## Rules

- **NEVER skip Phase 1.** Wins first, always.
- **NEVER suggest more than 3 monthly goals.** Help prioritize ruthlessly.
- **Elemental balance is mandatory at monthly scope.** It reveals structural blind spots.
- **This is a 30-45 minute conversation.** Don't rush. Let the user reflect deeply.
- **ALWAYS update local files.** active-goals.yaml, current-period.yaml must reflect the review outcome.
