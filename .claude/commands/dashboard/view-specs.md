# Dashboard View Specifications

Each view defines which data to fetch and what sections to include in the dashboard. Queries are shown for both Tana MCP and local file paths.

---

## View: Overview

**Description:** Full Life OS snapshot -- goals, wins, projects, and areas at a glance.

**Tana Queries:**
```
// Active goals at all levels
search_nodes({ query: { and: [{ hasType: "[WEEKLY_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })
search_nodes({ query: { and: [{ hasType: "[MONTHLY_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })
search_nodes({ query: { and: [{ hasType: "[QUARTERLY_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })
search_nodes({ query: { and: [{ hasType: "[ANNUAL_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })

// Recent wins (14 days)
search_nodes({ query: { and: [{ hasType: "[WIN_TAG_ID]" }, { created: { last: 14 } }]}, limit: 50 })

// Active projects
search_nodes({ query: { and: [
  { hasType: "[PROJECT_TAG_ID]" },
  { field: { fieldId: "[PROJECT_STATUS_FIELD_ID]", stringValue: "Active" } }
]}, limit: 20 })

// Key areas
search_nodes({ query: { hasType: "[KEY_AREA_TAG_ID]" }, limit: 12 })

// Vision (HHGs only for overview)
search_nodes({ query: { hasType: "[HHG_TAG_ID]" }, limit: 10 })
```

**Local File Sources:**
- Goals: `TIME/active-goals.yaml` -- all sections (weekly, monthly, quarterly, annual)
- Wins: `MEMORY/wins.jsonl` -- filter last 14 days
- Projects: `SPACE/projects/` -- list project files with status
- Areas: 12 Key Area slugs from ROUTING.md + win counts from wins.jsonl
- Vision: `QUANTUM/vision/high-hard-goals.md` -- parse HHG entries

**Data sections:** goals, wins, projects, areas, vision.hhgs

**Layout:** 3-column grid on desktop
- Left: Goals cascade (annual -> quarterly -> monthly -> weekly)
- Center: Recent wins list + win count
- Right: Active projects + area attention indicators

---

## View: Weekly

**Description:** This week's wins, goals, and tasks.

**Tana Queries:**
```
// This week's wins
search_nodes({ query: { and: [{ hasType: "[WIN_TAG_ID]" }, { created: { last: 7 } }]}, limit: 50 })

// Weekly goals
search_nodes({ query: { and: [{ hasType: "[WEEKLY_GOAL_TAG_ID]" }, { created: { last: 10 } }]}, limit: 10 })

// Tasks due this week (not done)
search_nodes({ query: { and: [{ hasType: "[TASK_TAG_ID]" }, { not: { is: "done" } }]}, limit: 30 })

// Notes created this week
search_nodes({ query: { and: [{ hasType: "[NOTE_TAG_ID]" }, { created: { last: 7 } }]}, limit: 20 })
```

**Local File Sources:**
- Wins: `MEMORY/wins.jsonl` -- filter last 7 days
- Goals: `TIME/active-goals.yaml` -- `weekly.goals` section
- Decisions: `MEMORY/decisions.jsonl` -- filter last 7 days (substitute for notes)

**Data sections:** wins, goals.weekly, tasks, notes

**Layout:** 2-column grid
- Left: Weekly goals (with done/not-done status) + tasks
- Right: Wins list + notes created

---

## View: Goals

**Description:** Goal cascade across all time horizons.

**Tana Queries:**
```
// All non-done goals at every level
search_nodes({ query: { and: [{ hasType: "[ANNUAL_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })
search_nodes({ query: { and: [{ hasType: "[QUARTERLY_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })
search_nodes({ query: { and: [{ hasType: "[MONTHLY_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })
search_nodes({ query: { and: [{ hasType: "[WEEKLY_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })

// Recently completed goals (last 30 days)
search_nodes({ query: { and: [{ hasType: "[MONTHLY_GOAL_TAG_ID]" }, { done: { last: 30 } }]}, limit: 10 })
search_nodes({ query: { and: [{ hasType: "[WEEKLY_GOAL_TAG_ID]" }, { done: { last: 14 } }]}, limit: 20 })

// HHGs for vision context
search_nodes({ query: { hasType: "[HHG_TAG_ID]" }, limit: 10 })
```

**Local File Sources:**
- Goals: `TIME/active-goals.yaml` -- all sections, check status field for completed
- Vision: `QUANTUM/vision/high-hard-goals.md` -- parse HHG entries

**Data sections:** goals (all levels), vision.hhgs

**Layout:** Single column, hierarchical
- HHGs at top (vision anchor)
- Annual goals -> Quarterly goals -> Monthly goals -> Weekly goals
- Each level shows active + recently completed
- Status badges: Active, Completed, Backlog

---

## View: Areas

**Description:** 12 life area attention heatmap.

**Tana Queries:**
```
// All 12 key areas
search_nodes({ query: { hasType: "[KEY_AREA_TAG_ID]" }, limit: 12 })

// Wins by area (last 90 days -- need to count per area)
search_nodes({ query: { and: [{ hasType: "[WIN_TAG_ID]" }, { created: { last: 90 } }]}, limit: 200 })

// Active projects (to count per area)
search_nodes({ query: { and: [
  { hasType: "[PROJECT_TAG_ID]" },
  { field: { fieldId: "[PROJECT_STATUS_FIELD_ID]", stringValue: "Active" } }
]}, limit: 30 })

// Active goals (to check which areas have goals)
search_nodes({ query: { and: [{ hasType: "[MONTHLY_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })
search_nodes({ query: { and: [{ hasType: "[QUARTERLY_GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 10 })
```

**Local File Sources:**
- Areas: 12 Key Area slugs from ROUTING.md: `health`, `finances`, `intellectual`, `home`, `creative`, `routines`, `love`, `emotional`, `vision`, `career`, `social`, `spiritual`
- Wins: `MEMORY/wins.jsonl` -- filter last 90 days, group by `area` field
- Projects: `SPACE/projects/` -- count per area
- Goals: `TIME/active-goals.yaml` -- check `area` field on active goals

**Data sections:** areas (enriched with win counts, project counts, goal presence)

**Layout:** 4x3 grid of area cards
- Each card: area name, win count (90 days), active projects, has-goal indicator
- Color intensity based on activity level (more wins = warmer color)
- Neglected areas highlighted (0 wins, 0 projects)

---

## View: Wins

**Description:** Win timeline with patterns and area breakdown.

**Tana Queries:**
```
// All wins from last 90 days
search_nodes({ query: { and: [{ hasType: "[WIN_TAG_ID]" }, { created: { last: 90 } }]}, limit: 200 })

// Key areas for grouping
search_nodes({ query: { hasType: "[KEY_AREA_TAG_ID]" }, limit: 12 })
```

**Local File Sources:**
- Wins: `MEMORY/wins.jsonl` -- filter last 90 days
- Areas: 12 Key Area slugs from ROUTING.md for grouping

**Data sections:** wins (full list), areas (for grouping)

**Layout:** Timeline + sidebar
- Main: Win timeline sorted by date, grouped by week
- Sidebar: Area breakdown (bar chart), total count, weekly average
- Highlight: Longest streak, most active area, recent momentum
