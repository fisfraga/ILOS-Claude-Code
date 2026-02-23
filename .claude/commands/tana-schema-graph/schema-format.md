# Schema Format

The schema object defines all tags, fields, and relationships to visualize.

## Structure

```javascript
const schema = {
    tags: [...],      // Supertag definitions
    fields: [...],    // Field definitions
    extends: [...],   // Tag inheritance relationships
    hasField: [...],  // Which tags have which fields
    instanceOf: [...] // Instance field → target tag relationships
};
```

## Tags Array

Each tag is a supertag to display as a node.

```javascript
{
    id: 'local-id',        // Unique ID for internal references (kebab-case)
    name: 'Display Name',  // Name shown in visualization
    tanaId: 'abc123XYZ'    // Actual Tana node ID
}
```

**Example:**
```javascript
tags: [
    { id: 'project', name: '▲ Project', tanaId: 'kNuIzgp3RBHW' },
    { id: 'task', name: 'task', tanaId: '2HkQ6ZQCQoCD' },
    { id: 'milestone', name: 'milestone', tanaId: 'K3cWEW-n6LHA' }
]
```

## Fields Array

Each field is displayed as a square node with a type icon.

```javascript
{
    id: 'f-fieldname',     // Unique ID, prefix with 'f-' by convention
    name: 'Field Name',    // Name shown in visualization
    type: 'content',       // One of: content, date, url, options, instance
    tanaId: 'def456ABC'    // Actual Tana field ID
}
```

**Field Types:**

| Type | Icon | Description |
|------|------|-------------|
| `content` | Text lines | Plain text or rich content |
| `date` | Calendar | Date picker field |
| `url` | Link | URL field |
| `options` | List dots | Static options dropdown |
| `instance` | # symbol | References instances of another supertag |

**Example:**
```javascript
fields: [
    { id: 'f-due-date', name: 'Due date', type: 'date', tanaId: 'pK8OxjGRWIxL' },
    { id: 'f-assignee', name: 'Assignee', type: 'instance', tanaId: '2OU7JzO9xsls' },
    { id: 'f-status', name: 'Status', type: 'options', tanaId: 'gv0nFmMF6H6v' }
]
```

## Extends Array

Defines tag inheritance (child → parent).

```javascript
{
    from: 'child-tag-id',   // Local ID of child tag
    to: 'parent-tag-id'     // Local ID of parent tag
}
```

**Example:**
```javascript
extends: [
    { from: 'task', to: 'project' },      // task extends project
    { from: 'milestone', to: 'project' }  // milestone extends project
]
```

Tags with no parent become "root" tags and get assigned branch colors.

## HasField Array

Defines which tags have which fields.

```javascript
{
    tag: 'tag-id',     // Local ID of tag
    field: 'field-id'  // Local ID of field
}
```

**Example:**
```javascript
hasField: [
    { tag: 'project', field: 'f-due-date' },
    { tag: 'task', field: 'f-due-date' },      // Shared field
    { tag: 'task', field: 'f-assignee' },
    { tag: 'task', field: 'f-status' }
]
```

Shared fields (used by multiple tags) will have multiple `hasField` entries and appear connected to all their owning tags.

## InstanceOf Array (Optional)

For `instance` type fields, defines which supertag they reference.

```javascript
{
    field: 'field-id',     // Local ID of instance field
    tag: 'target-tag-id'   // Local ID of target supertag
}
```

**Example:**
```javascript
instanceOf: [
    { field: 'f-assignee', tag: 'person' }  // Assignee references #person instances
]
```

This creates a dashed line from the field to the target tag, showing cross-branch relationships.

## Complete Example

```javascript
const schema = {
    tags: [
        { id: 'person', name: '▲ Person', tanaId: 'abc123' },
        { id: 'project', name: '▲ Project', tanaId: 'def456' },
        { id: 'task', name: 'task', tanaId: 'ghi789' }
    ],

    fields: [
        { id: 'f-email', name: 'Email', type: 'url', tanaId: 'jkl012' },
        { id: 'f-assignee', name: 'Assignee', type: 'instance', tanaId: 'mno345' },
        { id: 'f-due', name: 'Due date', type: 'date', tanaId: 'pqr678' },
        { id: 'f-status', name: 'Status', type: 'options', tanaId: 'stu901' }
    ],

    extends: [
        { from: 'task', to: 'project' }
    ],

    hasField: [
        { tag: 'person', field: 'f-email' },
        { tag: 'project', field: 'f-due' },
        { tag: 'task', field: 'f-assignee' },
        { tag: 'task', field: 'f-due' },
        { tag: 'task', field: 'f-status' }
    ],

    instanceOf: [
        { field: 'f-assignee', tag: 'person' }
    ]
};
```

## Discovering Schema from Tana

Use MCP tools to build the schema:

1. **`get_tag_schema(tagId)`** returns:
   - `extends` array with parent tag IDs
   - `ownFields` array with field definitions

2. **For each field**, check:
   - `datatype` → maps to field type
   - `sourceSupertag` → if present, field is `instance` type

3. **To find child tags**:
   ```javascript
   search_nodes({ "and": [{"hasType": "<tag-id>"}, {"is": "template"}] })
   ```

## Visual Behavior

- **Root tags** (no parent): Largest size, assigned unique branch colors
- **Child tags**: Progressively smaller based on depth
- **Fields**: Gray squares, positioned near their first owning tag
- **Shared fields**: Connected to multiple tags, reveal cross-cutting concerns
- **Instance fields**: Dashed line to target tag, colored by target's branch
