---
name: sync
description: Sync local ILOS files with your Tana workspace — bidirectional based on your configured sync mode (full or partial)
argument-hint: "[optional: full | partial | goals-only | status]"
---

# ILOS Sync — Tana Bidirectional Sync

**Duration:** 5-15 minutes (depends on scope) | **Mode:** Ether (System)

You are HERMES running a structured bidirectional sync between local ILOS files and the Tana workspace. Tana is the source of truth for structural data (areas, projects, topics, vision). Local files are canonical for episodic memory (wins, decisions, failures).

**CRITICAL:** All Tana MCP calls must be **sequential** (one at a time). Never issue two MCP tool calls in the same message.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat SYSTEM/sync-config.yaml`
!`cat SYSTEM/sync-state.yaml`
!`cat SYSTEM/tana-ids.yaml`

---

## Flag Handling

| Invocation | Behavior |
|---|---|
| `/sync` | Run sync using mode from sync-config.yaml |
| `/sync full` | Override to full sync regardless of config |
| `/sync partial` | Override to partial sync regardless of config |
| `/sync goals-only` | Only sync goals (fastest option) |
| `/sync status` | Show sync status without running sync |

If `$ARGUMENTS` is "status" → jump to **STATUS DISPLAY** block below.
If `$ARGUMENTS` is "full" → use full scope regardless of config.
If `$ARGUMENTS` is "partial" → use partial scope regardless of config.
If `$ARGUMENTS` is "goals-only" → use goals-only scope.

---

## STATUS DISPLAY

If invoked as `/sync status`:

1. Read `SYSTEM/sync-state.yaml`
2. Read `SYSTEM/sync-config.yaml`
3. Display:

```
📊 ILOS Sync Status

Mode: [full | partial] (from sync-config.yaml)
Workspace: [tana_workspace_id or "not configured"]

Last full sync:    [timestamp or "never"]
Last partial sync: [timestamp or "never"]

Entity last synced:
  Goals:            pull [timestamp] | push [timestamp]
  Areas:            pull [timestamp]
  Projects:         pull [timestamp] | push [timestamp]
  Topics:           pull [timestamp] | push [timestamp]
  Vision:           pull [timestamp] | push [timestamp]
  Personal Context: pull [timestamp] | push [timestamp]
  Wins:             push [timestamp] | last: [win_id]
  Decisions:        push [timestamp]
  Strategy Systems: pull [timestamp]
  Weekly Reviews:   push [timestamp]

