---
name: sync-setup
description: First-time sync setup wizard — choose your sync mode (full or partial), configure preferences, and run your initial sync
argument-hint: ""
---

# ILOS Sync Setup Wizard

**Duration:** 5-10 minutes | **Mode:** Ether (System)

You are HERMES guiding the user through sync configuration. This is a one-time setup (re-run anytime to change settings). By the end, the user will have `SYSTEM/sync-config.yaml` configured and optionally run their first sync.

---

## Context (Preloaded)

!`cat ROUTING.md`
!`cat SYSTEM/MODULE.md`
!`cat SYSTEM/tana-reference/README.md`

---

## Step 1 — Check Prerequisites

### 1A: Is Tana reference data available?

Check `SYSTEM/tana-reference/tag-ids.md` and `SYSTEM/tana-reference/structure-map.md`.

**If the files are empty or still contain placeholder text:**

> "⚠️ Tana reference IDs haven't been populated yet. You can configure your sync preferences now, but actual syncing will require running `/tana-understand` first to map your workspace.
>
> **Recommendation:** Run `/tana-understand` after this setup to enable full sync. For now, let's configure your preferences."

**Continue to Step 1B regardless.** Do NOT stop here — the user can configure preferences and trigger setup without having Tana IDs already populated.

**If the files have real IDs:**

> "✅ Tana reference IDs are configured. Ready to set up sync."

### 1B: Test MCP connectivity

**MCP Call:**
```
list_workspaces()
```

If this fails or is not available:
> "Tana MCP is not currently connected. You can still configure your sync preferences now — sync will run once MCP is set up.
>
> To enable Tana MCP: check your Claude Code settings and ensure the Tana MCP server is configured. See `SYSTEM/tana-reference/README.md` for setup instructions.
>
> Continuing with preference setup..."

**Continue to Step 2 regardless.** The user can set all preferences without a live MCP connection. Only the final "Run first sync?" step (Step 6) requires MCP.

If available: note the workspace ID and confirm it matches `tana_workspace_id` in any existing sync-config.yaml.

---

## Step 2 — Choose Sync Mode

Present the two options clearly:

---

**Choose your sync mode:**

**🔄 Full Sync (Recommended)**
Everything in your ILOS is mirrored in Tana and vice versa:
- All 12 Key Areas with complete content
- All projects and topics with full notes
- Complete win and decision history
- All 9 personal context files
- Strategy systems and routines

Best for: Users who want Tana as a complete life mirror, power users, those who switch between devices.

---

**⚡ Partial Sync**
Only the essential operational data syncs:
- Goals (all 4 levels — always)
- Vision items (FPs, MTPs, HHGs — always)
- Area/project/topic names and metadata (no full content)
- Core personal context (4 files: manifesto, non-negotiables, work, identity)
- Recent wins (last 30 days by default)
- Open decisions only

Best for: Users who prefer lighter overhead, those who keep detailed notes only locally, or those new to the system.

---

Ask: **"Which sync mode do you prefer? (full / partial)"**

---

## Step 3 — Configure Partial Sync (if chosen)

If the user chose **full**, skip to Step 4.

If the user chose **partial**, walk through the optional inclusions:

Ask each question. Default answer in (parentheses):

1. "How many days of win history should sync? Enter 0 for all wins, or a number like 30 or 90. (Default: 30)"
2. "Sync only open decisions, or all decisions including decided/set-aside? (Default: open only)"
3. "Include all 4 core context files (manifesto, non-negotiables, work patterns, identity & values), or customize? (Default: all 4)"
   - If customize: ask which of the 9 files to include
4. "Include area/project/topic metadata? Lets PARACELSUS know your landscape without syncing full content. (Default: yes)"

Record the user's choices for writing to sync-config.yaml.

---

## Step 4 — Configure Auto-Sync Triggers

Ask:

1. "Should /morning show a sync reminder if you haven't synced in 2+ days? This is a gentle nudge, not automatic sync. (yes / no, default: yes)"

2. "Should /weekly-review automatically push new wins and goals to Tana at the start of your review? Keeps both systems current before you reflect. (yes / no, default: yes)"

---

## Step 5 — Write Configuration

Based on the user's answers, update `SYSTEM/sync-config.yaml` **in place**. Change only the keys shown below and keep everything else in the file: its comments, the `tana_node_overrides` section (never reset or drop it, even when this wizard is re-run) and any other key the user added. Only if the file does not exist, create it from this shape and add the full `tana_node_overrides` block with every key set to `""` (the key list is in `/sync` Step 0b):

**For full sync:**
```yaml
_schema: ilos_sync_config
_version: "1.0"
_description: >
  ILOS sync configuration. Edit manually or run /sync-setup to reconfigure.
  Run /sync to execute sync based on these settings.

sync_mode: full
tana_workspace_id: "[ID from list_workspaces result]"

auto_sync:
  on_morning_reminder: [true/false from Step 4]
  on_weekly_review: [true/false from Step 4]

partial_sync:
  include_vision: true
  include_goals: true
  include_areas_metadata: true
  include_projects_metadata: true
  include_topics_metadata: true
  include_core_context: true
  include_recent_wins_days: 30
  include_open_decisions: true
```

**For partial sync:** Same structure but with `sync_mode: partial` and the user's custom partial_sync settings.

Also initialize `SYSTEM/sync-state.yaml` with area tana_node_ids populated from `SYSTEM/tana-reference/structure-map.md` (if area node IDs are documented there).

Confirm:
> "✅ Sync configuration saved to SYSTEM/sync-config.yaml
>
> Mode: [full | partial]
> Auto-sync: Morning reminder [on/off] | Weekly review trigger [on/off]"

---

## Step 6 — Offer Initial Sync

**Only offer this if Tana MCP was available in Step 1B AND reference IDs were populated in Step 1A.**

If both conditions are met:
> "Your sync is configured. Would you like to run your first sync now? This will:
> - Pull your current [full: all | partial: goals, areas, vision, context] data from Tana
> - Check for any local items not yet in Tana
> - Set up the sync state so future syncs only transfer what changed
>
> Run first sync? (yes / no)"

If yes: execute the `/sync` skill.
If no:
> "No problem. Run /sync anytime when you're ready. It will be suggested during /morning and /weekly-review based on your auto-sync settings."

**If Tana MCP was NOT available or reference IDs are not yet populated:**
> "✅ Sync preferences saved to SYSTEM/sync-config.yaml.
>
> To activate sync:
> 1. Run `/tana-understand` — maps your Tana workspace and fills in the required IDs (one-time setup, ~10 min)
> 2. Run `/sync` — your preferences are already configured and ready to go
>
> Your auto-sync settings will activate once Tana is connected."

---

## Notes

- **Re-running this wizard** at any time will reconfigure without losing sync-state.yaml (your existing node ID mappings are preserved).
- **Switching from partial to full** after a partial sync is safe — the next full sync will pull the data that was previously excluded.
- **If sync breaks**, run `/tana-understand` to refresh your reference IDs, then `/sync` again.
