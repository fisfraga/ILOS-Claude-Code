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

**Capabilities:** `capabilities.decision_supertag` must be `true`. When it is `false` (the workspace has no `#decision` tag) or still `unknown` with `DECISION_TAG_ID` blank, decisions stay in `MEMORY/decisions.jsonl`: say so once ("your workspace has no #decision tag, so decisions stay local") and continue. Still `unknown` with `DECISION_TAG_ID` filled (IDs copied from an older setup, before `/tana-setup` ran): push, and suggest `/tana-setup` once so it records the capability.

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

## Recipe: `goal`
**Writers:** `.claude/commands/sync/SKILL.md`, `.claude/agents/tana.md`, `.claude/commands/morning/SKILL.md`, `.claude/commands/weekly-review/SKILL.md`, `.claude/commands/monthly-review/SKILL.md`, `.claude/commands/quarterly-review/SKILL.md`, `.claude/commands/annual-review/SKILL.md`

**Local record:** the goal in `TIME/active-goals.yaml` under its level (`annual`, `quarterly`, `monthly`, `weekly`), with its `id` (for example `w08_1`). Daily goals from `/morning` are conversational and have no local record.

**Placement** — the calling skill says which:
- **Period node** (the review skills and `/morning`): `[PERIOD_NODE_ID]` is the calendar node the skill already resolved for that period — `TODAY_NODE_ID` (daily), `NEXT_WEEK_NODE_ID` (weekly), `NEXT_MONTH_NODE_ID` (monthly), `QUARTER_NODE_ID` (quarterly), `YEAR_NODE_ID` (annual). Goals are the one entity that belongs on calendar nodes.
- **Goals container** (`/sync`, the agent): `[GOALS_CONTAINER_ID_RESOLVED]` — `tana_node_overrides.goals_container_id` if non-empty, else `GOALS_CONTAINER_ID`.

**Tag per level:** `DAILY_GOAL_TAG_ID`, `WEEKLY_GOAL_TAG_ID`, `MONTHLY_GOAL_TAG_ID`, `QUARTERLY_GOAL_TAG_ID`, `ANNUAL_GOAL_TAG_ID`.

**Needs:** the target (the period node, or the resolved goals container) and the level's tag ID. If either is empty, the empty-ID guard applies: skip the push and leave the goal unrecorded.

