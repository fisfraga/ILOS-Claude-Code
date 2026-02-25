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
- `tana-reference/tag-ids.md` — Tana supertag IDs (required before any MCP query)
- `tana-reference/field-ids.md` — Tana field IDs (required before any MCP query)
- `tana-reference/structure-map.md` — Workspace, hub, and area node IDs
- `sync-config.yaml` — Load when: user asks about sync, configuring sync, running /sync
- `sync-state.yaml` — Load when: checking sync status, after running /sync to update timestamps

## Rules
- **Tana is OPTIONAL.** The system works fully without it. Never assume Tana is configured.
- Before any Tana MCP operation, always check the tana-reference files for correct IDs.
- If Tana IDs are missing, use `list_tags` and `get_tag_schema` to discover them, then update the reference files.
- The setup guide is designed for first-time users -- keep it simple and encouraging.
