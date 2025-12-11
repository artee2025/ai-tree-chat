# Database Schema Documentation

## Entity Relationship Diagram

```
┌─────────────────────┐
│   auth.users        │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │
           │ 1:1
           │
┌──────────▼──────────┐
│     profiles        │
│                     │
│ • username          │
│ • display_name      │
│ • avatar_url        │
│ • bio               │
│ • preferences       │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────┐
│  dialog_sessions    │
│                     │
│ • title             │
│ • description       │
│ • default_model     │
│ • is_pinned         │
│ • last_activity_at  │
└──────────┬──────────┘
           │
           │ 1:N
           │
┌──────────▼──────────────┐       ┌──────────────────┐
│  conversation_nodes     │◄──────┤   node_paths     │
│                         │  N:N  │                  │
│ • parent_id (self-ref)  │       │ • ancestor_id    │
│ • role                  │       │ • descendant_id  │
│ • content               │       │ • depth          │
│ • depth                 │       └──────────────────┘
│ • is_streaming          │
│ • model_name            │
│ • token counts          │
└────────┬────────────────┘
         │
         │ 1:N
         │
┌────────▼────────────┐
│  branch_options     │
│                     │
│ • parent_node_id    │
│ • child_node_id     │
│ • branch_name       │
│ • selection_count   │
└─────────────────────┘
```

## Table Descriptions

### profiles
**Purpose**: Store user profile information extending Supabase auth.users

**Key Fields**:
- `id`: UUID, Primary Key, Foreign Key to auth.users(id)
- `username`: Unique username for the user
- `preferences`: JSONB for user settings

**Relationships**:
- One-to-one with auth.users
- One-to-many with dialog_sessions

**Triggers**:
- `on_auth_user_created`: Automatically creates profile when user signs up

### dialog_sessions
**Purpose**: Store chat sessions with configuration and metadata

**Key Fields**:
- `id`: UUID, Primary Key
- `user_id`: Foreign Key to auth.users(id)
- `title`: Session title
- `default_model`: Default AI model for session
- `is_pinned`: Whether session is pinned to top
- `last_activity_at`: Auto-updated when nodes added

**Relationships**:
- Many-to-one with profiles/auth.users
- One-to-many with conversation_nodes
- One-to-many with branch_options

**Triggers**:
- `update_session_activity_on_node`: Updates last_activity_at when nodes added

### conversation_nodes
**Purpose**: Store individual messages in the conversation tree

**Key Fields**:
- `id`: UUID, Primary Key
- `session_id`: Foreign Key to dialog_sessions(id)
- `user_id`: Foreign Key to auth.users(id)
- `parent_id`: Foreign Key to conversation_nodes(id) - Self-referential
- `role`: Enum (system, user, assistant, function)
- `content`: Message content
- `depth`: Depth in tree (0 = root)
- `is_streaming`: Whether currently streaming
- `model_name`: AI model used
- `prompt_tokens`, `completion_tokens`, `total_tokens`: Token usage

**Relationships**:
- Many-to-one with dialog_sessions
- Many-to-one with auth.users
- Self-referential (parent_id)
- Many-to-many with itself via node_paths

**Triggers**:
- `maintain_node_paths`: Maintains closure table for tree traversal
- `update_session_activity`: Updates session's last_activity_at

### branch_options
**Purpose**: Track branching points and alternative conversation paths

**Key Fields**:
- `id`: UUID, Primary Key
- `session_id`: Foreign Key to dialog_sessions(id)
- `parent_node_id`: Foreign Key to conversation_nodes(id)
- `child_node_id`: Foreign Key to conversation_nodes(id)
- `branch_name`: Name for the branch
- `selection_count`: How many times branch was selected
- `is_active`: Whether branch is currently active

**Relationships**:
- Many-to-one with dialog_sessions
- Many-to-one with conversation_nodes (parent)
- Many-to-one with conversation_nodes (child)

**Constraints**:
- Unique constraint on (session_id, child_node_id)

### node_paths
**Purpose**: Materialized paths for efficient tree traversal (Closure Table pattern)

**Key Fields**:
- `ancestor_id`: Foreign Key to conversation_nodes(id)
- `descendant_id`: Foreign Key to conversation_nodes(id)
- `depth`: Distance between ancestor and descendant (0 = self)

**Relationships**:
- Many-to-one with conversation_nodes (ancestor)
- Many-to-one with conversation_nodes (child)

**Triggers**:
- Automatically populated by `update_node_paths` trigger

## Tree Structure Pattern

The conversation tree uses three mechanisms for efficiency:

### 1. Adjacency List (parent_id)
Simple parent-child relationships
```sql
SELECT * FROM conversation_nodes WHERE parent_id = 'node-id';
```

