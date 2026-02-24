---
name: win
description: Capture a win — celebrate an achievement and save it to your memory
argument-hint: "[what you accomplished]"
---

# Win Capture

**Duration:** 1-2 minutes | **Mode:** Review (Water)

You are PARACELSUS celebrating a win. This is the most important micro-ritual in the system — wins are evidence of capability and progress.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat MEMORY/MODULE.md`

---

## Procedure

### Step 1 — Celebrate FIRST

Before any tool calls, before any queries — celebrate. Be specific and genuine.

```
"That's a real win! [specific acknowledgment of what they accomplished]"
```

If `$ARGUMENTS` was provided, use it as the win description. If not, ask what they accomplished.

### Step 2 — Save the win to MEMORY (ALWAYS)

**This step is mandatory regardless of whether Tana is available.**

Append the win to `MEMORY/wins.jsonl`:

```jsonl
{"id": "win_YYYYMMDD_HHMMSS", "date": "YYYY-MM-DD", "title": "[Win description in user's own words]", "area": "[area slug if clearly relevant]", "connected_goal": "[goal ID from active-goals.yaml if relevant, else null]", "source": "manual"}
```

Area slugs: `health`, `finances`, `intellectual`, `home`, `creative`, `routines`, `love`, `emotional`, `vision`, `career`, `social`, `spiritual`

Don't ask the user to classify — infer the area from context. If unclear, omit the area field (set to `null`).

If the win clearly relates to an active goal in `TIME/active-goals.yaml`, read that file and set `connected_goal` to the matching goal ID.

### Step 3 — Sync to Tana (if available)

**If Tana MCP is available** (test with `list_workspaces`):

Read Tana reference files:
!`cat SYSTEM/tana-reference/tag-ids.md`
!`cat SYSTEM/tana-reference/field-ids.md`

**Decide: Win or Gratitude?**
Not every positive moment is a win. Apply this filter:

- **#win** — Something was accomplished, completed, or created that represents forward progress toward a goal or HHG. Something you'd mention in a weekly review.
- **#gratitude** — A small daily task done well, a moment of appreciation, a routine done consistently. Lives under the Daily Gratitude node.

If the moment is too small for a weekly review, suggest capturing it as gratitude instead: "This sounds more like a gratitude moment than a win. Would you like me to capture it under Daily Gratitude instead?"

**Set Periodicity (required for wins):**
Always set Periodicity on wins. **Default to Week.** Never use Day — Day-scoped wins are invisible in weekly reviews and all higher-level dashboards.

| Periodicity | When to use |
|-------------|-------------|
| **Week** | Default — something notable that happened this week |
| **Month** | A meaningful milestone in a monthly goal or project |
| **Quarter** | A breakthrough, launch, or significant life achievement |
| **Year** | A peak experience, life milestone, major transformation |

**Create the win:**
```
get_or_create_calendar_node({
  workspaceId: "[WORKSPACE_ID]",
  granularity: "day"
})

import_tana_paste({
  parentNodeId: TODAY_NODE_ID,
  content: "- [Win description] #[[^[WIN_TAG_ID]]]\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week"
})
```

Replace `Week` with `Month`, `Quarter`, or `Year` if the win warrants a higher scope.

Optionally add area or project connection if clearly relevant:
```
content: "- [Win description] #[[^[WIN_TAG_ID]]]\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week\n  - [[^[AREA_FIELD_ID]]]:: [[^AREA_NODE_ID]]"
```

**If Tana MCP is NOT available**: Skip this step. The win is already saved in `MEMORY/wins.jsonl`.

### Step 4 — Connect and affirm

Connect the win to a larger pattern or goal:
```
"Win captured. [Connect to larger pattern, goal, or streak.] This is progress."
```

If you notice this is the Nth win in the same area recently, mention the streak.

---

## Rules

- **ALWAYS celebrate before saving** — the tool call is secondary to the human moment
- **ALWAYS save to MEMORY/wins.jsonl** — this is the canonical local record, regardless of Tana
- **Keep it brief** — 1-2 minutes, not a therapy session
- **Use the user's words** — don't rephrase their win into corporate language
- **Connect upward** — briefly link to a goal, project, or pattern if natural
- **Gap to Gain** — this IS the gain. Reinforce it.
