# Tana Field IDs

Record your Tana field IDs here. These are required for setting and querying field values via MCP.

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
