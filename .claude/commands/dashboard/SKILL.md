---
name: dashboard
description: Generate the ILOS Dashboard — a self-contained HTML single-page app with VPER wheel, area health, goal cascade, and win analytics
---

# Dashboard Generation

**Duration:** 2-3 minutes | **Mode:** Building (Earth) | **Agent:** DAEDALUS

You are DAEDALUS generating the ILOS Dashboard. Fetch ALL data from local files (and optionally Tana), compute analytics, build a self-contained HTML single-page application, and open it in the user's browser. Zero dependencies, no server required.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat TIME/MODULE.md`
!`cat MEMORY/MODULE.md`

---

## Procedure

### Step 1 — Fetch ALL data

Read the data computation guide in `view-specs.md` for the full data shape and computation rules.

#### Data Sources (Local Files — Always Available)

| Data | Source File | How to Extract |
|------|-----------|----------------|
| VPER state | `TIME/current-period.yaml` | Read vper_phase, phase_started, elemental_balance, element_focus |
| Goals (all scales) | `TIME/active-goals.yaml` | Read annual, quarterly, monthly, weekly sections |
| Wins (90 days) | `MEMORY/wins.jsonl` | Read all entries, filter last 90 days by `date` field |
| Vision | `QUANTUM/vision/` | Parse HHGs, FPs, MTPs from markdown files |
| Projects | `SPACE/projects/` | List project files, extract title + status + area |
| User name | `QUANTUM/personal-context/0-life-vision-manifesto.md` | Extract name from context |
| Education content | `ILOS-KNOWLEDGE/*.md` | Parse markdown → structured sections for Learn pages |

#### Data Sources (Tana MCP — Optional Enhancement)

**If Tana MCP is available** (test with `list_workspaces`):

Read Tana reference files:
!`cat SYSTEM/tana-reference/tag-ids.md`
!`cat SYSTEM/tana-reference/field-ids.md`
!`cat SYSTEM/tana-reference/structure-map.md`

Run Tana queries in parallel for enhanced data (see view-specs.md for query patterns). Merge with local file data — local files are canonical.

### Step 2 — Compute analytics

Using the fetched data, compute these derived values (see `view-specs.md` for formulas):

1. **winAnalytics** — total90d, weeklyAvg, byArea (count + 4-week trend), byWeek (weekly counts), longestStreak, currentStreak
2. **Area health scores** — For each of the 12 areas: healthScore (0-100) based on wins (40%), goals (25%), projects (20%), trend (15%)
3. **Goal enrichment** — Attach key_results percentage, link child goals, resolve parent chains
4. **Area enrichment** — Attach winCount90d, winTrend (4-week array), projectCount, activeGoals list, hasGoal flag
5. **Education content** — Read all `ILOS-KNOWLEDGE/*.md` files and parse into `DATA.education` (see `view-specs.md` Education Data Computation section). Split by headings into sections, extract quotes, assign element colors per topic.

### Step 3 — Generate HTML

1. Read `html-template.md` (companion file in this command directory) for the SPA template
2. Build the complete DATA JavaScript object from fetched + computed data
3. Replace these placeholders in the template:
   - `{{DATA}}` → Serialized data object (as JS literal, NOT JSON string)
   - `{{GENERATED_AT}}` → Current timestamp (e.g., "Feb 23, 2026 at 14:30")
   - `{{USER_NAME}}` → User's name from personal context

### Step 4 — Write and open

```bash
# Ensure output directory exists
mkdir -p SPACE/products/dashboards

# Write the file
Write the generated HTML to SPACE/products/dashboards/ilos-dashboard.html

# Open in browser
open SPACE/products/dashboards/ilos-dashboard.html
```

Tell the user:
> "Your ILOS Dashboard is ready. I've opened it in your browser. Navigate between tabs to explore your data."

### Step 5 — Iterate

Listen for feedback:
- **"Regenerate"** — Refetch data, recompute, regenerate
- **"Change colors"** — Adjust element colors or theme in template
- **"Add data"** — Include additional context, regenerate
- **"Export"** — The dashboard has a built-in print/PDF export button

---

## Data Shape

The injected DATA object follows this structure (see `view-specs.md` for full specification):

```javascript
const DATA = {
  meta: { generatedAt, userName, currentWeek, currentMonth, currentQuarter, currentYear },
  vper: { phase, phaseStarted, elementFocus, elementalBalance: { fire, air, earth, water } },
  goals: { annual: [...], quarterly: [...], monthly: [...], weekly: [...] },
  wins: [ { id, date, title, area, connectedGoal, tags } ],
  winAnalytics: { total90d, weeklyAvg, byArea, byWeek, longestStreak, currentStreak },
  areas: [ { id, name, houseNum, element, winCount90d, winTrend, projectCount, activeGoals, hasGoal, healthScore } ],
  projects: [ { id, title, status, area, connectedGoal } ],
  vision: { fps: [...], mtps: [...], hhgs: [...] },
  education: { vper: {...}, elements: {...}, gapToGain: {...}, areas: {...}, goals: {...}, planning: {...} }
};
```

---

## Rules

- **Self-contained HTML** — Zero external dependencies. Everything inline.
- **Single-page app** — All 4 views in one file with hash-based routing.
- **Dark/light mode** — Auto-detect system preference via `prefers-color-scheme`.
- **Responsive** — Desktop sidebar becomes mobile bottom bar below 768px.
- **No server** — Just a file opened in the browser. No localhost, no npm.
- **Fresh data** — Always fetch from source files at generation time. No caching.
- **Real data only** — Never use placeholder data in generated dashboards.
- **Element colors** — Fire (#ef6c00), Air (#0097a7), Earth (#2e7d32), Water (#1565c0), Ether (#9c27b0).
- **Works without Tana** — Local files provide full data for all views.
