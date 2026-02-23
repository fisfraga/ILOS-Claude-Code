---
name: tana-understand
description: Explore a Tana system and show how Claude can help work with it
argument-hint: "[tag, workflow, or subsystem]"
---

# Skill: Understand Tana System

Explore a **specific part** of a user's Tana system—a tag, workflow, or subsystem—and show how Claude can help work with it.

## When to Use

User asks to understand, explore, document, or analyze a specific tag, workflow, or subsystem in Tana.

## Key Principle: Stay Focused

**This skill is NOT for exploring entire workspaces.** It's for understanding specific parts:
- A particular tag and its inheritance/usage
- A workflow (e.g., "how do I process ideas?")
- A subsystem (e.g., "my meeting notes setup")
- Related tags (e.g., "all my project-related tags")

**Always start by identifying the specific focus.** If the user says "understand my Tana" or something vague, ask what specific part they want to explore.

## Process

Use a cheap subagent (e.g., Haiku) for exploration, but this is not rote lookup — it requires reasoning about what you find and making smart decisions about what to explore next. The goal is to truly understand how the user has built their system and how they use it.

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

Present clearly:
- Tag names with IDs (actionable references)
- Visual hierarchy showing inheritance
- Key fields and their purposes
- How the system is meant to be used

Offer to save documentation to a markdown file.

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
