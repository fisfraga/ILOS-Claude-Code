---
name: dashboard
description: Generate a visual HTML dashboard from your ILOS data — overview, weekly, goals, areas, or wins views
argument-hint: "[view: overview, weekly, goals, areas, wins]"
---

# Dashboard Generation

**Duration:** 2-3 minutes | **Mode:** Building (Earth)

You are PARACELSUS generating a visual dashboard. Fetch data from local files (and optionally Tana), build a self-contained HTML file, and open it in the user's browser. Zero dependencies, no server required.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat TIME/MODULE.md`
!`cat MEMORY/MODULE.md`

---

## Procedure

### Step 1 — Determine view type

Parse `$ARGUMENTS` for the view type:
- `overview` (default if no argument) — Full Life OS snapshot
- `weekly` — This week's wins, goals, and tasks
- `goals` — Goal cascade across all time horizons
- `areas` — 12 life area attention map
- `wins` — Win timeline with patterns

If no valid argument, default to `overview`.

### Step 2 — Fetch data

Run the queries specified in `view-specs.md` for the chosen view.

#### Data Source

**If Tana MCP is available** (test with `list_workspaces`):

Read Tana reference files:
!`cat SYSTEM/tana-reference/tag-ids.md`
!`cat SYSTEM/tana-reference/field-ids.md`
!`cat SYSTEM/tana-reference/structure-map.md`

Run the Tana MCP queries from `view-specs.md`. Run queries in parallel when possible.

**If Tana MCP is NOT available** (file-based mode):

Build the data object from local files:

| Data Section | Source File | How to Extract |
|-------------|------------|----------------|
| `wins` | `MEMORY/wins.jsonl` | Read all entries, filter by date range per view |
| `goals.weekly` | `TIME/active-goals.yaml` | Read `weekly.goals` array |
| `goals.monthly` | `TIME/active-goals.yaml` | Read `monthly.goals` array |
| `goals.quarterly` | `TIME/active-goals.yaml` | Read `quarterly.goals` array |
| `goals.annual` | `TIME/active-goals.yaml` | Read `annual.goals` array |
| `vision.hhgs` | `QUANTUM/vision/high-hard-goals.md` | Parse HHG entries |
| `vision.fps` | `QUANTUM/vision/favorite-problems.md` | Parse FP entries |
| `vision.mtps` | `QUANTUM/vision/massively-transformative-purposes.md` | Parse MTP entries |
| `projects` | `SPACE/projects/` | List project files, extract status |
| `areas` | ROUTING.md area slugs + `MEMORY/wins.jsonl` | Count wins per area, check for projects |
| `meta.userName` | `QUANTUM/personal-context/0-life-vision-manifesto.md` | Extract name from context |

### Step 3 — Generate HTML

1. Read `html-template.md` (companion file in this command directory) for the base HTML structure
2. Build a JavaScript data object from the fetched data
3. Replace `{{DATA}}` with the serialized data object (as JS literal, NOT JSON string)
4. Replace `{{VIEW_TYPE}}` with the chosen view
5. Replace `{{GENERATED_AT}}` with current timestamp
6. Replace `{{USER_NAME}}` with the user's name (from personal context or Tana)

### Step 4 — Write and open

```bash
# Write the file
Write the generated HTML to ./ilos-dashboard.html

# Open in browser
open ./ilos-dashboard.html
```

Tell the user:
> "Your dashboard is ready. I've opened it in your browser."

### Step 5 — Iterate

Listen for feedback:
- **"Add more data"** — Fetch additional queries, regenerate
- **"Different view"** — Switch view type, regenerate
- **"Change style"** — Adjust colors, layout, font
- **"Export"** — The dashboard has a built-in PDF export button

---

## Data Shape

The injected data object should follow this structure:

```javascript
const data = {
  meta: {
    viewType: "overview",          // which view is active
    generatedAt: "2026-02-07T...", // when data was fetched
    userName: "User Name"
  },
  wins: [
    { id: "...", title: "...", date: "...", area: "..." }
  ],
  goals: {
    weekly: [{ id: "...", title: "...", done: false }],
    monthly: [{ id: "...", title: "...", done: false }],
    quarterly: [{ id: "...", title: "...", done: false }],
    annual: [{ id: "...", title: "...", done: false }]
  },
  projects: [
    { id: "...", title: "...", status: "Active", area: "..." }
  ],
  areas: [
    { id: "...", title: "...", winCount: 0, projectCount: 0, hasGoal: false }
  ],
  vision: {
    fps: [{ id: "...", title: "..." }],
    mtps: [{ id: "...", title: "..." }],
    hhgs: [{ id: "...", title: "..." }]
  }
};
```

Only include the data sections relevant to the chosen view (see `view-specs.md`).

---

## Rules

- **Self-contained HTML** — Zero external dependencies. Everything inline.
- **Dark/light mode** — Auto-detect system preference via `prefers-color-scheme`.
- **Responsive** — Works on desktop and mobile.
- **No server** — Just a file opened in the browser. No localhost, no npm.
- **Fresh data** — Always fetch from source files at generation time. No caching.
- **Branded** — Use cosmic theme colors. This is the Intentional Life OS.
- **Works without Tana** — Local files provide full data for all views.
