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

## Data Files (load only when needed)
- `tana-reference/tag-ids.md` — Tana supertag IDs (required before any MCP query)
- `tana-reference/field-ids.md` — Tana field IDs (required before any MCP query)
- `tana-reference/structure-map.md` — Workspace, hub, and area node IDs

## Rules
- **Tana is OPTIONAL.** The system works fully without it. Never assume Tana is configured.
- Before any Tana MCP operation, always check the tana-reference files for correct IDs.
- If Tana IDs are missing, use `list_tags` and `get_tag_schema` to discover them, then update the reference files.
- The setup guide is designed for first-time users -- keep it simple and encouraging.