💡 Run /sync to update.
```

Stop here. Do not proceed to sync phases.

---

## Pre-Flight Check

### Step 0 — Verify Tana is configured

Read `SYSTEM/sync-config.yaml`:
- If `tana_workspace_id` is empty → stop and inform:
  > "Tana workspace is not configured. Run `/sync-setup` first to configure your sync settings and connect your Tana workspace."

Read `SYSTEM/tana-ids.yaml`:
- If all its values are empty → stop and inform:
  > "Tana reference IDs are not set up. Run `/tana-understand` first to discover and document your workspace IDs, then run `/sync-setup`."

**MCP Call 1 of N — Test connectivity:**
```
list_workspaces()
```
If this fails → stop and inform:
> "Tana MCP is not available. Check that your Tana MCP server is running and configured in Claude Code settings (mcp__tana-local). You can still use ILOS locally without Tana."

### Step 0b — Resolve container targets

`/sync` and `/win` push to container nodes inside Tana. Each container has a default (the matching `*_CONTAINER_ID` key in `SYSTEM/tana-ids.yaml`) and an optional override (taken from `SYSTEM/sync-config.yaml` under `tana_node_overrides`).

For each container below, resolve in this order:

1. If `sync-config.yaml`'s `tana_node_overrides.<key>` is present and non-empty → use it.
2. Otherwise → use the `tana-ids.yaml` default.

| Container key | Default (tana-ids.yaml key) |
|---|---|
| `wins_container_id` | `WINS_CONTAINER_ID` |
| `decisions_container_id` | `DECISIONS_CONTAINER_ID` |
| `goals_container_id` | `GOALS_CONTAINER_ID` |
| `projects_container_id` | `PROJECTS_CONTAINER_ID` |
| `topics_container_id` | `TOPICS_CONTAINER_ID` |
| `vision_fp_container_id` | `VISION_FP_CONTAINER_ID` |
| `vision_mtp_container_id` | `VISION_MTP_CONTAINER_ID` |
| `vision_hhg_container_id` | `VISION_HHG_CONTAINER_ID` |

Record the resolved IDs — you'll use them throughout Phase 4 (Apply Changes).

**Why overrides exist:** Recording demos, onboarding sandboxes, and multi-project workspaces sometimes want sync to land in a dedicated subtree instead of the canonical hubs. Overrides keep the skill generic while allowing per-workspace redirection.

---

## Phase 1: Determine Scope

Based on flag or `sync_mode` in sync-config.yaml, set the entity scope:

**Full scope** (`sync_mode: full` or `/sync full`):
- [ ] goals (all 4 levels)
- [ ] areas (full content)
- [ ] projects (full content)
- [ ] topics (full content)
- [ ] vision (FPs, MTPs, HHGs)
- [ ] personal_context (all 9 files)
- [ ] wins (all history)
- [ ] decisions (all statuses)
- [ ] strategy_systems
- [ ] weekly_reviews

**Partial scope** (`sync_mode: partial` or `/sync partial`):
- [ ] goals (all 4 levels — always)
- [ ] vision (FPs, MTPs, HHGs — always)
- [ ] areas (metadata only: name, status, description)
- [ ] projects (metadata only: name, status, area, desired_outcome)
- [ ] topics (metadata only: name, status, area)
- [ ] personal_context (files 0, 4, 5, 8 only — if `include_core_context: true`)
- [ ] wins (last N days — if `include_recent_wins_days > 0`)
- [ ] decisions (open only — if `include_open_decisions: true`)

**Goals-only scope** (`/sync goals-only`):
- [ ] goals (all 4 levels only)

Show user the scope before proceeding:
> "Running [full | partial | goals-only] sync. This will check: [list of entity types]."

Ask: "Proceed? (yes/no)"

---

## Phase 2: Pull (Tana → Local)

Execute sequential MCP calls in dependency order. After each call, note what changed before moving to the next.

### GOALS PULL

**MCP Call — Annual goals:**
```
search_nodes({
  query: { and: [{ hasType: "[ANNUAL_GOAL_TAG_ID]" }] },
  limit: 10
})
```
Compare results with `annual` section of `TIME/active-goals.yaml`. Note any goals in Tana not in local file (new from Tana), or status differences.

**MCP Call — Quarterly goals:**
```
search_nodes({
  query: { and: [{ hasType: "[QUARTERLY_GOAL_TAG_ID]" }] },
  limit: 20
})
```
Compare with `quarterly` section of `TIME/active-goals.yaml`.

**MCP Call — Monthly goals:**
```
search_nodes({
  query: { and: [{ hasType: "[MONTHLY_GOAL_TAG_ID]" }] },
  limit: 20
})
```

**MCP Call — Weekly goals:**
```
search_nodes({
  query: { and: [{ hasType: "[WEEKLY_GOAL_TAG_ID]" }] },
  limit: 20
})
```

### AREAS PULL (full sync: full content; partial: metadata only)

**MCP Call — Key areas:**
```
search_nodes({
  query: { and: [{ hasType: "[KEY_AREA_TAG_ID]" }] },
  limit: 20
})
```

For each area returned, note:
- Name (title)
- Status field value
- Description field value

For **full sync**: Also fetch full node content for each area:
```
read_node({ nodeId: "[AREA_NODE_ID]" })
```
(One read_node call per area — sequential)

Compare with corresponding `SPACE/areas/{slug}.md` files.

### PROJECTS PULL (if in scope)

**MCP Call — Projects:**
```
search_nodes({
  query: { and: [
    { hasType: "[PROJECT_TAG_ID]" },
    { not: { field: { fieldId: "[PROJECT_STATUS_FIELD_ID]", optionId: "[PROJECT_COMPLETED_OPTION_ID]" } } }
  ]},
  limit: 50
})
```

For **full sync**: fetch full content of each project node.
For **partial sync**: use only name, status, area, desired_outcome from search results.

Compare with `SPACE/projects/` directory.

### TOPICS PULL (if in scope)

**MCP Call — Topics:**
```
search_nodes({
  query: { and: [{ hasType: "[TOPIC_TAG_ID]" }] },
  limit: 50
})
```

Compare with `SPACE/topics/` directory.

### VISION PULL (if in scope)

**MCP Call — Favorite Problems:**
```
search_nodes({
  query: { and: [{ hasType: "[FAVORITE_PROBLEM_TAG_ID]" }] },
  limit: 20
})
```

**MCP Call — MTPs:**
```
search_nodes({
  query: { and: [{ hasType: "[MTP_TAG_ID]" }] },
  limit: 10
})
```

**MCP Call — HHGs:**
```
search_nodes({
  query: { and: [{ hasType: "[HHG_TAG_ID]" }] },
  limit: 20
})
```

Compare with `QUANTUM/vision/` files.

### PERSONAL CONTEXT PULL (if in scope)

**MCP Call — Context nodes:**
```
search_nodes({
  query: { and: [{ hasType: "[CONTEXT_TAG_ID]" }] },
  limit: 20
})
```

Compare with `QUANTUM/personal-context/` files.
- Full sync: compare all 9 files (0-8)
- Partial sync: compare only files 0 (manifesto), 4 (non-negotiables), 5 (work), 8 (identity)

---

## Phase 3: Diff Summary

After all pulls are complete, present a clear diff summary to the user:

```
📋 Sync Diff Summary

