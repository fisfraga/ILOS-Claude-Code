# Dashboard Data Specification

Complete reference for the ILOS Dashboard data shape, computation rules, and query patterns. DAEDALUS reads this before generating any dashboard.

---

## Full Data Shape

```javascript
const DATA = {
  meta: {
    generatedAt: "Feb 23, 2026 at 14:30",
    userName: "User Name",
    currentWeek: "W08",
    currentMonth: "02",
    currentQuarter: "Q1",
    currentYear: "2026"
  },

  vper: {
    phase: "execute",           // vision | plan | execute | review
    phaseStarted: "2026-01-20",
    elementFocus: "earth",      // element needing most attention
    elementalBalance: {
      fire:  { score: 7, notes: "Strong vision clarity" },
      air:   { score: 6, notes: "Planning needs structure" },
      earth: { score: 5, notes: "Inconsistent execution" },
      water: { score: 8, notes: "Reviews flowing well" }
    }
  },

  goals: {
    annual: [{
      id: "annual_1",
      description: "Goal description",
      area: "career",
      status: "active",           // active | completed | abandoned
      connectedHhg: "HHG title or null",
      keyResults: [               // optional
        { description: "Measurable result", target: 10, current: 3, pct: 30 }
      ],
      childGoals: ["q1_1"]       // IDs of direct children at next scale
    }],
    quarterly: [{ id, description, area, status, parentGoal, childGoals, keyResults }],
    monthly:   [{ id, description, area, status, parentGoal, childGoals }],
    weekly:    [{ id, description, area, status, parentGoal }]
  },

  wins: [
    {
      id: "win_20260215_143022",
      date: "2026-02-15",
      title: "What was accomplished",
      area: "career",
      connectedGoal: "Goal text or null",
      tags: ["shipping", "consistency"]
    }
  ],

  winAnalytics: {
    total90d: 42,
    weeklyAvg: 3.2,
    byArea: {
      health:  { count: 5, trend: [1, 2, 1, 1] },
      career:  { count: 12, trend: [3, 4, 2, 3] },
      // ... all 12 areas
    },
    byWeek: [
      { week: "W05", count: 4 },
      { week: "W06", count: 3 },
      // ... last 13 weeks
    ],
    longestStreak: 8,     // consecutive days with at least 1 win
    currentStreak: 3
  },

  areas: [
    {
      id: "health",
      name: "Health & Vitality",
      houseNum: 1,
      element: "fire",
      winCount90d: 5,
      winTrend: [1, 2, 1, 1],   // last 4 weeks
      projectCount: 1,
      activeGoals: ["q1_2"],     // IDs of active goals in this area
      hasGoal: true,
      healthScore: 62            // 0-100 composite
    }
    // ... all 12 areas
  ],

  projects: [
    { id: "proj_1", title: "Project name", status: "active", area: "career", connectedGoal: "q1_1" }
  ],

  vision: {
    fps: [{ title: "Favorite Problem 1" }],
    mtps: [{ title: "Massively Transformative Purpose 1" }],
    hhgs: [{ title: "High Hard Goal 1", timeframe: "5 years" }]
  }
};
```

---

## 12 Key Areas Reference

Used for area enrichment. Each area maps to a zodiac house and element.

| ID | Name | House | Element |
|----|------|-------|---------|
| `health` | Health & Vitality | 1 | fire |
| `finances` | Finances & Resources | 2 | earth |
| `intellectual` | Intellectual & Communication | 3 | air |
| `home` | Home & Foundation | 4 | water |
| `creative` | Creative Expression | 5 | fire |
| `routines` | Routines & Service | 6 | earth |
| `love` | Love & Partnership | 7 | air |
| `emotional` | Emotional Depth | 8 | water |
| `vision` | Vision & Expansion | 9 | fire |
| `career` | Career & Legacy | 10 | earth |
| `social` | Social & Community | 11 | air |
| `spiritual` | Spiritual & Transcendence | 12 | water |

**Element grouping for area grid display:**
- **Fire row:** health (1), creative (5), vision (9)
- **Earth row:** finances (2), routines (6), career (10)
- **Air row:** intellectual (3), love (7), social (11)
- **Water row:** home (4), emotional (8), spiritual (12)

---

## Computation Rules

### Win Analytics

**Source:** `MEMORY/wins.jsonl` — filter entries where `date` is within last 90 days.

