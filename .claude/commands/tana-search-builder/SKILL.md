---
name: tana-search-builder
description: Build Tana search nodes from natural language
argument-hint: "[what to find]"
---

# Skill: Tana Search Builder

Build persistent search nodes using Tana Paste. The syntax is straightforward — the real work is understanding how the user's Tana system is structured.

## Philosophy

1. **Every Tana system is different** — Tags, fields, and usage patterns vary wildly between users
2. **Explore before building** — A search is only as good as your understanding of the schema
3. **Scope carefully** — An unscoped search can return thousands of results; understand what the user actually needs

---

## Quick Start

If user provides argument: `/tana-search-builder overdue tasks`
- Ask clarifying questions about their system
- Explore workspace to understand structure
- Build the search

If no argument, ask what they want to find.

---

## Phase 1: Understand the Request

Before exploring, understand what the user wants:

1. **What are they looking for?** Tasks, notes, meetings, projects?
2. **What conditions matter?** Overdue, completed, assigned to someone, tagged with something?
3. **Where should results come from?** Entire workspace, under a specific project, in a date range?
4. **How will they use it?** One-time lookup vs persistent dashboard?

Ask clarifying questions. "Overdue tasks" could mean:
- Tasks past their due date (but what tag? what field?)
- Tasks with no due date at all (orphaned)
- Tasks in a specific project vs all tasks
- Include recurring tasks or just one-time?

---

## Phase 2: Explore the Schema

**Critical step.** Explore the workspace schema directly in the main conversation.

**Important:** Tana MCP tools are only available in the main Claude Code conversation — do NOT delegate to subagents (they have no MCP access). All MCP calls must be sequential (one at a time, wait for each to complete).

The agent should discover:

### 1. What tags exist for the concept?

"Tasks" might be represented by multiple tags:
- `#todo` — simple tasks
- `#scheduled` — tasks with dates
- `#recurring` — repeating tasks
- `#task` — parent tag that others extend

**Ask:** Do these share a common parent? Should the search include all of them?

### 2. What fields are on each tag?

Different tags often have different fields:
- `#scheduled` might have `Date` field
- `#todo` might have `Due date` field (different!)
- `#recurring` might have `Next occurrence` field

**Ask:** If searching by date, which field(s) need to match? Need OR logic?

### 3. How are fields actually used?

A field existing doesn't mean it's used:
- Is the date field consistently filled in?
- Are there tasks with no date that should be included/excluded?

### 4. What scope makes sense?

- All items ever? (could be thousands)
- Only open/incomplete items?
- Under a specific project or area?
- Created/edited in a time window?

Return structured findings:
```json
{
  "tags": [
    { "name": "scheduled", "id": "abc123", "dateField": "Date", "dateFieldId": "xyz789" },
    { "name": "todo", "id": "def456", "dateField": "Due date", "dateFieldId": "uvw012" }
  ],
  "recommendation": "Need OR logic to match both tag types with their respective date fields"
}
```

---

## Phase 3: Build the Search

Use `syntax.md` for syntax, `system-ids.md` for operator IDs, `examples.md` for patterns.

### Simple case: single tag, single field

```
- %%search%% Overdue scheduled
  - [[#^scheduledTagId]]
  - [[^SYS_A49]]::
    - [[^dateFieldId]]:: FOR RELATIVE DATE today
  - NOT DONE
```

### Complex case: multiple tags with different date fields

```
- %%search%% All overdue tasks
  - [[^SYS_A42]]::
    - [[^SYS_A41]]::
      - [[#^scheduledTagId]]
      - [[^SYS_A49]]::
        - [[^scheduledDateFieldId]]:: FOR RELATIVE DATE today
    - [[^SYS_A41]]::
      - [[#^todoTagId]]
      - [[^SYS_A49]]::
        - [[^todoDueDateFieldId]]:: FOR RELATIVE DATE today
  - NOT DONE
```

The complexity comes from the system structure, not the syntax.

---

## Phase 4: Output & Import

1. **Show the search** with explanation of what it matches
2. **Explain any tradeoffs** — "This excludes tasks without dates" or "This matches both scheduled and todo tags"
3. **Always ask where to import** — Placement matters for contextual searches using PARENT, GRANDPARENT, or PARENTS DESCENDANTS. The user must choose: today's daily note, inbox, a specific node, or a tag template.
4. **Import via `import_tana_paste`**
5. **Confirm placement** — Tell user exactly where it was placed

---

## Key Considerations

### Scoping to avoid noise

Unscoped searches return everything. Consider:
- `NOT DONE` — exclude completed items
- `CREATED LAST N DAYS` — limit to recent
- `[[^SYS_V53]]:: [[^parentNodeId]]` — only under specific node
- Date filters — only items in relevant time window

### Date fields are tricky

- Different tags may have different date fields
- Some items may have no date set
- Date ranges need `DATE OVERLAPS` (`SYS_203`), not just LT/GT
- Use `FOR RELATIVE DATE` to keep searches current

### Multiple tags for same concept

When a concept spans multiple tags:
1. Check if they share a parent tag (search the parent)
2. If not, use OR logic to match each
3. Consider if fields are shared or different per tag

### Instance fields vs option fields

- Instance fields reference other nodes (people, projects)
- Option fields have predefined values (status: open/closed)
- Both use `[[^fieldId]]:: [[^valueId]]` syntax but value source differs

### Deleted tags/nodes

Searches referencing deleted IDs can still work. Deleted items are under the trash node, but instances of a deleted tag may not be in trash and still return in searches. This can be useful or surprising.

### Nesting depth

No practical limit on logic nesting (OR containing AND containing NOT, etc). Build as complex as needed.

### Contextual/template searches

Searches placed inside supertag instances or templates can use PARENT to reference the instance:

- `[[^SYS_V49]]:: PARENT` — notes linking to this topic/project/person
- `[[^SYS_V53]]:: PARENT` — items under this project
- `[[^assigneeFieldId]]:: PARENT` — tasks assigned to this person

Use `PARENT.Field name` (plain text, spaces ok) to reference field values:
- `PARENT.Domain` — this topic's domain
- `PARENT.Start date` — this project's start date

This makes tag templates powerful — one search definition works contextually for every instance. **Always confirm where contextual searches are placed.**

---

## Reference Files

1. **`syntax.md`** — Tana Paste syntax for search nodes
2. **`examples.md`** — Example patterns (not templates — every system is different)
3. **`system-ids.md`** — System IDs for operators