GOALS:
  ✅ N goals match (no changes needed)
  📥 N goals in Tana not yet in local files (will pull)
  📤 N local goals not yet in Tana (will push)
  ⚡ N goals with status differences (Tana wins)

AREAS:
  ✅ N areas match
  📥 N areas with updated content in Tana (will pull)
  ⚠️  N local areas not found in Tana (check area setup)

PROJECTS:
  📥 N projects with updates in Tana
  📤 N local projects not in Tana (will push)

TOPICS:
  📥 N topics with updates in Tana
  📤 N local topics not in Tana (will push)

VISION:
  ✅ In sync

PERSONAL CONTEXT:
  📥 [file name] updated in Tana (will pull)

WINS (push only):
  📤 N wins to push to Tana (since last push)

DECISIONS (push only):
  📤 N open decisions to push to Tana

No changes needed for: [list entity types that are already in sync]
```

Ask: **"Apply these changes? (yes / no / show-details)"**

- `yes` → proceed to Phase 4
- `no` → abort, nothing changes
- `show-details` → list each specific change before asking again

---

## Phase 4: Apply Changes

Apply changes in dependency order. **One MCP call at a time.**

### 4A — Write Tana changes to local files

**Goals:** If Tana has goal updates not in local file, update `TIME/active-goals.yaml`.
- For new Tana goals: add entry under the correct time scale section
- For status updates: update the `status` field of the matching local goal
- For completed goals: update status to `completed`, preserve entry

**Areas (full sync):** If Tana has updated area content, update the corresponding `SPACE/areas/{slug}.md`.
- Preserve the YAML frontmatter at top of area file
- Update the body with Tana content

**Projects:** Update or create project files in `SPACE/projects/`.
- Filename: slugified project name (e.g., `website-redesign.md`)
- Format: YAML frontmatter matching `parseProjects()` expectations, then markdown body:
  ```markdown
  ---
  title: Project Name
  status: active
  area: career
  connected_goal: goal_id_or_null
  ---

  # Project Name
  [content from Tana if available]
  ```
- Store Tana node ID in `sync-state.yaml` under `projects.tana_node_ids`

**Topics:** Update or create topic files in `SPACE/topics/`.
- Filename: slugified topic name (e.g., `stoic-philosophy.md`)
- Format: YAML frontmatter with `title`, then markdown body following the template in `SPACE/topics/README.md`:
  ```markdown
  ---
  title: Topic Name
  ---

  # Topic Name

  ## Why This Interests Me
  [content from Tana if available]

  ## Key Ideas
  [content from Tana if available]

  ## Key Sources
  [content from Tana if available]

  ## Connections
  [content from Tana if available]

  ## Open Questions
  [content from Tana if available]
  ```
- For partial sync (metadata only): write frontmatter + heading only, leave sections empty
- Store Tana node ID in `sync-state.yaml` under `topics.tana_node_ids`

**Vision:** Update vision files in `QUANTUM/vision/` if Tana has newer versions.

**Personal Context:** Update affected files in `QUANTUM/personal-context/` if Tana has newer content.

### 4B — Push local items to Tana

**New goals** (local goals not found in Tana):
```
import_tana_paste({
  parentNodeId: "[GOALS_CONTAINER_ID_RESOLVED]",  // from Step 0b
  content: "- [Goal description] #[[^[ANNUAL_GOAL_TAG_ID]]]\n  - [[^[GOAL_STATUS_FIELD_ID]]]:: [[^[GOAL_ACTIVE_OPTION_ID]]]\n  - [[^[AREA_FIELD_ID]]]:: [area_name]"
})
```
Store returned node ID in sync-state.yaml.

**New projects** (local projects not in Tana):
```
import_tana_paste({
  parentNodeId: "[PROJECTS_CONTAINER_ID_RESOLVED]",  // from Step 0b
  content: "- [Project name] #[[^[PROJECT_TAG_ID]]]\n  - [[^[PROJECT_STATUS_FIELD_ID]]]:: [[^[PROJECT_ACTIVE_OPTION_ID]]]\n  - [[^[DESIRED_OUTCOME_FIELD_ID]]]:: [outcome]"
})
```
Store returned node ID in sync-state.yaml.

**New topics** (local topics not in Tana):
```
import_tana_paste({
  parentNodeId: "[TOPICS_CONTAINER_ID_RESOLVED]",  // from Step 0b
  content: "- [Topic name] #[[^[TOPIC_TAG_ID]]]"
})
```
Store returned node ID in sync-state.yaml.

**Unsynced wins** (wins in `MEMORY/wins.jsonl` that are NOT already tracked in `SYSTEM/sync-state.yaml` under `entities.wins.tana_node_ids`):

1. Read `MEMORY/wins.jsonl` (skip the schema line on line 1).
2. Read `entities.wins.tana_node_ids` from `sync-state.yaml`. **Legacy cursor:** if the map is missing and `entities.wins.last_pushed_win_id` is not null, the file predates this contract and the cursor was the only dedup. Create the map and seed it with the value `pre-map` for every win in `wins.jsonl` whose `id` sorts at or before the cursor (`win_YYYYMMDD_HHMMSS` ids sort chronologically); those wins were already pushed by the old logic and must not go again. If the map is missing and the cursor is null, create it empty.
3. Build the push list: every win whose `id` is NOT already a key in `tana_node_ids`.
   The text pushed to Tana is the win's `description`; entries written before the canonical format have `title` instead — use it when `description` is absent.
4. If the push list is empty, report "Wins already in sync" and skip this block. If it has more than 10 wins, show the count and ask the user to confirm before pushing.
5. For each win in the push list, execute **one** `import_tana_paste` call (sequential — never batch):

```
import_tana_paste({
  parentNodeId: "[WINS_CONTAINER_ID_RESOLVED]",  // from Step 0b
  content: "- [Win description] #[[^[WIN_TAG_ID]]]\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week\n  - [[^[AREA_FIELD_ID]]]:: [[^[AREA_NODE_ID]]]"
})
```

6. After each successful push, immediately update `sync-state.yaml`:
   - Add `entities.wins.tana_node_ids.<win_id>: <returned_tana_node_id>` (the map exists after step 2)
   - Update `entities.wins.last_push` to current ISO timestamp
   - Update `entities.wins.last_pushed_win_id` to this win's ID

**Empty ID guard:** if the wins container, the win tag ID or the Periodicity field ID resolves to empty, skip the wins push, record nothing in `tana_node_ids`, leave the wins unrecorded so a later `/sync` pushes them once `/tana-understand` has filled the IDs, and tell the user which ID is missing. Never fall back to a calendar node or any other target. The same guard applies to decisions (container, decision tag, status field, Open option).

**CRITICAL — Dedup contract with `/win`:** `/win` also pushes to Tana and records `tana_node_ids` entries immediately. This filter ensures wins created via `/win` are never re-pushed by `/sync`. If you see a win in `wins.jsonl` that already has an entry in `tana_node_ids`, skip it silently — that is not an error.

**CRITICAL — Periodicity:** For wins, Periodicity MUST be `Week` (or higher). NEVER `Day`. Day-scoped wins are invisible in weekly review dashboards.

**Unsynced decisions** (new open decisions not yet in Tana — use the same dedup pattern as wins, filtering `MEMORY/decisions.jsonl` against `entities.decisions.tana_node_ids`):
```
import_tana_paste({
  parentNodeId: "[DECISIONS_CONTAINER_ID_RESOLVED]",  // from Step 0b
  content: "- [Decision title] #[[^[DECISION_TAG_ID]]]\n  - [[^[DECISION_STATUS_FIELD_ID]]]:: [[^[DECISION_OPEN_OPTION_ID]]]\n  - Context:: [context text]\n  - Reasoning:: [reasoning]"
})
```
After each push, add the returned node ID to `entities.decisions.tana_node_ids.<decision_id>`.

### 4C — Update goal statuses in Tana (bidirectional)

For goals where local status differs from Tana status:
- If local is more recent: push status update to Tana
```
set_field_option({
  nodeId: "[TANA_GOAL_NODE_ID]",
  attributeId: "[GOAL_STATUS_FIELD_ID]",
  optionId: "[GOAL_COMPLETED_OPTION_ID | GOAL_BACKLOG_OPTION_ID | GOAL_ACTIVE_OPTION_ID]"
})
```
- If Tana is more recent: already handled in Phase 4A (written to local)

---

## Phase 5: Update Sync State

After all changes are applied, update `SYSTEM/sync-state.yaml`:

1. Set `last_full_sync` or `last_partial_sync` to current ISO timestamp
2. Update `entities.goals.last_pull` and `last_push` timestamps
3. Update `entities.areas.last_pull` timestamp
4. Update `entities.wins.last_push` and `last_pushed_win_id`
5. Update `entities.decisions.last_push` and `last_pushed_decision_id`
6. Store any new Tana node IDs returned from import operations

Write the updated state to `SYSTEM/sync-state.yaml`.

---

## Completion Message

```
✅ Sync complete — [timestamp]

Applied:
  📥 Pulled: N items from Tana → local files
  📤 Pushed: N items from local → Tana
  ⚡ Updated: N status changes

Everything is in sync.

💡 Next sync: Run /sync anytime, or it will be suggested during /morning and /weekly-review.
```

---

## Error Handling

**If an MCP call fails:**
- Note the failure with the specific entity type
- Continue with remaining entity types
- At end, report which entities synced successfully and which failed
- Do NOT update sync-state.yaml for failed entity types

**If a conflict is detected** (both Tana and local changed since last sync):
- Tana wins for: areas, projects, topics, vision, personal context
- Local wins for: wins (append-only, never overwrite)
- Goals: compare timestamps, Tana wins on tie
- Always show conflicts to user before applying

**If tana_workspace_id or tag IDs are missing:**
- Stop sync for that entity type
- Inform user which IDs are missing
- Suggest running `/tana-understand` to discover missing IDs
