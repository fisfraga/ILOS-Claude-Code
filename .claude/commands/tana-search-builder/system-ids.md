# Tana System IDs

Search operators organized by UI category. **Plain text** operators work as-is. **Needs ID** operators require `[[^ID]]::` syntax.

---

## Search Logic (Needs ID)

| Operator | ID |
|----------|-----|
| AND | `SYS_A41` |
| OR | `SYS_A42` |
| NOT | `SYS_A43` |

---

## Checkbox (Plain text)

| Operator | Example |
|----------|---------|
| TODO | `TODO` |
| DONE | `DONE` |
| NOT DONE | `NOT DONE` |
| DONE LAST (NUMBER) DAYS | `DONE LAST 7 DAYS` |

---

## Created/Edited (Plain text)

| Operator | Example |
|----------|---------|
| CREATED LAST (NUMBER) DAYS | `CREATED LAST 7 DAYS` |
| EDITED LAST (NUMBER) DAYS | `EDITED LAST 7 DAYS` |
| EDITED BY (USER EMAIL) LAST (NUMBER) DAYS | `EDITED BY user@email.com LAST 7 DAYS` |
| EDITED BY (USER EMAIL) ANYTIME | `EDITED BY user@email.com ANYTIME` |
| FROM CALENDAR | `FROM CALENDAR` |
| FROM MOBILE | `FROM MOBILE` |

---

## Node Type (Plain text)

| Operator | Description |
|----------|-------------|
| IS TAG | Node is a tag/supertag definition |
| IS FIELD | Node is a field definition |
| IS CALENDAR NODE | Node is a calendar node (year, month, week, day) |
| IS SEARCH NODE | Node is a live search |
| IS COMMAND | Node is a command definition |
| IS PUBLISHED | Node has been published |
| IS CHAT | Node is an AI chat |
| IS ENTITY | Node has a tag applied (is an instance of a supertag) |

---

## Node Contents (Plain text)

| Operator | Description |
|----------|-------------|
| HAS FIELD | Nodes that have one or more fields as children |
| HAS TAG | Nodes that have one or more tags applied |
| HAS MEDIA | Nodes containing any media (audio, video, or image) |
| HAS AUDIO | Nodes containing audio files |
| HAS VIDEO | Nodes containing video files |
| HAS IMAGE | Nodes containing images |
| FOR DATE YYYY-MM-DD | Nodes for a specific date (literal, e.g., `FOR DATE 2026-01-15`) |

---

## Scope (Plain text)

| Operator | Description |
|----------|-------------|
| PARENTS DESCENDANTS | Search within all descendants of parent nodes |
| GRANDPARENTS DESCENDANTS | Search within all descendants of grandparent nodes |
| PARENTS DESCENDANTS WITH REFS | Include referenced nodes in parent descendants search |
| GRANDPARENTS DESCENDANTS WITH REFS | Include referenced nodes in grandparent descendants search |
| IN LIBRARY | Nodes stored in the library/stash |
| ON DAY NODE | Nodes that are on a calendar day |
| SIBLING NAMED "NAME" | Match siblings with exact name in quotes |

---

## Field Operators (Needs ID)

| Operator | ID | Description |
|----------|-----|-------------|
| LINKS TO | `SYS_V49` | Matches nodes that are incoming links to a specific node |
| CHILD OF | `SYS_V53` | Matches nodes that are children of any of the given nodes |
| OWNED BY | `SYS_V55` | Matches nodes that are owned by any of the given nodes |
| COMPONENTS REC | `SYS_V64` | Matches on node, and all components (recursive) of the node |
| LT | `SYS_A49` | True for values less than the provided field value |
| GT | `SYS_A48` | True for values greater than the provided field value |
| DATE OVERLAPS | `SYS_203` | Match any date range that overlaps with the date provided |

---

## Field Values (Needs ID)

| Name | ID | Description |
|------|-----|-------------|
| Set | `SYS_V60` | Field has any value |
| Not set | `SYS_V59` | Field is empty/has no value |
| Defined | `SYS_V30` | Field is defined on the tag schema |
| Undefined | `SYS_V31` | Field is not defined on the tag schema |
| Yes | `SYS_V03` | Checkbox/boolean true value |
| No | `SYS_V04` | Checkbox/boolean false value |

---

## System Fields (Needs ID)

| Field | ID | Description |
|-------|-----|-------------|
| Node description | `SYS_T63` | The description of a node |
| Created time | `SYS_A63` | The time the node was created |
| Last edited time | `SYS_T65` | The time of the last edit |
| Last edited by | `SYS_T66` | Who the node has been last edited by |
| Edited by | `SYS_T67` | All users who have edited the node (most frequent editor at top) |
| Owner node | `SYS_T68` | The node that this node belongs to |
| Tags | `SYS_T71` | Supertags applied to the node |
| Workspace | `SYS_A74` | Workspace this node belongs to |
| Number of references | `SYS_T74` | Number of times the node is referenced across all available workspaces |
| Date from calendar node | `SYS_T77` | Date based on ancestor calendar node (if any) |
| Done time | `SYS_T78` | What time a checkbox was checked by a user |
| Number of nodes with this tag | `SYS_T109` | Only applicable for tag definitions |

---

## Base Types (Needs ID)

Base types are system supertags that users cannot directly apply to nodes. They can only be used to extend user-created supertags. **Note:** Most users don't consistently set base types on their custom tags, so a user's `#todo` tag may not extend `#task (base type)` at all. Always prefer using the user's custom tag IDs.

| Base Type | ID |
|-----------|-----|
| meeting | `SYS_T98` |
| person | `SYS_T99` |
| task | `SYS_T100` |
| organization | `SYS_T101` |
| location | `SYS_T102` |
| event | `SYS_T103` |
| project | `SYS_T104` |
| topic | `SYS_T105` |
| article | `SYS_T117` |
| memo | `SYS_T118` |
| reflection | `SYS_T119` |
| day | `SYS_T124` |
| week | `SYS_T125` |