### 2. Depth Tracking
Explicit depth field for quick depth queries
```sql
SELECT * FROM conversation_nodes WHERE depth = 2;
```

### 3. Closure Table (node_paths)
Efficiently query all ancestors or descendants
```sql
-- Get all ancestors of a node
SELECT * FROM node_paths WHERE descendant_id = 'node-id';

-- Get all descendants of a node
SELECT * FROM node_paths WHERE ancestor_id = 'node-id';
```

## Common Query Patterns

### Get Full Conversation Path
```sql
SELECT cn.* 
FROM node_paths np
JOIN conversation_nodes cn ON np.ancestor_id = cn.id
WHERE np.descendant_id = 'target-node-id'
ORDER BY np.depth DESC;
```

### Get All Children of a Node
```sql
SELECT * FROM conversation_nodes
WHERE parent_id = 'parent-node-id'
ORDER BY sequence_order;
```

### Get Session with Node Count
```sql
SELECT 
  ds.*,
  COUNT(cn.id) as node_count
FROM dialog_sessions ds
LEFT JOIN conversation_nodes cn ON ds.id = cn.session_id AND cn.deleted_at IS NULL
WHERE ds.user_id = 'user-id' AND ds.deleted_at IS NULL
GROUP BY ds.id;
```

### Get Active Branches at a Node
```sql
SELECT 
  bo.*,
  cn.content as branch_content
FROM branch_options bo
JOIN conversation_nodes cn ON bo.child_node_id = cn.id
WHERE bo.parent_node_id = 'node-id' 
  AND bo.deleted_at IS NULL
  AND cn.deleted_at IS NULL
ORDER BY bo.is_active DESC, bo.selection_count DESC;
```

## Indexes

All tables have comprehensive indexes for performance:

### profiles
- `idx_profiles_username` - Username lookups
- `idx_profiles_deleted_at` - Soft delete queries

### dialog_sessions
- `idx_dialog_sessions_user_id` - User's sessions
- `idx_dialog_sessions_user_pinned` - User's pinned sessions
- `idx_dialog_sessions_last_activity` - Sorting by activity
- `idx_dialog_sessions_deleted_at` - Soft delete queries

### conversation_nodes
- `idx_conversation_nodes_session_id` - Session queries
- `idx_conversation_nodes_user_id` - User queries
- `idx_conversation_nodes_parent_id` - Tree traversal
- `idx_conversation_nodes_session_parent` - Composite for efficiency
- `idx_conversation_nodes_streaming` - Streaming queries
- `idx_conversation_nodes_depth` - Depth queries
- `idx_conversation_nodes_sequence` - Ordering siblings
- `idx_conversation_nodes_deleted_at` - Soft delete queries

### branch_options
- `idx_branch_options_parent_node` - Finding branches from parent
- `idx_branch_options_child_node` - Finding parent of child
- `idx_branch_options_session_id` - Session queries
- `idx_branch_options_active` - Active branch queries
- `idx_branch_options_deleted_at` - Soft delete queries

### node_paths
- `idx_node_paths_ancestor` - Descendant queries
- `idx_node_paths_descendant` - Ancestor queries

## Data Integrity

### Foreign Key Constraints
All foreign keys have ON DELETE CASCADE to maintain referential integrity:
- Deleting a user cascades to profiles, sessions, and nodes
- Deleting a session cascades to nodes and branches
- Deleting a parent node cascades to child nodes and paths

### Check Constraints
- `role` must be one of: 'system', 'user', 'assistant', 'function'
- `content_type` must be one of: 'text', 'json', 'markdown', 'code'

### Unique Constraints
- `profiles.username` - Ensures unique usernames
- `(branch_options.session_id, branch_options.child_node_id)` - One parent per child per session

## Soft Deletes

All tables support soft deletes via `deleted_at` timestamp:
- NULL = active record
- Timestamp = soft deleted

Indexes exclude soft-deleted records using `WHERE deleted_at IS NULL`

To restore a soft-deleted record:
```sql
UPDATE table_name SET deleted_at = NULL WHERE id = 'record-id';
```

## Performance Considerations

### Recommended Practices
1. Always include `deleted_at IS NULL` in queries
2. Use indexes - they're optimized for soft deletes
3. Use `node_paths` for ancestor/descendant queries instead of recursive CTEs
4. Batch insert operations when possible
5. Use `select('*')` sparingly - specify needed columns

### Monitoring
Monitor these metrics:
- Average depth of conversations
- Number of branches per session
- Token usage per session
- Query performance on large sessions

### Optimization Tips
- Consider archiving old sessions (hard delete after period)
- Partition large tables by created_at if dataset grows very large
- Use materialized views for complex analytics
