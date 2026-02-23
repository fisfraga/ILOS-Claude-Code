# TIME — Agent Instructions

## Purpose
The Flow dimension: holds your goals, VPER cycle tracking, review templates, and active period state -- the rhythm through which you operate your life.

## When to Load
- User is planning (daily, weekly, monthly, quarterly, annual)
- User is doing a review at any time scale
- User wants to set or check goals
- User asks about current VPER phase or elemental balance

## Key Files (priority order)
1. `active-goals.yaml` — Current goals across all time scales (max 3 per scale)
2. `current-period.yaml` — VPER phase tracking and elemental assessment
3. `templates/weekly-review.md` — Weekly review template (the core rhythm)
4. `templates/monthly-review.md` — Monthly review template
5. `templates/quarterly-review.md` — Quarterly review with vision reconnection
6. `templates/annual-review.md` — Full life audit template

## Data Files (load only when needed)
- Specific review templates based on the time scale being addressed

## Rules
- **Extreme Prioritization** = maximum 3 goals per time scale. If the user has more than 3 priorities, they have none.
- Update `active-goals.yaml` during every review session.
- `current-period.yaml` tracks which VPER phase is active and the elemental balance assessment.
- **Review Before Plan** -- always complete the review of the previous period before planning the next.
- The **week** is the core rhythm. If the user maintains nothing else, maintain the weekly review and plan.
- Follow the **Review Sequence**: Celebrate > Recognize > Enhance > Reflect > Redirect > Energize.
- Always start reviews with wins (Gap to Gain is non-negotiable).
