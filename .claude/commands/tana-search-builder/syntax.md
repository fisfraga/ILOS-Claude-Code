# Search Node Syntax

Tana Paste syntax for creating search nodes. For general Tana Paste, see `tana/tana-paste.md`.

---

## Structure

```
- %%search%% Title
  - [conditions...]
```

- Search starts with `%%search%%` followed by title
- Conditions are indented children
- Sibling conditions are implicitly AND'd

---

## Tag Filter

```
[[#^tagId]]
```

Filter by supertag. Get IDs via `list_tags` or `get_tag_schema`.

**Inheritance works.** Searching a parent tag matches instances of child tags. Field conditions work across the hierarchy — searching parent with a field only on child still matches.

---

## Checkbox State

Plain text operators for **native todo checkbox**:

| Operator | Meaning |
|----------|---------|
| `DONE` | Checked checkbox |
| `NOT DONE` | Unchecked or no checkbox |
| `TODO` | Has checkbox (checked or not) |
| `DONE LAST N DAYS` | Checked within N days |

For **checkbox fields** (boolean fields on tags), use field syntax:

```
[[^checkboxFieldId]]:: [[^SYS_V03]]    // Yes (checked)
[[^checkboxFieldId]]:: [[^SYS_V04]]    // No (unchecked)
```

---

## Time Filters

Plain text operators:

| Operator | Format |
|----------|--------|
| `CREATED LAST N DAYS` | `CREATED LAST 7 DAYS` |
| `EDITED LAST N DAYS` | `EDITED LAST 7 DAYS` |
| `EDITED BY email LAST N DAYS` | `EDITED BY user@example.com LAST 7 DAYS` |
| `EDITED BY email ANYTIME` | `EDITED BY user@example.com ANYTIME` |

---

## Field Conditions

### Set / Not set

```
[[^fieldId]]:: [[^SYS_V60]]    // Set
[[^fieldId]]:: [[^SYS_V59]]    // Not set
```

### Equals value

```
[[^fieldId]]:: [[^optionId]]   // Option value
[[^fieldId]]:: [[^nodeId]]     // Node reference
[[^fieldId]]:: value           // Plain text
```

### Multi-value fields

Nested values under field = ANY matches (OR):
```
[[^assigneeFieldId]]::
  - [[^aliceId]]
  - [[^bobId]]
```

Separate field conditions = ALL must match (AND):
```
[[^assigneeFieldId]]:: [[^aliceId]]
[[^assigneeFieldId]]:: [[^bobId]]
```

---

## Date Comparisons

Wrap field condition inside comparison operator:

```
[[^SYS_A49]]::                  // LT (before)
  - [[^fieldId]]:: [date]

[[^SYS_A48]]::                  // GT (after)
  - [[^fieldId]]:: [date]

[[^SYS_203]]::                  // DATE OVERLAPS
  - [[^fieldId]]:: [date]
```

| Operator | ID | Use |
|----------|-----|-----|
| LT | `SYS_A49` | Before date |
| GT | `SYS_A48` | After date |
| DATE OVERLAPS | `SYS_203` | Matches date ranges |

A date is either a day/week/month/year or a range with start AND end. Use DATE OVERLAPS when items may have date ranges.

---

## Date Values

### Static date

```
[[date:2026-01-29]]            // Specific day
[[date:2026-W05]]              // Week
[[date:2026-01]]               // Month
```

### Dynamic date

```
FOR RELATIVE DATE today
FOR RELATIVE DATE yesterday
FOR RELATIVE DATE tomorrow
FOR RELATIVE DATE this week
FOR RELATIVE DATE last week
FOR RELATIVE DATE next week
FOR RELATIVE DATE this month
FOR RELATIVE DATE this year
```

### Context-relative

```
PARENT                          // Reference parent node
GRANDPARENT                     // Reference grandparent node
PARENT.fieldName                // Reference parent's field value
```

Use when search is child/grandchild of daily note or supertag instance.

