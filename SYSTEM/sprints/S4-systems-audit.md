# Sprint S4: Systems Audit + Refinement

**Status:** Planned
**Depends on:** S1 (Done), S2 (recommended), S3 (optional)
**Estimate:** 1 session
**Element:** Earth + Water (grounded execution meets reflective review)

---

## Vision

Close the loop on ILOS as a complete life operating system by adding execution tracking and alignment verification. The Systems page shows whether your weekly routines are actually happening. The Alignment page reveals whether your goals connect to your vision, and whether your wins map to your priority areas. Together they answer: "Am I doing what I said I'd do, and does what I'm doing serve who I'm becoming?"

---

## Architecture

### Route Structure

| Route | Tab Label | Content |
|-------|-----------|---------|
| `#systems` | Systems | Weekly routine tracker (Mon-Sun grid) + execution consistency |
| `#alignment` | Alignment | Cross-dimension coherence checks: goals→vision, wins→areas, balance audit |

### New Data File: `TIME/strategy-systems.yaml`

A new YAML file for tracking recurring routines and strategy systems:

```yaml
# Strategy Systems — Recurring routines that support your goals
# Update during weekly reviews

systems:
  - id: sys_1
    name: "Morning routine"
    frequency: daily          # daily | weekdays | weekly | biweekly
    area: health
    element: earth
    connected_goal: "q1_2"    # optional link to active goal
    target_days: [mon, tue, wed, thu, fri]
    tracking:
      # Last 4 weeks of execution (most recent first)
      - week: "2026-W08"
        days: { mon: true, tue: true, wed: false, thu: true, fri: true }
      - week: "2026-W07"
        days: { mon: true, tue: false, wed: true, thu: true, fri: true }

  - id: sys_2
    name: "Run 3x per week"
    frequency: weekly
    area: health
    element: earth
    connected_goal: "q1_2"
    target_days: [mon, wed, fri]
    tracking:
      - week: "2026-W08"
        days: { mon: true, wed: true, fri: false }

  - id: sys_3
    name: "Weekly review"
    frequency: weekly
    area: vision
    element: water
    connected_goal: null
    target_days: [sun]
    tracking:
      - week: "2026-W08"
        days: { sun: true }

execution_score: 78           # overall % across all systems (computed)
```

### Data Shape Extension

```javascript
DATA.systems = [
  {
    id: "sys_1",
    name: "Morning routine",
    frequency: "daily",
    area: "health",
    element: "earth",
    connectedGoal: "q1_2",
    targetDays: ["mon","tue","wed","thu","fri"],
    tracking: [
      { week: "W08", days: { mon: true, tue: true, wed: false, thu: true, fri: true } },
      { week: "W07", days: { mon: true, tue: false, wed: true, thu: true, fri: true } }
    ],
    completionRate: 80,       // computed: completed / target days (last 4 weeks)
    streak: 3,                // consecutive target days hit
    trend: "rising"           // rising | flat | falling (4-week trend)
  }
];

DATA.systemsAnalytics = {
  overallScore: 78,           // weighted average across all systems
  totalSystems: 5,
  consistentSystems: 3,       // >80% completion
  needsAttention: 2,          // <60% completion
  bestDay: "monday",          // highest execution day
  worstDay: "friday",         // lowest execution day
  weeklyTrend: [75, 80, 72, 78]  // 4-week overall scores
};

DATA.alignment = {
  // Goal-to-Vision coherence
  goalsWithVision: 2,         // goals connected to HHGs
  goalsOrphaned: 1,           // goals with no parent chain to vision
  goalCoverage: 67,           // % of goals connected

  // Win-to-Area distribution
  areaBalance: {
    active: 5,                // areas with wins in last 30 days
    neglected: 7,             // areas with 0 wins
    overFocused: ["career"],  // >40% of all wins in one area
    underFocused: ["spiritual","social","emotional"]
  },

  // System-to-Goal coherence
  systemsWithGoals: 3,        // systems connected to active goals
  systemsOrphaned: 2,         // systems with no goal connection

  // Overall alignment score (0-100)
  overallScore: 62,
  insights: [
    "7 of 12 life areas have received no attention in the last 30 days",
    "1 goal has no connection to your vision — consider cutting or connecting it",
    "Your career area has 45% of all wins — strong focus, but check if other areas are suffering"
  ]
};
```

---

## Tasks

### S4-01: Strategy Systems Schema + Template File

**Files:** New `TIME/strategy-systems.yaml`, `ILOS-KNOWLEDGE/schemas.md`

**Acceptance Criteria:**
- [ ] Create `TIME/strategy-systems.yaml` with 3 example systems (morning routine, exercise, weekly review)
- [ ] Add schema documentation to `ILOS-KNOWLEDGE/schemas.md` — YAML schema for strategy-systems
- [ ] Schema includes: id, name, frequency, area, element, connected_goal, target_days, tracking (4-week rolling)
- [ ] Add `strategy-systems.yaml` to ROUTING.md task routing table (under "Routines, habits, execution tracking")
- [ ] Add `strategy-systems.yaml` to SKILL.md Step 2 data sources

---

### S4-02: Systems Analytics Computation

**Files:** `view-specs.md`, `SKILL.md`

