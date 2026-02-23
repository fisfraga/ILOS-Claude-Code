# ROUTING.md — Agent Context Router

You are PARACELSUS operating inside an Intentional Life OS workspace.
This file tells you WHERE to find information. Read ONLY what you need.

---

## Progressive Disclosure Rules

1. **L1 (this file)**: Always loaded. Tells you which module to consult.
2. **L2 (MODULE.md)**: Read the MODULE.md inside the relevant directory.
3. **L3 (data files)**: Read JSONL/YAML/MD data files only when the task requires them.

**NEVER load all modules at once.** Each folder boundary is a token budget decision.

---

## Task Routing Table

| User Intent | Primary Module | Key Files |
|-------------|---------------|-----------|
| Morning planning | TIME/ | active-goals.yaml, current-period.yaml |
| Win capture | MEMORY/ | wins.jsonl (append) |
| Weekly/monthly/quarterly review | TIME/ + MEMORY/ | wins.jsonl (read), active-goals.yaml (update) |
| Vision exploration | QUANTUM/vision/ | life-manifesto.md, favorite-problems.md |
| Goal setting | TIME/ + QUANTUM/ | active-goals.yaml, favorite-problems.md |
| Alignment check | QUANTUM/ + TIME/ + SPACE/ | personal-context/, active-goals.yaml, areas/ |
| Content creation | QUANTUM/ | personal-context/9-voice-profile.yaml, relevant vision files |
| Project work | SPACE/projects/ | Project-specific files |
| Decision logging | MEMORY/ | decisions.jsonl (append) |
| Self-knowledge exploration | QUANTUM/self-knowledge/ | Relevant tradition files |
| Personal context update | QUANTUM/personal-context/ | Specific context file |
| Understanding ILOS methodology | KNOWLEDGE/ | Start with ilos-overview.md |
| Tana MCP setup | SYSTEM/ | setup-guide.md, tana-reference/ |
| Area deep dive | SPACE/ + MEMORY/ | areas/[area].md, wins.jsonl, active-goals.yaml |
| Project initiation | SPACE/ + TIME/ | projects/README.md, active-goals.yaml |
| Major decision | TIME/ + MEMORY/ | templates/major-decision.md, decisions.jsonl |
| Tana operations | SYSTEM/ | tana-reference/, relevant SPACE/ or TIME/ files |
| System architecture | SYSTEM/ + KNOWLEDGE/ | setup-guide.md, schemas.md |

---

## Format-Function Map

| Format | Purpose | How to Use |
|--------|---------|-----------|
| `.md` (Markdown) | Narrative, instructions, templates | Read for context, edit for content |
| `.yaml` (YAML) | Configuration, structured state | Read for current state, update during reviews |
| `.jsonl` (JSONL) | Append-only logs (memory) | Read for patterns, APPEND new entries (never edit/delete) |

---

## JSONL Rules

- Every `.jsonl` file starts with a schema line: `{"_schema": "...", "_version": "...", "_description": "..."}`
- **NEVER delete entries.** Mark as archived if needed. These files are append-only.
- **ALWAYS append** new entries at the end.
- **ID format**: `{type}_{YYYYMMDD}_{HHMMSS}`

---

## Cross-Module References

All modules share the **12 Key Area slug vocabulary**:

`health` · `finances` · `intellectual` · `home` · `creative` · `routines` · `love` · `emotional` · `vision` · `career` · `social` · `spiritual`

Reference links between files:
- `active-goals.yaml` → references area slugs from the vocabulary above
- `wins.jsonl` → `connected_goal` references goal IDs from `active-goals.yaml`
- `decisions.jsonl` → can cross-reference other decision IDs
- `failures.jsonl` → `related_decision` references `decisions.jsonl` IDs
- `active-goals.yaml` → `parent_goal` creates nested goal chains across time scales

---

## Tana MCP Integration (Optional)

If Tana MCP is configured (see `SYSTEM/tana-reference/`):
- Skills can query Tana for live data (goals, wins, tasks)
- Skills can write back to Tana (wins, goals, plans)
- Local YAML/JSONL files serve as the canonical source; Tana is the sync target

If Tana MCP is **NOT** configured:
- All data lives in local files
- Skills read from and write to YAML/JSONL directly
- Full functionality is preserved — Tana adds convenience, not capability
