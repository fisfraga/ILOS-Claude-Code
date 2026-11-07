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
Workspace: [WORKSPACE_ID from tana-ids.yaml (legacy fallback: sync-config.yaml's tana_workspace_id) or "not configured — run /tana-setup"]

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

The workspace ID lives in `SYSTEM/tana-ids.yaml` as `workspace.WORKSPACE_ID`.
- If it is empty, use the legacy fallback: a `sync-config.yaml` from ILOS 1.0 may still hold `tana_workspace_id` (legacy). If that is filled, use it and say once: "Run `/tana-setup` once to move your workspace ID into `SYSTEM/tana-ids.yaml`."
- If both are empty, or every value in `tana-ids.yaml` is empty → stop and inform:
  > "Tana isn't set up for ILOS yet. Run `/tana-setup` first (one time, 10-20 minutes)."

**MCP Call 1 of N — Test connectivity:**
```
list_workspaces()
```
If this fails → stop and inform:
> "Tana MCP is not available. Check that your Tana server is connected (`/mcp`); setup steps are in `SYSTEM/tana-mcp-setup.md`. You can still use ILOS locally without Tana."

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
  workspaceIds: ["[WORKSPACE_ID]"],
  query: { and: [{ hasType: "[ANNUAL_GOAL_TAG_ID]" }] },
  limit: 10
})
```
Compare results with `annual` section of `TIME/active-goals.yaml`. Note any goals in Tana not in local file (new from Tana), or status differences.

**MCP Call — Quarterly goals:**
```
search_nodes({
  workspaceIds: ["[WORKSPACE_ID]"],
  query: { and: [{ hasType: "[QUARTERLY_GOAL_TAG_ID]" }] },
  limit: 20
})
```
Compare with `quarterly` section of `TIME/active-goals.yaml`.

**MCP Call — Monthly goals:**
```
search_nodes({
  workspaceIds: ["[WORKSPACE_ID]"],
  query: { and: [{ hasType: "[MONTHLY_GOAL_TAG_ID]" }] },
  limit: 20
})
```

**MCP Call — Weekly goals:**
```
search_nodes({
  workspaceIds: ["[WORKSPACE_ID]"],
  query: { and: [{ hasType: "[WEEKLY_GOAL_TAG_ID]" }] },
  limit: 20
})
```

### AREAS PULL (full sync: full content; partial: metadata only)

**MCP Call — Key areas:**
```
search_nodes({
  workspaceIds: ["[WORKSPACE_ID]"],
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
  workspaceIds: ["[WORKSPACE_ID]"],
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
  workspaceIds: ["[WORKSPACE_ID]"],
  query: { and: [{ hasType: "[TOPIC_TAG_ID]" }] },
  limit: 50
})
```

Compare with `SPACE/topics/` directory.

### VISION PULL (if in scope)

**MCP Call — Favorite Problems:**
```
search_nodes({
  workspaceIds: ["[WORKSPACE_ID]"],
  query: { and: [{ hasType: "[FAVORITE_PROBLEM_TAG_ID]" }] },
  limit: 20
})
```

**MCP Call — MTPs:**
```
search_nodes({
  workspaceIds: ["[WORKSPACE_ID]"],
  query: { and: [{ hasType: "[MTP_TAG_ID]" }] },
  limit: 10
})
```

**MCP Call — HHGs:**
```
search_nodes({
  workspaceIds: ["[WORKSPACE_ID]"],
  query: { and: [{ hasType: "[HHG_TAG_ID]" }] },
  limit: 20
})
```

Compare with `QUANTUM/vision/` files.

### PERSONAL CONTEXT PULL (if in scope)

**MCP Call — Context nodes:**
```
search_nodes({
  workspaceIds: ["[WORKSPACE_ID]"],
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
  📤 N local goals not yet in Tana (will push: no map entry and no matching goal in the pull)
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
- Match each pulled goal to a local goal of the same level by name (the contract for `goal`, **Dedup** step 2). Record every match, and every new Tana goal you add locally, in `entities.goals.tana_node_ids` under `<period>/<goal_id>`, so 4B never pushes a goal Tana already has.
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
- Store the Tana node ID in `sync-state.yaml` under `entities.projects.tana_node_ids.<slug>` (also for projects that already have a local file)

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
- Store the Tana node ID in `sync-state.yaml` under `entities.topics.tana_node_ids.<slug>` (also for topics that already have a local file)

**Vision:** Update vision files in `QUANTUM/vision/` if Tana has newer versions.

**Personal Context:** Update affected files in `QUANTUM/personal-context/` if Tana has newer content.

### 4B — Push local items to Tana

**New goals, projects and topics** — every local item whose key is not yet in its `entities.<goals|projects|topics>.tana_node_ids` map after 4A (goals are keyed `<period>/<goal_id>`; a goal the pull found in Tana is recorded, not pushed — the contract for `goal`, **Dedup**). Push each one, one call at a time: read `SYSTEM/tana-write-contract.md` and follow the contract for `goal` (placement: goals container), the contract for `project`, or the contract for `topic`. Each push is recorded in its map, so goals created by the review skills are never pushed twice.

**Unsynced wins** (wins in `MEMORY/wins.jsonl` that are NOT already tracked in `SYSTEM/sync-state.yaml` under `entities.wins.tana_node_ids`):

1. Read `MEMORY/wins.jsonl` (skip the schema line on line 1).
2. Read `entities.wins.tana_node_ids` from `sync-state.yaml`. If the map is missing, create it as the contract for `win` says under **Dedup** (an older state file with a `last_pushed_win_id` cursor gets its earlier wins seeded as `pre-map`, so they are not pushed again).
3. Build the push list: every win whose `id` is NOT already a key in `tana_node_ids`.
   The text pushed to Tana is the win's `description`; entries written before the canonical format have `title` instead — use it when `description` is absent.
4. If the push list is empty, report "Wins already in sync" and skip this block. If it has more than 10 wins, show the count and ask the user to confirm before pushing.
5. Push each win in the list, one call at a time: read `SYSTEM/tana-write-contract.md` and follow the contract for `win` (target, the IDs it needs and the empty-ID guard, Periodicity, and recording each push in `entities.wins.tana_node_ids` right after it succeeds). Wins created by `/win` or `/build` are already in the map, so step 3 never lists them.

**Unsynced decisions:** every decision in `MEMORY/decisions.jsonl` whose `id` is not in `entities.decisions.tana_node_ids` (partial sync: only `status: "open"`). Push each one, one call at a time: read `SYSTEM/tana-write-contract.md` and follow the contract for `decision`. Decisions already in the map whose local status changed get the contract's **Status change** instead.

### 4C — Update goal statuses in Tana (bidirectional)

For goals where local status differs from Tana status:
- If local is more recent: push the status update — follow the contract for `goal`, **Status change**.
- If Tana is more recent: already handled in Phase 4A (written to local)

---

## Phase 5: Update Sync State

After all changes are applied, update `SYSTEM/sync-state.yaml`:

1. Set `last_full_sync` or `last_partial_sync` to current ISO timestamp
2. Update `entities.goals.last_pull` and `last_push` timestamps
3. Update `entities.areas.last_pull` timestamp
4. Wins and decisions were recorded push by push (contract **Record** steps); nothing more to write for them here
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

**If the workspace ID or tag IDs are missing:**
- Stop sync for that entity type
- Inform user which IDs are missing
- Suggest running `/tana-setup` (safe to re-run) to discover missing IDs
