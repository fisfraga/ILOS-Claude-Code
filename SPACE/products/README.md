# Products

Store tangible creations here — apps, websites, dashboards, courses, code, and other outputs that continue to exist and evolve beyond their initial project.

---

## What Goes Here

- Website source code and assets
- Application code and configurations
- Course materials and content
- Dashboard templates and scripts
- Any other tangible creation that lives as files

## What Stays Elsewhere

- The project managing the product's development → `SPACE/projects/`
- Tasks, milestones, and progress tracking → Tana (if available)
- Connections to areas, goals, and HHGs → `TIME/active-goals.yaml`
- Wins captured during the building process → `MEMORY/wins.jsonl`

## How PARACELSUS Builds Products

1. You say "let's work on [product]" or use `/build [product]`
2. PARACELSUS reads project context (from local files or Tana)
3. PARACELSUS reads existing files in this folder for current state
4. Building happens: creating files, writing code, running commands
5. Progress is tracked: wins captured, goals updated

## Suggested Structure

Each product gets its own subfolder:

```
products/
├── my-website/
│   ├── src/
│   └── public/
├── my-course/
│   ├── modules/
│   └── assets/
└── ...
```
