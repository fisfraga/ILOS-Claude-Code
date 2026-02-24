---
name: tana-understand
description: Explore a Tana system and show how Claude can help work with it
argument-hint: "[tag, workflow, or subsystem]"
---

# Skill: Understand Tana System

Explore a **specific part** of a user's Tana system—a tag, workflow, or subsystem—and show how Claude can help work with it.

## When to Use

User asks to understand, explore, document, or analyze a specific tag, workflow, or subsystem in Tana.

## Initial Setup Mode (Auto-Trigger)

**Check `SYSTEM/tana-reference/tag-ids.md` before asking the user for a focus.**

If the file exists but contains empty table cells (IDs not yet filled in), this is an **Initial Setup session**. Skip the focus question and proceed directly to full workspace exploration:

1. `list_workspaces` → identify the primary workspace
2. `list_tags` → get all tags (up to 200)
3. `read_node` on the home node (maxDepth: 2) → map the hub structure
4. `read_node` on each hub → get all child node IDs
5. `get_tag_schema` (sequentially, one at a time) for all key tags: goal types, win, key area, day, week, month, task, context, voice review
6. `get_or_create_calendar_node` for day, week, month, year → capture current calendar IDs

Then populate all three reference files (`tag-ids.md`, `field-ids.md`, `structure-map.md`) and confirm to the user.

**Do not ask "what part do you want to explore?" when the reference files are empty.** The answer is always "all of it."

---

## Key Principle: Stay Focused

**This skill is NOT for exploring entire workspaces.** It's for understanding specific parts:
- A particular tag and its inheritance/usage
- A workflow (e.g., "how do I process ideas?")
- A subsystem (e.g., "my meeting notes setup")
- Related tags (e.g., "all my project-related tags")

**Always start by identifying the specific focus.** If the user says "understand my Tana" or something vague, ask what specific part they want to explore.

## Process

**Important:** Tana MCP tools (`list_workspaces`, `list_tags`, `get_tag_schema`, `read_node`, etc.) are only available in the **main Claude Code conversation**. Do NOT delegate Tana exploration to subagents (Task tool) — they have no MCP access and will fail silently or ask if Tana is configured.

**MCP calls must be sequential.** The Tana MCP server does not support parallel connections. Never issue two Tana tool calls in the same message. Each call must complete before the next begins. Batching calls will cause transport errors.

All exploration in this skill happens directly in the main conversation. The goal is to truly understand how the user has built their system and how they use it.

### Tools for Exploration

| Tool | Use |
|------|-----|
| `list_workspaces` | Find available workspaces |
| `list_tags` | See what tag systems exist |
| `get_tag_schema` | Understand tag structure, fields, inheritance |
| `search_nodes` | Find nodes by text, tag, or properties; find usage patterns |
| `read_node` | Read node content and children |
| `get_children` | Paginated children for large nodes |

### 1. Discover What Exists

**Start by understanding the workspace:**
1. `list_workspaces` to find available workspaces
2. `list_tags` on the relevant workspace to see what systems exist

This reveals what the user has built and informs what options to present.

### 2. Identify Focus

**If the user hasn't specified what to explore, use `AskUserQuestion` with options informed by the tags you discovered.** This gives users relevant choices rather than generic ones.

Don't explore broadly without a clear target.

### 3. Discover Structure

**Find the entry point:**
- If user names a tag: `search_nodes` with `textContains` to find it (look for `docType: "tagDef"`)
- If user describes a workflow: identify the key tag(s) involved

**Understand a tag:**
- `get_tag_schema` returns fields, types, options, defaults, and parent tags
- Use `includeEditInstructions: true` for additional context

**Trace inheritance:**
- Upward: `get_tag_schema` shows "Extends #..." — chain calls to trace ancestry
- Downward: `search_nodes` with `{"and": [{"hasType": "<tag-id>"}, {"is": "template"}]}`

**Read context:**
- `read_node` with `maxDepth: 2-3` for documentation nodes, dashboards, examples

**Understand usage:**
- How many instances exist? (`search_nodes` with tag filter)
- Are fields consistently filled in?
- What patterns emerge in how the user works with this system?
- Are there related searches, views, or dashboards?

### 4. Document Findings

Present findings clearly in conversation:
- Tag names with IDs (actionable references)
- Visual hierarchy showing inheritance and base types
- Key fields and their purposes
- How the system is meant to be used

**For ILOS workspaces (when `SYSTEM/tana-reference/` exists):**
After exploration, always update the three reference files rather than saving to a generic markdown file:

1. **`SYSTEM/tana-reference/tag-ids.md`** — populate all supertag IDs grouped by category (Vision, Goals, Review, Execution, Calendar, AI/System)
2. **`SYSTEM/tana-reference/field-ids.md`** — populate all field IDs with types, and all option IDs for option fields
3. **`SYSTEM/tana-reference/structure-map.md`** — populate workspace ID, home node ID, hub node IDs, key area node IDs, and current calendar nodes

Add a comment at the top of each file with the workspace name and date updated.

After updating, confirm to the user: "Reference files are now populated. All `/tana` operations will use these IDs automatically."

**For non-ILOS workspaces:**
Offer to save documentation to a new markdown file in `SYSTEM/` or another appropriate location.

### 5. Present How I Can Help

After understanding structure, explain what we can do together. This is where real value emerges.

**Adapt to the system.** Based on what the system is designed to do, identify specific ways you can help the user work with it. Think: what queries, preparations, or processing would be valuable?

**Be concrete.** Don't list abstract capabilities—give specific examples the user can try immediately based on their actual system and data.

**Offer to demonstrate.** End with 2-3 specific things you could do right now with their system.

**Offer to document.** Ask if the user wants to save this understanding for future context — a markdown file describing the system structure, key IDs, and how it's used. This helps in future sessions.

## When to Ask the User

Use **AskUserQuestion** when:
- The focus isn't clear (always ask before exploring broadly)
- You find unexpected patterns worth confirming
- Offering analysis options after documenting structure
- Confirming before saving documentation