**DEPTH MATTERS:** View wrappers (tabs, sidemenu) count as hierarchy levels. A search inside a sidemenu under a daily note is a *grandchild* — use `GRANDPARENT`, not `PARENT`. Always trace the actual nesting depth.

**PARENT references the instance itself:**
```
[[^SYS_V49]]:: PARENT           // Notes linking to this topic
[[^SYS_V53]]:: PARENT           // Items under this project
[[^assigneeFieldId]]:: PARENT   // Tasks assigned to this person
```

**PARENT.field references a field value** (plain text, spaces ok):
```
[[^SYS_V49]]:: PARENT.Domain           // Notes linking to this topic's domain
[[^SYS_203]]::
  - [[^dateFieldId]]:: PARENT.Start date   // Within project's date range
```

**View wrappers count as depth.** A search inside a sidemenu under a daily note is a grandchild (needs `GRANDPARENT`). Plan structure carefully.

---

## Logic Operators

### AND

Implicit at root level — siblings are AND'd automatically.

Inside OR/NOT blocks, use explicit:
```
[[^SYS_A41]]::
  - [condition A]
  - [condition B]
```

### OR

```
[[^SYS_A42]]::
  - [condition A]
  - [condition B]
```

Any child matches.

### NOT

```
[[^SYS_A43]]::
  - [condition to exclude]
```

Excludes matches.

| Operator | ID |
|----------|-----|
| AND | `SYS_A41` |
| OR | `SYS_A42` |
| NOT | `SYS_A43` |

---

## Relationships

### Links to

```
[[^SYS_V49]]:: [[^nodeId]]
```

Nodes that reference the target.

### Child of

```
[[^SYS_V53]]:: [[^nodeId]]
```

Direct children of target.

### Descendant (simpler)

```
[[^nodeId]]
```

Node ID alone finds all descendants.

### Owned by

```
[[^SYS_V55]]:: [[^nodeId]]
```

Nodes owned by target.

| Operator | ID |
|----------|-----|
| LINKS TO | `SYS_V49` |
| CHILD OF | `SYS_V53` |
| OWNED BY | `SYS_V55` |

---

## System Fields as Conditions

When plain text operators (`CREATED LAST N DAYS`) aren't enough, use system field IDs:

```
[[^SYS_A63]]:: [[date:2026-01-15]]              // Created on date
[[^SYS_A63]]:: FOR RELATIVE DATE this month     // Created this month (dynamic)
```

With comparison:
```
[[^SYS_A49]]::                                   // Created before
  - [[^SYS_A63]]:: [[date:2026-01-01]]
```

| System Field | ID |
|--------------|-----|
| Created time | `SYS_A63` |
| Last edited time | `SYS_T65` |
| Owner node | `SYS_T68` |

Use `FOR RELATIVE DATE` or `PARENT/GRANDPARENT` for dynamic searches.

---

## Node Type Filters

Plain text operators:

| Operator | Finds |
|----------|-------|
| `IS TAG` | Tag definitions |
| `IS FIELD` | Field definitions |
| `IS CALENDAR NODE` | Calendar nodes |
| `IS SEARCH NODE` | Search nodes |
| `IN LIBRARY` | Library items |
| `HAS TAG` | Nodes with any tag |
| `HAS FIELD` | Nodes with any field |
| `HAS MEDIA` | Nodes with media |

---

## Views

Add after search title:

```
%%search%% Title %%view:TYPE%%
```

| View | Syntax |
|------|--------|
| Table | `%%view:table%%` |
| Cards | `%%view:cards%%` |
| Calendar | `%%view:calendar%%` |
| Tabs | `%%view:tabs%%` |
| Side menu | `%%view:sidemenu%%` |

Default is list view (no syntax needed).

---

## Nesting Views

Wrap multiple searches in tabs or sidemenu:

```
- Container %%view:tabs%%
  - %%search%% First
    - [conditions]
  - %%search%% Second %%view:table%%
    - [conditions]
```

Tabs and sidemenu are interchangeable as outer container.