**Optional lines** — add each only when its IDs are filled: Status (`GOAL_STATUS_FIELD_ID` + the option for the goal's status — `GOAL_ACTIVE_OPTION_ID` for a new goal; not on daily goals); Periodicity Year on annual goals (`PERIODICITY_FIELD_ID` + `PERIODICITY_YEAR_OPTION_ID`); Area (`AREA_FIELD_ID` + `areas.<slug>`).

**Map key:** goal IDs repeat every period (`w04_1` exists every year), so the goals map is keyed by `<period>/<goal_id>`, where `<period>` is the `period` value of the goal's level in `TIME/active-goals.yaml` (for example `2026-W04/w04_1`, `2026-Q1/q1_1`, `2026/annual_1`).

**Dedup:** `entities.goals.tana_node_ids` (create it empty if missing). Before pushing a goal:
1. Its `<period>/<goal_id>` key is listed → never push it again; change its status instead (below).
2. Not listed, but Tana already has it: a goal node with the level's tag and the goal's `description` as its name (ignore case and surrounding spaces). Where to look: `/sync` and the agent use the goals their pull just returned; the review skills and `/morning` use the children of the period node (one `get_children` call before the first push). Found → record that node under the key (see **Record**) instead of pushing. This is how goals created in Tana, and goals pushed by ILOS 1.0 (which kept no map), get their entry.
3. Otherwise push it once (below).

**Push** (one call per goal, so each returned node ID can be recorded):
```
import_tana_paste({
  parentNodeId: "[PERIOD_NODE_ID]",
  content: "- [ ] [Goal description] #[[^[WEEKLY_GOAL_TAG_ID]]]\n  - [[^[GOAL_STATUS_FIELD_ID]]]:: [[^[GOAL_ACTIVE_OPTION_ID]]]\n  - [[^[AREA_FIELD_ID]]]:: [[^[AREA_NODE_ID]]]"
})
```
Use the level's tag; for an annual goal add `\n  - [[^[PERIODICITY_FIELD_ID]]]:: [[^[PERIODICITY_YEAR_OPTION_ID]]]`. In the goals-container placement, `parentNodeId` is `[GOALS_CONTAINER_ID_RESOLVED]`.

**Record:** add `entities.goals.tana_node_ids.<period>/<goal_id>: <node ID>` (quote the key in YAML: `"2026-W04/w04_1": "..."`) and set `entities.goals.last_push`. Daily goals have no local record: nothing to record.

**Status change** (a goal's local status differs from Tana's): `[TANA_GOAL_NODE_ID]` is the goal's `<period>/<goal_id>` entry in the map. No entry → find it as in **Dedup** step 2 and record it; still not found → push it once (above) with its current status. Never create a second node for a goal that has one. Local `abandoned` uses `GOAL_ABANDONED_OPTION_ID`; if that is empty, the empty-ID guard applies: leave the Tana status as it is and say so once.
```
set_field_option({
  nodeId: "[TANA_GOAL_NODE_ID]",
  attributeId: "[GOAL_STATUS_FIELD_ID]",
  optionId: "[GOAL_COMPLETED_OPTION_ID | GOAL_BACKLOG_OPTION_ID | GOAL_ACTIVE_OPTION_ID]"
})
```

## Recipe: `project`
**Writers:** `.claude/commands/sync/SKILL.md`, `.claude/agents/tana.md`

**Local record:** the project's folder or file in `SPACE/projects/` (its slug is the local ID).

**Target:** `[PROJECTS_CONTAINER_ID_RESOLVED]` — `tana_node_overrides.projects_container_id` if non-empty, else `PROJECTS_CONTAINER_ID`.

**Needs:** the resolved projects container and `PROJECT_TAG_ID`. If either is empty, the empty-ID guard applies: skip the push and leave the project unrecorded.

**Optional lines** — only when their IDs are filled: Status (`PROJECT_STATUS_FIELD_ID` + the option matching the local status), Desired outcome (`DESIRED_OUTCOME_FIELD_ID`).

**Dedup:** `entities.projects.tana_node_ids`, keyed by slug (create it empty if missing).

**Push** (one call per project):
```
import_tana_paste({
  parentNodeId: "[PROJECTS_CONTAINER_ID_RESOLVED]",
  content: "- [Project name] #[[^[PROJECT_TAG_ID]]]\n  - [[^[PROJECT_STATUS_FIELD_ID]]]:: [[^[PROJECT_ACTIVE_OPTION_ID]]]\n  - [[^[DESIRED_OUTCOME_FIELD_ID]]]:: [outcome]"
})
```

**Record:** add `entities.projects.tana_node_ids.<slug>: <returned node ID>`; set `entities.projects.last_push`.

## Recipe: `topic`
**Writers:** `.claude/commands/sync/SKILL.md`, `.claude/agents/tana.md`

**Local record:** the topic's file in `SPACE/topics/` (its slug is the local ID).

**Target:** `[TOPICS_CONTAINER_ID_RESOLVED]` — `tana_node_overrides.topics_container_id` if non-empty, else `TOPICS_CONTAINER_ID`.

**Needs:** the resolved topics container and `TOPIC_TAG_ID`. If either is empty, the empty-ID guard applies: skip the push and leave the topic unrecorded.

**Dedup:** `entities.topics.tana_node_ids`, keyed by slug (create it empty if missing).

**Push** (one call per topic):
```
import_tana_paste({
  parentNodeId: "[TOPICS_CONTAINER_ID_RESOLVED]",
  content: "- [Topic name] #[[^[TOPIC_TAG_ID]]]"
})
```

**Record:** add `entities.topics.tana_node_ids.<slug>: <returned node ID>`; set `entities.topics.last_push`.
