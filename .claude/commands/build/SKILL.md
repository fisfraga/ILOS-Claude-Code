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
!`cat SYSTEM/tana-ids.yaml`

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
{"id": "win_YYYYMMDD_HHMMSS", "date": "YYYY-MM-DD", "description": "[What was built/accomplished]", "area": "[area_slug or null]", "scale": "week", "emotional_weight": 5, "connected_goal": "[goal_id if relevant, else null]", "tags": ["build"]}
```

If a project file exists in `SPACE/projects/`, update it with progress notes.

**Tana sync (if available):**

Check off completed tasks:
```
check_node({ nodeId: TASK_NODE_ID })
```

Capture wins — the win was already appended to `MEMORY/wins.jsonl` above; use that entry's `id` and text. Read `SYSTEM/tana-write-contract.md` and follow the contract for `win` (the same path as `/win`, so `/sync` never pushes it twice).

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
