# Data Schemas Reference

Complete reference for all data formats used in the Intentional Life OS.

---

## Format-Function Mapping

| Extension | Purpose | Mutability | Examples |
|-----------|---------|------------|---------|
| `.md` | Narrative, instructions, templates | Editable | Vision docs, personal context, area descriptions |
| `.yaml` | Mutable structured state | Read/Write | active-goals.yaml, current-period.yaml, voice profile |
| `.jsonl` | Append-only episodic memory | Append-only | wins.jsonl, decisions.jsonl, failures.jsonl, experiences.jsonl |

---

## Area Slugs (12 Key Areas)

All area references across the system use these slugs:

| Slug | Area | House |
|------|------|-------|
| `health` | Health & Vitality | 1st |
| `finances` | Finances & Resources | 2nd |
| `intellectual` | Intellectual & Communication | 3rd |
| `home` | Home & Foundation | 4th |
| `creative` | Creative Expression | 5th |
| `routines` | Routines & Service | 6th |
| `love` | Love & Partnership | 7th |
| `emotional` | Emotional Depth | 8th |
| `vision` | Vision & Expansion | 9th |
| `career` | Career & Legacy | 10th |
| `social` | Social & Community | 11th |
| `spiritual` | Spiritual & Transcendence | 12th |

---

## JSONL Schemas (MEMORY/ files)

### wins.jsonl

Append-only log of wins, achievements, and positive outcomes.

