# Tana Field IDs

Record your Tana field IDs here. These are required for setting and querying field values via MCP.

> **Setup required:** These IDs are empty by default. Run `/tana-understand` to discover and populate your workspace's tag and field IDs before using `/sync`.

**How to find IDs:** Use `get_tag_schema` for each supertag to discover its fields and their IDs.

---

## Common Fields

| Field Name | Field ID | Used In | Type |
|------------|----------|---------|------|
| Status | | Goals, Projects, Tasks | Option |
| Area | | Goals, Projects, Wins | Reference |
| Project | | Tasks, Notes | Reference |
| Description | | Various | Text |
| Details | | Various | Text |
| AI Advice | | Various | Text |

## Goal Fields

| Field Name | Field ID | Used In | Type |
|------------|----------|---------|------|
| Goal Status | | All goal tags | Option |
| Parent Goal | | Quarterly/Monthly/Weekly goals | Reference |
| Connected HHG | | Annual goals | Reference |

## Project Fields

| Field Name | Field ID | Used In | Type |
|------------|----------|---------|------|
| Project Status | | #project | Option |
| Project Area | | #project | Reference |
| Deadline | | #project | Date |

## Win Fields

| Field Name | Field ID | Used In | Type |
|------------|----------|---------|------|
| Win Area | | #win | Reference |
| Win Source | | #win | Option |

## Decision Fields

| Field Name | Field ID | Used In | Type |
|------------|----------|---------|------|
| Decision Status | | #decision | Option |
| Context | | #decision | Text |
| Alternatives Considered | | #decision | Text |
| Reasoning | | #decision | Text |
| Confidence | | #decision | Number (1-10) |
| Area | | #decision | Reference |
| Connected Goal | | #decision | Reference |
| Review Date | | #decision | Date |
| Outcome | | #decision | Text |

## Task Fields

| Field Name | Field ID | Used In | Type |
|------------|----------|---------|------|
| Task Project | | #task | Reference |
| Task Area | | #task | Reference |
| Due Date | | #task | Date |
| Priority | | #task | Option |

---

## Option Field Values

For option fields (like Status), you also need the option IDs:

### Decision Status Options

| Option | Option ID |
|--------|-----------|
| Open | |
| Decided | |
| Set Aside | |

### Goal Status Options

| Option | Option ID |
|--------|-----------|
| Active | |
| Completed | |
| Abandoned | |

### Project Status Options

| Option | Option ID |
|--------|-----------|
| Active | |
| Backlog | |
| Completed | |
| Abandoned | |
