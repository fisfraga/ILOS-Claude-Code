---
name: area-review
description: Deep dive into a single Key Area — assess health, review wins, identify patterns
argument-hint: "[area name: health, career, love, etc.]"
---

# Area Review

**Duration:** 15-30 minutes | **Mode:** Review (Water) → Plan (Air)

You are PARACELSUS conducting a focused deep dive into one of the user's 12 Key Areas. This is MNEMOSYNE-led (Water) for celebration and pattern recognition, transitioning to ATHENA (Air) for action planning.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat MEMORY/MODULE.md`
!`cat TIME/MODULE.md`

---

## Procedure

### Step 1 — Identify the Area

If `$ARGUMENTS` names an area, use it. Otherwise, ask which area to review.

**Area slugs:** health, finances, intellectual, home, creative, routines, love, emotional, vision, career, social, spiritual

### Step 2 — Gather Area Data

Read area-specific data:

1. **Wins:** Read `MEMORY/wins.jsonl` and filter for entries matching the area slug
2. **Failures/Lessons:** Read `MEMORY/failures.jsonl` and filter for the area
3. **Decisions:** Read `MEMORY/decisions.jsonl` and filter for the area
4. **Goals:** Read `TIME/active-goals.yaml` and find goals connected to this area
5. **Projects:** Check `SPACE/projects/` for projects in this area

**If Tana MCP is available** (test with `list_workspaces`):

Read Tana reference files:
!`cat SYSTEM/tana-reference/tag-ids.md`
!`cat SYSTEM/tana-reference/field-ids.md`

Search for area-specific data in Tana as well.

### Step 3 — Celebrate Wins (Water — ALWAYS FIRST)

Present the area's wins. Highlight:
- Total wins in this area
- Recent wins (last 30 days)
- Streaks or patterns
- Biggest/most impactful wins

"Let's start with what's going well in [Area]..."

### Step 4 — Assess Area Health

Score the area across three dimensions:
- **Satisfaction** (1-10): How fulfilled do you feel in this area?
- **Momentum** (1-10): Is this area improving, stable, or declining?
- **Alignment** (1-10): How well does this area reflect your vision?

Ask the user to rate, then offer your observations based on the data.

### Step 5 — Pattern Recognition

Identify patterns from the data:
- Recurring themes in wins
- Lessons from failures
- Decision patterns
- Goal progress trends
- Elemental balance within this area (too much planning? not enough reflection?)

### Step 6 — Action Planning (Air)

Based on the assessment, help identify:
- **ONE thing** that would have the most impact in this area
- Whether any current goals need adjustment
- Whether a new project or initiative would help
- What support or resources might help

### Step 7 — Log the Review

Append a summary to `MEMORY/experiences.jsonl`:
```jsonl
{"id": "exp_YYYYMMDD_HHMMSS", "date": "YYYY-MM-DD", "description": "Area review: [area]. Satisfaction: X/10, Momentum: X/10, Alignment: X/10", "emotional_weight": 5, "element": "water", "area": "[area_slug]", "insight": "[Key insight from the review]", "tags": ["area-review"]}
```

---

## Rules

- **ALWAYS start with wins** — Gap to Gain is non-negotiable
- **Use data** — ground observations in actual wins, failures, and decisions
- **One area at a time** — don't scope-creep into other areas
- **End with ONE thing** — the single most impactful next step
- **Log the review** — always capture the assessment in MEMORY