```
total90d = count of wins in last 90 days
weeklyAvg = total90d / 13 (90 days ≈ 13 weeks)

byArea[areaSlug] = {
  count: wins in this area (90 days),
  trend: [week-4 count, week-3 count, week-2 count, week-1 count]
    // where week-1 = most recent full week
}

byWeek = array of { week: "WNN", count: N } for last 13 weeks

longestStreak = max consecutive days with >= 1 win (looking at last 90 days)
currentStreak = consecutive days ending today/yesterday with >= 1 win
```

### Area Health Score (0-100)

For each of the 12 areas, compute:

```
winsScore    = min(winCount90d / 10, 1.0) * 40   // 40% weight, capped at 10 wins
goalsScore   = hasGoal ? 25 : 0                    // 25% weight, binary
projectScore = min(projectCount / 3, 1.0) * 20    // 20% weight, capped at 3 projects
trendScore   = trendDirection * 15                  // 15% weight

trendDirection:
  - rising (week-1 > week-3 average)  = 1.0
  - flat                               = 0.5
  - falling (week-1 < week-3 average) = 0.0

healthScore = winsScore + goalsScore + projectScore + trendScore
```

### Goal Enrichment

For each goal in `active-goals.yaml`:

1. If `key_results` exist, compute `pct` for each: `Math.round((current / target) * 100)`
2. Build `childGoals` array by finding goals at the next scale down where `parent_goal` matches this goal's `id`
3. Preserve `connected_hhg` as `connectedHhg` for annual goals

### Area Enrichment

For each of the 12 areas:

1. `winCount90d` — Count wins in this area from winAnalytics.byArea
2. `winTrend` — 4-week trend array from winAnalytics.byArea
3. `projectCount` — Count projects with matching area
4. `activeGoals` — IDs of active goals at any scale with matching area
5. `hasGoal` — `activeGoals.length > 0`
6. `healthScore` — Computed per formula above

---

## Data Source Queries

### Local Files (Always Available)

| Data | File | Extraction |
|------|------|-----------|
| VPER state | `TIME/current-period.yaml` | Parse YAML: vper_phase, phase_started, elemental_balance, element_focus |
| Goals | `TIME/active-goals.yaml` | Parse YAML: annual.goals, quarterly.goals, monthly.goals, weekly.goals |
| Wins | `MEMORY/wins.jsonl` | Read lines, parse JSON per line, filter by date (skip _schema line) |
| Vision — HHGs | `QUANTUM/vision/high-hard-goals.md` | Parse markdown headings/list items as HHG entries |
| Vision — FPs | `QUANTUM/vision/favorite-problems.md` | Parse markdown headings/list items |
| Vision — MTPs | `QUANTUM/vision/massively-transformative-purposes.md` | Parse markdown headings/list items |
| Projects | `SPACE/projects/` | Read each .md or .yaml file for title, status, area |
| User name | `QUANTUM/personal-context/0-life-vision-manifesto.md` | Extract name from first heading or context |
| Meta | `TIME/current-period.yaml` | current_year, current_quarter, current_month, current_week |

### Tana MCP (Optional — Enhanced)

If Tana MCP is available, run these queries **in parallel** to enrich local data:

```
// Active goals (all scales)
search_nodes({ query: { and: [{ hasType: "[GOAL_TAG_ID]" }, { not: { is: "done" } }]}, limit: 20 })

// Wins (last 90 days)
search_nodes({ query: { and: [{ hasType: "[WIN_TAG_ID]" }, { created: { last: 90 } }]}, limit: 200 })

// Active projects
search_nodes({ query: { and: [
  { hasType: "[PROJECT_TAG_ID]" },
  { field: { fieldId: "[PROJECT_STATUS_FIELD_ID]", stringValue: "Active" } }
]}, limit: 20 })

// Key areas
search_nodes({ query: { hasType: "[KEY_AREA_TAG_ID]" }, limit: 12 })
```

Replace `[BRACKET_IDS]` with actual Tana IDs from `SYSTEM/tana-reference/tag-ids.md`.

**Merge rule:** Local files are canonical. Tana data enriches but never overwrites local entries.

---

## VPER Phase Mapping

| Phase | Element | Icon | Color |
|-------|---------|------|-------|
| vision | Fire | flame | #ef6c00 |
| plan | Air | wind | #0097a7 |
| execute | Earth | mountain | #2e7d32 |
| review | Water | droplet | #1565c0 |