**Acceptance Criteria:**
- [ ] Document computation rules for `DATA.systems` in `view-specs.md`:
  - `completionRate`: completed days / target days (last 4 weeks), as percentage
  - `streak`: consecutive most-recent target days completed
  - `trend`: compare week-1 rate vs week-3 average → rising/flat/falling
- [ ] Document `DATA.systemsAnalytics`:
  - `overallScore`: weighted average of all system completion rates
  - `bestDay/worstDay`: day of week with highest/lowest execution across all systems
  - `weeklyTrend`: 4-week array of overall scores
- [ ] Document `DATA.alignment` computation rules:
  - `goalCoverage`: trace goal parent chains — % that reach an HHG
  - `areaBalance`: count wins per area (30 days), identify neglected (<1 win) and overFocused (>40% share)
  - `systemsWithGoals`: count systems with non-null connected_goal matching an active goal
  - `overallScore`: composite of goalCoverage (40%) + areaBalance (30%) + systemsWithGoals (30%)
  - `insights`: generate 2-4 plain-English insight strings based on the data
- [ ] SKILL.md Step 2: Add "Read `TIME/strategy-systems.yaml`" and compute systems + alignment analytics

---

### S4-03: Systems Page (`#systems`)

**Files:** `html-template.md`

**Acceptance Criteria:**
- [ ] New route `#systems` with sidebar nav icon (⚙ or ☰)
- [ ] **Overall Score:** Large number (0-100) with element-colored ring (green >80, yellow 60-80, red <60)
- [ ] **Weekly Grid:** For each system: name, area badge, 7-column Mon-Sun grid with check (✓) / miss (✗) / not-target (—) for the current week
- [ ] **4-Week History:** Below each system's current week, show a 4-week sparkline of completion rates
- [ ] **Completion Rate Badge:** Per system — percentage with color coding (green/yellow/red)
- [ ] **Streak Counter:** Per system — "3-day streak" or "broken" indicator
- [ ] **Day-of-Week Summary:** Bottom section showing which days have highest/lowest execution (bar chart by day)
- [ ] **Needs Attention List:** Systems with <60% completion highlighted with red border
- [ ] Fallback: If `strategy-systems.yaml` doesn't exist or has no systems, show "Set up your strategy systems. Run `/strategist` to define your recurring routines."

---

### S4-04: Alignment Page (`#alignment`)

**Files:** `html-template.md`

**Acceptance Criteria:**
- [ ] New route `#alignment` with sidebar nav icon (⊕ or ∞)
- [ ] **Alignment Score:** Large composite score (0-100) with ring visualization
- [ ] **Goal-to-Vision Audit:** Visual showing which goals connect to HHGs (connected = green line, orphaned = red dotted line). Tree diagram or Sankey-style flow.
- [ ] **Area Balance Heatmap:** 4x3 grid (same layout as `#areas`) but focused on balance — overFocused areas get amber "too hot" styling, neglected areas get blue "cold" styling
- [ ] **Win Distribution Pie/Donut:** SVG donut showing % of wins per area. Highlight imbalance.
- [ ] **System-to-Goal Connection:** List of systems with their connected goal (or "orphaned" badge if no connection)
- [ ] **Insights Panel:** 2-4 plain-English insight strings from `DATA.alignment.insights`, styled as cards with element-colored left border
- [ ] **Action Suggestions:** Based on insights, suggest specific ILOS skills — e.g., "7 areas neglected → try `/area-review` for Health", "Goal orphaned → run `/alignment` to reconnect"
- [ ] Fallback: If insufficient data (no goals, no wins), show guided setup message

---

### S4-05: Dashboard Integration + Review Skill Hooks

**Files:** `html-template.md`, review skill files

**Acceptance Criteria:**
- [ ] `#dashboard` page: Add "Systems" mini-card showing overall execution score + systems needing attention count
- [ ] `#dashboard` page: Add "Alignment" mini-indicator — score badge in the stats bar
- [ ] Click either → navigates to respective page
- [ ] `/weekly-review` SKILL.md: Add step "Update strategy-systems.yaml tracking for the current week"
- [ ] `/monthly-review` SKILL.md: Add step "Review alignment score — are goals connected to vision?"
- [ ] `/strategist` SKILL.md: Add capability "Define or update strategy systems in TIME/strategy-systems.yaml"

---

## Tana Live Sync (Future Enhancement — Not in S4 Scope)

When Tana MCP is available, strategy systems tracking could sync bidirectionally:
- Read: Pull task completion data from Tana calendar nodes
- Write: Push system definitions to Tana as recurring task templates
- This would replace manual tracking in YAML with automatic detection

**Deferred to:** S4.5 or separate sprint when Tana MCP is tested and stable.

---

## Verification

1. Create `TIME/strategy-systems.yaml` with 3 example systems → regenerate dashboard
2. `#systems` page shows weekly grid with check/miss markers
3. Completion rates compute correctly (manual count verification)
4. Systems with <60% show "needs attention" styling
5. `#alignment` page shows goal-to-vision connections (verify against active-goals.yaml parent chains)
6. Area balance heatmap correctly identifies neglected areas (cross-reference with wins.jsonl)
7. Insights generate meaningful, data-driven text (not generic)
8. Dashboard mini-cards show correct scores and navigate to detail pages
9. All new pages respect dark/light mode and element colors
10. Mobile: grids collapse, weekly grid scrolls horizontally if needed