```jsonl
{
  "id": "win_YYYYMMDD_HHMMSS",
  "date": "YYYY-MM-DD",
  "description": "What was accomplished",
  "area": "career",
  "scale": "week",
  "emotional_weight": 8,
  "connected_goal": "Goal description or null",
  "tags": ["manual", "shipping"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique ID: `win_YYYYMMDD_HHMMSS` |
| `date` | string | Yes | ISO date: `YYYY-MM-DD` |
| `description` | string | Yes | What was accomplished, in the user's words |
| `area` | string/null | No | One of the 12 area slugs |
| `scale` | string | Yes | `week` (default), `month`, `quarter` or `year`; matches the Tana Periodicity |
| `emotional_weight` | number | Yes | 1-10, how much it meant (default 5) |
| `connected_goal` | string/null | No | Related goal text or null |
| `tags` | string[] | Yes | Origin and themes. Origins: `manual`, `build`, `architect`, `review` |

Entries written before 2026-10 may use `title` instead of `description` and `source` instead of a tag. Readers use `description` and fall back to `title`; never rewrite old entries.

---

### decisions.jsonl

Append-only log of significant decisions and their outcomes.

```jsonl
{
  "id": "dec_YYYYMMDD_HHMMSS",
  "date": "YYYY-MM-DD",
  "decision": "What was decided",
  "context": "Why this decision came up",
  "alternatives_considered": ["Option A", "Option B"],
  "reasoning": "Why this choice was made",
  "outcome": null,
  "outcome_date": null,
  "confidence": 8,
  "area": "career",
  "tags": ["strategic", "product"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique ID: `dec_YYYYMMDD_HHMMSS` |
| `date` | string | Yes | ISO date: `YYYY-MM-DD` |
| `decision` | string | Yes | What was decided |
| `context` | string | Yes | Situation that led to this decision |
| `alternatives_considered` | string[] | No | Other options that were evaluated |
| `reasoning` | string | Yes | Why this choice was made |
| `outcome` | string/null | No | What actually happened (filled later) |
| `outcome_date` | string/null | No | When outcome was assessed |
| `confidence` | number (1-10) | No | How confident in the decision at time of making |
| `area` | string | Yes | One of the 12 area slugs |
| `tags` | string[] | No | Freeform tags |

---

### failures.jsonl

Append-only log of failures, mistakes, and lessons learned.

```jsonl
{
  "id": "fail_YYYYMMDD_HHMMSS",
  "date": "YYYY-MM-DD",
  "what_happened": "What went wrong",
  "root_cause": "Why it happened",
  "lesson": "What was learned",
  "prevention": "How to avoid next time",
  "area": "health",
  "severity": "medium",
  "tags": ["consistency", "habits"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique ID: `fail_YYYYMMDD_HHMMSS` |
| `date` | string | Yes | ISO date: `YYYY-MM-DD` |
| `what_happened` | string | Yes | What went wrong |
| `root_cause` | string | Yes | Why it happened |
| `lesson` | string | Yes | What was learned from it |
| `prevention` | string | No | How to avoid recurrence |
| `area` | string | Yes | One of the 12 area slugs |
| `severity` | string | Yes | `low`, `medium`, or `high` |
| `tags` | string[] | No | Freeform tags |

---

### experiences.jsonl

Append-only log of significant life experiences and insights.

```jsonl
{
  "id": "exp_YYYYMMDD_HHMMSS",
  "date": "YYYY-MM-DD",
  "description": "What happened",
  "emotional_weight": 8,
  "element": "water",
  "area": "love",
  "insight": "Wisdom extracted from the experience",
  "tags": ["relationship", "growth"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique ID: `exp_YYYYMMDD_HHMMSS` |
| `date` | string | Yes | ISO date: `YYYY-MM-DD` |
| `description` | string | Yes | What happened |
| `emotional_weight` | number (1-10) | Yes | How emotionally significant (1=minor, 10=life-changing) |
| `element` | string | No | `fire`, `air`, `earth`, or `water` |
| `area` | string | Yes | One of the 12 area slugs |
| `insight` | string | No | Wisdom extracted from the experience |
| `tags` | string[] | No | Freeform tags |

---

## YAML Schemas

### active-goals.yaml

Mutable goal hierarchy with extreme prioritization (max 3 per period).

```yaml
annual:
  period: "2026"
  goals:
    - id: annual_1
      description: "Goal description"
      area: career               # area slug
      connected_hhg: "HHG 1"    # or null
      status: active             # active | completed | abandoned
      key_results:               # Optional OKR-style extension
        - description: "Measurable result"
          target: 10
          current: 0

quarterly:
  period: "2026-Q1"
  goals:
    - id: q1_1
      description: "Goal description"
      area: career
      parent_goal: annual_1      # links to parent
      status: active

monthly:
  period: "2026-01"
  goals:
    - id: m01_1
      description: "Goal description"
      area: career
      parent_goal: q1_1
      status: active

weekly:
  period: "2026-W04"
  goals:
    - id: w04_1
      description: "Goal description"
      area: career
      parent_goal: m01_1
      status: active
```

| Scale | Period Format | ID Pattern | Parent Field |
|-------|--------------|------------|--------------|
| Annual | `YYYY` | `annual_N` | `connected_hhg` (string or null) |
| Quarterly | `YYYY-QN` | `qN_N` | `parent_goal` (annual ID) |
| Monthly | `YYYY-MM` | `mMM_N` | `parent_goal` (quarterly ID) |
| Weekly | `YYYY-WNN` | `wNN_N` | `parent_goal` (monthly ID) |

**Status values:** `active`, `completed`, `abandoned`

**key_results[] (optional):**

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Measurable result description |
| `target` | number | Target value |
| `current` | number | Current progress value |

---

### current-period.yaml

Mutable state tracking the current position in time and the VPER cycle.

```yaml
current_year: 2026
current_quarter: Q1
current_month: 1
current_week: 4

vper_phase: plan              # vision | plan | execute | review
phase_started: "2026-01-20"

elemental_balance:
  fire:
    score: 7
    notes: "Strong vision clarity this quarter"
  air:
    score: 5
    notes: "Planning needs more structure"
  earth:
    score: 8
    notes: "Consistent execution streak"
  water:
    score: 4
    notes: "Reviews have been rushed — slow down"

element_focus: water           # which element needs most attention

last_reviews:
  daily: "2026-01-27"
  weekly: "2026-01-26"
  monthly: "2026-01-01"
  quarterly: "2025-12-31"
  annual: "2025-12-31"

season_notes: "January energy — fresh start, high motivation"
```

| Field | Type | Description |
|-------|------|-------------|
| `current_year` | number | Current year |
| `current_quarter` | string | Q1-Q4 |
| `current_month` | number | 1-12 |
| `current_week` | number | 1-52 |
| `vper_phase` | string | `vision`, `plan`, `execute`, or `review` |
| `phase_started` | string | ISO date when current phase began |
| `elemental_balance` | object | Score (1-10) and notes for each element |
| `element_focus` | string | Element needing most attention |
| `last_reviews` | object | ISO dates of last review at each scale |
| `season_notes` | string | Freeform notes about the current season |

---

### 9-voice-profile.yaml

Mutable profile capturing the user's writing voice and communication style.

```yaml
dimensions:
  formal_casual: 3          # 1=very formal, 5=very casual
  serious_playful: 3
  concise_elaborate: 2
  reserved_expressive: 4
  traditional_innovative: 4

characteristic_expressions:
  - "Expression or phrase the user commonly uses"
  - "Another characteristic expression"

avoid_patterns:
  - "Pattern or phrasing to avoid"
  - "Another pattern to avoid"
```

| Field | Type | Description |
|-------|------|-------------|
| `dimensions` | object | Five voice dimensions, each scored 1-5 |
| `dimensions.formal_casual` | number (1-5) | 1=very formal, 5=very casual |
| `dimensions.serious_playful` | number (1-5) | 1=very serious, 5=very playful |
| `dimensions.concise_elaborate` | number (1-5) | 1=very concise, 5=very elaborate |
| `dimensions.reserved_expressive` | number (1-5) | 1=very reserved, 5=very expressive |
| `dimensions.traditional_innovative` | number (1-5) | 1=very traditional, 5=very innovative |
| `characteristic_expressions` | string[] | Phrases and expressions the user naturally uses |
| `avoid_patterns` | string[] | Phrasings and patterns to avoid in generated text |

---

## ID Conventions

All IDs are designed to be unique, sortable, and human-readable.

| Entity | Pattern | Example |
|--------|---------|---------|
| Win | `win_YYYYMMDD_HHMMSS` | `win_20260123_143022` |
| Decision | `dec_YYYYMMDD_HHMMSS` | `dec_20260115_091500` |
| Failure | `fail_YYYYMMDD_HHMMSS` | `fail_20260120_180045` |
| Experience | `exp_YYYYMMDD_HHMMSS` | `exp_20260118_220000` |
| Annual Goal | `annual_N` | `annual_1`, `annual_2`, `annual_3` |
| Quarterly Goal | `qN_N` | `q1_1`, `q1_2`, `q2_3` |
| Monthly Goal | `mMM_N` | `m01_1`, `m03_2`, `m12_3` |
| Weekly Goal | `wNN_N` | `w04_1`, `w15_2`, `w52_3` |

**Timestamp IDs** use the moment of capture (UTC or local time).
**Goal IDs** use the period identifier plus a sequential number (max 3 per period).

---

## Strategy Systems (`TIME/strategy-systems.yaml`)

Tracks recurring routines and habits that support goals. Updated during weekly reviews.

### Schema

```yaml
systems:
  - id: string              # Unique identifier (sys_1, sys_2, ...)
    name: string            # Human-readable name
    frequency: string       # daily | weekdays | weekly | biweekly
    area: string            # Area slug (health, career, etc.)
    element: string         # fire | air | earth | water
    connected_goal: string  # Optional: ID from active-goals.yaml, or null
    target_days: [string]   # Days expected: [mon, tue, wed, thu, fri, sat, sun]
    tracking:               # Rolling 4-week execution log (most recent first)
      - week: string        # ISO week (e.g., "2026-W09")
        days: object        # { day: boolean } for each target day
```

### Computed Fields (by DAEDALUS)

| Field | Formula |
|-------|---------|
| `completionRate` | completed days / target days (last 4 weeks) x 100 |
| `streak` | consecutive most-recent target days completed |
| `trend` | Compare week-1 rate vs week-3 average -> rising / flat / falling |

### Rules

- Maximum 4 weeks of tracking history (rolling window)
- Older weeks are dropped when a new week is added
- `target_days` defines which days count -- non-target days are ignored
- `connected_goal` should reference an active goal ID or be null
