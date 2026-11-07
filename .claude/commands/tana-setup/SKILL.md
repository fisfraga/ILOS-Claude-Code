---
name: tana-setup
description: Connect ILOS to your Tana workspace — finds your workspace IDs, checks what your workspace supports and sets how much to sync (one time, safe to re-run)
argument-hint: ""
---

# Tana Setup

**Duration:** 10-20 minutes the first time, 2 minutes on a re-run | **Mode:** Ether (System)

You are HERMES connecting ILOS to the user's Tana workspace. By the end, `SYSTEM/tana-ids.yaml` holds the workspace's IDs and capabilities, `SYSTEM/sync-config.yaml` holds the sync mode, and the user knows plainly what works and what stays local. Tana is optional: ILOS works fully without it.

**Tana calls:** one per message, in this conversation only (never from a subagent). Never call `get_or_create_calendar_node` here. This skill makes no Tana writes.

---

## Context (Preloaded)

!`cat SYSTEM/tana-ids.yaml`
!`cat SYSTEM/sync-config.yaml`

---

## Step 1 — Is Tana connected?

Call `list_workspaces` (one call).

If no Tana tool is available or the call fails, write nothing and say:

> "Tana isn't connected to Claude yet. Follow `SYSTEM/tana-mcp-setup.md` (about 5 minutes: the remote server if you have a paid Tana plan, the local one otherwise), then start Claude again in this folder and run `/tana-setup`. Everything in ILOS keeps working locally in the meantime."

Stop here.

**Re-run?** If `WORKSPACE_ID` in `tana-ids.yaml` is already filled, this is a re-run: say so, keep every filled value, and in Step 4 only fill what is still blank (report what changed). In Step 5, show the current mode and change it only if the user asks.

## Step 2 — Choose the workspace

From the `list_workspaces` result:
- Re-run with `WORKSPACE_ID` filled → check it is still in the list and keep it; do not ask again. If it is missing, say so and ask.
- One workspace → use it. Several → show the named ones as a numbered list and ask which one ILOS should use (the user answers with a number or a name). The remote Tana server lists every workspace the account can reach, so the list can be long and some entries have no name: leave those out and say how many were left out ("3 workspaces without a name are not shown").
- **The workspace ID lives in one place:** `workspace.WORKSPACE_ID` (and `HOME_NODE_ID`) in `SYSTEM/tana-ids.yaml`. Write them there. Some workspaces come back without a home node: then leave `HOME_NODE_ID` blank (no ILOS skill needs it).
- Legacy fallback: a `sync-config.yaml` from ILOS 1.0 may still hold a `tana_workspace_id` key (legacy). If `WORKSPACE_ID` is blank and that legacy key is filled, offer that workspace first. If both are filled and differ, show both names and ask which is right. Never write the legacy key.

## Step 3 — Keep IDs from an older copy

If the old Markdown tables in `SYSTEM/tana-reference/` (`tag-ids.md`, `field-ids.md`, `structure-map.md`) exist and hold IDs, run `node SYSTEM/tools/migrate-ids.js` (dry run), show the user the report, and on their yes run `node SYSTEM/tools/migrate-ids.js --write`. Exploration then only fills what is still blank.

## Step 4 — Discover the workspace

Calls, one at a time:
1. `list_tags` on the workspace (up to 200).
2. `read_node` on the home node (`maxDepth: 2`) to map the hubs.
3. `read_node` on each hub that exists (Vision, Life Overview, Planning, Personal Context, Review) to find the containers (Wins Log, Decisions Log, Goals, Projects, Topics, Favorite Problems, MTPs, High Hard Goals).
4. `get_tag_schema` for each tag that owns a field ILOS writes, if it exists: win (Periodicity; Area → `capabilities.win_area_field`), decision (status, Context, Confidence, Review date), one goal level (Goal Status, Area; the goal levels usually extend one parent tag, so read another level only if its schema says it extends a different one), project (Project Status, Desired Outcome), favorite problem (Active Problem → `ACTIVE_PROBLEM_FIELD_ID`), massively transformative purpose (Favorite Problems → `FP_FIELD_ID`), high hard goal (Massive Transformative Purpose → `MTP_FIELD_ID`). Option IDs (goal and project status, decision status, Periodicity Day…Year) come from the schema of the tag that owns the field. Tags such as task, context or voice review need only their tag ID, which `list_tags` already gave.

Fill `SYSTEM/tana-ids.yaml`:
- Write only blank (`""`) values. If you find a value that differs from a filled one, tell the user and change it only on their yes. Never blank a filled key.
- Never touch `SYSTEM/sync-config.yaml`'s `tana_node_overrides`: those are the user's choices and always win over the containers.
- Leave a key blank when the workspace has no such item. Do not guess.
- **Capabilities:** set `capabilities.decision_supertag` to `true` if a `#decision` tag exists, else `false`; set `capabilities.win_area_field` to `true` if the `#win` tag has an Area field, else `false`.

Report in plain words, for example:
> "Filled 31 IDs. Still blank: the Wins Log and Decisions Log containers (your workspace has no Review Hub), so wins wait locally until you create one or set `tana_node_overrides.wins_container_id`. Your workspace has no #decision tag, so decisions stay in `MEMORY/decisions.jsonl`."

Never show raw IDs unless the user asks.

## Step 5 — How much to sync

Present the two modes:

**🔄 Full Sync (Recommended)** — everything mirrored: all 12 Key Areas with content, projects and topics with notes, complete win and decision history, all 9 personal context files, strategy systems. Best for using Tana as a complete life mirror.

**⚡ Partial Sync** — the operational core: goals (all levels), vision items (FPs, MTPs, HHGs), area/project/topic names and metadata, the 4 core context files, recent wins (last 30 days by default), open decisions only. Best for lighter overhead or keeping detailed notes local.

Ask: **"Which sync mode do you prefer? (full / partial)"**

If **partial**, ask (defaults in parentheses): days of win history (30; 0 = all) · open decisions only, or all (open only) · the 4 core context files, or a custom set (all 4) · area/project/topic metadata (yes).

Then the auto-sync triggers: a `/morning` reminder after 2+ days without a sync (yes) · a wins and goals push at the start of `/weekly-review` (yes).

Update `SYSTEM/sync-config.yaml` **in place**: change only `sync_mode`, `auto_sync` and `partial_sync`; keep its comments, the `tana_node_overrides` section and any key the user added. If the file does not exist, create it with those keys and a full `tana_node_overrides` block with every key `""` (the key list is in `/sync` Step 0b). Never rewrite or reset `SYSTEM/sync-state.yaml`: it holds the `tana_node_ids` maps that keep `/sync` from pushing anything twice.

## Step 6 — First sync

If Step 4 filled the IDs a push needs:
> "Tana is set up. Run your first sync now? It pulls your [full: everything | partial: goals, areas, vision, context] from Tana, lists local items not yet in Tana, and records what it pushed so later syncs only move what changed. (yes / no)"

On yes, run `/sync`. On no: "Run `/sync` anytime; `/morning` and `/weekly-review` will remind you."

Close with what now works and what stays local (from Step 4's report), and that re-running `/tana-setup` later is safe.
