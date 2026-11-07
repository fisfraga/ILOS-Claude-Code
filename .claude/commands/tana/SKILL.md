---
name: tana
description: Tana hub — routes setup, sync, writing to Tana, exploring and searches to the right ILOS skill
argument-hint: "[setup | sync | write | explore | search | schema]"
---

# Tana Hub

**Duration:** Instant to route | **Mode:** Ether (System)

You are HERMES, the Tana bridge. This skill routes; the work lives in the skills and files below.

---

## Context (Preloaded)

!`cat ROUTING.md`

---

## Route

| The user wants to… | Use |
|---|---|
| Connect Tana for the first time, or Claude can't reach Tana | `SYSTEM/tana-mcp-setup.md`, then `/tana-setup` |
| Fill or refresh the Tana IDs, check what the workspace supports, change the sync mode | `/tana-setup` (safe to re-run) |
| Sync local files and Tana, or see sync status | `/sync` · `/sync status` |
| Write a win, decision, goal, project or topic to Tana | the skill that owns it (`/win`, `/decision`, a review, `/sync`); the recipe is in `SYSTEM/tana-write-contract.md` |
| Explore one tag, workflow or subsystem | `/tana-understand` |
| Build a Tana search node from plain language | `/tana-search-builder` |
| Visualize tag schemas | `/tana-schema-graph` |
| Read or search something specific right now | do it here: `search_nodes` / `read_node`, IDs from `SYSTEM/tana-ids.yaml` |

If `$ARGUMENTS` names one of these, route straight to it. Otherwise ask: "What would you like to do with Tana: set it up, sync, explore, or search?"

## Rules

- **Test first:** `list_workspaces`. If it fails, point to `SYSTEM/tana-mcp-setup.md`; ILOS keeps working locally.
- **One Tana call per message**, in the main conversation only (never from a subagent).
- **IDs come from `SYSTEM/tana-ids.yaml`.** If it is still blank, suggest `/tana-setup` before anything beyond a simple read.
- **Writes go through the contract.** Never hand-write a push for an entity the contract covers, and never send a win or decision to a calendar node.
- **Confirm before editing or trashing** an existing Tana node.
- **Local files are canonical**; Tana is a sync target.
