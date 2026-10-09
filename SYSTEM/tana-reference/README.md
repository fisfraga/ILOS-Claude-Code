# Tana MCP Integration

## MCP Constraints (Read First)

Before using Tana MCP tools, understand these hard constraints:

1. **Sequential calls only.** The local Tana MCP server supports one active connection at a time. Never issue two MCP tool calls in the same message — all but the first will fail with a transport error. Always wait for each call to complete before issuing the next.

2. **No subagent access.** Tana MCP tools are only available in the main Claude Code conversation. Task agents (subagents) launched via the Task tool have no MCP access and will fail if asked to perform Tana operations.

3. **`get_or_create_calendar_node` for dates.** Never hardcode calendar node IDs for today/week/month — use this tool to get the correct node ID for any date.

---

## When to Use Tana

Tana is **optional** but powerful. ILOS works fully with local files and Claude Code alone. Tana adds:

- **Visual dashboards** -- See your goals, wins, projects, and areas in a visual interface
- **Calendar integration** -- Plans and reviews live within Tana's calendar structure
- **Structured queries** -- "Show me all wins from this month in my Health area"
- **Bidirectional AI** -- PARACELSUS reads from and writes back to Tana
- **Super Folders** -- Notes, tasks, and meetings automatically collect under their Area/Project/Topic

## Why Tana?

Tana is a structured data graph, not a document editor. Every piece of information is a typed, tagged, connected node. This makes it uniquely powerful for a life operating system:

- Goals, wins, projects, and tasks are not just text -- they are queryable data
- Your AI agent can perform precise searches ("find active projects in my Career area")
- Calendar nodes provide natural time-based organization
- Supertags define the structure; fields capture the data; searches retrieve it

## What Lives in Tana vs. Local

| Content | Tana | Local |
|---------|------|-------|
| Vision elements (FPs, MTPs, HHGs) | Living reference | Deep reference |
| Personal context | Living document | Backup reference |
| Areas, Projects, Topics | Primary home | Reference copies |
| Plans, Goals, Reviews | Primary home | Templates only |
| Wins | Primary capture | JSONL backup |
| Self-knowledge (charts, profiles) | Optional | Primary home |
| ILOS methodology | Not needed | ILOS-KNOWLEDGE/ |

## Getting Started

1. Set up your Tana workspace with ILOS supertags
2. Run `/tana-understand`: it discovers your tag, field, option and hub IDs and writes them to `SYSTEM/tana-ids.yaml`, and tells you if your workspace lacks something the skills use
3. Ask PARACELSUS to test the connection: "Search for my active goals in Tana"

## Periodicity Semantics

Tana uses a **Periodicity** field to control which review horizon a node surfaces in. This matters most for wins:

- **Day** — Only appears in daily views. Effectively invisible during weekly reviews. **Never use Day for wins.**
- **Week** — Default for wins. Surfaces in weekly review dashboards and win search nodes.
- **Month/Quarter/Year** — Use for milestones at that scale. Surfaces in all views at that level and below.

If a moment is too small for Week periodicity, it belongs as **#gratitude** (daily appreciation), not **#win** (Gap-to-Gain progress).

---

## Reference Files

- `../tana-ids.yaml` -- every Tana ID the skills use, in one file. This is the only file you need to maintain.
- `tag-ids.md`, `field-ids.md`, `structure-map.md` -- the older tables. They are no longer read by any skill; they remain only as input for `node SYSTEM/tools/migrate-ids.js`, which copies your IDs into `tana-ids.yaml` without overwriting anything. You can delete them once you have migrated.
