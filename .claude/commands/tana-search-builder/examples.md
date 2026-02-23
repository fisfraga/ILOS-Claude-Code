# Search Node Examples

**These show how operators compose.** Every Tana system uses different tags and fields. Use these to understand patterns, then build searches based on exploring the actual system.

Basic patterns (single tag, tag + checkbox, tag + time filter) are straightforward from syntax.md — not repeated here.

---

## Contextual/Template Searches

Place inside supertag instances or templates. PARENT references the instance.

**DEPTH:** View wrappers count as levels. Search inside sidemenu under daily note = grandchild → use `GRANDPARENT`.

### Notes linking to this topic

```
- %%search%% Related notes
  - [[#^noteTagId]]
  - [[^SYS_V49]]:: PARENT
```

### Tasks under this project

```
- %%search%% Project tasks
  - [[#^taskTagId]]
  - [[^SYS_V53]]:: PARENT
  - NOT DONE
```

### Tasks assigned to this person

```
- %%search%% Assigned tasks
  - [[#^taskTagId]]
  - [[^assigneeFieldId]]:: PARENT
  - NOT DONE
```

### Tasks within project date range (PARENT.field)

```
- %%search%% In project timeframe
  - [[#^taskTagId]]
  - [[^SYS_V53]]:: PARENT
  - [[^SYS_203]]::
    - [[^dateFieldId]]:: PARENT.Start date
```

### Notes related to topic's domain

```
- %%search%% Domain notes
  - [[#^noteTagId]]
  - [[^SYS_V49]]:: PARENT.Domain
```

### GRANDPARENT (search inside view wrapper)

When search is inside a sidemenu/tabs under the instance:

```
- Project #project
  - Dashboard %%view:sidemenu%%
    - %%search%% Project tasks
      - [[#^taskTagId]]
      - GRANDPARENTS DESCENDANTS
      - NOT DONE
```

The search is grandchild of Project (sidemenu is the parent). Use `GRANDPARENTS DESCENDANTS` for all nested tasks, or `[[^SYS_V53]]:: GRANDPARENT` for direct children only.

---

## Date Comparisons

### Before a date (overdue pattern)

```
- %%search%% Overdue
  - [[#^tagId]]
  - [[^SYS_A49]]::
    - [[^dateFieldId]]:: FOR RELATIVE DATE today
  - NOT DONE
```

### After a date (future items)

```
- %%search%% Upcoming
  - [[#^tagId]]
  - [[^SYS_A48]]::
    - [[^dateFieldId]]:: FOR RELATIVE DATE today
```

### Date overlaps (for date ranges)

```
- %%search%% This week
  - [[#^tagId]]
  - [[^SYS_203]]::
    - [[^dateFieldId]]:: FOR RELATIVE DATE this week
```

### Context-relative date (in daily notes)

```
- %%search%% Today's items
  - [[#^tagId]]
  - [[^SYS_203]]::
    - [[^dateFieldId]]:: PARENT
```

### System field: created time with comparison

When `CREATED LAST N DAYS` isn't flexible enough, use SYS_A63 directly:

```
- %%search%% Created this month
  - [[#^tagId]]
  - [[^SYS_A63]]:: FOR RELATIVE DATE this month
```

With comparison (created before a date):

```
- %%search%% Created before 2025
  - [[#^tagId]]
  - [[^SYS_A49]]::
    - [[^SYS_A63]]:: [[date:2025-01-01]]
```

---

## Logic Combinations

### Multiple conditions (implicit AND)

```
- %%search%% Open tasks with date
  - [[#^tagId]]
  - [[^dateFieldId]]:: [[^SYS_V60]]
  - NOT DONE
```

### Either tag matches (OR)

```
- %%search%% Notes or concepts
  - [[^SYS_A42]]::
    - [[#^tagA]]
    - [[#^tagB]]
```

### Exclude matches (NOT)

```
- %%search%% Tasks not in projects
  - [[#^taskTagId]]
  - [[^SYS_A43]]::
    - [[^SYS_V53]]:: [[^projectNodeId]]
```

### Complex: (A AND condition) OR (B AND condition)

When different tags have different fields for the same concept:

```
- %%search%% All overdue
  - [[^SYS_A42]]::
    - [[^SYS_A41]]::
      - [[#^tagA]]
      - [[^SYS_A49]]::
        - [[^tagADateField]]:: FOR RELATIVE DATE today
    - [[^SYS_A41]]::
      - [[#^tagB]]
      - [[^SYS_A49]]::
        - [[^tagBDateField]]:: FOR RELATIVE DATE today
  - NOT DONE
```

---

## Relationships

### Links to a node

```
- %%search%% References project
  - [[^SYS_V49]]:: [[^nodeId]]
```

### Children of a node

```
- %%search%% Inside project
  - [[^SYS_V53]]:: [[^nodeId]]
```

### All descendants (simpler)

```
- %%search%% Project contents
  - [[^nodeId]]
```

### Owned by

```
- %%search%% Alice's items
  - [[^SYS_V55]]:: [[^personNodeId]]
```

---

## Field Matching

### Field equals specific value

```
- %%search%% High priority
  - [[#^tagId]]
  - [[^priorityFieldId]]:: [[^highOptionId]]
```

### Field references a node

```
- %%search%% Assigned to Alice
  - [[#^tagId]]
  - [[^assigneeFieldId]]:: [[^aliceNodeId]]
```

### Field is empty

```
- %%search%% Missing assignee
  - [[#^tagId]]
  - [[^assigneeFieldId]]:: [[^SYS_V59]]
```

### Multi-value: ANY match (OR)

Nested values under field = matches if ANY value matches:

```
- %%search%% Assigned to Alice OR Bob
  - [[#^taskTagId]]
  - [[^assigneeFieldId]]::
    - [[^aliceId]]
    - [[^bobId]]
```

### Multi-value: ALL match (AND)

Separate field conditions = matches only if ALL values present:

```
- %%search%% Assigned to both Alice AND Bob
  - [[#^taskTagId]]
  - [[^assigneeFieldId]]:: [[^aliceId]]
  - [[^assigneeFieldId]]:: [[^bobId]]
```

### Checkbox field (not native checkbox)

For boolean fields on tags, use field syntax with SYS_V03/SYS_V04:

```
- %%search%% Reviewed items
  - [[#^tagId]]
  - [[^reviewedFieldId]]:: [[^SYS_V03]]
```

`SYS_V03` = Yes (checked), `SYS_V04` = No (unchecked). Different from `DONE`/`NOT DONE` which is for native todo checkbox.

---

## Views

### Table view

```
- %%search%% Tasks %%view:table%%
  - [[#^tagId]]
```

### Calendar view

```
- %%search%% Schedule %%view:calendar%%
  - [[#^tagId]]
  - [[^dateFieldId]]:: [[^SYS_V60]]
```

### Dashboard with tabs

```
- Dashboard %%view:tabs%%
  - %%search%% Overdue
    - [[#^tagId]]
    - [[^SYS_A49]]::
      - [[^dateFieldId]]:: FOR RELATIVE DATE today
    - NOT DONE
  - %%search%% Today
    - [[#^tagId]]
    - [[^SYS_203]]::
      - [[^dateFieldId]]:: FOR RELATIVE DATE today
```

### Dashboard with sidemenu

```
- Review %%view:sidemenu%%
  - %%search%% Completed %%view:table%%
    - [[#^tagId]]
    - DONE LAST 7 DAYS
  - %%search%% Created
    - CREATED LAST 7 DAYS
```
