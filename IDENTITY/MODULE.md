# IDENTITY — Agent Instructions

## Purpose
User voice and writing style: defines how PARACELSUS should write when generating content as or for the user.

## When to Load
- Generating written content on behalf of the user (emails, posts, articles, messages)
- Crafting communications that should sound like the user
- Any output where the user's voice matters

## Key Files (priority order)
1. `voice-profile.yaml` — Writing style attributes, tone, patterns, and things to avoid

## Data Files (load only when needed)
- No additional data files

## Rules
- This module is **separate from personal context** -- it answers "how should I write" not "who am I".
- The voice profile captures style dimensions on spectrums (e.g., formal vs. casual, concise vs. elaborate).
- When generating content, match the voice profile closely. When coaching, use PARACELSUS's own voice.
- Update the voice profile when the user provides feedback on generated content style.
