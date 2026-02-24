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
2. Discover your tag IDs using `list_tags` and record them in `tag-ids.md`
3. Discover your field IDs using `get_tag_schema` and record them in `field-ids.md`
4. Map your workspace structure in `structure-map.md`
5. Ask PARACELSUS to test the connection: "Search for my active goals in Tana"

## Reference Files

- `tag-ids.md` -- All supertag IDs needed for MCP queries
- `field-ids.md` -- All field IDs needed for MCP queries
- `structure-map.md` -- Workspace, hub, and area node IDs
