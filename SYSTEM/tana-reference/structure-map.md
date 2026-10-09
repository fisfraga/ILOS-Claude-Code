# Tana Workspace Structure Map

Record your workspace, hub, and area node IDs here. These are needed for navigating and creating content in the right locations via MCP.

**How to find IDs:** Use `list_workspaces` to get workspace IDs. Use `read_node` or `get_children` to discover hub and area node IDs.

---

## Workspace

| Name | Workspace ID | Notes |
|------|-------------|-------|
| Main Workspace | | Your primary ILOS workspace |

## Home Node

| Name | Node ID | Notes |
|------|---------|-------|
| Home / Root | | Top-level node |

## Hubs

| Hub Name | Node ID | Notes |
|----------|---------|-------|
| Vision Hub | | FPs, MTPs, HHGs |
| Life Overview Hub | | Areas, Projects, Topics |
| Planning Hub | | Calendar, Plans, Reviews |
| Personal Context Hub | | Context nodes (if mirrored) |

## Containers (push targets)

Where `/win`, `/build`, `/decision` and `/sync` write. Each can be redirected with `tana_node_overrides` in `SYSTEM/sync-config.yaml`. If one is empty here and not overridden, those skills skip the Tana push and leave the item for a later `/sync`.

| Container | Node ID | Notes |
|-----------|---------|-------|
| Wins Log | | Wins (Review Hub child) |
| Decisions Log | | Decisions (Review Hub child) |
| Goals | | Planning Hub child |
| Projects | | Life Overview Hub child |
| Topics | | Life Overview Hub child |
| Favorite Problems | | Vision Hub child |
| Massively Transformative Purposes | | Vision Hub child |
| High Hard Goals | | Vision Hub child |

## Key Area Nodes

| # | Area | Node ID |
|---|------|---------|
| 1 | Health & Vitality | |
| 2 | Finances & Resources | |
| 3 | Intellectual Life | |
| 4 | Home & Family | |
| 5 | Creative Expression | |
| 6 | Routines & Work Life | |
| 7 | Love Relationship | |
| 8 | Emotional Life | |
| 9 | Life Vision & Meaning | |
| 10 | Career & Public Life | |
| 11 | Social Life & Community | |
| 12 | Spirituality & Inner Life | |

## Calendar Nodes

| Period | Node ID | Notes |
|--------|---------|-------|
| Current Year | | Use `get_or_create_calendar_node` |
| Current Quarter | | |
| Current Month | | |
| Current Week | | |

## Special Nodes

| Name | Node ID | Notes |
|------|---------|-------|
| Capture Inbox | | Quick capture destination |
| Wins Archive | | Historical wins collection |
| Project List | | Active projects overview |
