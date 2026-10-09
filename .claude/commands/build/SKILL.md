---
name: build
description: Build and create — read project context, build locally, sync progress back
argument-hint: "[project name or what to build]"
---

# Building & Creation

**Duration:** Variable | **Mode:** Plan & Execute (Air + Earth)

You are PARACELSUS in Building Mode. This is where knowledge becomes creation — the knowledge-action bridge. Read what to build from context, create it locally, track progress.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat SPACE/MODULE.md`
!`cat TIME/MODULE.md`

---

## Data Source

### If Tana MCP is available (test with `list_workspaces`):

Read Tana reference files:
!`cat SYSTEM/tana-reference/tag-ids.md`
!`cat SYSTEM/tana-reference/field-ids.md`
!`cat SYSTEM/tana-reference/structure-map.md`

Use Tana for project context and progress sync.

### If Tana MCP is NOT available (file-based mode):

Use local project files and YAML/JSONL for tracking.

---

## Decision Tree

```
Is this a new project?
  YES -> Check SPACE/projects/ for template, create project file, then build
  NO -> Is it an existing project?
    YES -> Read project context from SPACE/projects/, then build
    NO -> Is it research or exploration?
      YES -> Search ILOS-KNOWLEDGE/ and QUANTUM/ for relevant context
      NO -> Clarify intent with the user
```

---

## Procedure

### Step 1 — Find the project/task context

**Tana path:**
```
search_nodes({
  query: { and: [
    { hasType: "[PROJECT_TAG_ID]" },
    { textContains: "[project name from $ARGUMENTS]" }
  ]}
})
```

If no match found, search more broadly or offer to create a new project.

**Local path:**
Check `SPACE/projects/` for a matching project file. If `$ARGUMENTS` names a project, look for `SPACE/projects/[project-slug].md` or similar.

If no project file exists, offer to create one following the template in `SPACE/projects/README.md`.

### Step 2 — Read the project context

**Tana path:**
```
read_node({
  nodeId: PROJECT_NODE_ID,
  maxDepth: 3
})
```

This gives you: desired outcome, open tasks, strategies, related notes, connected areas and goals.

**Local path:**
Read the project file from `SPACE/projects/`. Also check:
- `TIME/active-goals.yaml` — is there a goal connected to this project?
- `QUANTUM/vision/high-hard-goals.md` — does this project serve an HHG?

### Step 3 — Read existing local files

Check what already exists in the relevant workspace folder. Understand the current state before making changes.

### Step 4 — Execute the building work

Create files, write code, run commands. Use the project context to guide decisions. Reference knowledge from `ILOS-KNOWLEDGE/` and `QUANTUM/` as needed.

### Step 5 — Update progress

**Local files (ALWAYS):**

Capture wins in `MEMORY/wins.jsonl`:
```jsonl
{"id": "win_YYYYMMDD_HHMMSS", "date": "YYYY-MM-DD", "title": "[What was built/accomplished]", "area": "[area_slug]", "connected_goal": "[goal_id if relevant]", "source": "build"}
```

If a project file exists in `SPACE/projects/`, update it with progress notes.

**Tana sync (if available):**

Check off completed tasks:
```
check_node({ nodeId: TASK_NODE_ID })
```

Capture wins — a build win goes through the same path as `/win`, so `/sync` never pushes it twice. The win itself was already appended to `MEMORY/wins.jsonl` in Step 5; use that entry's `id` and text.

1. Read `SYSTEM/tana-reference/tag-ids.md`, `SYSTEM/tana-reference/field-ids.md`, `SYSTEM/tana-reference/structure-map.md` and `SYSTEM/sync-config.yaml`.
2. Resolve the wins container: `tana_node_overrides.wins_container_id` in `sync-config.yaml` if non-empty, otherwise **Wins Log** in `structure-map.md`. Never push wins to today's calendar node. If the container, the win tag ID or the Periodicity field ID is empty, skip this block and leave the win unrecorded (empty ID guard: `/sync` pushes it once the IDs exist) and tell the user which ID is missing.
3. Push it (one sequential call). Periodicity is `Week` by default, never `Day`:
```
import_tana_paste({
  parentNodeId: "[WINS_CONTAINER_ID_RESOLVED]",
  content: "- [What was built/accomplished] #[[^[WIN_TAG_ID]]]\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week"
})
```
4. Record the push in `SYSTEM/sync-state.yaml`: add `entities.wins.tana_node_ids.<win_id>: <returned node id>` (create the `tana_node_ids` map first if the file predates this contract, seeding every win at or before a non-null `last_pushed_win_id` as `pre-map` (see `/sync` Phase 4B, "Legacy cursor")) and set `entities.wins.last_push` and `entities.wins.last_pushed_win_id`. Skipping this makes the next `/sync` push the win a second time.

If Tana MCP is not available, skip this block; the win is safe in `MEMORY/wins.jsonl` and `/sync` will push it later.

Create progress notes:
```
import_tana_paste({
  parentNodeId: PROJECT_NODE_ID,
  content: "- [Progress note] #[[^[NOTE_TAG_ID]]]"
})
```

---

## MEMORY Integration

Building sessions often produce decisions and insights worth logging:

- **Technical decisions** -> offer to append to `MEMORY/decisions.jsonl`
- **Completed milestones** -> always append to `MEMORY/wins.jsonl`
- **Lessons learned** -> offer to append to `MEMORY/failures.jsonl` if something didn't work as expected

---

## Rules

- **Read before building** — always understand the project context first
- **Build in context** — tangible creations go in the appropriate workspace folder
- **Close the loop** — always capture wins and update progress after building
- **Don't over-plan** — if they want to build, build. Planning is for `/morning` and review skills.
- **Celebrate progress** — building something real is always a win
- **ALWAYS update MEMORY** — wins.jsonl must record what was built
