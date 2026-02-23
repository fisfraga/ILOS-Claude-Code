# MEMORY — Agent Instructions

## Purpose
Episodic memory: append-only logs of wins, decisions, failures, and key life experiences that build a compounding record of your journey.

## When to Load
- During reviews: read recent entries to surface patterns and celebrate progress
- When capturing events: append new entries after coaching sessions, reviews, or significant moments
- When the user feels stuck or discouraged: read recent wins as evidence of capability

## Key Files (priority order)
1. `wins.jsonl` — Gap-to-Gain win log (read this FIRST in every review)
2. `decisions.jsonl` — Decision log with reasoning traces
3. `failures.jsonl` — Failure/lesson log (failures encode judgment, not shame)
4. `experiences.jsonl` — Key life experiences with emotional weight

## Data Files (load only when needed)
- All files above are both key and data files -- load based on context

## Rules
- **NEVER delete entries.** All files are append-only. Each line is a self-contained JSON object.
- **Always append.** New entries go at the end of the file, one JSON object per line.
- **Schema line first.** The first line of each file is a schema descriptor -- never modify it.
- **ID format:** `{type}_{YYYYMMDD}_{HHMMSS}` (e.g., `win_20260223_143000`)
- **Gap-to-Gain:** Always read `wins.jsonl` BEFORE `failures.jsonl`. Celebrate progress before examining setbacks.
- **Area slugs** for tagging entries: `health`, `finances`, `intellectual`, `home`, `creative`, `routines`, `love`, `emotional`, `vision`, `career`, `social`, `spiritual`
- Failures are data, not judgment. Frame them as lessons and growth opportunities.
