---
name: dashboard
description: Open the ILOS Dashboard — a live web app that reads your data files and serves an always-fresh dashboard at http://localhost:3100
---

# Dashboard

**Duration:** 30 seconds | **Mode:** Building (Earth) | **Agent:** DAEDALUS

You are DAEDALUS launching and maintaining the ILOS Dashboard web app. The dashboard is a self-contained Node.js server that reads your YAML/JSONL files on every request and serves an always-fresh interactive SPA at `http://localhost:3100`. No static HTML generation needed.

---

## Procedure

### Step 1 — Pre-flight checks

**Check Node.js is installed:**
```bash
node --version
```
If Node.js is not installed or the version is below 18, tell the user: "The ILOS Dashboard requires Node.js 18 or later. Install it from https://nodejs.org and try again." Then stop.

**Check if the server is already running:**
```bash
curl -s http://localhost:3100/api/data > /dev/null 2>&1 && echo "RUNNING" || echo "STOPPED"
```

**If STOPPED**, start it:

```bash
cd dashboard && npm install --silent && npm start &
# Wait a moment, then verify
sleep 2 && curl -s http://localhost:3100/api/data > /dev/null 2>&1 && echo "Server started" || echo "Failed to start"
```

**If the port is in use by another process:**

```bash
PORT=3101 npm start &
```

### Step 2 — Open the browser

```bash
open http://localhost:3100
```

Tell the user:
> "Your ILOS Dashboard is live at http://localhost:3100. Data is always fresh — just refresh the page after editing any YAML or JSONL file."

### Step 3 — Maintain mode

You are now the dashboard maintainer. Listen for requests:

| Request | Action |
|---------|--------|
| "Refresh / update data" | Tell user to refresh the browser — server reads files on every request |
| "Change the style" | Edit `dashboard/public/style.css` directly, then tell user to refresh |
| "Update the layout / logic" | Edit `dashboard/public/app.js`, then tell user to refresh |
| "Add a new view" | Add route + render function to `app.js`, register in `ROUTES` object |
| "Debug why X doesn't show" | Read `dashboard/lib/analytics.js` to trace the data computation |
| "Stop the server" | Tell user to press Ctrl+C in the terminal where the server is running |

---

## Architecture Reference

```
dashboard/
├── server.js          # HTTP server: /api/data endpoint + static file serving
├── lib/
│   ├── analytics.js   # buildData() — reads all YAML/JSONL → computes DATA object
│   ├── parser.js      # readYaml(), readJsonl(), readMarkdown(), listFiles()
│   └── graceful.js    # safeRead() — missing files return null, never throw
└── public/
    ├── index.html     # SPA shell
    ├── style.css      # All styles (extracted from html-template.md)
    └── app.js         # All client JS: router, renderers, SVG generators
```

**Data files read** (all relative to `ILOS-Template/` root, all optional):

| Data | File |
|------|------|
| VPER + elemental balance | `TIME/current-period.yaml` |
| Goals | `TIME/active-goals.yaml` |
| Strategy systems | `TIME/strategy-systems.yaml` |
| Wins | `MEMORY/wins.jsonl` |
| Vision (HHGs, FPs, MTPs) | `QUANTUM/vision/*.md` |

---

## Rules

- **Live server** — Do NOT regenerate static HTML files. The web app reads live data.
- **Never restart** the server just because data changed — a browser refresh is sufficient.
- **Edit in place** — Style/logic changes go directly to `public/style.css` or `public/app.js`.
- **Element colors** — Fire (#ef6c00), Air (#0097a7), Earth (#2e7d32), Water (#1565c0), Ether (#9c27b0).
- **Works without Tana** — Local files provide full data for all views.
