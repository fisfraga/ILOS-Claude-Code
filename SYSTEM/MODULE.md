# SYSTEM — Agent Instructions

## Purpose
Configuration and setup: guides for initial setup, Tana MCP integration, and system reference information.

## When to Load
- During initial setup or onboarding
- When configuring or troubleshooting Tana MCP connection
- When the user asks about system configuration or Tana integration

## Key Files (priority order)
1. `setup-guide.md` — Getting started guide (5 steps, ~30 minutes)
2. `tana-reference/README.md` — When and why to use Tana MCP
3. `sync-config.yaml` — Sync mode and preferences (full vs partial, auto-sync triggers)
4. `sync-state.yaml` — Auto-managed sync state (last sync times, Tana node ID mappings)

## Data Files (load only when needed)
- `tana-ids.yaml` — Every Tana tag, field, option, hub, container and area ID the skills use (required before any MCP query)
- `sync-config.yaml` — Load when: user asks about sync, configuring sync, running /sync
- `sync-state.yaml` — Load when: checking sync status, after running /sync to update timestamps

## Rules
- **Tana is OPTIONAL.** The system works fully without it. Never assume Tana is configured.
- Before any Tana MCP operation, always read SYSTEM/tana-ids.yaml for the IDs, and skip the Tana step if a needed one is blank.
- If Tana IDs are missing, use `list_tags` and `get_tag_schema` to discover them, then update `tana-ids.yaml`.
- The setup guide is designed for first-time users -- keep it simple and encouraging.

## Maintainer tools

- `node SYSTEM/tools/skill-lint.js` — checks that skills and agents follow the Tana write contract (resolved containers, dedup bookkeeping, no calendar-node pushes for wins/decisions).
- `node SYSTEM/tools/check-manifest.js` — checks that every tracked file is classified in `SYSTEM/foundation-manifest.yaml` (foundation, starter or user).
- `node SYSTEM/tools/migrate-ids.js` — copies IDs from the older tag-ids/field-ids/structure-map tables into `SYSTEM/tana-ids.yaml` (dry run; add `--write`).
- Tests: `node --test SYSTEM/tools/*.test.js`.
