# Tana write contract

Every ILOS skill that writes a win, decision, goal, project or topic to Tana follows the recipe for that entity in this file. Skills do not restate these templates: they say *"Read `SYSTEM/tana-write-contract.md` and follow the contract for `win`"*, and keep only their own part (what to capture, when to ask). `node SYSTEM/tools/skill-lint.js` checks that each recipe's **Writers** cite it and that no other file restates a push template.

## Rules for every recipe

- **The local file comes first.** The item is written to its local file before any Tana call, whether or not Tana is available. Tana is a sync target; a failed or skipped push loses nothing.
- **Is Tana there?** Test with `list_workspaces`. If no Tana tool exists or the call fails, skip the Tana step, keep the item local and say so once: `/sync` pushes it later. Setup steps: `SYSTEM/tana-mcp-setup.md`.
- **One Tana call per message**, in the main conversation only (never from a subagent).
- **IDs** come from `SYSTEM/tana-ids.yaml`. Every bracketed placeholder ending in `_ID` below is a key there; `[..._CONTAINER_ID_RESOLVED]` is the matching `tana_node_overrides.<key>` in `SYSTEM/sync-config.yaml` when it is non-empty, otherwise the `tana-ids.yaml` value.
- **Empty-ID guard.** If any ID a recipe lists under *Needs* is empty, do not push: tell the user once which key is missing (for example "no DECISION_TAG_ID — decisions stay local until `/tana-setup` finds one"), leave the item unrecorded so `/sync` pushes it once the IDs exist, and continue. Never improvise another target, tag or field.
- **Record every push** in `SYSTEM/sync-state.yaml` right after it succeeds, under the entity's `tana_node_ids` map (local ID → returned Tana node ID). The map is the dedup source of truth: an item already in it is never pushed again.
- **Never push wins or decisions to a calendar (day) node.**

## Recipe: `win`
**Writers:** `.claude/commands/win/SKILL.md`, `.claude/commands/build/SKILL.md`, `.claude/commands/sync/SKILL.md`, `.claude/commands/weekly-review/SKILL.md`, `.claude/agents/tana.md`

**Local record:** one canonical line in `MEMORY/wins.jsonl` (`id`, `date`, `description`, `area`, `scale`, `emotional_weight`, `connected_goal`, `tags`). The text pushed to Tana is `description`; lines written before 1.0 have `title` instead — use it when `description` is absent.

**Target:** `[WINS_CONTAINER_ID_RESOLVED]` — `tana_node_overrides.wins_container_id` if non-empty, else `WINS_CONTAINER_ID`.

**Needs:** the resolved wins container, `WIN_TAG_ID`, `PERIODICITY_FIELD_ID`. If any is empty, the empty-ID guard applies: skip the push and leave the win unrecorded.

**Capabilities:** add the Area line only when `capabilities.win_area_field` is `true`, `AREA_FIELD_ID` is filled and `areas.<slug>` has a node ID for the win's area. Otherwise push without it.

**Dedup:** read `entities.wins.tana_node_ids`. Skip any win already listed (not an error). If the map is missing and `entities.wins.last_pushed_win_id` is not null, the state file predates the map: create the map and seed it with the value `pre-map` for every win whose `id` sorts at or before that cursor (`win_YYYYMMDD_HHMMSS` IDs sort by time) — the old logic already pushed those. If the map is missing and the cursor is null, create it empty.

**Periodicity:** `Week` by default; `Month`, `Quarter` or `Year` for bigger milestones (match the win's `scale`). **Never `Day`** — Day-scoped wins are invisible in weekly and higher reviews.

**Push** (one call per win):
```
import_tana_paste({
  parentNodeId: "[WINS_CONTAINER_ID_RESOLVED]",
  content: "- [Win description] #[[^[WIN_TAG_ID]]]\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week\n  - [[^[AREA_FIELD_ID]]]:: [[^[AREA_NODE_ID]]]"
})
```
Drop the Area line when the capability rule above says so.

**Record:** add `entities.wins.tana_node_ids.<win_id>: <returned node ID>`; set `entities.wins.last_push` to the current ISO timestamp. Set `entities.wins.last_pushed_win_id` to this win's ID **only if it sorts later than the current value** (pushing an older win must not move it backwards; it is a report, not the dedup).

**Never:** a calendar node as the target; a win pushed without its map entry recorded.

## Recipe: `decision`
**Writers:** `.claude/commands/decision/SKILL.md`, `.claude/commands/sync/SKILL.md`, `.claude/agents/tana.md`

**Local record:** one line in `MEMORY/decisions.jsonl` (`id`, `date`, `decision`, `status`, `context`, `alternatives_considered`, `reasoning`, `outcome`, `outcome_date`, `review_date`, `confidence`, `area`, `tags`).

**Target:** `[DECISIONS_CONTAINER_ID_RESOLVED]` — `tana_node_overrides.decisions_container_id` if non-empty, else `DECISIONS_CONTAINER_ID`.

**Needs:** the resolved decisions container, `DECISION_TAG_ID`, `DECISION_STATUS_FIELD_ID`, and the option for the decision's status (`DECISION_OPEN_OPTION_ID`, `DECISION_DECIDED_OPTION_ID` or `DECISION_SET_ASIDE_OPTION_ID`). If any is empty, the empty-ID guard applies: skip the push and leave the decision unrecorded.

**Capabilities:** `capabilities.decision_supertag` must be `true`. When it is `false` (the workspace has no `#decision` tag) or still `unknown` with `DECISION_TAG_ID` blank, decisions stay in `MEMORY/decisions.jsonl`: say so once ("your workspace has no #decision tag, so decisions stay local") and continue.

**Dedup:** `entities.decisions.tana_node_ids` (create it empty if missing). A decision already listed is never pushed again; change its status instead (below).

**Push** (one call per decision; use the option that matches `status`):
```
import_tana_paste({
  parentNodeId: "[DECISIONS_CONTAINER_ID_RESOLVED]",
  content: "- [Decision] #[[^[DECISION_TAG_ID]]]\n  - [[^[DECISION_STATUS_FIELD_ID]]]:: [[^[DECISION_OPEN_OPTION_ID]]]\n  - [[^[CONTEXT_FIELD_ID]]]:: [Context]\n  - [[^[AREA_FIELD_ID]]]:: [[^[AREA_NODE_ID]]]\n  - [[^[CONFIDENCE_FIELD_ID]]]:: [1-10]\n  - [[^[REVIEW_DATE_FIELD_ID]]]:: [YYYY-MM-DD]"
})
```
Leave out each of the last four lines when its field ID (or, for Area, `areas.<slug>`) is empty or the decision has no value for it.

**Record:** add `entities.decisions.tana_node_ids.<decision_id>: <returned node ID>`; set `entities.decisions.last_push`. Set `entities.decisions.last_pushed_decision_id` only if this ID sorts later than the current value.

**Status change** (a decision already in the map moves to decided or set aside):
```
set_field_option({
  nodeId: "[TANA_DECISION_NODE_ID]",
  attributeId: "[DECISION_STATUS_FIELD_ID]",
  optionId: "[DECISION_DECIDED_OPTION_ID | DECISION_SET_ASIDE_OPTION_ID]"
})
```
`[TANA_DECISION_NODE_ID]` is the decision's entry in `entities.decisions.tana_node_ids`. If it has no entry, it never reached Tana: push it once (above) with its current status. Never create a second node for a decision that has one.

**Never:** a calendar node as the target; a decision pushed without its map entry recorded.
